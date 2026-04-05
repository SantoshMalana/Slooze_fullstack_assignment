# Slooze — Architecture & Design Document

## Overview

Slooze is a full-stack, role-based food ordering web application. It implements both RBAC (Role-Based Access Control) and ReBAC (Relationship-Based Access Control) to enforce permissions at both the role level and the country level.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                       │
│                                                          │
│   Next.js 14 (App Router) + Apollo Client                │
│   ┌──────────┐ ┌─────────────┐ ┌──────────┐ ┌────────┐ │
│   │  /login  │ │ /dashboard  │ │/restaurants│ │/orders │ │
│   └──────────┘ └─────────────┘ └──────────┘ └────────┘ │
│                                                          │
│   AuthContext (JWT in cookies) + RBAC can() helper       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / GraphQL over HTTP
                         │ Authorization: Bearer <JWT>
┌────────────────────────▼────────────────────────────────┐
│                   NESTJS BACKEND                         │
│                                                          │
│   GraphQL API (Apollo Server, code-first)                │
│                                                          │
│   ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│   │ AuthModule  │  │JwtAuthGuard  │  │  RolesGuard   │  │
│   │  (login)    │  │(JWT verify)  │  │(RBAC enforce) │  │
│   └─────────────┘  └──────────────┘  └───────────────┘  │
│                                                          │
│   ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│   │ Restaurants │  │    Orders    │  │   Payments    │  │
│   │  Resolver   │  │   Resolver   │  │   Resolver    │  │
│   │  + Service  │  │  + Service   │  │  + Service    │  │
│   └─────────────┘  └──────────────┘  └───────────────┘  │
│          │                │                  │           │
│          └────────────────┼──────────────────┘           │
│                           │ Prisma ORM                   │
└───────────────────────────┼─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│              PostgreSQL DATABASE (Railway)                │
│                                                          │
│  users  restaurants  menu_items  orders  order_items     │
│  payment_methods                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Access Control Design

### RBAC (Role-Based Access Control)

Implemented using NestJS Guards and custom decorators.

```
Request → JwtAuthGuard → RolesGuard → Resolver → Service
              ↓               ↓
         Verify JWT      Check @Roles()
         Attach user     decorator on
         to request      resolver method
```

**Guard flow:**

1. `JwtAuthGuard` extracts the Bearer token from `Authorization` header
2. Validates signature and expiry using `JWT_SECRET`
3. Calls `JwtStrategy.validate()` which fetches the full user from DB
4. Attaches user to `request.user`
5. `RolesGuard` reads `@Roles(...)` metadata from the resolver method
6. Compares `user.role` against required roles
7. Throws `ForbiddenException` if not matched

**Decorator usage:**
```typescript
@Mutation(() => OrderType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
async checkoutOrder(...) { ... }
```

### ReBAC (Relationship-Based Access Control)

Implemented inside service methods using Prisma query filtering.

**Restaurant access:**
```typescript
// Non-admin sees only their country
const where = user.role === Role.ADMIN ? {} : { country: user.country };
return this.prisma.restaurant.findMany({ where });
```

**Order access:**
```typescript
// Manager can only checkout orders from their country's restaurants
if (user.role === Role.MANAGER && order.restaurant.country !== user.country) {
  throw new ForbiddenException('You can only manage orders in your country');
}
```

**Security layers:**
- Layer 1: JWT authentication (no token = 401)
- Layer 2: Role check via guard (wrong role = 403)
- Layer 3: Country check in service (wrong country = 403)
- Layer 4: Prisma query filtering (data never leaves the query)

---

## Database Schema Design

```
users
  id, username, password(bcrypt), displayName, role, country

restaurants
  id, name, cuisine, address, country   ← ReBAC pivot

menu_items
  id, name, description, price, category, isAvailable
  restaurantId → restaurants

orders
  id, status(CREATED|PAID|CANCELLED), totalAmount
  userId → users
  restaurantId → restaurants
  paymentId? → payment_methods

order_items
  id, quantity, price(snapshot)
  orderId → orders
  menuItemId → menu_items

payment_methods
  id, type, cardholderName, lastFourDigits, expiryMonth, expiryYear, isDefault
  userId → users
```

**Key design decisions:**

- `price` is snapshotted on `order_items` at order time — historical accuracy preserved
- `lastFourDigits` only — full card number never stored
- `country` on both `users` and `restaurants` — the ReBAC relationship is `user.country === restaurant.country`
- Admin bypasses country filter entirely — checked at application layer, not DB layer
- `OrderStatus` enum at DB level — no magic strings

---

## Authentication Flow

```
1. POST /graphql  { mutation login(username, password) }
2. Server fetches user from DB by username
3. bcrypt.compare(password, user.password)
4. If match → sign JWT { sub: userId, role, country }
5. Return { accessToken, user }
6. Client stores token in httpOnly cookie (js-cookie)
7. Apollo Client attaches "Authorization: Bearer <token>" to every request
8. JwtStrategy.validate() re-fetches user from DB on each request
```

---

## Frontend Architecture

### State Management
- **Auth state**: React Context (`AuthContext`) — user object + JWT token
- **Server state**: Apollo Client cache — queries auto-refetch on mutation

### Route Protection
```
/ → redirect to /dashboard or /login
/login → public
/(protected)/* → wrapped in AuthGuard component
  ├── AuthGuard checks isAuthenticated
  ├── Redirects to /login if not
  └── Renders Navbar + page if authenticated
```

### Role-based UI
```typescript
// AuthContext exposes can() helper
const can = (action: PermissionAction): boolean => {
  return PERMISSIONS[action].includes(user.role);
};

// Usage in components
{can('checkout') && <button>Checkout</button>}
{can('managePayments') && <Link href="/payments">Payments</Link>}
```

---

## Deployment Architecture

```
┌──────────────────┐         ┌──────────────────────────┐
│     Vercel       │  HTTPS  │        Railway            │
│                  │────────▶│                           │
│  Next.js App     │         │  NestJS API  PostgreSQL   │
│  (slooze-frontend│         │  :4000       :5432        │
│   .vercel.app)   │         │                           │
└──────────────────┘         └──────────────────────────┘
```

- **Frontend**: Vercel (serverless, auto CDN, zero config)
- **Backend**: Railway (Node.js service + PostgreSQL addon)
- **Secrets**: Environment variables managed per platform
- **CORS**: Backend whitelists Vercel frontend URL

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Password storage | bcrypt with cost factor 10 |
| JWT secret | Strong random string via env var |
| Card data | Only last 4 digits stored, never full PAN |
| Authorization | Guards on every resolver, service-level checks |
| CORS | Whitelist only known frontend origin |
| Country bypass | Checked at service layer, not just frontend |
| Token expiry | 7 days, re-login required after |
