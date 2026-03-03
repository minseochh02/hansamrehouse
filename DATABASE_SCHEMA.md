# HanSam Rehouse Database Schema

This document outlines the database structure necessary to run the HanSam Rehouse website. The schema is designed to support customer management, detailed project estimation (including original and additional line items), and spending request tracking.

> **SQLite Compatibility Note:** This schema uses standard SQL types. For SQLite implementation:
> - **UUID**: Store as `TEXT`.
> - **DateTime / Date**: Store as `TEXT` (ISO 8601 format: `YYYY-MM-DD HH:MM:SS`).
> - **Boolean**: Store as `INTEGER` (0 or 1).
> - **Decimal**: Store as `REAL` or `NUMERIC`.
> - **Enums**: Store as `TEXT` with `CHECK` constraints.

## Tables Overview

### Master Data (The Catalog)
1.  **MasterCategories**: Top-level work types (e.g., "철거", "목공").
2.  **MasterSubCategories**: Specific areas or sub-tasks (e.g., "주방", "욕실").
3.  **MasterItems**: The actual products or services.

### Stakeholders
4.  **Employees**: Internal staff members (Managers, Site Supervisors, etc.).
5.  **Vendors (협력업체)**: External partner companies and suppliers.

### Project Data (The Estimates)
6.  **Customers**: Basic client and site information.
7.  **Estimates**: Main project record linking customers to work details.
8.  **Schedules**: Tracks all project dates and milestones (Start, End, Cleaning, etc.).
9.  **PaymentMilestones**: Tracks the four major payment stages for each estimate.
10. **LineItems (Estimates & Additions)**: The central ledger for all project costs, including original quotes and later additions.
11. **SpendingRequests**: Tracking of actual expenses, vendor payments, and approvals.
12. **Attachments (Image Uploads)**: Central storage for all project-related files and photos.

---

## 1. MasterCategories Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `name` | TEXT | |
| `displayOrder` | INTEGER | |
| `isActive` | INTEGER | Boolean (0/1) |
| `createdAt` | TEXT | DateTime |
| `updatedAt` | TEXT | DateTime |

## 2. MasterSubCategories Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `categoryId` | TEXT (FK) | Link to MasterCategory. |
| `name` | TEXT | |
| `displayOrder` | INTEGER | |
| `isActive` | INTEGER | Boolean (0/1) |
| `createdAt` | TEXT | DateTime |
| `updatedAt` | TEXT | DateTime |

## 3. MasterItems Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `subCategoryId` | TEXT (FK) | Link to MasterSubCategory. |
| `name` | TEXT | |
| `unit` | TEXT | |
| `isActive` | INTEGER | Boolean (0/1) |
| `createdAt` | TEXT | DateTime |
| `updatedAt` | TEXT | DateTime |

---

## 4. Employees Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `name` | TEXT | |
| `phone` | TEXT | |
| `email` | TEXT | |
| `role` | TEXT | |
| `bankName` | TEXT | |
| `accountNumber` | TEXT | |
| `accountHolder` | TEXT | |
| `isActive` | INTEGER | Boolean (0/1) |
| `createdAt` | TEXT | DateTime |
| `updatedAt` | TEXT | DateTime |

## 5. Vendors Table (협력업체)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `name` | TEXT | |
| `businessNumber`| TEXT | |
| `representative` | TEXT | |
| `phone` | TEXT | |
| `address` | TEXT | |
| `bankName` | TEXT | |
| `accountNumber` | TEXT | |
| `accountHolder` | TEXT | |
| `isActive` | INTEGER | Boolean (0/1) |
| `createdAt` | TEXT | DateTime |
| `updatedAt` | TEXT | DateTime |

---

## 6. Customers Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `name` | TEXT | |
| `postcode` | TEXT | |
| `address` | TEXT | |
| `detailAddress` | TEXT | |
| `shortAddress` | TEXT | |
| `size` | TEXT | |
| `phone1` | TEXT | |
| `phone2` | TEXT | |
| `createdAt` | TEXT | DateTime |
| `updatedAt` | TEXT | DateTime |

---

## 7. Estimates Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `customerId` | TEXT (FK) | |
| `estimateCode` | TEXT | |
| `siteCode` | TEXT | |
| `status` | TEXT | `상담접수`, `견적중`, `계약완료`, `공사중`, `공사완료`, `추가공사중`, `추가공사완료`. (CHECK constraint) |
| `managerId` | TEXT (FK) | Reference to Employee. |
| `siteManagerId` | TEXT (FK) | Reference to Employee. |
| `totalAmount` | REAL | |
| `createdAt` | TEXT | DateTime |
| `updatedAt` | TEXT | DateTime |

