# QuickGreen — Backend Execution Plan

> **App:** QuickGreen — 8-Minute Grocery Delivery  
> **Frontend:** React Native (Mobile)  
> **Plan Created:** 2026-02-25  
> **Scope:** Full backend API design, database schema, infrastructure, and execution timeline

---

## 1. Tech Stack Recommendation

| Layer | Technology | Reason |
|---|---|---|
| **Runtime** | Node.js (v20 LTS) | Fast I/O, large ecosystem, team familiarity |
| **Framework** | Express.js + TypeScript | Lightweight, flexible, type-safe |
| **Database** | PostgreSQL (primary) | Relational data integrity for orders, users, products |
| **Cache** | Redis | Session tokens, OTP store, cart cache, rate limiting |
| **File Storage** | AWS S3 / Cloudinary | Product images, user profile pictures |
| **Auth** | JWT (Access + Refresh tokens) + OTP via SMS | Stateless auth, mobile-first login |
| **Payment Gateway** | Razorpay | India-specific UPI, cards, net banking, COD support |
| **SMS Gateway** | Twilio / MSG91 | OTP for login, order alerts |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Order updates, promotional push alerts |
| **Search** | PostgreSQL Full-Text Search (→ Elasticsearch later) | Product name & category search |
| **Deployment** | Docker + Google Cloud Run | Scalable, containerised, pay-per-use |

---

## 2. Database Schema Design

### 2.1 Users Table
```
users
  - id               UUID PRIMARY KEY
  - name             VARCHAR(100)
  - email            VARCHAR(150) UNIQUE
  - phone            VARCHAR(15) UNIQUE NOT NULL
  - password_hash    TEXT
  - profile_pic_url  TEXT
  - is_verified      BOOLEAN DEFAULT false
  - created_at       TIMESTAMP
  - updated_at       TIMESTAMP
```

### 2.2 Addresses Table
```
addresses
  - id               UUID PRIMARY KEY
  - user_id          UUID REFERENCES users(id)
  - label            VARCHAR(50)   -- 'Home', 'Work', 'Other'
  - address_line1    TEXT
  - address_line2    TEXT
  - city             VARCHAR(100)
  - pincode          VARCHAR(10)
  - latitude         DECIMAL(10, 8)
  - longitude        DECIMAL(11, 8)
  - is_default       BOOLEAN DEFAULT false
  - created_at       TIMESTAMP
```

### 2.3 Categories Table
```
categories
  - id               UUID PRIMARY KEY
  - name             VARCHAR(100) NOT NULL
  - icon             VARCHAR(10)  -- emoji or icon code
  - bg_color         VARCHAR(10)  -- hex code
  - sort_order       INTEGER
  - is_active        BOOLEAN DEFAULT true
```

### 2.4 Products Table
```
products
  - id               UUID PRIMARY KEY
  - category_id      UUID REFERENCES categories(id)
  - name             VARCHAR(200) NOT NULL
  - description      TEXT
  - price            DECIMAL(10, 2) NOT NULL
  - mrp              DECIMAL(10, 2)
  - weight           VARCHAR(50)   -- e.g. '500g', '1kg'
  - unit             VARCHAR(20)   -- 'gram', 'unit', 'litre'
  - image_url        TEXT
  - stock            INTEGER DEFAULT 0
  - is_popular       BOOLEAN DEFAULT false
  - is_active        BOOLEAN DEFAULT true
  - discount_percent DECIMAL(5, 2) DEFAULT 0
  - created_at       TIMESTAMP
  - updated_at       TIMESTAMP
```

### 2.5 Carousel / Banners Table
```
banners
  - id               UUID PRIMARY KEY
  - badge_text       VARCHAR(100)
  - title            VARCHAR(200)
  - subtitle         VARCHAR(200)
  - description      TEXT
  - image_url        TEXT
  - action_type      VARCHAR(50)  -- 'CATEGORY', 'PRODUCT', 'URL'
  - action_value     TEXT         -- category_id, product_id, or URL
  - is_active        BOOLEAN DEFAULT true
  - sort_order       INTEGER
```

### 2.6 Cart Table
```
cart_items
  - id               UUID PRIMARY KEY
  - user_id          UUID REFERENCES users(id)
  - product_id       UUID REFERENCES products(id)
  - quantity         INTEGER NOT NULL DEFAULT 1
  - added_at         TIMESTAMP DEFAULT NOW()
```

