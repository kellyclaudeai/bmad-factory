export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900 sm:p-8">
      <section className="mx-auto max-w-3xl rounded-lg border border-gray-400 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-primary-brand">
          SlackLite Foundation Ready
        </h1>
        <p className="mt-3 text-gray-800">
          Story 1.1 scaffold is active with Next.js App Router, strict
          TypeScript, and Tailwind design tokens.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded bg-success px-3 py-1 font-medium text-white">
            Success
          </span>
          <span className="rounded bg-error px-3 py-1 font-medium text-white">
            Error
          </span>
          <span className="rounded bg-warning px-3 py-1 font-medium text-gray-900">
            Warning
          </span>
          <span className="rounded bg-info px-3 py-1 font-medium text-gray-900">
            Info
          </span>
        </div>
      </section>
    </main>
  );
}
