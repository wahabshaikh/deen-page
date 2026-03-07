import { BadgeCheck, User } from "lucide-react";

interface BuilderBadgeProps {
  status: "indexed" | "verified";
}

export function BuilderBadge({ status }: BuilderBadgeProps) {
  if (status === "verified") {
    return (
      <div className="tooltip" data-tip="Verified Builder">
        <BadgeCheck size={16} className="text-primary" />
      </div>
    );
  }

  return (
    <div className="tooltip" data-tip="Indexed Builder">
      <User size={16} className="opacity-40" />
    </div>
  );
}