### 2.7 Orders Table
```
orders
  - id               UUID PRIMARY KEY
  - order_number     VARCHAR(20) UNIQUE   -- e.g. QG-20260225-0001
  - user_id          UUID REFERENCES users(id)
  - address_id       UUID REFERENCES addresses(id)
  - status           ENUM('PENDING','CONFIRMED','PACKED','DISPATCHED','DELIVERED','CANCELLED')
  - subtotal         DECIMAL(10, 2)
  - delivery_fee     DECIMAL(10, 2)
  - handling_fee     DECIMAL(10, 2)
  - discount         DECIMAL(10, 2) DEFAULT 0
  - total            DECIMAL(10, 2)
  - payment_method   VARCHAR(50)   -- 'UPI_GPAY', 'UPI_PHONEPE', 'CARD', 'COD'
  - payment_status   ENUM('PENDING','SUCCESS','FAILED')
  - razorpay_order_id TEXT
  - razorpay_payment_id TEXT
  - placed_at        TIMESTAMP
  - delivered_at     TIMESTAMP
```

### 2.8 Order Items Table
```
order_items
  - id               UUID PRIMARY KEY
  - order_id         UUID REFERENCES orders(id)
  - product_id       UUID REFERENCES products(id)
  - product_name     VARCHAR(200)   -- snapshot at order time
  - product_image    TEXT
  - quantity         INTEGER
  - unit_price       DECIMAL(10, 2)
  - total_price      DECIMAL(10, 2)
```

### 2.9 OTP Table
```
otps
  - id               UUID PRIMARY KEY
  - phone            VARCHAR(15)
  - otp_hash         TEXT
  - expires_at       TIMESTAMP
  - is_used          BOOLEAN DEFAULT false
  - created_at       TIMESTAMP DEFAULT NOW()
```

### 2.10 Payment Methods Table (Saved)
```
saved_payment_methods
  - id               UUID PRIMARY KEY
  - user_id          UUID REFERENCES users(id)
  - type             VARCHAR(50)   -- 'UPI', 'CARD'
  - display_name     VARCHAR(100)  -- 'Google Pay', 'HDFC Visa ****1234'
  - provider         VARCHAR(50)   -- 'gpay', 'phonepe', 'paytm'
  - is_default       BOOLEAN DEFAULT false
```

---

## 3. API Design

### Base URL
```
https://api.quickgreen.in/v1
```

### 3.1 Auth APIs (`/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/send-otp` | Send OTP to phone number |
| POST | `/auth/verify-otp` | Verify OTP, returns JWT tokens |
| POST | `/auth/refresh-token` | Refresh expired access token |
| POST | `/auth/logout` | Invalidate refresh token |

**Request: `POST /auth/send-otp`**
```
Body: { phone: "+919876543210" }
Response: { success: true, message: "OTP sent" }
```

**Request: `POST /auth/verify-otp`**
```
Body: { phone: "+919876543210", otp: "123456" }
Response: { accessToken, refreshToken, user: { id, name, phone, profilePicUrl } }
```

---

### 3.2 User APIs (`/user`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/user/profile` | Get logged-in user profile |
| PUT | `/user/profile` | Update name, email, profile picture |
| DELETE | `/user/account` | Delete account request |

---

### 3.3 Address APIs (`/user/addresses`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/user/addresses` | List all saved addresses |
| POST | `/user/addresses` | Add a new address |
| PUT | `/user/addresses/:id` | Update an address |
| DELETE | `/user/addresses/:id` | Remove an address |
| PATCH | `/user/addresses/:id/default` | Set address as default |

---

### 3.4 Category APIs (`/categories`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | List all active categories |
| GET | `/categories/:id` | Get single category details |

**Response: `GET /categories`**
```json
{
  "categories": [
    { "id": "uuid", "name": "Fruits & Vegetables", "icon": "🥬", "bgColor": "#F1F8E9" },
    ...
  ]
}
```

---

### 3.5 Product APIs (`/products`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | List products with filters & pagination |
| GET | `/products/popular` | Get popular/trending items |
| GET | `/products/:id` | Get single product details |
| GET | `/products/search?q=spinach` | Full-text product search |
| GET | `/categories/:id/products` | Get all products in a category |

**Query Params for `GET /products`:**
```
?category=fruits&limit=20&offset=0&sort=price_asc&inStock=true
```

