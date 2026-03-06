import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import {
  ShoppingCart, Menu, X, User, LogOut, Package, Settings,
  Coins, Code, BookOpen, BarChart3, ChevronRight, Star,
  Clock, Shield, Zap, TrendingUp, Users, CheckCircle,
  Plus, Minus, Trash2, CreditCard, MessageSquare, Search,
  Home, Crown, Sword, Scroll
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== CONTEXT ====================
const AuthContext = createContext(null);
const CartContext = createContext(null);

const useAuth = () => useContext(AuthContext);
const useCart = () => useContext(CartContext);

// ==================== API ====================
const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ==================== COMPONENTS ====================

// Price Ticker
const PriceTicker = ({ prices }) => {
  const items = [...prices, ...prices];
  return (
    <div className="ticker-wrap py-2">
      <div className="ticker">
        {items.map((p, i) => (
          <div key={i} className="flex items-center gap-6 px-8 whitespace-nowrap">
            <span className="text-[var(--gold)] font-heading font-semibold">{p.amount} OSRS Gold</span>
            <span className="text-white font-bold">${p.price.toFixed(2)}</span>
            <span className="text-[var(--text-muted)]">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Navigation
const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[var(--bg-app)]/95 backdrop-blur-lg shadow-lg" : "bg-transparent"}`} data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" data-testid="logo">
            <Crown className="w-8 h-8 text-[var(--gold)]" />
            <span className="font-display text-xl font-bold text-gradient-gold">KodakGP</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/gold" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors" data-testid="nav-gold">
              <Coins className="w-4 h-4" /> Gold
            </Link>
            <Link to="/scripts" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors" data-testid="nav-scripts">
              <Code className="w-4 h-4" /> Scripts
            </Link>
            <Link to="/methods" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors" data-testid="nav-methods">
              <BookOpen className="w-4 h-4" /> Methods
            </Link>
            <Link to="/stats" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors" data-testid="nav-stats">
              <BarChart3 className="w-4 h-4" /> Stats
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2 hover:bg-white/5 rounded-lg transition-colors" data-testid="cart-btn">
              <ShoppingCart className="w-5 h-5 text-[var(--text-secondary)]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--gold)] text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors" data-testid="dashboard-btn">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Link>
                {user.is_admin && (
                  <Link to="/admin" className="text-[var(--gold)] hover:text-[var(--gold-hover)] transition-colors" data-testid="admin-btn">
                    <Settings className="w-5 h-5" />
                  </Link>
                )}
                <button onClick={logout} className="p-2 hover:bg-white/5 rounded-lg transition-colors" data-testid="logout-btn">
                  <LogOut className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-gold px-4 py-2 text-sm" data-testid="login-btn">
                Login
              </Link>
            )}

            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} data-testid="menu-toggle">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border-default)]">
            <div className="flex flex-col gap-4">
              <Link to="/gold" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-[var(--text-secondary)]">
                <Coins className="w-4 h-4" /> Gold
              </Link>
              <Link to="/scripts" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-[var(--text-secondary)]">
                <Code className="w-4 h-4" /> Scripts
              </Link>
              <Link to="/methods" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-[var(--text-secondary)]">
                <BookOpen className="w-4 h-4" /> Methods
              </Link>
              <Link to="/stats" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-[var(--text-secondary)]">
                <BarChart3 className="w-4 h-4" /> Stats
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Hero Section
const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-app)]/50 to-[var(--bg-app)]" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1759545809864-f5f766827780?w=1920)` }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold)]/10 border border-[var(--gold)]/20 rounded-full mb-8">
          <span className="live-indicator text-sm text-[var(--gold)]">LIVE</span>
        </div>
        
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
          <span className="text-gradient-gold">PREMIUM OSRS</span>
          <br />
          <span className="text-white">GOLD & SCRIPTS</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
          Secure trading, competitive prices, and elite automation tools for Old School RuneScape. 
          Join thousands of satisfied customers.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate("/gold")} className="btn-gold px-8 py-4 text-lg flex items-center gap-2" data-testid="buy-gold-btn">
            <Coins className="w-5 h-5" /> Buy Gold Now
          </button>
          <button onClick={() => navigate("/scripts")} className="btn-runite px-8 py-4 text-lg flex items-center gap-2" data-testid="browse-scripts-btn">
            <Code className="w-5 h-5" /> Browse Scripts
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--gold)]">5-15</div>
            <div className="text-sm text-[var(--text-muted)]">Min Delivery</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--gold)]">24/7</div>
            <div className="text-sm text-[var(--text-muted)]">Support</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--gold)]">98.7%</div>
            <div className="text-sm text-[var(--text-muted)]">Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Product Card
