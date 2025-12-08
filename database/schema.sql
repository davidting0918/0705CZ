-- =====================================================
-- PostgreSQL Database Schema for E-Commerce Platform
-- 醬料電商平台 Database Schema (Simplified Version)
-- =====================================================

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM Types
-- =====================================================

-- User status types
CREATE TYPE user_status AS ENUM ('active', 'vip', 'inactive');

-- Order status types
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Payment method types
CREATE TYPE payment_method AS ENUM ('credit_card', 'cash_on_delivery', 'bank_transfer', 'line_pay');

-- Delivery method types
CREATE TYPE delivery_method AS ENUM ('home', 'convenience_store');

-- =====================================================
-- TABLE: users
-- 使用者資料表
-- =====================================================
-- 
-- PURPOSE:
--   Stores all registered user information for the e-commerce platform.
--   Users can browse products, place orders, and manage their account.
--
-- RELATIONSHIPS:
--   - One user can have MANY orders (1:N with orders table)
--   - One user can have MANY sessions (1:N with sessions table)
--   - One user can have MANY access_tokens (1:N with access_tokens table)
--
-- KEY FIELDS:
--   - id: Primary identifier for internal references
--   - email: Unique identifier for login, must be verified for full access
--   - password_hash: Bcrypt-hashed password (NULL for OAuth/social login users)
--   - status: Controls user privileges (active/vip/inactive)
--   - total_orders/total_spent: Aggregated stats for analytics & VIP promotion
--
-- =====================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    address         TEXT,
    status          user_status NOT NULL DEFAULT 'active',
    total_orders    INTEGER DEFAULT 0,
    total_spent     DECIMAL(12, 2) DEFAULT 0.00,
    email_verified  BOOLEAN DEFAULT FALSE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created ON users(created_at DESC);

COMMENT ON TABLE users IS '使用者資料表 - 儲存所有註冊使用者的資訊';

