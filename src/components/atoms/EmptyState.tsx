import React from "react";

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, icon, className }) => {
  return (
    <div className={["flex items-center gap-2 text-sm text-muted-foreground", className || ""].join(" ")}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

export default EmptyState;
