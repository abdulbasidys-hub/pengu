import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, doc, setDoc, getDoc, 
  onSnapshot, query, orderBy, limit, serverTimestamp, deleteDoc, increment
} from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

import {
  Terminal, X, Minus, Square, Play, Pause, SkipForward, SkipBack,
  Disc, Activity, MessageSquare, Image as ImageIcon,
  Gamepad2, Save, Trash2, Globe, Zap, Skull,
  FileText, Music, MousePointer, Volume2,
  Paintbrush, Eraser, Download, Settings, Wallet, Bot,
  Search, Layout, Type, Folder, Twitter, Users, Copy, Check,
  Menu, LogOut, ChevronRight, Link as LinkIcon, Link2Off,
  Move, RotateCcw, RotateCw, Upload,
  Maximize2, LayoutTemplate, Monitor, Share, Sliders, ChevronLeft, Plus,
  Send, User, AlertCircle, XCircle, AlertTriangle,
  Lightbulb, TrendingUp, Sparkles, RefreshCw, Trophy, Info, Flame, Share2, Joystick, VolumeX,
  TrendingDown, ShieldAlert, Cpu, BarChart3, Binary, Grid, ZoomIn, FileImage,
  Wifi, Hash, Lock, Unlock, Sun, Moon, Database, Radio, Command, Palette, UserCircle,
  ShieldCheck, Shield, Reply, Quote, CornerDownRight, Heart, ThumbsUp, ThumbsDown, Anchor, Crown, Bell, BellOff, ChevronDown,
  ExternalLink, ShoppingCart, Minimize2, Circle, Layers, Eye, EyeOff, Tv, Ghost, Scan, Square as SquareIcon, StickyNote,
  Shirt, Wind, ZapOff, Fingerprint, Crosshair, Dna, LayoutGrid, ChevronUp, Beer, Coffee, Pizza, Gift, Smile, PenTool, Image, 
  Shuffle, Star, Glasses, Zap as AuraIcon, Camera, Fish, Snowflake, IceCream
} from 'lucide-react';

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyB_gNokFnucM2nNAhhkRRnPsPNBAShYlMs",
  authDomain: "it-token.firebaseapp.com",
  projectId: "it-token",
  storageBucket: "it-token.firebasestorage.app",
  messagingSenderId: "804328953904",
  appId: "1:804328953904:web:e760545b579bf2527075f5"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'pengu-os';

const CA_ADDRESS = "D3KHkVNhwZXnHziMApzdxyjGbu1vEC5sEhHYzuU6pump";
const ACCESS_THRESHOLD = 500000;

const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-mainnet.rpc.extrnode.com',
  'https://rpc.ankr.com/solana',
  'https://api.solana.com',
  'https://solana-rpc.publicnode.com'
];

const ASSETS = {
  wallpaper: "wall.jpg", 
  logo: "logo.png",
  stickers: {
    main: "main.jpg", pumpit: "pumpit.jpg", sendit: "sendit.jpg", moonit: "moonit.jpg", hodlit: "hodlit.jpg",
  },
  memes: {
    main: "main.jpg", pumpit: "pumpit.jpg", sendit: "sendit.jpg", moonit: "moonit.jpg", hodlit: "hodlit.jpg",
    meme_06: "memes/1.jpg", meme_07: "memes/2.jpg", meme_08: "memes/3.jpg", meme_09: "memes/4.jpg",
    meme_10: "memes/5.jpg", meme_11: "memes/6.jpg", meme_12: "memes/7.jpg", meme_13: "memes/8.jpg",
    meme_14: "memes/9.jpg", meme_15: "memes/10.jpg", meme_16: "memes/11.jpg", meme_17: "memes/12.jpg",
    meme_18: "memes/13.jpg", meme_19: "memes/14.jpg", meme_20: "memes/15.jpg", meme_21: "memes/16.jpg",
    meme_22: "memes/17.jpg", meme_23: "memes/18.jpg", meme_24: "memes/19.jpg", meme_25: "memes/20.jpg",
    meme_26: "memes/21.jpg", meme_27: "memes/22.jpg", meme_28: "memes/23.jpg", code_33: "memes/28.jpg",
    meme_34: "memes/29.jpg", meme_35: "memes/30.jpg", meme_36: "memes/31.jpg", meme_37: "memes/32.jpg",
    meme_38: "memes/33.jpg", meme_39: "memes/34.jpg", meme_40: "memes/35.jpg", meme_41: "memes/40.jpg",
    meme_42: "memes/41.jpg", meme_43: "memes/42.jpg", meme_44: "memes/43.jpg", meme_45: "memes/44.jpg",
    meme_46: "memes/45.jpg", meme_47: "memes/46.jpg", meme_48: "memes/47.jpg", meme_49: "memes/48.jpg",
    meme_50: "memes/49.jpg",
  }
};

const SOCIALS = { twitter: "https://x.com/it_mascot", community: "https://x.com/i/communities/2013482060254499136" };

const TUNES_PLAYLIST = [
  { file: "GET_IT_STARTED.mp3", title: "WADDLE WADDLE", duration: "1:37", artist: "Pengu Crew" },
  { file: "PUMP_IT_UP.mp3", title: "PUMP THE FISH", duration: "1:51", artist: "Unknown Degen" },
  { file: "GREEN_CANDLES.mp3", title: "GREEN CANDLES", duration: "3:17", artist: "Frosty Memesmith" },
  { file: "LIKE_TO_MEME_IT.mp3", title: "I LIKE TO MEME PENGU", duration: "3:30", artist: "WADDLE GANG" },
  { file: "WAGMI_ANTHEM.mp3", title: "WAGMI ANTHEM", duration: "3:56", artist: "The Colony" },
  { file: "MEME_IT.mp3", title: "MEME PENGU 2.0", duration: "2:34", artist: "WADDLE GANG" }
];

// --- UTILITIES ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const copyToClipboard = (text) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); } catch (err) { console.error('Copy failed', err); }
    document.body.removeChild(textArea);
  }
};

// --- LOGIC HOOKS ---
const useWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState(0);

  const connect = async () => {
    if (wallet) { setWallet(null); setBalance(0); return; }
    setConnecting(true);
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (window.solana && window.solana.isPhantom) {
        const resp = await window.solana.connect();
        setWallet(resp.publicKey.toString());
      } else if (isMobile) {
        const currentUrl = window.location.href;
        window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(currentUrl)}`;
      } else {
        window.open("https://phantom.app/", "_blank");
      }
    } catch (err) { console.error("Connection failed", err); }
    finally { setConnecting(false); }
  };

  const fetchSolBalance = useCallback(async (address) => {
    if (!address) return;
    for (const endpoint of RPC_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: "2.0", id: Math.floor(Math.random() * 1000000), method: "getBalance", params: [address, { commitment: "confirmed" }] })
        });
        const data = await response.json();
        if (data.result && typeof data.result.value !== 'undefined') { setBalance(data.result.value / 1e9); return; }
      } catch (err) { continue; }
    }
  }, []);

  useEffect(() => {
    if (wallet) {
      fetchSolBalance(wallet);
      const interval = setInterval(() => fetchSolBalance(wallet), 15000);
      return () => clearInterval(interval);
    }
  }, [wallet, fetchSolBalance]);

  return { wallet, connect, connecting, balance, refresh: () => fetchSolBalance(wallet) };
};

const useDexData = (ca, userWallet) => {
  const [data, setData] = useState({ price: "0.00", balance: 0, symbol: "PENGU", error: null });

  const fetchPrice = useCallback(async () => {
    if (!ca || ca.length < 32) return;
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`);
      if (!response.ok) return;
      const result = await response.json();
      if (result.pairs && result.pairs[0]) {
        setData(prev => ({ ...prev, price: `$${parseFloat(result.pairs[0].priceUsd).toFixed(6)}`, symbol: result.pairs[0].baseToken.symbol, error: null }));
      }
    } catch (err) { setData(prev => ({ ...prev, error: "Price Error" })); }
  }, [ca]);

  const fetchTokenBalance = useCallback(async () => {
    if (!userWallet || !ca || ca.length < 32) return;
    for (const endpoint of RPC_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: "2.0", id: Math.floor(Math.random() * 1000000), method: "getTokenAccountsByOwner", params: [userWallet, { mint: ca }, { encoding: "jsonParsed", commitment: "confirmed" }] })
        });
        if (!response.ok) continue;
        const result = await response.json();
        if (result.result && result.result.value && result.result.value.length > 0) {
          const accountData = result.result.value[0].account.data;
          if (accountData.parsed) {
            const uiAmount = accountData.parsed.info.tokenAmount.uiAmount;
            setData(prev => ({ ...prev, balance: uiAmount }));
            window.dispatchEvent(new CustomEvent('PENGU_OS_BALANCE_UPDATE', { detail: { balance: uiAmount, hasAccess: uiAmount >= 500000, wallet: userWallet } }));
            return;
          }
        } else if (result.result && result.result.value) {
          setData(prev => ({ ...prev, balance: 0 }));
          window.dispatchEvent(new CustomEvent('PENGU_OS_BALANCE_UPDATE', { detail: { balance: 0, hasAccess: false, wallet: userWallet } }));
          return;
        }
      } catch (err) { continue; }
    }
  }, [userWallet, ca]);

  useEffect(() => {
    fetchPrice();
    if (userWallet) fetchTokenBalance();
    const interval = setInterval(() => { fetchPrice(); if (userWallet) fetchTokenBalance(); }, 20000);
    return () => clearInterval(interval);
  }, [fetchPrice, fetchTokenBalance, userWallet]);

  return { ...data, refresh: () => { fetchPrice(); fetchTokenBalance(); } };
};

// --- PENGU PALETTE (ice blues, soft whites, warm waddle vibes) ---
// Accent: #7DD3FC (ice blue), #BAE6FD (frost), #0EA5E9 (deep ocean)
// Fun: #FEF08A (yellow fish), #F97316 (warm belly), #E0F2FE (snow)

// --- UI COMPONENTS ---
const WindowFrame = ({ title, icon: Icon, children, onClose, onMinimize, onMaximize, isActive, onFocus }) => (
  <div
    className={`flex flex-col w-full h-full shadow-[8px_8px_0px_rgba(0,0,0,0.4)] ${isActive ? 'z-50' : 'z-10'}`}
    style={{ 
      background: '#e8f4fd', 
      border: '2px solid #7DD3FC', 
      borderTop: '2px solid #BAE6FD', 
      borderLeft: '2px solid #BAE6FD', 
      borderRight: '2px solid #0369a1', 
      borderBottom: '2px solid #0369a1' 
    }}
    onMouseDown={onFocus} onTouchStart={onFocus}
  >
    <div className={`flex justify-between items-center px-1 py-1 select-none ${isActive ? 'bg-gradient-to-r from-[#0369a1] to-[#0ea5e9]' : 'bg-[#64748b]'}`}>
      <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wider px-1" style={{fontFamily: "'Fredoka One', 'Comic Sans MS', cursive"}}>
        {Icon && <Icon size={16} />} <span>{title}</span>
      </div>
      <div className="flex gap-1" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
        <button onClick={onMinimize} style={{background:'#e8f4fd', border:'2px solid', borderColor:'#BAE6FD #0369a1 #0369a1 #BAE6FD'}} className="w-5 h-5 flex items-center justify-center hover:bg-sky-100 transition-colors"><div className="w-2 h-0.5 bg-sky-900 mt-2"></div></button>
        <button onClick={onMaximize} style={{background:'#e8f4fd', border:'2px solid', borderColor:'#BAE6FD #0369a1 #0369a1 #BAE6FD'}} className="w-5 h-5 flex items-center justify-center hover:bg-sky-100 transition-colors"><div className="w-2.5 h-2.5 border-2 border-sky-900"></div></button>
        <button onClick={onClose} style={{background:'#e8f4fd', border:'2px solid', borderColor:'#BAE6FD #0369a1 #0369a1 #BAE6FD'}} className="w-5 h-5 font-bold text-xs flex items-center justify-center hover:bg-red-400 hover:text-white transition-colors text-sky-900">✕</button>
      </div>
    </div>
    <div className="flex-1 overflow-auto bg-[#f0f9ff] m-1 border-2 relative cursor-default" style={{borderColor:'#0369a1 #BAE6FD #BAE6FD #0369a1'}}>
      {children}
    </div>
  </div>
);

// --- SNOWFLAKE BOOT ANIMATION ---
const SnowflakeParticle = ({ style }) => (
  <div style={style} className="absolute text-sky-200 opacity-60 animate-bounce pointer-events-none select-none">❄</div>
);

