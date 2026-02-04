// scripts/build.js
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 要排除的路由（可以从命令行参数获取）
const excludedRoutes =   ['admin'];
const srcRoutesDir = path.join(__dirname, '..', 'src/routes');
const tempBackupDir = path.join(__dirname, '..', '.routes-backup');

function backupAndExcludeRoutes() {
  console.log('🚀 开始处理路由排除...');
  
  // 1. 备份整个 routes 目录
  if (fs.existsSync(tempBackupDir)) {
    fs.rmSync(tempBackupDir,{recursive:true})
    //await fs.remove(tempBackupDir);
  }
  fs.cpSync(srcRoutesDir, tempBackupDir,{recursive:true});
  console.log('📁 已备份原始路由');
  
  // 2. 删除要排除的路由
  for (const route of excludedRoutes) {
    const routePath = path.join(srcRoutesDir, route);
    console.log(routePath)
    if (fs.existsSync(routePath)) {
      fs.rmSync(routePath,{recursive:true});
      console.log(`❌ 已排除路由: ${route}`);
    }
  }
}

function restoreRoutes() {
  // 3. 恢复原始路由
  if (fs.existsSync(tempBackupDir)) {
    // 清空当前 routes 目录
    fs.rmSync(srcRoutesDir,{recursive:true});
    // 恢复备份
    fs.cpSync(tempBackupDir, srcRoutesDir,{recursive:true});
    // 删除备份
    fs.rmSync(tempBackupDir,{recursive:true});
    console.log('🔄 已恢复原始路由');
  }
}

async function main() {
  try {
    // 排除路由
    backupAndExcludeRoutes();
    
    // 执行构建
    console.log('🔨 开始构建...');
    execSync('vite build', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('构建失败:', error);
  } finally {
    // 总是恢复路由
    restoreRoutes();
  }
}

main();