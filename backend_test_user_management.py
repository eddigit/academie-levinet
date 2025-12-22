import requests
import sys
import json
from datetime import datetime

class UserManagementAPITester:
    def __init__(self, base_url="https://martial-defense-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.member_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_user_id = None

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

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        request_headers = {'Content-Type': 'application/json'}
        
        # Use specific token if provided, otherwise use admin token
        auth_token = token or self.admin_token
        if auth_token:
            request_headers['Authorization'] = f'Bearer {auth_token}'
        
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

    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "email": "admin@academie-levinet.com",
            "password": "Admin2025!"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            return True
        return False

    def test_member_login(self):
        """Test member login"""
        login_data = {
            "email": "test@academie-levinet.com",
            "password": "test123"
        }
        
        success, response = self.run_test(
            "Member Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.member_token = response['token']
            return True
        return False

    def test_admin_get_all_users(self):
        """Test admin getting all users"""
        success, response = self.run_test(
            "Admin Get All Users",
            "GET",
            "admin/users",
            200
        )
        
        if success:
            users = response.get('users', [])
            self.log_test("Users List Validation", len(users) > 0, f"Found {len(users)} users")
        
        return success, response

    def test_admin_get_users_with_filters(self):
        """Test admin getting users with role filters"""
        # Test filter by admin role
        success, response = self.run_test(
            "Admin Get Users - Admin Filter",
            "GET",
            "admin/users?role=admin",
            200
        )
        
        if success:
            users = response.get('users', [])
            admin_users = [u for u in users if u.get('role') == 'admin']
            self.log_test("Admin Filter Validation", len(admin_users) == len(users), f"All {len(users)} users are admins")
        
        # Test filter by member role
        success2, response2 = self.run_test(
            "Admin Get Users - Member Filter",
            "GET",
            "admin/users?role=member",
            200
        )
        
        if success2:
            users = response2.get('users', [])
            member_users = [u for u in users if u.get('role') == 'member']
            self.log_test("Member Filter Validation", len(member_users) == len(users), f"All {len(users)} users are members")
        
        return success and success2

    def test_admin_create_admin_user(self):
        """Test admin creating a new admin user"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"admin_test_{timestamp}@academie-levinet.com",
            "password": "AdminTest123!",
            "full_name": f"Admin Test {timestamp}",
            "role": "admin",
            "phone": "+33123456789",
            "city": "Paris"
        }
        
        success, response = self.run_test(
            "Admin Create Admin User",
            "POST",
            "admin/users",
            200,
            data=user_data
        )
        
        if success:
            self.created_user_id = response.get('user_id')
        
        return success, response

    def test_admin_create_member_user(self):
        """Test admin creating a new member user"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"member_test_{timestamp}@academie-levinet.com",
            "password": "MemberTest123!",
            "full_name": f"Member Test {timestamp}",
            "role": "member",
            "phone": "+33987654321",
            "city": "Lyon"
        }
        
        success, response = self.run_test(
            "Admin Create Member User",
            "POST",
            "admin/users",
            200,
            data=user_data
        )
        
        return success, response

    def test_admin_promote_demote_user(self):
        """Test admin promoting/demoting user roles"""
        if not self.created_user_id:
            self.log_test("Role Change Test", False, "No user ID available for testing")
            return False
        
        # First promote to admin (if not already)
        success1, _ = self.run_test(
            "Admin Promote User to Admin",
            "PUT",
            f"admin/users/{self.created_user_id}/role?role=admin",
            200
        )
        
        # Then demote to member
        success2, _ = self.run_test(
            "Admin Demote User to Member",
            "PUT",
            f"admin/users/{self.created_user_id}/role?role=member",
            200
        )
        
        return success1 and success2

    def test_admin_delete_user(self):
        """Test admin deleting a user"""
        if not self.created_user_id:
            self.log_test("Delete User Test", False, "No user ID available for testing")
            return False
        
        success, _ = self.run_test(
            "Admin Delete User",
            "DELETE",
            f"admin/users/{self.created_user_id}",
            200
        )
        
        return success

    def test_member_get_profile(self):
        """Test member getting their profile"""
        success, response = self.run_test(
            "Member Get Profile",
            "GET",
            "profile",
            200,
            token=self.member_token
        )
        
        if success:
            required_fields = ['id', 'email', 'full_name', 'role']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("Profile Fields Validation", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Profile Fields Validation", True, "All required fields present")
        
        return success, response

    def test_member_update_profile(self):
        """Test member updating their profile"""
        timestamp = datetime.now().strftime('%H%M%S')
        profile_data = {
            "full_name": f"Updated Member {timestamp}",
            "phone": "+33111222333",
            "city": "Marseille",
            "country": "France",
            "date_of_birth": "1990-05-15",
            "belt_grade": "Ceinture Jaune",
            "club_name": "Club Test Marseille",
            "instructor_name": "Instructor Test",
            "bio": "This is a test bio update"
        }
        
        success, response = self.run_test(
            "Member Update Profile",
            "PUT",
            "profile",
            200,
            data=profile_data,
            token=self.member_token
        )
        
        if success:
            # Verify the update worked
            updated_name = response.get('full_name')
            if updated_name == profile_data['full_name']:
                self.log_test("Profile Update Validation", True, "Profile updated successfully")
            else:
                self.log_test("Profile Update Validation", False, f"Expected name '{profile_data['full_name']}', got '{updated_name}'")
        
        return success

    def test_member_update_photo(self):
        """Test member updating their profile photo"""
        photo_url = "https://example.com/test-photo.jpg"
        
        success, response = self.run_test(
            "Member Update Photo",
            "POST",
            f"profile/photo?photo_url={photo_url}",
            200,
            token=self.member_token
        )
        
        return success

    def test_member_change_password(self):
        """Test member changing their password"""
        success, response = self.run_test(
            "Member Change Password",
            "PUT",
            "profile/password?current_password=test123&new_password=newtest123",
            200,
            token=self.member_token
        )
        
        if success:
            # Try to login with new password to verify change
            login_data = {
                "email": "test@academie-levinet.com",
                "password": "newtest123"
            }
            
            success2, _ = self.run_test(
                "Verify New Password Login",
                "POST",
                "auth/login",
                200,
                data=login_data
            )
            
            if success2:
                # Change password back for future tests
                self.run_test(
                    "Reset Password Back",
                    "PUT",
                    "profile/password?current_password=newtest123&new_password=test123",
                    200,
                    token=self.member_token
                )
            
            return success2
        
        return success

    def run_all_tests(self):
        """Run all user management and profile tests"""
        print("🚀 Starting User Management & Profile API Tests")
        print("=" * 60)
        
        # Test admin authentication
        print("\n📋 ADMIN AUTHENTICATION")
        print("-" * 30)
        if not self.test_admin_login():
            print("❌ Admin login failed. Cannot continue with admin tests.")
            return False
        
        # Test member authentication
        print("\n📋 MEMBER AUTHENTICATION")
        print("-" * 30)
        if not self.test_member_login():
            print("❌ Member login failed. Cannot continue with member tests.")
            return False
        
        # Test admin user management
        print("\n📋 ADMIN USER MANAGEMENT")
        print("-" * 30)
        self.test_admin_get_all_users()
        self.test_admin_get_users_with_filters()
        self.test_admin_create_admin_user()
        self.test_admin_create_member_user()
        self.test_admin_promote_demote_user()
        self.test_admin_delete_user()
        
        # Test member profile management
        print("\n📋 MEMBER PROFILE MANAGEMENT")
        print("-" * 30)
        self.test_member_get_profile()
        self.test_member_update_profile()
        self.test_member_update_photo()
        self.test_member_change_password()
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 USER MANAGEMENT TEST SUMMARY")
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
    tester = UserManagementAPITester()
    
    try:
        success = tester.run_all_tests()
        tester.print_summary()
        
        # Save detailed results
        with open('/app/test_reports/user_management_test_results.json', 'w') as f:
            json.dump({
                'summary': {
                    'total_tests': tester.tests_run,
                    'passed_tests': tester.tests_passed,
                    'failed_tests': tester.tests_run - tester.tests_passed,
                    'success_rate': (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0
                },
                'detailed_results': tester.test_results,
                'timestamp': datetime.now().isoformat()
            }, f, indent=2)
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"❌ Critical error during testing: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())