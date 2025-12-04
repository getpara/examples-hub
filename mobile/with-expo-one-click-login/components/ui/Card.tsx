import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outline';
}

export function Card({
  children,
  variant = 'default',
  className,
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-white rounded-2xl',
    elevated: 'bg-white rounded-2xl shadow-lg shadow-black/10',
    outline: 'bg-white rounded-2xl border border-gray-200',
  };

  return (
    <View className={`${variantStyles[variant]} ${className || ''}`} {...props}>
      {children}
    </View>
  );
}
