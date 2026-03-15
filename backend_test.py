import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, List

class SmartStoresPODAPITester:
    def __init__(self, base_url="https://delivery-verify-8.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"\n{status} - {name}")
        if details:
            print(f"  Details: {details}")
        if response_data and not success:
            print(f"  Response: {response_data}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Dict = None, headers: Dict = None) -> tuple:
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        request_headers = {'Content-Type': 'application/json'}
        
        if headers:
            request_headers.update(headers)
        
        if self.token:
            request_headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text

            details = f"Expected {expected_status}, got {response.status_code}"
            if not success:
                details += f" - {response_data}"
                
            self.log_test(name, success, details, response_data if not success else None)
            
            return success, response_data if success else None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, None

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "/", 200)

    def test_admin_login_valid(self):
        """Test admin login with valid credentials"""
        success, response = self.run_test(
            "Admin Login (Valid)",
            "POST",
            "/admin/login",
            200,
            data={"email": "admin@smartstores.com", "password": "smartstores2024"}
        )
        
        if success and response and 'token' in response:
            self.token = response['token']
            self.log_test("Token Retrieved", True, f"Token: {self.token[:20]}...")
            return True
        return False

    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        return self.run_test(
            "Admin Login (Invalid)",
            "POST",
            "/admin/login",
            401,
            data={"email": "wrong@email.com", "password": "wrongpass"}
        )

    def test_create_submission(self) -> str:
        """Create a test submission and return its ID"""
        test_data = {
            "full_name": "Test Customer",
            "active_phone": "+234 800 123 4567",
            "alternative_phone": "+234 801 987 6543",
            "address": "123 Test Street, Victoria Island, Lagos State, Nigeria",
            "landmark": "Near Victoria Island Shopping Mall",
            "shoe_model": "Nike Air Max 270",
            "shoe_size": "42",
            "shoe_color": "Black",
            "buying_for": "Myself",
            "shopping_frequency": "Very often",
            "bought_shoes_online": "Yes",
            "buying_behavior": "I already know my size and pay immediately",
            "payment_readiness": "Cash ready on delivery",
            "delivery_availability": "Yes",
            "commitment_preference": "POD with small commitment fee",
            "confirmation": True
        }
        
        success, response = self.run_test(
            "Create Submission",
            "POST",
            "/submissions",
            200,
            data=test_data
        )
        
        if success and response and 'id' in response:
            # Verify scoring algorithm
            expected_score = 10 + 20 + 15 + 20 + 20 + 15 + 15 + 10  # = 125 (should be approved)
            actual_score = response.get('score', 0)
            
            if actual_score >= 70:
                self.log_test("Scoring Algorithm (High Score)", True, f"Score: {actual_score}, Status: {response.get('status')}")
            else:
                self.log_test("Scoring Algorithm (High Score)", False, f"Expected score >=70, got {actual_score}")
            
            return response['id']
        return None

    def test_create_low_score_submission(self) -> str:
        """Create a submission with low score"""
        low_score_data = {
            "full_name": "Low Score Customer",
            "active_phone": "+234 800 000 0000",
            "alternative_phone": "",
            "address": "Short Addr",  # Too short
            "landmark": "Lm",  # Too short
            "shoe_model": "Basic Shoe",
            "shoe_size": "40",
            "shoe_color": "White",
            "buying_for": "Myself",  # 10 points
            "shopping_frequency": "First time",  # 0 points
            "bought_shoes_online": "No",  # 0 points
            "buying_behavior": "I prefer testing and deciding before paying",  # -25 points
            "payment_readiness": "I may need time to arrange payment",  # -20 points
            "delivery_availability": "No",  # -10 points
            "commitment_preference": "POD without deposit",  # 0 points
            "confirmation": False  # 0 points
        }
        
        success, response = self.run_test(
            "Create Low Score Submission",
            "POST",
            "/submissions",
            200,
            data=low_score_data
        )
        
        if success and response:
            # Expected score: 10 + 0 + 0 + (-25) + (-20) + (-10) + 0 + 0 = -45
            # Should be "not_qualified" and have risk flags
            actual_score = response.get('score', 0)
            actual_status = response.get('status', '')
            actual_flags = response.get('flags', [])
            
            if actual_score < 45:
                self.log_test("Scoring Algorithm (Low Score)", True, f"Score: {actual_score}, Status: {actual_status}")
            else:
                self.log_test("Scoring Algorithm (Low Score)", False, f"Expected score <45, got {actual_score}")
                
            # Check for risk flags
            expected_flags = ['high_risk', 'payment_risk', 'incomplete_address', 'incomplete_landmark', 'weak_contact']
            found_flags = [flag for flag in expected_flags if flag in actual_flags]
            
            if len(found_flags) >= 3:
                self.log_test("Risk Flags Detection", True, f"Found flags: {found_flags}")
            else:
                self.log_test("Risk Flags Detection", False, f"Expected multiple flags, found: {actual_flags}")
                
            return response['id']
        return None

    def test_get_submissions(self):
        """Test getting all submissions"""
        return self.run_test("Get All Submissions", "GET", "/submissions", 200)

    def test_get_submissions_filtered(self):
        """Test getting filtered submissions"""
        # Test approved filter
        success1, _ = self.run_test("Get Approved Submissions", "GET", "/submissions?status=approved", 200)
        
        # Test flagged filter
        success2, _ = self.run_test("Get Flagged Submissions", "GET", "/submissions?flagged=true", 200)
        
        return success1 and success2

    def test_get_single_submission(self, submission_id: str):
        """Test getting single submission by ID"""
        if not submission_id:
            self.log_test("Get Single Submission", False, "No submission ID provided")
            return False
            
        return self.run_test(
            f"Get Single Submission ({submission_id[:8]})",
            "GET",
            f"/submissions/{submission_id}",
            200
        )

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        success, response = self.run_test("Dashboard Stats", "GET", "/dashboard/stats", 200)
        
        if success and response:
            required_fields = ['total', 'approved', 'deposit_required', 'not_qualified', 'high_risk']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.log_test("Dashboard Stats Structure", True, f"All fields present: {list(response.keys())}")
                
                # Verify data consistency
                total = response.get('total', 0)
                sum_statuses = response.get('approved', 0) + response.get('deposit_required', 0) + response.get('not_qualified', 0)
                
                if total >= sum_statuses:
                    self.log_test("Dashboard Stats Logic", True, f"Total: {total}, Sum: {sum_statuses}")
                else:
                    self.log_test("Dashboard Stats Logic", False, f"Total {total} < Sum {sum_statuses}")
            else:
                self.log_test("Dashboard Stats Structure", False, f"Missing fields: {missing_fields}")
        
        return success

    def test_delete_submission(self, submission_id: str):
        """Test deleting a submission"""
        if not submission_id:
            self.log_test("Delete Submission", False, "No submission ID provided")
            return False
            
        return self.run_test(
            f"Delete Submission ({submission_id[:8]})",
            "DELETE",
            f"/submissions/{submission_id}",
            200
        )

    def test_nonexistent_submission(self):
        """Test accessing non-existent submission"""
        fake_id = "nonexistent-id-12345"
        return self.run_test(
            "Non-existent Submission",
            "GET",
            f"/submissions/{fake_id}",
            404
        )

    def run_comprehensive_test_suite(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("🧪 SMART STORES POD API TEST SUITE")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_api_root():
            print("❌ CRITICAL: API not accessible. Stopping tests.")
            return False
            
        # Authentication tests
        self.test_admin_login_invalid()
        if not self.test_admin_login_valid():
            print("❌ CRITICAL: Admin login failed. Stopping tests.")
            return False
            
        # Submission creation and scoring tests
        high_score_id = self.test_create_submission()
        low_score_id = self.test_create_low_score_submission()
        
        # Retrieval tests
        self.test_get_submissions()
        self.test_get_submissions_filtered()
        
        if high_score_id:
            self.test_get_single_submission(high_score_id)
        if low_score_id:
            self.test_get_single_submission(low_score_id)
            
        # Dashboard tests
        self.test_dashboard_stats()
        
        # Error handling tests
        self.test_nonexistent_submission()
        
        # Cleanup (delete test submissions)
        if high_score_id:
            self.test_delete_submission(high_score_id)
        if low_score_id:
            self.test_delete_submission(low_score_id)
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  • {test['test_name']}: {test['details']}")
        
        return self.tests_passed == self.tests_run


def main():
    tester = SmartStoresPODAPITester()
    
    try:
        success = tester.run_comprehensive_test_suite()
        all_passed = tester.print_summary()
        
        # Save detailed results to file
        with open('/app/backend_api_test_results.json', 'w') as f:
            json.dump({
                'summary': {
                    'tests_run': tester.tests_run,
                    'tests_passed': tester.tests_passed,
                    'success_rate': tester.tests_passed/tester.tests_run*100 if tester.tests_run > 0 else 0,
                    'timestamp': datetime.now().isoformat()
                },
                'detailed_results': tester.test_results
            }, f, indent=2)
        
        return 0 if all_passed else 1
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())