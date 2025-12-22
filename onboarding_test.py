import requests
import sys
import json
from datetime import datetime

class OnboardingFlowTester:
    def __init__(self, base_url="https://martial-defense-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
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
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
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

    def test_onboarding_step1_register(self):
        """Test Step 4: User registration with 'member' role"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"onboarding_test_{timestamp}@test.com",
            "password": "TestPass123!",
            "full_name": "Test Onboarding User"
        }
        
        success, response = self.run_test(
            "Onboarding Step 4: User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success:
            # Verify user has 'member' role by default
            if 'user' in response and response['user'].get('role') == 'member':
                self.log_test("User Role Validation", True, "User created with 'member' role")
            else:
                self.log_test("User Role Validation", False, f"Expected 'member' role, got: {response.get('user', {}).get('role')}")
                
            if 'token' in response:
                self.token = response['token']
                self.created_user_id = response['user']['id']
                return True, user_data
        
        return False, user_data

    def test_onboarding_step2_create_lead(self):
        """Test Step 2-3: Create lead with onboarding data"""
        lead_data = {
            "person_type": "Femme",
            "motivations": ["Sécurité personnelle", "Confiance en soi"],
            "training_mode": "both",
            "nearest_club_city": "Paris",
            "full_name": "Test Onboarding User",
            "email": f"onboarding_test_{datetime.now().strftime('%H%M%S')}@test.com",
            "phone": "+33123456789",
            "city": "Paris",
            "country": "France"
        }
        
        success, response = self.run_test(
            "Onboarding Step 2-3: Create Lead",
            "POST",
            "leads",
            200,
            data=lead_data
        )
        
        if success:
            # Verify lead fields are properly stored
            required_fields = ['person_type', 'motivations', 'training_mode', 'nearest_club_city']
            missing_fields = []
            
            for field in required_fields:
                if field not in response or not response[field]:
                    missing_fields.append(field)
            
            if missing_fields:
                self.log_test("Lead Data Validation", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Lead Data Validation", True, "All onboarding fields properly stored")
                
            return True, response.get('id')
        
        return False, None

    def test_onboarding_step5_stripe_checkout(self):
        """Test Step 5: Stripe checkout for membership license"""
        checkout_data = {
            "package_id": "licence",
            "origin_url": "https://martial-defense-app.preview.emergentagent.com"
        }
        
        success, response = self.run_test(
            "Onboarding Step 5: Stripe Checkout",
            "POST",
            "payments/membership/checkout",
            200,
            data=checkout_data
        )
        
        if success:
            # Verify Stripe session URL is returned
            if 'url' in response and response['url']:
                self.log_test("Stripe URL Validation", True, f"Checkout URL generated: {response['url'][:50]}...")
                return True, response['url']
            else:
                self.log_test("Stripe URL Validation", False, "No checkout URL in response")
        
        return False, None

    def test_leads_endpoint_access(self):
        """Test that leads endpoint is accessible without authentication"""
        lead_data = {
            "person_type": "Homme",
            "motivations": ["Condition physique"],
            "training_mode": "online",
            "full_name": "Public Test User",
            "email": f"public_test_{datetime.now().strftime('%H%M%S')}@test.com",
            "phone": "+33987654321",
            "city": "Lyon",
            "country": "France"
        }
        
        # Temporarily remove token to test public access
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Public Leads Endpoint Access",
            "POST",
            "leads",
            200,
            data=lead_data
        )
        
        # Restore token
        self.token = temp_token
        
        return success, response.get('id') if success else None

    def test_field_validation(self):
        """Test field validation for onboarding data"""
        print("\n🔍 Testing Field Validation...")
        
        # Test missing required fields
        invalid_lead_data = {
            "person_type": "Femme",
            # Missing motivations, full_name, email, etc.
        }
        
        success, response = self.run_test(
            "Lead Validation: Missing Fields",
            "POST",
            "leads",
            422,  # Expecting validation error
            data=invalid_lead_data
        )
        
        # Test invalid person_type
        invalid_person_type = {
            "person_type": "InvalidType",
            "motivations": ["Sécurité personnelle"],
            "full_name": "Test User",
            "email": f"validation_test_{datetime.now().strftime('%H%M%S')}@test.com",
            "phone": "+33123456789",
            "city": "Paris",
            "country": "France"
        }
        
        success2, response2 = self.run_test(
            "Lead Validation: Invalid Person Type",
            "POST",
            "leads",
            422,  # Expecting validation error
            data=invalid_person_type
        )
        
        return success or success2  # At least one validation should work

    def run_onboarding_flow_tests(self):
        """Run comprehensive onboarding flow tests"""
        print("🚀 Starting Onboarding Flow Tests")
        print("=" * 60)
        
        # Test the complete onboarding flow
        print("\n📋 ONBOARDING FLOW TESTS")
        print("-" * 30)
        
        # Step 1: Test public leads endpoint (no auth required)
        success, lead_id = self.test_leads_endpoint_access()
        if not success:
            print("❌ Public leads endpoint failed")
        
        # Step 2: Test user registration (Step 4 in UI)
        success, user_data = self.test_onboarding_step1_register()
        if not success:
            print("❌ User registration failed. Stopping onboarding tests.")
            return False
        
        # Step 3: Test lead creation with authenticated user (Step 2-3 in UI)
        success, lead_id = self.test_onboarding_step2_create_lead()
        if not success:
            print("❌ Lead creation failed")
        
        # Step 4: Test Stripe checkout (Step 5 in UI)
        success, checkout_url = self.test_onboarding_step5_stripe_checkout()
        if not success:
            print("❌ Stripe checkout failed")
        
        # Step 5: Test field validation
        self.test_field_validation()
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 ONBOARDING FLOW TEST SUMMARY")
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
    tester = OnboardingFlowTester()
    
    try:
        success = tester.run_onboarding_flow_tests()
        all_passed = tester.print_summary()
        
        # Save detailed results
        with open('/app/test_reports/onboarding_test_results.json', 'w') as f:
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
        
        return 0 if all_passed else 1
        
    except Exception as e:
        print(f"❌ Critical error during testing: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())