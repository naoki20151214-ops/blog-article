// Transaction Types
const TRANSACTION_TYPES = {
  IN: 'IN',           // 仕入
  OUT: 'OUT',         // 出荷
  ADJUSTMENT: 'ADJUSTMENT', // 調整
  COUNT: 'COUNT'      // 棚卸
};

// Status Types
const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCONTINUED: 'discontinued'
};

// Reasons for inventory changes
const REASONS = {
  PURCHASE: '仕入',
  SALES: '販売',
  RETURN: '返品',
  ADJUSTMENT: '調整',
  COUNT: '棚卸',
  DAMAGE: '破損',
  LOSS: '紛失'
};

module.exports = {
  TRANSACTION_TYPES,
  STATUS,
  REASONS,
};
