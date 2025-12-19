import requests
import sys
import json
from datetime import datetime

class AcademieLevinetAPITester:
    def __init__(self, base_url="https://spk-academy-crm.preview.emergentagent.com"):
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

    def test_create_pending_member(self):
        """Test creating a pending member request"""
        pending_member_data = {
            "person_type": "Homme",
            "motivations": ["Sécurité personnelle", "Confiance en soi"],
            "full_name": "Jean Membre",
            "email": f"pending_{datetime.now().strftime('%H%M%S')}@test.com",
            "phone": "+33123456789",
            "city": "Paris",
            "country": "France",
            "club_name": "Club SPK Paris Centre",
            "instructor_name": "Jacques Levinet",
            "belt_grade": "Ceinture Noire 1er Dan",
            "training_mode": "club"
        }
        
        success, response = self.run_test(
            "Create Pending Member",
            "POST",
            "pending-members",
            200,
            data=pending_member_data
        )
        
        return success, response.get('id') if success else None

    def test_get_pending_members(self):
        """Test getting pending members (admin only)"""
        success, response = self.run_test(
            "Get Pending Members",
            "GET",
            "admin/pending-members",
            200
        )
        return success, response

    def test_approve_pending_member(self, pending_id):
        """Test approving a pending member"""
        success, response = self.run_test(
            "Approve Pending Member",
            "POST",
            f"admin/pending-members/{pending_id}/approve",
            200
        )
        return success

    def test_smtp_settings(self):
        """Test SMTP settings endpoints"""
        # Get SMTP settings
        success, response = self.run_test(
            "Get SMTP Settings",
            "GET",
            "admin/settings/smtp",
            200
        )
        
        if not success:
            return False
        
        # Update SMTP settings
        smtp_data = {
            "smtp_host": "smtp.gmail.com",
            "smtp_port": 587,
            "smtp_user": "test@gmail.com",
            "from_email": "test@academie-levinet.com",
            "from_name": "Académie Jacques Levinet Test"
        }
        
        success, response = self.run_test(
            "Update SMTP Settings",
            "PUT",
            "admin/settings/smtp",
            200,
            data=smtp_data
        )
        
        return success

    def test_get_technical_directors_list(self):
        """Test getting technical directors list for club assignment"""
        success, response = self.run_test(
            "Get Technical Directors List",
            "GET",
            "technical-directors-list",
            200
        )
        return success, response

    def test_get_instructors_list(self):
        """Test getting instructors list for club assignment"""
        success, response = self.run_test(
            "Get Instructors List",
            "GET",
            "instructors-list",
            200
        )
        return success, response

    def test_create_club(self, director_id):
        """Test creating a club"""
        club_data = {
            "name": f"Club SPK Test {datetime.now().strftime('%H%M%S')}",
            "address": "123 Rue de Test",
            "city": "Paris",
            "country": "France",
            "phone": "+33123456789",
            "email": "test@club.com",
            "technical_director_id": director_id,
            "instructor_ids": [],
            "disciplines": ["Self-Pro Krav (SPK)", "WKMO"],
            "schedule": "Lun-Ven: 18h-21h\nSam: 10h-12h"
        }
        
        success, response = self.run_test(
            "Create Club",
            "POST",
            "admin/clubs",
            200,
            data=club_data
        )
        
        # Extract club_id from the response structure
        if success:
            club_id = response.get('club', {}).get('id')
            return success, club_id
        return success, None

    def test_get_clubs(self):
        """Test getting all clubs"""
        success, response = self.run_test(
            "Get All Clubs",
            "GET",
            "clubs",
            200
        )
        return success, response

    def test_get_club_details(self, club_id):
        """Test getting club details with members and stats"""
        success, response = self.run_test(
            "Get Club Details",
            "GET",
            f"clubs/{club_id}",
            200
        )
        return success, response

    def test_update_club(self, club_id):
        """Test updating club details"""
        update_data = {
            "name": f"Updated Club SPK Test {datetime.now().strftime('%H%M%S')}",
            "city": "Lyon",
            "phone": "+33987654321",
            "status": "Actif"
        }
        
        success, response = self.run_test(
            "Update Club",
            "PUT",
            f"admin/clubs/{club_id}",
            200,
            data=update_data
        )
        
        return success

    def test_assign_member_to_club(self, club_id, user_id):
        """Test assigning a member to a club"""
        success, response = self.run_test(
            "Assign Member to Club",
            "POST",
            f"admin/clubs/{club_id}/members/{user_id}",
            200
        )
        return success

    def test_remove_member_from_club(self, club_id, user_id):
        """Test removing a member from a club"""
        success, response = self.run_test(
            "Remove Member from Club",
            "DELETE",
            f"admin/clubs/{club_id}/members/{user_id}",
            200
        )
        return success

    def test_get_club_stats(self, club_id):
        """Test getting club statistics"""
        success, response = self.run_test(
            "Get Club Stats",
            "GET",
            f"clubs/{club_id}/stats",
            200
        )
        return success, response

    def test_create_visit_request(self, target_club_id):
        """Test creating a visit request"""
        visit_data = {
            "target_club_id": target_club_id,
            "reason": "Visite d'entraînement pendant les vacances",
            "visit_date": "2025-02-15"
        }
        
        success, response = self.run_test(
            "Create Visit Request",
            "POST",
            "visit-requests",
            200,
            data=visit_data
        )
        
        return success, response.get('id') if success else None

    def test_get_visit_requests(self):
        """Test getting visit requests"""
        success, response = self.run_test(
            "Get Visit Requests",
            "GET",
            "visit-requests",
            200
        )
        return success, response

    def test_approve_visit_request(self, request_id):
        """Test approving a visit request"""
        success, response = self.run_test(
            "Approve Visit Request",
            "PUT",
            f"visit-requests/{request_id}/approve",
            200
        )
        return success

    def test_reject_visit_request(self, request_id):
        """Test rejecting a visit request"""
        success, response = self.run_test(
            "Reject Visit Request",
            "PUT",
            f"visit-requests/{request_id}/reject",
            200
        )
        return success

    def test_delete_club(self, club_id):
        """Test deleting a club"""
        success, response = self.run_test(
            "Delete Club",
            "DELETE",
            f"admin/clubs/{club_id}",
            200
        )
        return success

    # ==================== EVENTS CRUD TESTS ====================
    
    def test_create_event(self):
        """Test creating an event"""
        event_data = {
            "title": f"Stage SPK Test {datetime.now().strftime('%H%M%S')}",
            "description": "Stage de Self-Pro Krav pour débutants et confirmés",
            "event_type": "Stage",
            "start_date": "2025-03-15",
            "end_date": "2025-03-15",
            "start_time": "14:00",
            "end_time": "17:00",
            "location": "Dojo Central Paris",
            "city": "Paris",
            "country": "France",
            "instructor": "Jacques Levinet",
            "max_participants": 20,
            "price": 45.0,
            "image_url": "https://example.com/stage.jpg"
        }
        
        success, response = self.run_test(
            "Create Event",
            "POST",
            "events",
            200,
            data=event_data
        )
        
        return success, response.get('id') if success else None

    def test_get_events(self):
        """Test getting all events"""
        success, response = self.run_test(
            "Get All Events",
            "GET",
            "events",
            200
        )
        return success, response

    def test_get_event_details(self, event_id):
        """Test getting event details"""
        success, response = self.run_test(
            "Get Event Details",
            "GET",
            f"events/{event_id}",
            200
        )
        return success, response

    def test_update_event(self, event_id):
        """Test updating an event"""
        update_data = {
            "title": f"Updated Stage SPK Test {datetime.now().strftime('%H%M%S')}",
            "description": "Stage de Self-Pro Krav mis à jour",
            "price": 50.0,
            "max_participants": 25,
            "status": "À venir"
        }
        
        success, response = self.run_test(
            "Update Event",
            "PUT",
            f"events/{event_id}",
            200,
            data=update_data
        )
        
        return success

    def test_delete_event(self, event_id):
        """Test deleting an event"""
        success, response = self.run_test(
            "Delete Event",
            "DELETE",
            f"events/{event_id}",
            200
        )
        return success

    def test_register_for_event(self, event_id):
        """Test registering for an event"""
        success, response = self.run_test(
            "Register for Event",
            "POST",
            f"events/{event_id}/register",
            200
        )
        return success

    def test_get_event_registrations(self, event_id):
        """Test getting event registrations"""
        success, response = self.run_test(
            "Get Event Registrations",
            "GET",
            f"events/{event_id}/registrations",
            200
        )
        return success, response

    def test_unregister_from_event(self, event_id):
        """Test unregistering from an event"""
        success, response = self.run_test(
            "Unregister from Event",
            "DELETE",
            f"events/{event_id}/register",
            200
        )
        return success

    # ==================== ADMIN USERS CRUD TESTS ====================
    
    def test_get_admin_users(self):
        """Test getting all users (admin endpoint)"""
        success, response = self.run_test(
            "Get All Users (Admin)",
            "GET",
            "admin/users",
            200
        )
        return success, response

    def test_create_admin_user(self):
        """Test creating a new user via admin endpoint"""
        user_data = {
            "email": f"admin_test_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "full_name": "Test Admin User",
            "role": "admin",
            "phone": "+33123456789",
            "city": "Paris",
            "country": "France",
            "belt_grade": "Ceinture Noire 1er Dan",
            "send_email": False
        }
        
        success, response = self.run_test(
            "Create Admin User",
            "POST",
            "admin/users",
            200,
            data=user_data
        )
        
        return success, response.get('user_id') if success else None

    def test_create_member_user(self):
        """Test creating a member user via admin endpoint"""
        user_data = {
            "email": f"member_test_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "full_name": "Test Member User",
            "role": "member",
            "phone": "+33987654321",
            "city": "Lyon",
            "country": "France",
            "belt_grade": "Ceinture Blanche",
            "send_email": False
        }
        
        success, response = self.run_test(
            "Create Member User",
            "POST",
            "admin/users",
            200,
            data=user_data
        )
        
        return success, response.get('user_id') if success else None

    def test_create_instructor_user(self):
        """Test creating an instructor user via admin endpoint"""
        user_data = {
            "email": f"instructor_test_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "full_name": "Test Instructor User",
            "role": "instructor",
            "phone": "+33555666777",
            "city": "Marseille",
            "country": "France",
            "belt_grade": "Instructeur",
            "send_email": False
        }
        
        success, response = self.run_test(
            "Create Instructor User",
            "POST",
            "admin/users",
            200,
            data=user_data
        )
        
        return success, response.get('user_id') if success else None

    def test_get_user_details(self, user_id):
        """Test getting user details"""
        success, response = self.run_test(
            "Get User Details",
            "GET",
            f"admin/users/{user_id}",
            200
        )
        return success, response

    def test_update_user(self, user_id):
        """Test updating user details"""
        update_data = {
            "full_name": f"Updated Test User {datetime.now().strftime('%H%M%S')}",
            "phone": "+33999888777",
            "city": "Nice",
            "belt_grade": "Ceinture Jaune",
            "has_paid_license": True,
            "is_premium": True
        }
        
        success, response = self.run_test(
            "Update User",
            "PUT",
            f"admin/users/{user_id}",
            200,
            data=update_data
        )
        
        return success

    def test_change_user_password(self, user_id):
        """Test changing user password (admin)"""
        success, response = self.run_test(
            "Change User Password",
            "PUT",
            f"admin/users/{user_id}/password?new_password=NewPass123!",
            200
        )
        return success

    def test_update_user_role(self, user_id, new_role):
        """Test updating user role"""
        success, response = self.run_test(
            "Update User Role",
            "PUT",
            f"admin/users/{user_id}/role?role={new_role}",
            200
        )
        return success

    def test_delete_user(self, user_id):
        """Test deleting a user"""
        success, response = self.run_test(
            "Delete User",
            "DELETE",
            f"admin/users/{user_id}",
            200
        )
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
        
        print("\n📋 PENDING MEMBERS TESTS")
        print("-" * 30)
        
        # Create a pending member request
        success, pending_id = self.test_create_pending_member()
        if success and pending_id:
            # Test getting pending members
            self.test_get_pending_members()
            # Test approving the pending member
            self.test_approve_pending_member(pending_id)
        
        print("\n📋 ADMIN SETTINGS TESTS")
        print("-" * 30)
        
        self.test_smtp_settings()
        
        print("\n📋 CLUB MANAGEMENT TESTS")
        print("-" * 30)
        
        # Test technical directors list endpoint
        success, directors_response = self.test_get_technical_directors_list()
        if not success:
            print("❌ Failed to get technical directors list")
            return False
        
        # Test instructors list endpoint
        self.test_get_instructors_list()
        
        # Create a club using the first available director
        directors = directors_response.get('directors', [])
        if not directors:
            print("❌ No technical directors available for club creation")
            return False
        
        director_id = directors[0]['id']
        success, club_id = self.test_create_club(director_id)
        if not success:
            print("❌ Failed to create club. Stopping club tests.")
            return False
        
        # Test getting all clubs
        self.test_get_clubs()
        
        # Test getting club details
        self.test_get_club_details(club_id)
        
        # Test updating club
        self.test_update_club(club_id)
        
        # Test club stats
        self.test_get_club_stats(club_id)
        
        # Test member assignment to club (need to use a user ID, not member ID)
        # Get current user ID for assignment test
        success, user_response = self.run_test("Get Current User for Club Assignment", "GET", "auth/me", 200)
        if success and user_response:
            current_user_id = user_response.get('id')
            if current_user_id:
                self.test_assign_member_to_club(club_id, current_user_id)
                # Test removing member from club
                self.test_remove_member_from_club(club_id, current_user_id)
        
        print("\n📋 VISIT REQUESTS TESTS")
        print("-" * 30)
        
        # Test getting visit requests (without creating one since user needs to be in a club)
        self.test_get_visit_requests()
        
        # Note: Visit request creation requires user to be member of a club first
        # This is expected behavior and not a bug
        
        # Note: Club deletion will fail if members are assigned (which is correct behavior)
        # We'll test it anyway to verify the error handling
        self.test_delete_club(club_id)
        
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
            }, f, indent=2)
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"❌ Critical error during testing: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())