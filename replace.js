import fs from 'fs';
import path from 'path';

const appJsxPath = path.join(process.cwd(), 'src/App.jsx');
let content = fs.readFileSync(appJsxPath, 'utf8');

// 1. Replace Design Tokens
content = content.replace(
  /const C = \{[\s\S]*?\};/,
  `const C = {
  ink: "#37352f", paper: "#ffffff", bg: "#ffffff",
  yellow: "#e9e9e7", yellowDeep: "#d3d3d1", yellowSoft: "rgba(55, 53, 47, 0.08)",
  border: "#e9e9e7", line: "#e9e9e7", text: "#37352f", muted: "#787774", faint: "#9b9a97",
};`
);

content = content.replace(
  /const PASTEL = \{[\s\S]*?\};\nconst COLORS = \[[^\]]+\];/,
  `const PASTEL = {
  gray:   { bg: "#F1F1EF", text: "#787774", dot: "#9B9A97", line: "#E9E9E7" },
  brown:  { bg: "#F4EEEE", text: "#976D57", dot: "#BA8B74", line: "#EBE3E0" },
  orange: { bg: "#F8ECDF", text: "#CC772F", dot: "#E59648", line: "#EEDAC7" },
  yellow: { bg: "#FBF3DB", text: "#C29243", dot: "#D9A953", line: "#F0E1C5" },
  green:  { bg: "#EDF3EC", text: "#548064", dot: "#699B7A", line: "#DCE5DB" },
  blue:   { bg: "#E7F3F8", text: "#337EA9", dot: "#529CCA", line: "#D3E4EC" },
  purple: { bg: "#F4F0F7", text: "#9065B0", dot: "#A47DC3", line: "#E6DCEE" },
  pink:   { bg: "#F9EBED", text: "#C14C8A", dot: "#D6639F", line: "#EAD6D9" },
  red:    { bg: "#FDEBEC", text: "#D44C47", dot: "#E9645E", line: "#F2D8D9" },
};
const COLORS = ["gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"];`
);

// 2. Global CSS updates
content = content.replace(
  /<style>\{`@import url\("https:\/\/cdn\.jsdelivr\.net\/gh\/orioncactus\/pretendard@v1\.3\.9\/dist\/web\/variable\/pretendardvariable-dynamic-subset\.css"\);[\s\S]*?`\}<\/style>/,
  `<style>{\`
        *{font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";box-sizing:border-box;}
        .lift{transition:background .1s ease;} .lift:hover{background:rgba(55, 53, 47, 0.08);} .lift:active{background:rgba(55, 53, 47, 0.12);}
        .inp{transition:border-color .15s ease, box-shadow .15s ease;} .inp:focus{border-color:\${C.ink};}
        .slot{transition:background .12s ease;cursor:pointer;} .slot:hover{background:rgba(55, 53, 47, 0.04);}
        .slot:hover::after{content:'+ 예약';position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:600;color:\${C.muted};}
        .blk{transition:background .1s ease;cursor:pointer;} .blk:hover{filter: brightness(0.95);}
        .cell{transition:background .1s ease;cursor:pointer;} .cell:hover{background:rgba(55, 53, 47, 0.04);}
        .mrow{cursor:grab;transition:background .1s ease;} .mrow:active{cursor:grabbing;}
        .fade{animation:fade .15s ease both;} @keyframes fade{from{opacity:0;}to{opacity:1;}}
        .sheet{animation:sheet .15s ease both;} @keyframes sheet{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
        .ov{animation:ov .15s ease both;} @keyframes ov{from{opacity:0;}to{opacity:1;}}
        .rise{animation:rise .2s ease both;} @keyframes rise{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;}}
        .tdrop{animation:tdrop .15s ease both;} @keyframes tdrop{from{opacity:0;}to{opacity:1;}}
        .sc::-webkit-scrollbar{width:6px;height:6px;} .sc::-webkit-scrollbar-thumb{background:#E9E9E7;border-radius:4px;}
        input,select,button{font-family:inherit;} select{appearance:none;-webkit-appearance:none;}\`}</style>`
);

