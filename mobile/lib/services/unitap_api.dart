import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class UnitapApi {
  UnitapApi({http.Client? client, String? baseUrl})
    : _client = client ?? http.Client(),
      baseUrl = baseUrl ?? defaultBaseUrl;

  final http.Client _client;
  final String baseUrl;

  static String get defaultBaseUrl {
    if (kIsWeb) return 'http://localhost:4000';
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:4000';
    }
    return 'http://localhost:4000';
  }

  Future<Map<String, dynamic>> login({
    required String identifier,
    required String password,
  }) {
    return _post('/api/auth/login', {
      'identifier': identifier,
      'password': password,
    });
  }

  Future<Map<String, dynamic>> signupStudent({
    required String studentId,
    required String universityName,
    required String city,
    required String state,
    required String country,
    required String dob,
    required String password,
  }) {
    return _post('/api/student/signup', {
      'studentId': studentId,
      'universityName': universityName,
      'city': city,
      'state': state,
      'country': country,
      'dob': dob,
      'password': password,
    });
  }

  Future<Map<String, dynamic>> signupUniversity({
    required String name,
    required String address,
    required String officialEmail,
    required String phone,
    required String website,
    required String registrationId,
    required String password,
  }) {
    return _post('/api/university/signup', {
      'name': name,
      'address': address,
      'officialEmail': officialEmail,
      'phone': phone,
      'website': website,
      'registrationId': registrationId,
      'password': password,
    });
  }

  Future<Map<String, dynamic>> signupShopkeeper({
    required String shopName,
    required String location,
    required String email,
    required String phone,
    required String universityRegistrationId,
    required String password,
    List<Map<String, Object?>> products = const [],
  }) {
    return _post('/api/shopkeeper/signup', {
      'shopName': shopName,
      'location': location,
      'email': email,
      'phone': phone,
      'universityRegistrationId': universityRegistrationId,
      'password': password,
      'products': products,
    });
  }

  Future<Map<String, dynamic>> resetStudentPassword({
    required String studentId,
    required String dob,
    required String newPassword,
  }) {
    return _post('/api/student/reset-password', {
      'studentId': studentId,
      'dob': dob,
      'newPassword': newPassword,
    });
  }

  Future<Map<String, dynamic>> wallet({required String studentId}) {
    return _get('/api/wallet', {'studentId': studentId});
  }

  Future<Map<String, dynamic>> testingStudents() {
    return _get('/api/testing/students', const {});
  }

  Future<Map<String, dynamic>> testingStudent({required String studentId}) {
    return _get('/api/testing/students/$studentId', const {});
  }

  Future<Map<String, dynamic>> transactions({
    String? studentId,
    String? shopkeeperId,
    int limit = 50,
  }) {
    return _get('/api/transactions', {
      if (studentId != null) 'studentId': studentId,
      if (shopkeeperId != null) 'shopkeeperId': shopkeeperId,
      'limit': '$limit',
    });
  }

  Future<Map<String, dynamic>> notifications({
    required String role,
    String? recipientId,
  }) {
    return _get('/api/notifications', {
      'role': role,
      if (recipientId != null) 'recipientId': recipientId,
    });
  }

  Future<Map<String, dynamic>> cards({required String studentId}) {
    return _get('/api/cards', {'studentId': studentId});
  }

  Future<Map<String, dynamic>> linkCard({
    required String studentId,
    required String uid,
    String? label,
  }) {
    return _post('/api/cards/link', {
      'studentId': studentId,
      'uid': uid,
      if (label != null) 'label': label,
    });
  }

  Future<Map<String, dynamic>> freezeCard({
    String? uid,
    String? cardId,
    String? studentId,
    String reason = 'Card frozen from mobile app.',
    bool lost = false,
  }) {
    return _post('/api/cards/freeze', {
      if (uid != null) 'uid': uid,
      if (cardId != null) 'cardId': cardId,
      if (studentId != null) 'studentId': studentId,
      'reason': reason,
      'lost': lost,
    });
  }

  Future<Map<String, dynamic>> topupWallet({
    required String studentId,
    required num amount,
    String source = 'mobile',
    String? reference,
  }) {
    return _post('/api/wallet/topup', {
      'studentId': studentId,
      'amount': amount,
      'source': source,
      if (reference != null) 'reference': reference,
    });
  }

  Future<Map<String, dynamic>> createWalletTopupOrder({
    required String studentId,
    required num amount,
  }) {
    return _post('/api/wallet/topup/order', {
      'studentId': studentId,
      'amount': amount,
    });
  }

  Future<Map<String, dynamic>> verifyWalletTopup({
    required String studentId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) {
    return _post('/api/wallet/topup/verify', {
      'studentId': studentId,
      'razorpayOrderId': razorpayOrderId,
      'razorpayPaymentId': razorpayPaymentId,
      'razorpaySignature': razorpaySignature,
    });
  }

  Future<Map<String, dynamic>> payWithRfid({
    required String uid,
    required String merchantId,
    required num amount,
    List<Map<String, Object?>> products = const [],
    String? deviceId,
  }) {
    return _post('/api/payments/pay', {
      'uid': uid,
      'merchantId': merchantId,
      'amount': amount,
      'products': products,
      if (deviceId != null) 'deviceId': deviceId,
    });
  }

  Future<Map<String, dynamic>> products({required String shopkeeperId}) {
    return _get('/api/products', {'shopkeeperId': shopkeeperId});
  }

  Future<Map<String, dynamic>> upsertProduct({
    String? productId,
    required String shopkeeperId,
    required String name,
    required num price,
    String? sku,
    String? category,
    int stockQty = 0,
    int lowStockThreshold = 5,
    bool isActive = true,
  }) {
    return _post('/api/products/upsert', {
      if (productId != null) 'productId': productId,
      'shopkeeperId': shopkeeperId,
      'name': name,
      'price': price,
      if (sku != null) 'sku': sku,
      if (category != null) 'category': category,
      'stockQty': stockQty,
      'lowStockThreshold': lowStockThreshold,
      'isActive': isActive,
    });
  }

  Future<Map<String, dynamic>> deleteProduct({required String productId}) {
    return _post('/api/products/delete', {'productId': productId});
  }

  Future<Map<String, dynamic>> analytics({
    String? studentId,
    String? shopkeeperId,
  }) {
    return _get('/api/analytics', {
      if (studentId != null) 'studentId': studentId,
      if (shopkeeperId != null) 'shopkeeperId': shopkeeperId,
    });
  }

  Future<Map<String, dynamic>> refund({
    required String transactionId,
    required num amount,
    String? reason,
  }) {
    return _post('/api/refunds', {
      'transactionId': transactionId,
      'amount': amount,
      if (reason != null) 'reason': reason,
    });
  }

  Future<Map<String, dynamic>> registerDevice({
    required String deviceId,
    required String deviceSecret,
    required String shopkeeperId,
    String? universityId,
    String? label,
  }) {
    return _post('/api/devices/register', {
      'deviceId': deviceId,
      'deviceSecret': deviceSecret,
      'shopkeeperId': shopkeeperId,
      if (universityId != null) 'universityId': universityId,
      if (label != null) 'label': label,
    });
  }

  Future<Map<String, dynamic>> connectDevice({
    required String deviceId,
    required String deviceSecret,
  }) {
    return _post('/device/connect', {
      'deviceId': deviceId,
      'deviceSecret': deviceSecret,
    });
  }

  Future<Map<String, dynamic>> heartbeatDevice({
    required String token,
    String state = 'idle',
    Map<String, Object?> metadata = const {},
  }) {
    return _post('/device/heartbeat', {
      'state': state,
      'metadata': metadata,
    }, bearerToken: token);
  }

  Future<Map<String, dynamic>> deviceStatus({required String deviceId}) {
    return _get('/device/status', {'deviceId': deviceId});
  }

  Future<Map<String, dynamic>> activePayment({required String deviceId}) {
    return _get('/payments/active', {'deviceId': deviceId});
  }

  Future<Map<String, dynamic>> createPaymentSession({
    required String deviceId,
    String? shopId,
    required num amount,
    List<Map<String, Object?>> items = const [],
    int expiresIn = 60,
    bool testing = false,
  }) {
    return _post('/payments/create', {
      'deviceId': deviceId,
      if (shopId != null) 'shopId': shopId,
      'amount': amount,
      'items': items,
      'expiresIn': expiresIn,
      if (testing) 'testing': true,
    });
  }

  Future<Map<String, dynamic>> paymentStatus({required String paymentId}) {
    return _get('/payments/status', {'paymentId': paymentId});
  }

  Future<Map<String, dynamic>> confirmPaymentSession({
    String? token,
    required String paymentSessionId,
    required String uid,
    String? paymentId,
  }) {
    return _post('/payments/confirm', {
      if (paymentId != null) 'paymentId': paymentId,
      'paymentSessionId': paymentSessionId,
      'sessionId': paymentSessionId,
      'uid': uid,
    }, bearerToken: token);
  }

  Future<Map<String, dynamic>> cancelPaymentSession({
    required String paymentSessionId,
  }) {
    return _post('/payments/cancel', {
      'paymentSessionId': paymentSessionId,
      'sessionId': paymentSessionId,
    });
  }

  Future<Map<String, dynamic>> _get(
    String path,
    Map<String, String> params,
  ) async {
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: params);
    final response = await _client.get(uri);
    return _decode(response);
  }

  Future<Map<String, dynamic>> _post(
    String path,
    Map<String, Object?> payload, {
    String? bearerToken,
  }) async {
    final response = await _client.post(
      Uri.parse('$baseUrl$path'),
      headers: {
        'Content-Type': 'application/json',
        if (bearerToken != null) 'Authorization': 'Bearer $bearerToken',
      },
      body: jsonEncode(payload),
    );

    return _decode(response);
  }

  Map<String, dynamic> _decode(http.Response response) {
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw UnitapApiException('Unexpected API response.');
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw UnitapApiException(
        decoded['error']?.toString() ?? 'Request failed.',
        statusCode: response.statusCode,
      );
    }

    return decoded;
  }

  void dispose() {
    _client.close();
  }
}

class UnitapApiException implements Exception {
  const UnitapApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() {
    if (statusCode == null) return message;
    return '$message ($statusCode)';
  }
}
