import React from "react";
import "./LoadingAnimations.css";

/**
 * Six "Duolingo-style" character loaders. Each one is its own bespoke
 * SVG character (head with hair, face, body, arms, legs) doing a
 * thematic action. Display-only for now.
 */

/* ───────────────────────────────────────────────
   1. Maya — purple-haired cart pusher
   ─────────────────────────────────────────────── */
function CartLoader() {
  return (
    <svg viewBox="0 0 240 220" className="la-mascot la-anim-cart" aria-hidden="true">
      {/* ground shadow */}
      <ellipse cx="120" cy="206" rx="78" ry="6" className="la-shadow" />

      {/* === CART (foreground, on the right) === */}
      <g className="la-cart">
        <rect x="158" y="118" width="62" height="44" rx="4" fill="#ffffff" stroke="#1f2937" strokeWidth="3" />
        {/* grocery items */}
        <rect x="164" y="98" width="14" height="22" rx="2" fill="#10b981" stroke="#1f2937" strokeWidth="2" />
        <rect x="182" y="104" width="14" height="16" rx="2" fill="#f59e0b" stroke="#1f2937" strokeWidth="2" />
        <circle cx="208" cy="108" r="9" fill="#ef4444" stroke="#1f2937" strokeWidth="2" />
        <path d="M208 99 q-3 -4 2 -7" stroke="#16a34a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {/* cart handle */}
        <path d="M158 122 q-8 -12 -16 -12" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* wheels */}
        <circle cx="170" cy="172" r="8" fill="#1f2937" className="la-wheel la-wheel-1" />
        <circle cx="210" cy="172" r="8" fill="#1f2937" className="la-wheel la-wheel-2" />
        <circle cx="170" cy="172" r="2.6" fill="#9ca3af" />
        <circle cx="210" cy="172" r="2.6" fill="#9ca3af" />
      </g>

      {/* === CHARACTER === */}
      <g className="la-char">
        {/* legs (pants) */}
        <g className="la-legs">
          <path className="la-leg-left"  d="M62 150 v32 q0 8 6 8 q6 0 6 -8 v-32 z" fill="#8b5cf6" />
          <path className="la-leg-right" d="M82 150 v32 q0 8 6 8 q6 0 6 -8 v-32 z" fill="#8b5cf6" />
        </g>
        {/* shoes */}
        <ellipse cx="68" cy="192" rx="10" ry="6" fill="#1f2937" />
        <ellipse cx="88" cy="192" rx="10" ry="6" fill="#1f2937" />

        {/* body / shirt */}
        <path d="M48 110 q0 -8 6 -12 l16 -8 h16 l16 8 q6 4 6 12 v44 q0 4 -4 4 h-52 q-4 0 -4 -4 z" fill="#ec4899" />
        {/* shirt collar */}
        <path d="M70 90 q8 6 16 0 v6 h-16 z" fill="#db2777" />

        {/* right arm extending all the way to the cart handle */}
        <path className="la-arm-push" d="M102 114 q24 -4 40 4 q3 2 1 6 q-2 4 -6 3 q-18 -4 -36 -3 z" fill="#ec4899" />
        {/* hand gripping the cart handle */}
        <circle cx="142" cy="120" r="6" fill="#f5d0a9" stroke="#1f2937" strokeWidth="1.6" />

        {/* left arm hanging */}
        <path d="M50 116 q-8 8 -4 24 q1 4 5 3 q4 -1 4 -5 q-2 -10 4 -16 z" fill="#ec4899" />
        <circle cx="50" cy="142" r="5.5" fill="#f5d0a9" stroke="#1f2937" strokeWidth="1.5" />

        {/* head / face */}
        <ellipse cx="78" cy="62" rx="32" ry="34" fill="#f5d0a9" />

        {/* hair — long with bangs */}
        <path
          d="M44 60
             q-2 -32 28 -38
             q24 -4 36 18
             q4 14 -2 26
             q-4 -16 -22 -16
             q-10 0 -12 8
             q-14 -2 -22 6
             q-4 -2 -6 -4 z"
          fill="#a855f7"
        />
        {/* hair side strand */}
        <path d="M44 58 q-4 22 6 38 q-12 -2 -10 -22 z" fill="#a855f7" />
        {/* hair clip */}
        <circle cx="98" cy="42" r="4" fill="#fde68a" stroke="#1f2937" strokeWidth="1.4" />

        {/* eyes */}
        <ellipse cx="68" cy="64" rx="3.6" ry="5" fill="#1f2937" />
        <ellipse cx="86" cy="64" rx="3.6" ry="5" fill="#1f2937" />
        <circle cx="69" cy="62" r="1.2" fill="#ffffff" />
        <circle cx="87" cy="62" r="1.2" fill="#ffffff" />

        {/* blush */}
        <ellipse cx="62" cy="76" rx="5" ry="2.6" fill="rgba(244,63,94,0.32)" />
        <ellipse cx="92" cy="76" rx="5" ry="2.6" fill="rgba(244,63,94,0.32)" />

        {/* smile */}
        <path d="M72 80 q6 5 12 0" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

/* ───────────────────────────────────────────────
   2. Eddie — boy with red cap holding phone
   ─────────────────────────────────────────────── */
function BarcodeLoader() {
  return (
    <svg viewBox="0 0 240 220" className="la-mascot la-anim-scan" aria-hidden="true">
      <ellipse cx="120" cy="206" rx="60" ry="6" className="la-shadow" />

      <g className="la-char">
        {/* legs */}
        <path d="M96 154 v32 q0 7 6 7 q6 0 6 -7 v-32 z" fill="#1e3a8a" />
        <path d="M116 154 v32 q0 7 6 7 q6 0 6 -7 v-32 z" fill="#1e3a8a" />
        <ellipse cx="102" cy="194" rx="10" ry="6" fill="#dc2626" />
        <ellipse cx="122" cy="194" rx="10" ry="6" fill="#dc2626" />

        {/* body / yellow hoodie */}
        <path d="M82 112 q0 -10 8 -14 l16 -6 h12 l16 6 q8 4 8 14 v48 q0 4 -4 4 h-52 q-4 0 -4 -4 z" fill="#facc15" />
        {/* hoodie pocket */}
        <path d="M94 138 q18 8 36 0 v10 q-18 6 -36 0 z" fill="#eab308" />

        {/* left arm holding phone in front */}
        <path className="la-arm-phone" d="M86 122 q-4 18 6 30 q3 3 7 1 q3 -2 1 -6 q-6 -8 -2 -22 z" fill="#facc15" />
        <circle cx="100" cy="154" r="6" fill="#a16207" />

        {/* right arm down */}
        <path d="M138 122 q4 18 -2 32 q-2 4 -6 2 q-3 -2 -2 -6 q4 -12 0 -24 z" fill="#facc15" />
        <circle cx="130" cy="156" r="5.5" fill="#a16207" />

        {/* head */}
        <ellipse cx="112" cy="68" rx="30" ry="32" fill="#a16207" />
        {/* hair (under cap) */}
        <path d="M82 70 q4 -4 4 -12 q12 6 24 4 q14 -2 22 -8 q4 6 4 16 q-30 6 -54 0 z" fill="#1c1917" />

        {/* cap dome (red baseball-style) */}
        <path
          d="M82 50
             q2 -28 30 -28
             q28 0 30 28
             q-30 8 -60 0 z"
          fill="#dc2626"
        />
        {/* cap brim — a flat curved bill across the forehead, like
           a "C" laid sideways. Drawn AFTER the dome so it sits on top of it. */}
        <path
          d="M78 52
             q34 16 68 0
             q0 4 -4 6
             q-30 8 -60 0
             q-4 -2 -4 -6 z"
          fill="#b91c1c"
          stroke="#7f1d1d"
          strokeWidth="1.4"
        />
        {/* cap button on top */}
        <circle cx="112" cy="22" r="3" fill="#fef2f2" />

        {/* eyes — white sclera + black pupil so they pop on dark skin */}
        <ellipse cx="100" cy="70" rx="5" ry="6" fill="#ffffff" />
        <ellipse cx="124" cy="70" rx="5" ry="6" fill="#ffffff" />
        <ellipse cx="101" cy="70" rx="2.4" ry="3.4" fill="#1f2937" />
        <ellipse cx="125" cy="70" rx="2.4" ry="3.4" fill="#1f2937" />
        <circle cx="102" cy="68" r="0.9" fill="#ffffff" />
        <circle cx="126" cy="68" r="0.9" fill="#ffffff" />

        {/* smile (tongue out — cheeky) */}
        <path d="M106 84 q6 5 12 0" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>

      {/* PHONE in front of character (smaller, in his hand) */}
      <g className="la-phone-group">
        <rect x="88" y="130" width="28" height="44" rx="4" fill="#0f172a" />
        <rect x="91" y="134" width="22" height="32" rx="1.5" fill="#ecfeff" />
        <circle cx="102" cy="170" r="1.4" fill="#475569" />
        {/* barcode lines */}
        <g stroke="#1f2937" strokeWidth="1.4">
          <line x1="94" y1="138" x2="94" y2="160" />
          <line x1="97" y1="138" x2="97" y2="160" />
          <line x1="100" y1="138" x2="100" y2="160" />
          <line x1="104" y1="138" x2="104" y2="160" />
          <line x1="107" y1="138" x2="107" y2="160" />
          <line x1="110" y1="138" x2="110" y2="160" />
        </g>
        {/* scan beam */}
        <rect x="91" y="148" width="22" height="2.4" rx="1" fill="#f43f5e" className="la-scan-beam" />
      </g>
    </svg>
  );
}

/* ───────────────────────────────────────────────
   3. Sara — long-haired clipboard reader
   ─────────────────────────────────────────────── */
function ListLoader() {
  return (
    <svg viewBox="0 0 240 220" className="la-mascot la-anim-list" aria-hidden="true">
      <ellipse cx="120" cy="206" rx="62" ry="6" className="la-shadow" />

      <g className="la-char">
        {/* legs (skirt) */}
        <path d="M82 152 q-4 8 -2 36 q12 6 32 6 q20 0 32 -6 q2 -28 -2 -36 z" fill="#92400e" />
        <ellipse cx="104" cy="200" rx="10" ry="5" fill="#1f2937" />
        <ellipse cx="136" cy="200" rx="10" ry="5" fill="#1f2937" />

        {/* body / coral shirt */}
        <path d="M78 112 q0 -10 8 -14 l18 -6 h12 l18 6 q8 4 8 14 v44 q0 4 -4 4 h-56 q-4 0 -4 -4 z" fill="#fb7185" />

        {/* right arm holding clipboard */}
        <path className="la-arm-board" d="M82 124 q-2 12 4 28 q2 4 6 2 q4 -2 3 -6 q-4 -12 -1 -24 z" fill="#fb7185" />

        {/* left arm down */}
        <path d="M142 122 q6 16 0 28 q-2 4 -6 2 q-4 -2 -2 -6 q4 -10 0 -20 z" fill="#fb7185" />
        <circle cx="136" cy="156" r="5.5" fill="#f5d0a9" />

        {/* hair (drawn behind the head, ponytail to the side) */}
        <path
          d="M88 60
             q0 -32 32 -34
             q32 2 32 34
             q-4 -8 -12 -12
             q-20 -2 -40 0
             q-8 4 -12 12 z"
          fill="#78350f"
        />
        {/* side ponytail tail */}
        <path d="M150 56 q14 4 14 24 q0 16 -10 18 q-2 -16 -4 -36 z" fill="#78350f" />

        {/* head */}
        <ellipse cx="120" cy="66" rx="30" ry="32" fill="#f5d0a9" />

        {/* bangs across forehead */}
        <path d="M92 52 q4 -12 28 -12 q24 0 28 12 q-4 6 -10 6 q-2 -6 -8 -6 q-4 0 -6 4 q-2 -4 -6 -4 q-6 0 -8 6 q-6 0 -10 -6 z" fill="#78350f" />

        {/* pink headband over hair */}
        <path d="M88 46 q14 -10 32 -10 q18 0 32 10 q-6 4 -16 4 q-32 -2 -48 -4 z" fill="#f9a8d4" stroke="#1f2937" strokeWidth="1.4" />

        {/* eyes (glasses) */}
        <circle cx="108" cy="68" r="6.5" fill="#ffffff" stroke="#1f2937" strokeWidth="2" />
        <circle cx="132" cy="68" r="6.5" fill="#ffffff" stroke="#1f2937" strokeWidth="2" />
        <line x1="114.5" y1="68" x2="125.5" y2="68" stroke="#1f2937" strokeWidth="2" />
        <circle cx="108" cy="68" r="2.4" fill="#1f2937" />
        <circle cx="132" cy="68" r="2.4" fill="#1f2937" />

        {/* blush */}
        <ellipse cx="100" cy="78" rx="4" ry="2.4" fill="rgba(244,63,94,0.32)" />
        <ellipse cx="140" cy="78" rx="4" ry="2.4" fill="rgba(244,63,94,0.32)" />

        {/* smile */}
        <path d="M114 84 q6 5 12 0" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>

      {/* CLIPBOARD in front */}
      <g className="la-clipboard">
        <rect x="62" y="118" width="50" height="64" rx="5" fill="#ffffff" stroke="#1f2937" strokeWidth="2.4" />
        <rect x="80" y="112" width="14" height="8" rx="2" fill="#a16207" />

        {/* paper lines */}
        <line x1="70" y1="132" x2="104" y2="132" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="144" x2="104" y2="144" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="156" x2="104" y2="156" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="168" x2="100" y2="168" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

        {/* checks */}
        <path className="la-check la-check-1" d="M66 131 l3 3 l5 -6" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path className="la-check la-check-2" d="M66 143 l3 3 l5 -6" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path className="la-check la-check-3" d="M66 155 l3 3 l5 -6" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path className="la-check la-check-4" d="M66 167 l3 3 l5 -6" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

/* ───────────────────────────────────────────────
   4. Chef Hugo — chef hat, mustache, stirring pot
   ─────────────────────────────────────────────── */
function CookLoader() {
  return (
    <svg viewBox="0 0 240 220" className="la-mascot la-anim-cook" aria-hidden="true">
      <ellipse cx="120" cy="206" rx="66" ry="6" className="la-shadow" />

      <g className="la-char">
        {/* legs */}
        <path d="M82 158 v28 q0 7 6 7 q6 0 6 -7 v-28 z" fill="#1f2937" />
        <path d="M104 158 v28 q0 7 6 7 q6 0 6 -7 v-28 z" fill="#1f2937" />
        <ellipse cx="88" cy="194" rx="10" ry="5" fill="#111827" />
        <ellipse cx="110" cy="194" rx="10" ry="5" fill="#111827" />

        {/* white chef coat */}
        <path d="M68 116 q0 -10 8 -14 l18 -6 h12 l18 6 q8 4 8 14 v44 q0 4 -4 4 h-56 q-4 0 -4 -4 z" fill="#fafafa" stroke="#1f2937" strokeWidth="2" />
        {/* coat buttons */}
        <circle cx="99" cy="132" r="1.8" fill="#1f2937" />
        <circle cx="99" cy="144" r="1.8" fill="#1f2937" />
        <circle cx="99" cy="156" r="1.8" fill="#1f2937" />
        {/* red neckerchief */}
        <path d="M82 102 q18 12 36 0 l-4 12 q-14 6 -28 0 z" fill="#dc2626" />

        {/* right arm holding spoon */}
        <path className="la-arm-spoon" d="M126 122 q14 -2 28 8 q3 2 1 6 q-2 4 -6 3 q-16 -2 -26 -4 z" fill="#fafafa" stroke="#1f2937" strokeWidth="1.6" />

        {/* left arm down */}
        <path d="M76 122 q-4 16 2 32 q2 4 6 2 q4 -2 2 -6 q-4 -10 0 -22 z" fill="#fafafa" stroke="#1f2937" strokeWidth="1.6" />
        <circle cx="82" cy="156" r="5.5" fill="#f5d0a9" />

        {/* head */}
        <ellipse cx="99" cy="68" rx="28" ry="30" fill="#f5d0a9" />

        {/* chef hat — three fluffy puffs above a band, drawn back-to-front */}
        <circle cx="82" cy="20" r="13" fill="#ffffff" stroke="#1f2937" strokeWidth="2" />
        <circle cx="116" cy="20" r="13" fill="#ffffff" stroke="#1f2937" strokeWidth="2" />
        <circle cx="99" cy="12" r="15" fill="#ffffff" stroke="#1f2937" strokeWidth="2" />
        {/* hat band (sits at the bottom of the puffs) */}
        <rect x="74" y="30" width="50" height="10" rx="3" fill="#ffffff" stroke="#1f2937" strokeWidth="2" />

        {/* eyes */}
        <ellipse cx="88" cy="64" rx="3" ry="4" fill="#1f2937" />
        <ellipse cx="110" cy="64" rx="3" ry="4" fill="#1f2937" />
        <circle cx="89" cy="62" r="1" fill="#ffffff" />
        <circle cx="111" cy="62" r="1" fill="#ffffff" />

        {/* handlebar mustache — two curls meeting under the nose */}
        <path
          d="M99 78
             q-2 4 -6 4
             q-6 0 -8 -4
             q-1 -3 2 -4
             q3 -1 5 1
             q3 2 7 3
             q4 -1 7 -3
             q2 -2 5 -1
             q3 1 2 4
             q-2 4 -8 4
             q-4 0 -6 -4 z"
          fill="#7c2d12"
        />

        {/* smile under mustache */}
        <path d="M94 90 q5 3 10 0" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>

      {/* POT + spoon + steam (foreground) */}
      <g className="la-pot-group">
        {/* steam */}
        <g className="la-steam">
          <path className="la-steam-1" d="M168 100 q4 -10 -2 -16 q-4 -6 2 -12" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path className="la-steam-2" d="M184 100 q4 -10 -2 -16 q-4 -6 2 -12" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path className="la-steam-3" d="M200 100 q4 -10 -2 -16 q-4 -6 2 -12" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
        {/* spoon (stirring) */}
        <g className="la-spoon">
          <line x1="184" y1="108" x2="200" y2="84" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="200" cy="84" rx="6" ry="4" fill="#92400e" />
        </g>
        {/* pot */}
        <rect x="150" y="116" width="68" height="36" rx="4" fill="#1f2937" />
        <rect x="146" y="110" width="76" height="10" rx="4" fill="#475569" />
        {/* pot handles */}
        <rect x="138" y="124" width="12" height="6" rx="2" fill="#475569" />
        <rect x="218" y="124" width="12" height="6" rx="2" fill="#475569" />
        {/* contents */}
        <ellipse cx="184" cy="114" rx="32" ry="4" fill="#f59e0b" />
      </g>
    </svg>
  );
}

/* ───────────────────────────────────────────────
   5. Bea — gray-bun detective with magnifying glass
   ─────────────────────────────────────────────── */
function SearchLoader() {
  return (
    <svg viewBox="0 0 240 220" className="la-mascot la-anim-search" aria-hidden="true">
      <ellipse cx="120" cy="206" rx="62" ry="6" className="la-shadow" />

      <g className="la-char">
        {/* legs */}
        <path d="M98 156 v30 q0 7 6 7 q6 0 6 -7 v-30 z" fill="#78350f" />
        <path d="M118 156 v30 q0 7 6 7 q6 0 6 -7 v-30 z" fill="#78350f" />
        <ellipse cx="104" cy="194" rx="10" ry="6" fill="#1f2937" />
        <ellipse cx="124" cy="194" rx="10" ry="6" fill="#1f2937" />

        {/* trench coat body */}
        <path d="M76 114 q0 -10 8 -14 l18 -6 h12 l18 6 q8 4 8 14 v46 q0 4 -4 4 h-56 q-4 0 -4 -4 z" fill="#d4a574" stroke="#1f2937" strokeWidth="2" />
        {/* coat lapels */}
        <path d="M114 100 v54 l-8 -14 z" fill="#b88a5a" />
        <path d="M114 100 v54 l8 -14 z" fill="#b88a5a" />
        {/* coat belt */}
        <rect x="76" y="138" width="64" height="6" fill="#92400e" />
        <rect x="106" y="136" width="6" height="10" fill="#fde68a" />

        {/* right arm extended forward holding magnifier */}
        <path className="la-arm-mag" d="M132 124 q22 -4 32 14 q2 3 -2 5 q-4 2 -8 -1 q-8 -8 -22 -8 z" fill="#d4a574" stroke="#1f2937" strokeWidth="1.6" />

        {/* left arm down */}
        <path d="M78 124 q-4 14 2 28 q2 4 6 2 q3 -2 2 -6 q-4 -10 0 -20 z" fill="#d4a574" stroke="#1f2937" strokeWidth="1.6" />
        <circle cx="84" cy="154" r="5.5" fill="#f5d0a9" />

        {/* head */}
        <ellipse cx="108" cy="64" rx="30" ry="32" fill="#f5d0a9" />

        {/* gray bun on top */}
        <ellipse cx="108" cy="22" rx="14" ry="12" fill="#9ca3af" />
        <circle cx="108" cy="22" r="3" fill="#6b7280" />
        {/* gray hair around head */}
        <path
          d="M78 56
             q0 -28 30 -28
             q30 0 30 28
             q-2 -10 -10 -14
             q-12 -4 -20 -4
             q-8 0 -20 4
             q-8 4 -10 14 z"
          fill="#9ca3af"
        />

        {/* round glasses */}
        <circle cx="96" cy="64" r="7" fill="rgba(255,255,255,0.7)" stroke="#1f2937" strokeWidth="2" />
        <circle cx="120" cy="64" r="7" fill="rgba(255,255,255,0.7)" stroke="#1f2937" strokeWidth="2" />
        <line x1="103" y1="64" x2="113" y2="64" stroke="#1f2937" strokeWidth="2" />
        {/* pupils */}
        <circle cx="96" cy="64" r="2" fill="#1f2937" />
        <circle cx="120" cy="64" r="2" fill="#1f2937" />

        {/* small thoughtful mouth */}
        <path d="M102 82 q6 3 12 0" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>

      {/* MAGNIFYING GLASS */}
      <g className="la-magnifier">
        <circle cx="180" cy="120" r="20" fill="rgba(186, 230, 253, 0.4)" stroke="#1f2937" strokeWidth="3.6" />
        <circle cx="180" cy="120" r="14" fill="rgba(255,255,255,0.3)" />
        <line x1="195" y1="135" x2="214" y2="154" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
        {/* glass shine */}
        <circle cx="173" cy="113" r="5" fill="rgba(255,255,255,0.7)" />
      </g>
    </svg>
  );
}

/* ───────────────────────────────────────────────
   6. Diego — athletic guy on a scale
   ─────────────────────────────────────────────── */
function ScaleLoader() {
  return (
    <svg viewBox="0 0 240 220" className="la-mascot la-anim-scale" aria-hidden="true">
      <ellipse cx="120" cy="206" rx="68" ry="6" className="la-shadow" />

      {/* SCALE base */}
      <rect x="70" y="174" width="100" height="20" rx="4" fill="#1f2937" />
      <rect x="80" y="158" width="80" height="16" rx="3" fill="#4b5563" />
      {/* scale display */}
      <rect x="106" y="180" width="28" height="10" rx="2" fill="#fef3c7" stroke="#1f2937" strokeWidth="1.4" />
      <text x="120" y="188" textAnchor="middle" fontSize="7" fontWeight="800" fill="#1f2937" fontFamily="Heebo, sans-serif" className="la-scale-num">
        <tspan>72</tspan>
      </text>

      <g className="la-char">
        {/* shorts (one solid block, with a small slit at the bottom-center) */}
        <path d="M84 140 h52 v22 q0 2 -2 2 h-22 v-4 h-4 v4 h-22 q-2 0 -2 -2 z" fill="#111827" />
        {/* bare lower legs */}
        <rect x="92" y="164" width="10" height="14" fill="#c08552" />
        <rect x="118" y="164" width="10" height="14" fill="#c08552" />
        {/* shoes */}
        <ellipse cx="97" cy="180" rx="10" ry="4.5" fill="#1f2937" />
        <ellipse cx="123" cy="180" rx="10" ry="4.5" fill="#1f2937" />

        {/* body / purple tank top */}
        <path d="M82 102 q0 -10 8 -14 l16 -6 h12 l16 6 q8 4 8 14 v40 q0 2 -2 2 h-56 q-2 0 -2 -2 z" fill="#8b5cf6" />
        {/* tank top straps (darker patches at shoulders) */}
        <path d="M90 90 q4 -4 8 -4 v6 h-8 z" fill="#7c3aed" />
        <path d="M130 90 q-4 -4 -8 -4 v6 h8 z" fill="#7c3aed" />
        {/* white stripe across chest */}
        <rect x="84" y="118" width="52" height="4" fill="#ffffff" />

        {/* arms flexed at sides */}
        <path d="M84 112 q-12 6 -10 22 q1 4 5 3 q4 -1 4 -5 q0 -8 8 -12 z" fill="#c08552" />
        <path d="M134 112 q12 6 10 22 q-1 4 -5 3 q-4 -1 -4 -5 q0 -8 -8 -12 z" fill="#c08552" />

        {/* head */}
        <ellipse cx="110" cy="60" rx="28" ry="30" fill="#c08552" />

        {/* short black hair */}
        <path d="M82 56 q0 -30 28 -30 q28 0 28 30 q-2 -10 -10 -14 q-10 -2 -18 -2 q-8 0 -18 2 q-8 4 -10 14 z" fill="#1c1917" />
        {/* red headband sits LOW on the forehead, above the eyebrows but below the hair */}
        <path d="M82 48 q0 -2 2 -3 q26 -4 52 0 q2 1 2 3 v6 q-28 6 -56 0 z" fill="#ef4444" stroke="#1f2937" strokeWidth="1.4" />

        {/* eyebrows (just below the headband) */}
        <path d="M93 62 q5 -2 10 0" stroke="#1c1917" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M117 62 q5 -2 10 0" stroke="#1c1917" strokeWidth="2.4" strokeLinecap="round" fill="none" />

        {/* eyes */}
        <ellipse cx="98" cy="70" rx="3.2" ry="4" fill="#1f2937" />
        <ellipse cx="122" cy="70" rx="3.2" ry="4" fill="#1f2937" />
        <circle cx="99" cy="68" r="1" fill="#ffffff" />
        <circle cx="123" cy="68" r="1" fill="#ffffff" />

        {/* determined smile */}
        <path d="M104 82 q6 5 12 0" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

/* ───────────────────────────────────────────────
   gallery
   ─────────────────────────────────────────────── */

const ANIMATIONS = [
  { id: "cart", title: "טוען עגלה", description: "Maya דוחפת את העגלה שלך", bg: "#f3e8ff", Component: CartLoader },
  { id: "barcode", title: "סורק ברקוד", description: "Eddie מזהה את המוצר", bg: "#fef3c7", Component: BarcodeLoader },
  { id: "list", title: "בודק את הרשימה", description: "Sara מסמנת בצ'ק כל פריט", bg: "#fce7f3", Component: ListLoader },
  { id: "cook", title: "מערבב תוצאות", description: "Chef Hugo מבשל את ההמלצות", bg: "#fee2e2", Component: CookLoader },
  { id: "search", title: "מחפש לך מחיר", description: "Bea סורקת את הרשתות", bg: "#e0f2fe", Component: SearchLoader },
  { id: "scale", title: "שוקל אופציות", description: "Diego בודק את ההחלפה הכי טובה", bg: "#ede9fe", Component: ScaleLoader },
];

export default function LoadingAnimations() {
  return (
    <div className="la-page">
      <header className="la-header">
        <h1 className="la-page-title">גלריית אנימציות טעינה</h1>
        <p className="la-page-subtitle">
          סגנון דואלינגו — דמויות שעושות פעולה שמתאימה למצב הטעינה.
          לתצוגה בלבד.
        </p>
      </header>

      <div className="la-grid">
        {ANIMATIONS.map(({ id, title, description, bg, Component }) => (
          <article key={id} className="la-card">
            <div className="la-stage" style={{ background: bg }}>
              <Component />
            </div>
            <div className="la-info">
              <h3 className="la-title">{title}</h3>
              <p className="la-desc">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
