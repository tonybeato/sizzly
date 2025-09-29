/**
 * <ui-badge> — Minimal, accessible badge/pill Web Component (TypeScript)
 *
 * Features
 * - Colors: red | green | blue (via `color` attribute)
 * - Variants: solid | soft | outline (optional; default solid)
 * - Sizes: sm | md (optional; default md)
 * - Non-interactive; announced as text by AT (role="status" optional)
 * - Themable via CSS custom properties and ::part selectors
 *
 * Usage
 * ```html
 * <script type="module" src="/ui-badge.js"></script>
 *
 * <ui-badge color="red">Error</ui-badge>
 * <ui-badge color="green" variant="soft">Success</ui-badge>
 * <ui-badge color="blue" variant="outline" size="sm">Info</ui-badge>
 * ```
 */

type BadgeColor = "red" | "green" | "blue";
type BadgeVariant = "solid" | "soft" | "outline";
type BadgeSize = "sm" | "md";

// Helper to reflect prop <-> attribute
function reflect<T extends HTMLElement>(el: T, name: string, value: unknown | null) {
  if (value === false || value === null || value === undefined) {
    el.removeAttribute(name);
  } else if (value === true) {
    el.setAttribute(name, "");
  } else {
    el.setAttribute(name, String(value));
  }
}

export class UIBadge extends HTMLElement {
  static get observedAttributes() { return ["color", "variant", "size"]; }

  private _root: ShadowRoot;

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `${UIBadge.styles}${UIBadge.template}`;
  }

  // Props
  get color(): BadgeColor { return (this.getAttribute("color") as BadgeColor) ?? "blue"; }
  set color(v: BadgeColor) { reflect(this, "color", v); }

  get variant(): BadgeVariant { return (this.getAttribute("variant") as BadgeVariant) ?? "solid"; }
  set variant(v: BadgeVariant) { reflect(this, "variant", v); }

  get size(): BadgeSize { return (this.getAttribute("size") as BadgeSize) ?? "md"; }
  set size(v: BadgeSize) { reflect(this, "size", v); }

  connectedCallback() {
    this.setAttribute("role", this.getAttribute("role") ?? "status");
    this._upgrade("color");
    this._upgrade("variant");
    this._upgrade("size");
  }

  attributeChangedCallback() {
    // All style-driven; no runtime sync needed.
  }

  private _upgrade(prop: string) {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = (this as any)[prop];
      delete (this as any)[prop];
      (this as any)[prop] = value;
    }
  }

  static template = /*html*/`
    <span part="badge"><slot></slot></span>
  `;

  static styles = /*css*/`
    <style>
      :host { --radius: 999px; --fw: 600; --pad-y: 0.125rem; --pad-x: 0.5rem; --fs: 0.75rem; --lh: 1.2; display: inline-block; }
      [part="badge"] { 
        display: inline-flex; align-items: center; gap: 0.35rem; 
        border-radius: var(--radius); font-weight: var(--fw); 
        padding: var(--pad-y) var(--pad-x); font-size: var(--fs); line-height: var(--lh);
        border: 1px solid transparent; user-select: none; white-space: nowrap;
      }

      /* Size variants */
      :host([size="sm"]) { --pad-y: 0.075rem; --pad-x: 0.4rem; --fs: 0.7rem; }
      :host([size="md"]) { --pad-y: 0.125rem; --pad-x: 0.5rem; --fs: 0.75rem; }

      /* Color tokens per color */
      :host([color="red"]) { --c-bg: #f43f5e; --c-bg-soft: color-mix(in oklab, #f43f5e 15%, white); --c-fg: #fff; --c-border: color-mix(in oklab, #f43f5e 50%, white); }
      :host([color="green"]) { --c-bg: #10b981; --c-bg-soft: color-mix(in oklab, #10b981 18%, white); --c-fg: #fff; --c-border: color-mix(in oklab, #10b981 45%, white); }
      :host([color="blue"]) { --c-bg: #3b82f6; --c-bg-soft: color-mix(in oklab, #3b82f6 18%, white); --c-fg: #fff; --c-border: color-mix(in oklab, #3b82f6 45%, white); }

      /* Variants */
      :host([variant="solid"]) [part="badge"] { background: var(--c-bg); color: var(--c-fg); }
      :host([variant="soft"]) [part="badge"] { background: var(--c-bg-soft); color: color-mix(in oklab, black 25%, var(--c-bg)); border-color: transparent; }
      :host([variant="outline"]) [part="badge"] { background: transparent; color: var(--c-bg); border-color: var(--c-border); }

      /* Default color fallback if none provided */
      :host(:not([color])) [part="badge"] { background: var(--c-bg, #3b82f6); color: var(--c-fg, #fff); }

      /* Expose styling hooks */
      :host { --_tmp: 0; }
    </style>
  `;
}

// Define once
if (!customElements.get("ui-badge")) {
  customElements.define("ui-badge", UIBadge);
}
