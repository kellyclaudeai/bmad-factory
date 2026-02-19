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
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-gray-900/40 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeSidebar}
      />

      <Sidebar workspaceName={workspaceName} isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 items-center border-b border-gray-300 bg-white px-4 md:hidden">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 px-3 text-xs"
            onClick={openSidebar}
            aria-label="Open sidebar menu"
          >
            Menu
          </Button>
        </div>

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
