import { Map, Gift, ArrowRight, Crown, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";

interface EarlyAccessCardProps {
  className?: string;
}

const EarlyAccessCard: React.FC<EarlyAccessCardProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const posthog = usePostHog();

  const handleClaimClick = () => {
    posthog.capture("cta_clicked", {
      cta_type: "claim_early_bird",
      location: "early_access_card",
    });
    navigate("/pricing");
  };

  return (
    <div className={`relative group max-w-sm w-full mx-auto lg:ml-auto lg:mr-0 ${className}`}>
      {/* Glow effect behind the card */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400/50 to-amber-300/50 rounded-3xl blur opacity-60 group-hover:opacity-80 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

      <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-orange-100 h-full flex flex-col overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-50 to-amber-50 rounded-bl-[100px] -z-10 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-50 rounded-tr-[80px] -z-10 opacity-40"></div>

        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="inline-flex items-center gap-1.5 self-start bg-orange-50 border border-orange-100 rounded-full pl-2 pr-3 py-1 shadow-sm">
            <div className="bg-gradient-warm p-1 rounded-full">
              <Crown className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">Early Bird</span>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 leading-tight">
              Be First. <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Sell More.</span>
            </h3>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Join the exclusive group of first 50 merchants shaping the future of conversational commerce.
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-5 mb-8 flex-1">
          <div className="flex items-start gap-4 group/item">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover/item:scale-105 transition-transform">
              <Gift className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">50% Off First 3 Months</h4>
              <p className="text-xs text-gray-500 mt-0.5">Lock in our lowest launch pricing.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 group/item">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover/item:scale-105 transition-transform">
              <Map className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Direct Roadmap Influence</h4>
              <p className="text-xs text-gray-500 mt-0.5">Your feature requests get priority status.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 group/item">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover/item:scale-105 transition-transform">
              <Star className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">VIP Onboarding</h4>
              <p className="text-xs text-gray-500 mt-0.5">Personal setup & Onboarding session included.</p>
            </div>
          </div>
        </div>

        {/* Footer / CTA */}
        <div className="pt-6 border-t border-gray-100 mt-auto">
          <div className="flex justify-center mb-4">
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Limited spots available
            </span>
          </div>

          <Button
            onClick={handleClaimClick}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium h-12 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            Claim Early Bird Offer
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EarlyAccessCard;
