import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { buildFaqCategories, buildAllFaqs } from "@/data/faqs";
import Footer from "@/components/Footer";
import PublicPageLayout from "@/components/PublicPageLayout";
import Seo from "@/components/Seo";
import { usePostHog } from "posthog-js/react";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";

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
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

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
              <strong key={partIndex} className="font-semibold text-foreground">
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

  // Page canvas matches the landing warm-surface palette: a subtle cream
  // gradient over background, identical in feel to Benefits / Customization
  // sections rather than a separate page tone.
  return (
    <PublicPageLayout className="bg-gradient-to-b from-background via-[#FDF7E2]/30 to-background">
      <Seo
        title={messages.seo.faqs.title}
        description={messages.seo.faqs.description}
        path="/faqs"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: allFAQs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <div className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold leading-tight text-foreground mb-4 sm:mb-6">
                {messages.faqsPage.title}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground px-2">
                {messages.faqsPage.lead}
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={messages.faqsPage.searchPlaceholder}
                  aria-label={messages.faqsPage.searchAria}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-colors"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleCategorySelect("all")}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {messages.faqsPage.allQuestions}
                </button>
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="space-y-3 sm:space-y-4">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {messages.faqsPage.noResults}
                  </p>
                </div>
              ) : (
                filteredFAQs.map((faq) => {
                  const isOpen = openItems.includes(faq.id);
                  return (
                    <div
                      key={faq.id}
                      id={`faq-${faq.id}`}
                      className="bg-card/85 backdrop-blur-sm rounded-lg border border-primary/15 overflow-hidden shadow-sm hover:shadow-md hover:border-primary/25 transition-all"
                    >
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full px-4 py-4 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset"
                        aria-expanded={isOpen}
                      >
                        <h3 className="text-base sm:text-lg font-medium text-foreground leading-snug">
                          {faq.question}
                        </h3>
                        <ChevronDown
                          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                            isOpen ? "transform rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      {/* max-h cap is generous so multi-line answers (especially
                          when wrapped to many rows on narrow phones) aren't
                          clipped; opacity covers the visual fade. */}
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          isOpen
                            ? "max-h-[60rem] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="px-4 pb-4 pt-1 sm:px-6 sm:pb-5 sm:pt-2">
                          <div className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            {formatAnswer(faq.answer)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Contact CTA */}
            <div className="text-center mt-10 p-6 sm:mt-12 sm:p-8 bg-[#FDF7E2]/50 rounded-2xl border border-primary/20">
              <h3 className="text-lg sm:text-xl font-heading font-semibold text-foreground mb-2 sm:mb-3">
                {messages.faqsPage.stillHaveQuestions}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                {messages.faqsPage.teamIsHere}
              </p>
              <a
                href={href("/contact")}
                className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-primary text-primary-foreground text-sm sm:text-base font-medium rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {messages.common.contactSupport}
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </PublicPageLayout>
  );
};

export default FAQsPage;
