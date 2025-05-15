import 'dart:math';

String randomTestEmail({
  int length = 12,
  String domain = "test.usecapsule.com",
  bool includeNumbers = true,
}) {
  final random = Random();
  final chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ${includeNumbers ? "0123456789" : ""}";

  final result = List.generate(length, (_) => chars[random.nextInt(chars.length)]).join();

  return "$result@$domain";
}

String randomTestPhone({
  List<int> validAreaCodes = const [
    201,
    202,
    203,
    205,
    206,
    207,
    208,
    209,
    210,
    212,
    213,
    214,
    215,
    216,
    217,
    218,
    219,
    220
  ],
}) {
  final random = Random();
  final areaCode = validAreaCodes[random.nextInt(validAreaCodes.length)];
  const exchange = "555";
  final subscriber = random.nextInt(10000).toString().padLeft(4, '0');

  return "$areaCode$exchange$subscriber";
}

String randomTestOTP({
  int length = 6,
  bool allowZeroStart = true,
}) {
  final random = Random();

  String getRandomDigit() {
    return random.nextInt(10).toString();
  }

  final otp = List.generate(length, (index) {
    if (index == 0 && !allowZeroStart) {
      final digit = random.nextInt(9) + 1; // 1-9
      return digit.toString();
    }
    return getRandomDigit();
  }).join();

  return otp;
}
