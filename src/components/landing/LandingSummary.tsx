import { useMessages } from "@/i18n/LocaleProvider";
import { plainText } from "@/seo/site";

/**
 * Plain-text copies, for screen readers, crawlers and AI answer engines, of
 * what the landing otherwise only says in pictures (visually hidden, sr-only;
 * the same words as the page and the FAQs, nothing added).
 *
 * - "definition": what Bizmis is, the FAQs' first answer. The hero shows it
 *   (the title, the talking agent, the film) but never says it in a sentence.
 * - "funnel": Boost Sales' three stages as the drawn funnel completes them
 *   ("Visitors who want the right product… Find it fast"). The opener is a
 *   heading, but its ending lives in the funnel drawing, which is aria-hidden.
 */
const LandingSummary = ({ part }: { part: "definition" | "funnel" }) => {
  const m = useMessages();
  if (part === "definition") {
    return <p className="sr-only">{plainText(m.faqs.items["what-is-bizmis"].answer)}</p>;
  }
  const s = m.landing.sales;
  const stages = (s.openers ?? [])
    .map((opener, i) => (s.funnel?.solutions?.[i] ? `${opener}… ${s.funnel.solutions[i]}` : ""))
    .filter(Boolean);
  if (stages.length === 0) return null;
  return (
    <ul className="sr-only">
      {stages.map((stage) => (
        <li key={stage}>{stage}</li>
      ))}
    </ul>
  );
};

export default LandingSummary;
