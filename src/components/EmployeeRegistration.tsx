import React, { useRef, useState } from 'react';
import { CheckCircle, AlertCircle, UserPlus, Upload, X } from 'lucide-react';
import { url } from '../url';
interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  image_paths?: string[];
}

interface RegistrationResult {
  success: boolean;
  employee?: Employee;
  message?: string;
}

const API_BASE_URL = `${url}/api`;

export default function EmployeeRegistration() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
  const [employee, setEmployee] = useState({
    name: '',
    department: '',
    email: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    
    if (!files || files.length === 0) return;

    if (selectedImages.length >= 3) {
      setError('You can only upload 3 images');
      return;
    }

    const file = files[0]; // Only take the first file
    if (!file.type.match('image.*')) {
      setError('Please select only image files');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImages(prev => [...prev, event.target?.result as string]);
      }
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset to allow selecting same files again
      fileInputRef.current.click();
    }
  };

  const registerEmployee = async () => {
    if (!employee.name || !employee.department || !employee.email) {
      setError('Please fill all fields');
      return;
    }

    if (selectedImages.length !== 3) {
      setError('Please upload exactly 3 images');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', employee.name);
      formData.append('department', employee.department);
      formData.append('email', employee.email);

      // Convert data URLs to blobs and add to FormData
      selectedImages.forEach((img, index) => {
        const blob = dataURLtoBlob(img);
        formData.append('images', blob, `${employee.name.replace(/\s+/g, '_')}_${index}.jpg`);
      });

      const response = await fetch(`${API_BASE_URL}/register_employee`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const result = await response.json();
      setRegistrationResult(result);

      if (result.success) {
        // Reset form after successful registration
        setEmployee({ name: '', department: '', email: '' });
        setSelectedImages([]);
      }

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <UserPlus className="text-blue-500" />
       Student Registration
      </h2>

      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-600" />
          {error}
        </div>
      )}

      {registrationResult?.success && (
        <div className="p-3 mb-4 bg-green-50 text-green-800 rounded-lg flex items-center gap-2">
          <CheckCircle className="text-green-600" />
          <span className="font-semibold">Student registered successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={employee.name}
            onChange={(e) => setEmployee({...employee, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ITI</label>
          <input
            type="text"
            value={employee.department}
            onChange={(e) => setEmployee({...employee, department: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="ITI Tehri"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={employee.email}
            onChange={(e) => setEmployee({...employee, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="john.doe@example.com"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Upload Face Images (3 required)
        </h3>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="grid grid-cols-3 gap-2 mb-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="relative border-2 border-dashed border-gray-300 rounded-lg aspect-square">
              {selectedImages[index] ? (
                <>
                  <img 
                    src={selectedImages[index]} 
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button
                  onClick={triggerFileInput}
                  className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  <Upload size={24} />
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center">
          {selectedImages.length}/3 images uploaded
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        {selectedImages.length > 0 && (
          <button
            onClick={() => {
              setSelectedImages([]);
              setError(null);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded"
            disabled={isProcessing}
          >
            Clear All Images
          </button>
        )}
        
        <button
          onClick={registerEmployee}
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
          disabled={isProcessing || selectedImages.length !== 3}
        >
          {isProcessing ? (
            <>
              <span className="animate-spin">↻</span> Registering...
            </>
          ) : (
            <>
              <UserPlus size={16} /> Register Student
            </>
          )}
        </button>
      </div>
    </div>
  );
}