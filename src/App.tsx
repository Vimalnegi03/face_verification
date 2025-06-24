import React, { useState } from 'react';
import { Camera, Users, Clock, BarChart3, User, CheckCircle, XCircle, UserPlus, User2Icon, Menu, X } from 'lucide-react';
import CameraCapture from './components/CameraCapture';
import EmployeeList from './components/EmployeeList';
import AttendanceRecords from './components/AttendanceRecords';
import Dashboard from './components/Dashboard';
import EmployeeRegistration from './components/EmployeeRegistration';
import Login from './components/Login';
import { Navigate } from 'react-router-dom';

export type Employee = {
  id: string;
  name: string;
  department: string;
  email: string;
  avatar: string;
  isPresent: boolean;
  lastSeen?: Date;
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  timestamp: Date;
  type: 'check-in' | 'check-out';
  confidence: number;
};

function App() {
  const [activeTab, setActiveTab] = useState('camera');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'John Smith',
      department: 'Engineering',
      email: 'john.smith@company.com',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isPresent: false
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      department: 'Marketing',
      email: 'sarah.johnson@company.com',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isPresent: true,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Michael Chen',
      department: 'Design',
      email: 'michael.chen@company.com',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isPresent: false
    },
    {
      id: '4',
      name: 'Emily Davis',
      department: 'HR',
      email: 'emily.davis@company.com',
      avatar: 'https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isPresent: true,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000)
    }
  ]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: '1',
      employeeId: '2',
      employeeName: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'check-in',
      confidence: 0.98
    },
    {
      id: '2',
      employeeId: '4',
      employeeName: 'Emily Davis',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'check-in',
      confidence: 0.95
    }
  ]);

  const handleAttendanceMarked = (employee: Employee, type: 'check-in' | 'check-out') => {
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId: employee.id,
      employeeName: employee.name,
      timestamp: new Date(),
      type,
      confidence: Math.random() * 0.05 + 0.95 // Random confidence between 0.95-1.0
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);
    
    setEmployees(prev => prev.map(emp => 
      emp.id === employee.id 
        ? { ...emp, isPresent: type === 'check-in', lastSeen: new Date() }
        : emp
    ));
  };

  const tabs = [
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'employees', label: 'Students', icon: Users },
    { id: 'register', label: 'Register', icon: UserPlus },
    { id: 'records', label: 'Records', icon: Clock },
    { id: 'profile', label: 'Login', icon: User2Icon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">FaceAttend</h1>
                <p className="text-sm text-slate-500 hidden sm:block">Students Attendance</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {employees.filter(e => e.isPresent).length} Present
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">
                  {employees.filter(e => !e.isPresent).length} Absent
                </span>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-900 focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden grid grid-cols-2 gap-2 py-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile status indicators */}
        <div className="md:hidden flex justify-between mb-4">
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {employees.filter(e => e.isPresent).length} Present
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              {employees.filter(e => !e.isPresent).length} Absent
            </span>
          </div>
        </div>

        {activeTab === 'register' && (
          <EmployeeRegistration />
        )}
        {activeTab === 'camera' && (
          <CameraCapture 
            employee={employees[0]} 
            onAttendanceMarked={(type) => handleAttendanceMarked(employees[0], type)} 
          />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard 
            employees={employees} 
            attendanceRecords={attendanceRecords}
          />
        )}
        {activeTab === 'employees' && (
          <EmployeeList employees={employees} />
        )}
        {activeTab === 'records' && (
          <AttendanceRecords records={attendanceRecords} />
        )}
        {activeTab === 'profile' && <Navigate to="/login" replace />}
      </main>
    </div>
  );
}

export default App;