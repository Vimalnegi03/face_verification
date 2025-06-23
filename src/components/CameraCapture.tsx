import  { useRef, useEffect, useState } from 'react';
import { Camera, Square, CheckCircle, AlertCircle } from 'lucide-react';
import { url } from '../url';
interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  avatar: string;
  isPresent: boolean;
  lastSeen?: Date;
  image_path?: string;
}

interface RecognitionResult {
  recognized: boolean;
  confidence?: number;
  employee?: Employee;
  message?: string;
}

interface CameraCaptureProps {
  employee: Employee;
  onAttendanceMarked: (type: 'check-in' | 'check-out') => void;
}

const API_BASE_URL = `${url}/api`;

export default function CameraCapture({ employee, onAttendanceMarked }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  console.log(employee||"hero");
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      setError(`Camera access denied: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current) {
      setError('Video element not available');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      stopCamera();
    } else {
      setError('Could not create canvas context');
    }
  };

  const recognizeFace = async (imageData: string): Promise<RecognitionResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData.split(',')[1] // Send base64 without data URL prefix
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Face recognition failed');
      }

      return await response.json();
    } catch (err) {
      console.error('Recognition error:', err);
      throw err;
    }
  };

  const recordAttendance = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Face Recognition
      const recognition = await recognizeFace(capturedImage);
      setRecognitionResult(recognition);

      if (!recognition.recognized || !recognition.employee) {
        throw new Error(recognition.message || 'Face not recognized');
      }

      // Step 2: Record Attendance
      const attendanceResponse = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: recognition.employee.id,
          type: 'check-in',
          confidence: recognition.confidence
        }),
        credentials: 'include'
      });

      if (!attendanceResponse.ok) {
        throw new Error('Failed to record attendance');
      }

      const attendanceData = await attendanceResponse.json();
      console.log('Attendance recorded:', attendanceData);

      // Step 3: Update UI
      onAttendanceMarked('check-in');
      setCapturedImage(null);
      setRecognitionResult(null);
      startCamera();

    } catch (err) {
      console.error('Attendance process error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Camera className="text-blue-500" />
        Face Recognition Attendance
      </h2>

      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-600" />
          {error}
        </div>
      )}

      {recognitionResult?.recognized && (
        <div className="p-3 mb-4 bg-green-50 text-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" />
            <span className="font-semibold">Verified: {recognitionResult.employee?.name}</span>
          </div>
          <div className="mt-1">
            Confidence: {Math.round((recognitionResult.confidence || 0) * 100)}%
          </div>
        </div>
      )}

      <div className="mb-4 bg-black rounded overflow-hidden aspect-video">
        {capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex gap-3 justify-center">
        {!capturedImage ? (
          isStreaming ? (
            <button
              onClick={captureImage}
              className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2"
              disabled={isProcessing}
            >
              <Square size={16} /> Capture
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
              disabled={isProcessing}
            >
              <Camera size={16} /> Start Camera
            </button>
          )
        ) : (
          <>
            <button
              onClick={() => {
                setCapturedImage(null);
                setRecognitionResult(null);
                setError(null);
                startCamera();
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded"
              disabled={isProcessing}
            >
              Retake
            </button>
            <button
              onClick={recordAttendance}
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin">↻</span> Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> Confirm
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}