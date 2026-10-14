import { useMessages } from "@/i18n/LocaleProvider";
import { HeadsetIcon, IdeaIcon, TrendIcon } from "../AnimatedIcons";

/**
 * Opener approach 2, "benefits overview": ONE screen that presents the three
 * benefits together, like a table of contents, before the first of them:
 * three big animated icons, each with its name and promise; each is a link
 * to its section. After it, each benefit is a screen with a small inline
 * title (Boost Sales keeps its sticky bar). openers.css styles it (.bov-*).
 */
const BenefitsOverview = () => {
  const m = useMessages();
  const s = m.landing;
  const items = [
    {
      Icon: TrendIcon,
      name: m.benefits.sales.badge,
      promise: `${s.sales.titleLead} ${s.sales.titleParts.join(" ")}`,
      target: ".p-sales",
    },
    {
      Icon: HeadsetIcon,
      name: m.benefits.support.badge,
      promise: `${s.support.title} ${s.support.titleTail}`,
      target: ".p-support",
    },
    {
      Icon: IdeaIcon,
      name: m.benefits.insights.badge,
      promise: `${s.insights.title} ${s.insights.titleTail}`,
      target: ".p-insights",
    },
  ];
  const go = (sel: string) => {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
  };
  return (
    <section className="bov" aria-label={items.map((x) => x.name).join(", ")}>
      <ol className="bov-list">
        {items.map(({ Icon, name, promise, target }, i) => (
          <li key={name}>
            <a
              href={`#${target.slice(1)}`}
              className="bov-item"
              onClick={(e) => {
                e.preventDefault();
                go(target);
              }}
            >
              <span className="bov-num">{`0${i + 1}`}</span>
              <span className="bov-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="bov-name">{name}</span>
              <span className="bov-promise">{promise}</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default BenefitsOverview;