-- =====================================================
-- TABLE: products
-- 產品資料表
-- =====================================================
--
-- PURPOSE:
--   Stores all product information available for sale on the platform.
--   Products can be added to orders and their stock is tracked.
--
-- RELATIONSHIPS:
--   - One product can appear in MANY order_details (1:N with order_details)
--
-- KEY FIELDS:
--   - id: Primary identifier for internal references
--   - sku: Stock Keeping Unit - unique product code for inventory management
--   - price: Current selling price (snapshot saved in order_details at purchase)
--   - stock: Current available quantity
--   - low_stock_threshold: Alert threshold for reordering
--   - is_active: Soft delete / hide from storefront
--
-- =====================================================
CREATE TABLE products (
    id                  SERIAL PRIMARY KEY,
    sku                 VARCHAR(50) NOT NULL UNIQUE,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    price               DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url           VARCHAR(500),
    category            VARCHAR(100),
    stock               INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE products IS '產品資料表 - 儲存所有可販售的產品資訊';

-- =====================================================
-- TABLE: orders
-- 訂單資料表
-- =====================================================
--
-- PURPOSE:
--   Stores order header information including customer details snapshot,
--   delivery info, payment status, and order lifecycle status.
--   Each order contains one or more items stored in order_details.
--
-- RELATIONSHIPS:
--   - MANY orders belong to ONE user (N:1 with users table)
--   - One order has MANY order_details (1:N with order_details table)
--
-- KEY FIELDS:
--   - id: Order number (e.g., ORD-00001) - customer-facing identifier
--   - user_id: Reference to the ordering user
--   - user_*: Snapshot of user info at order time (preserved if user updates profile)
--   - delivery_method: 'home' for home delivery, 'convenience_store' for CVS pickup
--   - subtotal/shipping_fee/total: Price breakdown
--   - status: Order lifecycle (pending → processing → shipped → delivered)
--   - payment_status: Payment state (pending/paid/failed/refunded)
--
-- =====================================================
CREATE TABLE orders (
    id                      VARCHAR(20) PRIMARY KEY,
    user_id                 INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- User info snapshot at order time
    user_name               VARCHAR(100) NOT NULL,
    user_email              VARCHAR(255) NOT NULL,
    user_phone              VARCHAR(20) NOT NULL,
    user_snapshot_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Delivery information
    delivery_method         delivery_method NOT NULL DEFAULT 'home',
    shipping_address        TEXT,
    
    -- Convenience store info (for CVS pickup)
    cvs_store_id            VARCHAR(20),
    cvs_store_name          VARCHAR(100),
    cvs_store_address       TEXT,
    
    -- Order amounts
    subtotal                DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_fee            DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    total                   DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    
    -- Payment info
    payment_method          payment_method NOT NULL DEFAULT 'credit_card',
    payment_status          VARCHAR(20) DEFAULT 'pending',
    payment_id              VARCHAR(100),
    
    -- Order status
    status                  order_status NOT NULL DEFAULT 'pending',
    tracking_number         VARCHAR(100),
    shipped_at              TIMESTAMPTZ,
    delivered_at            TIMESTAMPTZ,
    
    -- Notes
    notes                   TEXT,
    
    -- Timestamps
    created_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

COMMENT ON TABLE orders IS '訂單資料表 - 儲存訂單主檔資訊，包含配送與付款資訊';

-- =====================================================
-- TABLE: order_details
-- 訂單明細表
-- =====================================================
--
-- PURPOSE:
--   Stores individual line items within an order.
--   Each record represents one product with its quantity and price snapshot.
--   Product info is snapshotted to preserve historical accuracy.
--
-- RELATIONSHIPS:
--   - MANY order_details belong to ONE order (N:1 with orders table)
--   - MANY order_details reference ONE product (N:1 with products table)
--
-- KEY FIELDS:
--   - order_id: Parent order reference
--   - product_id: Reference to original product (can be NULL if product deleted)
--   - product_*: Snapshot of product info at purchase time
--   - quantity: Number of units ordered
--   - unit_price: Price per unit at time of purchase
--   - subtotal: quantity × unit_price (pre-calculated for query performance)
--
-- =====================================================
CREATE TABLE order_details (
    id                  SERIAL PRIMARY KEY,
    order_id            VARCHAR(20) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id          INTEGER REFERENCES products(id) ON DELETE SET NULL,
    
    -- Product snapshot at purchase time
    product_sku         VARCHAR(50) NOT NULL,
    product_name        VARCHAR(255) NOT NULL,
    product_image_url   VARCHAR(500),
    product_snapshot_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Order line details
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    unit_price          DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal            DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    
    created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_details_order ON order_details(order_id);
CREATE INDEX idx_order_details_product ON order_details(product_id);

COMMENT ON TABLE order_details IS '訂單明細表 - 儲存訂單中的各項商品資訊';

-- =====================================================
-- TABLE: carts
-- 購物車表
-- =====================================================
--
-- PURPOSE:
--   Stores shopping cart data for logged-in users only.
--   Guest users store cart in frontend LocalStorage.
--   When user logs in, frontend cart is synced/merged to this table.
--
-- RELATIONSHIPS:
--   - ONE cart belongs to ONE user (1:1 with users table)
--
-- KEY FIELDS:
--   - user_id: The cart owner (logged-in user only)
--   - items: JSONB array of cart items with product snapshots
--   - item_count: Total number of items (for quick display)
--   - subtotal: Pre-calculated subtotal (for quick display)
--
-- ITEM STRUCTURE (JSONB):
--   [
--     {
--       "product_id": 1,
--       "product_sku": "SAU-001",
--       "product_name": "香辣辣椒醬",
--       "product_image_url": "https://...",
--       "unit_price": 180.00,
--       "quantity": 2
--     }
--   ]
--
-- USE CASES:
--   - Persist cart across browser sessions
--   - Cross-device cart synchronization
--   - Cart recovery after re-login
--   - Abandoned cart analysis & reminder emails
--
-- =====================================================
CREATE TABLE carts (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    items           JSONB NOT NULL DEFAULT '[]',
    item_count      INTEGER NOT NULL DEFAULT 0,
    subtotal        DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_updated ON carts(updated_at DESC);

COMMENT ON TABLE carts IS '購物車表 - 儲存已登入使用者的購物車資料';

-- =====================================================
-- TABLE: sessions
-- 登入 Session 表
-- =====================================================
--
-- PURPOSE:
--   Manages active user login sessions for web/mobile applications.
--   Used for session-based authentication where users stay logged in.
--   Sessions expire after a set period and can be revoked.
--
-- RELATIONSHIPS:
--   - MANY sessions belong to ONE user (N:1 with users table)
--
-- KEY FIELDS:
--   - id: UUID session identifier (used as session cookie value)
--   - user_id: The authenticated user
--   - token_hash: Hashed session token for validation
--   - ip_address: Client IP for security logging
--   - user_agent: Browser/device info for session management UI
--   - expires_at: Session expiration time (auto-cleanup after this)
--
-- USE CASES:
--   - Web browser login sessions
--   - Mobile app persistent login
--   - "Remember me" functionality
--   - Session management (view active sessions, logout from all devices)
--
-- =====================================================
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    ip_address      INET,
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_sessions_token ON sessions(token_hash);

COMMENT ON TABLE sessions IS 'Session 管理表 - 管理使用者的登入 Session';

-- =====================================================
-- TABLE: access_tokens
-- 存取權杖表
-- =====================================================
--
-- PURPOSE:
--   Stores OAuth2-style access tokens for authenticated API access.
--   Supports short-lived access tokens with optional refresh tokens.
--   Used for API authentication (mobile apps, SPAs, third-party integrations).
--
-- RELATIONSHIPS:
--   - MANY access_tokens belong to ONE user (N:1 with users table)
--
-- KEY FIELDS:
--   - id: UUID token identifier
--   - user_id: The token owner
--   - token_hash: Hashed access token (never store plain tokens)
--   - refresh_token_hash: Hashed refresh token for token renewal
--   - scopes: Comma-separated permissions (e.g., 'read,write,orders')
--   - expires_at: Access token expiration (typically 15min-1hr)
--   - refresh_expires_at: Refresh token expiration (typically 7-30 days)
--
-- USE CASES:
--   - Mobile app API authentication
--   - Single Page Application (SPA) auth
--   - Third-party integrations with limited scopes
--   - Token refresh flow without re-login
--
-- =====================================================
CREATE TABLE access_tokens (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash              VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash      VARCHAR(255) UNIQUE,
    scopes                  VARCHAR(500) DEFAULT 'read',
    device_name             VARCHAR(100),
    ip_address              INET,
    is_revoked              BOOLEAN DEFAULT FALSE,
    expires_at              TIMESTAMPTZ NOT NULL,
    refresh_expires_at      TIMESTAMPTZ,
    last_used_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_access_tokens_user ON access_tokens(user_id);
CREATE INDEX idx_access_tokens_token ON access_tokens(token_hash);
CREATE INDEX idx_access_tokens_refresh ON access_tokens(refresh_token_hash) WHERE refresh_token_hash IS NOT NULL;
CREATE INDEX idx_access_tokens_expires ON access_tokens(expires_at);

COMMENT ON TABLE access_tokens IS '存取權杖表 - 儲存 API 存取權杖 (OAuth2 風格)';

-- =====================================================
-- TABLE: api_keys
-- API 金鑰表
-- =====================================================
--
-- PURPOSE:
--   Stores long-lived API keys for server-to-server integrations.
--   Unlike access_tokens, API keys don't expire frequently and are
--   meant for backend services, webhooks, or trusted third-party systems.
--
-- RELATIONSHIPS:
--   - MANY api_keys can belong to ONE user (N:1 with users table)
--   - api_keys can also be system-level (user_id = NULL)
--
-- KEY FIELDS:
--   - id: UUID key identifier
--   - user_id: Owner user (NULL for system-level keys)
--   - key_hash: Hashed API key (plain key shown only once at creation)
--   - key_prefix: First 8 chars of key for identification (e.g., "sk_live_")
--   - name: Descriptive name for the key
--   - permissions: JSON or comma-separated permissions
--   - rate_limit: Requests per minute allowed (NULL = unlimited)
--   - expires_at: Optional expiration (NULL = never expires)
--
-- USE CASES:
--   - Backend service integration
--   - Webhook authentication
--   - Third-party system access
--   - CI/CD pipeline access
--   - Admin tools & scripts
--
-- =====================================================
CREATE TABLE api_keys (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             INTEGER REFERENCES users(id) ON DELETE CASCADE,
    key_hash            VARCHAR(255) NOT NULL UNIQUE,
    key_prefix          VARCHAR(20) NOT NULL,
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    permissions         VARCHAR(500) DEFAULT 'read',
    rate_limit          INTEGER,
    is_active           BOOLEAN DEFAULT TRUE,
    expires_at          TIMESTAMPTZ,
    last_used_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE api_keys IS 'API 金鑰表 - 儲存長期 API 金鑰供伺服器端整合使用';

-- =====================================================
-- Trigger Functions
-- =====================================================

-- Function to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user statistics when order is delivered
CREATE OR REPLACE FUNCTION update_user_stats_on_order_delivered()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
        UPDATE users
        SET 
            total_orders = total_orders + 1,
            total_spent = total_spent + NEW.total,
            status = CASE 
                WHEN total_spent + NEW.total >= 10000 THEN 'vip'
                ELSE status
            END
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_user_stats
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_user_stats_on_order_delivered();

-- =====================================================
-- Seed Data - Products
-- =====================================================
INSERT INTO products (sku, name, price, category, stock, low_stock_threshold, image_url) VALUES
('SAU-001', '香辣辣椒醬', 180.00, '辣醬系列', 150, 30, 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d'),
('SAU-002', '海鮮沾醬', 220.00, '海鮮醬料', 25, 30, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9'),
('SAU-003', '沙茶醬', 160.00, '經典醬料', 200, 40, 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0'),
('SAU-004', '泰式甜辣醬', 150.00, '異國風味', 0, 25, 'https://images.unsplash.com/photo-1619221882220-947b3d3c8861'),
('SAU-005', '蒜蓉醬', 140.00, '經典醬料', 180, 35, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898'),
('SAU-006', '黑胡椒醬', 190.00, '西式醬料', 15, 20, 'https://images.unsplash.com/photo-1541014741259-de529411b96a');
