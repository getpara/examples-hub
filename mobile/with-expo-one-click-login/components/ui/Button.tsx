import { forwardRef } from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ActivityIndicator,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles: Record<ButtonVariant, { button: string; text: string }> = {
  primary: {
    button: 'bg-brand-500 active:bg-brand-600',
    text: 'text-white',
  },
  secondary: {
    button: 'bg-gray-100 active:bg-gray-200',
    text: 'text-gray-900',
  },
  outline: {
    button: 'bg-transparent border-2 border-gray-300 active:bg-gray-50',
    text: 'text-gray-900',
  },
  ghost: {
    button: 'bg-transparent active:bg-gray-100',
    text: 'text-gray-700',
  },
  danger: {
    button: 'bg-red-600 active:bg-red-700',
    text: 'text-white',
  },
};

const sizeStyles: Record<ButtonSize, { button: string; text: string }> = {
  sm: {
    button: 'py-2 px-4 rounded-lg',
    text: 'text-sm',
  },
  md: {
    button: 'py-3 px-6 rounded-xl',
    text: 'text-base',
  },
  lg: {
    button: 'py-4 px-8 rounded-2xl',
    text: 'text-lg',
  },
};

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      title,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      disabled,
      className,
      ...touchableProps
    },
    ref
  ) => {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];
    const isDisabled = disabled || loading;

    return (
      <TouchableOpacity
        ref={ref}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        {...touchableProps}
        className={`flex-row items-center justify-center ${sizeStyle.button} ${variantStyle.button} ${isDisabled ? 'opacity-50' : ''} ${className || ''}`}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'danger' ? '#fff' : '#374151'}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && <View className="mr-2">{icon}</View>}
            <Text className={`text-center font-semibold ${sizeStyle.text} ${variantStyle.text}`}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && <View className="ml-2">{icon}</View>}
          </>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';
