import { createContext, useContext, useReducer, useCallback } from 'react';

const AppContext = createContext(null);

// ── Initial State ──
const ADMIN_ID = 'admin';
const ADMIN_PW = '0617';

const samplePrompts = [
  {
    id: '1',
    image: null,
    prompt: 'A neon-lit cyberpunk alleyway with rain reflections on wet asphalt, volumetric fog, cinematic lighting, 8K ultra detailed',
    tags: ['Neon', 'Cinematic', 'Dark'],
    colors: ['#ff00ff', '#00ffff', '#1a1a2e'],
    author: 'system',
    isPublic: true,
    createdAt: Date.now() - 86400000 * 3,
    copies: 42,
  },
  {
    id: '2',
    image: null,
    prompt: 'Minimal white product photography, single matte object on infinity curve, soft diffused lighting, clean shadows',
    tags: ['Minimal', 'Clean', 'Product'],
    colors: ['#ffffff', '#f5f5f5', '#e0e0e0'],
    author: 'system',
    isPublic: true,
    createdAt: Date.now() - 86400000 * 2,
    copies: 28,
  },
  {
    id: '3',
    image: null,
    prompt: 'Rough industrial texture wall with peeling paint layers, concrete brutalist architecture, golden hour side lighting',
    tags: ['Rough', 'Industrial', 'Texture'],
    colors: ['#8b7355', '#a0522d', '#696969'],
    author: 'system',
    isPublic: true,
    createdAt: Date.now() - 86400000,
    copies: 15,
  },
  {
    id: '4',
    image: null,
    prompt: 'Abstract fluid art, metallic gold and deep black ink swirls, macro photography, studio lighting, glossy finish',
    tags: ['Abstract', 'Luxury', 'Fluid'],
    colors: ['#ffd700', '#1a1a1a', '#b8860b'],
    author: 'system',
    isPublic: true,
    createdAt: Date.now() - 43200000,
    copies: 33,
  },
];

const initialUsers = [
  { id: 'user_1', username: 'DesignPro', email: 'design@test.com', password: '1234', joinedAt: Date.now() - 86400000 * 10 },
  { id: 'user_2', username: 'CreativeAI', email: 'ai@test.com', password: '1234', joinedAt: Date.now() - 86400000 * 5 },
  { id: 'user_3', username: 'PixelMaker', email: 'pixel@test.com', password: '1234', joinedAt: Date.now() - 86400000 * 2 },
];

const initialState = {
  // Auth
  currentUser: null,
  isAdmin: false,
  isAuthModalOpen: false,
  authMode: 'login', // 'login' | 'signup'

  // Library
  prompts: samplePrompts,
  activeTab: 'public', // 'personal' | 'public'
  publicSyncEnabled: true,

  // Upload
  uploadState: 'idle', // 'idle' | 'uploading' | 'analyzing' | 'done'
  uploadProgress: 0,
  uploadedImage: null,
  analysisResult: null,
  isSlidePanelOpen: false,

  // Admin
  users: initialUsers,

  // UI
  toasts: [],
};

// ── Reducer ──
function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload,
        isAdmin: action.payload.username === ADMIN_ID,
        isAuthModalOpen: false,
      };
    case 'LOGOUT':
      return { ...state, currentUser: null, isAdmin: false };
    case 'TOGGLE_AUTH_MODAL':
      return { ...state, isAuthModalOpen: !state.isAuthModalOpen, authMode: action.payload || 'login' };
    case 'SET_AUTH_MODE':
      return { ...state, authMode: action.payload };
    case 'REGISTER_USER': {
      const newUser = {
        id: `user_${Date.now()}`,
        ...action.payload,
        joinedAt: Date.now(),
      };
      return { ...state, users: [...state.users, newUser] };
    }
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload),
        prompts: state.prompts.filter(p => p.author !== action.payload),
      };

    // Library
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'ADD_PROMPT':
      return { ...state, prompts: [action.payload, ...state.prompts] };
    case 'DELETE_PROMPT':
      return { ...state, prompts: state.prompts.filter(p => p.id !== action.payload) };
    case 'INCREMENT_COPY': 
      return {
        ...state,
        prompts: state.prompts.map(p =>
          p.id === action.payload ? { ...p, copies: p.copies + 1 } : p
        ),
      };
    case 'TOGGLE_PUBLIC_SYNC':
      return { ...state, publicSyncEnabled: !state.publicSyncEnabled };
    case 'TOGGLE_PROMPT_VISIBILITY':
      return {
        ...state,
        prompts: state.prompts.map(p =>
          p.id === action.payload ? { ...p, isPublic: !p.isPublic } : p
        ),
      };

    // Upload
    case 'SET_UPLOAD_STATE':
      return { ...state, uploadState: action.payload };
    case 'SET_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload };
    case 'SET_UPLOADED_IMAGE':
      return { ...state, uploadedImage: action.payload };
    case 'SET_ANALYSIS_RESULT':
      return { ...state, analysisResult: action.payload };
    case 'TOGGLE_SLIDE_PANEL':
      return { ...state, isSlidePanelOpen: action.payload ?? !state.isSlidePanelOpen };
    case 'RESET_UPLOAD':
      return {
        ...state,
        uploadState: 'idle',
        uploadProgress: 0,
        uploadedImage: null,
        analysisResult: null,
        isSlidePanelOpen: false,
      };

    // Toasts
    case 'ADD_TOAST': {
      const toast = action.payload;
      return { ...state, toasts: [...state.toasts, toast] };
    }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    default:
      return state;
  }
}

