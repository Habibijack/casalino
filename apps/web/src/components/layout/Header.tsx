import type { ReactNode } from 'react';

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        {/* Page title slot -- passed via children or left empty */}
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </header>
  );
}
