import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:country_code_picker/country_code_picker.dart';

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
  bool _isPhoneMode = true;
  String? _errorText;
  CountryCode _selectedCountryCode = CountryCode.fromCountryCode('US');

  @override
  void initState() {
    super.initState();
    _controller.addListener(_clearError);
    _focusNode.addListener(_onFocusChange);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() {});
    });
    Future.microtask(() => setState(() {}));
  }

  @override
  void dispose() {
    _controller.removeListener(_clearError);
    _focusNode.removeListener(_onFocusChange);
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _clearError() {
    if (mounted) {
      setState(() {
        _errorText = null;
      });
    }
  }

  void _onFocusChange() {
    if (mounted) {
      setState(() {});
    }
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  String _formatPhoneNumber(String phone) {
    String digits = phone.replaceAll(RegExp(r'[^\d]'), '');
    return '${_selectedCountryCode.dialCode}$digits';
  }

  bool _isValidInput() {
    final text = _controller.text.trim();
    if (_isPhoneMode) {
      final digits = text.replaceAll(RegExp(r'[^\d]'), '');
      return digits.length >= 7;
    } else {
      return _isValidEmail(text);
    }
  }

  void _handleSubmit() {
    if (!_isValidInput()) {
      setState(() {
        _errorText =
            _isPhoneMode ? 'Invalid phone number' : 'Invalid email address';
      });
      return;
    }

    final value = _controller.text.trim();
    widget.onSubmit(
      _isPhoneMode ? _formatPhoneNumber(value) : value,
      _isPhoneMode,
    );
  }

  Widget _buildInputWidget() {
    if (_isPhoneMode) {
      return TextField(
        controller: _controller,
        focusNode: _focusNode,
        keyboardType: TextInputType.phone,
        autocorrect: false,
        style: const TextStyle(color: Colors.black),
        inputFormatters: [
          FilteringTextInputFormatter.allow(RegExp(r'[\d]')),
        ],
        maxLines: 1,
        decoration: InputDecoration(
          prefix: CountryCodePicker(
            onChanged: (countryCode) =>
                setState(() => _selectedCountryCode = countryCode),
            initialSelection: 'US',
            favorite: const ['+1', 'US'],
            showCountryOnly: false,
            showOnlyCountryWhenClosed: false,
            alignLeft: false,
            dialogTextStyle: const TextStyle(color: Colors.black),
            searchStyle: const TextStyle(color: Colors.black),
            searchDecoration: InputDecoration(
              hintText: 'Search',
              hintStyle: TextStyle(color: Colors.grey[600]),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          hintText: 'Phone number',
          hintStyle: TextStyle(color: Colors.grey[600]),
          border: InputBorder.none,
          filled: true,
          fillColor: Colors.transparent,
          isDense: true,
          contentPadding: EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
        ),
      );
    } else {
      return TextField(
        controller: _controller,
        focusNode: _focusNode,
        keyboardType: TextInputType.emailAddress,
        autocorrect: false,
        style: const TextStyle(color: Colors.black),
        maxLines: 1,
        decoration: InputDecoration(
          prefixIcon: Icon(Icons.email_outlined, color: Colors.grey[600]),
          hintText: 'Email address',
          hintStyle: TextStyle(color: Colors.grey[600]),
          border: InputBorder.none,
          filled: true,
          fillColor: Colors.transparent,
          isDense: true,
          contentPadding: EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SizedBox(
          width: double.infinity,
          child: SegmentedButton<bool>(
            style: SegmentedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: Colors.black,
              selectedBackgroundColor: const Color(0xFF7A5CFA),
              selectedForegroundColor: Colors.white,
            ),
            segments: <ButtonSegment<bool>>[
              ButtonSegment<bool>(
                value: true,
                label: const Text('Phone'),
                icon: Icon(_isPhoneMode ? Icons.check : Icons.phone_outlined),
              ),
              ButtonSegment<bool>(
                value: false,
                label: const Text('Email'),
                icon: Icon(!_isPhoneMode ? Icons.check : Icons.email_outlined),
              ),
            ],
            selected: <bool>{_isPhoneMode},
            onSelectionChanged: (Set<bool> newSelection) {
              setState(() {
                _isPhoneMode = newSelection.first;
                _controller.clear();
              });
            },
          ),
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            border: Border.all(
                color: _focusNode.hasFocus
                    ? Theme.of(context).primaryColor
                    : Colors.grey[400]!),
            borderRadius: BorderRadius.circular(8),
            color: Colors.grey[100],
          ),
          child: _buildInputWidget(),
        ),
        if (_errorText != null)
          Padding(
            padding: const EdgeInsets.only(top: 8.0),
            child: Text(
              _errorText!,
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton(
            key: const Key('continue_button'),
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