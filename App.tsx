

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { CompanyProvider, useCompany } from './context/CompanyDataContext';
import { UserRole, Employee, AbsenceRequestStatus, Invoice, WorkLog, CalendarEvent, Notification, CompanyDetails, ContractType, Payslip, BonusType } from './types';
import { calculateNetSalary, SalaryBreakdown } from './services/payrollService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';


// --- UTILS ---
const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    if (end <= start) return 0;
    const diff = end.getTime() - start.getTime();
    return diff / (1000 * 60 * 60);
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pl-PL');
const formatCurrency = (amount: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount);
const classNames = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');


// --- SVG Icons ---
const LogoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>;
const PulpitIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path></svg>;
const CalendarIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"></path></svg>;
const UsersIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>;
const MoneyIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c2.1-.36 3.7-1.5 3.7-3.55 0-2.84-2.43-3.81-4.7-4.4z"></path></svg>;
const SettingsIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49-1c.23-.09.49 0 .61.22l2 3.46c.12.22.07.49-.12.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path></svg>;
const BellIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"></path></svg>;
const LogoutIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>;

// --- UI Components ---

const Card = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} className={`bg-slate-900 border border-slate-700/50 rounded-lg p-4 shadow-lg ${className}`}>
        {children}
    </div>
);

const Button = ({ children, variant = 'primary', className = '', ...props }: {
    children: React.ReactNode,
    variant?: 'primary' | 'secondary' | 'danger',
} & React.ComponentPropsWithoutRef<'button'>) => {
    const baseClasses = 'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors duration-200';
    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    };
    return <button {...props} className={classNames(baseClasses, variantClasses[variant], className)}>{children}</button>;
};

const Input = (props: React.ComponentPropsWithoutRef<'input'>) => (
    <input {...props} className={classNames("w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500", props.className)} />
);

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select {...props} className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
    {children}
  </select>
);


const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-md m-4 border border-slate-700">
                <div className="flex justify-between items-center p-4 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-slate-100">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};


// --- Screens ---

