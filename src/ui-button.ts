// Helper: reflect attribute <-> property
function reflect<T extends HTMLElement>(el: T, name: string, value: unknown | null) {
  if (value === false || value === null || value === undefined) {
    el.removeAttribute(name);
  } else if (value === true) {
    el.setAttribute(name, "");
  } else {
    el.setAttribute(name, String(value));
  }
}

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type ButtonType = "button" | "submit" | "reset";

export class UIButton extends HTMLElement {
  static formAssociated = true;
  static get observedAttributes() {
    return ["variant", "size", "disabled", "type", "name", "value", "autofocus"];
  }

  private _internals: ElementInternals;
  private _root: ShadowRoot;
  private _btn!: HTMLButtonElement;

  constructor() {
    super();
    this._internals = (this as any).attachInternals();
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `${UIButton.styles}${UIButton.template}`;
    this._btn = this._root.querySelector("button")!;
  }

  // ===== Properties (reflecting) =====
  get variant(): ButtonVariant { return (this.getAttribute("variant") as ButtonVariant) ?? "primary"; }
  set variant(v: ButtonVariant) { reflect(this, "variant", v); }

  get size(): ButtonSize { return (this.getAttribute("size") as ButtonSize) ?? "md"; }
  set size(s: ButtonSize) { reflect(this, "size", s); }

  get disabled(): boolean { return this.hasAttribute("disabled"); }
  set disabled(d: boolean) { reflect(this, "disabled", d); this._syncDisabled(); }

  get type(): ButtonType { return (this.getAttribute("type") as ButtonType) ?? "button"; }
  set type(t: ButtonType) { reflect(this, "type", t); this._syncType(); }

  get name(): string | null { return this.getAttribute("name"); }
  set name(v: string | null) { reflect(this, "name", v); }

  get value(): string | File | FormData | null { return this.getAttribute("value"); }
  set value(v: string | File | FormData | null) {
    if (v instanceof FormData || v instanceof File) {
      // Non-string values cannot be reflected as attribute; keep form value via internals
      this._internals.setFormValue(v);
    } else {
      reflect(this, "value", v);
      if (typeof v === "string") this._internals.setFormValue(v);
    }
  }

  get autofocus(): boolean { return this.hasAttribute("autofocus"); }
  set autofocus(v: boolean) { reflect(this, "autofocus", v); }

  // ===== Lifecycle =====
  connectedCallback() {
    this._upgradeProperty("variant");
    this._upgradeProperty("size");
    this._upgradeProperty("disabled");
    this._upgradeProperty("type");
    this._upgradeProperty("name");
    this._upgradeProperty("value");
    this._upgradeProperty("autofocus");

    this._syncDisabled();
    this._syncType();
    this._syncAria();

    this._btn.addEventListener("click", this._onClick);

    if (this.autofocus) {
      // Defer to next frame so it's focusable after insertion
      requestAnimationFrame(() => this.focus());
    }
  }

  disconnectedCallback() {
    this._btn.removeEventListener("click", this._onClick);
  }

  attributeChangedCallback(name: string) {
    if (name === "disabled") this._syncDisabled();
    if (name === "type") this._syncType();
    if (name === "variant" || name === "size") this._syncAria();
    if (name === "value") {
      const v = this.getAttribute("value");
      if (v != null) this._internals.setFormValue(v);
    }
  }

  // ===== Accessibility =====
  private _syncAria() {
    this._btn.setAttribute("aria-disabled", String(this.disabled));
  }

  // ===== Internals =====
  private _syncDisabled() {
    this._btn.disabled = this.disabled;
    this._btn.tabIndex = this.disabled ? -1 : 0;
  }

  private _syncType() {
    this._btn.type = this.type;
  }

  private _onClick = (ev: MouseEvent) => {
    if (this.disabled) { ev.preventDefault(); ev.stopImmediatePropagation(); return; }
    // Reflect form-associated behavior
    const form = this._internals.form as HTMLFormElement | null;
    if (!form) return;
    if (this.type === "submit") {
      // Include name/value in submission
      const v = this.getAttribute("value");
      this._internals.setFormValue(v ?? "on");
      form.requestSubmit();
    } else if (this.type === "reset") {
      form.reset();
    }
  };

  /** Ensure property set before upgrade still works */
  private _upgradeProperty(prop: string) {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = (this as any)[prop];
      delete (this as any)[prop];
      (this as any)[prop] = value;
    }
  }

  // ===== API =====
  focus(options?: FocusOptions) { this._btn?.focus(options); }
  blur() { this._btn?.blur(); }

  // ===== Template & Styles =====
  static template = /*html*/`
    <button part="button">
      <span part="start" class="affix"><slot name="start"></slot></span>
      <span part="label" class="label"><slot></slot></span>
      <span part="end" class="affix"><slot name="end"></slot></span>
    </button>
  `;

  static styles = /*css*/`
    <style>
      :host { --ui-button-radius: 12px; --ui-button-font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
      :host { display: inline-block; }

      button { 
        font: 500 0.95rem/1 var(--ui-button-font);
        border-radius: var(--ui-button-radius);
        border: 1px solid var(--ui-button-border, transparent);
        padding: var(--pad-y, 0.5rem) var(--pad-x, 0.9rem);
        background: var(--bg, #0a68ff);
        color: var(--fg, #fff);
        display: inline-flex; align-items: center; gap: 0.5rem;
        cursor: pointer; user-select: none;
        box-shadow: var(--shadow, 0 1px 1px rgba(0,0,0,0.05));
        transition: background .15s ease, color .15s ease, box-shadow .15s ease, transform .02s ease;
      }
      button:focus { outline: none; }
      button:focus-visible { box-shadow: 0 0 0 3px color-mix(in oklab, var(--focus, #0a68ff) 25%, white); }
      button:active { transform: translateY(1px); }
      button:disabled, :host([disabled]) button { cursor: not-allowed; opacity: 0.6; }

      /* Sizes */
      :host([size="sm"]) button { --pad-y: 0.35rem; --pad-x: 0.7rem; font-size: 0.875rem; }
      :host([size="md"]) button { --pad-y: 0.5rem; --pad-x: 0.9rem; font-size: 0.95rem; }
      :host([size="lg"]) button { --pad-y: 0.7rem; --pad-x: 1.1rem; font-size: 1.05rem; }

      /* Variants */
      :host([variant="primary"]) button { --bg: var(--ui-primary, #0a68ff); --fg: #fff; --focus: var(--ui-primary, #0a68ff); }
      :host([variant="primary"]) button:hover { background: color-mix(in oklab, var(--ui-primary, #0a68ff) 92%, black); }

      :host([variant="secondary"]) button { --bg: color-mix(in oklab, #0a68ff 8%, white); --fg: #0a2540; --ui-button-border: color-mix(in oklab, #0a68ff 25%, #a6b3c2); --focus: #0a68ff; }
      :host([variant="secondary"]) button:hover { background: color-mix(in oklab, #0a68ff 12%, white); }

      :host([variant="ghost"]) button { --bg: transparent; --fg: #0a2540; --ui-button-border: transparent; }
      :host([variant="ghost"]) button:hover { background: color-mix(in oklab, #0a68ff 10%, transparent); }

      .affix { display: inline-flex; align-items: center; }
      .label { display: inline-flex; align-items: center; min-width: 0; }

      /* Expose stylable parts */
      :host { --_tmp: 0; }
    </style>
  `;
}

// Define the element once
if (!customElements.get("ui-button")) {
  customElements.define("ui-button", UIButton);
}
