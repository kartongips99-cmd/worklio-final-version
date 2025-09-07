
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { CompanyProvider, useCompany } from './context/CompanyDataContext';
import { UserRole, Employee, AbsenceRequestStatus, Invoice, WorkLog, CalendarEvent, Notification, CompanyDetails, ContractType, Payslip, BonusType } from './types';
import { calculateNetSalary } from './services/payrollService';

// --- UTILS ---
const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    if (end <= start) return 0;
    const diff = end.getTime() - start.getTime();
    return diff / (1000 * 60 * 60);
};

// --- SVG Icons ---
const LogoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>;
const PulpitIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path></svg>;
const CalendarIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"></path></svg>;
const EmployeesIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>;
const InvoicesIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"></path></svg>;
const MoreIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>;
const DollarIcon = () => <svg className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c2.17-.46 3.5-1.68 3.5-3.66 0-2.31-1.9-3.45-4.7-4.14z"></path></svg>;
const ArrowRightIcon = () => <svg className="h-5 w-5 text-slate-500 group-hover:text-slate-400 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>;
const ClockIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>;
const SalesIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.09-4-4L2 16.99z"></path></svg>;
const EditIcon = () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>;
const LogoutIcon = () => <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>;
const BellIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"></path></svg>;
const PremiumIcon = ({ className = "h-6 w-6" }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"></path></svg>;
const SettingsIcon = ({ className = "h-6 w-6" }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22-.07.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path></svg>;
const BackIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>;
const BriefcaseIcon = () => <svg className="h-10 w-10 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"></path></svg>;
const UserIcon = () => <svg className="h-10 w-10 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>;
const PayrollIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V8h16v9c0 .55-.45 1-1 1zm-5-5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"></path></svg>;

// --- Helper Components ---
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className, variant = 'primary', type = 'button', disabled = false }: { children: React.ReactNode, onClick?: () => void, className?: string, variant?: 'primary' | 'secondary' | 'danger', type?: 'button' | 'submit', disabled?: boolean }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  return (
    <button onClick={onClick} type={type} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-start p-4 pt-20" onClick={onClose}>
      <div 
        className="bg-slate-900 rounded-lg shadow-xl w-full max-w-sm border border-slate-800 animate-fade-in flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }: { label?: string, [key: string]: any }) => (
    <div>
        {label && <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}
        <input {...props} className="w-full bg-slate-800 p-2 rounded border border-slate-700 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-800/50 disabled:cursor-not-allowed" />
    </div>
);

const Select = ({ label, children, ...props }: { label?: string, children: React.ReactNode, [key: string]: any }) => (
    <div>
        {label && <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}
        <select {...props} className="w-full bg-slate-800 p-2 rounded border border-slate-700 focus:ring-blue-500 focus:border-blue-500">
            {children}
        </select>
    </div>
);

const Checkbox = ({ label, ...props }: { label: string, [key: string]: any }) => (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <input type="checkbox" {...props} className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500" />
        {label}
    </label>
);


const AdBanner = () => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center my-6">
        <p className="text-xs text-slate-400">
            <span className="font-semibold text-blue-400">REKLAMA</span> - Przejdź na wersję Premium, aby usunąć reklamy i odblokować wszystkie funkcje.
        </p>
    </div>
);


