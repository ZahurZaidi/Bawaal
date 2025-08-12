#!/usr/bin/env python3
"""
Test script to verify authentication flow between frontend and backend
"""

import asyncio
import requests
import json
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables from backend directory
load_dotenv('./backend/.env')

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
API_BASE_URL = "http://localhost:8000"

def test_supabase_connection():
    """Test Supabase connection"""
    print("🔍 Testing Supabase connection...")
    
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("❌ Missing Supabase environment variables")
        return False
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print(f"✅ Supabase client created successfully")
        print(f"   URL: {SUPABASE_URL}")
        print(f"   Key: {SUPABASE_ANON_KEY[:20]}...")
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

def test_backend_health():
    """Test backend health endpoint"""
    print("\n🔍 Testing backend health...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_auth_with_demo_user():
    """Test authentication with a demo user"""
    print("\n🔍 Testing authentication flow...")
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        
        # Try to sign up a test user (will fail if already exists)
        test_email = "test@example.com"
        test_password = "testpassword123"
        
        print(f"   Attempting to sign up user: {test_email}")
        auth_response = supabase.auth.sign_up({
            "email": test_email,
            "password": test_password
        })
        
        if auth_response.user:
            print("✅ User signed up successfully")
            token = auth_response.session.access_token
        else:
            # Try to sign in instead
            print("   User might already exist, trying sign in...")
            auth_response = supabase.auth.sign_in_with_password({
                "email": test_email,
                "password": test_password
            })
            
            if auth_response.user:
                print("✅ User signed in successfully")
                token = auth_response.session.access_token
            else:
                print("❌ Authentication failed")
                return False
        
        print(f"   Token: {token[:50]}...")
        
        # Test backend auth endpoint
        print("\n   Testing backend authentication...")
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = requests.get(f"{API_BASE_URL}/auth/test", headers=headers, timeout=5)
            if response.status_code == 200:
                print("✅ Backend authentication successful")
                print(f"   Response: {response.json()}")
                return True
            else:
                print(f"❌ Backend authentication failed: {response.status_code}")
                if response.text:
                    print(f"   Error: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Backend authentication request failed: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Authentication test failed: {e}")
        return False

def test_agents_endpoint():
    """Test agents endpoint with authentication"""
    print("\n🔍 Testing agents endpoint...")
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        
        # Sign in
        test_email = "test@example.com"
        test_password = "testpassword123"
        
        auth_response = supabase.auth.sign_in_with_password({
            "email": test_email,
            "password": test_password
        })
        
        if not auth_response.user:
            print("❌ Could not authenticate for agents test")
            return False
        
        token = auth_response.session.access_token
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test list agents
        response = requests.get(f"{API_BASE_URL}/agents", headers=headers, timeout=5)
        if response.status_code == 200:
            print("✅ Agents list endpoint working")
            agents = response.json()
            print(f"   Found {len(agents)} agents")
            return True
        else:
            print(f"❌ Agents endpoint failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Agents endpoint test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting authentication tests...\n")
    
    tests = [
        test_supabase_connection,
        test_backend_health,
        test_auth_with_demo_user,
        test_agents_endpoint
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            results.append(False)
    
    print("\n" + "="*50)
    print("📊 Test Results:")
    passed = sum(results)
    total = len(results)
    
    for i, (test, result) in enumerate(zip(tests, results)):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {i+1}. {test.__name__}: {status}")
    
    print(f"\n📈 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Authentication should be working.")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