**Response: `GET /products/popular`**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Fresh Spinach",
      "price": 40,
      "mrp": 50,
      "weight": "250g",
      "imageUrl": "https://...",
      "isPopular": true,
      "stock": 200
    },
    ...
  ]
}
```

---

### 3.6 Banner / Carousel APIs (`/banners`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/banners` | Get all active home screen banners |

---

### 3.7 Cart APIs (`/cart`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Get current user's cart |
| POST | `/cart/add` | Add item to cart |
| PATCH | `/cart/update` | Update item quantity |
| DELETE | `/cart/remove/:productId` | Remove an item |
| DELETE | `/cart/clear` | Clear entire cart |

**Request: `POST /cart/add`**
```json
{ "productId": "uuid", "quantity": 2 }
```

**Response: `GET /cart`**
```json
{
  "items": [
    { "productId": "uuid", "name": "Fresh Spinach", "price": 40, "weight": "250g", "quantity": 2, "imageUrl": "..." }
  ],
  "subtotal": 80,
  "deliveryFee": 25,
  "handlingFee": 5,
  "total": 110
}
```

---

### 3.8 Order APIs (`/orders`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Place a new order |
| GET | `/orders` | List user's past orders |
| GET | `/orders/:id` | Get order details by ID |
| PATCH | `/orders/:id/cancel` | Cancel an order |

**Request: `POST /orders`**
```json
{
  "addressId": "uuid",
  "paymentMethod": "UPI_GPAY",
  "items": [
    { "productId": "uuid", "quantity": 2 }
  ]
}
```

**Response:**
```json
{
  "orderId": "uuid",
  "orderNumber": "QG-20260225-0042",
  "razorpayOrderId": "order_xyz",
  "total": 110,
  "status": "PENDING"
}
```

---

### 3.9 Payment APIs (`/payments`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/payments/initiate` | Create Razorpay order for an order ID |
| POST | `/payments/verify` | Verify payment signature from Razorpay |
| GET | `/payments/methods` | Get user's saved payment methods |
| POST | `/payments/methods` | Save a new payment method |
| DELETE | `/payments/methods/:id` | Remove saved payment method |

**Request: `POST /payments/initiate`**
```json
{ "orderId": "uuid" }
```

**Response:**
```json
{
  "razorpayOrderId": "order_abc123",
  "amount": 11000,
  "currency": "INR",
  "keyId": "rzp_test_xxx"
}
```

**Request: `POST /payments/verify`**
```json
{
  "razorpayOrderId": "order_abc123",
  "razorpayPaymentId": "pay_xyz",
  "razorpaySignature": "hash_signature"
}
```

---

### 3.10 Search API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search?q=mango&limit=10` | Search products by name or category |

---

## 4. Authentication & Security

### 4.1 Token Strategy
- **Access Token:** JWT, expires in **15 minutes**
- **Refresh Token:** Opaque token stored in Redis, expires in **30 days**
- All protected routes require `Authorization: Bearer <access_token>` header

### 4.2 OTP Flow
1. User enters phone number → Backend generates 6-digit OTP
2. OTP is hashed (bcrypt) and stored in Redis with a 5-minute TTL
3. OTP is sent via MSG91/Twilio SMS
4. On verify, hash comparison is done; if valid, JWT pair is issued

### 4.3 Security Measures
- **Rate Limiting:** `/auth/send-otp` — max 3 OTPs per phone per 10 minutes (Redis)
- **Helmet.js:** Secure HTTP headers
- **CORS:** Whitelist only the mobile app bundle identifier
- **Input Validation:** Zod/Joi for all request bodies
- **SQL Injection Prevention:** Parameterized queries via `pg` / Prisma ORM
- **HTTPS only:** Enforced at load balancer level

---

## 5. Project Folder Structure

```
quickgreen-backend/
├── src/
│   ├── config/
│   │   ├── db.ts            # PostgreSQL connection
│   │   ├── redis.ts         # Redis client
│   │   └── razorpay.ts      # Payment gateway config
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   ├── user/
│   │   ├── product/
│   │   ├── category/
│   │   ├── cart/
│   │   ├── order/
│   │   ├── payment/
│   │   └── banner/
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── otp.ts
│   │   └── pagination.ts
│   └── app.ts
├── prisma/
│   └── schema.prisma        # ORM schema (alternative to raw SQL)
├── .env
├── Dockerfile
└── package.json
```

