import { useState, useRef, FormEvent, useEffect } from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle,
  Mail,
  MessageCircleQuestion,
  Send,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { usePostHog } from "posthog-js/react";
import emailjs from "@emailjs/browser";
import SitePage from "@/components/site/SitePage";
import PageHead from "@/components/site/PageHead";
import Reveal from "@/components/landing/Reveal";
import Seo from "@/components/Seo";
import { BIZMIS_BOOK_A_CALL_GENERAL_URL } from "@/lib/bizmisUrls";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";
import "@/styles/bzl-site-pages.css";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_CONTACT_TEMPLATE_ID = import.meta.env
  .VITE_EMAILJS_CONTACT_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

type FormStatus = "idle" | "sending" | "success" | "error";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const messages = useMessages();
  const href = useLocaleHref();
  const [searchParams] = useSearchParams();
  const posthog = usePostHog();
  const formRef = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (subjectParam) {
      posthog.capture("contact_page_viewed", {
        prefilled_subject: subjectParam,
      });
      setFormData((prev) => ({ ...prev, subject: subjectParam }));
    }
  }, [searchParams, posthog]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", subject: "", message: "" });
    setFormStatus("idle");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !EMAILJS_SERVICE_ID ||
      !EMAILJS_CONTACT_TEMPLATE_ID ||
      !EMAILJS_PUBLIC_KEY
    ) {
      console.error("EmailJS configuration is missing");
      setFormStatus("error");
      return;
    }

    setFormStatus("sending");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_CONTACT_TEMPLATE_ID,
        {
          user_name: formData.name,
          user_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        EMAILJS_PUBLIC_KEY,
      );
      setFormStatus("success");
      posthog.identify(formData.email.trim(), {
        email: formData.email.trim(),
        name: formData.name.trim(),
      });
      posthog.capture("contact_form_submitted", {
        subject: formData.subject,
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      setFormStatus("error");
    }
  };

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.subject.trim() &&
    formData.message.trim();

  const c = messages.contact;
  const options = [
    {
      icon: Mail,
      title: c.options.emailTitle,
      body: messages.common.email,
      href: `mailto:${messages.common.email}`,
    },
    {
      icon: CalendarDays,
      title: messages.footer.links.bookACall,
      body: c.options.callBody,
      href: BIZMIS_BOOK_A_CALL_GENERAL_URL,
      newTab: true,
    },
    {
      icon: MessageCircleQuestion,
      title: c.options.faqsTitle,
      body: c.options.faqsBody,
      href: href("/faqs"),
    },
  ];

  return (
    <SitePage className="bzl-contact-page">
      <Seo page="contact" />

      <div className="bzl-wrap bzl-contact-hero">
        <PageHead
          icon={Mail}
          eyebrow={messages.footer.links.contact}
          title={c.title}
          lead={c.lead}
        />
      </div>

      {/* The form and the other ways in, on the landing's cream sheet */}
      <div className="bzl-site-sheet bzl-contact-sheet">
        <div className="bzl-wrap">
          <div className="bzl-contact-grid">
            <Reveal className="min-w-0">
              {formStatus === "success" ? (
                <div className="bzl-site-card bzl-contact-card bzl-contact-done" role="status">
                  <span className="bzl-site-disc" aria-hidden="true">
                    <CheckCircle />
                  </span>
                  <h2 className="bzl-contact-done-title">{c.successTitle}</h2>
                  <p className="bzl-contact-done-body">{c.successBody}</p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bzl-site-btn is-ghost"
                  >
                    {c.sendAnother}
                  </button>
                </div>
              ) : (
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="bzl-site-card bzl-contact-card bzl-contact-form"
                >
                  {formStatus === "error" && (
                    <div className="bzl-contact-error" role="alert">
                      <AlertCircle aria-hidden="true" />
                      <p>
                        {c.errorBody}{" "}
                        <a href={`mailto:${messages.common.email}`}>
                          {messages.common.email}
                        </a>
                      </p>
                    </div>
                  )}

                  <div className="bzl-contact-row">
                    <div className="bzl-contact-field">
                      <label htmlFor="name">{c.nameLabel}</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder={c.namePlaceholder}
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="bzl-site-input bzl-contact-input"
                      />
                    </div>

                    <div className="bzl-contact-field">
                      <label htmlFor="email">{c.emailLabel}</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder={c.emailPlaceholder}
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="bzl-site-input bzl-contact-input"
                      />
                    </div>
                  </div>

                  <div className="bzl-contact-field">
                    <label htmlFor="subject">{c.subjectLabel}</label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder={c.subjectPlaceholder}
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="bzl-site-input bzl-contact-input"
                    />
                  </div>

                  <div className="bzl-contact-field">
                    <label htmlFor="message">{c.messageLabel}</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder={c.messagePlaceholder}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="bzl-site-input bzl-contact-input bzl-contact-textarea"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bzl-site-btn is-lg bzl-contact-submit"
                    disabled={formStatus === "sending" || !isFormValid}
                  >
                    {formStatus === "sending" ? (
                      <>
                        <svg
                          className="animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {c.sending}
                      </>
                    ) : (
                      <>
                        <Send aria-hidden="true" />
                        {c.send}
                      </>
                    )}
                  </button>
                </form>
              )}
            </Reveal>

            {/* Other ways in: email, a call, the FAQs */}
            <Reveal delay={120} className="min-w-0">
              <aside className="bzl-contact-aside" aria-labelledby="contact-options">
              <h2 id="contact-options" className="bzl-contact-aside-title">
                {c.options.heading}
              </h2>
              <ul className="bzl-contact-options">
                {options.map(({ icon: Icon, title, body, href: to, newTab }) => (
                  <li key={title}>
                    <a
                      href={to}
                      className="bzl-site-card bzl-contact-option"
                      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <span className="bzl-site-disc" aria-hidden="true">
                        <Icon />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="bzl-contact-option-title">{title}</span>
                        <span className="bzl-contact-option-body">{body}</span>
                      </span>
                      {newTab ? (
                        <ArrowUpRight className="bzl-contact-option-arrow" aria-hidden="true" />
                      ) : (
                        <ArrowRight className="bzl-contact-option-arrow is-flat" aria-hidden="true" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
              </aside>
            </Reveal>
          </div>
        </div>
      </div>
    </SitePage>
  );
};

export default Contact;
