"use client";

import type React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useModal } from "@getpara/react-sdk";

interface ConnectWalletButtonProps extends ButtonProps {
  label: string;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
}

export default function ConnectWalletButton({
  label,
  iconBefore,
  iconAfter,
  className,
  variant,
  size,
  ...props // Pass through any other ButtonProps
}: ConnectWalletButtonProps) {
  const { openModal } = useModal();

  return (
    <Button
      onClick={() => openModal()}
      className={className}
      variant={variant}
      size={size}
      {...props}>
      {iconBefore && <span className="mr-2">{iconBefore}</span>}
      {label}
      {iconAfter && <span className="ml-2">{iconAfter}</span>}
    </Button>
  );
}
