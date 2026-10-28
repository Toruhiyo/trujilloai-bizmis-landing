import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Compass } from "lucide-react";
import SitePage from "@/components/site/SitePage";
import PageHead from "@/components/site/PageHead";
import Reveal from "@/components/landing/Reveal";
import AgentImage from "@/components/landing/AgentImage";
import Seo from "@/components/Seo";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";
import "@/styles/bzl-site-pages.css";

/** The 404 page in the v2 landing's look: Yusuke smiling, a light word, the way home. */
const NotFound = () => {
  const location = useLocation();
  const messages = useMessages();
  const href = useLocaleHref();
  const m = messages.notFound;

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <SitePage className="bzl-404-page">
      <Seo page="notFound" />
      <div className="bzl-wrap bzl-404">
        <Reveal>
          <AgentImage
            name="support-yusuke"
            alt=""
            sizes="(min-width: 1024px) 160px, 30vw"
            eager
            className="bzl-404-avatar"
            imgClassName="object-bottom"
          />
        </Reveal>
        <PageHead icon={Compass} eyebrow={m.title} title={m.headline} lead={m.lead}>
          <Reveal delay={240} className="bzl-404-actions">
            <a href={href("/")} className="bzl-site-btn is-lg is-dark">
              {m.homeCta}
              <ArrowRight className="is-arrow" aria-hidden="true" />
            </a>
            <div className="bzl-404-links">
              <a href={href("/pricing")} className="bzl-site-chip">
                {messages.nav.pricing}
              </a>
              <a href={href("/faqs")} className="bzl-site-chip">
                {messages.nav.faqs}
              </a>
              <a href={href("/contact")} className="bzl-site-chip">
                {messages.footer.links.contact}
              </a>
            </div>
          </Reveal>
        </PageHead>
      </div>
    </SitePage>
  );
};

export default NotFound;
