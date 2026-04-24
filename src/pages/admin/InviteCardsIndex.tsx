import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LEAD_EARLY_ACCESS_INVITES } from "@/data/leads";
import { buildLeadEarlyAccessEmailHtml } from "@/lib/leadEarlyAccessEmailHtml";
import {
  buildLeadEarlyAccessEmailHtmlSafe,
  SAFE_EMAIL_DEFAULT_BASE_URL,
} from "@/lib/leadEarlyAccessEmailHtmlSafe";

function formatTag(raw: string): string {
  return raw.replace(/_/g, " ");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const InviteCardsIndex = () => {
  const sorted = useMemo(
    () => [...LEAD_EARLY_ACCESS_INVITES].sort((a, b) => a.orderInBatch - b.orderInBatch),
    [],
  );
  const [bulkCopying, setBulkCopying] = useState(false);

  const copyAllInvitesHtml = useCallback(
    async (variant: "rich" | "safe") => {
      setBulkCopying(true);
      try {
        const chunks: string[] = [];
        for (const lead of sorted) {
          const boundary = `<!-- bizmis-invite-boundary:${lead.id} -->\n`;
          if (variant === "rich") {
            chunks.push(boundary + buildLeadEarlyAccessEmailHtml(lead).html);
          } else {
            chunks.push(
              boundary +
                buildLeadEarlyAccessEmailHtmlSafe(lead, {
                  baseUrl: SAFE_EMAIL_DEFAULT_BASE_URL,
                }).html,
            );
          }
        }
        const payload = chunks.join("\n\n");
        const bytes = new TextEncoder().encode(payload).byteLength;
        await navigator.clipboard.writeText(payload);
        toast.success(
          variant === "rich"
            ? `Copied ${sorted.length} rich HTML invites (${formatBytes(bytes)}). Each starts with an HTML comment containing the lead id.`
            : `Copied ${sorted.length} Gmail-safe HTML invites (${formatBytes(bytes)}), production image URLs. Each starts with an HTML comment containing the lead id.`,
        );
      } catch (e) {
        console.error(e);
        toast.error("Could not build or copy HTML. Try a secure (https) context or check the console.");
      } finally {
        setBulkCopying(false);
      }
    },
    [sorted],
  );

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 font-body text-sm text-muted-foreground">
          <Link to="/admin/slides" className="text-primary hover:underline">
            ← Slides
          </Link>
        </p>
        <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-heading text-3xl font-bold text-foreground">Invite cards</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" disabled={bulkCopying} className="shrink-0">
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {bulkCopying ? "Copying…" : "Copy all HTML"}
                <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                One clipboard; invites separated by HTML comments
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={bulkCopying} onSelect={() => void copyAllInvitesHtml("rich")}>
                Rich (full layout)
              </DropdownMenuItem>
              <DropdownMenuItem disabled={bulkCopying} onSelect={() => void copyAllInvitesHtml("safe")}>
                Gmail-safe (cold email)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="mb-8 font-body text-sm text-muted-foreground">
          Early access program lead cards — open a store to preview and copy email-safe HTML.
        </p>
        <ul className="space-y-2">
          {sorted.map((lead) => (
            <li
              key={lead.id}
              className="group rounded-xl border border-border bg-card transition-colors hover:border-primary/40 hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <Link to={`/admin/invite-cards/early-access/${lead.id}`} className="min-w-0 flex-1">
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
