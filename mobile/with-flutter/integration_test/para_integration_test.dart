import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:para_flutter/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Para Flutter Integration Tests', () {
    testWidgets('Email Authentication Flow', (WidgetTester tester) async {
      // Start the app
      app.main();
      await tester.pumpAndSettle();

      // Find and tap Email + Passkey Authentication button
      final emailAuthButton = find.text('Email + Passkey Authentication');
      expect(emailAuthButton, findsOneWidget);
      await tester.tap(emailAuthButton);
      await tester.pumpAndSettle();

      // Enter email address
      final emailField = find.byType(TextField).first;
      await tester.enterText(emailField, 'test@example.com');
      await tester.pumpAndSettle();

      // Tap Continue button
      final continueButton = find.text('Continue');
      expect(continueButton, findsOneWidget);
      await tester.tap(continueButton);
      await tester.pumpAndSettle();

      // Wait for verification code screen
      await tester.pump(Duration(seconds: 2));

      // Enter verification code
      final verificationField = find.byType(TextField).first;
      await tester.enterText(verificationField, '123456');
      await tester.pumpAndSettle();

      // Wait for passkey screen to appear
      await tester.pump(Duration(seconds: 3));

      // Look for passkey/biometric option
      var passkeyButton = find.textContaining('Passkey');
      if (passkeyButton.evaluate().isEmpty) {
        passkeyButton = find.textContaining('Login with Any Passkey');
      }
      
      if (passkeyButton.evaluate().isNotEmpty) {
        await tester.tap(passkeyButton);
        await tester.pumpAndSettle();
        
        // Wait for authentication to complete
        await tester.pump(Duration(seconds: 5));
      }

      // Look for wallet screen indicators
      await tester.pump(Duration(seconds: 5));
      
      // Check if we reached wallet screen (look for wallet-related text)
      final walletIndicators = [
        find.textContaining('Wallet'),
        find.textContaining('EVM'),
        find.textContaining('SOLANA'),
        find.textContaining('COSMOS'),
        find.textContaining('Send Funds'),
        find.textContaining('Balance'),
      ];
      
      bool foundWalletScreen = false;
      for (final indicator in walletIndicators) {
        if (indicator.evaluate().isNotEmpty) {
          foundWalletScreen = true;
          print('✅ Found wallet screen via: ${indicator.evaluate().first.widget}');
          break;
        }
      }
      
      // For debugging - print what we can see on screen
      if (!foundWalletScreen) {
        final allText = find.byType(Text);
        print('🐛 Text widgets found on screen:');
        for (final element in allText.evaluate()) {
          final widget = element.widget as Text;
          print('  - "${widget.data}"');
        }
      }
      
      expect(foundWalletScreen, true, reason: 'Should reach wallet screen after authentication');
    });

    testWidgets('Phone Authentication Flow', (WidgetTester tester) async {
      // Start the app
      app.main();
      await tester.pumpAndSettle();

      // Find and tap Phone + Passkey Authentication button
      final phoneAuthButton = find.text('Phone + Passkey Authentication');
      expect(phoneAuthButton, findsOneWidget);
      await tester.tap(phoneAuthButton);
      await tester.pumpAndSettle();

      // Enter phone number (assuming there's a phone field)
      final phoneFields = find.byType(TextField);
      if (phoneFields.evaluate().length >= 2) {
        // Usually country code field is first, phone number field is second
        await tester.enterText(phoneFields.at(1), '5551234567');
        await tester.pumpAndSettle();
      }

      // Tap Continue button
      final continueButton = find.text('Continue');
      expect(continueButton, findsOneWidget);
      await tester.tap(continueButton);
      await tester.pumpAndSettle();

      // Wait for verification code screen
      await tester.pump(Duration(seconds: 2));

      // Enter verification code
      final verificationField = find.byType(TextField).first;
      await tester.enterText(verificationField, '123456');
      await tester.pumpAndSettle();

      // Wait for passkey screen to appear
      await tester.pump(Duration(seconds: 3));

      // Look for passkey/biometric option
      var passkeyButton = find.textContaining('Passkey');
      if (passkeyButton.evaluate().isEmpty) {
        passkeyButton = find.textContaining('Login with Any Passkey');
      }
      
      if (passkeyButton.evaluate().isNotEmpty) {
        await tester.tap(passkeyButton);
        await tester.pumpAndSettle();
        
        // Wait for authentication to complete
        await tester.pump(Duration(seconds: 5));
      }

      // Look for wallet screen indicators
      await tester.pump(Duration(seconds: 5));
      
      // Check if we reached wallet screen
      final walletIndicators = [
        find.textContaining('Wallet'),
        find.textContaining('EVM'),
        find.textContaining('Send Funds'),
      ];
      
      bool foundWalletScreen = false;
      for (final indicator in walletIndicators) {
        if (indicator.evaluate().isNotEmpty) {
          foundWalletScreen = true;
          print('✅ Found wallet screen via: ${indicator.evaluate().first.widget}');
          break;
        }
      }
      
      expect(foundWalletScreen, true, reason: 'Should reach wallet screen after phone authentication');
    });

    testWidgets('Wallet Screen Navigation', (WidgetTester tester) async {
      // This test assumes we're already authenticated (or can quickly authenticate)
      app.main();
      await tester.pumpAndSettle();

      // Quick authentication (using email flow)
      final emailAuthButton = find.text('Email + Passkey Authentication');
      if (emailAuthButton.evaluate().isNotEmpty) {
        await tester.tap(emailAuthButton);
        await tester.pumpAndSettle();

        final emailField = find.byType(TextField).first;
        await tester.enterText(emailField, 'test@example.com');
        await tester.pumpAndSettle();

        final continueButton = find.text('Continue');
        await tester.tap(continueButton);
        await tester.pumpAndSettle();

        await tester.pump(Duration(seconds: 2));

        final verificationField = find.byType(TextField).first;
        await tester.enterText(verificationField, '123456');
        await tester.pumpAndSettle();

        await tester.pump(Duration(seconds: 3));

        final passkeyButton = find.textContaining('Login with Any Passkey');
        if (passkeyButton.evaluate().isNotEmpty) {
          await tester.tap(passkeyButton);
          await tester.pumpAndSettle();
          await tester.pump(Duration(seconds: 5));
        }
      }

      // Now test wallet functionality
      await tester.pump(Duration(seconds: 2));

      // Look for wallet creation buttons
      final createWalletButtons = [
        find.textContaining('Create EVM Wallet'),
        find.textContaining('Create SOLANA Wallet'),
        find.textContaining('Create COSMOS Wallet'),
      ];

      for (final button in createWalletButtons) {
        if (button.evaluate().isNotEmpty) {
          print('✅ Found wallet creation option: ${button.evaluate().first.widget}');
          // We could tap it but wallet creation might take time
        }
      }

      // Look for Send Funds functionality
      final sendFundsButton = find.textContaining('Send Funds');
      if (sendFundsButton.evaluate().isNotEmpty) {
        print('✅ Found Send Funds functionality');
        await tester.tap(sendFundsButton);
        await tester.pumpAndSettle();
        
        // Should see transaction options
        final transactionOptions = [
          find.textContaining('EVM Transactions'),
          find.textContaining('Solana Transactions'),
        ];
        
        bool foundTransactionOptions = false;
        for (final option in transactionOptions) {
          if (option.evaluate().isNotEmpty) {
            foundTransactionOptions = true;
            break;
          }
        }
        
        expect(foundTransactionOptions, true, reason: 'Should find transaction options');
      }
    });
  });
}