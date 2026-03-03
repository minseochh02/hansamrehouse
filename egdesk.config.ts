/**
 * EGDesk User Data Configuration
 * Generated at: 2026-03-03T07:37:25.204Z
 *
 * This file contains type-safe definitions for your EGDesk tables.
 */

export const EGDESK_CONFIG = {
  apiUrl: 'http://localhost:8080',
  apiKey: '067db765-0957-4a8f-8d64-0fc01d9f9299',
} as const;

export interface TableDefinition {
  name: string;
  displayName: string;
  description?: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
}

export const TABLES = {
  table1: {
    name: 'Employees',
    displayName: 'Employees',
    description: 'Imported from 사원DB.csv',
    rowCount: 42,
    columnCount: 9,
    columns: ['id', 'name', 'phone', 'email', 'role', 'bankName', 'accountNumber', 'accountHolder', 'isActive']
  } as TableDefinition,
  table2: {
    name: 'MasterItems',
    displayName: 'MasterItems',
    description: undefined,
    rowCount: 742,
    columnCount: 5,
    columns: ['id', 'subCategoryId', 'name', 'unit', 'isActive']
  } as TableDefinition,
  table3: {
    name: 'MasterSubCategories',
    displayName: 'MasterSubCategories',
    description: undefined,
    rowCount: 63,
    columnCount: 5,
    columns: ['id', 'categoryId', 'name', 'displayOrder', 'isActive']
  } as TableDefinition,
  table4: {
    name: 'MasterCategories',
    displayName: 'MasterCategories',
    description: undefined,
    rowCount: 24,
    columnCount: 4,
    columns: ['id', 'name', 'displayOrder', 'isActive']
  } as TableDefinition,
  table5: {
    name: 'Attachments',
    displayName: 'Attachments',
    description: 'Imported from schema.sql',
    rowCount: undefined,
    columnCount: 11,
    columns: ['id', 'estimateId', 'spendingRequestId', 'type', 'fileUrl', 'fileName', 'fileSize', 'fileType', 'uploadedById', 'createdAt', 'updatedAt']
  } as TableDefinition,
  table6: {
    name: 'SpendingRequests',
    displayName: 'SpendingRequests',
    description: 'Imported from schema.sql',
    rowCount: undefined,
    columnCount: 28,
    columns: ['id', 'estimateId', 'lineItemId', 'vendorId', 'employeeId', 'payeeName', 'processName', 'itemName', 'materialActualCost', 'laborActualCost', 'expenseActualCost', 'evidenceType', 'evidenceText', 'isUrgent', 'deadlineMemo', 'purchaseLink', 'deliveryType', 'contactInfo', 'memo', 'bankName', 'accountNumber', 'accountHolder', 'hasTaxDeduction', 'finalDeposit', 'paymentStatus', 'date', 'createdAt', 'updatedAt']
  } as TableDefinition,
  table7: {
    name: 'LineItems',
    displayName: 'LineItems',
    description: 'Imported from schema.sql',
    rowCount: undefined,
    columnCount: 19,
    columns: ['id', 'estimateId', 'masterItemId', 'isAdditional', 'previousId', 'isCurrent', 'categoryName', 'subCategoryName', 'name', 'unit', 'quantity', 'materialUnitPrice', 'laborUnitPrice', 'expenseUnitPrice', 'unitPrice', 'amount', 'note', 'requestDate', 'createdAt']
  } as TableDefinition,
  table8: {
    name: 'PaymentMilestones',
    displayName: 'PaymentMilestones',
    description: 'Imported from schema.sql',
    rowCount: undefined,
    columnCount: 8,
    columns: ['id', 'estimateId', 'type', 'date', 'percentage', 'amount', 'createdAt', 'updatedAt']
  } as TableDefinition,
  table9: {
    name: 'Schedules',
    displayName: 'Schedules',
    description: 'Imported from schema.sql',
    rowCount: undefined,
    columnCount: 7,
    columns: ['id', 'estimateId', 'type', 'date', 'note', 'createdAt', 'updatedAt']
  } as TableDefinition,
  table10: {
    name: 'Estimates',
    displayName: 'Estimates',
    description: 'Imported from schema.sql',
    rowCount: undefined,
    columnCount: 10,
    columns: ['id', 'customerId', 'estimateCode', 'siteCode', 'status', 'managerId', 'siteManagerId', 'totalAmount', 'createdAt', 'updatedAt']
  } as TableDefinition,
  table11: {
    name: 'Customers',
    displayName: 'Customers',
    description: 'Imported from schema.sql',
    rowCount: undefined,
    columnCount: 11,
    columns: ['id', 'name', 'postcode', 'address', 'detailAddress', 'shortAddress', 'size', 'phone1', 'phone2', 'createdAt', 'updatedAt']
  } as TableDefinition,
  table12: {
    name: 'Vendors',
    displayName: 'Vendors',
    description: 'Imported from schema.sql',
    rowCount: undefined,
    columnCount: 12,
    columns: ['id', 'name', 'businessNumber', 'representative', 'phone', 'address', 'bankName', 'accountNumber', 'accountHolder', 'isActive', 'createdAt', 'updatedAt']
  } as TableDefinition
} as const;


// Main table (first table by default)
export const MAIN_TABLE = TABLES.table1;


// Helper to get table by name
export function getTableByName(tableName: string): TableDefinition | undefined {
  return Object.values(TABLES).find(t => t.name === tableName);
}

// Export table names for easy access
export const TABLE_NAMES = {
  table1: 'Employees',
  table2: 'MasterItems',
  table3: 'MasterSubCategories',
  table4: 'MasterCategories',
  table5: 'Attachments',
  table6: 'SpendingRequests',
  table7: 'LineItems',
  table8: 'PaymentMilestones',
  table9: 'Schedules',
  table10: 'Estimates',
  table11: 'Customers',
  table12: 'Vendors'
} as const;
