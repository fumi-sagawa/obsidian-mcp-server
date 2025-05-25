export const testCases = [
  {
    name: 'Vaultにファイルとディレクトリが存在',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_vault_files',
        arguments: {}
      }
    },
    mockData: {
      method: 'GET',
      path: '/vault/',
      response: {
        files: [
          "Daily Notes/",
          "Projects/",
          "Templates/",
          "README.md",
          "index.md",
          "todo.md"
        ]
      }
    },
    assertions: [
      response => {
        const textContent = response.result?.content?.find(item => item.type === 'text');
        if (!textContent) return false;
        
        const text = textContent.text;
        return text.includes('📁 Vault Files') &&
          text.includes('📂 Directories:') &&
          text.includes('📁 Daily Notes/') &&
          text.includes('📁 Projects/') &&
          text.includes('📁 Templates/') &&
          text.includes('📄 Files:') &&
          text.includes('📄 README.md') &&
          text.includes('📄 index.md') &&
          text.includes('📄 todo.md') &&
          text.includes('3 directories, 3 files');
      }
    ]
  },
  {
    name: '空のVault',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_vault_files',
        arguments: {}
      }
    },
    mockData: {
      method: 'GET',
      path: '/vault/',
      response: {
        files: []
      }
    },
    assertions: [
      response => {
        const textContent = response.result?.content?.find(item => item.type === 'text');
        if (!textContent) return false;
        return textContent.text.includes('🔍 Vault is empty');
      }
    ]
  },
  {
    name: 'ファイルのみのVault',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_vault_files',
        arguments: {}
      }
    },
    mockData: {
      method: 'GET',
      path: '/vault/',
      response: {
        files: ["file1.md", "file2.md", "file3.md"]
      }
    },
    assertions: [
      response => {
        const textContent = response.result?.content?.find(item => item.type === 'text');
        if (!textContent) return false;
        const text = textContent.text;
        return text.includes('📄 Files:') &&
          !text.includes('📂 Directories:') &&
          text.includes('0 directories, 3 files');
      }
    ]
  },
  {
    name: 'ディレクトリのみのVault',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_vault_files',
        arguments: {}
      }
    },
    mockData: {
      method: 'GET',
      path: '/vault/',
      response: {
        files: ["folder1/", "folder2/", "folder3/"]
      }
    },
    assertions: [
      response => {
        const textContent = response.result?.content?.find(item => item.type === 'text');
        if (!textContent) return false;
        const text = textContent.text;
        return !text.includes('📄 Files:') &&
          text.includes('📂 Directories:') &&
          text.includes('3 directories, 0 files');
      }
    ]
  }
];