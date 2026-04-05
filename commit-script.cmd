git add slooze-backend/package.json slooze-backend/nest-cli.json slooze-backend/tsconfig.json slooze-frontend/package.json slooze-frontend/next.config.js slooze-frontend/tailwind.config.js slooze-frontend/postcss.config.js slooze-frontend/tsconfig.json
git commit -m "feat: Initial Project Setup (base configs)"

git add slooze-backend/prisma
git commit -m "feat: Prisma Schema & Configuration"

git add "slooze-backend/src/app.*" "slooze-backend/src/main.ts" "slooze-backend/src/prisma"
git commit -m "feat: Backend Core Modules & Prisma Service"

git add "slooze-backend/src/auth" "slooze-backend/src/users"
git commit -m "feat: User and Auth system (JWT logic)"

git add "slooze-backend/src/restaurants"
git commit -m "feat: Restaurant Module (ReBAC filtering)"

git add "slooze-backend/src/orders"
git commit -m "feat: Order Pipeline Backend"

git add "slooze-backend/src/payments"
git commit -m "feat: Payments Module (RBAC logic)"

git add "slooze-frontend/src/app/layout.tsx" "slooze-frontend/src/app/page.tsx" "slooze-frontend/src/app/globals.css"
git commit -m "feat: Next.js Frontend Framework Structure"

git add "slooze-frontend/src/lib" "slooze-frontend/src/context"
git commit -m "feat: Shared Apollo & Frontend Auth contexts"

git add "slooze-frontend/src/components/AuthGuard.tsx" "slooze-frontend/src/app/login"
git commit -m "feat: Authentication Components (Login Flow)"

git add "slooze-frontend/src/app/(protected)/layout.tsx" "slooze-frontend/src/components/Navbar.tsx" "slooze-frontend/src/app/(protected)/dashboard"
git commit -m "feat: Main Dashboard and Role Badges UI"

git add "slooze-frontend/src/app/(protected)/restaurants"
git commit -m "feat: Restaurant & Food Browsing UI"

git add "slooze-frontend/src/app/(protected)/orders" "slooze-frontend/src/app/(protected)/payments"
git commit -m "feat: Order Management and Payments Interface"

git add .
git commit -m "docs: Final Documentation & Environment Setup"

git branch -M main
git push -u origin main
