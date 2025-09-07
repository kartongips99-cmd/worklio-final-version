
export enum UserRole {
  EMPLOYER = 'employer',
  EMPLOYEE = 'employee',
}

export enum ContractType {
    UoP = 'Umowa o Pracę',
    UZ = 'Umowa Zlecenie',
}

export enum BonusType {
    NONE = 'none',
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
}

export interface Payslip {
    id: number;
    month: string;
    year: number;
    grossAmount: number;
    netAmount: number;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  hourlyRate: number;
  email: string;
  phone: string;
  password?: string;
  age: number;
  isStudent: boolean;
  contractType: ContractType;
  avatarUrl?: string;
  payslips: Payslip[];
  bonusType?: BonusType;
  bonusValue?: number;
}

export interface Invoice {
  id: number;
  number: string;
  amount: number;
  type: 'income' | 'expense';
  issueDate: string;
  paymentTerms: number; // in days
  status: 'paid' | 'unpaid';
}

export enum AbsenceRequestStatus {
    PENDING = 'Oczekujące',
    APPROVED = 'Zaakceptowane',
    REJECTED = 'Odrzucone',
}

export interface AbsenceRequest {
    id: number;
    employeeId: number;
    employeeName: string;
    reason: string;
    date: string;
    status: AbsenceRequestStatus;
}

export interface Sale {
    id: number;
    employeeId: number;
    amount: number;
    date: string;
}

export interface WorkLog {
    id: number;
    employeeId: number;
    date: string;
    startTime: string; // e.g., "09:00"
    endTime: string;   // e.g., "17:30"
}

export interface CalendarEvent {
    id: number;
    title: string;
    date: string;
    createdBy: 'employer' | number; // 'employer' or employeeId
}

export interface Notification {
  id: number;
  userId: 'employer' | number; // Target user
  type: 'INVOICE_DUE' | 'ABSENCE_PENDING' | 'EVENT_REMINDER';
  message: string;
  relatedId: number; // e.g., invoiceId, requestId
  isRead: boolean;
  createdAt: string;
}

export interface CompanyDetails {
    companyName: string;
    nip: string;
    address: string;
    logoUrl?: string;
    enableSalesBonuses?: boolean;
}

export interface Company {
    isPremium: boolean;
    details: CompanyDetails;
}
