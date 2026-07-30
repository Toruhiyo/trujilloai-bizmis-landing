import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import {
  LOCALES,
  LOCALE_NAMES,
  LOCALE_SHORT_NAMES,
} from "@/i18n/locales";
import { useLocale, useMessages, useSwitchLocale } from "@/i18n/LocaleProvider";

const PREFERRED_LOCALE_STORAGE_KEY = "bizmis.preferredLocale";

interface LanguageSwitcherProps {
  /** "light" renders on a light navbar background, "dark" on the transparent hero. */
  theme?: "light" | "dark";
  className?: string;
}

/** Compact language picker: navbar trigger + dropdown of endonyms. Persists the
 *  explicit choice so a returning visitor keeps their picked locale. */
const LanguageSwitcher = ({ theme = "light", className = "" }: LanguageSwitcherProps) => {
  const locale = useLocale();
  const switchLocale = useSwitchLocale();
  const messages = useMessages();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (next: (typeof LOCALES)[number]) => {
    setIsOpen(false);
    try {
      window.localStorage.setItem(PREFERRED_LOCALE_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode, quota); locale switch still works.
    }
    switchLocale(next);
  };

  const triggerToneClass =
    theme === "dark"
      ? "text-white/90 hover:text-white hover:bg-white/10"
      : "text-foreground hover:bg-accent";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={messages.languageSwitcher.ariaLabel}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors duration-300 ${triggerToneClass}`}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span>{LOCALE_SHORT_NAMES[locale]}</span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={messages.languageSwitcher.label}
          className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-background py-1 text-foreground shadow-lg"
        >
          {LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === locale}
              onClick={() => handleSelect(option)}
              className={`flex w-full items-center px-3.5 py-2 text-left text-sm transition-colors hover:bg-accent ${
                option === locale ? "font-semibold text-primary" : "text-foreground"
              }`}
            >
              {LOCALE_NAMES[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