// --- Page Components ---
const Dashboard = ({ setActiveTab, setActiveView, setEmployeeToAdd }: { setActiveTab: (tab: string) => void, setActiveView: (view: any) => void, setEmployeeToAdd: (val: boolean)=>void }) => {
    const { role, currentUser, invoices, employees, sales, workLogs, company, updateEmployeeSelf } = useCompany();
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isPremiumInfoModalOpen, setIsPremiumInfoModalOpen] = useState(false);
    const [phone, setPhone] = useState(currentUser?.phone || '');

    const handleAddEmployeeClick = () => {
        if (!company.isPremium && employees.length >= 3) {
            setEmployeeToAdd(true); // Signal to show limit modal
        } else {
            setActiveTab('employees');
            setEmployeeToAdd(true); // Signal to open add modal directly
        }
    };
  
    if (role === UserRole.EMPLOYER) {
        const { income, costs, totalSalaries, profit } = useMemo(() => {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const income = invoices.filter(inv => inv.type === 'income' && inv.status === 'paid' && new Date(inv.issueDate).getMonth() === currentMonth && new Date(inv.issueDate).getFullYear() === currentYear).reduce((acc, inv) => acc + inv.amount, 0);
            const costs = invoices.filter(inv => inv.type === 'expense' && new Date(inv.issueDate).getMonth() === currentMonth && new Date(inv.issueDate).getFullYear() === currentYear).reduce((acc, inv) => acc + inv.amount, 0);
            
            const totalSalaries = employees.reduce((acc, emp) => {
                const employeeHours = workLogs.filter(log => log.employeeId === emp.id && new Date(log.date).getMonth() === currentMonth && new Date(log.date).getFullYear() === currentYear).reduce((sum, log) => sum + calculateDuration(log.startTime, log.endTime), 0);
                const gross = employeeHours * emp.hourlyRate;
                return acc + gross;
            }, 0);

            const profit = income - costs - totalSalaries;
            return { income, costs, totalSalaries, profit };
        }, [invoices, employees, workLogs]);

      return (
          <div className="space-y-6">
              <h1 className="text-3xl font-bold">Pulpit</h1>
              {!company.isPremium && <AdBanner />}
              <Card>
                  <div className="flex items-start mb-4">
                      <div className="bg-slate-800 p-3 rounded-lg mr-4"><DollarIcon /></div>
                      <div>
                          <h2 className="text-xl font-bold text-white">Rentowność Firmy</h2>
                          <p className="text-sm text-slate-400">Podsumowanie tego miesiąca.</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <p className="text-xs text-slate-400 mb-1">Przychód</p>
                          <p className="text-xl font-bold text-green-400">{income.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</p>
                      </div>
                      <div>
                          <p className="text-xs text-slate-400 mb-1">Koszty i pensje</p>
                          <p className="text-xl font-bold text-red-400">{(costs + totalSalaries).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</p>
                      </div>
                      <div className="col-span-2">
                          <p className="text-xs text-slate-400 mb-1">Szacowany zysk</p>
                          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{profit.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</p>
                      </div>
                  </div>
              </Card>
               <Card>
                  <h2 className="text-xl font-bold text-white mb-4">Szybkie akcje</h2>
                  <div className="grid grid-cols-2 gap-4">
                      <Button variant="secondary" onClick={() => setActiveTab('invoices')}>Dodaj fakturę</Button>
                      <Button variant="secondary" onClick={handleAddEmployeeClick}>Dodaj pracownika</Button>
                      <Button variant="secondary" className="col-span-2" onClick={() => setActiveView({view: 'calendar'})}>Zobacz kalendarz</Button>
                  </div>
               </Card>
          </div>
      );
    }

    // Employee Dashboard
    if (!currentUser) return null;
    const { netSalary, bonusAmount, grossSalaryFromHours } = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const hoursWorked = workLogs.filter(log => log.employeeId === currentUser.id && new Date(log.date).getMonth() === currentMonth && new Date(log.date).getFullYear() === currentYear).reduce((sum, log) => sum + calculateDuration(log.startTime, log.endTime), 0);
        const grossSalaryFromHours = hoursWorked * currentUser.hourlyRate;

        let bonusAmount = 0;
        if (company.details.enableSalesBonuses && currentUser.bonusType && currentUser.bonusType !== BonusType.NONE) {
            const monthlySales = sales.filter(s => s.employeeId === currentUser.id && new Date(s.date).getMonth() === currentMonth && new Date(s.date).getFullYear() === currentYear);
            if (currentUser.bonusType === BonusType.PERCENTAGE) {
                const totalSalesAmount = monthlySales.reduce((sum, s) => sum + s.amount, 0);
                bonusAmount = totalSalesAmount * ((currentUser.bonusValue || 0) / 100);
            } else if (currentUser.bonusType === BonusType.FIXED) {
                bonusAmount = monthlySales.length * (currentUser.bonusValue || 0);
            }
        }
    
        const salaryBreakdown = calculateNetSalary(grossSalaryFromHours, currentUser, bonusAmount);
        return { ...salaryBreakdown, bonusAmount, grossSalaryFromHours };
    }, [workLogs, sales, currentUser, company.details.enableSalesBonuses]);
    
    const handleEditProfileClick = () => {
        if (!company.isPremium) {
            setIsPremiumInfoModalOpen(true);
        } else {
            setPhone(currentUser.phone);
            setIsEditProfileModalOpen(true);
        }
    };
    
    const handleProfileSave = () => {
        updateEmployeeSelf({ phone });
        setIsEditProfileModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Witaj, {currentUser.name.split(' ')[0]}!</h1>
            <Card>
                <h2 className="text-xl font-semibold mb-4">Twoje Wynagrodzenie</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Podstawa (za godziny):</span>
                        <span>{grossSalaryFromHours.toFixed(2)} PLN</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Premia za wyniki:</span>
                        <span className="text-green-400">+{bonusAmount.toFixed(2)} PLN</span>
                    </div>
                </div>
                <div className="border-t border-slate-700 my-3"></div>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-lg">Szacowane Netto:</span>
                    <span className="text-2xl font-bold text-blue-400">{netSalary.toFixed(2)} PLN</span>
                </div>
            </Card>

            {company.isPremium && currentUser.payslips.length > 0 && (
                <Card>
                    <h2 className="text-xl font-semibold mb-2">Historia Wypłat</h2>
                    <ul className="space-y-2">
                        {currentUser.payslips.slice(0, 3).map(p => (
                            <li key={p.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded">
                                <div>
                                    <span className="font-semibold">{p.month} {p.year}</span>
                                    <p className="text-xs text-slate-400">Brutto: {p.grossAmount.toFixed(2)} PLN</p>
                                </div>
                                <span className="text-blue-400 font-bold">{p.netAmount.toFixed(2)} PLN</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            <Card>
                <h2 className="text-xl font-semibold mb-2">Mój Profil</h2>
                <p className="text-sm text-slate-400 mb-1">Email: {currentUser.email}</p>
                <p className="text-sm text-slate-400 mb-3">Telefon: {currentUser.phone}</p>
                <Button variant="secondary" onClick={handleEditProfileClick}>
                    Edytuj dane kontaktowe
                </Button>
            </Card>

            <Modal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} title="Edytuj profil">
                <div className="space-y-4">
                    <Input label="Numer telefonu" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <Button onClick={handleProfileSave} className="w-full">Zapisz</Button>
                </div>
            </Modal>
            
            <Modal isOpen={isPremiumInfoModalOpen} onClose={() => setIsPremiumInfoModalOpen(false)} title="Funkcja Premium">
                 <div className="text-center space-y-4">
                    <PremiumIcon className="mx-auto h-12 w-12 text-blue-400" />
                    <p className="text-slate-300">
                        Ta funkcja jest dostępna w planie Premium.
                    </p>
                     <p className="text-sm text-slate-400">
                        Poproś pracodawcę o aktywację subskrypcji Premium, aby odblokować tę i inne możliwości.
                    </p>
                    <Button variant="secondary" onClick={() => setIsPremiumInfoModalOpen(false)}>OK</Button>
                </div>
            </Modal>
        </div>
    );
};

const EmployeeForm = ({ employee, onSave, onCancel }: { employee: Employee | Omit<Employee, 'id' | 'password' | 'avatarUrl' | 'payslips' | 'bonusType' | 'bonusValue'>, onSave: (emp: any) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState(employee);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }
    
    return (
         <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Imię i Nazwisko" type="text" placeholder="Jan Kowalski" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            <Input label="Stanowisko" type="text" placeholder="Specjalista ds. Sprzedaży" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} required />
            <Input label="Email" type="email" placeholder="jan@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            <Input label="Telefon" type="tel" placeholder="123-456-789" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
            <Input label="Stawka godzinowa (brutto)" type="number" step="0.01" placeholder="50.00" value={formData.hourlyRate || ''} onChange={e => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })} required />
            <Input label="Wiek" type="number" placeholder="25" value={formData.age || ''} onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })} required />
            <Select label="Rodzaj umowy" value={formData.contractType} onChange={e => setFormData({ ...formData, contractType: e.target.value as ContractType })}>
                <option value={ContractType.UoP}>Umowa o Pracę</option>
                <option value={ContractType.UZ}>Umowa Zlecenie</option>
            </Select>
            <Checkbox label="Status studenta" checked={formData.isStudent} onChange={e => setFormData({ ...formData, isStudent: e.target.checked })} />
            <div className="flex justify-end gap-2 pt-2">
                <Button onClick={onCancel} variant="secondary">Anuluj</Button>
                <Button type="submit" className="flex-1">Zapisz</Button>
            </div>
        </form>
    );
};

