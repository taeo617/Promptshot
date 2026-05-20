import { db, isPlaceholder, doc, setDoc, onSnapshot } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initThemeToggle();
  initControlCenter();
  initPerformanceChart();
  initMagneticDock();
});

/* ==========================================================================
   1. Real-Time Status Bar Clock
   ========================================================================== */
function initClock() {
  const clockEl = document.getElementById('live-clock');
  if (!clockEl) return;

  const updateClock = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;
  };

  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   2. Light/Dark Theme Controller
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const themeText = document.getElementById('theme-text');
  const themeIcon = document.getElementById('theme-icon');
  
  if (!toggleBtn) return;

  // Determine current active mode (checks localStorage, system theme, or defaults to dark)
  let currentScheme = localStorage.getItem('theme-scheme');
  if (!currentScheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentScheme = prefersDark ? 'dark' : 'light';
  }

  // Set initial scheme
  setScheme(currentScheme);

  toggleBtn.addEventListener('click', () => {
    const nextScheme = document.documentElement.style.colorScheme === 'dark' ? 'light' : 'dark';
    setScheme(nextScheme);
  });

  function setScheme(scheme) {
    document.documentElement.style.colorScheme = scheme;
    localStorage.setItem('theme-scheme', scheme);
    
    if (scheme === 'dark') {
      themeText.textContent = '라이트 모드';
      // Sun icon
      themeIcon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
    } else {
      themeText.textContent = '다크 모드';
      // Moon icon
      themeIcon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
    }
    
    // Fire event for canvas to dynamically adjust its scheme colors
    window.dispatchEvent(new CustomEvent('schemechange', { detail: { scheme } }));
  }
}

/* ==========================================================================
   3. Control Center Settings & Interactions (with Firebase Cloud Sync)
   ========================================================================== */
