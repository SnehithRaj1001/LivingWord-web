"use client";

import { useRef, useState, useCallback, createContext, useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, Loader2, X } from "lucide-react";
import {
  Bold, Italic, Strikethrough,
  Heading1, Heading2, Heading3,
  Quote, List, ListOrdered,
  Code, Code2, Link2, Minus,
} from "lucide-react";

/* ── Verse reference regex ─────────────────────────────────────────── */
const VERSE_RE = /\b((?:[1-3]\s+)?[A-Z][a-z]+)\s+(\d+):(\d+)(?:-(\d+))?\b/g;

const TRANSLATIONS = [
  { id: "de4e12af7f28f599-02", name: "KJV" },
  { id: "06125adad2d5898a-01", name: "ASV" },
];

/* ── Inline verse chip + expandable card ──────────────────────────── */
function VerseRef({ reference }: { reference: string }) {
  const [open, setOpen] = useState(false);
  const [trans, setTrans] = useState(TRANSLATIONS[0].id);
  const [verseText, setVerseText] = useState<string | null>(null);
  const [transName, setTransName] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (t: string) => {
    setLoading(true);
    setVerseText(null);
    try {
      const r = await fetch(`/api/bible/verse?ref=${encodeURIComponent(reference)}&translation=${t}`);
      const d = await r.json();
      setVerseText(d.text ?? "Could not load verse.");
      setTransName(d.translation ?? t.toUpperCase());
    } catch {
      setVerseText("Error loading verse.");
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    if (!open) load(trans);
    setOpen((v) => !v);
  };

  const switchTrans = (t: string) => {
    setTrans(t);
    load(t);
  };

  return (
    <span style={{ display: "inline" }}>
      {/* Clickable verse chip */}
      <button
        type="button"
        onClick={toggle}
        style={{
          display: "inline-flex", alignItems: "center", gap: "4px",
          fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 600,
          fontSize: "0.9em", color: "#B8941F",
          background: open ? "rgba(197,155,39,0.12)" : "rgba(197,155,39,0.07)",
          border: "1px solid rgba(197,155,39,0.3)", borderRadius: "6px",
          padding: "1px 7px", cursor: "pointer", transition: "all 0.15s",
          textDecoration: "none",
        }}
      >
        <BookOpen style={{ width: "11px", height: "11px", flexShrink: 0 }} />
        {reference}
      </button>

      {/* Inline expansion — sits on its own line right after the chip */}
      {open && (
        <span style={{ display: "block", margin: "8px 0 10px", width: "100%" }}>
          <span style={{
            display: "block",
            borderRadius: "12px",
            border: "1px solid rgba(197,155,39,0.35)",
            background: "linear-gradient(135deg,rgba(255,255,255,0.9),rgba(249,243,232,0.85))",
            padding: "12px 16px",
            boxShadow: "0 3px 14px -4px rgba(197,155,39,0.18)",
            animation: "vExpand 0.18s ease",
          }}>
            {/* Header */}
            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <BookOpen style={{ width: "14px", height: "14px", color: "#C59B27", flexShrink: 0 }} />
                <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "13px", color: "#1A1815" }}>{reference}</span>
              </span>
              <button type="button" onClick={() => setOpen(false)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#968A7C", padding: "2px", borderRadius: "4px" }}>
                <X style={{ width: "12px", height: "12px" }} />
              </button>
            </span>

            {/* Translation pills */}
            <span style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
              {TRANSLATIONS.map((t) => (
                <button key={t.id} type="button" onClick={() => switchTrans(t.id)}
                  style={{
                    padding: "2px 9px", borderRadius: "5px", fontSize: "10px", fontWeight: 700,
                    border: "none", cursor: "pointer", transition: "all 0.12s",
                    background: trans === t.id ? "#C59B27" : "rgba(0,0,0,0.06)",
                    color: trans === t.id ? "white" : "#665C52",
                  }}>
                  {t.name}
                </button>
              ))}
            </span>

            {/* Verse text */}
            {loading ? (
              <span style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
                <Loader2 style={{ width: "16px", height: "16px", color: "#C59B27", animation: "spin 1s linear infinite" }} />
              </span>
            ) : verseText ? (
              <span style={{ display: "block" }}>
                <span style={{ display: "block", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "13px", color: "#1A1815", lineHeight: 1.7 }}>
                  &ldquo;{verseText}&rdquo;
                </span>
                {transName && (
                  <span style={{
                    display: "inline-block", marginTop: "6px",
                    background: "rgba(197,155,39,0.1)", color: "#B8941F",
                    border: "1px solid rgba(197,155,39,0.2)", borderRadius: "999px",
                    padding: "1px 9px", fontSize: "9px", fontWeight: 700,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>{transName}</span>
                )}
              </span>
            ) : null}
          </span>
          <style>{`
            @keyframes vExpand { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
            @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          `}</style>
        </span>
      )}
    </span>
  );
}

/* ── Parse a string and inject VerseRef components ────────────────── */
function parseVerseRefs(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = new RegExp(VERSE_RE.source, "g");
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<VerseRef key={m.index} reference={m[0]} />);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}

/* ── Walk React children, apply parseVerseRefs to string nodes ──── */
function withVerseRefs(children: React.ReactNode): React.ReactNode {
  if (typeof children === "string") return parseVerseRefs(children);
  if (Array.isArray(children)) return children.flatMap((c, i) =>
    typeof c === "string"
      ? parseVerseRefs(c).map((n, j) =>
          typeof n === "string" ? n : <span key={`${i}-${j}`}>{n}</span>)
      : [c]
  );
  return children;
}

interface MarkdownEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  onContentChange?: (value: string) => void;
}

