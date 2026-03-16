const StudioLightingLayers = ({ noiseId }: { noiseId: string }) => (
  <>
    <div className="absolute inset-0 studio-radial-light" />
    <div className="absolute inset-0 studio-horizon-shadow" />
    <div className="absolute inset-0 studio-horizon-meniscus-left" />
    <div className="absolute inset-0 studio-horizon-meniscus-right" />
    <div className="absolute inset-0 studio-floor-shadow" />
    <div className="absolute inset-0 studio-ambient-overlay" />
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[1] mix-blend-overlay"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id={noiseId}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.50"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect
        width="100%"
        height="100%"
        filter={`url(#${noiseId})`}
        opacity="0.40"
      />
    </svg>
  </>
);

export const HeroBackground = () => (
  <StudioLightingLayers noiseId="slide-noise-hero" />
);

export const Benefit1Background = () => (
  <>
    <div className="absolute inset-0 bg-white" />
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-[#FDF7E2]/30 to-[#FDF7E2]/20" />
    <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.035] rounded-full blur-[100px]" />
    <div className="absolute top-[55%] -left-20 w-[350px] h-[300px] bg-[#FDF7E2]/35 rounded-full blur-[80px]" />
    <div className="absolute top-[50%] -right-10 w-[300px] h-[250px] bg-primary/[0.045] rounded-full blur-[90px]" />
  </>
);

export const Benefit2Background = () => (
  <>
    <div className="absolute inset-0 bg-white" />
    <div className="absolute inset-0 bg-[#FDF7E2]/20" />
    <div className="absolute -top-40 -right-[5%] w-[45%] h-96 bg-primary/[0.14] rounded-[50%] blur-[80px]" />
    <div className="absolute -top-32 -left-[5%] w-[40%] h-72 bg-primary/[0.10] rounded-[50%] blur-[70px]" />
    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[35%] h-64 bg-[#FDF7E2]/80 rounded-[50%] blur-[60px]" />
    <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
    <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
    <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute top-1/4 left-0 w-96 h-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm" />
    <div className="absolute bottom-1/4 right-0 w-96 h-2 bg-gradient-to-l from-transparent via-primary/20 to-transparent blur-sm" />
  </>
);

export const Benefit3Background = () => (
  <>
    <div className="absolute inset-0 bg-white" />
    <div className="absolute inset-0 bg-[#FDF7E2]/20" />
    <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
    <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
  </>
);

export const SetupBackground = () => (
  <>
    <div className="absolute inset-0 bg-white" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#FDF7E2]/[0.05] via-background/40 to-[#FDF7E2]/[0.08]" />
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute -top-56 left-[3%] w-[50%] h-64 bg-primary/30 rounded-[50%] blur-[70px]" />
      <div className="absolute -top-56 right-[3%] w-[50%] h-64 bg-primary/25 rounded-[50%] blur-[70px]" />
      <div className="absolute -bottom-56 left-[3%] w-[50%] h-64 bg-primary/30 rounded-[50%] blur-[70px]" />
      <div className="absolute -bottom-56 right-[3%] w-[50%] h-64 bg-primary/25 rounded-[50%] blur-[70px]" />
      <div className="absolute top-[5%] -left-64 w-96 h-[38%] bg-primary/30 rounded-[50%] blur-[70px]" />
      <div className="absolute bottom-[5%] -left-64 w-96 h-[38%] bg-primary/25 rounded-[50%] blur-[70px]" />
      <div className="absolute top-[5%] -right-64 w-96 h-[38%] bg-primary/30 rounded-[50%] blur-[70px]" />
      <div className="absolute bottom-[5%] -right-64 w-96 h-[38%] bg-primary/25 rounded-[50%] blur-[70px]" />
      <div className="absolute -top-48 -left-48 w-[28rem] h-72 bg-primary/[0.28] rounded-[50%] blur-[60px]" />
      <div className="absolute -top-48 -right-48 w-[28rem] h-72 bg-primary/[0.28] rounded-[50%] blur-[60px]" />
      <div className="absolute -bottom-48 -left-48 w-[28rem] h-72 bg-primary/[0.28] rounded-[50%] blur-[60px]" />
      <div className="absolute -bottom-48 -right-48 w-[28rem] h-72 bg-primary/[0.28] rounded-[50%] blur-[60px]" />
    </div>
  </>
);

export const CustomizationBackground = () => (
  <>
    <div className="absolute inset-0 bg-white" />
    <div className="absolute inset-0 bg-[#FDF7E2]/20" />
    <div className="absolute top-0 left-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
  </>
);

export const CTABackground = () => (
  <StudioLightingLayers noiseId="slide-noise-cta" />
);
