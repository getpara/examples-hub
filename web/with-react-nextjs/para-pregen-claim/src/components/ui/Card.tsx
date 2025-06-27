interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}