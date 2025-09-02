interface ConfettiExplosionProps {
  className?: string;
}

export default function ConfettiExplosion({
  className = "",
}: ConfettiExplosionProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Main diagonal explosions */}
      <div
        className="absolute w-3 h-6 bg-primary opacity-95"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 12px)",
          animation: "explode-up-left 1.2s infinite linear",
          animationDelay: "0s",
        }}
      ></div>

      <div
        className="absolute w-4 h-4 bg-accent rounded-full opacity-90"
        style={{
          left: "calc(50% - 8px)",
          top: "calc(60% - 8px)",
          animation: "explode-up-right 1.2s infinite linear",
          animationDelay: "0.05s",
        }}
      ></div>

      <div
        className="absolute w-2 h-5 bg-primary-dark opacity-95"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 10px)",
          animation: "explode-down-left 1.2s infinite linear",
          animationDelay: "0.1s",
        }}
      ></div>

      <div
        className="absolute w-4 h-4 bg-accent rounded-full opacity-85"
        style={{
          left: "calc(50% - 8px)",
          top: "calc(60% - 8px)",
          animation: "explode-down-right 1.2s infinite linear",
          animationDelay: "0.15s",
        }}
      ></div>

      {/* Side explosions */}
      <div
        className="absolute w-5 h-2 bg-primary opacity-90"
        style={{
          left: "calc(50% - 10px)",
          top: "calc(60% - 4px)",
          animation: "explode-left 1.2s infinite linear",
          animationDelay: "0.2s",
        }}
      ></div>

      <div
        className="absolute w-2 h-6 bg-primary/95 opacity-90"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 12px)",
          animation: "explode-right 1.2s infinite linear",
          animationDelay: "0.25s",
        }}
      ></div>

      {/* Straight up/down explosions */}
      <div
        className="absolute w-4 h-7 bg-primary opacity-95"
        style={{
          left: "calc(50% - 8px)",
          top: "calc(60% - 14px)",
          animation: "explode-up 1.2s infinite linear",
          animationDelay: "0.3s",
        }}
      ></div>

      <div
        className="absolute w-3 h-5 bg-accent opacity-85"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 10px)",
          animation: "explode-down 1.2s infinite linear",
          animationDelay: "0.35s",
        }}
      ></div>

      {/* Far-reaching particles */}
      <div
        className="absolute w-4 h-3 bg-primary opacity-90"
        style={{
          left: "calc(50% - 8px)",
          top: "calc(60% - 6px)",
          animation: "explode-far-left 1.2s infinite linear",
          animationDelay: "0.4s",
        }}
      ></div>

      <div
        className="absolute w-3 h-4 bg-accent opacity-85"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 8px)",
          animation: "explode-far-right 1.2s infinite linear",
          animationDelay: "0.45s",
        }}
      ></div>

      {/* Additional burst particles */}
      <div
        className="absolute w-4 h-4 bg-primary rounded-full opacity-80"
        style={{
          left: "calc(50% - 8px)",
          top: "calc(60% - 8px)",
          animation: "explode-up-left 1.2s infinite linear",
          animationDelay: "0.5s",
        }}
      ></div>

      <div
        className="absolute w-2 h-4 bg-primary-dark opacity-75"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 8px)",
          animation: "explode-down-right 1.2s infinite linear",
          animationDelay: "0.55s",
        }}
      ></div>

      <div
        className="absolute w-3 h-3 bg-accent rounded-full opacity-80"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 6px)",
          animation: "explode-up-right 1.2s infinite linear",
          animationDelay: "0.6s",
        }}
      ></div>

      <div
        className="absolute w-4 h-2 bg-primary opacity-75"
        style={{
          left: "calc(50% - 8px)",
          top: "calc(60% - 4px)",
          animation: "explode-left 1.2s infinite linear",
          animationDelay: "0.65s",
        }}
      ></div>

      {/* MEGA EXPLOSIVE PARTICLES */}
      <div
        className="absolute w-3 h-5 bg-primary opacity-100"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 10px)",
          animation: "explode-mega-up-left 1.2s infinite linear",
          animationDelay: "0.02s",
        }}
      ></div>

      <div
        className="absolute w-4 h-4 bg-accent rounded-full opacity-100"
        style={{
          left: "calc(50% - 8px)",
          top: "calc(60% - 8px)",
          animation: "explode-mega-up-right 1.2s infinite linear",
          animationDelay: "0.07s",
        }}
      ></div>

      <div
        className="absolute w-3 h-6 bg-primary-dark opacity-100"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 12px)",
          animation: "explode-mega-down-left 1.2s infinite linear",
          animationDelay: "0.12s",
        }}
      ></div>

      <div
        className="absolute w-4 h-3 bg-accent opacity-95"
        style={{
          left: "calc(50% - 8px)",
          top: "calc(60% - 6px)",
          animation: "explode-mega-down-right 1.2s infinite linear",
          animationDelay: "0.17s",
        }}
      ></div>

      {/* EXTREME DISTANCE PARTICLES */}
      <div
        className="absolute w-5 h-2 bg-primary opacity-100"
        style={{
          left: "calc(50% - 10px)",
          top: "calc(60% - 4px)",
          animation: "explode-extreme-left 1.2s infinite linear",
          animationDelay: "0.03s",
        }}
      ></div>

      <div
        className="absolute w-2 h-5 bg-primary opacity-100"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 10px)",
          animation: "explode-extreme-right 1.2s infinite linear",
          animationDelay: "0.08s",
        }}
      ></div>

      <div
        className="absolute w-3 h-7 bg-accent opacity-95"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 14px)",
          animation: "explode-extreme-up 1.2s infinite linear",
          animationDelay: "0.13s",
        }}
      ></div>

      <div
        className="absolute w-2 h-6 bg-primary-dark opacity-95"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 12px)",
          animation: "explode-extreme-down 1.2s infinite linear",
          animationDelay: "0.18s",
        }}
      ></div>

      {/* MORE LAYERED BURSTS */}
      <div
        className="absolute w-3 h-4 bg-primary rounded-full opacity-90"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 8px)",
          animation: "explode-up-left 1.2s infinite linear",
          animationDelay: "0.04s",
        }}
      ></div>

      <div
        className="absolute w-3 h-3 bg-accent opacity-90"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 6px)",
          animation: "explode-up-right 1.2s infinite linear",
          animationDelay: "0.09s",
        }}
      ></div>

      <div
        className="absolute w-2 h-5 bg-primary-dark opacity-85"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 10px)",
          animation: "explode-down-left 1.2s infinite linear",
          animationDelay: "0.14s",
        }}
      ></div>

      <div
        className="absolute w-6 h-3 bg-primary opacity-85"
        style={{
          left: "calc(50% - 12px)",
          top: "calc(60% - 6px)",
          animation: "explode-down-right 1.2s infinite linear",
          animationDelay: "0.19s",
        }}
      ></div>

      <div
        className="absolute w-7 h-2 bg-accent opacity-90"
        style={{
          left: "calc(50% - 14px)",
          top: "calc(60% - 4px)",
          animation: "explode-far-left 1.2s infinite linear",
          animationDelay: "0.05s",
        }}
      ></div>

      <div
        className="absolute w-2 h-7 bg-primary opacity-90"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 14px)",
          animation: "explode-far-right 1.2s infinite linear",
          animationDelay: "0.1s",
        }}
      ></div>

      <div
        className="absolute w-4 h-5 bg-primary-dark rounded-full opacity-80"
        style={{
          left: "calc(50% - 8px)",
          top: "calc(60% - 10px)",
          animation: "explode-up 1.2s infinite linear",
          animationDelay: "0.06s",
        }}
      ></div>

      <div
        className="absolute w-5 h-4 bg-accent rounded-full opacity-80"
        style={{
          left: "calc(50% - 10px)",
          top: "calc(60% - 8px)",
          animation: "explode-down 1.2s infinite linear",
          animationDelay: "0.11s",
        }}
      ></div>

      {/* EXTRA CONFETTI STORM - 25 MORE PARTICLES */}
      <div
        className="absolute w-2 h-4 bg-primary opacity-85"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 8px)",
          animation: "explode-up-left 1.2s infinite linear",
          animationDelay: "0.15s",
        }}
      ></div>

      <div
        className="absolute w-3 h-3 bg-accent rounded-full opacity-80"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 6px)",
          animation: "explode-up-right 1.2s infinite linear",
          animationDelay: "0.20s",
        }}
      ></div>

      <div
        className="absolute w-1 h-4 bg-primary-dark opacity-90"
        style={{
          left: "calc(50% - 2px)",
          top: "calc(60% - 8px)",
          animation: "explode-down-left 1.2s infinite linear",
          animationDelay: "0.25s",
        }}
      ></div>

      <div
        className="absolute w-3 h-2 bg-primary opacity-85"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 4px)",
          animation: "explode-down-right 1.2s infinite linear",
          animationDelay: "0.30s",
        }}
      ></div>

      <div
        className="absolute w-4 h-1 bg-accent opacity-90"
        style={{
          left: "calc(50% - 8px)",
          top: "calc(60% - 2px)",
          animation: "explode-left 1.2s infinite linear",
          animationDelay: "0.35s",
        }}
      ></div>

      <div
        className="absolute w-1 h-5 bg-primary opacity-80"
        style={{
          left: "calc(50% - 2px)",
          top: "calc(60% - 10px)",
          animation: "explode-right 1.2s infinite linear",
          animationDelay: "0.40s",
        }}
      ></div>

      <div
        className="absolute w-3 h-6 bg-primary-dark opacity-85"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 12px)",
          animation: "explode-up 1.2s infinite linear",
          animationDelay: "0.45s",
        }}
      ></div>

      <div
        className="absolute w-2 h-3 bg-accent rounded-full opacity-80"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 6px)",
          animation: "explode-down 1.2s infinite linear",
          animationDelay: "0.50s",
        }}
      ></div>

      <div
        className="absolute w-5 h-2 bg-primary opacity-90"
        style={{
          left: "calc(50% - 10px)",
          top: "calc(60% - 4px)",
          animation: "explode-far-left 1.2s infinite linear",
          animationDelay: "0.55s",
        }}
      ></div>

      <div
        className="absolute w-2 h-6 bg-accent opacity-85"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 12px)",
          animation: "explode-far-right 1.2s infinite linear",
          animationDelay: "0.60s",
        }}
      ></div>

      <div
        className="absolute w-3 h-4 bg-primary-dark opacity-90"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 8px)",
          animation: "explode-mega-up-left 1.2s infinite linear",
          animationDelay: "0.65s",
        }}
      ></div>

      <div
        className="absolute w-4 h-3 bg-primary opacity-85"
        style={{
          left: "calc(50% - 8px)",
          top: "calc(60% - 6px)",
          animation: "explode-mega-up-right 1.2s infinite linear",
          animationDelay: "0.70s",
        }}
      ></div>

      <div
        className="absolute w-3 h-5 bg-accent rounded-full opacity-80"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 10px)",
          animation: "explode-mega-down-left 1.2s infinite linear",
          animationDelay: "0.75s",
        }}
      ></div>

      <div
        className="absolute w-6 h-2 bg-primary-dark opacity-85"
        style={{
          left: "calc(50% - 12px)",
          top: "calc(60% - 4px)",
          animation: "explode-mega-down-right 1.2s infinite linear",
          animationDelay: "0.80s",
        }}
      ></div>

      <div
        className="absolute w-1 h-7 bg-primary opacity-90"
        style={{
          left: "calc(50% - 2px)",
          top: "calc(60% - 14px)",
          animation: "explode-extreme-left 1.2s infinite linear",
          animationDelay: "0.85s",
        }}
      ></div>

      <div
        className="absolute w-4 h-3 bg-accent opacity-80"
        style={{
          left: "calc(50% - 8px)",
          top: "calc(60% - 6px)",
          animation: "explode-extreme-right 1.2s infinite linear",
          animationDelay: "0.90s",
        }}
      ></div>

      <div
        className="absolute w-2 h-6 bg-primary-dark opacity-85"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 12px)",
          animation: "explode-extreme-up 1.2s infinite linear",
          animationDelay: "0.95s",
        }}
      ></div>

      <div
        className="absolute w-3 h-3 bg-accent rounded-full opacity-90"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 6px)",
          animation: "explode-extreme-down 1.2s infinite linear",
          animationDelay: "1.00s",
        }}
      ></div>

      {/* MICRO CONFETTI BURST */}
      <div
        className="absolute w-1 h-3 bg-primary opacity-75"
        style={{
          left: "calc(50% - 2px)",
          top: "calc(60% - 6px)",
          animation: "explode-up-left 1.2s infinite linear",
          animationDelay: "0.16s",
        }}
      ></div>

      <div
        className="absolute w-2 h-2 bg-accent opacity-70"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 4px)",
          animation: "explode-up-right 1.2s infinite linear",
          animationDelay: "0.21s",
        }}
      ></div>

      <div
        className="absolute w-1 h-3 bg-primary-dark opacity-80"
        style={{
          left: "calc(50% - 2px)",
          top: "calc(60% - 6px)",
          animation: "explode-down-left 1.2s infinite linear",
          animationDelay: "0.26s",
        }}
      ></div>

      <div
        className="absolute w-3 h-1 bg-primary opacity-75"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 2px)",
          animation: "explode-down-right 1.2s infinite linear",
          animationDelay: "0.31s",
        }}
      ></div>

      <div
        className="absolute w-3 h-1 bg-accent opacity-70"
        style={{
          left: "calc(50% - 6px)",
          top: "calc(60% - 2px)",
          animation: "explode-left 1.2s infinite linear",
          animationDelay: "0.36s",
        }}
      ></div>

      <div
        className="absolute w-1 h-4 bg-primary opacity-80"
        style={{
          left: "calc(50% - 2px)",
          top: "calc(60% - 8px)",
          animation: "explode-right 1.2s infinite linear",
          animationDelay: "0.41s",
        }}
      ></div>

      <div
        className="absolute w-2 h-5 bg-accent rounded-full opacity-75"
        style={{
          left: "calc(50% - 4px)",
          top: "calc(60% - 10px)",
          animation: "explode-up 1.2s infinite linear",
          animationDelay: "0.46s",
        }}
      ></div>

      <div
        className="absolute w-1 h-3 bg-primary-dark opacity-70"
        style={{
          left: "calc(50% - 2px)",
          top: "calc(60% - 6px)",
          animation: "explode-down 1.2s infinite linear",
          animationDelay: "0.51s",
        }}
      ></div>
    </div>
  );
}
