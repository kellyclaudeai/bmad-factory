import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const features = [
  {
    title: "Sub-500ms delivery",
    description:
      "Messages land before you finish reading. Real-time sync across every browser tab and device your team is using.",
  },
  {
    title: "Channels + DMs",
    description:
      "Create topic channels instantly. Slide into 1-on-1 DMs without friction. Everything organized, nothing buried.",
  },
  {
    title: "30 seconds to first message",
    description:
      "Sign up, name your workspace, and start messaging. No setup wizard. No feature tour. No enterprise onboarding.",
  },
];

export const metadata: Metadata = {
  title: "SlackLite - Lightweight Team Messaging",
  description:
    "Slack's simplicity. None of the bloat. Real-time messaging for small teams.",
  openGraph: {
    title: "SlackLite",
    description: "Lightweight team messaging",
    url: "https://slacklite.app",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: 900,
            height: 480,
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-accent">
            Team messaging, simplified.
          </p>
          <h1 className="mb-6 text-5xl font-semibold leading-tight tracking-tight text-primary sm:text-6xl">
            The team chat you{" "}
            <span className="text-accent">actually</span> want to use.
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-secondary">
            Channels, DMs, and real-time messaging — without the enterprise
            bloat. Built for teams of 5 to 50.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="h-13 min-w-48 px-8 text-base">
                Get started — free
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                variant="secondary"
                size="lg"
                className="h-13 min-w-40 px-8 text-base"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-base">
        <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-border bg-surface-1 p-8 transition-colors hover:border-accent/30 hover:bg-surface-2"
              >
                <h2 className="mb-3 text-base font-semibold text-primary">
                  {feature.title}
                </h2>
                <p className="text-sm leading-relaxed text-secondary">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="border-b border-t border-border bg-surface-1">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
            Ready to simplify?
          </p>
          <h2 className="mb-4 text-4xl font-semibold tracking-tight text-primary">
            Your team deserves better tools.
          </h2>
          <p className="mb-10 text-base text-secondary">
            Free to start. No credit card required.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-13 px-8 text-base">
              Create your workspace
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
