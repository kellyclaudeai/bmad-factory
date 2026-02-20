import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-base text-primary">
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-border bg-base/90 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-mono font-semibold text-accent text-lg tracking-tight">
            SlackLite
          </Link>

          <nav className="flex items-center gap-3" aria-label="Authentication">
            <Link
              href="/signin"
              className="text-sm text-secondary hover:text-primary transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm" className="h-9 px-4">
                Get started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-16">{children}</main>

      <footer className="border-t border-border bg-base">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm text-secondary sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p className="font-mono text-xs">SlackLite — Built with Next.js + Firebase</p>

          <nav className="flex items-center gap-6" aria-label="Footer">
            <Link href="/about" className="hover:text-secondary transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-secondary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-secondary transition-colors">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
