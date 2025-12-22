import requests
import sys
import json
from datetime import datetime

class MemberAreaAPITester:
    def __init__(self, base_url="https://martial-defense-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {name}")
        if details:
            print(f"   Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        request_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            request_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            request_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json() if response.content else {}
                    self.log_test(name, True, f"Status: {response.status_code}")
                    return True, response_data
                except:
                    self.log_test(name, True, f"Status: {response.status_code} (No JSON response)")
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_member_login(self):
        """Test member login with provided credentials"""
        login_data = {
            "email": "membre@academie-levinet.com",
            "password": "Membre2025!"
        }
        
        success, response = self.run_test(
            "Member Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True, response
        return False, {}

    def test_member_profile(self):
        """Test getting member profile"""
        success, response = self.run_test(
            "Get Member Profile",
            "GET",
            "auth/me",
            200
        )
        return success, response

    def test_conversations_unread_count(self):
        """Test getting unread messages count"""
        success, response = self.run_test(
            "Get Unread Messages Count",
            "GET",
            "conversations/unread-count",
            200
        )
        return success, response

    def test_conversations_list(self):
        """Test getting conversations list"""
        success, response = self.run_test(
            "Get Conversations List",
            "GET",
            "conversations",
            200
        )
        return success, response

    def test_news_list(self):
        """Test getting news list"""
        success, response = self.run_test(
            "Get News List",
            "GET",
            "news",
            200
        )
        return success, response

    def test_events_list(self):
        """Test getting events list"""
        success, response = self.run_test(
            "Get Events List",
            "GET",
            "events",
            200
        )
        return success, response

    def run_member_tests(self):
        """Run member area specific API tests"""
        print("🚀 Starting Member Area API Tests")
        print("=" * 60)
        
        # Test member authentication
        print("\n📋 MEMBER AUTHENTICATION TESTS")
        print("-" * 30)
        
        success, user_data = self.test_member_login()
        if not success:
            print("❌ Member login failed. Cannot proceed with member area tests.")
            return False
        
        print(f"✅ Member logged in successfully: {user_data.get('user', {}).get('full_name', 'Unknown')}")
        
        # Test member profile
        success, profile_data = self.test_member_profile()
        if success:
            print(f"✅ Member profile loaded: {profile_data.get('full_name', 'Unknown')}")
        
        # Test member-specific endpoints
        print("\n📋 MEMBER AREA ENDPOINTS")
        print("-" * 30)
        
        self.test_conversations_unread_count()
        self.test_conversations_list()
        self.test_news_list()
        self.test_events_list()
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 MEMBER AREA TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   - {result['test_name']}: {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = MemberAreaAPITester()
    
    try:
        success = tester.run_member_tests()
        tester.print_summary()
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"❌ Critical error during testing: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())