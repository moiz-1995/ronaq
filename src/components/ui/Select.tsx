"use client";
import { Children, Fragment, isValidElement, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

type Opt = { value: string; label: string; disabled: boolean };
type ChangeEvent = { target: HTMLInputElement; currentTarget: HTMLInputElement };
type Props = {
  children: ReactNode;
  id?: string;
  name?: string;
  className?: string;
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  onChange?: (e: ChangeEvent) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

function collect(children: ReactNode): Opt[] {
  const out: Opt[] = [];
  Children.forEach(children, (c) => {
    if (!isValidElement(c)) return;
    const p = c.props as { children?: ReactNode; value?: string | number; disabled?: boolean };
    if (c.type === Fragment) out.push(...collect(p.children));
    if (c.type !== "option") return;
    const label = Children.toArray(p.children).join("");
    out.push({ value: p.value != null ? String(p.value) : label, label, disabled: !!p.disabled });
  });
  return out;
}

type Pos = { left: number; width: number; maxHeight: number; top?: number; bottom?: number };

function place(btn: HTMLElement, count: number): Pos {
  const r = btn.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  const below = vh - r.bottom - 14, above = r.top - 14;
  const wanted = Math.min(320, count * 44 + 14);
  const down = below >= wanted || below >= above;
  const width = Math.min(Math.max(r.width, 210), vw - 16);
  const left = Math.max(8, Math.min(r.left, vw - width - 8));
  const maxHeight = Math.min(320, down ? below : above);
  return down ? { left, width, maxHeight, top: r.bottom + 6 } : { left, width, maxHeight, bottom: vh - r.top + 6 };
}

/** The site's dropdown. Takes the same props and <option> children as a <select>, but the open list is on brand. */
export function Select({ children, id, name, className = "", value, defaultValue, disabled, onChange, ...aria }: Props) {
  const options = collect(children);
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue != null ? String(defaultValue) : undefined);
  const raw = controlled ? String(value) : inner;
  const current = options.find((o) => o.value === raw) ?? options.find((o) => !o.disabled) ?? options[0];
  const [pos, setPos] = useState<Pos | null>(null);
  const [active, setActive] = useState(0);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const hidden = useRef<HTMLInputElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const count = useRef(0);
  count.current = options.length;
  const listId = useId();
  const open = !!pos;

  const show = () => {
    if (disabled || !btn.current || !options.length) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === current?.value)));
    setPos(place(btn.current, options.length));
  };
  const hide = (refocus = true) => { setPos(null); if (refocus) btn.current?.focus(); };
  const choose = (o: Opt) => {
    if (o.disabled) return;
    const h = hidden.current!;
    h.value = o.value;
    if (!controlled) setInner(o.value);
    onChange?.({ target: h, currentTarget: h });
    // a handler may reset the field, as the "link a vendor" picker does
    if (!controlled && h.value !== o.value) setInner(h.value);
    hide();
  };
  const step = (from: number, dir: 1 | -1) => {
    for (let i = from + dir; i >= 0 && i < options.length; i += dir) if (!options[i].disabled) return i;
    return from;
  };

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const away = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!list.current?.contains(t) && !btn.current?.contains(t)) setPos(null);
    };
    // follows its button while the page moves (phones shift it as the address bar hides); closes once it's out of view
    const follow = () => {
      if (!btn.current) return;
      const r = btn.current.getBoundingClientRect();
      setPos(r.bottom < 0 || r.top > window.innerHeight ? null : place(btn.current, count.current));
    };
    const scrolled = (e: Event) => { if (!list.current?.contains(e.target as Node)) follow(); };
    document.addEventListener("pointerdown", away);
    window.addEventListener("scroll", scrolled, true);
    window.addEventListener("resize", follow);
    return () => {
      document.removeEventListener("pointerdown", away);
      window.removeEventListener("scroll", scrolled, true);
      window.removeEventListener("resize", follow);
    };
  }, [open]);

  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onListKey = (e: React.KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => step(a, 1)),
      ArrowUp: () => setActive((a) => step(a, -1)),
      Home: () => setActive(step(-1, 1)),
      End: () => setActive(step(options.length, -1)),
      Enter: () => choose(options[active]),
      " ": () => choose(options[active]),
      Escape: () => hide(),
    };
    if (e.key === "Tab") { hide(false); return; }
    if (keys[e.key]) {
      e.preventDefault();
      e.stopPropagation();
      keys[e.key]();
      return;
    }
    if (e.key.length === 1) {
      const t = typed.current, now = Date.now();
      t.text = (now - t.at > 700 ? "" : t.text) + e.key.toLowerCase();
      t.at = now;
      const hit = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(t.text));
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <>
      <button
        ref={btn}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={aria["aria-label"]}
        aria-labelledby={aria["aria-labelledby"]}
        disabled={disabled}
        onClick={() => (open ? hide() : show())}
        onKeyDown={(e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); show(); } }}
        className={`brand-select ${className}`}
        data-open={open || undefined}
      >
        <span className="min-w-0 truncate">{current?.label}</span>
        <ChevronDown size={18} strokeWidth={3} className={`flex-none transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <input ref={hidden} type="hidden" name={name} value={current?.value ?? ""} disabled={disabled} readOnly />
      {pos && createPortal(
        <ul
          ref={list}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={onListKey}
          style={pos}
          className="select-in fixed z-[70] overflow-y-auto rounded-2xl border-[3px] border-ink bg-white p-1.5 text-ink shadow-[5px_5px_0_var(--color-red)] outline-none"
        >
          {options.map((o, i) => {
            const selected = o.value === current?.value;
            return (
              <li
                key={`${o.value}-${i}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                aria-disabled={o.disabled || undefined}
                onPointerEnter={() => { if (!o.disabled) setActive(i); }}
                onClick={() => choose(o)}
                className={`flex min-h-10 items-center justify-between gap-3 rounded-xl px-3 py-2 text-[15px] font-semibold leading-tight ${o.disabled ? "cursor-not-allowed text-mute/60" : "cursor-pointer"} ${selected ? "bg-ink text-sand" : i === active && !o.disabled ? "bg-sun" : ""}`}
              >
                <span className="min-w-0">{o.label}</span>
                {selected && <Check size={16} strokeWidth={3} className="flex-none" aria-hidden />}
              </li>
            );
          })}
        </ul>,
        document.body,
      )}
    </>
  );
}
