import { useOrganization, useOrganizationList } from "@clerk/clerk-react";
import { Building2 } from "lucide-react";

export default function OrgPreferences() {
  const { organization } = useOrganization();
  const { userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-4 max-w-md">
        {/* Current Organization */}
        {organization && (
          <div className="pb-3 border-b border-border">
            <div className="text-xs text-muted-foreground mb-2">Current</div>
            <div className="flex items-center gap-2">
              <Building2 className="size-4" />
              <span className="text-sm font-medium">{organization.name}</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-1">{organization.id}</div>
          </div>
        )}

        {/* All Organizations */}
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            All Organizations ({userMemberships.count})
          </div>
          <div className="space-y-2">
            {userMemberships.data?.map((membership) => (
              <div
                key={membership.organization.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-muted"
              >
                <Building2 className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm">{membership.organization.name}</div>
                  <div className="text-xs text-muted-foreground">{membership.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
