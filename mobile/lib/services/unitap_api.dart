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

  Future<Map<String, dynamic>> _post(
    String path,
    Map<String, Object?> payload,
  ) async {
    final response = await _client.post(
      Uri.parse('$baseUrl$path'),
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );

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
