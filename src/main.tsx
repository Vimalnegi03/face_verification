import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import EmployeeRegistration from './components/EmployeeRegistration.tsx'; // Make sure to import your component
import './index.css';
import Login from './components/Login.tsx';
import { Camera } from 'lucide-react';
import CameraCapture from './components/CameraCapture.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<EmployeeRegistration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/camera" element={<CameraCapture employee={undefined} onAttendanceMarked={function (type: 'check-in' | 'check-out'): void {
          throw new Error('Function not implemented.');
        } }/>} />
        {/* Add more routes as needed */}
      </Routes>
     
    </BrowserRouter>
  </StrictMode>
);