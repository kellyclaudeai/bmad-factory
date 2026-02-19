"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";

export interface AppShellProps {
  children: ReactNode;
  workspaceName?: string;
  rightPanel?: ReactNode;
}

export function AppShell({
  children,
  workspaceName = "SlackLite Workspace",
  rightPanel,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  return (
    <div className="relative flex h-screen overflow-hidden bg-gray-100 text-gray-900">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="fixed left-3 top-3 z-30 h-11 w-11 p-0 text-2xl leading-none lg:hidden"
        onClick={openSidebar}
        aria-label="Open sidebar menu"
      >
        ☰
      </Button>

      {isSidebarOpen ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      ) : null}

      <Sidebar workspaceName={workspaceName} isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
          {rightPanel ? (
            <aside className="hidden w-72 flex-none border-l border-gray-300 bg-white xl:block">
              {rightPanel}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
