/** Original semantic SVG HUD instruments; presentation-only, no external assets. */
export type HudIcon='altitude'|'velocity'|'fuel'|'apoapsis'|'periapsis'|'mass'|'deltaV'|'isp';
const paths:Record<HudIcon,string>={
 altitude:'<path d="M4 20h16M5 17l6-11 3 6 2-3 3 8"/><path d="M3 6v12m-2-9 2-3 2 3m-4 6 2 3 2-3"/>',
 velocity:'<circle cx="12" cy="12" r="9"/><path d="m12 12 5-5M8 17l4-5"/><path d="m16 5 2 2-2 2"/>',
 fuel:'<rect x="7" y="4" width="10" height="17" rx="2"/><path d="M10 4V2h4v2M9 14h6M9 17h6"/><path d="M18 9h2v6"/>',
 apoapsis:'<ellipse cx="12" cy="12" rx="9" ry="6"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="6" r="2" fill="currentColor" stroke="none"/><path d="M17 3l2-2m-2 0 2 2"/>',
 periapsis:'<ellipse cx="12" cy="12" rx="9" ry="6"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2" fill="currentColor" stroke="none"/><path d="M17 21l2 2m-2 0 2-2"/>',
 mass:'<path d="M8 8a4 4 0 0 1 8 0l4 12H4L8 8Z"/><circle cx="12" cy="7" r="1.5"/>',
 deltaV:'<path d="M3 18h16m-5-5 5 5-5 5M4 7l3 3 4-6"/><path d="M14 5h6m-3-3v6"/>',
 isp:'<path d="M8 3h8l-2 9H10L8 3Zm2 9-3 4h10l-3-4"/><path d="M9 18v3m3-4v5m3-4v3"/>'
};
/** Build semantic icons from a closed, non-user-controlled dictionary. */
export function hudIcon(name:HudIcon):SVGSVGElement{
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');
 svg.setAttribute('stroke-width','1.6');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
 svg.setAttribute('aria-hidden','true');svg.setAttribute('class','mission-hud-icon');
 svg.innerHTML=paths[name];return svg;
}
