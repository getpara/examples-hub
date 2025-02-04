import React from "react";

interface CardProps {
  title: string;
  description?: string;
  path?: string;
  children: React.ReactNode;
}

export function Card({ title, description, path, children }: CardProps) {
  return (
    <div className="rounded-none border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>
        {description && <p className="mt-2 text-sm text-gray-500 leading-normal">{description}</p>}
        {path && <p className="mt-2 font-mono text-xs text-gray-400 leading-normal">Path: {path}</p>}
      </div>
      <div className="p-6 pt-0">{children}</div>
    </div>
  );
}
