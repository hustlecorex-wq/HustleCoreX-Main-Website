import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";

/**
 * VideoFrame - the site's self-hosted player, with its own controls.
 *
 * Self-hosted rather than embedded, so there's no third-party player chrome,
 * no recommended-videos panel at the end and no cookie banner sitting on top
 * of the one thing the page is asking people to watch. The controls are ours
 * for the same reason: the browser's default bar is the one piece of stock UI
 * that would otherwise sit in the middle of the page.
 *
 * Three details here exist only so playback doesn't stutter:
 *
 *  - The rounded clip is dropped the moment playback starts. A rounded
 *    `overflow-hidden` ancestor makes Chrome re-mask the video on every
 *    frame, so the radius moves onto the video element itself, which is
 *    free. The clip is only needed before play, to hold the sheen sweep in.
 *    The control bar carries its own bottom radius for the same reason.
 *
 *  - While anything is playing, `video-playing` goes on <html> and the
 *    ambient beam stops animating (see index.css). Large animated blurs and
 *    a decoding 1080p stream otherwise fight over the same GPU, and it's the
 *    video that visibly loses.
 *
 *  - Metadata is fetched on hover rather than on load, so the file still
 *    costs nothing on a visit that never presses play, but the press itself
 *    doesn't wait on a round trip.
 *
 * ── Swapping a video out ──────────────────────────────────────────────
 * Files live in client/public/. Drop a new mp4 in there and re-cut its
 * poster from a frame of it. Encode it - do not just rename a screen
 * recording in. Recorders write the moov atom at the END of the file, which
 * means a browser has to pull the whole thing down before it can show a
 * single frame, and they record at 60fps, which doubles decode cost for
 * footage that has no motion in it:
 *
 *   ffmpeg -i in.mp4 -c:v libx264 -preset slow -profile:v high -level 4.0 \
 *     -pix_fmt yuv420p -r 30 -crf 24 -maxrate 1800k -bufsize 3600k \
 *     -g 60 -keyint_min 60 -sc_threshold 0 \
 *     -c:a aac -b:a 96k -ac 2 -movflags +faststart out.mp4
 *
 * Check the audio level too - screen recordings come off a system mic far
 * below web loudness, and there is no volume control that can rescue a file
 * that quiet, since the element caps at 1.0. Measure, then bake in the gain:
 *
 *   ffmpeg -i out.mp4 -af volumedetect -vn -f null -      # read max_volume
 *   ffmpeg -i out.mp4 -c:v copy -af "volume=15dB" \       # leave ~2dB spare
 *     -c:a aac -b:a 128k -ar 48000 -ac 2 -movflags +faststart louder.mp4
 */

/* Refcounted, because two frames on one page must not undo each other's
   pause - the second one finishing would otherwise restart the beam while
   the first is still playing. */
let playingCount = 0;

const pct = (n: number) => `${Math.min(100, Math.max(0, n * 100))}%`;

