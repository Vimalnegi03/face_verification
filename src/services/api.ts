// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.protocol === 'https:' ? 'https://localhost:5001' : 'http://localhost:8000/api');

export const api = {
  // Health check endpoint
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  // Employee management endpoints
  async getEmployees() {
    const response = await fetch(`${API_BASE_URL}/employees`);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    return response.json();
  },

  async addEmployee(employee: { name: string; employee_id: string }) {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
    if (!response.ok) {
      throw new Error('Failed to add employee');
    }
    return response.json();
  },

  async deleteEmployee(employeeId: string) {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete employee');
    }
    return response.json();
  },

  // Attendance endpoints
  async getAttendanceRecords() {
    const response = await fetch(`${API_BASE_URL}/attendance`);
    if (!response.ok) {
      throw new Error('Failed to fetch attendance records');
    }
    return response.json();
  },

  async recordAttendance(data: { employee_id: string; image_data: string }) {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to record attendance');
    }
    return response.json();
  },
};