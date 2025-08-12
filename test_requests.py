import requests
import json
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv('./backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
API_BASE_URL = "http://localhost:8000"

def test_auth_workflow():
    """Test the complete auth workflow"""
    
    print("🔍 Testing authentication workflow...\n")
    
    # Step 1: Create Supabase client
    supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    # Step 2: Sign in
    try:
        print("1. Signing in...")
        auth_response = supabase.auth.sign_in_with_password({
            'email': 'test@example.com',
            'password': 'testpassword123'
        })
        
        if not auth_response.user:
            print("❌ Sign in failed")
            return False
            
        token = auth_response.session.access_token
        print(f"✅ Sign in successful. Token: {token[:30]}...")
        
    except Exception as e:
        print(f"❌ Sign in error: {e}")
        return False
    
    # Step 3: Test backend health
    try:
        print("\n2. Testing backend health...")
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        print(f"✅ Backend health: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Backend health failed: {e}")
        return False
    
    # Step 4: Test GET request with auth
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        print("\n3. Testing GET /agents...")
        response = requests.get(f"{API_BASE_URL}/agents", headers=headers, timeout=5)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ GET request successful: {response.json()}")
        else:
            print(f"❌ GET request failed: {response.text}")
            
    except Exception as e:
        print(f"❌ GET request error: {e}")
    
    # Step 5: Test POST request with auth
    try:
        print("\n4. Testing POST /agents...")
        agent_data = {
            'name': 'Test Agent',
            'description': 'This is a test agent'
        }
        
        response = requests.post(
            f"{API_BASE_URL}/agents", 
            headers=headers, 
            json=agent_data,
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print(f"✅ POST request successful: {response.json()}")
        else:
            print(f"❌ POST request failed: {response.text}")
            
    except Exception as e:
        print(f"❌ POST request error: {e}")
    
    return True

if __name__ == "__main__":
    test_auth_workflow()
