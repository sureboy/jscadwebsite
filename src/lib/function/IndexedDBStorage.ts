interface StorageItem {
  key: string;
  value: any;
  createdAt: number;
  expire?: number;
}

export class IndexedDBStorage {
  private dbName: string;
  private storeName: string;
  private version: number;
  private db: IDBDatabase | null = null;
  private isInitialized: boolean = false;
  private initPromise: Promise<IDBDatabase> | null = null;

  constructor(dbName: string = 'KeyValueDB', storeName: string = 'keyValueStore', version: number = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
  }

  // 初始化数据库
  private async initDB(): Promise<IDBDatabase> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error(`数据库打开失败: ${request.error}`));
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储空间（类似表）
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          // 创建索引以便查询
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('expire', 'expire', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  // 等待数据库初始化完成
  private async ensureDB(): Promise<IDBDatabase> {
    if (this.isInitialized && this.db) {
      return this.db;
    }
    return await this.initDB();
  }

  // 添加或更新数据（put方法）
  async put(key: string, value: any, expire?: number): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const item: StorageItem = {
        key,
        value,
        createdAt: Date.now(),
        expire: expire ? Date.now() + expire : undefined
      };

      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`存储数据失败: ${request.error}`));
    });
  }

  // 获取数据（get方法）
  async get<T = any>(key: string): Promise<T | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.get(key);

      request.onsuccess = () => {
        const result: StorageItem | undefined = request.result;
        
        if (!result) {
          resolve(null);
          return;
        }

        // 检查是否过期
        if (result.expire && Date.now() > result.expire) {
          // 自动删除过期数据
          this.del(key);
          resolve(null);
          return;
        }

        resolve(result.value);
      };

      request.onerror = () => reject(new Error(`获取数据失败: ${request.error}`));
    });
  }

  // 删除数据（del方法）
  async del(key: string): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`删除数据失败: ${request.error}`));
    });
  }

  // 获取所有键名
  async keys(): Promise<string[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const keys: string[] = [];
      
      const request = store.openCursor();

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          // 检查是否过期
          const item: StorageItem = cursor.value;
          if (!item.expire || Date.now() <= item.expire) {
            keys.push(item.key);
          }
          cursor.continue();
        } else {
          resolve(keys);
        }
      };

      request.onerror = () => reject(new Error(`获取键列表失败: ${request.error}`));
    });
  }

  // 清空所有数据
  async clear(): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`清空数据失败: ${request.error}`));
    });
  }

  // 获取存储大小或统计信息
  async getStats(): Promise<{ total: number; size: number }> {
    const keys = await this.keys();
    let totalSize = 0;

    // 估算存储大小（近似值）
    for (const key of keys) {
      const value = await this.get(key);
      totalSize += new Blob([JSON.stringify(value)]).size;
    }

    return {
      total: keys.length,
      size: totalSize
    };
  }
}