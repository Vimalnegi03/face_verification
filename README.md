# Face Recognition Attendance System with DeepFace

A modern, production-ready face recognition attendance system built with React frontend and Python DeepFace backend.

## Features

- **Real Face Recognition**: Uses DeepFace library for accurate face recognition
- **Live Camera Feed**: Real-time camera integration using Web APIs
- **Employee Management**: Add, view, and manage employee profiles
- **Attendance Tracking**: Automatic check-in/check-out with timestamps
- **Dashboard Analytics**: Real-time attendance statistics and reports
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for development server

### Backend
- Python Flask API
- DeepFace for face recognition
- OpenCV for image processing
- TensorFlow backend for ML models

## Setup Instructions

### 1. Frontend Setup

```bash
# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Or run the setup script
python3 setup.py

# Start the Flask server
python3 app.py
```

The backend API will be available at `http://localhost:8000`

## Required Python Packages

```
flask==2.3.3
flask-cors==4.0.0
deepface==0.0.79
opencv-python==4.8.1.78
tensorflow==2.13.0
numpy==1.24.3
Pillow==10.0.1
```

## API Endpoints

### Employee Management
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Add new employee with face image

### Face Recognition
- `POST /api/recognize` - Recognize face using DeepFace

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance` - Get attendance records

### Health Check
- `GET /api/health` - Check backend status

## How It Works

1. **Employee Registration**: Add employees with their photos through the web interface
2. **Face Recognition**: DeepFace analyzes facial features and creates embeddings
3. **Real-time Recognition**: Camera captures live video, processes frames with DeepFace
4. **Attendance Marking**: Successful recognition triggers automatic attendance logging
5. **Dashboard**: View real-time statistics and attendance reports

## DeepFace Models

The system uses VGG-Face model by default, but supports multiple models:
- VGG-Face
- Facenet
- OpenFace
- DeepFace
- DeepID
- ArcFace

## Security Features

- Face verification with confidence thresholds
- Secure image storage
- CORS protection
- Input validation and sanitization

## File Structure

```
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/          # API service layer
│   └── ...
├── backend/               # Python backend
│   ├── app.py            # Flask application
│   ├── employee_images/  # Stored employee photos
│   ├── data/             # JSON databases
│   └── requirements.txt  # Python dependencies
└── README.md
```

## Usage

1. Start both frontend and backend servers
2. Navigate to the web interface
3. Add employees with their photos in the "Employees" tab
4. Use the "Camera" tab for face recognition and attendance marking
5. View statistics and reports in the "Dashboard" tab
6. Check attendance history in the "Records" tab

## Troubleshooting

### Backend Connection Issues
- Ensure Python server is running on port 5000
- Check that all Python dependencies are installed
- Verify CORS settings if accessing from different domains

### Camera Access Issues
- Grant camera permissions in your browser
- Ensure camera is not being used by other applications
- Try refreshing the page if camera feed doesn't appear

### Face Recognition Issues
- Ensure good lighting conditions
- Position face clearly in the camera frame
- Make sure employee photos are clear and well-lit
- Check confidence threshold settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