type ViewMode = "edit" | "split" | "preview";

// Context to distinguish ol vs ul children so li can render numbers vs gold dots
const OlCtx = createContext(false);

const baseTextStyle = { fontFamily: "Georgia, serif", fontSize: "0.95rem", color: "#2C2415", lineHeight: 1.65 };

const mdComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ children }) => <h1 style={{ fontFamily: "var(--font-heading, serif)", fontSize: "1.4rem", fontWeight: 700, color: "#1A1815", marginTop: "1.25rem", marginBottom: "0.5rem" }}>{withVerseRefs(children)}</h1>,
  h2: ({ children }) => <h2 style={{ fontFamily: "var(--font-heading, serif)", fontSize: "1.2rem", fontWeight: 700, color: "#2C2415", marginTop: "1rem", marginBottom: "0.4rem" }}>{withVerseRefs(children)}</h2>,
  h3: ({ children }) => <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.05rem", fontWeight: 600, color: "#3A2E1E", marginTop: "0.75rem", marginBottom: "0.3rem" }}>{withVerseRefs(children)}</h3>,
  p: ({ children }) => <p style={{ ...baseTextStyle, marginBottom: "0.75rem" }}>{withVerseRefs(children)}</p>,
  strong: ({ children }) => <strong style={{ fontWeight: 700, color: "#1A1815" }}>{children}</strong>,
  em: ({ children }) => <em style={{ fontStyle: "italic", color: "#4A3728" }}>{children}</em>,
  del: ({ children }) => <del style={{ textDecoration: "line-through", color: "#968A7C" }}>{children}</del>,
  blockquote: ({ children }) => (
    <blockquote style={{ borderLeft: "4px solid #C59B27", paddingLeft: "1rem", paddingTop: "0.25rem", paddingBottom: "0.25rem", margin: "0.75rem 0", background: "rgba(197,155,39,0.06)", borderRadius: "0 8px 8px 0", fontStyle: "italic", color: "#4A3728", fontFamily: "Georgia, serif", fontSize: "0.9rem" }}>
      {withVerseRefs(children)}
    </blockquote>
  ),
  ul: ({ children }) => (
    <OlCtx.Provider value={false}>
      <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0" }}>{children}</ul>
    </OlCtx.Provider>
  ),
  ol: ({ children }) => (
    <OlCtx.Provider value={true}>
      <ol style={{ listStyleType: "decimal", paddingLeft: "1.75rem", margin: "0.75rem 0" }}>{children}</ol>
    </OlCtx.Provider>
  ),
  li: ({ children }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const isOrdered = useContext(OlCtx);
    if (isOrdered) {
      return (
        <li style={{ ...baseTextStyle, marginBottom: "0.35rem", display: "list-item" }}>
          {withVerseRefs(children)}
        </li>
      );
    }
    return (
      <li style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", marginBottom: "0.35rem", ...baseTextStyle }}>
        <span style={{ marginTop: "0.55rem", width: "6px", height: "6px", borderRadius: "50%", background: "#C59B27", flexShrink: 0, display: "inline-block" }} />
        <span>{withVerseRefs(children)}</span>
      </li>
    );
  },
  hr: () => <hr style={{ border: "none", height: "1px", background: "linear-gradient(to right, transparent, rgba(197,155,39,0.4), transparent)", margin: "1rem 0" }} />,
  code: ({ children }) => <code style={{ background: "#F5EDD8", color: "#7A4C1E", padding: "2px 6px", borderRadius: "4px", fontSize: "0.85rem", fontFamily: "monospace" }}>{children}</code>,
  pre: ({ children }) => <pre style={{ background: "#F5EDD8", color: "#7A4C1E", padding: "1rem", borderRadius: "10px", margin: "0.75rem 0", overflowX: "auto", fontSize: "0.85rem", fontFamily: "monospace" }}>{children}</pre>,
  a: ({ href, children }) => <a href={href} style={{ color: "#5B7566", textDecoration: "underline" }}>{children}</a>,
};

