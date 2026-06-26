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
        title="Contact Bizmis — Get in Touch"
        description="Reach the Bizmis team about Shopify install, custom website integrations, partnerships, or anything else. We reply fast."
        path="/contact"
      />
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FDF7E2] rounded-full mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-muted-foreground">
              Have questions about Bizmis? We'd love to hear from you. Send us a
              message and we'll respond as soon as possible.
            </p>
          </div>

          {formStatus === "success" ? (
            <div className="bg-white rounded-2xl border border-border shadow-soft p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FDF7E2] rounded-full mb-6">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-3">
                Message Sent!
              </h3>
              <p className="text-muted-foreground mb-6">
                Thank you for reaching out. We'll get back to you as soon as
                possible.
              </p>
              <Button onClick={resetForm} variant="outline">
                Send Another Message
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
                    Failed to send message. Please try again or email us
                    directly at{" "}
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
                    Your Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
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
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
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
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="How can we help you?"
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
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more about your question or feedback..."
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="text-center mt-8 text-muted-foreground">
            <p>
              Or email us directly at{" "}
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
