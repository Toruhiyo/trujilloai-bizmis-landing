import { useState, FormEvent, useEffect } from "react";
import {
  ArrowLeft,
  Rocket,
  CheckCircle,
  AlertCircle,
  Gift,
  Map,
  Star,
  Crown,
  Calendar,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import emailjs from "@emailjs/browser";
import confetti from "canvas-confetti";
import { bizmisConfettiColors } from "@/lib/colors";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_WAITLIST_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_WAITLIST_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const LAUNCH_DATE = "March 2026";
const EARLY_BIRD_SPOTS = 50;

type FormStatus = "idle" | "sending" | "success" | "error";

interface FormData {
  name: string;
  email: string;
  storeName: string;
  storeUrl: string;
}

const JoinWaitlist = () => {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const [searchParams] = useSearchParams();
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    storeName: "",
    storeUrl: "",
  });

  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam) {
      posthog.capture("waitlist_page_viewed", {
        selected_plan: planParam,
      });
    }
  }, [searchParams, posthog]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStoreUrlBlur = () => {
    const url = formData.storeUrl.trim();
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      setFormData((prev) => ({ ...prev, storeUrl: `https://${url}` }));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", storeName: "", storeUrl: "" });
    setFormStatus("idle");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!EMAILJS_SERVICE_ID || !EMAILJS_WAITLIST_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error("EmailJS configuration is missing");
      setFormStatus("error");
      return;
    }

    setFormStatus("sending");

    const planParam = searchParams.get("plan");

    // Trim input values
    const cleanedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      storeName: formData.storeName.trim(),
      storeUrl: formData.storeUrl.trim(),
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_WAITLIST_TEMPLATE_ID,
        {
          user_name: cleanedData.name,
          user_email: cleanedData.email,
          store_name: cleanedData.storeName,
          store_url: cleanedData.storeUrl,
          selected_plan: planParam || "Not selected",
        },
        EMAILJS_PUBLIC_KEY
      );
      setFormStatus("success");

      posthog.capture("waitlist_signup_completed", {
        selected_plan: planParam || "not_selected",
        store_domain: cleanedData.storeUrl,
      });

      // Fire confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const colors = bizmisConfettiColors();

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          colors,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          colors,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    } catch (error) {
      console.error("Failed to submit waitlist:", error);
      setFormStatus("error");
    }
  };

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.storeName.trim() &&
    formData.storeUrl.trim();

  if (formStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDF7E2] via-white to-[#FDF7E2] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid-gray-100/50 bg-grid-16 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FDF7E2]/50 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FDF7E2]/50 rounded-full blur-3xl pointer-events-none animate-pulse delay-700"></div>

        <div className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-primary/10 p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-warm rounded-full mb-8 shadow-lg shadow-primary/20">
            <PartyPopper className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            You're on the list!
          </h2>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Welcome to the Bizmis Early Bird program.<br />
            We'll notify you as soon as we launch in <span className="font-semibold text-foreground">{LAUNCH_DATE}</span>.
          </p>

          <div className="bg-[#FDF7E2] rounded-2xl p-6 mb-8 border border-primary/10 max-w-md mx-auto">
            <p className="text-foreground font-medium flex items-center justify-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Check your inbox!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              We've sent a confirmation email with more details about your early bird benefits.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => navigate('/')}
              className="bg-gray-900 hover:bg-gray-800 text-white h-12 px-8 rounded-xl text-lg w-full sm:w-auto"
            >
              Back to Home
            </Button>
            <div>
              <Button
                onClick={resetForm}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                Add Another Store
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF7E2] via-white to-[#FDF7E2]/30">
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
            <div className="w-px h-6 bg-border"></div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Join the Waitlist
            </h1>
          </div>
        </div>
      </div>

      <div className="py-12 lg:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left Column - Marketing Content */}
              <div className="lg:sticky lg:top-8">
                <div className="inline-flex items-center gap-2 bg-gradient-warm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                  <Crown className="w-4 h-4" />
                  Early Bird Program
                </div>

                <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 leading-tight">
                  Be Among the First{" "}
                  <span className="text-primary">
                    {EARLY_BIRD_SPOTS} Merchants
                  </span>
                </h2>

                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Join our exclusive waitlist and get priority access when Bizmis
                  launches. Shape the future of conversational commerce with us.
                </p>

                {/* Launch Date Banner */}
                <div className="bg-white rounded-2xl border border-primary/20 p-6 mb-8 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#FDF7E2] rounded-2xl flex items-center justify-center">
                      <Calendar className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Expected Launch
                      </p>
                      <p className="text-2xl font-heading font-bold text-foreground">
                        {LAUNCH_DATE}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-5">
                  <h3 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Early Bird Benefits
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-[#FDF7E2] flex items-center justify-center flex-shrink-0">
                        <Gift className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          50% Off First 3 Months
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Lock in exclusive launch pricing forever.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-[#FDF7E2] flex items-center justify-center flex-shrink-0">
                        <Map className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Direct Roadmap Influence
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Your feature requests get priority status.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-[#FDF7E2] flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          VIP Onboarding
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Personal setup session with our team.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Right Column - Form */}
              <div>
                <div className="bg-white rounded-2xl border border-border shadow-xl p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FDF7E2] rounded-full mb-4">
                      <Rocket className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                      Reserve Your Spot
                    </h3>
                    <p className="text-muted-foreground">
                      Be first in line when Bizmis launches
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {formStatus === "error" && (
                      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">
                          Something went wrong. Please try again or email us at{" "}
                          <a
                            href="mailto:hello@bizmis.ai"
                            className="font-medium underline"
                          >
                            hello@bizmis.ai
                          </a>
                        </p>
                      </div>
                    )}

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

                    <div className="space-y-2">
                      <label
                        htmlFor="storeName"
                        className="block text-sm font-medium text-foreground"
                      >
                        Store Name
                      </label>
                      <Input
                        id="storeName"
                        name="storeName"
                        type="text"
                        placeholder="My Awesome Store"
                        value={formData.storeName}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="storeUrl"
                        className="block text-sm font-medium text-foreground"
                      >
                        Shopify Store URL
                      </label>
                      <Input
                        id="storeUrl"
                        name="storeUrl"
                        type="url"
                        placeholder="https://mystore.myshopify.com"
                        value={formData.storeUrl}
                        onChange={handleInputChange}
                        onBlur={handleStoreUrlBlur}
                        required
                        className="h-12"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your .myshopify.com URL or custom domain
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 text-lg bg-gradient-warm hover:opacity-90 transition-opacity"
                      disabled={formStatus === "sending" || !isFormValid}
                    >
                      {formStatus === "sending" ? (
                        <>
                          <span className="animate-spin mr-2">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
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
                          </span>
                          Reserving your spot...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-5 h-5 mr-2" />
                          Join the Waitlist
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground pt-2">
                      By joining, you agree to receive updates about Bizmis.
                      <br />
                      We respect your privacy and will never spam you.
                    </p>
                  </form>
                </div>

                {/* Social Proof */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Join{" "}
                    <span className="font-semibold text-foreground">
                      forward-thinking merchants
                    </span>{" "}
                    already on the waitlist
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinWaitlist;
