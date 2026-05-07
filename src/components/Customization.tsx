import React from "react";
import { FaPaintBrush, FaMicrophone } from "react-icons/fa";
import SectionBadge from "./SectionBadge";
import { PricingPlanFeatureSoon } from "./PricingPlanFeatureSoon";
// TEMP: voice clone demo disabled — re-enable AudioPlayer + selectedVoice state + block below.
// import AudioPlayer from "./AudioPlayer";
import FakeImagesSelector, { type ImageOption } from "./FakeImagesSelector";

const Customization = () => {
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
  // TEMP: voice clone demo — restore when re-enabling AudioPlayer below.
  // const [selectedVoice, setSelectedVoice] = React.useState<
  //   "original" | "cloned"
  // >("original");

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
    <section
      id="customization"
      className="relative py-16 sm:py-20 lg:py-24 bg-[#FDF7E2]/20 border-t border-primary/20 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Large floating shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-gray-100/5"></div>

        {/* Floating accent elements */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-primary/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 bg-primary/25 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <SectionBadge icon={FaPaintBrush} text="Personalization" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
              Make It <span className="text-primary">Truly Yours</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-body max-w-3xl mx-auto px-2">
              Build authentic relationships that drive customer loyalty through
              personalized voice and appearance customization.
            </p>
          </div>

          {/* Customization Layout — switch to side-by-side as soon as sm so the
              avatar (left) + cards/audio (right) composition matches desktop
              from tablet/portrait-tablet widths up. */}
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 md:gap-8 lg:gap-16 items-center">
            {/* Right: Features */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-16 order-2 sm:order-2">
              <div className="group bg-primary/10 backdrop-blur-md rounded-xl xs:rounded-2xl sm:rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-primary/20 hover:border-primary/30 transform lg:-rotate-1 lg:hover:rotate-0 transition-all duration-500 shadow-xl">
                <div className="space-y-6">
                  <div className="flex gap-2.5 xs:gap-3 sm:gap-4">
                    <FaPaintBrush className="w-4 h-4 xs:w-5 xs:h-5 text-primary/60 group-hover:text-primary/90 transition-colors duration-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-[15px] xs:text-base sm:text-xl font-heading font-bold text-foreground">
                        Personal Avatar
                      </h3>
                      <p className="text-[12px] xs:text-[13px] sm:text-base leading-snug text-muted-foreground font-body">
                        Creating genuine connections by making your sales
                        representative sound and look like you.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group bg-primary/10 backdrop-blur-md rounded-xl xs:rounded-2xl sm:rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-primary/20 hover:border-primary/30 transform lg:rotate-1 lg:hover:rotate-0 transition-all duration-500 shadow-xl">
                <div className="space-y-6">
                  <div className="flex gap-2.5 xs:gap-3 sm:gap-4">
                    <FaMicrophone className="w-4 h-4 xs:w-5 xs:h-5 text-primary/60 group-hover:text-primary/90 transition-colors duration-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="text-[15px] xs:text-base sm:text-xl font-heading font-bold text-foreground">
                          Voice Cloning
                        </h3>
                        <PricingPlanFeatureSoon className="ml-0 shrink-0" />
                      </div>
                      <p className="text-[12px] xs:text-[13px] sm:text-base leading-snug text-muted-foreground font-body">
                        Authentic customer interactions through replication of
                        your unique speaking style and personality.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TEMP: Voice cloning demo (toggle + AudioPlayer) — uncomment when shipping again.
              <div className="relative space-y-3">
                <div className="absolute -inset-8 bg-primary/15 rounded-3xl blur-2xl opacity-60"></div>

                <div className="relative z-10">
                  <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-primary/50 shadow-sm">
                    <button
                      onClick={() => setSelectedVoice("original")}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        selectedVoice === "original"
                          ? "bg-primary text-white shadow-md"
                          : "text-primary hover:bg-[#FDF7E2]"
                      }`}
                    >
                      Original Voice
                    </button>
                    <button
                      onClick={() => setSelectedVoice("cloned")}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        selectedVoice === "cloned"
                          ? "bg-primary text-white shadow-md"
                          : "text-primary hover:bg-[#FDF7E2]"
                      }`}
                    >
                      Cloned Voice
                    </button>
                  </div>
                </div>

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
              */}
            </div>

            {/* Left: Customization Image */}
            <div className="relative order-1 sm:order-1">
              {/* Auto-Rotating Vertical Clothing Carousel — only visible at lg+
                  where the avatar column has horizontal room for the side rail. */}
              {!isAvatarHovered && (
                <div className="hidden lg:block absolute -left-16 lg:-left-32 top-1/2 transform -translate-y-1/2 z-20">
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

              {/* Auto-Rotating Vertical Haircut Carousel — only visible at lg+
                  where the avatar column has horizontal room for the side rail. */}
              {!isAvatarHovered && (
                <div className="hidden lg:block absolute -right-16 lg:-right-32 top-1/2 transform -translate-y-1/2 z-20">
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
                    <div className="absolute w-full h-full bg-primary/15 rounded-full scale-0 group-hover:scale-100 transition-all duration-1000 ease-out group-hover:delay-100 delay-500 blur-sm"></div>

                    {/* Outer flower outline with glow */}
                    <div className="absolute w-full h-full border-2 border-primary/30 rounded-full scale-0 group-hover:scale-100 transition-all duration-700 ease-out group-hover:delay-0 delay-200 shadow-[0_0_20px_rgba(253,145,42,0.3)] group-hover:shadow-[0_0_30px_rgba(253,145,42,0.4)]"></div>

                    {/* Middle flower outline with glow */}
                    <div className="absolute w-4/5 h-4/5 border-2 border-primary/40 rounded-full scale-0 group-hover:scale-100 transition-all duration-700 ease-out group-hover:delay-100 delay-300 shadow-[0_0_15px_rgba(253,145,42,0.4)] group-hover:shadow-[0_0_25px_rgba(253,145,42,0.5)]"></div>

                    {/* Inner flower outline with glow */}
                    <div className="absolute w-3/5 h-3/5 border-2 border-primary/50 rounded-full scale-0 group-hover:scale-100 transition-all duration-700 ease-out group-hover:delay-200 delay-400 shadow-[0_0_10px_rgba(253,145,42,0.5)] group-hover:shadow-[0_0_25px_rgba(253,145,42,0.6)]"></div>
                  </div>

                  {/* Default image — capped per tier so it doesn't dominate
                      the viewport on phones, fits the 2-col layout from sm
                      (where the side-by-side composition starts), and only
                      blooms to the full size at lg+. */}
                  <img
                    src="/images/benefit-1-customization-1.png"
                    alt="Personalization Hub - Voice & Appearance Customization"
                    className="relative z-30 w-full max-w-[14rem] xs:max-w-[16rem] sm:max-w-[15rem] md:max-w-[18rem] lg:max-w-md mx-auto object-contain drop-shadow-2xl transition-opacity duration-500 group-hover:opacity-0"
                  />
                  {/* Hover image */}
                  <img
                    src="/images/benefit-1-customization-2.png"
                    alt="Personalization Hub - Voice & Appearance Customization (Active)"
                    className="absolute inset-0 z-30 w-full max-w-[14rem] xs:max-w-[16rem] sm:max-w-[15rem] md:max-w-[18rem] lg:max-w-md mx-auto object-contain drop-shadow-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Customization;
