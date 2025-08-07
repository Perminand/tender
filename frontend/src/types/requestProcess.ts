export interface RequestProcess {
  requestId: string;
  requestNumber: string;
  requestDate: string;
  organization: string;
  project: string;
  location: string;
  applicant: string;
  approver: string;
  performer: string;
  deliveryDeadline: string;
  status: string;
  notes: string;
  requestTotalAmount: number;
  tenderTotalAmount: number;
  deltaAmount: number;
  materialsCount: number;
  materials?: string[];
  tendersCount: number;
  proposalsCount: number;
  contractsCount: number;
  invoicesCount: number;
  deliveriesCount: number;
  receiptsCount: number;
  tenders?: TenderProcess[];
  contracts?: ContractProcess[];
  invoices?: InvoiceProcess[];
  deliveries?: DeliveryProcess[];
}

export interface TenderProcess {
  tenderId: string;
  tenderNumber: string;
  tenderDate: string;
  status: string;
  totalAmount: number;
  proposalsCount: number;
  selectedProposalsCount: number;
  proposals?: SupplierProposal[];
}

export interface SupplierProposal {
  proposalId: string;
  proposalNumber: string;
  supplierId: string;
  supplierName: string;
  supplierContact: string;
  supplierPhone: string;
  submissionDate: string;
  status: string;
  totalPrice: number;
  currency: string;
}

export interface ContractProcess {
  contractId: string;
  contractNumber: string;
  contractDate: string;
  supplierName: string;
  supplierContact: string;
  supplierPhone: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  description: string;
  contractItems?: ContractItem[];
}

export interface ContractItem {
  id: string;
  materialName: string;
  quantity: number;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceProcess {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentDate?: string;
  contractId?: string;
  contractNumber?: string;
  supplierName: string;
  supplierContact: string;
  supplierPhone: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  vatAmount: number;
  paymentTerms?: string;
  notes?: string;
  receipts?: ReceiptProcess[];
  invoiceItems?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  materialName: string;
  quantity: number;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryProcess {
  deliveryId: string;
  deliveryNumber: string;
  plannedDate: string;
  actualDate?: string;
  contractId?: string;
  contractNumber?: string;
  supplierName: string;
  warehouseName?: string;
  status: string;
  totalAmount: number;
  trackingNumber?: string;
  notes?: string;
  deliveryItems?: DeliveryItem[];
  receipts?: ReceiptProcess[];
}

export interface DeliveryItem {
  id: string;
  materialName: string;
  orderedQuantity: number;
  deliveredQuantity?: number;
  acceptedQuantity?: number;
  rejectedQuantity?: number;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
  acceptanceStatus?: string;
}

export interface ReceiptProcess {
  receiptId: string;
  receiptNumber: string;
  receiptDate: string;
  status: string;
  totalAmount: number;
  currency: string;
}

export type ViewMode = 'brief' | 'detailed' | 'matryoshka';

export interface RequestProcessFilters {
  organization: string;
  project: string;
  status: string;
  fromDate: string;
  toDate: string;
} 