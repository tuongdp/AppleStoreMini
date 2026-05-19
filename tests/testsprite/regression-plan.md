# Regression Plan

## Smoke
- Home page renders.
- Product listing renders cards.
- Login form submits and stores JWT credentials.
- Protected route redirects anonymous users.

## Authentication
- Register, login, logout, refresh token, expired token, invalid token.
- Protected routes, admin role authorization, concurrent refresh token, silent refresh.

## Ecommerce
- Listing, detail, search, filter, add/remove cart item, update quantity.
- Checkout, order creation, wishlist, pagination.

## Payment
- MoMo successful IPN, failed IPN, duplicate webhook event/order state, retry handling.
- Invalid signature, structured 200/500 response, order code tracking, order sync.
- Stripe webhook coverage remains a future contract until the backend exposes a Stripe route.

## Realtime
- Socket connection, reconnect, ping/heartbeat, duplicate connection prevention.
- Realtime notifications, multiple sessions, disconnect cleanup.

## PWA
- Offline page, cache behavior, cache invalidation, service worker update.
- Reconnect after internet restored, stale cache prevention.

## Admin
- Admin login, product/category CRUD, dashboard access, upload image, statistics page.

## Responsive
- Mobile 390x844, tablet 768x1024, desktop 1440x900.
