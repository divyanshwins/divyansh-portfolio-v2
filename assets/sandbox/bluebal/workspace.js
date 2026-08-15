/* BB artists — Storybook workspace editor */
(function () {
  const DS = window.ShadcnUiDesignSystem_6211ba;
  const { Button } = DS;
  const LIcon = window.Icon;
  const h = React.createElement;
  const { useState, useRef, useEffect } = React;

  // ---- option lists (mirrors New Project setup) ----
  const PAGE_SIZES = ["A3", "A4", "A5", "Letter", "Square"];
  const STYLES = ["Storybook Illustration", "Watercolor", "Flat Vector", "Digital Painting", "Line Art", "3D Render"];
  const LENGTHS = ["16 pages", "24 pages", "32 pages", "48 pages", "64 pages"];
  const FONTS = ["Geist", "Geist Mono", "Lora", "Inter", "Merriweather", "Playfair Display"];
  const ROLES = ["Heading", "Subheading", "Body Text", "Caption", "Quote"];
  const TEAM_CANDIDATES = [
    { name: "Ava Mitchell", role: "Illustrator" },
    { name: "Leo Park", role: "Art Director" },
    { name: "Maya Rodriguez", role: "Writer" },
    { name: "Noah Bennett", role: "Editor" },
    { name: "Sara Lindqvist", role: "Designer" },
    { name: "Tom Okafor", role: "Animator" },
    { name: "Priya Nair", role: "Colorist" },
    { name: "Diego Alvarez", role: "Letterer" }
  ];
  const TEAM_COLORS = ["#6366f1", "#0e7490", "#b45309", "#be185d", "#15803d", "#7c3aed", "#0891b2", "#c2410c"];
  const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const FONT_STACKS = {
    "Geist": "'Geist', system-ui, sans-serif",
    "Geist Mono": "'Geist Mono', ui-monospace, monospace",
    "Inter": "'Inter', system-ui, sans-serif",
    "Lora": "'Lora', Georgia, serif",
    "Merriweather": "'Merriweather', Georgia, serif",
    "Playfair Display": "'Playfair Display', Georgia, serif"
  };

  // ---- tiny inline-svg helper ----
  function Svg(inner, size) {
    return h("svg", { width: size || 16, height: size || 16, viewBox: "0 0 24 24", fill: "none",
      stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
      dangerouslySetInnerHTML: { __html: inner } });
  }
  const PATHS = {
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    front: '<path d="M12 10V3"/><path d="m8 6 4-4 4 4"/><path d="M4 21h16"/>',
    back: '<path d="M12 14v7"/><path d="m8 11 4 4 4-4"/><path d="M4 3h16"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    swap: '<path d="M21 7 17 3v3h-8"/><path d="M3 7h8"/><path d="m3 17 4 4v-3h8"/><path d="M21 17h-8"/>',
    upload: '<path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6 6 2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>',
    send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>',
    move: '<path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l-3 3-3-3"/><path d="M19 9l3 3-3 3"/><path d="M2 12h20"/><path d="M12 2v20"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H8"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0-5 5v0a5 5 0 0 0 5 5h7"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.5-3.5a2 2 0 0 0-2.8 0L6 21"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>'
  };

  function chip(kind) {
    const base = { className: "ctx-chip" };
    if (kind === "replace") return h("span", { ...base, style: { background: "linear-gradient(135deg,#f59e0b,#ef4444)" } }, Svg(PATHS.swap, 14));
    if (kind === "upload") return h("span", { ...base, style: { background: "linear-gradient(135deg,#8b5cf6,#6366f1)" } }, Svg(PATHS.upload, 14));
    if (kind === "color") return h("span", { ...base, style: { background: "conic-gradient(from 0deg,#ef4444,#f59e0b,#22c55e,#3b82f6,#a855f7,#ef4444)" } });
    if (kind === "metallic") return h("span", { ...base, style: { background: "linear-gradient(135deg,#f5f5f5,#9aa0a6 45%,#e8eaed 60%,#6b7177)" } });
    if (kind === "glass") return h("span", { ...base, style: { background: "rgba(96,165,250,0.35)", border: "1px solid rgba(255,255,255,0.6)" } });
    if (kind === "emboss") return h("span", { ...base, style: { background: "radial-gradient(circle at 35% 30%,#fde68a,#d97706)" } });
    if (kind === "transparent") return h("span", { ...base, style: { background: "repeating-conic-gradient(#cbd5e1 0% 25%, #fff 0% 50%) 50% / 11px 11px" } });
    return h("span", base);
  }

  const CHARACTERS = [
    { id: "ram", name: "Ram", role: "Protagonist", color: "#6366f1" },
    { id: "shyam", name: "Shyam", role: "Companion", color: "#0e7490" },
    { id: "gita", name: "Gita", role: "Mentor", color: "#b45309" },
    { id: "sita", name: "Sita", role: "Narrator", color: "#be185d" }
  ];

  let UID = 1;
  const uid = () => "el" + (UID++);
  const newTag = (k) => k + "#" + (40 + Math.floor(Math.random() * 60));
  function el(kind, label, x, y, w, extra) {
    return Object.assign({ id: uid(), kind, label, x, y, w, h: null, opacity: 100, rotation: 0,
      color: null, effect: "none", z: 1, tag: newTag(kind) }, extra || {});
  }
  const HERO_GRADS = [
    "linear-gradient(165deg,#7c3aed,#9f1239 70%,#3a1420)",
    "linear-gradient(165deg,#1d4ed8,#0891b2 60%,#fbbf24)",
    "linear-gradient(165deg,#065f46,#14532d 70%,#052015)",
    "linear-gradient(165deg,#1e1b4b,#312e81 70%,#0a0f24)"
  ];
  const INNER_CONTENT = [
    { hd: "Chapter One", img: 1, tx: "Ram lit the old brass lantern and watched the shadows wake along the garden wall. Somewhere beyond the hedges, Shyam was already calling his name." },
    { hd: "The Quiet Road", img: 2, tx: "They walked until the village lights were small. Gita had told them the road remembered every traveller, and tonight it seemed to listen closely." },
    { hd: "By the River", img: 3, tx: "Sita knelt at the water and let the lantern drift. It floated like a small warm moon, carrying their wishes downstream into the dark." },
    { hd: "Homeward", img: 0, tx: "Morning found them tired and laughing. The lantern, now cool, swung between them as the first birds practised their early, careless songs." },
    { hd: "The Hidden Gate", img: 2, tx: "Behind the willow stood a gate no one remembered building. Ram pressed his palm to the cold iron and felt it hum like a sleeping bell." },
    { hd: "First Light", img: 1, tx: "They climbed until the valley opened beneath them. The lantern was hardly needed now; the whole sky had turned the colour of warm honey." }
  ];

  // page bg defaults
  const COVER_BG = "radial-gradient(120% 100% at 50% 0%, #6e211c 0%, #4a1512 60%, #2c0c0a 100%)";
  function coverBgFor(palette) {
    if (!palette || !palette.length) return COVER_BG;
    const c0 = palette[0];
    return "radial-gradient(120% 100% at 50% 0%, color-mix(in oklab, " + c0 + " 78%, white) 0%, " + c0 + " 55%, color-mix(in oklab, " + c0 + " 42%, black) 100%)";
  }

  function innerCountFor(settings) {
    const n = parseInt(String((settings && settings.length) || "32").replace(/[^0-9]/g, ""), 10) || 32;
    return Math.max(2, Math.min(6, Math.round(n / 8)));
  }

  function buildPages(settings) {
    settings = settings || {};
    const palette = settings.palette || [];
    const pageNums = settings.pageNums !== false;
    const accent = palette[1] || "#d4a83a";
    const pages = [];
    pages.push({ id: "pg0", name: "Cover", bg: coverBgFor(palette),
      els: [
        el("frame", "Border", 4, 3, 92, { h: 94, z: 0, color: "color-mix(in oklab, " + accent + " 80%, transparent)" }),
        el("emblem", "Logo", 39, 8, 22, { z: 3 }),
        el("title", "Title", 8, 30, 84, { text: "The Lantern Boy", color: "#f4e3b8", z: 3 }),
        el("subtitle", "Subtitle", 8, 45, 84, { text: "A bedtime story", color: "#d9b27a", z: 3 }),
        el("image", "Illustration", 16, 53, 68, { h: 32, grad: HERO_GRADS[0], z: 2 }),
        el("subtitle", "Author", 8, 90, 84, { text: "Made with BB artists", color: "#c79a63", size: 13, z: 3 })
      ] });
    const inner = INNER_CONTENT.slice(0, innerCountFor(settings));
    inner.forEach(function (p, i) {
      const els = [
        el("heading", "Heading", 10, 10, 80, { text: p.hd, color: "#5b3a1e", z: 2 }),
        el("image", "Illustration", 13, 19, 74, { h: 38, grad: HERO_GRADS[p.img], z: 1 }),
        el("paragraph", "Body text", 12, 62, 76, { text: p.tx, color: "#4b3a2a", z: 2 })
      ];
      if (pageNums) els.unshift(el("pageno", "Page number", 8, 6, 18, { text: String(i + 1).padStart(2, "0"), color: "#9a7b52", z: 2 }));
      pages.push({ id: "pg" + (i + 1), name: "Page " + (i + 1), bg: "#f6efe1", els: els });
    });
    return pages;
  }

  function styleFor(el) {
    const s = { left: el.x + "%", top: el.y + "%", width: el.w + "%",
      opacity: (el.effect === "transparent" ? Math.min(el.opacity, 35) : el.opacity) / 100,
      transform: "rotate(" + (el.rotation || 0) + "deg)", zIndex: el.z || 1 };
    if (el.h != null) s.height = el.h + "%";
    return s;
  }
  function renderEl(el, ctx) {
    const base = styleFor(el);
    const font = (ctx && ctx.font) || null;
    if (el.kind === "frame") {
      return h("div", { style: Object.assign({}, base, { border: "2px solid " + (el.color || "rgba(212,168,90,0.7)"),
        borderRadius: "4px", boxShadow: "inset 0 0 0 4px rgba(212,168,90,0.18)" }) });
    }
    if (el.kind === "emblem") {
      let bg = el.color || "radial-gradient(circle at 35% 28%, #f7e3a1, #d4a83a 55%, #8a6516)";
      const st = Object.assign({}, base, { aspectRatio: "1 / 1", borderRadius: "50%", display: "grid",
        placeItems: "center", color: "#5b3a10", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" });
      if (el.effect === "metallic") bg = "linear-gradient(135deg,#f5f5f5,#9aa0a6 42%,#e8eaed 60%,#6b7177)";
      if (el.effect === "glass") { bg = "rgba(255,255,255,0.16)"; st.backdropFilter = "blur(4px)"; st.border = "1px solid rgba(255,255,255,0.6)"; st.color = "rgba(255,255,255,0.85)"; }
      if (el.effect === "emboss") st.boxShadow = "inset 0 2px 4px rgba(255,255,255,.6), inset 0 -3px 6px rgba(0,0,0,.35), 0 3px 8px rgba(0,0,0,.3)";
      st.background = bg;
      return h("div", { style: st }, el.src ? h("img", { src: el.src, style: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" } }) : Svg(PATHS.sparkle, 24));
    }
    if (el.kind === "image") {
      const st = Object.assign({}, base, { borderRadius: "5px", overflow: "hidden",
        background: el.grad || "linear-gradient(160deg,#94a3b8,#475569)", boxShadow: "0 6px 16px rgba(0,0,0,0.18)" });
      if (el.effect === "glass") { st.filter = "saturate(0.7) brightness(1.1)"; st.opacity = (el.opacity / 100) * 0.8; }
      if (el.effect === "metallic") st.filter = "grayscale(0.5) contrast(1.1)";
      if (el.effect === "emboss") st.boxShadow = "0 6px 16px rgba(0,0,0,0.18), inset 0 2px 6px rgba(255,255,255,.3), inset 0 -4px 10px rgba(0,0,0,.3)";
      return h("div", { style: st }, el.src ? h("img", { src: el.src, style: { width: "100%", height: "100%", objectFit: "cover" } }) : null);
    }
    const map = {
      title: { fs: 38, fw: 700, ff: "Georgia, 'Times New Roman', serif", ls: "-0.01em", lh: 1.05, ta: "center" },
      subtitle: { fs: el.size || 17, fw: 400, ff: "Georgia, serif", ls: "0.04em", lh: 1.3, ta: "center", italic: true },
      heading: { fs: 22, fw: 700, ff: "Georgia, serif", ls: "-0.01em", lh: 1.1, ta: "left" },
      paragraph: { fs: 13.5, fw: 400, ff: "Georgia, serif", ls: "0", lh: 1.7, ta: "left" },
      pageno: { fs: 13, fw: 600, ff: "Georgia, serif", ls: "0.12em", lh: 1, ta: "left" }
    };
    const m = map[el.kind] || map.paragraph;
    const st = Object.assign({}, base, { fontFamily: font || m.ff, fontSize: m.fs + "px", fontWeight: m.fw,
      letterSpacing: m.ls, lineHeight: m.lh, textAlign: m.ta, color: el.color || "#333",
      fontStyle: m.italic ? "italic" : "normal", textWrap: "pretty" });
    if (el.effect === "emboss") st.textShadow = "0 1px 0 rgba(255,255,255,.55), 0 -1px 1px rgba(0,0,0,.4)";
    if (el.effect === "metallic") { st.backgroundImage = "linear-gradient(135deg,#fff7df,#c9a24a 45%,#fff1c2 60%,#8a6516)"; st.WebkitBackgroundClip = "text"; st.backgroundClip = "text"; st.WebkitTextFillColor = "transparent"; st.color = "transparent"; }
    if (el.effect === "glass") st.color = "rgba(120,120,120,0.55)";
    return h("div", { style: st }, el.text || "");
  }

  function rowsFor(kind) {
    const noun = kind === "emblem" ? "logo" : "image";
    if (kind === "emblem" || kind === "image") return [
      { id: "replace", label: "Replace " + noun, chip: "replace", act: "replace" },
      { id: "upload", label: "Upload " + noun, chip: "upload", act: "upload" },
      { id: "color", label: "Change color", chip: "color", act: "color" },
      { id: "metallic", label: "Metallic", chip: "metallic", act: "effect", eff: "metallic" },
      { id: "glass", label: "Glass", chip: "glass", act: "effect", eff: "glass" },
      { id: "emboss", label: "Emboss", chip: "emboss", act: "effect", eff: "emboss" },
      { id: "transparent", label: "Transparent", chip: "transparent", act: "effect", eff: "transparent" }
    ];
    return [
      { id: "color", label: "Change color", chip: "color", act: "color" },
      { id: "emboss", label: "Emboss", chip: "emboss", act: "effect", eff: "emboss" },
      { id: "metallic", label: "Gold foil", chip: "metallic", act: "effect", eff: "metallic" },
      { id: "transparent", label: "Transparent", chip: "transparent", act: "effect", eff: "transparent" }
    ];
  }
  const MULTI_ROWS = [
    { id: "color", label: "Change color", chip: "color", act: "color" },
    { id: "metallic", label: "Metallic", chip: "metallic", act: "effect", eff: "metallic" },
    { id: "glass", label: "Glass", chip: "glass", act: "effect", eff: "glass" },
    { id: "emboss", label: "Emboss", chip: "emboss", act: "effect", eff: "emboss" },
    { id: "transparent", label: "Transparent", chip: "transparent", act: "effect", eff: "transparent" }
  ];

  function PropsDock(props) {
    const { els, onAction, onPatch, onClose } = props;
    const primary = els[0];
    const multi = els.length > 1;
    const rows = multi ? MULTI_ROWS : rowsFor(primary.kind);
    const item = (r) => h("button", { key: r.id, className: "ctx-item", onClick: () => onAction(r) },
      chip(r.chip), h("span", null, r.label),
      r.act === "effect" && primary.effect === r.eff ? h("span", { style: { marginLeft: "auto", opacity: 0.7 } }, h(LIcon, { name: "check", size: 14 })) : null
    );
    const action = (id, label, path, danger) => h("button", { key: id, className: "ctx-item" + (danger ? " danger" : ""), onClick: () => onAction({ act: id }) },
      h("span", { className: "ctx-ic" }, Svg(path, 16)), h("span", null, label));
    return h("div", { className: "rdock props-dock", style: { right: props.rightOffset || 0 }, onMouseDown: (e) => e.stopPropagation() },
      h("div", { className: "ctx-head" },
        h("div", null,
          h("span", { className: "lbl" }, multi ? els.length + " elements" : primary.label),
          multi ? null : h("span", { className: "tag", style: { marginLeft: 8 } }, primary.tag)
        ),
        h("button", { className: "ctx-close", title: "Close", onClick: onClose }, Svg(PATHS.x, 14))
      ),
      multi ? h("div", { style: { fontSize: 12, color: "rgba(243,236,230,0.55)", padding: "0 8px 8px" } }, "Changes apply to all selected") : null,
      rows.map(item),
      h("div", { className: "ctx-sep" }),
      h("div", { className: "ctx-slider" },
        h("div", { className: "row" }, h("span", { className: "nm" }, "Opacity"), h("span", { className: "vl" }, primary.opacity + "%")),
        h("input", { type: "range", min: 0, max: 100, value: primary.opacity, onChange: (e) => onPatch({ opacity: +e.target.value }) })
      ),
      h("div", { className: "ctx-slider" },
        h("div", { className: "row" }, h("span", { className: "nm" }, "Rotation"), h("span", { className: "vl" }, (primary.rotation || 0) + "°")),
        h("input", { type: "range", min: -180, max: 180, value: primary.rotation || 0, onChange: (e) => onPatch({ rotation: +e.target.value }) })
      ),
      h("div", { className: "ctx-sep" }),
      action("dup", "Duplicate", PATHS.copy),
      action("front", "Bring to front", PATHS.front),
      action("back", "Send to back", PATHS.back),
      action("del", multi ? "Delete all" : "Delete", PATHS.trash, true)
    );
  }

  function Thumb(page, ctx) {
    const dims = (ctx && ctx.dims) || { w: 470, h: 630 };
    const maxW = 232, maxH = 150;
    const scale = Math.min(maxW / dims.w, maxH / dims.h);
    return h("div", { style: { width: dims.w * scale, height: dims.h * scale, position: "relative" } },
      h("div", { style: { width: dims.w, height: dims.h, transform: "scale(" + scale + ")", transformOrigin: "top left",
          position: "absolute", borderRadius: 6, overflow: "hidden", background: page.bg, pointerEvents: "none" } },
        page.els.map((e) => h("div", { key: e.id, className: "el", style: { pointerEvents: "none" } }, renderEl(e, ctx)))
      )
    );
  }

  function parseJSON(text) {
    if (!text) return null;
    try { return JSON.parse(text); } catch (e) {}
    const a = text.indexOf("{"), b = text.lastIndexOf("}");
    if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch (e) {} }
    return null;
  }

  function pageDims(settings) {
    const sz = (settings && settings.size) || "A4";
    const land = /horizon/i.test((settings && settings.orientation) || "");
    if (/square/i.test(sz)) return { w: 560, h: 560 };
    let w = 470, h = 630;
    if (/a5/i.test(sz)) { w = 458; h = 648; }
    else if (/a3/i.test(sz)) { w = 478; h = 620; }
    else if (/letter/i.test(sz)) { w = 486; h = 628; }
    return land ? { w: h, h: w } : { w: w, h: h };
  }
  function bodyFont(settings) {
    const fonts = (settings && settings.fonts) || [];
    const body = fonts.find((f) => /body/i.test(f.role));
    const fam = (body && body.family) || (fonts[0] && fonts[0].family);
    return FONT_STACKS[fam] || "Georgia, 'Times New Roman', serif";
  }

  // ---- default settings (loaded from draft) ----
  function loadSettings() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem("bb_draft") || "{}"); } catch (e) {}
    let title = "The Lantern Boy";
    try {
      const cur = localStorage.getItem("bb_current");
      const list = JSON.parse(localStorage.getItem("bb_projects") || "[]");
      const found = list.find((p) => p.id === cur);
      if (found) title = found.title;
    } catch (e) {}
    return {
      name: d.name || title,
      manuscript: d.manuscript || "lantern-boy.docx",
      style: d.style || STYLES[0],
      length: d.length || "32 pages",
      size: d.size || "A4",
      orientation: d.orientation || "Vertical",
      pageNums: d.pageNums !== false,
      fonts: (d.fonts && d.fonts.length) ? d.fonts : [
        { family: "Geist", role: "Heading", size: 32 },
        { family: "Lora", role: "Subheading", size: 20 },
        { family: "Lora", role: "Body Text", size: 14 }
      ],
      palette: (d.palette && d.palette.length) ? d.palette : ["#4a1512", "#d4a83a", "#7C2D12", "#F3E5C8"],
      aesthetic: d.aesthetic || "",
      team: d.team || []
    };
  }

  // Collaboration / access metadata — these fields do NOT affect page design,
  // so changing them must never mark the book as out-of-date or trigger a
  // regeneration. Assigning or changing a teammate's access is one of these.
  const NON_DESIGN_KEYS = ["team"];
  function designOnly(s) {
    const c = Object.assign({}, s);
    NON_DESIGN_KEYS.forEach((k) => delete c[k]);
    return c;
  }

  // small control primitives for the settings panel
  function field(label, control) {
    return h("div", { className: "setrow" }, h("div", { className: "k" }, label), control);
  }
  function selectCtl(value, opts, onChange) {
    return h("select", { className: "set-select", value: value, onChange: (e) => onChange(e.target.value) },
      opts.map((o) => h("option", { key: o, value: o }, o)));
  }
  function seg(value, opts, onChange) {
    return h("div", { className: "set-seg" }, opts.map((o) =>
      h("button", { key: o, "data-active": value === o, onClick: () => onChange(o) }, o)));
  }

  function SettingsPanel(props) {
    const { pending, setP, title, team, setTeam } = props;
    const [teamPicker, setTeamPicker] = useState(false);
    const manRef = useRef(null);
    const set = (k, v) => setP((s) => Object.assign({}, s, { [k]: v }));
    const setFont = (i, key, val) => setP((s) => Object.assign({}, s, { fonts: s.fonts.map((f, j) => j === i ? Object.assign({}, f, { [key]: val }) : f) }));
    const addFont = () => setP((s) => Object.assign({}, s, { fonts: s.fonts.concat([{ family: "Geist", role: "Caption", size: 12 }]) }));
    const removeFont = (i) => setP((s) => Object.assign({}, s, { fonts: s.fonts.filter((_, j) => j !== i) }));
    const setSwatch = (i, v) => setP((s) => Object.assign({}, s, { palette: s.palette.map((c, j) => j === i ? v.toUpperCase() : c) }));
    const addSwatch = () => setP((s) => Object.assign({}, s, { palette: s.palette.concat(["#888888"]) }));
    const removeSwatch = (i) => setP((s) => Object.assign({}, s, { palette: s.palette.filter((_, j) => j !== i) }));
    const addTeam = (n) => { setTeam((t) => t.concat([n])); setTeamPicker(false); };
    const removeTeam = (n) => setTeam((t) => t.filter((x) => x !== n));

    const avail = TEAM_CANDIDATES.filter((c) => !team.includes(c.name));

    return h("div", { className: "panel-body" },
      field("Project name", h("input", { className: "set-input", value: pending.name, onChange: (e) => set("name", e.target.value) })),
      field("Manuscript",
        h("div", { className: "set-file" },
          h("span", { className: "fn" }, pending.manuscript || "Not uploaded"),
          h("button", { className: "set-link", onClick: () => manRef.current.click() }, "Replace"),
          h("input", { type: "file", ref: manRef, accept: ".pdf,.docx,.txt", style: { display: "none" },
            onChange: (e) => { const f = e.target.files[0]; if (f) set("manuscript", f.name); e.target.value = ""; } })
        )),
      field("Illustration style", selectCtl(pending.style, STYLES, (v) => set("style", v))),
      field("Book length", selectCtl(pending.length, LENGTHS, (v) => set("length", v))),
      field("Page size", selectCtl(pending.size, PAGE_SIZES, (v) => set("size", v))),
      field("Orientation", seg(pending.orientation, ["Vertical", "Horizontal"], (v) => set("orientation", v))),
      h("div", { className: "setrow setrow-flat" },
        h("div", { className: "k", style: { margin: 0 } }, "Page numbers"),
        h("button", { className: "set-switch", "data-on": pending.pageNums !== false,
          onClick: () => set("pageNums", !(pending.pageNums !== false)) }, h("span", { className: "knob" }))),
      h("div", { className: "setrow" },
        h("div", { className: "k" }, "Typography"),
        h("div", { className: "set-fonts" }, pending.fonts.map((f, i) =>
          h("div", { className: "set-font-edit", key: i },
            selectCtl(f.family, FONTS, (v) => setFont(i, "family", v)),
            selectCtl(f.role, ROLES, (v) => setFont(i, "role", v)),
            h("input", { className: "set-num", type: "number", min: 8, max: 96, value: f.size, onChange: (e) => setFont(i, "size", +e.target.value || f.size) }),
            h("button", { className: "set-x", title: "Remove", onClick: () => removeFont(i), disabled: pending.fonts.length <= 1 }, Svg(PATHS.x, 12))))),
        h("button", { className: "set-add", onClick: addFont }, Svg(PATHS.plus, 13), "Add font")),
      h("div", { className: "setrow" },
        h("div", { className: "k" }, "Color palette"),
        h("div", { className: "set-swatches" }, pending.palette.map((c, i) =>
          h("label", { className: "set-sw-edit", key: i, style: { background: c }, title: c },
            h("input", { type: "color", value: c, onChange: (e) => setSwatch(i, e.target.value) }),
            h("button", { className: "sw-x", title: "Remove", onClick: (ev) => { ev.preventDefault(); removeSwatch(i); } }, Svg(PATHS.x, 10)))),
          h("button", { className: "set-sw-add", title: "Add color", onClick: addSwatch }, Svg(PATHS.plus, 14)))),
      field("Desired aesthetic", h("textarea", { className: "set-textarea", rows: 3, value: pending.aesthetic,
        placeholder: "Describe the mood, palette and feel…", onChange: (e) => set("aesthetic", e.target.value) })),
      h("div", { className: "setrow" },
        h("div", { className: "k" }, "Teammates"),
        team.length ? h("div", { className: "set-team" }, team.map((n, i) =>
          h("div", { className: "set-ava-row", key: n },
            h("div", { className: "set-ava", style: { background: TEAM_COLORS[i % TEAM_COLORS.length] } }, initials(n)),
            h("span", { className: "tn" }, n),
            h("button", { className: "set-x", title: "Remove", onClick: () => removeTeam(n) }, Svg(PATHS.x, 12)))))
          : h("div", { className: "set-empty" }, "No teammates yet"),
        h("button", { className: "set-add", onClick: () => setTeamPicker((v) => !v), disabled: !avail.length },
          Svg(PATHS.plus, 13), avail.length ? "Add teammate" : "All added"),
        teamPicker ? h("div", { className: "team-pop" }, avail.map((c) =>
          h("button", { key: c.name, className: "team-pop-row", onClick: () => addTeam(c.name) },
            h("div", { className: "set-ava sm", style: { background: TEAM_COLORS[(team.length) % TEAM_COLORS.length] } }, initials(c.name)),
            h("div", null, h("div", { className: "tn" }, c.name), h("div", { className: "tr" }, c.role)),
            h("span", { className: "ctx-ic", style: { marginLeft: "auto" } }, Svg(PATHS.plus, 14))))) : null)
    );
  }

  function Workspace() {
    // ---- history-backed document state: { pages, settings } ----
    const initSettings = React.useMemo(loadSettings, []);
    const [hist, setHist] = useState(() => ({ stack: [{ pages: buildPages(initSettings), settings: initSettings }], idx: 0 }));
    const doc = hist.stack[hist.idx];
    const pages = doc.pages;
    const settings = doc.settings;
    const canUndo = hist.idx > 0;
    const canRedo = hist.idx < hist.stack.length - 1;

    const [current, setCurrent] = useState(0);
    const [rail, setRail] = useState("pages");
    const [panelOpen, setPanelOpen] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [selIds, setSelIds] = useState([]);
    const [marquee, setMarquee] = useState(null);
    const [aiOpen, setAiOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [aiWidth, setAiWidth] = useState(430);
    const [chats, setChats] = useState({});
    const [chatInput, setChatInput] = useState("");
    const [chatBusy, setChatBusy] = useState(false);
    const [chatImage, setChatImage] = useState(null);

    // settings editing buffer (not applied until "Regenerate all")
    const [pending, setPending] = useState(settings);
    const [regenerating, setRegenerating] = useState(false);
    // Teammate access is collaboration metadata, kept OUT of the page-design
    // history so assigning/changing access never marks pages dirty or regenerates.
    const [team, setTeam] = useState(() => initSettings.team || []);
    // Compare only design-relevant fields — teammate access changes are applied
    // live and never require regenerating the pages.
    const settingsDirty = JSON.stringify(designOnly(pending)) !== JSON.stringify(designOnly(settings));

    // ---- character designs (shared with Characters / Design-with-AI pages) ----
    const [charData, setCharData] = useState(BBWS.loadCharData);
    // applied snapshot persists across the Design-with-AI round trip / refresh
    const REGEN_FLAG = "bb_ws_regen";
    const [charsApplied, setCharsApplied] = useState(() => {
      let flag = false, applied = null;
      try { flag = localStorage.getItem(REGEN_FLAG) === "1"; applied = localStorage.getItem(BBWS.APPLIED); } catch (e) {}
      const cur = JSON.stringify(BBWS.loadCharData());
      if (flag && applied != null) return applied;   // a change is pending → keep the stale baseline so it reads as dirty
      try { localStorage.setItem(BBWS.APPLIED, cur); } catch (e) {}
      return cur;
    });
    const charsDirty = JSON.stringify(charData) !== charsApplied;
    const dirty = settingsDirty || charsDirty;
    const charUploadTarget = useRef(null);
    const totalPages = BBWS.totalBookPages(settings);

    function writeChars(next) {
      setCharData(next); BBWS.saveCharData(next);
      try { localStorage.setItem(REGEN_FLAG, "1"); } catch (e) {}
    }
    function setCharSource(charId, variantId, source) {
      writeChars(Object.assign({}, charData, { [charId]: (function () {
        const c = Object.assign({ mode: "constant", design: null, variants: [] }, charData[charId]);
        if (variantId) c.variants = (c.variants || []).map((v) => v.id === variantId ? Object.assign({}, v, { source }) : v);
        else c.design = source;
        return c;
      })() }));
    }
    function setCharRanges(charId, variantId, ranges) {
      writeChars(Object.assign({}, charData, { [charId]: (function () {
        const c = Object.assign({ mode: "variants", design: null, variants: [] }, charData[charId]);
        c.variants = (c.variants || []).map((v) => v.id === variantId ? Object.assign({}, v, { ranges }) : v);
        return c;
      })() }));
    }
    function onCharUpload(charId, variantId) { charUploadTarget.current = { charId, variantId }; charFileRef.current.click(); }
    function onCharUploadFile(e) {
      const f = e.target.files[0]; const t = charUploadTarget.current; if (!f || !t) return;
      const reader = new FileReader();
      reader.onload = () => setCharSource(t.charId, t.variantId, { type: "upload", name: f.name, preview: reader.result });
      reader.readAsDataURL(f);
      e.target.value = "";
    }
    function onCharAI(charId, variantId) {
      BBWS.saveCharData(charData);
      try { localStorage.setItem(REGEN_FLAG, "1"); } catch (e) {}
      const p = new URLSearchParams({ char: charId, return: "workspace" });
      if (variantId) p.set("variant", variantId);
      location.href = "Design with AI.html?" + p.toString();
    }

    const colorRef = useRef(null);
    const fileRef = useRef(null);
    const charFileRef = useRef(null);
    const chatFileRef = useRef(null);
    const pendingRef = useRef(null);
    const pageRef = useRef(null);
    const dragRef = useRef(null);
    const resizeRef = useRef(null);
    const selRef = useRef([]); selRef.current = selIds;
    const curRef = useRef(0); curRef.current = current;
    const chatBodyRef = useRef(null);

    const title = settings.name;
    const dims = pageDims(settings);
    const renderCtx = { font: bodyFont(settings), dims: dims };
    const page = pages[current];
    const selEls = page.els.filter((e) => selIds.includes(e.id));

    // keep pending in sync when applied settings change (undo/redo/regenerate)
    useEffect(() => { setPending(settings); }, [settings]);
    // clamp current page when page count changes
    useEffect(() => { if (current > pages.length - 1) setCurrent(pages.length - 1); }, [pages.length]);

    // ---- history ops ----
    function commitDoc(producer) {
      setHist((H) => {
        const cur = H.stack[H.idx];
        const next = producer(cur);
        if (!next || next === cur) return H;
        let stack = H.stack.slice(0, H.idx + 1);
        stack.push(next);
        if (stack.length > 80) stack = stack.slice(stack.length - 80);
        return { stack: stack, idx: stack.length - 1 };
      });
    }
    function liveDoc(producer) {
      setHist((H) => {
        const cur = H.stack[H.idx];
        const next = producer(cur);
        if (!next) return H;
        const stack = H.stack.slice();
        stack[H.idx] = next;
        return { stack: stack, idx: H.idx };
      });
    }
    const undo = () => setHist((H) => H.idx > 0 ? { stack: H.stack, idx: H.idx - 1 } : H);
    const redo = () => setHist((H) => H.idx < H.stack.length - 1 ? { stack: H.stack, idx: H.idx + 1 } : H);

    // commit/live a change to the current page's elements
    function pagesWith(cur, fn) {
      return Object.assign({}, cur, { pages: cur.pages.map((pg, i) => i !== curRef.current ? pg : Object.assign({}, pg, { els: fn(pg.els.slice()) })) });
    }
    function patchEls(ids, patch, live) {
      const op = (cur) => pagesWith(cur, (els) => els.map((e) => ids.includes(e.id) ? Object.assign({}, e, patch) : e));
      (live ? liveDoc : commitDoc)(op);
    }
    function mutate(fn) { commitDoc((cur) => pagesWith(cur, fn)); }

    // ---- settings apply / revert ----
    function revertSettings() {
      setPending(settings);
      try {
        const applied = JSON.parse(charsApplied || "{}");
        setCharData(applied); BBWS.saveCharData(applied);
        localStorage.removeItem(REGEN_FLAG);
      } catch (e) {}
    }
    function regenerateAll() {
      setRegenerating(true);
      const next = pending;
      const nextChars = JSON.stringify(charData);
      setTimeout(() => {
        commitDoc((cur) => Object.assign({}, cur, { settings: next, pages: buildPages(next) }));
        try { localStorage.setItem(BBWS.APPLIED, nextChars); localStorage.removeItem(REGEN_FLAG); } catch (e) {}
        setCharsApplied(nextChars);
        setSelIds([]);
        setEditMode(false);
        setRegenerating(false);
      }, 850);
    }

    // edit-mode cursor + global drag/marquee + resize listeners
    useEffect(() => {
      document.body.classList.toggle("editing", editMode);
      const ring = document.getElementById("ring");
      if (!editMode) { setSelIds([]); document.body.classList.remove("over-stage"); }
      const onMoveRing = (e) => { if (ring) ring.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)"; };
      const onMove = (e) => {
        if (resizeRef.current) {
          const w = Math.max(340, Math.min(720, window.innerWidth - e.clientX));
          setAiWidth(w);
          return;
        }
        const d = dragRef.current; if (!d) return;
        if (d.type === "drag") {
          if (Math.abs(e.clientX - d.sx) > 2 || Math.abs(e.clientY - d.sy) > 2) d.moved = true;
          const dx = (e.clientX - d.sx) / d.rect.width * 100;
          const dy = (e.clientY - d.sy) / d.rect.height * 100;
          const apply = (cur) => Object.assign({}, cur, { pages: cur.pages.map((pg, i) => i !== curRef.current ? pg : Object.assign({}, pg, {
            els: pg.els.map((el) => d.ids.includes(el.id) ? Object.assign({}, el, { x: d.orig[el.id].x + dx, y: d.orig[el.id].y + dy }) : el)
          })) });
          if (d.moved && !d.committed) { d.committed = true; commitDoc(apply); }
          else if (d.committed) liveDoc(apply);
        } else if (d.type === "marquee") {
          const r = { left: Math.min(d.sx, e.clientX), top: Math.min(d.sy, e.clientY), right: Math.max(d.sx, e.clientX), bottom: Math.max(d.sy, e.clientY) };
          setMarquee({ x: r.left, y: r.top, w: r.right - r.left, h: r.bottom - r.top });
          const hit = [];
          document.querySelectorAll(".page .el").forEach((node) => {
            const b = node.getBoundingClientRect();
            if (b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top) hit.push(node.getAttribute("data-id"));
          });
          setSelIds(hit);
        }
      };
      const onUp = () => { dragRef.current = null; resizeRef.current = null; document.body.classList.remove("resizing"); setMarquee(null); };
      window.addEventListener("mousemove", onMoveRing);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      return () => {
        window.removeEventListener("mousemove", onMoveRing);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
    }, [editMode]);

    // keyboard undo/redo
    useEffect(() => {
      const onKey = (e) => {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        const mod = e.metaKey || e.ctrlKey;
        if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
        else if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => { if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight; }, [chats, current, aiOpen, chatBusy]);

    function startDrag(e, elObj) {
      e.stopPropagation();
      const ids = selRef.current.includes(elObj.id) ? selRef.current.slice() : [elObj.id];
      if (!selRef.current.includes(elObj.id)) setSelIds(ids);
      const rect = pageRef.current.getBoundingClientRect();
      const orig = {};
      page.els.forEach((x) => { if (ids.includes(x.id)) orig[x.id] = { x: x.x, y: x.y }; });
      dragRef.current = { type: "drag", ids, sx: e.clientX, sy: e.clientY, rect, orig, moved: false, committed: false };
    }
    function startMarquee(e) {
      if (e.target.closest(".el")) return;
      setSelIds([]);
      dragRef.current = { type: "marquee", sx: e.clientX, sy: e.clientY };
    }

    function onAction(r) {
      const ids = selRef.current; const primary = page.els.find((e) => e.id === ids[0]); if (!primary) return;
      if (r.act === "effect") { patchEls(ids, { effect: primary.effect === r.eff ? "none" : r.eff }); return; }
      if (r.act === "color") { pendingRef.current = { ids }; colorRef.current.value = "#d4a83a"; colorRef.current.click(); return; }
      if (r.act === "replace" || r.act === "upload") { pendingRef.current = { ids: [primary.id] }; fileRef.current.click(); return; }
      if (r.act === "dup") {
        const clones = selEls.map((s) => Object.assign({}, s, { id: uid(), x: s.x + 4, y: s.y + 4, z: (s.z || 1) + 1, tag: newTag(s.kind) }));
        mutate((els) => els.concat(clones));
        setSelIds(clones.map((c) => c.id)); return;
      }
      if (r.act === "front") { const mx = Math.max.apply(null, page.els.map((e) => e.z || 1)); patchEls(ids, { z: mx + 1 }); return; }
      if (r.act === "back") { const mn = Math.min.apply(null, page.els.map((e) => e.z || 1)); patchEls(ids, { z: mn - 1 }); return; }
      if (r.act === "del") { mutate((els) => els.filter((e) => !ids.includes(e.id))); setSelIds([]); return; }
    }
    function onColor(e) { if (pendingRef.current) patchEls(pendingRef.current.ids, { color: e.target.value, effect: "none" }); }
    function onFile(e) { const f = e.target.files[0]; if (!f || !pendingRef.current) return; patchEls(pendingRef.current.ids, { src: URL.createObjectURL(f), effect: "none" }); e.target.value = ""; }

    // ---- AI chat ----
    function applyActions(actions) {
      if (!actions || !actions.length) return;
      commitDoc((cur) => pagesWith(cur, (els0) => {
        let els = els0;
        actions.forEach((a) => {
          if (a.op === "delete") { els = els.filter((e) => e.id !== a.id); return; }
          if (a.op === "duplicate") { const s = els.find((e) => e.id === a.id); if (s) els.push(Object.assign({}, s, { id: uid(), x: s.x + 4, y: s.y + 4, tag: newTag(s.kind) })); return; }
          els = els.map((e) => {
            if (e.id !== a.id) return e;
            const p = {};
            if (a.op === "setText") p.text = a.text;
            if (a.op === "setColor") { p.color = a.color; p.effect = "none"; }
            if (a.op === "setOpacity") p.opacity = Math.max(0, Math.min(100, +a.value));
            if (a.op === "setRotation") p.rotation = +a.value;
            if (a.op === "setEffect") p.effect = a.effect;
            if (a.op === "move") { if (a.x != null) p.x = +a.x; if (a.y != null) p.y = +a.y; }
            return Object.assign({}, e, p);
          });
        });
        return els;
      }));
    }
    async function sendChat(text) {
      const msg = (text != null ? text : chatInput).trim();
      const img = chatImage;
      if ((!msg && !img) || chatBusy) return;
      const pid = page.id;
      setChatInput("");
      setChatImage(null);
      setChats((c) => Object.assign({}, c, { [pid]: (c[pid] || []).concat([{ role: "user", text: msg, img: img ? img.url : null }]) }));
      setChatBusy(true);
      const elsInfo = page.els.map((e) => ({ id: e.id, kind: e.kind, label: e.label, text: e.text || null, color: e.color, opacity: e.opacity, rotation: e.rotation, effect: e.effect }));
      const prompt =
        'You are an assistant editing ONE page ("' + page.name + '") of a children\'s storybook in a design tool. ' +
        'These are the page elements as JSON:\n' + JSON.stringify(elsInfo) + '\n\n' +
        (img ? ('The user attached a reference image named "' + img.name + '". Treat the request as relating to that image (e.g. using it as the illustration on this page).\n\n') : '') +
        'User request: "' + (msg || (img ? "Use this image on the page" : "")) + '"\n\n' +
        'Reply with ONLY a JSON object, no markdown, of the form {"reply":"<one short friendly sentence>","actions":[...]}. ' +
        'Allowed actions (use only existing ids): ' +
        '{"op":"setText","id","text"}, {"op":"setColor","id","color":"#hex"}, {"op":"setOpacity","id","value":0-100}, ' +
        '{"op":"setRotation","id","value":-180..180}, {"op":"setEffect","id","effect":"none|metallic|glass|emboss|transparent"}, ' +
        '{"op":"move","id","x":0-90,"y":0-90}, {"op":"delete","id"}, {"op":"duplicate","id"}. ' +
        'Coordinates x,y are percentages of the page. If nothing applies, use an empty actions array.';
      try {
        if (!window.claude || !window.claude.complete) throw new Error("no-ai");
        const out = await window.claude.complete(prompt);
        const j = parseJSON(out);
        // if an image was attached, drop it onto the page's illustration element
        if (img) {
          const target = page.els.find((e) => e.kind === "image") || page.els.find((e) => e.kind === "emblem");
          if (target) patchEls([target.id], { src: img.url, effect: "none" });
        }
        if (j) { applyActions(j.actions); setChats((c) => Object.assign({}, c, { [pid]: (c[pid] || []).concat([{ role: "ai", text: j.reply || "Done." }]) })); }
        else setChats((c) => Object.assign({}, c, { [pid]: (c[pid] || []).concat([{ role: "ai", text: out || "Sorry, I couldn't parse that." }]) }));
      } catch (err) {
        if (img) {
          const target = page.els.find((e) => e.kind === "image") || page.els.find((e) => e.kind === "emblem");
          if (target) patchEls([target.id], { src: img.url, effect: "none" });
        }
        setChats((c) => Object.assign({}, c, { [pid]: (c[pid] || []).concat([{ role: "ai", text: img ? ("Placed “" + img.name + "” onto " + page.name + ".") : ("The AI assistant isn't reachable in this preview, but here it would update “" + page.name + "” for you.") }]) }));
      }
      setChatBusy(false);
    }
    function onChatImage(e) {
      const f = e.target.files[0]; if (!f) return;
      setChatImage({ url: URL.createObjectURL(f), name: f.name });
      e.target.value = "";
    }

    // ----- middle panel -----
    let panelHead, panelSub, panelBody;
    if (rail === "pages") {
      panelHead = "Pages"; panelSub = pages.length + " pages";
      panelBody = h("div", { className: "panel-body" },
        dirty ? h("div", { className: "panel-note" }, charsDirty && !settingsDirty ? "Pages are out of date — a character changed." : "Pages are out of date with story settings.") : null,
        pages.map((pg, i) => h("div", { key: pg.id, className: "pagecard" + (dirty ? " stale" : ""), "data-active": i === current, onClick: () => { setCurrent(i); setSelIds([]); } },
          h("div", { className: "thumb-wrap" }, Thumb(pg, renderCtx)),
          h("div", { className: "pc-foot" }, h("span", { className: "pc-name" }, pg.name), h("span", { className: "pc-idx" }, String(i + 1).padStart(2, "0")))
        ))
      );
    } else if (rail === "characters") {
      panelHead = "Characters"; panelSub = CHARACTERS.length + " in this story";
      panelBody = h(BBWS.CharactersPanel, {
        chars: CHARACTERS, charData: charData, total: totalPages,
        onUpload: onCharUpload, onAI: onCharAI, onRanges: setCharRanges
      });
    } else {
      panelHead = "Story settings"; panelSub = dirty ? "Unapplied changes" : "Affects every page";
      panelBody = h(SettingsPanel, { pending: pending, setP: setPending, title: title, team: team, setTeam: setTeam });
    }

    const railBtn = (id, icon, label) => h("button", { className: "rail-btn", "data-active": rail === id, title: label, onClick: () => { setRail(id); setPanelOpen(true); } }, h(LIcon, { name: icon, size: 20 }));

    const chatThread = chats[page.id] || [];
    const propsVisible = editMode && selEls.length > 0 && !dirty;
    const dockRight = (propsVisible ? 270 : 0) + (aiOpen ? aiWidth : 0);

    return h("div", { className: "ws", style: { paddingRight: dockRight } },
      // rail
      h("div", { className: "rail" },
        h("div", { className: "logo" }, "BB"),
        railBtn("characters", "users", "Characters"),
        railBtn("setting", "settings", "Story settings"),
        railBtn("pages", "file-text", "Pages"),
        h("div", { className: "spacer" }),
        h("button", { className: "rail-btn", title: "Share read-only link", onClick: () => setShareOpen(true) }, h(LIcon, { name: "share-2", size: 19 })),
        h("button", { className: "rail-btn", title: "Export book", onClick: () => setExportOpen(true) }, h(LIcon, { name: "download", size: 19 })),
        h("button", { className: "rail-btn", title: "Back to projects", onClick: () => location.href = "Home.html" }, h(LIcon, { name: "home", size: 19 }))
      ),
      // middle panel (collapsible)
      panelOpen ? h("div", { className: "panel" },
        h("div", { className: "panel-head" },
          h("div", { className: "panel-head-row" },
            h("div", null, h("div", { className: "t" }, panelHead), h("div", { className: "s" }, panelSub)),
            h("button", { className: "panel-collapse", title: "Minimize panel", onClick: () => setPanelOpen(false) }, Svg(PATHS.chevL, 18))
          )
        ),
        panelBody
      ) : null,
      // canvas
      h("div", { className: "canvas-col" },
        h("div", { className: "topbar" },
          h("div", { className: "crumb" },
            !panelOpen ? h("button", { className: "backbtn", title: "Show panel", onClick: () => setPanelOpen(true) }, h(LIcon, { name: "panel-left", size: 16 })) : null,
            h("b", null, title), h("span", null, "/"), h("span", null, page.name),
            editMode ? h("span", { className: "edit-hint", style: { marginLeft: 6 } }, Svg(PATHS.move, 14), "Drag to move · drag empty area to multi-select") : null
          ),
          h("div", { className: "right" },
            // universal undo / redo
            h("div", { className: "undo-group" },
              h("button", { className: "icon-btn", title: "Undo", disabled: !canUndo, onClick: undo }, Svg(PATHS.undo, 16)),
              h("button", { className: "icon-btn", title: "Redo", disabled: !canRedo, onClick: redo }, Svg(PATHS.redo, 16))
            ),
            h("div", { className: "tb-sep" }),
            h(Button, { variant: aiOpen ? "default" : "outline", size: "icon", title: "Edit with AI", "aria-label": "Edit with AI", disabled: dirty, onClick: () => setAiOpen((v) => !v) }, h(LIcon, { name: "command", size: 16 })),
            h(Button, { variant: editMode ? "default" : "outline", size: "icon", title: editMode ? "Done editing" : "Edit", "aria-label": editMode ? "Done editing" : "Edit", disabled: dirty, onClick: () => setEditMode((v) => !v) },
              editMode ? h(LIcon, { name: "check", size: 16 }) : Svg(PATHS.move, 16))
          )
        ),
        h("div", { className: "stage" + (editMode ? " editing" : "") + (dirty ? " locked" : ""),
            onMouseEnter: () => editMode && !dirty && document.body.classList.add("over-stage"),
            onMouseLeave: () => document.body.classList.remove("over-stage"),
            onMouseDown: (e) => { if (editMode && !dirty && !e.target.closest(".page")) setSelIds([]); },
            onMouseMove: (e) => { const r = document.getElementById("ring"); if (editMode && r && !dragRef.current) r.classList.toggle("armed", !!e.target.closest(".el")); } },
          h("div", { className: "page" + (dirty ? " stale" : ""), ref: pageRef, style: { width: dims.w, height: dims.h, background: page.bg }, onMouseDown: (e) => { if (editMode && !dirty) startMarquee(e); } },
            page.els.slice().sort((a, b) => (a.z || 1) - (b.z || 1)).map((e) =>
              h("div", { key: e.id, "data-id": e.id, className: "el" + (selIds.includes(e.id) ? " selected" : ""),
                style: { left: e.x + "%", top: e.y + "%", width: e.w + "%", height: e.h != null ? e.h + "%" : "auto", zIndex: e.z || 1 },
                onMouseDown: (ev) => { if (editMode && !dirty) startDrag(ev, e); } },
                h("div", { style: { width: "100%", height: "100%" } }, renderEl(Object.assign({}, e, { x: 0, y: 0, w: 100, h: e.h != null ? 100 : null }), renderCtx))))
          ),
          // settings-changed overlay
          dirty ? h("div", { className: "regen-overlay" },
            h("div", { className: "regen-card" },
              h("div", { className: "regen-ic" }, regenerating ? h("span", { className: "spin" }, Svg(PATHS.refresh, 22)) : h(LIcon, { name: "circle-alert", size: 22 })),
              h("div", { className: "regen-t" }, regenerating ? "Regenerating all pages…" : (charsDirty && !settingsDirty ? "A character has been changed" : "Settings have been changed")),
              h("div", { className: "regen-s" }, regenerating
                ? "Applying the new story settings to every page."
                : (charsDirty && !settingsDirty
                    ? "The character was updated. Every page must be regenerated so the new look appears across the book."
                    : "It will require regeneration of all the pages to get the new settings applied.")),
              regenerating ? null : h("div", { className: "regen-btns" },
                h(Button, { variant: "outline", onClick: revertSettings }, "Revert changes"),
                h(Button, { onClick: regenerateAll }, Svg(PATHS.refresh, 15), "Regenerate all"))
            )) : null
        )
      ),
      // properties dock
      propsVisible ? h(PropsDock, { els: selEls, rightOffset: aiOpen ? aiWidth : 0, onAction, onPatch: (p) => patchEls(selRef.current, p), onClose: () => setSelIds([]) }) : null,
      // AI chat dock (resizable)
      aiOpen ? h("div", { className: "rdock chat-dock", style: { right: 0, width: aiWidth } },
        h("div", { className: "chat-resize", title: "Drag to resize",
          onMouseDown: (e) => { e.preventDefault(); resizeRef.current = true; document.body.classList.add("resizing"); } }),
        h("div", { className: "chat-head" },
          h("div", { className: "ic" }, h(LIcon, { name: "command", size: 16 })),
          h("div", null, h("div", { className: "t" }, "Edit with AI"), h("div", { className: "s" }, "Editing " + page.name)),
          h("button", { className: "backbtn x", title: "Close", onClick: () => setAiOpen(false) }, Svg(PATHS.x, 15))
        ),
        h("div", { className: "chat-body", ref: chatBodyRef },
          h("div", { className: "bubble ai" }, "Hi! Tell me what to change on “" + page.name + "”, or attach an image to use on the page."),
          chatThread.map((m, i) => h("div", { key: i, className: "bubble " + m.role },
            m.img ? h("img", { className: "bubble-img", src: m.img, alt: "attachment" }) : null,
            m.text ? h("div", null, m.text) : null)),
          chatBusy ? h("div", { className: "bubble think" }, "Working…") : null
        ),
        chatThread.length === 0 ? h("div", { className: "chat-sugg" },
          ["Make the title bigger and gold", "Use an uploaded image as the illustration", "Change the illustration to night colors", "Center everything"].map((s) =>
            h("button", { key: s, className: "chat-chip", onClick: () => sendChat(s) }, s))) : null,
        chatImage ? h("div", { className: "chat-attach" },
          h("img", { src: chatImage.url, alt: "" }),
          h("span", { className: "an" }, chatImage.name),
          h("button", { className: "chat-attach-x", title: "Remove", onClick: () => setChatImage(null) }, Svg(PATHS.x, 12))) : null,
        h("div", { className: "chat-foot" },
          h("button", { className: "attach-btn", title: "Attach image", onClick: () => chatFileRef.current.click() }, Svg(PATHS.image, 18)),
          h("textarea", { rows: 1, placeholder: "Ask for a change, or attach an image…", value: chatInput,
            onChange: (e) => setChatInput(e.target.value),
            onKeyDown: (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } } }),
          h("button", { className: "send-btn", disabled: chatBusy || (!chatInput.trim() && !chatImage), onClick: () => sendChat() }, Svg(PATHS.send, 16))
        ),
        h("input", { type: "file", ref: chatFileRef, accept: "image/*", style: { display: "none" }, onChange: onChatImage })
      ) : null,
      // marquee + hidden inputs
      marquee ? h("div", { className: "marquee", style: { left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h } }) : null,
      h("input", { type: "color", ref: colorRef, style: { display: "none" }, onChange: onColor }),
      h("input", { type: "file", ref: fileRef, accept: "image/*", style: { display: "none" }, onChange: onFile }),
      h("input", { type: "file", ref: charFileRef, accept: "image/*", style: { display: "none" }, onChange: onCharUploadFile }),
      // export / share dialogs
      exportOpen ? h(BBWS.ExportDialog, { settings: settings, pageCount: pages.length, onClose: () => setExportOpen(false) }) : null,
      shareOpen ? h(BBWS.ShareDialog, { settings: settings, onClose: () => setShareOpen(false) }) : null
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(Workspace));
})();