---

## 8. Schedules Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `estimateId` | TEXT (FK) | |
| `type` | TEXT | `ESTIMATE`, `CONSTRUCTION_START`, `CONSTRUCTION_END`, etc. (CHECK constraint) |
| `date` | TEXT | Date |
| `note` | TEXT | |
| `createdAt` | TEXT | DateTime |
| `updatedAt` | TEXT | DateTime |

---

## 9. PaymentMilestones Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `estimateId` | TEXT (FK) | |
| `type` | TEXT | `contract`, `commencement`, `midterm`, `balance`. (CHECK constraint) |
| `date` | TEXT | Date |
| `percentage` | REAL | |
| `amount` | REAL | |
| `createdAt` | TEXT | DateTime |
| `updatedAt` | TEXT | DateTime |

---

## 10. LineItems Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `estimateId` | TEXT (FK) | |
| `masterItemId` | TEXT (FK) | |
| `isAdditional` | INTEGER | Boolean (0/1) |
| `previousId` | TEXT (FK) | UUID of replaced record. |
| `isCurrent` | INTEGER | Boolean (0/1) |
| `categoryName` | TEXT | Snapshot. |
| `subCategoryName` | TEXT | Snapshot. |
| `name` | TEXT | |
| `unit` | TEXT | |
| `quantity` | REAL | |
| `materialUnitPrice` | REAL | |
| `laborUnitPrice` | REAL | |
| `expenseUnitPrice` | REAL | |
| `unitPrice` | REAL | |
| `amount` | REAL | |
| `note` | TEXT | |
| `requestDate` | TEXT | Date |
| `createdAt` | TEXT | DateTime |

---

## 11. SpendingRequests Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `estimateId` | TEXT (FK) | |
| `lineItemId` | TEXT (FK) | |
| `vendorId` | TEXT (FK) | |
| `employeeId` | TEXT (FK) | |
| `payeeName` | TEXT | Snapshot. |
| `processName` | TEXT | |
| `itemName` | TEXT | |
| `materialActualCost`| REAL | |
| `laborActualCost` | REAL | |
| `expenseActualCost` | REAL | |
| `evidenceType` | TEXT | (CHECK constraint) |
| `evidenceText` | TEXT | |
| `isUrgent` | INTEGER | Boolean (0/1) |
| `deadlineMemo` | TEXT | |
| `purchaseLink` | TEXT | |
| `deliveryType` | TEXT | |
| `contactInfo` | TEXT | |
| `memo` | TEXT | |
| `bankName` | TEXT | Snapshot. |
| `accountNumber` | TEXT | Snapshot. |
| `accountHolder` | TEXT | Snapshot. |
| `hasTaxDeduction` | INTEGER | Boolean (0/1) |
| `finalDeposit` | REAL | |
| `paymentStatus` | TEXT | (CHECK constraint) |
| `date` | TEXT | Date |
| `createdAt` | TEXT | DateTime |
| `updatedAt` | TEXT | DateTime |

---

## 12. Attachments Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `estimateId` | TEXT (FK) | |
| `spendingRequestId`| TEXT (FK) | |
| `type` | TEXT | (CHECK constraint) |
| `fileUrl` | TEXT | |
| `fileName` | TEXT | |
| `fileSize` | INTEGER | |
| `fileType` | TEXT | |
| `uploadedById` | TEXT (FK) | |
| `createdAt` | TEXT | DateTime |
| `updatedAt` | TEXT | DateTime |

---

## Entity Relationship Diagram (Conceptual)

- **Employee** (1) <---> (N) **Estimate**
- **Vendor** (1) <---> (N) **SpendingRequest**
- **Customer** (1) <---> (N) **Estimate**
- **Estimate** (1) <---> (N) **Schedules**
- **Estimate** (1) <---> (N) **Attachments**
- **Estimate** (1) <---> (N) **LineItems**
- **LineItem** (1) <---> (N) **SpendingRequests**
- **LineItem (Original)** (1) <---> (N) **LineItem (Additional)** (via `previousId`)
- **SpendingRequest** (1) <---> (N) **Attachments** (Multiple receipts)
