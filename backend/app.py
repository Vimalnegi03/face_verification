from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
from deepface import DeepFace
import os
import json
from datetime import datetime
import uuid
from werkzeug.utils import secure_filename
import pymysql
import requests
import jwt
from functools import wraps
app = Flask(__name__)
CORS(app, supports_credentials=True,
     origins=["https://face-verification-1-xy37.onrender.com"])

# Create directories for storing employee images and data
os.makedirs('backend/employee_images', exist_ok=True)
os.makedirs('backend/data', exist_ok=True)

# Employee database file
EMPLOYEES_DB = 'backend/data/employees.json'
ATTENDANCE_DB = 'backend/data/attendance.json'

SECRET_KEY = "your-secret-key-here"



def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        print(request.cookies)
        # Get token from cookies
        token = request.cookies.get('auth_token')
        print(f"Token received: {token}")
        
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Authentication token is missing'
            }), 401
            
        try:
            # Decode the token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token has expired'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid token'
            }), 401
        except Exception as e:
            return jsonify({
                'success': False,
                'message': str(e)
            }), 401
            
        return f(current_user_id, *args, **kwargs)
        
    return decorated

def get_db_connection():
    return pymysql.connect(
    host='mt-uat-lighthouse.cal82oikkybf.ap-south-1.rds.amazonaws.com',
    user='FaceRecongition',
    password='password@123',
    db='FaceRecognition',
    cursorclass=pymysql.cursors.DictCursor
)

def load_employees():
    """Load employees from JSON file"""
    if os.path.exists(EMPLOYEES_DB):
        with open(EMPLOYEES_DB, 'r') as f:
            return json.load(f)
    return []

def save_employees(employees):
    """Save employees to JSON file"""
    with open(EMPLOYEES_DB, 'w') as f:
        json.dump(employees, f, indent=2)

def load_attendance():
    """Load attendance records from JSON file"""
    if os.path.exists(ATTENDANCE_DB):
        with open(ATTENDANCE_DB, 'r') as f:
            return json.load(f)
    return []

def save_attendance(attendance):
    """Save attendance records to JSON file"""
    with open(ATTENDANCE_DB, 'w') as f:
        json.dump(attendance, f, indent=2, default=str)

def base64_to_image(base64_string):
    """Convert base64 string to OpenCV image"""
    # Remove data URL prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Decode base64 to bytes
    img_bytes = base64.b64decode(base64_string)
    
    # Convert bytes to numpy array
    nparr = np.frombuffer(img_bytes, np.uint8)
    
    # Decode image
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

# Add this to your Flask app
from flask import request, jsonify
import jwt
from datetime import datetime, timedelta

# Secret key for JWT (keep this secure in production)




@app.route('/api/employees', methods=['GET'])
def get_employees():
    """Get all employees from the MySQL database"""
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM Employee")
            employees = cursor.fetchall()
        conn.close()
        print(employees)
        return jsonify(employees), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/employees', methods=['POST'])
def add_employee():
    """Add a new employee with face image"""
    try:
        data = request.json
        name = data.get('name')
        department = data.get('department')
        email = data.get('email')
        image_base64 = data.get('image')
        
        if not all([name, department, email, image_base64]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Generate unique ID
        employee_id = str(uuid.uuid4())
        
        # Convert base64 image to OpenCV format
        img = base64_to_image(image_base64)
        
        # Save employee image
        image_path = f'backend/employee_images/{employee_id}.jpg'
        cv2.imwrite(image_path, img)
        
        # Create employee record
        employee = {
            'id': employee_id,
            'name': name,
            'department': department,
            'email': email,
            'image_path': image_path,
            'isPresent': False,
            'created_at': datetime.now().isoformat()
        }
        
        # Load existing employees and add new one
        employees = load_employees()
        employees.append(employee)
        save_employees(employees)
        
        return jsonify({'message': 'Employee added successfully', 'employee': employee})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

from flask import make_response
from datetime import datetime, timedelta

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM Employee WHERE email = %s", (email,))
            user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 401
            
        # Create JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'email': user['email'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, SECRET_KEY, algorithm='HS256')
        print(f"Generated token for user {user['id']}: {token}")
        # Create response with user data
        response = make_response(jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name']
            }
        }))

        # Set HttpOnly, Secure cookie
        response.set_cookie(
            'auth_token',
            value=token,
            httponly=True,
            max_age=86400  # 24 hours in seconds
        )
        
        return response
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500




