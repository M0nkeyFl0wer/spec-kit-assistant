/**
 * Mock helper for file system operations
 * Used to simulate file reads/writes without touching the real filesystem
 */

import { join } from 'path';

/**
 * Create a virtual file system for testing
 * @param {Object} initialFiles - Map of file paths to contents
 * @returns {Object} Mock fs object with common methods
 */
export function createMockFs(initialFiles = {}) {
  const files = new Map(Object.entries(initialFiles));
  const directories = new Set();

  // Auto-create parent directories for initial files
  for (const filePath of files.keys()) {
    let dir = filePath;
    while ((dir = dir.substring(0, dir.lastIndexOf('/'))) && dir) {
      directories.add(dir);
    }
  }

  return {
    // Read file contents
    readFile: async (path, encoding = 'utf8') => {
      if (!files.has(path)) {
        const error = new Error(`ENOENT: no such file or directory, open '${path}'`);
        error.code = 'ENOENT';
        throw error;
      }
      return files.get(path);
    },

    readFileSync: (path, encoding = 'utf8') => {
      if (!files.has(path)) {
        const error = new Error(`ENOENT: no such file or directory, open '${path}'`);
        error.code = 'ENOENT';
        throw error;
      }
      return files.get(path);
    },

    // Write file contents
    writeFile: async (path, content) => {
      files.set(path, content);
      // Auto-create parent directories
      let dir = path;
      while ((dir = dir.substring(0, dir.lastIndexOf('/'))) && dir) {
        directories.add(dir);
      }
    },

    writeFileSync: (path, content) => {
      files.set(path, content);
      let dir = path;
      while ((dir = dir.substring(0, dir.lastIndexOf('/'))) && dir) {
        directories.add(dir);
      }
    },

    // Check if file exists
    existsSync: (path) => files.has(path) || directories.has(path),

    exists: async (path) => files.has(path) || directories.has(path),

    // Check if path is directory
    statSync: (path) => ({
      isDirectory: () => directories.has(path),
      isFile: () => files.has(path)
    }),

    stat: async (path) => ({
      isDirectory: () => directories.has(path),
      isFile: () => files.has(path)
    }),

    // Create directory
    mkdirSync: (path, options = {}) => {
      directories.add(path);
      if (options.recursive) {
        let dir = path;
        while ((dir = dir.substring(0, dir.lastIndexOf('/'))) && dir) {
          directories.add(dir);
        }
      }
    },

    mkdir: async (path, options = {}) => {
      directories.add(path);
      if (options.recursive) {
        let dir = path;
        while ((dir = dir.substring(0, dir.lastIndexOf('/'))) && dir) {
          directories.add(dir);
        }
      }
    },

    // Read directory contents
    readdirSync: (path) => {
      const entries = [];
      const prefix = path.endsWith('/') ? path : path + '/';

      for (const filePath of files.keys()) {
        if (filePath.startsWith(prefix)) {
          const relative = filePath.slice(prefix.length);
          const firstPart = relative.split('/')[0];
          if (!entries.includes(firstPart)) {
            entries.push(firstPart);
          }
        }
      }

      for (const dir of directories) {
        if (dir.startsWith(prefix)) {
          const relative = dir.slice(prefix.length);
          const firstPart = relative.split('/')[0];
          if (firstPart && !entries.includes(firstPart)) {
            entries.push(firstPart);
          }
        }
      }

      return entries;
    },

    readdir: async (path) => {
      return this.readdirSync(path);
    },

    // Delete file
    unlinkSync: (path) => {
      files.delete(path);
    },

    unlink: async (path) => {
      files.delete(path);
    },

    // Test helpers
    _getFiles: () => Object.fromEntries(files),
    _getDirectories: () => Array.from(directories),
    _reset: () => {
      files.clear();
      directories.clear();
    },
    _setFile: (path, content) => files.set(path, content),
    _deleteFile: (path) => files.delete(path)
  };
}

/**
 * Create a mock fs-extra object (extends mock-fs with fs-extra methods)
 */
export function createMockFsExtra(initialFiles = {}) {
  const mockFs = createMockFs(initialFiles);

  return {
    ...mockFs,

    // fs-extra specific methods
    ensureDir: async (path) => {
      mockFs.mkdirSync(path, { recursive: true });
    },

    ensureDirSync: (path) => {
      mockFs.mkdirSync(path, { recursive: true });
    },

    readJson: async (path) => {
      const content = await mockFs.readFile(path);
      return JSON.parse(content);
    },

    readJsonSync: (path) => {
      const content = mockFs.readFileSync(path);
      return JSON.parse(content);
    },

    writeJson: async (path, data, options = {}) => {
      const content = JSON.stringify(data, null, options.spaces || 2);
      await mockFs.writeFile(path, content);
    },

    writeJsonSync: (path, data, options = {}) => {
      const content = JSON.stringify(data, null, options.spaces || 2);
      mockFs.writeFileSync(path, content);
    },

    pathExists: async (path) => mockFs.existsSync(path),

    pathExistsSync: (path) => mockFs.existsSync(path),

    copy: async (src, dest) => {
      if (mockFs.existsSync(src)) {
        const content = await mockFs.readFile(src);
        await mockFs.writeFile(dest, content);
      }
    },

    copySync: (src, dest) => {
      if (mockFs.existsSync(src)) {
        const content = mockFs.readFileSync(src);
        mockFs.writeFileSync(dest, content);
      }
    },

    remove: async (path) => {
      mockFs.unlinkSync(path);
    },

    removeSync: (path) => {
      mockFs.unlinkSync(path);
    }
  };
}
