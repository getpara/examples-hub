interface CardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Card({ title, description, children }: CardProps) {
  return (
    <div className="rounded-none border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}