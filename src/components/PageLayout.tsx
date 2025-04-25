import React from "react";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="max-w-[80rem] mx-auto px-6 py-12">
      <h1
        className="font-bold"
        style={{
          fontSize: "var(--font-size-h1)",
          color: "var(--color-foreground)",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <h2
          className="mb-14"
          style={{
            fontSize: "var(--font-size-h2)",
          }}
        >
          {subtitle}
        </h2>
      )}
      {children}
    </div>
  );
};
