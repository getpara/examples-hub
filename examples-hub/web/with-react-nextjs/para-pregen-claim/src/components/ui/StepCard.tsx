"use client";
interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  buttonLabel: string;
  disabled: boolean;
  onClick: () => void;
  isComplete: boolean;
  children?: React.ReactNode;
}

export function StepCard({
  stepNumber,
  title,
  description,
  buttonLabel,
  disabled,
  onClick,
  isComplete,
  children,
}: StepCardProps) {
  return (
    <div className="flex flex-col w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm gap-3">
      <div className="flex items-center">
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-medium ${
            isComplete ? "bg-gray-900" : "bg-gray-400"
          }`}>
          {stepNumber}
        </div>
        <h2 className="ml-3 text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <p className="text-gray-600">{description}</p>
      {children}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`mt-3 px-4 py-2 rounded-md font-medium transition-colors ${
          disabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-700"
        }`}>
        {buttonLabel}
      </button>
    </div>
  );
}
