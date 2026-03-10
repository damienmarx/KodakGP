# KodakGP - OSRS Gold & Scripts Marketplace

Premium OSRS gold and automation scripts marketplace. Secure trading, competitive prices, and elite tools for Old School RuneScape.

**Affiliate of [Cloutscape.org](https://cloutscape.org)**

---

## 🎮 Features

- **Gold Marketplace** - Buy OSRS gold packages (1M to 1B)
- **Scripts Store** - Premium automation scripts (PvP, Skilling, Boss Slayer)
- **Live Price Ticker** - Real-time gold price updates
- **User Accounts** - Registration, login, order history
- **Admin Panel** - Manage products, orders, users
- **Market Statistics** - Live stats and analytics
- **Shopping Cart** - Full e-commerce checkout flow

---

## 🛠 Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide Icons
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **Auth**: JWT tokens with bcrypt

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/damienmarx/KodakGP.git
cd KodakGP

# Backend setup
cd backend
pip install -r requirements.txt
cp .env.example .env  # Configure your MongoDB URL
uvicorn server:app --reload --port 8001

# Frontend setup (new terminal)
cd frontend
yarn install
yarn start
```

---

## 🔐 Default Credentials

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@kodakgp.com   | admin123  |

---

## 📋 TODO: Cloutscape.org Affiliate Integration

### Phase 1: Branding & Links
- [ ] Add Cloutscape.org logo in header/footer
- [ ] Add "Powered by Cloutscape" badge
- [ ] Link back to cloutscape.org on all pages
- [ ] Add Cloutscape affiliate ID to tracking URLs
- [ ] Update meta tags with Cloutscape partnership info

### Phase 2: Revenue Sharing Setup
- [ ] Implement affiliate tracking system
- [ ] Add referral code parameter (`?ref=cloutscape`)
- [ ] Track conversions from Cloutscape referrals
- [ ] Create affiliate dashboard for Cloutscape admins
- [ ] Set up commission calculation (% per sale)

### Phase 3: Unified Account System
- [ ] Integrate Cloutscape OAuth/SSO login
- [ ] Sync user accounts between platforms
- [ ] Share user wallet/balance across sites
- [ ] Implement single sign-on (SSO)

### Phase 4: Cross-Platform Features
- [ ] Add Cloutscape API integration
- [ ] Display Cloutscape promotions/banners
- [ ] Sync inventory/products with Cloutscape
- [ ] Implement cross-platform notifications
- [ ] Add Cloutscape Discord bot integration

### Phase 5: Payment & Fulfillment
- [ ] Integrate Cloutscape payment gateway
- [ ] Share payment methods (Crypto, PayPal, etc.)
- [ ] Unified order management system
- [ ] Cross-platform delivery coordination
- [ ] Implement shared support ticket system

### Phase 6: Marketing & SEO
- [ ] Add Cloutscape backlinks for SEO
- [ ] Cross-promote on both platforms
- [ ] Shared email marketing campaigns
- [ ] Joint Discord announcements
- [ ] Unified loyalty/rewards program

---

## 📁 Project Structure

```
KodakGP/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Component styles
│   │   └── index.css      # Global styles + Tailwind
│   ├── package.json       # Node dependencies
│   └── .env               # Frontend config
└── README.md
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/products` | List all products |
| GET | `/api/products?category=gold` | Filter by category |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | User's orders |
| GET | `/api/market/prices` | Live gold prices |
| GET | `/api/market/stats` | Market statistics |
| GET | `/api/admin/orders` | All orders (admin) |
| GET | `/api/admin/users` | All users (admin) |

---

## 🤝 Cloutscape Partnership

KodakGP is a proud affiliate of **Cloutscape.org**. 

For partnership inquiries or integration support, contact the Cloutscape team.

---

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with 💛 for the OSRS community**
