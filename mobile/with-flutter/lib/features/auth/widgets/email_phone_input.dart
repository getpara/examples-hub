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
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Country code picker as a separate widget
          SizedBox(
            height: 48, // Fixed height to match text field
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(
                    color: _focusNode.hasFocus
                        ? Theme.of(context).primaryColor
                        : Colors.grey[400]!,
                    width: 0.5, // Make border thinner
                ),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(8),
                  bottomLeft: Radius.circular(8),
                ),
                color: Colors.grey[100],
              ),
              child: Theme(
                data: Theme.of(context).copyWith(
                  appBarTheme: const AppBarTheme(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black,
                    titleTextStyle: TextStyle(
                      color: Colors.black,
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  dialogTheme: const DialogTheme(
                    backgroundColor: Colors.white,
                    titleTextStyle: TextStyle(
                      color: Colors.black,
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  textTheme: Theme.of(context).textTheme.copyWith(
                    titleLarge: const TextStyle(
                      color: Colors.black,
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                    bodyLarge: const TextStyle(
                      color: Colors.black,
                      fontSize: 16,
                    ),
                  ),
                ),
                child: CountryCodePicker(
                  onChanged: (countryCode) =>
                      setState(() => _selectedCountryCode = countryCode),
                  initialSelection: 'US',
                  favorite: const ['+1', 'US'],
                  showCountryOnly: false,
                  showOnlyCountryWhenClosed: false,
                  alignLeft: false,
                  hideHeaderText: true, // Hide the "select country" header
                  hideSearch: true, // Hide the search bar
                  dialogTextStyle: const TextStyle(
                    color: Colors.black,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                  searchStyle: const TextStyle(
                    color: Colors.black,
                    fontSize: 16,
                  ),
                  searchDecoration: InputDecoration(
                    hintText: 'Search',
                    hintStyle: TextStyle(color: Colors.grey[600]),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.grey[300]!),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.grey[300]!),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Theme.of(context).primaryColor),
                    ),
                    filled: true,
                    fillColor: Colors.grey[50],
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  textStyle: const TextStyle(color: Colors.black, fontSize: 14),
                  padding: EdgeInsets.zero,
                  dialogSize: const Size(400, 600), // Much larger dialog
                  dialogBackgroundColor: Colors.white,
                  barrierColor: Colors.black.withOpacity(0.5),
                ),
              ),
            ),
          ),
          // Phone number input
          Expanded(
            child: SizedBox(
              height: 48, // Fixed height to match country picker
              child: TextField(
                controller: _controller,
                focusNode: _focusNode,
                keyboardType: TextInputType.phone,
                autocorrect: false,
                style: const TextStyle(color: Colors.black),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'[\d\s\-\(\)]')),
                ],
                maxLines: 1,
                decoration: InputDecoration(
                  hintText: 'Phone number',
                  hintStyle: TextStyle(color: Colors.grey[600]),
                  border: OutlineInputBorder(
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(8),
                      bottomRight: Radius.circular(8),
                    ),
                    borderSide: BorderSide(
                      color: _focusNode.hasFocus
                          ? Theme.of(context).primaryColor
                          : Colors.grey[400]!,
                      width: 0.5, // Make border thinner
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(8),
                      bottomRight: Radius.circular(8),
                    ),
                    borderSide: BorderSide(color: Colors.grey[400]!, width: 0.5),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(8),
                      bottomRight: Radius.circular(8),
                    ),
                    borderSide: BorderSide(color: Theme.of(context).primaryColor, width: 0.5),
                  ),
                  filled: true,
                  fillColor: Colors.grey[100],
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
                ),
              ),
            ),
          ),
        ],
      );
    } else {
      return SizedBox(
        height: 48, // Same height as phone input
        child: TextField(
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
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey[400]!, width: 0.5),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey[400]!, width: 0.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Theme.of(context).primaryColor, width: 0.5),
            ),
            filled: true,
            fillColor: Colors.grey[100],
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
          ),
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
        _buildInputWidget(),
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