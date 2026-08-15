/* BB artists — Workspace side panels: Characters editor, Export & Share dialogs */
(function () {
  const React = window.React;
  const h = React.createElement;
  const { useState, useRef, useEffect } = React;
  const Icon = window.Icon;
  const DS = window.ShadcnUiDesignSystem_6211ba;
  const Button = DS.Button;

  // ---- extra glyphs ----
  Object.assign(window.LUCIDE_PATHS, {
    "layers": '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    "sparkles": '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    "image": '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    "pencil": '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    "book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    "minus": '<path d="M5 12h14"/>',
    "upload": '<path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
    "link": '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    "copy": '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    "share-2": '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
    "refresh-cw": '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
    "file-down": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/>',
    "eye": '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'
  });

  const STORE = "bb_characters";
  const APPLIED = "bb_characters_applied";
  const VAR_COLORS = ["#6366f1", "#0e7490", "#b45309", "#be185d", "#15803d", "#7c3aed"];

  // sensible defaults so the workspace always has something to show
  const DEFAULT_CHARS = {
    ram:   { mode: "constant", design: { type: "ai", versions: 3, changes: ["Weathered indigo cloak", "Calmer expression"] }, variants: [] },
    shyam: { mode: "variants", design: null, variants: [
      { id: "v1", name: "Everyday", source: { type: "ai", versions: 2, changes: ["Green tunic, rolled sleeves"] }, ranges: [[1, 14]] },
      { id: "v2", name: "Festival", source: { type: "upload", name: "shyam-festival.png" }, ranges: [[15, 32]] }
    ] },
    gita:  { mode: "constant", design: { type: "upload", name: "gita-reference.png" }, variants: [] },
    sita:  { mode: "constant", design: { type: "ai", versions: 2, changes: ["Star-dotted midnight shawl"] }, variants: [] }
  };

  function loadCharData() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (e) {}
    const out = {};
    Object.keys(DEFAULT_CHARS).forEach((id) => {
      const d = DEFAULT_CHARS[id];
      const s = saved[id];
      const meaningful = s && (s.design || (s.variants && s.variants.some((v) => v && v.source)));
      out[id] = meaningful ? s : d;
    });
    // make sure variant objects are complete
    Object.values(out).forEach((c) => { c.variants = (c.variants || []).map((v, i) => Object.assign({ id: "v" + (i + 1), name: "Variant " + (i + 1), source: null, ranges: [] }, v)); });
    return out;
  }
  function saveCharData(d) { try { localStorage.setItem(STORE, JSON.stringify(d)); } catch (e) {} }

  function totalBookPages(settings) {
    const n = parseInt(String((settings && settings.length) || "32").replace(/[^0-9]/g, ""), 10);
    return n && n > 0 ? n : 32;
  }

  // ---- tiny svg helper ----
  function Svg(inner, size) {
    return h("svg", { width: size || 16, height: size || 16, viewBox: "0 0 24 24", fill: "none",
      stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
      dangerouslySetInnerHTML: { __html: inner } });
  }

  const fmtRange = ([a, b]) => a === b ? "" + a : a + "\u2013" + b;

  // ===== compact page-range editor =====
  function RangeEditor({ ranges, total, onChange }) {
    const [adding, setAdding] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const fromRef = useRef(null);
    const start = () => { setAdding(true); setFrom(""); setTo(""); setTimeout(() => fromRef.current && fromRef.current.focus(), 0); };
    const a = parseInt(from, 10), b = parseInt(to || from, 10);
    const valid = from !== "" && a >= 1 && a <= total && b >= a && b <= total;
    const commit = () => { if (!valid) return; onChange([...ranges, [a, b]].sort((x, y) => x[0] - y[0])); setAdding(false); setFrom(""); setTo(""); };
    const remove = (i) => onChange(ranges.filter((_, j) => j !== i));
    return h("div", { className: "cp-ranges" },
      h("div", { className: "cp-ranges-l" }, h(Icon, { name: "book-open", size: 11 }), "Appears on pages"),
      h("div", { className: "cp-rchips" },
        ranges.map((r, i) => h("span", { className: "cp-rchip", key: i }, fmtRange(r),
          h("span", { className: "rm", title: "Remove", onClick: () => remove(i) }, Svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', 10)))),
        adding
          ? h("span", { className: "cp-raddform" },
              h("input", { ref: fromRef, type: "number", min: 1, max: total, placeholder: "1", value: from,
                onChange: (ev) => setFrom(ev.target.value),
                onKeyDown: (ev) => { if (ev.key === "Enter") commit(); if (ev.key === "Escape") setAdding(false); } }),
              h("span", { className: "dash" }, "\u2013"),
              h("input", { type: "number", min: 1, max: total, placeholder: "" + total, value: to,
                onChange: (ev) => setTo(ev.target.value),
                onKeyDown: (ev) => { if (ev.key === "Enter") commit(); if (ev.key === "Escape") setAdding(false); } }),
              h("button", { className: "ok", disabled: !valid, onClick: commit, title: "Add" }, h(Icon, { name: "check", size: 13 }))
            )
          : h("button", { className: "cp-raddbtn", onClick: start }, h(Icon, { name: "plus", size: 11 }), "Add")
      )
    );
  }

  // ===== change menu (upload here / design with AI) =====
  function ChangeButton({ label, onUpload, onAI }) {
    const [open, setOpen] = useState(false);
    const [flip, setFlip] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      if (!open) return;
      const btn = ref.current && ref.current.querySelector(".cp-change");
      if (btn) {
        const r = btn.getBoundingClientRect();
        const spaceBelow = window.innerHeight - r.bottom;
        setFlip(spaceBelow < 150);
      }
      const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener("mousedown", close);
      return () => document.removeEventListener("mousedown", close);
    }, [open]);
    return h("div", { className: "cp-change-wrap", ref: ref },
      h("button", { className: "cp-change", "data-open": open, onClick: () => setOpen((v) => !v) },
        Svg('<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>', 12),
        label || "Change", h(Icon, { name: "chevron-down", size: 13, style: { opacity: 0.6 } })),
      open ? h("div", { className: "cp-menu", "data-flip": flip },
        h("button", { className: "cp-menu-row", onClick: () => { setOpen(false); onUpload(); } },
          h("span", { className: "cp-menu-ic up" }, h(Icon, { name: "upload", size: 14 })),
          h("div", null, h("div", { className: "cp-menu-t" }, "Upload image"), h("div", { className: "cp-menu-s" }, "Replace it here"))),
        h("button", { className: "cp-menu-row", onClick: () => { setOpen(false); onAI(); } },
          h("span", { className: "cp-menu-ic ai" }, h(Icon, { name: "sparkles", size: 14 })),
          h("div", null, h("div", { className: "cp-menu-t" }, "Design with AI"), h("div", { className: "cp-menu-s" }, "Open the AI studio")))
      ) : null
    );
  }

  function Thumb({ source, color, name }) {
    const ai = source && source.type === "ai";
    const img = source && source.preview;
    return h("div", { className: "cp-thumb", style: { background: img ? "#000" : color } },
      img ? h("img", { src: img, alt: name })
        : h("div", { className: "cp-thumb-ph" }, ai ? h(Icon, { name: "sparkles", size: 18 }) : (name ? name[0] : h(Icon, { name: "image", size: 16 }))),
      source ? h("span", { className: "cp-thumb-bdg" }, h(Icon, { name: ai ? "sparkles" : "image", size: 9 }), ai ? "AI" : "Upload") : null
    );
  }

  // ===== Characters panel =====
  function CharactersPanel({ chars, charData, total, onUpload, onAI, onRanges }) {
    return h("div", { className: "panel-body" },
      h("div", { className: "cp-hint" }, "Change a character or any of its variants. Every edit re-generates the book."),
      h("div", { className: "cp-list" },
        chars.map((c) => {
          const st = charData[c.id] || { mode: "constant", design: null, variants: [] };
          const isVar = st.mode === "variants" && st.variants && st.variants.length;
          const headImg = st.design && st.design.preview;
          return h("div", { className: "cp-card", key: c.id },
            h("div", { className: "cp-top" },
              h("div", { className: "cp-av", style: { background: headImg ? "#000" : c.color } },
                headImg ? h("img", { src: headImg, alt: c.name }) : c.name[0]),
              h("div", { style: { minWidth: 0 } },
                h("div", { className: "cp-nm" }, c.name),
                h("div", { className: "cp-rl" }, c.role)),
              isVar
                ? h("span", { className: "cp-pill var" }, h(Icon, { name: "layers", size: 11 }), st.variants.length + " variants")
                : h("span", { className: "cp-pill const" }, h(Icon, { name: "user", size: 11 }), "One look")
            ),
            isVar
              ? h("div", { className: "cp-body" },
                  st.variants.map((v, i) => h("div", { className: "cp-var", key: v.id },
                    h("div", { className: "cp-var-h" },
                      h("span", { className: "cp-vchip", style: { background: VAR_COLORS[i % VAR_COLORS.length] } }),
                      h("span", { className: "cp-vname" }, v.name)),
                    h("div", { className: "cp-var-body" },
                      h(Thumb, { source: v.source, color: VAR_COLORS[i % VAR_COLORS.length], name: c.name }),
                      h("div", { className: "cp-var-right" },
                        h(RangeEditor, { ranges: v.ranges || [], total, onChange: (rs) => onRanges(c.id, v.id, rs) }),
                        h(ChangeButton, { onUpload: () => onUpload(c.id, v.id), onAI: () => onAI(c.id, v.id) })
                      )
                    )
                  ))
                )
              : h("div", { className: "cp-body" },
                  h("div", { className: "cp-design" },
                    h(Thumb, { source: st.design, color: c.color, name: c.name }),
                    h("div", { className: "cp-design-right" },
                      h("div", { className: "cp-design-meta" },
                        st.design
                          ? (st.design.type === "ai" ? "AI-designed" : (st.design.name || "Uploaded design"))
                          : "No design yet"),
                      h(ChangeButton, { onUpload: () => onUpload(c.id, null), onAI: () => onAI(c.id, null) })
                    )
                  )
                )
          );
        })
      )
    );
  }

  // ===== Export dialog =====
  function downloadBook(settings, fmt) {
    const W = 1200, H = 1600;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    const pal = (settings && settings.palette) || ["#4a1512", "#d4a83a"];
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, pal[0] || "#4a1512");
    g.addColorStop(1, pal[2] || pal[0] || "#2c0c0a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = (pal[1] || "#d4a83a") + "cc"; ctx.lineWidth = 6;
    ctx.strokeRect(60, 50, W - 120, H - 100);
    ctx.fillStyle = pal[1] || "#d4a83a"; ctx.textAlign = "center";
    ctx.font = "700 96px Georgia, serif";
    ctx.fillText(settings.name || "Storybook", W / 2, H * 0.46, W - 220);
    ctx.font = "italic 40px Georgia, serif"; ctx.fillStyle = "#ffffffcc";
    ctx.fillText((settings.length || "") + "  \u00b7  " + (settings.style || ""), W / 2, H * 0.54);
    const a = document.createElement("a");
    cv.toBlob((b) => {
      const url = URL.createObjectURL(b);
      a.href = url; a.download = (settings.name || "storybook").replace(/\s+/g, "-").toLowerCase() + "." + (fmt === "PNG images" ? "png" : "png");
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }, "image/png");
  }

  function Seg({ value, opts, onChange }) {
    return h("div", { className: "ex-seg" }, opts.map((o) =>
      h("button", { key: o, "data-active": value === o, onClick: () => onChange(o) }, o)));
  }
  function Toggle({ on, onChange }) {
    return h("button", { className: "set-switch", "data-on": on, onClick: () => onChange(!on), type: "button" }, h("span", { className: "knob" }));
  }

  function ExportDialog({ settings, pageCount, onClose }) {
    const [fmt, setFmt] = useState("PDF");
    const [scope, setScope] = useState("All pages");
    const [from, setFrom] = useState(1);
    const [to, setTo] = useState(pageCount);
    const [quality, setQuality] = useState("High");
    const [cover, setCover] = useState(true);
    const [bleed, setBleed] = useState(false);
    const [phase, setPhase] = useState("setup"); // setup | working | done
    const [pct, setPct] = useState(0);

    const nPages = scope === "All pages" ? pageCount : Math.max(0, Math.min(pageCount, to) - Math.max(1, from) + 1);

    const run = () => {
      setPhase("working"); setPct(0);
      const t = setInterval(() => {
        setPct((p) => {
          const np = p + Math.random() * 22 + 8;
          if (np >= 100) {
            clearInterval(t);
            downloadBook(settings, fmt);
            setPhase("done");
            return 100;
          }
          return np;
        });
      }, 200);
    };

    return h("div", { className: "bb-scrim", onMouseDown: (e) => { if (e.target === e.currentTarget && phase !== "working") onClose(); } },
      h("div", { className: "bb-modal" },
        h("div", { className: "bb-modal-h" },
          h("div", { className: "bb-modal-ic" }, h(Icon, { name: "download", size: 18 })),
          h("div", { style: { flex: 1 } },
            h("div", { className: "bb-modal-t" }, "Export book"),
            h("div", { className: "bb-modal-s" }, "Download \u201c" + (settings.name || "your book") + "\u201d as a finished file")),
          h("button", { className: "bb-modal-x", onClick: onClose, disabled: phase === "working" }, h(Icon, { name: "x", size: 16 }))
        ),
        phase === "done"
          ? h("div", { className: "bb-modal-body bb-done" },
              h("div", { className: "bb-done-ic" }, h(Icon, { name: "circle-check", size: 30 })),
              h("div", { className: "bb-done-t" }, "Your book has been exported"),
              h("div", { className: "bb-done-s" }, nPages + " page" + (nPages === 1 ? "" : "s") + " \u00b7 " + fmt + " \u00b7 " + quality + " quality"),
              h("div", { className: "bb-done-file" },
                h("span", { className: "bb-file-ic" }, h(Icon, { name: "file-down", size: 16 })),
                h("span", { className: "bb-file-nm" }, (settings.name || "storybook").replace(/\s+/g, "-").toLowerCase() + "." + fmt.toLowerCase().slice(0, 3)),
                h("button", { className: "bb-file-re", onClick: () => downloadBook(settings, fmt) }, "Download again")),
              h("div", { className: "bb-modal-foot", style: { borderTop: 0, paddingTop: 4 } },
                h(Button, { onClick: onClose }, "Done")))
          : phase === "working"
            ? h("div", { className: "bb-modal-body bb-working" },
                h("div", { className: "bb-spin" }, h(Icon, { name: "loader", size: 26, className: "spin" })),
                h("div", { className: "bb-work-t" }, "Rendering pages\u2026"),
                h("div", { className: "bb-bar" }, h("span", { style: { width: Math.min(100, pct) + "%" } })),
                h("div", { className: "bb-work-s" }, Math.min(100, Math.round(pct)) + "%"))
            : h("div", { className: "bb-modal-body" },
                h("div", { className: "ex-field" }, h("div", { className: "ex-k" }, "Format"),
                  h(Seg, { value: fmt, opts: ["PDF", "PNG images", "Print PDF"], onChange: setFmt })),
                h("div", { className: "ex-field" }, h("div", { className: "ex-k" }, "Pages"),
                  h(Seg, { value: scope, opts: ["All pages", "Range"], onChange: setScope }),
                  scope === "Range" ? h("div", { className: "ex-range" },
                    h("input", { type: "number", min: 1, max: pageCount, value: from, onChange: (e) => setFrom(+e.target.value || 1) }),
                    h("span", { className: "dash" }, "to"),
                    h("input", { type: "number", min: 1, max: pageCount, value: to, onChange: (e) => setTo(+e.target.value || pageCount) }),
                    h("span", { className: "ex-of" }, "of " + pageCount)) : null),
                h("div", { className: "ex-field" }, h("div", { className: "ex-k" }, "Quality"),
                  h(Seg, { value: quality, opts: ["Standard", "High", "Print 300dpi"], onChange: setQuality })),
                h("div", { className: "ex-row" }, h("span", null, "Include cover"), h(Toggle, { on: cover, onChange: setCover })),
                h("div", { className: "ex-row" }, h("span", null, "Crop marks & bleed"), h(Toggle, { on: bleed, onChange: setBleed })),
                h("div", { className: "bb-modal-foot" },
                  h("div", { className: "ex-summary" }, nPages + " page" + (nPages === 1 ? "" : "s") + " \u00b7 " + fmt),
                  h(Button, { variant: "outline", onClick: onClose }, "Cancel"),
                  h(Button, { onClick: run, disabled: nPages < 1 }, h(Icon, { name: "download", size: 15 }), "Export"))
              )
      )
    );
  }

  // ===== Share dialog =====
  function ShareDialog({ settings, onClose }) {
    const token = useRef(Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6)).current;
    const link = "https://read.bbartists.app/s/" + token;
    const [copied, setCopied] = useState(false);
    const [access, setAccess] = useState("Anyone with the link");
    const [allowDl, setAllowDl] = useState(false);
    const copy = () => {
      try { navigator.clipboard.writeText(link); } catch (e) {}
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    };
    return h("div", { className: "bb-scrim", onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); } },
      h("div", { className: "bb-modal" },
        h("div", { className: "bb-modal-h" },
          h("div", { className: "bb-modal-ic share" }, h(Icon, { name: "link", size: 17 })),
          h("div", { style: { flex: 1 } },
            h("div", { className: "bb-modal-t" }, "Share a read-only link"),
            h("div", { className: "bb-modal-s" }, "Recipients see the finished book \u2014 not the workspace")),
          h("button", { className: "bb-modal-x", onClick: onClose }, h(Icon, { name: "x", size: 16 }))
        ),
        h("div", { className: "bb-modal-body" },
          h("div", { className: "sh-linkrow" },
            h("span", { className: "sh-link-ic" }, h(Icon, { name: "globe", size: 15 })),
            h("input", { className: "sh-link", value: link, readOnly: true, onFocus: (e) => e.target.select() }),
            h("button", { className: "sh-copy", "data-copied": copied, onClick: copy },
              h(Icon, { name: copied ? "check" : "copy", size: 14 }), copied ? "Copied" : "Copy")),
          h("div", { className: "sh-note" },
            h("span", { className: "sh-note-ic" }, h(Icon, { name: "eye", size: 14 })),
            h("div", null,
              h("div", { className: "sh-note-t" }, "View-only sharing"),
              h("div", { className: "sh-note-s" }, "The link opens the storybook pages in a reader. Visitors can\u2019t edit characters, settings or the canvas."))),
          h("div", { className: "ex-field", style: { marginTop: 14 } }, h("div", { className: "ex-k" }, "Who can open it"),
            h(Seg, { value: access, opts: ["Anyone with the link", "People you invite"], onChange: setAccess })),
          h("div", { className: "ex-row" }, h("span", null, "Allow downloading the PDF"), h(Toggle, { on: allowDl, onChange: setAllowDl })),
          h("div", { className: "bb-modal-foot" },
            h("div", { className: "ex-summary" }, h(Icon, { name: "eye", size: 13 }), " Read-only"),
            h(Button, { variant: "outline", onClick: onClose }, "Done"),
            h(Button, { onClick: copy }, h(Icon, { name: "link", size: 15 }), "Copy link"))
        )
      )
    );
  }

  window.BBWS = { loadCharData, saveCharData, totalBookPages, CharactersPanel, ExportDialog, ShareDialog, STORE, APPLIED };
})();
