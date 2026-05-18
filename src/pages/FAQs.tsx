import React, { useState, useEffect } from "react";
import { ChevronDown, Search, ArrowLeft } from "lucide-react";
import { faqCategories, allFAQs, type FAQ } from "@/data/faqs";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const FAQsPage = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Handle URL hash navigation to specific FAQ
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      // Find the FAQ with this ID
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
      }
    }
  }, []);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
    <div className="min-h-screen bg-gradient-to-b from-background via-[#FDF7E2]/30 to-background">
      {/* Header with navigation */}
      <div className="bg-background/80 backdrop-blur-md border-b border-primary/20">
        <div className="container mx-auto px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors sm:gap-2 sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
            <div className="w-px h-5 bg-border sm:h-6"></div>
            <h1 className="text-lg font-heading font-bold text-foreground sm:text-2xl">
              FAQ's
            </h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold leading-tight text-foreground mb-4 sm:mb-6">
                Everything you need to know about Bizmis
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground px-2">
                Find answers to the most common questions about our Shopify
                sales assistant
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-colors"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  All Questions
                </button>
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
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
                    No FAQs found matching your search.
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
                Still have questions?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Our team is here to help you get the most out of Bizmis.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-primary text-primary-foreground text-sm sm:text-base font-medium rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQsPage;
