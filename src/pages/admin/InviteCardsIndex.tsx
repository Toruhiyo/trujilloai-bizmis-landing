import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { LEAD_EARLY_ACCESS_INVITES } from "@/data/leads";

function formatTag(raw: string): string {
  return raw.replace(/_/g, " ");
}

const InviteCardsIndex = () => {
  const sorted = [...LEAD_EARLY_ACCESS_INVITES].sort((a, b) => a.orderInBatch - b.orderInBatch);

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 font-body text-sm text-muted-foreground">
          <Link to="/admin/slides" className="text-primary hover:underline">
            ← Slides
          </Link>
        </p>
        <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">Invite cards</h1>
        <p className="mb-8 font-body text-sm text-muted-foreground">
          Early access program lead cards — open a store to preview and copy email-safe HTML.
        </p>
        <ul className="space-y-2">
          {sorted.map((lead) => (
            <li key={lead.id} className="group rounded-xl border border-border bg-card transition-colors hover:border-primary/40 hover:bg-muted/30">
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <Link
                  to={`/admin/invite-cards/early-access/${lead.id}`}
                  className="min-w-0 flex-1"
                >
                  <span className="font-body text-sm font-semibold text-foreground group-hover:text-primary">
                    {lead.storeName}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-body text-[0.65rem] text-muted-foreground">
                      {lead.country}
                    </span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 font-body text-[0.65rem] font-medium text-primary">
                      {formatTag(lead.vertical)}
                    </span>
                    {lead.subNiche && (
                      <span className="rounded bg-primary/5 px-1.5 py-0.5 font-body text-[0.65rem] text-primary/70">
                        {formatTag(lead.subNiche)}
                      </span>
                    )}
                  </div>
                </Link>
                <a
                  href={`https://${lead.storeDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 flex shrink-0 items-center gap-1 font-body text-xs text-muted-foreground transition-colors hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  {lead.storeDomain}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InviteCardsIndex;