const Employees = ({ setActiveView, setActiveTab, employeeToAdd, setEmployeeToAdd }: { setActiveView: (view: any) => void, setActiveTab: (tab: string) => void, employeeToAdd: boolean, setEmployeeToAdd: (val: boolean)=>void }) => {
    const { employees, addEmployee, updateEmployee, deleteEmployee, company } = useCompany();
    const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'delete' | 'rate' | null, data: Employee | null }>({ type: null, data: null });
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    
    const newEmployeeInitialState: Omit<Employee, 'id' | 'password' | 'avatarUrl' | 'payslips' | 'bonusType' | 'bonusValue'> = { name: '', position: '', hourlyRate: 0, email: '', phone: '', age: 0, isStudent: false, contractType: ContractType.UoP };

    useEffect(() => {
        if(employeeToAdd) {
             if (!company.isPremium && employees.length >= 3) {
                setIsLimitModalOpen(true);
            } else {
                setModalState({ type: 'add', data: null });
            }
            setEmployeeToAdd(false);
        }
    }, [employeeToAdd, company.isPremium, employees.length, setEmployeeToAdd]);

    const handleAddClick = () => {
        if (!company.isPremium && employees.length >= 3) {
            setIsLimitModalOpen(true);
        } else {
            setModalState({ type: 'add', data: null });
        }
    };
    
    const handleSave = (emp: Employee) => {
        if (modalState.type === 'add') {
            addEmployee(emp);
        } else if (modalState.type === 'edit' && modalState.data) {
            updateEmployee({ ...modalState.data, ...emp });
        }
        setModalState({ type: null, data: null });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Pracownicy</h1>
                <Button onClick={handleAddClick}>Dodaj</Button>
            </div>
            <div className="space-y-3">
                {employees.map(emp => (
                    <button key={emp.id} onClick={() => setActiveView({ view: 'employeeProfile', data: emp })} className="w-full text-left bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-blue-500 hover:bg-slate-800/50 transition-all duration-200">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                               <img src={emp.avatarUrl || `https://i.pravatar.cc/150?u=${emp.id}`} alt={emp.name} className="h-10 w-10 rounded-full" />
                                <div>
                                   <p className="font-bold">{emp.name}</p>
                                   <p className="text-sm text-slate-400">{emp.position}</p>
                                </div>
                            </div>
                           <p className="text-sm font-semibold text-blue-400">{emp.hourlyRate.toFixed(2)} PLN/h</p>
                        </div>
                    </button>
                ))}
            </div>

            <Modal isOpen={modalState.type === 'add' || modalState.type === 'edit'} onClose={() => setModalState({ type: null, data: null })} title={modalState.type === 'add' ? "Dodaj pracownika" : "Edytuj pracownika"}>
                <EmployeeForm employee={modalState.data || newEmployeeInitialState} onSave={handleSave} onCancel={() => setModalState({ type: null, data: null })} />
            </Modal>

            <Modal isOpen={isLimitModalOpen} onClose={() => setIsLimitModalOpen(false)} title="Osiągnięto limit pracowników">
                <div className="text-center space-y-4">
                    <p className="text-slate-300">W darmowym planie możesz zarządzać maksymalnie 3 pracownikami.</p>
                    <Button onClick={() => { setIsLimitModalOpen(false); setActiveTab('more'); }}>
                       <PremiumIcon className="h-5 w-5" /> Zobacz Subskrypcję
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

const EmployeeProfile = ({ employee, onBack }: { employee: Employee, onBack: () => void }) => {
    const { deleteEmployee, updateEmployee, sales, company } = useCompany();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [bonusType, setBonusType] = useState(employee.bonusType || BonusType.NONE);
    const [bonusValue, setBonusValue] = useState(String(employee.bonusValue || 0));

    const handleDelete = () => {
        deleteEmployee(employee.id);
        onBack();
    }

    const handleSave = (empData: any) => {
        updateEmployee({ ...employee, ...empData });
        setIsEditModalOpen(false);
    }
    
    const handleBonusSave = () => {
        updateEmployee({ ...employee, bonusType, bonusValue: Number(bonusValue) });
        alert("Ustawienia premii zapisane.");
    };

    const { monthlySalesAmount, monthlySalesCount } = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlySalesData = sales
            .filter(s => s.employeeId === employee.id && new Date(s.date).getMonth() === currentMonth && new Date(s.date).getFullYear() === currentYear);
        
        const amount = monthlySalesData.reduce((sum, s) => sum + s.amount, 0);
        return { monthlySalesAmount: amount, monthlySalesCount: monthlySalesData.length };
    }, [sales, employee.id]);

    const estimatedBonus = useMemo(() => {
        if (!company.details.enableSalesBonuses || !employee.bonusType || employee.bonusType === BonusType.NONE) {
            return 0;
        }
        if (employee.bonusType === BonusType.PERCENTAGE) {
            return monthlySalesAmount * ((employee.bonusValue || 0) / 100);
        }
        if (employee.bonusType === BonusType.FIXED) {
            return monthlySalesCount * (employee.bonusValue || 0);
        }
        return 0;
    }, [company.details.enableSalesBonuses, employee, monthlySalesAmount, monthlySalesCount]);


    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors"><BackIcon /></button>
                <h1 className="text-2xl font-bold">{employee.name}</h1>
                <div className="w-8"></div>
            </div>
            <div className="flex flex-col items-center">
                 <img src={employee.avatarUrl || `https://i.pravatar.cc/150?u=${employee.id}`} alt={employee.name} className="h-24 w-24 rounded-full border-4 border-slate-700 mb-4" />
                 <p className="text-lg text-slate-300">{employee.position}</p>
            </div>
            <div className="space-y-4 mt-6">
                <Card>
                    <h2 className="font-bold text-lg mb-2">Dane kontaktowe</h2>
                    <p className="text-sm text-slate-400">Email: <span className="text-slate-200">{employee.email}</span></p>
                    <p className="text-sm text-slate-400">Telefon: <span className="text-slate-200">{employee.phone}</span></p>
                </Card>
                 <Card>
                    <h2 className="font-bold text-lg mb-2">Warunki zatrudnienia</h2>
                    <p className="text-sm text-slate-400">Stawka: <span className="font-bold text-blue-400">{employee.hourlyRate.toFixed(2)} PLN/h</span></p>
                    <p className="text-sm text-slate-400">Umowa: <span className="text-slate-200">{employee.contractType}</span></p>
                    <p className="text-sm text-slate-400">Wiek: <span className="text-slate-200">{employee.age} lat</span></p>
                    <p className="text-sm text-slate-400">Status studenta: <span className="text-slate-200">{employee.isStudent ? 'Tak' : 'Nie'}</span></p>
                </Card>

                {company.details.enableSalesBonuses && (
                    <Card>
                        <h2 className="font-bold text-lg mb-4">Wyniki i Premia</h2>
                        <div className="space-y-2 mb-4">
                            <p className="text-sm text-slate-400">Wygenerowany przychód (ten miesiąc): <span className="font-bold text-white">{monthlySalesAmount.toFixed(2)} PLN</span></p>
                            <p className="text-sm text-slate-400">Szacowana premia: <span className="font-bold text-green-400">+{estimatedBonus.toFixed(2)} PLN</span></p>
                        </div>
                        <div className="border-t border-slate-800 my-4"></div>
                        <h3 className="font-bold text-md mb-4">Konfiguracja premii</h3>
                        <div className="space-y-4">
                            <Select label="Rodzaj premii" value={bonusType} onChange={e => setBonusType(e.target.value as BonusType)}>
                                <option value={BonusType.NONE}>Brak</option>
                                <option value={BonusType.PERCENTAGE}>Procent od sprzedaży</option>
                                <option value={BonusType.FIXED}>Stała kwota za sprzedaż</option>
                            </Select>
                            {bonusType !== BonusType.NONE && (
                                <Input 
                                    label={bonusType === BonusType.PERCENTAGE ? "Procent (%)" : "Kwota (PLN)"}
                                    type="number"
                                    step="0.01"
                                    value={bonusValue}
                                    onChange={e => setBonusValue(e.target.value)}
                                    placeholder={bonusType === BonusType.PERCENTAGE ? "np. 5" : "np. 40"}
                                />
                            )}
                            <Button onClick={handleBonusSave} className="w-full">Zapisz ustawienia premii</Button>
                        </div>
                    </Card>
                )}

                <div className="flex gap-2">
                    <Button onClick={() => setIsEditModalOpen(true)} className="flex-1">Edytuj</Button>
                    <Button onClick={() => setIsDeleteModalOpen(true)} variant="danger" className="flex-1">Usuń</Button>
                </div>
            </div>
             <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Potwierdź usunięcie">
                <p className="text-slate-300 mb-6">Czy na pewno chcesz usunąć pracownika {employee.name}?</p>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Anuluj</Button>
                    <Button variant="danger" onClick={handleDelete}>Usuń</Button>
                </div>
            </Modal>
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edytuj pracownika">
                <EmployeeForm employee={employee} onSave={handleSave} onCancel={() => setIsEditModalOpen(false)} />
            </Modal>
        </div>
    )
};

