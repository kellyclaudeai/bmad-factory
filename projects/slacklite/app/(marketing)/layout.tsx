import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-gray-300 bg-white">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold text-primary-brand">
            SlackLite
          </Link>

          <nav className="flex items-center gap-3" aria-label="Authentication">
            <form action="/signin" method="get">
              <Button variant="secondary" size="sm" className="h-10 px-4">
                Sign In
              </Button>
            </form>
            <form action="/signup" method="get">
              <Button size="sm" className="h-10 px-4">
                Sign Up
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <main className="pt-16">{children}</main>

      <footer className="border-t border-gray-300 bg-gray-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm text-gray-700 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>Built for focused teams.</p>

          <nav className="flex items-center gap-6" aria-label="Footer">
            <Link href="/about" className="hover:text-primary-brand">
              About
            </Link>
            <Link href="/privacy" className="hover:text-primary-brand">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary-brand">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
