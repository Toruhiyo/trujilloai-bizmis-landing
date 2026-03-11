import {
  FaHeart,
  FaShieldAlt,
  FaTag,
  FaPlay,
  FaChartBar,
  FaShoppingCart,
  FaComments,
  FaChartLine,
  FaPlus,
} from "react-icons/fa";
import SectionBadge from "./SectionBadge";
import SpeakDiscoverBuy from "./SpeakDiscoverBuy";
import ReviewSatisfactionDashboard from "./ReviewSatisfactionDashboard";
import TabbedSessionReplay from "./TabbedSessionReplay";

const Benefits = () => {
  return (
    <div className="space-y-0 bg-gradient-to-b from-background via-[#FDF7E2]/10 to-background">
      {/* Shared Background Section: Driven Sales & Customization */}
      <section className="relative py-12 overflow-visible">
        {/* Modern Shared Background Design - Single background for both sections */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-[#FDF7E2]/30 to-[#FDF7E2]/20"></div>

        {/* Geometric Background Elements */}
        <div className="absolute inset-0">
          {/* Large floating shapes */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#FD912A]/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FD912A]/15 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.02] bg-gray-100/5"></div>

          {/* Floating accent elements */}
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[#FD912A]/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-[#FD912A]/40 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 bg-[#FD912A]/25 rounded-full animate-pulse delay-500"></div>

          {/* Bridging stains — visually connect cards to sales flow */}
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#FD912A]/[0.035] rounded-full blur-[100px]"></div>
          <div className="absolute top-[55%] -left-20 w-[350px] h-[300px] bg-[#FDF7E2]/35 rounded-full blur-[80px]"></div>
          <div className="absolute top-[50%] -right-10 w-[300px] h-[250px] bg-[#FD912A]/[0.045] rounded-full blur-[90px]"></div>

          {/* Bottom edge warm band — curved section separator */}
          <div className="absolute -bottom-40 -left-[5%] w-[45%] h-72 bg-[#FD912A]/[0.14] rounded-[50%] blur-[80px]"></div>
          <div className="absolute -bottom-32 -right-[5%] w-[40%] h-64 bg-[#FD912A]/[0.10] rounded-[50%] blur-[70px]"></div>
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[35%] h-52 bg-[#FDF7E2]/80 rounded-[50%] blur-[60px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section 1: Core Value Proposition */}
            <div className="text-center max-w-5xl mx-auto mb-10">
              <div className="relative">
                <div className="absolute -left-64  top-10 text-9xl lg:text-[12rem] font-bold text-[#FD912A]/20 transform -rotate-12 select-none">
                  #1
                </div>
                <SectionBadge icon={FaShoppingCart} text="Boost Sales" />
                <h1 className="text-5xl lg:text-7xl font-heading font-bold text-foreground mb-8 relative z-10">
                  Convert. Upsell. Retain.
                </h1>
              </div>
              <p className="text-xl text-muted-foreground font-body leading-relaxed mb-12">
                Bizmis acts like a great in-store associate — guiding shoppers,
                increasing cart value, and creating the kind of personal, warm experience that
                brings customers back.
              </p>

              {/* Impact Pillars — Flip Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto mb-10">
                {[
                  {
                    title: "Convert More Visitors",
                    subtitle: "Remove Buying Hesitation",
                    body: "Bizmis answers questions instantly and guides shoppers to the right product — so more visitors feel confident enough to buy.",
                    watermark: "/images/benefit-1-pillar-1.png",
                  },
                  {
                    title: "Increase Order Value",
                    subtitle: "Increase Order Value",
                    body: "Smart recommendations, upgrades, and complementary products appear naturally during the conversation.",
                    watermark: "/images/benefit-1-pillar-2.png",
                  },
                  {
                    title: "Build Customer Loyalty",
                    subtitle: "Build Customer Loyalty",
                    body: "A warm, personal shopping experience customers remember — and come back for.",
                    watermark: "/images/benefit-1-pillar-3.png",
                  },
                ].map(({ title, subtitle, body, watermark }) => (
                  <div
                    key={title}
                    className="group [perspective:800px] h-56"
                  >
                    <div className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                      {/* Front */}
                      <div className="absolute inset-0 [backface-visibility:hidden] bg-[#FD912A]/10 rounded-2xl border border-[#FD912A]/20 shadow-sm overflow-hidden flex flex-col items-center justify-end pb-6">
                        <FaPlus className="absolute top-3 right-3 w-4 h-4 text-[#FD912A]/60" aria-hidden />
                        <img
                          src={watermark}
                          alt=""
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-32 h-32 object-contain opacity-[0.25]"
                        />
                        <h3 className="relative z-10 text-lg lg:text-xl font-heading font-bold text-foreground text-center leading-tight px-4">
                          {title}
                        </h3>
                      </div>

                      {/* Back */}
                      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#FD912A] rounded-2xl shadow-md overflow-hidden flex flex-col justify-start px-6 py-6 text-white">
                        <img
                          src={watermark}
                          alt=""
                          className="w-8 h-8 object-contain brightness-0 invert opacity-60 mb-3"
                        />
                        <h4 className="text-base font-heading font-bold mb-2">
                          {subtitle}
                        </h4>
                        <p className="text-sm leading-relaxed text-white/90">
                          {body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works — connector */}
            <div className="flex items-center gap-4 max-w-md mx-auto mb-10">
              <div className="flex-1 h-px bg-[#FD912A]/20"></div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#FD912A]/60 whitespace-nowrap">
                How it works
              </span>
              <div className="flex-1 h-px bg-[#FD912A]/20"></div>
            </div>

            {/* Speak → Discover → Buy visual */}
            <div className="relative mb-32">
              <SpeakDiscoverBuy />
            </div>
          </div>
        </div>
      </section>

      {/* Benefit 2: Customer Support - Enhanced Layout */}
      <section
        id="benefit-2"
        className="relative py-32 bg-[#FDF7E2]/20 overflow-visible"
      >
        {/* Background Elements - Enhanced for Dashboard */}
        <div className="absolute inset-0">
          {/* Top edge warm band — curved section separator */}
          <div className="absolute -top-40 -right-[5%] w-[45%] h-96 bg-[#FD912A]/[0.14] rounded-[50%] blur-[80px]"></div>
          <div className="absolute -top-32 -left-[5%] w-[40%] h-72 bg-[#FD912A]/[0.10] rounded-[50%] blur-[70px]"></div>
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[35%] h-64 bg-[#FDF7E2]/80 rounded-[50%] blur-[60px]"></div>

          <div className="absolute top-20 right-20 w-64 h-64 bg-[#FD912A]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#FD912A]/10 rounded-full blur-3xl animate-pulse"></div>
          {/* Success celebration ambient lighting */}
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#FD912A]/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          {/* Flowing light streams */}
          <div className="absolute top-1/4 left-0 w-96 h-2 bg-gradient-to-r from-transparent via-[#FD912A]/20 to-transparent blur-sm animate-pulse"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-2 bg-gradient-to-l from-transparent via-[#FD912A]/20 to-transparent blur-sm animate-pulse"></div>
        </div>

        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-8xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <SectionBadge icon={FaComments} text="Customer Support" />
              <div className="relative">
                <div className="absolute -right-16 -top-16 text-8xl lg:text-9xl font-bold text-[#FD912A]/25 transform rotate-12 select-none">
                  #2
                </div>
                <h2 className="text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6 relative z-10 mr-14">
                  Save hours on support.
                  <br />
                  Earn loyal customers.
                </h2>
              </div>
              <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
                Watch real-time satisfaction metrics and live customer reviews
                flowing in—proof that Bizmis delivers exceptional support 24/7.
              </p>
            </div>

            {/* Enhanced Split Layout for Comment Cards */}
            <div className="grid lg:grid-cols-5 gap-20 items-center">
              {/* Left: Support Features */}
              <div className="lg:col-span-2 space-y-8">
                <div className="group bg-[#FD912A]/10 backdrop-blur-sm rounded-3xl p-8 border border-[#FD912A]/20 hover:border-[#FD912A]/30 transform rotate-1 hover:rotate-0 transition-all duration-500 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <FaHeart className="w-5 h-5 text-[#FD912A]/40 group-hover:text-[#FD912A]/70 transition-colors duration-300 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                          Empathetic Support
                        </h3>
                        <p className="text-muted-foreground font-body text-sm">
                          AI that understands customer emotions and responds
                          with genuine care and understanding.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group bg-[#FD912A]/10 backdrop-blur-sm rounded-3xl p-8 border border-[#FD912A]/20 hover:border-[#FD912A]/30 transform -rotate-1 hover:rotate-0 transition-all duration-500 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <FaShieldAlt className="w-5 h-5 text-[#FD912A]/40 group-hover:text-[#FD912A]/70 transition-colors duration-300 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                          Problem Resolution
                        </h3>
                        <p className="text-muted-foreground font-body text-sm">
                          Quick, accurate solutions that turn frustrated
                          customers into satisfied advocates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group bg-[#FD912A]/10 backdrop-blur-sm rounded-3xl p-8 border border-[#FD912A]/20 hover:border-[#FD912A]/30 transform rotate-2 hover:rotate-0 transition-all duration-500 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <FaTag className="w-5 h-5 text-[#FD912A]/40 group-hover:text-[#FD912A]/70 transition-colors duration-300 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                          Sales Opportunities
                        </h3>
                        <p className="text-muted-foreground font-body text-sm">
                          Seamlessly identify and capitalize on upsell and
                          cross-sell opportunities during support interactions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Central Avatar with Floating Reviews */}
              <div className="lg:col-span-3 relative overflow-visible flex justify-center items-center min-h-[700px]">
                {/* Central Avatar Container */}
                <div className="relative w-full h-full">
                  {/* Live Review Flow Around Avatar */}
                  <ReviewSatisfactionDashboard />

                  {/* Central Avatar Image */}
                  <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                    <img
                      src="/images/benefit-2-customer-support.png"
                      alt="Customer support interface showing chat conversations, customer satisfaction metrics, and sales opportunity alerts"
                      className="w-full max-w-sm object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit 3: Store Insights */}
      <section
        id="benefit-3"
        className="relative py-32 bg-[#FDF7E2]/20 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#FD912A]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#FD912A]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-20">
              <SectionBadge icon={FaChartLine} text="Store Insights" />
              <div className="relative">
                <div className="absolute -left-16 -top-16 text-8xl lg:text-9xl font-bold text-[#FD912A]/25 transform rotate-6 select-none">
                  #3
                </div>
                <h2 className="text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6 relative z-10 ml-14">
                  {/* Understand Customers. Tune the funnel. Grow revenue. */}
                  Learn. Tune. Grow.
                </h2>
              </div>
              <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
                See where buyers hesitate, what they ask, and which paths
                convert—so you fix less, save hours, and invest where revenue
                grows.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-20 items-center">
              {/* Left: Features */}
              <div className="space-y-8">
                <div className="group bg-[#FD912A]/10 backdrop-blur-sm rounded-2xl p-6 border border-[#FD912A]/20 hover:border-[#FD912A]/30 transform rotate-1 hover:rotate-0 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <FaPlay className="w-5 h-5 text-[#FD912A]/40 group-hover:text-[#FD912A]/70 transition-colors duration-300 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                        Session Replays
                      </h3>
                      <p className="text-muted-foreground font-body text-sm">
                        Jump straight to drop-offs and hesitation points. Fix
                        once, prevent abandoned carts, and recover at-risk
                        sales.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-[#FD912A]/10 backdrop-blur-sm rounded-2xl p-6 border border-[#FD912A]/20 hover:border-[#FD912A]/30 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <FaTag className="w-5 h-5 text-[#FD912A]/40 group-hover:text-[#FD912A]/70 transition-colors duration-300 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                        Auto-Tagged Chats
                      </h3>
                      <p className="text-muted-foreground font-body text-sm">
                        Conversations auto-group by topic and intent. Update one
                        FAQ/policy, cut repeat tickets, and reduce support load.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-[#FD912A]/10 backdrop-blur-sm rounded-2xl p-6 border border-[#FD912A]/20 hover:border-[#FD912A]/30 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <FaChartBar className="w-5 h-5 text-[#FD912A]/40 group-hover:text-[#FD912A]/70 transition-colors duration-300 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                        Funnel Insights
                      </h3>
                      <p className="text-muted-foreground font-body text-sm">
                        See conversion paths, drop-offs, and product impact at a
                        glance. Prioritize high-ROI fixes and back the winners.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Tabbed Session Replay */}
              <div className="relative flex justify-center items-start">
                <TabbedSessionReplay />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Benefits;
