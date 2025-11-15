import { useUser } from "@clerk/clerk-react";

export default function ProfilePreferences() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-4 max-w-md">
        <div className="flex items-center gap-3">
          <img src={user.imageUrl} alt={user.firstName || ""} className="size-12 rounded-md" />
          <div>
            <div className="text-sm font-medium">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground font-mono">{user.id}</div>
        </div>
      </div>
    </div>
  );
}