// ── Mock AI Analysis ──
function analyzeImage(imageDataUrl) {
  return new Promise((resolve) => {
    // Create a canvas to extract colors
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorMap = {};

      // Sample pixels
      for (let i = 0; i < imageData.length; i += 40) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        // Quantize
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;
        const key = `${qr},${qg},${qb}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }

      const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
      const topColors = sorted.slice(0, 5).map(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      });

      // Determine tags based on color properties
      const tags = [];
      const avgBrightness = sorted.slice(0, 3).reduce((sum, [key]) => {
        const [r, g, b] = key.split(',').map(Number);
        return sum + (r + g + b) / 3;
      }, 0) / 3;

      if (avgBrightness < 80) tags.push('Dark');
      if (avgBrightness > 180) tags.push('Bright');
      if (avgBrightness >= 80 && avgBrightness <= 180) tags.push('Balanced');

      // Check for neon/saturated colors
      const hasSaturated = sorted.slice(0, 5).some(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        return (max - min) > 128;
      });
      if (hasSaturated) tags.push('Neon');

      // Check color variety
      const uniqueHues = new Set(sorted.slice(0, 10).map(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        return Math.round(Math.atan2(g - b, r - g) * 6);
      }));
      if (uniqueHues.size <= 2) tags.push('Minimal');
      if (uniqueHues.size >= 5) tags.push('Colorful');

      // Texture guess
      const edgeVariance = sorted.length;
      if (edgeVariance > 50) tags.push('Rough');
      if (edgeVariance <= 20) tags.push('Clean');
      if (edgeVariance > 20 && edgeVariance <= 50) tags.push('Detailed');

      // Generate a prompt suggestion
      const styleWords = tags.join(', ').toLowerCase();
      const promptSuggestion = `${styleWords} composition, inspired by the uploaded reference, professional quality, high resolution`;

      resolve({
        colors: topColors,
        tags: tags.slice(0, 4),
        promptSuggestion,
      });
    };
    img.src = imageDataUrl;
  });
}

// ── Provider ──
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const login = useCallback((username, password) => {
    if (username === ADMIN_ID && password === ADMIN_PW) {
      dispatch({ type: 'LOGIN', payload: { id: 'admin', username: 'admin', email: 'admin@promptshot.io' } });
      return true;
    }
    const user = state.users.find(u =>
      (u.username === username || u.email === username) && u.password === password
    );
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  }, [state.users]);

  const signup = useCallback((username, email, password) => {
    const exists = state.users.some(u => u.username === username || u.email === email);
    if (exists) return false;
    const newUser = { username, email, password };
    dispatch({ type: 'REGISTER_USER', payload: newUser });
    dispatch({ type: 'LOGIN', payload: { id: `user_${Date.now()}`, username, email } });
    return true;
  }, [state.users]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 3500);
  }, []);

  const handleUpload = useCallback(async (file) => {
    dispatch({ type: 'SET_UPLOAD_STATE', payload: 'uploading' });

    // Read file
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      dispatch({ type: 'SET_UPLOADED_IMAGE', payload: dataUrl });

      // Simulate upload progress
      for (let i = 0; i <= 60; i += 5) {
        await new Promise(r => setTimeout(r, 50));
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: i });
      }

      dispatch({ type: 'SET_UPLOAD_STATE', payload: 'analyzing' });

      // Analyze
      for (let i = 60; i <= 85; i += 3) {
        await new Promise(r => setTimeout(r, 80));
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: i });
      }

      const result = await analyzeImage(dataUrl);
      dispatch({ type: 'SET_ANALYSIS_RESULT', payload: result });

      for (let i = 85; i <= 100; i += 2) {
        await new Promise(r => setTimeout(r, 40));
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: i });
      }

      dispatch({ type: 'SET_UPLOAD_STATE', payload: 'done' });
      dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: 100 });

      // Open slide panel
      setTimeout(() => {
        dispatch({ type: 'TOGGLE_SLIDE_PANEL', payload: true });
      }, 400);
    };
    reader.readAsDataURL(file);
  }, []);

  const value = {
    state,
    dispatch,
    login,
    signup,
    addToast,
    handleUpload,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