@app.route('/api/recognize', methods=['POST'])
@token_required
def recognize_face(current_user_id):
    """Recognize face using stored embeddings (protected route)"""
    try:
        print(f"Recognizing face for user: {current_user_id}")
        data = request.json
        image_base64 = data.get('image')
        
        if not image_base64:
            return jsonify({'error': 'No image provided'}), 400
        
        # Convert base64 to image
        try:
            # Handle data URL (if present)
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            # Decode base64 string
            img_bytes = base64.b64decode(image_base64)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                raise ValueError("Failed to decode image")
                
            print("Successfully converted base64 to image")
        except Exception as e:
            print(f"Image conversion error: {str(e)}")
            return jsonify({'error': f'Image processing failed: {str(e)}'}), 400
        
        # Save temporary image for embedding extraction
        temp_dir = 'backend/temp'
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, 'temp_capture.jpg')
        cv2.imwrite(temp_path, img)
        
        if not os.path.exists(temp_path):
            raise ValueError("Failed to save temporary image")
        
        print(f"Temporary image saved to {temp_path}")
        
        # Get current user's embedding from the database
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT id, name, department, email, face_embedding 
                FROM Employee 
                WHERE id = %s
            """, (current_user_id,))
            employee = cursor.fetchone()
        conn.close()

        if not employee:
            return jsonify({'error': 'Employee not found'}), 404

        if not employee['face_embedding']:
            return jsonify({'error': 'No face embedding registered for this employee'}), 400

        try:
            # Get embedding for the temp image
            # Use the same model that was used during registration
            temp_embedding = DeepFace.represent(
                img_path=temp_path,
                model_name='Facenet',  # Must match your registration model
                enforce_detection=True
            )[0]['embedding']
            
            # Load stored embedding
            stored_embedding = json.loads(employee['face_embedding'])
            
            # Calculate cosine distance
            distance = cosine_distance(temp_embedding, stored_embedding)
            confidence = 1 - distance
            
            print(f"Comparison with {employee['name']}: confidence={confidence:.2f}")
            
            # Clean up temporary file
            try:
                os.remove(temp_path)
            except:
                pass
            
            if confidence > 0.6:  # Confidence threshold (adjust as needed)
                print(f"Match found: {employee['name']} (confidence: {confidence:.2f})")
                return jsonify({
                    'recognized': True,
                    'employee': {
                        'id': employee['id'],
                        'name': employee['name'],
                        'department': employee['department'],
                        'email': employee['email']
                    },
                    'confidence': float(confidence)
                })
            else:
                print("No matching employee found")
                return jsonify({
                    'recognized': False,
                    'message': 'No matching employee found'
                })
                
        except Exception as e:
            print(f"Error in face recognition: {str(e)}")
            try:
                os.remove(temp_path)
            except:
                pass
            return jsonify({'error': f'Face recognition failed: {str(e)}'}), 500
            
    except Exception as e:
        print(f"Error in recognize_face: {str(e)}")
        return jsonify({'error': str(e)}), 500

def cosine_distance(vec1, vec2):
    """Calculate cosine distance between two vectors"""
    dot_product = sum(a*b for a, b in zip(vec1, vec2))
    norm_a = sum(a*a for a in vec1) ** 0.5
    norm_b = sum(b*b for b in vec2) ** 0.5
    return 1 - (dot_product / (norm_a * norm_b))
   

@app.route('/api/register_employee', methods=['POST'])
def register_employee():
    """Register a new employee with three face images"""
    try:
        # Check required fields
        name = request.form.get('name')
        department = request.form.get('department')
        email = request.form.get('email')

        if not all([name, department, email]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        # Validate images
        ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
        UPLOAD_FOLDER = 'backend/employee_images'
        
        # Get all uploaded files (now expecting a single 'images' field with multiple files)
        files = request.files.getlist('images')
        
        if len(files) != 3:
            return jsonify({'success': False, 'message': 'Exactly 3 images are required'}), 400

        for file in files:
            if not file or file.filename == "":
                return jsonify({'success': False, 'message': 'One or more image files are missing'}), 400
            if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in ALLOWED_EXTENSIONS:
                return jsonify({'success': False, 'message': 'Invalid file type. Only images are allowed'}), 400

        # Generate employee ID and folder
        employee_id = str(uuid.uuid4())
        employee_dir = os.path.join(UPLOAD_FOLDER, employee_id)
        os.makedirs(employee_dir, exist_ok=True)

        image_paths = []
        embeddings = []

        for i, file in enumerate(files, start=1):
            filename = secure_filename(f"{name.replace(' ', '_')}_{i}.jpg")
            filepath = os.path.join(employee_dir, filename)
            file.save(filepath)
            image_paths.append(filepath)

            try:
                result = DeepFace.represent(img_path=filepath, model_name='Facenet')[0]
                embeddings.append(result['embedding'])
            except Exception as e:
                # Clean up saved files if embedding fails
                for path in image_paths:
                    if os.path.exists(path):
                        os.remove(path)
                return jsonify({'success': False, 'message': f'Face processing failed: {str(e)}'}), 500

        # Average embeddings
        avg_embedding = [sum(col) / len(col) for col in zip(*embeddings)]
        embedding_json = json.dumps(avg_embedding)
        image = image_paths[0]
        # Save to DB
        conn = get_db_connection()
        with conn.cursor() as cursor:
            insert_query = """
                INSERT INTO Employee (id, name, department, email, image_path, registration_date, face_embedding)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (
                employee_id, 
                name, 
                department, 
                email, 
                image,  # Store all image paths as JSON array
                datetime.now(), 
                embedding_json
            ))
        conn.commit()
        conn.close()

        # Create employee record for response
        employee = {
            'id': employee_id,
            'name': name,
            'department': department,
            'email': email,
            'image_paths': image_paths,
            'registration_date': datetime.now().isoformat()
        }

        # Optionally store somewhere else
        save_employees(employee)

        return jsonify({
            'success': True,
            'employee': employee,
            'message': 'Employee registered successfully'
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Registration failed: {str(e)}'
        }), 500

