# UniTap RFID Hardware Integration

This document describes how an ESP32 + RC522 reader should talk to the UniTap backend.

## Device Responsibilities

- Connect to campus WiFi.
- Read the RFID card UID from RC522.
- Send the UID and current POS cart to the backend.
- Display the result through LED/buzzer/screen states.
- Never store money on the card or device.

## Device States

- `IDLE`: WiFi connected, no open payment session.
- `WAITING_PAYMENT`: cashier/POS is preparing the cart.
- `TAP_CARD`: backend created a payment session and display asks student to tap.
- `PROCESSING`: UID read and confirmation request in flight.
- `APPROVED`: backend deducted wallet and returned success.
- `FAILED`: backend rejected payment.
- `OFFLINE`: WiFi/API unavailable.
- `MAINTENANCE`: device disabled by admin.

## Boot Flow

```http
POST /device/connect
Content-Type: application/json
```

```json
{
  "deviceId": "UNI001-CANTEEN-A-POS01",
  "deviceSecret": "device-secret"
}
```

Response:

```json
{
  "token": "signed-device-token",
  "expiresIn": 86400
}
```

## Payment Session Flow

Cashier/POS creates a payment session:

```http
POST /payments/create
Content-Type: application/json
```

```json
{
  "deviceId": "UNI001-CANTEEN-A-POS01",
  "shopId": "shopkeeper_uuid",
  "amount": 120,
  "items": [
    { "id": "product_uuid", "name": "Coffee", "price": 40, "quantity": 1 },
    { "id": "product_uuid", "name": "Sandwich", "price": 80, "quantity": 1 }
  ]
}
```

Current test request from dashboard:

```json
{
  "deviceId": "UNI01-POS01",
  "amount": 80
}
```

Device display:

```text
UniTap
Campus Cafe
Amount: INR 120
Tap Student Card
```

ESP32 confirms after reading UID:

```http
POST /payments/confirm
Authorization: Bearer signed-device-token
Content-Type: application/json
```

```json
{
  "sessionId": "pay_xyz",
  "uid": "6EA2D8DB"
}
```

If the existing ESP32 does not store the device token yet, testing can omit the `Authorization` header. The backend still supports token validation when the device sends it.

## Active Payment Polling

To avoid rewriting the existing ESP32 firmware, poll:

```http
GET /payments/active?deviceId=UNI01-POS01
```

When active:

```json
{
  "active": true,
  "sessionId": "pay_xyz",
  "amount": 80,
  "status": "waiting"
}
```

## ESP32 Pseudocode

```cpp
setState(READY);

String token = connectDevice(DEVICE_ID, DEVICE_SECRET);

PaymentSession session = waitForPaymentSession();
showAmount(session.amount);
setState(TAP_CARD);

if (rfidCardDetected() && session.active) {
  String uid = readUidFromRc522();
  setState(PROCESSING);

  int statusCode = httpPostWithBearer("/payments/confirm", token, {
    "paymentSessionId": session.id,
    "uid": uid
  });

  if (statusCode == 200) {
    setState(APPROVED);
    showGreenLed();
    beepSuccess();
  } else {
    setState(FAILED);
    showRedLed();
    beepFailure();
  }
}
```

## Expected Test Logs

Backend:

```text
PAYMENT_CREATED
CARD_DETECTED
PAYMENT_SUCCESS
PAYMENT_FAILED
```

ESP32:

```text
DEVICE_READY
WAITING_CARD
UID_RECEIVED
REQUEST_SENT
SUCCESS
```

## Security Rules

- Use HTTPS in production.
- Every payment box has `device_id` + `device_secret`.
- Device requests use a signed token from `/device/connect`.
- Do not cache student balances on-device.
- Do not store raw UID in logs. The backend hashes UID before storage.
- Rate-limit repeated failed taps per device/card.
- Send `/device/heartbeat` every 30 seconds.

## Local Development

Backend:

```sh
npm run backend
```

iOS simulator/mobile app uses:

```text
http://localhost:4000
```

Android emulator uses:

```text
http://10.0.2.2:4000
```
