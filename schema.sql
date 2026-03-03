-- HanSam Rehouse SQLite Schema
-- Optimized for SQLite 3.x

PRAGMA foreign_keys = ON;

-- 1. mastercategories Table
CREATE TABLE mastercategories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    displayOrder INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1 CHECK (isActive IN (0, 1)),
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

-- 2. MasterSubCategories Table
CREATE TABLE mastersubcategories (
    id TEXT PRIMARY KEY,
    categoryId TEXT NOT NULL,
    name TEXT NOT NULL,
    displayOrder INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1 CHECK (isActive IN (0, 1)),
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (categoryId) REFERENCES mastercategories(id) ON DELETE CASCADE
);

-- 3. MasterItems Table
CREATE TABLE masteritems (
    id TEXT PRIMARY KEY,
    subCategoryId TEXT NOT NULL,
    name TEXT NOT NULL,
    unit TEXT,
    isActive INTEGER DEFAULT 1 CHECK (isActive IN (0, 1)),
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (subCategoryId) REFERENCES mastersubcategories(id) ON DELETE CASCADE
);

-- 4. Employees Table
CREATE TABLE employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    role TEXT,
    bankName TEXT,
    accountNumber TEXT,
    accountHolder TEXT,
    isActive INTEGER DEFAULT 1 CHECK (isActive IN (0, 1)),
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

-- 5. Vendors Table (협력업체)
CREATE TABLE vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    businessNumber TEXT,
    representative TEXT,
    phone TEXT,
    address TEXT,
    bankName TEXT,
    accountNumber TEXT,
    accountHolder TEXT,
    isActive INTEGER DEFAULT 1 CHECK (isActive IN (0, 1)),
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

-- 6. Customers Table
CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    postcode TEXT,
    address TEXT,
    detailAddress TEXT,
    shortAddress TEXT,
    size TEXT,
    phone1 TEXT,
    phone2 TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

-- 7. Estimates Table
CREATE TABLE estimates (
    id TEXT PRIMARY KEY,
    customerId TEXT NOT NULL,
    estimateCode TEXT UNIQUE,
    siteCode TEXT,
    status TEXT CHECK (status IN ('상담접수', '견적중', '계약완료', '공사중', '공사완료', '추가공사중', '추가공사완료')),
    managerId TEXT,
    siteManagerId TEXT,
    totalAmount REAL DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (managerId) REFERENCES employees(id),
    FOREIGN KEY (siteManagerId) REFERENCES employees(id)
);

-- 8. Schedules Table
CREATE TABLE schedules (
    id TEXT PRIMARY KEY,
    estimateId TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ESTIMATE', 'CONSTRUCTION_START', 'CONSTRUCTION_END', 'MOVE_IN_CLEANING', 'ADDITIONAL_ESTIMATE', 'ADDITIONAL_START', 'ADDITIONAL_END')),
    date TEXT NOT NULL,
    note TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (estimateId) REFERENCES estimates(id) ON DELETE CASCADE
);

-- 9. PaymentMilestones Table
CREATE TABLE paymentmilestones (
    id TEXT PRIMARY KEY,
    estimateId TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('contract', 'commencement', 'midterm', 'balance')),
    date TEXT NOT NULL,
    percentage REAL,
    amount REAL,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (estimateId) REFERENCES estimates(id) ON DELETE CASCADE
);

-- 10. LineItems Table
CREATE TABLE lineitems (
    id TEXT PRIMARY KEY,
    estimateId TEXT NOT NULL,
    masterItemId TEXT,
    isAdditional INTEGER DEFAULT 0 CHECK (isAdditional IN (0, 1)),
    previousId TEXT,
    isCurrent INTEGER DEFAULT 1 CHECK (isCurrent IN (0, 1)),
    categoryName TEXT,
    subCategoryName TEXT,
    name TEXT NOT NULL,
    unit TEXT,
    quantity REAL DEFAULT 0,
    materialUnitPrice REAL DEFAULT 0,
    laborUnitPrice REAL DEFAULT 0,
    expenseUnitPrice REAL DEFAULT 0,
    unitPrice REAL DEFAULT 0,
    amount REAL DEFAULT 0,
    note TEXT,
    requestDate TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (estimateId) REFERENCES estimates(id) ON DELETE CASCADE,
    FOREIGN KEY (masterItemId) REFERENCES masteritems(id),
    FOREIGN KEY (previousId) REFERENCES lineitems(id)
);

