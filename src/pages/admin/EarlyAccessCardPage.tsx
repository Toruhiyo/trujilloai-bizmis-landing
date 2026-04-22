import { useCallback, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLeadById } from "@/data/leads";
import {
  buildLeadEarlyAccessEmailHtml,
  copyLeadEarlyAccessHtmlSource,
} from "@/lib/leadEarlyAccessEmailHtml";
import {
  buildLeadEarlyAccessEmailHtmlSafe,
  copyLeadEarlyAccessSafeHtmlSource,
  SAFE_EMAIL_MAX_BYTES,
} from "@/lib/leadEarlyAccessEmailHtmlSafe";
import NotFound from "@/pages/NotFound";

type EmailVariant = "rich" | "safe";

function formatTag(raw: string): string {
  return raw.replace(/_/g, " ");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function sizeBadgeClass(bytes: number): string {
  if (bytes > SAFE_EMAIL_MAX_BYTES) return "bg-destructive/10 text-destructive";
  if (bytes > 50_000) return "bg-amber-100 text-amber-800";
  return "bg-emerald-100 text-emerald-800";
}

const EarlyAccessCardPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const lead = leadId ? getLeadById(leadId) : undefined;
  const [variant, setVariant] = useState<EmailVariant>("rich");
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const richIframeRef = useRef<HTMLIFrameElement>(null);
  const safeIframeRef = useRef<HTMLIFrameElement>(null);
  const [richIframeHeight, setRichIframeHeight] = useState(0);
  const [safeIframeHeight, setSafeIframeHeight] = useState(0);

  const richEmail = useMemo(() => {
    if (!lead) return null;
    return buildLeadEarlyAccessEmailHtml(lead);
  }, [lead]);

  const richHtmlSizeBytes = useMemo(() => {
    if (!richEmail) return 0;
    return new TextEncoder().encode(richEmail.html).byteLength;
  }, [richEmail]);

  const safeEmailPreview = useMemo(() => {
    if (!lead) return null;
    try {
      return buildLeadEarlyAccessEmailHtmlSafe(lead, { baseUrl: "" });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [lead]);

  const onRichIframeLoad = useCallback(() => {
    const doc = richIframeRef.current?.contentDocument;
    if (!doc) return;
    const height = doc.documentElement.scrollHeight;
    if (height > 0) setRichIframeHeight(height);
  }, []);

  const onSafeIframeLoad = useCallback(() => {
    const doc = safeIframeRef.current?.contentDocument;
    if (!doc) return;
    const height = doc.documentElement.scrollHeight;
    if (height > 0) setSafeIframeHeight(height);
  }, []);

  const onCopyHtml = useCallback(async () => {
    if (!lead) return;
    setCopying(true);
    setCopied(false);
    try {
      if (variant === "rich") {
        await copyLeadEarlyAccessHtmlSource(lead);
      } else {
        await copyLeadEarlyAccessSafeHtmlSource(lead);
      }
      setCopied(true);
      toast.success(
        variant === "rich"
          ? "Rich HTML copied. Paste into your email platform's HTML editor."
          : "Gmail-safe HTML copied (absolute image URLs baked in).",
      );
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error(e);
      toast.error("Could not copy. Try a secure (https) context.");
    } finally {
      setCopying(false);
    }
  }, [lead, variant]);

  if (!lead) {
    return <NotFound />;
  }

  const storeUrl = `https://${lead.storeDomain}`;
  const activeSizeBytes = variant === "rich" ? richHtmlSizeBytes : (safeEmailPreview?.htmlSizeBytes ?? 0);
  const safeWarnings = safeEmailPreview?.warnings ?? [];

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        {/* Header */}
        <div className="w-full max-w-[38rem]">
          <p className="mb-3 font-body text-sm text-muted-foreground">
            <Link to="/admin/invite-cards" className="text-primary hover:underline">
              ← All invite cards
            </Link>
          </p>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">{lead.storeName}</h1>
              {lead.leadContactName?.trim() ? (
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  Invite contact:{" "}
                  <span className="font-medium text-foreground">{lead.leadContactName.trim()}</span>
                </p>
              ) : null}
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
                  #{lead.orderInBatch}
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
                    {copying ? "Copying…" : `Copy ${variant === "rich" ? "rich" : "Gmail-safe"} HTML`}
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="mt-3 font-body text-xs text-muted-foreground">
            Email HTML size:{" "}
            <span className={`rounded px-1.5 py-0.5 text-[0.65rem] font-bold ${sizeBadgeClass(activeSizeBytes)}`}>
              {formatBytes(activeSizeBytes)}
            </span>
            {variant === "safe" && safeWarnings.length > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                {safeWarnings[0]}
              </span>
            )}
          </p>
        </div>

        {/* Variant toggle + previews */}
        <div className="w-full max-w-[38rem]">
          <Tabs value={variant} onValueChange={(v) => setVariant(v as EmailVariant)}>
            <TabsList className="mb-3">
              <TabsTrigger value="rich">Rich (web view)</TabsTrigger>
              <TabsTrigger value="safe">Gmail-safe (cold email)</TabsTrigger>
            </TabsList>

            <TabsContent value="rich">
              <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <iframe
                  ref={richIframeRef}
                  title="Rich email preview"
                  srcDoc={richEmail?.html}
                  onLoad={onRichIframeLoad}
                  style={richIframeHeight > 0 ? { height: `${richIframeHeight}px` } : { height: "100vh" }}
                  className="w-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
              <p className="mt-2 text-center font-body text-xs text-muted-foreground">
                Rich layout. Preserves the full Bizmis visual identity — use for the web/admin view, not cold email sends.
              </p>
            </TabsContent>

            <TabsContent value="safe">
              <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <iframe
                  ref={safeIframeRef}
                  title="Gmail-safe email preview"
                  srcDoc={safeEmailPreview?.html}
                  onLoad={onSafeIframeLoad}
                  style={safeIframeHeight > 0 ? { height: `${safeIframeHeight}px` } : { height: "100vh" }}
                  className="w-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
              <p className="mt-2 text-center font-body text-xs text-muted-foreground">
                Table-based HTML. Images pulled locally from the dev server; Copy button emits absolute bizmis.ai URLs for Instantly.
              </p>
              {safeEmailPreview && (
                <details className="mt-3 rounded-lg border border-border bg-background p-3">
                  <summary className="cursor-pointer font-body text-xs font-medium text-muted-foreground">
                    Plain-text alternative ({formatBytes(new TextEncoder().encode(safeEmailPreview.plainText).byteLength)})
                  </summary>
                  <pre className="mt-2 max-h-[40vh] overflow-auto whitespace-pre-wrap break-words rounded bg-muted/50 p-3 font-mono text-xs text-foreground">
                    {safeEmailPreview.plainText}
                  </pre>
                </details>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EarlyAccessCardPage;