function initControlCenter() {
  const settingsDocRef = !isPlaceholder ? doc(db, 'settings', 'current') : null;
  let isSyncingFromFirebase = false;

  // Wi-Fi Toggle
  setupToggle('wifi-toggle', 'wifi-status-text', {
    on: '연결됨',
    off: '꺼짐'
  }, (isActive) => {
    const wifiStatusIcon = document.getElementById('status-wifi');
    if (wifiStatusIcon) {
      wifiStatusIcon.style.opacity = isActive ? '1' : '0.25';
    }
    saveSettingsToFirebase();
  });

  // Bluetooth Toggle
  setupToggle('bluetooth-toggle', 'bluetooth-status-text', {
    on: '켜짐',
    off: '꺼짐'
  }, () => {
    saveSettingsToFirebase();
  });

  // AirDrop Toggle
  setupToggle('airdrop-toggle', 'airdrop-status-text', {
    on: '모두에게',
    off: '꺼짐'
  }, () => {
    saveSettingsToFirebase();
  });

  // DND Toggle
  setupToggle('dnd-toggle', 'dnd-status-text', {
    on: '켜짐',
    off: '꺼짐'
  }, () => {
    saveSettingsToFirebase();
  });

  // Brightness Slider
  setupSlider('brightness-slider', 'brightness-value', 'brightness-fill', (val) => {
    // Subtle visual reactivity: adjust background organic blur opacity
    const blobs = document.querySelectorAll('.blob');
    blobs.forEach(b => {
      b.style.opacity = (val / 100) * (document.documentElement.style.colorScheme === 'dark' ? 0.4 : 0.5);
    });
    saveSettingsToFirebase();
  });

  // Volume Slider
  setupSlider('volume-slider', 'volume-value', 'volume-fill', () => {
    saveSettingsToFirebase();
  });

  // Save Settings to Firebase Firestore
  function saveSettingsToFirebase() {
    if (isPlaceholder || !settingsDocRef || isSyncingFromFirebase) return;

    const wifi = document.getElementById('wifi-toggle').getAttribute('aria-checked') === 'true';
    const bluetooth = document.getElementById('bluetooth-toggle').getAttribute('aria-checked') === 'true';
    const airdrop = document.getElementById('airdrop-toggle').getAttribute('aria-checked') === 'true';
    const dnd = document.getElementById('dnd-toggle').getAttribute('aria-checked') === 'true';
    
    const brightness = parseInt(document.getElementById('brightness-slider').value, 10);
    const volume = parseInt(document.getElementById('volume-slider').value, 10);

    setDoc(settingsDocRef, {
      wifi,
      bluetooth,
      airdrop,
      dnd,
      brightness,
      volume,
      updatedAt: Date.now()
    }).catch(err => console.error("❌ Error syncing settings to Firebase:", err));
  }

  // Real-Time Firebase Listener
  if (!isPlaceholder && settingsDocRef) {
    onSnapshot(settingsDocRef, (snapshot) => {
      if (!snapshot.exists()) return;
      
      const data = snapshot.data();
      isSyncingFromFirebase = true;

      // Update WiFi
      const wifiBtn = document.getElementById('wifi-toggle');
      const wifiTxt = document.getElementById('wifi-status-text');
      if (wifiBtn && wifiTxt && data.wifi !== undefined) {
        wifiBtn.setAttribute('aria-checked', String(data.wifi));
        wifiTxt.textContent = data.wifi ? '연결됨' : '꺼짐';
        const wifiIcon = document.getElementById('status-wifi');
        if (wifiIcon) wifiIcon.style.opacity = data.wifi ? '1' : '0.25';
      }

      // Update Bluetooth
      const btBtn = document.getElementById('bluetooth-toggle');
      const btTxt = document.getElementById('bluetooth-status-text');
      if (btBtn && btTxt && data.bluetooth !== undefined) {
        btBtn.setAttribute('aria-checked', String(data.bluetooth));
        btTxt.textContent = data.bluetooth ? '켜짐' : '꺼짐';
      }

      // Update AirDrop
      const adBtn = document.getElementById('airdrop-toggle');
      const adTxt = document.getElementById('airdrop-status-text');
      if (adBtn && adTxt && data.airdrop !== undefined) {
        adBtn.setAttribute('aria-checked', String(data.airdrop));
        adTxt.textContent = data.airdrop ? '모두에게' : '꺼짐';
      }

      // Update DND
      const dndBtn = document.getElementById('dnd-toggle');
      const dndTxt = document.getElementById('dnd-status-text');
      if (dndBtn && dndTxt && data.dnd !== undefined) {
        dndBtn.setAttribute('aria-checked', String(data.dnd));
        dndTxt.textContent = data.dnd ? '켜짐' : '꺼짐';
      }

      // Update Brightness Slider
      const brSlider = document.getElementById('brightness-slider');
      const brTxt = document.getElementById('brightness-value');
      const brFill = document.getElementById('brightness-fill');
      if (brSlider && brTxt && brFill && data.brightness !== undefined) {
        brSlider.value = data.brightness;
        brTxt.textContent = `${data.brightness}%`;
        brFill.style.width = `${data.brightness}%`;
        brSlider.parentElement.style.setProperty('--value-percent', `${data.brightness}%`);
        
        const blobs = document.querySelectorAll('.blob');
        blobs.forEach(b => {
          b.style.opacity = (data.brightness / 100) * (document.documentElement.style.colorScheme === 'dark' ? 0.4 : 0.5);
        });
      }

      // Update Volume Slider
      const volSlider = document.getElementById('volume-slider');
      const volTxt = document.getElementById('volume-value');
      const volFill = document.getElementById('volume-fill');
      if (volSlider && volTxt && volFill && data.volume !== undefined) {
        volSlider.value = data.volume;
        volTxt.textContent = `${data.volume}%`;
        volFill.style.width = `${data.volume}%`;
        volSlider.parentElement.style.setProperty('--value-percent', `${data.volume}%`);
      }

      isSyncingFromFirebase = false;
    });
  }

  // Toggle helper
  function setupToggle(buttonId, textId, states, callback) {
    const btn = document.getElementById(buttonId);
    const txt = document.getElementById(textId);
    if (!btn || !txt) return;

    btn.addEventListener('click', () => {
      const isChecked = btn.getAttribute('aria-checked') === 'true';
      const nextState = !isChecked;
      btn.setAttribute('aria-checked', String(nextState));
      txt.textContent = nextState ? states.on : states.off;
      
      if (callback) callback(nextState);
    });
  }

  // Slider helper
  function setupSlider(sliderId, valueId, fillId, callback) {
    const slider = document.getElementById(sliderId);
    const valText = document.getElementById(valueId);
    const fill = document.getElementById(fillId);
    
    if (!slider || !valText || !fill) return;

    const updateSlider = () => {
      const val = slider.value;
      valText.textContent = `${val}%`;
      fill.style.width = `${val}%`;
      slider.parentElement.style.setProperty('--value-percent', `${val}%`);
      
      if (callback) callback(val);
    };

    slider.addEventListener('input', updateSlider);
    updateSlider(); // Initial run
  }
}

