<div align="center">
  <img src="./slooze-backend/public/FFFFFF-1.png" alt="Slooze Logo" width="200" />
  <h1>Slooze Full-Stack Role-Based Ordering App</h1>
</div>

This repository contains the complete solution for the Slooze full-stack engineering challenge. It is built using **Next.js**, **NestJS**, **Prisma**, and **PostgreSQL**.

### Repository Structure
The codebase uses a monorepo-style structure containing both applications:

- **[`/slooze-frontend`](./slooze-frontend)**: The Next.js 14 App Router application with Tailwind CSS and Apollo Client. Role-aware dashboards and ReBAC data fetching.
- **[`/slooze-backend`](./slooze-backend)**: The NestJS API server providing a GraphQL endpoint, protected by JWT Guards and Prisma role/country relationships.

---

### Key Technical Achievements
✅ **Role-based Access Control (RBAC)**: Fine-grained permissions.  
✅ **Relational Access Control (ReBAC)**: Region-locked data for managers/members based on their specific allocated country.  
✅ **End-to-End Type Safety**: TypeScript + Prisma + GraphQL Code-first approach.  
✅ **Secure Payments Mocking**: Capturing only secure card endpoints.

### Getting Started

To run the full stack locally, refer to the documentation inside each app.

1. **Backend Setup:**
   Navigate to `/slooze-backend` and follow the [Backend README](./slooze-backend/README.md).
   ```bash
   cd slooze-backend
   npm install
   npx prisma generate
   npm run start:dev
   ```

2. **Frontend Setup:**
   Navigate to `/slooze-frontend` and follow the [Frontend README](./slooze-frontend/README.md).
   ```bash
   cd slooze-frontend
   npm install
   npm run dev
   ```

> **Note**: Both services must be running simultaneously to access full functionality.
