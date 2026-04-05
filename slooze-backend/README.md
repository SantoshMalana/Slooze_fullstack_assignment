# 🍽️ Slooze Backend

> Role-based food ordering API built with NestJS · GraphQL · Prisma · PostgreSQL

---

## Tech Stack

- **Framework**: NestJS 10
- **API**: GraphQL (code-first with Apollo)
- **ORM**: Prisma 5
- **Database**: PostgreSQL (Railway)
- **Auth**: JWT + Passport
- **Access Control**: RBAC + ReBAC (country-based)

---

## Users & Roles

| User | Username | Role | Country |
|------|----------|------|---------|
| Nick Fury | `nick_fury` | ADMIN | — (all) |
| Captain Marvel | `captain_marvel` | MANAGER | India |
| Captain America | `captain_america` | MANAGER | America |
| Thanos | `thanos` | MEMBER | India |
| Thor | `thor` | MEMBER | India |
| Travis | `travis` | MEMBER | America |

**Password for all**: `password123`

---

## Permission Matrix

| Feature | Admin | Manager | Member |
|---------|-------|---------|--------|
| View restaurants & menu | ✅ | ✅ | ✅ |
| Create order | ✅ | ✅ | ✅ |
| Checkout & pay | ✅ | ✅ | ❌ |
| Cancel order | ✅ | ✅ | ❌ |
| Manage payment methods | ✅ | ❌ | ❌ |

**ReBAC**: Managers and Members can only access data within their own country.

---

## Project Structure

```
src/
├── auth/
│   ├── decorators/          # @Roles, @CurrentUser
│   ├── guards/              # JwtAuthGuard, RolesGuard
│   ├── auth.module.ts
│   ├── auth.resolver.ts     # login mutation
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── jwt-payload.interface.ts
├── users/
│   ├── dto/user.type.ts
│   ├── users.module.ts
│   ├── users.resolver.ts
│   └── users.service.ts
├── restaurants/
│   ├── dto/                 # RestaurantType, MenuItemType
│   ├── restaurants.module.ts
│   ├── restaurants.resolver.ts
│   └── restaurants.service.ts  # ReBAC filtering here
├── orders/
│   ├── dto/                 # OrderType, CreateOrderInput
│   ├── orders.module.ts
│   ├── orders.resolver.ts
│   └── orders.service.ts    # RBAC + ReBAC enforced here
├── payments/
│   ├── dto/                 # PaymentMethodType, AddPaymentMethodInput
│   ├── payments.module.ts
│   ├── payments.resolver.ts
│   └── payments.service.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── app.module.ts
└── main.ts
prisma/
├── schema.prisma
└── seed.ts
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (Railway free tier recommended)

### 1. Clone & Install

```bash
git clone https://github.com/SantoshMalana/slooze-backend.git
cd slooze-backend
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=4000
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed with all users, restaurants, menu items
npx prisma db seed
```

### 4. Run

```bash
# Development (with hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

GraphQL Playground: http://localhost:4000/graphql

---

## GraphQL API Reference

### Authentication

```graphql
mutation Login {
  login(username: "nick_fury", password: "password123") {
    accessToken
    user {
      id
      displayName
      role
      country
    }
  }
}
```

All other queries/mutations require the header:
```
Authorization: Bearer <accessToken>
```

### Queries

```graphql
# Get restaurants (filtered by country for non-admins)
query {
  restaurants {
    id
    name
    cuisine
    address
    country
    menuItems {
      id
      name
      price
      category
    }
  }
}

# Get menu items for a restaurant
query {
  menuItems(restaurantId: "rest-india-1") {
    id
    name
    price
    category
  }
}

# Get my orders
query {
  myOrders {
    id
    status
    totalAmount
    restaurant { name }
    orderItems {
      quantity
      price
      menuItem { name }
    }
    payment { lastFourDigits }
  }
}

# Get my payment methods
query {
  myPaymentMethods {
    id
    type
    cardholderName
    lastFourDigits
    expiryMonth
    expiryYear
    isDefault
  }
}
```

### Mutations

```graphql
# Create an order (all roles)
mutation {
  createOrder(input: {
    restaurantId: "rest-india-1"
    items: [
      { menuItemId: "mi-sg-1", quantity: 2 }
      { menuItemId: "mi-sg-3", quantity: 1 }
    ]
  }) {
    id
    status
    totalAmount
  }
}

# Checkout order (Admin + Manager only)
mutation {
  checkoutOrder(
    orderId: "<order-id>"
    paymentMethodId: "<payment-method-id>"
  ) {
    id
    status
    payment { lastFourDigits }
  }
}

# Cancel order (Admin + Manager only)
mutation {
  cancelOrder(orderId: "<order-id>") {
    id
    status
  }
}

# Add payment method (Admin only)
mutation {
  addPaymentMethod(input: {
    type: CREDIT_CARD
    cardholderName: "Nick Fury"
    cardNumber: "4111111111114242"
    expiryMonth: 12
    expiryYear: 2027
    isDefault: true
  }) {
    id
    lastFourDigits
  }
}
```

---

## Deployment (Railway)

### 1. Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and init
railway login
railway init
```

### 2. Add PostgreSQL

In Railway dashboard: **New Service → Database → PostgreSQL**

Copy the `DATABASE_URL` from the PostgreSQL service variables.

### 3. Set Environment Variables

In Railway → your service → Variables:

```
DATABASE_URL=<from postgres service>
JWT_SECRET=<strong-random-string>
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=4000
```

### 4. Deploy

```bash
railway up
```

Or connect your GitHub repo in Railway for auto-deploy on push.

### 5. Run Migrations on Railway

```bash
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

---

## Common Issues

| Issue | Fix |
|-------|-----|
| `prisma generate` fails | Run `npm install` first |
| `P1001` connection error | Check `DATABASE_URL` format and Railway service is running |
| JWT `401 Unauthorized` | Token expired — login again |
| `ForbiddenException` on checkout | Member role cannot checkout — use Manager/Admin |
| Seed fails with duplicate error | Safe — uses `upsert`, run again |
