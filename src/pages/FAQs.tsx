import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowRight,
  ChevronDown,
  MessageCircleQuestion,
  Search,
} from "lucide-react";
import { buildFaqCategories, buildAllFaqs } from "@/data/faqs";
import SitePage from "@/components/site/SitePage";
import PageHead from "@/components/site/PageHead";
import Reveal from "@/components/landing/Reveal";
import Seo from "@/components/Seo";
import { usePostHog } from "posthog-js/react";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";

/** Old FAQ deep-link ids that still resolve to their renamed FAQ. */
const LEGACY_FAQ_HASHES: Record<string, string> = {
  "what-counts-as-conversation": "what-counts-as-session",
};

const FAQsPage = () => {
  const posthog = usePostHog();
  const messages = useMessages();
  const href = useLocaleHref();
  const faqCategories = useMemo(() => buildFaqCategories(messages), [messages]);
  const allFAQs = useMemo(() => buildAllFaqs(messages), [messages]);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle URL hash navigation to a specific FAQ or a whole category
  useEffect(() => {
    const rawHash = window.location.hash.replace("#", "");
    if (!rawHash) return;
    const hash = LEGACY_FAQ_HASHES[rawHash] ?? rawHash;

    // Deep link to an individual FAQ (e.g. /faqs#refund-policy)
    const targetFaq = allFAQs.find((faq) => faq.id === hash);
    if (targetFaq) {
      // Open the FAQ
      setOpenItems((prev) => [...prev, hash]);
      // Set the category if not "all"
      setSelectedCategory(targetFaq.category);
      // Scroll to the FAQ after a brief delay to ensure rendering
      setTimeout(() => {
        const element = document.getElementById(`faq-${hash}`);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          // Focus the FAQ button for accessibility
          const button = element.querySelector("button");
          if (button) {
            button.focus();
          }
        }
      }, 100);
      return;
    }

    // Deep link to a category (e.g. /faqs#pricing-billing)
    const targetCategory = faqCategories.find((cat) => cat.id === hash);
    if (targetCategory) {
      setSelectedCategory(targetCategory.id);
    }
  }, [allFAQs, faqCategories]);

  const toggleItem = (id: string) => {
    const isOpening = !openItems.includes(id);
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (isOpening) {
      const faq = allFAQs.find((f) => f.id === id);
      posthog.capture("faq_expanded", {
        faq_id: id,
        faq_question: faq?.question,
        faq_category: faq?.category ?? selectedCategory,
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (value.trim()) {
      searchDebounceRef.current = setTimeout(() => {
        posthog.capture("faq_searched", {
          search_term: value.trim(),
          active_category: selectedCategory,
        });
      }, 600);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    posthog.capture("faq_category_selected", {
      category: categoryId,
      previous_category: selectedCategory,
    });
  };

  const filteredFAQs = React.useMemo(() => {
    let faqs =
      selectedCategory === "all"
        ? allFAQs
        : faqCategories.find((cat) => cat.id === selectedCategory)?.faqs || [];

    if (searchTerm) {
      faqs = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return faqs;
  }, [searchTerm, selectedCategory]);

  const formatAnswer = (answer: string) => {
    // Handle markdown-style formatting
    const lines = answer.split("\n");
    return lines.map((line, index) => {
      if (line.trim() === "") return <br key={index} />;

      // Handle bold text
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldRegex);

      return (
        <span key={index} className="block">
          {parts.map((part, partIndex) =>
            partIndex % 2 === 1 ? (
              <strong key={partIndex}>
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </span>
      );
    });
  };

  return (
    <SitePage>
      <Seo page="faqs" />

      {/* The page's head, the search and the categories under it */}
      <div className="bzl-wrap bzl-site-hero">
        <PageHead
          icon={MessageCircleQuestion}
          eyebrow={messages.nav.faqs}
          title={messages.faqsPage.title}
          lead={messages.faqsPage.lead}
        />
        <Reveal delay={240} className="mx-auto mt-[clamp(1.5rem,4svh,2.5rem)] max-w-3xl">
          <div className="bzl-faq-search">
            <Search aria-hidden="true" />
            <input
              type="text"
              placeholder={messages.faqsPage.searchPlaceholder}
              aria-label={messages.faqsPage.searchAria}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bzl-site-input"
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              aria-pressed={selectedCategory === "all"}
              onClick={() => handleCategorySelect("all")}
              className="bzl-site-chip"
            >
              {messages.faqsPage.allQuestions}
            </button>
            {faqCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={selectedCategory === category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="bzl-site-chip"
              >
                {category.name}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {/* The questions, on the landing's cream sheet */}
      <div className="bzl-site-sheet">
        <div className="bzl-wrap">
          <div className="mx-auto max-w-3xl space-y-3">
            {filteredFAQs.length === 0 ? (
              <p className="bzl-site-lead py-10">
                {messages.faqsPage.noResults}
              </p>
            ) : (
              filteredFAQs.map((faq) => {
                const isOpen = openItems.includes(faq.id);
                return (
                  <div
                    key={faq.id}
                    id={`faq-${faq.id}`}
                    className={`bzl-site-card bzl-faq-item${isOpen ? " is-open" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(faq.id)}
                      className="bzl-faq-q"
                      aria-expanded={isOpen}
                    >
                      <h2>{faq.question}</h2>
                      <span className="bzl-faq-chev" aria-hidden="true">
                        <ChevronDown />
                      </span>
                    </button>

                    {/* max-h cap is generous so multi-line answers (especially
                        when wrapped to many rows on narrow phones) aren't
                        clipped; opacity covers the visual fade. */}
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-[60rem] opacity-100" : "max-h-0 opacity-0"
                      }`}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="bzl-faq-a">{formatAnswer(faq.answer)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Still have questions: the way to us */}
      <div className="bzl-wrap bzl-site-section pb-[clamp(3rem,9svh,6rem)]">
        <PageHead
          as="h2"
          title={messages.faqsPage.stillHaveQuestions}
          lead={messages.faqsPage.teamIsHere}
        >
          <Reveal delay={240} className="mt-2">
            <a href={href("/contact")} className="bzl-site-btn is-lg">
              {messages.common.contactSupport}
              <ArrowRight className="is-arrow" aria-hidden="true" />
            </a>
          </Reveal>
        </PageHead>
      </div>
    </SitePage>
  );
};

export default FAQsPage;
