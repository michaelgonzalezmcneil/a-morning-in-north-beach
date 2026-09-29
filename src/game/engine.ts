import Phaser from "phaser";
import { Companion } from "./companion";
import { move, velocity } from "./movement";
import { render, type RenderState } from "./render";
import {
  dimensions,
  nearest,
  start,
  destinations,
  type Point,
  type SceneId,
  type Spot,
} from "./world";
export class Neighborhood {
  state: RenderState = {
    scene: "street",
    player: { ...start },
    bella: { ...start },
    direction: 0,
    walking: false,
    time: 0,
    pet: 0,
    outfit: "rice",
    reduced: false,
    sitting: false,
  };
  companion = new Companion(start);
  keys = new Set<string>();
  touch = new Map<number, string>();
  paused = false;
  camera = { x: 0, y: 0 };
  viewport = { x: 800, y: 550 };
  last = 0;
  prompt = "";
  disposed = false;
  constructor(
    public canvas: HTMLCanvasElement,
    public onPrompt: (s: Spot | undefined) => void,
    public onScene: (scene: SceneId) => void,
    public onStory: (id: string) => void,
    public onPet: () => void,
  ) {
    if (!canvas.getContext("2d")) throw Error("Canvas is unavailable");
    const buffer = document.createElement("canvas");
    const c = buffer.getContext("2d");
    if (!c) throw Error("Canvas is unavailable");
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const scale = r.width < 600 ? 1.4 : Math.max(1.35, r.width / 800);
      this.viewport = {
        x: Math.round(r.width / scale),
        y: Math.round(r.height / scale),
      };
      buffer.width = this.viewport.x;
      buffer.height = this.viewport.y;
      if (this.texture) {
        this.texture.setSize(this.viewport.x, this.viewport.y);
        this.sprite?.setSize(this.viewport.x, this.viewport.y);
      }
      this.phaser?.scale.resize(this.viewport.x, this.viewport.y);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      c.imageSmoothingEnabled = false;
      this.resetInput();
      this.camera = this.cameraTarget();
    };
    this.companion.resetBeside(start, "street");
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    this.camera = this.cameraTarget();
    const down = (e: KeyboardEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (
        this.paused ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        target?.closest('input,textarea,select,[contenteditable="true"],dialog')
      )
        return;
      const k = e.key.toLowerCase();
      // Keep native Space activation on controls while movement shortcuts
      // continue working after a panel restores focus to its trigger.
      if (target?.closest("button,a") && k === " ") return;
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowleft",
          "arrowdown",
          "arrowright",
          " ",
          "e",
          "p",
        ].includes(k)
      ) {
        e.preventDefault();
        if (k === "e" || k === " ") {
          if (!e.repeat) this.interact();
        } else if (k === "p") {
          if (!e.repeat) this.pet();
        } else this.keys.add(k);
      }
    };
    const up = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());
    const reset = () => this.resetInput();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    this.cleanup = () => {
      observer.disconnect();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
    const tick = (now: number) => {
      if (this.disposed) return;
      const dt = Math.min((now - (this.last || now)) / 1000, 0.035);
      this.last = now;
      this.state.time += dt;
      if (!this.paused) {
        const active = (...k: string[]) =>
          k.some(
            (a) => this.keys.has(a) || [...this.touch.values()].includes(a),
          );
        const v = velocity(
          Number(active("d", "arrowright")) - Number(active("a", "arrowleft")),
          Number(active("s", "arrowdown")) - Number(active("w", "arrowup")),
          dt,
        );
        const before = this.state.player;
        const after = move(before, v.x, v.y, this.state.scene);
        this.companion.follow(before, after);
        this.state.player = after;
        this.state.bella = this.companion.position;
        this.state.walking =
          Math.hypot(after.x - before.x, after.y - before.y) > 0.01;
        if (this.state.walking) {
          this.state.sitting = false;
          this.state.direction =
            Math.abs(v.x) > Math.abs(v.y) ? (v.x > 0 ? 1 : 2) : v.y > 0 ? 0 : 3;
        }
        this.state.pet = Math.max(0, this.state.pet - dt);
      } else this.state.walking = false;
      const target = this.cameraTarget();
      const factor = this.state.reduced ? 1 : Math.min(1, dt * 8);
      this.camera.x += (target.x - this.camera.x) * factor;
      this.camera.y += (target.y - this.camera.y) * factor;
      const spot = nearest(this.state.player, this.state.scene);
      if ((spot?.id || "") !== this.prompt) {
        this.prompt = spot?.id || "";
        this.onPrompt(spot);
      }
      // At the bottom camera limit the avatar can walk underneath the HUD.
      // Move the existing instruction to the top before it covers their feet.
      canvas.dataset.promptTop = String(
        this.state.player.y - this.camera.y > this.viewport.y - 52,
      );
      canvas.dataset.scene = this.state.scene;
      canvas.dataset.position = `${this.state.player.x.toFixed(1)},${this.state.player.y.toFixed(1)}`;
      canvas.dataset.bella = `${this.state.bella.x.toFixed(1)},${this.state.bella.y.toFixed(1)}`;
      canvas.dataset.pet = String(this.state.pet > 0);
      canvas.dataset.outfit = this.state.outfit;
      canvas.dataset.paused = String(this.paused);
      render(c, this.state, this.viewport, this.camera);
    };
    const owner = this;
    this.phaser = new Phaser.Game({
      type: Phaser.CANVAS,
      canvas,
      width: this.viewport.x,
      height: this.viewport.y,
      pixelArt: true,
      antialias: false,
      banner: false,
      audio: { noAudio: true },
      scene: {
        create() {
          owner.texture = this.textures.addCanvas("neighborhood", buffer)!;
          owner.sprite = this.add.image(0, 0, "neighborhood").setOrigin(0);
        },
        update(time: number) {
          tick(time);
        },
      },
    });
  }
  cameraTarget() {
    const d = dimensions(this.state.scene);
    return {
      x:
        d.w < this.viewport.x
          ? (d.w - this.viewport.x) / 2
          : Math.max(
              0,
              Math.min(
                d.w - this.viewport.x,
                this.state.player.x - this.viewport.x / 2,
              ),
            ),
      y:
        d.h < this.viewport.y
          ? (d.h - this.viewport.y) / 2
          : Math.max(
              0,
              Math.min(
                d.h - this.viewport.y,
                this.state.player.y - this.viewport.y / 2,
              ),
            ),
    };
  }
  texture?: Phaser.Textures.CanvasTexture;
  sprite?: Phaser.GameObjects.Image;
  phaser?: Phaser.Game;
  cleanup: () => void = () => {};
  resetInput() {
    this.keys.clear();
    this.touch.clear();
  }
  pause(value: boolean) {
    this.paused = value;
    this.resetInput();
    if (!value) this.state.sitting = false;
  }
  interact() {
    if (this.paused) return;
    const s = nearest(this.state.player, this.state.scene);
    if (!s) return;
    if (s.door) this.transition(s.door);
    else if (s.story) {
      this.state.sitting = !!s.sit;
      this.pause(true);
      this.onStory(s.story);
    }
  }
  transition(scene: SceneId) {
    const prev = this.state.scene;
    let p: Point = { x: 260, y: 313 };
    if (scene === "street") {
      const d = destinations.find((d) => d.id === prev);
      p = d ? { x: d.door.x, y: d.door.y + 14 } : { ...start };
    }
    this.state.scene = scene;
    this.state.player = p;
    this.state.bella = { ...p };
    this.companion.resetBeside(p, scene);
    this.state.direction = scene === "street" ? 0 : 3;
    this.state.pet = 0;
    this.camera = this.cameraTarget();
    this.resetInput();
    this.prompt = "";
    this.onPrompt(undefined);
    this.onScene(scene);
  }
  recover() {
    this.state.player =
      this.state.scene === "street" ? { ...start } : { x: 260, y: 313 };
    this.companion.resetBeside(this.state.player, this.state.scene);
    this.state.bella = { ...this.state.player };
    this.camera = this.cameraTarget();
    this.resetInput();
  }
  pet() {
    if (this.paused) return;
    this.state.pet = 1.5;
    this.onPet();
  }
  destroy() {
    this.disposed = true;
    this.phaser?.destroy(false);
    this.cleanup();
  }
}
