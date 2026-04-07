import { useCallback, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink, Copy, Check, Eye, Code } from "lucide-react";
import { toast } from "sonner";
import LeadPilotInviteCard from "@/components/invite-cards/LeadPilotInviteCard";
import { Button } from "@/components/ui/button";
import { getLeadPilotById } from "@/data/leadPilotRegistry";
import { buildLeadPilotInviteEmailHtml, copyLeadPilotHtmlSource } from "@/lib/leadPilotInviteEmailHtml";
import NotFound from "@/pages/NotFound";

function formatTag(raw: string): string {
  return raw.replace(/_/g, " ");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

type Tab = "preview" | "email";

const PilotInviteCardPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const lead = leadId ? getLeadPilotById(leadId) : undefined;
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>("preview");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(0);

  const emailData = useMemo(() => {
    if (!lead) return null;
    return buildLeadPilotInviteEmailHtml(lead);
  }, [lead]);

  const htmlSizeBytes = useMemo(() => {
    if (!emailData) return 0;
    return new TextEncoder().encode(emailData.html).byteLength;
  }, [emailData]);

  const onIframeLoad = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const height = doc.documentElement.scrollHeight;
    if (height > 0) setIframeHeight(height);
  }, []);

  const onCopyHtml = useCallback(async () => {
    if (!lead) return;
    setCopying(true);
    setCopied(false);
    try {
      await copyLeadPilotHtmlSource(lead);
      setCopied(true);
      toast.success("HTML source copied — paste into your email platform's HTML editor");
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error(e);
      toast.error("Could not copy. Try a secure (https) context.");
    } finally {
      setCopying(false);
    }
  }, [lead]);

  if (!lead) {
    return <NotFound />;
  }

  const storeUrl = `https://${lead.storeDomain}`;

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        {/* Header */}
        <div className="w-full max-w-[36rem]">
          <p className="mb-3 font-body text-sm text-muted-foreground">
            <Link to="/admin/invite-cards" className="text-primary hover:underline">
              ← All invite cards
            </Link>
          </p>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">{lead.storeName}</h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-muted px-2 py-0.5 font-body text-xs font-medium text-muted-foreground">
                  {lead.country}
                </span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 font-body text-xs font-medium text-primary">
                  {formatTag(lead.vertical)}
                </span>
                {lead.subNiche && (
                  <span className="rounded-md bg-primary/5 px-2 py-0.5 font-body text-xs font-medium text-primary/70">
                    {formatTag(lead.subNiche)}
                  </span>
                )}
                <span className="rounded-md bg-muted px-2 py-0.5 font-body text-xs text-muted-foreground">
                  Batch {lead.batch} · #{lead.orderInBatch}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Visit store
                </a>
              </Button>
              <Button type="button" size="sm" onClick={onCopyHtml} disabled={copying}>
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    {copying ? "Copying…" : "Copy HTML"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`inline-flex items-center gap-1.5 border-b-2 px-1 pb-1 font-body text-sm font-medium transition-colors ${
              tab === "preview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Card preview
          </button>
          <button
            type="button"
            onClick={() => setTab("email")}
            className={`inline-flex items-center gap-1.5 border-b-2 px-1 pb-1 font-body text-sm font-medium transition-colors ${
              tab === "email"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Email HTML
            <span className={`ml-1 rounded px-1.5 py-0.5 text-[0.6rem] font-bold ${
              htmlSizeBytes > 100_000
                ? "bg-destructive/10 text-destructive"
                : htmlSizeBytes > 50_000
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
            }`}>
              {formatBytes(htmlSizeBytes)}
            </span>
          </button>
        </div>

        {/* Content */}
        {tab === "preview" ? (
          <LeadPilotInviteCard lead={lead} />
        ) : (
          <div className="w-full max-w-[38rem]">
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <iframe
                ref={iframeRef}
                title="Email HTML preview"
                srcDoc={emailData?.html}
                onLoad={onIframeLoad}
                style={iframeHeight > 0 ? { height: `${iframeHeight}px` } : { height: "100vh" }}
                className="w-full border-0"
                sandbox="allow-same-origin"
              />
            </div>
            <p className="mt-2 text-center font-body text-xs text-muted-foreground">
              Rendered preview of the email-safe HTML (tables, inline CSS, hosted images).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PilotInviteCardPage;
