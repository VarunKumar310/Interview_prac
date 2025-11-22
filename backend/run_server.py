# FastAPI Development Server Script
# Alternative to batch files for cross-platform compatibility

import uvicorn
import os
import sys
from pathlib import Path

def main():
    """Start the FastAPI development server"""
    
    # Ensure we're in the right directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Check for .env file
    env_file = backend_dir / '.env'
    if not env_file.exists():
        print("⚠️  WARNING: .env file not found!")
        print("Please copy .env.example to .env and configure your settings.")
        print("Most importantly, set your GOOGLE_AI_API_KEY.")
        print()
        
    # Create data directories if they don't exist
    for dir_name in ['data', 'data/sessions', 'data/reports', 'logs']:
        Path(dir_name).mkdir(parents=True, exist_ok=True)
    
    print("🚀 Starting AI Interview Backend Server...")
    print("📋 FastAPI + Google Gemini AI")
    print()
    print("Server will be available at:")
    print("- Main API: http://localhost:8000")
    print("- Interactive Docs: http://localhost:8000/docs")
    print("- Alternative Docs: http://localhost:8000/redoc")
    print()
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,  # Enable hot reload in development
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()