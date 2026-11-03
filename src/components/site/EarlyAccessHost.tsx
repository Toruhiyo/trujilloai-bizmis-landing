import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AudioLines, RotateCcw, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";
import { EARLY_ACCESS_STORE_CAP } from "@/data/leads/_schema";
import { EA_PERKS_VOICE } from "@/data/earlyAccessPerksVoice";
import AgentImage from "@/components/landing/AgentImage";
import LiveAvatar from "@/components/landing/LiveAvatar";
import { useNearScreen } from "@/components/landing/sales/hooks";
import { captionWords, partAt, partMeasure, splitLine } from "@/components/landing/captionParts";

/**
 * The Early Access page's host: Will, live in 3D, full figure in the Bizmis
 * shirt, on the hero's right (above the title on phones). Like the home
 * hero's agent (HeroAgent) he talks in the widget's captions, never in chat
 * bubbles: he says hello once, then takes turns with a line on the offer and
 * the invite, said pointing at the Install button (to his right, the
 * visitor's left, on desktop; a nod on phones, where the button is under
 * him), which calls out while he points; then he rests, quiet.
 *
 * Under him, a small pill plays the perks, out loud: his own voice (his
 * preset's ElevenLabs voice, eleven_v4, src/data/earlyAccessPerksVoice.ts),
 * fetched on the click, with the captions on the recording's word times, his
 * mouth moving and a gesture for each line. It turns into stop while he
 * speaks and into hear again after. The recording stops when he is scrolled
 * away or the tab is hidden; nothing plays without a click.
 *
 * Holds still and quiet while scrolled away. Reduced motion: no 3D (his still
 * render) and no turns, the invite stays up; the perks still play on a click.
 */

/** The idle turns' pace, as the home hero's: a word every 300 ms, a line held 1.3 s. */
const MS_PER_WORD = 300;
const HOLD_MS = 1300;
/** After the invite: the captions go and he rests this long before the next turn. */
const REST_MS = 9000;
const START_DELAY_MS = 500;
/** A load slower than this and he starts over the still render anyway. */
const LIVE_WAIT_MS = 15000;
/** The invite rides the pointing clip (3 s, jabs at ~0.72 / 1.14 / 1.56 s), as on the home hero. */
const POINT_LEAD_MS = 600;
const POINT_WORD_MS = 420;
/** The shared clip pointing to his right, the visitor's left, where Install is (side by side). */
const POINT = "pointing_right";
/** Stacked (below lg), Install is under him: he nods instead. */
const STACKED_INVITE = "nod";
const SIDE_BY_SIDE_QUERY = "(min-width: 1024px)";
const isStacked = () => typeof window !== "undefined" && !window.matchMedia?.(SIDE_BY_SIDE_QUERY).matches;
/** One gesture per perks line (messages.earlyAccessPage.host.perks), on its first word. */
const PERKS_GESTURES = ["waving", "nod", "presenting_left", "shrugging", "nod", "thumbsup", POINT];
/** A gesture starts this far ahead of its line's first word (the pointing clip further, so its jabs land on the words). */
const GESTURE_LEAD_S = 0.25;
const POINT_LEAD_S = 0.6;
/** Between two words closer than this he keeps talking. */
const WORD_GAP_S = 0.35;

type Step = { line: string[]; gesture?: string; invite?: boolean; msPerWord?: number; leadMs?: number };
type Perks = "off" | "loading" | "playing" | "done";