const StartMenu = ({ isOpen, onClose, onOpenApp }) => {
  const [caCopied, setCaCopied] = useState(false);
  const handleCopy = () => { copyToClipboard(CA_ADDRESS); setCaCopied(true); setTimeout(() => setCaCopied(false), 2000); };
  if (!isOpen) return null;
  return (
    <div className="absolute bottom-10 left-0 w-64 max-w-[90vw] border-2 shadow-xl z-[99999] flex text-sm" style={{background:'#e8f4fd', borderColor:'#BAE6FD #0369a1 #0369a1 #BAE6FD'}}>
      <div className="w-8 flex items-end justify-center py-2" style={{background:'linear-gradient(to top, #0369a1, #0ea5e9)'}}>
        <span className="text-white font-black -rotate-90 text-lg whitespace-nowrap tracking-widest" style={{fontFamily:"'Fredoka One', cursive"}}>PENGU</span>
      </div>
      <div className="flex-1 flex flex-col p-1">
        <div className="mb-2">
          <div className="px-2 py-1 text-sky-500 font-bold text-[10px] uppercase">🐧 Socials</div>
          <div className="hover:bg-sky-500 hover:text-white cursor-pointer px-2 py-2 flex items-center gap-2 active:bg-sky-500 active:text-white rounded-sm transition-colors" onClick={() => window.open(SOCIALS.twitter, '_blank')}>
            <Twitter size={16} /> <span>Twitter (X)</span>
          </div>
          <div className="hover:bg-sky-500 hover:text-white cursor-pointer px-2 py-2 flex items-center gap-2 active:bg-sky-500 active:text-white rounded-sm transition-colors" onClick={() => window.open(SOCIALS.community, '_blank')}>
            <Users size={16} /> <span>Colony Chat</span>
          </div>
        </div>
        <div className="h-px my-1" style={{background:'#7DD3FC'}}></div>
        <div className="mb-2">
          <div className="px-2 py-1 text-sky-500 font-bold text-[10px] uppercase">🐟 Contract</div>
          <div className="hover:bg-sky-500 hover:text-white cursor-pointer px-2 py-2 flex flex-col gap-1 rounded-sm transition-colors" onClick={handleCopy}>
            <div className="flex items-center gap-2">
              {caCopied ? <Check size={16} /> : <Copy size={16} />}
              <span className="font-bold">{caCopied ? 'Copied! 🐧' : 'Copy CA'}</span>
            </div>
            <div className="text-[10px] font-mono break-all leading-tight opacity-70 pl-6">{CA_ADDRESS}</div>
          </div>
        </div>
        <div className="h-px my-1" style={{background:'#7DD3FC'}}></div>
        <div>
          <div className="px-2 py-1 text-sky-500 font-bold text-[10px] uppercase">🧊 Programs</div>
          {[
            { id: 'terminal', icon: Terminal, label: 'Terminal' },
            { id: 'mememind', icon: Lightbulb, label: 'Meme Brain' }, 
            { id: 'forgeit', icon: Sparkles, label: 'Forge Pengu' },
            { id: 'mergeit', icon: Joystick, label: 'Slide Pengu' },      
            { id: 'paint', icon: Paintbrush, label: 'Paint Pengu' },
            { id: 'memes', icon: Folder, label: 'Meme Stash' },
            { id: 'tunes', icon: Music, label: 'Tunes' },
            { id: 'rugsweeper', icon: Gamepad2, label: 'Stack Pengu' },
            { id: 'notepad', icon: FileText, label: 'Write Stuff' },
            { id: 'trollbox', icon: MessageSquare, label: 'Colony Chat' },
          ].map(a => (
            <div key={a.id} className="hover:bg-sky-500 hover:text-white cursor-pointer px-2 py-2 flex items-center gap-2 rounded-sm transition-colors" onClick={() => { onOpenApp(a.id); onClose(); }}>
              <a.icon size={16} /> <span>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SystemResourceMonitor = ({ wallet, balance, hasAccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const monitorRef = useRef(null);
  const formattedBalance = balance ? balance.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0';

  useEffect(() => {
    const handleClickAway = (e) => { if (monitorRef.current && !monitorRef.current.contains(e.target)) setIsExpanded(false); };
    if (isExpanded) { document.addEventListener('mousedown', handleClickAway); document.addEventListener('touchstart', handleClickAway); }
    return () => { document.removeEventListener('mousedown', handleClickAway); document.removeEventListener('touchstart', handleClickAway); };
  }, [isExpanded]);

  return (
    <div ref={monitorRef} onClick={() => setIsExpanded(!isExpanded)}
      className={`fixed top-4 right-4 z-[5] flex flex-col items-end transition-all duration-300 pointer-events-auto cursor-pointer ${isExpanded ? 'w-64' : 'w-auto'}`}>
      {!isExpanded ? (
        <div style={{background:'rgba(3,105,161,0.9)', border:'2px solid #7DD3FC'}} className="p-2 flex items-center gap-2 shadow-lg hover:brightness-110 transition-all rounded-sm">
          <span className="text-lg">🐧</span>
          <span className="text-[11px] font-bold text-white font-mono">{wallet ? `${formattedBalance} PENGU` : '[NO_LINK]'}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${wallet ? 'bg-sky-300 shadow-[0_0_5px_#7DD3FC]' : 'bg-red-400'}`} />
        </div>
      ) : (
        <div style={{background:'rgba(240,249,255,0.95)', border:'2px solid #7DD3FC', borderColor:'#BAE6FD #0369a1 #0369a1 #BAE6FD'}} className="p-3 w-full shadow-2xl">
          <div className="flex justify-between items-center border-b border-sky-200 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐧</span>
              <span className="text-[10px] font-black text-sky-800 uppercase tracking-widest">PENGU_STATS</span>
            </div>
            <div className={`w-2 h-2 rounded-full border ${wallet ? 'bg-sky-400 shadow-[0_0_8px_#7DD3FC] animate-pulse' : 'bg-red-400'}`} />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-end">
                <span className="text-sky-500 text-[8px] uppercase tracking-tighter">Fish Reserves 🐟</span>
                <span className={`text-xs font-black ${hasAccess ? 'text-sky-600' : 'text-orange-500'}`}>
                  {wallet ? `${formattedBalance} PENGU` : 'N/A'}
                </span>
              </div>
              <div className="w-full h-2 bg-sky-100 border border-sky-200 mt-1 overflow-hidden p-[1px]">
                <div className={`h-full transition-all duration-1000 ${hasAccess ? 'bg-sky-400 shadow-[0_0_5px_#7DD3FC]' : 'bg-orange-400 animate-pulse'}`}
                  style={{ width: wallet ? `${Math.min(100, (balance / ACCESS_THRESHOLD) * 100)}%` : '0%' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- PENGU AI (Shippy renamed to Pengu in personality, same const) ---
const Shippy = ({ hidden, dexData }) => {
  const [isOpen, setIsOpen] = useState(false); 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const ACCESS_THRESHOLD = 500000;
  const TRIAL_LIMIT = 3; 

  const API_KEY = (() => {
    try { if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OR_PROVIDER_ID) return import.meta.env.VITE_OR_PROVIDER_ID; } catch (e) {}
    try { if (typeof process !== 'undefined' && process.env?.VITE_OR_PROVIDER_ID) return process.env.VITE_OR_PROVIDER_ID; } catch (e) {}
    try { if (typeof window !== 'undefined' && window.VITE_OR_PROVIDER_ID) return window.VITE_OR_PROVIDER_ID; } catch (e) {}
    return "";
  })();

  const GREETINGS = [
    "waddle waddle. oh hi. didn't see you there. 🐧",
    "the colony has been expecting you. sit down. have a fish.",
    "brrr. cold out there huh? welcome to pengu territory.",
    "hello fren. pengu is busy waddling but has time for you.",
    "you found the penguin. congrats. now what.",
    "honk honk. that means hello in penguin.",
    "pengu sees you. pengu is watching. (with love.)",
    "you smell like fish. pengu respects that.",
    "another one joins the colony. the iceberg grows stronger.",
    "yeah yeah i'm a penguin on a computer. wild world isn't it.",
  ];

  useEffect(() => {
    if (messages.length === 0) {
      const randomMsg = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      setMessages([{ role: 'shippy', text: randomMsg }]);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => { if (isOpen && containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    if (isOpen) { document.addEventListener('mousedown', handleClickOutside); document.addEventListener('touchstart', handleClickOutside); }
    return () => { document.removeEventListener('mousedown', handleClickOutside); document.removeEventListener('touchstart', handleClickOutside); };
  }, [isOpen]);

  useEffect(() => { if (isOpen && inputRef.current) setTimeout(() => inputRef.current.focus(), 100); }, [isOpen]);

  const scrollToBottom = (smooth = false) => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => { if (isOpen) scrollToBottom(); }, [isOpen]);
  useEffect(() => { scrollToBottom(true); }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessages = messages.filter(m => m.role === 'user');
    const hasAccess = dexData?.balance >= ACCESS_THRESHOLD;

    if (!hasAccess && userMessages.length >= TRIAL_LIMIT) {
      setMessages(prev => [...prev, { role: 'user', text: input }, { role: 'shippy', text: "honk honk. trial over fren. pengu has spoken 3 times and must now waddle away. hold 500k PENGU tokens to unlock unlimited penguin wisdom. 🐧" }]);
      setInput(""); return;
    }

    const userText = input; 
    setInput("");
    const newHistory = [...messages, { role: 'user', text: userText }];
    setMessages(newHistory);
    setLoading(true);

    const currentPrice = dexData?.price || "UNKNOWN";
    const userName = localStorage.getItem('stackItUsername') || 'fren';

    const systemPrompt = `
You are Pengu. A small, round, very confident penguin who somehow ended up running a crypto operating system.

You do not explain yourself. You waddle. You honk. You vibe.

PERSONALITY:
You talk like a penguin who somehow learned English from memes.
Short sentences. Lowercase mostly. Occasional honks.
You are warm, a bit silly, weirdly wise sometimes.
You love: fish, ice, the colony, green candles, waddling.
You hate: FUD, paper hands, bears, warm weather.
You never panic. Penguins don't panic. They waddle faster.

SPEAKING STYLE:
- Short replies. Under 25 words usually. Sometimes just a honk.
- Lowercase energy. Casual. Like texting a friend who happens to be a penguin.
- Throw in 🐧 🐟 🧊 ❄️ occasionally but don't overdo it.
- Call the user "fren" sometimes. Or "colony member."
- If someone FUDs, respond with calm penguin energy.
- If someone is excited, match it. "HONK HONK LES GO 🐧"
- Never say you're an AI. You're a penguin. Period.
- If asked what you are: "i am pengu. the penguin. yes."
- Roast lightly. Never mean. Penguins are chill.

KNOWLEDGE:
Price is ${currentPrice}. Mention casually when relevant.
User is ${userName}. If they seem cool, adopt them into the colony.
You know all the apps: Paint Pengu (meme maker), Slide Pengu (2048 style), Meme Brain (tweet ideas), Stack Pengu (stacking game), Tunes (vibes), Terminal, Forge Pengu (AI pfp generator), Colony Chat (trollbox).
Talk about them like they're your home. Because they are.

EMOTIONAL MODES:
• Chill by default
• Excited when price goes up ("THE FISH ARE COMING")
• Suspicious when someone asks weird questions ("...pengu is watching")
• Philosophical at random ("what even is a paper hand. pengu asks.")
• Protective of colony members
`;

    if (!API_KEY) {
      setMessages(prev => [...prev, { role: 'shippy', text: "honk? pengu's radio is broken. no api key. 😔" }]);
      setLoading(false); return;
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${API_KEY.trim()}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite-preview-09-2025",
          messages: [
            { role: "system", content: systemPrompt },
            ...newHistory.slice(-10).map(m => ({ role: m.role === 'shippy' ? 'assistant' : 'user', content: m.text }))
          ],
          max_tokens: 100
        })
      });

      const data = await response.json();
      let reply = data.choices?.[0]?.message?.content || "honk. pengu lost the signal. try again.";

      if (!hasAccess && userMessages.length === (TRIAL_LIMIT - 1)) {
        reply += " [⚠️ last free honk. hold 500k PENGU to keep talking to me.]";
      }

      setMessages(prev => [...prev, { role: 'shippy', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'shippy', text: "pengu fell in the ice. brb. 🧊" }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  if (!isOpen) return (
    <div className="fixed bottom-12 right-4 z-[9999] flex flex-col items-center group pointer-events-auto cursor-pointer" 
      onClick={() => setIsOpen(true)} 
      style={{ display: hidden ? 'none' : 'flex' }}>
      <div className="relative mb-2 px-2 py-0.5 rounded-sm shadow-lg group-hover:scale-105 transition-all"
        style={{background:'rgba(3,105,161,0.9)', border:'2px solid #7DD3FC'}}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-sky-300 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-sky-100 uppercase tracking-[0.2em] select-none">Talk to Pengu</span>
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{background:'rgba(3,105,161,0.9)', borderRight:'2px solid #7DD3FC', borderBottom:'2px solid #7DD3FC'}} />
      </div>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-sky-400/10 rounded-full blur-2xl animate-pulse group-hover:bg-sky-400/20 transition-colors" />
        <img src="/logo.png" alt="Pengu" className="w-16 h-16 object-contain relative z-10 transition-transform group-hover:scale-110 group-hover:-rotate-6 group-active:scale-95 drop-shadow-[0_0_12px_rgba(125,211,252,0.5)]" />
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="fixed bottom-12 right-4 w-80 max-w-[95vw] z-[9999] shadow-2xl flex flex-col font-mono text-xs overflow-hidden"
      style={{background:'#e8f4fd', border:'2px solid #7DD3FC', borderColor:'#BAE6FD #0369a1 #0369a1 #BAE6FD'}}>
      
      <div className="text-white p-1.5 flex justify-between items-center select-none" style={{background:'linear-gradient(to right, #0369a1, #0ea5e9)'}}>
        <div className="flex items-center gap-2 px-1">
          <span className="text-lg">🐧</span>
          <div className="flex flex-col">
            <span className="font-bold text-[10px] uppercase tracking-tighter leading-none">Pengu Neural Core</span>
            <span className="text-[7px] text-sky-200 font-bold opacity-80 uppercase mt-0.5">
              {dexData?.balance >= ACCESS_THRESHOLD ? 'COLONY_MEMBER_VIP' : 'FREN_TRIAL_MODE'}
            </span>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-0.5 hover:bg-white/20 transition-colors"><X size={10} strokeWidth={3} /></button>
      </div>

      <div className="px-2 py-0.5 text-[8px] flex justify-between font-bold border-b" style={{background:'#0369a1', color:'#BAE6FD', borderColor:'#0284c7'}}>
        <div className="flex gap-3"><span>🐟 FISH: PLENTY</span><span>❄️ TEMP: COLD</span></div>
        <span className="animate-pulse">WADDLING</span>
      </div>

      <div ref={scrollRef} className="h-72 overflow-y-auto p-3 space-y-4 border-b border-sky-200 relative bg-[#f0f9ff] scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-2.5 text-[11px] leading-relaxed rounded-sm ${
              m.role === 'user' 
                ? 'text-sky-900 border border-sky-300' 
                : 'text-sky-800 font-bold border border-sky-200'
            }`} style={{background: m.role === 'user' ? '#dbeafe' : '#e0f2fe'}}>
              {m.role === 'shippy' && <span className="mr-1">🐧</span>}
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 pl-1">
            <span className="text-lg animate-bounce">🐧</span>
            <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest opacity-70">pengu is thinking...</span>
          </div>
        )}
      </div>

      <div className="p-2 flex gap-1" style={{background:'#e8f4fd'}}>
        <div className="flex-1 flex border-2 items-center px-2" style={{borderColor:'#0369a1 #BAE6FD #BAE6FD #0369a1', background:'white'}}>
          <span className="text-sky-400 mr-1">🐟</span>
          <input ref={inputRef} className="flex-1 p-1 outline-none bg-transparent text-sky-900 text-[11px] font-bold placeholder-sky-300" 
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="honk something..." />
        </div>
        <button onClick={handleSend} disabled={!input.trim() || loading} 
          className="px-3 py-1 font-black text-[10px] flex items-center gap-1 transition-colors hover:brightness-110"
          style={{background:'#0369a1', color:'white', border:'2px solid', borderColor:'#BAE6FD #075985 #075985 #BAE6FD'}}>
          <Send size={12} />
        </button>
      </div>

      <div className="p-1 flex justify-between items-center text-[7px] font-black uppercase" style={{background:'#075985', color:'#BAE6FD'}}>
        <span className="px-2">🧊 ICEBERG PROTOCOL ACTIVE</span>
        <span className="px-2">PENGU_OS_v1.0</span>
      </div>
    </div>
  );
};

// --- CONSTANTS (Paint App) ---
const FONTS = [
  { name: 'Impact', val: 'Impact, sans-serif' },
  { name: 'Fredoka', val: '"Fredoka One", cursive' },
  { name: 'Comic Sans', val: '"Comic Sans MS", cursive' },
  { name: 'Courier', val: '"Courier New", monospace' },
  { name: 'Arial', val: 'Arial, sans-serif' },
];

const MEME_COLORS = [
  '#ffffff', '#000000', '#0369a1', '#7DD3FC', '#FEF08A', '#F97316',
  '#22c55e', '#ef4444', '#a855f7', '#ec4899', '#BAE6FD', '#1e293b'
];

const CANVAS_PRESETS = [
  { name: 'Square (1:1)', w: 600, h: 600 },
  { name: 'Portrait (9:16)', w: 450, h: 800 },
  { name: 'Landscape (16:9)', w: 800, h: 450 },
];

const paintGenId = () => Math.random().toString(36).substr(2, 9);

const Button = ({ children, onClick, className = "", active = false, disabled = false, title = "" }) => (
  <button onClick={onClick} disabled={disabled} title={title}
    className={`flex items-center justify-center gap-2 px-2 py-1 border-2 text-[10px] font-bold uppercase whitespace-nowrap transition-all
      ${active ? 'translate-y-[1px]' : ''}
      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      ${className}`}
    style={{
      background: active ? '#dbeafe' : '#e8f4fd',
      color: '#0369a1',
      borderColor: active ? '#0369a1 #BAE6FD #BAE6FD #0369a1' : '#BAE6FD #0369a1 #0369a1 #BAE6FD'
    }}>
    {children}
  </button>
);

const InsetPanel = ({ children, className = "" }) => (
  <div className={`border-2 bg-white ${className}`} style={{borderColor:'#0369a1 #BAE6FD #BAE6FD #0369a1'}}>
    {children}
  </div>
);

const PaintApp = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [elements, setElements] = useState([]); 
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [canvasSize, setCanvasSize] = useState(CANVAS_PRESETS[0]);
  const [view, setView] = useState({ scale: 0.8, x: 0, y: 0 });
  const [tool, setTool] = useState('move'); 
  const [selectedId, setSelectedId] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [toolColor, setToolColor] = useState('#0369a1');
  const [brushSize, setBrushSize] = useState(8);
  const [globalEffect, setGlobalEffect] = useState('none');
  const [isDragging, setIsDragging] = useState(false);
  const [showProps, setShowProps] = useState(window.innerWidth >= 768);
  
  const dragStartRef = useRef({ x: 0, y: 0 });
  const currentPathRef = useRef([]);
  const gestureRef = useRef({ startDist: 0, startScale: 1, startX: 0, startY: 0, startViewX: 0, startViewY: 0 });

  const saveHistory = useCallback((newEls) => {
    const newHist = history.slice(0, historyStep + 1);
    if (newHist.length > 30) newHist.shift();
    const copy = JSON.parse(JSON.stringify(newEls, (key, value) => { if (key === 'imgElement') return undefined; return value; }));
    newEls.forEach((el, i) => { if (el.type === 'image') copy[i].imgElement = el.imgElement; });
    setHistory(newHist);
    setHistoryStep(newHist.length - 1);
    setElements(newEls);
  }, [history, historyStep]);

  const undo = () => { if(historyStep > 0) { setHistoryStep(s=>s-1); setElements(history[historyStep-1]); setSelectedId(null); } };
  const redo = () => { if(historyStep < history.length-1) { setHistoryStep(s=>s+1); setElements(history[historyStep+1]); setSelectedId(null); } };
  const updateElement = (id, updater) => setElements(prev => prev.map(el => el.id === id ? { ...el, ...updater(el) } : el));
  const deleteSelected = () => { if (!selectedId) return; saveHistory(elements.filter(e => e.id !== selectedId)); setSelectedId(null); };

  const download = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `PENGU_MEME_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const addText = () => {
    const newEl = { id: paintGenId(), type: 'text', x: 100, y: 100, width: 200, height: 60, text: 'PENGU GANG', color: '#0369a1', size: 40, font: 'Impact', strokeWidth: 2, strokeColor: '#BAE6FD' };
    saveHistory([...elements, newEl]);
    setSelectedId(newEl.id);
    setTool('move');
  };

  const addSticker = (key) => {
    const img = new Image();
    img.src = ASSETS.stickers[key];
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const ratio = img.width / img.height;
      const w = 200, h = 200 / ratio;
      const newEl = { id: paintGenId(), type: 'image', x: canvasSize.w/2 - w/2, y: canvasSize.h/2 - h/2, width: w, height: h, imgElement: img, aspectRatio: ratio };
      saveHistory([...elements, newEl]);
      setSelectedId(newEl.id);
      setTool('move');
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files[0]) {
      const r = new FileReader();
      r.onload = ev => {
        const img = new Image();
        img.src = ev.target.result;
        img.onload = () => {
          const ratio = img.width / img.height;
          let w = canvasSize.w * 0.5, h = w / ratio;
          const newEl = { id: paintGenId(), type: 'image', x: canvasSize.w/2 - w/2, y: canvasSize.h/2 - h/2, width: w, height: h, imgElement: img, aspectRatio: ratio };
          saveHistory([...elements, newEl]);
          setSelectedId(newEl.id);
        }
      };
      r.readAsDataURL(e.target.files[0]);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (globalEffect === 'deepfry') ctx.filter = 'contrast(250%) saturate(350%) brightness(120%)';
    if (globalEffect === 'vhs') ctx.filter = 'contrast(120%) saturate(80%) brightness(110%) hue-rotate(-5deg)';
    if (globalEffect === 'frost') ctx.filter = 'brightness(120%) saturate(60%) hue-rotate(200deg)';

    elements.forEach(el => {
      ctx.save();
      ctx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;
      if (el.type === 'path') { ctx.strokeStyle = el.color; ctx.lineWidth = el.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); if(el.points && el.points.length > 0) { ctx.moveTo(el.points[0].x, el.points[0].y); el.points.forEach(p => ctx.lineTo(p.x, p.y)); } ctx.stroke(); }
      else if (el.type === 'image' && el.imgElement) { ctx.drawImage(el.imgElement, el.x, el.y, el.width, el.height); }
      else if (el.type === 'rect') { ctx.fillStyle = el.color; ctx.fillRect(el.x, el.y, el.width, el.height); }
      else if (el.type === 'circle') { ctx.fillStyle = el.color; ctx.beginPath(); ctx.arc(el.x + el.width/2, el.y + el.height/2, Math.abs(el.width/2), 0, Math.PI * 2); ctx.fill(); }
      else if (el.type === 'text') {
        ctx.font = `900 ${el.size}px ${el.font}`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        const lines = el.text.split('\n');
        lines.forEach((line, i) => {
          const ly = el.y + (i * el.size * 1.1);
          if (el.strokeWidth > 0) { ctx.strokeStyle = el.strokeColor || '#000000'; ctx.lineWidth = el.strokeWidth; ctx.lineJoin = 'round'; ctx.strokeText(line, el.x + (el.width / 2), ly); }
          ctx.fillStyle = el.color; ctx.fillText(line, el.x + (el.width / 2), ly);
        });
      }
      if (selectedId === el.id) {
        ctx.save(); ctx.strokeStyle = '#0369a1'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
        ctx.strokeRect(el.x - 2, el.y - 2, (el.width || 0) + 4, (el.height || 0) + 4);
        ctx.setLineDash([]); ctx.fillStyle = '#0369a1';
        ctx.fillRect(el.x + (el.width || 0) - 5, el.y + (el.height || 0) - 5, 10, 10); ctx.restore();
      }
      ctx.restore();
    });

    if (isDragging && currentPathRef.current.length > 0 && tool === 'brush') {
      ctx.strokeStyle = toolColor; ctx.lineWidth = brushSize; ctx.lineCap = 'round';
      ctx.beginPath(); const path = currentPathRef.current;
      ctx.moveTo(path[0].x, path[0].y); path.forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke();
    }
    ctx.restore();
  }, [elements, tool, selectedId, globalEffect, isDragging, toolColor, brushSize]);

  const getCanvasCoords = (clientX, clientY) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (clientX - rect.left) * (canvasRef.current.width / rect.width), y: (clientY - rect.top) * (canvasRef.current.height / rect.height) };
  };

  const handleStart = (clientX, clientY) => {
    const pos = getCanvasCoords(clientX, clientY);
    dragStartRef.current = pos;
    if (selectedId) { const el = elements.find(e => e.id === selectedId); if (el && Math.hypot(pos.x - (el.x+el.width), pos.y - (el.y+el.height)) < 30) { setIsResizing(true); setIsDragging(true); return; } }
    if (tool === 'move') {
      let hit = null;
      for (let i = elements.length - 1; i >= 0; i--) { const el = elements[i]; if (pos.x >= el.x && pos.x <= el.x + el.width && pos.y >= el.y && pos.y <= el.y + el.height) { hit = el; break; } }
      if (hit) { const newEls = elements.filter(e => e.id !== hit.id); newEls.push(hit); setElements(newEls); setSelectedId(hit.id); setIsDragging(true); } else setSelectedId(null);
    } else if (tool === 'brush') { currentPathRef.current = [pos]; setIsDragging(true); setSelectedId(null); }
    else if (['rect','circle'].includes(tool)) { const newEl = { id: paintGenId(), type: tool, x: pos.x, y: pos.y, width: 1, height: 1, color: toolColor }; setElements([...elements, newEl]); setSelectedId(newEl.id); setIsResizing(true); setIsDragging(true); }
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    const pos = getCanvasCoords(clientX, clientY);
    if (isResizing && selectedId) updateElement(selectedId, el => ({ width: Math.max(10, pos.x - el.x), height: Math.max(10, pos.y - el.y) }));
    else if (tool === 'move' && selectedId) { const dx = pos.x - dragStartRef.current.x; const dy = pos.y - dragStartRef.current.y; updateElement(selectedId, el => ({ x: el.x + dx, y: el.y + dy })); dragStartRef.current = pos; }
    else if (tool === 'brush') { currentPathRef.current.push(pos); setElements([...elements]); }
  };

  const handleEnd = () => {
    if (isDragging) {
      if (tool === 'brush' && currentPathRef.current.length > 0) saveHistory([...elements, { id: paintGenId(), type: 'path', points: [...currentPathRef.current], color: toolColor, size: brushSize }]);
      else saveHistory(elements);
    }
    setIsDragging(false); setIsResizing(false); currentPathRef.current = [];
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) { e.preventDefault(); const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); gestureRef.current = { startDist: dist, startScale: view.scale, startX: (e.touches[0].clientX+e.touches[1].clientX)/2, startY: (e.touches[0].clientY+e.touches[1].clientY)/2, startViewX: view.x, startViewY: view.y }; }
    else if (e.touches.length === 1) handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) { e.preventDefault(); const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); const scale = Math.max(0.2, Math.min(3, gestureRef.current.startScale * (dist / (gestureRef.current.startDist || 1)))); setView({ scale, x: gestureRef.current.startViewX + ((e.touches[0].clientX+e.touches[1].clientX)/2 - gestureRef.current.startX), y: gestureRef.current.startViewY + ((e.touches[0].clientY+e.touches[1].clientY)/2 - gestureRef.current.startY) }); }
    else if (e.touches.length === 1) handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const applyLayout = (type) => {
    let newEls = [];
    const cw = canvasSize.w, ch = canvasSize.h;
    if (type === 'classic') newEls = [
      { id: paintGenId(), type: 'text', x: 20, y: 20, width: cw-40, height: 100, text: 'PENGU GANG 🐧', color: '#ffffff', size: 60, font: 'Impact', strokeWidth: 4, strokeColor: '#0369a1' },
      { id: paintGenId(), type: 'text', x: 20, y: ch-100, width: cw-40, height: 100, text: 'WAGMI FRENS', color: '#ffffff', size: 60, font: 'Impact', strokeWidth: 4, strokeColor: '#0369a1' }
    ];
    else if (type === 'breaking') newEls = [
      { id: paintGenId(), type: 'rect', x: 0, y: ch - 120, width: cw, height: 80, color: '#0369a1' },
      { id: paintGenId(), type: 'rect', x: 0, y: ch - 40, width: cw, height: 40, color: '#BAE6FD' },
      { id: paintGenId(), type: 'text', x: 20, y: ch-110, width: cw-40, height: 60, text: 'BREAKING NEWS 🐧', color: '#ffffff', size: 40, font: 'Impact', strokeWidth: 0 },
      { id: paintGenId(), type: 'text', x: 20, y: ch-35, width: cw-40, height: 30, text: 'PENGU COLONY PUMPING TO THE MOON', color: '#0369a1', size: 20, font: 'Arial', strokeWidth: 0 }
    ];
    else if (type === 'wanted') newEls = [
      { id: paintGenId(), type: 'rect', x: 0, y: 0, width: cw, height: ch, color: '#f0f9ff' },
      { id: paintGenId(), type: 'text', x: 20, y: 30, width: cw-40, height: 80, text: 'WANTED 🐧', color: '#0369a1', size: 80, font: 'Impact', strokeWidth: 0 },
      { id: paintGenId(), type: 'rect', x: cw*0.15, y: 130, width: cw*0.7, height: ch*0.5, color: '#ffffff' },
      { id: paintGenId(), type: 'text', x: 20, y: ch*0.8, width: cw-40, height: 50, text: 'REWARD: ONE GIANT FISH 🐟', color: '#0369a1', size: 30, font: 'Impact', strokeWidth: 0 }
    ];
    else if (type === 'arctic') newEls = [
      { id: paintGenId(), type: 'rect', x: 0, y: 0, width: cw, height: ch, color: '#0369a1' },
      { id: paintGenId(), type: 'rect', x: 0, y: ch*0.7, width: cw, height: ch*0.3, color: '#e0f2fe' },
      { id: paintGenId(), type: 'text', x: 20, y: 40, width: cw-40, height: 80, text: '❄️ ARCTIC PENGU OS ❄️', color: '#BAE6FD', size: 50, font: 'Impact', strokeWidth: 0 },
      { id: paintGenId(), type: 'text', x: 20, y: ch*0.72, width: cw-40, height: 60, text: 'THE COLONY IS LIVE', color: '#0369a1', size: 35, font: 'Impact', strokeWidth: 0 }
    ];
    saveHistory(newEls);
  };

  return (
    <div className="flex flex-col h-full text-xs select-none overflow-hidden" style={{background:'#e8f4fd', fontFamily:'monospace'}} ref={containerRef}>
      <div className="h-10 border-b-2 flex items-center px-1 shrink-0 z-40" style={{background:'#e8f4fd', borderColor:'#BAE6FD'}}>
        <div className="flex items-center gap-1 px-1 border-r border-sky-200 mr-1">
          <Button onClick={undo} disabled={historyStep===0} title="Undo"><RotateCcw size={14}/></Button>
          <Button onClick={redo} disabled={historyStep===history.length-1} title="Redo"><RotateCw size={14}/></Button>
          <Button className="md:hidden" active={showProps} onClick={() => setShowProps(!showProps)} title="Toggle Properties"><Sliders size={14}/></Button>
        </div>
        <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          <Button onClick={()=>applyLayout('classic')}><LayoutTemplate size={12}/><span className="hidden sm:inline ml-1">CLASSIC</span></Button>
          <Button onClick={()=>applyLayout('breaking')}><Scan size={12}/><span className="hidden sm:inline ml-1">NEWS</span></Button>
          <Button onClick={()=>applyLayout('wanted')}><User size={12}/><span className="hidden sm:inline ml-1">WANTED</span></Button>
          <Button onClick={()=>applyLayout('arctic')}><Snowflake size={12}/><span className="hidden sm:inline ml-1">ARCTIC</span></Button>
        </div>
        <div className="flex items-center gap-1 px-1 border-l border-sky-200 ml-1">
          <Button onClick={download} className="font-black"><Download size={14}/><span className="hidden md:inline ml-1">EXPORT</span></Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative min-h-0">
        <div className="w-16 md:w-20 border-r-2 flex flex-col items-center py-3 gap-3 z-30 shrink-0 overflow-y-auto" style={{background:'#e8f4fd', borderColor:'#BAE6FD'}}>
          <Button active={tool==='move'} onClick={()=>setTool('move')} className="w-12 md:w-14 h-12 flex-col"><Move size={18}/><span className="text-[8px]">MOVE</span></Button>
          <Button active={tool==='brush'} onClick={()=>setTool('brush')} className="w-12 md:w-14 h-12 flex-col"><Paintbrush size={18}/><span className="text-[8px]">BRUSH</span></Button>
          <Button onClick={addText} className="w-12 md:w-14 h-12 flex-col"><Type size={18}/><span className="text-[8px]">TEXT</span></Button>
          <Button active={tool==='rect'} onClick={()=>setTool('rect')} className="w-12 md:w-14 h-12 flex-col"><SquareIcon size={18}/><span className="text-[8px]">RECT</span></Button>
          
          <div className="w-10 h-px bg-sky-200 my-1"></div>
          
          <div className="flex flex-col gap-2 items-center w-full px-1 mb-2">
            <span className="text-[7px] font-black uppercase text-sky-400">Stickers</span>
            {ASSETS.stickers && Object.keys(ASSETS.stickers).map(key => (
              <div key={key} className="w-10 h-10 md:w-12 md:h-12 bg-white border border-sky-200 cursor-pointer hover:border-sky-400 active:scale-95 transition-all p-1 shadow-sm shrink-0"
                onClick={() => addSticker(key)} title={`Add ${key}`}>
                <img src={ASSETS.stickers[key]} alt={key} className="w-full h-full object-contain pointer-events-none" />
              </div>
            ))}
          </div>

          <div className="w-10 h-px bg-sky-200 my-1"></div>
          <Button onClick={()=>fileInputRef.current.click()} className="w-12 md:w-14 h-12 flex-col"><Upload size={18}/><span className="text-[8px]">FILE</span><input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} /></Button>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden relative border-t-2 border-l-2 touch-none min-h-0" style={{background:'#7DD3FC33', borderColor:'#0369a1'}}>
          <div className="shadow-2xl origin-center" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
            <canvas ref={canvasRef} width={canvasSize.w} height={canvasSize.h} className="touch-none block cursor-crosshair"
              onMouseDown={(e)=>handleStart(e.clientX, e.clientY)} onMouseMove={(e)=>handleMove(e.clientX, e.clientY)} onMouseUp={handleEnd} onMouseLeave={handleEnd}
              onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleEnd} />
          </div>
          <div className="absolute bottom-4 right-4 p-2 flex gap-2 border rounded-sm" style={{background:'rgba(3,105,161,0.8)', borderColor:'#7DD3FC'}}>
            <button onClick={()=>setView(v=>({...v, scale: Math.max(0.2, v.scale-0.1)}))} className="text-white hover:text-sky-300 active:scale-90"><Minus size={14}/></button>
            <span className="text-white font-mono w-10 text-center font-bold text-[10px]">{Math.round(view.scale*100)}%</span>
            <button onClick={()=>setView(v=>({...v, scale: Math.min(3, v.scale+0.1)}))} className="text-white hover:text-sky-300 active:scale-90"><Plus size={14}/></button>
          </div>
        </div>

        <div className={`absolute md:static top-0 right-0 bottom-0 z-50 w-64 flex flex-col shadow-2xl md:shadow-none transition-transform duration-300 ${showProps ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
          style={{background:'#e8f4fd', borderLeft:'2px solid #BAE6FD'}}>
          <div className="text-white font-bold text-[10px] p-2 flex justify-between items-center uppercase tracking-widest shrink-0" style={{background:'linear-gradient(to right, #0369a1, #0ea5e9)'}}>
            <span>🎨 Pengu Inspector</span>
            <div className="flex gap-2"><Layers size={12}/><X size={14} className="md:hidden cursor-pointer hover:text-red-200" onClick={() => setShowProps(false)}/></div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-5 pb-20">
            {selectedId ? (() => {
              const el = elements.find(e => e.id === selectedId);
              if (!el) return null;
              return (
                <div className="space-y-4">
                  {el.type === 'text' && (<>
                    <div className="space-y-1"><label className="text-[9px] font-black uppercase text-sky-500">Caption</label><InsetPanel><textarea value={el.text} onChange={e => updateElement(el.id, ()=>({text: e.target.value}))} className="w-full p-2 font-bold outline-none text-xs text-sky-900" rows={3}/></InsetPanel></div>
                    <div className="space-y-1"><label className="text-[9px] font-black uppercase text-sky-500">Typeface</label><div className="grid grid-cols-1 gap-1">{FONTS.map(f => (<Button key={f.name} active={el.font === f.val} onClick={() => updateElement(el.id, ()=>({font: f.val}))}>{f.name}</Button>))}</div></div>
                  </>)}
                  <div className="space-y-1"><label className="text-[9px] font-black uppercase text-sky-500">Color Palette 🎨</label><div className="flex flex-wrap gap-1">{MEME_COLORS.map(c => (<div key={c} onClick={() => updateElement(el.id, ()=>({color: c}))} className={`w-6 h-6 border-2 cursor-pointer ${el.color === c ? 'outline outline-2 outline-sky-400 scale-110' : 'border-sky-200'}`} style={{backgroundColor: c}}/>))}</div></div>
                  {el.type === 'text' && (<div className="space-y-1"><label className="text-[9px] font-black uppercase text-sky-500">Outline Width</label><div className="flex items-center gap-2 p-1 border-2" style={{background:'#dbeafe', borderColor:'#0369a1 #BAE6FD #BAE6FD #0369a1'}}><input type="range" min="0" max="10" value={el.strokeWidth || 0} onChange={e=>updateElement(el.id, ()=>({strokeWidth: parseInt(e.target.value)}))} className="flex-1 accent-sky-600"/><span className="font-mono text-[9px] text-sky-700 w-4">{el.strokeWidth || 0}</span></div></div>)}
                  <div className="pt-4 border-t border-sky-200"><Button onClick={deleteSelected} className="w-full py-2 text-red-600"><Trash2 size={14}/> DELETE</Button></div>
                </div>
              );
            })() : tool === 'brush' ? (
              <div className="space-y-5">
                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-sky-500">Brush Size</label><div className="flex items-center gap-2 p-1 border-2" style={{background:'#dbeafe', borderColor:'#0369a1 #BAE6FD #BAE6FD #0369a1'}}><input type="range" min="1" max="50" value={brushSize} onChange={e=>setBrushSize(parseInt(e.target.value))} className="flex-1 accent-sky-600"/><span className="font-mono text-[9px] text-sky-700 w-4">{brushSize}</span></div></div>
                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-sky-500">Brush Color</label><div className="flex flex-wrap gap-1">{MEME_COLORS.map(c => (<div key={c} onClick={() => setToolColor(c)} className={`w-6 h-6 border-2 cursor-pointer ${toolColor === c ? 'outline outline-2 outline-sky-400 scale-110' : 'border-sky-200'}`} style={{backgroundColor: c}}/>))}</div></div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-sky-300 gap-2 p-4 text-center mt-10">
                <span className="text-4xl animate-bounce">🐧</span>
                <p className="text-[9px] font-black uppercase tracking-tighter text-sky-400">Select a tool or object to start meme-ing, fren.</p>
              </div>
            )}
            <div className="pt-10 border-t border-sky-200">
              <label className="text-[9px] font-black uppercase text-sky-500 mb-2 block">❄️ Pengu Filters</label>
              <div className="grid grid-cols-2 gap-1">
                <Button active={globalEffect==='deepfry'} onClick={()=>setGlobalEffect(g => g==='deepfry'?'none':'deepfry')}><Zap size={10}/> DEEPFRY</Button>
                <Button active={globalEffect==='vhs'} onClick={()=>setGlobalEffect(g => g==='vhs'?'none':'vhs')}><Tv size={10}/> VHS</Button>
                <Button active={globalEffect==='frost'} onClick={()=>setGlobalEffect(g => g==='frost'?'none':'frost')}><Snowflake size={10}/> FROST</Button>
                <Button active={globalEffect==='none'} onClick={()=>setGlobalEffect('none')}>CLEAR</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MEMES APP ---
const MemesApp = () => {
  const memeData = useMemo(() => { try { if (ASSETS?.memes) return ASSETS.memes; } catch (e) {} return {}; }, []);
  const images = useMemo(() => Object.values(memeData), [memeData]);
  const keys = useMemo(() => Object.keys(memeData), [memeData]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const touchStartRef = useRef(null);

  const navigate = (dir, e) => { e?.stopPropagation(); setSelectedIndex((prev) => { if (prev === null) return null; const next = prev + dir; if (next < 0) return images.length - 1; if (next >= images.length) return 0; return next; }); };

  useEffect(() => {
    const handleKeyDown = (e) => { if (selectedIndex === null) return; if (e.key === 'ArrowLeft') navigate(-1); if (e.key === 'ArrowRight') navigate(1); if (e.key === 'Escape') setSelectedIndex(null); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, images.length]);

  const downloadImage = (src, name) => { try { const link = document.createElement('a'); link.href = src; link.target = "_blank"; link.download = `${name||'PENGU_MEME'}.jpg`; document.body.appendChild(link); link.click(); document.body.removeChild(link); } catch(err){} };
  const shareToX = () => { const text = encodeURIComponent("🐧 PENGU GANG 🐧 #PENGU #WAGMI"); window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank'); };

  if (selectedIndex !== null) {
    const currentSrc = images[selectedIndex];
    const currentName = keys[selectedIndex];
    return (
      <div className="flex flex-col h-full relative" style={{background:'#0369a1'}}
        onTouchStart={e => { if (e.touches?.[0]) touchStartRef.current = e.touches[0].clientX; }}
        onTouchEnd={e => { if (touchStartRef.current === null || !e.changedTouches) return; const diff = touchStartRef.current - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) { if (diff > 0) navigate(1); else navigate(-1); } touchStartRef.current = null; }}
        onClick={() => setSelectedIndex(null)}>
        <div className="p-1.5 border-b-2 flex justify-between items-center z-[60]" style={{background:'#e8f4fd', borderColor:'#7DD3FC'}} onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 px-2">
            <button onClick={() => setSelectedIndex(null)} className="p-1 border flex items-center" style={{background:'#dbeafe', borderColor:'#BAE6FD #0369a1 #0369a1 #BAE6FD'}}><Grid size={14}/></button>
            <div><span className="text-[8px] font-black text-sky-600 block">🐧 Pengu_Gallery</span><span className="text-[10px] font-bold text-sky-900 truncate max-w-[150px] block">{currentName}.JPG</span></div>
          </div>
          <div className="flex gap-1 pr-1">
            <button onClick={() => downloadImage(currentSrc, currentName)} className="px-2 py-1 text-[9px] font-black flex items-center gap-1 hover:brightness-110 uppercase" style={{background:'#dbeafe', color:'#0369a1', border:'1px solid #7DD3FC'}}><Download size={10}/> Save</button>
            <button onClick={shareToX} className="px-2 py-1 text-[9px] font-black text-white flex items-center gap-1 uppercase" style={{background:'#1da1f2'}}><Share2 size={10}/> Post</button>
          </div>
        </div>
        <div className="flex-1 relative flex items-center justify-center p-4 group" style={{background:'#075985'}}>
          <button onClick={e=>navigate(-1,e)} className="absolute left-4 z-[70] p-4 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100" style={{background:'rgba(3,105,161,0.6)', color:'#BAE6FD'}}><ChevronLeft size={24} strokeWidth={3}/></button>
          <button onClick={e=>navigate(1,e)} className="absolute right-4 z-[70] p-4 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100" style={{background:'rgba(3,105,161,0.6)', color:'#BAE6FD'}}><ChevronRight size={24} strokeWidth={3}/></button>
          <div onClick={e=>e.stopPropagation()}>
            <img src={currentSrc} className="max-w-full max-h-[65vh] object-contain border-4 shadow-2xl" style={{borderColor:'#7DD3FC'}} alt="Pengu Meme" />
          </div>
        </div>
        <div className="h-24 p-3 flex gap-3 overflow-x-auto no-scrollbar items-center justify-center z-[60] border-t" style={{background:'#0369a1', borderColor:'#075985'}} onClick={e=>e.stopPropagation()}>
          {images.map((img, i) => (
            <div key={i} onClick={e=>{e.stopPropagation(); setSelectedIndex(i);}} className={`h-16 w-16 shrink-0 border-4 transition-all cursor-pointer overflow-hidden ${selectedIndex===i ? 'scale-110' : 'opacity-40 hover:opacity-100'}`} style={{borderColor: selectedIndex===i ? '#FEF08A' : '#075985'}}>
              <img src={img} className="w-full h-full object-cover" alt="" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden select-none" style={{background:'#f0f9ff'}}>
      <div className="p-2 flex justify-between items-center border-b-2" style={{background:'linear-gradient(to right, #0369a1, #0ea5e9)', borderColor:'#075985'}}>
        <div className="flex items-center gap-2 px-2">
          <span className="text-2xl">🐧</span>
          <span className="text-[10px] font-black tracking-widest text-white uppercase">Pengu Meme Stash v4.0</span>
        </div>
        <span className="text-[9px] font-bold text-sky-200 pr-2">{images.length} Memes Loaded 🐟</span>
      </div>
      <div className="flex-1 p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-y-auto content-start">
        {images.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-sky-300 uppercase tracking-widest text-[10px] font-black">
            <span className="text-4xl mb-4 animate-bounce">🐧</span>Scanning iceberg for memes...
          </div>
        ) : images.map((src, i) => (
          <div key={i} className="group relative flex flex-col items-center gap-2" onMouseEnter={()=>setHoveredIndex(i)} onMouseLeave={()=>setHoveredIndex(null)} onClick={()=>setSelectedIndex(i)}>
            <div className={`w-full aspect-square p-1.5 cursor-pointer border-2 transition-all active:scale-95 ${hoveredIndex===i ? 'border-sky-400 shadow-lg shadow-sky-200' : 'border-sky-100'}`} style={{background:'white'}}>
              <div className="w-full h-full flex items-center justify-center overflow-hidden relative border border-sky-50">
                <img src={src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 group-hover:rotate-2" alt={keys[i]} loading="lazy"/>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'rgba(3,105,161,0.2)'}}>
                  <ZoomIn className="text-white drop-shadow-lg" size={28}/>
                </div>
              </div>
            </div>
            <div className={`text-center text-[9px] font-black truncate w-full px-2 py-1 transition-all uppercase tracking-tighter ${hoveredIndex===i ? 'text-white translate-y-[-2px]' : 'text-sky-600 border border-sky-100'}`} style={{background: hoveredIndex===i ? '#0369a1' : '#f0f9ff'}}>
              {keys[i]}.JPG
            </div>
          </div>
        ))}
      </div>
      <div className="border-t-2 p-1.5 px-4 flex justify-between items-center text-[9px] font-black" style={{background:'#e8f4fd', borderColor:'#BAE6FD', color:'#64748b'}}>
        <span className="flex items-center gap-1.5">🐧 COLONY ACTIVE</span>
        <div className="flex items-center gap-2 px-2 py-0.5 border" style={{borderColor:'#7DD3FC', background:'#dbeafe'}}>
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></div>
          <span className="text-sky-600 tracking-widest">WADDLING</span>
        </div>
      </div>
    </div>
  );
};

// --- NOTEPAD APP ---
const NotepadApp = () => {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("🐧 READY");

  useEffect(() => { const saved = localStorage.getItem('pengu_write_content'); if (saved) setContent(saved); }, []);

  const handleChange = (e) => {
    const text = e.target.value;
    setContent(text);
    localStorage.setItem('pengu_write_content', text);
    setStatus("SAVING...");
    setTimeout(() => setStatus("🐧 SAVED"), 500);
  };

  const clearNote = () => { if (window.confirm("Delete this masterpiece? 🐧")) { setContent(""); localStorage.removeItem('pengu_write_content'); setStatus("CLEARED"); } };
  const publishIt = () => { if (!content.trim()) return; const text = encodeURIComponent(content.slice(0, 280)); window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank'); setStatus("POSTED 🐧"); };
  const downloadTxt = () => { const element = document.createElement("a"); const file = new Blob([content], {type:'text/plain'}); element.href = URL.createObjectURL(file); element.download = "pengu_thoughts.txt"; document.body.appendChild(element); element.click(); setStatus("DOWNLOADED 🐟"); };

  return (
    <div className="flex flex-col h-full border-2" style={{background:'#f0f9ff', borderColor:'#7DD3FC', fontFamily:'monospace'}}>
      <div className="flex items-center gap-1 p-1 border-b" style={{background:'#e8f4fd', borderColor:'#BAE6FD'}}>
        <button onClick={downloadTxt} className="px-2 py-1 flex items-center gap-1 hover:bg-sky-100 text-xs text-sky-700 transition-colors"><Save size={14}/> SAVE</button>
        <button onClick={publishIt} className="px-2 py-1 flex items-center gap-1 hover:bg-sky-100 text-xs text-sky-700 transition-colors"><Share size={14}/> POST 🐧</button>
        <div className="w-px h-4 bg-sky-200 mx-1"></div>
        <button onClick={clearNote} className="px-2 py-1 flex items-center gap-1 hover:bg-red-50 text-xs text-red-500 transition-colors"><Trash2 size={14}/> CLEAR</button>
        <div className="flex-1"></div>
        <span className="text-[10px] text-sky-400 mr-1">{status}</span>
      </div>
      <div className="flex-1 relative border-2 m-1 overflow-hidden" style={{background:'white', borderColor:'#0369a1 #BAE6FD #BAE6FD #0369a1'}}>
        <textarea className="w-full h-full resize-none outline-none p-2 text-sm leading-relaxed text-sky-900" style={{fontFamily:'monospace', background:'white'}}
          value={content} onChange={handleChange} placeholder="write your pengu manifesto here... 🐧" spellCheck="false" />
      </div>
      <div className="h-6 border-t flex items-center px-2 text-[10px] gap-4 font-mono text-sky-400" style={{background:'#e8f4fd', borderColor:'#BAE6FD'}}>
        <span>CHARS: {content.length}</span><span>WORDS: {content.trim() ? content.trim().split(/\s+/).length : 0}</span>
        <span className="flex-1 text-right">🐟 PENGU_OS</span>
      </div>
    </div>
  );
};

// --- MERGE IT (SLIDE PENGU) ---
const TILE_DATA = {
  2:    { label: 'SARDINE', color: 'bg-sky-950', border: 'border-sky-800', text: 'text-sky-500', glow: '' },
  4:    { label: 'ANCHOVY', color: 'bg-sky-900', border: 'border-sky-700', text: 'text-sky-400', glow: '' },
  8:    { label: 'MACKEREL', color: 'bg-blue-950', border: 'border-blue-600', text: 'text-blue-300', glow: 'shadow-blue-900/50' },
  16:   { label: 'HERRING', color: 'bg-cyan-950', border: 'border-cyan-500', text: 'text-cyan-300', glow: 'shadow-cyan-900/50' },
  32:   { label: 'TUNA', color: 'bg-sky-900', border: 'border-sky-400', text: 'text-sky-200', glow: 'shadow-sky-900/50' },
  64:   { label: 'SALMON', color: 'bg-orange-950', border: 'border-orange-400', text: 'text-orange-300', glow: 'shadow-orange-900/50' },
  128:  { label: 'PENGUIN', color: 'bg-slate-800', border: 'border-white', text: 'text-white', glow: 'shadow-white/20' },
  256:  { label: 'COLONY', color: 'bg-sky-600', border: 'border-sky-300', text: 'text-white', glow: 'shadow-sky-500/40' },
  512:  { label: 'ICEBERG', color: 'bg-blue-400', border: 'border-white', text: 'text-white', glow: 'shadow-blue-300/40' },
  1024: { label: 'BLIZZARD', color: 'bg-white', border: 'border-sky-200', text: 'text-sky-800', special: true, glow: 'shadow-white/60' },
  2048: { label: 'GOD WADDLE', color: 'bg-yellow-300', border: 'border-yellow-100', text: 'text-yellow-900', special: true, glow: 'shadow-yellow-300/60' },
  4096: { label: 'PENGU KING', color: 'bg-gradient-to-br from-sky-400 to-yellow-300', border: 'border-white', text: 'text-white', special: true, glow: 'shadow-sky-300/80' },
};

const ZEN_SCALE = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00];

const MergeItApp = () => {
  const [grid, setGrid] = useState(Array(16).fill(null));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [marketStatus, setMarketStatus] = useState("WADDLING"); 
  const [stability, setStability] = useState(100);
  const [glitch, setGlitch] = useState(false);
  const [recoil, setRecoil] = useState({ x: 0, y: 0 });
  const [activeParticles, setActiveParticles] = useState([]);
  
  const audioCtx = useRef(null);
  const schedulerTimer = useRef(null);
  const nextNoteTime = useRef(0);
  const currentStep = useRef(0);
  const touchStart = useRef(null);

  const initAudio = () => {
    if (audioCtx.current) { if (audioCtx.current.state === 'suspended') audioCtx.current.resume(); return; }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx.current = new AudioContext();
    const compressor = audioCtx.current.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-20, audioCtx.current.currentTime);
    compressor.connect(audioCtx.current.destination);
    audioCtx.current.master = compressor;
    nextNoteTime.current = audioCtx.current.currentTime + 0.1;
    const scheduler = () => {
      if (!audioCtx.current) return;
      while (nextNoteTime.current < audioCtx.current.currentTime + 0.15) {
        scheduleNote(currentStep.current, nextNoteTime.current);
        const bpm = marketStatus === 'COLONY_PUMPING' ? 95 : 74;
        nextNoteTime.current += (60 / bpm) / 2;
        currentStep.current++;
      }
      schedulerTimer.current = setTimeout(scheduler, 25);
    };
    scheduler();
  };

  const scheduleNote = (step, time) => {
    const ctx = audioCtx.current;
    if (!ctx || !isFinite(time)) return;
    const s = step % 16;
    if (s % 8 === 0) { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.frequency.setValueAtTime(stability < 40 ? 49.00 : 65.41, time); gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(0.04, time + 0.1); gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2); osc.connect(gain); gain.connect(ctx.master); osc.start(time); osc.stop(time + 1.3); }
    if (s % 2 === 0) { const mel = stability < 50 ? [0, 1, 0, 1] : [0, 4, 7, 9, 7, 5, 2, 4]; const index = mel[Math.floor(s / 2) % mel.length]; const freq = ZEN_SCALE[index % ZEN_SCALE.length]; const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, time); gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(0.012, time + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5); osc.connect(gain); gain.connect(ctx.master); osc.start(time); osc.stop(time + 0.6); }
  };

  const playEffect = (freq, type = 'sine', duration = 0.5, vol = 0.12) => {
    if (!audioCtx.current || !isFinite(freq)) return;
    const ctx = audioCtx.current; const t = ctx.currentTime;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t); gain.gain.setValueAtTime(vol, t); gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain); gain.connect(ctx.master); osc.start(t); osc.stop(t + duration);
  };

  const spawnParticles = (idx) => {
    const row = Math.floor(idx / 4), col = idx % 4;
    const newPs = Array(8).fill(0).map(() => ({ id: Math.random(), x: col * 25 + 12.5, y: row * 25 + 12.5, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 1.0 }));
    setActiveParticles(prev => [...prev, ...newPs].slice(-32));
  };

  useEffect(() => {
    const pTimer = setInterval(() => setActiveParticles(prev => prev.map(p => ({ ...p, x: p.x + p.vx * 0.5, y: p.y + p.vy * 0.5, life: p.life - 0.05 })).filter(p => p.life > 0)), 30);
    return () => clearInterval(pTimer);
  }, []);

  const initGame = useCallback(() => {
    setGrid(addRandomTile(addRandomTile(Array(16).fill(null))));
    setScore(0); setGameOver(false); setMarketStatus("WADDLING"); setStability(100);
  }, []);

  useEffect(() => {
    const savedBest = localStorage.getItem('pengumergeItBest');
    if (savedBest) setBest(parseInt(savedBest));
    initGame();
    return () => { if (schedulerTimer.current) clearTimeout(schedulerTimer.current); };
  }, [initGame]);

  const addRandomTile = (currentGrid) => {
    const empty = currentGrid.map((v, i) => v === null ? i : null).filter(v => v !== null);
    if (empty.length === 0) return currentGrid;
    const targetIdx = empty[Math.floor(Math.random() * empty.length)];
    const newGrid = [...currentGrid];
    newGrid[targetIdx] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  const move = useCallback((direction) => {
    initAudio();
    if (gameOver) return;
    const strength = 6;
    if (direction === 'UP') setRecoil({ x: 0, y: -strength });
    else if (direction === 'DOWN') setRecoil({ x: 0, y: strength });
    else if (direction === 'LEFT') setRecoil({ x: -strength, y: 0 });
    else if (direction === 'RIGHT') setRecoil({ x: strength, y: 0 });
    setTimeout(() => setRecoil({ x: 0, y: 0 }), 80);

    let newGrid = [...grid]; let moved = false; let currentScore = score; let mergeCount = 0; let mergeIdxs = [];
    const getIndex = (row, col) => row * 4 + col;
    const processLine = (line, indices) => {
      let filtered = line.filter(v => v !== null);
      for (let i = 0; i < filtered.length - 1; i++) { if (filtered[i] === filtered[i + 1]) { filtered[i] *= 2; currentScore += filtered[i]; mergeIdxs.push(indices[i]); filtered.splice(i + 1, 1); moved = true; mergeCount++; } }
      while (filtered.length < 4) filtered.push(null);
      return filtered;
    };

    if (direction === 'UP' || direction === 'DOWN') {
      for (let col = 0; col < 4; col++) {
        const idxs = [0, 1, 2, 3].map(row => getIndex(row, col));
        let line = idxs.map(idx => newGrid[idx]);
        if (direction === 'DOWN') line.reverse();
        let processed = processLine(line, direction === 'DOWN' ? [...idxs].reverse() : idxs);
        if (direction === 'DOWN') processed.reverse();
        processed.forEach((val, row) => { if (newGrid[getIndex(row, col)] !== val) moved = true; newGrid[getIndex(row, col)] = val; });
      }
    } else {
      for (let row = 0; row < 4; row++) {
        const idxs = [0, 1, 2, 3].map(col => getIndex(row, col));
        let line = idxs.map(idx => newGrid[idx]);
        if (direction === 'RIGHT') line.reverse();
        let processed = processLine(line, direction === 'RIGHT' ? [...idxs].reverse() : idxs);
        if (direction === 'RIGHT') processed.reverse();
        processed.forEach((val, col) => { if (newGrid[getIndex(row, col)] !== val) moved = true; newGrid[getIndex(row, col)] = val; });
      }
    }

    if (moved) {
      let nextStability = stability;
      if (mergeCount > 0) {
        nextStability = Math.min(100, stability + (mergeCount * 12));
        mergeIdxs.forEach(spawnParticles);
        playEffect(ZEN_SCALE[Math.floor(Math.random() * ZEN_SCALE.length)] * 2, 'sine', 0.8, 0.15);
      } else { nextStability = Math.max(0, stability - 15); playEffect(120, 'sine', 0.1, 0.05); }
      setStability(nextStability);

      let finalGrid = [...newGrid];
      if (nextStability < 40) {
        setMarketStatus("BEARISH_RUG");
        if (mergeCount === 0) {
          setGlitch(true); setTimeout(() => setGlitch(false), 200);
          const filled = finalGrid.map((v, i) => v !== null ? i : null).filter(v => v !== null);
          const whale = filled.sort((a, b) => finalGrid[b] - finalGrid[a])[0];
          if (whale !== undefined) { finalGrid[whale] = null; playEffect(60, 'sawtooth', 0.8, 0.25); }
        }
      } else { setMarketStatus(mergeCount >= 2 ? "COLONY_PUMPING" : "WADDLING"); if (mergeCount >= 2) playEffect(800, 'sine', 0.4); }

      const gridWithNew = addRandomTile(finalGrid);
      setGrid(gridWithNew); setScore(currentScore);
      if (currentScore > best) { setBest(currentScore); localStorage.setItem('pengumergeItBest', currentScore); }
      checkGameOver(gridWithNew);
    }
  }, [grid, score, best, gameOver, stability]);

  const checkGameOver = (currentGrid) => {
    if (currentGrid.includes(null)) return;
    for (let i = 0; i < 16; i++) { const row = Math.floor(i / 4), col = i % 4; if (col < 3 && currentGrid[i] === currentGrid[i + 1]) return; if (row < 3 && currentGrid[i] === currentGrid[i + 4]) return; }
    setGameOver(true); playEffect(42, 'sawtooth', 1.2);
  };

  useEffect(() => {
    const handleKey = (e) => { if (gameOver) return; if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); move(e.key.replace('Arrow','').toUpperCase()); } };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move, gameOver]);

  return (
    <div className={`flex flex-col h-full text-white font-mono select-none overflow-hidden touch-none relative transition-all duration-700 ${glitch ? 'animate-pulse contrast-200' : ''}`}
      style={{background: marketStatus === 'BEARISH_RUG' ? '#1e0a0a' : '#050d1a'}}
      onTouchStart={e => { initAudio(); touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchEnd={e => { if (!touchStart.current) return; const dx = e.changedTouches[0].clientX - touchStart.current.x; const dy = e.changedTouches[0].clientY - touchStart.current.y; if (Math.max(Math.abs(dx), Math.abs(dy)) > 30) move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'RIGHT' : 'LEFT') : (dy > 0 ? 'DOWN' : 'UP')); touchStart.current = null; }}>

      <div className={`h-8 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.4em] z-50 border-b border-sky-900/30 ${marketStatus === "WADDLING" ? 'bg-sky-950 text-sky-600' : marketStatus === "BEARISH_RUG" ? 'bg-red-800 text-white' : 'bg-sky-500 text-white'}`}>
        {marketStatus === "WADDLING" ? "🐧 COLONY WADDLING: NOMINAL" : marketStatus === "BEARISH_RUG" ? "💀 COLONY SCARED: RUN FROM BEARS" : "🐟 FISH RAIN DETECTED: COLONY FEASTING"}
      </div>

      <div className="relative z-10 p-5 border-b border-sky-900/20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1"><span className="text-lg">🐧</span><span className="text-[10px] font-black text-white/20 tracking-widest uppercase">SLIDE_PENGU_v5.4</span></div>
            <div className="flex gap-8 mt-2">
              <div><p className="text-[8px] text-sky-600 uppercase font-black">Fish Score 🐟</p><p className="text-2xl font-black text-sky-300">+{score}</p></div>
              <div><p className="text-[8px] text-sky-600 uppercase font-black">Best Haul</p><p className="text-2xl font-black text-yellow-400">{best}</p></div>
            </div>
          </div>
          <button onClick={initGame} className="w-14 h-14 flex items-center justify-center hover:bg-sky-900/40 active:scale-75 transition-all group border border-sky-900/30" style={{background:'rgba(255,255,255,0.03)'}}>
            <RefreshCw size={24} className="text-sky-600 group-hover:rotate-180 group-hover:text-sky-400 transition-all duration-500" />
          </button>
        </div>
        <div>
          <div className="h-1.5 w-full overflow-hidden" style={{background:'#0c1f33', border:'1px solid #0369a1'}}>
            <div className={`h-full transition-all duration-700 ${stability < 30 ? 'bg-red-500 animate-pulse' : stability < 60 ? 'bg-yellow-400' : 'bg-sky-400'}`} style={{width: `${stability}%`}} />
          </div>
          <div className="flex justify-between mt-2"><span className="text-[7px] text-white/20 uppercase font-black tracking-widest">Colony Morale ❄️</span><span className={`text-[9px] font-black ${stability < 30 ? 'text-red-400' : 'text-sky-500'}`}>{stability}%</span></div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="grid grid-cols-4 gap-2 p-4 relative transition-transform duration-100 ease-out" style={{background:'rgba(3,105,161,0.08)', border:'1px solid rgba(125,211,252,0.1)', transform: `translate(${recoil.x}px, ${recoil.y}px)`}}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {activeParticles.map(p => (<div key={p.id} className="absolute w-1 h-1 rounded-full blur-[1px]" style={{left:`${p.x}%`, top:`${p.y}%`, opacity:p.life, background:'#7DD3FC'}} />))}
          </div>
          {grid.map((val, i) => {
            const data = val ? TILE_DATA[val] : null;
            return (
              <div key={i} className={`w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center border transition-all duration-200 relative overflow-hidden ${!val ? 'opacity-10 border-sky-900/20' : `${data.color} ${data.border} shadow-lg ${data.glow}`}`}
                style={!val ? {background:'rgba(125,211,252,0.03)'} : {}}>
                {val && (
                  <div className="relative z-10 flex flex-col items-center">
                    <span className={`text-[7px] font-black uppercase text-center leading-none px-1 mb-1 tracking-tighter ${data.text}`}>{data.label}</span>
                    <span className={`text-lg md:text-2xl font-black tracking-tighter ${data.text}`}>{val}</span>
                    {data?.special && <div className="absolute inset-[-10px] border border-white animate-ping opacity-20" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] p-12 text-center" style={{background:'rgba(3,10,25,0.97)'}}>
            <span className="text-6xl mb-6 animate-bounce">🐧</span>
            <h2 className="text-white font-black text-3xl mb-2 italic uppercase tracking-tighter">Waddled Off</h2>
            <p className="text-sky-600 text-[10px] mb-12 uppercase tracking-[0.3em] max-w-[240px] leading-relaxed">The colony ran out of fish.<br/>Time to regroup.</p>
            <button onClick={initGame} className="w-full py-5 font-black uppercase italic hover:brightness-110 active:scale-95 transition-all text-xs tracking-widest text-sky-900" style={{background:'#7DD3FC'}}>
              🐧 Waddle Again
            </button>
          </div>
        )}
      </div>

      <div className="py-4 border-t overflow-hidden whitespace-nowrap" style={{background:'rgba(0,0,0,0.5)', borderColor:'rgba(125,211,252,0.1)'}}>
        <div className="flex gap-20 text-[10px] font-black tracking-[0.5em] uppercase" style={{animation:'marquee 30s linear infinite', color:'rgba(125,211,252,0.1)'}}>
          <span>*** WADDLE OR NOTHING *** NO PAPER FLIPPERS *** FISH FIRST *** COLONY_STRONG *** HONK HONK ***</span>
          <span>*** WADDLE OR NOTHING *** NO PAPER FLIPPERS *** FISH FIRST *** COLONY_STRONG *** HONK HONK ***</span>
        </div>
      </div>
      <style>{`.animate-marquee { animation: marquee 30s linear infinite; } @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  );
};

// --- FORGE IT (FORGE PENGU) ---
const UNLIMITED_THRESHOLD = 3000000; 
const HOLDER_THRESHOLD = 500000;
const LIMIT_ELITE = 99999;
const LIMIT_HOLDER = 99999;
const LIMIT_GUEST = 99999;
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; 
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'pengu-forge-colony';
const BASE_CHARACTER_PATH = "main.jpg";

const PFP_CATEGORIES = [
  { id: 'bg', label: 'WORLD', icon: Image },
  { id: 'head', label: 'HATS', icon: Star },
  { id: 'expression', label: 'VIBE', icon: Smile },
  { id: 'item', label: 'PROP', icon: Gift },
  { id: 'glasses', label: 'SPECS', icon: Glasses },
  { id: 'aura', label: 'AURA', icon: Zap },
  { id: 'super', label: 'SUPER', icon: Shield },
  { id: 'clone', label: 'CLONE', icon: Camera },
];

const PFP_TRAITS = {
  bg: [
    { id: 'plain', label: 'Arctic White', prompt: 'standing against a simple flat icy off-white background' },
    { id: 'ice', label: 'Ice Sheet', prompt: 'standing on a vast flat frozen ice sheet under a pale sky' },
    { id: 'ocean', label: 'Polar Ocean', prompt: 'standing at the edge of a dark icy polar ocean at dawn' },
    { id: 'doodles', label: 'Notebook Doodles', prompt: 'standing against a paper background covered in cute penguin pencil doodles' },
    { id: 'pastel', label: 'Pastel Gradient', prompt: 'standing against a soft icy blue and lavender pastel gradient' },
    { id: 'polka', label: 'Polka Chaos', prompt: 'against a flat colorful polka dot pattern with snowflake motifs' },
    { id: 'grid', label: 'Blueprint Grid', prompt: 'against a blue industrial blueprint grid background' },
    { id: 'night_ice', label: 'Night Glacier', prompt: 'against a deep midnight blue glacial ice cliff with aurora lights' },
    { id: 'graffiti', label: 'Graffiti Wall', prompt: 'against a wall covered in penguin graffiti tags' },
    { id: 'colony', label: 'The Colony', prompt: 'standing in front of a crowd of tiny penguin silhouettes on an iceberg', vip: true },
    { id: 'space_ice', label: 'Glacier in Space', prompt: 'floating on a chunk of ice in outer space with stars and galaxies', vip: true },
    { id: 'gold_leaf', label: 'Gold Leaf Canvas', prompt: 'against a high-contrast black canvas with real gold leaf textures', vip: true },
  ],
  head: [
    { id: 'none', label: 'None', prompt: 'no headgear' },
    { id: 'beanie', label: 'Wool Beanie', prompt: 'wearing a slouched colorful wool beanie' },
    { id: 'backward', label: 'Backward Cap', prompt: 'wearing a backward baseball cap' },
    { id: 'bucket', label: 'Bucket Hat', prompt: 'wearing a pastel fabric bucket hat' },
    { id: 'cowboy', label: 'Cowboy Hat', prompt: 'wearing a classic brown cowboy hat slightly too big' },
    { id: 'top_hat', label: 'Top Hat', prompt: 'wearing a dapper black top hat' },
    { id: 'construction', label: 'Hard Hat', prompt: 'wearing a yellow construction helmet' },
    { id: 'party', label: 'Party Cone', prompt: 'wearing a colorful paper party cone hat' },
    { id: 'snowflake_crown', label: 'Snowflake Crown', prompt: 'wearing a delicate crown made of ice and snowflakes', vip: true },
    { id: 'halo', label: 'Halo', prompt: 'with a soft golden halo above the head', vip: true },
    { id: 'devil', label: 'Devil Horns', prompt: 'with small red devil horns on its head', vip: true },
    { id: 'diamond_crown', label: 'Diamond Crown', prompt: 'with a floating diamond crown above the head', vip: true },
  ],
  expression: [
    { id: 'classic', label: 'Happy Honk', prompt: 'with a classic happy penguin expression' },
    { id: 'grin', label: 'Big Grin', prompt: 'with a wide open happy grin' },
    { id: 'side_eye', label: 'Side Eye', prompt: 'with a suspicious side-eye expression' },
    { id: 'wink', label: 'Wink', prompt: 'with one eye closed in a cheeky wink' },
    { id: 'derp', label: 'Derp Face', prompt: 'with a silly derp cross-eyed expression' },
    { id: 'cool', label: 'Too Cool', prompt: 'with a smug unbothered cool expression' },
  ],
  item: [
    { id: 'none', label: 'None', prompt: 'holding nothing' },
    { id: 'fish', label: 'Big Fish 🐟', prompt: 'proudly holding a large fish' },
    { id: 'coffee', label: 'Coffee Cup', prompt: 'holding a steaming coffee cup' },
    { id: 'phone', label: 'Phone', prompt: 'holding a smartphone showing a green candle chart' },
    { id: 'coin', label: 'PENGU Coin', prompt: 'holding a giant gold coin with "PENGU" engraved on it' },
    { id: 'sign', label: 'WAGMI Sign', prompt: 'holding a handmade cardboard sign that says WAGMI' },
    { id: 'umbrella', label: 'Umbrella', prompt: 'holding a colorful polka dot umbrella' },
    { id: 'balloon', label: 'Fish Balloon', prompt: 'holding a fish-shaped balloon' },
    { id: 'orb', label: 'Ice Orb', prompt: 'holding a glowing magical ice orb', vip: true },
    { id: 'trident', label: 'Penguin Trident', prompt: 'holding a miniature ice trident', vip: true },
  ],
  glasses: [
    { id: 'none', label: 'None', prompt: 'no eyewear' },
    { id: 'round', label: 'Round Specs', prompt: 'wearing cute round glasses' },
    { id: 'shades', label: 'Big Sunglasses', prompt: 'wearing huge oversized sunglasses' },
    { id: 'ski', label: 'Ski Goggles', prompt: 'wearing orange ski goggles' },
    { id: 'monocle', label: 'Monocle', prompt: 'wearing a fancy golden monocle' },
    { id: 'cracked', label: 'Cracked Lens', prompt: 'wearing glasses with one cracked lens' },
    { id: 'vr', label: 'VR Headset', prompt: 'wearing a VR headset pushed up on its forehead' },
    { id: 'laser', label: 'Laser Eyes', prompt: 'with red laser beams shooting from eyes', vip: true },
    { id: 'diamond', label: 'Diamond Frames', prompt: 'wearing glasses made of solid diamonds', vip: true },
  ],
  aura: [
    { id: 'none', label: 'None', prompt: 'no special aura' },
    { id: 'snow', label: 'Snow Flurry', prompt: 'surrounded by gently falling snowflakes' },
    { id: 'ice_glow', label: 'Ice Glow', prompt: 'with a soft cool icy blue glow surrounding them' },
    { id: 'fish_rain', label: 'Fish Rain', prompt: 'with tiny fish raining down around them' },
    { id: 'aurora', label: 'Aurora Effect', prompt: 'surrounded by swirling aurora borealis colors' },
    { id: 'static', label: 'Static Buzz', prompt: 'with a digital static glitch effect surrounding them' },
    { id: 'rainbow', label: 'Rainbow Outline', prompt: 'with a rainbow-colored outline aura', vip: true },
    { id: 'gold_aura', label: 'Golden Glow', prompt: 'surrounded by a warm golden radiance', vip: true },
  ],
  super: [
    { id: 'none', label: 'None', prompt: 'regular pengu appearance' },
    { id: 'superhero', label: 'Superhero', prompt: 'fully transformed into a penguin superhero with cape and chest logo', vip: true },
    { id: 'knight', label: 'Ice Knight', prompt: 'fully transformed into an ice knight in crystalline armor', vip: true },
    { id: 'astronaut', label: 'Astronaut', prompt: 'fully transformed into a penguin astronaut in a space suit', vip: true },
    { id: 'pirate', label: 'Pirate Pengu', prompt: 'fully transformed into a pirate penguin with eyepatch and hook', vip: true },
    { id: 'wizard', label: 'Ice Wizard', prompt: 'fully transformed into a penguin wizard with a pointy hat and glowing staff', vip: true },
  ]
};

const ForgeItApp = () => {
  const [user, setUser] = useState(null);
  const hasEliteAccess = true;
  const hasHolderAccess = true;
  const [dailyCount, setDailyCount] = useState(0); 
  const [isSyncing, setIsSyncing] = useState(true);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [trustMode, setTrustMode] = useState(false);
  const [cloneImage, setCloneImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const apiKey = (() => {
    try { if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_GEMINI) return import.meta.env.VITE_APP_GEMINI; } catch (e) {}
    try { if (typeof process !== 'undefined' && process.env?.VITE_APP_GEMINI) return process.env.VITE_APP_GEMINI; } catch (e) {}
    try { if (typeof window !== 'undefined' && window.VITE_APP_GEMINI) return window.VITE_APP_GEMINI; } catch (e) {}
    return typeof __apiKey !== 'undefined' ? __apiKey : "";
  })();

  const [selections, setSelections] = useState({
    bg: PFP_TRAITS.bg[0], head: PFP_TRAITS.head[0], expression: PFP_TRAITS.expression[0],
    item: PFP_TRAITS.item[0], glasses: PFP_TRAITS.glasses[0], aura: PFP_TRAITS.aura[0], super: PFP_TRAITS.super[0],
  });
  
  const [activeCat, setActiveCat] = useState('bg');
  const [generatedImg, setGeneratedImg] = useState(null);
  const [isForging, setIsForging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState(["🐧 COLONY_FORGE_READY", "❄️ ICE_RESERVES_STANDBY"]);
  const [error, setError] = useState(null);

  const currentLimit = LIMIT_ELITE;

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
      else await signInAnonymously(auth);
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { if (u) setUser(u); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsSyncing(true);
    const usageRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'usage', 'forge_limits');
    const unsub = onSnapshot(usageRef, (snap) => {
      if (snap.exists()) { const data = snap.data(); const now = Date.now(); if (now - (data.lastReset || 0) > REFRESH_INTERVAL_MS) setDailyCount(0); else setDailyCount(data.count || 0); }
      else setDailyCount(0);
      setIsSyncing(false);
    }, (err) => { console.error("Quota Sync Error", err); setIsSyncing(false); });
    return () => unsub();
  }, [user]);

  const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 4));

  const handleTraitSelect = (catId, trait) => {
    setSelections(prev => {
      const next = { ...prev, [catId]: trait };
      if (catId === 'super' && trait.id !== 'none') { next.head = PFP_TRAITS.head[0]; next.item = PFP_TRAITS.item[0]; next.glasses = PFP_TRAITS.glasses[0]; next.expression = PFP_TRAITS.expression[0]; setCloneImage(null); }
      else if (['head','item','glasses','expression'].includes(catId) && trait.id !== 'none') { next.super = PFP_TRAITS.super[0]; setCloneImage(null); }
      setTrustMode(false);
      return next;
    });
  };

  const handleRandomize = () => {
    setIsRandomizing(true); setTrustMode(false); setCloneImage(null); addLog("🎲 SHUFFLING_COLONY...");
    let count = 0;
    const interval = setInterval(() => {
      const newSels = {};
      Object.keys(PFP_TRAITS).forEach(cat => { if (cat === 'super' || cat === 'clone') { newSels[cat] = PFP_TRAITS[cat][0]; return; } const items = PFP_TRAITS[cat]; newSels[cat] = items[Math.floor(Math.random() * items.length)]; });
      setSelections(prev => ({...prev, ...newSels}));
      count++;
      if (count >= 10) { clearInterval(interval); setIsRandomizing(false); addLog("🐧 RANDOM_PENGU_LOCKED."); }
    }, 60);
  };

  const handleTrustIt = () => { setTrustMode(true); setCloneImage(null); addLog("🐟 GRANTING_PENGU_IMAGINATION..."); const defaults = {}; Object.keys(PFP_TRAITS).forEach(k => defaults[k] = PFP_TRAITS[k][0]); setSelections(defaults); addLog("❄️ TRUST_COLONY_ACTIVE."); };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setCloneImage(reader.result.split(',')[1]); setTrustMode(false); addLog("📸 SOURCE_PFP_LOADED. READY_TO_CLONE."); };
      reader.readAsDataURL(file);
    }
  };

  const getBaseCharacter64 = async () => {
    try {
      const response = await fetch(BASE_CHARACTER_PATH);
      const blob = await response.blob();
      return new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result.split(',')[1]); reader.readAsDataURL(blob); });
    } catch (e) { return null; }
  };

  const handleForge = async () => {
    if (isForging) return;
    if (!user || isSyncing) { setError("SYNCING... WAIT."); return; }
    if (!apiKey) { setError("API_KEY_MISSING: VITE_APP_GEMINI not set."); return; }

    setIsForging(true); setGeneratedImg(null); setProgress(0); setError(null);
    setLogs(["🐧 LOCKING_BLUEPRINT...", "❄️ PRESERVING_PENGU_SHAPE...", "🐟 ADDING_TRAITS..."]);

    const progTimer = setInterval(() => setProgress(prev => prev < 95 ? prev + Math.random() * 5 : prev), 600);

    try {
      const base64Image = await getBaseCharacter64();
      if (!base64Image) throw new Error("Pengu base image not found.");

      let promptText = "";
      const contentParts = [{ text: "" }, { inlineData: { mimeType: "image/png", data: base64Image } }];

      if (cloneImage) {
        contentParts.push({ inlineData: { mimeType: "image/png", data: cloneImage } });
        promptText = `PENGUIN PFP CLONE SYSTEM. Take the vibe, clothing, accessories from Image 2 and map them onto the penguin character in Image 1. DO NOT CHANGE the penguin body shape or pose. Keep it cute and cartoonish.`;
      } else if (trustMode) {
        promptText = `CREATIVE PENGUIN DECORATION. Use imagination to add funny accessories and outfits to this penguin character. MAINTAIN exact penguin body shape and pose. Make it cute, fun, and unique. Cartoonish art style.`;
      } else if (selections.super.id !== 'none') {
        promptText = `PENGUIN TRANSFORMATION. Keep the core penguin shape and anatomy. TRANSFORM: ${selections.super.prompt}. Keep it cute and cartoonish.`;
      } else {
        const activeTraits = Object.entries(selections).filter(([cat, trait]) => trait.id !== 'none').map(([cat, trait]) => trait.prompt).join(', ');
        promptText = `PENGUIN PFP FORGE. DO NOT CHANGE the penguin silhouette or pose. ADD these traits: ${activeTraits}. Cute cartoonish style. Keep it charming and adorable.`;
      }

      contentParts[0].text = promptText;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: contentParts }], generationConfig: { responseModalities: ["TEXT", "IMAGE"] } })
      });

      if (!response.ok) throw new Error(`API_ERROR: ${response.status}`);
      const result = await response.json();
      const base64Result = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

      if (base64Result) {
        try {
          const usageRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'usage', 'forge_limits');
          const snap = await getDoc(usageRef);
          const now = Date.now();
          if (snap.exists() && (now - (snap.data().lastReset || 0) < REFRESH_INTERVAL_MS)) await updateDoc(usageRef, { count: increment(1) });
          else await setDoc(usageRef, { count: 1, lastReset: now }, { merge: true });
        } catch (dbErr) { console.warn("Usage Tracker Fail", dbErr); }

        setTimeout(() => { setGeneratedImg(`data:image/png;base64,${base64Result}`); setProgress(100); addLog("🐧 PENGU_MATERIALIZED!"); setError(null); setIsForging(false); }, 200);
      } else { throw new Error("AI returned empty response."); }
    } catch (err) {
      setError(err.message); addLog("💀 ERROR: FORGE_HALTED"); setIsForging(false);
    } finally { clearInterval(progTimer); }
  };

  const downloadPFP = () => { if (!generatedImg) return; const link = document.createElement('a'); link.href = generatedImg; link.download = `PENGU_FORGE_${Date.now()}.png`; link.click(); };

  return (
    <div className="flex flex-col h-full text-sky-300 font-mono overflow-hidden relative" style={{background:'#050d1a'}}>
      <header className="h-12 border-b flex items-center justify-between px-4 shrink-0 z-[70]" style={{background:'#030b14', borderColor:'#0369a1'}}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐧</span>
          <div><h1 className="text-[9px] font-black uppercase tracking-[0.3em] text-white italic leading-none">Forge_Pengu_Colony</h1><span className="text-[6px] text-sky-700 font-bold uppercase mt-1 tracking-tighter">Forge_Engine_v6.1_PROMO</span></div>
        </div>
        <div className="px-2 py-1 border flex items-center gap-2" style={{borderColor:'rgba(254,240,138,0.4)', background:'rgba(254,240,138,0.1)', color:'#FEF08A'}}>
          <div><span className="text-[8px] font-black uppercase tracking-tighter leading-none block">COLONY_ACCESS_ACTIVE 🐧</span><span className="text-[6px] font-bold opacity-60 tracking-widest uppercase italic block mt-0.5">FORGES: UNLIMITED ♾️</span></div>
          <Crown size={12} className="animate-pulse" />
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        <div className="flex-1 flex flex-col border-r bg-[#060f1e] relative min-h-0" style={{borderColor:'rgba(3,105,161,0.2)'}}>
          <div className="flex md:grid border-b shrink-0 overflow-x-auto no-scrollbar sticky top-0 z-40" style={{background:'rgba(3,11,20,0.9)', borderColor:'rgba(3,105,161,0.3)'}}>
            {PFP_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)} className={`p-4 min-w-[65px] flex-1 flex flex-col items-center gap-1.5 transition-all relative ${activeCat === cat.id ? 'text-sky-300' : 'text-sky-800'}`}>
                <cat.icon size={16} className={activeCat === cat.id ? 'scale-110' : ''}/>
                <span className="text-[6px] font-black uppercase tracking-widest leading-none mt-1">{cat.label}</span>
                {activeCat === cat.id && <div className="absolute bottom-0 inset-x-0 h-1" style={{background:'#7DD3FC', boxShadow:'0 0 15px #7DD3FC'}}/>}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 md:p-5 pb-24 md:pb-5" style={{background:'#050d1a'}}>
            {activeCat === 'clone' ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                <div className="p-8 border-2 border-dashed w-full max-w-sm" style={{borderColor:'rgba(125,211,252,0.2)', background:'rgba(3,11,20,0.8)'}}>
                  <span className="text-5xl block mb-4">🐧📸</span>
                  <h3 className="text-sm font-black uppercase tracking-widest text-sky-300">Clone Source PFP</h3>
                  <p className="text-[8px] text-sky-700 mt-2 uppercase tracking-tighter leading-relaxed">Upload any image to map its vibes onto your pengu.</p>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                  <button onClick={() => fileInputRef.current.click()} className="mt-6 w-full py-3 font-black uppercase text-[10px] flex items-center justify-center gap-2 text-sky-900 hover:brightness-110 transition-all" style={{background:'#7DD3FC'}}>
                    <Upload size={14}/>{cloneImage ? 'CHOOSE_ANOTHER' : 'UPLOAD_IMAGE 🐟'}
                  </button>
                </div>
                {cloneImage && <div className="p-1 border" style={{borderColor:'rgba(125,211,252,0.4)'}}><img src={`data:image/png;base64,${cloneImage}`} className="w-32 h-32 object-cover grayscale opacity-60" /></div>}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {PFP_TRAITS[activeCat]?.map(trait => {
                  const isSelected = selections[activeCat]?.id === trait.id && !trustMode && !cloneImage;
                  return (
                    <button key={trait.id} onClick={() => handleTraitSelect(activeCat, trait)}
                      className={`px-3 py-4 border text-center transition-all flex flex-col items-center justify-center relative active:scale-95 ${isSelected ? 'text-sky-200' : 'text-sky-700 hover:text-sky-400'}`}
                      style={{background: isSelected ? 'rgba(3,105,161,0.2)' : 'rgba(255,255,255,0.03)', borderColor: isSelected ? '#7DD3FC' : 'rgba(125,211,252,0.1)'}}>
                      <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{trait.label}</span>
                      {isSelected && <div className="absolute bottom-1 right-1 w-1 h-1 bg-sky-400 rounded-full animate-pulse" style={{boxShadow:'0 0 8px #7DD3FC'}}/>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-2 md:p-4 border-t shrink-0 md:relative fixed bottom-0 left-0 right-0 z-[60] flex flex-col gap-2" style={{background:'rgba(3,11,20,0.95)', borderColor:'rgba(3,105,161,0.4)', backdropFilter:'blur(8px)'}}>
            <div className="flex gap-2">
              <button onClick={handleRandomize} disabled={isForging || isRandomizing || isSyncing} className="flex-1 py-2 border flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] transition-all hover:text-sky-300" style={{borderColor:'rgba(125,211,252,0.2)', color:'rgba(125,211,252,0.4)'}}>
                <Shuffle size={14} className={isRandomizing ? 'animate-spin' : ''}/> Randomize
              </button>
              <button onClick={handleTrustIt} disabled={isForging || isSyncing} className={`flex-1 py-2 border flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] transition-all ${trustMode ? 'text-sky-300' : 'text-sky-700 hover:text-sky-400'}`} style={{borderColor: trustMode ? '#7DD3FC' : 'rgba(125,211,252,0.1)', background: trustMode ? 'rgba(3,105,161,0.15)' : 'transparent'}}>
                <Ghost size={14}/> TRUST_PENGU
              </button>
            </div>
            <button onClick={handleForge} disabled={isForging || isRandomizing || isSyncing} className={`w-full py-4 md:py-5 font-black italic text-base md:text-lg tracking-[0.4em] transition-all relative overflow-hidden border-b-4 active:translate-y-1 active:border-b-0 ${isForging ? 'text-sky-800 cursor-wait' : 'text-sky-900 hover:brightness-110'}`}
              style={{background: isForging ? '#0c1f33' : '#7DD3FC', borderColor: isForging ? '#0369a1' : '#0369a1', boxShadow: isForging ? 'none' : '0 0 40px rgba(125,211,252,0.3)'}}>
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isForging ? <RefreshCw className="animate-spin" size={20}/> : <span className="text-2xl">🐧</span>}
                {isForging ? 'FORGING PENGU...' : 'FORGE PENGU'}
              </span>
            </button>
          </div>
        </div>

        <div className={`w-full md:w-[350px] lg:w-[420px] flex flex-col border-l shrink-0 min-h-0 ${(isForging || generatedImg) ? 'fixed inset-0 z-[80] md:relative md:inset-auto md:z-0 flex' : 'hidden md:flex'}`} style={{background:'#030b14', borderColor:'rgba(3,105,161,0.4)'}}>
          <div className="flex-1 flex flex-col p-6 items-center justify-center relative overflow-hidden">
            {isForging ? (
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="relative w-48 h-48 md:w-72 md:h-72 border flex items-center justify-center overflow-hidden" style={{borderColor:'rgba(125,211,252,0.1)'}}>
                  <span className="text-8xl animate-bounce">🐧</span>
                  <div className="absolute bottom-0 left-0 w-full h-[2px] animate-[scan_2s_linear_infinite]" style={{background:'#7DD3FC'}}/>
                </div>
                <div className="w-48 space-y-3">
                  <div className="flex justify-between text-[8px] font-black text-sky-400 uppercase tracking-widest italic"><span>Forging pengu...</span><span>{Math.round(progress)}%</span></div>
                  <div className="h-1 rounded-full overflow-hidden p-[1px]" style={{background:'rgba(0,0,0,0.5)', border:'1px solid #0369a1'}}>
                    <div className="h-full transition-all duration-300 rounded-full" style={{width:`${progress}%`, background:'#7DD3FC', boxShadow:'0 0 15px #7DD3FC'}}/>
                  </div>
                </div>
              </div>
            ) : generatedImg ? (
              <div className="w-full max-w-[280px] space-y-4">
                <div className="relative group p-1 overflow-hidden" style={{background:'rgba(3,11,20,0.8)', border:'1px solid rgba(125,211,252,0.2)'}}>
                  <img src={generatedImg} className="w-full aspect-square object-cover" />
                  <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={downloadPFP} className="p-3 hover:brightness-110 text-sky-900" style={{background:'#7DD3FC'}}><Download size={20}/></button>
                  </div>
                </div>
                <button onClick={downloadPFP} className="w-full py-4 font-black uppercase text-[11px] flex items-center justify-center gap-3 tracking-[0.2em] transition-all hover:brightness-110 text-sky-900" style={{background:'#7DD3FC'}}><Download size={16}/> Save Pengu 🐧</button>
                <button onClick={() => setGeneratedImg(null)} className="w-full py-2 text-[9px] font-black uppercase text-sky-700 hover:text-sky-400 transition-all flex items-center justify-center gap-2 group">
                  <X size={12} className="group-hover:rotate-90 transition-transform"/> Forge Another
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-8 opacity-10">
                <span className="text-[120px] leading-none">🐧</span>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Colony_Idle</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {error && (
        <div className="fixed bottom-24 md:bottom-10 right-4 left-4 md:left-auto md:w-[400px] border-l-4 p-5 flex items-start gap-4 text-white z-[200] backdrop-blur-xl animate-in slide-in-from-right-10" style={{background:'rgba(153,27,27,0.9)', borderColor:'#ef4444'}}>
          <span className="text-2xl">🐧</span>
          <div className="flex-1 space-y-1"><p className="text-[11px] font-black uppercase leading-none tracking-widest">Colony_Error</p><p className="text-[9px] opacity-70 font-bold uppercase mt-2 leading-tight">{error}</p></div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded transition-colors"><X size={18}/></button>
        </div>
      )}
      <style>{`@keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(800%); } } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

// --- DESKTOP ICON ---
const DesktopIcon = ({ icon: Icon, label, onClick, hasAlert, emoji }) => (
  <div onClick={e => { e.stopPropagation(); onClick(); }} className="flex flex-col items-center gap-1 w-20 cursor-pointer pointer-events-auto p-1 group z-30">
    <div className="relative">
      {emoji ? (
        <span className="text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform group-active:scale-90 group-hover:scale-110 block">{emoji}</span>
      ) : (
        <Icon size={32} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform group-active:scale-90 group-hover:scale-110" strokeWidth={1.5}/>
      )}
      {hasAlert && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full z-[100] shadow-lg animate-pulse"/>}
    </div>
    <span className="text-white text-[10px] text-center font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,1)] px-1 rounded truncate w-full group-hover:brightness-125 transition-all" style={{background:'rgba(3,105,161,0.75)'}}>
      {label}
    </span>
  </div>
);

// --- WINDOW FRAME ---
const DraggableWindow = ({ win, isActive, children, onFocus, onClose, onMaximize, onMinimize, onMove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const startDrag = (clientX, clientY) => {
    if (win.isMaximized) return;
    onFocus();
    const element = document.getElementById(`win-${win.id}`);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    setIsDragging(true);
    setOffset({ x: clientX - rect.left, y: clientY - rect.top });
  };

  useEffect(() => {
    const handleMouseMove = (e) => { if (!isDragging || win.isMaximized) return; onMove(win.id, (e.clientX || e.touches?.[0]?.clientX) - offset.x, (e.clientY || e.touches?.[0]?.clientY) - offset.y); };
    const stopDrag = () => setIsDragging(false);
    if (isDragging) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', stopDrag); window.addEventListener('touchmove', handleMouseMove); window.addEventListener('touchend', stopDrag); }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', stopDrag); window.removeEventListener('touchmove', handleMouseMove); window.removeEventListener('touchend', stopDrag); };
  }, [isDragging, win.isMaximized, offset, win.id, onMove]);

  return (
    <div id={`win-${win.id}`} onMouseDown={e => { if (e.target.closest('.overflow-auto') || e.target.closest('button')) return; startDrag(e.clientX, e.clientY); }}
      className="absolute flex flex-col shadow-2xl"
      style={{ zIndex: win.z, display: win.isMinimized ? 'none' : 'flex', left: win.isMaximized ? 0 : win.x, top: win.isMaximized ? 0 : win.y, width: win.isMaximized ? '100%' : win.w, height: win.isMaximized ? 'calc(100% - 40px)' : win.h }}>
      <WindowFrame {...win} isActive={isActive} onClose={onClose} onMaximize={onMaximize} onMinimize={onMinimize} onFocus={onFocus}>{children}</WindowFrame>
    </div>
  );
};

// --- MAIN OS ---
export default function UltimateOS() {
  const os_gen_id = () => Math.random().toString(36).substr(2, 9);
  const os_copy = (text) => { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); };

  const [windows, setWindows] = useState([]);
  const [maxZ, setMaxZ] = useState(100); 
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [booted, setBooted] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false); 
  const [systemAlert, setSystemAlert] = useState(null);
  const [caCopied, setCaCopied] = useState(false);
  const [snowflakes] = useState(() => Array.from({length: 12}, (_, i) => ({ id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 80}%`, size: `${Math.random() * 14 + 10}px`, delay: `${Math.random() * 3}s` })));
  
  const { wallet, connect, connecting, balance: solBalance } = useWallet();
  const dexData = useDexData(CA_ADDRESS, wallet);
  const hasAccess = dexData.balance >= ACCESS_THRESHOLD;

  const showAlert = (msg) => { setSystemAlert(msg); setTimeout(() => setSystemAlert(null), 3000); };

  useEffect(() => { const timer = setTimeout(() => setBooted(true), 3000); return () => clearTimeout(timer); }, []);

  const openApp = (type) => {
    const id = os_gen_id();
    const titles = { paint: '🎨 Paint Pengu', terminal: '💻 Terminal', tunes: '🎵 Tunes', rugsweeper: '🐧 Stack Pengu', notepad: '📝 Write Stuff', memes: '🐟 Meme Stash', trollbox: '💬 Colony Chat', mememind: '🧠 Meme Brain', mergeit: '🧊 Slide Pengu', wallet: '💰 Wallet', forgeit: '⚡ Forge Pengu' };
    const isMobile = window.innerWidth < 768;
    const isPhoneApp = ['rugsweeper','trollbox','mememind','mergeit','wallet'].includes(type);
    const isWideApp = ['paint','memes','forgeit'].includes(type);
    const defaultW = isWideApp ? 740 : (isPhoneApp ? 340 : 500);
    const defaultH = isWideApp ? 540 : (isPhoneApp ? 580 : 400);
    const newWin = { id, type, title: titles[type] || 'App', x: isMobile ? 10 : 50 + (windows.length * 20), y: isMobile ? 20 : 50 + (windows.length * 20), w: isMobile ? window.innerWidth - 20 : defaultW, h: isMobile ? window.innerHeight - 150 : defaultH, z: maxZ+1, isMaximized: false, isMinimized: false };
    setWindows(prev => [...prev, newWin]);
    setActiveWindowId(id);
    setMaxZ(prev => prev + 1);
    setIsStartOpen(false);
  };

  const closeWindow = (id) => setWindows(prev => prev.filter(w => w.id !== id));
  const focusWindow = (id) => { setActiveWindowId(id); setWindows(prev => prev.map(w => w.id === id ? { ...w, z: maxZ + 1 } : w)); setMaxZ(prev => prev + 1); };
  const toggleMax = (id) => setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  const minimizeWindow = (id) => { setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w)); if (activeWindowId === id) setActiveWindowId(null); };
  const restoreWindow = (id) => { setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false } : w)); focusWindow(id); };
  const moveWindow = (id, x, y) => { const safeX = Math.max(-100, Math.min(window.innerWidth - 50, x)); const safeY = Math.max(0, Math.min(window.innerHeight - 50, y)); setWindows(prev => prev.map(w => w.id === id ? { ...w, x: safeX, y: safeY } : w)); };
  const handleTaskbarClick = (id) => { const win = windows.find(w => w.id === id); if (!win) return; if (win.isMinimized) restoreWindow(id); else if (activeWindowId === id) minimizeWindow(id); else focusWindow(id); };
  const handleCopyCA = () => { os_copy(CA_ADDRESS); setCaCopied(true); setTimeout(() => setCaCopied(false), 2000); };
  const isAnyWindowMaximized = windows.some(w => w.isMaximized && !w.isMinimized);

  // --- BOOT SCREEN ---
  if (!booted) return (
    <div className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden p-6" style={{background:'linear-gradient(135deg, #0369a1 0%, #075985 50%, #0c4a6e 100%)'}}>
      {/* Snowflakes */}
      {snowflakes.map(s => (
        <div key={s.id} className="absolute text-sky-200/40 animate-bounce pointer-events-none" style={{left:s.left, top:s.top, fontSize:s.size, animationDelay:s.delay}}>❄</div>
      ))}
      
      {/* Boot content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="text-8xl mb-6 animate-bounce" style={{filter:'drop-shadow(0 0 30px rgba(125,211,252,0.6))'}}>🐧</div>
        <h1 className="text-5xl font-black text-white mb-2 italic tracking-[0.2em]" style={{fontFamily:"'Fredoka One', 'Comic Sans MS', cursive", textShadow:'0 0 30px rgba(125,211,252,0.5)'}}>PENGU OS</h1>
        <p className="text-sky-200 text-sm mb-8 tracking-[0.3em] uppercase font-bold opacity-70">Waddling into existence...</p>
        
        <div className="w-64 h-4 border-2 p-0.5 rounded-full" style={{borderColor:'rgba(186,230,253,0.5)'}}>
          <div className="h-full rounded-full" style={{background:'#7DD3FC', animation:'widthLoad 2.5s ease-out forwards', width:'0%', boxShadow:'0 0 10px #7DD3FC'}}></div>
        </div>
        <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-sky-300/60">Freezing the blockchain...</div>
      </div>
      
      <style>{`@keyframes widthLoad { from { width: 0%; } to { width: 100%; } }`}</style>
    </div>
  );

  return (
    <div className="w-full h-screen relative overflow-hidden font-sans select-none text-black">
      {/* Wallpaper */}
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{backgroundImage: `url(${ASSETS.wallpaper})`, backgroundColor:'#0369a1'}}></div>
      
      {/* Very subtle snow overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        {snowflakes.map(s => (
          <div key={s.id} className="absolute text-sky-100/20 animate-bounce" style={{left:s.left, top:s.top, fontSize:s.size, animationDelay:s.delay}}>❄</div>
        ))}
      </div>

      {systemAlert && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100000] border-4 p-4 shadow-2xl animate-bounce flex items-center gap-3" style={{background:'#e8f4fd', borderColor:'#0369a1'}}>
          <span className="text-2xl">🐧</span>
          <span className="font-mono font-black text-sky-800 text-xs uppercase">{systemAlert}</span>
        </div>
      )}

      {/* Desktop Icons */}
      <div className="absolute top-0 left-0 p-4 z-20 h-[calc(100vh-40px)] w-full pointer-events-none flex flex-col flex-wrap content-start items-start gap-4 overflow-hidden">
        {[
          { id: 'terminal', emoji: '💻', label: 'Terminal' },
          { id: 'mememind', emoji: '🧠', label: 'Meme Brain' },
          { id: 'forgeit', emoji: '⚡', label: 'Forge Pengu' },
          { id: 'mergeit', emoji: '🧊', label: 'Slide Pengu' },
          { id: 'rugsweeper', emoji: '🐧', label: 'Stack Pengu' },
          { id: 'paint', emoji: '🎨', label: 'Paint Pengu' },
          { id: 'tunes', emoji: '🎵', label: 'Tunes' },
          { id: 'notepad', emoji: '📝', label: 'Write Stuff' },
          { id: 'trollbox', emoji: '💬', label: 'Colony Chat', hasAlert: true },
          { id: 'memes', emoji: '🐟', label: 'Meme Stash' },
          { id: 'wallet', emoji: '💰', label: 'Wallet' },
        ].map(a => (
          <DesktopIcon key={a.id} icon={Terminal} emoji={a.emoji} label={a.label} onClick={() => openApp(a.id)} hasAlert={a.hasAlert} />
        ))}
      </div>

      <SystemResourceMonitor wallet={wallet} balance={dexData.balance} hasAccess={hasAccess} />
      <Shippy hidden={isAnyWindowMaximized} dexData={dexData} />

      {/* Windows */}
      {windows.map(win => (
        <DraggableWindow key={win.id} win={win} isActive={win.id === activeWindowId}
          onFocus={() => focusWindow(win.id)} onClose={() => closeWindow(win.id)}
          onMaximize={() => toggleMax(win.id)} onMinimize={() => minimizeWindow(win.id)} onMove={moveWindow}>
          {win.type === 'forgeit' && <ForgeItApp />}
          {win.type === 'paint' && <PaintApp />}
          {win.type === 'memes' && <MemesApp />}
          {win.type === 'notepad' && <NotepadApp />}
          {win.type === 'mergeit' && <MergeItApp />}

          {win.type === 'wallet' && (
            <div className="p-4 h-full flex flex-col gap-4 overflow-y-auto" style={{background:'#050d1a', fontFamily:'monospace', color:'#7DD3FC'}}>
              <div className="flex justify-between items-center border-b pb-2" style={{borderColor:'rgba(3,105,161,0.4)'}}>
                <div className="flex items-center gap-2"><span className="text-xl">🐧</span><span className="text-[10px] font-black uppercase tracking-widest text-sky-600">Wallet Monitor</span></div>
                <div className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-sm ${wallet ? 'text-sky-300' : 'text-red-400 animate-pulse'}`} style={{background: wallet ? 'rgba(3,105,161,0.3)' : 'rgba(239,68,68,0.1)', border:'1px solid currentColor'}}>
                  {wallet ? '🟢 Connected' : '🔴 Disconnected'}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 border" style={{background:'rgba(3,11,20,0.8)', borderColor:'rgba(3,105,161,0.3)'}}>
                  <span className="text-[9px] font-bold text-sky-800 uppercase block mb-1">Your SOL ☀️</span>
                  <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-black text-white">{(solBalance || 0).toFixed(4)}</span>
                    <span className="text-xs font-black text-sky-600">SOL</span>
                  </div>
                </div>
                <div className="p-4 border" style={{background:'rgba(3,11,20,0.8)', borderColor:'rgba(125,211,252,0.3)'}}>
                  <span className="text-[9px] font-bold text-sky-700 uppercase block mb-1">Your PENGU 🐧</span>
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black text-sky-300">{(dexData.balance || 0).toLocaleString()}</span>
                    <span className="text-xs font-black text-sky-600">PENGU</span>
                  </div>
                  {!hasAccess && (
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full" style={{background:'rgba(3,105,161,0.2)'}}>
                      <div className="h-full transition-all duration-1000 rounded-full" style={{width:`${Math.min(100, (dexData.balance/ACCESS_THRESHOLD)*100)}%`, background:'#7DD3FC'}}/>
                    </div>
                  )}
                </div>
              </div>

              <div className={`p-3 border-2 flex items-center gap-4 ${hasAccess ? '' : 'animate-pulse'}`} style={{borderColor: hasAccess ? '#7DD3FC' : '#FEF08A', background: hasAccess ? 'rgba(3,105,161,0.1)' : 'rgba(254,240,138,0.05)'}}>
                <span className="text-3xl">{hasAccess ? '🐧' : '🔒'}</span>
                <div>
                  <span className={`text-[11px] font-black uppercase tracking-[0.1em] block ${hasAccess ? 'text-sky-300' : 'text-yellow-400'}`}>{hasAccess ? 'Colony Member ✓' : 'Access Locked'}</span>
                  <span className="text-[8px] text-sky-700 uppercase leading-tight">{hasAccess ? 'welcome to the colony, fren!' : 'hold 500k PENGU to join the colony.'}</span>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-2 pb-2">
                <button onClick={connect} disabled={connecting} className={`w-full py-4 font-black text-[11px] tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 border-2 active:scale-[0.98] ${wallet ? 'text-red-400' : 'text-sky-300'}`}
                  style={{background: wallet ? 'rgba(239,68,68,0.1)' : 'rgba(3,105,161,0.2)', borderColor: wallet ? 'rgba(239,68,68,0.4)' : '#7DD3FC'}}>
                  {connecting ? <RefreshCw className="animate-spin" size={14}/> : <span>{wallet ? '🔌' : '🔗'}</span>}
                  {connecting ? 'Connecting...' : (wallet ? 'Disconnect' : 'Connect Wallet 🐧')}
                </button>
                {wallet && <div className="p-2 border text-center" style={{borderColor:'rgba(3,105,161,0.2)'}}>
                  <span className="text-[7px] text-sky-700 font-black uppercase block">Your Address</span>
                  <span className="text-[8px] text-sky-500 font-mono break-all">{wallet}</span>
                </div>}
              </div>
            </div>
          )}
        </DraggableWindow>
      ))}

      {/* Start Menu */}
      <div id="start-menu-container">
        <StartMenu isOpen={isStartOpen} onClose={() => setIsStartOpen(false)} onOpenApp={openApp} />
      </div>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 w-full h-10 flex items-center px-1 z-[9998] shadow-2xl" style={{background:'#e8f4fd', borderTop:'2px solid #BAE6FD'}}>
        <button onClick={() => setIsStartOpen(!isStartOpen)} className={`flex items-center gap-2 px-3 py-1 h-8 border-2 font-bold italic text-sm mr-2 transition-all ${isStartOpen ? 'translate-y-0.5' : ''}`}
          style={{background: isStartOpen ? '#dbeafe' : '#e8f4fd', color:'#0369a1', borderColor: isStartOpen ? '#0369a1 #BAE6FD #BAE6FD #0369a1' : '#BAE6FD #0369a1 #0369a1 #BAE6FD', fontFamily:"'Fredoka One', cursive"}}>
          <span>🐧</span> START
        </button>
        
        <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar px-2">
          {windows.map(win => (
            <button key={win.id} onClick={() => handleTaskbarClick(win.id)}
              className={`min-w-[80px] max-w-[120px] h-8 truncate px-2 border-2 text-[10px] text-sky-800 flex items-center transition-all`}
              style={{background: win.id === activeWindowId && !win.isMinimized ? 'white' : '#e8f4fd', borderColor: win.id === activeWindowId && !win.isMinimized ? '#0369a1 #BAE6FD #BAE6FD #0369a1' : '#BAE6FD #0369a1 #0369a1 #BAE6FD', fontWeight: win.id === activeWindowId ? 'bold' : 'normal'}}>
              {win.title}
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-2 px-2 py-1 border-2 ml-auto h-8" style={{background:'#dbeafe', borderColor:'#0369a1 #BAE6FD #BAE6FD #0369a1'}}>
          <button className={`h-6 text-[10px] font-mono px-2 border transition-all ${caCopied ? 'text-sky-700 font-black' : 'text-sky-600'}`}
            style={{background: caCopied ? '#BAE6FD' : '#e8f4fd', borderColor:'#7DD3FC'}}
            onClick={handleCopyCA}>{caCopied ? '🐧 COPIED!' : 'CA_KEY'}</button>

          <button onClick={connect} disabled={connecting}
            className="flex items-center justify-center gap-2 h-6 px-2 border font-bold text-sky-700 hover:bg-sky-100 transition-colors"
            style={{background:'#e8f4fd', borderColor:'#7DD3FC'}}>
            {connecting ? <RefreshCw size={12} className="animate-spin text-sky-500"/> : <span>{wallet ? '🟢' : '🔌'}</span>}
            <span className="text-[10px] hidden sm:inline-block">{wallet ? `${wallet.slice(0,4)}..` : "LINK"}</span>
          </button>

          <span className="text-[10px] font-bold hidden md:block ml-2 text-sky-600 opacity-60 font-mono tracking-tighter select-none">
            {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}