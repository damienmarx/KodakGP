from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
SECRET_KEY = os.environ.get('JWT_SECRET', 'kodakgp-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

app = FastAPI(title="KodakGP API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ==================== MODELS ====================

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    username: str
    email: str
    is_admin: bool = False
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str  # gold, script, bundle
    amount: Optional[str] = None  # For gold: "1M", "10M", etc.
    features: List[str] = []
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    amount: Optional[str] = None
    features: List[str] = []

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemResponse(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    category: str
    amount: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[dict]
    total: float
    status: str = "pending"  # pending, processing, completed, cancelled
    payment_method: str = "mock"
    rsn: Optional[str] = None  # RuneScape Name for delivery
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class OrderCreate(BaseModel):
    items: List[CartItem]
    payment_method: str = "mock"
    rsn: Optional[str] = None

class MarketStats(BaseModel):
    total_gold_sold_24h: str = "1.2B"
    avg_delivery_time: str = "8.4min"
    customer_satisfaction: str = "98.7%"
    active_users: int = 0
    total_orders: int = 0

class GoldPrice(BaseModel):
    amount: str
    price: float
    updated_at: str

class SupportMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    username: str
    email: str
    message: str
    status: str = "open"  # open, in_progress, resolved
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SupportMessageCreate(BaseModel):
    username: str
    email: str
    message: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, is_admin: bool = False) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": user_id, "is_admin": is_admin, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user: dict = Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"$or": [{"email": data.email}, {"username": data.username}]})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "username": data.username,
        "email": data.email,
        "password": hash_password(data.password),
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            username=data.username,
            email=data.email,
            is_admin=False,
            created_at=user["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user.get("is_admin", False))
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            is_admin=user.get("is_admin", False),
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        is_admin=user.get("is_admin", False),
        created_at=user["created_at"]
    )

# ==================== PRODUCTS ROUTES ====================

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {"is_active": True}
    if category:
        query["category"] = category
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id, "is_active": True}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/admin/products", response_model=Product)
async def create_product(data: ProductCreate, admin: dict = Depends(get_admin_user)):
    product = Product(**data.model_dump())
    await db.products.insert_one(product.model_dump())
    return product

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, data: ProductCreate, admin: dict = Depends(get_admin_user)):
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": data.model_dump()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return product

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": {"is_active": False}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ==================== ORDERS ROUTES ====================

