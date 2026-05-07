import {
  FaHeart,
  FaShieldAlt,
  FaTag,
  FaPlay,
  FaChartBar,
  FaShoppingCart,
  FaComments,
  FaChartLine,
  FaClock,
  FaBolt,
  FaPlus,
  FaStar,
  FaRedoAlt,
} from "react-icons/fa";
import SectionBadge from "./SectionBadge";
import SpeakDiscoverBuy from "./SpeakDiscoverBuy";
import VoiceSupportScene from "./VoiceSupportScene";
import TabbedSessionReplay from "./TabbedSessionReplay";

const Benefits = () => {
  return (
    <div className="space-y-0 bg-gradient-to-b from-background via-[#FDF7E2]/10 to-background overflow-x-clip">
      {/* Shared Background Section: Driven Sales & Customization */}
      <section className="relative pt-10 pb-6 sm:py-12 overflow-visible">
        {/* Modern Shared Background Design - Single background for both sections */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-[#FDF7E2]/30 to-[#FDF7E2]/20"></div>

        {/* Geometric Background Elements */}
        <div className="absolute inset-0">
          {/* Large floating shapes */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.02] bg-gray-100/5"></div>

          {/* Floating accent elements */}
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-primary/60 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 bg-primary/25 rounded-full animate-pulse delay-500"></div>

          {/* Bridging stains — visually connect cards to sales flow */}
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.035] rounded-full blur-[100px]"></div>
          <div className="absolute top-[55%] -left-20 w-[350px] h-[300px] bg-[#FDF7E2]/35 rounded-full blur-[80px]"></div>
          <div className="absolute top-[50%] -right-10 w-[300px] h-[250px] bg-primary/[0.045] rounded-full blur-[90px]"></div>

          {/* Bottom edge warm band — curved section separator */}
          <div className="absolute -bottom-40 -left-[5%] w-[45%] h-72 bg-primary/[0.14] rounded-[50%] blur-[80px]"></div>
          <div className="absolute -bottom-32 -right-[5%] w-[40%] h-64 bg-primary/[0.10] rounded-[50%] blur-[70px]"></div>
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[35%] h-52 bg-[#FDF7E2]/80 rounded-[50%] blur-[60px]"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section 1: Core Value Proposition */}
            <div className="text-center max-w-5xl mx-auto mb-8 sm:mb-10">
              <div className="relative">
                <div className="hidden lg:block absolute -left-64 top-10 text-9xl lg:text-[12rem] font-bold text-primary/20 transform -rotate-12 select-none pointer-events-none">
                  #1
                </div>
                <SectionBadge icon={FaShoppingCart} text="Boost Sales" />
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-foreground mb-4 sm:mb-8 relative z-10">
                  Convert. Upsell. Retain.
                </h1>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl text-muted-foreground font-body leading-relaxed mb-6 sm:mb-12 px-2">
                {/* Tighter pitch on phones; full version reads at sm+. */}
                <span className="sm:hidden">
                  A great in-store associate that guides shoppers, lifts cart
                  value, and brings customers back.
                </span>
                <span className="hidden sm:inline">
                  Bizmis acts like a great in-store associate — guiding shoppers,
                  increasing cart value, and creating the kind of personal, warm
                  experience that brings customers back.
                </span>
              </p>

              {/* Impact Pillars — flip cards on lg+, flat compact rows on mobile/tablet
                  (touch can't trigger hover, so mobile shows the full content inline). */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto mb-8 sm:mb-10">
                {[
                  {
                    title: "Convert More Visitors",
                    subtitle: "Remove Buying Hesitation",
                    body: "Bizmis answers questions instantly and guides shoppers to the right product — so more visitors feel confident enough to buy.",
                    watermark: "/images/benefit-1-pillar-1.png",
                  },
                  {
                    title: "Increase Order Value",
                    subtitle: "Smart Upsells & Add-Ons",
                    body: "Smart recommendations, upgrades, and complementary products appear naturally during the conversation.",
                    watermark: "/images/benefit-1-pillar-2.png",
                  },
                  {
                    title: "Build Customer Loyalty",
                    subtitle: "Personal Shopping Experience",
                    body: "A warm, personal shopping experience customers remember — and come back for.",
                    watermark: "/images/benefit-1-pillar-3.png",
                  },
                ].map(({ title, subtitle, body, watermark }) => (
                  <div key={title} className="group lg:[perspective:800px] lg:h-56">
                    {/* Mobile / tablet: punchy headline + tagline only (body
                        copy lives in the lg flip card so the mobile cards stay
                        scannable rather than text-dense). */}
                    <div className="lg:hidden relative bg-primary/10 rounded-2xl border border-primary/20 shadow-sm overflow-hidden flex items-center text-left">
                      <div className="relative shrink-0 w-20 xs:w-24 sm:w-28 self-stretch bg-primary/15 flex items-center justify-center">
                        <img
                          src={watermark}
                          alt=""
                          className="w-14 xs:w-16 sm:w-20 h-14 xs:h-16 sm:h-20 object-contain opacity-70"
                        />
                      </div>
                      <div className="flex-1 min-w-0 px-4 xs:px-5 sm:px-6 py-3.5 xs:py-4 sm:py-5">
                        <h3 className="text-base xs:text-lg sm:text-xl font-heading font-bold text-foreground leading-tight mb-1">
                          {title}
                        </h3>
                        <p className="text-primary text-[13px] xs:text-sm sm:text-base font-heading font-semibold leading-snug">
                          {subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Desktop: original 3D flip card. */}
                    <div className="hidden lg:block relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                      {/* Front */}
                      <div className="absolute inset-0 [backface-visibility:hidden] bg-primary/10 rounded-2xl border border-primary/20 shadow-sm overflow-hidden flex flex-col items-center justify-end pb-6">
                        <FaPlus
                          className="absolute top-3 right-3 w-4 h-4 text-primary/60"
                          aria-hidden
                        />
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
                      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary rounded-2xl shadow-md overflow-hidden flex flex-col justify-start px-6 py-6 text-white">
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

            {/* Speak → Discover → Buy visual */}
            <div className="relative mb-8 sm:mb-16 lg:mb-32 mt-2 sm:mt-4">
              <SpeakDiscoverBuy />
            </div>
          </div>
        </div>
      </section>

      {/* Benefit 2: Customer Support - Enhanced Layout */}
      <section
        id="benefit-2"
        className="relative pt-6 pb-12 sm:pt-16 sm:pb-24 lg:py-32 bg-[#FDF7E2]/20 overflow-visible"
      >
        {/* Background Elements - Enhanced for Dashboard */}
        <div className="absolute inset-0">
          {/* Top edge warm band — curved section separator */}
          <div className="absolute -top-40 -right-[5%] w-[45%] h-96 bg-primary/[0.14] rounded-[50%] blur-[80px]"></div>
          <div className="absolute -top-32 -left-[5%] w-[40%] h-72 bg-primary/[0.10] rounded-[50%] blur-[70px]"></div>
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[35%] h-64 bg-[#FDF7E2]/80 rounded-[50%] blur-[60px]"></div>

          <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          {/* Success celebration ambient lighting */}
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          {/* Flowing light streams */}
          <div className="absolute top-1/4 left-0 w-96 h-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm animate-pulse"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-2 bg-gradient-to-l from-transparent via-primary/20 to-transparent blur-sm animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-8xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <SectionBadge icon={FaComments} text="Customer Support" />
              <div className="relative">
                {/* #2 watermark — desktop-only so it doesn't collide with the
                    wrapped title on phones (matches Benefit 1's #1 watermark). */}
                <div
                  className="hidden sm:block absolute sm:-right-16 sm:-top-16 text-6xl sm:text-8xl lg:text-9xl font-bold text-primary/25 transform rotate-12 select-none pointer-events-none"
                  aria-hidden
                >
                  #2
                </div>
                <h2 className="text-[28px] xs:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight mb-3 sm:mb-6 relative z-10 lg:mr-14">
                  Save hours on support.
                  <br />
                  Earn loyal customers.
                </h2>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl text-muted-foreground font-body max-w-4xl mx-auto px-2">
                {/* Tighter pitch on phones; full version reads at sm+. */}
                <span className="sm:hidden">
                  Instant, empathetic 24/7 support that feels human — lifting
                  satisfaction and saving hours of support work.
                </span>
                <span className="hidden sm:inline">
                  Emotional intelligence and instant 24/7 support improve customer
                  satisfaction with immediate, warm, and empathetic resolutions
                  that feel like help from a great in-store clerk, while saving
                  valuable support time.
                </span>
              </p>
            </div>

            {/* Hierarchy: demo scene → business outcomes (KPI strip) → enabling capabilities (cards) */}
            <div className="flex flex-col items-center gap-6 sm:gap-12 lg:gap-14">
              <div className="w-full flex justify-center">
                <VoiceSupportScene />
              </div>

              {/* Business outcomes — compact KPI strip. Tighter pills on mobile
                  so the three outcomes fit without ballooning vertically. */}
              <div className="flex flex-wrap justify-center gap-2 xs:gap-2.5 sm:gap-4 w-full max-w-2xl">
                <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-muted-foreground/70 bg-transparent px-3 xs:px-3.5 py-1 xs:py-1.5">
                  <FaClock className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[12px] xs:text-[13px] sm:text-sm font-medium text-muted-foreground">
                    Save support hours
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-muted-foreground/70 bg-transparent px-3 xs:px-3.5 py-1 xs:py-1.5">
                  <FaStar className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[12px] xs:text-[13px] sm:text-sm font-medium text-muted-foreground">
                    Earn better reviews
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-muted-foreground/70 bg-transparent px-3 xs:px-3.5 py-1 xs:py-1.5">
                  <FaRedoAlt className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[12px] xs:text-[13px] sm:text-sm font-medium text-muted-foreground">
                    Grow repeat sales
                  </span>
                </div>
              </div>

              {/* Enabling capabilities — punchier title + tagline on mobile/tablet
                  (full body copy still appears at md+ in the same card). */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5 w-full max-w-5xl">
                {[
                  {
                    icon: FaBolt,
                    title: "24/7 Instant Support",
                    tagline: "No waiting, no frustration",
                    body: "Customers get help the moment they need it — no waiting, no frustration, no bad reviews from unanswered questions.",
                  },
                  {
                    icon: FaShieldAlt,
                    title: "Store Knowledge",
                    tagline: "Policy, product, and docs answered instantly",
                    body: "Answers policy, product, and documentation questions instantly, so shoppers and customers get clear guidance without waiting for your team.",
                  },
                  {
                    icon: FaHeart,
                    title: "Emotional Intelligence",
                    tagline: "Warm, empathetic responses",
                    body: "AI that understands customer emotions and responds with genuine care and understanding.",
                  },
                ].map(({ icon: Icon, title, tagline, body }) => (
                  <div
                    key={title}
                    className="group bg-primary/6 backdrop-blur-sm rounded-xl xs:rounded-2xl p-3.5 xs:p-4 sm:p-6 border border-primary/15 hover:border-primary/25 transition-all duration-300 shadow-lg"
                  >
                    <div className="flex gap-2.5 xs:gap-3">
                      <Icon className="w-4 h-4 text-primary/35 group-hover:text-primary/60 transition-colors duration-300 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h3 className="text-[14px] xs:text-[15px] sm:text-sm font-heading font-semibold md:font-medium text-foreground leading-tight mb-1 sm:mb-1.5">
                          {title}
                        </h3>
                        {/* Mobile/tablet: short tagline only. */}
                        <p className="md:hidden text-primary/85 font-heading font-medium text-[12px] xs:text-[13px] leading-snug">
                          {tagline}
                        </p>
                        {/* md+: full body copy. */}
                        <p className="hidden md:block text-muted-foreground font-body text-sm leading-relaxed">
                          {body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit 3: Store Insights */}
      <section
        id="benefit-3"
        className="relative py-12 sm:py-24 lg:py-32 bg-[#FDF7E2]/20 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-16 lg:mb-20">
              <SectionBadge icon={FaChartLine} text="Store Insights" />
              <div className="relative">
                {/* #3 watermark — desktop-only, parity with #1 / #2 watermarks. */}
                <div
                  className="hidden sm:block absolute sm:-left-16 sm:-top-16 text-6xl sm:text-8xl lg:text-9xl font-bold text-primary/25 transform rotate-6 select-none pointer-events-none"
                  aria-hidden
                >
                  #3
                </div>
                <h2 className="text-4xl xs:text-[2.5rem] sm:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight mb-3 sm:mb-6 relative z-10 lg:ml-14">
                  Learn. Tune. Grow.
                </h2>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl text-muted-foreground font-body max-w-3xl mx-auto px-2">
                See where buyers hesitate, what they ask, and which paths
                convert—so you fix less, save hours, and invest where revenue
                grows.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 sm:gap-14 lg:gap-20 items-center">
              {/* Left: Tabbed Session Replay */}
              <div className="relative flex justify-center items-start order-2 lg:order-1 min-w-0 w-full">
                <TabbedSessionReplay />
              </div>

              {/* Right: Features — punchier title + tagline on mobile/tablet,
                  full body copy and the lg flair (rotation + thicker padding)
                  preserved at md+. */}
              <div className="space-y-3 sm:space-y-6 lg:space-y-8 order-1 lg:order-2">
                {[
                  {
                    icon: FaPlay,
                    title: "Session Replays",
                    tagline: "Jump straight to drop-offs",
                    body: "Jump straight to drop-offs and hesitation points. Fix once, prevent abandoned carts, and recover at-risk sales.",
                    rotate: "lg:rotate-1",
                  },
                  {
                    icon: FaTag,
                    title: "Auto-Tagged Chats",
                    tagline: "One fix, fewer repeat tickets",
                    body: "Conversations auto-group by topic and intent. Update one FAQ/policy, cut repeat tickets, and reduce support load.",
                    rotate: "lg:-rotate-1",
                  },
                  {
                    icon: FaChartBar,
                    title: "Funnel Insights",
                    tagline: "Spot high-ROI fixes at a glance",
                    body: "See conversion paths, drop-offs, and product impact at a glance. Prioritize high-ROI fixes and back the winners.",
                    rotate: "lg:rotate-2",
                  },
                ].map(({ icon: Icon, title, tagline, body, rotate }) => (
                  <div
                    key={title}
                    className={`group bg-primary/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-6 lg:p-8 border border-primary/20 hover:border-primary/30 transform ${rotate} lg:hover:rotate-0 transition-all duration-500 shadow-xl`}
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <Icon className="w-4 h-4 xs:w-5 xs:h-5 text-primary/60 group-hover:text-primary/90 transition-colors duration-300 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h3 className="text-[15px] xs:text-base sm:text-lg font-heading font-semibold text-foreground leading-tight mb-1 sm:mb-2">
                          {title}
                        </h3>
                        {/* Mobile/tablet: short primary tagline only. */}
                        <p className="md:hidden text-primary/85 font-heading font-medium text-[12px] xs:text-[13px] leading-snug">
                          {tagline}
                        </p>
                        {/* md+: full body copy. */}
                        <p className="hidden md:block text-muted-foreground font-body text-sm">
                          {body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Benefits;
