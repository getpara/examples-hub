import 'package:flutter/material.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';

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
  bool _showContinue = false;
  PhoneNumber _phoneNumber = PhoneNumber(isoCode: 'US');
  String? _errorText;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onTextChanged);
    _focusNode.addListener(_onFocusChanged);
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

  void _onFocusChanged() {
    setState(() {
      _showContinue = _focusNode.hasFocus && _controller.text.isNotEmpty;
    });
  }

  bool _detectIsPhone(String text) {
    return text.isNotEmpty && 
           !text.contains('@') && 
           text.contains(RegExp(r'[0-9]'));
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  bool _isValidInput() {
    final text = _controller.text.trim();
    if (_isPhone) {
      return text.replaceAll(RegExp(r'[^\d]'), '').length >= 7;
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
      widget.onSubmit(_phoneNumber.phoneNumber ?? _controller.text, true);
    } else {
      widget.onSubmit(_controller.text.trim(), false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (_isPhone)
          InternationalPhoneNumberInput(
            onInputChanged: (PhoneNumber number) {
              _phoneNumber = number;
            },
            textFieldController: _controller,
            focusNode: _focusNode,
            formatInput: true,
            keyboardType: TextInputType.phone,
            inputDecoration: InputDecoration(
              hintText: 'Phone number',
              errorText: _errorText,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              filled: true,
              fillColor: Theme.of(context).colorScheme.surface.withValues(alpha: 0.1),
            ),
            selectorConfig: const SelectorConfig(
              selectorType: PhoneInputSelectorType.BOTTOM_SHEET,
            ),
            initialValue: _phoneNumber,
          )
        else
          TextField(
            controller: _controller,
            focusNode: _focusNode,
            keyboardType: TextInputType.emailAddress,
            autocorrect: false,
            decoration: InputDecoration(
              hintText: 'Enter email or phone',
              errorText: _errorText,
              prefixIcon: Icon(
                Icons.email_outlined,
                color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5),
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              filled: true,
              fillColor: Theme.of(context).colorScheme.surface.withValues(alpha: 0.1),
            ),
          ),
        
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: _showContinue ? 60 : 0,
          child: AnimatedOpacity(
            duration: const Duration(milliseconds: 200),
            opacity: _showContinue ? 1.0 : 0.0,
            child: Padding(
              padding: const EdgeInsets.only(top: 12),
              child: SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isValidInput() ? _handleSubmit : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text('Continue'),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}