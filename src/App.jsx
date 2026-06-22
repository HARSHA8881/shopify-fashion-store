import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, X, Plus, Minus, ArrowRight, Check, Heart, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { products } from './products';
import './App.css';

function App() {
  // Navigation & Page State
  const [activePage, setActivePage] = useState('home'); // 'home' | 'catalog'
  
  // Products & Filtering State
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [colorFilter, setColorFilter] = useState('All');
  const [sortOption, setSortOption] = useState('featured');
  
  // Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailSize, setDetailSize] = useState('');
  const [detailColor, setDetailColor] = useState('');
  
  // Accordion details inside product detail
  const [accordionOpen, setAccordionOpen] = useState({ materials: true, care: false, fit: false });

  // Wishlist State
  const [wishlist, setWishlist] = useState([]);

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartClosing, setIsCartClosing] = useState(false);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

  // Filter Categories, Sizes, and Colors dynamically
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const allSizes = ['All', 'XS', 'S', 'M', 'L', 'XL'];
  const allColors = ['All', 'Cream', 'Olive', 'Charcoal', 'Black', 'Beige', 'Sand', 'Champagne'];

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (sizeFilter !== 'All') {
      result = result.filter(p => p.sizes.includes(sizeFilter));
    }
    if (colorFilter !== 'All') {
      result = result.filter(p => p.colors.includes(colorFilter));
    }

    if (sortOption === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } // else 'featured' keeps default order

    setFilteredProducts(result);
  }, [categoryFilter, sizeFilter, colorFilter, sortOption]);

  // Wishlist Toggle
  const toggleWishlist = (e, productId) => {
    e.stopPropagation();
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  // Cart Operations
  const handleOpenCart = () => {
    setIsCartOpen(true);
    setIsCartClosing(false);
  };

  const handleCloseCart = () => {
    setIsCartClosing(true);
    setTimeout(() => {
      setIsCartOpen(false);
      setIsCartClosing(false);
    }, 400); // Sync with CSS slide animation
  };

  const addToCart = (product, size, color) => {
    if (!size || !color) {
      alert('Please select both a size and a color.');
      return;
    }

    const existingIndex = cart.findIndex(
      item => item.product.id === product.id && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, size, color, quantity: 1 }]);
    }
    
    // Close modal if open, then open cart drawer
    setSelectedProduct(null);
    handleOpenCart();
  };

  const updateQuantity = (index, delta) => {
    const updatedCart = [...cart];
    const newQty = updatedCart[index].quantity + delta;
    if (newQty <= 0) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index].quantity = newQty;
    }
    setCart(updatedCart);
  };

  const removeFromCart = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    setCart([]);
    handleCloseCart();
    setShowCheckoutSuccess(true);
  };

  // Open Product Detail Modal
  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setDetailSize(product.sizes[0] || '');
    setDetailColor(product.colors[0] || '');
    setAccordionOpen({ materials: true, care: false, fit: false });
  };

  return (
    <div className="App">
      {/* Sticky Header */}
      <header className="header">
        <div className="header-logo" style={{ cursor: 'pointer' }} onClick={() => setActivePage('home')}>
          AURA EDIT
        </div>
        
        <nav className="nav-links">
          <button 
            className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            Home
          </button>
          <button 
            className={`nav-link ${activePage === 'catalog' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('catalog');
              setCategoryFilter('All');
            }}
          >
            Shop All
          </button>
          <button 
            className="nav-link"
            onClick={() => {
              setActivePage('catalog');
              setCategoryFilter('Dresses');
            }}
          >
            Dresses
          </button>
          <button 
            className="nav-link"
            onClick={() => {
              setActivePage('catalog');
              setCategoryFilter('Outerwear');
            }}
          >
            Outerwear
          </button>
        </nav>

        <div className="header-actions">
          <button className="cart-trigger" onClick={handleOpenCart} aria-label="Open shopping bag">
            <ShoppingBag size={22} strokeWidth={1.5} />
            {cart.length > 0 && (
              <span className="cart-count">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Pages View */}
      {activePage === 'home' ? (
        // ------------------ HOMEPAGE ------------------
        <main>
          {/* Hero Banner using generated high-quality asset */}
          <section 
            className="hero-section" 
            style={{ backgroundImage: `url('${window.ShopifyThemeAssets?.heroImage || '/hero.png'}')` }}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <p className="hero-subtitle">New Collection 2026</p>
              <h1 className="hero-title">Timeless Essentials for Modern Living</h1>
              <button 
                className="btn-primary"
                onClick={() => setActivePage('catalog')}
              >
                Explore Collection <ArrowRight size={16} style={{ marginLeft: 8 }} />
              </button>
            </div>
          </section>

          {/* Editorial Section */}
          <section className="editorial-section container">
            <div className="editorial-grid">
              <div className="editorial-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80" 
                  alt="Editorial clothing arrangement" 
                />
              </div>
              <div className="editorial-info">
                <span className="editorial-label">Craftsmanship First</span>
                <h2 className="editorial-heading">Mindfully designed. Responsibly made.</h2>
                <p className="editorial-desc">
                  We believe in wardrobe foundations that survive trends. Every item in our edit is constructed from premium organic fibers and manufactured in certified ethical workshops. Crafted for circularity, durability, and elegance.
                </p>
                <button 
                  className="btn-secondary"
                  onClick={() => setActivePage('catalog')}
                >
                  Discover the Process
                </button>
              </div>
            </div>
          </section>

          {/* Featured Carousel/Grid */}
          <section className="products-section container">
            <div className="section-header">
              <h2 className="section-title">The Seasonal Edit</h2>
              <button 
                className="view-all-link"
                onClick={() => setActivePage('catalog')}
              >
                Shop all garments <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="products-grid">
              {products.slice(0, 3).map(product => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => openProductDetail(product)}
                >
                  <div className="product-image-container">
                    <img src={product.image} alt={product.title} className="product-image" />
                    {wishlist.includes(product.id) ? (
                      <button 
                        className="product-wishlist" 
                        style={{ opacity: 1, color: '#d11a2a' }}
                        onClick={(e) => toggleWishlist(e, product.id)}
                      >
                        <Heart size={18} fill="#d11a2a" />
                      </button>
                    ) : (
                      <button 
                        className="product-wishlist" 
                        onClick={(e) => toggleWishlist(e, product.id)}
                      >
                        <Heart size={18} />
                      </button>
                    )}
                  </div>
                  <div className="product-meta">
                    <div>
                      <h3 className="product-title-text">{product.title}</h3>
                      <p className="product-category-text">{product.category}</p>
                    </div>
                    <span className="product-price">${product.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        // ------------------ CATALOG PAGE ------------------
        <main className="container">
          <div className="catalog-layout">
            
            {/* Sidebar Filters */}
            <aside className="filters-sidebar">
              <div className="filter-group">
                <span className="filter-title">Category</span>
                <div className="filter-options" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className="nav-link"
                      style={{ 
                        color: categoryFilter === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: categoryFilter === cat ? '600' : '400',
                        fontSize: '14px',
                        textTransform: 'none',
                        letterSpacing: '0.05em'
                      }}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat === 'All' ? 'All Collections' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-title">Filter by Size</span>
                <div className="filter-options">
                  {allSizes.map(size => (
                    <button
                      key={size}
                      className={`filter-btn-pill ${sizeFilter === size ? 'active' : ''}`}
                      onClick={() => setSizeFilter(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-title">Filter by Color</span>
                <div className="filter-options">
                  {allColors.map(color => (
                    <button
                      key={color}
                      className={`filter-btn-pill ${colorFilter === color ? 'active' : ''}`}
                      onClick={() => setColorFilter(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-title">Sort By</span>
                <select 
                  className="filter-select" 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </aside>

            {/* Product Catalog Grid */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'garment' : 'garments'}
                </p>
                {(categoryFilter !== 'All' || sizeFilter !== 'All' || colorFilter !== 'All') && (
                  <button 
                    style={{ fontSize: '13px', textDecoration: 'underline', color: 'var(--text-secondary)' }}
                    onClick={() => {
                      setCategoryFilter('All');
                      setSizeFilter('All');
                      setColorFilter('All');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {filteredProducts.length > 0 ? (
                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id} 
                      className="product-card"
                      onClick={() => openProductDetail(product)}
                    >
                      <div className="product-image-container">
                        <img src={product.image} alt={product.title} className="product-image" />
                        {wishlist.includes(product.id) ? (
                          <button 
                            className="product-wishlist" 
                            style={{ opacity: 1, color: '#d11a2a' }}
                            onClick={(e) => toggleWishlist(e, product.id)}
                          >
                            <Heart size={18} fill="#d11a2a" />
                          </button>
                        ) : (
                          <button 
                            className="product-wishlist" 
                            onClick={(e) => toggleWishlist(e, product.id)}
                          >
                            <Heart size={18} />
                          </button>
                        )}
                      </div>
                      <div className="product-meta">
                        <div>
                          <h3 className="product-title-text">{product.title}</h3>
                          <p className="product-category-text">{product.category}</p>
                        </div>
                        <span className="product-price">${product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
                  <Info size={40} strokeWidth={1} style={{ marginBottom: 16 }} />
                  <p>No products match your selected filter criteria.</p>
                </div>
              )}
            </section>

          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <span className="footer-logo">AURA EDIT</span>
              <p className="footer-desc">
                High-end modern collections crafted around premium textures, clean structures, and longevity. Handcrafted in low batches.
              </p>
            </div>
            <div className="footer-col">
              <span className="footer-col-title">Shop</span>
              <div className="footer-links">
                <button onClick={() => { setActivePage('catalog'); setCategoryFilter('All'); }}>All Collections</button>
                <button onClick={() => { setActivePage('catalog'); setCategoryFilter('Tops'); }}>Tops & Blouses</button>
                <button onClick={() => { setActivePage('catalog'); setCategoryFilter('Dresses'); }}>Knitwear & Dresses</button>
                <button onClick={() => { setActivePage('catalog'); setCategoryFilter('Bottoms'); }}>Trousers & Skirts</button>
              </div>
            </div>
            <div className="footer-col">
              <span className="footer-col-title">Information</span>
              <div className="footer-links">
                <a href="#ethical">Ethical Manifesto</a>
                <a href="#materials">Circular Materials</a>
                <a href="#shipping">Carbon Neutral Shipping</a>
                <a href="#returns">Returns & Repairs</a>
              </div>
            </div>
            <div className="footer-col">
              <span className="footer-col-title">Social</span>
              <div className="footer-links" style={{ flexDirection: 'row', gap: 16 }}>
                <a href="#instagram" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#facebook" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} AURA EDIT storefront. Built mock-headless for Shopify Showcase.</p>
            <p>Designed in compliance with Shopify UX best practices.</p>
          </div>
        </div>
      </footer>

      {/* ------------------ PRODUCT DETAIL MODAL ------------------ */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)} aria-label="Close product modal">
              <X size={20} />
            </button>
            
            <div className="detail-gallery">
              <img src={selectedProduct.image} alt={selectedProduct.title} />
            </div>

            <div className="detail-content">
              <span className="detail-category">{selectedProduct.category}</span>
              <h2 className="detail-title">{selectedProduct.title}</h2>
              <div className="detail-price">${selectedProduct.price.toFixed(2)}</div>
              
              <p className="detail-desc">{selectedProduct.description}</p>

              {/* Color Select */}
              <div className="option-select-group">
                <div className="option-label">
                  <span>Color</span>
                  <span className="option-value-label">{detailColor}</span>
                </div>
                <div className="color-selector">
                  {selectedProduct.colors.map(col => (
                    <button
                      key={col}
                      className={`color-btn ${detailColor === col ? 'active' : ''}`}
                      onClick={() => setDetailColor(col)}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Select */}
              <div className="option-select-group">
                <div className="option-label">
                  <span>Size</span>
                  <span className="option-value-label">{detailSize}</span>
                </div>
                <div className="size-selector">
                  {selectedProduct.sizes.map(sz => (
                    <button
                      key={sz}
                      className={`size-btn ${detailSize === sz ? 'active' : ''}`}
                      onClick={() => setDetailSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="action-row">
                <button 
                  className="btn-primary"
                  onClick={() => addToCart(selectedProduct, detailSize, detailColor)}
                >
                  Add to Shopping Bag
                </button>
              </div>

              {/* Accordion Details */}
              <div className="detail-accordion">
                <div className="accordion-item">
                  <button 
                    className="accordion-header"
                    onClick={() => setAccordionOpen({...accordionOpen, materials: !accordionOpen.materials})}
                  >
                    <span>Materials & Origins</span>
                    <span>{accordionOpen.materials ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                  </button>
                  {accordionOpen.materials && (
                    <div className="accordion-body">
                      {selectedProduct.details.material}
                    </div>
                  )}
                </div>

                <div className="accordion-item">
                  <button 
                    className="accordion-header"
                    onClick={() => setAccordionOpen({...accordionOpen, care: !accordionOpen.care})}
                  >
                    <span>Care Instructions</span>
                    <span>{accordionOpen.care ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                  </button>
                  {accordionOpen.care && (
                    <div className="accordion-body">
                      {selectedProduct.details.care}
                    </div>
                  )}
                </div>

                <div className="accordion-item">
                  <button 
                    className="accordion-header"
                    onClick={() => setAccordionOpen({...accordionOpen, fit: !accordionOpen.fit})}
                  >
                    <span>Size & Fit</span>
                    <span>{accordionOpen.fit ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                  </button>
                  {accordionOpen.fit && (
                    <div className="accordion-body">
                      {selectedProduct.details.fit}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ------------------ CART DRAWER ------------------ */}
      {isCartOpen && (
        <>
          <div className="cart-drawer-overlay" onClick={handleCloseCart}></div>
          <div className={`cart-drawer ${isCartClosing ? 'closing' : ''}`}>
            
            <div className="cart-header">
              <h2 className="cart-title">Your Bag</h2>
              <button className="cart-close" onClick={handleCloseCart} aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="cart-empty-message">
                  <ShoppingBag size={48} strokeWidth={1} style={{ color: 'var(--accent)' }} />
                  <p>Your shopping bag is empty.</p>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '12px 24px', fontSize: '12px' }}
                    onClick={() => {
                      handleCloseCart();
                      setActivePage('catalog');
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="cart-item">
                    <img src={item.product.image} alt={item.product.title} className="cart-item-image" />
                    <div className="cart-item-info">
                      <div className="cart-item-header">
                        <span className="cart-item-title">{item.product.title}</span>
                        <span className="cart-item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="cart-item-options">
                        {item.color} / {item.size}
                      </div>
                      <div className="cart-item-footer">
                        <div className="quantity-control">
                          <button className="qty-btn" onClick={() => updateQuantity(index, -1)}>
                            <Minus size={12} />
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateQuantity(index, 1)}>
                            <Plus size={12} />
                          </button>
                        </div>
                        <button className="cart-item-remove" onClick={() => removeFromCart(index)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary-row">
                  <span>Shipping & Duties</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="cart-summary-total">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                
                <button 
                  className="btn-primary" 
                  style={{ width: '100%' }}
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
                
                <p className="cart-shipping-notice">
                  Free carbon-neutral shipping on orders over $150. Easy returns.
                </p>
              </div>
            )}

          </div>
        </>
      )}

      {/* ------------------ CHECKOUT SUCCESS MODAL ------------------ */}
      {showCheckoutSuccess && (
        <div className="modal-overlay" onClick={() => setShowCheckoutSuccess(false)}>
          <div className="checkout-success" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon-circle">
              <Check size={36} />
            </div>
            <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>Order Placed!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
              Thank you for simulating a checkout. This order has been sent to our mock Shopify headless API and processed successfully.
            </p>
            <button 
              className="btn-primary"
              onClick={() => setShowCheckoutSuccess(false)}
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
