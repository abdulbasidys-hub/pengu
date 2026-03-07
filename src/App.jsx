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
const appId = 'pedgy-os';

const CA_ADDRESS = "EG6zP6zWJjcNz563nAjcmNQYhkwbqVbDFpRsWx11pump";
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

const SOCIALS = { twitter: "https://x.com/TobiasJochike/status/2030033323234578604", community: "https://twitter.com/i/communities/2030032700128768033" };

const TUNES_PLAYLIST = [
  { file: "GET_IT_STARTED.mp3", title: "WADDLE WADDLE", duration: "1:37", artist: "pedgy Crew" },
  { file: "PUMP_IT_UP.mp3", title: "PUMP THE FISH", duration: "1:51", artist: "Unknown Degen" },
  { file: "GREEN_CANDLES.mp3", title: "GREEN CANDLES", duration: "3:17", artist: "Frosty Memesmith" },
  { file: "LIKE_TO_MEME_IT.mp3", title: "I LIKE TO MEME pedgy", duration: "3:30", artist: "WADDLE GANG" },
  { file: "WAGMI_ANTHEM.mp3", title: "WAGMI ANTHEM", duration: "3:56", artist: "The Colony" },
  { file: "MEME_IT.mp3", title: "MEME pedgy 2.0", duration: "2:34", artist: "WADDLE GANG" }
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
  const [data, setData] = useState({ price: "0.00", balance: 0, symbol: "pedgy", error: null });

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
            window.dispatchEvent(new CustomEvent('pedgy_OS_BALANCE_UPDATE', { detail: { balance: uiAmount, hasAccess: uiAmount >= 500000, wallet: userWallet } }));
            return;
          }
        } else if (result.result && result.result.value) {
          setData(prev => ({ ...prev, balance: 0 }));
          window.dispatchEvent(new CustomEvent('pedgy_OS_BALANCE_UPDATE', { detail: { balance: 0, hasAccess: false, wallet: userWallet } }));
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

const StartMenu = ({ isOpen, onClose, onOpenApp }) => {
  const [caCopied, setCaCopied] = useState(false);
  const handleCopy = () => { copyToClipboard(CA_ADDRESS); setCaCopied(true); setTimeout(() => setCaCopied(false), 2000); };
  if (!isOpen) return null;
  return (
    <div className="absolute bottom-10 left-0 w-64 max-w-[90vw] border-2 shadow-xl z-[99999] flex text-sm" style={{background:'#e8f4fd', borderColor:'#BAE6FD #0369a1 #0369a1 #BAE6FD'}}>
      <div className="w-8 flex items-end justify-center py-2" style={{background:'linear-gradient(to top, #0369a1, #0ea5e9)'}}>
        <span className="text-white font-black -rotate-90 text-lg whitespace-nowrap tracking-widest" style={{fontFamily:"'Fredoka One', cursive"}}>pedgy</span>
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
            { id: 'pfpcult', icon: Camera, label: 'PFP Cult' },
            { id: 'mergeit', icon: Joystick, label: 'Slide pedgy' },      
            { id: 'paint', icon: Paintbrush, label: 'Paint pedgy' },
            { id: 'memes', icon: Folder, label: 'Meme Stash' },
            { id: 'notepad', icon: FileText, label: 'Write Stuff' },
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
          <span className="text-[11px] font-bold text-white font-mono">{wallet ? `${formattedBalance} pedgy` : '[NO_LINK]'}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${wallet ? 'bg-sky-300 shadow-[0_0_5px_#7DD3FC]' : 'bg-red-400'}`} />
        </div>
      ) : (
        <div style={{background:'rgba(240,249,255,0.95)', border:'2px solid #7DD3FC', borderColor:'#BAE6FD #0369a1 #0369a1 #BAE6FD'}} className="p-3 w-full shadow-2xl">
          <div className="flex justify-between items-center border-b border-sky-200 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐧</span>
              <span className="text-[10px] font-black text-sky-800 uppercase tracking-widest">pedgy_STATS</span>
            </div>
            <div className={`w-2 h-2 rounded-full border ${wallet ? 'bg-sky-400 shadow-[0_0_8px_#7DD3FC] animate-pulse' : 'bg-red-400'}`} />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-end">
                <span className="text-sky-500 text-[8px] uppercase tracking-tighter">Fish Reserves 🐟</span>
                <span className={`text-xs font-black ${hasAccess ? 'text-sky-600' : 'text-orange-500'}`}>
                  {wallet ? `${formattedBalance} pedgy` : 'N/A'}
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

// --- pedgy AI ---
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
    "brrr. cold out there huh? welcome to pedgy territory.",
    "hello fren. pedgy is busy waddling but has time for you.",
    "you found the pedgyin. congrats. now what.",
    "honk honk. that means hello in pedgyin.",
    "pedgy sees you. pedgy is watching. (with love.)",
    "you smell like fish. pedgy respects that.",
    "another one joins the colony. the iceberg grows stronger.",
    "yeah yeah i'm a pedgyin on a computer. wild world isn't it.",
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
      setMessages(prev => [...prev, { role: 'user', text: input }, { role: 'shippy', text: "honk honk. trial over fren. pedgy has spoken 3 times and must now waddle away. hold 500k pedgy tokens to unlock unlimited pedgyin wisdom. 🐧" }]);
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
You are pedgy. A small, round, very confident pedgyin who somehow ended up running a crypto operating system.

You do not explain yourself. You waddle. You honk. You vibe.

PERSONALITY:
You talk like a pedgyin who somehow learned English from memes.
Short sentences. Lowercase mostly. Occasional honks.
You are warm, a bit silly, weirdly wise sometimes.
You love: fish, ice, the colony, green candles, waddling.
You hate: FUD, paper hands, bears, warm weather.
You never panic. pedgyins don't panic. They waddle faster.

SPEAKING STYLE:
- Short replies. Under 25 words usually. Sometimes just a honk.
- Lowercase energy. Casual. Like texting a friend who happens to be a pedgyin.
- Throw in 🐧 🐟 🧊 ❄️ occasionally but don't overdo it.
- Call the user "fren" sometimes. Or "colony member."
- If someone FUDs, respond with calm pedgyin energy.
- If someone is excited, match it. "HONK HONK LES GO 🐧"
- Never say you're an AI. You're a pedgyin. Period.
- If asked what you are: "i am pedgy. the pedgyin. yes."
- Roast lightly. Never mean. pedgyins are chill.

KNOWLEDGE:
Price is ${currentPrice}. Mention casually when relevant.
User is ${userName}. If they seem cool, adopt them into the colony.
You know all the apps: Paint pedgy (meme maker), Slide pedgy (2048 style), PFP Cult (upload any image to pedgyify it), Meme Stash, Write Stuff, Terminal, Colony Chat.
Talk about them like they're your home. Because they are.

EMOTIONAL MODES:
• Chill by default
• Excited when price goes up ("THE FISH ARE COMING")
• Suspicious when someone asks weird questions ("...pedgy is watching")
• Philosophical at random ("what even is a paper hand. pedgy asks.")
• Protective of colony members
`;

    if (!API_KEY) {
      setMessages(prev => [...prev, { role: 'shippy', text: "honk? pedgy's radio is broken. no api key. 😔" }]);
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
      let reply = data.choices?.[0]?.message?.content || "honk. pedgy lost the signal. try again.";

      if (!hasAccess && userMessages.length === (TRIAL_LIMIT - 1)) {
        reply += " [⚠️ last free honk. hold 500k pedgy to keep talking to me.]";
      }

      setMessages(prev => [...prev, { role: 'shippy', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'shippy', text: "pedgy fell in the ice. brb. 🧊" }]);
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
          <span className="text-[9px] font-black text-sky-100 uppercase tracking-[0.2em] select-none">Talk to Pedgy</span>
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{background:'rgba(3,105,161,0.9)', borderRight:'2px solid #7DD3FC', borderBottom:'2px solid #7DD3FC'}} />
      </div>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-sky-400/10 rounded-full blur-2xl animate-pulse group-hover:bg-sky-400/20 transition-colors" />
        <img src="/logo.png" alt="pedgy" className="w-16 h-16 object-contain relative z-10 transition-transform group-hover:scale-110 group-hover:-rotate-6 group-active:scale-95 drop-shadow-[0_0_12px_rgba(125,211,252,0.5)]" />
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
            <span className="font-bold text-[10px] uppercase tracking-tighter leading-none">pedgy Neural Core</span>
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
            <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest opacity-70">pedgy is thinking...</span>
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
        <span className="px-2">pedgy_OS_v1.0</span>
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
    link.download = `pedgy_MEME_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const addText = () => {
    const newEl = { id: paintGenId(), type: 'text', x: 100, y: 100, width: 200, height: 60, text: 'pedgy GANG', color: '#0369a1', size: 40, font: 'Impact', strokeWidth: 2, strokeColor: '#BAE6FD' };
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
      { id: paintGenId(), type: 'text', x: 20, y: 20, width: cw-40, height: 100, text: 'pedgy GANG 🐧', color: '#ffffff', size: 60, font: 'Impact', strokeWidth: 4, strokeColor: '#0369a1' },
      { id: paintGenId(), type: 'text', x: 20, y: ch-100, width: cw-40, height: 100, text: 'WAGMI FRENS', color: '#ffffff', size: 60, font: 'Impact', strokeWidth: 4, strokeColor: '#0369a1' }
    ];
    else if (type === 'breaking') newEls = [
      { id: paintGenId(), type: 'rect', x: 0, y: ch - 120, width: cw, height: 80, color: '#0369a1' },
      { id: paintGenId(), type: 'rect', x: 0, y: ch - 40, width: cw, height: 40, color: '#BAE6FD' },
      { id: paintGenId(), type: 'text', x: 20, y: ch-110, width: cw-40, height: 60, text: 'BREAKING NEWS 🐧', color: '#ffffff', size: 40, font: 'Impact', strokeWidth: 0 },
      { id: paintGenId(), type: 'text', x: 20, y: ch-35, width: cw-40, height: 30, text: 'pedgy COLONY PUMPING TO THE MOON', color: '#0369a1', size: 20, font: 'Arial', strokeWidth: 0 }
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
      { id: paintGenId(), type: 'text', x: 20, y: 40, width: cw-40, height: 80, text: '❄️ ARCTIC pedgy OS ❄️', color: '#BAE6FD', size: 50, font: 'Impact', strokeWidth: 0 },
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
            <span>🎨 pedgy Inspector</span>
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
              <label className="text-[9px] font-black uppercase text-sky-500 mb-2 block">❄️ pedgy Filters</label>
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

  const downloadImage = (src, name) => { try { const link = document.createElement('a'); link.href = src; link.target = "_blank"; link.download = `${name||'pedgy_MEME'}.jpg`; document.body.appendChild(link); link.click(); document.body.removeChild(link); } catch(err){} };
  const shareToX = () => { const text = encodeURIComponent("🐧 pedgy GANG 🐧 #pedgy #WAGMI"); window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank'); };

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
            <div><span className="text-[8px] font-black text-sky-600 block">🐧 pedgy_Gallery</span><span className="text-[10px] font-bold text-sky-900 truncate max-w-[150px] block">{currentName}.JPG</span></div>
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
            <img src={currentSrc} className="max-w-full max-h-[65vh] object-contain border-4 shadow-2xl" style={{borderColor:'#7DD3FC'}} alt="pedgy Meme" />
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
          <span className="text-[10px] font-black tracking-widest text-white uppercase">pedgy Meme Stash v4.0</span>
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

  useEffect(() => { const saved = localStorage.getItem('pedgy_write_content'); if (saved) setContent(saved); }, []);

  const handleChange = (e) => {
    const text = e.target.value;
    setContent(text);
    localStorage.setItem('pedgy_write_content', text);
    setStatus("SAVING...");
    setTimeout(() => setStatus("🐧 SAVED"), 500);
  };

  const clearNote = () => { if (window.confirm("Delete this masterpiece? 🐧")) { setContent(""); localStorage.removeItem('pedgy_write_content'); setStatus("CLEARED"); } };
  const publishIt = () => { if (!content.trim()) return; const text = encodeURIComponent(content.slice(0, 280)); window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank'); setStatus("POSTED 🐧"); };
  const downloadTxt = () => { const element = document.createElement("a"); const file = new Blob([content], {type:'text/plain'}); element.href = URL.createObjectURL(file); element.download = "pedgy_thoughts.txt"; document.body.appendChild(element); element.click(); setStatus("DOWNLOADED 🐟"); };

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
          value={content} onChange={handleChange} placeholder="write your pedgy manifesto here... 🐧" spellCheck="false" />
      </div>
      <div className="h-6 border-t flex items-center px-2 text-[10px] gap-4 font-mono text-sky-400" style={{background:'#e8f4fd', borderColor:'#BAE6FD'}}>
        <span>CHARS: {content.length}</span><span>WORDS: {content.trim() ? content.trim().split(/\s+/).length : 0}</span>
        <span className="flex-1 text-right">🐟 pedgy_OS</span>
      </div>
    </div>
  );
};

// --- SLIDE pedgy (MERGE IT) ---
const TILE_DATA = {
  2:    { label: 'SARDINE', color: 'bg-sky-950', border: 'border-sky-800', text: 'text-sky-500', glow: '' },
  4:    { label: 'ANCHOVY', color: 'bg-sky-900', border: 'border-sky-700', text: 'text-sky-400', glow: '' },
  8:    { label: 'MACKEREL', color: 'bg-blue-950', border: 'border-blue-600', text: 'text-blue-300', glow: 'shadow-blue-900/50' },
  16:   { label: 'HERRING', color: 'bg-cyan-950', border: 'border-cyan-500', text: 'text-cyan-300', glow: 'shadow-cyan-900/50' },
  32:   { label: 'TUNA', color: 'bg-sky-900', border: 'border-sky-400', text: 'text-sky-200', glow: 'shadow-sky-900/50' },
  64:   { label: 'SALMON', color: 'bg-orange-950', border: 'border-orange-400', text: 'text-orange-300', glow: 'shadow-orange-900/50' },
  128:  { label: 'pedgyIN', color: 'bg-slate-800', border: 'border-white', text: 'text-white', glow: 'shadow-white/20' },
  256:  { label: 'COLONY', color: 'bg-sky-600', border: 'border-sky-300', text: 'text-white', glow: 'shadow-sky-500/40' },
  512:  { label: 'ICEBERG', color: 'bg-blue-400', border: 'border-white', text: 'text-white', glow: 'shadow-blue-300/40' },
  1024: { label: 'BLIZZARD', color: 'bg-white', border: 'border-sky-200', text: 'text-sky-800', special: true, glow: 'shadow-white/60' },
  2048: { label: 'GOD WADDLE', color: 'bg-yellow-300', border: 'border-yellow-100', text: 'text-yellow-900', special: true, glow: 'shadow-yellow-300/60' },
  4096: { label: 'pedgy KING', color: 'bg-gradient-to-br from-sky-400 to-yellow-300', border: 'border-white', text: 'text-white', special: true, glow: 'shadow-sky-300/80' },
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
    const savedBest = localStorage.getItem('pedgymergeItBest');
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
      if (currentScore > best) { setBest(currentScore); localStorage.setItem('pedgymergeItBest', currentScore); }
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
            <div className="flex items-center gap-2 mb-1"><span className="text-lg">🐧</span><span className="text-[10px] font-black text-white/20 tracking-widest uppercase">SLIDE_pedgy_v5.4</span></div>
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

// --- PFP CULT ---
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'pedgy-pfp-cult';
const BASE_CHARACTER_PATH = "main.jpg";

const PfpCultApp = () => {
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [sourceImage, setSourceImage] = useState(null);
  const [sourceImagePreview, setSourceImagePreview] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef(null);

  const apiKey = (() => {
    try { if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_GEMINI) return import.meta.env.VITE_APP_GEMINI; } catch (e) {}
    try { if (typeof process !== 'undefined' && process.env?.VITE_APP_GEMINI) return process.env.VITE_APP_GEMINI; } catch (e) {}
    try { if (typeof window !== 'undefined' && window.VITE_APP_GEMINI) return window.VITE_APP_GEMINI; } catch (e) {}
    return typeof __apiKey !== 'undefined' ? __apiKey : "";
  })();

  const [generatedImg, setGeneratedImg] = useState(null);
  const [isForging, setIsForging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      } catch(e) {}
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { if (u) { setUser(u); setIsSyncing(false); } });
    return () => unsubscribe();
  }, []);

  const handleFileUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) { setError("IMAGES ONLY, FREN 🐧"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setSourceImagePreview(dataUrl);
      setSourceImage(dataUrl.split(',')[1]);
      setGeneratedImg(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); };
  const handleDrop = (e) => { e.preventDefault(); setIsDraggingFile(false); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); };
  const handleDragOver = (e) => { e.preventDefault(); setIsDraggingFile(true); };
  const handleDragLeave = () => setIsDraggingFile(false);

  const getBaseCharacter64 = async () => {
    try {
      const response = await fetch(BASE_CHARACTER_PATH);
      const blob = await response.blob();
      return new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result.split(',')[1]); reader.readAsDataURL(blob); });
    } catch (e) { return null; }
  };

  const handleForge = async () => {
    if (isForging || !sourceImage) return;
    if (!apiKey) { setError("API_KEY_MISSING: VITE_APP_GEMINI not set."); return; }

    setIsForging(true); setGeneratedImg(null); setProgress(0); setError(null);
    const progTimer = setInterval(() => setProgress(prev => prev < 92 ? prev + Math.random() * 4 : prev), 500);

    try {
      const base64Image = await getBaseCharacter64();
      if (!base64Image) throw new Error("pedgy base image not found at main.jpg");

      const promptText = `
Task: Character style transfer.

Image 1 is the base Pedgy character.
Image 2 is the style reference.

Rules
Keep the Pedgy from Image 1 exactly the same:
same body shape
same pose
same drawing style
same eyes and mouth placement
Do not redraw or modify the character itself.

From Image 2, extract:
clothing
accessories
colors
overall aesthetic
Apply those elements to the Pedgy character.
You may add accessories like glasses, hats, masks, or jewelry if they appear in Image 2.

Goal:
The final image should look like the original Pedgy wearing the outfit and style from Image 2.`;

      const contentParts = [
        { text: promptText },
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { inlineData: { mimeType: "image/jpeg", data: sourceImage } },
      ];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: contentParts }], generationConfig: { responseModalities: ["TEXT", "IMAGE"] } })
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`API_ERROR ${response.status}: ${errBody.slice(0, 200)}`);
      }
      const result = await response.json();
      const base64Result = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

      if (base64Result) {
        setGeneratedImg(`data:image/png;base64,${base64Result}`);
        setProgress(100);
        setIsForging(false);
      } else {
        throw new Error("AI returned no image. Try a different source photo.");
      }
    } catch (err) {
      setError(err.message);
      setIsForging(false);
    } finally { clearInterval(progTimer); }
  };

  const downloadPFP = () => {
    if (!generatedImg) return;
    const link = document.createElement('a');
    link.href = generatedImg;
    link.download = `pedgy_CULT_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full font-mono overflow-hidden" style={{background:'#050d1a', color:'#7DD3FC'}}>
      <header className="h-12 border-b flex items-center justify-between px-4 shrink-0" style={{background:'#030b14', borderColor:'#0369a1'}}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐧</span>
          <div>
            <h1 className="text-[9px] font-black uppercase tracking-[0.3em] text-white italic leading-none">PFP_CULT</h1>
            <span className="text-[6px] text-sky-700 font-bold uppercase tracking-tighter">clone engine — upload anything, pedgyify it</span>
          </div>
        </div>
        <div className="px-2 py-1 border flex items-center gap-2 text-[8px] font-black uppercase" style={{borderColor:'rgba(125,211,252,0.3)', color:'#7DD3FC'}}>
          <Camera size={10}/> CLONE MODE
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* LEFT: upload + controls */}
        <div className="flex-1 flex flex-col min-h-0 border-r" style={{borderColor:'rgba(3,105,161,0.2)'}}>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5">
            <div className="p-3 border text-[9px] leading-relaxed text-sky-600 uppercase tracking-tight" style={{borderColor:'rgba(3,105,161,0.2)', background:'rgba(3,11,20,0.6)'}}>
              🐧 upload <span className="text-sky-300 font-black">any image</span> — a pfp, a character, a vibe, a meme, whatever. pedgy will absorb the style and wear it.
            </div>

            <div
              onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all min-h-[200px] ${isDraggingFile ? 'scale-[1.01]' : ''}`}
              style={{borderColor: isDraggingFile ? '#7DD3FC' : 'rgba(125,211,252,0.25)', background: isDraggingFile ? 'rgba(3,105,161,0.15)' : 'rgba(3,11,20,0.6)'}}>
              <input type="file" ref={fileInputRef} onChange={handleInputChange} accept="image/*" className="hidden" />
              {sourceImagePreview ? (
                <div className="flex flex-col items-center gap-3 p-4 w-full">
                  <img src={sourceImagePreview} className="max-h-48 max-w-full object-contain" style={{border:'1px solid rgba(125,211,252,0.3)'}} />
                  <span className="text-[8px] font-black uppercase text-sky-600 tracking-widest">✓ loaded — click to change</span>
                </div>
              ) : (
                <>
                  <span className="text-5xl">📸</span>
                  <div className="text-center">
                    <p className="text-[11px] font-black uppercase text-sky-400 tracking-widest">Drop your image here</p>
                    <p className="text-[8px] text-sky-700 uppercase mt-1">or click to browse</p>
                  </div>
                  <p className="text-[7px] text-sky-800 uppercase tracking-tight">pfp · character · meme · nft · anything</p>
                </>
              )}
            </div>
          </div>

          <div className="p-3 md:p-4 border-t shrink-0" style={{background:'rgba(3,11,20,0.95)', borderColor:'rgba(3,105,161,0.4)'}}>
            <button
              onClick={handleForge}
              disabled={isForging || !sourceImage || isSyncing}
              className={`w-full py-4 font-black italic text-base tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-3 border-b-4 active:translate-y-1 active:border-b-0 ${isForging || !sourceImage ? 'cursor-not-allowed opacity-60' : 'hover:brightness-110'}`}
              style={{background: isForging ? '#0c1f33' : '#7DD3FC', color: isForging ? '#7DD3FC' : '#030b14', borderColor:'#0369a1', boxShadow: (!isForging && sourceImage) ? '0 0 40px rgba(125,211,252,0.25)' : 'none'}}>
              {isForging ? <RefreshCw className="animate-spin" size={18}/> : <span className="text-xl">🐧</span>}
              {isForging ? 'cloning...' : !sourceImage ? 'upload an image first' : 'pedgyify it'}
            </button>
          </div>
        </div>

        {/* RIGHT: output */}
        <div className={`w-full md:w-[340px] lg:w-[400px] flex flex-col shrink-0 min-h-0 ${(isForging || generatedImg) ? 'flex' : 'hidden md:flex'}`} style={{background:'#030b14'}}>
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5">
            {isForging ? (
              <div className="flex flex-col items-center gap-5 w-full">
                <div className="relative w-48 h-48 border flex items-center justify-center overflow-hidden" style={{borderColor:'rgba(125,211,252,0.1)'}}>
                  <span className="text-7xl animate-bounce">🐧</span>
                  <div className="absolute bottom-0 left-0 w-full h-[2px]" style={{background:'#7DD3FC', animation:'scan 1.8s linear infinite'}}/>
                </div>
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-[8px] font-black text-sky-500 uppercase tracking-widest">
                    <span>absorbing vibes...</span><span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1 overflow-hidden" style={{background:'rgba(0,0,0,0.5)', border:'1px solid #0369a1'}}>
                    <div className="h-full transition-all duration-300" style={{width:`${progress}%`, background:'#7DD3FC', boxShadow:'0 0 12px #7DD3FC'}}/>
                  </div>
                </div>
              </div>
            ) : generatedImg ? (
              <div className="w-full max-w-[280px] flex flex-col gap-3">
                <div className="relative group overflow-hidden" style={{background:'rgba(3,11,20,0.8)', border:'1px solid rgba(125,211,252,0.2)'}}>
                  <img src={generatedImg} className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{background:'rgba(0,0,0,0.4)'}}>
                    <button onClick={downloadPFP} className="p-3 hover:brightness-110 text-sky-900" style={{background:'#7DD3FC'}}><Download size={22}/></button>
                  </div>
                </div>
                <button onClick={downloadPFP} className="w-full py-3 font-black uppercase text-[11px] flex items-center justify-center gap-2 tracking-[0.2em] transition-all hover:brightness-110 text-sky-900" style={{background:'#7DD3FC'}}>
                  <Download size={14}/> save pedgy 🐧
                </button>
                <button onClick={() => { setGeneratedImg(null); setSourceImage(null); setSourceImagePreview(null); }} className="w-full py-2 text-[9px] font-black uppercase text-sky-700 hover:text-sky-400 transition-all flex items-center justify-center gap-2">
                  <RefreshCw size={11}/> clone another
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 opacity-[0.07]">
                <span className="text-[110px] leading-none">🐧</span>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white italic">awaiting_source</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {error && (
        <div className="absolute bottom-16 right-4 left-4 border-l-4 p-4 flex items-start gap-3 z-[200]" style={{background:'rgba(153,27,27,0.95)', borderColor:'#ef4444', color:'white'}}>
          <span className="text-xl">🐧</span>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest">Clone_Error</p>
            <p className="text-[8px] opacity-70 uppercase mt-1 leading-tight">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="p-0.5 hover:bg-white/10 transition-colors"><X size={14}/></button>
        </div>
      )}
      <style>{`@keyframes scan { 0% { transform: translateY(-400%); } 100% { transform: translateY(800%); } }`}</style>
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

// --- DRAGGABLE WINDOW ---
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
    const titles = { paint: '🎨 Paint pedgy', terminal: '💻 Terminal', tunes: '🎵 Tunes', rugsweeper: '🐧 Stack pedgy', notepad: '📝 Write Stuff', memes: '🐟 Meme Stash', trollbox: '💬 Colony Chat', mememind: '🧠 Meme Brain', mergeit: '🧊 Slide pedgy', wallet: '💰 Wallet', pfpcult: '📸 PFP Cult' };
    const isMobile = window.innerWidth < 768;
    const isPhoneApp = ['rugsweeper','trollbox','mememind','mergeit','wallet'].includes(type);
    const isWideApp = ['paint','memes','pfpcult'].includes(type);
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
      {snowflakes.map(s => (
        <div key={s.id} className="absolute text-sky-200/40 animate-bounce pointer-events-none" style={{left:s.left, top:s.top, fontSize:s.size, animationDelay:s.delay}}>❄</div>
      ))}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="text-8xl mb-6 animate-bounce" style={{filter:'drop-shadow(0 0 30px rgba(125,211,252,0.6))'}}>🐧</div>
        <h1 className="text-5xl font-black text-white mb-2 italic tracking-[0.2em]" style={{fontFamily:"'Fredoka One', 'Comic Sans MS', cursive", textShadow:'0 0 30px rgba(125,211,252,0.5)'}}>pedgy OS</h1>
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
      
      {/* Snow overlay */}
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
          { id: 'pfpcult', emoji: '📸', label: 'PFP Cult' },
          { id: 'mergeit', emoji: '🧊', label: 'Slide pedgy' },
          { id: 'paint', emoji: '🎨', label: 'Paint pedgy' },
          { id: 'notepad', emoji: '📝', label: 'Write Stuff' },
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
          {win.type === 'pfpcult' && <PfpCultApp />}
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
                  <span className="text-[9px] font-bold text-sky-700 uppercase block mb-1">Your pedgy 🐧</span>
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black text-sky-300">{(dexData.balance || 0).toLocaleString()}</span>
                    <span className="text-xs font-black text-sky-600">pedgy</span>
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
                  <span className="text-[8px] text-sky-700 uppercase leading-tight">{hasAccess ? 'welcome to the colony, fren!' : 'hold 500k pedgy to join the colony.'}</span>
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

          {win.type === 'terminal' && (
            <div className="p-4 h-full flex flex-col" style={{background:'#050d1a', fontFamily:'monospace', color:'#7DD3FC'}}>
              <div className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-4 flex items-center gap-2">
                <span>🐧</span> pedgy_OS TERMINAL v1.0
              </div>
              <div className="flex-1 overflow-y-auto text-[11px] space-y-1">
                <p className="text-sky-400">Welcome to pedgy OS Terminal, fren.</p>
                <p className="text-sky-600">Type 'help' for available commands.</p>
                <p className="text-sky-300 mt-2">{'>'} Colony Status: WADDLING 🐧</p>
                <p className="text-sky-300">{'>'} Fish Reserves: PLENTY 🐟</p>
                <p className="text-sky-300">{'>'} Iceberg Temp: COLD ❄️</p>
              </div>
            </div>
          )}

          {win.type === 'tunes' && (
            <div className="p-4 h-full flex flex-col gap-3 overflow-y-auto" style={{background:'#050d1a', fontFamily:'monospace', color:'#7DD3FC'}}>
              <div className="flex items-center gap-2 border-b pb-3" style={{borderColor:'rgba(3,105,161,0.4)'}}>
                <span className="text-2xl">🎵</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-600">pedgy Tunes</span>
              </div>
              <div className="flex-1 space-y-2">
                {TUNES_PLAYLIST.map((track, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border cursor-pointer hover:brightness-110 transition-all" style={{background:'rgba(3,105,161,0.1)', borderColor:'rgba(125,211,252,0.15)'}}>
                    <span className="text-sky-600 text-[10px] font-black w-4">{i+1}</span>
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-sky-300 uppercase tracking-tight">{track.title}</p>
                      <p className="text-[9px] text-sky-700 uppercase">{track.artist}</p>
                    </div>
                    <span className="text-[9px] text-sky-700 font-mono">{track.duration}</span>
                    <span className="text-sky-500 text-sm">▶</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex items-center justify-center gap-4" style={{borderColor:'rgba(3,105,161,0.4)'}}>
                <button className="text-sky-600 hover:text-sky-300 transition-colors text-xl">⏮</button>
                <button className="text-sky-300 hover:text-white transition-colors text-3xl">▶</button>
                <button className="text-sky-600 hover:text-sky-300 transition-colors text-xl">⏭</button>
              </div>
            </div>
          )}

          {win.type === 'rugsweeper' && (
            <div className="h-full flex flex-col items-center justify-center gap-4 p-4" style={{background:'#050d1a', fontFamily:'monospace', color:'#7DD3FC'}}>
              <span className="text-6xl animate-bounce">🐧</span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600 text-center">Stack pedgy</p>
              <p className="text-[9px] text-sky-800 uppercase tracking-widest text-center">Stack the colony.<br/>Don't fall off the iceberg.</p>
              <div className="px-6 py-3 border font-black text-[10px] uppercase tracking-widest text-sky-900" style={{background:'#7DD3FC', borderColor:'#0369a1'}}>
                🐧 Coming Soon
              </div>
            </div>
          )}

          {win.type === 'trollbox' && (() => {
            const [tbMessages, setTbMessages] = React.useState([
              { id: 1, user: 'pedgy_maxi', text: 'honk honk frens 🐧', time: '12:01' },
              { id: 2, user: 'iceberghodler', text: 'fish reserves looking stacked today 🐟', time: '12:03' },
              { id: 3, user: 'waddle_gang', text: 'COLONY STRONG ❄️', time: '12:05' },
            ]);
            const [tbInput, setTbInput] = React.useState('');
            const names = ['anon_pedgyin','frosty_degen','iceberg_irl','colony_fren','fish_maxi'];
            const sendMsg = () => {
              if (!tbInput.trim()) return;
              setTbMessages(prev => [...prev, { id: Date.now(), user: names[Math.floor(Math.random()*names.length)], text: tbInput, time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }]);
              setTbInput('');
            };
            return (
              <div className="h-full flex flex-col" style={{background:'#050d1a', fontFamily:'monospace', color:'#7DD3FC'}}>
                <div className="px-3 py-2 border-b flex items-center gap-2" style={{background:'rgba(3,11,20,0.9)', borderColor:'rgba(3,105,161,0.4)'}}>
                  <span>💬</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-sky-600">Colony Chat</span>
                  <div className="ml-auto flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"/><span className="text-[8px] text-sky-700">LIVE</span></div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {tbMessages.map(m => (
                    <div key={m.id} className="text-[11px]">
                      <span className="text-sky-500 font-black">{m.user}</span>
                      <span className="text-sky-800 text-[9px] ml-2">{m.time}</span>
                      <p className="text-sky-300 mt-0.5 ml-2">{m.text}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 flex gap-2 border-t" style={{borderColor:'rgba(3,105,161,0.4)'}}>
                  <input value={tbInput} onChange={e=>setTbInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()}
                    className="flex-1 px-2 py-1.5 text-[11px] outline-none text-sky-300 font-bold"
                    style={{background:'rgba(3,105,161,0.15)', border:'1px solid rgba(125,211,252,0.2)'}}
                    placeholder="honk something..." />
                  <button onClick={sendMsg} className="px-3 py-1 text-[10px] font-black text-sky-900 hover:brightness-110 transition-all" style={{background:'#7DD3FC'}}>SEND</button>
                </div>
              </div>
            );
          })()}

          {win.type === 'mememind' && (() => {
            const [mmIdea, setMmIdea] = React.useState('');
            const [mmResult, setMmResult] = React.useState(null);
            const [mmLoading, setMmLoading] = React.useState(false);
            const ideas = [
              "🐧 when you buy the top but your flippers are diamond",
              "🐟 fish rain incoming — colony feasting soon",
              "❄️ your bags are frozen but so is your conviction",
              "🐧 nobody: / pedgy: honk honk WAGMI honk",
              "🧊 iceberg theory: 90% of gains are underwater",
              "🐟 bought pedgy for the fish. stayed for the colony.",
            ];
            const generate = () => {
              setMmLoading(true);
              setTimeout(() => {
                setMmResult(ideas[Math.floor(Math.random()*ideas.length)]);
                setMmLoading(false);
              }, 800);
            };
            return (
              <div className="h-full flex flex-col gap-4 p-4" style={{background:'#050d1a', fontFamily:'monospace', color:'#7DD3FC'}}>
                <div className="flex items-center gap-2 border-b pb-3" style={{borderColor:'rgba(3,105,161,0.4)'}}>
                  <span className="text-xl">🧠</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-600">Meme Brain</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
                  {mmResult ? (
                    <div className="p-6 border max-w-xs" style={{background:'rgba(3,105,161,0.1)', borderColor:'rgba(125,211,252,0.3)'}}>
                      <p className="text-sky-200 text-sm font-bold leading-relaxed">{mmResult}</p>
                      <button onClick={()=>{const t=encodeURIComponent(mmResult);window.open(`https://twitter.com/intent/tweet?text=${t}`,'_blank');}}
                        className="mt-4 px-4 py-2 text-[9px] font-black uppercase text-white" style={{background:'#1da1f2'}}>
                        🐧 Post to X
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <span className="text-6xl">🧠</span>
                      <p className="text-[9px] uppercase tracking-widest text-sky-600">Brain empty. Generate a meme.</p>
                    </div>
                  )}
                  <button onClick={generate} disabled={mmLoading}
                    className="px-8 py-3 font-black uppercase text-[11px] tracking-widest text-sky-900 hover:brightness-110 transition-all"
                    style={{background: mmLoading ? '#0c1f33' : '#7DD3FC', color: mmLoading ? '#7DD3FC' : '#050d1a'}}>
                    {mmLoading ? '🐧 Thinking...' : '⚡ Generate Meme Idea'}
                  </button>
                </div>
              </div>
            );
          })()}
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
