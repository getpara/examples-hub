import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:para/para.dart';
import 'package:para_flutter/screens/auth_screen.dart';

void main() {
  testWidgets('starts authentication without advancing the clock',
      (tester) async {
    final pendingState = Completer<AuthState>();
    Auth? submittedAuth;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: AuthScreen(
            onSuccess: () {},
            initiateAuthFlow: ({required auth}) {
              submittedAuth = auth;
              return pendingState.future;
            },
          ),
        ),
      ),
    );

    await tester.enterText(find.byType(TextField), '2223334444');
    await tester.pump();
    await tester.tap(find.byKey(const Key('continue_button')));

    expect(submittedAuth?.toJson(), {'phone': '+12223334444'});
  });
}