const PayrollView = () => {
    const { employees, workLogs, company, sales } = useCompany();
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    const payrollData = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return employees.map(emp => {
            const hoursWorked = workLogs
                .filter(log => log.employeeId === emp.id && new Date(log.date).getMonth() === currentMonth && new Date(log.date).getFullYear() === currentYear)
                .reduce((sum, log) => sum + calculateDuration(log.startTime, log.endTime), 0);
            const grossSalary = hoursWorked * emp.hourlyRate;

            let bonusAmount = 0;
            if (company.details.enableSalesBonuses && emp.bonusType && emp.bonusType !== BonusType.NONE) {
                const monthlySales = sales.filter(s => s.employeeId === emp.id && new Date(s.date).getMonth() === currentMonth && new Date(s.date).getFullYear() === currentYear);
                if (emp.bonusType === BonusType.PERCENTAGE) {
                    const totalSalesAmount = monthlySales.reduce((sum, s) => sum + s.amount, 0);
                    bonusAmount = totalSalesAmount * ((emp.bonusValue || 0) / 100);
                } else if (emp.bonusType === BonusType.FIXED) {
                    bonusAmount = monthlySales.length * (emp.bonusValue || 0);
                }
            }

            const { netSalary, totalGross } = calculateNetSalary(grossSalary, emp, bonusAmount);
            
            return {
                ...emp,
                grossSalary,
                bonusAmount,
                totalGross,
                netSalary,
                hoursWorked,
            };
        });
    }, [employees, workLogs, sales, company.details.enableSalesBonuses]);
    
    const totalGross = payrollData.reduce((sum, emp) => sum + emp.totalGross, 0);
    const totalNet = payrollData.reduce((sum, emp) => sum + emp.netSalary, 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Lista Płac</h1>
                <Button onClick={() => setIsSummaryModalOpen(true)} disabled={!company.isPremium}>
                    Generuj podsumowanie
                </Button>
            </div>
            {!company.isPremium && (
                <div className="text-sm text-center text-slate-400 mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-center gap-2">
                    <PremiumIcon className="h-5 w-5 text-blue-400" />
                    <span>Generowanie podsumowań to funkcja Premium.</span>
                </div>
            )}
            <div className="space-y-3">
                {payrollData.map(emp => (
                    <Card key={emp.id}>
                        <p className="font-bold">{emp.name}</p>
                        <p className="text-sm text-slate-400">{emp.position}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <p className="text-xs text-slate-500">Godziny</p>
                                <p>{emp.hoursWorked.toFixed(2)} h</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Premia</p>
                                <p className="font-semibold text-green-400">+{emp.bonusAmount.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Szac. Brutto (z premią)</p>
                                <p className="font-semibold">{emp.totalGross.toFixed(2)} PLN</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Szac. Netto</p>
                                <p className="font-bold text-blue-400">{emp.netSalary.toFixed(2)} PLN</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Podsumowanie Listy Płac">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Podsumowanie za bieżący miesiąc</h3>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Całkowite wynagrodzenie brutto:</span>
                        <span className="font-bold">{totalGross.toFixed(2)} PLN</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-slate-400">Całkowite wynagrodzenie netto:</span>
                        <span className="font-bold text-blue-400">{totalNet.toFixed(2)} PLN</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Liczba pracowników:</span>
                        <span className="font-bold">{employees.length}</span>
                    </div>
                    <Button onClick={() => alert('Raport wygenerowany!')} className="w-full">Pobierz jako PDF</Button>
                </div>
            </Modal>
        </div>
    );
};

const InvoiceForm = ({ invoice, onSave, onCancel }: { invoice: Invoice | Omit<Invoice, 'id'>, onSave: (inv: any) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState(invoice);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }
    
    return (
         <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Numer faktury" type="text" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} required />
            <Input label="Kwota" type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} required />
            <Input label="Data wystawienia" type="date" value={formData.issueDate.split('T')[0]} onChange={e => setFormData({ ...formData, issueDate: e.target.value })} required />
            <Select label="Status" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'paid' | 'unpaid' })}>
                <option value="unpaid">Do zapłaty</option>
                <option value="paid">Opłacona</option>
            </Select>
            <Select label="Typ" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}>
                <option value="income">Przychód</option>
                <option value="expense">Koszt</option>
            </Select>
            <div className="flex justify-end gap-2 pt-2">
                <Button onClick={onCancel} variant="secondary">Anuluj</Button>
                <Button type="submit" className="flex-1">Zapisz</Button>
            </div>
        </form>
    );
};