@api_router.post("/orders", response_model=Order)
async def create_order(data: OrderCreate, user: dict = Depends(get_current_user)):
    items_with_details = []
    total = 0.0
    
    for item in data.items:
        product = await db.products.find_one({"id": item.product_id, "is_active": True}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        item_total = product["price"] * item.quantity
        total += item_total
        items_with_details.append({
            "product_id": product["id"],
            "name": product["name"],
            "price": product["price"],
            "quantity": item.quantity,
            "category": product["category"],
            "amount": product.get("amount")
        })
    
    order = Order(
        user_id=user["id"],
        items=items_with_details,
        total=total,
        payment_method=data.payment_method,
        rsn=data.rsn
    )
    await db.orders.insert_one(order.model_dump())
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_user_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(status: Optional[str] = None, admin: dict = Depends(get_admin_user)):
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, admin: dict = Depends(get_admin_user)):
    if status not in ["pending", "processing", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": f"Order status updated to {status}"}

# ==================== MARKET STATS ====================

@api_router.get("/market/stats", response_model=MarketStats)
async def get_market_stats():
    total_orders = await db.orders.count_documents({})
    active_users = await db.users.count_documents({})
    return MarketStats(
        total_gold_sold_24h="1.2B",
        avg_delivery_time="8.4min",
        customer_satisfaction="98.7%",
        active_users=active_users,
        total_orders=total_orders
    )

@api_router.get("/market/prices", response_model=List[GoldPrice])
async def get_gold_prices():
    # Live prices simulation
    now = datetime.now(timezone.utc).isoformat()
    return [
        GoldPrice(amount="1M", price=0.65, updated_at=now),
        GoldPrice(amount="10M", price=6.20, updated_at=now),
        GoldPrice(amount="50M", price=30.00, updated_at=now),
        GoldPrice(amount="100M", price=58.00, updated_at=now),
        GoldPrice(amount="500M", price=280.00, updated_at=now),
        GoldPrice(amount="1B", price=550.00, updated_at=now),
    ]

# ==================== SUPPORT ====================

@api_router.post("/support", response_model=SupportMessage)
async def create_support_message(data: SupportMessageCreate, user: dict = Depends(get_current_user)):
    message = SupportMessage(
        user_id=user["id"],
        username=data.username,
        email=data.email,
        message=data.message
    )
    await db.support_messages.insert_one(message.model_dump())
    return message

@api_router.get("/admin/support", response_model=List[SupportMessage])
async def get_support_messages(status: Optional[str] = None, admin: dict = Depends(get_admin_user)):
    query = {}
    if status:
        query["status"] = status
    messages = await db.support_messages.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return messages

@api_router.put("/admin/support/{message_id}/status")
async def update_support_status(message_id: str, status: str, admin: dict = Depends(get_admin_user)):
    if status not in ["open", "in_progress", "resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.support_messages.update_one(
        {"id": message_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": f"Support status updated to {status}"}

# ==================== ADMIN USERS ====================

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

@api_router.put("/admin/users/{user_id}/admin")
async def toggle_admin(user_id: str, is_admin: bool, admin: dict = Depends(get_admin_user)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_admin": is_admin}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"Admin status updated"}

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    existing = await db.products.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded"}
    
    # Seed products
    gold_products = [
        Product(name="Starter Pack", description="Perfect for new adventurers looking to get started", price=0.65, category="gold", amount="1M", features=["Instant Delivery", "24/7 Support"]),
        Product(name="Adventurer Bundle", description="Great value for serious players", price=6.20, category="gold", amount="10M", features=["5-15 min Delivery", "Priority Support", "10% Bonus"]),
        Product(name="Wealthy Merchant", description="For players looking to make big purchases", price=30.00, category="gold", amount="50M", features=["Express Delivery", "VIP Support", "15% Bonus"]),
        Product(name="King's Ransom", description="The ultimate gold package for serious traders", price=58.00, category="gold", amount="100M", features=["Instant Delivery", "Dedicated Agent", "20% Bonus"]),
        Product(name="Dragon Hoard", description="Massive gold package for elite players", price=280.00, category="gold", amount="500M", features=["Instant Delivery", "Personal Manager", "25% Bonus"]),
        Product(name="Billionaire Bundle", description="The ultimate wealth package", price=550.00, category="gold", amount="1B", features=["VIP Express", "Personal Manager", "30% Bonus"]),
    ]
    
    script_products = [
        Product(name="Duel Arena Script", description="Advanced staking script with multiple game modes and GE trade announcements.", price=49.99, category="script", features=["Auto-stake", "Risk Management", "GE Integration", "Lifetime Updates"]),
        Product(name="PvP Script", description="Comprehensive PvP utility with gear switching, prayer flicking, and special attack management.", price=39.99, category="script", features=["Gear Switch", "Prayer Flicking", "Spec Management", "Anti-PK"]),
        Product(name="Skilling Bundle", description="Collection of 12 skilling scripts for all major money-making methods.", price=79.99, category="script", features=["12 Scripts", "All Skills", "Anti-Ban", "Auto-Banking"]),
        Product(name="Boss Slayer", description="Automated boss killing for maximum profit.", price=69.99, category="script", features=["All Bosses", "Gear Setup", "Food Management", "Banking"]),
        Product(name="Agility Pro", description="Efficient agility training with perfect clicks.", price=29.99, category="script", features=["All Courses", "Mark Collection", "Perfect Timing"]),
    ]
    
    for product in gold_products + script_products:
        await db.products.insert_one(product.model_dump())
    
    # Create admin user
    admin_exists = await db.users.find_one({"email": "admin@kodakgp.com"})
    if not admin_exists:
        admin_user = {
            "id": str(uuid.uuid4()),
            "username": "admin",
            "email": "admin@kodakgp.com",
            "password": hash_password("admin123"),
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
    
    return {"message": "Data seeded successfully"}

@api_router.get("/")
async def root():
    return {"message": "KodakGP API - OSRS Gold & Scripts Marketplace"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
