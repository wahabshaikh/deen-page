import { BadgeCheckIcon, UserIconComponent } from "@/components/icons";

interface BuilderBadgeProps {
  status: "indexed" | "verified";
}

export function BuilderBadge({ status }: BuilderBadgeProps) {
  if (status === "verified") {
    return (
      <div className="tooltip" data-tip="Verified Builder">
        <BadgeCheckIcon size={16} className="text-primary" />
      </div>
    );
  }

  return (
    <div className="tooltip" data-tip="Indexed Builder">
      <UserIconComponent size={16} className="opacity-40" />
    </div>
  );
}
