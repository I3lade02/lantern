import { cn } from "@/lib/utils";
import type { AvatarColor } from "@/types/user";

const avatarColorClasses: Record<AvatarColor, string> = {
  amber: "bg-amber text-void",
  moss: "bg-moss text-void",
  wine: "bg-wine text-cream",
  cream: "bg-cream text-void",
};

const avatarSizeClasses = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-lg",
};

type MemberAvatarProps = {
  name: string;
  color?: AvatarColor;
  size?: keyof typeof avatarSizeClasses;
  className?: string;
};

function getInitial(name: string): string {
  const initial = Array.from(name.trim())[0];

  return initial?.toLocaleUpperCase("cs-CZ") ?? "?";
}

export function MemberAvatar({
  name,
  color = "amber",
  size = "md",
  className,
}: MemberAvatarProps) {
  return (
    <div
      aria-label={`Avatar člena ${name}`}
      className={cn(
        "grid shrink-0 place-items-center border-2 border-outline font-pixel shadow-pixel-sm",
        avatarColorClasses[color],
        avatarSizeClasses[size],
        className,
      )}
      role="img"
      title={name}
    >
      {getInitial(name)}
    </div>
  );
}