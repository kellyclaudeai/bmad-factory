import OnlineIndicator from "@/components/ui/OnlineIndicator";

export interface DMHeaderProps {
  otherUserName: string;
  isOnline: boolean;
  className?: string;
}

export default function DMHeader({ otherUserName, isOnline, className = "" }: DMHeaderProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <OnlineIndicator isOnline={isOnline} />
      <h2 className="text-xl font-semibold text-gray-900">{otherUserName}</h2>
    </div>
  );
}
