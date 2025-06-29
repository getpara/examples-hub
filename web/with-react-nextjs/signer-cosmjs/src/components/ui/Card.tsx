import React from "react";

interface CardProps {
  children: React.ReactNode;
  title: string;
  description: string;
  path: string;
}

export function Card({ children, title, description }: CardProps) {
  return (
    <div className="rounded-none border border-gray-200 bg-white overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="px-6 py-4 border-t border-gray-200">{children}</div>
    </div>
  );
}