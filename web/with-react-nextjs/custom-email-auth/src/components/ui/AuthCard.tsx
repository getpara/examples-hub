interface AuthCardProps {
  title: string;
  error: string | null;
  children: React.ReactNode;
}

export function AuthCard({ title, error, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {children}
      </div>
    </div>
  );
}