/* ==========================================================================
   4. High-Fidelity Performance Chart (Retina Canvas)
   ========================================================================== */
function initPerformanceChart() {
  const canvas = document.getElementById('performance-chart');
  const cpuPercentText = document.getElementById('cpu-percent');
  if (!canvas || !cpuPercentText) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let time = 0;
  
  // Real-time CPU simulator
  let currentCpu = 24;
  let targetCpu = 24;

  setInterval(() => {
    targetCpu = Math.floor(12 + Math.random() * 25); // fluctuates between 12% and 37%
  }, 2500);

  // Setup Retina Canvas Scaling
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }

  resize();
  window.addEventListener('resize', resize);

  // Colors based on current theme scheme
  let gridColor = 'rgba(0, 0, 0, 0.05)';
  let waveColor = 'rgba(0, 122, 255, 0.85)';
  let waveFillColor = 'rgba(0, 122, 255, 0.08)';

  function updateColors() {
    const isDark = document.documentElement.style.colorScheme === 'dark';
    gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
    waveColor = isDark ? 'rgba(52, 199, 89, 0.95)' : 'rgba(0, 122, 255, 0.85)';
    waveFillColor = isDark ? 'rgba(52, 199, 89, 0.08)' : 'rgba(0, 122, 255, 0.05)';
    
    // Dynamic bullet color change for CPU depending on active theme
    const cpuBullet = document.querySelector('.stat-bullet.cpu');
    if (cpuBullet) {
      cpuBullet.style.backgroundColor = isDark ? 'hsl(142, 70%, 50%)' : 'hsl(210, 100%, 50%)';
    }
  }

  updateColors();
  window.addEventListener('schemechange', updateColors);

  // Animation Loop
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    // Easing CPU value
    currentCpu += (targetCpu - currentCpu) * 0.05;
    cpuPercentText.textContent = `${Math.round(currentCpu)}%`;

    // 1. Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = gridColor;
    
    // Vertical grid lines
    const gridSpacing = 25;
    for (let x = 0; x < w; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = 0; y < h; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 2. Draw Real-time Performance Pulse Wave
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = waveColor;
    
    ctx.beginPath();
    ctx.moveTo(0, h);
    
    const amplitude = 12 + (currentCpu * 0.6); // Amplitude varies with CPU load
    const frequency = 0.015 + (currentCpu * 0.0003); // Frequency increases slightly with CPU load
    
    for (let x = 0; x <= w; x++) {
      const y = h / 2 + 
                Math.sin(x * frequency + time) * amplitude + 
                Math.sin(x * 0.03 - time * 1.5) * (amplitude * 0.3);
      ctx.lineTo(x, y);
    }
    
    const path2D = new Path2D(ctx);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    
    ctx.fillStyle = waveFillColor;
    ctx.fill();
    ctx.stroke(path2D);

    time += 0.04 + (currentCpu * 0.0008); // Speed scales with load
    animationId = requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   5. Apple-Style Magnetic Proximity Magnified Dock
   ========================================================================== */
function initMagneticDock() {
  const dock = document.getElementById('dock');
  const items = document.querySelectorAll('.dock-item');
  if (!dock || items.length === 0) return;

  const baseSize = 48;      // Default size in px
  const maxDelta = 24;      // Max size increase (72px max size)
  const effectRange = 120;  // Range of proximity in px

  document.addEventListener('mousemove', (e) => {
    const dockRect = dock.getBoundingClientRect();
    
    const verticalDist = Math.abs(e.clientY - (dockRect.top + dockRect.height / 2));
    if (verticalDist > effectRange * 1.5) {
      resetDock();
      return;
    }

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      if (distance < effectRange) {
        const scale = Math.exp(-Math.pow(distance, 2) / (2 * Math.pow(65, 2)));
        const finalSize = baseSize + maxDelta * scale;
        
        item.style.width = `${finalSize}px`;
        item.style.height = `${finalSize}px`;
        item.style.transform = `translateY(${-12 * scale}px)`;
      } else {
        item.style.width = `${baseSize}px`;
        item.style.height = `${baseSize}px`;
        item.style.transform = 'translateY(0)';
      }
    });
  });

  dock.addEventListener('mouseleave', resetDock);

  function resetDock() {
    items.forEach((item) => {
      item.style.width = `${baseSize}px`;
      item.style.height = `${baseSize}px`;
      item.style.transform = 'translateY(0)';
    });
  }
}
