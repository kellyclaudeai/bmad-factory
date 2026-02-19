import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

const features = [
  {
    title: "Real-Time Messages",
    description:
      "Keep conversations moving with instant delivery across channels and direct messages.",
  },
  {
    title: "Simple Setup",
    description:
      "Create a workspace and invite teammates in minutes with no complicated onboarding.",
  },
  {
    title: "Free to Start",
    description:
      "Get your team collaborating today with a free plan built for small teams.",
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
      <section className="bg-gray-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Lightweight Team Messaging
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Slack&apos;s simplicity. None of the bloat.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <form action="/signup" method="get">
                <Button size="lg" className="h-12 min-w-48">
                  Get Started Free
                </Button>
              </form>
              <form action="/signin" method="get">
                <Button variant="secondary" size="lg" className="h-12 min-w-40">
                  Sign In
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-300 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-gray-300 bg-white p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h2>
                <p className="mt-3 text-base text-gray-700">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
