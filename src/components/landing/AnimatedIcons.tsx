import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small animated icons in the spirit of Apple's SF Symbols animations (draw,
 * bounce, pulse, wiggle, variable colour): one per benefit and sub-benefit, the
 * quick visual confirmation of what the mockup beside it shows. Each plays a
 * short motion, then rests for most of its cycle, so a page full of them stays
 * calm. Stroke icons on a 24 grid; colour comes from `currentColor`. All the
 * motion lives in film-landing.css (.bzl-ai-*); reduced motion shows the rest
 * pose.
 */

export type AnimatedIcon = (props: { className?: string }) => JSX.Element;

const Svg = ({
  children,
  className,
  name,
}: {
  children: ReactNode;
  className?: string;
  name: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={cn("bzl-ai overflow-visible", `bzl-ai-${name}`, className)}
  >
    {children}
  </svg>
);

/** Convert: the lens searches, then a tick draws inside it. */
export const FindIcon: AnimatedIcon = ({ className }) => (
  <Svg name="find" className={className}>
    <g className="lens">
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l4.5 4.5" />
      <path className="tick" pathLength={1} d="M8 10.6l1.8 1.8 3.2-3.4" />
    </g>
  </Svg>
);

/** Upsell: an item drops into the cart, the cart bounces, a +1 pops. */
export const CartPlusIcon: AnimatedIcon = ({ className }) => (
  <Svg name="cart" className={className}>
    <rect className="item" x="10" y="2.5" width="5" height="5" rx="1.2" />
    <g className="cart">
      <path d="M2.5 4h2.3l2.2 10.5h10.2l2-7.5H6" />
      <circle cx="9" cy="19" r="1.3" />
      <circle cx="16" cy="19" r="1.3" />
    </g>
    <g className="badge">
      <circle cx="19.5" cy="4.5" r="3.2" fill="currentColor" stroke="none" />
      <path d="M19.5 3v3M18 4.5h3" stroke="#fff" strokeWidth={1.4} />
    </g>
  </Svg>
);

/** Retain: the heart beats, a loop arrow comes round it. */
export const LoyaltyIcon: AnimatedIcon = ({ className }) => (
  <Svg name="loyalty" className={className}>
    <path className="ring" pathLength={1} d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
    <path className="ring-head" d="M18.6 2.8l-.6 3.2 3.2.5" />
    <path
      className="heart"
      d="M12 16.2s-4-2.4-4-5.2a2.2 2.2 0 0 1 4-1.3 2.2 2.2 0 0 1 4 1.3c0 2.8-4 5.2-4 5.2z"
      fill="currentColor"
      stroke="none"
    />
  </Svg>
);

/** 24/7: the hands sweep round the clock and settle. */
export const ClockIcon: AnimatedIcon = ({ className }) => (
  <Svg name="clock" className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path className="hour" d="M12 12V8.2" />
    <path className="minute" d="M12 12h4" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" />
  </Svg>
);

/** Store knowledge: a page of the book turns. */
export const BookIcon: AnimatedIcon = ({ className }) => (
  <Svg name="book" className={className}>
    <path d="M12 6.5C10 5 6.8 4.6 3.5 5v13c3.3-.4 6.5 0 8.5 1.5 2-1.5 5.2-1.9 8.5-1.5V5c-3.3-.4-6.5 0-8.5 1.5z" />
    <path d="M12 6.5v13" />
    <path
      className="page"
      d="M12 6.5c1.6-1.1 4-1.5 6.5-1.3v12.4c-2.5-.2-4.9.2-6.5 1.4"
    />
  </Svg>
);

/** Emotional intelligence: a heart pops into the speech bubble. */
export const CareIcon: AnimatedIcon = ({ className }) => (
  <Svg name="care" className={className}>
    <path
      className="bubble"
      d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-8l-4.5 3v-3H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5z"
    />
    <path
      className="heart"
      d="M12 15s-3.2-1.9-3.2-4.1a1.75 1.75 0 0 1 3.2-1 1.75 1.75 0 0 1 3.2 1C15.2 13.1 12 15 12 15z"
      fill="currentColor"
      stroke="none"
    />
  </Svg>
);

/** Session replays: play turns into a moving waveform. */
export const ReplayIcon: AnimatedIcon = ({ className }) => (
  <Svg name="replay" className={className}>
    <path className="play" d="M9 7.5v9l7-4.5z" fill="currentColor" />
    <g className="wave">
      <path d="M5 12v0" />
      <path d="M8.5 9v6" />
      <path d="M12 6.5v11" />
      <path d="M15.5 9v6" />
      <path d="M19 11v2" />
    </g>
  </Svg>
);

/** Auto-tagged chats: the tag swings on its hole as labels land. */
export const TagIcon: AnimatedIcon = ({ className }) => (
  <Svg name="tag" className={className}>
    <g className="tag">
      <path d="M3.5 11.6V4.8a1.3 1.3 0 0 1 1.3-1.3h6.8l9 9a1.3 1.3 0 0 1 0 1.8l-6.8 6.8a1.3 1.3 0 0 1-1.8 0z" />
      <circle cx="8" cy="8" r="1.4" />
    </g>
    <path className="label l1" d="M11 12.5h4" />
    <path className="label l2" d="M12.5 15h3" />
  </Svg>
);

/** Funnel insights: bars grow one by one, the trend draws up. */
export const ChartIcon: AnimatedIcon = ({ className }) => (
  <Svg name="chart" className={className}>
    <path d="M3.5 20.5h17" />
    <rect className="bar b1" x="5" y="13" width="3" height="7.5" rx="0.8" />
    <rect className="bar b2" x="10.5" y="10" width="3" height="10.5" rx="0.8" />
    <rect className="bar b3" x="16" y="6.5" width="3" height="14" rx="0.8" />
    <path className="trend" pathLength={1} d="M4 11l5-4 4 2.5 6.5-6" />
  </Svg>
);

/** Personal avatar: a sparkle lands on the shoulder. */
export const AvatarIcon: AnimatedIcon = ({ className }) => (
  <Svg name="avatar" className={className}>
    <circle cx="10.5" cy="8" r="3.6" />
    <path d="M3.5 20c.6-3.8 3.4-6 7-6s6.4 2.2 7 6" />
    <path
      className="spark"
      d="M19 2.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"
      fill="currentColor"
      stroke="none"
    />
  </Svg>
);

/** Voice: a waveform in variable colour. */
export const VoiceIcon: AnimatedIcon = ({ className }) => (
  <Svg name="voice" className={className}>
    <path className="v v1" d="M4 10.5v3" />
    <path className="v v2" d="M8 7v10" />
    <path className="v v3" d="M12 4.5v15" />
    <path className="v v4" d="M16 7v10" />
    <path className="v v5" d="M20 10.5v3" />
  </Svg>
);

/*
 * The three benefit icons (Sales, Support, Insights) open their pillars, in a
 * disc above the pillar's name and in its docked bar (PillarIntro), so they
 * are drawn as one set: the same 2px stroke, an optical box of about 18 x 18
 * centred on the grid's 12/12, no part thinner or tighter than the others,
 * and complete at rest (their motions only ever start from, and return to,
 * the full drawing; PillarIntro turns them off).
 */

/** Sales (benefit): the line climbs and its arrow lands. */
export const TrendIcon: AnimatedIcon = ({ className }) => (
  <Svg name="trend" className={className}>
    <path className="line" pathLength={1} d="M2.75 17.5 9 11.25l4 4 8.25-8.25" />
    <path className="head" d="M15 7h6.25v6.25" />
  </Svg>
);

/** Support (benefit): a headset, its mic at the cheek; the earcups pulse. */
export const HeadsetIcon: AnimatedIcon = ({ className }) => (
  <Svg name="headset" className={className}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect className="cup" x="3" y="12.5" width="4.25" height="6.5" rx="2" />
    <rect className="cup" x="16.75" y="12.5" width="4.25" height="6.5" rx="2" />
    <path d="M18.9 19v.25A2.75 2.75 0 0 1 16.15 22H13.5" />
  </Svg>
);

/** Insights (benefit): the bulb lights and its rays flash. */
export const IdeaIcon: AnimatedIcon = ({ className }) => (
  <Svg name="idea" className={className}>
    <path
      className="bulb"
      d="M12 5a5.25 5.25 0 0 0-3.1 9.5c.55.42.85.95.85 1.6V16.5h4.5v-.4c0-.65.3-1.18.85-1.6A5.25 5.25 0 0 0 12 5z"
    />
    <path d="M9.75 19h4.5M10.75 21.5h2.5" />
    <g className="rays">
      <path d="M12 1.5v1M4.6 4.1l.75.75M19.4 4.1l-.75.75M2.5 10.25h1M20.5 10.25h1" />
    </g>
  </Svg>
);

/** The tile an animated icon sits in: a soft glass square with a warm tint. */
export const IconTile = ({
  icon: Icon,
  className,
  size = "md",
}: {
  icon: AnimatedIcon;
  className?: string;
  size?: "sm" | "md" | "lg";
}) => (
  <span
    className={cn(
      // the pillar's accent inside a pillar band, Bizmis orange elsewhere
      "bzl-icon-tile relative grid flex-shrink-0 place-items-center text-[var(--acc,var(--bzl-orange-strong))]",
      size === "sm" && "h-10 w-10 rounded-xl [&_svg]:h-5 [&_svg]:w-5",
      size === "md" && "h-14 w-14 rounded-[18px] [&_svg]:h-7 [&_svg]:w-7",
      size === "lg" && "h-16 w-16 rounded-[20px] [&_svg]:h-8 [&_svg]:w-8",
      className,
    )}
  >
    <Icon />
  </span>
);