@app.route('/api/attendance', methods=['POST'])
@token_required
def mark_attendance(current_user_id):
    """Mark attendance for the current authenticated user"""
    try:
        print(f"Marking attendance for user: {current_user_id}")
        data = request.json
        print(f"Received data: {data}")
        attendance_type = data.get('type')  # 'check-in' or 'check-out'
        confidence = data.get('confidence', 0.0)
        
        if not attendance_type:
            return jsonify({'error': 'Attendance type required'}), 400
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                # 1. Get employee details
                cursor.execute(
                    "SELECT id, name FROM Employee WHERE id = %s",
                    (current_user_id,)
                )
                employee = cursor.fetchone()
                
                if not employee:
                    return jsonify({'error': 'Employee not found'}), 404
                
                # 2. Insert attendance record
                attendance_id = str(uuid.uuid4())
                insert_query = """
                    INSERT INTO attendance 
                    (id, employee_id, employee_name, type, confidence, timestamp)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                cursor.execute(insert_query, (
                    attendance_id, 
                    current_user_id, 
                    employee['name'],
                    attendance_type,
                    confidence,
                    datetime.now()
                ))
                
                # 3. Get the created record
                cursor.execute(
                    "SELECT * FROM attendance WHERE id = %s",
                    (attendance_id,)
                )
                new_record = cursor.fetchone()
                
            conn.commit()
            
            return jsonify({
                'success': True,
                'message': 'Attendance marked successfully',
                'record': dict(new_record) if new_record else None
            })
            
        except Exception as e:
            conn.rollback()
            return jsonify({'error': f'Database error: {str(e)}'}), 500
        finally:
            conn.close()
            
    except Exception as e:
        print(f"Error marking attendance: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

        
@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    """Get all attendance records from the database"""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                # Query to fetch all attendance records
                cursor.execute("""
                    SELECT id, employee_id, employee_name, type, 
                           timestamp, confidence 
                    FROM attendance
                    ORDER BY timestamp DESC
                """)
                attendance_records = cursor.fetchall()
                
                # Convert rows to dictionaries
                records = [dict(record) for record in attendance_records]
                
                return jsonify(records)
                
        except Exception as e:
            return jsonify({'error': f'Database error: {str(e)}'}), 500
        finally:
            conn.close()
            
    except Exception as e:
        print(f"Error fetching attendance: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'DeepFace backend is running'})

@app.route('/api/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({
        'success': True,
        'message': 'Successfully logged out'
    }))
    response.set_cookie('auth_token', '', expires=0)
    return response

if __name__ == '__main__':
    print("Starting DeepFace Face Recognition Backend...")
    print("Make sure you have installed the required packages:")
    print("pip install flask flask-cors deepface opencv-python")
    app.run(debug=True, host='0.0.0.0', port=8000)