import React from "react";
import { Brush } from "lucide-react";
import { PiWaveformBold } from "react-icons/pi";
import SectionBadge from "./SectionBadge";
import AudioPlayer from "./AudioPlayer";
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
    <section
      id="customization"
      className="relative py-24 bg-[#FDF7E2]/20 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Large floating shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FD912A]/15 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FD912A]/15 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-gray-100/5"></div>

        {/* Floating accent elements */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[#FD912A]/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-[#FD912A]/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 bg-[#FD912A]/25 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <SectionBadge icon={Brush} text="Personalization" />
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
              Make It <span className="text-[#FD912A]">Truly Yours</span>
            </h2>
            <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
              Build authentic relationships that drive customer loyalty through
              personalized voice and appearance customization.
            </p>
          </div>

          {/* Customization Layout */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Right: Features */}
            <div className="space-y-6 md:space-y-12 lg:space-y-16 order-2 lg:order-2">
              <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-[#FD912A]/30 transform -rotate-1 hover:rotate-0 transition-transform duration-500 shadow-xl">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#FDF7E2] rounded-xl flex items-center justify-center flex-shrink-0 border border-[#FD912A]/50">
                      <Brush className="w-6 h-6 text-[#FD912A]" />
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

              <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-[#FD912A]/30 transform rotate-1 hover:rotate-0 transition-transform duration-500 shadow-xl">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#FDF7E2] rounded-xl flex items-center justify-center flex-shrink-0 border border-[#FD912A]/50">
                      <PiWaveformBold className="w-6 h-6 text-[#FD912A]" />
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
                <div className="absolute -inset-8 bg-[#FD912A]/15 rounded-3xl blur-2xl opacity-60"></div>

                {/* Voice Toggle Selector */}
                <div className="relative z-10">
                  <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-[#FD912A]/50 shadow-sm">
                    <button
                      onClick={() => setSelectedVoice("original")}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        selectedVoice === "original"
                          ? "bg-[#FD912A] text-white shadow-md"
                          : "text-[#FD912A] hover:bg-[#FDF7E2]"
                      }`}
                    >
                      Original Voice
                    </button>
                    <button
                      onClick={() => setSelectedVoice("cloned")}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        selectedVoice === "cloned"
                          ? "bg-[#FD912A] text-white shadow-md"
                          : "text-[#FD912A] hover:bg-[#FDF7E2]"
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
                    <div className="absolute w-full h-full bg-[#FD912A]/15 rounded-full scale-0 group-hover:scale-100 transition-all duration-1000 ease-out group-hover:delay-100 delay-500 blur-sm"></div>

                    {/* Outer flower outline with glow */}
                    <div className="absolute w-full h-full border-2 border-[#FD912A]/30 rounded-full scale-0 group-hover:scale-100 transition-all duration-700 ease-out group-hover:delay-0 delay-200 shadow-[0_0_20px_rgba(253,145,42,0.3)] group-hover:shadow-[0_0_30px_rgba(253,145,42,0.4)]"></div>

                    {/* Middle flower outline with glow */}
                    <div className="absolute w-4/5 h-4/5 border-2 border-[#FD912A]/40 rounded-full scale-0 group-hover:scale-100 transition-all duration-700 ease-out group-hover:delay-100 delay-300 shadow-[0_0_15px_rgba(253,145,42,0.4)] group-hover:shadow-[0_0_25px_rgba(253,145,42,0.5)]"></div>

                    {/* Inner flower outline with glow */}
                    <div className="absolute w-3/5 h-3/5 border-2 border-[#FD912A]/50 rounded-full scale-0 group-hover:scale-100 transition-all duration-700 ease-out group-hover:delay-200 delay-400 shadow-[0_0_10px_rgba(253,145,42,0.5)] group-hover:shadow-[0_0_25px_rgba(253,145,42,0.6)]"></div>
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
  );
};

export default Customization;
