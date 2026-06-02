# UniTap Mobile

Flutter cross-platform app for UniTap Smart Campus Pay.

## Current scaffold

- Same UniTap visual direction as the web landing page: royal blue, teal, orange, glass cards, wallet preview, moving feature strip.
- Mobile pages:
  - Home
  - Roles
  - Workspace
- Role-aware auth sheet for:
  - Student
  - Shopkeeper
  - University Head
  - Super Admin
- Ready to connect to the existing backend in `../backend/server.js`.

## Run

```sh
cd mobile
flutter run
```

## Backend connection notes

When wiring the real API, point the mobile app to the same backend endpoints used by the web app:

- `POST /api/auth/login`
- `POST /api/student/signup`
- `POST /api/university/signup`
- `POST /api/shopkeeper/signup`
- `POST /api/student/reset-password`
- `POST /api/wallet/topup/order`
- `POST /api/wallet/topup/verify`

For iOS simulator, use `http://localhost:4000`.
For Android emulator, use `http://10.0.2.2:4000`.
# unitap_mobile

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
