import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import SitePage from "@/components/site/SitePage";
import PageHead from "@/components/site/PageHead";
import { useMessages } from "@/i18n/LocaleProvider";
import "@/styles/bzl-site-pages.css";

/** "5. Sub-Processors & Third-Party Services" → "sub-processors-and-third-party-services" */
export const legalSlug = (title: string) =>
  title
    .replace(/^\s*\d+\.\s*/, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** One numbered part of a legal page: its h2 (and the anchor the contents link to). */
export const LegalSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section id={legalSlug(title)} className="bzl-legal-section">
    <h2>{title}</h2>
    <div className="bzl-legal-section-body">{children}</div>
  </section>
);

/** The contents' own label (the legal pages are English only, as their text is). */
const CONTENTS_LABEL = "On this page";

/**
 * Privacy and Terms in the v2 landing's look: the site's head (a pill, the
 * title, the date), then the text on the cream sheet in a white card at a
 * reading measure, with the contents beside it (sticky on desktop, a fold-out
 * on phones) built from the LegalSection children. The legal wording is
 * whatever the page passes in, untouched.
 */
const LegalPage = ({
  icon,
  title,
  lastUpdated,
  children,
}: {
  icon: LucideIcon;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) => {
  const messages = useMessages();
  const sections = useMemo(
    () =>
      Children.toArray(children)
        .filter(
          (child): child is ReactElement<{ title: string }> =>
            isValidElement(child) &&
            typeof (child.props as { title?: unknown }).title === "string",
        )
        .map((child) => ({
          id: legalSlug(child.props.title),
          title: child.props.title,
        })),
    [children],
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // the contents follow the reading: the last section whose top has passed the upper third
  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.33;
      let current: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sections]);

  return (
    <SitePage className="bzl-legal-page">
      <div className="bzl-wrap bzl-legal-hero">
        <PageHead
          icon={icon}
          eyebrow={messages.footer.columns.legal}
          title={title}
          lead={
            <span className="bzl-legal-updated">Last updated: {lastUpdated}</span>
          }
        />
      </div>

      <div className="bzl-site-sheet bzl-legal-sheet">
        <div className="bzl-wrap">
          <div className="bzl-legal-grid">
            {sections.length > 3 && (
              <nav
                className="bzl-site-card bzl-legal-toc"
                aria-label={CONTENTS_LABEL}
              >
                {/* phones and tablets: a fold-out */}
                <button
                  type="button"
                  className="bzl-legal-toc-toggle lg:hidden"
                  aria-expanded={open}
                  aria-controls="legal-contents"
                  onClick={() => setOpen((o) => !o)}
                >
                  {CONTENTS_LABEL}
                  <span className="bzl-faq-chev" aria-hidden="true">
                    <ChevronDown />
                  </span>
                </button>
                {/* desktop: always open, beside the text */}
                <p className="bzl-legal-toc-title hidden lg:flex" aria-hidden="true">
                  {CONTENTS_LABEL}
                </p>
                <ol
                  id="legal-contents"
                  className="bzl-legal-toc-list"
                  data-open={open || undefined}
                >
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        aria-current={active === s.id ? "true" : undefined}
                        onClick={() => setOpen(false)}
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <article className="bzl-site-card bzl-legal-doc">
              <div className="bzl-legal-body">{children}</div>
            </article>
          </div>
        </div>
      </div>
    </SitePage>
  );
};

export default LegalPage;
