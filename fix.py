import re
import os

app_jsx_path = os.path.join(os.getcwd(), 'src/App.jsx')

with open(app_jsx_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Increase border radius overall: rounded-md -> rounded-lg
content = re.sub(r'rounded-md', 'rounded-lg', content)
content = re.sub(r'rounded-t-md', 'rounded-t-lg', content)

# 2. Fix toggle button back to rounded-full
# <span className="relative h-6 w-11 rounded-lg transition-colors"
content = re.sub(r'className="relative h-6 w-11 rounded-lg transition-colors"', 'className="relative h-6 w-11 rounded-full transition-colors"', content)

# 3. Fix button text color where background is C.ink and color is C.ink
# e.g., style={{ background: C.ink, color: C.ink, boxShadow: ... }}
content = re.sub(r'background: C\.ink, color: C\.ink', 'background: C.ink, color: "#fff"', content)

with open(app_jsx_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixes applied successfully.")