const Invoices = () => {
    const { invoices, addInvoice, updateInvoice } = useCompany();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

    const newInvoiceInitial: Omit<Invoice, 'id'> = { number: '', amount: 0, type: 'income', issueDate: new Date().toISOString().split('T')[0], paymentTerms: 14, status: 'unpaid' };
    
    const handleSave = (inv: Invoice | Omit<Invoice, 'id'>) => {
        if ('id' in inv && inv.id) {
            updateInvoice(inv as Invoice);
        } else {
            addInvoice(inv as Omit<Invoice, 'id'>);
        }
        setIsAddModalOpen(false);
        setEditingInvoice(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Faktury</h1>
                <Button onClick={() => setIsAddModalOpen(true)}>Dodaj</Button>
            </div>
             <div className="space-y-3">
                {invoices.map(inv => (
                    <button key={inv.id} onClick={() => setEditingInvoice(inv)} className="w-full text-left group">
                        <Card className="flex justify-between items-center group-hover:border-blue-500 group-hover:bg-slate-800/50 transition-colors">
                            <div>
                                <p className="font-bold">{inv.number}</p>
                                <p className={`text-sm font-semibold ${inv.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{inv.amount.toFixed(2)} PLN</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${inv.status === 'paid' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                {inv.status === 'paid' ? 'Opłacona' : 'Do zapłaty'}
                            </span>
                        </Card>
                    </button>
                ))}
            </div>
            
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Dodaj nową fakturę">
                <InvoiceForm invoice={newInvoiceInitial} onSave={handleSave} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            <Modal isOpen={!!editingInvoice} onClose={() => setEditingInvoice(null)} title="Edytuj fakturę">
                {editingInvoice && <InvoiceForm invoice={editingInvoice} onSave={handleSave} onCancel={() => setEditingInvoice(null)} />}
            </Modal>
        </div>
    );
};

const CalendarView = () => {
    const { role, company, currentUser, absenceRequests, calendarEvents, addAbsenceRequest, updateAbsenceRequestStatus } = useCompany();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isPremiumInfoModalOpen, setIsPremiumInfoModalOpen] = useState(false);
    const [newRequest, setNewRequest] = useState({ reason: '', date: new Date().toISOString().split('T')[0] });

    const handleRequestAbsenceClick = () => {
        if (!company.isPremium) {
            setIsPremiumInfoModalOpen(true);
        } else {
            setIsRequestModalOpen(true);
        }
    };
    
    const handleRequestSubmit = () => {
        if (currentUser && newRequest.reason && newRequest.date) {
            addAbsenceRequest({
                employeeId: currentUser.id,
                reason: newRequest.reason,
                date: newRequest.date
            });
            setIsRequestModalOpen(false);
            setNewRequest({ reason: '', date: new Date().toISOString().split('T')[0] });
        }
    };

    const upcomingEvents = [...calendarEvents, ...absenceRequests.filter(r => r.status === AbsenceRequestStatus.APPROVED)]
        .filter(e => new Date(e.date) >= new Date())
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
    
    const pendingRequests = absenceRequests.filter(r => r.status === AbsenceRequestStatus.PENDING);

    return (
         <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Kalendarz</h1>
                 {role === UserRole.EMPLOYEE && (
                    <Button onClick={handleRequestAbsenceClick}>Złóż wniosek</Button>
                )}
            </div>
            
            {role === UserRole.EMPLOYER && pendingRequests.length > 0 && (
                <Card className="mb-6">
                    <h2 className="text-xl font-bold mb-4">Wnioski do rozpatrzenia</h2>
                    <div className="space-y-3">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="p-3 bg-slate-800/50 rounded-lg">
                                <p className="font-semibold">{req.employeeName}</p>
                                <p className="text-sm text-slate-300">{req.reason} - {new Date(req.date).toLocaleDateString('pl-PL')}</p>
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button onClick={() => updateAbsenceRequestStatus(req.id, AbsenceRequestStatus.REJECTED)} variant="danger" className="px-2 py-1 text-xs">Odrzuć</Button>
                                    <Button onClick={() => updateAbsenceRequestStatus(req.id, AbsenceRequestStatus.APPROVED)} variant="primary" className="px-2 py-1 text-xs">Akceptuj</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card>
                <h2 className="text-xl font-bold mb-4">Nadchodzące wydarzenia</h2>
                <div className="space-y-3">
                    {upcomingEvents.map(event => (
                        <div key={('title' in event ? 'ev' : 'req') + event.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                             <div className="flex-shrink-0 text-center bg-slate-900 rounded p-2 w-14">
                                <p className="font-bold text-lg leading-none">{new Date(event.date).getDate()}</p>
                                <p className="text-xs text-slate-400 leading-none">{new Date(event.date).toLocaleString('pl-PL', { month: 'short' })}</p>
                             </div>
                             <div>
                                <p className="font-semibold">{'title' in event ? event.title : event.reason}</p>
                                {'employeeName' in event && <p className="text-sm text-slate-400">{event.employeeName}</p>}
                             </div>
                        </div>
                    ))}
                    {upcomingEvents.length === 0 && <p className="text-slate-400 text-center py-4">Brak nadchodzących wydarzeń.</p>}
                </div>
            </Card>

            <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Wniosek o nieobecność">
                 <div className="space-y-4">
                    <Input label="Data" type="date" value={newRequest.date} onChange={e => setNewRequest({...newRequest, date: e.target.value})} />
                    <Input label="Powód" type="text" value={newRequest.reason} onChange={e => setNewRequest({...newRequest, reason: e.target.value})} placeholder="np. Urlop na żądanie"/>
                    <Button onClick={handleRequestSubmit} className="w-full">Wyślij wniosek</Button>
                 </div>
            </Modal>
            
            <Modal isOpen={isPremiumInfoModalOpen} onClose={() => setIsPremiumInfoModalOpen(false)} title="Funkcja Premium">
                 <div className="text-center space-y-4">
                    <PremiumIcon className="mx-auto h-12 w-12 text-blue-400" />
                    <p className="text-slate-300">
                        Składanie wniosków jest dostępne w planie Premium.
                    </p>
                    <p className="text-sm text-slate-400">
                        Poproś pracodawcę o aktywację subskrypcji.
                    </p>
                    <Button variant="secondary" onClick={() => setIsPremiumInfoModalOpen(false)}>OK</Button>
                </div>
            </Modal>
        </div>
    );
};

const WorkLogView = () => {
    const { currentUser, workLogs } = useCompany();
    const myLogs = workLogs.filter(l => l.employeeId === currentUser?.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    
    return (
         <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Godziny Pracy</h1>
                <Button>Dodaj</Button>
            </div>
            <Card>
                <h2 className="text-xl font-semibold mb-4">Ostatnie wpisy</h2>
                <ul className="space-y-2">
                    {myLogs.map(l => (
                        <li key={l.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded">
                            <div>
                                <span className="font-semibold">{new Date(l.date).toLocaleDateString('pl-PL', { weekday: 'short', month: 'long', day: 'numeric' })}</span>
                                <span className="text-slate-400 ml-3 text-sm">{l.startTime} - {l.endTime}</span>
                            </div>
                            <span className="font-bold text-blue-400">{calculateDuration(l.startTime, l.endTime).toFixed(2)} h</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    )
};

const MyPerformance = () => {
    const { currentUser, sales } = useCompany();
    const mySales = sales.filter(s => s.employeeId === currentUser?.id);
    const totalSales = mySales.reduce((sum, s) => sum + s.amount, 0);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Moja Sprzedaż</h1>
            <Card>
                <h2 className="text-xl font-semibold mb-2">Podsumowanie</h2>
                <p className="text-slate-400">Sprzedaż w tym miesiącu:</p>
                <p className="text-3xl font-bold text-blue-400">{totalSales.toFixed(2)} PLN</p>
            </Card>
        </div>
    );
};

const CompanySettingsView = ({ setActiveView } : { setActiveView: (view: any) => void}) => {
    const { company, updateCompanyDetails } = useCompany();
    const [details, setDetails] = useState<CompanyDetails>(company.details);

    const handleSave = () => {
        updateCompanyDetails(details);
        alert('Dane firmy zaktualizowane!');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Ustawienia Firmy</h1>
            <Card className="space-y-4">
                <Input label="Nazwa Firmy" value={details.companyName} onChange={(e) => setDetails({...details, companyName: e.target.value})} />
                <Input label="NIP" value={details.nip} onChange={(e) => setDetails({...details, nip: e.target.value})} />
                <Input label="Adres" value={details.address} onChange={(e) => setDetails({...details, address: e.target.value})} />
                <div>
                    <Input
                        label="URL Logo Firmy"
                        value={details.logoUrl || ''}
                        onChange={(e) => setDetails({ ...details, logoUrl: e.target.value })}
                        disabled={!company.isPremium}
                        placeholder="https://example.com/logo.png"
                    />
                    {!company.isPremium && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                           <PremiumIcon className="h-4 w-4 text-blue-400" /> Dostępne w planie Premium.
                        </p>
                    )}
                </div>
                <div className="border-t border-slate-800 my-2"></div>
                <h2 className="font-bold text-lg pt-2">Funkcje</h2>
                <Checkbox 
                    label="Aktywuj premie za wyniki sprzedaży"
                    checked={details.enableSalesBonuses || false}
                    onChange={(e) => setDetails({...details, enableSalesBonuses: e.target.checked})}
                />
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={() => setActiveView({view: 'more'})}>Anuluj</Button>
                    <Button onClick={handleSave}>Zapisz</Button>
                </div>
            </Card>
        </div>
    )
};

const SubscriptionView = () => {
    const { company, upgradeToPremium, employees } = useCompany();
    const [selectedEmployeeCount, setSelectedEmployeeCount] = useState(employees.length);

    const freeSlots = 3;
    const pricePerEmployee = 7;
    const paidEmployees = Math.max(0, selectedEmployeeCount - freeSlots);
    const premiumCost = paidEmployees * pricePerEmployee;

    return (
         <div className="space-y-6">
            <h1 className="text-3xl font-bold">Przejdź na Premium</h1>
            <Card>
                {company.isPremium ? (
                    <div className="text-center">
                        <PremiumIcon className="mx-auto h-16 w-16 text-green-400" />
                        <h2 className="text-2xl font-bold mt-4">Korzystasz z planu Premium!</h2>
                        <p className="text-slate-400 mt-2">Dziękujemy za zaufanie.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Odblokuj pełne możliwości</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Liczba pracowników (łącznie)</label>
                            <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-md">
                                <button onClick={() => setSelectedEmployeeCount(Math.max(employees.length, selectedEmployeeCount - 1))} className="px-3 py-1 bg-slate-700 rounded">-</button>
                                <input 
                                    type="number" 
                                    value={selectedEmployeeCount}
                                    onChange={(e) => setSelectedEmployeeCount(Math.max(employees.length, parseInt(e.target.value) || employees.length))}
                                    className="w-full bg-transparent text-center font-bold text-lg"
                                    min={employees.length}
                                />
                                <button onClick={() => setSelectedEmployeeCount(selectedEmployeeCount + 1)} className="px-3 py-1 bg-slate-700 rounded">+</button>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Pracownicy w planie darmowym:</span>
                                <span>{freeSlots}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Pracownicy w planie płatnym:</span>
                                <span>{paidEmployees} x {pricePerEmployee.toFixed(2)} PLN</span>
                            </div>
                            <div className="border-t border-slate-700"></div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-lg">Miesięczny koszt:</span>
                                <span className="text-3xl font-bold text-blue-400">{premiumCost.toFixed(2)} PLN</span>
                            </div>
                        </div>
                        <Button onClick={upgradeToPremium} className="w-full">
                            <PremiumIcon className="h-5 w-5" /> Przejdź na Premium i zapłać
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    )
};

const MoreView = ({ setActiveView }: { setActiveView: (view: any) => void }) => {
    const options = [
        { id: 'subscription', label: 'Przejdź na Premium', icon: <PremiumIcon /> },
        { id: 'settings', label: 'Ustawienia Firmy', icon: <SettingsIcon /> },
    ];
    return (
         <div>
            <h1 className="text-3xl font-bold mb-6">Więcej</h1>
            <div className="space-y-3">
                {options.map(opt => (
                    <button key={opt.id} onClick={() => setActiveView({view: opt.id})} className="group w-full bg-slate-900 border border-slate-800 rounded-lg p-4 text-left hover:border-blue-500 flex justify-between items-center">
                        <div className="flex items-center gap-4">{opt.icon}<p className="font-semibold">{opt.label}</p></div>
                        <ArrowRightIcon />
                    </button>
                ))}
            </div>
        </div>
    )
};


// --- Main Layout ---
const BottomNavBar = ({ activeTab, setActiveTab, navItems }: { activeTab: string, setActiveTab: (tab: string) => void, navItems: any[] }) => (
    <nav className="bg-slate-900 border-t border-slate-800 p-2 flex justify-around">
        {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center w-full p-2 rounded-md transition-colors ${activeTab === item.id ? 'text-blue-400' : 'text-slate-400 hover:bg-slate-700'}`}>
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
            </button>
        ))}
    </nav>
);

const NotificationsPopover = ({ notifications, onMarkAsRead, onClose }: { notifications: Notification[], onMarkAsRead: (id: number) => void, onClose: () => void }) => {
    return (
        <div className="absolute top-12 right-0 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-20 animate-fade-in text-sm">
            <div className="p-3 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-bold">Powiadomienia</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-slate-800 flex items-start gap-3 ${!n.isRead ? 'bg-blue-500/10' : ''}`}>
                            {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>}
                            <div className={`flex-1 ${n.isRead ? 'pl-5' : ''}`}>
                                <p className="text-slate-200">{n.message}</p>
                                <p className="text-xs text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString('pl-PL')}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-400 text-center p-6">Brak nowych powiadomień.</p>
                )}
            </div>
        </div>
    );
};

const MainApp = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeView, setActiveView] = useState<{view: string, data: Employee | null}>({ view: 'dashboard', data: null });
  const [employeeToAdd, setEmployeeToAdd] = useState(false);
  const { role, currentUser, company, employees, notifications, markNotificationAsRead } = useCompany();
  const contentKey = useRef(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  useEffect(() => {
    setActiveView({ view: activeTab, data: null });
    contentKey.current += 1;
  }, [activeTab]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsRef]);
  
  const currentProfileEmployee = useMemo(() => {
    if (activeView.view === 'employeeProfile' && activeView.data?.id) {
        return employees.find(e => e.id === activeView.data.id);
    }
    return activeView.data;
  }, [activeView, employees]);
  
  const employerNav = [
    { id: 'dashboard', label: 'Pulpit', icon: <PulpitIcon /> },
    { id: 'employees', label: 'Zespół', icon: <EmployeesIcon /> },
    { id: 'payroll', label: 'Płace', icon: <PayrollIcon /> },
    { id: 'invoices', label: 'Faktury', icon: <InvoicesIcon /> },
    { id: 'more', label: 'Więcej', icon: <MoreIcon /> },
  ];

  const employeeNav = [
    { id: 'dashboard', label: 'Pulpit', icon: <PulpitIcon /> },
    { id: 'hours', label: 'Godziny', icon: <ClockIcon /> },
    { id: 'performance', label: 'Sprzedaż', icon: <SalesIcon /> },
    { id: 'calendar', label: 'Kalendarz', icon: <CalendarIcon /> },
  ];
  
  const renderContent = () => {
      switch (activeView.view) {
          case 'dashboard': return <Dashboard setActiveTab={setActiveTab} setActiveView={setActiveView} setEmployeeToAdd={setEmployeeToAdd} />;
          case 'employees': return <Employees setActiveView={setActiveView} setActiveTab={setActiveTab} employeeToAdd={employeeToAdd} setEmployeeToAdd={setEmployeeToAdd} />;
          case 'employeeProfile': return currentProfileEmployee ? <EmployeeProfile employee={currentProfileEmployee} onBack={() => setActiveView({ view: 'employees', data: null })} /> : <Employees setActiveView={setActiveView} setActiveTab={setActiveTab} employeeToAdd={employeeToAdd} setEmployeeToAdd={setEmployeeToAdd} />;
          case 'payroll': return <PayrollView />;
          case 'invoices': return <Invoices />;
          case 'calendar': return <CalendarView />;
          case 'performance': return <MyPerformance />;
          case 'hours': return <WorkLogView />;
          case 'more': return <MoreView setActiveView={setActiveView} />;
          case 'settings': return <CompanySettingsView setActiveView={setActiveView}/>;
          case 'subscription': return <SubscriptionView />;
          default: return <Dashboard setActiveTab={setActiveTab} setActiveView={setActiveView} setEmployeeToAdd={setEmployeeToAdd} />;
      }
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-slate-950 border-x border-slate-800/50">
        <header className="bg-slate-950/80 backdrop-blur-sm p-4 border-b border-slate-800/50 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-3">
                {company.isPremium && company.details.logoUrl ? (
                    <img src={company.details.logoUrl} alt={`${company.details.companyName} logo`} className="h-9 w-auto object-contain" />
                ) : (
                    <>
                        <LogoIcon />
                        <span className="text-xl font-bold text-white">{company.details.companyName}</span>
                    </>
                )}
            </div>
             <div className="flex items-center gap-3">
                 <div className="relative" ref={notificationsRef}>
                    <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors relative">
                        <BellIcon/>
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-blue-500 border-2 border-slate-950 text-xs font-bold flex items-center justify-center text-white"></span>
                        )}
                    </button>
                    {isNotificationsOpen && <NotificationsPopover notifications={notifications} onMarkAsRead={markNotificationAsRead} onClose={() => setIsNotificationsOpen(false)} />}
                 </div>
                 <button onClick={onLogout} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"><LogoutIcon/></button>
                 <img src={currentUser?.avatarUrl || `https://i.pravatar.cc/40?u=${currentUser?.id || 'employer'}`} alt="User Avatar" className="rounded-full w-9 h-9 border-2 border-slate-700" />
             </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div key={contentKey.current} className="animate-fade-in">
                {renderContent()}
            </div>
        </main>
        <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} navItems={role === UserRole.EMPLOYER ? employerNav : employeeNav} />
    </div>
  );
};


const LoginScreen = ({ onLogin, onNavigateRegister }: { onLogin: (role: UserRole, email: string, remember: boolean) => void, onNavigateRegister: () => void }) => {
    const { setRole, employees, setCurrentUser } = useCompany();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (email.toLowerCase() === 'employer@demo.com' && password === 'password123') {
            setRole(UserRole.EMPLOYER);
            setCurrentUser(null);
            onLogin(UserRole.EMPLOYER, email, rememberMe);
            return;
        }

        const employee = employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());
        if (employee && employee.password === password) {
            setRole(UserRole.EMPLOYEE);
            setCurrentUser(employee);
            onLogin(UserRole.EMPLOYEE, employee.email, rememberMe);
            return;
        }

        setError('Nieprawidłowy email lub hasło.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-sm">
                 <div className="flex items-center justify-center space-x-3 mb-6">
                    <LogoIcon />
                    <span className="text-2xl font-bold text-white">Worklio</span>
                </div>
                <h1 className="text-xl font-bold text-center mb-6">Zaloguj się</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required label="Email" />
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required label="Hasło" />
                    <Checkbox label="Zapamiętaj mnie" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <Button type="submit" className="w-full !mt-6">Zaloguj</Button>
                </form>
                <p className="text-center text-sm text-slate-400 mt-6">
                    Nie masz konta?{' '}
                    <button onClick={onNavigateRegister} className="font-semibold text-blue-400 hover:text-blue-300">
                        Zarejestruj się
                    </button>
                </p>
            </Card>
        </div>
    );
};