-- 11. SpendingRequests Table
CREATE TABLE spendingrequests (
    id TEXT PRIMARY KEY,
    estimateId TEXT NOT NULL,
    lineItemId TEXT,
    vendorId TEXT,
    employeeId TEXT,
    payeeName TEXT,
    processName TEXT,
    itemName TEXT,
    materialActualCost REAL DEFAULT 0,
    laborActualCost REAL DEFAULT 0,
    expenseActualCost REAL DEFAULT 0,
    evidenceType TEXT CHECK (evidenceType IN ('RECEIPT', 'TAX_INVOICE', 'CASH_RECEIPT', 'OTHER')),
    evidenceText TEXT,
    isUrgent INTEGER DEFAULT 0 CHECK (isUrgent IN (0, 1)),
    deadlineMemo TEXT,
    purchaseLink TEXT,
    deliveryType TEXT,
    contactInfo TEXT,
    memo TEXT,
    bankName TEXT,
    accountNumber TEXT,
    accountHolder TEXT,
    hasTaxDeduction INTEGER DEFAULT 0 CHECK (hasTaxDeduction IN (0, 1)),
    finalDeposit REAL DEFAULT 0,
    paymentStatus TEXT DEFAULT '임시저장' CHECK (paymentStatus IN ('대기', '완료', '반려', '임시저장')),
    date TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (estimateId) REFERENCES estimates(id) ON DELETE CASCADE,
    FOREIGN KEY (lineItemId) REFERENCES lineitems(id),
    FOREIGN KEY (vendorId) REFERENCES vendors(id),
    FOREIGN KEY (employeeId) REFERENCES employees(id)
);

-- 12. Attachments Table
CREATE TABLE attachments (
    id TEXT PRIMARY KEY,
    estimateId TEXT NOT NULL,
    spendingRequestId TEXT,
    type TEXT CHECK (type IN ('RECEIPT', 'SITE_PHOTO', 'BLUEPRINT', 'CONTRACT_DOC', 'OTHER')),
    fileUrl TEXT NOT NULL,
    fileName TEXT,
    fileSize INTEGER,
    fileType TEXT,
    uploadedById TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (estimateId) REFERENCES estimates(id) ON DELETE CASCADE,
    FOREIGN KEY (spendingRequestId) REFERENCES spendingrequests(id) ON DELETE SET NULL,
    FOREIGN KEY (uploadedById) REFERENCES employees(id)
);

-- Trigger to update 'updatedAt' columns automatically
CREATE TRIGGER update_MasterCategories_updatedAt AFTER UPDATE ON MasterCategories
BEGIN UPDATE MasterCategories SET updatedAt = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER update_MasterSubCategories_updatedAt AFTER UPDATE ON MasterSubCategories
BEGIN UPDATE MasterSubCategories SET updatedAt = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER update_MasterItems_updatedAt AFTER UPDATE ON MasterItems
BEGIN UPDATE MasterItems SET updatedAt = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER update_Employees_updatedAt AFTER UPDATE ON Employees
BEGIN UPDATE Employees SET updatedAt = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER update_Vendors_updatedAt AFTER UPDATE ON Vendors
BEGIN UPDATE Vendors SET updatedAt = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER update_Customers_updatedAt AFTER UPDATE ON Customers
BEGIN UPDATE Customers SET updatedAt = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER update_Estimates_updatedAt AFTER UPDATE ON Estimates
BEGIN UPDATE Estimates SET updatedAt = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER update_Schedules_updatedAt AFTER UPDATE ON Schedules
BEGIN UPDATE Schedules SET updatedAt = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER update_PaymentMilestones_updatedAt AFTER UPDATE ON PaymentMilestones
BEGIN UPDATE PaymentMilestones SET updatedAt = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER update_SpendingRequests_updatedAt AFTER UPDATE ON SpendingRequests
BEGIN UPDATE SpendingRequests SET updatedAt = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER update_Attachments_updatedAt AFTER UPDATE ON Attachments
BEGIN UPDATE Attachments SET updatedAt = datetime('now') WHERE id = NEW.id; END;