---

## 6. Key Business Logic

### 6.1 Cart → Order Flow
1. User calls `GET /cart` → Frontend displays item list and totals
2. User selects address and payment method
3. User calls `POST /orders` → Backend:
   - Validates stock availability for all items
   - Calculates final total (subtotal + delivery + handling - discount)
   - Creates Order (status: PENDING) and OrderItems records
   - Creates Razorpay order
   - Decrements stock (soft lock)
4. Frontend opens Razorpay SDK with the returned order ID
5. User completes payment in Razorpay
6. Razorpay calls backend webhook OR frontend calls `POST /payments/verify`
7. Backend verifies signature → Updates order status to CONFIRMED, payment status to SUCCESS
8. Backend sends confirmation push notification via FCM
9. Backend sends SMS notification

### 6.2 Delivery Fee Logic
```
- Subtotal ≥ ₹199  →  Free Delivery
- Subtotal < ₹199  →  ₹25 delivery fee
- Handling fee: flat ₹5 always
```

### 6.3 Stock Management
- Every product has a `stock` integer field
- On order placement: stock is decremented
- On order cancellation: stock is incremented back
- If stock = 0: product is shown as "Out of Stock" in API response

### 6.4 Popular Products
- `is_popular` flag set manually by admin
- Alternatively: computed weekly via a cron job that counts `order_items` for each product in the last 7 days and flags the top 15

---

## 7. Admin Considerations

An Admin Panel will be needed to manage:
- **Product CRUD:** Add/edit/remove products, manage stock
- **Category Management:** Add/reorder categories
- **Banner Management:** Upload carousel banners
- **Order Management:** View, update, cancel orders
- **User Management:** View user accounts

**Recommended:** Build a simple internal Admin REST API under `/admin/*` routes protected by a separate admin JWT role.

---

## 8. Execution Timeline (Sprints)

### Sprint 1 — Foundation (Week 1–2)
- [ ] Project setup: Node.js + Express + TypeScript + Prisma
- [ ] PostgreSQL and Redis setup (Docker Compose locally)
- [ ] Database schema creation and migrations
- [ ] Auth module: OTP generation, SMS integration, JWT issuance
- [ ] User profile APIs (GET, PUT)

### Sprint 2 — Core Data APIs (Week 3–4)
- [ ] Categories API
- [ ] Products API (list, filter, single)
- [ ] Products search API
- [ ] Popular products API
- [ ] Banners/Carousel API
- [ ] Address management APIs

### Sprint 3 — Cart & Orders (Week 5–6)
- [ ] Cart APIs (add, remove, update, get, clear)
- [ ] Order placement API
- [ ] Order listing and detail APIs
- [ ] Order cancellation
- [ ] Stock management logic
- [ ] Delivery fee calculation logic

### Sprint 4 — Payments (Week 7)
- [ ] Razorpay integration: create order, verify signature
- [ ] Payment webhook handler
- [ ] Saved payment methods APIs
- [ ] Update order/payment status on success/failure

### Sprint 5 — Notifications & Polish (Week 8)
- [ ] FCM push notifications: order confirmed, dispatched, delivered
- [ ] SMS notifications for order updates
- [ ] Rate limiting on all sensitive routes
- [ ] Error handling and logging (Winston/Pino)
- [ ] API response standardisation

### Sprint 6 — Testing & Deployment (Week 9–10)
- [ ] Unit tests for all services (Jest)
- [ ] Integration tests for all APIs (Supertest)
- [ ] Dockerise the application
- [ ] Deploy to Google Cloud Run
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure production environment variables
- [ ] Postman API documentation

---

## 9. Environment Variables Required

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/quickgreen

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=your_secret

# SMS (MSG91)
MSG91_AUTH_KEY=your_msg91_key
MSG91_SENDER_ID=QKGRN

# Firebase (FCM)
FIREBASE_SERVICE_ACCOUNT_JSON=path/to/serviceAccount.json

# AWS S3 (for image uploads)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_BUCKET_NAME=quickgreen-media
AWS_REGION=ap-south-1
```

---

## 10. API Response Standard

All API responses follow a consistent envelope format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_OUT_OF_STOCK",
    "message": "The requested product is currently unavailable."
  }
}
```

**Paginated List:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 120,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

*End of Plan — QuickGreen Backend v1.0*