const RegisterScreen = ({ onRegisterSuccess, onNavigateLogin }: { onRegisterSuccess: (email: string) => void, onNavigateLogin: () => void }) => {
    const [step, setStep] = useState<'select' | 'employer'>('select');
    const { registerEmployer } = useCompany();
    
    // Employer form state
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegisterEmployer = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!companyName || !email || !password) {
            setError('Wszystkie pola są wymagane.');
            return;
        }
        registerEmployer({ companyName, email, password });
        onRegisterSuccess(email);
    };
    
    if (step === 'select') {
        return (
             <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <Card className="w-full max-w-sm">
                    <h1 className="text-xl font-bold text-center mb-6">Dołącz do Worklio</h1>
                    <div className="space-y-4">
                        <button onClick={() => setStep('employer')} className="w-full text-left bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition-colors duration-200 flex items-center gap-4">
                            <BriefcaseIcon />
                            <div>
                                <h2 className="font-bold">Jestem Pracodawcą</h2>
                                <p className="text-sm text-slate-400">Zarządzaj zespołem, finansami i grafikiem.</p>
                            </div>
                        </button>
                        <div className="w-full text-left bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center gap-4 opacity-70">
                             <UserIcon />
                            <div>
                                <h2 className="font-bold">Jestem Pracownikiem</h2>
                                <p className="text-sm text-slate-400">Dołącz do firmy poprzez zaproszenie.</p>
                            </div>
                        </div>
                    </div>
                     <p className="text-center text-sm text-slate-400 mt-6">
                        Masz już konto?{' '}
                        <button onClick={onNavigateLogin} className="font-semibold text-blue-400 hover:text-blue-300">
                            Zaloguj się
                        </button>
                    </p>
                </Card>
            </div>
        )
    }
    
    if (step === 'employer') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                 <Card className="w-full max-w-sm">
                    <button onClick={() => setStep('select')} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>
                        Powrót
                    </button>
                    <h1 className="text-xl font-bold text-center mb-6">Utwórz konto firmowe</h1>
                    <form onSubmit={handleRegisterEmployer} className="space-y-4">
                        <Input label="Nazwa Firmy" type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Moja Firma Sp. z o.o." required />
                        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="kontakt@twojafirma.pl" required />
                        <Input label="Hasło" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <Button type="submit" className="w-full !mt-6">Zarejestruj się</Button>
                    </form>
                </Card>
            </div>
        )
    }

    return null;
}

