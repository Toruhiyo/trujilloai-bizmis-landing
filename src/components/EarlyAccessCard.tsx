import { ArrowRight, Crown } from "lucide-react";
import { FaGift, FaMapMarkedAlt, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";

interface EarlyAccessCardProps {
  className?: string;
}

const EarlyAccessCard: React.FC<EarlyAccessCardProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const messages = useMessages();
  const href = useLocaleHref();

  const handleClaimClick = () => {
    posthog.capture("cta_clicked", {
      cta_type: "claim_early_bird",
      location: "early_access_card",
    });
    navigate(href("/pricing"));
  };

  return (
    <div className={`relative group max-w-sm w-full mx-auto lg:ml-auto lg:mr-0 ${className}`}>
      {/* Glow effect behind the card */}
      <div className="absolute -inset-0.5 bg-primary/50 rounded-3xl blur opacity-60 group-hover:opacity-80 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

      <div className="relative bg-white rounded-2xl sm:rounded-3xl p-5 xs:p-6 sm:p-8 shadow-2xl border border-primary/10 h-full flex flex-col overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#FDF7E2] rounded-bl-[100px] -z-10 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FDF7E2] rounded-tr-[80px] -z-10 opacity-40"></div>

        {/* Header Section */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-1.5 self-start bg-transparent border-2 border-primary rounded-full pl-2 pr-3 py-1">
            <Crown className="w-3 h-3 text-primary fill-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wide">{messages.earlyAccessCard.badge}</span>
          </div>

          <div>
            <h3 className="text-xl xs:text-2xl sm:text-3xl font-heading font-bold text-gray-900 leading-tight">
              {messages.earlyAccessCard.titleLead} <span className="text-primary">{messages.earlyAccessCard.titleHighlight}</span>
            </h3>
            <p className="text-gray-500 mt-1.5 sm:mt-2 text-[13px] sm:text-sm leading-relaxed">
              {messages.earlyAccessCard.lead}
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-3 sm:space-y-5 mb-5 sm:mb-8 flex-1">
          {[
            { icon: FaGift, ...messages.earlyAccessCard.perks[0] },
            { icon: FaMapMarkedAlt, ...messages.earlyAccessCard.perks[1] },
            { icon: FaStar, ...messages.earlyAccessCard.perks[2] },
          ].map(({ icon: Icon, title, caption }) => (
            <div key={title} className="flex items-start gap-3 sm:gap-4 group/item">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/90 flex items-center justify-center flex-shrink-0 shadow-sm group-hover/item:scale-105 transition-transform">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-gray-900 text-[13px] sm:text-sm leading-tight">
                  {title}
                </h4>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-snug">
                  {caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer / CTA */}
        <div className="pt-4 sm:pt-6 border-t border-gray-100 mt-auto">
          <div className="flex justify-center mb-3 sm:mb-4">
            <span className="text-xs font-semibold text-primary">
              {messages.earlyAccessCard.limitedSpots}
            </span>
          </div>

          <Button
            onClick={handleClaimClick}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium h-11 sm:h-12 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            {messages.earlyAccessCard.cta}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EarlyAccessCard;
