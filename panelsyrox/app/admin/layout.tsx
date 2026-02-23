'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        <Header sidebarCollapsed={collapsed} />
        <main
          className={cn(
            'transition-all duration-300 pt-14 min-h-screen',
            collapsed ? 'ml-16' : 'ml-56',
          )}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
  );
}