function clock(s: number) {
  const t = Number.isFinite(s) && s > 0 ? Math.floor(s) : 0;
  return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, "0")}`;
}

/**
 * One draggable track, used for both the timeline and the volume slider -
 * they are the same interaction, so they behave identically down to the
 * keyboard step and the knob that only appears once you're on it.
 */
function Scrubber({
  value,
  buffered = 0,
  onSeek,
  label,
  valueText,
  step = 0.05,
}: {
  value: number;
  buffered?: number;
  onSeek: (ratio: number) => void;
  label: string;
  valueText: string;
  step?: number;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);

  const at = (clientX: number) => {
    const r = track.current?.getBoundingClientRect();
    if (!r?.width) return 0;
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  };

  return (
    <div
      ref={track}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-valuetext={valueText}
      /* Stopped, or the frame's own arrow-key handler would fire too. */
      onKeyDown={(e) => {
        const back = e.key === "ArrowLeft" || e.key === "ArrowDown";
        const fwd = e.key === "ArrowRight" || e.key === "ArrowUp";
        if (!back && !fwd) return;
        e.preventDefault();
        e.stopPropagation();
        onSeek(Math.min(1, Math.max(0, value + (back ? -step : step))));
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag(true);
        onSeek(at(e.clientX));
      }}
      onPointerMove={(e) => drag && onSeek(at(e.clientX))}
      onPointerUp={(e) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        setDrag(false);
      }}
      onPointerCancel={() => setDrag(false)}
      className="group/track relative flex h-4 cursor-pointer touch-none items-center rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember/70"
    >
      <div
        className={`relative w-full overflow-hidden rounded-full bg-white/[0.14] transition-[height] duration-200 ${
          drag ? "h-[5px]" : "h-[3px] group-hover/track:h-[5px]"
        }`}
      >
        {buffered > 0 && (
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 bg-white/[0.18]"
            style={{ width: pct(buffered) }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-ember to-flare"
          style={{ width: pct(value) }}
        />
      </div>
      <span
        aria-hidden
        className={`pointer-events-none absolute h-3 w-3 -translate-x-1/2 rounded-full bg-chalk transition-opacity duration-200 ${
          drag ? "opacity-100" : "opacity-0 group-hover/track:opacity-100"
        }`}
        style={{
          left: pct(value),
          boxShadow: "0 0 10px rgba(255,74,23,0.55)",
        }}
      />
    </div>
  );
}

export default function VideoFrame({
  src,
  poster,
  /* The recording's own aspect, so the frame never letterboxes it. */
  aspect,
  label,
  className = "",
}: {
  src: string;
  poster: string;
  aspect: string;
  label: string;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [warm, setWarm] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [span, setSpan] = useState(0);
  const [ahead, setAhead] = useState(0);
  const [vol, setVol] = useState(1);
  const [muted, setMuted] = useState(false);
  const [full, setFull] = useState(false);
  const [ui, setUi] = useState(true);
  const counted = useRef(false);
  const idle = useRef<number | null>(null);

  const mark = (on: boolean) => {
    if (counted.current === on) return;
    counted.current = on;
    playingCount = Math.max(0, playingCount + (on ? 1 : -1));
    document.documentElement.classList.toggle("video-playing", playingCount > 0);
  };

  /* Controls fade out of the way while it's running, and come straight back
     on any pointer movement. Paused always shows them. */
  const wake = useCallback(() => {
    setUi(true);
    if (idle.current) window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => {
      if (video.current && !video.current.paused) setUi(false);
    }, 2600);
  }, []);

  /* Navigating away mid-video shouldn't leave the page's light frozen. */
  useEffect(
    () => () => {
      mark(false);
      if (idle.current) window.clearTimeout(idle.current);
    },
    [],
  );

  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === shell.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggle = useCallback(() => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      setStarted(true);
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
    wake();
  }, [wake]);

  const seekTo = (r: number) => {
    const v = video.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = r * v.duration;
    setTime(v.currentTime);
    wake();
  };

  const skip = (d: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = Math.min(v.duration || 0, Math.max(0, v.currentTime + d));
    wake();
  };

  const applyVol = (r: number) => {
    const v = video.current;
    if (!v) return;
    const c = Math.min(1, Math.max(0, r));
    v.volume = c;
    v.muted = c === 0;
    setVol(c);
    setMuted(c === 0);
    wake();
  };

  const toggleMute = () => {
    const v = video.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    /* Unmuting a slider that was dragged to zero should make a sound. */
    if (!next && v.volume === 0) {
      v.volume = 0.6;
      setVol(0.6);
    }
    wake();
  };

  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void shell.current?.requestFullscreen?.().catch(() => {});
  };

  const onKey = (e: React.KeyboardEvent) => {
    const keys = [" ", "k", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "m", "f"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    if (e.key === " " || e.key === "k") toggle();
    else if (e.key === "ArrowLeft") skip(-5);
    else if (e.key === "ArrowRight") skip(5);
    else if (e.key === "ArrowUp") applyVol(vol + 0.1);
    else if (e.key === "ArrowDown") applyVol(vol - 0.1);
    else if (e.key === "m") toggleMute();
    else if (e.key === "f") toggleFull();
  };

  /* Rounding lives on the video too, since the wrapper stops clipping it. */
  const radius = full ? "" : "rounded-[20px] md:rounded-[26px]";
  const btn =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-chalk/80 transition-colors duration-200 hover:bg-white/[0.1] hover:text-chalk focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember/70";

  return (
    <div className={`relative mx-auto w-full ${className}`}>
      {/* The frame catches the beam on its top edge */}
      <div
        aria-hidden
        className="absolute inset-x-6 -top-px h-px md:inset-x-16"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,190,150,0.85), transparent)",
        }}
      />
      <div
        ref={shell}
        role="region"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerEnter={() => {
          setWarm(true);
          wake();
        }}
        onPointerMove={wake}
        onPointerLeave={() => playing && setUi(false)}
        className={`relative w-full border border-white/[0.09] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember/50 ${radius} ${
          started ? "" : "overflow-hidden sheen"
        } ${started && !ui ? "cursor-none" : ""}`}
        style={{
          ...(full ? {} : { aspectRatio: aspect }),
          background:
            "linear-gradient(180deg, rgba(255,120,60,0.05) 0%, rgba(14,14,19,1) 34%, rgba(9,9,13,1) 100%)",
          boxShadow: full
            ? undefined
            : "0 -1px 40px rgba(255,90,30,0.18), 0 40px 100px -30px rgba(0,0,0,0.9)",
        }}
      >
        <video
          ref={video}
          src={src}
          poster={poster}
          preload={warm ? "metadata" : "none"}
          playsInline
          onPlay={() => {
            setStarted(true);
            setPlaying(true);
            mark(true);
            wake();
          }}
          onPause={() => {
            setPlaying(false);
            mark(false);
            setUi(true);
          }}
          onEnded={() => {
            setPlaying(false);
            mark(false);
            setUi(true);
          }}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            setSpan(e.currentTarget.duration);
            setVol(e.currentTarget.volume);
            setMuted(e.currentTarget.muted);
          }}
          onDurationChange={(e) => setSpan(e.currentTarget.duration)}
          onProgress={(e) => {
            const v = e.currentTarget;
            const b = v.buffered;
            if (b.length && v.duration)
              setAhead(Math.min(1, b.end(b.length - 1) / v.duration));
          }}
          onVolumeChange={(e) => {
            setVol(e.currentTarget.volume);
            setMuted(e.currentTarget.muted);
          }}
          className={`video-surface absolute inset-0 h-full w-full ${
            full ? "object-contain" : "object-cover"
          } ${radius}`}
        />

        {/* Click anywhere on the picture to play or pause. Not a button - the
            real one lives in the bar, and a full-bleed duplicate would just
            be noise to a screen reader. */}
        {started && (
          <div
            aria-hidden
            onClick={toggle}
            className="absolute inset-0 z-10"
            style={{ bottom: 76 }}
          />
        )}

        {started && (
          <div
            className={`absolute inset-x-0 bottom-0 z-20 overflow-hidden transition-opacity duration-300 ${
              full ? "" : "rounded-b-[20px] md:rounded-b-[26px]"
            } ${ui ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
              style={{
                background:
                  "linear-gradient(to top, rgba(7,7,10,0.94) 0%, rgba(7,7,10,0.66) 46%, transparent 100%)",
              }}
            />
            <div className="relative px-3 pb-3 pt-10 md:px-5 md:pb-4">
              <Scrubber
                label="Seek"
                value={span ? time / span : 0}
                buffered={ahead}
                onSeek={seekTo}
                valueText={`${clock(time)} of ${clock(span)}`}
                step={0.02}
              />

              <div className="mt-2 flex items-center gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={playing ? "Pause" : "Play"}
                  className={btn}
                >
                  {playing ? (
                    <Pause size={15} className="fill-current" />
                  ) : (
                    <Play size={15} className="ml-0.5 fill-current" />
                  )}
                </button>

                <span className="font-mono text-[11px] tabular-nums tracking-[0.08em] text-ash">
                  {clock(time)}
                  <span className="text-ash-dim"> / {clock(span)}</span>
                </span>

                <div className="ml-auto flex items-center gap-1.5">
                  <div className="group/vol flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={muted || vol === 0 ? "Unmute" : "Mute"}
                      className={btn}
                    >
                      {muted || vol === 0 ? (
                        <VolumeX size={15} />
                      ) : (
                        <Volume2 size={15} />
                      )}
                    </button>
                    <div className="w-0 overflow-hidden opacity-0 transition-all duration-300 focus-within:w-16 focus-within:opacity-100 group-hover/vol:w-16 group-hover/vol:opacity-100">
                      <Scrubber
                        label="Volume"
                        value={muted ? 0 : vol}
                        onSeek={applyVol}
                        valueText={`${Math.round((muted ? 0 : vol) * 100)} percent`}
                        step={0.1}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleFull}
                    aria-label={full ? "Exit full screen" : "Full screen"}
                    className={btn}
                  >
                    {full ? <Minimize size={15} /> : <Maximize size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!started && (
          <button
            onClick={toggle}
            aria-label={label}
            className="group absolute inset-0 z-20 flex items-center justify-center"
          >
            {/* Darkens the poster just enough for the button to read */}
            <span
              aria-hidden
              className="absolute inset-0 bg-void/45 transition-colors duration-500 group-hover:bg-void/30"
            />
            <span className="relative flex flex-col items-center gap-5">
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-ember/35 bg-ember/[0.07] backdrop-blur-sm transition-transform duration-500 group-hover:scale-105">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: "0 0 40px rgba(255,74,23,0.3)" }}
                />
                <Play size={20} className="ml-0.5 fill-ember text-ember" />
              </span>
              {/* Dropped by a transform rather than by spacing. Margin or a
                  wider gap makes the column taller, and the column is
                  centred - so the play button drifts up by half of whatever
                  the caption gains. A transform costs no layout at all. */}
              <span className="mono-label translate-y-4">{label}</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
