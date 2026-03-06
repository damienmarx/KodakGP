import requests
import sys
import json
from datetime import datetime

class KodakGPAPITester:
    def __init__(self, base_url="https://complete-app-build-3.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_order_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if use_admin and self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                if response.content:
                    try:
                        error_detail = response.json().get('detail', 'No detail')
                        self.log(f"   Error: {error_detail}")
                    except:
                        self.log(f"   Response: {response.text[:200]}")

            return False, {}

        except requests.exceptions.Timeout:
            self.failed_tests.append(f"{name}: Request timeout")
            self.log(f"❌ {name} - Request timeout")
            return False, {}
        except Exception as e:
            self.failed_tests.append(f"{name}: {str(e)}")
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic API health"""
        return self.run_test("API Health Check", "GET", "/", 200)

    def test_seed_data(self):
        """Seed initial data"""
        return self.run_test("Seed Data", "POST", "/seed", 200)

    def test_market_stats(self):
        """Test market statistics endpoint"""
        return self.run_test("Market Stats", "GET", "/market/stats", 200)

    def test_gold_prices(self):
        """Test gold prices endpoint"""
        return self.run_test("Gold Prices", "GET", "/market/prices", 200)

    def test_get_products(self):
        """Test get all products"""
        return self.run_test("Get All Products", "GET", "/products", 200)

    def test_get_gold_products(self):
        """Test get gold products"""
        return self.run_test("Get Gold Products", "GET", "/products?category=gold", 200)

    def test_get_script_products(self):
        """Test get script products"""
        return self.run_test("Get Script Products", "GET", "/products?category=script", 200)

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        user_data = {
            "username": f"testuser_{timestamp}",
            "email": f"test_{timestamp}@example.com",
            "password": "TestPass123!"
        }
        success, response = self.run_test("User Registration", "POST", "/auth/register", 200, user_data)
        if success and response.get('access_token'):
            self.token = response['access_token']
            self.test_user_id = response.get('user', {}).get('id')
            self.log(f"   ✓ User registered with ID: {self.test_user_id}")
        return success, response

    def test_user_login(self):
        """Test user login with test credentials"""
        login_data = {
            "email": "test@example.com",
            "password": "password123"
        }
        success, response = self.run_test("User Login", "POST", "/auth/login", 200, login_data)
        return success, response

    def test_admin_login(self):
        """Test admin login"""
        admin_data = {
            "email": "admin@kodakgp.com",
            "password": "admin123"
        }
        success, response = self.run_test("Admin Login", "POST", "/auth/login", 200, admin_data)
        if success and response.get('access_token'):
            self.admin_token = response['access_token']
            self.log(f"   ✓ Admin logged in successfully")
        return success, response

    def test_get_user_profile(self):
        """Test get current user profile"""
        if not self.token:
            self.log("❌ No user token available for profile test")
            return False, {}
        return self.run_test("Get User Profile", "GET", "/auth/me", 200)

    def test_create_order(self):
        """Test creating an order"""
        if not self.token:
            self.log("❌ No user token available for order creation")
            return False, {}
        
        # First get available products
        success, products = self.run_test("Get Products for Order", "GET", "/products", 200)
        if not success or not products:
            self.log("❌ Cannot create order without products")
            return False, {}

        # Create order with first available product
        product = products[0]
        order_data = {
            "items": [{"product_id": product['id'], "quantity": 1}],
            "payment_method": "mock",
            "rsn": "TestPlayer123"
        }
        success, response = self.run_test("Create Order", "POST", "/orders", 200, order_data)
        if success and response.get('id'):
            self.test_order_id = response['id']
            self.log(f"   ✓ Order created with ID: {self.test_order_id}")
        return success, response

    def test_get_user_orders(self):
        """Test getting user orders"""
        if not self.token:
            self.log("❌ No user token available for orders test")
            return False, {}
        return self.run_test("Get User Orders", "GET", "/orders", 200)

    def test_admin_get_orders(self):
        """Test admin get all orders"""
        if not self.admin_token:
            self.log("❌ No admin token available for admin orders test")
            return False, {}
        return self.run_test("Admin Get Orders", "GET", "/admin/orders", 200, use_admin=True)

    def test_admin_get_users(self):
        """Test admin get all users"""
        if not self.admin_token:
            self.log("❌ No admin token available for admin users test")
            return False, {}
        return self.run_test("Admin Get Users", "GET", "/admin/users", 200, use_admin=True)

    def test_admin_update_order_status(self):
        """Test admin updating order status"""
        if not self.admin_token or not self.test_order_id:
            self.log("❌ No admin token or order ID available for status update test")
            return False, {}
        return self.run_test(
            "Admin Update Order Status", 
            "PUT", 
            f"/admin/orders/{self.test_order_id}/status?status=processing", 
            200, 
            use_admin=True
        )

def main():
    print("=" * 60)
    print("🏰 KodakGP OSRS Marketplace API Testing")
    print("=" * 60)
    
    tester = KodakGPAPITester()
    
    # Test sequence
    test_sequence = [
        ("API Health", tester.test_health_check),
        ("Seed Data", tester.test_seed_data),
        ("Market Stats", tester.test_market_stats),
        ("Gold Prices", tester.test_gold_prices),
        ("Get Products", tester.test_get_products),
        ("Get Gold Products", tester.test_get_gold_products),
        ("Get Script Products", tester.test_get_script_products),
        ("User Registration", tester.test_user_registration),
        ("Admin Login", tester.test_admin_login),
        ("Get User Profile", tester.test_get_user_profile),
        ("Create Order", tester.test_create_order),
        ("Get User Orders", tester.test_get_user_orders),
        ("Admin Get Orders", tester.test_admin_get_orders),
        ("Admin Get Users", tester.test_admin_get_users),
        ("Admin Update Order Status", tester.test_admin_update_order_status),
    ]

    print(f"\n🚀 Running {len(test_sequence)} API tests...\n")

    for test_name, test_func in test_sequence:
        try:
            test_func()
        except Exception as e:
            tester.log(f"❌ {test_name} - Unexpected error: {str(e)}")
            tester.failed_tests.append(f"{test_name}: Unexpected error - {str(e)}")

    # Print summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    print(f"✅ Tests Passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"❌ Tests Failed: {len(tester.failed_tests)}")
    
    if tester.failed_tests:
        print("\n🔥 Failed Tests:")
        for i, failure in enumerate(tester.failed_tests, 1):
            print(f"   {i}. {failure}")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"\n📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend API testing completed successfully!")
        return 0
    else:
        print("⚠️  Backend has significant issues that need attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())