const AppContent = () => {
    const [viewMode, setViewMode] = useState<'login' | 'register' | 'app'>('login');
    const [isLoading, setIsLoading] = useState(true);
    const { setRole, setCurrentUser, employees, company, setCompany } = useCompany();

    useEffect(() => {
        try {
            const savedSession = localStorage.getItem('bizflow_session');
            if (savedSession) {
                const session = JSON.parse(savedSession);
                if (session.role === UserRole.EMPLOYER) {
                    setRole(UserRole.EMPLOYER);
                    setCurrentUser(null);
                    // Also load company data if it was saved
                    const savedCompany = localStorage.getItem('bizflow_company');
                    if(savedCompany) setCompany(JSON.parse(savedCompany));

                    setViewMode('app');
                } else if (session.role === UserRole.EMPLOYEE && session.email) {
                    const employee = employees.find(e => e.email.toLowerCase() === session.email.toLowerCase());
                    if (employee) {
                        setRole(UserRole.EMPLOYEE);
                        setCurrentUser(employee);
                        setViewMode('app');
                    } else {
                        setViewMode('login'); // Employee not found, force login
                    }
                } else {
                     setViewMode('login');
                }
            } else {
                 setViewMode('login');
            }
        } catch (e) {
            console.error("Failed to parse session", e);
            setViewMode('login');
            localStorage.clear();
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('bizflow_session');
        localStorage.removeItem('bizflow_company'); // Clear company data on logout
        setRole(UserRole.EMPLOYER);
        setCurrentUser(null);
        setViewMode('login');
        window.location.reload(); // To reset to initial state
    };

    const handleLoginSuccess = (role: UserRole, email: string, remember: boolean) => {
        if (remember) {
            const session = { role, email };
            localStorage.setItem('bizflow_session', JSON.stringify(session));
            if(role === UserRole.EMPLOYER) {
                 localStorage.setItem('bizflow_company', JSON.stringify(company));
            }
        } else {
            localStorage.removeItem('bizflow_session');
            localStorage.removeItem('bizflow_company');
        }
        setViewMode('app');
    };
    
    const handleRegisterSuccess = (email: string) => {
         const session = { role: UserRole.EMPLOYER, email };
         localStorage.setItem('bizflow_session', JSON.stringify(session));
         localStorage.setItem('bizflow_company', JSON.stringify(company));
         setViewMode('app');
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-950"></div>; // Loading view
    }
  
    switch (viewMode) {
        case 'login':
            return <LoginScreen onLogin={handleLoginSuccess} onNavigateRegister={() => setViewMode('register')} />;
        case 'register':
            return <RegisterScreen onRegisterSuccess={handleRegisterSuccess} onNavigateLogin={() => setViewMode('login')} />;
        case 'app':
            return <MainApp onLogout={handleLogout} />;
        default:
            return <LoginScreen onLogin={handleLoginSuccess} onNavigateRegister={() => setViewMode('register')} />;
    }
}


export default function App() {
  return (
    <CompanyProvider>
      <AppContent />
    </CompanyProvider>
  );
}
