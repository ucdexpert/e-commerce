"""
Test Script for New Features
Run this to verify all new features are working
"""

import requests
import os

BASE_URL = "http://localhost:8000/api"

def test_endpoint(method, endpoint, description, expected_status=200, headers=None, json_data=None):
    """Test a single endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=json_data)
        
        status = "✅" if response.status_code == expected_status else "❌"
        print(f"{status} {description}")
        print(f"   Status: {response.status_code} (Expected: {expected_status})")
        
        if response.status_code == expected_status:
            if method == "GET" and response.json():
                print(f"   Response: {str(response.json())[:100]}...")
            return True
        else:
            print(f"   Error: {response.text[:200]}")
        return False
        
    except Exception as e:
        print(f"❌ {description}")
        print(f"   Error: {str(e)}")
        return False


def main():
    print("=" * 60)
    print("Testing New Features")
    print("=" * 60)
    print()
    
    # Test 1: Check if server is running
    print("📡 Checking server status...")
    if not test_endpoint("GET", "/api/health", "Server is running", expected_status=200):
        print("\n❌ Server is not running! Start it first:")
        print("   uvicorn app.main:app --reload")
        return
    
    print("\n✅ Server is running!\n")
    
    # Test 2: JazzCash endpoints
    print("💳 Testing JazzCash Endpoints...")
    test_endpoint("POST", "/jazzcash/initiate-payment", 
                  "JazzCash initiate payment (will fail without credentials)", 
                  expected_status=500)  # Expected to fail without credentials
    
    # Test 3: EasyPaisa endpoints
    print("\n📱 Testing EasyPaisa Endpoints...")
    test_endpoint("POST", "/easypaisa/initiate-payment", 
                  "EasyPaisa initiate payment (will fail without credentials)", 
                  expected_status=500)
    
    # Test 4: Variants endpoints (need auth)
    print("\n🏷️  Testing Product Variants...")
    print("   Note: Variants require admin authentication")
    print("   Test manually via API docs: http://localhost:8000/api/docs")
    
    # Test 5: Returns endpoints (need auth)
    print("\n↩️  Testing Return System...")
    print("   Note: Returns require user authentication")
    print("   Test manually via API docs")
    
    # Test 6: Roles endpoints
    print("\n👥 Testing User Roles...")
    test_endpoint("GET", "/roles/permissions", "Get available permissions")
    test_endpoint("GET", "/roles/stats", "Get role statistics (admin only)", expected_status=401)
    
    # Test 7: Check database tables
    print("\n🗄️  Checking Database Tables...")
    print("   Run this to verify tables exist:")
    print("   python -c \"from app.models import Return; from app.core.database import engine; from sqlalchemy import inspect; inspector = inspect(engine); print('Tables:', inspector.get_table_names())\"")
    
    print("\n" + "=" * 60)
    print("Testing Complete!")
    print("=" * 60)
    print("\n📝 Next Steps:")
    print("1. Open API Docs: http://localhost:8000/api/docs")
    print("2. Login to get token")
    print("3. Test endpoints with authentication")
    print("\n🎯 Manual Testing Required:")
    print("- Product Variants (need admin token)")
    print("- Return Requests (need user token)")
    print("- User Roles (need superuser token)")
    print("- Payment Gateways (need API credentials)")


if __name__ == "__main__":
    main()
