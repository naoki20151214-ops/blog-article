// Mock Firebase - In-memory implementation for testing
const mockData = {
  products: {},
  suppliers: {},
  inventories: {},
  inventoryHistory: {},
};

// Initialize mock data
const initializeMockData = () => {
  // Sample suppliers
  const suppliers = [
    {
      id: 'SUP-001',
      code: 'SUP-A001',
      name: 'サプライヤーA',
      contactPerson: '田中太郎',
      email: 'tanaka@supplier-a.com',
      phone: '090-1234-5678',
      address: '東京都渋谷区',
      paymentTerms: 'Net 30',
      status: 'active',
      rating: 4.5,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: 'SUP-002',
      code: 'SUP-B002',
      name: 'サプライヤーB',
      contactPerson: '鈴木次郎',
      email: 'suzuki@supplier-b.com',
      phone: '090-9876-5432',
      address: '大阪府大阪市',
      paymentTerms: 'Net 45',
      status: 'active',
      rating: 4.0,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ];

  // Sample products
  const products = [
    {
      id: 'PROD-001',
      code: 'SKU-P001',
      name: 'ノートPC',
      description: '高性能ノートパソコン',
      category: '電子機器',
      unit: '個',
      unitPrice: 120000,
      supplierId: 'SUP-001',
      reorderLevel: 5,
      maxStock: 50,
      status: 'active',
      createdAt: new Date(),
      modifiedAt: new Date(),
      notes: '',
    },
    {
      id: 'PROD-002',
      code: 'SKU-P002',
      name: 'マウス',
      description: 'ワイヤレスマウス',
      category: '周辺機器',
      unit: '個',
      unitPrice: 3000,
      supplierId: 'SUP-002',
      reorderLevel: 50,
      maxStock: 500,
      status: 'active',
      createdAt: new Date(),
      modifiedAt: new Date(),
      notes: '',
    },
    {
      id: 'PROD-003',
      code: 'SKU-P003',
      name: 'キーボード',
      description: 'メカニカルキーボード',
      category: '周辺機器',
      unit: '個',
      unitPrice: 15000,
      supplierId: 'SUP-001',
      reorderLevel: 10,
      maxStock: 100,
      status: 'active',
      createdAt: new Date(),
      modifiedAt: new Date(),
      notes: '',
    },
    {
      id: 'PROD-004',
      code: 'SKU-P004',
      name: 'モニター',
      description: '27インチ 4K モニター',
      category: '電子機器',
      unit: '個',
      unitPrice: 45000,
      supplierId: 'SUP-001',
      reorderLevel: 3,
      maxStock: 20,
      status: 'active',
      createdAt: new Date(),
      modifiedAt: new Date(),
      notes: '',
    },
    {
      id: 'PROD-005',
      code: 'SKU-P005',
      name: 'USB-C ケーブル',
      description: '2m USB-C ケーブル',
      category: 'ケーブル',
      unit: '本',
      unitPrice: 1500,
      supplierId: 'SUP-002',
      reorderLevel: 100,
      maxStock: 1000,
      status: 'active',
      createdAt: new Date(),
      modifiedAt: new Date(),
      notes: '',
    },
  ];

  // Sample inventories
  const inventories = [
    {
      id: 'INV-001',
      productId: 'PROD-001',
      warehouseLocation: 'A-01-01',
      quantityOnHand: 15,
      quantityReserved: 3,
      quantityAvailable: 12,
      lastCountedDate: new Date(),
      reorderQuantity: 10,
      leadTimeDays: 7,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: 'INV-002',
      productId: 'PROD-002',
      warehouseLocation: 'B-02-05',
      quantityOnHand: 25,
      quantityReserved: 5,
      quantityAvailable: 20,
      lastCountedDate: new Date(),
      reorderQuantity: 50,
      leadTimeDays: 3,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: 'INV-003',
      productId: 'PROD-003',
      warehouseLocation: 'A-03-02',
      quantityOnHand: 8,
      quantityReserved: 2,
      quantityAvailable: 6,
      lastCountedDate: new Date(),
      reorderQuantity: 20,
      leadTimeDays: 5,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: 'INV-004',
      productId: 'PROD-004',
      warehouseLocation: 'C-01-03',
      quantityOnHand: 2,
      quantityReserved: 0,
      quantityAvailable: 2,
      lastCountedDate: new Date(),
      reorderQuantity: 5,
      leadTimeDays: 14,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: 'INV-005',
      productId: 'PROD-005',
      warehouseLocation: 'B-04-01',
      quantityOnHand: 45,
      quantityReserved: 10,
      quantityAvailable: 35,
      lastCountedDate: new Date(),
      reorderQuantity: 100,
      leadTimeDays: 2,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ];

  // Store in mock data
  suppliers.forEach(s => mockData.suppliers[s.id] = s);
  products.forEach(p => mockData.products[p.id] = p);
  inventories.forEach(i => mockData.inventories[i.id] = i);

  console.log('Mock data initialized successfully');
};

// Mock Firestore API
const mockFirestore = {
  collection: (collectionName) => {
    return {
      get: async () => {
        const data = mockData[collectionName] || {};
        const docs = Object.values(data).map(doc => ({
          exists: true,
          data: () => doc,
        }));
        return {
          forEach: (callback) => docs.forEach(callback),
          size: docs.length,
        };
      },
      doc: (docId) => {
        return {
          get: async () => {
            const doc = mockData[collectionName][docId];
            return {
              exists: doc !== undefined,
              data: () => doc,
            };
          },
          set: async (data) => {
            mockData[collectionName][docId] = data;
            console.log(`Mock: Set ${collectionName}/${docId}`);
          },
          update: async (data) => {
            if (mockData[collectionName][docId]) {
              mockData[collectionName][docId] = {
                ...mockData[collectionName][docId],
                ...data,
              };
              console.log(`Mock: Update ${collectionName}/${docId}`);
            }
          },
          delete: async () => {
            delete mockData[collectionName][docId];
            console.log(`Mock: Delete ${collectionName}/${docId}`);
          },
        };
      },
      where: (field, operator, value) => {
        return {
          get: async () => {
            const data = mockData[collectionName] || {};
            const docs = Object.values(data)
              .filter(doc => {
                if (operator === '==') return doc[field] === value;
                if (operator === '>=') return doc[field] >= value;
                if (operator === '<=') return doc[field] <= value;
                return false;
              })
              .map(doc => ({
                exists: true,
                data: () => doc,
              }));
            return {
              forEach: (callback) => docs.forEach(callback),
              size: docs.length,
              get: async () => ({
                forEach: (callback) => docs.forEach(callback),
                size: docs.length,
              }),
            };
          },
          orderBy: (field, direction = 'asc') => {
            return {
              get: async () => {
                const data = mockData[collectionName] || {};
                const docs = Object.values(data)
                  .filter(doc => doc[field] !== undefined)
                  .sort((a, b) => {
                    if (direction === 'desc') {
                      return b[field] > a[field] ? 1 : -1;
                    }
                    return a[field] > b[field] ? 1 : -1;
                  })
                  .map(doc => ({
                    exists: true,
                    data: () => doc,
                  }));
                return {
                  forEach: (callback) => docs.forEach(callback),
                  size: docs.length,
                  offset: (n) => ({
                    limit: (limit) => ({
                      get: async () => {
                        return {
                          forEach: (callback) => docs.slice(n, n + limit).forEach(callback),
                          size: docs.length,
                        };
                      },
                    }),
                  }),
                };
              },
            };
          },
        };
      },
      offset: (n) => {
        return {
          limit: (limit) => {
            return {
              get: async () => {
                const data = mockData[collectionName] || {};
                const docs = Object.values(data)
                  .map(doc => ({
                    exists: true,
                    data: () => doc,
                  }))
                  .slice(n, n + limit);
                return {
                  forEach: (callback) => docs.forEach(callback),
                  size: docs.length,
                };
              },
            };
          },
        };
      },
    };
  },
  batch: () => {
    const operations = [];
    return {
      delete: (ref) => {
        operations.push({ type: 'delete', ref });
      },
      commit: async () => {
        console.log('Mock: Batch commit', operations.length, 'operations');
      },
    };
  },
};

// Export mock functions
const initializeMock = () => {
  initializeMockData();
  return { firestore: mockFirestore };
};

const getDB = () => {
  return mockFirestore;
};

module.exports = {
  initializeMock,
  getDB,
  admin: {
    initializeApp: () => {},
    credential: {
      cert: () => ({}),
    },
  },
};
