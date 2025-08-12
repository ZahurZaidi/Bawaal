from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv('./backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

print("Testing auth flow...")

# Test auth and check response structure
try:
    auth_response = supabase.auth.sign_in_with_password({
        'email': 'test@example.com', 
        'password': 'testpassword123'
    })
    
    if auth_response.user:
        token = auth_response.session.access_token
        print('✅ Login successful')
        print(f'Token: {token[:30]}...')
        
        # Test the get_user call like the backend does
        user_data = supabase.auth.get_user(token)
        print(f'user_data type: {type(user_data)}')
        print(f'user_data.user exists: {user_data.user is not None}')
        
        if user_data.user:
            print(f'user_data.user.id: {user_data.user.id}')
            print(f'user_data.user.email: {user_data.user.email}')
            
            # Test profiles table
            try:
                profile = supabase.table('profiles').select('*').eq('id', user_data.user.id).single().execute()
                print(f'Profile found: {profile.data}')
            except Exception as pe:
                print(f'Profile error: {pe}')
        else:
            print('❌ user_data.user is None')
            
    else:
        print('❌ Login failed - no user in response')
        
except Exception as e:
    print(f'Auth error: {e}')
    import traceback
    traceback.print_exc()
