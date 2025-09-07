
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Employee, Invoice, AbsenceRequest, Sale, UserRole, AbsenceRequestStatus, WorkLog, CalendarEvent, Notification, Company, CompanyDetails, ContractType, Payslip, BonusType } from '../types';

// --- MOCK DATA ---
const initialPayslips: Payslip[] = [
    { id: 1, month: 'Czerwiec', year: 2024, grossAmount: 7200, netAmount: 5120.50 },
    { id: 2, month: 'Maj', year: 2024, grossAmount: 7100, netAmount: 5040.75 },
];

const initialEmployees: Employee[] = [
    { id: 1, name: 'Jan Kowalski', position: 'Specjalista ds. Sprzedaży', hourlyRate: 45, email: 'employee@demo.com', phone: '123-456-789', password: 'password123', age: 28, isStudent: false, contractType: ContractType.UoP, avatarUrl: 'https://i.pravatar.cc/150?u=1', payslips: initialPayslips, bonusType: BonusType.PERCENTAGE, bonusValue: 5 },
    { id: 2, name: 'Anna Nowak', position: 'Marketing Manager', hourlyRate: 55, email: 'anna.nowak@example.com', phone: '987-654-321', password: 'password123', age: 24, isStudent: true, contractType: ContractType.UZ, avatarUrl: 'https://i.pravatar.cc/150?u=2', payslips: [], bonusType: BonusType.NONE, bonusValue: 0 },
    { id: 3, name: 'Piotr Wiśniewski', position: 'Programista', hourlyRate: 80, email: 'piotr.wisniewski@example.com', phone: '555-444-333', password: 'password123', age: 32, isStudent: false, contractType: ContractType.UoP, avatarUrl: 'https://i.pravatar.cc/150?u=3', payslips: [], bonusType: BonusType.NONE, bonusValue: 0 },
];

const initialInvoices: Invoice[] = [
    { id: 1, number: 'FV/1/2024', amount: 1230, type: 'income', issueDate: new Date(new Date().setMonth(new Date().getMonth() - 0)).toISOString(), paymentTerms: 14, status: 'paid' },
    { id: 2, number: 'FV/2/2024', amount: 450.50, type: 'expense', issueDate: new Date(new Date().setDate(new Date().getDate() - 11)).toISOString(), paymentTerms: 14, status: 'unpaid' },
    { id: 3, number: 'FV/3/2024', amount: 25000, type: 'income', issueDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), paymentTerms: 7, status: 'paid' },
    { id: 4, number: 'FV/4/2024', amount: 500, type: 'expense', issueDate: new Date(new Date().setMonth(new Date().getMonth() - 4)).toISOString(), paymentTerms: 21, status: 'paid' },
];

const initialAbsenceRequests: AbsenceRequest[] = [
    { id: 1, employeeId: 1, employeeName: 'Jan Kowalski', reason: 'Wizyta u lekarza', date: new Date().toISOString().split('T')[0], status: AbsenceRequestStatus.PENDING },
];

const initialSales: Sale[] = [
    { id: 1, employeeId: 1, amount: 1200, date: new Date().toISOString() },
    { id: 2, employeeId: 1, amount: 850, date: new Date().toISOString() },
];

const initialWorkLogs: WorkLog[] = [
    { id: 1, employeeId: 1, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], startTime: '09:00', endTime: '17:00' },
    { id: 2, employeeId: 2, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], startTime: '08:30', endTime: '16:30' },
];

const initialCalendarEvents: CalendarEvent[] = [
    {id: 1, title: 'Spotkanie Zespołu', date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], createdBy: 'employer'}
];

