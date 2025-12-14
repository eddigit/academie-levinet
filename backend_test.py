import requests
import sys
import json
from datetime import datetime

class AcademieLevinetAPITester:
    def __init__(self, base_url="https://defense-academy-3.preview.emergentagent.com"):
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
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers, timeout=30)

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

    def test_auth_register(self):
        """Test user registration"""
        test_user_data = {
            "email": f"test_user_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "full_name": "Test User"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True, test_user_data
        return False, test_user_data

    def test_auth_login(self):
        """Test login with admin credentials"""
        login_data = {
            "email": "admin@academie-levinet.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_auth_me(self):
        """Test get current user"""
        success, _ = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_create_technical_director(self):
        """Test creating a technical director"""
        director_data = {
            "name": "Jean Dupont",
            "email": f"director_{datetime.now().strftime('%H%M%S')}@test.com",
            "phone": "+33123456789",
            "country": "France",
            "city": "Paris"
        }
        
        success, response = self.run_test(
            "Create Technical Director",
            "POST",
            "technical-directors",
            200,
            data=director_data
        )
        
        return success, response.get('id') if success else None

    def test_get_technical_directors(self):
        """Test getting all technical directors"""
        success, response = self.run_test(
            "Get Technical Directors",
            "GET",
            "technical-directors",
            200
        )
        return success, response

    def test_create_member(self, director_id):
        """Test creating a member"""
        member_data = {
            "first_name": "Pierre",
            "last_name": "Martin",
            "email": f"member_{datetime.now().strftime('%H%M%S')}@test.com",
            "phone": "+33987654321",
            "date_of_birth": "1990-01-01",
            "country": "France",
            "city": "Lyon",
            "technical_director_id": director_id,
            "belt_grade": "Ceinture Blanche",
            "membership_type": "Standard",
            "membership_start_date": "2025-01-01",
            "membership_end_date": "2025-12-31"
        }
        
        success, response = self.run_test(
            "Create Member",
            "POST",
            "members",
            200,
            data=member_data
        )
        
        return success, response.get('id') if success else None

    def test_get_members(self):
        """Test getting all members"""
        success, response = self.run_test(
            "Get Members",
            "GET",
            "members",
            200
        )
        return success, response

    def test_create_subscription(self, member_id):
        """Test creating a subscription"""
        subscription_data = {
            "member_id": member_id,
            "amount": 50.0,
            "payment_date": "2025-01-15",
            "payment_method": "Carte bancaire",
            "status": "Payé"
        }
        
        success, response = self.run_test(
            "Create Subscription",
            "POST",
            "subscriptions",
            200,
            data=subscription_data
        )
        
        return success, response.get('id') if success else None

    def test_get_subscriptions(self):
        """Test getting all subscriptions"""
        success, response = self.run_test(
            "Get Subscriptions",
            "GET",
            "subscriptions",
            200
        )
        return success, response

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success:
            required_fields = ['total_members', 'total_revenue', 'active_memberships', 'new_members_this_month']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("Dashboard Stats Validation", False, f"Missing fields: {missing_fields}")
                return False
            else:
                self.log_test("Dashboard Stats Validation", True, "All required fields present")
        
        return success

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting Académie Jacques Levinet API Tests")
        print("=" * 60)
        
        # Test authentication first
        print("\n📋 AUTHENTICATION TESTS")
        print("-" * 30)
        
        # Try admin login first
        if not self.test_auth_login():
            print("❌ Admin login failed, trying registration...")
            success, user_data = self.test_auth_register()
            if not success:
                print("❌ Both login and registration failed. Stopping tests.")
                return False
        
        # Test auth/me endpoint
        self.test_auth_me()
        
        # Test CRUD operations
        print("\n📋 TECHNICAL DIRECTORS TESTS")
        print("-" * 30)
        
        success, director_id = self.test_create_technical_director()
        if not success:
            print("❌ Failed to create technical director. Stopping related tests.")
            return False
            
        self.test_get_technical_directors()
        
        print("\n📋 MEMBERS TESTS")
        print("-" * 30)
        
        success, member_id = self.test_create_member(director_id)
        if not success:
            print("❌ Failed to create member. Stopping related tests.")
            return False
            
        self.test_get_members()
        
        print("\n📋 SUBSCRIPTIONS TESTS")
        print("-" * 30)
        
        success, subscription_id = self.test_create_subscription(member_id)
        if not success:
            print("❌ Failed to create subscription.")
            
        self.test_get_subscriptions()
        
        print("\n📋 DASHBOARD TESTS")
        print("-" * 30)
        
        self.test_dashboard_stats()
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
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
    tester = AcademieLevinetAPITester()
    
    try:
        success = tester.run_all_tests()
        tester.print_summary()
        
        # Save detailed results
        with open('/app/test_reports/backend_test_results.json', 'w') as f:
            json.dump({
                'summary': {
                    'total_tests': tester.tests_run,
                    'passed_tests': tester.tests_passed,
                    'failed_tests': tester.tests_run - tester.tests_passed,
                    'success_rate': (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0
                },
                'detailed_results': tester.test_results,
                'timestamp': datetime.now().isoformat()
            }, indent=2)
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"❌ Critical error during testing: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())