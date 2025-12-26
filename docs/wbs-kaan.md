# WBS — Wishlist, Recently Viewed & Product Filtering (Owner: Kaan Kara)

## 1. Analysis (S)
- Define UX and data needs for Wishlist, Recently Viewed, and Filtering.
- Align with deliverables: D5 (Filters), D11 (Wishlist & Recently Viewed).

## 2. Backend (Node/NestJS) (L)
- Endpoints:
  - GET /wishlist, POST /wishlist, DELETE /wishlist/:productId
  - GET /recently-viewed
  - GET /products?filters=...
- Auth guard for protected routes.
- Basic tests for controllers/services.

## 3. Frontend (Next.js) (XL)
### 3.1 Wishlist (L)
- Page: /wishlist (App Router)
- Context: Wishlist state + helpers (add/remove)
- UI polish: skeleton, empty state, toast

### 3.2 Recently Viewed (M)
- Page: /recently-viewed
- Context using localStorage
- UI polish: skeleton + empty state

### 3.3 Product Filtering (L)
- Component: ProductFilters
- Sync filter state with URL search params
- Hook helpers in lib/filters.ts

## 4. UX Polish & A11y (M)
- Visible focus states, AA contrast
- Skeleton/Loading states, toasts, empty states

## 5. Testing (M)
- Unit tests for contexts & filter helpers
- Smoke flow: browse → add to wishlist → view list

## 6. Delivery (S)
- PR: wishlist → dev
- PR includes screenshots + brief Lighthouse/Axe notes
