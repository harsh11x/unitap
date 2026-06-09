# UniTap API Map

Base URL:

```text
http://localhost:4000
```

## Auth

- `POST /api/auth/login`
- `POST /api/student/signup`
- `POST /api/student/reset-password`
- `POST /api/university/signup`
- `POST /api/shopkeeper/signup`

## Wallet

- `GET /api/wallet?studentId=STU001`
- `POST /api/wallet/topup`
- `POST /api/wallet/topup/order`
- `POST /api/wallet/topup/verify`

## RFID Cards

- `GET /api/cards?studentId=STU001`
- `POST /api/cards/link`
- `POST /api/cards/freeze`

## POS / RFID Payment

- `POST /api/devices/register`
- `POST /device/connect`
- `POST /device/heartbeat`
- `POST /payments/create`
- `POST /payments/confirm`

Legacy direct-pay endpoints are still available:

- `POST /payments/pay`
- `POST /api/payments/pay`

### Register Device

```json
{
  "deviceId": "UNI001-CANTEEN-A-POS01",
  "deviceSecret": "device-secret",
  "shopkeeperId": "shopkeeper_uuid",
  "label": "Campus Cafe POS 01"
}
```

### Connect Device

```json
{
  "deviceId": "UNI001-CANTEEN-A-POS01",
  "deviceSecret": "device-secret"
}
```

Returns:

```json
{
  "token": "signed-device-token",
  "expiresIn": 86400
}
```

### Create Payment Session

```json
{
  "deviceId": "UNI001-CANTEEN-A-POS01",
  "shopId": "shopkeeper_uuid",
  "amount": 120,
  "items": [
    { "id": "product_uuid", "name": "Burger", "price": 80, "quantity": 1 },
    { "id": "product_uuid", "name": "Tea", "price": 20, "quantity": 2 }
  ]
}
```

For the current ESP32 test flow, `shopId` is optional when the device is already registered to a shop:

```json
{
  "deviceId": "UNI01-POS01",
  "amount": 80
}
```

Returns:

```json
{
  "paymentSessionId": "pay_xyz",
  "expiresIn": 60,
  "display": {
    "title": "UniTap",
    "shopName": "Campus Cafe",
    "amount": 120,
    "prompt": "Tap Student Card"
  }
}
```

### Confirm Payment Session

Header:

```http
Authorization: Bearer signed-device-token
```

Example:

```json
{
  "paymentSessionId": "pay_xyz",
  "sessionId": "pay_xyz",
  "uid": "04A3XX2A11"
}
```

For the current test card:

```json
{
  "sessionId": "pay_xyz",
  "uid": "6EA2D8DB"
}
```

### Active Session Polling

The ESP32 can poll for a cashier-created active payment:

```http
GET /payments/active?deviceId=UNI01-POS01
```

### Cancel Session

```http
POST /payments/cancel
```

```json
{
  "sessionId": "pay_xyz"
}
```

Legacy direct-pay example:

```json
{
  "uid": "04A3XX2A11",
  "merchantId": "shopkeeper_uuid",
  "amount": 120,
  "deviceId": "esp32-canteen-01",
  "products": [
    { "id": "product_uuid", "name": "Burger", "price": 80, "quantity": 1 },
    { "id": "product_uuid", "name": "Tea", "price": 20, "quantity": 2 }
  ]
}
```

## Products / Inventory

- `GET /api/products?shopkeeperId=SHOP_UUID`
- `POST /api/products/upsert`
- `POST /api/products/delete`

## Transactions / Reports

- `GET /api/transactions?studentId=STU001`
- `GET /api/transactions?shopkeeperId=SHOP_UUID`
- `GET /api/analytics`
- `GET /api/analytics?shopkeeperId=SHOP_UUID`
- `GET /api/analytics?studentId=STU001`

## Notifications

- `GET /api/notifications?role=student&recipientId=STUDENT_UUID`

## Refunds

- `POST /api/refunds`

## Required Database Migration

Run `backend/supabase-schema.sql` in Supabase SQL editor before using the RFID/payment endpoints.
