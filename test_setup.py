#!/usr/bin/env python3
"""
Test script to verify Supabase setup
"""

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

async def test_supabase_connection():
    """Test basic Supabase connection"""
    try:
        from supabase import create_client
        
        # Get credentials
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ Missing Supabase credentials in backend/.env")
            print("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
            return False
        
        # Create client
        supabase = create_client(supabase_url, supabase_key)
        
        # Test connection by checking if tables exist
        try:
            # Try to query agents table
            result = supabase.table("agents").select("count", count="exact").execute()
            print("✅ Supabase connection successful")
            print(f"✅ Agents table exists (count: {result.count})")
            return True
        except Exception as e:
            if "relation" in str(e).lower() and "does not exist" in str(e).lower():
                print("⚠️  Supabase connected but tables don't exist yet")
                print("Please run the schema.sql in your Supabase SQL Editor")
                return False
            else:
                print(f"❌ Error testing tables: {e}")
                return False
                
    except ImportError:
        print("❌ Supabase client not installed")
        print("Run: pip install supabase")
        return False
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

async def test_vector_extension():
    """Test if vector extension is available"""
    try:
        from supabase import create_client
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            return False
        
        supabase = create_client(supabase_url, supabase_key)
        
        # Test vector column creation by checking if the table has vector column
        try:
            # Check if kb_chunks table has vector column
            result = supabase.table("kb_chunks").select("embedding").limit(1).execute()
            print("✅ Vector extension is available and working")
            return True
        except Exception as e:
            if "column" in str(e).lower() and "embedding" in str(e).lower():
                # Try to check for JSONB column instead
                try:
                    result = supabase.table("kb_chunks").select("embedding_json").limit(1).execute()
                    print("⚠️  Vector extension not available - using JSONB fallback")
                    return False
                except:
                    print("⚠️  Vector extension not available - will use JSONB fallback")
                    return False
            else:
                print(f"❌ Vector test failed: {e}")
                return False
                
    except Exception as e:
        print(f"❌ Vector extension test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🔍 Testing Supabase Setup...")
    print("=" * 50)
    
    # Test 1: Basic connection
    print("\n1. Testing Supabase connection...")
    connection_ok = asyncio.run(test_supabase_connection())
    
    # Test 2: Vector extension
    print("\n2. Testing vector extension...")
    vector_ok = asyncio.run(test_vector_extension())
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 Setup Summary:")
    print(f"   Supabase Connection: {'✅ OK' if connection_ok else '❌ FAILED'}")
    print(f"   Vector Extension: {'✅ Available' if vector_ok else '⚠️  Not Available (JSONB fallback)'}")
    
    if connection_ok:
        print("\n🎉 Basic setup is working!")
        if not vector_ok:
            print("💡 Use schema_fallback.sql for better compatibility")
    else:
        print("\n🔧 Please fix the issues above before proceeding")
    
    print("\n📚 Next steps:")
    print("1. Create your .env files with Supabase credentials")
    print("2. Run the appropriate schema in Supabase SQL Editor")
    print("3. Test the full application")

if __name__ == "__main__":
    main() 