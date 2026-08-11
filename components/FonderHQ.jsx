"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { publishDraft, publishAllDrafts, discardDraft } from "@/lib/draft-actions";
import { EditContext } from "./EditContext";
import EditableText from "./EditableText";

/* ─────────────────────────────────────────────────────────────────────────────
   FONDER HQ · v1 prototype
   The client-facing growth operating system. The roadmap is the spine;
   around it: Pulse (the daily read), Quarter (the active plan),
   Scorecard (the metric tree, wired for live data), Decisions (the memory).
   Front end of the brand brain: same knowledge layers, rendered for humans.
   Styled to the Fonder UI System v1. Structure is ink, data is green.

   Ported from the original single-file prototype; `data` (shaped identically
   to the original hardcoded DATA object) now arrives as a prop, fetched from
   Supabase by the server component in app/page.js.
──────────────────────────────────────────────────────────────────────────── */

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0,0&display=swap');
@font-face{font-family:'Marfa';src:url('/fonts/ABCMarfa-Light.otf') format('opentype');font-weight:300;font-style:normal;font-display:swap}
@font-face{font-family:'Marfa';src:url('/fonts/ABCMarfa-Regular.otf') format('opentype');font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:'Marfa';src:url('/fonts/ABCMarfa-Semibold.otf') format('opentype');font-weight:600;font-style:normal;font-display:swap}
@font-face{font-family:'Stroy Mono';src:url('/fonts/StroyMono-Regular.woff') format('woff');font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:'Stroy Mono';src:url('/fonts/StroyMono-Medium.woff') format('woff');font-weight:500;font-style:normal;font-display:swap}
@font-face{font-family:'Stroy Mono';src:url('/fonts/StroyMono-Bold.woff') format('woff');font-weight:700;font-style:normal;font-display:swap}
:root{
  /* Grayscale for now, per Tom — reapply brand color once UI is locked down.
     Status-semantic pills (.pill.ok / .pill.risk) and destructive actions
     (--red) are the deliberate exceptions; everything else routes through
     these tokens so it grays out automatically. */
  --paper:#F1F0EE; --card:#FAFAF8; --ink:#1A1A1A; --muted:#6B6B6B;
  --line:#D8D8D6; --line2:#E8E7E5;
  --green:#5C5C5C; --lgreen:#F0F0EE; --lgreen-line:#D6D6D4;
  --pink:#EAEAE8; --pink-line:#C9C9C7; --red:#F23400;
  --lblue:#EDEDEB; --blue:#5A5A5A;
  --amber:#8A8A8A; --amber-bg:#EDEDEB; --amber-line:#D6D6D4; --amber-ink:#5A5A5A;
  --gray-hi:#E4E3E1; --bench-bg:#EEEDEB; --dot:#C2C1BF; --on-dark:#D6D5D4;

  /* Semantic accents — a small warm, brand-adjacent palette (sage / gold /
     terracotta / plum) standing in for the usual green/yellow/orange/blue,
     used sparingly for dial states, due-date urgency, and trend direction.
     Gantt tiles and phase badges deliberately stay neutral — see .ibar
     and .isq — with a small colored dot carrying the status signal instead. */
  --good:#4A5D3A; --good-bg:#EAF0DE; --good-line:#C9D9B0;
  --warn:#8C6A1F; --warn-bg:#FCF2D8; --warn-line:#E9D4A0;
  --bad:#A6461F; --bad-bg:#FBE6D8; --bad-line:#EAC2A4;
  --info:#6B4368; --info-bg:#F1E3EF; --info-line:#D9BDD4;
  --soft-black:#2E2B27;
  --sans:'Marfa',ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
  --mono:'Stroy Mono',ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
.hq{display:flex;min-height:100vh;background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.5;letter-spacing:-.05em;-webkit-font-smoothing:antialiased}
.hq .mono{font-family:var(--mono);font-variant-numeric:tabular-nums;letter-spacing:-.05em;text-transform:uppercase}

/* ── sidebar: structure is ink ── */
.hq .side{width:224px;flex-shrink:0;background:var(--ink);color:var(--on-dark);display:flex;flex-direction:column;position:sticky;top:0;height:100vh}
.hq .side .brand{padding:22px 20px 36px;border-bottom:1px solid rgba(216,213,204,.14)}
.hq .side .logo{font-family:var(--mono);font-size:13.8px;font-weight:500;letter-spacing:.22em;color:#fff;text-transform:uppercase}
.hq .side .cl{margin-top:14px;display:flex;align-items:center;gap:9px}
.hq .side .cl .csq{width:26px;height:26px;border-radius:7px;background:var(--lgreen);color:var(--green);display:flex;align-items:center;justify-content:center;font-family:var(--mono);text-transform:uppercase;font-weight:500;font-size:13.8px}
.hq .side .cl .cn{font-size:15.5px;font-weight:650;color:#fff;line-height:1.15}
.hq nav{padding:28px 10px 14px;display:flex;flex-direction:column;gap:2px}
.hq .nav-lbl{font-family:var(--mono);font-size:10.4px;letter-spacing:.14em;text-transform:uppercase;color:var(--on-dark);opacity:.4;padding:10px 10px 6px}
.hq .ni{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:9px;cursor:pointer;border:none;background:transparent;color:var(--on-dark);font-family:var(--sans);font-size:15.5px;font-weight:400;letter-spacing:-.01em;text-align:left;width:100%;opacity:.72;transition:.12s}
.hq .ni:hover{opacity:1;background:rgba(255,255,255,.05)}
.hq .ni.on{opacity:1;background:rgba(243,253,191,.1);color:#fff}
.hq .ni .k{font-family:var(--mono);text-transform:uppercase;font-size:11.5px;font-weight:600;width:16px;color:var(--on-dark);opacity:.5}
.hq .ni.on .k{color:var(--lgreen);opacity:1}
.hq .material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;font-size:19px;line-height:1;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased}
.hq .ni .icon{width:19px;flex-shrink:0;color:var(--on-dark);opacity:.6}
.hq .ni.on .icon{color:var(--lgreen);opacity:1}
.hq .ni .badge{margin-left:auto;font-family:var(--mono);text-transform:uppercase;font-size:10.4px;font-weight:500;background:var(--amber-bg);color:var(--amber-ink);border-radius:20px;padding:1px 7px}
.hq .side .sfoot{margin-top:auto;padding:16px 20px;border-top:1px solid rgba(216,213,204,.14);font-family:var(--mono);text-transform:uppercase;font-size:10.9px;line-height:1.7;color:var(--on-dark);opacity:.55}
.hq .side .sfoot b{color:#fff;font-weight:600}
.hq .side .signout{margin-top:10px;background:none;border:none;padding:0;font-family:var(--sans);font-size:10.9px;color:var(--on-dark);opacity:.55;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.hq .side .signout:hover{opacity:.85}
.hq .switcher{position:relative;margin-top:10px}
.hq .switcher-btn{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(216,213,204,.2);color:#fff;border-radius:7px;padding:5px 7px;font-family:var(--sans);font-size:13.8px;cursor:pointer}
.hq .switcher-btn .material-symbols-outlined{font-size:16px;opacity:.7}
.hq .switcher-menu{position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--gray-hi);border:1px solid var(--line);border-radius:10px;padding:4px;margin:0;list-style:none;z-index:50;box-shadow:0 6px 18px rgba(0,0,0,.16)}
.hq .switcher-menu li{padding:7px 10px;border-radius:7px;font-size:13.8px;color:var(--ink);cursor:pointer}
.hq .switcher-menu li:hover{background:var(--line)}
.hq .switcher-menu li.on{font-weight:650}

/* ── main ── */
.hq .main{flex:1;min-width:0;display:flex;flex-direction:column}
.hq .top{display:flex;align-items:center;gap:14px;padding:14px 28px;border-bottom:1px solid var(--line);background:var(--paper);position:sticky;top:0;z-index:40}
.hq .top .vt{font-size:17.3px;font-weight:680;letter-spacing:-.02em;white-space:nowrap}
.hq .ask{flex:1;max-width:560px;display:flex;align-items:center;gap:9px;background:#fff;border:1px solid var(--line);border-radius:11px;padding:8px 13px;color:var(--muted);font-size:14.4px;cursor:default;white-space:nowrap}
.hq .top .ctx{margin-left:auto;display:flex;align-items:center;gap:9px}
.hq .ctx .qchip{font-family:var(--mono);font-size:11.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;background:var(--ink);color:var(--on-dark);border-radius:20px;padding:4px 11px;white-space:nowrap}
.hq .content{padding:30px 28px 90px;max-width:1060px;width:100%;margin:0 auto}

/* type & shared */
.hq .h-page{font-size:clamp(27.6px,3.9vw,39.1px);font-weight:700;letter-spacing:-.03em;line-height:1.05}
.hq .lede{font-size:16.7px;color:var(--muted);max-width:70ch;margin-top:8px;line-height:1.55}
.hq .lede.clamp2{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.hq .read-more{display:block;background:none;border:none;padding:0;margin-top:6px;font-family:var(--sans);font-size:12.6px;font-weight:600;color:var(--ink);text-decoration:underline;cursor:pointer}
.hq .lbl{font-family:var(--mono);font-size:12.1px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600}
.hq .card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px 22px}
.hq .card.pulse-tile{padding:23px 25px}
.hq .tile{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.hq .north-star-goal{font-size:15px}
.hq .sect{margin-top:34px}
.hq .sect > .lbl{display:block;margin-bottom:12px}
.hq .divider{height:1px;background:var(--line);margin:20px 0}
.hq .btn-cta{display:inline-flex;align-items:center;gap:6px;font-family:var(--sans);font-size:13.8px;font-weight:600;color:#fff;background:var(--ink);border:1px solid var(--ink);border-radius:999px;padding:8px 16px;cursor:pointer;transition:opacity .12s}
.hq .btn-cta:hover{opacity:.85}
.hq .btn-cta .material-symbols-outlined{font-size:16px}
.hq .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:860px){.hq .grid2{grid-template-columns:1fr}}

/* pills */
.hq .pill{display:inline-flex;align-items:center;gap:4px;font-family:var(--mono);font-size:10.9px;font-weight:600;letter-spacing:.04em;border-radius:20px;padding:3px 9px;text-transform:uppercase;white-space:nowrap;flex-shrink:0;width:max-content}
/* phase status system: complete=green, in-progress=yellow, upcoming=blue */
.hq .pill.done{background:var(--good-bg);color:var(--good);border:1px solid var(--good-line)}
.hq .pill.prog{background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn-line)}
.hq .pill.next{background:var(--info-bg);color:var(--info);border:1px solid var(--info-line)}
/* on-track / needs-focus keep their own hint of color — status semantics
   were the "necessary for good UI" exception to the original grayscale pass */
.hq .pill.ok{background:#EFF6F1;color:#3A7A4F;border:1px solid #B8D6C2}
.hq .pill.risk{background:#FBEEEA;color:#B3402A;border:1px solid #E8C4BA}
.hq .pill.pend{background:transparent;color:var(--muted);border:1px dashed var(--line)}
.hq .pill.black{background:var(--ink);color:var(--on-dark)}
.hq .tagtext{font-family:var(--mono);text-transform:uppercase;font-size:10.4px;letter-spacing:.04em;font-weight:600}
.hq .tagtext.t-brand{color:var(--info)}
.hq .tagtext.t-creative{color:var(--bad)}
.hq .tagtext.t-digital{color:var(--good)}
.hq .tagtext.t-marketing{color:var(--warn)}
.hq .tagtext.t-product{color:var(--muted)}
.hq .pill.src{background:var(--card);color:var(--muted);border:1px solid var(--line2);text-transform:none;letter-spacing:-.02em;font-family:var(--sans)}
.hq .pill.src .dot-soon{width:5px;height:5px;border-radius:50%;background:var(--amber)}
.hq .pill.src .dot-live{width:5px;height:5px;border-radius:50%;background:var(--green)}

/* north star tiles — dial in a 25% left column, info stacked at 75% right */
.hq .ntile{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:flex;gap:14px}
.hq .ntile .dialcol{flex:0 0 25%;display:flex;justify-content:center;align-items:flex-start;padding-top:2px}
.hq .ntile .infocol{flex:1;min-width:0;display:flex;flex-direction:column}
.hq .ndial-inner{width:68px;height:68px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hq .ndial-hole{width:48px;height:48px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center}
.hq .n-hero .ndial-hole{background:var(--ink)}
.hq .ndial-pct{font-family:var(--mono);text-transform:uppercase;font-size:15.7px;font-weight:500}
.hq .nlabel{font-family:var(--sans);font-size:12.1px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600}
.hq .nvals{display:flex;align-items:baseline;gap:9px;margin-top:6px;flex-wrap:wrap}
.hq .nnow{font-family:var(--mono);text-transform:uppercase;font-size:15px;font-weight:500;color:var(--ink)}
.hq .narrow{color:var(--green);font-size:15px}
.hq .ntarget{font-family:var(--mono);text-transform:uppercase;font-weight:500;color:var(--green);font-size:20.7px}
.hq .nnote{font-size:13.2px;color:var(--muted);margin-top:6px;line-height:1.45}
.hq .n-hero{background:var(--ink);border-color:var(--ink)}
.hq .n-hero .nlabel{color:var(--on-dark);opacity:.85}
.hq .n-hero .nnow{color:var(--on-dark);opacity:.85}
.hq .n-hero .narrow{color:var(--on-dark);opacity:.85}
.hq .n-hero .ntarget{color:var(--on-dark);font-size:clamp(25.3px,3.5vw,32.2px);letter-spacing:-.02em;line-height:1}
.hq .n-hero .nnote{color:var(--on-dark);opacity:.85}
.hq .heror{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
@media(max-width:980px){.hq .heror{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.hq .heror{grid-template-columns:1fr}}
.hq .drv{background:var(--lgreen);border-color:var(--lgreen-line)}
.hq .drv .nlabel{color:var(--ink);opacity:.8}
.hq .drv .nnote{color:var(--ink);opacity:.8}
.hq .driver{margin-top:auto;padding-top:8px;font-family:var(--sans);font-size:10.4px;color:var(--ink);opacity:.65}
.hq .n-hero .driver{border-top:1px solid rgba(255,255,255,.25)}
.hq .driver .sep{margin:0 .3em}
.hq .sparkbox{margin-top:10px}

/* needs-you / up-next / activity */
.hq .task{display:flex;gap:12px;padding:12px 0;border-top:1px solid var(--line2);align-items:flex-start}
.hq .task:first-of-type{border-top:none;padding-top:2px}
.hq .task .tk{flex-shrink:0;margin-top:2px;width:16px;height:16px;border:1.5px solid var(--dot);border-radius:5px}
.hq .task .tt{font-size:15.5px;font-weight:640;letter-spacing:-.01em}
.hq .task .td{font-size:13.8px;color:var(--muted);line-height:1.5;margin-top:2px}
.hq .task .due{margin-left:auto;font-family:var(--mono);text-transform:uppercase;font-size:11.5px;color:var(--amber-ink);background:var(--amber-bg);border:1px solid var(--amber-line);border-radius:20px;padding:2px 8px;white-space:nowrap;flex-shrink:0}
.hq .task.urgency-urgent .due{color:var(--bad);background:var(--bad-bg);border-color:var(--bad-line)}
.hq .task.urgency-soon .due{color:var(--warn);background:var(--warn-bg);border-color:var(--warn-line)}
.hq .flag{background:var(--amber-bg);border:1px solid var(--amber-line);border-left:3px solid var(--amber);border-radius:0 12px 12px 0;padding:12px 16px;font-size:14.4px;line-height:1.5}
.hq .flag + .flag{margin-top:8px}
.hq .flag .fl{font-family:var(--mono);font-size:10.9px;letter-spacing:.08em;text-transform:uppercase;color:var(--amber-ink);font-weight:500;display:block;margin-bottom:3px}
.hq .up{display:flex;gap:13px;padding:9px 0;border-top:1px solid var(--line2);align-items:baseline}
.hq .up:first-of-type{border-top:none;padding-top:2px}
.hq .up .ud{font-family:var(--mono);text-transform:uppercase;font-size:12.1px;font-weight:600;color:var(--muted);min-width:48px;flex-shrink:0}
.hq .up .ut{font-size:15px;line-height:1.45}
.hq .up .ul{margin-left:auto;font-family:var(--mono);font-size:10.4px;color:var(--dot);text-transform:uppercase;letter-spacing:.06em;flex-shrink:0}
.hq .act{display:flex;gap:13px;padding:8px 0;border-top:1px solid var(--line2);font-size:14.4px}
.hq .act:first-of-type{border-top:none;padding-top:0}
.hq .act .ad{font-family:var(--mono);text-transform:uppercase;font-size:11.5px;font-weight:600;color:var(--dot);min-width:48px;flex-shrink:0;padding-top:2px}
.hq .act .ae{color:var(--muted);line-height:1.5}

/* gate */
.hq .gate{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--green);border-radius:0 12px 12px 0;padding:13px 17px}
.hq .gate + .gate{margin-top:10px}
.hq .gate .g{font-family:var(--mono);font-size:12.1px;letter-spacing:.05em;text-transform:uppercase;color:var(--green);font-weight:600}
.hq .gate p{margin:5px 0 0;font-size:15px;line-height:1.5;max-width:84ch}

/* arc */
.hq .arc-scroll{overflow-x:auto;padding-bottom:0}
.hq .arc-scroll::-webkit-scrollbar{height:12px}
.hq .arc-scroll::-webkit-scrollbar-track{background:var(--gray-hi);border-radius:10px}
.hq .arc-scroll::-webkit-scrollbar-thumb{background:var(--dot);border-radius:10px}
.hq .arc-scroll::-webkit-scrollbar-button{display:none;width:0;height:0}
.hq .arc-inner{position:relative}
.hq .qrow{position:relative;height:15px;margin-bottom:6px}
.hq .qrow span{position:absolute;font-family:var(--mono);font-size:9.8px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;opacity:.7}
.hq .arc-track{position:relative;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px 0}
.hq .arc-window{position:absolute;top:-1px;bottom:-1px;border:1.5px dotted var(--dot);border-radius:14px;background:rgba(255,255,255,.45);z-index:1}
.hq .arc-window .wl{position:absolute;top:-8px;left:10px;font-family:var(--mono);font-size:9.2px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:var(--paper);padding:0 6px}
.hq .arc-today{position:absolute;top:-6px;bottom:-6px;border-left:2px dashed var(--red);z-index:6}
.hq .arc-today span{position:absolute;top:-14px;left:50%;transform:translateX(-50%);font-family:var(--mono);font-size:9.8px;font-weight:600;color:var(--red);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.hq .arc-rows{display:flex;flex-direction:column;gap:7px;position:relative;z-index:3;padding:0 10px}
.hq .arc-row{display:flex}
.hq .ibar{position:relative;border-radius:9px;padding:10px 11px;display:flex;flex-direction:column;gap:6px;overflow:hidden;cursor:pointer;transition:box-shadow .12s;justify-content:center}
.hq .ibar:hover{box-shadow:0 0 0 2px var(--line)}
.hq .ibar.done{background:var(--gray-hi);border:1px solid var(--line2)}
.hq .ibar.live{background:var(--soft-black);border:1px solid var(--soft-black)}
.hq .ibar.next{background:#fff;border:1px solid var(--line)}
.hq .ibar .ihead{display:flex;align-items:center;gap:6px}
.hq .ibar .ino{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:5px;font-family:var(--mono);text-transform:uppercase;font-size:10.9px;font-weight:500;flex-shrink:0;background:rgba(0,0,0,.08)}
.hq .ibar .inm{font-size:10.9px;font-weight:650;line-height:1.25;letter-spacing:-.01em}
.hq .ibar .ijump{margin-left:auto;flex-shrink:0;font-size:14px;opacity:.55}
.hq .ibar .idesc{font-size:10px;line-height:1.3;opacity:.75;margin:0;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.hq .ibar.done .ino,.hq .ibar.done .inm{color:var(--ink)}
.hq .ibar.live .ino{background:rgba(255,255,255,.12)}
.hq .ibar.live .ino,.hq .ibar.live .inm,.hq .ibar.live .idesc,.hq .ibar.live .ijump{color:var(--on-dark)}
.hq .ibar.next .ino,.hq .ibar.next .inm{color:var(--ink)}
.hq .istatus-dot{position:absolute;top:7px;right:7px;width:7px;height:7px;border-radius:50%;flex-shrink:0}
.hq .ibar.done .istatus-dot{background:var(--good)}
.hq .ibar.live .istatus-dot{background:var(--warn)}
.hq .ibar.next .istatus-dot{background:var(--info)}
.hq .arc-key{display:flex;flex-wrap:wrap;gap:14px;margin-top:11px;font-size:12.6px;color:var(--muted)}
.hq .arc-key span{display:flex;align-items:center;gap:6px}
.hq .arc-key i{width:8px;height:8px;border-radius:50%;display:inline-block}
.hq .arc-key i.k-done{background:var(--good)}
.hq .arc-key i.k-live{background:var(--warn)}
.hq .arc-key i.k-next{background:var(--info)}
.hq .arc-key i.k-win{width:18px;height:11px;border-radius:4px;background:rgba(255,255,255,.6);border:1.5px dotted var(--dot)}

/* initiative cards */
.hq .init{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;scroll-margin-top:90px}
.hq .ihd{display:flex;align-items:flex-start;gap:12px;padding:18px 20px;cursor:pointer}
.hq .ihd:hover{background:var(--card)}
.hq .isq{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;font-family:var(--mono);text-transform:uppercase;font-size:13.8px;font-weight:500;flex-shrink:0;background:var(--ink);color:#fff}
.hq .ihd h3{font-size:18.4px;font-weight:680;letter-spacing:-.02em;line-height:1.25}
.hq .ihd .idesc{font-size:13.8px;color:var(--muted);margin-top:3px;line-height:1.5;max-width:66ch}
.hq .ihd .imeta{margin-left:auto;display:flex;align-items:center;gap:9px;flex-shrink:0}
.hq .ihd .itf{font-family:var(--mono);text-transform:uppercase;font-size:11.5px;color:var(--muted);white-space:nowrap}
.hq .caret{font-size:22px;color:var(--muted);transition:transform .15s;display:inline-block}
.hq .caret.open{transform:rotate(180deg)}
.hq .ibody{border-top:1px solid var(--line2);padding:16px 20px 20px}
.hq .why{background:var(--card);border:1px solid var(--line2);border-radius:12px;padding:12px 15px;margin-bottom:12px}
.hq .why .wl{font-family:var(--mono);font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;font-weight:500;margin-right:8px}
.hq .why p{display:inline;font-size:15px;color:var(--muted);line-height:1.55}
.hq .proj{display:flex;align-items:center;gap:9px;padding:11px 2px;border-top:1px solid var(--line2);flex-wrap:wrap}
.hq .proj:first-of-type{border-top:none;padding-top:2px}
.hq .pcode{font-family:var(--mono);text-transform:uppercase;font-size:10.9px;font-weight:500;color:var(--muted)}
.hq .pname{font-size:15px;font-weight:640;letter-spacing:-.01em}
.hq .ptf{font-family:var(--mono);text-transform:uppercase;font-size:10.9px;color:var(--muted);margin-left:auto;white-space:nowrap}

/* bench */
.hq .bench{background:var(--bench-bg);border:1.5px dotted var(--dot);border-radius:14px;padding:14px 17px}
.hq .bench h5{font-family:var(--mono);font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:9px}
.hq .bench .bgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
@media(max-width:620px){.hq .bench .bgrid{grid-template-columns:repeat(2,1fr)}}
.hq .bench .l{font-family:var(--mono);font-size:10.9px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
.hq .bench .v{font-family:var(--sans);font-size:17.3px;font-weight:600;margin-top:3px;letter-spacing:-.03em}

/* ramp */
.hq .lrow{display:grid;grid-template-columns:160px 1fr 104px;gap:14px;align-items:center;margin-bottom:10px}
@media(max-width:640px){.hq .lrow{grid-template-columns:1fr;gap:5px;margin-bottom:16px}}
.hq .lrow .ll{font-size:14.4px;font-weight:600;line-height:1.2}
.hq .lrow .ll span{display:block;font-size:12.1px;color:var(--muted);font-weight:400;margin-top:1px}
.hq .ltrack{position:relative;height:28px;background:var(--paper);border:1px solid var(--line2);border-radius:8px}
.hq .lfill{height:100%;border-radius:7px;display:flex;align-items:center;padding:0 10px;color:#fff;font-family:var(--mono);text-transform:uppercase;font-size:13.8px;font-weight:500;min-width:54px;background:var(--green)}
.hq .lwhen{font-family:var(--mono);text-transform:uppercase;font-size:12.1px;color:var(--muted);text-align:right;white-space:nowrap}

/* quarter view */
.hq .mhead{display:flex;align-items:center;gap:13px;flex-wrap:wrap}
.hq .mno{font-family:var(--mono);text-transform:uppercase;font-size:13.2px;font-weight:600;color:#fff;background:var(--ink);border-radius:8px;padding:5px 9px;letter-spacing:.03em}
.hq .mname{font-size:24.2px;font-weight:680;letter-spacing:-.025em}
.hq .mdates{font-family:var(--mono);text-transform:uppercase;font-size:12.1px;color:var(--muted);margin-left:auto}
.hq .ws{border-top:1px solid var(--line2);padding:32px 0}
.hq .ws:first-of-type{border-top:none;padding-top:4px}
.hq .ws .pri{display:inline-block;font-family:var(--mono);font-size:11.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--on-dark);background:var(--ink);border-radius:20px;padding:3px 10px}
.hq .ws .wt{font-size:18.4px;font-weight:660;letter-spacing:-.02em;margin:9px 0 4px}
.hq .ws .scope{font-size:15px;line-height:1.55;max-width:84ch}
.hq .ws .whyl{font-size:14.4px;color:var(--muted);line-height:1.55;margin-top:10px;max-width:84ch;background:var(--card);border-radius:12px;padding:12px 15px}
.hq .ws .whyl .lb{font-family:var(--mono);font-size:12.6px;letter-spacing:.06em;text-transform:uppercase;font-weight:500;color:var(--ink);margin-right:6px}
.hq .matrix-wrap{overflow-x:auto}
.hq table.matrix{width:100%;min-width:640px;border-collapse:separate;border-spacing:0}
.hq .matrix th{font-family:var(--mono);font-size:10.9px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:600;text-align:left;padding:0 8px 10px;border-bottom:1px solid var(--dot)}
.hq .matrix th.c{text-align:center;width:21%}
.hq .matrix td{padding:6px 7px;vertical-align:top;border-top:1px solid var(--line2)}
.hq .matrix tr:first-child td{border-top:none;padding-top:10px}
.hq .matrix .sector{font-size:14.4px;font-weight:650;white-space:nowrap;padding-left:2px}
.hq .matrix .sector span{display:block;font-family:var(--mono);text-transform:uppercase;font-size:10.9px;font-weight:400;color:var(--muted);margin-top:2px}
.hq .cell{display:flex;flex-direction:column;border-radius:10px;padding:9px 10px;border:1px solid transparent}
.hq .cell.up{background:#fff;border-color:var(--line)}
.hq .cell.hold{background:transparent;border:1px dashed var(--pink-line)}
.hq .cell.cont{background:var(--gray-hi);border-color:var(--line2)}
.hq .cell .v{font-size:14.4px;font-weight:670;letter-spacing:-.01em}
.hq .cell.hold .v,.hq .cell.cont .v{color:var(--muted)}
.hq .cell .s{font-size:12.1px;color:var(--muted);margin-top:2px;line-height:1.35}

/* scorecard */
.hq .sc-group-title{font-family:var(--sans);font-size:17.3px;font-weight:680;letter-spacing:-.015em;margin-bottom:10px}
.hq .sc-wrap{overflow-x:auto}
.hq table.sc{width:100%;min-width:680px;border-collapse:separate;border-spacing:0;font-size:15px}
.hq .sc th{font-family:var(--mono);font-size:10.9px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600;text-align:left;padding:8px 10px;border-bottom:1px solid var(--ink)}
.hq .sc td{padding:11px 10px;border-bottom:1px solid var(--line2);vertical-align:middle}
.hq .sc tr:last-child td{border-bottom:none}
.hq .sc .m{font-weight:650}
.hq .sc .num{font-family:var(--mono);text-transform:uppercase;font-variant-numeric:tabular-nums;font-weight:600}
.hq .sc .tgt{font-family:var(--mono);text-transform:uppercase;font-variant-numeric:tabular-nums;font-weight:500;color:var(--good)}
.hq .sc .nodata{font-family:var(--mono);text-transform:uppercase;font-size:11.5px;color:var(--dot)}
.hq .pill.trend-up{background:var(--good-bg);color:var(--good);border:1px solid var(--good-line)}
.hq .pill.trend-down{background:var(--bad-bg);color:var(--bad);border:1px solid var(--bad-line)}
.hq .pill.trend-flat{background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn-line)}
.hq .pill.trend-up .material-symbols-outlined,.hq .pill.trend-down .material-symbols-outlined,.hq .pill.trend-flat .material-symbols-outlined{font-size:14px}

/* decisions */
.hq .dec{border:1px solid var(--line);border-radius:14px;background:#fff;padding:16px 19px}
.hq .dec + .dec{margin-top:10px}
.hq .dec .dh{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.hq .dec .dd{font-family:var(--mono);text-transform:uppercase;font-size:12.1px;font-weight:600;color:var(--muted)}
.hq .dec .dt{font-size:16.7px;font-weight:660;letter-spacing:-.015em}
.hq .dec .db{font-size:14.4px;color:var(--muted);line-height:1.55;margin-top:6px;max-width:86ch}

/* dark closer + warn */
.hq .dep{background:var(--ink);color:#EDEBE4;border-radius:18px;padding:24px 26px}
.hq .dep .t{font-family:var(--mono);font-size:12.1px;letter-spacing:.12em;text-transform:uppercase;color:#C9A96A;font-weight:500}
.hq .dep h3{font-size:21.8px;font-weight:650;letter-spacing:-.02em;margin:9px 0 7px}
.hq .dep p{font-size:15.5px;color:#B9B7B0;line-height:1.55;max-width:78ch}
.hq .warn-tri{vertical-align:middle;margin-left:6px;flex-shrink:0}

/* artifacts */
.hq .artifact-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin-top:20px}
.hq .artifact-tile{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 16px;cursor:pointer;transition:box-shadow .12s}
.hq .artifact-tile:hover{box-shadow:0 0 0 2px var(--line)}
.hq .at-icon{display:block;font-size:22px;color:var(--muted);margin-bottom:10px}
.hq .at-title{font-size:16.1px;font-weight:660;letter-spacing:-.01em;line-height:1.3}
.hq .at-date{font-size:11.5px;color:var(--muted);margin-top:8px}
.hq .artifact-back{display:inline-block;margin-bottom:14px;font-family:var(--sans);font-size:13.2px;font-weight:600;color:var(--muted);cursor:pointer;background:none;border:none;padding:0}
.hq .artifact-back:hover{color:var(--ink)}
.hq .artifact-body{margin-top:20px;font-size:15.5px;line-height:1.6;max-width:78ch}
.hq .artifact-body h1{font-size:23px;font-weight:700;letter-spacing:-.02em;margin:22px 0 8px}
.hq .artifact-body h1:first-child{margin-top:0}
.hq .artifact-body h2{font-size:18.4px;font-weight:700;letter-spacing:-.015em;margin:20px 0 6px}
.hq .artifact-body h3{font-size:15.5px;font-weight:700;margin:16px 0 4px}
.hq .artifact-body p{margin:0 0 10px}
.hq .artifact-body ul,.hq .artifact-body ol{margin:0 0 10px;padding-left:22px}
.hq .artifact-body li{margin-bottom:5px}
.hq .artifact-body strong{font-weight:700}
.hq .artifact-body table{width:100%;border-collapse:collapse;margin:10px 0;font-size:15px}
.hq .artifact-body th,.hq .artifact-body td{text-align:left;padding:6px 9px;border:1px solid var(--line)}
.hq .artifact-body th{font-weight:700;background:var(--card)}
.hq .artifact-body code{font-family:var(--mono);font-size:13.8px;background:var(--gray-hi);padding:1px 5px;border-radius:4px}
.hq .artifact-body hr{border:none;border-top:1px solid var(--line2);margin:16px 0}

/* inline editing */
.hq .editable{cursor:text;border-bottom:1px dashed transparent;transition:border-color .12s;border-radius:3px}
.hq .editable:hover{border-color:var(--dot)}
.hq .editable.has-draft{background:var(--amber-bg)}
.hq .draft-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--amber);margin-left:5px;vertical-align:middle}
.hq .editing-wrap{display:block;margin:2px 0}
.hq .editing-wrap textarea,.hq .editing-wrap input{width:100%;font:inherit;color:inherit;border:1px solid var(--line);border-radius:8px;padding:7px 9px;background:#fff}
.hq .editing-actions{display:flex;gap:8px;margin-top:6px}
.hq .editing-actions button{font-family:var(--sans);font-size:12.6px;font-weight:600;padding:4px 11px;border-radius:20px;border:none;cursor:pointer}
.hq .editing-actions button:first-child{background:var(--green);color:#fff}
.hq .editing-actions button:last-child{background:var(--gray-hi);color:var(--muted)}
.hq .drafts-pill{font-family:var(--sans);font-size:12.1px;font-weight:600;background:var(--amber);color:#fff;border-radius:20px;padding:4px 11px;white-space:nowrap;cursor:pointer;border:none}
.hq .drafts-panel{position:fixed;top:0;right:0;bottom:0;width:420px;max-width:92vw;background:#fff;border-left:1px solid var(--line);box-shadow:-8px 0 24px rgba(0,0,0,.08);z-index:100;display:flex;flex-direction:column}
.hq .drafts-panel .dp-head{display:flex;align-items:center;gap:10px;padding:18px 20px;border-bottom:1px solid var(--line2)}
.hq .drafts-panel .dp-head h4{font-size:17.3px;font-weight:700}
.hq .drafts-panel .dp-close{margin-left:auto;background:none;border:none;font-size:20.7px;color:var(--muted);cursor:pointer}
.hq .drafts-panel .dp-list{flex:1;overflow-y:auto;padding:14px 20px}
.hq .drafts-panel .dp-item{border:1px solid var(--line2);border-radius:12px;padding:12px 14px;margin-bottom:10px}
.hq .drafts-panel .dp-label{font-family:var(--mono);font-size:10.9px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-bottom:6px}
.hq .drafts-panel .dp-old{font-size:13.8px;color:var(--muted);text-decoration:line-through;margin-bottom:3px}
.hq .drafts-panel .dp-new{font-size:14.4px;color:var(--ink)}
.hq .drafts-panel .dp-actions{display:flex;gap:8px;margin-top:9px}
.hq .drafts-panel .dp-actions button{font-family:var(--sans);font-size:12.1px;font-weight:600;padding:4px 10px;border-radius:20px;border:none;cursor:pointer}
.hq .drafts-panel .dp-actions button.publish{background:var(--green);color:#fff}
.hq .drafts-panel .dp-actions button.discard{background:transparent;color:var(--red);border:1px solid var(--pink-line)}
.hq .drafts-panel .dp-foot{padding:14px 20px;border-top:1px solid var(--line2)}
.hq .drafts-panel .dp-foot button{width:100%;padding:10px;border-radius:10px;border:none;background:var(--ink);color:#fff;font-family:var(--sans);font-size:13.2px;font-weight:600;cursor:pointer}
.hq .drafts-panel .dp-empty{color:var(--muted);font-size:14.4px;padding:20px 0;text-align:center}
.hq .drafts-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.15);z-index:99}

.hq :focus-visible{outline:2px solid var(--green);outline-offset:3px;border-radius:4px}
@media(prefers-reduced-motion:reduce){.hq *{transition:none!important}}

/* responsive shell */
@media(max-width:820px){
  .hq{flex-direction:column}
  .hq .side{width:100%;height:auto;position:static;flex-direction:column}
  .hq .side .brand{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(216,213,204,.14)}
  .hq .side .cl{margin-top:0}
  .hq nav{flex-direction:row;overflow-x:auto;padding:8px 12px;gap:4px}
  .hq .nav-lbl,.hq .side .sfoot{display:none}
  .hq .ni{white-space:nowrap;width:auto}
  .hq .top{padding:12px 16px;flex-wrap:wrap}
  .hq .ask{order:3;max-width:none;width:100%;white-space:normal}
  .hq .content{padding:22px 16px 70px}
}
`;

/* ─── ATOMS ──────────────────────────────────────────────────────────────── */
const STATUS = {
  "in-progress": { label: "In progress", cls: "prog" },
  "on-track": { label: "On track", cls: "ok" },
  complete: { label: "Complete", cls: "done" },
  upcoming: { label: "Upcoming", cls: "next" },
  "at-risk": { label: "Needs focus", cls: "risk" },
  pending: { label: "Baseline TBD", cls: "pend" },
};
const Chip = ({ status }) => {
  const s = STATUS[status] || STATUS.upcoming;
  return <span className={`pill ${s.cls}`}>{s.label}</span>;
};
const TagPill = ({ tag, tags }) => <span className={`tagtext ${tags[tag] || "t-product"}`}>{tag}</span>;

const WarnTri = ({ title }) => (
  <svg className="warn-tri" width="13" height="13" viewBox="0 0 24 24" role="img" aria-label="risk">
    <title>{title}</title>
    <path d="M12 3 L22 20 L2 20 Z" fill="#F5C518" stroke="#1a1a1a" strokeWidth="1.4" strokeLinejoin="round" />
    <rect x="11.1" y="9" width="1.8" height="5.5" rx=".9" fill="#1a1a1a" />
    <circle cx="12" cy="17" r="1.05" fill="#1a1a1a" />
  </svg>
);

/* ─── SHARED BLOCKS ──────────────────────────────────────────────────────── */
// Best-effort numeric read from a display string ("$4.3k", "1.2%", "TBD" ->
// null). Works as a ratio since now/target for a given metric always share
// the same unit/suffix.
function parseNum(s) {
  const m = String(s).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}
function dialPct(now, target) {
  const n = parseNum(now), t = parseNum(target);
  if (n === null || t === null || t === 0) return 0;
  return Math.max(0, Math.min(100, (n / t) * 100));
}
function dialColor(pct) {
  if (pct <= 0) return "var(--muted)";
  if (pct < 33) return "var(--bad)";
  if (pct < 66) return "var(--warn)";
  return "var(--good)";
}
const Dial = ({ now, target, hero }) => {
  const pct = dialPct(now, target);
  const color = dialColor(pct);
  const track = hero ? "rgba(255,255,255,.28)" : "var(--line)";
  return (
    <div className="dialcol">
      <div className="ndial-inner" style={{ background: `conic-gradient(${color} ${pct}%, ${track} 0)` }}>
        <div className="ndial-hole"><span className="ndial-pct mono" style={{ color }}>{pct > 0 ? `${Math.round(pct)}%` : "—"}</span></div>
      </div>
    </div>
  );
};

const NorthStarRow = ({ ns }) => {
  return (
    <div className="heror">
      <div className="ntile n-hero">
        <Dial now={ns.hero.now} target={ns.hero.target} hero />
        <div className="infocol">
          <div className="nlabel">Total Monthly Revenue</div>
          <div className="nvals">
            <span className="nnow mono">{ns.hero.now}</span>
            <span className="narrow">→</span>
            <span className="ntarget mono">{ns.hero.target}</span>
          </div>
        </div>
      </div>
      {ns.drivers.map((d) => (
        <div key={d.label} className="ntile drv">
          <Dial now={d.now} target={d.target} />
          <div className="infocol">
            <div className="nlabel">{d.label}</div>
            <div className="nvals">
              <span className="nnow mono">{d.now}</span>
              <span className="narrow">→</span>
              <span className="ntarget mono">{d.target}</span>
            </div>
            <div className="driver">
              Driven by: {d.driven.map((x, i) => <span key={x}>{i > 0 && <span className="sep">·</span>}{x}</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Fixed px-per-month rather than a %-of-full-range layout, so the visible
// window is a real ~12 months on desktop (less on narrower screens, purely
// because the container is narrower) with horizontal scroll for the rest.
const PX_PER_MONTH = 85;
const PX_PER_DAY = PX_PER_MONTH / 30.44;

const Arc = ({ data, onJump }) => {
  const ps = new Date(data.arc.start), pe = new Date(data.arc.end);
  const totalWidth = ((pe - ps) / 86400000) * PX_PER_DAY;
  const xPos = (d) => ((new Date(d) - ps) / 86400000) * PX_PER_DAY;
  const todayX = xPos(new Date());
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = Math.max(0, todayX - 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quarters = [
    ["Q4 '25", "2025-10-01"], ["Q1 '26", "2026-01-01"], ["Q2 '26", "2026-04-01"],
    ["Q3 '26", "2026-07-01"], ["Q4 '26", "2026-10-01"], ["Q1 '27", "2027-01-01"],
    ["Q2 '27", "2027-04-01"], ["Q3 '27", "2027-07-01"], ["Q4 '27", "2027-10-01"],
  ];
  const cls = (s) => (s === "complete" ? "done" : s === "in-progress" ? "live" : "next");
  const wl = xPos(data.window.start), ww = xPos(data.window.end) - wl;
  return (
    <div>
      <div className="arc-scroll" ref={scrollRef}><div className="arc-inner" style={{ width: totalWidth }}>
        <div className="qrow">{quarters.map(([l, d]) => <span key={l} style={{ left: xPos(d) }}>{l}</span>)}</div>
        <div className="arc-track">
          <div className="arc-window" style={{ left: wl, width: ww }}><span className="wl">{data.window.label}</span></div>
          <div className="arc-today" style={{ left: todayX }}><span>Today</span></div>
          <div className="arc-rows">
            {data.initiatives.map((init) => {
              const il = xPos(init.timeframe.start);
              const iw = Math.max(90, xPos(init.timeframe.end) - il);
              return (
                <div key={init.id} className="arc-row">
                  <div style={{ width: il, flexShrink: 0 }} />
                  <div className={`ibar ${cls(init.status)}`} style={{ width: iw }}
                    onClick={() => onJump && onJump(init.id)} role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && onJump && onJump(init.id)}>
                    <span className="istatus-dot" />
                    <div className="ihead">
                      <span className="ino">{init.code}</span>
                      <span className="inm">{init.name}</span>
                      <span className="ijump material-symbols-outlined" title="Jump to detail">expand_content</span>
                    </div>
                    <p className="idesc">{init.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="arc-key">
          <span><i className="k-done" />Complete</span>
          <span><i className="k-live" />In progress</span>
          <span><i className="k-next" />Upcoming</span>
          <span><i className="k-win" />Rolling window · refreshed quarterly</span>
        </div>
      </div></div>
    </div>
  );
};

function decisionUrgency(dueDate) {
  if (!dueDate) return "gray";
  const days = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
  if (days <= 7) return "urgent";
  if (days <= 14) return "soon";
  return "gray";
}

/* ─── VIEWS ──────────────────────────────────────────────────────────────── */
const Pulse = ({ data, go }) => (
  <div>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        <h1 className="h-page">The pulse</h1>
        <p className="lede">Where the program stands right now: the numbers that matter, what needs you, and what lands next. Refreshed as the work moves.</p>
        <button className="btn-cta" style={{ marginTop: 14 }} onClick={() => go("roadmap")}>
          See Full Roadmap<span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>

    <div className="divider" />
    <span className="lbl" style={{ display: "block", marginBottom: 10 }}>Key Growth Metrics</span>

    <div className="tile north-star-goal" style={{ marginBottom: 14 }}>
      <strong>North Star Goal:</strong> $500K ARR by Q1 2027
    </div>

    <NorthStarRow ns={data.northStar} />

    <div className="sect grid2">
      <div className="card pulse-tile" style={{ display: "flex", flexDirection: "column" }}>
        <span className="lbl" style={{ display: "block", marginBottom: 20 }}>What's next</span>
        {data.upNext.map((u) => (
          <div key={u.id} className="up">
            <span className="ud mono">{u.date}</span>
            <span className="ut">
              <EditableText table="action_items" recordId={u.id} field="body" value={u.text} label={`Up next (${u.date}) · Text`} />
            </span>
            <span className="ul mono">{u.lane}</span>
          </div>
        ))}
        <button className="btn-cta" style={{ marginTop: 16, alignSelf: "flex-start" }} onClick={() => go("quarter")}>
          View Quarterly Plan<span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      <div className="card pulse-tile" style={{ display: "flex", flexDirection: "column" }}>
        <span className="lbl" style={{ display: "block", marginBottom: 20 }}>Open decisions · {data.needsYou.length}</span>
        {data.needsYou.map((t) => (
          <div key={t.id} className={`task urgency-${decisionUrgency(t.dueDate)}`}>
            <span className="tk" />
            <div style={{ minWidth: 0 }}>
              <div className="tt">
                <EditableText table="decisions" recordId={t.id} field="title" value={t.title} label="Open decisions · Title" />
              </div>
              <div className="td">
                <EditableText table="decisions" recordId={t.id} field="body" value={t.detail} label="Open decisions · Detail" multiline />
              </div>
            </div>
            <span className="due mono">by {t.due}</span>
          </div>
        ))}
        <button className="btn-cta" style={{ marginTop: 16, alignSelf: "flex-start" }} onClick={() => go("decisions")}>
          See Decisions Log<span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>

    <div className="sect">
      <div className="card pulse-tile">
        <span className="lbl" style={{ display: "block", marginBottom: 16 }}>Recent activity</span>
        {data.activity.map((a) => (
          <div key={a.id} className="act">
            <span className="ad mono">{a.date}</span>
            <span className="ae">
              <EditableText table="action_items" recordId={a.id} field="body" value={a.entry} label={`Activity (${a.date}) · Entry`} />
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const InitiativeCard = ({ init, jumpSeq, tags }) => {
  const [open, setOpen] = useState(init.status === "in-progress");
  useEffect(() => {
    if (jumpSeq != null) setOpen(true);
  }, [jumpSeq]);
  const statusCls = STATUS[init.status]?.cls || "next";
  return (
    <div className={`init ${init.status === "complete" ? "is-done" : ""}`} id={init.id}>
      <div className="ihd" onClick={() => setOpen(!open)} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}>
        <span className={`isq ${statusCls}`}>{init.code}</span>
        <div style={{ minWidth: 0 }}>
          <h3>{init.name}</h3>
          <div className="idesc" onClick={(e) => e.stopPropagation()}>
            <EditableText table="initiatives" recordId={init.id} field="description" value={init.desc} label={`Initiative ${init.code} · Description`} />
          </div>
        </div>
        <div className="imeta">
          <span className="itf mono">{init.timeframe.label}</span>
          <Chip status={init.status} />
          <span className={`caret material-symbols-outlined ${open ? "open" : ""}`}>expand_more</span>
        </div>
      </div>
      {open && (
        <div className="ibody">
          <div className="why">
            <span className="wl">Why</span>
            <p><EditableText table="initiatives" recordId={init.id} field="why" value={init.why} label={`Initiative ${init.code} · Why`} multiline /></p>
          </div>
          {init.projects.map((p) => (
            <div key={p.code} className="proj">
              <span className="pcode mono">{p.code}</span>
              <span className="pname">{p.name}</span>
              {p.tags.map((t) => <TagPill key={t} tag={t} tags={tags} />)}
              <span className="ptf mono">{p.tf}</span>
              <Chip status={p.status} />
            </div>
          ))}
          <div className="bench" style={{ marginTop: 12 }}>
            <h5>Success looks like</h5>
            <div className="bgrid">
              {init.bench.map((b) => <div key={b.l}><div className="l">{b.l}</div><div className="v mono">{b.v}</div></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Roadmap = ({ data }) => {
  const [jump, setJump] = useState(null);
  const [descOpen, setDescOpen] = useState(false);
  const initiativeRefs = useRef({});

  function handleJump(id) {
    // a fresh seq every click (even repeat clicks on the same tile) so the
    // accordion always re-opens, but stays independently closable afterward
    setJump((prev) => ({ id, seq: (prev?.seq ?? 0) + 1 }));
    requestAnimationFrame(() => initiativeRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div>
      <h1 className="h-page">{data.program.headline[0]} {data.program.headline[1]}</h1>
      <p className={`lede ${descOpen ? "" : "clamp2"}`}>
        <EditableText table="programs" recordId={data.program.id} field="thesis" value={data.program.thesis} label="Program · Thesis" multiline />{" "}
        What sits inside the rolling window is committed; what sits beyond it is directional and firms up at each quarterly review.
      </p>
      <button className="read-more" onClick={() => setDescOpen(!descOpen)}>{descOpen ? "Show less" : "Read more"}</button>

      <div className="divider" />

      <div className="sect" style={{ marginTop: 0 }}>
        <span className="lbl" style={{ display: "block", marginBottom: 12 }}>The arc · {data.program.timeframe}</span>
        <Arc data={data} onJump={handleJump} />
      </div>

      <div className="sect">
        <span className="lbl" style={{ display: "block", marginBottom: 12 }}>Phase by phase breakdown</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.initiatives.map((init) => (
            <div key={init.id} ref={(el) => { initiativeRefs.current[init.id] = el; }}>
              <InitiativeCard init={init} jumpSeq={jump?.id === init.id ? jump.seq : null} tags={data.tags} />
            </div>
          ))}
        </div>
      </div>

      <div className="sect">
        <span className="lbl" style={{ display: "block", marginBottom: 12 }}>Why channels launch in this order</span>
        <div className="card">
          <p style={{ fontSize: 14.4, color: "var(--muted)", marginBottom: 16, maxWidth: "80ch", lineHeight: 1.5 }}>{data.ramp.sub}</p>
          {data.ramp.rows.map((r) => (
            <div key={r.label} className="lrow">
              <div className="ll">{r.label}<span>{r.sub}</span></div>
              <div className="ltrack"><div className="lfill" style={{ width: `${r.width}%` }}>{r.val}</div></div>
              <div className="lwhen mono">{r.when}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sect dep">
        <div className="t">Beyond this program</div>
        <h3>What the foundation makes possible</h3>
        <p>Influencer and affiliate programs once revenue supports creator partnerships, paid scaled on proven creative, Amazon expansion, Whole Foods LEAP and regional retail with multi-channel data behind the pitch, a seasonal flavor drop cadence, and community built around the mental health mission. Each lands harder because of what this roadmap builds first.</p>
      </div>
    </div>
  );
};

const Quarter = ({ data }) => {
  const q = data.quarter;
  return (
    <div>
      <div className="mhead">
        <span className="mno mono">{q.code}</span>
        <span className="mname">{q.name}</span>
        <span className="mdates mono">{q.dates}</span>
      </div>
      <p className="lede" style={{ marginTop: 12 }}>
        <EditableText table="quarters" recordId={q.id} field="focus" value={q.focus} label="Quarter · Focus" multiline />
      </p>

      <div className="sect">
        <span className="lbl" style={{ display: "block", marginBottom: 4 }}>Where the work goes</span>
        <div className="card" style={{ paddingTop: 14, paddingBottom: 12 }}>
          {q.priorities.map((w) => (
            <div key={w.id} className="ws">
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                <span className="pri">{w.pri}</span>
                {w.tags?.map((t) => <TagPill key={t} tag={t} tags={data.tags} />)}
              </div>
              <div className="wt">
                <EditableText table="priorities" recordId={w.id} field="title" value={w.title} label={`${w.pri} · Title`} />
              </div>
              <div className="scope">
                <EditableText table="priorities" recordId={w.id} field="scope" value={w.scope} label={`${w.pri} · Scope`} multiline />
              </div>
              <div className="whyl">
                <span className="lb">Why</span>
                <EditableText table="priorities" recordId={w.id} field="why" value={w.why} label={`${w.pri} · Why`} multiline />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sect">
        <span className="lbl" style={{ display: "block", marginBottom: 12 }}>Delivery cadence</span>
        <div className="card">
          <div className="matrix-wrap">
            <table className="matrix">
              <thead><tr>
                <th>Lane</th><th className="c">July</th><th className="c">August</th><th className="c">September</th><th className="c" style={{ color: "var(--dot)" }}>Continuing</th>
              </tr></thead>
              <tbody>
                {q.matrix.lanes.map((l) => (
                  <tr key={l.name}>
                    <td className="sector">{l.name}<span>{l.sub}</span></td>
                    {l.cells.map((c, i) => (
                      <td key={i}><div className={`cell ${c.k}`}><div className="v">{c.v}</div><div className="s">{c.s}</div></div></td>
                    ))}
                    <td><div className={`cell ${l.cont.k}`}><div className="v">{l.cont.v}</div><div className="s">{l.cont.s}</div></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="sect">
        <div className="bench">
          <h5>Q3 Benchmarks</h5>
          <div className="bgrid">
            {q.bench.map((b) => <div key={b.l}><div className="l">{b.l}</div><div className="v mono">{b.v}</div></div>)}
          </div>
        </div>
        <p style={{ fontSize: 13.8, color: "var(--muted)", marginTop: 12, lineHeight: 1.55, maxWidth: "84ch" }}>
          The monthly plan under this quarter lives in ClickUp with the shared dashboard: tasks, owners, dates, and deliverables. This view stays at the level a founder should be flying at.
        </p>
      </div>
    </div>
  );
};

function trendInfo(spark) {
  if (!spark || spark.length < 2) return null;
  const prev = spark[spark.length - 2], curr = spark[spark.length - 1];
  if (!prev) return null;
  const pct = ((curr - prev) / Math.abs(prev)) * 100;
  if (Math.abs(pct) < 1) return { dir: "flat", pct: 0 };
  return { dir: pct > 0 ? "up" : "down", pct: Math.abs(pct) };
}
const TREND_ICON = { up: "trending_up", down: "trending_down", flat: "trending_flat" };
const TrendPill = ({ spark }) => {
  const t = trendInfo(spark);
  if (!t) return <span className="nodata mono">—</span>;
  return (
    <span className={`pill trend-${t.dir}`}>
      {Math.round(t.pct)}%<span className="material-symbols-outlined">{TREND_ICON[t.dir]}</span>
    </span>
  );
};

const Scorecard = ({ data }) => (
  <div>
    <h1 className="h-page">Scorecard</h1>
    <p className="lede">The full metric tree behind the north star. Today these values update at the monthly review; the sources marked below wire in live as each channel launches, and threshold breaches raise flags on the pulse automatically.</p>
    <div className="sect" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {data.scorecard.map((g) => (
        <div key={g.group} className="card" style={{ paddingTop: 16 }}>
          <h3 className="sc-group-title">{g.group}</h3>
          <div className="sc-wrap">
            <table className="sc">
              <thead><tr>
                <th style={{ width: "26%" }}>Metric</th><th>Now</th><th>Target</th><th>Trend</th><th>Status</th><th>Source</th><th>Last updated</th>
              </tr></thead>
              <tbody>
                {g.rows.map((r) => {
                  const src = data.sources[r.src];
                  return (
                    <tr key={r.m}>
                      <td className="m">{r.m}{r.warn && <WarnTri title={r.warn} />}</td>
                      <td className="num">
                        <EditableText table="metrics" recordId={r.id} field="now_value" value={r.now} label={`${g.group} · ${r.m}`} />
                      </td>
                      <td className="tgt">{r.target}</td>
                      <td><TrendPill spark={r.spark} /></td>
                      <td><Chip status={r.status} /></td>
                      <td>
                        <span className="pill src">
                          {src.live === null ? null : <span className={src.live ? "dot-live" : "dot-soon"} />}
                          {src.label}{src.live === false ? " · wiring" : ""}
                        </span>
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: 13.8 }}>
                        {src.live ? "Auto-synced" : (r.lastUpdated ?? "Not yet updated")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Decisions = ({ data }) => {
  const loggedDecisions = data.decisions.filter((d) => d.status !== "open");
  return (
    <div>
      <h1 className="h-page">Decisions</h1>
      <p className="lede">The program's memory: every meaningful call, when it was made, and the reasoning behind it. Six months from now, "why are we doing it this way?" gets answered here instead of re-litigated.</p>

      <div className="sect">
        <span className="lbl" style={{ display: "block", marginBottom: 12 }}>Open decisions · {data.needsYou.length}</span>
        {data.needsYou.map((t) => (
          <div key={t.id} className={`task urgency-${decisionUrgency(t.dueDate)}`}>
            <span className="tk" />
            <div style={{ minWidth: 0 }}>
              <div className="tt">
                <EditableText table="decisions" recordId={t.id} field="title" value={t.title} label="Open decisions · Title" />
              </div>
              <div className="td">
                <EditableText table="decisions" recordId={t.id} field="body" value={t.detail} label="Open decisions · Detail" multiline />
              </div>
            </div>
            <span className="due mono">by {t.due}</span>
          </div>
        ))}
      </div>

      <div className="sect">
        <span className="lbl" style={{ display: "block", marginBottom: 12 }}>Open · needs a call</span>
        {data.flags.map((f) => (
          <div key={f.id} className="flag">
            <span className="fl">{f.label}</span>
            <EditableText table="action_items" recordId={f.id} field="body" value={f.text} label={`Flag · ${f.label}`} multiline />
          </div>
        ))}
      </div>

      <div className="sect">
        <span className="lbl" style={{ display: "block", marginBottom: 12 }}>Decision log</span>
        {loggedDecisions.map((d) => (
          <div key={d.id} className="dec">
            <div className="dh">
              <span className="dd mono">{d.date}</span>
              <span className="dt">
                <EditableText table="decisions" recordId={d.id} field="title" value={d.title} label={`Decision (${d.date}) · Title`} />
              </span>
              <span className={`pill ${d.status === "active" ? "prog" : "done"}`} style={{ marginLeft: "auto" }}>{d.status}</span>
            </div>
            <div className="db">
              <EditableText table="decisions" recordId={d.id} field="body" value={d.body} label={`Decision (${d.date}) · Body`} multiline />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Artifacts = ({ data }) => {
  const [openId, setOpenId] = useState(null);
  const open = data.artifacts.find((a) => a.id === openId);

  if (open) {
    return (
      <div>
        <button className="artifact-back" onClick={() => setOpenId(null)}>← All artifacts</button>
        <h1 className="h-page">{open.title}</h1>
        <p className="lede" style={{ marginBottom: 4 }}>Last updated {open.updatedAt}</p>
        <div className="card artifact-body" dangerouslySetInnerHTML={{ __html: open.html }} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="h-page">Artifacts</h1>
      <p className="lede">Research and strategy docs that support the roadmap but don't belong in it — reference material, not something to track against.</p>
      <div className="artifact-grid">
        {data.artifacts.length === 0 && <p style={{ color: "var(--muted)", fontSize: 15.5 }}>Nothing here yet.</p>}
        {data.artifacts.map((a) => (
          <div key={a.id} className="artifact-tile" onClick={() => setOpenId(a.id)} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setOpenId(a.id)}>
            <span className="at-icon material-symbols-outlined">description</span>
            <div className="at-title">{a.title}</div>
            <div className="at-date mono">{a.updatedAt}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── SHELL ──────────────────────────────────────────────────────────────── */
const NAV = [
  { id: "pulse", icon: "monitor_heart", label: "Pulse" },
  { id: "roadmap", icon: "map", label: "Roadmap" },
  { id: "quarter", icon: "calendar_month", label: "This quarter" },
  { id: "scorecard", icon: "bar_chart", label: "Scorecard" },
  { id: "decisions", icon: "gavel", label: "Decisions" },
  { id: "artifacts", icon: "description", label: "Artifacts" },
];
const TITLES = { pulse: "Pulse", roadmap: "Roadmap", quarter: "This quarter", scorecard: "Scorecard", decisions: "Decisions", artifacts: "Artifacts" };

const ClientSwitcher = ({ clients, current, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="switcher" ref={ref}>
      <button
        type="button"
        className="switcher-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{current.name}</span>
        <span className="material-symbols-outlined">expand_more</span>
      </button>
      {open && (
        <ul className="switcher-menu" role="listbox">
          {clients.map((c) => (
            <li
              key={c.id}
              role="option"
              aria-selected={c.id === current.id}
              className={c.id === current.id ? "on" : ""}
              onClick={() => {
                setOpen(false);
                onChange(c.id);
              }}
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const DraftsPanel = ({ draftsList, onClose, onChanged }) => {
  const [busyId, setBusyId] = useState(null);
  const [busyAll, setBusyAll] = useState(false);

  async function handlePublish(id) {
    setBusyId(id);
    try {
      await publishDraft(id);
      onChanged();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDiscard(id) {
    setBusyId(id);
    try {
      await discardDraft(id);
      onChanged();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handlePublishAll() {
    setBusyAll(true);
    try {
      await publishAllDrafts(draftsList[0]?.program_id);
      onChanged();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyAll(false);
    }
  }

  return (
    <>
      <div className="drafts-backdrop" onClick={onClose} />
      <div className="drafts-panel">
        <div className="dp-head">
          <h4>Unpublished drafts</h4>
          <button className="dp-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="dp-list">
          {draftsList.length === 0 && <div className="dp-empty">Nothing pending.</div>}
          {draftsList.map((d) => (
            <div key={d.id} className="dp-item">
              <div className="dp-label">{d.label || `${d.table_name} · ${d.field_name}`}</div>
              <div className="dp-old">{d.old_value}</div>
              <div className="dp-new">{d.new_value}</div>
              <div className="dp-actions">
                <button className="publish" disabled={busyId === d.id} onClick={() => handlePublish(d.id)}>
                  {busyId === d.id ? "…" : "Publish"}
                </button>
                <button className="discard" disabled={busyId === d.id} onClick={() => handleDiscard(d.id)}>
                  Discard
                </button>
              </div>
            </div>
          ))}
        </div>
        {draftsList.length > 0 && (
          <div className="dp-foot">
            <button onClick={handlePublishAll} disabled={busyAll}>
              {busyAll ? "Publishing…" : `Publish all ${draftsList.length}`}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default function FonderHQ({ data, drafts, draftsList, programId, profile, clients }) {
  const [view, setView] = useState("pulse");
  const [draftsPanelOpen, setDraftsPanelOpen] = useState(false);
  const router = useRouter();
  const isAdmin = profile?.role === "admin";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <EditContext.Provider value={{ isAdmin, drafts, programId, onSaved: () => router.refresh() }}>
    <div className="hq">
      <style>{CSS}</style>

      {draftsPanelOpen && (
        <DraftsPanel
          draftsList={draftsList}
          onClose={() => setDraftsPanelOpen(false)}
          onChanged={() => {
            router.refresh();
          }}
        />
      )}

      <aside className="side">
        <div className="brand">
          <div className="logo">FONDER · HQ</div>
          <div className="cl">
            <span className="csq mono" style={data.client.iconColor ? { background: data.client.iconColor, color: "var(--ink)" } : undefined}>
              {data.client.name[0]}
            </span>
            <div className="cn">{data.client.name}</div>
          </div>
          {clients && clients.length > 1 && (
            <ClientSwitcher
              clients={clients}
              current={data.client}
              onChange={(id) => router.push(`/?client=${id}`)}
            />
          )}
        </div>
        <nav>
          <div className="nav-lbl">Growth engine</div>
          {NAV.map((n) => (
            <button key={n.id} className={`ni ${view === n.id ? "on" : ""}`} onClick={() => setView(n.id)}>
              <span className="icon material-symbols-outlined">{n.icon}</span>{n.label}
              {n.id === "pulse" && <span className="badge mono">{data.needsYou.length}</span>}
            </button>
          ))}
          {isAdmin && (
            <>
              <div className="nav-lbl" style={{ marginTop: 8 }}>Admin</div>
              <button className="ni" onClick={() => router.push("/admin/users")}>
                <span className="icon material-symbols-outlined">group</span>Manage users
              </button>
              <button className="ni" onClick={() => router.push("/admin/sources")}>
                <span className="icon material-symbols-outlined">database</span>Data sources
              </button>
            </>
          )}
        </nav>
        <div className="sfoot">
          <div>Program <b>{data.program.timeframe}</b></div>
          <div>Updated <b>{data.program.updated}</b></div>
          <div>Next review <b>{data.program.nextReview}</b></div>
          {profile?.email && <div>Signed in as <b>{profile.email}</b></div>}
          <button className="signout" onClick={handleSignOut}>Sign out</button>
        </div>
      </aside>

      <div className="main">
        <div className="top">
          <span className="vt">{TITLES[view]}</span>
          <div className="ask" aria-label="Ask the brand brain — coming soon">
            <span className="mono" style={{ fontSize: 12.6, color: "var(--muted)", fontWeight: 700 }}>✳</span>
            Ask the brand brain: why is this quarter about conversion?
            <span className="pill pend" style={{ marginLeft: "auto" }}>Coming soon</span>
          </div>
          <div className="ctx">
            {isAdmin && draftsList.length > 0 && (
              <button className="drafts-pill" onClick={() => setDraftsPanelOpen(true)}>
                Drafts · {draftsList.length}
              </button>
            )}
            <span className="qchip mono">{data.program.quarter} · {data.program.week}</span>
          </div>
        </div>
        <div className="content">
          {view === "pulse" && <Pulse data={data} go={setView} />}
          {view === "roadmap" && <Roadmap data={data} />}
          {view === "quarter" && <Quarter data={data} />}
          {view === "scorecard" && <Scorecard data={data} />}
          {view === "decisions" && <Decisions data={data} />}
          {view === "artifacts" && <Artifacts data={data} />}
        </div>
      </div>
    </div>
    </EditContext.Provider>
  );
}