const EarlyAccessHost = ({ onInvite }: { onInvite?: (inviting: boolean) => void }) => {
  const messages = useMessages();
  const locale = useLocale();
  const host = messages.earlyAccessPage.host;
  const boxRef = useRef<HTMLDivElement>(null);
  const seen = useNearScreen(boxRef, "0px");
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = useMemo<Step[]>(
    () => [
      { line: captionWords(host.hello), gesture: "waving" },
      { line: captionWords(host.line(EARLY_ACCESS_STORE_CAP)) },
      { line: captionWords(host.invite), gesture: POINT, invite: true, msPerWord: POINT_WORD_MS, leadMs: POINT_LEAD_MS },
    ],
    [host],
  );

  // the spoken perks: shown only where the lines voiced are the lines on the page
  const perksLines = useMemo(() => host.perks(EARLY_ACCESS_STORE_CAP).map(captionWords), [host]);
  const voice = EA_PERKS_VOICE[locale];
  const voiced =
    voice &&
    voice.lines.join("\n") === host.perks(EARLY_ACCESS_STORE_CAP).join("\n") &&
    voice.words.length === perksLines.flat().length
      ? voice
      : null;
  const [perks, setPerks] = useState<Perks>("off");
  const playing = perks === "loading" || perks === "playing";
  const audio = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  playingRef.current = playing;
  // where the recording is: its line, how many of that line's words are said, and whether he's mid-word
  const [said, setSaid] = useState({ line: 0, word: 0, talking: false });

  // where the idle turns are: the step, how many of its words are said, and resting after the invite
  const [at, setAt] = useState({ step: still ? 2 : 0, word: still ? Infinity : 0, rest: false });
  const [gesture, setGesture] = useState<{ name: string; key: number } | null>(null);
  const cycle = useRef(0);
  const [avatar, setAvatar] = useState<"loading" | "live" | "still">("loading");
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), LIVE_WAIT_MS);
    return () => window.clearTimeout(t);
  }, []);
  const ready = avatar !== "loading" || waited;
  const paused = !seen || playing;
  const gestureTo = useCallback(
    (name: string) => setGesture({ name: name === POINT && isStacked() ? STACKED_INVITE : name, key: Date.now() }),
    [],
  );

  // the idle turns (as HeroAgent's): one word per tick; a finished line holds, the invite rests, then the next
  useEffect(() => {
    if (paused || still || !ready) return;
    let timer = 0;
    const next = (step: number) => (step === steps.length - 1 ? 1 : step + 1);
    const run = (step: number, word: number, delay: number, led = false) => {
      timer = window.setTimeout(() => {
        const s = steps[step];
        if (word < s.line.length) {
          // the first hello rides the avatar's own greeting wave
          if (word === 0 && !led && s.gesture && cycle.current > 0) {
            gestureTo(s.gesture);
            if (s.leadMs) return run(step, 0, s.leadMs, true);
          }
          setAt({ step, word: word + 1, rest: false });
          return run(step, word + 1, s.msPerWord ?? MS_PER_WORD);
        }
        cycle.current += 1;
        if (s.invite) {
          // the invite holds a moment, then the captions go and he rests
          setAt({ step, word: Infinity, rest: false });
          timer = window.setTimeout(() => {
            setAt({ step, word: Infinity, rest: true });
            run(next(step), 0, REST_MS);
          }, HOLD_MS);
          return;
        }
        setAt({ step, word: Infinity, rest: false });
        run(next(step), 0, HOLD_MS);
      }, delay);
    };
    if (Number.isFinite(at.word)) run(at.step, at.word, START_DELAY_MS);
    else run(next(at.step), 0, at.rest || steps[at.step].invite ? REST_MS : HOLD_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, still, ready, steps, gestureTo]);

  // the perks done (or stopped): he picks up the idle turns from a rest, quiet (both in one render, so the turns
  // resume from the rest, not from where the perks interrupted them)
  const finish = useCallback(() => {
    setPerks((p) => (p === "off" ? p : "done"));
    setAt({ step: 2, word: Infinity, rest: !still });
  }, [still]);
  const stop = useCallback(() => {
    const a = audio.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    finish();
  }, [finish]);
  // the perks: the recording drives the captions, the mouth and the gestures
  useEffect(() => {
    if (!playing || !voiced) return;
    const a = audio.current;
    if (!a) return;
    // each line's first word, in the recording's words
    const starts = perksLines.map((_, i) => perksLines.slice(0, i).reduce((n, l) => n + l.length, 0));
    let raf = 0;
    let cued = -1;
    const tick = () => {
      const t = a.currentTime;
      // the last word started, and the line it's in
      let k = -1;
      while (k + 1 < voiced.words.length && voiced.words[k + 1][0] <= t) k++;
      // each line's gesture, a little ahead of its first word
      while (cued + 1 < perksLines.length) {
        const name = PERKS_GESTURES[cued + 1];
        const lead = name === POINT ? POINT_LEAD_S : GESTURE_LEAD_S;
        if (t < voiced.words[starts[cued + 1]][0] - lead) break;
        cued += 1;
        if (name && !still && t < voiced.words[starts[cued]][1] + 0.5) gestureTo(name);
      }
      const line = Math.max(0, starts.filter((s) => s <= k).length - 1);
      const word = k < 0 ? 0 : k - starts[line] + 1;
      const end = k >= 0 ? voiced.words[k][1] : 0;
      const gap = voiced.words[k + 1] ? voiced.words[k + 1][0] - end : Infinity;
      const talking = k >= 0 && (t <= end + 0.08 || gap < WORD_GAP_S);
      setSaid((s) => (s.line === line && s.word === word && s.talking === talking ? s : { line, word, talking }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, voiced, perksLines, still, gestureTo]);
  // scrolled away or the tab hidden, he stops
  useEffect(() => {
    if (playing && !seen) stop();
  }, [playing, seen, stop]);
  useEffect(() => {
    const hide = () => document.visibilityState === "hidden" && playingRef.current && stop();
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      audio.current?.pause();
    };
  }, [stop]);
  const finishRef = useRef(finish);
  finishRef.current = finish;
  const togglePerks = () => {
    if (!voiced) return;
    if (playing) return stop();
    let a = audio.current;
    if (!a || a.dataset.src !== voiced.src) {
      a?.pause();
      a = new Audio(voiced.src);
      a.dataset.src = voiced.src;
      a.preload = "auto";
      a.addEventListener("ended", () => finishRef.current());
      audio.current = a;
    }
    a.currentTime = 0;
    setSaid({ line: 0, word: 0, talking: false });
    setPerks("loading");
    a.play().then(
      () => setPerks((p) => (p === "loading" ? "playing" : p)),
      () => setPerks("off"),
    );
  };
  // what the captions show: the recording's line while he plays the perks, else the idle turn's
  const perksOn = playing && voiced;
  const line = perksOn ? perksLines[said.line] : steps[at.step].line;
  const word = perksOn ? said.word : at.word;
  const lineKey = perksOn ? `p${said.line}` : `i${at.step}`;
  const shown = perksOn ? said.word > 0 : at.word > 0 && !at.rest;
  const speaking = perksOn ? said.talking : !paused && !still && Number.isFinite(at.word) && at.word <= line.length;
  const inviting =
    (perksOn ? said.line === perksLines.length - 1 && said.word > 0 : Boolean(steps[at.step].invite) && at.word > 0 && !at.rest) &&
    seen;
  useEffect(() => onInvite?.(inviting), [inviting, onInvite]);

  // The captions never wrap: a line too long for its room (the avatar's column, at most 28rem; the page
  // less 1rem each side when stacked) is shown in parts, one after the other as they're said.
  const captionRef = useRef<HTMLParagraphElement>(null);
  const [starts, setStarts] = useState([0]);
  useLayoutEffect(() => {
    const el = captionRef.current;
    if (!el) return;
    const measure = () => {
      const part = partMeasure(el, line);
      if (!part) return;
      const css = getComputedStyle(el);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const hero = el.closest<HTMLElement>(".bzl-ea-hero");
      const cols = hero ? getComputedStyle(hero).gridTemplateColumns.split(" ").map(parseFloat) : [];
      const column = !isStacked() && cols.length > 1 ? cols[cols.length - 1] : window.innerWidth - 2 * rem;
      const pill = Math.min(28 * rem, column);
      setStarts(splitLine(line, part, pill - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight) - 2));
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [line]);
  const current = Number.isFinite(word) ? Math.max(0, word - 1) : line.length - 1;
  const { from, to } = partAt(starts, current, line.length);
  const label = playing ? host.stopPerks : perks === "done" ? host.replayPerks : host.hearPerks;
  const Icon = playing ? Square : perks === "done" ? RotateCcw : AudioLines;

  return (
    <>
      <div ref={boxRef} className="bzl-ea-avatar-box" role="img" aria-label={messages.earlyAccessPage.avatarAlt}>
        <LiveAvatar
          model="will"
          shirtColor="#F9A353"
          fullBody
          speaking={speaking}
          gesture={seen ? gesture : null}
          onStatus={setAvatar}
          fallback={
            <AgentImage
              name="setup-will"
              alt=""
              sizes="(min-width: 1024px) 340px, 40vw"
              eager
              className="h-full"
              imgClassName="h-full w-full object-contain object-bottom"
            />
          }
        />
      </div>

      {/* his captions: spoken words solid, the current one bold and glowing (the home hero's) */}
      <p
        ref={captionRef}
        className={cn("bzl-ea-caption", !shown && "opacity-0")}
        aria-live={perksOn ? "polite" : undefined}
      >
        <span className="sr-only">{line.join(" ")}</span>
        <span aria-hidden="true">
          {line.slice(from, to).map((w, i, part) => {
            const k = from + i;
            return (
              <span
                key={`${lineKey}-${k}`}
                className={cn(
                  "relative",
                  k < word - 1 ? "opacity-100" : k === word - 1 ? "bzl-ea-caption-now" : "opacity-50",
                )}
              >
                {k === word - 1 && <span className="bzl-ea-caption-glow" />}
                {w}
                {i < part.length - 1 ? " " : ""}
              </span>
            );
          })}
        </span>
      </p>

      {/* the perks, out loud: a small pill at his feet (not a play button) */}
      {voiced && (
        <button
          type="button"
          onClick={togglePerks}
          className="bzl-ea-perks"
          data-state={perks}
          aria-pressed={playing}
        >
          <span className="bzl-ea-perks-icon" aria-hidden="true">
            <Icon strokeWidth={2.4} />
          </span>
          <span>{label}</span>
          {playing && (
            <span className="bzl-ea-perks-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          )}
        </button>
      )}
    </>
  );
};

export default EarlyAccessHost;