const ProductCard = ({ product, onAddToCart }) => {
  const isGold = product.category === "gold";
  
  return (
    <div className="card-product p-6 flex flex-col h-full gold-glow-hover" data-testid={`product-${product.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-heading text-lg font-semibold text-white mb-1">{product.name}</h3>
          {isGold && <span className="text-[var(--gold)] text-sm font-medium">{product.amount} OSRS Gold</span>}
        </div>
        {isGold ? <Coins className="w-8 h-8 text-[var(--gold)]" /> : <Code className="w-8 h-8 text-[var(--runite)]" />}
      </div>
      
      <p className="text-[var(--text-secondary)] text-sm mb-4 flex-grow">{product.description}</p>
      
      {product.features?.length > 0 && (
        <ul className="mb-4 space-y-2">
          {product.features.slice(0, 3).map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <CheckCircle className="w-4 h-4 text-[var(--magic)]" /> {f}
            </li>
          ))}
        </ul>
      )}
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-default)]">
        <span className="text-2xl font-bold text-white">${product.price.toFixed(2)}</span>
        <button 
          onClick={() => onAddToCart(product)} 
          className="btn-gold px-4 py-2 text-sm flex items-center gap-2"
          data-testid={`add-to-cart-${product.id}`}
        >
          <Plus className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </div>
  );
};

// ==================== PAGES ====================

// Home Page
const HomePage = ({ prices }) => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, statsRes] = await Promise.all([
          api.get("/products"),
          api.get("/market/stats")
        ]);
        setProducts(productsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const goldProducts = products.filter(p => p.category === "gold").slice(0, 4);
  const scriptProducts = products.filter(p => p.category === "script").slice(0, 3);

  return (
    <div className="min-h-screen" data-testid="home-page">
      <Hero />
      
      {/* Live Prices */}
      <section className="py-16 bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl font-bold text-white">Live Gold Prices</h2>
            <span className="live-indicator text-[var(--gold)]">LIVE</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {prices.map((p, i) => (
              <div key={i} className="card-glass p-4 text-center">
                <div className="text-[var(--gold)] font-bold text-lg">{p.amount}</div>
                <div className="text-white font-bold text-xl">${p.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gold */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
              <Coins className="w-6 h-6 text-[var(--gold)]" /> Gold Packages
            </h2>
            <Link to="/gold" className="text-[var(--gold)] hover:text-[var(--gold-hover)] flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {goldProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Scripts */}
      <section className="py-16 bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
              <Code className="w-6 h-6 text-[var(--runite)]" /> Premium Scripts
            </h2>
            <Link to="/scripts" className="text-[var(--gold)] hover:text-[var(--gold-hover)] flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scriptProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-white text-center mb-12">Market Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="card-glass p-6 text-center">
                <TrendingUp className="w-8 h-8 text-[var(--gold)] mx-auto mb-3" />
                <div className="text-3xl font-bold text-white">{stats.total_gold_sold_24h}</div>
                <div className="text-[var(--text-muted)] text-sm">Gold Sold (24h)</div>
              </div>
              <div className="card-glass p-6 text-center">
                <Clock className="w-8 h-8 text-[var(--runite)] mx-auto mb-3" />
                <div className="text-3xl font-bold text-white">{stats.avg_delivery_time}</div>
                <div className="text-[var(--text-muted)] text-sm">Avg Delivery</div>
              </div>
              <div className="card-glass p-6 text-center">
                <Star className="w-8 h-8 text-[var(--gold)] mx-auto mb-3" />
                <div className="text-3xl font-bold text-white">{stats.customer_satisfaction}</div>
                <div className="text-[var(--text-muted)] text-sm">Satisfaction</div>
              </div>
              <div className="card-glass p-6 text-center">
                <Users className="w-8 h-8 text-[var(--runite)] mx-auto mb-3" />
                <div className="text-3xl font-bold text-white">{stats.active_users}+</div>
                <div className="text-[var(--text-muted)] text-sm">Active Users</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="py-16 bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--gold)]/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-[var(--gold)]" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-white">Secure Trading</h3>
                <p className="text-[var(--text-muted)] text-sm">100% safe transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--runite)]/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-[var(--runite)]" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-white">Fast Delivery</h3>
                <p className="text-[var(--text-muted)] text-sm">5-15 minutes average</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--magic)]/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[var(--magic)]" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-white">24/7 Support</h3>
                <p className="text-[var(--text-muted)] text-sm">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Gold Page
const GoldPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products?category=gold");
        setProducts(res.data);
      } catch (err) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="gold-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-gradient-gold mb-4">OSRS Gold Packages</h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Choose from our selection of gold packages. All transactions are secure with fast delivery guaranteed.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card-product p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded mb-4 w-3/4" />
                <div className="h-4 bg-white/10 rounded mb-2" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Scripts Page
const ScriptsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products?category=script");
        setProducts(res.data);
      } catch (err) {
        toast.error("Failed to load scripts");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="scripts-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">
            <span className="text-[var(--runite)]">Premium</span>{" "}
            <span className="text-white">Scripts</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Elite automation tools for Old School RuneScape. All scripts include lifetime updates and support.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="card-product p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded mb-4 w-3/4" />
                <div className="h-4 bg-white/10 rounded mb-2" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Methods Page
const MethodsPage = () => {
  const methods = [
    { name: "Vorkath Farming", gp: "2-3M GP/hr", difficulty: "Medium", requirements: "DS2 Complete, 90+ Combat", icon: Sword },
    { name: "Chambers of Xeric", gp: "3-5M GP/hr", difficulty: "Hard", requirements: "Team, 90+ Stats", icon: Users },
    { name: "Theatre of Blood", gp: "4-6M GP/hr", difficulty: "Very Hard", requirements: "Elite Gear, 99 Combat", icon: Crown },
    { name: "Zulrah", gp: "2-3M GP/hr", difficulty: "Medium", requirements: "Regicide, 85+ Magic/Range", icon: Scroll },
    { name: "Gauntlet", gp: "3-4M GP/hr", difficulty: "Hard", requirements: "SOTE, High Combat", icon: Shield },
    { name: "Nightmare", gp: "2-4M GP/hr", difficulty: "Hard", requirements: "Team, 90+ Stats", icon: Star },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="methods-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-gradient-gold mb-4">Gold Making Methods</h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Learn the best methods to make gold in Old School RuneScape. From beginner to advanced.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method, i) => (
            <div key={i} className="card-product p-6">
              <div className="flex items-start justify-between mb-4">
                <method.icon className="w-10 h-10 text-[var(--gold)]" />
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  method.difficulty === "Medium" ? "bg-[var(--runite)]/20 text-[var(--runite)]" :
                  method.difficulty === "Hard" ? "bg-[var(--gold)]/20 text-[var(--gold)]" :
                  "bg-[var(--dragon)]/20 text-red-400"
                }`}>
                  {method.difficulty}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold text-white mb-2">{method.name}</h3>
              <div className="text-[var(--gold)] font-bold text-xl mb-2">{method.gp}</div>
              <p className="text-[var(--text-muted)] text-sm">{method.requirements}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Stats Page
const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, pricesRes] = await Promise.all([
          api.get("/market/stats"),
          api.get("/market/prices")
        ]);
        setStats(statsRes.data);
        setPrices(pricesRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="stats-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-gradient-gold mb-4">Market Statistics</h1>
          <p className="text-[var(--text-secondary)]">Real-time market data and analytics</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="card-glass p-6 text-center">
              <TrendingUp className="w-10 h-10 text-[var(--gold)] mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-1">{stats.total_gold_sold_24h}</div>
              <div className="text-[var(--text-muted)]">Gold Sold (24h)</div>
            </div>
            <div className="card-glass p-6 text-center">
              <Clock className="w-10 h-10 text-[var(--runite)] mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-1">{stats.avg_delivery_time}</div>
              <div className="text-[var(--text-muted)]">Avg Delivery</div>
            </div>
            <div className="card-glass p-6 text-center">
              <Star className="w-10 h-10 text-[var(--gold)] mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-1">{stats.customer_satisfaction}</div>
              <div className="text-[var(--text-muted)]">Satisfaction</div>
            </div>
            <div className="card-glass p-6 text-center">
              <Package className="w-10 h-10 text-[var(--runite)] mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-1">{stats.total_orders}</div>
              <div className="text-[var(--text-muted)]">Total Orders</div>
            </div>
          </div>
        )}

        <div className="card-glass p-8">
          <h2 className="font-heading text-xl font-bold text-white mb-6">Current Gold Prices</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="text-left py-3 px-4 text-[var(--text-muted)]">Amount</th>
                  <th className="text-right py-3 px-4 text-[var(--text-muted)]">Price (USD)</th>
                  <th className="text-right py-3 px-4 text-[var(--text-muted)]">Per 1M</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p, i) => {
                  const amount = parseFloat(p.amount.replace(/[^0-9.]/g, ''));
                  const multiplier = p.amount.includes('B') ? 1000 : 1;
                  const perMil = p.price / (amount * multiplier);
                  return (
                    <tr key={i} className="border-b border-[var(--border-default)]/50 hover:bg-white/5">
                      <td className="py-4 px-4">
                        <span className="text-[var(--gold)] font-semibold">{p.amount}</span>
                      </td>
                      <td className="text-right py-4 px-4 text-white font-bold">${p.price.toFixed(2)}</td>
                      <td className="text-right py-4 px-4 text-[var(--text-secondary)]">${perMil.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cart Page
const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rsn, setRsn] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }

    if (!rsn.trim()) {
      toast.error("Please enter your RuneScape Name for delivery");
      return;
    }

    setLoading(true);
    try {
      const items = cart.map(item => ({ product_id: item.id, quantity: item.quantity }));
      await api.post("/orders", { items, rsn });
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center" data-testid="empty-cart">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
          <p className="text-[var(--text-secondary)] mb-6">Add some items to get started</p>
          <button onClick={() => navigate("/gold")} className="btn-gold px-6 py-3">
            Browse Gold
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="cart-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-gradient-gold mb-8">Your Cart</h1>

        <div className="space-y-4 mb-8">
          {cart.map(item => (
            <div key={item.id} className="card-glass p-4 flex items-center gap-4" data-testid={`cart-item-${item.id}`}>
              <div className="w-12 h-12 bg-[var(--gold)]/20 rounded-lg flex items-center justify-center">
                {item.category === "gold" ? <Coins className="w-6 h-6 text-[var(--gold)]" /> : <Code className="w-6 h-6 text-[var(--runite)]" />}
              </div>
              <div className="flex-grow">
                <h3 className="font-heading font-semibold text-white">{item.name}</h3>
                {item.amount && <span className="text-[var(--gold)] text-sm">{item.amount}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white/10 rounded" data-testid={`decrease-${item.id}`}>
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-white/10 rounded" data-testid={`increase-${item.id}`}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-right">
                <div className="font-bold text-white">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="p-2 hover:bg-red-500/20 rounded text-red-400" data-testid={`remove-${item.id}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="card-glass p-6">
          <div className="mb-6">
            <label className="block text-[var(--text-secondary)] text-sm mb-2">RuneScape Name (RSN) for Delivery</label>
            <input
              type="text"
              value={rsn}
              onChange={(e) => setRsn(e.target.value)}
              placeholder="Enter your RSN"
              className="w-full px-4 py-3 rounded-lg"
              data-testid="rsn-input"
            />
          </div>

          <div className="flex items-center justify-between py-4 border-t border-[var(--border-default)]">
            <span className="text-xl font-heading font-semibold text-white">Total</span>
            <span className="text-2xl font-bold text-[var(--gold)]">${getTotal().toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full btn-gold py-4 text-lg flex items-center justify-center gap-2 mt-4"
            data-testid="checkout-btn"
          >
            {loading ? "Processing..." : <><CreditCard className="w-5 h-5" /> Proceed to Checkout</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// Auth Pages
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center" data-testid="login-page">
      <div className="w-full max-w-md px-4">
        <div className="card-glass p-8">
          <div className="text-center mb-8">
            <Crown className="w-12 h-12 text-[var(--gold)] mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-gradient-gold">Welcome Back</h1>
            <p className="text-[var(--text-secondary)] mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[var(--text-secondary)] text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                required
                data-testid="login-email"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                required
                data-testid="login-password"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-gold py-3 mt-4" data-testid="login-submit">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-[var(--text-secondary)] mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[var(--gold)] hover:text-[var(--gold-hover)]">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(username, email, password);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center" data-testid="register-page">
      <div className="w-full max-w-md px-4">
        <div className="card-glass p-8">
          <div className="text-center mb-8">
            <Crown className="w-12 h-12 text-[var(--gold)] mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-gradient-gold">Join KodakGP</h1>
            <p className="text-[var(--text-secondary)] mt-2">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[var(--text-secondary)] text-sm mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                required
                data-testid="register-username"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                required
                data-testid="register-email"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                required
                data-testid="register-password"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-gold py-3 mt-4" data-testid="register-submit">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[var(--text-secondary)] mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[var(--gold)] hover:text-[var(--gold-hover)]">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Dashboard Page
const DashboardPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    const classes = {
      pending: "badge-pending",
      processing: "badge-processing",
      completed: "badge-completed",
      cancelled: "badge-cancelled"
    };
    return `px-3 py-1 text-xs font-medium rounded-full ${classes[status] || classes.pending}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="dashboard-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient-gold">Dashboard</h1>
            <p className="text-[var(--text-secondary)]">Welcome back, {user?.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-glass p-6">
            <User className="w-8 h-8 text-[var(--gold)] mb-4" />
            <h3 className="font-heading font-semibold text-white">{user?.username}</h3>
            <p className="text-[var(--text-muted)] text-sm">{user?.email}</p>
          </div>
          <div className="card-glass p-6">
            <Package className="w-8 h-8 text-[var(--runite)] mb-4" />
            <h3 className="text-2xl font-bold text-white">{orders.length}</h3>
            <p className="text-[var(--text-muted)] text-sm">Total Orders</p>
          </div>
          <div className="card-glass p-6">
            <TrendingUp className="w-8 h-8 text-[var(--magic)] mb-4" />
            <h3 className="text-2xl font-bold text-white">
              ${orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}
            </h3>
            <p className="text-[var(--text-muted)] text-sm">Total Spent</p>
          </div>
        </div>

        <div className="card-glass p-6">
          <h2 className="font-heading text-xl font-bold text-white mb-6">Order History</h2>
          
          {loading ? (
            <div className="text-center py-8 text-[var(--text-muted)]">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border border-[var(--border-default)] rounded-lg p-4" data-testid={`order-${order.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[var(--text-muted)] text-sm">Order #{order.id.slice(0, 8)}</span>
                      <span className={getStatusBadge(order.status)} style={{ marginLeft: '8px' }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <span className="text-[var(--gold)] font-bold">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {order.items.map((item, i) => (
                      <span key={i}>
                        {item.name} x{item.quantity}
                        {i < order.items.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                  {order.rsn && (
                    <div className="text-sm text-[var(--text-muted)] mt-2">RSN: {order.rsn}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Admin Page
const AdminPage = () => {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get("/admin/orders"),
          api.get("/products"),
          api.get("/admin/users")
        ]);
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status?status=${status}`);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success("Order status updated");
    } catch (err) {
      toast.error("Failed to update order");
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      pending: "badge-pending",
      processing: "badge-processing",
      completed: "badge-completed",
      cancelled: "badge-cancelled"
    };
    return `px-3 py-1 text-xs font-medium rounded-full ${classes[status] || classes.pending}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-gradient-gold mb-8">Admin Dashboard</h1>

        <div className="flex gap-4 mb-8 border-b border-[var(--border-default)]">
          {["orders", "products", "users"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-4 px-4 font-heading font-semibold capitalize transition-colors ${
                tab === t ? "text-[var(--gold)] border-b-2 border-[var(--gold)]" : "text-[var(--text-muted)] hover:text-white"
              }`}
              data-testid={`admin-tab-${t}`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)]">Loading...</div>
        ) : (
          <>
            {tab === "orders" && (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="card-glass p-4" data-testid={`admin-order-${order.id}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-white font-semibold">Order #{order.id.slice(0, 8)}</span>
                        <span className={getStatusBadge(order.status)} style={{ marginLeft: '8px' }}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-1 rounded text-sm"
                          data-testid={`status-select-${order.id}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <span className="text-[var(--gold)] font-bold">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      Items: {order.items.map(i => `${i.name} x${i.quantity}`).join(", ")}
                    </div>
                    {order.rsn && <div className="text-sm text-[var(--text-muted)]">RSN: {order.rsn}</div>}
                  </div>
                ))}
                {orders.length === 0 && <div className="text-center py-8 text-[var(--text-muted)]">No orders yet</div>}
              </div>
            )}

            {tab === "products" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <div key={product.id} className="card-glass p-4" data-testid={`admin-product-${product.id}`}>
                    <h3 className="font-heading font-semibold text-white">{product.name}</h3>
                    <p className="text-[var(--text-muted)] text-sm">{product.category}</p>
                    <p className="text-[var(--gold)] font-bold mt-2">${product.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "users" && (
              <div className="space-y-4">
                {users.map(u => (
                  <div key={u.id} className="card-glass p-4 flex items-center justify-between" data-testid={`admin-user-${u.id}`}>
                    <div>
                      <h3 className="font-heading font-semibold text-white">{u.username}</h3>
                      <p className="text-[var(--text-muted)] text-sm">{u.email}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${u.is_admin ? "bg-[var(--gold)]/20 text-[var(--gold)]" : "bg-white/10 text-[var(--text-secondary)]"}`}>
                      {u.is_admin ? "Admin" : "User"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Footer
const Footer = () => (
  <footer className="bg-[var(--bg-card)] border-t border-[var(--border-default)] py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-[var(--gold)]" />
            <span className="font-display text-lg font-bold text-gradient-gold">KodakGP</span>
          </div>
          <p className="text-[var(--text-muted)] text-sm">
            Premium OSRS gold and scripts marketplace. Trusted by thousands.
          </p>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-white mb-4">Products</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/gold" className="text-[var(--text-secondary)] hover:text-[var(--gold)]">Buy Gold</Link></li>
            <li><Link to="/scripts" className="text-[var(--text-secondary)] hover:text-[var(--gold)]">Scripts</Link></li>
            <li><Link to="/methods" className="text-[var(--text-secondary)] hover:text-[var(--gold)]">Methods</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-white mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-[var(--text-secondary)]">24/7 Live Chat</span></li>
            <li><span className="text-[var(--text-secondary)]">Discord</span></li>
            <li><span className="text-[var(--text-secondary)]">Email Support</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-white mb-4">Stats</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/stats" className="text-[var(--text-secondary)] hover:text-[var(--gold)]">Market Data</Link></li>
            <li><span className="text-[var(--text-secondary)]">Price History</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border-default)] mt-8 pt-8 text-center">
        <p className="text-[var(--text-muted)] text-sm">© 2024 KodakGP. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// Protected Route
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// ==================== APP ====================
function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [prices, setPrices] = useState([]);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Load user on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me")
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Load prices and seed data
  useEffect(() => {
    const init = async () => {
      try {
        await api.post("/seed");
        const res = await api.get("/market/prices");
        setPrices(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  // Auth functions
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.access_token);
    setUser(res.data.user);
    toast.success("Welcome back!");
  };

  const register = async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    localStorage.setItem("token", res.data.access_token);
    setUser(res.data.user);
    toast.success("Account created!");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out");
  };

  // Cart functions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed from cart");
  };

  const clearCart = () => setCart([]);
  const getTotal = () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading: authLoading }}>
      <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, getTotal }}>
        <BrowserRouter>
          <div className="App min-h-screen bg-[var(--bg-app)]">
            <Toaster position="top-right" theme="dark" />
            {prices.length > 0 && <PriceTicker prices={prices} />}
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage prices={prices} />} />
              <Route path="/gold" element={<GoldPage />} />
              <Route path="/scripts" element={<ScriptsPage />} />
              <Route path="/methods" element={<MethodsPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
