import React from "react";
import {
  ShoppingCart,
  Heart,
  Shield,
  Play,
  Tag,
  BarChart3,
  ShoppingBag,
  MessageSquare,
  Activity,
  Brush,
} from "lucide-react";
import { PiWaveformBold } from "react-icons/pi";
import SectionBadge from "./SectionBadge";
import AudioPlayer from "./AudioPlayer";
import DirectScrollSalesFlow from "./DirectScrollSalesFlow";
import FakeImagesSelector, { type ImageOption } from "./FakeImagesSelector";
import ReviewSatisfactionDashboard from "./ReviewSatisfactionDashboard";
import TabbedSessionReplay from "./TabbedSessionReplay";

const Benefits = () => {
  // Clothing images for the carousel
  const clothingImages: ImageOption[] = [
    {
      id: "1",
      title: "Casual Outfit",
      url: "/images/benefit-1-customization-selector-clothing-1.png",
      alt: "Casual clothing option",
    },
    {
      id: "2",
      title: "Professional Outfit",
      url: "/images/benefit-1-customization-selector-clothing-2.png",
      alt: "Professional clothing option",
    },
    {
      id: "selected",
      title: "Selected Outfit",
      url: "/images/benefit-1-customization-selector-clothing-selected.png",
      alt: "Selected clothing option",
    },
    {
      id: "kimono",
      title: "Kimono Style",
      url: "/images/benefit-1-customization-selector-clothing-kimono.png",
      alt: "Kimono style clothing option",
    },
    {
      id: "florist",
      title: "Florist Outfit",
      url: "/images/benefit-1-customization-selector-clothing-florist.png",
      alt: "Florist clothing option",
    },
  ];

  const [selectedClothingId, setSelectedClothingId] =
    React.useState<string>("selected");
  const [selectedHaircutId, setSelectedHaircutId] =
    React.useState<string>("haircut-1");
  const [selectedVoice, setSelectedVoice] = React.useState<
    "original" | "cloned"
  >("original");

  // State to control carousel visibility on avatar hover
  const [isAvatarHovered, setIsAvatarHovered] = React.useState(false);

  // Haircut images for the horizontal carousel
  const haircutImages: ImageOption[] = [
    {
      id: "haircut-1",
      title: "Haircut Style 1",
      url: "/images/benefit-1-customization-selector-haircut-1.png",
      alt: "Haircut style option 1",
    },
    {
      id: "haircut-2",
      title: "Haircut Style 2",
      url: "/images/benefit-1-customization-selector-haircut-2.png",
      alt: "Haircut style option 2",
    },
    {
      id: "haircut-3",
      title: "Haircut Style 3",
      url: "/images/benefit-1-customization-selector-haircut-3.png",
      alt: "Haircut style option 3",
    },
    {
      id: "haircut-4",
      title: "Haircut Style 4",
      url: "/images/benefit-1-customization-selector-haircut-4.png",
      alt: "Haircut style option 4",
    },
    {
      id: "haircut-5",
      title: "Haircut Style 5",
      url: "/images/benefit-1-customization-selector-haircut-5.png",
      alt: "Haircut style option 5",
    },
  ];

  return (
    <div className="space-y-0 bg-gradient-to-b from-background via-orange-50/10 to-background">
      {/* Shared Background Section: Driven Sales & Customization */}
      <section className="relative py-12 overflow-hidden">
        {/* Modern Shared Background Design - Single background for both sections */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20"></div>

        {/* Geometric Background Elements */}
        <div className="absolute inset-0">
          {/* Large floating shapes */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-amber-200/15 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-orange-300/15 to-yellow-300/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.02] bg-gray-100/5"></div>

          {/* Floating accent elements */}
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-orange-400/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-amber-500/40 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 bg-orange-300/25 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section 1: Main Benefit Header */}
            <div className="text-center max-w-5xl mx-auto mb-20">
              <div className="relative">
                <div className="absolute -left-64  top-10 text-9xl lg:text-[12rem] font-bold text-orange-600/20 transform -rotate-12 select-none">
                  #1
                </div>
                <SectionBadge icon={ShoppingCart} text="Increase Sales" />
                <h1 className="text-5xl lg:text-7xl font-heading font-bold text-foreground mb-8 relative z-10">
                  Increase Sales Conversion
                </h1>
              </div>
              <p className="text-xl text-muted-foreground font-body leading-relaxed mb-16">
                Shoppers feel personally guided—finding the right product fast
                and checking out with confidence.
              </p>
            </div>

            {/* Section 2: Drive Sales Feature */}
            <div className="text-left mb-16">
              <div className="flex items-start gap-8 mb-12">
                <div className="flex-shrink-0 mt-2">
                  <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-orange-200/50 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <ShoppingBag className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-8">
                    <span className="text-orange-600">
                      Driven Sales Pipeline
                    </span>
                  </h3>
                  <div className="border-l-2 border-orange-200/50 pl-4 py-2">
                    <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                      <span className="font-semibold">
                        Expert-level selling skills
                      </span>{" "}
                      that turn casual browsers into{" "}
                      <span className="font-semibold">confident buyers</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Main Layout - Direct Scroll-Linked Sales Flow */}
            <div className="relative mb-32">
              <DirectScrollSalesFlow />
            </div>

            {/* Section 4: Customization Feature */}
            <div className="text-left mb-8 lg:text-right">
              <div className="flex items-start gap-8 mb-6 lg:flex-row-reverse">
                <div className="flex-shrink-0 mt-2">
                  <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-orange-200/50 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Brush className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-8">
                    <span className="text-orange-600">
                      Voice & Appearance Customization
                    </span>
                  </h3>
                  <div className="border-l-2 border-orange-200/50 pl-4 py-2">
                    <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                      Build{" "}
                      <span className="font-semibold">
                        authentic relationships
                      </span>{" "}
                      that drive{" "}
                      <span className="font-semibold">customer loyalty</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Customization Layout */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              {/* Right: Features */}
              <div className="space-y-6 md:space-y-12 lg:space-y-16 order-2 lg:order-2">
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-orange-200/30 transform -rotate-1 hover:rotate-0 transition-transform duration-500 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-200/50">
                        <Brush className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-heading font-bold text-foreground">
                          Personal Avatar
                        </h3>
                        <p className="text-muted-foreground font-body">
                          Creating genuine connections by making your sales
                          representative sound and look like you.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-orange-200/30 transform rotate-1 hover:rotate-0 transition-transform duration-500 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-200/50">
                        <PiWaveformBold className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-heading font-bold text-foreground">
                          Voice Cloning
                        </h3>
                        <p className="text-muted-foreground font-body">
                          Authentic customer interactions through replication of
                          your unique speaking style and personality.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voice Cloning Demo */}
                <div className="relative space-y-3">
                  {/* Enhanced background for audio player section */}
                  <div className="absolute -inset-8 bg-gradient-to-br from-orange-100/20 via-amber-100/15 to-orange-100/10 rounded-3xl blur-2xl opacity-60"></div>

                  {/* Voice Toggle Selector */}
                  <div className="relative z-10">
                    <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-orange-200/50 shadow-sm">
                      <button
                        onClick={() => setSelectedVoice("original")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          selectedVoice === "original"
                            ? "bg-orange-500 text-white shadow-md"
                            : "text-orange-700 hover:bg-orange-50"
                        }`}
                      >
                        Original Voice
                      </button>
                      <button
                        onClick={() => setSelectedVoice("cloned")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          selectedVoice === "cloned"
                            ? "bg-amber-500 text-white shadow-md"
                            : "text-amber-700 hover:bg-amber-50"
                        }`}
                      >
                        Cloned Voice
                      </button>
                    </div>
                  </div>

                  {/* Single Audio Player */}
                  <div className="relative z-10">
                    <AudioPlayer
                      audioUrl={
                        selectedVoice === "original"
                          ? "/audio/benefit-1-customization-voice-cloning-original.mp3"
                          : "/audio/benefit-1-customization-voice-cloning-cloned.mp3"
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Left: Customization Image */}
              <div className="relative order-1 lg:order-1">
                {/* Auto-Rotating Vertical Clothing Carousel */}
                {!isAvatarHovered && (
                  <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 z-20">
                    <FakeImagesSelector
                      images={clothingImages}
                      selectedId={selectedClothingId}
                      orientation="vertical"
                      direction="forward"
                      numberOfDuplicates={10}
                      autoRotateInterval={4000}
                      onImageSelect={setSelectedClothingId}
                      showFading={true}
                      fadingColor="white"
                      draggable={false}
                      showArrows={false}
                      selectable={false}
                    />
                  </div>
                )}

                {/* Auto-Rotating Vertical Haircut Carousel */}
                {!isAvatarHovered && (
                  <div className="absolute -right-32 top-1/2 transform -translate-y-1/2 z-20">
                    <FakeImagesSelector
                      images={haircutImages}
                      selectedId={selectedHaircutId}
                      orientation="vertical"
                      direction="reverse"
                      numberOfDuplicates={10}
                      autoRotateInterval={4000}
                      onImageSelect={setSelectedHaircutId}
                      showFading={true}
                      fadingColor="white"
                      draggable={false}
                      showArrows={false}
                      selectable={false}
                    />
                  </div>
                )}

                <div
                  className="group"
                  onMouseEnter={() => setIsAvatarHovered(true)}
                  onMouseLeave={() => setIsAvatarHovered(false)}
                >
                  <div className="relative">
                    {/* Concentric flower-shaped outlines - Chupa Chups style effect */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Orange glow background */}
                      <div className="absolute w-full h-full bg-gradient-to-br from-orange-200/20 to-amber-200/10 rounded-full scale-0 group-hover:scale-100 transition-all duration-1000 ease-out group-hover:delay-100 delay-500 blur-sm"></div>

                      {/* Outer flower outline with glow */}
                      <div className="absolute w-full h-full border-2 border-orange-400/30 rounded-full scale-0 group-hover:scale-100 transition-all duration-700 ease-out group-hover:delay-0 delay-200 shadow-[0_0_20px_rgba(251,146,60,0.3)] group-hover:shadow-[0_0_30px_rgba(251,146,60,0.4)]"></div>

                      {/* Middle flower outline with glow */}
                      <div className="absolute w-4/5 h-4/5 border-2 border-orange-500/40 rounded-full scale-0 group-hover:scale-100 transition-all duration-700 ease-out group-hover:delay-100 delay-300 shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]"></div>

                      {/* Inner flower outline with glow */}
                      <div className="absolute w-3/5 h-3/5 border-2 border-orange-600/50 rounded-full scale-0 group-hover:scale-100 transition-all duration-700 ease-out group-hover:delay-200 delay-400 shadow-[0_0_10px_rgba(234,88,12,0.5)] group-hover:shadow-[0_0_25px_rgba(234,88,12,0.6)]"></div>
                    </div>

                    {/* Default image */}
                    <img
                      src="/images/benefit-1-customization-1.png"
                      alt="Personalization Hub - Voice & Appearance Customization"
                      className="relative z-30 w-full max-w-md mx-auto object-contain drop-shadow-2xl transition-opacity duration-500 group-hover:opacity-0"
                    />
                    {/* Hover image */}
                    <img
                      src="/images/benefit-1-customization-2.png"
                      alt="Personalization Hub - Voice & Appearance Customization (Active)"
                      className="absolute inset-0 z-30 w-full max-w-md mx-auto object-contain drop-shadow-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit 2: Customer Support - Enhanced Layout */}
      <section
        id="benefit-2"
        className="relative py-32 bg-gradient-to-r from-orange-50/20 to-amber-50/20 overflow-visible"
      >
        {/* Background Elements - Enhanced for Dashboard */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-orange-200/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-200/10 rounded-full blur-3xl animate-pulse"></div>
          {/* Success celebration ambient lighting */}
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-100/10 to-amber-100/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          {/* Flowing light streams */}
          <div className="absolute top-1/4 left-0 w-96 h-2 bg-gradient-to-r from-transparent via-orange-200/20 to-transparent blur-sm animate-pulse"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-2 bg-gradient-to-l from-transparent via-amber-200/20 to-transparent blur-sm animate-pulse"></div>
        </div>

        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-8xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <SectionBadge icon={MessageSquare} text="Customer Support" />
              <div className="relative">
                <div className="absolute -right-16 -top-16 text-8xl lg:text-9xl font-bold text-orange-600/25 transform rotate-12 select-none">
                  #2
                </div>
                <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 relative z-10 mr-14">
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
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-orange-200/30 transform rotate-1 hover:rotate-0 transition-transform duration-500 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-200/50">
                        <Heart className="w-6 h-6 text-orange-600" />
                      </div>
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

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-orange-200/30 transform -rotate-1 hover:rotate-0 transition-transform duration-500 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-200/50">
                        <Shield className="w-6 h-6 text-orange-600" />
                      </div>
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

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-orange-200/30 transform rotate-2 hover:rotate-0 transition-transform duration-500 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-200/50">
                        <Tag className="w-6 h-6 text-orange-600" />
                      </div>
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
        className="relative py-32 bg-gradient-to-r from-amber-50/20 to-orange-50/20 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-amber-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-20">
              <SectionBadge icon={Activity} text="Store Insights" />
              <div className="relative">
                <div className="absolute -left-16 -top-16 text-8xl lg:text-9xl font-bold text-orange-600/25 transform rotate-6 select-none">
                  #3
                </div>
                <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 relative z-10 ml-14">
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
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Play className="w-6 h-6 text-orange-600" />
                    </div>
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

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Tag className="w-6 h-6 text-orange-600" />
                    </div>
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

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                    </div>
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