const Dashboard = () => {
    const { invoices, employees, workLogs, absenceRequests } = useCompany();

    const financialSummary = useMemo(() => {
        const income = invoices.filter(i => i.type === 'income' && i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
        const expenses = invoices.filter(i => i.type === 'expense').reduce((acc, i) => acc + i.amount, 0);
        const unpaid = invoices.filter(i => i.status === 'unpaid').reduce((acc, i) => acc + i.amount, 0);
        return { income, expenses, balance: income - expenses, unpaid };
    }, [invoices]);

    const workHoursData = useMemo(() => {
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      return last7Days.map(date => {
        const totalHours = workLogs
          .filter(log => log.date === date)
          .reduce((acc, log) => acc + calculateDuration(log.startTime, log.endTime), 0);
        return { date: new Date(date).toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' }), hours: totalHours.toFixed(1) };
      });
    }, [workLogs]);


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Pulpit</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="animate-fade-in">
                    <h3 className="text-slate-400">Przychód (opłacone)</h3>
                    <p className="text-3xl font-bold text-green-400">{formatCurrency(financialSummary.income)}</p>
                </Card>
                <Card className="animate-fade-in" style={{ animationDelay: '50ms' }}>
                    <h3 className="text-slate-400">Wydatki</h3>
                    <p className="text-3xl font-bold text-red-400">{formatCurrency(financialSummary.expenses)}</p>
                </Card>
                <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <h3 className="text-slate-400">Saldo</h3>
                    <p className="text-3xl font-bold">{formatCurrency(financialSummary.balance)}</p>
                </Card>
                <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
                    <h3 className="text-slate-400">Liczba pracowników</h3>
                    <p className="text-3xl font-bold">{employees.length}</p>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <h3 className="font-semibold mb-4">Godziny pracy w zespole (ostatnie 7 dni)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={workHoursData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                            <Legend />
                            <Bar dataKey="hours" fill="#3b82f6" name="Godziny"/>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="animate-fade-in" style={{ animationDelay: '250ms' }}>
                    <h3 className="font-semibold mb-4">Oczekujące wnioski urlopowe</h3>
                     <ul className="space-y-3">
                        {absenceRequests.filter(r => r.status === AbsenceRequestStatus.PENDING).map(req => (
                            <li key={req.id} className="flex justify-between items-center p-2 bg-slate-800 rounded">
                                <div>
                                    <p className="font-medium">{req.employeeName}</p>
                                    <p className="text-sm text-slate-400">{formatDate(req.date)} - {req.reason}</p>
                                </div>
                                <div className="flex gap-2">
                                     <Button variant="secondary" className="px-2 py-1 text-xs">Odrzuć</Button>
                                     <Button className="px-2 py-1 text-xs">Akceptuj</Button>
                                </div>
                            </li>
                        ))}
                         {absenceRequests.filter(r => r.status === AbsenceRequestStatus.PENDING).length === 0 && (
                            <p className="text-slate-400 text-center py-4">Brak oczekujących wniosków.</p>
                         )}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

const EmployeeDashboard = () => {
    const { currentUser, workLogs, addWorkLog } = useCompany();
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleAddWorkLog = () => {
        if (currentUser && date && startTime && endTime) {
            const success = addWorkLog({ employeeId: currentUser.id, date, startTime, endTime });
            if (success) {
                alert('Dodano czas pracy!');
                setStartTime('');
                setEndTime('');
            } else {
                alert('Dla tego dnia istnieje już wpis.');
            }
        }
    };

    const myWorkLogs = useMemo(() => {
        if (!currentUser) return [];
        return workLogs.filter(log => log.employeeId === currentUser.id).slice(0, 5);
    }, [workLogs, currentUser]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Witaj, {currentUser?.name}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="font-semibold mb-4">Zarejestruj czas pracy</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Data</label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Start</label>
                                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Koniec</label>
                                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                            </div>
                        </div>
                        <Button onClick={handleAddWorkLog} className="w-full">Dodaj wpis</Button>
                    </div>
                </Card>
                <Card>
                    <h3 className="font-semibold mb-4">Ostatnie wpisy</h3>
                    <ul className="space-y-2">
                        {myWorkLogs.map(log => (
                            <li key={log.id} className="flex justify-between p-2 bg-slate-800 rounded">
                                <span>{formatDate(log.date)}</span>
                                <span>{log.startTime} - {log.endTime}</span>
                                <span className="font-semibold">{calculateDuration(log.startTime, log.endTime).toFixed(2)}h</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};


const EmployeesScreen = () => {
    const { employees, addEmployee, updateEmployee, deleteEmployee } = useCompany();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const openAddModal = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const openEditModal = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleSave = (employeeData: Omit<Employee, 'id'| 'payslips'>) => {
        if (editingEmployee) {
            updateEmployee({ ...editingEmployee, ...employeeData });
        } else {
            addEmployee(employeeData as Omit<Employee, 'id' | 'payslips' | 'bonusType' | 'bonusValue'>);
        }
        setIsModalOpen(false);
    };

    const EmployeeForm = ({ employee, onSave, onCancel }: { employee: Partial<Employee> | null, onSave: (data: any) => void, onCancel: () => void }) => {
        const [formData, setFormData] = useState({
            name: employee?.name || '',
            position: employee?.position || '',
            hourlyRate: employee?.hourlyRate || 0,
            email: employee?.email || '',
            phone: employee?.phone || '',
            age: employee?.age || 0,
            isStudent: employee?.isStudent || false,
            contractType: employee?.contractType || ContractType.UoP,
        });

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            const isCheckbox = type === 'checkbox';
            setFormData(prev => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(formData);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="name" placeholder="Imię i nazwisko" value={formData.name} onChange={handleChange} required />
                <Input name="position" placeholder="Stanowisko" value={formData.position} onChange={handleChange} required />
                <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <Input name="phone" placeholder="Telefon" value={formData.phone} onChange={handleChange} />
                <Input name="hourlyRate" type="number" placeholder="Stawka godzinowa" value={formData.hourlyRate} onChange={handleChange} required />
                <Input name="age" type="number" placeholder="Wiek" value={formData.age} onChange={handleChange} required />
                 <Select name="contractType" value={formData.contractType} onChange={handleChange}>
                    <option value={ContractType.UoP}>Umowa o Pracę</option>
                    <option value={ContractType.UZ}>Umowa Zlecenie</option>
                </Select>
                <div className="flex items-center">
                    <input type="checkbox" id="isStudent" name="isStudent" checked={formData.isStudent} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="isStudent" className="ml-2 block text-sm text-slate-300">Student poniżej 26 r.ż.</label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onCancel}>Anuluj</Button>
                    <Button type="submit">Zapisz</Button>
                </div>
            </form>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Pracownicy</h1>
                <Button onClick={openAddModal}>Dodaj pracownika</Button>
            </div>
            <Card>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-700 text-slate-400">
                            <th className="p-3">Pracownik</th>
                            <th className="p-3">Stanowisko</th>
                            <th className="p-3">Kontakt</th>
                            <th className="p-3">Stawka</th>
                            <th className="p-3">Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                <td className="p-3 font-medium">{emp.name}</td>
                                <td className="p-3">{emp.position}</td>
                                <td className="p-3">{emp.email}</td>
                                <td className="p-3">{formatCurrency(emp.hourlyRate)}/h</td>
                                <td className="p-3">
                                    <div className="flex gap-2">
                                        <Button onClick={() => openEditModal(emp)} variant="secondary" className="text-xs px-2 py-1">Edytuj</Button>
                                        <Button onClick={() => deleteEmployee(emp.id)} variant="danger" className="text-xs px-2 py-1">Usuń</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmployee ? "Edytuj pracownika" : "Dodaj pracownika"}>
                <EmployeeForm employee={editingEmployee} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

// --- Main App Components ---

const navItems = [
    { name: 'Pulpit', icon: PulpitIcon, role: UserRole.EMPLOYER },
    { name: 'Pracownicy', icon: UsersIcon, role: UserRole.EMPLOYER },
    { name: 'Finanse', icon: MoneyIcon, role: UserRole.EMPLOYER },
    { name: 'Grafik', icon: CalendarIcon, role: UserRole.EMPLOYER },
    { name: 'Pulpit', icon: PulpitIcon, role: UserRole.EMPLOYEE },
    { name: 'Moje finanse', icon: MoneyIcon, role: UserRole.EMPLOYEE },
    { name: 'Mój grafik', icon: CalendarIcon, role: UserRole.EMPLOYEE },
];

const MainLayout = () => {
    const { role, currentUser, setCurrentUser, setRole } = useCompany();
    const [activeView, setActiveView] = useState('Pulpit');

    const handleLogout = () => {
        setCurrentUser(null);
        setRole(UserRole.EMPLOYER);
    };

    const userNavItems = navItems.filter(item => item.role === role);

    const renderView = () => {
        if (role === UserRole.EMPLOYEE) {
            switch (activeView) {
                case 'Pulpit': return <EmployeeDashboard />;
                default: return <EmployeeDashboard />;
            }
        }

        switch (activeView) {
            case 'Pulpit': return <Dashboard />;
            case 'Pracownicy': return <EmployeesScreen />;
            // Add other employer screens here
            default: return <Dashboard />;
        }
    };


    return (
        <div className="flex h-screen bg-slate-950 text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 flex flex-col p-4 border-r border-slate-800">
                <div className="flex items-center gap-3 mb-8">
                    <LogoIcon />
                    <span className="text-xl font-bold">BizFlow</span>
                </div>
                <nav className="flex-1 space-y-2">
                    {userNavItems.map(item => (
                        <a key={item.name} href="#"
                           onClick={(e) => { e.preventDefault(); setActiveView(item.name); }}
                           className={classNames(
                               'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                               activeView === item.name ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                           )}>
                            <item.icon />
                            <span>{item.name}</span>
                        </a>
                    ))}
                </nav>
                <div className="mt-auto">
                     <div className="p-3 rounded-lg bg-slate-800">
                        <div className="flex items-center gap-3">
                            <img src={currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}`} alt="avatar" className="h-10 w-10 rounded-full" />
                            <div>
                                <p className="font-semibold text-sm">{currentUser?.name}</p>
                                <p className="text-xs text-slate-400">{currentUser?.position}</p>
                            </div>
                        </div>
                    </div>
                     <a href="#" onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 mt-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
                        <LogoutIcon />
                        <span>Wyloguj</span>
                    </a>
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};

const LoginScreen = () => {
    const { employees, setCurrentUser, setRole } = useCompany();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e?: React.FormEvent, loginEmail = email, loginPassword = password) => {
        e?.preventDefault();
        setError('');

        if (loginEmail === 'employer@demo.com' && loginPassword === 'password123') {
            setRole(UserRole.EMPLOYER);
            setCurrentUser({
                id: 0, name: 'Adam Szef', position: 'Właściciel', email: 'employer@demo.com',
                hourlyRate: 0, phone: '', age: 40, isStudent: false, contractType: ContractType.UoP,
                payslips: [], avatarUrl: 'https://i.pravatar.cc/150?u=employer'
            });
            return;
        }

        const employee = employees.find(emp => emp.email === loginEmail && emp.password === loginPassword);
        if (employee) {
            setRole(UserRole.EMPLOYEE);
            setCurrentUser(employee);
        } else {
            setError('Nieprawidłowy email lub hasło.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 rounded-lg shadow-lg border border-slate-700/50 animate-fade-in">
                <div className="flex flex-col items-center">
                    <LogoIcon />
                    <h1 className="text-2xl font-bold mt-2">Zaloguj się do BizFlow</h1>
                    <p className="text-slate-400">Zarządzaj swoją firmą w jednym miejscu.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-300">Email</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300">Hasło</label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full">Zaloguj się</Button>
                </form>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-700"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-400">Lub</span></div>
                </div>
                 <div className="flex gap-2">
                    <Button onClick={() => handleLogin(undefined, 'employer@demo.com', 'password123')} variant="secondary" className="w-full">Wypróbuj jako Pracodawca</Button>
                    <Button onClick={() => handleLogin(undefined, 'employee@demo.com', 'password123')} variant="secondary" className="w-full">Wypróbuj jako Pracownik</Button>
                </div>
            </div>
        </div>
    );
};

function MainApp() {
    const { currentUser } = useCompany();
    if (!currentUser) {
        return <LoginScreen />;
    }
    return <MainLayout />;
}

export default function App() {
    return (
        <CompanyProvider>
            <MainApp />
        </CompanyProvider>
    );
}