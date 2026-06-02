// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';

import 'package:unitap_mobile/main.dart';

void main() {
  testWidgets('UniTap mobile shell renders core landing content', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const UniTapMobileApp());

    expect(find.text('Tap. Pay. Track. All across campus.'), findsOneWidget);
    expect(find.text('Get Started'), findsOneWidget);

    await tester.tap(find.text('Get Started'));
    await tester.pumpAndSettle();

    expect(find.text('UniTap'), findsWidgets);
    expect(find.text('Launch Campus'), findsOneWidget);
    expect(find.text('Campus Wallet'), findsOneWidget);
    expect(find.text('RFID TAP-TO-PAY'), findsWidgets);

    await tester.tap(find.text('Roles'));
    await tester.pump();

    expect(find.text('Purpose-built mobile workspaces'), findsOneWidget);
    expect(find.text('University Head'), findsWidgets);
  });
}
