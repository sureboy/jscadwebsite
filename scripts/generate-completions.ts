import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置：输入目录和输出文件
const inputDir: string = process.argv[2] || './typings';
const outputFile: string = process.argv[3] || 'completions.json';

interface CompletionItem {
  label: string;
  type: string;
  detail: string;
  default?: boolean;
}

/**
 * 递归获取目录下所有 .d.ts 文件
 */
function getAllDTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllDTsFiles(fullPath, fileList);
    } else if (stat.isFile() && file.endsWith('.d.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

/**
 * 推断符号类型
 */
function inferSymbolType(symbol: ts.Symbol | undefined): string {
  if (!symbol) return 'variable';
  const flags = symbol.flags;
  if (flags & ts.SymbolFlags.Function) return 'function';
  if (flags & ts.SymbolFlags.Class) return 'class';
  if (flags & ts.SymbolFlags.Interface) return 'interface';
  if (flags & ts.SymbolFlags.TypeAlias) return 'type';
  if (flags & ts.SymbolFlags.Variable) return 'variable';
  return 'variable';
}

/**
 * 检查节点是否有 export 修饰符
 */
function hasExportModifier(node: ts.Node): boolean {
  if (typeof ts.canHaveModifiers === 'function' && ts.canHaveModifiers(node)) {
    const modifiers = ts.getModifiers(node);
    return modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword) ?? false;
  } else {
    const modifiers = (node as any).modifiers;
    return modifiers?.some((mod: ts.Modifier) => mod.kind === ts.SyntaxKind.ExportKeyword) ?? false;
  }
}

/**
 * 从单个 .d.ts 文件中提取导出符号
 */
function getExportedSymbolsFromFile(filePath: string): CompletionItem[] {
  const program = ts.createProgram([filePath], {});
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(filePath);
  const exports: CompletionItem[] = [];

  if (!sourceFile) return exports;

  function getTypeString(symbol: ts.Symbol): string {
    return checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, sourceFile!));
  }

  function visit(node: ts.Node) {
    // export { xxx } 或 export * as xxx
    if (ts.isExportDeclaration(node) && node.exportClause) {
      if (ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach(el => {
          const name = el.name.getText();
          const symbol = checker.getSymbolAtLocation(el.name);
          exports.push({
            label: name,
            type: inferSymbolType(symbol),
            detail: symbol ? getTypeString(symbol) : '',
          });
        });
      } else if (ts.isNamespaceExport(node.exportClause)) {
        const name = node.exportClause.name.getText();
        const symbol = checker.getSymbolAtLocation(node.exportClause.name);
        exports.push({
          label: name,
          type: 'namespace',
          detail: symbol ? getTypeString(symbol) : '',
        });
      }
    }
    // export default
    else if (ts.isExportAssignment(node)) {
      const defaultSymbol = checker.getSymbolAtLocation(node.expression);
      if (defaultSymbol) {
        const name = defaultSymbol.getName();
        exports.push({
          label: name || 'default',
          type: inferSymbolType(defaultSymbol),
          detail: getTypeString(defaultSymbol),
          default: true,
        });
      } else {
        exports.push({
          label: '__default',
          type: 'variable',
          detail: 'default export',
          default: true,
        });
      }
    }
    // export function
    else if (ts.isFunctionDeclaration(node) && node.name && hasExportModifier(node)) {
      const name = node.name.getText();
      const symbol = checker.getSymbolAtLocation(node.name);
      exports.push({
        label: name,
        type: 'function',
        detail: symbol ? getTypeString(symbol) : '',
      });
    }
    // export class
    else if (ts.isClassDeclaration(node) && node.name && hasExportModifier(node)) {
      const name = node.name.getText();
      const symbol = checker.getSymbolAtLocation(node.name);
      exports.push({
        label: name,
        type: 'class',
        detail: symbol ? getTypeString(symbol) : '',
      });
    }
    // export variable / interface / type
    else if (
      (ts.isVariableStatement(node) ||
       ts.isInterfaceDeclaration(node) ||
       ts.isTypeAliasDeclaration(node)) &&
      hasExportModifier(node)
    ) {
      node.forEachChild(child => {
        if (ts.isVariableDeclarationList(child)) {
          child.forEachChild(decl => {
            if (ts.isVariableDeclaration(decl) && decl.name) {
              const name = decl.name.getText();
              const symbol = checker.getSymbolAtLocation(decl.name);
              exports.push({
                label: name,
                type: 'variable',
                detail: symbol ? getTypeString(symbol) : '',
              });
            }
          });
        } else if (ts.isIdentifier(child)) {
          // 直接导出的标识符，如 export interface Foo
          const name = child.text;
          exports.push({
            label: name,
            type: 'type',
            detail: '',
          });
        } else if (ts.isPropertySignature(child) || ts.isMethodSignature(child)) {
          // 接口或类型的成员
          const name = child.name.getText();
          exports.push({
            label: name,
            type: 'type',
            detail: '',
          });
        }
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return exports;
}

// 主流程
try {
  if (!fs.existsSync(inputDir)) {
    console.error(`目录不存在: ${inputDir}`);
    process.exit(1);
  }

  const dtsFiles = getAllDTsFiles(inputDir);
  if (dtsFiles.length === 0) {
    console.warn('未找到任何 .d.ts 文件');
    process.exit(0);
  }

  const allExports: CompletionItem[] = [];
  const seen = new Set<string>();

  for (const file of dtsFiles) {
    console.log(`处理文件: ${file}`);
    const exports = getExportedSymbolsFromFile(file);
    for (const item of exports) {
      if (!seen.has(item.label)) {
        seen.add(item.label);
        allExports.push(item);
      }
    }
  }

  const outputPath = path.resolve(outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(allExports, null, 2));
  console.log(`补全数据已生成: ${outputPath} (共 ${allExports.length} 个条目)`);
} catch (err) {
  console.error('生成失败:', err);
  process.exit(1);
}