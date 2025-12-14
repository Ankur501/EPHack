#!/usr/bin/env python3

import requests
import sys
import json
import time
from datetime import datetime
from pathlib import Path

class EPQuotientAPITester:
    def __init__(self, base_url="https://epquotient-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = "session_715dbc2d083042dba4122d189f6b55e4"  # Use provided test token
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
    def log_result(self, test_name, success, details="", error=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            
        result = {
            "test_name": test_name,
            "success": success,
            "details": details,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"    Details: {details}")
        if error:
            print(f"    Error: {error}")
        print()

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'
            
        if files:
            # Remove Content-Type for file uploads
            headers.pop('Content-Type', None)

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            
            try:
                response_data = response.json() if response.content else {}
            except:
                response_data = {"raw_response": response.text[:200]}

            details = f"Status: {response.status_code}, Response: {str(response_data)[:200]}"
            error = "" if success else f"Expected {expected_status}, got {response.status_code}"
            
            self.log_result(name, success, details, error)
            return success, response_data

        except Exception as e:
            self.log_result(name, False, "", str(e))
            return False, {}

    def test_auth_signup(self):
        """Test user signup"""
        test_email = f"test_{int(time.time())}@example.com"
        test_data = {
            "email": test_email,
            "name": "Test User",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Auth - Signup",
            "POST",
            "auth/signup",
            200,
            data=test_data
        )
        
        if success and 'session_token' in response:
            self.session_token = response['session_token']
            return True, test_email
        return False, None

    def test_auth_login(self, email="uitest_golden@test.com"):
        """Test user login with provided test credentials"""
        login_data = {
            "email": email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Auth - Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'session_token' in response:
            self.session_token = response['session_token']
            return True
        return False

    def test_auth_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Auth - Get Me",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_google_auth_redirect(self):
        """Test Google auth redirect"""
        success, response = self.run_test(
            "Auth - Google Redirect",
            "GET",
            "auth/google-redirect",
            200
        )
        return success

    def test_video_upload(self):
        """Test video upload with dummy file"""
        # Create a small dummy video file
        dummy_content = b"dummy video content for testing"
        files = {
            'file': ('test_video.mp4', dummy_content, 'video/mp4')
        }
        
        success, response = self.run_test(
            "Video - Upload",
            "POST",
            "videos/upload",
            200,
            files=files
        )
        
        if success and 'video_id' in response:
            return True, response['video_id']
        return False, None

    def test_video_process(self, video_id):
        """Test video processing"""
        success, response = self.run_test(
            "Video - Process",
            "POST",
            f"videos/{video_id}/process",
            200
        )
        
        if success and 'job_id' in response:
            return True, response['job_id']
        return False, None

    def test_job_status(self, job_id):
        """Test job status check with detailed status tracking"""
        success, response = self.run_test(
            "Jobs - Get Status",
            "GET",
            f"jobs/{job_id}/status",
            200
        )
        
        if success and response:
            status = response.get('status', 'unknown')
            progress = response.get('progress', 0)
            current_step = response.get('current_step', 'N/A')
            report_id = response.get('report_id')
            
            print(f"    Job Status: {status}, Progress: {progress}%, Step: {current_step}")
            if report_id:
                print(f"    Report ID: {report_id}")
                return True, report_id
        
        return success, None

    def test_reports_list(self):
        """Test list reports"""
        success, response = self.run_test(
            "Reports - List",
            "GET",
            "reports",
            200
        )
        return success

    def test_learning_daily_tip(self):
        """Test daily tip endpoint"""
        success, response = self.run_test(
            "Learning - Daily Tip",
            "GET",
            "learning/daily-tip",
            200
        )
        return success

    def test_learning_ted_talks(self):
        """Test TED talks endpoint"""
        success, response = self.run_test(
            "Learning - TED Talks",
            "GET",
            "learning/ted-talks",
            200
        )
        return success

    def test_training_modules(self):
        """Test training modules list"""
        success, response = self.run_test(
            "Training - Modules List",
            "GET",
            "training/modules",
            200
        )
        return success

    def test_training_module_content(self, module_id="strategic-pauses"):
        """Test specific training module content"""
        success, response = self.run_test(
            f"Training - Module Content ({module_id})",
            "GET",
            f"training/modules/{module_id}",
            200
        )
        return success

    def test_coaching_request(self):
        """Test coaching request creation"""
        coaching_data = {
            "name": "John Executive",
            "email": "john.exec@company.com",
            "goal": "Improve executive presence in board meetings",
            "preferred_times": "Weekday mornings",
            "notes": "Looking to enhance gravitas and communication skills"
        }
        
        success, response = self.run_test(
            "Coaching - Create Request",
            "POST",
            "coaching/requests",
            200,
            data=coaching_data
        )
        
        if success and 'request_id' in response:
            return True, response['request_id']
        return False, None

    def test_create_share_link(self, report_id):
        """Test creating a share link for a report"""
        success, response = self.run_test(
            "Sharing - Create Share Link",
            "POST",
            f"reports/{report_id}/share",
            200
        )
        
        if success and 'share_id' in response:
            return True, response['share_id']
        return False, None

    def test_get_shared_report(self, share_id):
        """Test getting a shared report"""
        success, response = self.run_test(
            "Sharing - Get Shared Report",
            "GET",
            f"shared/reports/{share_id}",
            200
        )
        return success

    def test_auth_logout(self):
        """Test logout"""
        success, response = self.run_test(
            "Auth - Logout",
            "POST",
            "auth/logout",
            200
        )
        return success

    def run_all_tests(self):
        """Run comprehensive test suite as per review request"""
        print("🚀 Starting EP Quotient API Tests - Backend End-to-End")
        print("=" * 60)
        
        # 1) Auth tests
        print("\n📋 1) AUTH TESTS")
        print("-" * 30)
        signup_success, test_email = self.test_auth_signup()
        if not signup_success:
            print("❌ Signup failed - stopping auth tests")
            return self.generate_summary()
            
        login_success = self.test_auth_login(test_email)
        if not login_success:
            print("❌ Login failed - stopping tests")
            return self.generate_summary()
            
        # Test /auth/me without password_hash
        self.test_auth_me()
        
        # 2) Feature endpoints
        print("\n📋 2) FEATURE ENDPOINTS")
        print("-" * 30)
        self.test_learning_daily_tip()
        self.test_learning_ted_talks()
        self.test_training_modules()
        self.test_training_module_content("strategic-pauses")
        
        # 3) Coaching + sharing
        print("\n📋 3) COACHING + SHARING")
        print("-" * 30)
        coaching_success, request_id = self.test_coaching_request()
        
        # Try to create share link - need a report first
        # Check if any reports exist
        reports_success, reports_response = self.run_test(
            "Reports - Check Existing",
            "GET", 
            "reports",
            200
        )
        
        share_id = None
        if reports_success and reports_response.get('reports'):
            # Use first available report
            report_id = reports_response['reports'][0]['report_id']
            share_success, share_id = self.test_create_share_link(report_id)
            if share_success and share_id:
                self.test_get_shared_report(share_id)
        else:
            print("⚠️  No existing reports found - skipping share link test as requested")
        
        # 4) Video processing
        print("\n📋 4) VIDEO PROCESSING")
        print("-" * 30)
        upload_success, video_id = self.test_video_upload()
        if upload_success and video_id:
            process_success, job_id = self.test_video_process(video_id)
            if process_success and job_id:
                # Poll job status a few times
                for i in range(3):
                    print(f"    Polling job status (attempt {i+1}/3)...")
                    job_success = self.test_job_status(job_id)
                    if job_success:
                        time.sleep(2)  # Wait between polls
                    else:
                        break
        
        # Test logout
        print("\n📋 CLEANUP")
        print("-" * 30)
        self.test_auth_logout()
        
        return self.generate_summary()

    def generate_summary(self):
        """Generate test summary"""
        print("=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
        else:
            print("⚠️  Some tests failed. Check details above.")
            
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "test_results": self.test_results
        }

def main():
    tester = EPQuotientAPITester()
    summary = tester.run_all_tests()
    
    # Save results to file
    results_file = Path("/app/test_reports/backend_test_results.json")
    with open(results_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n📄 Results saved to: {results_file}")
    
    # Return appropriate exit code
    return 0 if summary["success_rate"] == 100 else 1

if __name__ == "__main__":
    sys.exit(main())