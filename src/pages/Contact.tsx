import { useState, useRef, FormEvent, useEffect } from "react";
import { Send, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import emailjs from "@emailjs/browser";
import Footer from "@/components/Footer";
import PublicPageLayout from "@/components/PublicPageLayout";
import Seo from "@/components/Seo";
import { useMessages } from "@/i18n/LocaleProvider";

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

  return (
    <PublicPageLayout
      className="bg-gradient-to-br from-[#FDF7E2] via-white to-[#FDF7E2]/30"
      mainClassName="py-20"
    >
      <Seo
        title={messages.seo.contact.title}
        description={messages.seo.contact.description}
        path="/contact"
      />
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FDF7E2] rounded-full mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
              {messages.contact.title}
            </h2>
            <p className="text-xl text-muted-foreground">
              {messages.contact.lead}
            </p>
          </div>

          {formStatus === "success" ? (
            <div className="bg-white rounded-2xl border border-border shadow-soft p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FDF7E2] rounded-full mb-6">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-3">
                {messages.contact.successTitle}
              </h3>
              <p className="text-muted-foreground mb-6">
                {messages.contact.successBody}
              </p>
              <Button onClick={resetForm} variant="outline">
                {messages.contact.sendAnother}
              </Button>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-border shadow-soft p-8 space-y-6"
            >
              {formStatus === "error" && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>
                    {messages.contact.errorBody}{" "}
                    <a
                      href="mailto:hello@bizmis.ai"
                      className="font-medium underline"
                    >
                      hello@bizmis.ai
                    </a>
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground"
                  >
                    {messages.contact.nameLabel}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={messages.contact.namePlaceholder}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    {messages.contact.emailLabel}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={messages.contact.emailPlaceholder}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-foreground"
                >
                  {messages.contact.subjectLabel}
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder={messages.contact.subjectPlaceholder}
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground"
                >
                  {messages.contact.messageLabel}
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder={messages.contact.messagePlaceholder}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={formStatus === "sending" || !isFormValid}
              >
                {formStatus === "sending" ? (
                  <>
                    <span className="animate-spin mr-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
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
                    </span>
                    {messages.contact.sending}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {messages.contact.send}
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="text-center mt-8 text-muted-foreground">
            <p>
              {messages.contact.orEmailUs}{" "}
              <a
                href="mailto:hello@bizmis.ai"
                className="font-medium text-primary hover:underline"
              >
                hello@bizmis.ai
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </PublicPageLayout>
  );
};

export default Contact;