const initialNotifications: Notification[] = [
    { id: 1, userId: 'employer', type: 'ABSENCE_PENDING', message: 'Jan Kowalski złożył wniosek o urlop.', relatedId: 1, isRead: false, createdAt: new Date().toISOString() },
    { id: 2, userId: 'employer', type: 'INVOICE_DUE', message: 'Faktura FV/2/2024 jest po terminie płatności.', relatedId: 2, isRead: false, createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString() },
    { id: 3, userId: 'employer', type: 'EVENT_REMINDER', message: 'Przypomnienie: Spotkanie Zespołu jutro.', relatedId: 1, isRead: true, createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
];

const initialCompany: Company = {
    isPremium: false,
    details: {
        companyName: 'Worklio',
        nip: '123-456-78-90',
        address: 'ul. Wirtualna 1, 00-001 Warszawa',
        logoUrl: '',
        enableSalesBonuses: false,
    }
}

interface CompanyContextType {
    role: UserRole;
    setRole: (role: UserRole) => void;
    currentUser: Employee | null;
    setCurrentUser: (user: Employee | null) => void;
    company: Company;
    setCompany: (company: Company) => void;
    upgradeToPremium: () => void;
    updateCompanyDetails: (details: CompanyDetails) => void;
    employees: Employee[];
    addEmployee: (employee: Omit<Employee, 'id'| 'payslips' | 'bonusType' | 'bonusValue'>) => void;
    updateEmployee: (employee: Employee) => void;
    deleteEmployee: (employeeId: number) => void;
    updateEmployeeSelf: (details: { phone: string }) => void;
    invoices: Invoice[];
    addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
    updateInvoice: (invoice: Invoice) => void;
    absenceRequests: AbsenceRequest[];
    addAbsenceRequest: (request: Omit<AbsenceRequest, 'id' | 'employeeName' | 'status'>) => void;
    updateAbsenceRequestStatus: (requestId: number, status: AbsenceRequestStatus) => void;
    sales: Sale[];
    workLogs: WorkLog[];
    addWorkLog: (log: Omit<WorkLog, 'id'>) => boolean; // returns success
    calendarEvents: CalendarEvent[];
    notifications: Notification[];
    markNotificationAsRead: (notificationId: number) => void;
    registerEmployer: (details: { companyName: string; email: string; password: string }) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState<UserRole>(UserRole.EMPLOYER);
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);
    const [company, setCompany] = useState<Company>(initialCompany);
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>(initialAbsenceRequests);
    const [sales, setSales] = useState<Sale[]>(initialSales);
    const [workLogs, setWorkLogs] = useState<WorkLog[]>(initialWorkLogs);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const upgradeToPremium = useCallback(() => {
        const updatedCompany = { ...company, isPremium: true };
        setCompany(updatedCompany);
        localStorage.setItem('bizflow_company', JSON.stringify(updatedCompany));
    }, [company]);

    const updateCompanyDetails = useCallback((details: CompanyDetails) => {
        const updatedCompany = { ...company, details };
        setCompany(updatedCompany);
        localStorage.setItem('bizflow_company', JSON.stringify(updatedCompany));
    }, [company]);

    const addEmployee = useCallback((employee: Omit<Employee, 'id' | 'payslips' | 'bonusType' | 'bonusValue'>) => {
        setEmployees(prev => [...prev, { ...employee, id: Date.now(), password: 'password123', payslips: [], bonusType: BonusType.NONE, bonusValue: 0 }]);
    }, []);

    const updateEmployee = useCallback((updatedEmployee: Employee) => {
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    }, []);
    
    const updateEmployeeSelf = useCallback((details: { phone: string }) => {
        if (!currentUser) return;
        const updatedEmployee = { ...currentUser, phone: details.phone };
        setCurrentUser(updatedEmployee);
        setEmployees(prev => prev.map(emp => emp.id === currentUser.id ? updatedEmployee : emp));
    }, [currentUser]);
    
    const deleteEmployee = useCallback((employeeId: number) => {
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    }, []);

    const addInvoice = useCallback((invoice: Omit<Invoice, 'id'>) => {
        setInvoices(prev => [{ ...invoice, id: Date.now() }, ...prev]);
    }, []);

    const updateInvoice = useCallback((updatedInvoice: Invoice) => {
        setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    }, []);

    const addAbsenceRequest = useCallback((request: Omit<AbsenceRequest, 'id' | 'employeeName' | 'status'>) => {
        if (!currentUser) return;
        const newRequest: AbsenceRequest = {
            ...request,
            id: Date.now(),
            employeeName: currentUser.name,
            status: AbsenceRequestStatus.PENDING,
        };
        setAbsenceRequests(prev => [newRequest, ...prev]);
        setNotifications(prev => [{
            id: Date.now(),
            userId: 'employer',
            type: 'ABSENCE_PENDING',
            message: `${currentUser.name} złożył wniosek o urlop.`,
            relatedId: newRequest.id,
            isRead: false,
            createdAt: new Date().toISOString()
        }, ...prev]);
    }, [currentUser]);

    const updateAbsenceRequestStatus = useCallback((requestId: number, status: AbsenceRequestStatus) => {
        setAbsenceRequests(prev => prev.map(req => req.id === requestId ? { ...req, status } : req));
    }, []);

    const addWorkLog = useCallback((log: Omit<WorkLog, 'id'>) => {
        const existingLog = workLogs.find(wl => wl.employeeId === log.employeeId && wl.date === log.date);
        if (existingLog) return false;
        setWorkLogs(prev => [{ ...log, id: Date.now() }, ...prev]);
        return true;
    }, [workLogs]);

    const markNotificationAsRead = useCallback((notificationId: number) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    }, []);
    
    const registerEmployer = useCallback((details: { companyName: string; email: string; password: string }) => {
        const newCompany = {
            isPremium: false,
            details: {
                companyName: details.companyName,
                nip: '',
                address: '',
                logoUrl: '',
                enableSalesBonuses: false,
            }
        };
        setCompany(newCompany);
        setEmployees([]);
        setInvoices([]);
        setAbsenceRequests([]);
        setSales([]);
        setWorkLogs([]);
        setCalendarEvents([]);
        setNotifications([]);
        setRole(UserRole.EMPLOYER);
        setCurrentUser(null);
    }, []);

    const value = {
        role,
        setRole,
        currentUser,
        setCurrentUser,
        company,
        setCompany,
        upgradeToPremium,
        updateCompanyDetails,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        updateEmployeeSelf,
        invoices,
        addInvoice,
        updateInvoice,
        absenceRequests,
        addAbsenceRequest,
        updateAbsenceRequestStatus,
        sales,
        workLogs,
        addWorkLog,
        calendarEvents,
        notifications,
        markNotificationAsRead,
        registerEmployer,
    };

    return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};
