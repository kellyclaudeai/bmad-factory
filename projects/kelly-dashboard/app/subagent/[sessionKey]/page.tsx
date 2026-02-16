import { redirect } from "next/navigation"

interface LegacySubagentDetailProps {
  params: Promise<{ sessionKey: string }>
}

// Legacy route kept for backwards compatibility.
// Redirect to the new canonical session details page.
export default async function LegacySubagentDetail({ params }: LegacySubagentDetailProps) {
  const { sessionKey } = await params
  redirect(`/session/${sessionKey}`)
}
