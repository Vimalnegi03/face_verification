import React from 'react';
import { Users, Clock, TrendingUp, Calendar, CheckCircle, XCircle } from 'lucide-react';
import type { Employee, AttendanceRecord } from '../App';

interface DashboardProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ employees, attendanceRecords }) => {
  const presentEmployees = employees.filter(e => e.isPresent);
  const absentEmployees = employees.filter(e => !e.isPresent);
  const attendanceRate = (presentEmployees.length / employees.length) * 100;
  
  const todayRecords = attendanceRecords.filter(record => {
    const today = new Date();
    const recordDate = new Date(record.timestamp);
    return recordDate.toDateString() === today.toDateString();
  });

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Present Today',
      value: presentEmployees.length,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Absent Today',
      value: absentEmployees.length,
      icon: XCircle,
      color: 'bg-red-500'
    },
    {
      title: 'Attendance Rate',
      value: `${attendanceRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Recent Activity</span>
            </h3>
            <span className="text-sm text-slate-500">{todayRecords.length} records today</span>
          </div>
          
          <div className="space-y-4">
            {todayRecords.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  record.type === 'check-in' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{record.employeeName}</p>
                  <p className="text-sm text-slate-600">
                    {record.type === 'check-in' ? 'Checked in' : 'Checked out'} at{' '}
                    {record.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {(record.confidence * 100).toFixed(1)}%
                </span>
              </div>
            ))}
            
            {todayRecords.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No activity recorded today</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Current Status</span>
            </h3>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Present Employees */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-green-700 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Present ({presentEmployees.length})</span>
                </h4>
              </div>
              <div className="space-y-2">
                {presentEmployees.slice(0, 3).map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                    <img
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{employee.name}</p>
                      <p className="text-xs text-slate-600">{employee.department}</p>
                    </div>
                    {employee.lastSeen && (
                      <span className="text-xs text-green-600">
                        {employee.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                ))}
                {presentEmployees.length > 3 && (
                  <p className="text-xs text-slate-500 text-center">
                    +{presentEmployees.length - 3} more present
                  </p>
                )}
              </div>
            </div>

            {/* Absent Employees */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-red-700 flex items-center space-x-2">
                  <XCircle className="w-4 h-4" />
                  <span>Absent ({absentEmployees.length})</span>
                </h4>
              </div>
              <div className="space-y-2">
                {absentEmployees.slice(0, 3).map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                    <img
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-8 h-8 rounded-full object-cover opacity-60"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{employee.name}</p>
                      <p className="text-xs text-slate-600">{employee.department}</p>
                    </div>
                  </div>
                ))}
                {absentEmployees.length > 3 && (
                  <p className="text-xs text-slate-500 text-center">
                    +{absentEmployees.length - 3} more absent
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;