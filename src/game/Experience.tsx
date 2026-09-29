"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Coffee,
  BookOpen,
  Wine,
  Mountain,
  Heart,
  Volume2,
  VolumeX,
  Shirt,
  RotateCcw,
  Map,
  X,
  ArrowRight,
  MoveUpRight,
} from "lucide-react";
import type { Neighborhood } from "./engine";
import { michael, bella } from "./render";
import { readPreferences, savePreferences, type Preferences } from "./config";
import { stories, statusLabel } from "./content";
import { destinations, sceneNames, type SceneId, type Spot } from "./world";
import { PortfolioContent } from "./Portfolio";
import "./north-beach.css";
type Panel = "about" | "projects" | "contact" | "guide" | null;
const icons = [Coffee, BookOpen, Wine, Mountain];
export default function Experience() {
  const canvas = useRef<HTMLCanvasElement>(null),
    portrait = useRef<HTMLCanvasElement>(null),
    game = useRef<Neighborhood | null>(null),
    dialog = useRef<HTMLDialogElement>(null),
    restore = useRef<HTMLElement | null>(null),
    backdropDown = useRef(false),
    audio = useRef<AudioContext | null>(null);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [scene, setScene] = useState<SceneId>("street"),
    [spot, setSpot] = useState<Spot>(),
    [panel, setPanel] = useState<Panel>(null),
    [story, setStory] = useState<string | null>(null),
    [prefs, setPrefs] = useState<Preferences>({ outfit: "rice", sound: false }),
    [petMessage, setPetMessage] = useState(""),
    [visited, setVisited] = useState<string[]>([]);
  const modalOpen = useRef(false);
  modalOpen.current = Boolean(panel || story);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  function tone() {
    if (!prefsRef.current.sound) return;
    try {
      const ctx = audio.current ?? new AudioContext();
      audio.current = ctx;
      void ctx.resume();
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      /* Audio is optional. */
    }
  }
  useEffect(() => {
    try {
      setPrefs(readPreferences(window.localStorage));
    } catch {}
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let instance: Neighborhood | undefined;
    let cancelled = false;
    void import("./engine")
      .then(({ Neighborhood }) => {
        if (cancelled) return;
        try {
          instance = new Neighborhood(
            canvas.current!,
            setSpot,
            (s) => {
              setScene(s);
              if (s !== "street")
                setVisited((v) => (v.includes(s) ? v : [...v, s]));
            },
            (s) => {
              restore.current = document.activeElement as HTMLElement;
              setStory(s);
            },
            () => {
              tone();
              setPetMessage("Bella leans into your hand. A very good morning.");
            },
          );
          instance.state.reduced = motion.matches;
          game.current = instance;
          instance.pause(modalOpen.current);
          instance.state.outfit = prefsRef.current.outfit;
          setReady(true);
        } catch {
          setFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    const change = () => {
      if (instance) instance.state.reduced = motion.matches;
    };
    motion.addEventListener("change", change);
    return () => {
      cancelled = true;
      instance?.destroy();
      game.current = null;
      motion.removeEventListener("change", change);
      void audio.current?.close();
    };
  }, []);
  useEffect(() => {
    if (game.current) game.current.state.outfit = prefs.outfit;
    try {
      savePreferences(window.localStorage, prefs);
    } catch {}
    const c = portrait.current?.getContext("2d");
    if (c) {
      c.clearRect(0, 0, 112, 104);
      michael(
        c,
        44,
        86,
        {
          outfit: prefs.outfit,
          walking: false,
          direction: 0,
          time: 0,
          pet: 0,
          sitting: false,
          reduced: true,
        },
        2,
      );
      c.save();
      c.translate(79, 86);
      c.scale(1.4, 1.4);
      bella(c, 0, 0, 0, false, true);
      c.restore();
    }
  }, [prefs]);
  useEffect(() => {
    if (panel || story) {
      game.current?.pause(true);
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
      game.current?.pause(false);
      restore.current?.focus();
    }
  }, [panel, story]);
  useEffect(() => {
    if (!petMessage) return;
    const t = setTimeout(() => setPetMessage(""), 2600);
    return () => clearTimeout(t);
  }, [petMessage]);
  function open(p: Panel) {
    restore.current = document.activeElement as HTMLElement;
    setPanel(p);
  }
  function close() {
    backdropDown.current = false;
    setStory(null);
    setPanel(null);
  }
  function focusWorld() {
    canvas.current?.focus({ preventScroll: true });
  }
  function update(next: Preferences) {
    setPrefs(next);
    prefsRef.current = next;
    focusWorld();
  }
  return (
    <main className="nb-app">
      <a className="nb-skip" href="./portfolio.html">
        Skip the game · read the portfolio
      </a>
      <header className="nb-header">
        <a href="./" className="nb-brand">
          <span className="nb-monogram">m.</span>
          <span>
            Michael Gonzalez McNeil<small>A PERSONAL PORTFOLIO</small>
          </span>
        </a>
        <nav aria-label="Portfolio">
          <button onClick={() => open("about")}>About</button>
          <button onClick={() => open("projects")}>Projects</button>
          <button onClick={() => open("contact")}>
            Contact <ArrowUpRight size={14} />
          </button>
        </nav>
        <a className="nb-plain" href="./portfolio.html">
          Just the portfolio <ArrowUpRight size={14} />
        </a>
      </header>
      <section className="nb-heading">
        <div>
          <p className="nb-kicker">
            <span className="nb-dot" /> SAN FRANCISCO, CALIFORNIA · A LITTLE
            PLAYABLE POSTCARD
          </p>
          <h1>
            A Morning in <em>North Beach</em>
            <span className="nb-title-star">✳</span>
          </h1>
        </div>
        <p>
          Some places stay with you.
          <br />
          This is one of mine.
        </p>
      </section>
      <div className="nb-layout">
        <aside className="nb-sidebar">
          <div className="nb-intro">
            <canvas
              ref={portrait}
              width={112}
              height={104}
              aria-label="Pixel portrait of Michael in his Rice shirt with Bella"
              role="img"
            />
            <span className="nb-handwritten">Michael & Bella</span>
            <h2>Hi, I’m Michael.</h2>
            <p>Take a walk through North Beach with me and Bella.</p>
            <a className="nb-mobile-portfolio" href="./portfolio.html">
              Read the portfolio ↗
            </a>
            <p className="nb-soft">
              A few favorite places from my SF internship summer, reimagined in
              pixels.
            </p>
          </div>
          <div className="nb-places">
            <p className="nb-kicker">
              AROUND THE NEIGHBORHOOD <span>↗</span>
            </p>
            {destinations.map((d, i) => {
              const Icon = icons[i];
              return (
                <div
                  key={d.id}
                  className={`nb-place ${scene === d.id ? "nb-current" : ""}`}
                >
                  <Icon size={19} />
                  <div>
                    <strong>{d.name}</strong>
                    <small>{d.subtitle}</small>
                  </div>
                  <span
                    title={
                      visited.includes(d.id) ? "Visited" : "Open to explore"
                    }
                  >
                    {visited.includes(d.id) ? "✦" : d.number}
                  </span>
                </div>
              );
            })}
            <button className="nb-map-link" onClick={() => open("guide")}>
              <Map size={15} /> Neighborhood & controls{" "}
              <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="nb-no-rush">
            <span>☁</span>
            <p>
              No checklist. No hurry.
              <br />
              <strong>Just follow your curiosity.</strong>
            </p>
          </div>
        </aside>
        <section
          className="nb-world-section"
          aria-label="Playable neighborhood"
        >
          <div className="nb-world-bar">
            <div>
              <span className="nb-dot" />
              <strong>{sceneNames[scene]}</strong>
              <span className="nb-world-tag">
                {scene === "street"
                  ? "A FOGGY MORNING"
                  : "AN IMAGINED INTERIOR"}
              </span>
            </div>
            <button
              onClick={() => open("guide")}
              aria-label="Open neighborhood guide"
            >
              <Map size={17} />
            </button>
          </div>
          <div className="nb-world">
            <canvas
              ref={canvas}
              className="nb-canvas"
              tabIndex={0}
              aria-label="North Beach game. Move with WASD or arrows, interact with E or Space, pet Bella with P. Portfolio links are above."
              onPointerDown={focusWorld}
            />
            {(!ready || failed) && (
              <div className="nb-fallback">
                <h2>
                  {failed
                    ? "A quiet morning, off canvas."
                    : "Opening the neighborhood…"}
                </h2>
                <p>
                  {failed
                    ? "Your browser couldn’t start the game. All portfolio content is still available."
                    : "The portfolio is already open to explore."}
                </p>
                <a href="./portfolio.html">Read the portfolio ↗</a>
              </div>
            )}
            <div className="nb-location-pill">
              <span>✦</span>
              {scene === "street"
                ? "A little San Francisco, made with care."
                : "Take your time. Look around."}
            </div>
            <div className="nb-prompt" aria-live="polite">
              {spot ? (
                <>
                  <kbd>E</kbd> {spot.label}
                </>
              ) : (
                petMessage || (
                  <>
                    <span>↟</span> Wander a little. There’s something around the
                    corner.
                  </>
                )
              )}
            </div>
          </div>
          <div className="nb-controls">
            <div className="nb-key-guide">
              <span>
                <kbd>W A S D</kbd> / <kbd>↑ ↓ ← →</kbd> Walk
              </span>
              <span>
                <kbd>E</kbd> Interact
              </span>
            </div>
            <div className="nb-actions">
              <button
                className="nb-interact"
                disabled={!spot || !ready}
                onPointerDown={(e) => {
                  if (e.pointerType === "touch") {
                    e.preventDefault();
                    game.current?.interact();
                  }
                }}
                onClick={(e) => {
                  if ((e.nativeEvent as PointerEvent).pointerType !== "touch") {
                    game.current?.interact();
                    focusWorld();
                  }
                }}
              >
                Interact <span>E</span>
              </button>
              <button
                className="nb-pet"
                disabled={!ready}
                onPointerDown={(e) => {
                  if (e.pointerType === "touch") {
                    e.preventDefault();
                    game.current?.pet();
                  }
                }}
                onClick={(e) => {
                  if ((e.nativeEvent as PointerEvent).pointerType !== "touch") {
                    game.current?.pet();
                    focusWorld();
                  }
                }}
              >
                <Heart size={16} /> Pet Bella <kbd>P</kbd>
              </button>
            </div>
          </div>
          <div className="nb-touch" aria-label="Touch movement controls">
            {[
              ["arrowup", "↑", "Up"],
              ["arrowleft", "←", "Left"],
              ["arrowdown", "↓", "Down"],
              ["arrowright", "→", "Right"],
            ].map(([key, symbol, name]) => (
              <button
                key={key}
                className={`nb-${name.toLowerCase()}`}
                aria-label={`Move ${name.toLowerCase()}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  game.current?.touch.set(e.pointerId, key);
                }}
                onPointerUp={(e) => game.current?.touch.delete(e.pointerId)}
                onPointerCancel={(e) => game.current?.touch.delete(e.pointerId)}
                onLostPointerCapture={(e) =>
                  game.current?.touch.delete(e.pointerId)
                }
              >
                {symbol}
              </button>
            ))}
          </div>
          <div className="nb-world-footer">
            <p>STYLIZED MAP · INTERIORS ARE ARTISTIC INTERPRETATIONS</p>
            <div>
              <button
                title="Switch outfit"
                aria-label={`Switch outfit. Currently ${prefs.outfit === "rice" ? "Rice T-shirt" : "rust sweater"}`}
                onClick={() =>
                  update({
                    ...prefs,
                    outfit: prefs.outfit === "rice" ? "sweater" : "rice",
                  })
                }
              >
                <Shirt size={15} />
                <span>
                  {prefs.outfit === "rice" ? "Rice tee" : "Rust sweater"}
                </span>
              </button>
              <button
                aria-label={prefs.sound ? "Mute sound" : "Enable sound"}
                onClick={() => {
                  update({ ...prefs, sound: !prefs.sound });
                  if (!prefs.sound) tone();
                }}
              >
                {prefs.sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
                <span>Sound {prefs.sound ? "on" : "off"}</span>
              </button>
              <button
                title="Return to a safe spot"
                aria-label="Recover to a safe spot"
                onClick={() => {
                  game.current?.recover();
                  focusWorld();
                }}
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
        </section>
      </div>
      <footer className="nb-footer">
        <p>A love letter to a summer in San Francisco.</p>
        <span>Made to wander. Built to connect.</span>
        <button onClick={() => open("contact")}>
          Say hello <MoveUpRight size={14} />
        </button>
      </footer>
      <dialog
        ref={dialog}
        className="nb-dialog"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onPointerDown={(e) => {
          const bounds = e.currentTarget.getBoundingClientRect();
          backdropDown.current =
            e.target === e.currentTarget &&
            (e.clientX < bounds.left ||
              e.clientX > bounds.right ||
              e.clientY < bounds.top ||
              e.clientY > bounds.bottom);
        }}
        onPointerCancel={() => {
          backdropDown.current = false;
        }}
        onClick={(e) => {
          // Opening on touch-down must not make that same gesture's release
          // count as a new click on the modal backdrop.
          if (backdropDown.current && e.target === dialog.current) close();
          backdropDown.current = false;
        }}
        aria-labelledby="nb-dialog-title"
      >
        <div className="nb-dialog-top">
          <span id="nb-dialog-title">
            {story
              ? "A NEIGHBORHOOD NOTE"
              : panel === "guide"
                ? "YOUR LITTLE FIELD GUIDE"
                : "MICHAEL GONZALEZ MCNEIL"}
          </span>
          <button onClick={close} aria-label="Close panel" autoFocus>
            <X size={20} />
          </button>
        </div>
        {story ? (
          <div className="nb-story">
            <p className="nb-kicker">{statusLabel[stories[story].status]}</p>
            <h2>{stories[story].title}</h2>
            <p>{stories[story].text}</p>
            <button className="nb-primary" onClick={close}>
              {story === "seat"
                ? "Stand up & keep wandering"
                : "Back to the morning"}
              <ArrowRight size={17} />
            </button>
          </div>
        ) : panel === "guide" ? (
          <div className="nb-guide">
            <h2>
              A small world.
              <br />
              Your own way through it.
            </h2>
            <p>
              Trieste is north of City Lights and Vesuvio. Those two neighbors
              share Jack Kerouac Alley. Coit Tower is northeast, up the short
              stair path.
            </p>
            <div className="nb-map-diagram">
              <span className="nb-map-north">N ↑</span>
              <span>01 · Trieste</span>
              <span>04 · Coit Tower</span>
              <span>02 · City Lights</span>
              <span>Jack Kerouac Alley</span>
              <span>03 · Vesuvio</span>
            </div>
            <p>
              <strong>Walk:</strong> WASD, arrow keys, or the touch direction
              pad. <strong>Interact:</strong> E, Space, or Interact.{" "}
              <strong>Pet Bella:</strong> P or the heart button.{" "}
              <strong>Close:</strong> Escape.
            </p>
            <p>
              Approach the glowing doorway markers, then interact to enter or
              leave. Use the circular arrow below the world to return to a safe
              spot.
            </p>
            <p className="nb-note">
              Stylized geography, compressed distances, and invented interiors.
              Vesuvio’s morning access is game fiction. Bella is a companion in
              this imagined walk, not a claim about every real visit. Reduced
              motion follows your device settings.
            </p>
            <p className="nb-note">
              Geographic references:{" "}
              <a href="https://caffetrieste.com/our-story">Caffè Trieste</a>,{" "}
              <a href="https://citylights.com/our-story/bookstore-tour/">
                City Lights
              </a>
              ,{" "}
              <a href="https://recpark.sf.gov/Facilities/Facility/Details/Coit-Tower-290">
                SF Recreation & Parks
              </a>
              .
            </p>
          </div>
        ) : (
          <PortfolioContent section={panel || "about"} />
        )}
      </dialog>
    </main>
  );
}
