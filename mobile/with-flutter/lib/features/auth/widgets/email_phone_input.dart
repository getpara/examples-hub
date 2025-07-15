import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class EmailPhoneInput extends StatefulWidget {
  final Function(String value, bool isPhone) onSubmit;

  const EmailPhoneInput({
    super.key,
    required this.onSubmit,
  });

  @override
  State<EmailPhoneInput> createState() => _EmailPhoneInputState();
}

class _EmailPhoneInputState extends State<EmailPhoneInput> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _isPhone = false;
  String? _errorText;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    final text = _controller.text;
    setState(() {
      _isPhone = _detectIsPhone(text);
      _errorText = null;
    });
  }


  bool _detectIsPhone(String text) {
    // Simple detection: starts with + or digit, contains mostly digits
    final cleanText = text.trim();
    if (cleanText.isEmpty) return false;
    if (cleanText.contains('@')) return false;
    
    // Check if it looks like a phone number
    final digitsOnly = cleanText.replaceAll(RegExp(r'[^\d+]'), '');
    return digitsOnly.length >= 7 && 
           (cleanText.startsWith('+') || RegExp(r'^\d').hasMatch(cleanText));
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  String _formatPhoneNumber(String phone) {
    // Basic formatting for display
    String digits = phone.replaceAll(RegExp(r'[^\d+]'), '');
    
    // If it doesn't start with +, assume US number
    if (!digits.startsWith('+')) {
      digits = '+1$digits';
    }
    
    return digits;
  }

  bool _isValidInput() {
    final text = _controller.text.trim();
    if (_isPhone) {
      final digits = text.replaceAll(RegExp(r'[^\d]'), '');
      return digits.length >= 10; // Minimum for most phone numbers
    } else {
      return _isValidEmail(text);
    }
  }

  void _handleSubmit() {
    if (!_isValidInput()) {
      setState(() {
        _errorText = _isPhone ? 'Invalid phone number' : 'Invalid email address';
      });
      return;
    }

    if (_isPhone) {
      final formattedPhone = _formatPhoneNumber(_controller.text);
      widget.onSubmit(formattedPhone, true);
    } else {
      widget.onSubmit(_controller.text.trim(), false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: _controller,
          focusNode: _focusNode,
          keyboardType: _isPhone ? TextInputType.phone : TextInputType.emailAddress,
          autocorrect: false,
          style: const TextStyle(color: Colors.black),
          inputFormatters: _isPhone ? [
            FilteringTextInputFormatter.allow(RegExp(r'[\d+\-\(\)\s]')),
          ] : null,
          decoration: InputDecoration(
            hintText: _isPhone ? 'Phone number' : 'Enter email or phone',
            hintStyle: TextStyle(color: Colors.grey[600]),
            errorText: _errorText,
            prefixIcon: Icon(
              _isPhone ? Icons.phone_outlined : Icons.email_outlined,
              color: Colors.grey[600],
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            filled: true,
            fillColor: Colors.grey[100],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton(
            onPressed: _isValidInput() ? _handleSubmit : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.black,
              foregroundColor: Colors.white,
              disabledBackgroundColor: Colors.grey[300],
              disabledForegroundColor: Colors.grey[600],
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text(
              'Continue',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
          ),
        ),
      ],
    );
  }
}