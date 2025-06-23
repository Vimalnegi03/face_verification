import React, { useState, useEffect } from 'react';
import { Clock, Download, Calendar, CheckCircle, XCircle, Search } from 'lucide-react';
import { url } from '../url';
interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  type: 'check-in' | 'check-out';
  timestamp: string;  // ISO string from backend
  confidence: number;
}

const AttendanceRecords: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'check-in' | 'check-out'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${url}/api/attendance`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch attendance records');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, []);

  const getDateRange = (filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week':
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: weekStart, end: now };
      case 'month':
        const monthStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start: monthStart, end: now };
      default:
        return null;
    }
  };

  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.timestamp);
    const matchesSearch = record.employee_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    
    const dateRange = getDateRange(dateFilter);
    const matchesDate = !dateRange || 
      (recordDate >= dateRange.start && recordDate <= dateRange.end);
    
    return matchesSearch && matchesType && matchesDate;
  });

  const exportRecords = () => {
    const csvContent = [
      ['Employee Name', 'Type', 'Date', 'Time', 'Confidence'],
      ...filteredRecords.map(record => {
        const recordDate = new Date(record.timestamp);
        return [
          record.employee_name,
          record.type,
          recordDate.toLocaleDateString(),
          recordDate.toLocaleTimeString(),
          `${(record.confidence * 100).toFixed(1)}%`
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <span>Attendance Records</span>
          </h2>
          <button
            onClick={exportRecords}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            disabled={filteredRecords.length === 0}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="check-in">Check In</option>
            <option value="check-out">Check Out</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto">
        {filteredRecords.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredRecords.map((record) => {
                const recordDate = new Date(record.timestamp);
                return (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {record.employee_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        record.type === 'check-in'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {record.type === 'check-in' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Check In</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Check Out</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {recordDate.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-slate-500">
                        {recordDate.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${record.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600">
                          {(record.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No records found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || filterType !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters to see more records.'
                : 'No attendance records have been recorded yet.'}
            </p>
            {(searchTerm || filterType !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setDateFilter('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredRecords.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Showing {filteredRecords.length} of {records.length} records
            </span>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceRecords;