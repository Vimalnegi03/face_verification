#!/usr/bin/env python3
"""
Setup script for DeepFace Face Recognition Backend
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required Python packages"""
    print("Installing Python requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ All requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False
    return True

def create_directories():
    """Create necessary directories"""
    directories = [
        'employee_images',
        'data'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def main():
    print("🚀 Setting up DeepFace Face Recognition Backend...")
    
    # Create directories
    create_directories()
    
    # Install requirements
    if install_requirements():
        print("\n🎉 Setup completed successfully!")
        print("\nTo start the backend server, run:")
        print("python3 app.py")
        print("\nThe server will be available at: http://localhost:8000")
    else:
        print("\n❌ Setup failed. Please check the error messages above.")

if __name__ == "__main__":
    main()