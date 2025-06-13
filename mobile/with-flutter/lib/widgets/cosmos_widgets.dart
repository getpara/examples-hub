import 'package:flutter/material.dart';

/// Card view widget matching Swift's card styling
class CardView extends StatelessWidget {
  final Widget child;

  const CardView({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}

/// Configuration field widget matching Swift's text field styling
class ConfigField extends StatelessWidget {
  final String title;
  final String text;
  final String placeholder;
  final TextInputType keyboardType;
  final ValueChanged<String> onChanged;

  const ConfigField({
    super.key,
    required this.title,
    required this.text,
    required this.placeholder,
    required this.onChanged,
    this.keyboardType = TextInputType.text,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 4),
        TextFormField(
          initialValue: text,
          decoration: InputDecoration(
            hintText: placeholder,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
          ),
          keyboardType: keyboardType,
          autocorrect: false,
          textCapitalization: TextCapitalization.none,
          onChanged: onChanged,
        ),
      ],
    );
  }
}