export default function MarkdownEditor({
  name,
  defaultValue = "",
  placeholder,
  rows = 18,
  required,
  onContentChange,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef  = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState(defaultValue); // only for preview pane
  const [mode, setMode] = useState<ViewMode>("split");

  const PANE_HEIGHT = Math.max(rows * 26, 400);

  /* ── Sync scroll in split mode ──────────────────────────── */
  const handleScroll = () => {
    const ta = textareaRef.current;
    const pr = previewRef.current;
    if (!ta || !pr || mode !== "split") return;
    const ratio = ta.scrollTop / (ta.scrollHeight - ta.clientHeight || 1);
    pr.scrollTop = ratio * (pr.scrollHeight - pr.clientHeight);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPreview(e.target.value);
    onContentChange?.(e.target.value);
  };

  /* ── Insert via execCommand so native undo stack is preserved ── */
  const exec = useCallback((text: string) => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const ok = document.execCommand("insertText", false, text);
    if (!ok) {
      // Fallback for browsers that block execCommand
      const { selectionStart: s, selectionEnd: e } = el;
      const next = el.value.slice(0, s) + text + el.value.slice(e);
      el.value = next;
      el.setSelectionRange(s + text.length, s + text.length);
    }
    setPreview(el.value);
  }, []);

  /* ── Auto-continue lists & quotes on Enter ─────────────────── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;

    const el = textareaRef.current;
    if (!el) return;

    const { selectionStart: s, selectionEnd: end } = el;
    if (s !== end) return; // don't intercept if text is selected

    const val = el.value;
    const lineStart = val.lastIndexOf("\n", s - 1) + 1;
    const currentLine = val.slice(lineStart, s);

    // Bullet list match: "- " or "* "
    const bulletMatch = currentLine.match(/^(\s*)([-*]\s+)(.*)$/);
    if (bulletMatch) {
      e.preventDefault();
      const [, indent, bullet, content] = bulletMatch;

      // If user presses Enter on an empty bullet line, exit the list
      if (content.trim() === "") {
        el.setSelectionRange(lineStart, s);
        exec("");
      } else {
        exec(`\n${indent}${bullet}`);
      }
      return;
    }

    // Numbered list match: "1. ", "2. ", etc.
    const numberedMatch = currentLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      e.preventDefault();
      const [, indent, numStr, content] = numberedMatch;

      // If user presses Enter on an empty numbered line, exit the list
      if (content.trim() === "") {
        el.setSelectionRange(lineStart, s);
        exec("");
      } else {
        const nextNum = parseInt(numStr, 10) + 1;
        exec(`\n${indent}${nextNum}. `);
      }
      return;
    }

    // Blockquote match: "> "
    const quoteMatch = currentLine.match(/^(\s*)(>\s*)(.*)$/);
    if (quoteMatch) {
      e.preventDefault();
      const [, indent, quote, content] = quoteMatch;

      if (content.trim() === "") {
        el.setSelectionRange(lineStart, s);
        exec("");
      } else {
        exec(`\n${indent}${quote}`);
      }
      return;
    }
  };

  /* ── Smart wrap: wraps selection or inserts placeholder ─── */
  const wrap = useCallback((prefix: string, suffix = prefix, placeholder = "text") => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = el.value.slice(s, e);
    if (selected) {
      el.setSelectionRange(s, e);
      exec(`${prefix}${selected}${suffix}`);
      requestAnimationFrame(() => el.setSelectionRange(s + prefix.length, s + prefix.length + selected.length));
    } else {
      exec(`${prefix}${placeholder}${suffix}`);
      requestAnimationFrame(() => {
        const start = s + prefix.length;
        el.setSelectionRange(start, start + placeholder.length);
      });
    }
  }, [exec]);

  /* ── Line-prefix insert ─────────────────────────────────── */
  const linePrefix = useCallback((prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: s } = el;
    const lineStart = el.value.lastIndexOf("\n", s - 1) + 1;
    el.setSelectionRange(lineStart, lineStart);
    exec(prefix);
    requestAnimationFrame(() => el.setSelectionRange(lineStart + prefix.length + (s - lineStart), lineStart + prefix.length + (s - lineStart)));
  }, [exec]);

  /* ── Insert link ─────────────────────────────────────────── */
  const insertLink = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const txt = el.value.slice(s, e) || "link text";
    el.setSelectionRange(s, e);
    exec(`[${txt}](url)`);
    requestAnimationFrame(() => {
      const urlStart = s + txt.length + 3;
      el.setSelectionRange(urlStart, urlStart + 3);
    });
  }, [exec]);

  /* ── Toolbar groups ─────────────────────────────────────── */
  const toolbarGroups = [
    [
      { icon: <Heading1 className="w-4 h-4" />, label: "H1", fn: () => linePrefix("# ") },
      { icon: <Heading2 className="w-4 h-4" />, label: "H2", fn: () => linePrefix("## ") },
      { icon: <Heading3 className="w-4 h-4" />, label: "H3", fn: () => linePrefix("### ") },
    ],
    [
      { icon: <Bold          className="w-4 h-4" />, label: "Bold",          fn: () => wrap("**", "**", "bold text")  },
      { icon: <Italic        className="w-4 h-4" />, label: "Italic",        fn: () => wrap("*",  "*",  "italic text") },
      { icon: <Strikethrough className="w-4 h-4" />, label: "Strikethrough", fn: () => wrap("~~", "~~", "text")       },
    ],
    [
      { icon: <Quote       className="w-4 h-4" />, label: "Blockquote",   fn: () => linePrefix("> ")  },
      { icon: <List        className="w-4 h-4" />, label: "Bullet list",  fn: () => linePrefix("- ")  },
      { icon: <ListOrdered className="w-4 h-4" />, label: "Ordered list", fn: () => linePrefix("1. ") },
    ],
    [
      { icon: <Code  className="w-4 h-4" />, label: "Inline code", fn: () => wrap("`", "`", "code")           },
      { icon: <Code2 className="w-4 h-4" />, label: "Code block",  fn: () => exec("\n```\ncode here\n```\n") },
      { icon: <Link2 className="w-4 h-4" />, label: "Link",        fn: insertLink                              },
      { icon: <Minus className="w-4 h-4" />, label: "Divider",     fn: () => exec("\n\n---\n\n")             },
    ],
  ];

  const viewModes: { id: ViewMode; label: string }[] = [
    { id: "edit",    label: "✏ Editor"  },
    { id: "split",   label: "⊞ Split"   },
    { id: "preview", label: "👁 Preview" },
  ];

  const btnBase: React.CSSProperties = {
    padding: "6px 8px", borderRadius: "8px", border: "none", cursor: "pointer",
    background: "transparent", color: "#665C52", display: "flex", alignItems: "center",
    transition: "background 0.15s",
  };

  return (
    <div style={{ border: "1px solid rgba(180,160,120,0.3)", borderRadius: "16px", overflow: "hidden", background: "rgba(255,255,255,0.6)", display: "flex", flexDirection: "column" }}>

      {/* ── Toolbar row 1: formatting buttons ───────────────── */}
      <div style={{ display: "flex", alignItems: "center", padding: "6px 10px", background: "rgba(249,243,232,0.95)", borderBottom: "1px solid rgba(180,160,120,0.15)", gap: "2px", flexWrap: "nowrap", overflowX: "auto" }}>
        {toolbarGroups.map((group, gi) => (
          <span key={gi} style={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }}>
            {gi > 0 && <span style={{ width: "1px", height: "18px", background: "rgba(180,160,120,0.4)", margin: "0 3px" }} />}
            {group.map((btn) => (
              <button
                key={btn.label}
                type="button"
                title={btn.label}
                onClick={btn.fn}
                disabled={mode === "preview"}
                style={{ ...btnBase, opacity: mode === "preview" ? 0.35 : 1, cursor: mode === "preview" ? "not-allowed" : "pointer" }}
                onMouseEnter={e => { if (mode !== "preview") (e.currentTarget as HTMLElement).style.background = "rgba(197,155,39,0.15)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {btn.icon}
              </button>
            ))}
          </span>
        ))}
      </div>

      {/* ── Toolbar row 2: view-mode switcher ───────────────── */}
      <div style={{ display: "flex", alignItems: "center", padding: "5px 10px", background: "rgba(249,243,232,0.75)", borderBottom: "1px solid rgba(180,160,120,0.2)" }}>
        <span style={{ fontSize: "11px", color: "#968A7C", fontFamily: "monospace", marginRight: "8px", userSelect: "none" }}>View:</span>
        <div style={{ display: "flex", border: "1px solid rgba(180,160,120,0.3)", borderRadius: "8px", overflow: "hidden" }}>
          {viewModes.map((vm) => (
            <button
              key={vm.id}
              type="button"
              onClick={() => setMode(vm.id)}
              style={{
                padding: "4px 14px", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer",
                background: mode === vm.id ? "#C59B27" : "transparent",
                color: mode === vm.id ? "white" : "#665C52",
                transition: "all 0.15s", whiteSpace: "nowrap",
              }}
            >
              {vm.label}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: "11px", color: "#C5B99A", fontFamily: "monospace", userSelect: "none" }}>
          {preview.trim().split(/\s+/).filter(Boolean).length} words · {preview.length} chars
        </span>
      </div>

      {/* ── Panes ────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, minHeight: `${PANE_HEIGHT}px` }}>

        {/* Editor pane — ALWAYS kept mounted in DOM so value is never lost on view toggle */}
        <textarea
          ref={textareaRef}
          name={name}
          required={required}
          defaultValue={defaultValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder={placeholder}
          style={{
            display: mode === "preview" ? "none" : "block",
            width: mode === "split" ? "50%" : "100%",
            padding: "20px",
            fontFamily: "'Courier New', monospace",
            fontSize: "14px",
            color: "#2C2415",
            background: "transparent",
            border: "none",
            resize: "none",
            outline: "none",
            lineHeight: "1.75",
            minHeight: `${PANE_HEIGHT}px`,
            borderRight: mode === "split" ? "1px solid rgba(180,160,120,0.25)" : "none",
          }}
        />

        {/* Preview pane — always kept mounted in DOM with display toggle */}
        <div
          ref={previewRef}
          style={{
            display: mode === "edit" ? "none" : "block",
            width: mode === "split" ? "50%" : "100%",
            padding: "20px",
            overflowY: "auto",
            minHeight: `${PANE_HEIGHT}px`,
            maxHeight: `${PANE_HEIGHT}px`,
            background: mode === "split" ? "rgba(249,243,232,0.35)" : "transparent",
          }}
        >
          {mode === "split" && (
            <p style={{ fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C5B99A", marginBottom: "12px", userSelect: "none" }}>
              ✦ Live Preview
            </p>
          )}
          {preview.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{preview}</ReactMarkdown>
          ) : (
            <p style={{ fontStyle: "italic", color: "#C5B99A", fontSize: "14px" }}>
              {mode === "split" ? "Start typing to see a live preview…" : "Nothing to preview yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
