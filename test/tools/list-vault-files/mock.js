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
        
        try {
          const data = JSON.parse(textContent.text);
          return data.files && Array.isArray(data.files) && data.items && Array.isArray(data.items);
        } catch {
          return false;
        }
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
        
        try {
          const data = JSON.parse(textContent.text);
          return data.files && Array.isArray(data.files) && data.items && Array.isArray(data.items);
        } catch {
          return false;
        }
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
        
        try {
          const data = JSON.parse(textContent.text);
          return data.files && Array.isArray(data.files) && data.items && Array.isArray(data.items);
        } catch {
          return false;
        }
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
        
        try {
          const data = JSON.parse(textContent.text);
          return data.files && Array.isArray(data.files) && data.items && Array.isArray(data.items);
        } catch {
          return false;
        }
      }
    ]
  }
];