// 3. StatusPill updates
content = content.replace(
  /function StatusPill\(\{ kind, text \}\) \{[\s\S]*?return[\s\S]*?\n\}/,
  \`function StatusPill({ kind, text }) {
  const m = { busy: { bg: PASTEL.red.bg, fg: PASTEL.red.text, dot: PASTEL.red.dot }, soon: { bg: PASTEL.gray.bg, fg: PASTEL.gray.text, dot: PASTEL.gray.dot }, free: { bg: PASTEL.green.bg, fg: PASTEL.green.text, dot: PASTEL.green.dot } }[kind];
  return <span className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[11px] font-medium" style={{ background: m.bg, color: m.fg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.dot }} /> {text}</span>;
}\`
);

// 4. Wordmark updates
content = content.replace(
  /function Wordmark\(\{ size = 20 \}\) \{[\s\S]*?\}/,
  \`function Wordmark({ size = 18 }) {
  return <span className="tracking-tight" style={{ fontSize: size, color: C.ink, lineHeight: 1 }}><span style={{ fontWeight: 500, color: C.text }}>found</span><span style={{ fontWeight: 600 }}>founded</span></span>;
}\`
);

// 5. Replace 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-t-3xl', 'rounded-full' for certain UI components with 'rounded-md'
content = content.replace(/rounded-3xl|rounded-2xl|rounded-xl/g, 'rounded-md');
content = content.replace(/rounded-t-3xl/g, 'rounded-t-md');
content = content.replace(/rounded-full/g, 'rounded-md'); 

// 6. Fix Avatars/Dots that need to stay fullly rounded
content = content.replace(/h-1\.5 w-1\.5 rounded-md/g, 'h-1.5 w-1.5 rounded-full');
content = content.replace(/h-2 w-2 shrink-0 rounded-md/g, 'h-2 w-2 shrink-0 rounded-full');
content = content.replace(/h-2 w-2 rounded-md/g, 'h-2 w-2 rounded-full');
content = content.replace(/h-2\.5 w-2\.5 rounded-md/g, 'h-2.5 w-2.5 rounded-full');
content = content.replace(/h-3 w-3 rounded-md/g, 'h-3 w-3 rounded-full');
content = content.replace(/h-5 w-5 rounded-md/g, 'h-5 w-5 rounded-full');
content = content.replace(/w-8 place-items-center rounded-md/g, 'w-8 place-items-center rounded-[4px]'); // modal close btns
content = content.replace(/w-9 place-items-center rounded-md/g, 'w-9 place-items-center rounded-[4px]'); // icons

// 7. Fix Avatar component back to rounded-full if we want circles, but Notion uses slightly rounded rectangles for icons sometimes.
// Let's keep avatars as circles for humans.
content = content.replace(/function Avatar\(\{ label, size = 36, solid = false \}\) \{\n  return <span className="grid shrink-0 place-items-center rounded-md/g, 
  'function Avatar({ label, size = 36, solid = false }) {\\n  return <span className="grid shrink-0 place-items-center rounded-full');

// 8. Fix specific shadows (Notion uses very subtle shadows)
content = content.replace(/boxShadow: "0 -10px 40px rgba\(0,0,0,\.18\)"/g, 'boxShadow: "0 -4px 12px rgba(0,0,0,.08)"');
content = content.replace(/boxShadow: "0 -10px 40px rgba\(0,0,0,\.2\)"/g, 'boxShadow: "0 -4px 12px rgba(0,0,0,.08)"');
content = content.replace(/boxShadow: "0 8px 18px rgba\(232,190,0,\.4\)"/g, 'boxShadow: "0 1px 2px rgba(0,0,0,.05)"');
content = content.replace(/boxShadow: "0 6px 14px rgba\(232,190,0,\.35\)"/g, 'boxShadow: "0 1px 2px rgba(0,0,0,.05)"');
content = content.replace(/boxShadow: "0 1px 3px rgba\(0,0,0,\.04\)"/g, 'boxShadow: "0 1px 2px rgba(0,0,0,.04)"');
content = content.replace(/boxShadow: "0 6px 16px rgba\(232,190,0,\.38\)"/g, 'boxShadow: "0 1px 2px rgba(0,0,0,.05)"');
content = content.replace(/boxShadow: "0 10px 24px rgba\(232,190,0,\.5\)"/g, 'boxShadow: "0 4px 12px rgba(0,0,0,.15)"');
content = content.replace(/boxShadow: "0 8px 18px rgba\(232,190,0,\.45\)"/g, 'boxShadow: "0 1px 2px rgba(0,0,0,.05)"');
content = content.replace(/boxShadow: "0 10px 30px rgba\(0,0,0,\.3\)"/g, 'boxShadow: "0 4px 12px rgba(0,0,0,.15)"');

// 9. Fix some hardcoded background colors that were yellow
content = content.replace(/background: "#FBE7E7"/g, 'background: PASTEL.red.bg');
content = content.replace(/color: "#C0392B"/g, 'color: PASTEL.red.text');
content = content.replace(/background: C\.yellowSoft, color: "#8A6D00"/g, 'background: PASTEL.yellow.bg, color: PASTEL.yellow.text');
content = content.replace(/background: "#EEF4FF", color: "#2A5DC7"/g, 'background: PASTEL.blue.bg, color: PASTEL.blue.text');

// 10. Update TeamTag component to be Notion-like
content = content.replace(
  /function TeamTag\(\{ team \}\) \{[\s\S]*?return[\s\S]*?\n\}/,
  \`function TeamTag({ team }) {
  const id = team === "ID";
  return <span className="inline-grid h-[18px] min-w-[24px] place-items-center rounded-[3px] px-1 text-[10px] font-medium" style={id ? { background: PASTEL.gray.bg, color: PASTEL.gray.text } : { background: PASTEL.brown.bg, color: PASTEL.brown.text }}>{team}</span>;
}\`
);

// 11. Replace font weights (extrabold -> semibold)
content = content.replace(/font-extrabold/g, 'font-medium');
content = content.replace(/font-bold/g, 'font-medium');

// 12. Fix "C.yellow" on elements like buttons
content = content.replace(/background: C\.yellow/g, 'background: C.ink');
content = content.replace(/color: C\.ink([^]*?)boxShadow/g, 'color: "#fff"$1boxShadow'); // Fix color inside the button

// Write back
fs.writeFileSync(appJsxPath, content);
console.log('App.jsx updated with Notion styles');
