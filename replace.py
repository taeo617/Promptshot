import re
import os

app_jsx_path = os.path.join(os.getcwd(), 'src/App.jsx')

with open(app_jsx_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace Design Tokens
content = re.sub(
    r'const C = \{[\s\S]*?\};',
    '''const C = {
  ink: "#37352f", paper: "#ffffff", bg: "#ffffff",
  yellow: "#e9e9e7", yellowDeep: "#d3d3d1", yellowSoft: "rgba(55, 53, 47, 0.08)",
  border: "#e9e9e7", line: "#e9e9e7", text: "#37352f", muted: "#787774", faint: "#9b9a97",
};''',
    content
)

content = re.sub(
    r'const PASTEL = \{[\s\S]*?\};\nconst COLORS = \[[^\]]+\];',
    '''const PASTEL = {
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
const COLORS = ["gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"];''',
    content
)

# 2. Global CSS updates
content = re.sub(
    r'<style>\{`@import url\("https://cdn\.jsdelivr\.net/gh/orioncactus/pretendard@v1\.3\.9/dist/web/variable/pretendardvariable-dynamic-subset\.css"\);[\s\S]*?`\}</style>',
    '''<style>{`
        *{font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";box-sizing:border-box;}
        .lift{transition:background .1s ease;} .lift:hover{background:rgba(55, 53, 47, 0.08);} .lift:active{background:rgba(55, 53, 47, 0.12);}
        .inp{transition:border-color .15s ease, box-shadow .15s ease;} .inp:focus{border-color:${C.ink};}
        .slot{transition:background .12s ease;cursor:pointer;} .slot:hover{background:rgba(55, 53, 47, 0.04);}
        .slot:hover::after{content:'+ 예약';position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:600;color:${C.muted};}
        .blk{transition:background .1s ease;cursor:pointer;} .blk:hover{filter: brightness(0.95);}
        .cell{transition:background .1s ease;cursor:pointer;} .cell:hover{background:rgba(55, 53, 47, 0.04);}
        .mrow{cursor:grab;transition:background .1s ease;} .mrow:active{cursor:grabbing;}
        .fade{animation:fade .15s ease both;} @keyframes fade{from{opacity:0;}to{opacity:1;}}
        .sheet{animation:sheet .15s ease both;} @keyframes sheet{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
        .ov{animation:ov .15s ease both;} @keyframes ov{from{opacity:0;}to{opacity:1;}}
        .rise{animation:rise .2s ease both;} @keyframes rise{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;}}
        .tdrop{animation:tdrop .15s ease both;} @keyframes tdrop{from{opacity:0;}to{opacity:1;}}
        .sc::-webkit-scrollbar{width:6px;height:6px;} .sc::-webkit-scrollbar-thumb{background:#E9E9E7;border-radius:4px;}
        input,select,button{font-family:inherit;} select{appearance:none;-webkit-appearance:none;}`}</style>''',
    content
)

# 3. StatusPill updates
content = re.sub(
    r'function StatusPill\(\{ kind, text \}\) \{[\s\S]*?return[\s\S]*?\n\}',
    '''function StatusPill({ kind, text }) {
  const m = { busy: { bg: PASTEL.red.bg, fg: PASTEL.red.text, dot: PASTEL.red.dot }, soon: { bg: PASTEL.gray.bg, fg: PASTEL.gray.text, dot: PASTEL.gray.dot }, free: { bg: PASTEL.green.bg, fg: PASTEL.green.text, dot: PASTEL.green.dot } }[kind];
  return <span className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[11px] font-medium" style={{ background: m.bg, color: m.fg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.dot }} /> {text}</span>;
}''',
    content
)

# 4. Wordmark updates
content = re.sub(
    r'function Wordmark\(\{ size = 20 \}\) \{[\s\S]*?\}',
    '''function Wordmark({ size = 18 }) {
  return <span className="tracking-tight" style={{ fontSize: size, color: C.ink, lineHeight: 1 }}><span style={{ fontWeight: 500, color: C.text }}>found</span><span style={{ fontWeight: 600 }}>founded</span></span>;
}''',
    content
)

# 5. TeamTag updates
content = re.sub(
    r'function TeamTag\(\{ team \}\) \{[\s\S]*?return[\s\S]*?\n\}',
    '''function TeamTag({ team }) {
  const id = team === "ID";
  return <span className="inline-grid h-[18px] min-w-[24px] place-items-center rounded-[3px] px-1 text-[10px] font-medium" style={id ? { background: PASTEL.gray.bg, color: PASTEL.gray.text } : { background: PASTEL.brown.bg, color: PASTEL.brown.text }}>{team}</span>;
}''',
    content
)

# 6. Replace rounded classes
content = re.sub(r'rounded-3xl|rounded-2xl|rounded-xl', 'rounded-md', content)
content = re.sub(r'rounded-t-3xl', 'rounded-t-md', content)
content = re.sub(r'rounded-full', 'rounded-md', content)

# 7. Fix Avatars/Dots back to rounded-full
content = re.sub(r'h-1\.5 w-1\.5 rounded-md', 'h-1.5 w-1.5 rounded-full', content)
content = re.sub(r'h-2 w-2 shrink-0 rounded-md', 'h-2 w-2 shrink-0 rounded-full', content)
content = re.sub(r'h-2 w-2 rounded-md', 'h-2 w-2 rounded-full', content)
content = re.sub(r'h-2\.5 w-2\.5 rounded-md', 'h-2.5 w-2.5 rounded-full', content)
content = re.sub(r'h-3 w-3 rounded-md', 'h-3 w-3 rounded-full', content)
content = re.sub(r'h-5 w-5 rounded-md', 'h-5 w-5 rounded-full', content)
content = re.sub(r'w-8 place-items-center rounded-md', 'w-8 place-items-center rounded-[4px]', content)
content = re.sub(r'w-9 place-items-center rounded-md', 'w-9 place-items-center rounded-[4px]', content)
content = re.sub(
    r'function Avatar\(\{ label, size = 36, solid = false \}\) \{\n  return <span className="grid shrink-0 place-items-center rounded-md',
    'function Avatar({ label, size = 36, solid = false }) {\n  return <span className="grid shrink-0 place-items-center rounded-full',
    content
)

# 8. Fix specific shadows
content = re.sub(r'boxShadow: "0 -10px 40px rgba\(0,0,0,\.18\)"', 'boxShadow: "0 -4px 12px rgba(0,0,0,.08)"', content)
content = re.sub(r'boxShadow: "0 -10px 40px rgba\(0,0,0,\.2\)"', 'boxShadow: "0 -4px 12px rgba(0,0,0,.08)"', content)
content = re.sub(r'boxShadow: "0 8px 18px rgba\(232,190,0,\.4\)"', 'boxShadow: "0 1px 2px rgba(0,0,0,.05)"', content)
content = re.sub(r'boxShadow: "0 6px 14px rgba\(232,190,0,\.35\)"', 'boxShadow: "0 1px 2px rgba(0,0,0,.05)"', content)
content = re.sub(r'boxShadow: "0 1px 3px rgba\(0,0,0,\.04\)"', 'boxShadow: "0 1px 2px rgba(0,0,0,.04)"', content)
content = re.sub(r'boxShadow: "0 6px 16px rgba\(232,190,0,\.38\)"', 'boxShadow: "0 1px 2px rgba(0,0,0,.05)"', content)
content = re.sub(r'boxShadow: "0 10px 24px rgba\(232,190,0,\.5\)"', 'boxShadow: "0 4px 12px rgba(0,0,0,.15)"', content)
content = re.sub(r'boxShadow: "0 8px 18px rgba\(232,190,0,\.45\)"', 'boxShadow: "0 1px 2px rgba(0,0,0,.05)"', content)
content = re.sub(r'boxShadow: "0 10px 30px rgba\(0,0,0,\.3\)"', 'boxShadow: "0 4px 12px rgba(0,0,0,.15)"', content)

# 9. Hardcoded Backgrounds
content = re.sub(r'background: "#FBE7E7"', 'background: PASTEL.red.bg', content)
content = re.sub(r'color: "#C0392B"', 'color: PASTEL.red.text', content)
content = re.sub(r'background: C\.yellowSoft, color: "#8A6D00"', 'background: PASTEL.yellow.bg, color: PASTEL.yellow.text', content)
content = re.sub(r'background: "#EEF4FF", color: "#2A5DC7"', 'background: PASTEL.blue.bg, color: PASTEL.blue.text', content)

# 10. Replace font weights (extrabold -> medium/semibold)
content = re.sub(r'font-extrabold', 'font-medium', content)
content = re.sub(r'font-bold', 'font-medium', content)

# 11. Fix "C.yellow" on elements like buttons
content = re.sub(r'background: C\.yellow', 'background: C.ink', content)
# We also need to change the color of the text for elements that had yellow backgrounds, to white, if it was C.ink
# E.g. { background: C.yellow, color: C.ink } -> { background: C.ink, color: "#fff" }
content = re.sub(r'color: C\.ink([\s\S]*?)boxShadow', r'color: "#fff"\1boxShadow', content)

# additional cleanups
content = content.replace('{ background: C.ink, color: C.ink }', '{ background: C.ink, color: "#fff" }')

with open(app_jsx_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Python script executed successfully.")
