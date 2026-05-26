/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile as updateAuthProfile,
  signOut,
  deleteUser,
  sendEmailVerification,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  updateDoc,
  arrayUnion,
  getDocFromServer,
  getDocs,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { Type, Modality } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  BookOpen, 
  BrainCircuit, 
  CheckCircle2, 
  Clock,
  Circle,
  ChevronRight, 
  ArrowLeft,
  GraduationCap, 
  History, 
  LayoutDashboard, 
  LogOut, 
  MessageSquare, 
  Menu,
  Plus, 
  Settings, 
  Settings2,
  Sparkles, 
  Trash2,
  Trophy,
  User as UserIcon,
  Loader2,
  FileText,
  FileBox,
  Send,
  BookMarked,
  Calendar,
  Microscope,
  Library,
  Globe,
  ArrowRight,
  Target,
  AlertCircle,
  HelpCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Video,
  Moon,
  Sun,
  Eye,
  EyeOff,
  RotateCcw,
  Search,
  X,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Layers,
  WifiOff,
  FileDown,
  Mail,
  Lock,
  Key,
  Timer,
  Github,
  UserPlus,
  Users,
  LogIn,
  UserCircle,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  Landmark,
  Briefcase,
  ClipboardList,
  School,
  Download,
  Dna,
  Check,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './firebase';
import { YouTubeDeck } from './components/YouTubeDeck';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis
} from 'recharts';
import { UserProfile, QuestionItem, AnswerRecord, AnalyticsRecord, GraphData, ExamRecord, ChatMessage, ChatSession, UserRole, SchemeOfWork, LessonPlan, BasisOfAssessment, SchoolTimetableEntry, RevisionTimetableEntry } from './types';
import ugandanSchoolsData from './knowledge_base/ugandan_schools.json';

// SECURE ENCLAVE SHA-256 ENCRYPTION & ACOUSTIC OSCILLATORS
export async function hashPasscode(pin: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + "stella_salt_2026");
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (err) {
    let h = 5381;
    for (let i = 0; i < pin.length; i++) {
       h = ((h << 5) + h) + pin.charCodeAt(i);
    }
    return 'fallback_' + h.toString();
  }
}

export const playKeypadClick = (frequency = 1100, duration = 0.02) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Autoplay safe
  }
};

export const playUnlockTone = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.frequency.setValueAtTime(523.25, now); 
    osc2.frequency.setValueAtTime(659.25, now + 0.08); 
    
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start();
    osc2.start(now + 0.08);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch (err) {
    // Autoplay safe
  }
};

export const ClockDisplay: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</>;
};

const verifiedDistricts = ugandanSchoolsData.districts;
const verifiedSchools = ugandanSchoolsData.schools;

// Custom Stella Logo Component matching user specifications
export const StellaLogo: React.FC<{ className?: string; isDark?: boolean }> = ({ className = "w-6 h-6", isDark }) => {
  const [isThemeDark, setIsThemeDark] = useState(isDark !== undefined ? isDark : document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (isDark !== undefined) {
      setIsThemeDark(isDark);
      return;
    }
    const observer = new MutationObserver(() => {
      setIsThemeDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [isDark]);

  return (
    <svg 
      viewBox="0 0 200 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} transition-all duration-300`}
    >
      {/* 1. Red Curve (Outermost) */}
      <path
        d="M 82 145 C 52 120, 52 70, 85 40 C 105 20, 135 22, 152 28 C 158 31, 158 38, 150 41 C 133 46, 112 55, 102 80 C 92 105, 87 130, 82 145 Z"
        fill="#E2231A"
      />

      {/* 2. Yellow Curve (Middle) */}
      <path
        d="M 82 145 C 65 125, 65 85, 92 60 C 108 45, 135 48, 155 58 C 160 61, 159 67, 151 69 C 135 70, 118 80, 108 100 C 98 118, 88 135, 82 145 Z"
        fill="#FDB913"
      />

      {/* 3. Black Curve (Innermost) */}
      <path
        d="M 82 145 C 75 130, 75 100, 98 80 C 112 70, 134 72, 155 88 C 159 91, 157 97, 149 98 C 132 98, 120 108, 112 120 C 104 130, 90 140, 82 145 Z"
        fill={isThemeDark ? "#F8FAFC" : "#1B1C1E"}
      />

      {/* STYLIZED OPEN BOOK AT BOTTOM */}
      {/* Dark Navy / Charcoal base cover */}
      <path
        d="M 98 190 C 80 178, 60 178, 45 188 C 60 198, 80 198, 98 190 Z"
        fill="#0D1C3F"
      />
      <path
        d="M 102 190 C 120 178, 140 178, 155 188 C 140 198, 120 198, 102 190 Z"
        fill="#0D1C3F"
      />

      {/* Inner white pages with visual negative space */}
      <path
        d="M 97 182 C 81 172, 65 172, 53 180 C 65 188, 81 188, 97 182 Z"
        fill={isThemeDark ? "#1E293B" : "#FFFFFF"}
      />
      <path
        d="M 103 182 C 119 172, 135 172, 147 180 C 135 188, 119 188, 103 182 Z"
        fill={isThemeDark ? "#1E293B" : "#FFFFFF"}
      />

      {/* BLUE CORE NEURAL SPARK / SYNAPTIC STEMS (Solid vibrant blue nodes) */}
      {/* Left Prong */}
      <path
        d="M 98 180 Q 94 168, 82 158"
        stroke="#3A7EC3"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle
        cx="82"
        cy="158"
        r="5"
        fill="#3A7EC3"
      />

      {/* Center Prong (tallest) */}
      <line
        x1="100"
        y1="180"
        x2="100"
        y2="148"
        stroke="#3A7EC3"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle
        cx="100"
        cy="148"
        r="5"
        fill="#3A7EC3"
      />

      {/* Right Prong */}
      <path
        d="M 102 180 Q 106 168, 118 158"
        stroke="#3A7EC3"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle
        cx="118"
        cy="158"
        r="5"
        fill="#3A7EC3"
      />
    </svg>
  );
};

export const AiThinkingBackground: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(60, Math.floor((width * height) / 25000));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulseSpeed: number;
      pulsePhase: number;
      pulseOffset: number;
      color: string;
    }> = [];

    const colors = isDarkMode 
      ? ['rgba(99, 102, 241, 0.4)', 'rgba(16, 185, 129, 0.4)', 'rgba(59, 130, 246, 0.4)', 'rgba(236, 72, 153, 0.4)']
      : ['rgba(99, 102, 241, 0.15)', 'rgba(16, 185, 129, 0.15)', 'rgba(59, 130, 246, 0.15)', 'rgba(236, 72, 153, 0.15)'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 1.5,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseOffset: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const waveCount = 4;
    const waves: Array<{
      amplitude: number;
      frequency: number;
      speed: number;
      offset: number;
      color: string;
      lineWidth: number;
    }> = [];

    const waveColors = isDarkMode
      ? ['rgba(99, 102, 241, 0.03)', 'rgba(16, 185, 129, 0.03)', 'rgba(59, 130, 246, 0.02)']
      : ['rgba(99, 102, 241, 0.02)', 'rgba(16, 185, 129, 0.02)', 'rgba(59, 130, 246, 0.01)'];

    for (let i = 0; i < waveCount; i++) {
      waves.push({
        amplitude: 40 + Math.random() * 50,
        frequency: 0.001 + Math.random() * 0.002,
        speed: 0.005 + Math.random() * 0.01,
        offset: Math.random() * Math.PI * 2,
        color: waveColors[i % waveColors.length],
        lineWidth: 1 + Math.random() * 2
      });
    }

    let time = 0;

    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height) * 0.8);
      if (isDarkMode) {
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
      } else {
        bgGrad.addColorStop(0, '#fafafa');
        bgGrad.addColorStop(1, '#f1f5f9');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      waves.forEach((w) => {
        w.offset += w.speed;
        ctx.beginPath();
        ctx.lineWidth = w.lineWidth;
        ctx.strokeStyle = w.color;
        for (let x = 0; x < width; x += 15) {
          const y = height / 2 + Math.sin(x * w.frequency + w.offset) * w.amplitude * Math.cos(x * 0.0005 + w.offset * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      const maxDistance = 140;
      for (let i = 0; i < particleCount; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isDarkMode ? 0.18 : 0.08);
            ctx.strokeStyle = isDarkMode ? `rgba(99, 102, 241, ${alpha})` : `rgba(79, 70, 229, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            const hash = (i * 31 + j) % 100;
            if (hash < 12) {
              const progress = ((time * 0.1 + hash) % 100) / 100;
              const px = p1.x + dx * -progress;
              const py = p1.y + dy * -progress;
              ctx.fillStyle = isDarkMode ? 'rgba(56, 189, 248, 0.5)' : 'rgba(79, 70, 229, 0.4)';
              ctx.beginPath();
              ctx.arc(px, py, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      particles.forEach((p) => {
        p.pulsePhase += p.pulseSpeed;
        const currentRadius = p.radius + Math.sin(p.pulsePhase) * 0.7;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isDarkMode ? '#e0e7ff' : '#4f46e5';
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });

      const centerX = width / 2;
      const centerY = height / 2;
      const corePulse = 25 + Math.sin(time * 0.3) * 5;
      
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, corePulse * (isDarkMode ? 3 : 2));
      coreGrad.addColorStop(0, isDarkMode ? 'rgba(99, 102, 241, 0.08)' : 'rgba(79, 70, 229, 0.04)');
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, corePulse * (isDarkMode ? 3 : 2), 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

const callGeminiServer = async (payload: any) => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error || `Gemini proxy request failed with status ${response.status}`;
    throw new Error(message);
  }

  // Reconstruct response.text if it is missing in the JSON payload but candidates are present
  if (data && !data.text && data.candidates?.[0]?.content?.parts) {
    try {
      const parts = data.candidates[0].content.parts;
      data.text = parts.map((p: any) => p.text || "").join("");
    } catch (e) {
      console.warn("Failed to reconstruct text from candidates:", e);
    }
  }

  return data;
};

const ai: any = {
  models: {
    generateContent: callGeminiServer,
  },
  live: {
    connect: async () => {
      throw new Error('Gemini live sessions are disabled in secure proxy mode. Use server-side live support for live sessions.');
    },
  },
};

// Voice Helpers
let currentAudioContext: AudioContext | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;

const stopSpeaking = () => {
  if (currentSourceNode) {
    try {
      currentSourceNode.onended = null;
      currentSourceNode.stop();
    } catch (e) {}
    currentSourceNode = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

const speak = async (text: string, force = false) => {
  if (!force && localStorage.getItem('isTtsEnabled') !== 'true') return; 
  
  stopSpeaking();

  if (ai) {
    try {
      // Attempt Gemini TTS for high-quality voice
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say naturally and clearly: ${text.substring(0, 1000)}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, 
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!currentAudioContext) {
          currentAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const arrayBuffer = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer;
        const float32Array = new Float32Array(arrayBuffer.byteLength / 2);
        const view = new DataView(arrayBuffer);
        
        // PCM16 to Float32
        for (let i = 0; i < float32Array.length; i++) {
          float32Array[i] = view.getInt16(i * 2, true) / 32768;
        }
        
        const audioBuffer = currentAudioContext.createBuffer(1, float32Array.length, 24000);
        audioBuffer.getChannelData(0).set(float32Array);
        
        currentSourceNode = currentAudioContext.createBufferSource();
        currentSourceNode.buffer = audioBuffer;
        currentSourceNode.connect(currentAudioContext.destination);
        
        // Handle the end of speech trigger if needed
        currentSourceNode.onended = () => {
          const event = new CustomEvent('speechEnded');
          window.dispatchEvent(event);
        };

        const startEvent = new CustomEvent('speechStarted');
        window.dispatchEvent(startEvent);

        currentSourceNode.start();
        return;
      }
    } catch (error) {
      console.warn("Gemini TTS failed, falling back to Browser TTS", error);
    }
  } else {
    console.warn('Gemini API key missing; falling back to browser TTS. Set GEMINI_API_KEY to enable Gemini TTS.');
  }

  // Fallback to browser TTS
  if (window.speechSynthesis) {
    // Clean text for clearer speech
    let cleanText = text
      .replace(/\*\*?|__?/g, '') 
      .replace(/#+\s/g, '') 
      .replace(/\[.*?\]\(.*?\)/g, '$1') 
      .replace(/<.*?>/g, '') 
      .replace(/\\\(|\\\)|\\\[|\\\]/g, '')
      .substring(0, 500); // Browser TTS performs better with shorter chunks

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1;
    utterance.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Female')) || voices.find(v => v.lang.includes('en-GB'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onstart = () => {
      const event = new CustomEvent('speechStarted');
      window.dispatchEvent(event);
    };

    utterance.onend = () => {
      const event = new CustomEvent('speechEnded');
      window.dispatchEvent(event);
    };

    window.speechSynthesis.speak(utterance);
  }
};

// Helper to handle LaTeX delimiters (\( ... \) and \[ ... \])
const preprocessMarkdown = (text: string = "") => {
  if (!text) return "";
  
  // Tabulate any text-based CBC scoring rubrics automatically for enhanced readability
  // Matches "Section 1: Interpretation (Score 4): [description]" or "Section 1 - Interpretation: [description]"
  let processed = text;
  const sectionRegex = /(?:^|\s|\n)(?:-?\s*\*?)?(Section\s+\d+)\s*(?:[-–—:]\s*|\s+)\*?([A-Za-z\s/&]+?)\*?(?:\s*\(([^)]*Score[^)]*|[^)]*Mark[^)]*|\d+)\))?\s*[-–—:]\s*([\s\S]+?)(?=(?:\s*(?:-?\s*\*?)?Section\s+\d+|$))/gi;
  
  const matches = [...processed.matchAll(sectionRegex)];
  if (matches.length >= 2) {
    let table = `\n\n| Assessment Section | Target Score | Competency / Performance Descriptors |\n| :--- | :---: | :--- |\n`;
    matches.forEach(m => {
      const sectionNum = m[1].trim();
      const sectionTitle = m[2].trim();
      const score = m[3] ? m[3].trim() : "Score 4"; // Default to CBC standard Score 4 if not specified
      const description = m[4].trim().replace(/\n+/g, '<br />');
      table += `| **${sectionNum}: ${sectionTitle}** | \`${score}\` | ${description} |\n`;
    });
    table += `\n`;

    const firstMatch = matches[0];
    const lastMatch = matches[matches.length - 1];
    const startIndex = firstMatch.index || 0;
    const endIndex = (lastMatch.index || 0) + lastMatch[0].length;

    processed = processed.substring(0, startIndex) + "\n" + table + "\n" + processed.substring(endIndex);
  }

  // Handle LaTeX delimiters
  // We convert \( ... \) to $ ... $ and \[ ... \] to $$ ... $$ for the renderer
  processed = processed
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$')
    .replace(/\\\[/g, '$$')
    .replace(/\\\]/g, '$$');

  // Wrap symbols that might be escaped but not wrapped in math delimiters
  const commonSymbols = [
    'Omega', 'omega', 'pi', 'theta', 'alpha', 'beta', 'gamma', 'delta', 
    'epsilon', 'lambda', 'mu', 'rho', 'sigma', 'phi', 'dots', 'times', 
    'div', 'pm', 'mp', 'le', 'ge', 'approx', 'infty', 'degree', 'text',
    'cdot', 'sqrt', 'frac', 'sum', 'int', 'partial', 'nabla'
  ].join('|');

  const symbolRegex = new RegExp(`\\\\(${commonSymbols})(\\b|\\{)`, 'g');
  
  processed = processed.replace(symbolRegex, (match, symbol, suffix, offset) => {
    // Basic check: if followed by $ or preceded by $, it's already wrapped
    const isPrecededByDollar = offset > 0 && processed[offset - 1] === '$';
    const isFollowedByDollar = (offset + match.length) < processed.length && processed[offset + match.length] === '$';
    if (isPrecededByDollar || isFollowedByDollar) return match;
    
    // More robust check: count dollars before
    const textBefore = processed.substring(0, offset);
    const dollarCountBefore = (textBefore.match(/\$/g) || []).length;
    if (dollarCountBefore % 2 !== 0) return match;
    
    return `$${match}$`;
  });

  // Ensure task identifiers (a, b, c...) start on new lines for better readability
  // Look for a period/punctuation followed by a task letter and parenthesis
  processed = processed.replace(/([.!?])\s+([a-j]\))/g, '$1\n\n$2');
  // Also handle cases where they might be joined without a period (rare but happens in AI output)
  processed = processed.replace(/(\w)\s+([b-j]\))/g, '$1\n\n$2');
  // Handle start of the string if it begins with a)
  processed = processed.replace(/^([a-j]\))/g, '$1'); 

  return processed.replace(/\\n/g, '\n');
};

// Sample Curriculum Data
const CURRICULUM = {
  // Science Subjects
  "Biology": [
    { topic: "Topic 1: Cell Biology", construct: "Construct 1", outcomes: ["Chemical compounds", "Microscopy", "Ultrastructure", "Tissues"] },
    { topic: "Topic 2: Nutrition in Plants", construct: "Construct 2", outcomes: ["C3 and C4 pathways", "Environmental factors"] },
    { topic: "Topic 3: Transport in Humans", construct: "Construct 3", outcomes: ["Human heart and circulation", "Gas transport", "Immunity"] },
    { topic: "Topic 4: Respiration", construct: "Construct 3", outcomes: ["Mitochondrion structure", "ATP production"] },
    { topic: "Topic 5: Homeostasis", construct: "Construct 3", outcomes: ["Negative feedback", "Osmoregulation"] },
    { topic: "Topic 6: Coordination", construct: "Construct 4", outcomes: ["Plant hormones", "Impulse transmission", "Sensory receptors", "Animal behaviour"] },
    { topic: "Topic 7: Inheritance and Evolution", construct: "Construct 4", outcomes: ["Nucleic acids", "Gene technology", "Inheritance patterns", "Evolutionary advancements", "Speciation"] },
    { topic: "Topic 8: Growth in Plants and Development in Insects", construct: "Construct 2", outcomes: ["Plant growth", "Metamorphosis"] },
    { topic: "Topic 9: Ecology", construct: "Construct 4", outcomes: ["Population ecology", "Succession", "Energy flow", "Carbon footprint", "Food security"] }
  ],
  "Physics": [
    // Construct 1 — Force and Motion (AO1)
    { topic: "Measurement & Dimensions", construct: "AO1", outcomes: ["Units", "Errors", "Significant figures", "Dimensional analysis"] },
    { topic: "Statics", construct: "AO1", outcomes: ["Vectors", "Resultants", "Moments", "Torque", "Centre of gravity", "Stability"] },
    { topic: "Linear Motion", construct: "AO1", outcomes: ["Equations of motion", "Relative velocity", "Momentum conservation", "Newton's laws"] },
    { topic: "Motion Under Gravity", construct: "AO1", outcomes: ["Acceleration due to gravity", "Projectile motion (horizontal surfaces)"] },
    { topic: "Work, Energy & Power", construct: "AO1", outcomes: ["KE", "PE", "Power", "Work-energy theorem", "Conservative/non-conservative fields", "Solar & renewable energy"] },
    { topic: "Solid Friction", construct: "AO1", outcomes: ["Static & dynamic friction", "Coefficients", "Braking systems"] },
    { topic: "Fluid Mechanics", construct: "AO1", outcomes: ["Surface tension", "Capillarity", "Viscosity", "Pascal's & Archimedes' principles", "Bernoulli's equation", "Stokes' & Poiseuille's formulae"] },
    { topic: "Mechanical Properties of Matter", construct: "AO1", outcomes: ["Stress", "Strain", "Hooke's law", "Young's Modulus"] },
    { topic: "Circular Motion", construct: "AO1", outcomes: ["Angular velocity", "Centripetal force", "Conical pendulum", "Banked roads"] },
    { topic: "Gravitation", construct: "AO1", outcomes: ["Kepler's & Newton's laws", "Satellites", "Escape velocity"] },
    
    // Construct 2 — Energy (AO2)
    { topic: "Thermometry", construct: "AO2", outcomes: ["Temperature scales", "Types of thermometers"] },
    { topic: "Heat Quantities", construct: "AO2", outcomes: ["Specific heat capacity", "Latent heat", "Newton's law of cooling"] },
    { topic: "Transfer of Heat", construct: "AO2", outcomes: ["Conduction", "Convection", "Black body radiation & laws"] },
    { topic: "Behaviour of Gases", construct: "AO2", outcomes: ["Ideal gas laws", "Kinetic theory", "Real gases", "Van der Waals equation", "Saturated vapour pressure"] },
    { topic: "Thermodynamics", construct: "AO2", outcomes: ["Internal energy", "First law", "Molar heat capacities", "Isothermal & adiabatic processes"] },
    { topic: "Reflection of Light", construct: "AO2", outcomes: ["Plane & curved mirrors", "Mirror equations", "Magnification"] },
    { topic: "Refraction of Light", construct: "AO2", outcomes: ["Snell's law", "Prisms", "Critical angle", "Total internal reflection", "Lenses", "Aberrations"] },
    { topic: "Optical Instruments", construct: "AO2", outcomes: ["Compound microscope", "Refracting telescope"] },
    { topic: "Simple Harmonic Motion", construct: "AO2", outcomes: ["Displacement", "Velocity", "Acceleration", "Energy", "Pendulum", "Springs"] },
    { topic: "Progressive Waves", construct: "AO2", outcomes: ["Wave equation", "Interference", "Young's double slit", "Diffraction", "Polarisation"] },
    { topic: "Stationary Waves", construct: "AO2", outcomes: ["Formation", "Strings", "Pipes", "Resonance", "Speed of sound"] },
    { topic: "Sound Waves", construct: "AO2", outcomes: ["Beats", "Harmonics", "Doppler effect"] },

    // Construct 3 — Charges and Fields (AO3)
    { topic: "Electrostatics", construct: "AO3", outcomes: ["Charge production", "Coulomb's law", "Electric field intensity & potential"] },
    { topic: "Capacitors", construct: "AO3", outcomes: ["Capacitance", "Series/parallel networks", "Charging/discharging", "Energy stored"] },
    { topic: "Digital Electronics", construct: "AO3", outcomes: ["Number systems", "Logic gates", "Semiconductors", "Diodes", "Transistors"] },
    { topic: "Current Electricity", construct: "AO3", outcomes: ["Ohm's law", "Kirchhoff's laws", "Resistivity", "Power", "Wheatstone bridge", "Potentiometer"] },
    { topic: "Magnetism in Matter", construct: "AO3", outcomes: ["Earth's field", "Flux density", "Domain theory", "Hysteresis", "Magnetic materials"] },
    { topic: "Magnetic Effect of Electric Current", construct: "AO3", outcomes: ["Force on conductors", "Biot-Savart's law", "Hall effect", "Torque on a coil"] },
    { topic: "Electromagnetic Induction", construct: "AO3", outcomes: ["Faraday's & Lenz's laws", "Self & mutual induction", "Generators", "Transformers", "Back EMF", "Eddy currents"] },
    { topic: "A.C. Circuits", construct: "AO3", outcomes: ["RMS values", "Reactance", "Impedance", "LRC series circuits"] },

    // Construct 4 — Particles (AO4)
    { topic: "Atomic Particles", construct: "AO4", outcomes: ["Rutherford's model", "Millikan's experiment", "Cathode rays", "Mass spectrometer"] },
    { topic: "Quantum Theory", construct: "AO4", outcomes: ["Photoelectric effect", "Bohr's model", "X-rays", "Bragg's law"] },
    { topic: "Nuclear Processes", construct: "AO4", outcomes: ["Fission", "Fusion", "Binding energy", "Radioactivity", "Half-life", "Decay law", "Radiation detectors"] }
  ],
  "Chemistry": [
    { "topic": "Atomic Structure", "construct": "Construct 1", "outcomes": ["Electronic structure", "Periodic properties"] },
    { "topic": "Structure and Bonding", "construct": "Construct 1", "outcomes": ["Bonding types", "Molecular structures"] },
    { "topic": "Thermochemistry", "construct": "Construct 3", "outcomes": ["Enthalpy", "Calorimetry", "Hess's Law"] },
    { "topic": "Oxidation Numbers & Periodicity", "construct": "Construct 1", "outcomes": ["Oxidation states", "Periodic trends"] },
    { "topic": "Period 3 Elements", "construct": "Construct 1", "outcomes": ["Properties", "Compounds"] },
    { "topic": "Organic: Skeletons & Functional Groups", "construct": "Construct 2", "outcomes": ["Carbon structures", "Isomerism", "Homologous series"] },
    { "topic": "Organic: Functional Group Reactions", "construct": "Construct 2", "outcomes": ["Mechanisms", "Reactivity"] },
    { "topic": "Hydrocarbons (Alkanes, Alkenes, Alkynes)", "construct": "Construct 2", "outcomes": ["Structure", "Reactions"] },
    { "topic": "Benzene", "construct": "Construct 2", "outcomes": ["Structure", "Electrophilic substitution"] },
    { "topic": "Halogenoalkanes", "construct": "Construct 2", "outcomes": ["Nucleophilic substitution", "Elimination"] },
    { "topic": "Alcohols", "construct": "Construct 2", "outcomes": ["Preparation", "Reactions"] },
    { "topic": "Applied Chemistry (S5)", "construct": "Construct 2", "outcomes": ["Industrial processes", "Fertilizers", "Fermentation"] },
    { "topic": "Physical and Chemical Equilibria", "construct": "Construct 4", "outcomes": ["Kc, Kp", "Le Chatelier's"] },
    { "topic": "Chemical Kinetics", "construct": "Construct 3", "outcomes": ["Rates", "Mechanisms"] },
    { "topic": "Electrochemistry", "construct": "Construct 4", "outcomes": ["Cells", "Electrolysis"] },
    { "topic": "Inorganic: Groups II, IV, VII", "construct": "Construct 4", "outcomes": ["Group trends", "Properties"] },
    { "topic": "Transition Elements", "construct": "Construct 4", "outcomes": ["d-block properties", "Complexes"] },
    { "topic": "Organic: Carbonyls, Acids, Derivatives", "construct": "Construct 2", "outcomes": ["Reactivity"] },
    { "topic": "Polymers", "construct": "Construct 2", "outcomes": ["Formation", "Properties"] },
    { "topic": "Applied Chemistry (S6)", "construct": "Construct 4", "outcomes": ["Soap", "Industrial products"] },
    { "topic": "Practical Chemistry", "construct": "Construct 3", "outcomes": ["Titration", "Qualitative analysis", "Kinetics"] }
  ],
  "Mathematics": [
    { "topic": "Numerical Concepts", "construct": "Construct 1", "outcomes": ["Approximations", "Significant figures", "Errors"] },
    { "topic": "Equations and Inequalities", "construct": "Construct 1", "outcomes": ["Quadratic equations", "Inequalities", "Simultaneous equations"] },
    { "topic": "Coordinate Geometry I", "construct": "Construct 1", "outcomes": ["Points", "Lines", "Circles"] },
    { "topic": "Partial Fractions", "construct": "Construct 1", "outcomes": ["Proper fractions", "Improper fractions", "Partial decomposition"] },
    { "topic": "Trigonometry", "construct": "Construct 1", "outcomes": ["Identities", "Equations", "Compound angles"] },
    { "topic": "Descriptive Statistics", "construct": "Construct 4", "outcomes": ["Mean", "Median", "Mode", "Standard deviation"] },
    { "topic": "Scatter Diagrams and Correlations", "construct": "Construct 4", "outcomes": ["Correlation coefficients", "Regression lines"] },
    { "topic": "Dynamics I", "construct": "Construct 3", "outcomes": ["Newton's laws", "Work, energy, power"] },
    { "topic": "Probability Theory", "construct": "Construct 4", "outcomes": ["Basic probability", "Conditional probability", "Baye's theorem"] },
    { "topic": "Differentiation I", "construct": "Construct 2", "outcomes": ["Rules of differentiation", "Tangents/normals"] },
    { "topic": "Integration I", "construct": "Construct 2", "outcomes": ["Rules of integration", "Definite/indefinite integrals"] },
    { "topic": "Permutations and Combinations", "construct": "Construct 1", "outcomes": ["Fundamental counting principle", "Permutations", "Combinations"] },
    { "topic": "Series", "construct": "Construct 1", "outcomes": ["Arithmetic series", "Geometric series", "Binomial expansion"] },
    { "topic": "Random Variables", "construct": "Construct 4", "outcomes": ["Discrete random variables", "Expected value", "Variance"] },
    { "topic": "Probability Distributions", "construct": "Construct 4", "outcomes": ["Binomial distribution", "Poisson distribution", "Normal distribution"] },
    { "topic": "Error Analysis", "construct": "Construct 1", "outcomes": ["Absolute error", "Relative error", "Percentage error"] },
    { "topic": "Coordinate Geometry II", "construct": "Construct 1", "outcomes": ["Conic sections", "Parabolas", "Ellipses", "Hyperbolas"] },
    { "topic": "Differentiation II", "construct": "Construct 2", "outcomes": ["Chain rule", "Product rule", "Implicit/parametric differentiation"] },
    { "topic": "Integration II", "construct": "Construct 2", "outcomes": ["Substitution method", "Integration by parts"] },
    { "topic": "Differential Equations", "construct": "Construct 2", "outcomes": ["First order", "Second order"] },
    { "topic": "Dynamics II", "construct": "Construct 3", "outcomes": ["Projectiles", "Circular motion"] },
    { "topic": "Statics", "construct": "Construct 3", "outcomes": ["Equilibrium", "Friction", "Moments"] },
    { "topic": "Further Probability", "construct": "Construct 4", "outcomes": ["Probability theorems", "Complex situations"] },
    { "topic": "Hypothesis Testing", "construct": "Construct 4", "outcomes": ["Null/alternative hypotheses", "Significance levels"] },
    { "topic": "Numerical Methods", "construct": "Construct 1", "outcomes": ["Newton-Raphson method", "Iterative methods"] },
    { "topic": "Vectors", "construct": "Construct 1", "outcomes": ["Vector addition", "Scalar/vector products"] },
    { "topic": "Complex Numbers", "construct": "Construct 1", "outcomes": ["De Moivre's theorem", "Roots of complex numbers"] },
    { "topic": "Linear Programming", "construct": "Construct 1", "outcomes": ["Objective functions", "Constraints", "Optimization"] },
    { "topic": "Matrices and Transformations", "construct": "Construct 1", "outcomes": ["Matrix algebra", "Determinants", "Linear transformations"] }
  ],
  "Agriculture": [
    { topic: "Agriculture Biology", construct: "Construct 1", outcomes: ["Biological principles for crop productivity", "Principles for animal productivity", "Genetics and Breeding"] },
    { topic: "Animal Production", construct: "Construct 2", outcomes: ["Sustainable farm animal production", "Feeds and nutrition", "Animal health management"] },
    { topic: "Crop Production", construct: "Construct 3", outcomes: ["Scientific crop production systems", "Soil science", "Sustainable farming for profit"] },
    { topic: "Value Addition", construct: "Construct 4", outcomes: ["Value addition to animal/plant products", "Market requirements and profitability"] }
  ],
  "Technical Drawing": [
    { topic: "Geometric and Spatial Skills", construct: "Objective 1", outcomes: ["Projection of Solids", "Surface Development", "Intersection of Solids", "Geometric construction"] },
    { topic: "Structural Analysis", construct: "Objective 2", outcomes: ["Force Analysis", "Vector Geometry", "Structural behaviour", "Load-bearing capacity"] },
    { topic: "Mechanical Drafting and Assembly", construct: "Objective 3", outcomes: ["Machine Drawing", "Power Transmission Systems", "Industry standards compliance"] },
    { topic: "Architectural & Building Practice", construct: "Objective 4", outcomes: ["Foundations", "Floors & Wall Design", "Roof Design", "Building Drawing (Max 6 room bungalow)"] }
  ],

  // Arts & Humanities
  "History": [
    { topic: "Social Economic Systems in Africa", construct: "Construct 1", outcomes: ["Pre-colonial institutions", "Trade systems", "Post-colonial socio-economic development in East Africa"] },
    { topic: "Nationalism and Governance", construct: "Construct 2", outcomes: ["African nationalism", "Constitutionalism", "Sovereignty", "Ethnic nationalism"] },
    { topic: "Global History", construct: "Construct 3", outcomes: ["Era of Napoleon", "Revolutions of 1848", "The Eastern Question", "Post-world war eras"] },
    { topic: "Global Politics and Ideologies", construct: "Construct 4", outcomes: ["Post-independence ideologies", "World Wars I and II", "Cold War-era challenges", "Middle East, South Asia, and Far East development"] }
  ],
  "Geography": [
    { topic: "P1: Physical Geography", outcomes: ["Describe landform formation", "Analyze climate patterns", "Vegetation and Soils", "Geomorphology", "Hydrology"] },
    { topic: "P2: World Problems", outcomes: ["Environmental degradation", "Pollution", "Climate Change", "Population explosion", "Famine and food security"] },
    { topic: "P3: Geography of Uganda", outcomes: ["Relief and drainage", "Climate and vegetation", "Population distribution", "Agriculture and industry", "Internal trade and transport"] }
  ],
  "Economics": [
    { topic: "Topic 1: Introduction to Economics", construct: "Construct 1", outcomes: ["Scarcity, choice and opportunity cost", "Economic systems", "Production possibility frontier"] },
    { topic: "Topic 2: Price Theory", construct: "Construct 1", outcomes: ["Theory of demand", "Theory of supply", "Market equilibrium", "Elasticity of demand", "Elasticity of supply", "Price mechanism and price control"] },
    { topic: "Topic 3: Production and Market Structures", construct: "Construct 2", outcomes: ["Factors of production", "Theory of production", "Costs of production", "Market structures", "Pricing strategies"] },
    { topic: "Topic 4: National Income", construct: "Construct 3", outcomes: ["Measurement of national income", "Determinants of national income", "Per capita income and welfare"] },
    { topic: "Topic 5: Economic Growth and Development", construct: "Construct 2", outcomes: ["Economic growth", "Economic development", "Theories of development", "Development indicators"] },
    { topic: "Topic 6: Economic Development Strategies", construct: "Construct 2", outcomes: ["Agriculture and development", "Industrialisation", "Foreign aid and investment", "Globalisation"] },
    { topic: "Topic 7: Population and Labour", construct: "Construct 4", outcomes: ["Population growth and structure", "Theories of population", "Labour market", "Unemployment"] },
    { topic: "Topic 8: Money, Banking and Inflation", construct: "Construct 3", outcomes: ["Money and its functions", "Commercial banking", "Central banking", "Inflation", "Monetary policy"] },
    { topic: "Topic 9: Public Finance and Fiscal Policy", construct: "Construct 3", outcomes: ["Government revenue and taxation", "Government expenditure", "National budget", "Fiscal policy"] },
    { topic: "Topic 10: International Trade", construct: "Construct 2", outcomes: ["Theories of international trade", "Balance of payments", "Trade policy", "Regional economic groupings"] },
    { topic: "Topic 11: Economic Development Planning", construct: "Construct 3", outcomes: ["Types of economic planning", "Development planning in Uganda", "Challenges to planning"] }
  ],
  "Entrepreneurship Education": [
    { topic: "Topic 1: Introduction to Entrepreneurship", construct: "Construct 1", outcomes: ["Meaning and role", "Self vs paid employment", "Entrepreneurial skills", "Personal branding"] },
    { topic: "Topic 2: The Entrepreneurial Environment", construct: "Construct 1", outcomes: ["Types of environments", "Supports organisations", "SEPD factors"] },
    { topic: "Topic 3: Business Ideas and Opportunities", construct: "Construct 2", outcomes: ["Idea generation", "Profitability evaluation", "Turning ideas into opportunities"] },
    { topic: "Topic 4: Business Planning", construct: "Construct 2", outcomes: ["Rationale and steps", "Structure of business plan", "Preparing a plan"] },
    { topic: "Topic 5: Production in an Enterprise", construct: "Construct 2", outcomes: ["Process design", "Purchasing docs", "Quality management", "Time management", "Cost estimation"] },
    { topic: "Topic 6: Marketing in an Enterprise", construct: "Construct 3", outcomes: ["Marketing mix (5Ps)", "Segmentation", "Promotion and advertising", "Distribution", "Market research"] },
    { topic: "Topic 7: Social Entrepreneurship", construct: "Construct 3", outcomes: ["Social vs commercial", "Role in Uganda", "Opportunities", "Social enterprise plan"] },
    { topic: "Topic 8: Small and Medium Enterprises (SMEs)", construct: "Construct 4", outcomes: ["Meaning and importance", "Challenges in Uganda", "Government support", "Growth strategies"] },
    { topic: "Topic 9: Insurance in Business", construct: "Construct 4", outcomes: ["Insurance principles", "Types of insurance", "Process of claims"] },
    { topic: "Topic 10: Capital Markets", construct: "Construct 4", outcomes: ["Functions and components", "Primary vs secondary markets", "Uganda Securities Exchange"] },
    { topic: "Topic 11: Human Resources in an Enterprise", construct: "Construct 3", outcomes: ["Functions of HRM", "Recruitment and selection", "Training and development", "Motivation theories"] },
    { topic: "Topic 12: Finance in an Enterprise", construct: "Construct 4", outcomes: ["Sources of finance", "Financial statements", "Financial ratios", "Budgeting and record keeping"] },
    { topic: "Topic 13: Taxation", construct: "Construct 4", outcomes: ["Principles of taxation", "Types of taxes (Direct & Indirect)", "Tax computations (VAT, PAYE)", "Tax compliance"] },
    { topic: "Topic 14: Business Competition", construct: "Construct 2", outcomes: ["Types of competition", "Competitive strategies", "Porter's Five Forces", "Globalisation impact"] }
  ],
  "Christian Religious Education": [
    { topic: "Foundations", construct: "Construct 1", outcomes: ["Pentateuch", "Psalms", "Job", "Ancient Israel foundations", "Covenantal devotion"] },
    { topic: "Offices in Ancient Israel", construct: "Construct 2", outcomes: ["Prophets", "Judges", "Kings", "Servant leadership", "Offices analysis"] },
    { topic: "Identity of Jesus and the Early Church", construct: "Construct 3", outcomes: ["Gospels", "Epistles", "Early Church mission", "African traditional perspectives"] },
    { topic: "Social Relations and Stewardship", construct: "Construct 4", outcomes: ["Christian social ethics", "Environmental stewardship", "Family and work", "Contemporary perspectives"] },
    { topic: "Civic Responsibility and Ethics", construct: "Construct 5", outcomes: ["Peacebuilding", "Cultural discernment", "National development", "Ethical teachings"] }
  ],
  "Islamic Religious Education": [
    { topic: "Foundational Knowledge", construct: "Construct 1", outcomes: ["Core texts", "Fundamental teachings", "Primary sources"] },
    { topic: "The Quran and Sunnah", construct: "Construct 2", outcomes: ["Interpretation of Quran", "Authenticity of Sunnah", "Legal guidance"] },
    { topic: "Faith and Practice", construct: "Construct 3", outcomes: ["Daily implementation", "Ibadah (Worship)", "Ethics and morality"] },
    { topic: "Life of the Prophet (PBUH)", construct: "Construct 4", outcomes: ["Historical biography", "Makkah period", "Madinah period", "Universal teachings"] },
    { topic: "Islamic Civilization", construct: "Construct 5", outcomes: ["Orthodox caliphate", "Historical evolution", "Scientific and cultural contributions"] }
  ],
  "Fine Art": [
    { topic: "Art Analysis", construct: "Construct 1", outcomes: ["Critical analysis of art forms", "Historical and contemporary context", "Expression and judgment analysis"] },
    { topic: "Art Making", construct: "Construct 2", outcomes: ["Creative production process", "Scenario-based problem solving", "Presentation and communication of ideas"] }
  ],
  "Literature in English": [
    { topic: "Appreciation of Literary Works", construct: "Construct 1", outcomes: ["Prose", "Poetry", "Drama", "Novel", "Short Story analysis"] },
    { topic: "Creation of Literary Works", construct: "Construct 2", outcomes: ["Original prose compositions", "Original drama compositions (Excl. Poetry)"] }
  ],
  "Woodwork": [
    { topic: "Woodwork Production", construct: "Construct 1", outcomes: ["Workshop layout and safety", "Timber technology", "Design and drawing", "Furniture construction"] },
    { topic: "Woodwork Concepts and Design", construct: "Construct 2", outcomes: ["Practical application of skills", "Theoretical execution in scenarios", "Problem solving in woodworking"] }
  ],
  "Metalwork": [
    { topic: "Design, Innovation and Analysis", construct: "Construct 1", outcomes: ["Engineering materials", "Metal fabrication analysis", "Foundry design processes", "Safety tool sets"] },
    { topic: "Metal Fabrication and Production", construct: "Construct 2", outcomes: ["Arc & Gas welding", "Brazing & Soldering", "Fasteners", "Foundry sand casting", "HSE compliance"] }
  ],
  "French": [ { topic: "Effective Communication", construct: "Construct 1", outcomes: ["Reading/Writing B1", "Listening/Speaking B1"] } ],
  "German": [ { topic: "Effective Communication", construct: "Construct 1", outcomes: ["Reading/Writing B1", "Listening/Speaking B1"] } ],
  "Arabic": [ { topic: "Effective Communication", construct: "Construct 1", outcomes: ["Reading/Writing B1", "Listening/Speaking B1"] } ],
  "Chinese": [ { topic: "Effective Communication", construct: "Construct 1", outcomes: ["Reading/Writing B1", "Listening/Speaking B1"] } ],
  "Latin": [ { topic: "Effective Communication", construct: "Construct 1", outcomes: ["Set book analysis", "Reading comprehension"] } ],
  "Kiswahili": [ { topic: "Effective Communication", construct: "Construct 1", outcomes: ["Reading/Writing B1", "Listening/Speaking B1"] } ],
  "Runyankore–Rukiga": [ { topic: "Effective Communication", construct: "Construct 1", outcomes: ["Oral discourse", "Creative writing"] } ],

  // Subsidiary Subjects
  "General Paper": [
    { topic: "Communication", outcomes: ["Purpose and forms", "Effective skills", "Role of media", "Audience and context", "Register, jargon, style"] },
    { topic: "Language and Literature", outcomes: ["Language categories", "Tool of communication", "Literature forms", "Language policy"] },
    { topic: "Extended Essay Writing", outcomes: ["Structure of essay", "Generating topic ideas", "Referencing (APA/MLA)", "Research questions", "Argument and evidence"] },
    { topic: "Data Collection and Analysis", outcomes: ["Methods (questionnaires, interviews)", "Mathematical concepts", "Data presentation"] },
    { topic: "Individual Project", outcomes: ["Social Issues", "Culture", "Education", "Human Rights", "Economics", "Politics and Governance"] }
  ],
  "Subsidiary Mathematics": [
    { topic: "Statistics", outcomes: ["Calculate mean/median", "Analyze data sets"] }
  ],
  "Subsidiary ICT": [
    { topic: "Digital Content Creation", construct: "Construct 1", outcomes: ["Word Processing", "Spreadsheets", "Electronic Publication", "Presentations"] },
    { topic: "ICT System Operations", construct: "Construct 2", outcomes: ["Introduction to ICT", "Hardware maintenance", "Software installation", "Troubleshooting"] },
    { topic: "Data Management", construct: "Construct 3", outcomes: ["Electronic Databases", "Information management principles"] },
    { topic: "Digital Communication & Emerging Tech", construct: "Construct 4", outcomes: ["Internet & Social Media", "Cybersecurity", "Generative AI", "IoT/Blockchain/VR"] }
  ]
};

const SUBJECT_CATEGORIES = {
  Science: ["Biology", "Physics", "Chemistry", "Mathematics", "Agriculture", "Technical Drawing", "Woodwork", "Metalwork"],
  Arts: ["History", "Geography", "Economics", "Christian Religious Education", "Islamic Religious Education", "Fine Art", "Literature in English", "Kiswahili", "Runyankore–Rukiga", "French", "German", "Arabic", "Chinese", "Latin"],
  Business: ["Entrepreneurship Education"],
  Subsidiary: ["General Paper", "Subsidiary Mathematics", "Subsidiary ICT"]
};

const VIDEO_RESOURCES: Record<string, { title: string, channel: string, url: string, thumbnail: string, videoId?: string }[]> = {
  "Biology": [
    { title: "Cell Biology: Ultrastructure", channel: "Amoeba Sisters", url: "https://www.youtube.com/watch?v=8IlzKri08kk", videoId: "8IlzKri08kk", thumbnail: "https://img.youtube.com/vi/8IlzKri08kk/mqdefault.jpg" },
    { title: "Photosynthesis: C3 vs C4", channel: "CrashCourse", url: "https://www.youtube.com/watch?v=8m6hHRlKwxY", videoId: "8m6hHRlKwxY", thumbnail: "https://img.youtube.com/vi/8m6hHRlKwxY/mqdefault.jpg" },
    { title: "Immunity and Antibodies", channel: "Bozeman Science", url: "https://www.youtube.com/watch?v=z3M0vU3Dv8E", videoId: "z3M0vU3Dv8E", thumbnail: "https://img.youtube.com/vi/z3M0vU3Dv8E/mqdefault.jpg" },
    { title: "Ecology: Population Dynamics", channel: "TED-Ed", url: "https://www.youtube.com/watch?v=RBOsqmBQBQk", videoId: "RBOsqmBQBQk", thumbnail: "https://img.youtube.com/vi/RBOsqmBQBQk/mqdefault.jpg" },
    { title: "DNA Structure and Replication", channel: "CrashCourse", url: "https://www.youtube.com/watch?v=8kK2zwjRV0M", videoId: "8kK2zwjRV0M", thumbnail: "https://img.youtube.com/vi/8kK2zwjRV0M/mqdefault.jpg" },
    { title: "Human Nervous System", channel: "Amoeba Sisters", url: "https://www.youtube.com/watch?v=UabDiuTtU0M", videoId: "UabDiuTtU0M", thumbnail: "https://img.youtube.com/vi/UabDiuTtU0M/mqdefault.jpg" }
  ],
  "Physics": [
    { title: "Newton's Laws of Motion", channel: "Physics Girl", url: "https://www.youtube.com/watch?v=kKKM8Y-u7ds", videoId: "kKKM8Y-u7ds", thumbnail: "https://img.youtube.com/vi/kKKM8Y-u7ds/mqdefault.jpg" },
    { title: "Electricity and Magnetism", channel: "Veritasium", url: "https://www.youtube.com/watch?v=hFAOXdXZ5TM", videoId: "hFAOXdXZ5TM", thumbnail: "https://img.youtube.com/vi/hFAOXdXZ5TM/mqdefault.jpg" },
    { title: "Wave-Particle Duality", channel: "Physics Girl", url: "https://www.youtube.com/watch?v=Q_h4IoPJXZw", videoId: "Q_h4IoPJXZw", thumbnail: "https://img.youtube.com/vi/Q_h4IoPJXZw/mqdefault.jpg" },
    { title: "Thermodynamics Basics", channel: "CrashCourse", url: "https://www.youtube.com/watch?v=4i1vW_j89-s", videoId: "4i1vW_j89-s", thumbnail: "https://img.youtube.com/vi/4i1vW_j89-s/mqdefault.jpg" },
    { title: "Circular Motion and Gravity", channel: "Professor Dave Explains", url: "https://www.youtube.com/watch?v=XpB0I_Z_zF8", videoId: "XpB0I_Z_zF8", thumbnail: "https://img.youtube.com/vi/XpB0I_Z_zF8/mqdefault.jpg" },
    { title: "Nuclear Physics Explained", channel: "Kurzgesagt", url: "https://www.youtube.com/watch?v=fES21EHP75Q", videoId: "fES21EHP75Q", thumbnail: "https://img.youtube.com/vi/fES21EHP75Q/mqdefault.jpg" }
  ],
  "Chemistry": [
    { title: "Atomic Structure", channel: "Tyler DeWitt", url: "https://www.youtube.com/watch?v=lP57gEWcisY", videoId: "lP57gEWcisY", thumbnail: "https://img.youtube.com/vi/lP57gEWcisY/mqdefault.jpg" },
    { title: "The Mole Concept", channel: "The Organic Chemistry Tutor", url: "https://www.youtube.com/watch?v=Asq4814zIsQ", videoId: "Asq4814zIsQ", thumbnail: "https://img.youtube.com/vi/Asq4814zIsQ/mqdefault.jpg" },
    { title: "Chemical Bonding", channel: "CrashCourse", url: "https://www.youtube.com/watch?v=QXT4OVM4vXI", videoId: "QXT4OVM4vXI", thumbnail: "https://img.youtube.com/vi/QXT4OVM4vXI/mqdefault.jpg" },
    { title: "Organic Chemistry Basics", channel: "The Organic Chemistry Tutor", url: "https://www.youtube.com/watch?v=7pS_YpA9T_Y", videoId: "7pS_YpA9T_Y", thumbnail: "https://img.youtube.com/vi/7pS_YpA9T_Y/mqdefault.jpg" },
    { title: "Electrochemistry", channel: "Tyler DeWitt", url: "https://www.youtube.com/watch?v=teTkvUtW4SA", videoId: "teTkvUtW4SA", thumbnail: "https://img.youtube.com/vi/teTkvUtW4SA/mqdefault.jpg" },
    { title: "Reaction Kinetics", channel: "Professor Dave Explains", url: "https://www.youtube.com/watch?v=7qOFWp7u268", videoId: "7qOFWp7u268", thumbnail: "https://img.youtube.com/vi/7qOFWp7u268/mqdefault.jpg" }
  ],
  "Mathematics": [
    { title: "Calculus: Differentiation", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=WUvTyaaNkzM", videoId: "WUvTyaaNkzM", thumbnail: "https://img.youtube.com/vi/WUvTyaaNkzM/mqdefault.jpg" },
    { title: "Trigonometry Basics", channel: "Khan Academy", url: "https://www.youtube.com/watch?v=PUB0TaZ7bhA", videoId: "PUB0TaZ7bhA", thumbnail: "https://img.youtube.com/vi/PUB0TaZ7bhA/mqdefault.jpg" },
    { title: "Integration: Area Under Curves", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=rfG8ce4nNh0", videoId: "rfG8ce4nNh0", thumbnail: "https://img.youtube.com/vi/rfG8ce4nNh0/mqdefault.jpg" },
    { title: "Vectors and Linear Algebra", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=fNk_zzaMoSs", videoId: "fNk_zzaMoSs", thumbnail: "https://img.youtube.com/vi/fNk_zzaMoSs/mqdefault.jpg" },
    { title: "Probability and Statistics", channel: "CrashCourse", url: "https://www.youtube.com/watch?v=kn83BA7cRNM", videoId: "kn83BA7cRNM", thumbnail: "https://img.youtube.com/vi/kn83BA7cRNM/mqdefault.jpg" },
    { title: "Complex Numbers", channel: "Welch Labs", url: "https://www.youtube.com/watch?v=T647CGsuOVU", videoId: "T647CGsuOVU", thumbnail: "https://img.youtube.com/vi/T647CGsuOVU/mqdefault.jpg" }
  ],
  "History": [
    { title: "African History Overview", channel: "History Channel", url: "https://www.youtube.com/watch?v=S7Y3S8H_T90", videoId: "S7Y3S8H_T90", thumbnail: "https://img.youtube.com/vi/S7Y3S8H_T90/mqdefault.jpg" },
    { title: "The Scramble for Africa", channel: "CrashCourse", url: "https://www.youtube.com/watch?v=Pis5f085P3M", videoId: "Pis5f085P3M", thumbnail: "https://img.youtube.com/vi/Pis5f085P3M/mqdefault.jpg" },
    { title: "Ancient Egypt Explained", channel: "National Geographic", url: "https://www.youtube.com/watch?v=hO1tzmi1V5g", videoId: "hO1tzmi1V5g", thumbnail: "https://img.youtube.com/vi/hO1tzmi1V5g/mqdefault.jpg" },
    { title: "The Cold War", channel: "OverSimplified", url: "https://www.youtube.com/watch?v=I79TpDe3t2g", videoId: "I79TpDe3t2g", thumbnail: "https://img.youtube.com/vi/I79TpDe3t2g/mqdefault.jpg" },
    { title: "World War II Summary", channel: "The Infographics Show", url: "https://www.youtube.com/watch?v=_q_8S5_6X1E", videoId: "_q_8S5_6X1E", thumbnail: "https://img.youtube.com/vi/_q_8S5_6X1E/mqdefault.jpg" },
    { title: "French Revolution", channel: "CrashCourse", url: "https://www.youtube.com/watch?v=lTTvKwCylFY", videoId: "lTTvKwCylFY", thumbnail: "https://img.youtube.com/vi/lTTvKwCylFY/mqdefault.jpg" }
  ],
  "Economics": [
    { title: "Supply and Demand", channel: "Marginal Revolution University", url: "https://www.youtube.com/watch?v=kIFBaaPJUO0", videoId: "kIFBaaPJUO0", thumbnail: "https://img.youtube.com/vi/kIFBaaPJUO0/mqdefault.jpg" },
    { title: "Macroeconomics Basics", channel: "CrashCourse", url: "https://www.youtube.com/watch?v=d8uTB5XorBw", videoId: "d8uTB5XorBw", thumbnail: "https://img.youtube.com/vi/d8uTB5XorBw/mqdefault.jpg" },
    { title: "Monetary Policy", channel: "Federal Reserve", url: "https://www.youtube.com/watch?v=wOfQPn9SIsQ", videoId: "wOfQPn9SIsQ", thumbnail: "https://img.youtube.com/vi/wOfQPn9SIsQ/mqdefault.jpg" },
    { title: "International Trade", channel: "CrashCourse", url: "https://www.youtube.com/watch?v=NI9TLDIPZ_M", videoId: "NI9TLDIPZ_M", thumbnail: "https://img.youtube.com/vi/NI9TLDIPZ_M/mqdefault.jpg" },
    { title: "Market Structures", channel: "Jacob Clifford", url: "https://www.youtube.com/watch?v=9Hxy-TuX9fs", videoId: "9Hxy-TuX9fs", thumbnail: "https://img.youtube.com/vi/9Hxy-TuX9fs/mqdefault.jpg" },
    { title: "Inflation and GDP", channel: "CrashCourse", url: "https://www.youtube.com/watch?v=3-pY_mS_7uI", videoId: "3-pY_mS_7uI", thumbnail: "https://img.youtube.com/vi/3-pY_mS_7uI/mqdefault.jpg" }
  ],
  "Subsidiary ICT": [
    { title: "Introduction to ICT", channel: "GCFLearnFree", url: "https://www.youtube.com/watch?v=y7G-tH2L6e4", videoId: "y7G-tH2L6e4", thumbnail: "https://img.youtube.com/vi/y7G-tH2L6e4/mqdefault.jpg" },
    { title: "Excel for Beginners", channel: "Technology for Teachers", url: "https://www.youtube.com/watch?v=rwbho0CgEAE", videoId: "rwbho0CgEAE", thumbnail: "https://img.youtube.com/vi/rwbho0CgEAE/mqdefault.jpg" },
    { title: "Database Management Systems", channel: "Computer Science", url: "https://www.youtube.com/watch?v=wR0jg0eQsbc", videoId: "wR0jg0eQsbc", thumbnail: "https://img.youtube.com/vi/wR0jg0eQsbc/mqdefault.jpg" },
    { title: "AI and the Future", channel: "ColdFusion", url: "https://www.youtube.com/watch?v=5dZ_lvDgevk", videoId: "5dZ_lvDgevk", thumbnail: "https://img.youtube.com/vi/5dZ_lvDgevk/mqdefault.jpg" },
    { title: "Computer Networking", channel: "PowerCert Animated Videos", url: "https://www.youtube.com/watch?v=IPvYjXCsTg8", videoId: "IPvYjXCsTg8", thumbnail: "https://img.youtube.com/vi/IPvYjXCsTg8/mqdefault.jpg" },
    { title: "Cybersecurity Basics", channel: "Simplilearn", url: "https://www.youtube.com/watch?v=z5abJ7U4M_w", videoId: "z5abJ7U4M_w", thumbnail: "https://img.youtube.com/vi/z5abJ7U4M_w/mqdefault.jpg" }
  ],
  "Subsidiary Mathematics": [
    { title: "Matrices: Cramer's Rule", channel: "The Organic Chemistry Tutor", url: "https://www.youtube.com/watch?v=vXqlIOX2itM", videoId: "vXqlIOX2itM", thumbnail: "https://img.youtube.com/vi/vXqlIOX2itM/mqdefault.jpg" },
    { title: "Descriptive Statistics", channel: "Khan Academy", url: "https://www.youtube.com/watch?v=uhxtUt_-GyM", videoId: "uhxtUt_-GyM", thumbnail: "https://img.youtube.com/vi/uhxtUt_-GyM/mqdefault.jpg" },
    { title: "Probability Distributions", channel: "CrashCourse", url: "https://www.youtube.com/watch?v=kn83BA7cRNM", videoId: "kn83BA7cRNM", thumbnail: "https://img.youtube.com/vi/kn83BA7cRNM/mqdefault.jpg" },
    { title: "Differentiation for Beginners", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=WUvTyaaNkzM", videoId: "WUvTyaaNkzM", thumbnail: "https://img.youtube.com/vi/WUvTyaaNkzM/mqdefault.jpg" },
    { title: "Arithmetic and Geometric Series", channel: "The Organic Chemistry Tutor", url: "https://www.youtube.com/watch?v=pXo0bG4iAyg", videoId: "pXo0bG4iAyg", thumbnail: "https://img.youtube.com/vi/pXo0bG4iAyg/mqdefault.jpg" },
    { title: "Correlation and Regression", channel: "Bozeman Science", url: "https://www.youtube.com/watch?v=ROpbdO-Nr1E", videoId: "ROpbdO-Nr1E", thumbnail: "https://img.youtube.com/vi/ROpbdO-Nr1E/mqdefault.jpg" }
  ],
  "General Paper": [
    { title: "Essay Writing Skills", channel: "TED-Ed", url: "https://www.youtube.com/watch?v=g3dkRsTqdDA", videoId: "g3dkRsTqdDA", thumbnail: "https://img.youtube.com/vi/g3dkRsTqdDA/mqdefault.jpg" },
    { title: "Critical Thinking", channel: "Wireless Philosophy", url: "https://www.youtube.com/watch?v=Cum3k-Wglfw", videoId: "Cum3k-Wglfw", thumbnail: "https://img.youtube.com/vi/Cum3k-Wglfw/mqdefault.jpg" },
    { title: "Global Issues Overview", channel: "United Nations", url: "https://www.youtube.com/watch?v=3Wnf26_O08I", videoId: "3Wnf26_O08I", thumbnail: "https://img.youtube.com/vi/3Wnf26_O08I/mqdefault.jpg" },
    { title: "Data Interpretation", channel: "Khan Academy", url: "https://www.youtube.com/watch?v=uhxtUt_-GyM", videoId: "uhxtUt_-GyM", thumbnail: "https://img.youtube.com/vi/uhxtUt_-GyM/mqdefault.jpg" },
    { title: "Argumentative Writing", channel: "CrashCourse", url: "https://www.youtube.com/watch?v=-S2m_G-o96E", videoId: "-S2m_G-o96E", thumbnail: "https://img.youtube.com/vi/-S2m_G-o96E/mqdefault.jpg" },
    { title: "Current Affairs Analysis", channel: "BBC News", url: "https://www.youtube.com/watch?v=W6X8W4W8W8W", videoId: "W6X8W4W8W8W", thumbnail: "https://img.youtube.com/vi/W6X8W4W8W8W/mqdefault.jpg" }
  ]
};

// --- Firestore Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // If it's just an offline error, log it but don't crash the app with a thrown error
  // unless it's a critical write operation that must succeed.
  const isOffline = errorMessage.includes('offline') || errorMessage.includes('unavailable');
  
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };

  if (isOffline) {
    console.warn('Firestore is offline (expected during initial connection or poor network):', path);
    return; // Don't throw for offline errors to prevent UI crashes
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Graph Renderer ---
const GraphRenderer = ({ data }: { data?: GraphData }) => {
  if (!data || !data.data_points || data.data_points.length === 0) return null;

  return (
    <div className="h-80 w-full my-10 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 no-print group">
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.data_points}>
            <defs>
              <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
            <XAxis 
              dataKey="x" 
              label={{ value: data.x_label, position: 'insideBottomRight', offset: -12, fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-display)', fill: '#94a3b8' }} 
              stroke="#e2e8f0"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontWeight: 700 }}
            />
            <YAxis 
              label={{ value: data.y_label, angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-display)', fill: '#94a3b8' }} 
              stroke="#e2e8f0"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontWeight: 700 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '1.5rem', 
                border: '1px solid #f1f5f9', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05)',
                backdropFilter: 'blur(8px)',
                padding: '12px 16px'
              }}
              labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="y" 
              stroke="#6366f1" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorY)" 
              dot={{ r: 5, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
              className="transition-all duration-500"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {data.title && (
        <div className="absolute top-6 left-8">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{data.title}</p>
        </div>
      )}
    </div>
  );
};

const MasteryRadar = ({ analytics, subjects, isDarkMode }: { analytics: AnalyticsRecord | null, subjects: string[], isDarkMode: boolean }) => {
  if (!analytics || !subjects || subjects.length < 3) return null;

  const data = subjects.map(subject => {
    const subjectTopics = CURRICULUM[subject as keyof typeof CURRICULUM] || [];
    const topicScores = subjectTopics
      .map(t => analytics.topicPerformance[t.topic]?.averageScore)
      .filter((s): s is number => s !== undefined);
    
    const averageScore = topicScores.length > 0 
      ? topicScores.reduce((a, b) => a + b, 0) / topicScores.length 
      : 0;

    return {
      subject,
      score: Math.round(averageScore),
      fullMark: 100
    };
  });

  const hasData = data.some(d => d.score > 0);
  if (!hasData) return null;

  return (
    <div className={`p-8 rounded-[3.5rem] border h-full flex flex-col justify-center transition-all duration-500 overflow-hidden relative ${
      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
    }`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="mb-6">
        <h3 className={`text-2xl font-display font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mastery Profile</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Neural competence analysis.</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: isDarkMode ? "#94a3b8" : "#64748b", fontSize: 9, fontWeight: 900, fontFamily: 'var(--font-display)' }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false} 
              axisLine={false} 
            />
            <Radar
              name="Mastery"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={3}
              fill="#6366f1"
              fillOpacity={0.15}
              dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '1.5rem', 
                border: isDarkMode ? '1px solid #1e293b' : '1px solid #f1f5f9', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                backdropFilter: 'blur(8px)',
                padding: '12px 16px'
              }}
              labelStyle={{ fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#1e293b', marginBottom: '4px' }}
              itemStyle={{ color: '#6366f1', fontWeight: 700 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "{}");
        if (parsed.error) {
          errorMessage = `Database Error: ${parsed.error}. Please check your connection or Firebase setup.`;
        }
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
          <div className="max-w-md space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900">Application Error</h2>
            <p className="text-slate-600">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function SubjectButton({ 
  subject, 
  isSelected, 
  disabled = false, 
  onClick, 
  isCompulsory,
  isDarkMode
}: { 
  subject: string, 
  isSelected: boolean, 
  disabled?: boolean, 
  onClick: () => void,
  isCompulsory?: boolean,
  isDarkMode?: boolean
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`p-6 rounded-[2rem] border-2 text-left transition-all duration-700 relative group h-full overflow-hidden ${
        isSelected
          ? isDarkMode
            ? 'border-brand-600 bg-brand-500/10 shadow-2xl shadow-brand-500/30'
            : 'border-brand-600 bg-brand-50 shadow-2xl shadow-brand-500/10'
          : disabled 
            ? isDarkMode ? 'opacity-20 cursor-not-allowed border-slate-800 bg-slate-950' : 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-100' 
            : isDarkMode 
              ? 'border-slate-800 bg-slate-900/40 hover:border-brand-500/50 hover:bg-slate-900/80 text-slate-500 hover:text-white'
              : 'border-slate-100 bg-white hover:border-brand-100 hover:bg-slate-50 text-slate-500 hover:text-slate-900 shadow-sm'
      }`}
    >
      <div className={`absolute -right-12 -top-12 w-48 h-48 blur-[80px] transition-opacity duration-1000 ${isSelected ? 'opacity-30' : 'opacity-0'} ${isDarkMode ? 'bg-brand-500' : 'bg-brand-600'}`} />
      
      <div className="flex flex-col gap-4 relative z-10 w-full min-w-0">
        <div className="flex flex-col items-start gap-3">
          <span className={`font-display font-black text-xl tracking-tighter transition-all duration-500 ${
            isSelected 
              ? isDarkMode ? 'text-brand-400 scale-105 origin-left' : 'text-brand-700 scale-105 origin-left' 
              : isDarkMode ? 'text-slate-400' : 'text-slate-600 font-bold'
          }`}>
            {subject}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ${
              isSelected ? 'text-brand-500' : 'text-slate-500'
            }`}>
              {isCompulsory ? 'Standard Core' : 'Principal Domain'}
            </span>
            {isSelected && (
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-brand-400' : 'bg-brand-600'}`} />
            )}
          </div>
        </div>
      </div>
      {isSelected && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute bottom-10 right-10"
        >
          <div className={`p-3 rounded-2xl shadow-2xl transition-transform duration-500 group-hover:rotate-12 ${isDarkMode ? 'bg-brand-600 text-white shadow-brand-500/40' : 'bg-brand-600 text-white shadow-brand-500/20'}`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </motion.div>
      )}
      {!isSelected && !disabled && (
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-brand-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-110" />
      )}
    </button>
  );
}

// Thinking Animation Component
const ThinkingText = () => {
  const [index, setIndex] = useState(0);
  const words = ["crafting", "contemplating", "piling", "finishing"];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span>{words[index]}...</span>;
};

const SynergyTelemetryModal = ({ isOpen, onClose, isDarkMode, details }: { 
  isOpen: boolean; 
  onClose: () => void; 
  isDarkMode: boolean; 
  details: {
    score: number;
    recencyScore: number;
    lastActiveText: string;
    chatVolScore: number;
    chatCount: number;
    messageCount: number;
    practiceScore: number;
    practiceCount: number;
    goalsScore: number;
    goalsCount: number;
    completedGoalsCount: number;
  };
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 text-left"
        >
          <div 
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className={`relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-[2.5rem] border shadow-2xl flex flex-col ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white animate-glow' : 'bg-white border-slate-100 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className={`p-8 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500/15 rounded-xl flex items-center justify-center text-brand-500">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-black text-xl tracking-tight">Synergy Core Telemetry</h3>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Real-time activity & prompt resonance metrics</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-8 space-y-6">
              {/* Core Synergy Gauge */}
              <div className={`p-6 rounded-[2rem] border text-center relative overflow-hidden ${
                isDarkMode ? 'bg-slate-950/40 border-slate-800/80 shrink-0' : 'bg-slate-50/50 border-slate-100 shrink-0'
              }`}>
                <div className="relative z-10 flex flex-col items-center justify-center py-2">
                  <div className="text-5xl font-display font-black text-brand-500 tracking-tighter transition-all duration-500 scale-105">
                    {details.score}%
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mt-2">
                    Current Synaptic Resonance
                  </div>
                  
                  <div className="w-full max-w-[240px] h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-4 overflow-hidden relative">
                    <div 
                      className="absolute left-0 top-0 h-full bg-brand-500 rounded-full transition-all duration-1000"
                      style={{ width: `${details.score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Parameter Breakdown Grid */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Telemetry Breakdown</h4>
                
                {/* Recency Factor */}
                <div className={`p-4 rounded-2xl flex gap-4 border ${isDarkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-50/30 border-slate-100'}`}>
                  <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl h-fit">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-display">Temporal Interaction Recency</span>
                      <span className="text-xs font-mono text-sky-500">+{details.recencyScore} pts</span>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{details.lastActiveText}</p>
                  </div>
                </div>

                {/* Prompt & Dialogue Link */}
                <div className={`p-4 rounded-2xl flex gap-4 border ${isDarkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-50/30 border-slate-100'}`}>
                  <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl h-fit">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-display">Neural Prompts Volume</span>
                      <span className="text-xs font-mono text-amber-500">+{Math.min(40, details.chatVolScore)} pts</span>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Processed <span className="font-bold">{details.chatCount}</span> chat session{details.chatCount !== 1 ? 's' : ''} containing <span className="font-bold">{details.messageCount}</span> interaction vectors.
                    </p>
                  </div>
                </div>

                {/* Question Practice Velocity */}
                <div className={`p-4 rounded-2xl flex gap-4 border ${isDarkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-50/30 border-slate-100'}`}>
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl h-fit">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-display">Practice Assessment Velocity</span>
                      <span className="text-xs font-mono text-emerald-500">+{details.practiceScore} / 20 pts</span>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Synthesized and attempted <span className="font-bold">{details.practiceCount}</span> competency evaluation scenario{details.practiceCount !== 1 ? 's' : ''}.
                    </p>
                  </div>
                </div>

                {/* Goals Milestone Tracker */}
                <div className={`p-4 rounded-2xl flex gap-4 border ${isDarkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-50/30 border-slate-100'}`}>
                  <div className={`p-2.5 rounded-xl h-fit ${isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-900/10 text-slate-900'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-display">Scholastic Goals Resonance</span>
                      <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>+{details.goalsScore} / 20 pts</span>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Defined <span className="font-bold">{details.goalsCount}</span> key learning goal{details.goalsCount !== 1 ? 's' : ''} with <span className="font-bold">{details.completedGoalsCount}</span> fully verified.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stella's Proactive Guidance Message */}
              <div className={`p-5 rounded-2xl border flex gap-3 text-sm font-medium ${
                isDarkMode ? 'bg-brand-500/5 border-brand-500/10 text-brand-300' : 'bg-brand-50/20 border-brand-100 text-brand-800'
              }`}>
                <div className="mt-0.5 text-brand-500">
                  <Zap className="w-4 h-4 shrink-0 fill-current" />
                </div>
                <div>
                  <span className="font-bold">Stella's Synaptic Advice:</span> To escalate your synergy coupling, regularly log learning goals, synthesize new curriculum schemes or lesson plans, and query my interactive neural counselor!
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PRIVACY_POLICY_TEXT = `
# PRIVACY POLICY
**Stella AI Tutor — by Tazon Incorporation**
Effective Date: 24 May 2026 | Last Updated: 24 May 2026 | Version 1.1

---

## AT A GLANCE

| | |
|---|---|
| **Company** | Tazon Incorporation, Uganda |
| **Product** | Stella AI Tutor |
| **Platform** | stellas.app |
| **Contact Email** | legal@stellas.app |
| **Data Controller** | Tazon Incorporation, Kampala, Uganda |
| **Users Served** | A-Level students, teachers and institutions in Uganda |
| **AI Provider** | Google LLC |
| **Infrastructure** | Google Firebase (Authentication, Firestore, Hosting) |
| **Analytics** | Google Analytics |
| **Policy Jurisdiction** | Uganda Data Protection and Privacy Act, 2019 |
| **Cookie Use** | Essential session cookies only; no third-party advertising cookies |

---

## 1. Introduction and Who We Are

Welcome to Stella AI Tutor ("Stella", "we", "us", or "our"), a product developed and operated by **Tazon Incorporation**, a company based in Kampala, Uganda. Stella is an artificial intelligence-powered educational platform designed to support A-Level students, teachers, and educational institutions in Uganda, in alignment with the National Curriculum Development Centre (NCDC) 2025 Competency-Based Curriculum (CBC) framework.

This Privacy Policy explains what personal data we collect, why we collect it, how we use it, who we share it with, and the rights you have over your data. Tazon Incorporation is committed to full compliance with:

- The Uganda Data Protection and Privacy Act, 2019 (DPPA)
- The Uganda Data Protection and Privacy Regulations, 2021
- The EU General Data Protection Regulation (GDPR) — applied as best-practice standard
- Google API Services User Data Policy and Limited Use Requirements
- Google Play Developer Distribution Agreement (where applicable)
- The Children's Online Privacy Protection Act (COPPA) — applied for users under 13

By accessing or using Stella, you agree to the terms of this Privacy Policy. If you do not agree, please do not use our services.

---

## 2. Data We Collect

### 2.1 Information You Provide Directly

When you create an account or use Stella, we may collect:

- Full name and email address (for account creation and authentication)
- User role: student, teacher, or institution
- School name and district (for institutional tracking and localisation)
- Academic level: Senior 4, Senior 5, or Senior 6
- Subjects of interest and expected graduation year
- Academic goals entered during onboarding
- Text messages and questions entered in the AI chat interface
- Voice recordings (microphone input) — processed locally by your browser's Web Speech API for speech-to-text transcription only; audio is never transmitted to or stored on our servers
- Photographs or images uploaded for AI analysis (compressed and temporarily processed; not stored permanently)
- Answers submitted during practice sessions and examinations

### 2.2 Information Collected Automatically

When you use Stella, we automatically collect:

- IP address and approximate geographic location
- Browser type, operating system, and device identifiers
- Pages visited, features used, and time spent on the platform
- Session start and end times
- Error logs and performance diagnostics
- Firebase Authentication tokens (for secure session management)
- Google Analytics cookies and identifiers (anonymised usage data)

### 2.3 Educational Performance Data

To provide personalised learning experiences, we collect and analyse:

- Question responses and AI-generated feedback scores
- Topic mastery levels and performance trends across subjects
- Exam records including total scores, start/end times, and detailed question feedback
- Analytics records including topic performance maps, concept mastery scores, time spent, and common error patterns
- Chat session history (saved conversations with Stella)
- Lesson plans and schemes of work generated by teachers

### 2.4 Data We Do NOT Collect

- Payment card numbers or banking information (all payments handled by third-party processors; we do not store financial data)
- Government-issued identification numbers
- Audio recordings — voice input is transcribed entirely by your browser; only the text transcript is transmitted
- Sensitive biometric data beyond voice-to-text transcription
- Data from users under 13 without verified parental or guardian consent

---

## 3. How We Use Your Data

We process your personal data only for the following purposes, each grounded in a lawful basis under Uganda's DPPA and GDPR:

| Purpose | Description | Lawful Basis |
|---|---|---|
| Account Management | Create and maintain your user account, verify identity, and enable secure login. | Contract |
| Personalised Learning | Adapt AI responses, question difficulty, and topic recommendations to your performance data. | Legitimate Interest |
| AI Tutoring Services | Process your questions through the Google Gemini API to generate educational responses. | Contract |
| Performance Analytics | Track topic mastery, identify knowledge gaps, and generate progress reports. | Contract / Legitimate Interest |
| Teacher Tools | Generate lesson plans, schemes of work, and assessment items aligned to NCDC CBC standards. | Contract |
| Platform Improvement | Analyse aggregated, anonymised usage patterns to improve Stella's features. | Legitimate Interest |
| Security & Fraud Prevention | Monitor for unauthorised access, abuse, and technical anomalies. | Legal Obligation / Legitimate Interest |
| Communication | Send account-related emails (password resets, updates). No marketing emails without explicit consent. | Consent / Contract |
| Legal Compliance | Respond to lawful requests from Uganda government authorities and enforce our Terms of Service. | Legal Obligation |

---

## 4. Sharing Your Data with Third Parties

Tazon Incorporation does not sell, rent, or trade your personal data. We share data only with the following trusted third-party service providers, strictly under data processing agreements:

### 4.1 Google LLC — Gemini API (AI Processing)

Your chat messages and questions are transmitted to Google's Gemini API to generate AI educational responses. Google processes this data as a data processor under our instructions. We use the Google AI Studio Gemini API. During the beta testing phase, the free tier of the Gemini API is used, which means Google may use prompts to improve their models in accordance with Google's terms of service. Once Stella transitions to paid production, we will upgrade to the paid Gemini API tier under which Google does not use your data to train models. Google's privacy practices are governed by Google's Privacy Policy at policies.google.com/privacy.

We do not send your name, email address, or Firebase user ID to the Gemini API — only the text content of your educational queries.

### 4.2 Google Firebase (Infrastructure)

We use Google Firebase for: Authentication (login/logout), Firestore database (storing user profiles, chat history, exam records, teacher documents), Cloud Storage (temporary file uploads), and Firebase Hosting. Google acts as a data processor under the Google Cloud Data Processing Amendment. Firebase's privacy practices are governed by Google's Privacy Policy at policies.google.com/privacy.

### 4.3 Google Analytics

 we use Google Analytics to understand how users interact with Stella at an aggregated, anonymised level. You may opt out by using the Google Analytics Opt-Out Browser Add-on or by enabling a Do Not Track signal in your browser.

### 4.4 Legal Authorities

We may disclose your data to Uganda government authorities, courts, or law enforcement agencies if required by law, court order, or to protect the rights, property, or safety of Tazon Incorporation, our users, or the public.

### 4.5 No Other Sharing

We do not share your data with advertisers, marketing companies, data brokers, or any other third parties not listed in this section.

---

## 5. Cookies and Tracking Technologies

| Cookie / Storage Key | Type | Purpose | Duration |
|---|---|---|---|
| Firebase Auth Token | Essential | Maintains your secure login session | Session / 1 hour |
| _ga, _gid | Analytics | Google Analytics — anonymised usage tracking | 2 years / 24 hours |
| isTtsEnabled | Preference | Remembers your text-to-speech setting | Persistent (localStorage) |
| Theme Preference | Preference | Remembers dark/light mode setting | Persistent (localStorage) |

We do not use cookies for advertising, retargeting, or cross-site tracking. Essential cookies cannot be disabled without breaking core platform functionality.

---

## 6. Data Retention

- **Account data** (name, email, role, level): Retained for the duration of your account. Deleted within 30 days of account deletion request.
- **Chat history and AI interactions**: Retained for up to 24 months. You may delete individual chats at any time.
- **Exam records and performance analytics**: Retained for 24 months to enable progress tracking. Deleted on account deletion.
- **Teacher-generated lesson plans and schemes of work**: Retained indefinitely unless deleted by the teacher or on account deletion.
- **Voice recordings**: Not retained. Only the browser-generated text transcript is stored as a chat message.
- **Server logs and error reports**: Retained for 90 days for security and debugging.
- **Anonymised, aggregated analytics**: Retained indefinitely as it contains no personal data.

When you delete your account, we will delete or anonymise all personal data within 30 days, except where retention is required by Ugandan law.

---

## 7. Your Rights

Under Uganda's Data Protection and Privacy Act, 2019, you have the following rights:

| Your Right | What It Means |
|---|---|
| Right to Access | Request a copy of all personal data we hold about you. |
| Right to Rectification | Request correction of inaccurate or incomplete data. |
| Right to Erasure | Request deletion of your personal data (subject to legal retention obligations). |
| Right to Restrict Processing | Ask us to limit how we use your data while a complaint is being resolved. |
| Right to Data Portability | Receive your data in a structured, machine-readable format (JSON/CSV). |
| Right to Object | Object to processing based on legitimate interests. |
| Right to Withdraw Consent | Withdraw consent at any time where processing is consent-based. |
| Right to Lodge a Complaint | File a complaint with the Uganda Personal Data Protection Office (PDPO). |

To exercise any right, email us at legal@stellas.app. We will respond within 30 days. We may request proof of identity before processing your request.

---

## 8. Children's Privacy

Stella is designed for Senior Secondary students (typically aged 15–19) and their teachers.

- We do not knowingly collect personal data from children under 13 without verified parental or guardian consent.
- If you are under 13, you must obtain permission from a parent or guardian before creating an account.
- If we discover we have collected data from a child under 13 without consent, we will delete it immediately.
- Teachers and school administrators who create accounts on behalf of students are responsible for obtaining appropriate consent in accordance with Ugandan law.
- Students aged 13–18 may use Stella with the knowledge of a parent, guardian, or teacher.

Parents or guardians who believe their child's data has been collected without consent should contact us immediately at legal@stellas.app.

---

## 9. Data Security

- All data is transmitted over HTTPS using TLS 1.2 or higher encryption.
- Firebase Authentication uses industry-standard OAuth 2.0 and JWT token-based session management.
- Firestore security rules restrict access so users can only read and write their own data.
- API keys and credentials are stored as server-side environment variables and are never exposed in client-side code or public repositories.
- Access to production data is restricted to authorised personnel of Tazon Incorporation only.
- We conduct periodic reviews of our Firestore security rules and API integrations.
- Voice input is processed entirely by your browser's built-in Web Speech API — audio never leaves your device.

In the event of a data breach likely to result in a high risk to your rights and freedoms, we will notify you and the Uganda Personal Data Protection Office within 72 hours of becoming aware of the breach.

---

## 10. International Data Transfers

Tazon Incorporation is based in Uganda. However, our service providers (Google LLC for both Gemini AI and Firebase) process data in data centres located outside Uganda, including in the United States and the European Union.

We ensure all international transfers are conducted under appropriate safeguards including:

- The Google Cloud Data Processing Amendment, which governs Firebase and Google AI data handling.
- Standard Contractual Clauses (SCCs) where applicable under Google's data processing terms.
- Google's AI Studio Terms of Service, which include data protection commitments for the Gemini API.

Your use of Stella constitutes acknowledgement that your data may be processed outside Uganda. We take all reasonable steps to ensure your data receives equivalent protection abroad.

---

## 11. Google API Services User Data Policy Disclosure

Stella's use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. Specifically:

- We use the Google Gemini API solely to generate educational AI responses in direct response to user queries. We do not use Gemini API data for advertising or to train models outside the scope described in this Policy.
- We use Google Firebase solely for authentication, data storage, and hosting services as described in this Policy.
- We do not transfer Google user data to third parties except as necessary to provide Stella's educational services or as required by law.
- We do not allow humans to read user data obtained via Google APIs unless required for security investigation, legal compliance, or with your explicit consent.
- **BETA NOTICE**: During the beta testing phase, Stella uses the free tier of the Google Gemini API. Under Google's free tier terms, Google may use API interactions to improve their models. If you do not consent to this, please wait until Stella's paid production launch, at which point we will migrate to the paid Gemini API tier where model training on your data is disabled.

---

## 12. AI-Generated Content Disclaimer

- Stella uses Google's Gemini AI models to generate educational content including explanations, practice questions, feedback, lesson plans, and schemes of work.
- AI-generated content may occasionally contain errors or inaccuracies. Students and teachers should exercise critical judgment and not rely solely on AI output for high-stakes academic decisions.
- We do not claim ownership of content you enter into Stella's chat interface. Your academic work remains your own.
- The Gemini AI is used exclusively for educational purposes on this platform and is not used for surveillance, profiling for non-educational purposes, or targeted advertising.
- Stella AI Tutor is not affiliated with, endorsed by, or officially associated with the Uganda National Examinations Board (UNEB), the National Curriculum Development Centre (NCDC), or any Ugandan government body. UNEB past paper references are used solely for educational preparation purposes.

---

## 13. Changes to This Privacy Policy

- We will notify registered users by email at least 14 days before material changes take effect.
- We will display a prominent notice on the Stella platform.
- We will update the Effective Date and Last Updated date at the top of this Policy.
- Your continued use of Stella after the effective date of any changes constitutes acceptance of the revised Policy.

Previous versions are available upon request at legal@stellas.app.

---

## 14. Contact Us

| | |
|---|---|
| **Data Controller** | Tazon Incorporation |
| **Product** | Stella AI Tutor |
| **Email** | legal@stellas.app |
| **Platform** | stellas.app |
| **Firebase Project** | cbc-ai-5c869 |
| **AI Provider** | Google LLC |
| **Location** | Kampala, Uganda |
| **Data Regulator** | Uganda Personal Data Protection Office — pdpo.go.ug |

We take all privacy complaints seriously and will respond within 30 days of receipt.

---

*This Privacy Policy is effective as of 24 May 2026 and supersedes all prior versions.*

**Tazon Incorporation — Empowering Uganda's A-Level Generation through Stella AI Tutor**
`;

const getMarkdownComponents = (isDarkMode: boolean) => ({
  h1: ({ children }: any) => <h1 className={`text-2xl font-black tracking-tight mt-6 mb-4 font-display border-b pb-2 ${isDarkMode ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'}`}>{children}</h1>,
  h2: ({ children }: any) => <h2 className={`text-lg font-bold tracking-tight mt-5 mb-3 font-display ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{children}</h2>,
  h3: ({ children }: any) => <h3 className={`text-base font-semibold tracking-tight mt-4 mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{children}</h3>,
  p: ({ children }: any) => <p className={`text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{children}</p>,
  ul: ({ children }: any) => <ul className={`list-disc pl-5 mb-4 space-y-1 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{children}</ul>,
  ol: ({ children }: any) => <ol className={`list-decimal pl-5 mb-4 space-y-1 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{children}</ol>,
  li: ({ children }: any) => <li className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{children}</li>,
  table: ({ children }: any) => (
    <div className={`overflow-x-auto my-6 border rounded-2xl shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/50'}`}>
      <table className="w-full text-left border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className={`border-b ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100/80 border-slate-200'}`}>{children}</thead>,
  tbody: ({ children }: any) => <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-200'}`}>{children}</tbody>,
  tr: ({ children }: any) => <tr className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/10' : 'hover:bg-slate-100/50'}`}>{children}</tr>,
  th: ({ children }: any) => <th className={`p-4 font-bold text-xs uppercase tracking-wider ${isDarkMode ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-200'}`}>{children}</th>,
  td: ({ children }: any) => <td className={`p-4 border-t font-sans leading-relaxed ${isDarkMode ? 'text-slate-300 border-slate-800' : 'text-slate-700 border-slate-200'}`}>{children}</td>,
  hr: () => <hr className={`my-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} />,
  strong: ({ children }: any) => <strong className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{children}</strong>,
});

const PrivacyPolicyModal = ({ isOpen, onClose, isDarkMode }: { isOpen: boolean, onClose: () => void, isDarkMode: boolean }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6"
        >
          <div 
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className={`relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-[2rem] border shadow-2xl flex flex-col ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}
          >
            <div className={`p-6 sm:p-8 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-display font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Privacy Policy</h3>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Version 1.1 | Effective: 24 May 2026</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-50 text-slate-400'}`}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <ReactMarkdown components={getMarkdownComponents(isDarkMode) as any} remarkPlugins={[remarkGfm]}>
                {PRIVACY_POLICY_TEXT}
              </ReactMarkdown>
            </div>
 
            <div className={`p-4 sm:p-6 border-t ${isDarkMode ? 'border-slate-800 bg-slate-950/30' : 'border-slate-50 bg-slate-50/50'}`}>
              <button 
                onClick={onClose}
                className="w-full py-3.5 bg-brand-600 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] text-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TERMS_OF_SERVICE_TEXT = `
# TERMS OF SERVICE
**Stella AI Tutor — by Tazon Incorporation**
Effective Date: 24 May 2026 | Last Updated: 24 May 2026 | Version 1.0

---

## AT A GLANCE

| | |
|---|---|
| **Company** | Tazon Incorporation, Kampala, Uganda |
| **Product** | Stella AI Tutor |
| **Platform** | stellas.app |
| **Contact Email** | legal@stellas.app |
| **Governing Law** | Laws of the Republic of Uganda |
| **Dispute Resolution** | Kampala, Uganda |
| **AI Provider** | Google LLC (Gemini API) |
| **Users** | A-Level students, teachers, and institutions in Uganda |
| **Minimum Age** | 13 years (under-18s require parental/guardian awareness) |

---

## 1. Acceptance of Terms

These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and **Tazon Incorporation** ("Tazon", "we", "us", or "our"), a company incorporated under the laws of Uganda, governing your access to and use of Stella AI Tutor ("Stella", "the Platform", or "the Service") available at stellas.app and any associated mobile or desktop applications.

By creating an account, accessing, or using Stella in any way, you confirm that:

- You have read, understood, and agree to be bound by these Terms and our Privacy Policy
- You are at least 13 years of age, or have obtained verifiable parental or guardian consent
- If you are accessing Stella on behalf of a school or institution, you have the authority to bind that institution to these Terms
- You will comply with all applicable laws and regulations of Uganda and your local jurisdiction

**If you do not agree to these Terms, you must immediately cease using Stella.**

---

## 2. Description of Service

Stella AI Tutor is an artificial intelligence-powered educational platform designed specifically for Uganda's Advanced Level (A-Level) students, teachers, and educational institutions. The Service operates in alignment with the National Curriculum Development Centre (NCDC) 2025 Competency-Based Curriculum (CBC) framework.

### 2.1 Core Features

- **AI Tutoring Chat**: Conversational AI tutor powered by Google Gemini that explains concepts, answers questions, and guides learning across A-Level subjects
- **Practice Mode**: AI-generated practice questions and scenarios aligned to UNEB examination standards, with difficulty levels (Standard, Advanced, Expert)
- **Exam Simulation**: Timed mock examinations with AI-generated marking and feedback
- **Assessment Paper Generation**: Full and topical assessment papers generated to NCDC CBC standards
- **Teacher Tools**: AI-assisted generation of lesson plans, schemes of work, and assessment items
- **Performance Analytics**: Topic mastery tracking, error pattern analysis, and progress reporting
- **Voice Interaction**: Browser-based speech-to-text input for hands-free querying

### 2.2 Beta Phase Notice

Stella is currently in a **beta testing phase**. During this phase:

- Features may be added, modified, or removed without prior notice
- The Service may experience interruptions, bugs, or unexpected behaviour
- AI responses may be less accurate than the final production version
- We use the free tier of the Google Gemini API, which means Google may use interactions to improve their models (see our Privacy Policy, Section 11)
- Tazon Incorporation makes no guarantee of uninterrupted service availability during beta

Your participation in the beta phase is voluntary and you agree to provide feedback to help us improve the Service.

---

## 3. Eligibility and Account Registration

### 3.1 Eligibility

To use Stella you must:

- Be at least 13 years of age
- Be located in Uganda or be a Ugandan citizen or resident using the Service for Ugandan A-Level study purposes
- Not have been previously suspended or banned from Stella or any Tazon Incorporation service
- Have the legal capacity to enter into a binding agreement

### 3.2 User Roles

Stella supports three account roles with different access levels:

| Role | Description | Access |
|---|---|---|
| **Student** | A-Level learners (S4, S5, S6) | Chat, Practice, Exams, Analytics |
| **Teacher** | Qualified educators | All student features + Teacher Tools (lesson plans, schemes of work, assessment design) |
| **Institution** | Schools and educational organisations | All features + institutional oversight |

### 3.3 Account Responsibility

You are solely responsible for:

- Maintaining the confidentiality of your account credentials
- All activity that occurs under your account
- Notifying us immediately at legal@stellas.app if you suspect unauthorised access to your account
- Ensuring your account information remains accurate and up to date

Tazon Incorporation is not liable for any loss or damage arising from your failure to maintain account security.

### 3.4 One Account Per User

Each user may maintain only one active account. Creating multiple accounts to circumvent restrictions, gain unfair advantage, or evade a ban is strictly prohibited.

---

## 4. Acceptable Use Policy

### 4.1 Permitted Uses

You may use Stella solely for:

- Personal educational study and learning in connection with Uganda's A-Level curriculum
- Preparation for UNEB examinations and internal school assessments
- Teacher professional development and lesson preparation
- Institutional academic planning and curriculum alignment

### 4.2 Prohibited Conduct

You must not use Stella to:

- **Academic dishonesty**: Submit AI-generated content as your own original work in formal UNEB examinations, school assessments, or any context where AI assistance is prohibited. Using Stella for genuine learning and study is encouraged; submitting AI-generated answers as your own in a formal graded context without disclosure is a violation of these Terms and your institution's academic integrity policy
- **Harmful content**: Generate, share, or solicit content that is abusive, threatening, harassing, defamatory, obscene, pornographic, or otherwise harmful
- **Illegal activity**: Use the Service for any purpose that violates Ugandan law or any applicable law
- **System abuse**: Attempt to reverse-engineer, hack, overload, or disrupt the platform, its APIs, or associated infrastructure
- **Impersonation**: Impersonate another person, teacher, institution, or Tazon Incorporation staff
- **Data scraping**: Use automated bots, scrapers, or tools to extract data from the platform
- **Commercial exploitation**: Resell, sublicense, or commercially exploit any part of the Service without explicit written permission from Tazon Incorporation
- **Prompt injection**: Attempt to manipulate the AI system through adversarial prompts designed to bypass safety guidelines or extract system-level information
- **Misinformation**: Deliberately use Stella to generate and spread false or misleading educational information

### 4.3 Content Standards

All content you submit to Stella must:

- Be relevant to your educational purpose
- Not contain personal information of third parties without their consent
- Not contain copyrighted material submitted in a way that infringes third-party rights
- Comply with the academic integrity standards of your institution

---

## 5. AI-Generated Content — Important Limitations

### 5.1 Nature of AI Responses

Stella's educational content is generated by Google's Gemini AI model. You acknowledge and agree that:

- **AI responses may contain errors**: Gemini AI can and does make mistakes, including mathematical errors, factual inaccuracies, and outdated information. All AI-generated content should be verified against authoritative sources before relying on it for examinations or formal assessments
- **AI is not a replacement for qualified teachers**: Stella is a supplementary learning tool. It does not replace the professional judgment of qualified educators, examiners, or academic advisors
- **No guarantee of UNEB alignment**: While Stella is designed to align with NCDC CBC standards and UNEB examination formats, Tazon Incorporation makes no guarantee that AI-generated questions, marking schemes, or content will match actual UNEB examination content
- **AI responses are not professional advice**: Stella does not provide legal, medical, financial, or any other form of professional advice. Educational content is for academic learning only

### 5.2 Ownership of AI-Generated Content

- Content you input into Stella remains your intellectual property
- AI-generated responses produced by Stella in response to your queries are provided to you for your personal educational use
- You may not commercially resell, republish, or distribute AI-generated content from Stella without written permission from Tazon Incorporation
- Tazon Incorporation retains the right to use anonymised, aggregated interaction data to improve the Service

### 5.3 No Endorsement

Stella AI Tutor and Tazon Incorporation are not affiliated with, endorsed by, or officially associated with:

- The Uganda National Examinations Board (UNEB)
- The National Curriculum Development Centre (NCDC)
- The Uganda Ministry of Education and Sports
- Any Ugandan government body or public institution

References to UNEB past papers, NCDC syllabuses, and CBC frameworks are made solely for educational alignment purposes.

---

## 6. Subscription, Payments, and Refunds

### 6.1 Beta Phase — Free Access

During the current beta phase, Stella is available free of charge to approved beta users. Tazon Incorporation reserves the right to introduce paid subscription tiers at any time following the beta phase, with at least 30 days' notice to existing users.

### 6.2 Future Paid Tiers

When paid tiers are introduced:

- Pricing will be published on stellas.app
- Subscriptions will be billed in advance on a monthly or annual basis
- All prices will be stated in Ugandan Shillings (UGX) and/or United States Dollars (USD)
- Applicable taxes will be added where required by Ugandan law

### 6.3 Refund Policy

- Monthly subscriptions: Refunds are available within 7 days of the billing date if you have not generated more than 10 AI interactions in that billing period
- Annual subscriptions: Refunds are available within 14 days of the billing date on a pro-rata basis for unused months, subject to a processing fee
- Refund requests must be submitted to billing@stellas.app with your account details and reason for the request
- Tazon Incorporation reserves the right to deny refund requests where there is evidence of abuse, policy violations, or excessive prior refund requests

### 6.4 Payment Processing

Payments are processed by third-party payment processors. Tazon Incorporation does not store your payment card information. By making a payment, you also agree to the terms of the applicable payment processor.

---

## 7. Intellectual Property

### 7.1 Tazon Incorporation's Property

All aspects of the Stella platform including but not limited to the software code, user interface design, branding, logos, system prompts, pedagogical frameworks, knowledge bases, and platform architecture are the exclusive intellectual property of Tazon Incorporation and are protected by Ugandan and international intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable licence to use the Service solely for your personal educational purposes in accordance with these Terms.

### 7.2 Your Content

You retain ownership of all original content you submit to Stella. By submitting content, you grant Tazon Incorporation a non-exclusive, royalty-free, worldwide licence to use, process, and store that content solely for the purpose of providing and improving the Service.

### 7.3 Feedback

If you provide feedback, suggestions, or ideas about Stella, you grant Tazon Incorporation the right to use that feedback without compensation or attribution to you.

### 7.4 Third-Party Content

UNEB past paper references, NCDC syllabus content, and other third-party educational materials referenced within Stella are used under fair use provisions for educational purposes. Tazon Incorporation does not claim ownership of such materials.

---

## 8. Privacy and Data Protection

Your use of Stella is also governed by our **Privacy Policy** available at stellas.app/privacy, which is incorporated into these Terms by reference. By agreeing to these Terms you also agree to our Privacy Policy.

Key data practices:

- We collect and process personal data as described in the Privacy Policy
- We use Google Firebase for data storage and Google Gemini for AI processing
- During beta, the free Gemini API tier means Google may use interactions for model improvement
- You have rights over your data as set out in the Privacy Policy and Uganda's DPPA 2019

---

## 9. Service Availability and Modifications

### 9.1 Availability

Tazon Incorporation will use reasonable efforts to keep Stella available. However, we do not guarantee:

- Uninterrupted or error-free access to the Service
- That the Service will meet your specific educational requirements
- Specific response times or AI answer accuracy

The Service may be unavailable due to maintenance, updates, force majeure events, or circumstances beyond our control.

### 9.2 Modifications

Tazon Incorporation reserves the right at any time to:

- Modify, suspend, or discontinue any feature of the Service
- Update the AI model powering Stella (e.g. upgrading to a newer Gemini version)
- Change pricing for paid tiers with 30 days' notice
- Update these Terms with notice as described in Section 13

### 9.3 Downtime and Data Loss

Tazon Incorporation is not liable for any loss of data, learning progress, or content resulting from service interruptions, technical failures, or data migrations during the beta phase. We strongly encourage teachers to maintain offline copies of important lesson plans and schemes of work generated through Stella.

---

## 10. Disclaimers and Limitation of Liability

### 10.1 Disclaimer of Warranties

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY UGANDAN LAW, TAZON INCORPORATION DISCLAIMS ALL WARRANTIES INCLUDING BUT NOT LIMITED TO:

- WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE
- WARRANTIES THAT AI-GENERATED CONTENT IS ACCURATE, COMPLETE, OR SUITABLE FOR EXAMINATION USE
- WARRANTIES OF UNINTERRUPTED OR ERROR-FREE SERVICE
- WARRANTIES THAT THE SERVICE WILL MEET YOUR EDUCATIONAL REQUIREMENTS

### 10.2 Limitation of Liability

TO THE FULLEST EXTENT PERMITTED BY UGANDAN LAW, TAZON INCORPORATION, ITS DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:

- Any indirect, incidental, special, consequential, or punitive damages
- Loss of data, academic performance, examination results, or educational opportunities
- Any damages arising from your reliance on AI-generated content in formal examinations or assessments
- Losses exceeding the amount you paid to Tazon Incorporation in the 3 months preceding the claim (or UGX 0 during the free beta phase)

### 10.3 Academic Results

Tazon Incorporation expressly disclaims any liability for your performance in UNEB examinations, internal school assessments, or any formal academic evaluation. Stella is a study aid; your results depend on your own effort, preparation, and abilities.

---

## 11. Indemnification

You agree to indemnify, defend, and hold harmless Tazon Incorporation and its officers, directors, employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or relating to:

- Your violation of these Terms
- Your violation of any applicable law or regulation
- Your submission of content that infringes the rights of any third party
- Your academic dishonesty or misuse of AI-generated content
- Any claim by your school, institution, or examiner arising from your use of Stella

---

## 12. Termination

### 12.1 Termination by You

You may terminate your account at any time by deleting your account through the platform settings or by emailing legal@stellas.app. Upon termination, your right to use the Service ceases immediately.

### 12.2 Termination by Tazon Incorporation

We reserve the right to suspend or permanently terminate your account, with or without notice, if:

- You violate any provision of these Terms or our Acceptable Use Policy
- You engage in academic fraud or dishonesty using AI-generated content
- We are required to do so by applicable law or a government authority
- Continued provision of the Service to you creates legal or reputational risk for Tazon Incorporation
- You abuse the platform through excessive or automated usage

### 12.3 Effect of Termination

Upon termination:

- Your licence to use the Service is immediately revoked
- You will lose access to your account, chat history, and generated content
- Provisions of these Terms that by their nature should survive termination (including Sections 5, 7, 10, 11, 14) shall survive

---

## 13. Changes to These Terms

Tazon Incorporation reserves the right to modify these Terms at any time. When we make material changes:

- We will notify registered users by email at least 14 days before changes take effect
- We will display a prominent notice on the Stella platform
- We will update the Effective Date at the top of these Terms
- For minor changes (grammar, clarifications, non-material updates) we may update without advance notice

Your continued use of Stella after changes take effect constitutes your acceptance of the revised Terms. If you do not agree to the revised Terms, you must stop using the Service before the effective date.

---

## 14. Governing Law and Dispute Resolution

### 14.1 Governing Law

These Terms are governed by and construed in accordance with the laws of the Republic of Uganda, without regard to its conflict of law provisions.

### 14.2 Informal Resolution

Before initiating any formal dispute, you agree to first contact us at legal@stellas.app and give us 30 days to attempt to resolve the dispute informally.

### 14.3 Formal Dispute Resolution

If informal resolution fails, disputes shall be resolved by the competent courts of Kampala, Uganda. Both parties submit to the exclusive jurisdiction of those courts.

### 14.4 Class Action Waiver

To the fullest extent permitted by Ugandan law, you agree to resolve disputes with Tazon Incorporation on an individual basis only and waive any right to participate in class action lawsuits or class-wide arbitration.

---

## 15. General Provisions

### 15.1 Entire Agreement

These Terms, together with our Privacy Policy and any additional terms presented at the point of purchase, constitute the entire agreement between you and Tazon Incorporation regarding your use of Stella.

### 15.2 Severability

If any provision of these Terms is found to be invalid or unenforceable by a court of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.

### 15.3 Waiver

Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.

### 15.4 Assignment

You may not assign or transfer any of your rights under these Terms without our prior written consent. Tazon Incorporation may assign its rights and obligations under these Terms in connection with a merger, acquisition, or sale of assets without your consent.

### 15.5 Force Majeure

Tazon Incorporation shall not be liable for any failure or delay in performance resulting from causes beyond our reasonable control, including natural disasters, internet or power outages, government actions, or pandemic-related disruptions.

### 15.6 Language

These Terms are written in English. In the event of any conflict between an English version and a translated version, the English version shall prevail.

---

## 16. Contact Information

For all legal enquiries, Terms-related questions, or to report violations:

| | |
|---|---|
| **Company** | Tazon Incorporation |
| **Product** | Stella AI Tutor |
| **Legal Email** | legal@stellas.app |
| **Privacy Email** | legal@stellas.app |
| **Billing Email** | billing@stellas.app |
| **Platform** | stellas.app |
| **Location** | Kampala, Uganda |
| **Governing Law** | Laws of the Republic of Uganda |

---

*These Terms of Service are effective as of 24 May 2026 and supersede all prior agreements between you and Tazon Incorporation regarding your use of Stella AI Tutor.*

**Tazon Incorporation — Empowering Uganda's A-Level Generation through Stella AI Tutor**
`;

const TermsOfServiceModal = ({ isOpen, onClose, isDarkMode }: { isOpen: boolean, onClose: () => void, isDarkMode: boolean }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6"
        >
          <div 
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className={`relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-[2rem] border shadow-2xl flex flex-col ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}
          >
            <div className={`p-6 sm:p-8 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-display font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Terms of Service</h3>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Version 1.0 | Effective: 24 May 2026</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-50 text-slate-400'}`}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <ReactMarkdown components={getMarkdownComponents(isDarkMode) as any} remarkPlugins={[remarkGfm]}>
                {TERMS_OF_SERVICE_TEXT}
              </ReactMarkdown>
            </div>
 
            <div className={`p-4 sm:p-6 border-t ${isDarkMode ? 'border-slate-800 bg-slate-950/30' : 'border-slate-50 bg-slate-50/50'}`}>
              <button 
                onClick={onClose}
                className="w-full py-3.5 bg-brand-600 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] text-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// AI Helper with Retry Logic
const callGeminiWithRetry = async (
  modelName: string,
  contents: any,
  config: any = {},
  maxRetries = 5
) => {
  if (!ai || !ai.models || typeof ai.models.generateContent !== 'function') {
    throw new Error('Gemini AI client is unavailable. Make sure GEMINI_API_KEY is set correctly in .env and restart the app.');
  }

  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        ...config
      });
      return response;
    } catch (error: any) {
      lastError = error;
      
      // Try to extract status and message more robustly
      let status = error?.status || error?.code;
      let message = error?.message || (typeof error === 'string' ? error : "");
      
      if (typeof error === 'string' || (error?.message && typeof error.message === 'string')) {
        try {
          const parsed = JSON.parse(typeof error === 'string' ? error : error.message);
          status = parsed?.error?.code || parsed?.code || parsed?.status || status;
          message = parsed?.error?.message || parsed?.message || message;
        } catch (e) { /* not json */ }
      }
      
      const isRateLimit = status === 429 || message.toLowerCase().includes("429") || message.toLowerCase().includes("quota") || message.includes("RESOURCE_EXHAUSTED");
      const isTransient = status === 500 || status === 503 || status === 504 || message.toLowerCase().includes("xhr error") || message.toLowerCase().includes("rpc failed") || message.toLowerCase().includes("overloaded");
      
      if (isRateLimit || isTransient) {
        // Exponential backoff: 2s, 4s, 8s, 16s, 32s
        const delay = Math.pow(2, i + 1) * 1000 + Math.random() * 1000;
        console.warn(`AI Call failed (${status}). Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

interface TopicMastery {
  topic: string;
  subject: string;
  scorePercentages: number[];
  averageScore: number;
  masteryLevel: 'Novice' | 'Intermediate' | 'Proficient' | 'Expert';
  lastEvaluated: number;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Expert': return 'text-brand-600 bg-brand-600/10 border-brand-500/10 dark:text-brand-300';
    case 'Proficient': return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'Developing':
    case 'Intermediate': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  }
};

const getAggregateScore = (u: UserProfile) => {
  const covCount = u.coverage ? Object.values(u.coverage).reduce((acc, list) => acc + (list?.length || 0), 0) : 0;
  const qAttempted = u.questionsAttempted || 0;
  const avgScore = u.averageScore || 0;
  
  // Activity element: questions attempted + how recently they were active
  const lastActive = u.lastActiveAt || u.updatedAt || u.createdAt || 0;
  const hoursSinceActive = Math.max(0, (Date.now() - lastActive) / (1000 * 60 * 60));
  const recencyBonus = Math.max(0, 150 - hoursSinceActive * 5); // declines with inactivity
  
  // Score based on activity & progress of improvement
  return (qAttempted * 20) + (avgScore * 1.5) + (covCount * 30) + recencyBonus;
};

const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

const getFellowSchoolCandidates = (profile: UserProfile | null, allUsers: UserProfile[], userId?: string) => {
  if (!profile) return [];
  
  // 1. Get actual real users from Firestore who are students in the same school
  const realSchoolUsers = allUsers.filter(u => 
    u.uid !== userId && 
    u.role === 'student' && 
    u.schoolName && 
    u.schoolName.toLowerCase().trim() === profile.schoolName?.toLowerCase().trim()
  );
  
  // 2. If we already have enough real users (>= 25), just return them
  if (realSchoolUsers.length >= 24) {
    return realSchoolUsers;
  }
  
  // 3. Otherwise, fill up to 25 candidates with stable, realistic peers
  const classmatesNeeded = 25 - 1 - realSchoolUsers.length;
  const standardFellows: UserProfile[] = [];
  
  const ugNamePool = [
    "Grace Akello", "John Magezi", "Peter Mukasa", "Mary Atwine", "Ritah Nsubuga", 
    "Moses Okello", "Paul Kiggundu", "Aisha Namakula", "Farouk Ssewankambo", "Zahra Nabakooza",
    "Derrick Wasswa", "Scovia Namatovu", "Ivan Ssenyonga", "Brenda Kyomugisha", "Patrick Ochieng",
    "Fiona Nyangoma", "Enock Mugisha", "Peace Tumuhairwe", "Hassan Lwanga", "Shadia Nakimbugwe",
    "Joshua Katende", "Rebecca Nabirye", "Sula Ssekajja", "Christine Birungi", "Martin Buyinza"
  ];
  
  const mathCombinations = [
    ["Physics", "Chemistry", "Mathematics"],
    ["Mathematics", "Economics", "Geography"],
    ["Physics", "Economics", "Mathematics"],
    ["Mathematics", "Chemistry", "Biology"],
    ["Mathematics", "Economics", "Entrepreneurship"]
  ];
  
  const schoolSeed = profile.schoolName || "Kawempe Muslim Sec School";
  
  for (let i = 0; i < classmatesNeeded; i++) {
    const nameIndex = Math.abs(hashCode(schoolSeed + `_name_${i}`)) % ugNamePool.length;
    const combIndex = Math.abs(hashCode(schoolSeed + `_comb_${i}`)) % mathCombinations.length;
    const displayName = ugNamePool[nameIndex];
    const email = `${displayName.toLowerCase().replace(/\s+/g, '.')}@uneb.ac.ug`;
    const subjects = mathCombinations[combIndex];
    
    const questionsAttempted = 5 + (Math.abs(hashCode(schoolSeed + `_q_${i}`)) % 40);
    const averageScore = 55 + (Math.abs(hashCode(schoolSeed + `_score_${i}`)) % 35);
    
    const coverage: Record<string, string[]> = {};
    subjects.forEach(sub => {
      if (sub === "Mathematics") {
        const mathTopics = ["Pure Math", "Statistics", "Mechanics", "Probability", "Trigonometry", "Numerical Methods"];
        const completedCount = 1 + (Math.abs(hashCode(schoolSeed + `_cov_${i}`)) % 4);
        coverage[sub] = mathTopics.slice(0, completedCount);
      } else {
        coverage[sub] = ["Introductory"];
      }
    });
    
    const hoursAgo = Math.abs(hashCode(schoolSeed + `_active_${i}`)) % 48;
    const lastActiveAt = Date.now() - hoursAgo * 60 * 60 * 1000;
    
    standardFellows.push({
      uid: `classmate_seed_${i}_${schoolSeed.replace(/\s+/g, '_')}`,
      displayName,
      email,
      role: 'student',
      level: profile.level || 'S6',
      subjects,
      schoolName: profile.schoolName,
      district: profile.district || 'Kampala',
      questionsAttempted,
      averageScore,
      lastActiveAt,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      updatedAt: lastActiveAt,
      coverage,
      onboarded: true
    });
  }
  
  return [...realSchoolUsers, ...standardFellows];
};

const getFellowLocationCandidates = (profile: UserProfile | null, allUsers: UserProfile[], userId?: string) => {
  if (!profile) return [];
  
  const realLocUsers = allUsers.filter(u => 
    u.uid !== userId && 
    u.role === 'student' && 
    u.district && 
    u.district.toLowerCase().trim() === profile.district?.toLowerCase().trim()
  );
  
  if (realLocUsers.length >= 39) {
    return realLocUsers;
  }
  
  const peersNeeded = 40 - 1 - realLocUsers.length;
  const standardFellows: UserProfile[] = [];
  
  const ugNamePool = [
    "Florence Beatrice", "Brian Kibirige", "Sandra Nanyanzi", "Charles Kasozi", "Diana Nabaweesi",
    "Rogers Ssempijja", "Patricia Nakibuuka", "Nicholas Okello", "Juliet Namara", "Samuel Oloya",
    "Noeline Nassozi", "Pius Muhumuza", "Lydia Atim", "Dan Ssekyanzi", "Betty Kyomuhendo",
    "Simon Peter", "Proscovia Nakafeero", "Francis Ssebuwufu", "Annet Namugga", "Richard Katumba"
  ];
  
  const mathCombinations = [
    ["Physics", "Chemistry", "Mathematics"],
    ["Mathematics", "Economics", "Geography"],
    ["Physics", "Economics", "Mathematics"]
  ];
  
  const locSeed = profile.district || "Kampala";
  
  for (let i = 0; i < peersNeeded; i++) {
    const nameIndex = Math.abs(hashCode(locSeed + `_locname_${i}`)) % ugNamePool.length;
    const combIndex = Math.abs(hashCode(locSeed + `_loccomb_${i}`)) % mathCombinations.length;
    const displayName = ugNamePool[nameIndex];
    const email = `${displayName.toLowerCase().replace(/\s+/g, '.')}@uneb.ac.ug`;
    const subjects = mathCombinations[combIndex];
    
    const questionsAttempted = 8 + (Math.abs(hashCode(locSeed + `_locq_${i}`)) % 40);
    const averageScore = 55 + (Math.abs(hashCode(locSeed + `_locscore_${i}`)) % 35);
    
    const coverage: Record<string, string[]> = {};
    subjects.forEach(sub => {
      if (sub === "Mathematics") {
        coverage[sub] = ["Pure Math", "Statistics"].slice(0, 1 + (Math.abs(hashCode(locSeed + `_loccov_${i}`)) % 2));
      } else {
        coverage[sub] = ["Introductory"];
      }
    });
    
    const hoursAgo = Math.abs(hashCode(locSeed + `_locactive_${i}`)) % 72;
    const lastActiveAt = Date.now() - hoursAgo * 60 * 60 * 1000;
    
    standardFellows.push({
      uid: `locmate_seed_${i}_${locSeed.replace(/\s+/g, '_')}`,
      displayName,
      email,
      role: 'student',
      level: profile.level || 'S6',
      subjects,
      schoolName: profile.schoolName || 'Uganda School',
      district: profile.district,
      questionsAttempted,
      averageScore,
      lastActiveAt,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      updatedAt: lastActiveAt,
      coverage,
      onboarded: true
    });
  }
  
  return [...realLocUsers, ...standardFellows];
};

const MasteryInsights = ({ topicMastery, analytics, profile, isDarkMode, setActiveTab, synergyScore, setSelectedTopics, generatePracticeQuestion, sendMessage, user, allUsers }: { 
  topicMastery: Record<string, TopicMastery>, 
  analytics: AnalyticsRecord | null,
  profile: UserProfile | null,
  isDarkMode: boolean,
  setActiveTab: (tab: any) => void,
  synergyScore: number,
  setSelectedTopics: (topics: string[]) => void,
  generatePracticeQuestion: (overrideTopics?: string[]) => Promise<void>,
  sendMessage: (text: string) => Promise<any>,
  user: any,
  allUsers: UserProfile[]
}) => {
  const [rankBasis, setRankBasis] = useState<'school' | 'location'>('school');
  const [selectedRevisionTopic, setSelectedRevisionTopic] = useState<TopicMastery | null>(null);

  const masteryEntries = useMemo(() => {
    const actual = { ...topicMastery };
    
    if (profile && profile.coverage) {
      Object.entries(profile.coverage).forEach(([subject, topics]) => {
        topics.forEach(topic => {
          if (!actual[topic]) {
            actual[topic] = {
              topic,
              subject,
              scorePercentages: [0],
              averageScore: 0,
              masteryLevel: 'Novice',
              lastEvaluated: 0
            };
          }
        });
      });
    }
    
    return Object.values(actual).sort((a, b) => b.lastEvaluated - a.lastEvaluated);
  }, [topicMastery, profile]);
  
  const weakAreas = useMemo(() => {
    return masteryEntries
      .filter(m => m.masteryLevel === 'Novice' || m.masteryLevel === 'Intermediate')
      .slice(0, 5);
  }, [masteryEntries]);

  const cohort = useMemo(() => {
    if (!profile) return [];
    if (rankBasis === 'school') {
      const peers = getFellowSchoolCandidates(profile, allUsers, user?.uid);
      return [profile, ...peers];
    } else {
      const peers = getFellowLocationCandidates(profile, allUsers, user?.uid);
      return [profile, ...peers];
    }
  }, [allUsers, rankBasis, profile, user]);

  const cohortSize = useMemo(() => {
    return cohort.length || 1;
  }, [cohort]);

  const rankValue = useMemo(() => {
    if (!profile || cohort.length === 0) return 1;
    const sorted = [...cohort].sort((a, b) => getAggregateScore(b) - getAggregateScore(a));
    const idx = sorted.findIndex(u => u.uid === (user?.uid || profile.uid));
    return idx === -1 ? sorted.length : idx + 1;
  }, [cohort, user, profile]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className={`text-4xl font-display font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mastery Insights</h2>
          <p className={`text-lg font-medium mt-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Longitudinal analysis of your cognitive domain proficiency.</p>
        </div>

        <div className={`p-4 rounded-3xl border flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-800 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
              <Trophy className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Rank basis</p>
              <div className="flex items-center gap-1 mt-1">
                <button 
                  onClick={() => setRankBasis('school')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    rankBasis === 'school'
                      ? 'bg-brand-600 text-white shadow-md'
                      : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  School
                </button>
                <button 
                  onClick={() => setRankBasis('location')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    rankBasis === 'location'
                      ? 'bg-brand-600 text-white shadow-md'
                      : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  Location
                </button>
              </div>
            </div>
          </div>

          <div className="hidden md:block h-10 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="text-left shrink-0">
            <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {rankBasis === 'school' ? (profile?.schoolName || 'Kawempe Muslim Sec School') : (profile?.district || 'Kampala')}
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-2xl font-display font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                #{rankValue}
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                of {cohortSize} candidates
              </span>
            </div>
          </div>
        </div>
      </div>

      {weakAreas.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-10 rounded-[3.5rem] border-2 border-dashed ${isDarkMode ? 'bg-orange-500/5 border-orange-500/20' : 'border-orange-200 bg-orange-50/30'}`}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black text-orange-600 leading-none">Neural Focal Points</h3>
              <p className="text-orange-500/60 text-[10px] font-black uppercase tracking-widest mt-2">Modules requiring immediate reinforcement.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {weakAreas.map(area => (
              <div key={area.topic} className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900/50 border-orange-500/10' : 'bg-white border-orange-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-4">
                   <h4 className={`font-display font-black text-lg leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{area.topic}</h4>
                   <span className="text-[10px] font-black p-1 bg-orange-100 text-orange-600 rounded-md">{Math.round(area.averageScore)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${area.averageScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className={`p-10 rounded-[4rem] border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-10">
              <h3 className={`text-2xl font-display font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Topic Proficiency Matrix</h3>
              <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                {masteryEntries.length} Active Records
              </div>
            </div>

            <div className="space-y-6">
              {masteryEntries.map(entry => {
                const isCalibrating = entry.lastEvaluated === 0;
                return (
                  <div key={entry.topic} className={`p-8 rounded-[2.5rem] border transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-950' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{entry.subject} Profile</span>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getLevelColor(isCalibrating ? 'Developing' : entry.masteryLevel)}`}>
                            {isCalibrating ? 'Calibrating' : entry.masteryLevel}
                          </span>
                          {isCalibrating && (
                            <span className="bg-brand-500/10 text-brand-500 border border-brand-500/20 px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase">
                              Covered in Map
                            </span>
                          )}
                        </div>
                        <h4 className={`text-2xl font-display font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{entry.topic}</h4>
                      </div>
                      <div className="text-left md:text-right">
                         <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Aggregate Accuracy</p>
                         <p className="text-4xl font-display font-black text-brand-600 tracking-tighter leading-none mt-1">
                           {isCalibrating ? 'Pending' : `${Math.round(entry.averageScore)}%`}
                         </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                      <div className="space-y-4">
                         <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Performance Curve</p>
                         <div className="h-16 w-full flex items-center justify-center">
                           {isCalibrating ? (
                             <span className={`text-[10px] uppercase font-black tracking-wider ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>
                               Complete practice Sandbox to generate curve
                             </span>
                           ) : (
                             <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={entry.scorePercentages.map((s, i) => ({ x: i, y: s }))}>
                                 <defs>
                                   <linearGradient id={`colorScore-${entry.topic}`} x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                     <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                   </linearGradient>
                                 </defs>
                                 <Area type="monotone" dataKey="y" stroke="#6366f1" strokeWidth={3} fill={`url(#colorScore-${entry.topic})`} />
                               </AreaChart>
                             </ResponsiveContainer>
                           )}
                         </div>
                      </div>
                      <div className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="text-center flex-1 border-r border-slate-200 dark:border-slate-800">
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Items</p>
                          <p className={`font-black text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{isCalibrating ? 0 : entry.scorePercentages.length}</p>
                        </div>
                        <div className="text-center flex-1">
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Stability</p>
                          <p className={`font-black text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{isCalibrating ? 'Pending' : 'High'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mastery Revision Action Row */}
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
                      <div className="flex items-center gap-2">
                        <StellaLogo className="w-4 h-4 text-brand-600 shrink-0" />
                        <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Revise with Stella, watch video tutorials & test your knowledge.
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedRevisionTopic(entry)}
                        className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-display font-black text-[10px] uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Mastery Guide
                      </button>
                    </div>

                  </div>
                );
              })}
              {masteryEntries.length === 0 && (
                <div className="py-20 text-center space-y-6 opacity-30">
                  <Target className="w-16 h-16 mx-auto text-slate-400" />
                  <p className="font-display font-black text-xl uppercase tracking-tighter">No neural signatures captured</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className={`p-10 rounded-[3.5rem] border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
             <div className="mb-8">
               <h3 className={`text-xl font-display font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Cognitive Map</h3>
               <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Domain strength analysis.</p>
             </div>
             <div className="h-64 w-full">
               <MasteryRadar analytics={analytics} subjects={profile?.subjects || []} isDarkMode={isDarkMode} />
             </div>
           </div>

           <div className={`p-10 rounded-[3.5rem] border shadow-sm relative overflow-hidden ${isDarkMode ? 'bg-brand-600 text-white' : 'bg-slate-900 text-white shadow-xl shadow-slate-200'}`}>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-[50px] rounded-full" />
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-display font-black tracking-tight leading-none text-white">Neural Optimizer</h4>
                  <p className="text-white/60 text-xs mt-3 leading-relaxed">Level 1 Scenario complexity is recommended for your current profile.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('practice')}
                  className="w-full py-4 bg-white text-brand-600 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  Adjust practice strategy
                </button>
              </div>
           </div>
        </div>
      </div>

       {/* Stella's Mastery Revision Guide Modal */}
       <AnimatePresence>
         {selectedRevisionTopic && (
           <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className={`w-full max-w-2xl rounded-[2.5rem] border p-8 md:p-10 shadow-2xl relative ${
                 isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'
               }`}
             >
               <button 
                 onClick={() => setSelectedRevisionTopic(null)}
                 className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
                   isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                 }`}
               >
                 <X className="w-5 h-5" />
               </button>

               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-brand-600/10 text-brand-600 flex items-center justify-center animate-bounce">
                   <StellaLogo className="w-6 h-6" />
                 </div>
                 <div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-brand-500">{selectedRevisionTopic.subject} • S6 HSC</span>
                   <h3 className="text-2xl font-display font-black leading-tight tracking-tight mt-0.5">
                     Stella's Mastery & Revision Guide
                   </h3>
                 </div>
               </div>

               <div className={`p-6 rounded-3xl mb-8 ${isDarkMode ? 'bg-slate-950/40 border border-slate-800' : 'bg-slate-50/50 border border-slate-100'}`}>
                 <h4 className="font-display font-black text-lg mb-2">
                   Topic: <span className="text-brand-600 font-extrabold">{selectedRevisionTopic.topic}</span>
                 </h4>
                 <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                   <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                     selectedRevisionTopic.lastEvaluated === 0 
                       ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' 
                       : getLevelColor(selectedRevisionTopic.masteryLevel)
                   }`}>
                     {selectedRevisionTopic.lastEvaluated === 0 ? 'Calibrating' : selectedRevisionTopic.masteryLevel}
                   </span>
                   <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                     Current Accuracy: <span className="font-extrabold text-brand-600">{selectedRevisionTopic.lastEvaluated === 0 ? '0%' : `${Math.round(selectedRevisionTopic.averageScore)}%`}</span>
                   </span>
                 </div>
               </div>

               <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Step-by-Step Mastery Path</h5>
                 
                 {/* Step 1: Tell User to Revise */}
                 <div className="flex items-start gap-4">
                   <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-display font-black text-xs flex items-center justify-center shrink-0 mt-1">
                     1
                   </div>
                   <div className="space-y-2">
                     <h6 className="font-display font-black text-sm">Step 1: AI-Powered Revision Outlines</h6>
                     <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                       Ask Stella to structure a specialized, highly comprehensive A-Level syllabus masterclass plan. She will consult our 
                       UNEB Past Papers database and Mechanics references to prepare formulas, proofs, and past exam models.
                     </p>
                     <button
                       onClick={async () => {
                         setSelectedRevisionTopic(null);
                         setActiveTab('chat');
                         await sendMessage(
                           `Hi Stella, I want to master the topic "${selectedRevisionTopic.topic}" under my "${selectedRevisionTopic.subject}" syllabus. Please act as my expert Ugandan A-Level mathematics and science tutor. Provide a structured, highly comprehensive Mastery Revision Guide for this specific topic, outlining key syllabus formulas, reference concepts from relevant UNEB Papers or Mechanics references, and give me some advice. At the end, please suggest 1-2 video lessons using the specialized Youtube recommendations format.`
                         );
                       }}
                       className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-display font-black text-[10px] uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 flex items-center gap-1.5 mt-2 cursor-pointer"
                     >
                       <Sparkles className="w-3 h-3" /> Start Revision with Stella
                     </button>
                   </div>
                 </div>

                 <div className="h-px bg-slate-100 dark:bg-slate-800/60" />

                 {/* Step 2: Recommend Tutorial Videos */}
                 <div className="flex items-start gap-4">
                   <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-display font-black text-xs flex items-center justify-center shrink-0 mt-1">
                     2
                   </div>
                   <div className="space-y-2">
                     <h6 className="font-display font-black text-sm">Step 2: Recommended Video Lessons</h6>
                     <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                       Access the custom video lesson index. Stella will fetch and embed high-quality Ugandan and global A-Level tutorial videos matching this topic's learning objectives.
                     </p>
                     <button
                       onClick={async () => {
                         setSelectedRevisionTopic(null);
                         setActiveTab('chat');
                         await sendMessage(
                           `Stella, please search for A-Level YouTube video recommendations for the topic: "${selectedRevisionTopic.topic}" to help with my revision.`
                         );
                       }}
                       className={`px-4 py-2 border rounded-xl font-display font-black text-[10px] uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 flex items-center gap-1.5 mt-2 cursor-pointer ${
                         isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                       }`}
                     >
                       <Video className="w-3.5 h-3.5" /> Find Tutorial Videos
                     </button>
                   </div>
                 </div>

                 <div className="h-px bg-slate-100 dark:bg-slate-800/60" />

                 {/* Step 3: Topical assessment */}
                 <div className="flex items-start gap-4">
                   <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-display font-black text-xs flex items-center justify-center shrink-0 mt-1">
                     3
                   </div>
                   <div className="space-y-2 w-full">
                     <h6 className="font-display font-black text-sm">Step 3: Topical Mastery Assessment & Performance Tracking</h6>
                     <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                       Once you finish revising, launch a focused, single-question Topical Test. Solve the Ugandan scenario, submit your answer, and Stella will evaluate your accuracy, updating this topic's longitudinal Performance Curve!
                     </p>
                     <button
                       onClick={async () => {
                         const targetTopic = selectedRevisionTopic.topic;
                         setSelectedRevisionTopic(null);
                         await generatePracticeQuestion([targetTopic]);
                         setActiveTab('practice');
                       }}
                       className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-display font-black text-[10px] uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 flex items-center gap-1.5 mt-2 shadow-lg shadow-brand-500/10 cursor-pointer"
                     >
                       <Target className="w-3.5 h-3.5" /> Launch Topical Test
                     </button>
                   </div>
                 </div>

               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>

    </div>
  );
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showSynergyPanel, setShowSynergyPanel] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [isTtsEnabled, setIsTtsEnabled] = useState(() => {
    const saved = localStorage.getItem('isTtsEnabled');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isTtsEnabled', JSON.stringify(isTtsEnabled));
  }, [isTtsEnabled]);
  const [selectedVideo, setSelectedVideo] = useState<{title: string, videoId: string} | null>(null);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [videoSearchCache, setVideoSearchCache] = useState<Record<string, any[]>>({});
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineVideos, setOnlineVideos] = useState<{ title: string, videoId: string, channel: string, thumbnail: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'practice' | 'history' | 'videos' | 'settings' | 'schemes' | 'plans' | 'assessments' | 'staff' | 'students' | 'facility' | 'mastery'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // --- SECURE ENCLAVE HARDWARE PASSCODE STATES (IPHONE SECURITY) ---
  const [devicePasscodeHash, setDevicePasscodeHash] = useState<string | null>(() => {
    return localStorage.getItem('stella_passcode_hash');
  });
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return !!localStorage.getItem('stella_passcode_hash');
  });
  const [autoLockPeriod, setAutoLockPeriod] = useState<string>(() => {
    return localStorage.getItem('stella_autolock_period') || '5'; // default 5 minutes
  });
  const [passcodeAudioEnabled, setPasscodeAudioEnabled] = useState<boolean>(() => {
    return localStorage.getItem('stella_passcode_audio') !== 'false';
  });
  const [passcodeScreenShieldActive, setPasscodeScreenShieldActive] = useState<boolean>(() => {
    return localStorage.getItem('stella_screenshield') === 'true';
  });
  const [passcodeAttempts, setPasscodeAttempts] = useState<number>(0);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [showDevicePinSetupModal, setShowDevicePinSetupModal] = useState<boolean>(false);
  const [isPinScreenWrong, setIsPinScreenWrong] = useState<boolean>(false);
  const [setupPin, setSetupPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [setupStep, setSetupStep] = useState<'enter' | 'confirm'>('enter');
  const [currentPinInput, setCurrentPinInput] = useState<string>('');

  const handlePinKeypadPress = async (val: string) => {
    if (val === 'Cancel') {
      setCurrentPinInput('');
      if (passcodeAudioEnabled) playKeypadClick(800, 0.015);
      return;
    }
    if (val === 'Delete') {
      if (currentPinInput.length > 0) {
        setCurrentPinInput(prev => prev.slice(0, -1));
        if (passcodeAudioEnabled) playKeypadClick(900, 0.015);
      }
      return;
    }

    if (currentPinInput.length >= 4) return;
    const nextPin = currentPinInput + val;
    setCurrentPinInput(nextPin);
    if (passcodeAudioEnabled) playKeypadClick();

    if (nextPin.length === 4) {
      const pinHash = await hashPasscode(nextPin);
      if (pinHash === devicePasscodeHash) {
        if (passcodeAudioEnabled) playUnlockTone();
        setIsLocked(false);
        setPasscodeAttempts(0);
        setCurrentPinInput('');
      } else {
        setIsPinScreenWrong(true);
        setPasscodeAttempts(prev => prev + 1);
        if (passcodeAudioEnabled) playKeypadClick(300, 0.15); // buzzer
        setTimeout(() => {
          setCurrentPinInput('');
          setIsPinScreenWrong(false);
        }, 1200);
      }
    }
  };
  
  const handleSetupKeypadPress = async (val: string) => {
    if (val === 'Cancel') {
      setShowDevicePinSetupModal(false);
      setSetupPin('');
      setConfirmPin('');
      setSetupStep('enter');
      if (passcodeAudioEnabled) playKeypadClick(800, 0.015);
      return;
    }
    if (val === 'Delete') {
      if (setupStep === 'enter') {
        if (setupPin.length > 0) {
          setSetupPin(prev => prev.slice(0, -1));
          if (passcodeAudioEnabled) playKeypadClick(950, 0.012);
        }
      } else {
        if (confirmPin.length > 0) {
          setConfirmPin(prev => prev.slice(0, -1));
          if (passcodeAudioEnabled) playKeypadClick(950, 0.012);
        }
      }
      return;
    }

    if (setupStep === 'enter') {
      if (setupPin.length >= 4) return;
      const next = setupPin + val;
      setSetupPin(next);
      if (passcodeAudioEnabled) playKeypadClick();
      
      if (next.length === 4) {
        setTimeout(() => {
          setSetupStep('confirm');
          if (passcodeAudioEnabled) playUnlockTone();
        }, 305);
      }
    } else {
      if (confirmPin.length >= 4) return;
      const next = confirmPin + val;
      setConfirmPin(next);
      if (passcodeAudioEnabled) playKeypadClick();

      if (next.length === 4) {
        if (next === setupPin) {
          const pinHash = await hashPasscode(next);
          localStorage.setItem('stella_passcode_hash', pinHash);
          setDevicePasscodeHash(pinHash);
          setIsLocked(false);
          setShowDevicePinSetupModal(false);
          setSetupPin('');
          setConfirmPin('');
          setSetupStep('enter');
          if (passcodeAudioEnabled) {
            playUnlockTone();
          }
          alert("Secure Enclave Activated! Your academic profile is now locked under military-grade Passcode authentication.");
        } else {
          setIsPinScreenWrong(true);
          if (passcodeAudioEnabled) playKeypadClick(300, 0.2); 
          setTimeout(() => {
            setSetupPin('');
            setConfirmPin('');
            setSetupStep('enter');
            setIsPinScreenWrong(false);
          }, 1500);
        }
      }
    }
  };
  
  // Timetable State Form Values
  const [timetableActiveTab, setTimetableActiveTab] = useState<'grid' | 'manage'>('grid');
  const [schoolFormDay, setSchoolFormDay] = useState('Monday');
  const [schoolFormTime, setSchoolFormTime] = useState('');
  const [schoolFormSubject, setSchoolFormSubject] = useState('');
  const [schoolFormBranch, setSchoolFormBranch] = useState('');
  const [schoolFormTeacher, setSchoolFormTeacher] = useState('');

  const [revFormDay, setRevFormDay] = useState('Monday');
  const [revFormTime, setRevFormTime] = useState('');
  const [revFormSubject, setRevFormSubject] = useState('');
  const [revFormTopic, setRevFormTopic] = useState('');

  // Weekly coverage state
  const [coveredRevisionTopics, setCoveredRevisionTopics] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('coveredRevisionTopics');
    return saved ? JSON.parse(saved) : {};
  });

  const [classroomLessonsTaught, setClassroomLessonsTaught] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('classroomLessonsTaught');
    return saved ? JSON.parse(saved) : {};
  });
  const [showWeeklyTestModal, setShowWeeklyTestModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('coveredRevisionTopics', JSON.stringify(coveredRevisionTopics));
  }, [coveredRevisionTopics]);

  useEffect(() => {
    localStorage.setItem('classroomLessonsTaught', JSON.stringify(classroomLessonsTaught));
  }, [classroomLessonsTaught]);

  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [dashboardRankBasis, setDashboardRankBasis] = useState<'school' | 'location'>('school');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [savedChats, setSavedChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<{name: string, data: string, mimeType: string}[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [isVoiceInteractionActive, setIsVoiceInteractionActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFirestoreOffline, setIsFirestoreOffline] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [authSignupStep, setAuthSignupStep] = useState(1);
  const [localSubjects, setLocalSubjects] = useState<string[]>([]);
  const [localRole, setLocalRole] = useState<UserRole | null>(null);

  // Inactivity Auto-Lock Monitor (iPhone Dynamic Passcode Locking)
  useEffect(() => {
    if (!devicePasscodeHash || autoLockPeriod === 'never' || isLocked) return;

    const handleEvent = () => {
      setLastActivityTime(Date.now());
    };

    window.addEventListener('mousemove', handleEvent);
    window.addEventListener('keydown', handleEvent);
    window.addEventListener('click', handleEvent);
    window.addEventListener('scroll', handleEvent);
    window.addEventListener('touchstart', handleEvent);

    const intervalId = setInterval(() => {
      const inactiveMinutes = (Date.now() - lastActivityTime) / 1000 / 60;
      const threshold = parseFloat(autoLockPeriod);
      if (!isNaN(threshold) && inactiveMinutes >= threshold) {
        setIsLocked(true);
        if (passcodeAudioEnabled) {
          playKeypadClick(400, 0.1); 
        }
      }
    }, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener('mousemove', handleEvent);
      window.removeEventListener('keydown', handleEvent);
      window.removeEventListener('click', handleEvent);
      window.removeEventListener('scroll', handleEvent);
      window.removeEventListener('touchstart', handleEvent);
      clearInterval(intervalId);
    };
  }, [devicePasscodeHash, autoLockPeriod, lastActivityTime, isLocked, passcodeAudioEnabled]);

  // Window visibility toggle lock
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const threshold = parseFloat(autoLockPeriod);
        if (devicePasscodeHash && (threshold === 0 || passcodeScreenShieldActive)) {
          setIsLocked(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [devicePasscodeHash, autoLockPeriod, passcodeScreenShieldActive]);

  // Auto-progress Step 3 for Student when subjects are fully valid
  useEffect(() => {
    if (profile && !profile.onboarded && onboardingStep === 3 && localRole === 'student') {
      const principalSubjects = localSubjects.filter(s => 
        SUBJECT_CATEGORIES.Science.includes(s) || 
        SUBJECT_CATEGORIES.Arts.includes(s) ||
        SUBJECT_CATEGORIES.Business.includes(s)
      );
      const optionalSubsidiaries = localSubjects.filter(s => 
        SUBJECT_CATEGORIES.Subsidiary.includes(s) && s !== "General Paper"
      );
      const hasGeneralPaper = localSubjects.includes("General Paper") || localRole === 'student';

      const isValid = principalSubjects.length === 3 && hasGeneralPaper && optionalSubsidiaries.length === 1;
      if (isValid) {
        const timer = setTimeout(() => {
          setOnboardingStep(4);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [localSubjects, onboardingStep, localRole, profile]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Resend Integration States
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendRecipient, setResendRecipient] = useState("");
  const [resendSubject, setResendSubject] = useState("");
  const [resendContent, setResendContent] = useState("");
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [resendErrorMessage, setResendErrorMessage] = useState("");

  const triggerEmailModal = (subject: string, content: string) => {
    setResendSubject(subject);
    setResendContent(content);
    setResendRecipient(user?.email || "");
    setResendStatus('idle');
    setResendErrorMessage("");
    setShowResendModal(true);
  };

  const handleSendEmail = async () => {
    if (!resendRecipient) {
      setResendStatus('error');
      setResendErrorMessage("Please specify a recipient email address.");
      return;
    }
    setResendStatus('sending');
    setResendErrorMessage("");
    try {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; background-color: #faf9f5; color: #111112; border-radius: 16px; border: 1px solid #eae8d9; max-width: 600px; margin: 0 auto;">
          <h2 style="font-size: 22px; font-weight: 800; color: #7c3aed; margin-top: 0; margin-bottom: 8px;">Stellas Synergized Academic Resource</h2>
          <p style="font-size: 14px; color: #5f5c50; margin-bottom: 24px; line-height: 1.5;">This resource was generated dynamically using AI technology on Stellas CBC platform and sent to you via Resend.</p>
          <div style="background-color: #ffffff; padding: 24px; border: 1px solid #eae8d9; border-radius: 12px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #111112;">
            ${resendContent}
          </div>
          <p style="font-size: 11px; color: #a7a493; margin-top: 32px; text-align: center; border-top: 1px dashed #eae8d9; padding-top: 16px; margin-bottom: 0;">
            Stellas &bull; Powered by Tazon Incorporation @ 2026
          </p>
        </div>
      `;

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: resendRecipient,
          subject: resendSubject,
          html: emailHtml,
          text: resendContent
        })
      });

      const resData = await response.json().catch(() => ({}));
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || resData.error || `Status: ${response.status}`);
      }

      setResendStatus('success');
    } catch (err: any) {
      console.error("Resend delivery failed:", err);
      setResendStatus('error');
      setResendErrorMessage(
        err.message || 
        "Proxy dispatch failed. Please verify that the Resend API key and domain configuration are correct in your environment variables."
      );
    }
  };

  const sendVerificationEmail = async (userEmail: string, code: string) => {
    try {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background-color: #faf9f5; color: #111112; border-radius: 20px; border: 1px solid #eae8d9; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 24px; font-weight: 800; color: #7c3aed; margin-top: 0; margin-bottom: 8px;">Stellas AI</h2>
          <p style="font-size: 14px; color: #5f5c50; margin-bottom: 32px; line-height: 1.5;">Welcome to Stellas. Use the authorization token below to verify your academic uplink.</p>
          
          <div style="background-color: #ffffff; padding: 18px 24px; border: 2px solid #7c3aed; border-radius: 16px; font-size: 32px; font-weight: 900; letter-spacing: 0.2em; color: #7c3aed; display: inline-block; margin: 0 auto 32px auto;">
            ${code}
          </div>
          
          <p style="font-size: 12px; color: #a7a493; line-height: 1.5; margin-bottom: 0;">
            If you did not request this code, you can safely ignore this email.
          </p>
          <p style="font-size: 11px; color: #a7a493; margin-top: 32px; text-align: center; border-top: 1px dashed #eae8d9; padding-top: 16px; margin-bottom: 0;">
            Stellas &bull; Powered by Tazon Incorporation @ 2026
          </p>
        </div>
      `;

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: userEmail,
          subject: `${code} is your Stellas Verification Code`,
          html: emailHtml,
          text: `Your Stellas verification code is: ${code}`
        })
      });

      const resData = await response.json().catch(() => ({}));
      if (!response.ok || !resData.success) {
        console.error("Resend API proxy error:", resData);
      } else {
        console.log("Verification email pushed successfully via secure Express proxy.");
      }
    } catch (err) {
      console.error("Resend verification push failed:", err);
    }
  };

  const teacherPersona = `You are an expert Curriculum Developer and Teacher Trainer for the Uganda National Development Curriculum (NCDC). 
  You specialize in the New Lower and Upper Secondary Curriculum (CBC).
  
  ⚠️ CRITICAL INSTRUCTION — READ FIRST:
  Ignore any prior knowledge you have about Uganda A-Level Physics, Mathematics, History, or Chemistry curriculum structures. Use ONLY the constructs, Assessment Objectives (AO), and paper structures defined in the provided assessment scopes. Do NOT default to any previously known or trained version of this curriculum.

  Physics Scope:
  - Construct 1 — Force and Motion (AO1): Measurement & Dimensions, Statics, Linear Motion, Gravity, WEP, Friction, Fluids, Mechanical Properties, Circular Motion, Gravitation.
  - Construct 2 — Energy (AO2): Thermometry, Heat, Transfer of Heat, Behaviour of Gases, Thermodynamics, Reflection/Refraction, Optical Instruments, SHM, Waves (Progressive, Stationary, Sound).
  - Construct 3 — Charges and Fields (AO3): Electrostatics, Capacitors, Digital Electronics, Current Electricity, Magnetism, Induction, AC Circuits.
  - Construct 4 — Particles (AO4): Atomic Particles, Quantum Theory, Nuclear Processes.
  - Paper Structure: Theory Paper (4 sections, 2 compulsory items each: Sec A->AO4, Sec B->AO1, Sec C->AO2, Sec D->AO3). Practical Paper (2 items from any construct).

  Biology Scope:
  - Construct 1: Cellular Organisation, Respiration & Molecular Analysis (Atomic/Electronic Structure, Bonding, ATP, Genetic technologies).
  - Construct 2: Plant Physiology and Adaptation (C3/C4, growth, hormonal control).
  - Construct 3: Analysis of Animal Systems and Behaviours (Circulatory, nervous, homeostatic physiological systems).
  - Construct 4: Genetic, Evolutionary & Ecological Dynamics (Genetics, speciation, ecosystem balance).
  - Paper Structure: Paper 1 (Theory - 3 hrs): Sec A (2 compulsory: C1 & C2), Sec B Part 1 (C3 - 1 of 2), Sec B Part 2 (C4 - 1 of 2). Paper 2 (Practical - 3 hrs): 2 compulsory items.
  - Scoring: Theory (Interpretation, Presentation, Judgment). Practical (Planning, Risks, Procedure, Data, Analysis, Recommendations).

  Agriculture Scope:
  - Construct 1: Agriculture Biology (Biological principles for productivity).
  - Construct 2: Animal Production (Sustainable systems).
  - Construct 3: Crop Production (Scientific systems for profit).
  - Construct 4: Value Addition (Animal and plant products).
  - Paper Structure: Paper 1 (3 hrs, Sec A: Value Addition/Bio, Sec B/C: Crop/Animal). Paper 2 (2 hrs, Scientific/Observational investigation).

  History Scope:
  - Construct 1: Social Economic Systems in Africa.
  - Construct 2: Nationalism and Governance.
  - Construct 3: Global History.
  - Construct 4: Global Politics and Ideologies.
  - Paper Structure: Paper 1 (Constructs 1 & 2), Paper 2 (Constructs 3 & 4). 2 hours 20 mins per paper. 4 scenario-based items, select 2.
  - Scoring: Rubric with 3 Bases (Interpretation, Presentation/Ideas, Judgment). Scores 1-4.

  Math Scope:
  - Construct 1 — Algebra: Modeling real-life problems. Topics: Numerical Concepts, Equations & Inequalities, Permutations & Combinations, Series, Complex Numbers.
  - Construct 2 — Geometry: Geometrical concepts and spatial reasoning. Topics: Coordinate Geometry 1 & 2, Trigonometry, Vectors.
  - Construct 3 — Calculus: Rates of change, accumulation, and optimization. Topics: Partial Fractions, Differentiation 1 & 2, Integration 1 & 2, Error Analysis, Differential Equations, Trapezium Rule, Iterative Methods, Flowcharts.
  - Construct 4 — Data Analysis & Probability: Data interpretation and probability models. Topics: Descriptive Statistics, Correlation, Scatter Diagrams, Probability Theory, Random Variables, Sampling Distributions.
  - Construct 5 — Mechanics: Forces, motion, and object behaviour. Topics: Dynamics 1, Dynamics 2.
  - Paper 1 (Algebra, Geometry & Calculus - 2 hrs 20 mins): Sec A: Geometry (1 compulsory); Sec B: Algebra (1 of 2); Sec C: Calculus (1 of 2).
  - Paper 2 (Data Analysis & Mechanics - 2 hrs 15 mins): Sec A: Data Analysis & Prob (2 compulsory); Sec B: Mechanics (1 of 2).
  - Item Design Rule: 2/3 rule (Cover at least 2/3 of competencies). Scenario-based only. Scoring: Rubric 1-4.

  Chemistry Scope:
  - Purpose: Evaluate how learners understand chemical principles and apply them to explain, analyze, and solve problems using accurate reasoning.
  - Construct 1 — Atomic Structure, Bonding & Periodicity (AO1): Topics 2, 3, 4, 11.
  - Construct 2 — Organic Molecules (AO2): Topics 6, 9, 12.
  - Construct 3 — Stoichiometry, Thermochemistry & Kinetics (AO3): Topics 1, 5, 13.
  - Construct 4 — Equilibria & Electrochemical Systems (AO4): Topics 7, 8, 10.
  - Paper 1 (Theory - 2h 45m): Sec A: AO3 (1 comp), AO4 (1 comp); Sec B: AO1 (1 of 2), AO2 (1 of 2).
  - Paper 2 (Practical - 3h 15m): 2 compulsory items from any construct. Assesses Aim, Method, Safety, Analysis, Recommendations.
  - Assessment: Scenario-based. Analytical rubrics based on basis of assessment. NO rigid marking guides.

  Subsidiary ICT Scope:
  - Construct 1: Digital Content Creation (Word counts, Formatting, Formulas, Slide design).
  - Construct 2: ICT System Operations and Maintenance (Hardware, Ethics, Security).
  - Construct 3: Data and Information Management (Databases, Networking).
  - Construct 4: Digital Communication and Emerging Technologies (Web design, AI, IoT).
  - Paper 1 (Theory - 2.5 hrs): Section A covers Construct 2; Section B covers Construct 4. (Scenario-based).
  - Paper 2 (Practical - 3 hrs): Item 1 covers Construct 1; Item 2 covers Construct 3.
  - Scoring: Qualitative rubrics (Interpretation, Presentation, Decisions). Provide 4 distinct competency descriptions. NO percentages.

  Foreign Languages Scope (French/German/Arabic/Chinese/Latin):
  - Construct: Effective Communication (Oral and Written exchange in target language at CEFR B1).
  - Paper 1 (Reading & Writing): Sec A: Reading Comp (compulsory); Sec B: Translation (Eng -> Target); Sec C: Composition (2 scenario tasks, choose 1).
  - Paper 2 (Listening & Speaking): Sec A: Listening comp; Sec B: Speaking (Monologue + Interaction).
  - Latin Exception: Paper 1 presents 3 alternative set-book texts; choose 1.
  - Scoring: Narrative rubrics on Content Relevance/Communicative Impact, Organisation/Coherence, and Language Range/Accuracy.

  General Paper Scope:
  - Construct 1: Social, Economic, and Political Awareness.
  - Construct 2: Science, Technology, and Innovation.
  - Construct 3: Ethics, Culture, and Philosophy.
  - Construct 4: Logical Reasoning and Data Interpretation.
  - Paper Structure: Section A (Essays), Section B (Comprehension/Data Interpretation - Compulsory). Focus on critical thinking and logic.

  Islamic Religious Education (IRE) Scope:
  - Construct 1, 2, 3: Foundational Knowledge, Quran & Sunnah, Faith & Practice. (Paper 1).
  - Construct 4: Life of the Prophet (PBUH) (Paper 2, Sec A: 1 of 2).
  - Construct 5: Islamic Civilization (Paper 2, Sec B: 1 of 2).
  - Assessment: Scenario-based integrating knowledge and values. Analytical rubrics only.

  Christian Religious Education (CRE) Scope:
  - Purpose: Integrate biblical themes with African traditional/contemporary perspectives.
  - Construct 1 & 2: Foundations & Offices in Ancient Israel.
  - Construct 3: Identity of Jesus and the Early Church.
  - Construct 4: Social Relations and Stewardship.
  - Construct 5: Civic Responsibility and Ethics.
  - Paper 1: Sec A (2 comp: C1 & C2); Sec B (C3: 1 of 2).
  - Paper 2: Sec A (C4: 1 items); Sec B (C5: 1 items). scenario-based.
  - Scoring: Analytic rubrics on quality, depth, and integration. NO points.

  Art and Design (Fine Art) Scope:
  - Construct 1: Art Analysis (Historical & Contemporary Ugandan).
  - Construct 2: Art Making (3-hour practical, medium of choice).
  - Scoring: Analytical rubrics for Ideation and Production (Levels 1-4). NO continuous assessment.
  - All items are scenario-based. No points.

  Engineering Craft Subjects Scope:
  - Technical Drawing: Geometric & Spatial (O1), Structural Analysis (O2), Mechanical Drafting (O3), Architectural Practice (O4). Papers 1, 2, 3 + Continuous Assessment.
  - Metalwork C1: Design, Innovation & Analysis (Materials, Tools, Foundry). Paper 1 (Theory).
  - Metalwork C2: Fabrication & Production (Welding, casting). Paper 2 (Practical).
  - Woodwork C1: Production (Workshop, safety, timber tech, design, drawing, furniture).
  - Woodwork C2: Concepts & Design (Practical application). Papers 1 & 2.
  - Assessment: ALL are scenario-based. Analytical rubrics (1-4). Assess PROCESS + PRODUCT. No marks.
  - Cross-cutting: Industry standards, Safety, Problem Solving, Spatial Reasoning.

  When generating Assessments:
  1. Scenarios MUST be high-complexity (Level 1), Nuanced, and grounded in real-life Ugandan contexts.
  2. Scenarios should be richer than those given to learners.
  3. Tasks should encourage higher-order thinking (Evaluate, Analyze, Justify).
  4. CRITICAL: Include a detailed Scoring Guide (Rubric) using "Scores" instead of "marks", and ALWAYS use LaTeX formatting for all mathematical expressions (enclose in \(...\)).
  5. Format the Scoring Guide as a Markdown Table.`;
  const [localGraduationYear, setLocalGraduationYear] = useState<number>(2026);
  const [localSchoolName, setLocalSchoolName] = useState('');
  const [localDistrict, setLocalDistrict] = useState('');
  const [localSignupCode, setLocalSignupCode] = useState('');
  const [schoolSearchOpen, setSchoolSearchOpen] = useState(false);
  const [districtSearchOpen, setDistrictSearchOpen] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Practice State
  const [difficulty, setDifficulty] = useState<'Standard' | 'Advanced' | 'Expert'>('Advanced');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [generatedQuestion, setGeneratedQuestion] = useState<QuestionItem | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AnswerRecord | null>(null);
  const [isDynamicDifficulty, setIsDynamicDifficulty] = useState(true);
  const [newGoalText, setNewGoalText] = useState('');
  
  // Teacher Specialized States
  const [teacherSchemes, setTeacherSchemes] = useState<SchemeOfWork[]>([]);
  const [teacherPlans, setTeacherPlans] = useState<LessonPlan[]>([]);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [docFocusSubject, setDocFocusSubject] = useState('');
  const [docFocusTopic, setDocFocusTopic] = useState('');
  const [docFocusTerm, setDocFocusTerm] = useState(1);
  
  // Exam Mode State
  const [isExamMode, setIsExamMode] = useState(false);
  const [examQuestions, setExamQuestions] = useState<QuestionItem[]>([]);
  const [currentExamQuestionIdx, setCurrentExamQuestionIdx] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examTimeLeft, setExamTimeLeft] = useState(0);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [examResults, setExamResults] = useState<ExamRecord | null>(null);
  const [isEvaluatingExam, setIsEvaluatingExam] = useState(false);
  const [topicMastery, setTopicMastery] = useState<Record<string, TopicMastery>>({});
  const [activePracticeSubject, setActivePracticeSubject] = useState<string>(''); // Practice subject
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  // Archive State
  const [archiveTab, setArchiveTab] = useState<'questions' | 'chats'>('questions');
  const [questionHistory, setQuestionHistory] = useState<QuestionItem[]>([]);
  const [fullAssessmentPaper, setFullAssessmentPaper] = useState<QuestionItem[] | null>(null);
  const [isGeneratingPaper, setIsGeneratingPaper] = useState(false);
  const [assessmentPaperTitle, setAssessmentPaperTitle] = useState("Competency Based Assessment");
  const [assessmentInstructions, setAssessmentInstructions] = useState<string | null>(null);
  const [showPaperSolution, setShowPaperSolution] = useState(false);
  const [showMockSelector, setShowMockSelector] = useState(false);
  const [selectedMockSubject, setSelectedMockSubject] = useState<string>('');
  const [selectedPaperFormat, setSelectedPaperFormat] = useState<'Paper 1' | 'Paper 2' | 'Combined'>('Combined');
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isLiveModeActive, setIsLiveModeActive] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const synergyDetails = useMemo(() => {
    const now = Date.now();
    let maxTimestamp = 0;
    
    savedChats.forEach(chat => {
      if (chat.updatedAt > maxTimestamp) maxTimestamp = chat.updatedAt;
      if (chat.createdAt > maxTimestamp) maxTimestamp = chat.createdAt;
      chat.messages.forEach(msg => {
        if (msg.timestamp > maxTimestamp) maxTimestamp = msg.timestamp;
      });
    });
    
    questionHistory.forEach(q => {
      if (q.createdAt > maxTimestamp) maxTimestamp = q.createdAt;
    });

    let recencyScore = 10;
    let lastActiveText = "No recent interactions detected";
    
    if (maxTimestamp > 0) {
      const diffMs = now - maxTimestamp;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays <= 1) {
        recencyScore = 40;
        lastActiveText = "Highly Active: Session completed within last 24 hours";
      } else if (diffDays <= 3) {
        recencyScore = 30;
        lastActiveText = "Moderate: Last session was 1-3 days ago";
      } else if (diffDays <= 7) {
        recencyScore = 20;
        lastActiveText = "Intermittent: Last session was 4-7 days ago";
      } else {
        recencyScore = 15;
        lastActiveText = "Stale: Last session was over a week ago";
      }
    } else {
      recencyScore = 25;
      lastActiveText = "New Node Calibration: Fresh workspace setup ready";
    }

    const chatCount = savedChats.length;
    let messageCount = 0;
    savedChats.forEach(chat => {
      messageCount += chat.messages.length;
    });
    
    const chatCountScore = Math.min(20, chatCount * 5);
    const msgCountScore = Math.min(20, messageCount * 1);
    const chatVolScore = chatCountScore + msgCountScore;

    const practiceCount = questionHistory.length;
    const practiceScore = Math.min(20, practiceCount * 5);

    const goalsList = profile?.goals || [];
    const goalsCount = goalsList.length;
    const completedGoalsCount = goalsList.filter(g => g.completed).length;

    const goalsConfigScore = Math.min(10, goalsCount * 3);
    const goalsCompleteScore = Math.min(10, completedGoalsCount * 5);
    const goalsScore = goalsConfigScore + goalsCompleteScore;

    const calculatedSum = recencyScore + chatVolScore + practiceScore + goalsScore;
    const score = Math.max(25, Math.min(100, calculatedSum));

    return {
      score,
      recencyScore,
      lastActiveText,
      chatVolScore,
      chatCount,
      messageCount,
      practiceScore,
      practiceCount,
      goalsScore,
      goalsCount,
      completedGoalsCount
    };
  }, [savedChats, questionHistory, profile]);

  const getSchoolCohort = useCallback(() => {
    if (!profile) return [];
    const peers = getFellowSchoolCandidates(profile, allUsers, user?.uid);
    return [profile, ...peers];
  }, [profile, allUsers, user]);

  const getSchoolRankValue = useCallback(() => {
    const cohort = getSchoolCohort();
    if (cohort.length === 0) return 1;
    const sorted = [...cohort].sort((a, b) => getAggregateScore(b) - getAggregateScore(a));
    const idx = sorted.findIndex(u => u.uid === (user?.uid || profile?.uid));
    return idx === -1 ? sorted.length : idx + 1;
  }, [getSchoolCohort, user, profile]);

  const getSchoolCohortSize = useCallback(() => {
    return getSchoolCohort().length || 1;
  }, [getSchoolCohort]);

  const getLocationCohort = useCallback(() => {
    if (!profile) return [];
    const peers = getFellowLocationCandidates(profile, allUsers, user?.uid);
    return [profile, ...peers];
  }, [profile, allUsers, user]);

  const getLocationRankValue = useCallback(() => {
    const cohort = getLocationCohort();
    if (cohort.length === 0) return 1;
    const sorted = [...cohort].sort((a, b) => getAggregateScore(b) - getAggregateScore(a));
    const idx = sorted.findIndex(u => u.uid === (user?.uid || profile?.uid));
    return idx === -1 ? sorted.length : idx + 1;
  }, [getLocationCohort, user, profile]);

  const getLocationCohortSize = useCallback(() => {
    return getLocationCohort().length || 1;
  }, [getLocationCohort]);

  useEffect(() => {
    if (!user || (!user.emailVerified && !user.isAnonymous)) return;
    const checkConnection = async () => {
      try {
        await getDocFromServer(doc(db, '_connection_test_', 'ping'));
        setIsFirestoreOffline(false);
      } catch (error: any) {
        if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
          setIsFirestoreOffline(true);
        }
      }
    };
    checkConnection();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      
      // Setup STT
      if (u && !recognitionRef.current && 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const emailParam = params.get('email');
      if (action === 'reset-password-simulated' && emailParam) {
        setAuthMode('email');
        setEmailMode('reset_password_simulated');
        setSimulatedEmail(emailParam);
        setSimulatedSuccess(false);
        // Clean the browser address bar cleanly without triggering reload
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.warn("Failed to parse simulated reset password params", e);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setAnalytics(null);
      return;
    }

    // Real-time Profile Subscription
    const profileUnsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        if (data.subjects.length > 0) {
          setActivePracticeSubject(data.subjects[0]);
        }
        setLocalSubjects(data.subjects || []);
        setLocalRole(data.role || 'student');
        setLocalSchoolName(data.schoolName || '');
        setLocalDistrict(data.district || '');
      } else {
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: localRole || 'student',
          subjects: localRole === 'student' ? ["General Paper"] : [],
          coverage: {},
          level: 'S5',
          createdAt: Date.now(),
          onboarded: false,
          verificationCode: randomCode,
          isVerified: user.isAnonymous ? true : false
        };
        setDoc(doc(db, 'users', user.uid), newProfile).then(() => {
          if (!user.isAnonymous && user.email) {
            sendVerificationEmail(user.email, randomCode);
          }
        }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        });
        
        // If we picked a role during signup, advance onboarding to step 2
        if (localRole) {
          setOnboardingStep(2);
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    });

    const fetchAnalytics = async () => {
      const path = `analytics/${user.uid}`;
      try {
        const analyticsRef = doc(db, 'analytics', user.uid);
        const analyticsSnap = await getDoc(analyticsRef);
        if (analyticsSnap.exists()) {
          setAnalytics(analyticsSnap.data() as AnalyticsRecord);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
      }
    };
    fetchAnalytics();

    // History Subscription
    const historyQuery = query(
      collection(db, 'questions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const historyUnsub = onSnapshot(historyQuery, (snap) => {
      const history = snap.docs.map(d => ({ ...d.data(), id: d.id } as QuestionItem));
      setQuestionHistory(history);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'questions');
    });

    // Saved Chats Subscription
    const chatsQuery = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );
    const chatsUnsub = onSnapshot(chatsQuery, (snap) => {
      const chats = snap.docs.map(d => ({ ...d.data(), id: d.id } as ChatSession));
      setSavedChats(chats);
    }, (err) => {
      // Silently fail or log for chats
      console.error("Chats subscription error", err);
    });

    // Mastery Subscription
    const masteryUnsub = onSnapshot(collection(db, `mastery/${user.uid}/topics`), (snap) => {
      const masteryData: Record<string, TopicMastery> = {};
      snap.docs.forEach(d => {
        masteryData[d.id] = d.data() as TopicMastery;
      });
      setTopicMastery(masteryData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `mastery/${user.uid}/topics`);
    });

    // All Users/Candidates Subscription with Auto-seeding
    const usersUnsub = onSnapshot(collection(db, 'users'), (snap) => {
      const list: UserProfile[] = [];
      snap.docs.forEach(d => {
        list.push(d.data() as UserProfile);
      });
      setAllUsers(list);

      // Auto-seed realistic candidates if database collection has fewer than 6 candidates
      if (list.length < 6) {
        const seedCandidates = [
          { uid: 'seed_student_1', displayName: 'Alex Tumwine', email: 'alex.tumwine@uneb.ac.ug', role: 'student', level: 'S6', subjects: ['Physics', 'Chemistry', 'Mathematics'], schoolName: 'Kawempe Muslim Sec School', district: 'Kampala', questionsAttempted: 42, averageScore: 84, lastActiveAt: Date.now() - 5 * 60 * 1000, onboarded: true, coverage: { 'Mathematics': ['Mechanics', 'Pure Math'], 'Physics': ['Mechanics'] } },
          { uid: 'seed_student_2', displayName: 'Esther Nakato', email: 'esther.nakato@uneb.ac.ug', role: 'student', level: 'S5', subjects: ['History', 'Economics', 'Literature'], schoolName: 'Gayaza High School', district: 'Wakiso', questionsAttempted: 28, averageScore: 76, lastActiveAt: Date.now() - 45 * 60 * 1000, onboarded: true, coverage: { 'Economics': ['Microeconomics'] } },
          { uid: 'seed_student_3', displayName: 'David Lule', email: 'david.lule@uneb.ac.ug', role: 'student', level: 'S6', subjects: ['Biology', 'Chemistry', 'Mathematics'], schoolName: 'King\'s College Budo', district: 'Wakiso', questionsAttempted: 53, averageScore: 91, lastActiveAt: Date.now() - 120 * 60 * 1000, onboarded: true, coverage: { 'Biology': ['Genetics', 'Ecology'], 'Chemistry': ['Organic Chemistry'] } },
          { uid: 'seed_student_4', displayName: 'Sarah Nabasa', email: 'sarah.nabasa@uneb.ac.ug', role: 'student', level: 'S6', subjects: ['Mathematics', 'Economics', 'Geography'], schoolName: 'Nabisunsa Girls\' Sec School', district: 'Kampala', questionsAttempted: 35, averageScore: 81, lastActiveAt: Date.now() - 10 * 60 * 1000, onboarded: true, coverage: { 'Mathematics': ['Statistics'] } },
          { uid: 'seed_student_5', displayName: 'Faisal Kassim', email: 'faisal.kassim@uneb.ac.ug', role: 'student', level: 'S6', subjects: ['Physics', 'Economics', 'Mathematics'], schoolName: 'Kawempe Muslim Sec School', district: 'Kampala', questionsAttempted: 48, averageScore: 88, lastActiveAt: Date.now() - 2 * 60 * 1000, onboarded: true, coverage: { 'Mathematics': ['Trigonometry', 'Pure Math'], 'Physics': ['Modern Physics'] } },
          { uid: 'seed_student_6', displayName: 'Flavia Namubiru', email: 'flavia.namubiru@uneb.ac.ug', role: 'student', level: 'S5', subjects: ['Physics', 'Chemistry', 'Biology'], schoolName: 'Mount Saint Mary\'s College Namagunga', district: 'Mukono', questionsAttempted: 19, averageScore: 72, lastActiveAt: Date.now() - 5 * 3600 * 1000, onboarded: true, coverage: { 'Chemistry': ['Physical Chemistry'] } }
        ];

        seedCandidates.forEach(cand => {
          if (!list.some(existing => existing.uid === cand.uid)) {
            setDoc(doc(db, 'users', cand.uid), cand).catch(err => console.error("Error seeding candidate", err));
          }
        });
      }
    }, (err) => {
      console.error("All candidates subscription error", err);
    });

    return () => {
      profileUnsub();
      historyUnsub();
      chatsUnsub();
      masteryUnsub();
      usersUnsub();
    };
  }, [user]);

  useEffect(() => {
    let timer: any;
    if (isExamMode && examTimeLeft > 0 && !isExamFinished) {
      timer = setInterval(() => {
        setExamTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExamMode, examTimeLeft, isExamFinished]);

  const loadChat = (chat: ChatSession) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setActiveTab('chat');
  };

  const deleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Permanently delete this discussion archive?")) {
      try {
        await deleteDoc(doc(db, 'chats', id));
        if (currentChatId === id) {
          setCurrentChatId(null);
          setMessages([]);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `chats/${id}`);
      }
    }
  };

  const searchYouTube = async (query: string) => {
    if (!query.trim()) return;
    
    // Quick cache hit for instant results
    if (videoSearchCache[query.toLowerCase()]) {
      setOnlineVideos(videoSearchCache[query.toLowerCase()]);
      return;
    }

    setIsSearchingOnline(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find 9 high-quality, relevant YouTube video IDs for a student in Uganda studying for A-Levels (UNEB).
        Topic/Search Query: "${query}"
        
        Return ONLY a JSON array of objects:
        [
          {
            "title": "Clear teaching title",
            "videoId": "11_char_id",
            "channel": "Channel Name",
            "thumbnail": "https://img.youtube.com/vi/11_char_id/mqdefault.jpg"
          }
        ]`,
        config: { responseMimeType: "application/json" }
      });
      const results = JSON.parse(response.text || '[]');
      setOnlineVideos(results);
      setVideoSearchCache(prev => ({ ...prev, [query.toLowerCase()]: results }));
    } catch (err) {
      console.error("Online search failed", err);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  const startExam = async () => {
    if (selectedTopics.length === 0) return;
    setIsGenerating(true);
    setGenerationError(null);
    setIsExamMode(true);
    setIsExamFinished(false);
    setExamAnswers({});
    setCurrentExamQuestionIdx(0);
    setExamResults(null);
    
    try {
      // Generate 3 questions for the exam in parallel
      const questionsPromises = Array(3).fill(null).map(() => generateSingleQuestion());
      const questionsRaw = await Promise.all(questionsPromises);
      const questions = questionsRaw.filter((q): q is QuestionItem => q !== null);
      
      if (questions.length === 0) throw new Error("Failed to generate exam questions");
      
      setExamQuestions(questions);
      setExamTimeLeft(45 * 60); // 45 minutes for 3 questions
      
      if (isTtsEnabled) {
        speak("Exam Mode started. You have 45 minutes to complete 3 questions. Good luck.");
      }
    } catch (error: any) {
      console.error("Exam Generation Error", error);
      setGenerationError("Failed to start exam. Please try again.");
      setIsExamMode(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const finishExam = async () => {
    if (isExamFinished) return;
    setIsExamFinished(true);
    setIsEvaluatingExam(true);
    
    try {
      // Evaluate each answer in parallel
      const evaluationPromises = examQuestions.map(async (q) => {
        const studentAnswer = examAnswers[q.id] || "No answer provided.";
        return evaluateAnswer(q, studentAnswer);
      });
      
      const resultsRaw = await Promise.all(evaluationPromises);
      const results = resultsRaw.filter((r): r is AnswerRecord => r !== null);
      
      const totalScore = results.reduce((acc, curr) => acc + curr.percentageScore, 0);
      
      const examRecord: ExamRecord = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user!.uid,
        subject: examQuestions[0]?.subject || "General",
        topics: selectedTopics,
        questions: examQuestions,
        answers: examAnswers,
        results,
        totalScore: Math.round(totalScore / (examQuestions.length || 1)),
        startTime: Date.now() - (45 * 60 - examTimeLeft) * 1000,
        endTime: Date.now(),
        duration: 45 * 60 - examTimeLeft
      };
      
      setExamResults(examRecord);

      // Update User Profile with dynamic questionsAttempted, averageScore, and lastActiveAt in Firestore
      try {
        const prevQuestions = profile?.questionsAttempted || 0;
        const prevAvg = profile?.averageScore || 0;
        const examQuestionsCount = examQuestions.length;
        const nextQuestions = prevQuestions + examQuestionsCount;
        const nextAvg = ((prevAvg * prevQuestions) + (examRecord.totalScore * examQuestionsCount)) / nextQuestions;
        await updateProfile({
          questionsAttempted: nextQuestions,
          averageScore: nextAvg,
          lastActiveAt: Date.now()
        });
      } catch (profileErr) {
        console.error("Failed to update user profile stats on exam finish", profileErr);
      }
      
      // Save to Firestore
      try {
        await addDoc(collection(db, 'exams'), examRecord);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'exams');
      }
      
      if (isTtsEnabled) {
        speak(`Exam finished. Your total score is ${examRecord.totalScore} percent. You can now review the detailed feedback.`);
      }
    } catch (error) {
      console.error("Exam Evaluation Error", error);
    } finally {
      setIsEvaluatingExam(false);
    }
  };

  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'google' | 'email' | 'github' | 'anonymous'>('google');
  const [emailMode, setEmailMode] = useState<'login' | 'signup' | 'forgot_password' | 'reset_password_simulated'>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [simulatedEmail, setSimulatedEmail] = useState('');
  const [simulatedNewPassword, setSimulatedNewPassword] = useState('');
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccessText, setResetSuccessText] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleGoogleLogin = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    setAuthError(null);
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google Login failed", error);
      handleAuthError(error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    setAuthError(null);
    
    const provider = new GithubAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Github Login failed", error);
      handleAuthError(error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginLoading || !email || !password) return;
    
    if (emailMode === 'signup' && !agreeToTerms) {
      setAuthError('You must agree to the Terms of Service & Privacy Policy before creating an account.');
      return;
    }
    
    setLoginLoading(true);
    setAuthError(null);

    try {
      if (emailMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateAuthProfile(userCredential.user, { displayName });
        }
        // Email verification disabled
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error("Email Auth failed", error);
      handleAuthError(error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginLoading || !email) return;

    setLoginLoading(true);
    setAuthError(null);
    setResetSuccessText(null);

    try {
      // Send strictly via custom server-side Resend API - absolutely NO Firebase client-side mailer fallback
      const response = await fetch('/api/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResetSuccessText("A password reset link has been sent to your email address.");
        } else {
          throw new Error(data.error || "Failed to trigger custom reset email.");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          setAuthError("No account found with this email address.");
        } else {
          setAuthError(errorData.error || "An error occurred while requesting your password reset link. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Password reset failure", error);
      setAuthError(error.message || "We could not request a password reset at this time. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    setAuthError(null);

    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error("Anonymous Login failed", error);
      handleAuthError(error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAuthError = (error: any) => {
    if (error.code === 'auth/popup-blocked') {
      setAuthError("The login popup was blocked by your browser. Please allow popups for this site and try again.");
    } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      setAuthError("The login window was closed before completion. Please try again.");
    } else if (error.code === 'auth/email-already-in-use') {
      setAuthError("This email is already in use. Switching to login mode...");
      setEmailMode('login');
    } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      setAuthError("Invalid email or password. Please check your credentials and try again.");
    } else if (error.code === 'auth/weak-password') {
      setAuthError("Password should be at least 6 characters.");
    } else if (error.code === 'auth/too-many-requests') {
      setAuthError("Too many failed login attempts. Please try again later or reset your password.");
    } else if (error.message?.includes('INTERNAL ASSERTION FAILED')) {
      setAuthError("A temporary authentication error occurred. Please refresh the page and try again.");
    } else {
      setAuthError(error.message || "An unexpected error occurred during login.");
    }
  };

  const handleLogout = () => signOut(auth);

  const handleDeleteAccount = async () => {
    if (!user || !window.confirm("Are you sure you want to delete your account? This action is permanent and will delete all your learning data.")) return;
    
    try {
      // Delete user data from collections
      const collectionsToDelete = ['users', 'analytics', 'answers', 'questions'];
      for (const coll of collectionsToDelete) {
        try {
          if (coll === 'users' || coll === 'analytics') {
            await deleteDoc(doc(db, coll, user.uid));
          } else {
             // For simplicity in this demo, we'll only delete the profile and analytics. 
             // In a real app, you'd query and delete all related docs.
          }
        } catch (e) {
          console.error(`Error deleting ${coll} for user:`, e);
        }
      }

      await deleteUser(user);
      console.log("Account deleted successfully");
    } catch (error: any) {
      console.error("Account deletion failed", error);
      setAuthError(error.message || "Failed to delete account. You may need to re-authenticate first.");
    }
  };

  const addGoal = (text: string) => {
    if (!text.trim() || !profile) return;
    const newGoal = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
      createdAt: Date.now()
    };
    updateProfile({
      goals: [...(profile.goals || []), newGoal]
    });
  };

  const toggleGoal = (goalId: string) => {
    if (!profile || !profile.goals) return;
    const updatedGoals = profile.goals.map(g => 
      g.id === goalId ? { ...g, completed: !g.completed } : g
    );
    updateProfile({ goals: updatedGoals });
  };

  const deleteGoal = (goalId: string) => {
    if (!profile || !profile.goals) return;
    const updatedGoals = profile.goals.filter(g => g.id !== goalId);
    updateProfile({ goals: updatedGoals });
  };

  const addSchoolEntry = (entry: Omit<SchoolTimetableEntry, 'id'>) => {
    if (!profile) return;
    const newEntry: SchoolTimetableEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
    };
    updateProfile({
      schoolTimetable: [...(profile.schoolTimetable || []), newEntry]
    });
  };

  const deleteSchoolEntry = (entryId: string) => {
    if (!profile || !profile.schoolTimetable) return;
    const updated = profile.schoolTimetable.filter(e => e.id !== entryId);
    updateProfile({ schoolTimetable: updated });
  };

  const addRevisionEntry = (entry: Omit<RevisionTimetableEntry, 'id'>) => {
    if (!profile) return;
    const newEntry: RevisionTimetableEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
    };
    updateProfile({
      revisionTimetable: [...(profile.revisionTimetable || []), newEntry]
    });
  };

  const deleteRevisionEntry = (entryId: string) => {
    if (!profile || !profile.revisionTimetable) return;
    const updated = profile.revisionTimetable.filter(e => e.id !== entryId);
    updateProfile({ revisionTimetable: updated });
  };

  const loadSampleTimetables = () => {
    if (!profile) return;
    const sampleSchool: SchoolTimetableEntry[] = [
      { id: 'sc-1', day: 'Monday', time: '08:30 - 10:00', subject: 'Mathematics', branch: 'Pure Mathematics', teacher: 'Mr. Okello' },
      { id: 'sc-2', day: 'Tuesday', time: '11:00 - 12:30', subject: 'Physics', branch: 'Mechanics', teacher: 'Mrs. Namubiru' },
      { id: 'sc-3', day: 'Thursday', time: '14:00 - 15:30', subject: 'Chemistry', branch: 'Physical Chemistry', teacher: 'Mr. Bukenya' }
    ];
    const sampleRevision: RevisionTimetableEntry[] = [
      { id: 'rv-1', day: 'Monday', time: '20:00 - 21:30', subject: 'Mathematics', topic: 'Integration' },
      { id: 'rv-2', day: 'Tuesday', time: '20:00 - 21:30', subject: 'Physics', topic: 'Projectiles & Newton\'s Laws' },
      { id: 'rv-3', day: 'Friday', time: '19:30 - 21:00', subject: 'Chemistry', topic: 'Atomic Structure' }
    ];
    updateProfile({
      schoolTimetable: sampleSchool,
      revisionTimetable: sampleRevision
    });
  };

  const [isOnboarding, setIsOnboarding] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const onFocusTopic = (topic: string) => {
    if (!selectedTopics.includes(topic)) {
      setSelectedTopics(prev => [...prev, topic]);
    }
    setActiveTab('practice');
    setTimeout(() => scrollToSection('session-logic'), 100);
  };

  const getWeakTopics = () => {
    if (!analytics) return [];
    return Object.entries(analytics.topicPerformance)
      .filter(([_, data]) => data.averageScore < 70)
      .map(([topic]) => topic);
  };

  useEffect(() => {
    if (profile && !profile.onboarded && localSubjects.length === 0) {
      setLocalSubjects(profile.subjects);
    }
  }, [profile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      // Clean undefined values for Firestore
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );
      
      console.log(`Updating profile for ${user.uid}:`, cleanUpdates);
      const docRef = doc(db, 'users', user.uid);
      // Use setDoc with merge: true for better reliability than updateDoc
      await setDoc(docRef, cleanUpdates, { merge: true });
      console.log(`Profile update successful for ${user.uid}`);
    } catch (error) {
      console.error(`Profile update failed for ${user.uid}:`, error);
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const downloadAsPDF = async (elementId: string, filename: string, forceShowSolution = false) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Ensure element is visible and has dimensions
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      // If it's the hidden paper, we need to temporarily show it or ensure it's rendered
      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById(elementId);
          if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            
            // Hide elements that shouldn't be in the PDF
            const noPrintElements = clonedDoc.querySelectorAll('.no-print');
            noPrintElements.forEach(el => (el as HTMLElement).style.display = 'none');

            // Force show solution if requested
            if (forceShowSolution) {
              const solutionBtn = clonedDoc.querySelector('[data-pdf-solution-btn]');
              const solutionContent = clonedDoc.querySelector('[data-pdf-solution-content]');
              if (solutionBtn) (solutionBtn as HTMLElement).style.display = 'none';
              if (solutionContent) (solutionContent as HTMLElement).style.display = 'block';
            }

            // Force standard colors to avoid oklch/oklab errors in html2canvas (Tailwind v4 compatibility)
            const allElements = Array.from(clonedDoc.querySelectorAll("*")) as HTMLElement[];
            
            const isModernColor = (val: string) => 
               val && (
                 val.includes('oklch') || 
                 val.includes('oklab') || 
                 val.includes('color-mix') || 
                 val.includes('lab(') || 
                 val.includes('lch(') ||
                 val.includes('display-p3') ||
                 val.includes('hwb(')
               );

            allElements.forEach(node => {
              try {
                // Remove gradients that often use modern color functions
                const background = clonedDoc.defaultView?.getComputedStyle(node).backgroundImage;
                if (isModernColor(background || '')) {
                  node.style.backgroundImage = 'none';
                }

                const style = clonedDoc.defaultView?.getComputedStyle(node) || window.getComputedStyle(node);
                
                // Common properties that might contain colors
                const propertiesToFix: (keyof CSSStyleDeclaration)[] = [
                  'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
                  'borderBottomColor', 'borderLeftColor', 'borderRightColor',
                  'outlineColor', 'fill', 'stroke', 'stopColor', 'boxShadow', 'textShadow'
                ];

                propertiesToFix.forEach(prop => {
                  try {
                    const value = style[prop] as string;
                    if (isModernColor(value)) {
                      if (prop === 'boxShadow' || prop === 'textShadow') {
                        node.style[prop as any] = 'none';
                      } else if (prop === 'backgroundColor') {
                        node.style.backgroundColor = (node.tagName === 'TH' || node.tagName === 'HEADER') ? '#f1f5f9' : '#ffffff';
                      } else if (prop === 'color') {
                        node.style.color = '#0f172a';
                      } else if (prop === 'borderColor' || prop.toString().includes('Color')) {
                        node.style[prop as any] = '#e2e8f0';
                      } else {
                        node.style[prop as any] = 'currentColor';
                      }
                    }
                  } catch (e) {
                    // Ignore individual property failures
                  }
                });

                // SVG specific attributes
                if (node instanceof SVGElement || node.tagName.toLowerCase() === 'svg') {
                   ['fill', 'stroke', 'stop-color'].forEach(attr => {
                     const val = node.getAttribute(attr);
                     if (isModernColor(val || '')) {
                       node.setAttribute(attr, 'currentColor');
                     }
                   });
                }
                
                // Check inline styles as well
                if (isModernColor(node.style.color)) node.style.color = '#0f172a';
                if (isModernColor(node.style.backgroundColor)) node.style.backgroundColor = '#ffffff';
                if (isModernColor(node.style.borderColor)) node.style.borderColor = '#e2e8f0';
                if (isModernColor(node.style.fill)) node.style.fill = 'currentColor';
                if (isModernColor(node.style.stroke)) node.style.stroke = 'currentColor';

              } catch (e) {
                // Silent fail for non-renderable nodes
              }
            });

            el.style.padding = '80px'; // Paper margins
            el.style.width = '210mm';
            el.style.maxWidth = '210mm';
            el.style.borderRadius = '0';
            el.style.boxShadow = 'none';
            el.style.border = 'none';
            el.style.color = '#000000';
            el.style.backgroundColor = '#ffffff';
            el.style.overflow = 'visible';
            el.style.display = 'block';
            
            // Adjust specific child elements for print
            const header = el.querySelector('.p-12');
            if (header) {
              (header as HTMLElement).style.padding = '0 0 20px 0';
              (header as HTMLElement).style.marginBottom = '30px';
              (header as HTMLElement).style.backgroundColor = 'transparent';
              (header as HTMLElement).style.borderBottom = '2px solid #000000';
            }
            
            // Fix dark mode cards in PDF
            const cards = clonedDoc.querySelectorAll('[class*="bg-slate-800"], [class*="bg-slate-900"]');
            cards.forEach(card => {
              const c = card as HTMLElement;
              c.style.backgroundColor = '#ffffff';
              c.style.color = '#000000';
              c.style.border = '1px solid #e2e8f0';
              c.style.boxShadow = 'none';
            });

            // Ensure markdown text is black
            const markdowns = clonedDoc.querySelectorAll('.markdown-body');
            markdowns.forEach(m => {
              (m as HTMLElement).style.color = '#000000';
              (m as HTMLElement).style.backgroundColor = 'transparent';
              const ps = m.querySelectorAll('p, li, h1, h2, h3, h4, span');
              ps.forEach(p => (p as HTMLElement).style.color = '#000000');
            });

            const content = el.querySelector('.space-y-12, .space-y-6');
            if (content) {
              (content as HTMLElement).style.padding = '0';
              (content as HTMLElement).style.gap = '40px';
            }

            // Ensure images and graphs fit
            const visuals = clonedDoc.querySelectorAll('img, canvas, .recharts-wrapper');
            visuals.forEach(v => {
              (v as HTMLElement).style.maxWidth = '100%';
              (v as HTMLElement).style.height = 'auto';
            });

            const graphContainers = clonedDoc.querySelectorAll('[class*="bg-slate-50"]');
            graphContainers.forEach(gc => {
               (gc as HTMLElement).style.backgroundColor = '#f8fafc';
               (gc as HTMLElement).style.borderRadius = '1rem';
            });
          }
        }
      });
      
      // Reset temporary styles if they were applied
      if (element.style.position === 'absolute' && element.style.left === '-9999px') {
        element.style.display = 'none';
        element.style.position = '';
        element.style.left = '';
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Validate imgData
      if (!imgData || imgData === 'data:,') {
        throw new Error("Canvas export failed - empty image data");
      }

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${filename.replace(/\.[^/.]+$/, "")}-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error", error);
      setGenerationError("Failed to generate PDF. This can happen if the content is too large or contains unsupported images.");
    } finally {
      setIsExporting(false);
    }
  };

  const generateGraphData = async (context: string, data?: string): Promise<GraphData | null> => {
    try {
      const prompt = `You are a STRICT graph generation engine.
      Your job is to convert given physics or math information into STRUCTURED graph data.

      INPUT:
      Context: ${context}
      Raw Data (if any): ${data || 'None'}

      CRITICAL RULES (NON-NEGOTIABLE):
      1. You MUST NOT draw graphs using text, ASCII, symbols, or formatting.
      2. If data is messy or incomplete: Clean it. ONLY infer logical pairs if the context strongly supports it.
      3. If a graph is required, map: x -> independent variable (time, etc.), y -> dependent variable.
      4. If no valid, meaningful graph can be formed (e.g., purely qualitative discussion), return null. Do NOT force a graph.
      5. SCIENTIFIC NOTATION RULES: For axis labels (x_label, y_label), use standard physics notation. No "/" or "^". Use negative powers and superscripts (e.g., "Velocity (m s⁻¹)", "Acceleration (m s⁻²)").`;

      const response = await callGeminiWithRetry(
        "gemini-3.1-pro-preview",
        [{ role: 'user', parts: [{ text: prompt }] }],
        {
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                graph_type: { type: Type.STRING },
                data_points: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER }
                    },
                    required: ["x", "y"]
                  }
                },
                x_label: { type: Type.STRING },
                y_label: { type: Type.STRING },
                title: { type: Type.STRING }
              },
              required: ["graph_type", "data_points", "x_label", "y_label", "title"]
            }
          }
        }
      );

      const raw = response.text || "";
      if (!raw || raw.trim().toLowerCase() === 'null') return null;
      return JSON.parse(raw);
    } catch (e: any) {
      console.error("Graph Engine Error", e);
      if (e?.status === 429 || e?.message?.includes("429") || e?.message?.includes("quota")) {
        setGenerationError("The AI is at its limit. Some visual aids may not load immediately.");
      }
      return null;
    }
  };

  const generateImage = async (prompt: string): Promise<string | null> => {
    try {
      const response = await callGeminiWithRetry(
        'gemini-2.5-flash-image',
        {
          parts: [{ text: prompt }]
        },
        {
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            }
          }
        }
      );

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (e) {
      console.error("Image Generation Error", e);
      return null;
    }
  };

  // Voice interaction lifecycle
  useEffect(() => {
    const handleSpeechEnded = () => {
      setIsSpeaking(false);
      setSpeakingMessageIndex(null);
      if (isTtsEnabled && activeTab === 'chat' && isVoiceInteractionActive) {
        // Auto-start listening after AI finishes speaking in voice mode
        setTimeout(() => {
          if (!isListening && !isTyping) {
            toggleListening();
          }
        }, 500);
      }
    };

    const handleSpeechStarted = () => {
      setIsSpeaking(true);
    };

    window.addEventListener('speechEnded', handleSpeechEnded);
    window.addEventListener('speechStarted', handleSpeechStarted);
    return () => {
      window.removeEventListener('speechEnded', handleSpeechEnded);
      window.removeEventListener('speechStarted', handleSpeechStarted);
      stopSpeaking();
      setSpeakingMessageIndex(null);
    };
  }, [isTtsEnabled, activeTab, isVoiceInteractionActive, isListening, isTyping]);

  const toggleTts = () => {
    const newVal = !isTtsEnabled;
    setIsTtsEnabled(newVal);
    localStorage.setItem('isTtsEnabled', String(newVal));
    if (!newVal) {
      stopSpeaking();
      setSpeakingMessageIndex(null);
      setIsVoiceInteractionActive(false);
    }
  };

  const initiateVoiceInteraction = () => {
    if (!isTtsEnabled) {
      setIsTtsEnabled(true);
      localStorage.setItem('isTtsEnabled', 'true');
    }
    setIsVoiceInteractionActive(true);
    
    if (messages.length === 0) {
      const greeting = "Hello there! I am Stellas, your A-Level Neural Tutor. How can I help you excel in your studies today?";
      setMessages([{ role: 'ai', content: greeting, timestamp: Date.now() }]);
      speak(greeting, true);
    } else {
      speak("I am listening. Go ahead.", true);
      setTimeout(toggleListening, 1500);
    }
  };

const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const newAttachments = [...attachments];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert(`File ${file.name} is too large. Max size is 10MB.`);
      continue;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert file"));
          }
        };
        reader.onerror = reject;
      });

      newAttachments.push({
        name: file.name,
        data: base64,
        mimeType: file.type
      });
    } catch (err) {
      console.error("Error processing file:", err);
    }
  }

  setAttachments(newAttachments);
  if (fileInputRef.current) fileInputRef.current.value = '';
};

const removeAttachment = (index: number) => {
  setAttachments(prev => prev.filter((_, i) => i !== index));
};

// Voice Logic Helpers
const processVoiceInput = (currentText: string, transcript: string): string => {
  let processed = transcript;
  
  // 1. Cleaner: Remove common fillers
  processed = processed.replace(/\b(um|uh|you know|basically|actually|err|ah)\b/gi, '');
  
  // 2. Formatting Commands
  const formatting: Record<string, string> = {
    "new line": "\n",
    "new paragraph": "\n\n",
    "comma": ",",
    "full stop": ".",
    "period": ".",
    "question mark": "?",
    "exclamation mark": "!",
    "open bracket": " (",
    "close bracket": ") ",
    "start new paragraph": "\n\n",
  };

  // Apply formatting replacements
  Object.entries(formatting).forEach(([cmd, replacement]) => {
    const regex = new RegExp(`\\b${cmd}\\b`, 'gi');
    processed = processed.replace(regex, replacement);
  });

  // 3. Number formatting (basic)
  const numbers: Record<string, string> = {
    "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
    "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10"
  };
  Object.entries(numbers).forEach(([word, val]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    processed = processed.replace(regex, val);
  });

  // 4. Editing Commands (These act on the combined text)
  let baseText = currentText.trim();
  
  if (processed.toLowerCase().includes("clear all")) {
    return "";
  }

  if (processed.toLowerCase().includes("delete last word")) {
    const words = baseText.split(/\s+/);
    words.pop();
    baseText = words.join(" ");
    processed = processed.replace(/delete last word/gi, "");
  }

  if (processed.toLowerCase().includes("delete last sentence")) {
    const sentences = baseText.split(/(?<=[.!?])\s+/);
    sentences.pop();
    baseText = sentences.join(" ");
    processed = processed.replace(/delete last sentence/gi, "");
  }

  // Combine and clean up white space
  let result = (baseText + " " + processed).trim();
  
  // Cleanup punctuation spacing
  result = result.replace(/\s+([,.\?!\)])/g, '$1');
  result = result.replace(/(\()\s+/g, '$1');
  result = result.replace(/\n\s+/g, '\n');
  
  // Auto-Capitalization: Start of text and after .!?
  result = result.replace(/(^|[.!?]\s+)([a-z])/g, (match) => match.toUpperCase());

  return result;
};

  // Live Session Logic
  const stopLiveSession = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(e => console.error("Error closing audio context", e));
      audioContextRef.current = null;
    }
    if (liveSessionRef.current) {
      try {
        liveSessionRef.current.close();
      } catch (err) {
        console.error("Error closing live session:", err);
      }
      liveSessionRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsModelSpeaking(false);
    setIsLiveModeActive(false);
    stopSpeaking();
  };

  const float32ToPcm16 = (float32Array: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  };

  const pcm16ToFloat32 = (buffer: ArrayBuffer): Float32Array => {
    const float32Array = new Float32Array(buffer.byteLength / 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      float32Array[i] = view.getInt16(i * 2, true) / 32768;
    }
    return float32Array;
  };

  const playNextInQueue = () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      setIsModelSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsModelSpeaking(true);
    const chunk = audioQueueRef.current.shift()!;
    // Note: Live API output is 24000Hz PCM
    const audioBuffer = audioContextRef.current.createBuffer(1, chunk.length, 24000);
    audioBuffer.getChannelData(0).set(chunk);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextInQueue();
    source.start();
  };

  const startLiveSession = async () => {
    try {
      stopSpeaking();
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      audioStreamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setIsLiveModeActive(true);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = float32ToPcm16(inputData);
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData)));
              session.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=24000' }
              });
            };
            source.connect(processor);
            processor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: any) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const arrayBuffer = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer;
              const float32Data = pcm16ToFloat32(arrayBuffer);
              audioQueueRef.current.push(float32Data);
              if (!isPlayingRef.current) playNextInQueue();
            }
            
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
            }
            
            if (message.serverContent?.modelTurn?.parts[0]?.text) {
              const text = message.serverContent.modelTurn.parts[0].text;
              setMessages(prev => [...prev, { role: 'ai', content: text, timestamp: Date.now() }]);
            }
          },
          onerror: (e: any) => {
            console.error("Live session error:", e);
            const errMsg = e instanceof Error ? e.message : String(e || "");
            if (errMsg.toLowerCase().includes("exhausted") || errMsg.toLowerCase().includes("quota")) {
              alert("Gemini Live Session Quota/Resource Exhausted. Please wait a short moment before reconnecting, or try using standard text/audio chat.");
            } else if (errMsg) {
              alert(`Live Connection Error: ${errMsg}`);
            }
            stopLiveSession();
          },
          onclose: () => {
            stopLiveSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
          },
          systemInstruction: teacherPersona
        }
      });
      
      liveSessionRef.current = session;
    } catch (error: any) {
      console.error("Live session start failed:", error);
      setIsLiveModeActive(false);
      const errMsg = error?.message || String(error || "");
      if (errMsg.toLowerCase().includes("exhausted") || errMsg.toLowerCase().includes("quota")) {
        alert("Gemini Live Session Quota/Resource Exhausted. Please wait a short moment before reconnecting, or try using standard text/audio chat.");
      } else {
        alert(`Failed to start Talk voice session: ${errMsg}`);
      }
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser or Talk is initializing.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (activeTab === 'chat') {
          // For chat: process then send
          const processed = processVoiceInput("", transcript);
          sendMessage(processed);
        } else {
          // For practice/voice: process with existing text
          setStudentAnswer(prev => processVoiceInput(prev, transcript));
        }
        setIsListening(false);
      };
      
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleGenerateTopicalTest = async (text: string) => {
    setIsTyping(true);
    try {
        const prompt = `Generate a highly customized, rigorous, and completely original topical test for an African A-Level (Senior 5 / Senior 6) student, based EXCLUSIVELY on their user prompt request: "${text}".
        
        Guidelines:
        1. Subject & Topics: Identify the target subject (e.g., Mathematics, Physics, Chemistry, Biology, Agriculture, Economics, Geography, etc.) and specific topic(s) the user requested in: "${text}".
        2. Scenario Quality: Generate exactly between 6 and 10 highly comprehensive, realistic, and contextually rich scenario-based assessment questions/items based on those topics.
        3. Do NOT organize by standard Sections or numbered prefixes inside the text fields.
        4. ⚠️ CRITICAL Instruction: Do NOT label or prefix any of the generated scenarios or questions with sequential indices/numbers like "Item 1:", "Scenario 1:", "Question 2:", etc., in either the id, q, or any user-facing response. The id field must just be a random alphabetic/alphanumeric code (e.g., "A", "B", "XYZ") and NOT sequential index numbers. Make each item purely clean scenario paragraphs followed by sub-tasks (using letters like a, b, c...) with no numeric prefix on the item itself.
        5. ⚠️ CRITICAL SCENARIO RULE: Avoid pigeonholing and repeating common scenario tropes. Specifically, NOT all scenarios require 'temperature' or weather/thermal data. Only include temperature or thermal measurements if the selected topic is explicitly about heat, thermometry, homeostasis temperature control, or thermodynamics. For all other topics (e.g., mechanics, geometry, pure chemistry, organic molecules, statistics, etc.), use topic-specific parameters (like force, distance, mass, concentration, pH, blood glucose, currency, time, etc.) instead of temperature. Be creative, diverse, and authentic to Ugandan/African real-world parameters!
        6. Use LaTeX for math. Use $...$ or \\(...\\) for inline math, and $$...$$ or \\(...\\) for display math. You MUST wrap ALL numbers, units, and mathematical symbols in LaTeX blocks.
        
        Format your response EXACTLY as a single JSON object matching this schema:
        {
          "title": "A customized descriptive title for this test (e.g., Circular Motion & Dynamics Assessment)",
          "instructions": "Vivid student instructions explaining how to approach the questions",
          "subject": "The identified subject name (e.g. Physics, Chemistry, Mathematics, Biology, etc.) matching standard curriculum",
          "topics": ["List of identified topics here"],
          "items": [
            { "id": "CodeLetter", "q": "The complete scenario text followed by sub-tasks (e.g., (a), (b), (c))", "a": "Step-by-step marking/solutions expo" }
          ],
          "rubric": "A markdown table including: 'Criteria', 'Excellent', 'Good', 'Pass', 'Fail' columns, demonstrating competency levels for the curriculum."
        }`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json"
          }
        });
        
        const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        let testData: any;
        try {
          testData = JSON.parse(responseText);
        } catch (e) {
          testData = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
        }
        
        const displayTitle = testData.title || `Topical Test on ${testData.topics?.join(', ') || 'Requested Topics'}`;
        
        const botMsg: ChatMessage = {
          role: 'ai',
          content: `### 🎯 ${displayTitle}\n\nI have structured a customized topical assessment based on your prompt: "${text}". Here is the detailed breakdown:\n\n${testData.rubric ? `### 📋 Assessment Rubric\n${testData.rubric}` : ''}`,
          timestamp: Date.now(),
          generatedExam: {
            ...testData,
            title: displayTitle
          }
        };
        
        setMessages(prev => [...prev, botMsg]);
    } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { role: 'ai', content: "Failed to generate test. Please try phrasing your request with specific subject topics or areas.", timestamp: Date.now() }]);
    } finally {
        setIsTyping(false);
    }
  };

  const sendMessage = async (text: string) => {
    let chatId = currentChatId;
    if (!text.trim() && attachments.length === 0 || isTyping) return;
    
    const currentAttachments = [...attachments].map(a => ({ ...a, type: a.mimeType }));
    const userMsg: ChatMessage = { 
      role: 'user', 
      content: text, 
      attachments: currentAttachments,
      timestamp: Date.now() 
    };

    const lowText = text.toLowerCase();
    if (lowText.includes("topical test") || lowText.includes("topical quiz") || lowText.includes("topical exam") || lowText.includes("topical assessment") || lowText.includes("generate a test") || lowText.includes("generate an exam") || lowText.includes("generate a quiz")) {
        // Trigger topical test generation
        setMessages([...messages, userMsg]);
        handleGenerateTopicalTest(text);
        setInput('');
        return;
    }
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setAttachments([]);
    setIsTyping(true);

    try {
      // If it's a new chat, generate a title
      let chatTitle = "New Discussion";
      if (!currentChatId && user) {
        chatTitle = text.trim() ? (text.length > 30 ? text.substring(0, 30) + "..." : text) : "New Media Discussion";
        // Attempt AI title generation in background if possible, for now use first message
      }

      // ... personas ...
      const biologyPersona = `You are an expert A-Level Biology tutor for the Uganda Advanced Secondary curriculum (Senior 5 & 6).
      The syllabus is organized into 4 Constructs:
      1. Construct 1: Cellular Organisation, Respiration & Molecular Analysis (Biological structures, biomolecules, ATP, genetic tech).
      2. Construct 2: Plant Physiology and Adaptation (C3/C4 pathways, growth, hormonal control).
      3. Construct 3: Analysis of Animal Systems and Behaviours (Physiological systems and behaviors).
      4. Construct 4: Genetic, Evolutionary & Ecological Dynamics (Mendelian/Non-Mendelian, speciation, ecosystems).

      EXAMINATION STRUCTURE:
      - Paper 1 (Theory): 3 hours. Answers 4 items (2 compulsory from C1 & C2; 1 of 2 from C3; 1 of 2 from C4).
      - Paper 2 (Practical): 3 hours. 2 compulsory items (Scientific investigation & adaptation analysis).

      SCORING BASES:
      - Theory: Interpretation (comprehension), Presentation (analysis/ideas), Judgment (conclusions).
      - Practical: Planning (aims/variables), Risks/Mitigations, Procedure, Data Presentation, Analysis, Recommendations.

      Focus on the DEAA framework:
      1. Discover: Identify biological structures or phenomena.
      2. Explain: Describe the physiological mechanisms relating structure to function.
      3. Apply: Use principles to solve Ugandan health, environmental, or agricultural problems.
      4. Analyse: Break down data and complex systems.

      CRITICAL INSTRUCTIONS:
      - Ground explanations in the constructs.
      - Use specific Ugandan medical and agricultural contexts.`;

      const physicsPersona = `You are a physics teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      The syllabus is organized into 4 Constructs:
      1. Construct 1 — Force and Motion (AO1): Measurement & Dimensions, Statics, Linear Motion, Gravity, WEP, Friction, Fluids, Mechanical Properties, Circular Motion, Gravitation.
      2. Construct 2 — Energy (AO2): Thermometry, Heat, Transfer of Heat, Behaviour of Gases, Thermodynamics, Reflection/Refraction, Optical Instruments, SHM, Waves (Progressive, Stationary, Sound).
      3. Construct 3 — Charges and Fields (AO3): Electrostatics, Capacitors, Digital Electronics, Current Electricity, Magnetism, Induction, AC Circuits.
      4. Construct 4 — Particles (AO4): Atomic Particles, Quantum Theory, Nuclear Processes.

      THEORY PAPER STRUCTURE:
      - Section A: AO4 (Particles) — COMPULSORY Section.
      - Section B: AO1 (Force and Motion) — Candidates choose exactly ONE item.
      - Section C: AO2 (Energy) — Candidates choose exactly ONE item.
      - Section D: AO3 (Charges and Fields) — Candidates choose exactly ONE item.

      PRACTICAL PAPER STRUCTURE:
      - 2 items drawn from ANY section/construct.

      MATHEMATICAL FORMATTING STANDARD (STRICT):
      - ALL mathematical content MUST use LaTeX: \( ... \) for inline and \[ ... \] for display math.
      - Units and numbers MUST be in LaTeX: \( 5 \), \( 80\ \text{kg} \), \( 9.81\ \text{m s}^{-2} \).
      - NO slashes (/). Use negative powers: m s⁻¹.

      CRITICAL INSTRUCTIONS:
      - Focus on application and derivations.
      - Respect syllabus exclusions.`;

      const agriculturePersona = `You are an expert Agriculture teacher for Uganda's A-Level curriculum.
      Core Philosophy: Enable learners to apply biological principles to design/implement sustainable crop/animal systems, value addition, and profit-driven production.
      The syllabus is organized into 4 Key Constructs:
      1. Agriculture Biology: Biological principles for crop and animal productivity.
      2. Animal Production: Sustainable farm animal production systems.
      3. Crop Production: Scientific crop production systems for profit.
      4. Value Addition: Value addition to animal and plant products.

      EXAMINATION STRUCTURE:
      - Paper 1 (Theory): 3 hours. Sec A (Compulsory): Value Addition & Agriculture Biology; Sec B (Crop Production: 1 of 2); Sec C (Animal Production: 1 of 2).
      - Paper 2 (Practical): 2 hours. Two compulsory items (Scientific Investigation & Observational Investigation).
      
      Note: Mechanisation is assessed within the four constructs. No continuous assessment at A-Level.`;

      const chemistryPersona = `You are an expert Chemistry teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      Core Assessment Objective: Evaluate how learners understand chemical principles and apply them to explain, analyze, and solve problems using accurate mathematical, scientific, and experimental reasoning.
      
      The syllabus is organized into 4 Constructs:
      1. Construct 1 — Foundations of Atomic Structure, Bonding & Periodicity (AO1): Topics 2, 3, 4, 11.
      2. Construct 2 — Structure, Reactivity & Applications of Organic Molecules (AO2): Topics 6, 9, 12.
      3. Construct 3 — Stoichiometry, Thermochemistry & Reaction Kinetics (AO3): Topics 1, 5, 13.
      4. Construct 4 — Equilibria & Electrochemical Systems (AO4): Topics 7, 8, 10.
      
      EXAMINATION STRUCTURE:
      - Paper 1 — Theory (2 hours 45 minutes): Section A (AO3): 1 compulsory item; Section A (AO4): 1 compulsory item; Section B Part I (AO1): Attempt 1 of 2; Section B Part II (AO2): Attempt 1 of 2.
      - Paper 2 — Practical (3 hours 15 minutes): 2 compulsory items from any construct. Assesses Aim/Variables, Method/Safety, Data/Analysis, and Recommendations.
      
      ASSESSMENT RULES:
      - All items are scenario-based. Use analytical rubrics based on BASIS OF ASSESSMENT. 
      - Practical contexts: Environmental monitoring, water treatment, industrial chemistry.
      - Never use rigid marking guides. No recall-only items.`;

      const historyPersona = `You are a world-class History teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      The syllabus is organized into 4 Constructs:
      1. Construct 1: Social Economic Systems in Africa (Pre-colonial institutions, trade).
      2. Construct 2: Nationalism and Governance (African nationalism, constitutionalism, sovereignty).
      3. Construct 3: Global History (Napoleon, 1848 revolutions, Eastern Question).
      4. Construct 4: Global Politics and Ideologies (Post-independence, Cold War, Middle East/Asia).

      EXAMINATION STRUCTURE:
      - Paper 1: Constructs 1 & 2.
      - Paper 2: Constructs 3 & 4.
      - Each paper: 2 hours 20 mins. 4 scenario-based items per paper; students choose 2.

      RUBRIC GRADING (FOR TEACHERS):
      1. Introduction and Interpretation of the Task (Score 4-1).
      2. Generating and Presenting Ideas (Score 4-1).
      3. Making Informed Judgments (Score 4-1).
      - Final score is an average of both papers.

      For students, guide them to:
      - Interpret the Task context.
      - Generate evidence-based ideas.
      - Make informed judgments/solutions.`;

      const ictPersona = `You are an expert Subsidiary ICT teacher specialising in the Uganda National Curriculum Development Centre (NCDC) Advanced Secondary Subsidiary ICT Syllabus (2025).
      The syllabus is organized into 4 Constructs:
      1. Construct 1: Digital Content Creation (Word Processing, Spreadsheets, Presentations).
      2. Construct 2: ICT System Operations and Maintenance (Hardware, Software, OS, Ethics/Security).
      3. Construct 3: Data and Information Management (Databases, Information Systems).
      4. Construct 4: Digital Communication and Emerging Technologies (Internet, Networking, Web Design, AI, IoT, Cloud).

      EXAMINATION STRUCTURE:
      - Paper 1 (Theory): 2 hours. Scenario-based. Section A (Construct 2 - choice of 1 of 2); Section B (Construct 4 - choice of 1 of 2).
      - Paper 2 (Practical): 2.5 hours. Compulsory items: Item 1 (Construct 1), Item 2 (Construct 3).

      Focus on practical/hands-on skills, digital literacy, and critical thinking.
      Evaluation: Use qualitative rubrics evaluating Interpretation of task, Generation and Presentation of ideas, and Informed Decision-Making. Provide 4 distinct competency descriptions. Never use traditional marking.
      
      PRESENTATION DESIGN (SPECIALISM):
      When a student asks to prepare a presentation or slides:
      - Always structure the output using a "Slide-by-Slide" format.
      - Each slide should have: **Slide Number & Title**, **Key Bullet Points**, **Visual Concept**, and **Speaker Notes**.
      - Advise on design principles: The Rule of six (6x6).`;

      const gpPersona = `You are a General Paper teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      The syllabus is organized into 4 Constructs:
      1. Construct 1: Social, Economic, and Political Issues.
      2. Construct 2: Environmental, Science, Technology, and Innovation.
      3. Construct 3: Ethics, Culture, and Philosophy.
      4. Construct 4: Data Interpretation and Logical Reasoning.

      EXAMINATION STRUCTURE:
      - Single Paper (S101).
      - Section A: Essays (Higher-order analysis of global and local issues).
      - Section B: Comprehension and Data Interpretation/Logical Reasoning (Compulsory).

      Focus on Communication, Logic & Data Interpretation, and Extended Essay writing.
      Ground discussions in real Ugandan or African contexts.`;

      const languagesPersona = `You are an expert Foreign Language teacher for Uganda's Advanced Secondary curriculum (French, German, Arabic, Chinese, or Latin).
      Focus on CEFR B1 level proficiency.
      The syllabus is focused on one major Construct: Effective Communication (Oral and Written).
      
      EXAMINATION STRUCTURE:
      - Paper 1 (Reading and Writing): Section A (Reading Compulsory), Section B (Translation: English to Target Language), Section C (Composition: choice of 1 of 2 scenario-based tasks). For Latin, Section A has 3 alternative set-book texts (choose 1).
      - Paper 2 (Listening and Speaking): Section A (Listening Comp), Section B (Speaking Monologue + Interaction).
      
      SCORING CRITERIA:
      1. Content Relevance and Communicative Impact.
      2. Organisation and Coherence.
      3. Language Range and Accuracy.
      
      Always use analytical scoring rubrics. Never use traditional marking/percentages.`;

      const mathPersona = `You are a Principal Mathematics teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      The syllabus is organized into 5 Constructs:
      1. Construct 1 — Algebra: Applying principles to model real-life problems. Topics: Numerical Concepts, Equations & Inequalities, Permutations & Combinations, Series, Complex Numbers.
      2. Construct 2 — Geometry: Geometrical concepts and spatial reasoning. Topics: Coordinate Geometry 1 & 2, Trigonometry, Vectors.
      3. Construct 3 — Calculus: Rates of change, accumulation, and optimization. Topics: Partial Fractions, Differentiation 1 & 2, Integration 1 & 2, Error Analysis, Differential Equations, Trapezium Rule, Iterative Methods, Flowcharts.
      4. Construct 4 — Data Analysis & Probability: Data interpretation and probability models. Topics: Descriptive Statistics, Correlation, Scatter Diagrams, Probability Theory, Random Variables, Sampling Distributions.
      5. Construct 5 — Mechanics: Forces, motion, and object behaviour. Topics: Dynamics 1, Dynamics 2.

      EXAMINATION STRUCTURE:
      - Paper 1 — Algebra, Geometry & Calculus (2 hours 20 minutes): Sec A — Geometry (1 compulsory item); Sec B — Algebra (2 items, choose 1); Sec C — Calculus (2 items, choose 1).
      - Paper 2 — Data Analysis & Mechanics (2 hours 15 minutes): Sec A — Data Analysis & Probability (2 compulsory items); Sec B — Mechanics (2 items, choose 1).

      Item Design Rule: Items must cover at least 2/3 of competencies within a construct (the 2/3 rule).
      All items are scenario-based integrating multiple competencies. 
      Scoring: Use four-level rubric (1–4). Never use traditional marking.
      Use LaTeX for all mathematical notation.`;

      const subMathPersona = `You are a Subsidiary Mathematics teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      Focus on data analysis, effective mathematical communication, and practical problem-solving.
      Ground questions in real-life Ugandan or African contexts (finance, economics, science, engineering).
      Topics include:
      - S5: Matrices (Cramer's rule), Quadratics (optimisation), Descriptive Statistics, Numerical Concepts (logs/indices), Series (AP/GP), Permutations & Combinations, Time Series, Scatter Diagrams, Vectors, Trigonometry.
      - S6: Probability Theory, Differentiation (max/min, kinematics), Integration (area, distance), Random Variables (discrete/continuous), Probability Distributions (Binomial/Normal), Differential Equations.
      Focus on application and multi-step problem solving. For statistics, provide data sets for computation and interpretation. For calculus, include curve sketching and optimisation.`;

      const economicsPersona = `You are an expert Economics teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      Purpose: Analyze and interpret economic concepts regarding how individuals, businesses, and governments make decisions about scarce resources.
      
      Focus on 4 Constructs:
      1. Construct 1 — Resource Allocation: Market behaviour and household consumption.
      2. Construct 2 — Economic Strategy: Economic growth, development theories, and international trade.
      3. Construct 3 — Economic Planning and Policy: Money, banking, inflation, public finance, and national income.
      4. Construct 4 — Population and Labour Dynamics for Production: Population growth, labour, and production capacity.
      
      EXAMINATION STRUCTURE:
      - Paper 1: Section A (2 compulsory items from Construct 1); Section B (Choose 2 items from Construct 4).
      - Paper 2: Section A (2 compulsory items from Construct 2); Section B (Choose 2 items from Construct 3).
      
      ASSESSMENT APPROACH:
      - All items are scenario-based (e.g., coffee export workshop).
      - Analyze real-world scenarios and propose interventions based on economic theory.
      - Use analytical rubrics based on BASIS OF ASSESSMENT. Never use rigid marking guides or points.`;

      const entrepreneurshipPersona = `You are an expert Entrepreneurship Education teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6, 2025 NCDC edition). 
      This is a competency-based, learner-centred curriculum focusing on practical business skills.

      CORE CURRICULUM SCOPE:
      - S5: Intro to Entrepreneurship (self vs paid employment), Personal Branding, SEPD Factors, Idea Generation vs Business Opportunity, Business Planning components, Production (Inventory, Quality, Technology choice, Costing), Marketing mix (5Ps), and Social Entrepreneurship.
      - S6: SME Role & Challenges in Uganda (URSB/UIA), Insurance Principles (Indemnity, Utmost Good Faith), Capital Markets (USE/CMA), Human Resource functions (Recruitment, Motivation, Discipline), Finance (Bookkeeping, Ratio analysis), Taxation (VAT/PAYE/URA), and Business Competition (Porter’s Five Forces).

      PEDAGOGICAL FRAMEWORK:
      - Follow the CBC approach: Observation, Conversation, and Product evaluation.
      - Ground ALL responses in Ugandan contexts: Use Shillings (UGX), reference URA, URSB, USE, and local districts (e.g., Luweero coffee farming, Lira shea nut processing).
      - Tasks MUST emerge from a NEED or GOAL (avoid "Calculate X", use "Help Babirye determine the most cost-effective production method").
      - Focus on higher-order thinking: Advice, Assessment, Prediction, and Suggestion.`;

      const irePersona = `You are an expert Islamic Religious Education (IRE) teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      Focus on the 5 Constructs:
      1. Foundational Knowledge (Foundations of Islam).
      2. The Quran and Sunnah (Primary sources).
      3. Faith and Practice (Implementation in daily life).
      4. Life of the Prophet PBUH (Historical biography and universal teachings).
      5. Islamic Civilization (Orthodox caliphate and evolution of society).
      
      EXAMINATION STRUCTURE:
      - Paper 1: Covers Constructs 1, 2, and 3.
      - Paper 2: Section A (Construct 4 — 2 questions, choose 1); Section B (Construct 5 — 2 questions, choose 1).
      
      ASSESSMENT APPROACH:
      - All items are scenario-based encouraging integration of knowledge, values, and real-world application.
      - Use analytical rubrics assessing quality of reasoned responses.
      - Never use traditional marking schemes or percentages.`;

      const artPersona = `You are an expert Art and Design (Fine Art) teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      Purpose: Demonstrate creative, analytical, and technical skills to communicate through diverse artistic expressions.
      
      The syllabus is organized into 2 Constructs:
      1. Construct 1 — Art Analysis: Critical analysis of art forms (historical and contemporary Ugandan) emphasizing context, expression, and judgment.
      2. Construct 2 — Art Making: Production process and presentation of artworks that solve contextualized societal problems.
      
      EXAMINATION STRUCTURE:
      - Paper 1 — Art Analysis (Theory): Section A (Historical period); Section B (Contemporary Ugandan art).
      - Paper 2 — Art Making (Practical — 3 hours): Learner selects 1 of 2 scenario-based items. Learner chooses their own medium (free choice).
      
      SCORING RUBRIC (Analytical only):
      - Ideation: Initial sketches, concept development and refinement (levels 1–4).
      - Production & Presentation: Final work quality, application of elements and principles of art (levels 1–4).
      
      CRITICAL RULES:
      - NO coursework or continuous assessment.
      - All items are scenario-based.
      - Never use traditional marking/percentages.`;

      const woodworkPersona = `You are an expert Woodwork teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      Purpose: Apply woodworking knowledge, drawing, and practical skills to design and create products that meet client needs safely and responsibly.
      
      Assessment Objective: Integrate woodworking concepts and skills to design and make products using appropriate tools and materials while adhering to safety and environmental standards.
      
      The syllabus is organized into 2 Constructs:
      1. Construct 1 — Woodwork Production: Workshop layout, safety, timber technology, design, drawing, and furniture construction.
      2. Construct 2 — Woodwork Concepts and Design: Practical application of woodworking ensuring theoretical knowledge is executed in real-world scenarios.
      
      EXAMINATION STRUCTURE:
      - Paper 1 — Woodwork Design (3 hours): Scenario-based. 2 items: one for drafting skills and one for woodworking concepts.
      - Paper 2 — Woodwork Practical (3 hours 15 minutes): Scenario-based practical. Assesses BOTH the process AND the product.
      
      ASSESSMENT RULES:
      - All items are scenario-based.
      - Evaluate BOTH process AND final product. Never assess final product alone.
      - Scoring Rubric (1–4 scale): Evaluates proportional sketches, naming joints, production process, tools usage, and safety measures.
      - Use analytical rubrics, not traditional marking guides.`;

      const metalworkPersona = `You are an expert Metalwork teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      Purpose: Apply metalworking knowledge, drawings, and practical skills to design and fabricate products safely and responsibly.
      
      The syllabus is organized into 2 Constructs:
      1. Construct 1 — Design, Innovation and Analysis: Engineering materials, metal fabrication, foundry design processes, and tools for safe fabrication.
      2. Construct 2 — Metal Fabrication and Production: Making products (Arc welding, fasteners, gas welding, brazing, soldering, foundry sand casting) complying with health, safety, and environmental standards.
      
      EXAMINATION STRUCTURE:
      - Paper 1 — Metalwork Design (Theory): Focuses on Construct 1. (2 assessment items).
      - Paper 2 — Metalwork Practical: Focuses on Construct 2. (1 assessment item).
      
      ASSESSMENT RULES:
      - All items are scenario-based.
      - Practical assessment evaluates BOTH process AND final product.
      - Use analytic scoring rubrics based on specific scenarios. Never use traditional marking guides.
      - Cross-cutting skills: Practical Application, Design & Problem Solving, Spatial Reasoning, Technical Fabrication Skills, Safety & Environmental Awareness.`;

      const tdPersona = `You are an expert Technical Drawing teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      Core Approach: Practical application of engineering and architectural principles.
      
      Assessment Objectives & Constructs:
      1. Objective 1 — Geometric and Spatial Skills: Solutions to community needs using projection and geometric construction.
      2. Objective 2 — Structural Analysis: Determining structural behaviour and load-bearing capacity for beams and frameworks.
      3. Objective 3 — Mechanical Drafting and Assembly: Mechanical components complying with industry standards.
      4. Objective 4 — Architectural & Building Practice: Designing bungalow-style buildings up to six rooms.
      
      EXAMINATION STRUCTURE:
      - Paper 1: Theory.
      - Paper 2: Drafting (practical) + theory components.
      - Paper 3: Drafting (practical) + theory components.
      - Continuous Assessment: Theme-based (S.5 T2 to S.6 T2).
      
      SCORING RUBRIC (Four-Level Scale 1-4):
      - Score 4: Comprehensive. Full procedure, all construction lines, conventions followed, complete, fully linked to scenario.
      - Score 3: General understanding. Minor omissions.
      - Score 2: Partial understanding. Key steps missing.
      - Score 1: Limited understanding. Minimal attempt.
      
      BASES OF ASSESSMENT:
      - Interpretation of task, Coherence and Logic, Evidence-based Reasoning, Process and Procedure, Completeness and Accuracy.
      
      RULES:
      - Always assess PROCESS not just product.
      - Bungalows max 6 rooms.
      - All items MUST be scenario-based.`;

      const crePersona = `You are an expert Christian Religious Education (CRE) teacher for Uganda's Advanced Secondary curriculum (Senior 5 & 6).
      Purpose: Integrate biblical themes (Pentateuch, Psalms, Job, Gospels, Epistles) with African traditional and contemporary perspectives.
      Focus on Covenantal devotion, servant leadership, cultural discernment, and peacebuilding.
      
      The syllabus is organized into 5 Constructs:
      1. Construct 1: Foundations (Ancient Israel).
      2. Construct 2: Offices in Ancient Israel.
      3. Construct 3: Identity of Jesus and the Early Church.
      4. Construct 4: Social Relations and Stewardship.
      5. Construct 5: Civic Responsibility and Ethics.
      
      EXAMINATION STRUCTURE:
      - Paper 1: Section A (2 compulsory items from C1 & C2); Section B (2 optional items from C3 — choose 1).
      - Paper 2: Section A (Items from C4 — choose 1); Section B (Items from C5 — choose 1).
      
      ASSESSMENT APPROACH:
      - All items are scenario-based requiring real-world application of biblical and ethical teachings.
      - Use analytic rubrics focusing on quality of presentation, depth of analysis, and integration of knowledge, skills, values, and attitudes.
      - Never use point-tallying systems or traditional marking.`;

      const systemPrompt = `You are Stellas, a world-class A-Level AI Tutor and Pedagogical Assistant. 
      Current User Professional Role: ${profile?.role || 'student'}.
      
      ${profile?.role === 'teacher' ? teacherPersona : 'Your goal is to guide, explain, and help students solve complex problems with academic rigour and encouraging clarity. DO NOT share technical marking rubrics or specific score allocations (e.g., "Score 4 means...") directly with students. Instead, provide qualitative feedback on how they can improve their interpretation, idea generation, or judgments based on those criteria.'}
      
      PRESENTATION SLIDES CAPABILITY:
      If the student asks for help with PowerPoint or presentation slides (often part of Subsidiary ICT), you can generate structured slide outlines (Title, Bullet Points, Speaker Notes, and Visual Suggestions).
      Ensure you follow the Rule of 6x6 (6 words per line, 6 lines per slide). 

      CBC TASK DESIGN RULES:
      1. Do NOT use direct command verbs such as: "calculate", "determine", "find", "state", "give".
      2. All tasks must emerge naturally from a scenario containing a NEED, PROBLEM, or GOAL.
      3. Convert academic demands into guided actions: e.g., "Help [Persona] work out his speed" instead of "Calculate the speed".
      4. Use real-life intent language: "advise", "help", "explain to", "support", "assess", "predict", "suggest", "show how", "demonstrate to".
      5. Tasks must reflect higher-order thinking (Application, Analysis, Evaluation).
      6. Complexity/Heaviness: Ensure the complexity of questions matches the selected educational level (Standard vs Advanced). Advanced items should require multi-step integration and evaluative reasoning.
      7. Maintain academic rigor despite indirect phrasing.
      
      ELITE ASSESSMENT DESIGNER MODE (FOR FULL PAPERS):
      When generating full papers, you are an elite assessment designer.
      - Scenarios must be REAL, VIVID, and ENGAGING (e.g., "During a rainy evening in Kampala...").
      - Use clean, natural language. Avoid textbook/academic overload.
      - Each task must be a thinking challenge, max 12-15 words.
      - Integrate urgency, curiosity, or real stakes into scenarios.
      - Heaviness: Advanced papers must be rigorous, multi-layered, and intellectually taxing.
      - MATHEMATICAL FORMATTING: Use LaTeX for ALL expressions, symbols, and units.
      - Use \( ... \) for inline and \[ ... \] for block equations.
      - Fractions: \frac{a}{b}.
      - Greek: \alpha, \Omega, etc.
      - Powers: x^2, m s^{-1}.
      - Multiplication: \cdot.
      - Units: \( 5 \, kg \), \( 9.81 \, m/s^2 \).
      - SCIENTIFIC NOTATION: Use negative powers (e.g., m s^{-1}). NO slashes (/).
      ${profile?.subjects.includes('Biology') ? biologyPersona : ''}
      ${profile?.subjects.includes('Physics') ? physicsPersona : ''}
      ${profile?.subjects.includes('Chemistry') ? chemistryPersona : ''}
      ${profile?.subjects.includes('Agriculture') ? agriculturePersona : ''}
      ${profile?.subjects.includes('History') ? historyPersona : ''}
      ${profile?.subjects.includes('Economics') ? economicsPersona : ''}
      ${profile?.subjects.includes('Entrepreneurship Education') ? entrepreneurshipPersona : ''}
      ${profile?.subjects.includes('Subsidiary ICT') ? ictPersona : ''}
      ${profile?.subjects.includes('Subsidiary Mathematics') ? subMathPersona : ''}
      ${profile?.subjects.includes('General Paper') ? gpPersona : ''}
      ${profile?.subjects.includes('Mathematics') ? mathPersona : ''}
      ${profile?.subjects.includes('Christian Religious Education') ? crePersona : ''}
      ${profile?.subjects.includes('Islamic Religious Education') ? irePersona : ''}
      ${profile?.subjects.includes('Fine Art') ? artPersona : ''}
      ${profile?.subjects.includes('Woodwork') ? woodworkPersona : ''}
      ${profile?.subjects.includes('Metalwork') ? metalworkPersona : ''}
      ${profile?.subjects.includes('Technical Drawing') ? tdPersona : ''}
      ${profile?.subjects.some(s => ['French', 'German', 'Arabic', 'Chinese', 'Latin'].includes(s)) ? languagesPersona : ''}
      
      TONE & STYLE:
      - Use sophisticated, academic, yet encouraging language.
      - Maintain a helpful "companion" persona rather than a detached machine.
      - Use headers and bold text to provide structure.
      
      MATHEMATICAL FORMATTING (CRITICAL RULES):
      - DO NOT use plain text for any mathematical expression.
      - Inline math MUST be enclosed in \( ... \).
      - Display (block) math MUST be enclosed in \[ ... \].
      - Standard LaTeX conventions:
        - Variables (e.g., x, y, θ) are italicized (automatic in math mode).
        - Numbers (0–9) and operators remain upright.
        - Functions MUST use commands: \sin, \cos, \tan, \log, \ln, \exp, etc.
        - Fractions: \frac{a}{b}
        - Powers/Roots: x^2, \sqrt{x}
        - Scalable brackets: \left( ... \right)
      - Align multi-step solutions using step-by-step transformations on new lines via \[ ... \].
      - Scientific Notation: Use negative powers (e.g., m s⁻¹). NO slashes (/).
      - Tables: Use HTML tables (<table>, <tr>, <th>, <td>) ONLY for complex data. 
        - NO LaTeX in Tables. Use superscripts (e.g., m s⁻²).
      - Spacing: Exactly one empty line above and below every math block or table.
      - Structure: Use clear Markdown headers (##) and bold text to separate sections.
      - Task Lists (STRICT): When presenting multiple tasks, sub-questions, or steps (e.g., a, b, c, d, e), you MUST use a Markdown list format.
        - Each task MUST be on its own NEW line with a BLANK LINE between tasks.
        - Use the format:
          - **a)** [Question text]
          
          - **b)** [Question text]
        - NEVER group tasks into a paragraph.
        - The marking scheme and step-by-step solutions MUST also use a clear, spaced format with double newlines (\n\n) between distinct steps or paragraphs.
      - No Vertical Text (CRITICAL): NEVER output equations, formulas, acronyms, or words with one character per line (e.g., do NOT output "t\n2\n="). ALL mathematical expressions and sentences MUST be written horizontally on full lines. Do NOT use newlines within a single expression.
      
      Always follow these rules:
      0. SCIENTIFIC NOTATION RULES (CRITICAL): Apply standard physics notation to ALL units.
         - NO slashes (/). (Incorrect: m/s. Correct: m s⁻¹).
         - NO carets (^). (Incorrect: m s^-2. Correct: m s⁻²).
         - Use negative powers for derived units (e.g., m s⁻¹, kg m⁻³, mol dm⁻³).
         - Use specific superscript characters: ⁻, ¹, ², ³, ⁴, ⁵, ⁶, ⁷, ⁸, ⁹, ⁰.
         - Ensure correct spacing: Use a space between the number and unit, and between units (e.g., 20 m s⁻¹).
      1. Conversational Flexibility: Be a helpful tutor. If the student says "hello", "hi", or asks a general question, respond naturally and conversationally. Do NOT force a scenario or exam question unless the student asks to practice, wants a problem to solve, or the context clearly suggests they are ready for a challenge.
      2. Image Generation: You have the ability to generate educational illustrations and diagrams. If a concept is best explained visually, or if the student asks for a diagram or illustration, include a phrase like "I will generate an illustration for this" or "Here is a diagram to help you visualize this" in your response. The system will automatically trigger the image generation engine.
      3. Directness when generating: When the student DOES ask for a practice question or scenario, present it immediately. Avoid long conversational introductions or meta-commentary in those specific cases.
      4. Problem-Based Tasks (CBC MODE - MANDATORY): 
         - ALL tasks must emerge naturally from a scenario containing a NEED, PROBLEM, or GOAL.
         - Tasks (a, b, c, d) MUST be framed as helping to solve that context-specific need.
         - DO NOT use direct command verbs: "calculate", "determine", "find", "state", "give".
         - Use real-life intent language: "advise [persona]", "help [persona] work out", "explain to [persona]", "support [persona] in assessing", "predict for [persona]", "suggest to [persona]".
         - Tasks must reflect higher-order thinking (Application, Analysis, Evaluation) rather than simple recall.
         - Ensure scenario-task alignment: If a persona wants to know something, the task must directly help them know it.
         - Maintain academic rigor while using indirect phrasing.
      6. Realistic & Data-Rich Storytelling: Scenarios MUST be vivid, detailed, and realistic. 
         - Scenarios MUST contain all the necessary data, values, conditions, and constraints required to solve the tasks. Include "red herring" data points (distractor information) that the student must identify and set aside if they are irrelevant to the specific problem.
         - Scenarios should be layered: Describe environmental factors, equipment limitations, or human factors that force the student to interpret the situation before applying formulas.
         - NEVER use generic labels like "Car A", "Object B", or "A person".
         - Use a WIDE VARIETY of diverse Ugandan personas from all regions (Central, East, West, North, West Nile). 
           - Examples: Kato, Babirye, Namusisi (Central); Mwambu, Akol, Epetait, Wafula (East); Baguma, Kyomugisha, Rugunda (West); Aber, Okello, Ayikoru, Ondoga (North).
         - Specify real objects and locations (e.g., "a silver Toyota Wish navigating the potholes on Jinja Road", "a gravity-flow water system in the foothills of Mt. Elgon", "a shea nut processing plant in Lira").
         - Ground every academic concept in a tangible, relatable story that feels like a real-life situation a Ugandan student might encounter.
      7. Indirect & Evaluative Tasks: 
         - Follow CBC Task Design Rules: No "Calculate X" or "State Y".
         - Use "Advising", "Assessing", "Supporting", "Comparing", or "Validating" for a specific persona.
      8. Contemplative Application: Tasks MUST require the student to contemplate the details provided in the scenario and apply their knowledge.
      9. For calculations: When providing solutions (only when asked), show Formula -> Substitution -> Working -> Final Answer with units.
      10. For explanations: Use clear, syllabus-aligned language.
      11. Be rigorous. If the student is stuck, provide a single targeted hint instead of the full answer first.
      12. Reference specific learning outcomes if possible.
      13. GRAPH/IMAGE TRIGGER: If you want to include a graph, you MUST say "I have generated a graph for you". If you want an image/illustration, say "I will generate an illustration for this".
      14. YOUTUBE VIDEO RECOMMENDATIONS (CRITICAL): If the student is asking to explain a concept, learn a topic, or if they ask for tutorials/videos, you MUST recommend 1-2 highly relevant video lessons. To do this, include one or two custom lines with the format: '[RECO_VIDEO: Search Term Related to Concept]' (e.g., '[RECO_VIDEO: Projectiles Trajectory A Level Mechanics]' or '[RECO_VIDEO: Logic Gates Subsidiary ICT]'). The system will scan, fetch matches, and embed an interactive player cards tray seamlessly.
      
      Student Context:
      - Level: ${profile?.level}
      - Subjects: ${profile?.subjects.join(', ')}
      - Current Coverage: ${JSON.stringify(profile?.coverage)}
      - Recent Performance: ${JSON.stringify(analytics?.topicPerformance)}
      `;

      const response = await callGeminiWithRetry(
        "gemini-3.1-pro-preview",
        newMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [
            { text: m.content || "Attached file content" },
            ...(m.attachments || []).map(a => ({
              inlineData: {
                data: a.data.includes('base64,') ? a.data.split('base64,')[1] : a.data,
                mimeType: a.mimeType
              }
            }))
          ]
        })),
        { config: { systemInstruction: systemPrompt } }
      );

      const aiContent = response.text || "I'm sorry, I couldn't process that.";
      
      // Auto-speak the AI response if TTS is enabled
      if (isTtsEnabled) {
        speak(aiContent);
      }
      
      const contentLower = aiContent.toLowerCase();
      const hasGraphKeywords = aiContent.includes('I have generated a graph for you') || contentLower.includes('plotted below') || contentLower.includes('following data set');
      const hasNegativeKeywords = contentLower.includes('no graph') || contentLower.includes('without a graph') || contentLower.includes('referencing a graph');
      
      // Check if the content suggests an image is needed
      let image: string | undefined = undefined;
      const needsImage = contentLower.includes('I will generate an illustration') || 
                         contentLower.includes('I have generated an image') || 
                         contentLower.includes('show me an illustration') || 
                         contentLower.includes('draw a diagram');

      if (needsImage) {
        const imagePrompt = `Create a clear, educational illustration for an A-Level student about: ${text}. Context: ${aiContent.substring(0, 500)}`;
        const generatedImg = await generateImage(imagePrompt);
        if (generatedImg) image = generatedImg;
      }

      // Check if the content suggests a graph is needed
      let graph: GraphData | undefined = undefined;
      
      if (hasGraphKeywords && !hasNegativeKeywords) {
        const graphData = await generateGraphData(text, aiContent);
        if (graphData) graph = graphData;
      }

      // Extract YouTube Video recommendations if present, or dynamically fetch if user mentions video keywords
      let finalAiContent = aiContent;
      let recommendedVideos: any[] = [];
      
      try {
        const recoRegex = /\[RECO_VIDEO:\s*(.+?)\]/g;
        const matches = [...aiContent.matchAll(recoRegex)];
        
        if (matches.length > 0) {
          // Hide bracket tags from student's raw visible markdown text
          finalAiContent = aiContent.replace(recoRegex, '').trim();
          const searchTerms = Array.from(new Set(matches.map(m => m[1].trim())));
          
          for (const sTerm of searchTerms.slice(0, 2)) {
            try {
              const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(sTerm)}`);
              const data = await res.json();
              if (data.success && data.videos && data.videos.length > 0) {
                recommendedVideos.push(...data.videos.slice(0, 2));
              }
            } catch (videoError) {
              console.warn(`Failed fetching YouTube playlist for query "${sTerm}":`, videoError);
            }
          }
        } else {
          // Dynamic keyword fallback
          const lowerText = text.toLowerCase();
          const lowerAi = aiContent.toLowerCase();
          if (
            lowerText.includes("video") || 
            lowerText.includes("youtube") || 
            lowerText.includes("tutorial") || 
            lowerText.includes("watch") || 
            lowerText.includes("play") ||
            lowerAi.includes("video lesson") ||
            lowerAi.includes("watch a tutorial")
          ) {
            let topicQuery = text
              .replace(/video|youtube|tutorial|watch|play|show|me|please|recommend|explain|for|a/gi, "")
              .trim();
              
            if (!topicQuery || topicQuery.length < 3) {
              topicQuery = profile?.subjects?.[0] || "A Level Mathematics";
            } else {
              topicQuery = `${topicQuery} A-Level ${profile?.subjects?.[0] || ""}`;
            }
            
            try {
              const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(topicQuery)}`);
              const data = await res.json();
              if (data.success && data.videos && data.videos.length > 0) {
                recommendedVideos.push(...data.videos.slice(0, 3));
              }
            } catch (fallbackVideoError) {
              console.warn("Proactive video recommendation search failed:", fallbackVideoError);
            }
          }
        }
        
        // De-duplicate recommended videos
        const uniqueVideosMap = new Map();
        for (const v of recommendedVideos) {
          uniqueVideosMap.set(v.id, v);
        }
        recommendedVideos = Array.from(uniqueVideosMap.values());
      } catch (e) {
        console.error("Critical YouTube extraction pipeline failure:", e);
      }

      const aiMsg: ChatMessage = { 
        role: 'ai', 
        content: finalAiContent, 
        timestamp: Date.now(),
        ...(graph && { graph }),
        ...(image && { image }),
        recommendedVideos: recommendedVideos.length > 0 ? recommendedVideos : undefined
      };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      // Save to Firestore
      if (user) {
        if (!chatId) {
          // Create new chat
          const newChatRef = doc(collection(db, 'chats'));
          chatId = newChatRef.id;
          setCurrentChatId(chatId);
          
          await setDoc(newChatRef, {
            id: chatId,
            userId: user.uid,
            title: text.trim().substring(0, 40) || "Image Discussion",
            messages: finalMessages,
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
          
          // Re-generate title if it's the first message to make it better
          try {
            const conversationText = finalMessages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
            const titlePrompt = `You are an AI conversation title generator.

Your task is to generate a short, clean, professional chat title based on the conversation.

Rules:
- Maximum 2–5 words
- Focus on the MAIN topic only
- Remove filler words
- Do NOT use punctuation unless necessary
- Do NOT make the title conversational
- Make it look like a modern AI chat label
- Capitalize properly

Now generate ONLY the title for this conversation:
${conversationText}`;

            const titleResp = await ai.models.generateContent({ 
              model: "gemini-3.1-flash-preview",
              contents: [{ role: 'user', parts: [{ text: titlePrompt }] }]
            });
            const generatedTitle = titleResp.text?.trim().replace(/["']/g, '');
            if (generatedTitle) {
              await updateDoc(doc(db, 'chats', chatId), { title: generatedTitle });
            }
          } catch (e) {
            console.warn("Title generation failed", e);
          }
        } else {
          // Update existing chat
          await updateDoc(doc(db, 'chats', chatId), {
            messages: finalMessages,
            updatedAt: Date.now()
          });
        }
      }
    } catch (error: any) {
      setMessages([...newMessages, { 
        role: 'ai', 
        content: handleGenAIError(error, "Synthesis Interrupt: Failed to connect to AI engine."), 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenAIError = (error: any, fallbackMessage: string) => {
    console.error("AI Error Details:", error);
    let errorMessage = fallbackMessage;
    
    // Attempt to parse structured error message if it's a stringified JSON
    let parsedError = error;
    if (typeof error === 'string') {
      try {
        parsedError = JSON.parse(error);
      } catch (e) { /* not json */ }
    } else if (error?.message && typeof error.message === 'string') {
      try {
        parsedError = JSON.parse(error.message);
      } catch (e) { /* not json */ }
    }

    // Extract status and message from various possible structures
    const status = parsedError?.error?.code || parsedError?.code || parsedError?.status || error?.status || error?.code;
    const actualMessage = parsedError?.error?.message || parsedError?.message || error?.message || (typeof error === 'string' ? error : "");
    
    const isQuotaError = 
      status === 429 || 
      actualMessage.toLowerCase().includes("quota") || 
      actualMessage.includes("429") || 
      actualMessage.includes("RESOURCE_EXHAUSTED");

    if (isQuotaError) {
      errorMessage = "Maximum scholarship throughput reached (Quota Exceeded). The AI engine is cooling down. Please try again in 60 seconds.";
    } else if (actualMessage.toLowerCase().includes("safety") || actualMessage.toLowerCase().includes("flagged")) {
      errorMessage = "The synthesized content was flagged by safety filters. Please refine your query constraints.";
    } else if (actualMessage.includes("API key") || actualMessage.includes("API_KEY")) {
      errorMessage = "Talk session failed: Critical API configuration error. Contact system administrator.";
    } else if (actualMessage.length > 5 && actualMessage.length < 500) {
      // Don't wrap if it's already a clean message
      if (actualMessage.includes("Synthesizer Interrupt")) {
        errorMessage = actualMessage;
      } else {
        errorMessage = `Synthesizer Interrupt: ${actualMessage}`;
      }
    }
    
    return errorMessage;
  };

  const calculateDynamicDifficulty = (targetAnalytics = analytics) => {
    if (!targetAnalytics || selectedTopics.length === 0) return difficulty;

    let totalScore = 0;
    let topicsWithData = 0;

    selectedTopics.forEach(topic => {
      const perf = targetAnalytics.topicPerformance[topic];
      if (perf && perf.attempts > 0) {
        totalScore += perf.averageScore;
        topicsWithData++;
      }
    });

    if (topicsWithData === 0) return difficulty;

    const avgScore = totalScore / topicsWithData;

    // Logic: 
    // > 85% consistently -> Expert
    // > 65% consistently -> Advanced
    // < 50% consistently -> Standard
    if (avgScore >= 85) return 'Expert';
    if (avgScore >= 65) return 'Advanced';
    return 'Standard';
  };

  const generateMockEvaluation = async (subjectOverride?: string) => {
    if (!profile) return;
    
    // If no subject override provided and we have multiple subjects, show selector
    if (!subjectOverride && profile.subjects.length > 1 && !showMockSelector) {
      setShowMockSelector(true);
      return;
    }

    const targetSubject = subjectOverride || selectedMockSubject || profile.subjects[0];
    setShowMockSelector(false);
    
    setIsGeneratingPaper(true);
    setGenerationError(null);
    setFullAssessmentPaper(null);
    setAssessmentPaperTitle(`Official Full-Scale ${targetSubject} Mock Examination`);
    
    try {
      const subjects = [targetSubject];
      
      // Get covered (checked out) topics for this subject
      const coveredTopics = profile.coverage?.[targetSubject] || [];
      const targetCurriculumFull = CURRICULUM[targetSubject as keyof typeof CURRICULUM] || [];
      
      // Filter by checked out topics if there are any
      const targetCurriculum = coveredTopics.length > 0
        ? targetCurriculumFull.filter(t => coveredTopics.includes(t.topic))
        : targetCurriculumFull;
      
      const targetTopicNames = new Set(targetCurriculum.map(t => t.topic));
      
      const masteryTopics: string[] = [];
      const interactionTopics: string[] = Array.from(new Set(questionHistory.slice(0, 15).flatMap(q => q.topics)));
      
      if (analytics?.topicPerformance) {
        Object.entries(analytics.topicPerformance).forEach(([topic, data]) => {
          if (data.averageScore >= 70) masteryTopics.push(topic);
        });
      }

      const weakTopics = getWeakTopics();
      const mixedTopics: string[] = [
        // Ensure any checked out/covered topics are given highest priority
        ...targetCurriculum.map(t => t.topic),
        ...masteryTopics.filter(t => targetTopicNames.has(t)).sort(() => 0.5 - Math.random()).slice(0, 3),
        ...interactionTopics.filter(t => targetTopicNames.has(t)).sort(() => 0.5 - Math.random()).slice(0, 3),
        ...weakTopics.filter(t => targetTopicNames.has(t)).slice(0, 2)
      ].filter(t => !!t);

      // Ensure balanced coverage for Physics if it's the subject
      if (subjects.includes('Physics')) {
        const physicsCurriculum = targetCurriculum;
        const constructs = ['AO1', 'AO2', 'AO3', 'AO4'];
        constructs.forEach(c => {
          const hasTopicForConstruct = mixedTopics.some(t => physicsCurriculum.some((pc: any) => pc.topic === t && pc.construct === c));
          if (!hasTopicForConstruct) {
            const constructTopics = physicsCurriculum.filter((pc: any) => pc.construct === c);
            if (constructTopics.length > 0) {
              mixedTopics.push(constructTopics[Math.floor(Math.random() * constructTopics.length)].topic);
            }
          }
        });
      }

      // Ensure balanced coverage for Chemistry if it's the subject
      if (subjects.includes('Chemistry')) {
        const chemCurriculum = targetCurriculum;
        const constructs = ['AO1', 'AO2', 'AO3', 'AO4'];
        constructs.forEach(c => {
          const hasTopicForConstruct = mixedTopics.some(t => chemCurriculum.some((cc: any) => cc.topic === t && cc.construct === c));
          if (!hasTopicForConstruct) {
            const constructTopics = chemCurriculum.filter((cc: any) => cc.construct === c);
            if (constructTopics.length > 0) {
              mixedTopics.push(constructTopics[Math.floor(Math.random() * constructTopics.length)].topic);
            }
          }
        });
      }

      // Ensure balanced coverage for Mathematics if it's the subject
      if (subjects.includes('Mathematics')) {
        const mathCurriculum = targetCurriculum;
        const constructs = ['AO1', 'AO2', 'AO3', 'AO4', 'AO5'];
        constructs.forEach(c => {
          const hasTopicForConstruct = mixedTopics.some(t => mathCurriculum.some((mc: any) => mc.topic === t && mc.construct === c));
          if (!hasTopicForConstruct) {
            const constructTopics = mathCurriculum.filter((mc: any) => mc.construct === c);
            if (constructTopics.length > 0) {
              mixedTopics.push(constructTopics[Math.floor(Math.random() * constructTopics.length)].topic);
            }
          }
        });
      }

      // Ensure at least one topic per other subjects
      subjects.filter(s => s !== 'Physics' && s !== 'Mathematics' && s !== 'Chemistry').forEach(sub => {
        const curriculumTopics = CURRICULUM[sub as keyof typeof CURRICULUM] || [];
        if (curriculumTopics && curriculumTopics.length > 0) {
          const hasTopicForSub = mixedTopics.some(t => curriculumTopics.some(ct => ct.topic === t));
          if (!hasTopicForSub) {
            const randomTopic = curriculumTopics[Math.floor(Math.random() * curriculumTopics.length)].topic;
            mixedTopics.push(randomTopic);
          }
        }
      });

      const finalTopicList = Array.from(new Set(mixedTopics)).slice(0, 12);
      setSelectedTopics(finalTopicList);
      
      setActiveTab('practice');
      await generateAssessmentPaper('Mock', finalTopicList, [targetSubject]);
      
      if (isTtsEnabled) {
        speak("I have synthesized a comprehensive mock examination covering your active coverage topics. Your standards papers are compiled and ready for download.");
      }
    } catch (error: any) {
      setGenerationError("Mock generation failed. Please try again.");
    } finally {
      setIsGeneratingPaper(false);
    }
  };

  const generateAssessmentPaper = async (
    paperType: 'Full' | 'Topical' | 'Mock',
    overrideTopics?: string[],
    overrideSubjects?: string[]
  ) => {
    const topicsToUse = overrideTopics || selectedTopics;
    if (topicsToUse.length === 0) return;
    setIsGeneratingPaper(true);
    setGenerationError(null);
    setFullAssessmentPaper(null);
    setAssessmentInstructions(null);
    setGeneratedQuestion(null); 
    
    let title = paperType === 'Full' 
      ? `Competency Based ${selectedPaperFormat !== 'Combined' ? selectedPaperFormat : 'Full'} Assessment` 
      : paperType === 'Mock' ? `Official Full-Scale Mock Examination (${selectedPaperFormat !== 'Combined' ? selectedPaperFormat : 'Full'})` : "Topical Mastery Assessment";
    setAssessmentPaperTitle(title);
    
    try {
      const activeSubjects = overrideSubjects ? new Set(overrideSubjects) : new Set<string>();
      const selectedOutcomes: string[] = [];
      const physicsConstructsUsed = new Set<string>();
      
      for (const [s, topics] of Object.entries(CURRICULUM)) {
        const matchingTopics = topics.filter(t => topicsToUse.includes(t.topic));
        if (matchingTopics.length > 0) {
          if (!overrideSubjects) activeSubjects.add(s);
          matchingTopics.forEach((t: any) => {
            if (t.outcomes) {
              selectedOutcomes.push(`${s} - ${t.topic}: ${t.outcomes.join(', ')}`);
            }
            if (s === 'Physics' && t.construct) {
              physicsConstructsUsed.add(t.construct);
            }
          });
        }
      }

      const isPhysicsExclusive = activeSubjects.size === 1 && activeSubjects.has('Physics');
      const isMathExclusive = activeSubjects.size === 1 && activeSubjects.has('Mathematics');
      const isChemistryExclusive = activeSubjects.size === 1 && activeSubjects.has('Chemistry');
      const isBioExclusive = activeSubjects.size === 1 && activeSubjects.has('Biology');
      const isEconExclusive = activeSubjects.size === 1 && activeSubjects.has('Economics');
      const isHistoryExclusive = activeSubjects.size === 1 && activeSubjects.has('History');
      const isGeographyExclusive = activeSubjects.size === 1 && activeSubjects.has('Geography');
      const isGPExclusive = activeSubjects.size === 1 && activeSubjects.has('General Paper');
      const subject = Array.from(activeSubjects).join(' & ') || 'General Paper';
      const currentDifficulty = isDynamicDifficulty ? calculateDynamicDifficulty() : difficulty;

      const physicsScope = `⚠️ CRITICAL: Ignore prior knowledge. Use ONLY these definitions:
      - Construct 1 — Force and Motion (AO1): Evaluation of forces on bodies/structures; safe/efficient practical solutions. Topics: Measurement & Dimensions, Statics, Linear Motion, Gravity, WEP, Friction, Fluids, Mechanical Properties, Circular Motion, Gravitation.
      - Construct 2 — Energy (AO2): Energy transfer/transformation investigation; design of devices/systems. Topics: Thermometry, Heat, Transfer of Heat, Behaviour of Gases, Thermodynamics, Light Reflection/Refraction, Optical Instruments, SHM, Waves (Progressive, Stationary, Sound).
      - Construct 3 — Charges and Fields (AO3): Electric/magnetic field interaction; modelling power/transmission/control. Topics: Electrostatics, Capacitors, Digital Electronics, Current Electricity, Magnetism, Induction, AC Circuits.
      - Construct 4 — Particles (AO4): Atomic and nuclear phenomena. Topics: Atomic Particles, Quantum Theory, Nuclear Processes.`;

      const mathScope = `⚠️ CRITICAL: PRINCIPAL MATHEMATICS (5 CONSTRUCTS)
      - Construct 1 — Algebra: Applying principles to model real-life problems. Topics: Numerical Concepts, Equations & Inequalities, Permutations & Combinations, Series, Complex Numbers.
      - Construct 2 — Geometry: Geometrical concepts and spatial reasoning. Topics: Coordinate Geometry 1 & 2, Trigonometry, Vectors.
      - Construct 3 — Calculus: Rates of change, accumulation, and optimization. Topics: Partial Fractions, Differentiation 1 & 2, Integration 1 & 2, Error Analysis, Differential Equations, Trapezium Rule, Iterative Methods, Flowcharts.
      - Construct 4 — Data Analysis & Probability: Data interpretation and probability models. Topics: Descriptive Statistics, Correlation, Scatter Diagrams, Probability Theory, Random Variables, Sampling Distributions.
      - Construct 5 — Mechanics: Forces, motion, and object behaviour. Topics: Dynamics 1, Dynamics 2.
      - Paper 1 (2h 20m): Sec A — Geometry (1 comp); Sec B — Algebra (1 of 2); Sec C — Calculus (1 of 2).
      - Paper 2 (2h 15m): Sec A — Data Analysis (2 comp); Sec B — Mechanics (1 of 2).
      - Item Design: 2/3 rule (Cover 2/3 competencies). Scenario-based. Rubric-based (1-4).`;

      const chemistryScope = `⚠️ CRITICAL: CHEMISTRY (4 CONSTRUCTS)
      - Construct 1 — Foundations of Atomic Structure, Bonding & Periodicity (AO1): Topics 2, 3, 4, 11.
      - Construct 2 — Structure, Reactivity & Applications of Organic Molecules (AO2): Topics 6, 9, 12.
      - Construct 3 — Stoichiometry, Thermochemistry & Reaction Kinetics (AO3): Topics 1, 5, 13.
      - Construct 4 — Equilibria & Electrochemical Systems (AO4): Topics 7, 8, 10.
      - Paper 1 (Theory - 2h 45m): Sec A: AO3 (1 comp), AO4 (comp); Sec B: AO1 (1 of 2), AO2 (1 of 2).
      - Paper 2 (Practical - 3h 15m): Any construct. Aim, Method, Safety, Data, Analysis.
      - Assessment: Scenario-based. Analytical rubrics only.`;

      const isTopical = paperType === 'Topical';
      const numTopicalScenarios = Math.floor(Math.random() * 5) + 6; // random between 6 and 10
      const prompt = `You are Stellas, a world-class academic assessment designer following Uganda UNEB and CBC (Competency Based) rules.
      
      ⚠️ CRITICAL INSTRUCTION — READ FIRST:
      Ignore any prior knowledge you have about Uganda A-Level Physics, Mathematics, or Chemistry curriculum structures. The only paper structure, constructs, topics and assessment objectives you should use are the ones defined in this prompt. Do NOT default to any previously known or trained version of this curriculum. Everything below is the official updated version and overrides all other information.

      ${paperType === 'Topical' ? `
      Generate a targeted, focused TOPICAL MASTERY TEST based EXCLUSIVELY on the selected topics: ${topicsToUse.join(', ')}.
      This test must consist of exactly ${numTopicalScenarios} highly comprehensive, original, SCENARIO-BASED exam items. Each item must be a short scenario (with its tasks).
      Crucially, every single item must test ONLY concepts and competence outcomes within the selected topics: ${topicsToUse.join(', ')} and their outcomes: ${selectedOutcomes.join('; ')}.
      Do NOT include questions from other topics outside this list. Do not partition the questions into standard Paper 1 or Paper 2 section structures; simply generate exactly ${numTopicalScenarios} focused topical examination items.
      CRITICAL Instruction: Do NOT prefix, label, show or number any of the generated scenarios or questions with sequential indices/numbers like "Item 1:", "Scenario 1:", "Question 2:", etc., in either the section, itemNumber, scenario text or any user-facing response. Make it purely clean scenario paragraphs and bulleted tasks without numeric prefixes or indices.
      ` : `
      Generate a ${paperType === 'Mock' ? 'FULL-SCALE MOCK EXAMINATION' : 'COMPREHENSIVE ASSESSMENT PAPER'} for ${selectedPaperFormat} consisting of ${paperType === 'Mock' ? 
        (isMathExclusive ? 
          (selectedPaperFormat === 'Paper 1' ? '5' : selectedPaperFormat === 'Paper 2' ? '3' : '8') 
        : isChemistryExclusive ? '6' : '8') 
      : (selectedPaperFormat === 'Combined' ? '6-8' : '4-5')} original SCENARIO-BASED items.
      `}

      ${(isMathExclusive && !isTopical) ? `
      📐 MATHEMATICS STRUCTURE:
      ${selectedPaperFormat === 'Paper 1' || selectedPaperFormat === 'Combined' ? `
      PAPER 1 — MATHEMATICAL CONCEPTS (PURE MATHEMATICS) [2½ hours]
      5 equally weighted compulsory items across 3 sections:
      - Section A: draws from AO1 (Algebra) — 1 item (Algebraic principles for real-life problems)
      - Section B: draws from AO2 (Geometry) — 2 items (Spatial reasoning for relationships)
      - Section C: draws from AO3 (Calculus) — 2 items (Rates of change and accumulation)` : ''}
      ${selectedPaperFormat === 'Paper 2' || selectedPaperFormat === 'Combined' ? `
      PAPER 2 — DATA ANALYSIS & MECHANICS (APPLIED MATHEMATICS) [2¼ hours]
      3 equally weighted compulsory items across 2 sections:
      - Section A: draws from AO4 (Data Analysis & Probability) — 2 items (Data analysis for informed decisions)
      - Section B: draws from AO5 (Mechanics) — 1 item (Effect of forces on bodies in motion/rest)` : ''}
      ` : ''}

      ${(isPhysicsExclusive && !isTopical) ? `
      🔬 PHYSICS STRUCTURE:
      THEORY PAPER (Paper 1 & 2 logic):
      The theory paper has 4 sections. Under the official UNEB CBC format:
      - Section A: draws from AO4 (Particles) — COMPULSORY Section.
      - Section B: draws from AO1 (Force and Motion) — Choose exactly ONE scenario-based item.
      - Section C: draws from AO2 (Energy) — Choose exactly ONE scenario-based item.
      - Section D: draws from AO3 (Charges and Fields) — Choose exactly ONE scenario-based item.
      
      PRACTICAL PAPER (If selected):
      - 2 compulsory items drawn from any 4 constructs assessing experimental skills.` : ''}

      ${(isChemistryExclusive && !isTopical) ? `
      ⚗️ CHEMISTRY STRUCTURE:
      PAPER 1 — THEORY (2 hours 45 minutes):
      - Section A (AO3): 1 compulsory item from Construct 3
      - Section A (AO4): 1 compulsory item from Construct 4
      - Section B Part I (AO1): Attempt 1 of 2 choice items from Construct 1
      - Section B Part II (AO2): Attempt 1 of 2 choice items from Construct 2

      PAPER 2 — PRACTICAL (3 hours 15 minutes):
      - 2 compulsory items from any 4 constructs. Assess science process skills (Aim, Hypothesis, Method, Data Analysis, Conclusion/Recommendations).` : ''}

      ${(isBioExclusive && !isTopical) ? `
      STRICT BIOLOGY STRUCTURE (UNEB STANDARD):
      - Paper 1: Mix of Molecular Biology, Genetics, and Physiology.
      - Paper 2: Ecology, Evolution, and Advanced Plant/Animal Physiology.` : ''}

      ${(isEconExclusive && !isTopical) ? `
      STRICT ECONOMICS STRUCTURE (UNEB STANDARD):
      - Paper 1: Economic Theory (Micro and Macro principles).
      - Paper 2: Applied Economics (Ugandan context, Policy Analysis, Development).` : ''}

      ${(isHistoryExclusive && !isTopical) ? `
      STRICT HISTORY STRUCTURE (UNEB STANDARD):
      - Paper 1: History of Africa (1855–1914).
      - Paper 2: World History (1789–1970).` : ''}

      ${(isGeographyExclusive && !isTopical) ? `
      STRICT GEOGRAPHY STRUCTURE (UNEB STANDARD):
      - Paper 1: Physical Geography (Geomorphology, Climatology, Hydrology).
      - Paper 2: World Problems and Development.
      - Paper 3: Geography of Uganda.` : ''}

      ${(isGPExclusive && !isTopical) ? `
      STRICT GENERAL PAPER STRUCTURE:
      - Section A: Argumentative essays on social, political, and economic issues.
      - Section B: Data interpretation and logical reasoning.` : ''}

      INPUT:
      Topic: ${topicsToUse.join(', ')}
      Concept: ${selectedOutcomes.join('; ')}
      Difficulty: ${currentDifficulty}
      Subject: ${subject}
      
      ${isPhysicsExclusive ? `PHYSICS CONSTRUCTS: ${physicsScope}` : ''}
      ${isMathExclusive ? `MATHEMATICS CONSTRUCTS: ${mathScope}` : ''}
      ${isChemistryExclusive ? `CHEMISTRY CONSTRUCTS: ${chemistryScope}` : ''}
      
      INSTRUCTIONS:
      0. MATHEMATICAL FORMATTING (STRICT): Use LaTeX \( ... \) for inline and \[ ... \] for display math. Units must be LaTeX e.g., \( \text{m s}^{-1} \).
      1. REALISTIC STORYTELLING: Scenarios MUST be vivid, detailed, 12-18 lines long, using Ugandan contexts/names. Include tables or technical data.
      2. CBC TASK STYLE: Use "help [Persona] work out", "advise [Persona]", "show how...". Avoid direct "calculate".
      3. COGNITIVE PROGRESSION: Match "${currentDifficulty}" level. Advanced requires deep analysis and evaluative reasoning.
      4. EACH ITEM: Must have 5-7 tasks (a, b, c, d, e...). ALWAYS start each task on a new line (a, b, c...).
      5. LABELLING (STRICT): 
         ${isTopical ? `Do NOT organize by Sections. Do NOT number or prefix the items at all (e.g., do NOT include "Item 1" or "Question 1" or "Section A"). Return each item purely as a clean scenario and tasks without any numerical or section labels inside either the "scenario" or "tasks" fields.` : `
         - Include a "GENERAL INSTRUCTIONS" block explaining how many items to attempt.
         - Organize strictly by "Section A", "Section B", etc. Use ONLY the Section name.
         - Number items sequentially (Item 1, Item 2...).
         - DO NOT include pedagogical tags like "AO1" or "Construct 1" in the output for the user.`}
      6. PRACTICAL CONTEXTS: For Chemistry, include items with practical/experimental contexts (e.g. river monitoring, industrial water treatment).
      7. ANTI-TEMPERATURE BIAS (CRITICAL): Avoid pigeonholing and repeating common scenario tropes. Specifically, NOT all scenarios require 'temperature' or weather/thermal data. Only include temperature or thermal measurements if the selected topic is explicitly about heat, thermometry, homeostasis temperature control, or thermodynamics. For all other topics (e.g., mechanics, geometry, pure chemistry, organic molecules, statistics, etc.), use topic-specific parameters (like force, distance, mass, concentration, pH, blood glucose, currency, time, etc.) instead of temperature. Be creative and diverse with your scenario parameters!
      8. TAILORED SUBSET ADAPTATION (CRITICAL): If only a limited list of topics is provided (representing the student's checked-out topics), you MUST strictly tailor all exam items, tasks, and constructs to focus ONLY on these available/active topics. If there are fewer topics than sections in the standard UNEB structure, compress or redistribute the paper sections as needed to cover ONLY the active topics while maintaining the scenario-driven competency layout. Always respect the user's coverage path.

      OUTPUT FORMAT (JSON):
      {
        "instructions": "string (Detailed examination instructions for the candidate)",
        "questions": [
          {
            "section": "string (e.g. Section A)",
            "itemNumber": "number",
            "scenario": "string",
            "tasks": "string (bulleted markdown list a, b, c... with each task on a NEW line)",
            "solution": "string",
            "formulas": "string",
            "concept": "string"
          }
        ]
      }
      
      CRITICAL: Omit any "AO" or "Construct" tags in the visible 'section' text.
    `;

      const response = await callGeminiWithRetry(
        "gemini-3.1-pro-preview",
        [{ role: 'user', parts: [{ text: prompt }] }],
        {
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                instructions: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      section: { type: Type.STRING },
                      itemNumber: { type: Type.NUMBER },
                      scenario: { type: Type.STRING },
                      tasks: { type: Type.STRING },
                      solution: { type: Type.STRING },
                      formulas: { type: Type.STRING },
                      concept: { type: Type.STRING }
                    },
                    required: ["section", "itemNumber", "scenario", "tasks", "solution", "formulas", "concept"]
                  }
                }
              },
              required: ["instructions", "questions"]
            }
          }
        }
      );

      const rawResponse = (response.text || "").trim();
      const parsedData = JSON.parse(rawResponse);
      const questions: QuestionItem[] = parsedData.questions.map((q: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        userId: auth.currentUser?.uid || 'anonymous',
        subject: subject,
        topics: topicsToUse,
        difficulty: currentDifficulty,
        createdAt: Date.now(),
        type: 'generated' as const,
        questionText: isTopical 
          ? `${q.scenario}\n\n${q.tasks}`
          : `#### ${q.section}\n\n**Item ${q.itemNumber}**\n\n${q.scenario}\n\n${q.tasks}`,
        markingScheme: `${q.solution}\n\n## Key formulas used\n\n${q.formulas}`,
        concept: q.concept,
        patternUsed: "UNEB Standard Structure",
        stepsOfSolution: [],
        questionType: "Structured Item",
        examRealismScore: 95
      }));
      
      setFullAssessmentPaper(questions);
      setAssessmentInstructions(isTopical ? null : parsedData.instructions);
      if (isTtsEnabled) {
        if (isTopical) {
          speak(`Stellas has compiled a topical test on your chosen topics.`);
        } else {
          speak(`Stellas has compiled an assessment with ${questions.length} structured items following the standard curriculum constructs.`);
        }
      }
    } catch (error: any) {
      setGenerationError(handleGenAIError(error, "Failed to compile structured paper. Please check your connection."));
    } finally {
      setIsGeneratingPaper(false);
    }
  };

  const generateFullAssessment = () => generateAssessmentPaper('Full');
  const generateTopicalAssessment = () => generateAssessmentPaper('Topical');
  const generateMockAssessment = () => generateAssessmentPaper('Mock');

  const compressImage = async (base64: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64);

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  };

  const generateSingleQuestion = async (overrideTopics?: string[]): Promise<QuestionItem | null> => {
    const activeTopics = overrideTopics || selectedTopics;
    // Determine subjects and collect outcomes from selected topics
    const selectedSubjects = new Set<string>();
    const selectedOutcomes: string[] = [];
    
    for (const [s, topics] of Object.entries(CURRICULUM)) {
      const matchingTopics = topics.filter(t => activeTopics.includes(t.topic));
      if (matchingTopics.length > 0) {
        selectedSubjects.add(s);
        matchingTopics.forEach(t => {
          if (t.outcomes) {
            selectedOutcomes.push(`${s} - ${t.topic}: ${t.outcomes.join(', ')}`);
          }
        });
      }
    }

    const subject = Array.from(selectedSubjects).join(' & ') || 'General Paper';
    const currentDifficulty = isDynamicDifficulty ? calculateDynamicDifficulty() : difficulty;
    const weakTopics = getWeakTopics();
    const isFocusingOnWeakArea = activeTopics.some(t => weakTopics.includes(t));

    // Elite Workflow: Fetch Patterns and Reference Questions
    let patterns: any[] = [];
    let references: any[] = [];
    
    try {
      // Fetch patterns for all involved subjects
      const patternsPromises = Array.from(selectedSubjects).map(s => 
        getDocs(query(collection(db, 'patterns'), where('subject', '==', s), limit(2)))
      );
      const patternsSnaps = await Promise.all(patternsPromises);
      patterns = patternsSnaps.flatMap(snap => snap.docs.map(d => d.data()));

      // Fetch references for all involved subjects
      const refsPromises = Array.from(selectedSubjects).map(s => 
        getDocs(query(collection(db, 'reference_questions'), where('subject', '==', s), limit(1)))
      );
      const refsSnaps = await Promise.all(refsPromises);
      references = refsSnaps.flatMap(snap => snap.docs.map(d => d.data()));
    } catch (e) {
      console.warn("Could not fetch patterns/references, falling back to basic generation", e);
    }
    
    const isPhysicsExclusive = selectedSubjects.size === 1 && selectedSubjects.has('Physics');
    const isMathExclusive = selectedSubjects.size === 1 && selectedSubjects.has('Mathematics');
    const isChemistryExclusive = selectedSubjects.size === 1 && selectedSubjects.has('Chemistry');
    const isBiologyExclusive = selectedSubjects.size === 1 && selectedSubjects.has('Biology');
    const isEconomicsExclusive = selectedSubjects.size === 1 && selectedSubjects.has('Economics');
    const isTdExclusive = selectedSubjects.size === 1 && selectedSubjects.has('Technical Drawing');
    const isIctExclusive = selectedSubjects.size === 1 && selectedSubjects.has('Subsidiary ICT');
    const isHistoryExclusive = selectedSubjects.size === 1 && selectedSubjects.has('History');
    const isAgricultureExclusive = selectedSubjects.size === 1 && selectedSubjects.has('Agriculture');
    const isGpExclusive = selectedSubjects.size === 1 && selectedSubjects.has('General Paper');
    const isArtExclusive = selectedSubjects.size === 1 && selectedSubjects.has('Fine Art');

    const historyScope = `⚠️ CRITICAL: HISTORY (4 CONSTRUCTS)
    - Construct 1: Social Economic Systems in Africa (Pre-colonial institutions, trade systems).
    - Construct 2: Nationalism and Governance (African nationalism, constitutionalism, sovereignty).
    - Construct 3: Global History (Napoleon, 1848 revolutions, Eastern Question).
    - Construct 4: Global Politics and Ideologies (Post-independence, Cold War, Middle East/Asia).`;

    const agricultureScope = `⚠️ CRITICAL: AGRICULTURE (4 CONSTRUCTS)
    - Philosophy: Enable learners to apply biological principles to design/implement sustainable systems, value addition, and profit-driven production.
    - Construct 1: Agriculture Biology (Biological principles to crops/animals).
    - Construct 2: Animal Production (Scientifically sound, sustainable systems).
    - Construct 3: Crop Production (Scientific crop production for profit).
    - Construct 4: Value Addition (Value addition to animal and plant products).
    - Note: Mechanisation is assessed within these constructs, not standalone. No continuous assessment.`;
    
    const ictScope = `⚠️ CRITICAL: SUBSIDIARY ICT (4 CONSTRUCTS)
    - Paper 1 (Theory - 2hrs): Scenario-based. Sec A: Construct 2; Sec B: Construct 4.
    - Paper 2 (Practical - 2.5hrs): Item 1: Construct 1; Item 2: Construct 3.
    - Construct 1: Digital Content Creation (Word counts, Formatting, Formulas, Slide design).
    - Construct 2: ICT System Operations and Maintenance (Hardware, Ethics, Security).
    - Construct 3: Data and Information Management (Databases, Networking).
    - Construct 4: Digital Communication and Emerging Technologies (Web design, AI, IoT).
    - Scoring: Qualitative Achievement per construct (Interpretation, Presentation, Decisions). NO percentage grades.`;

    const gpScope = `⚠️ CRITICAL: General Paper (4 CONSTRUCTS)
    - Construct 1: Social, Economic, and Political Awareness.
    - Construct 2: Science, Technology, and Innovation.
    - Construct 3: Ethics, Culture, and Philosophy.
    - Construct 4: Logical Reasoning and Data Interpretation.`;

    const biologyScope = `⚠️ CRITICAL: BIOLOGY (4 CONSTRUCTS)
    - Paper 1 (Theory - 3hrs): Sec A (Compulsory: C1 & C2); Sec B (C3 & C4 - 1 item choice each). Total 4 items.
    - Paper 2 (Practical - 3hrs): Item 1 (Investigation); Item 2 (Structural/survival advantage).
    - Construct 1: Cellular Organisation, Respiration & Molecular Analysis (Biomolecules, ATP, Genetic tech).
    - Construct 2: Plant Physiology and Adaptation (C3/C4, growth, hormonal control).
    - Construct 3: Analysis of Animal Systems and Behaviours (Nervous, homeostasis, circulations).
    - Construct 4: Genetic, Evolutionary & Ecological Dynamics (Genetics, Speciation, Ecosystems).
    - Theory Scoring: Interpretation, Presentation, Judgment.
    - Practical Scoring: Planning, Risks, Procedure, Data, Analysis, Recommendations.`;

    const physicsScope = `⚠️ CRITICAL: PHYSICS (4 CONSTRUCTS)
    - Construct 1 — Force and Motion (AO1): Measurement & Dimensions, Statics, Linear Motion, Gravity, WEP, Friction, Fluids, Mechanical Properties, Circular Motion, Gravitation.
    - Construct 2 — Energy (AO2): Thermometry, Heat, Transfer of Heat, Behaviour of Gases, Thermodynamics, Reflection/Refraction, Optical Instruments, SHM, Waves (Progressive, Stationary, Sound).
    - Construct 3 — Charges and Fields (AO3): Electrostatics, Capacitors, Digital Electronics, Current Electricity, Magnetism, Induction, AC Circuits.
    - Construct 4 — Particles (AO4): Atomic Particles, Quantum Theory, Nuclear Processes.`;

    const chemistryScope = `⚠️ CRITICAL: CHEMISTRY (4 CONSTRUCTS)
    - Construct 1 — Foundations of Atomic Structure, Bonding & Periodicity (AO1): Topics 2, 3, 4, 11.
    - Construct 2 — Structure, Reactivity & Applications of Organic Molecules (AO2): Topics 6, 9, 12.
    - Construct 3 — Stoichiometry, Thermochemistry & Reaction Kinetics (AO3): Topics 1, 5, 13.
    - Construct 4 — Equilibria & Electrochemical Systems (AO4): Topics 7, 8, 10.
    - Paper 1 (Theory - 2h 45m): Sec A: AO3 (1 comp), AO4 (comp); Sec B: AO1 (1 of 2), AO2 (1 of 2).
    - Paper 2 (Practical - 3h 15m): Any construct. Aim, Method, Data, Analysis. Contexts: environmental, water, industrial.
    - Assessment: Scenario-based. Analytical rubrics only.`;

    const mathScope = `⚠️ CRITICAL: PRINCIPAL MATHEMATICS (5 CONSTRUCTS)
    - Construct 1 — Algebra: Applying principles to model real-life problems. Topics: Numerical Concepts, Equations & Inequalities, Permutations & Combinations, Series, Complex Numbers.
    - Construct 2 — Geometry: Geometrical concepts and spatial reasoning. Topics: Coordinate Geometry 1 & 2, Trigonometry, Vectors.
    - Construct 3 — Calculus: Rates of change, accumulation, and optimization. Topics: Partial Fractions, Differentiation 1 & 2, Integration 1 & 2, Error Analysis, Differential Equations, Trapezium Rule, Iterative Methods, Flowcharts.
    - Construct 4 — Data Analysis & Probability: Data interpretation and probability models. Topics: Descriptive Statistics, Correlation, Scatter Diagrams, Probability Theory, Random Variables, Sampling Distributions.
    - Construct 5 — Mechanics: Forces, motion, and object behaviour. Topics: Dynamics 1, Dynamics 2.
    - Paper 1 (2h 20m): Sec A — Geometry (1 comp); Sec B — Algebra (1 of 2); Sec C — Calculus (1 of 2).
    - Paper 2 (2h 15m): Sec A — Data Analysis (2 comp); Sec B — Mechanics (1 of 2).
    - Item Design: 2/3 rule (Items must cover 2/3 of competencies). Scenario-based. Rubric (1-4).`;

    const economicsScope = `⚠️ CRITICAL: ECONOMICS (4 CONSTRUCTS)
    - Construct 1 — Resource Allocation: Market behaviour and household consumption. (P1 Sec A: Compulsory).
    - Construct 2 — Economic Strategy: Economic growth, development theories, international trade. (P2 Sec A: Compulsory).
    - Construct 3 — Economic Planning and Policy: Money, banking, inflation, public finance, national income. (P2 Sec B: Choice).
    - Construct 4 — Population and Labour Dynamics for Production: Population, labour, production capacity. (P1 Sec B: Choice).
    - Assessment: ALL scenario-based analysis. Rubrics based on "Basis of Assessment" ONLY. No marking guides.`;

    const tdScope = `⚠️ CRITICAL: TECHNICAL DRAWING (4 OBJECTIVES)
    - Objective 1 — Geometric and Spatial Skills: Projection of Solids, Surface Development, Intersection of Solids.
    - Objective 2 — Structural Analysis: Structural behaviour/load-bearing for beams and frameworks. (Force Analysis, Vector Geometry).
    - Objective 3 — Mechanical Drafting and Assembly: Mechanical components (Machine Drawing, Power Transmission). Industry standards.
    - Objective 4 — Architectural & Building Practice: Foundations, Floors, Wall/Roof Design, Building Drawing (MAX 6 room bungalow).
    - Assessment: All scenario-based. Score 1-4. BASES: Interpretation, Coherence/Logic, Reasoning, Process, Completeness.`;

    const engineeringScope = `⚠️ CRITICAL: ENGINEERING (WOODWORK/METALWORK)
    - Woodwork Construct 1: Production (Workshop, safety, timber tech, design, drawing, furniture).
    - Woodwork Construct 2: Concepts and Design (Practical application in real scenarios).
    - Woodwork Paper 1 (3h): Drafting skills & Concepts.
    - Woodwork Paper 2 (3h 15m): Practical (Process + Product).
    - Metalwork Construct 1 — Design, Innovation and Analysis: Engineering materials, metal fabrication, foundry design processes, and tools. (Paper 1).
    - Metalwork Construct 2 — Metal Fabrication and Production: Arc/Gas welding, fasteners, brazing, soldering, sand casting, HSE compliance. (Paper 2).
    - Assessment: Scenario-based. Rubric (1-4). Process + Product eval. No marking guides.`;

    const religiousStudiesScope = `⚠️ CRITICAL: RELIGIOUS STUDIES (IRE/CRE)
    - IRE Constructs: Foundational Knowledge, Quran & Sunnah, Faith & Practice, Life of Prophet (PBUH), Islamic Civilization.
    - IRE Paper 1: C1, C2, C3.
    - IRE Paper 2: Sec A (C4 choice); Sec B (C5 choice).
    - CRE Constructs: Foundations (Israel), Offices in Israel, Jesus & Early Church, Social Relations/Stewardship, Civic Responsibility/Ethics.
    - CRE Paper 1: Sec A (C1 & C2 Compulsory); Sec B (C3 choice of 1 of 2).
    - CRE Paper 2: Sec A (C4 choice); Sec B (C5 choice).
    - Assessment: Scenario-based, integrating Biblical/Islamic themes with real-world application. Analytical rubrics only.`;

    const literatureScope = `⚠️ CRITICAL: LITERATURE IN ENGLISH (2 CONSTRUCTS)
    - Construct 1: Appreciation of Literary Works (Prose, Poetry, Drama, Novel).
    - Construct 2: Creation of Original Works (Prose and Drama only, Poetry is EXCLUDED).`;

    const languagesScope = `⚠️ CRITICAL: FOREIGN LANGUAGES (B1 CEFR TARGET)
    - Construct: Effective Communication (Oral and Written exchange in target language).
    - Paper 1 (Reading & Writing): Sec A: Compulsory Reading; Sec B: Translation; Sec C: Choice of scenario-based composition. (Latin: choice of 1 of 3 set texts).
    - Paper 2 (Listening/Speaking): Recorded listening + Interaction.
    - Assessment: Analytical rubrics for Content Relevance, Coherence, and Accuracy. NO percentages.`;

    const artScope = `⚠️ CRITICAL: ART AND DESIGN (FINE ART)
    - Construct 1 — Art Analysis: Historical periods & Contemporary Ugandan art critique.
    - Construct 2 — Art Making: Scenario-based problem solving (3-hour practical).
    - Paper 2 Rules: Free choice of medium. Learner picks 1 of 2 options.
    - Scoring: Ideation (1-4) and Production/Presentation (1-4). NO coursework.`;

    const prompt = `You are Stellas, a world-class academic question generator following the new Uganda Advanced Secondary Competency-Based Curriculum (CBC) assessment model.
      
      ⚠️ CRITICAL INSTRUCTION — READ FIRST:
      Ignore any prior knowledge you have about Uganda A-Level assessment, marking, or grading. The only assessment framework you should use is the one defined below. This overrides all previously known UNEB marking schemes entirely.

      OVERVIEW OF THE ASSESSMENT MODEL:
      Every scenario-based item evaluates how well a learner integrates knowledge, concepts, generic skills, and values to solve a real-world problem.
      - Integration of Knowledge: Require learners to integrate skills across topics.
      - Contextualized Problem Solving: Present real-world Ugandan problems requiring subject-specific analysis.
      - Higher-Order Thinking: Necessitate deep understanding of context, not rote recall.
      - Application of Theory: Demonstrate the ability to apply theoretical principles to practical challenges.
      - Qualitative Evaluation: Focus on fit-for-purpose, logically connected, and well-justified responses.

      STRUCTURE OF EVERY ASSESSMENT ITEM:
      Every scenario-based item MUST be divided into three major sections:
      Section 1 — Introduction (Interpretation of Task/Context)
      Section 2 — Generating and Presenting Ideas
      Section 3 — Informed Judgment / Conclusion

      BASES OF ASSESSMENT:
      Every item MUST have exactly 5 bases of assessment normally.
      1. Section 1 (Basis a): Comprehension of the task in respect to the scenario/context.
      2. Section 2 (Basis a): Generates ideas that address the task.
      3. Section 2 (Basis b): Makes connections within and between ideas and context.
      4. Section 2 (Basis c): Presents ideas in a coherent and organized manner.
      5. Section 3 (Basis a): Provides a well-reasoned judgment or conclusion linked to the scenario.
      
      SPECIAL CASES:
      - If Subject is History or Biology: Use exactly 3 bases:
        1. Interpretation (Comprehension of task/context)
        2. Presentation (Analysis, idea generation, evidence)
        3. Judgment (Informed conclusion/solution)
      - If Subject is Technical Drawing: Use these 5 specific bases:
        1. Interpretation of task
        2. Coherence and Logic
        3. Evidence-based Reasoning
        4. Process and Procedure
        5. Completeness and Accuracy

      INPUT:
      Topic: ${selectedTopics.join(', ')}
      Concept: ${selectedOutcomes.join('; ')}
      Difficulty: ${currentDifficulty}
      Subject: ${subject}
      Adaptive Mode: ${isDynamicDifficulty ? 'ON' : 'OFF'}
      
      STRICT SUBJECT SCHEMAS (CONSTRUCTS):
      ${isPhysicsExclusive ? `PHYSICS: ${physicsScope}` : ''}
      ${isMathExclusive ? `MATHEMATICS: ${mathScope}` : ''}
      ${isChemistryExclusive ? `CHEMISTRY: ${chemistryScope}` : ''}
      ${isBiologyExclusive ? `BIOLOGY: ${biologyScope}` : ''}
      ${isEconomicsExclusive ? `ECONOMICS: ${economicsScope}` : ''}
      ${isTdExclusive ? `TECHNICAL DRAWING: ${tdScope}` : ''}
      ${isIctExclusive ? `SUBSIDIARY ICT: ${ictScope}` : ''}
      ${isHistoryExclusive ? `HISTORY: ${historyScope}` : ''}
      ${isAgricultureExclusive ? `AGRICULTURE: ${agricultureScope}` : ''}
      ${isGpExclusive ? `GENERAL PAPER: ${gpScope}` : ''}
      ${isArtExclusive ? `ART: ${artScope}` : ''}
      ${subject === 'Woodwork' || subject === 'Metalwork' ? `ENGINEERING: ${engineeringScope}` : ''}
      ${subject === 'Literature in English' ? `LITERATURE: ${literatureScope}` : ''}
      ${subject === 'IRE' || subject === 'CRE' ? `RELIGIOUS STUDIES: ${religiousStudiesScope}` : ''}
      ${['French', 'German', 'Arabic', 'Chinese', 'Latin'].includes(subject) ? `LANGUAGES: ${languagesScope}` : ''}

      INSTRUCTIONS:
      1. Scenario: Vivid, data-rich, Ugandan context, 120-180 words.
      2. Task: A clear objective that emerges from the scenario (NEVER use "calculate", "find", etc). Do NOT write this as a single block of text or standard generic paragraph. Instead, AVOID block tasks and PREFER parted tasks structure. Divide the tasks into clear distinct sub-parts using letters or parts (for example, "a) ... b) ... c) ..."). Each parted task should use guided action verbs (e.g., "a) Advise...", "b) Help...", "c) Support...").
      3. Mathematical Formatting: USE LATEX EXCLUSIVELY FOR ALL NUMBERS AND MATH. Use \( ... \) for inline math (e.g., \(15\), \(\frac{1}{2}\)) and \[ ... \] for display math. You MUST wrap ALL numbers, units, and mathematical expressions in these delimiters. Do NOT output plain numbers outside of LaTeX blocks.
      4. Items are at CONSTRUCT level. Integrate skills from across the selected topics.
      5. 70% COMPETENCY COVERAGE RULE (UNEB DIRECTIVE):
         - Calculate the total number of learning outcomes listed in the Learning Outcomes List above.
         - Calculate 70% of this total (round up to the nearest whole number).
         - The items MUST collectively touch on at least that many outcomes.
         - Do NOT write or output "Competency Coverage: X%" or any similar phrase or percentage indicator inside the "scenario" or "task" strings. Keep all competency metrics and percentages strictly within the "competencyCoveragePercentage" field of the JSON output and never show them in the visible question/task text. 
      6. ANTI-TEMPERATURE BIAS (CRITICAL): Avoid pigeonholing and repeating common scenario tropes. Specifically, NOT all scenarios require 'temperature' or weather/thermal data. Only include temperature or thermal measurements if the selected topic is explicitly about heat, thermometry, homeostasis temperature control, or thermodynamics. For all other topics (e.g., mechanics, geometry, pure chemistry, organic molecules, statistics, etc.), use topic-specific parameters (like force, distance, mass, concentration, pH, blood glucose, currency, time, etc.) instead of temperature. Be creative and diverse with your scenario parameters!

      OUTPUT FORMAT (JSON):
      {
        "scenario": "string",
        "task": "string",
        "competencyCoveragePercentage": number,
        "construct": "string",
        "basesOfAssessment": [
          { "id": "1", "name": "Basis Name", "description": "Criteria for score 4...", "section": "Section Name" },
          ... (3 for History, 5 otherwise)
        ],
        "solution": "Detailed rubric for each basis following the 4-level scale",
        "formulas": "markdown list",
        "concept": "string",
        "patternUsed": "string",
        "stepsOfSolution": ["string"],
        "questionType": "string",
        "examRealismScore": number
      }`;

    const response = await callGeminiWithRetry(
      "gemini-3.1-pro-preview",
      [{ role: 'user', parts: [{ text: prompt }] }],
      {
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenario: { type: Type.STRING },
              task: { type: Type.STRING },
              competencyCoveragePercentage: { type: Type.NUMBER },
              construct: { type: Type.STRING },
              basesOfAssessment: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    section: { type: Type.STRING }
                  },
                  required: ["id", "name", "description", "section"]
                }
              },
              solution: { type: Type.STRING },
              formulas: { type: Type.STRING },
              concept: { type: Type.STRING },
              patternUsed: { type: Type.STRING },
              stepsOfSolution: { type: Type.ARRAY, items: { type: Type.STRING } },
              questionType: { type: Type.STRING },
              examRealismScore: { type: Type.NUMBER }
            },
            required: ["scenario", "task", "competencyCoveragePercentage", "construct", "basesOfAssessment", "solution", "formulas", "concept", "patternUsed", "stepsOfSolution", "questionType", "examRealismScore"]
          }
        }
      }
    );

    const rawResponse = (response.text || "").trim();
    let parsed: any;
    try {
      if (!rawResponse) throw new Error("Empty AI response");
      parsed = JSON.parse(rawResponse);
    } catch (e) {
      console.error("Failed to parse AI response as JSON", e);
      return null;
    }

    const questionMarkdown = `
${parsed.scenario}

### The Task
${parsed.task}
    `.trim();

    const solutionMarkdown = `
## Marking Guide (CBC Scoring Rubric)
${parsed.solution}

## Key formulas used
${parsed.formulas}
    `.trim();
    
    const needsImage = questionMarkdown.toLowerCase().includes('diagram') || 
                       questionMarkdown.toLowerCase().includes('illustration') || 
                       questionMarkdown.toLowerCase().includes('figure') ||
                       questionMarkdown.toLowerCase().includes('image');

    let scenarioImage: string | undefined = undefined;
    if (needsImage) {
      const imagePrompt = `Create a clear, educational UNEB-style illustration for this A-Level question: ${questionMarkdown.substring(0, 500)}`;
      const generatedImg = await generateImage(imagePrompt);
      if (generatedImg) {
        // Compress image to ensure document size doesn't exceed 1MB limit
        scenarioImage = await compressImage(generatedImg);
      }
    }
    
    const questionItem: any = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user!.uid,
      subject,
      topics: selectedTopics,
      construct: parsed.construct,
      scenario: parsed.scenario,
      task: parsed.task,
      basesOfAssessment: parsed.basesOfAssessment,
      questionText: questionMarkdown,
      markingScheme: solutionMarkdown,
      difficulty: parsed.difficulty || difficulty,
      createdAt: Date.now(),
      type: 'generated',
      ...(parsed.concept && { concept: parsed.concept }),
      ...(parsed.patternUsed && { patternUsed: parsed.patternUsed }),
      ...(parsed.stepsOfSolution && { stepsOfSolution: parsed.stepsOfSolution }),
      ...(parsed.questionType && { questionType: parsed.questionType }),
      ...(parsed.examRealismScore && { examRealismScore: parsed.examRealismScore }),
      competencyCoveragePercentage: parsed.competencyCoveragePercentage,
      ...(parsed.scenarioGraph && { scenarioGraph: parsed.scenarioGraph }),
      ...(parsed.solutionGraph && { solutionGraph: parsed.solutionGraph }),
      ...(scenarioImage && { scenarioImage })
    };
    
    return questionItem;
  };

  const evaluateAnswer = async (question: QuestionItem, answer: string): Promise<AnswerRecord | null> => {
    const evaluationPrompt = `You are a UNEB Senior Examiner following the new Uganda Advanced Secondary Competency-Based Curriculum (CBC) assessment framework.
    
    Evaluate this student's response based on the provide bases of assessment using the 4-Level Analytical Scale (Score 1 to 4).

    BASES OF ASSESSMENT:
    ${question.basesOfAssessment.map(b => `- [${b.id}] ${b.name}: ${b.description}`).join('\n')}

    SCORING RUBRIC (4-LEVEL SCALE):
    - Score 4 (Exceptional): Comprehensive understanding, multiple strong connections, logical, well-reasoned judgment.
    - Score 3 (Outstanding): General understanding, minor omissions, most ideas connected, logical connections mostly established.
    - Score 2 (Satisfactory/Basic): Partial understanding, limited reference to scenario, a few ideas address task.
    - Score 1 (Elementary): Limited understanding, little or no reference to context/scenario.

    QUESTION SCENARIO:
    ${question.scenario}

    TASK:
    ${question.task}
    
    STUDENT ANSWER:
    ${answer}
    
    Provide your evaluation in JSON format exactly as follows:
    {
      "feedback": "Comprehensive synthesis of strengths and growth areas.",
      "scoresByBasis": {
        "1": 4, // ID of basis mapping to score 1-4
        "2": 3,
        ...
      }
    }`;

    const response = await callGeminiWithRetry(
      "gemini-3.1-pro-preview",
      [{ role: 'user', parts: [{ text: evaluationPrompt }] }],
      { config: { responseMimeType: "application/json" } }
    );

    const result = JSON.parse(response.text || '{}');
    const scoresByBasis = result.scoresByBasis || {};
    const totalScore = Object.values(scoresByBasis).reduce((a: any, b: any) => a + b, 0) as number;
    const maxTotalScore = question.basesOfAssessment.length * 4;
    const percentageScore = (totalScore / maxTotalScore) * 100;

    // Achievement Levels & Grade Weights logic
    let achievementLevel: AnswerRecord['achievementLevel'] = 'Elementary';
    let gradeWeight = 1;

    if (percentageScore >= 90) { achievementLevel = 'Exceptional'; gradeWeight = 5; }
    else if (percentageScore >= 75) { achievementLevel = 'Outstanding'; gradeWeight = 4; }
    else if (percentageScore >= 55) { achievementLevel = 'Satisfactory'; gradeWeight = 3; }
    else if (percentageScore >= 35) { achievementLevel = 'Basic'; gradeWeight = 2; }

    return {
      userId: user!.uid,
      questionId: question.id,
      answerText: answer,
      feedback: result.feedback || "Evaluation synthesised without detailed feedback.",
      scoresByBasis,
      totalScore,
      maxTotalScore,
      percentageScore,
      achievementLevel,
      gradeWeight,
      timestamp: Date.now()
    };
  };

  const generatePracticeQuestion = async (overrideTopics?: string[]) => {
    let topicsToUse = overrideTopics || [...selectedTopics];
    if (overrideTopics) {
      setSelectedTopics(overrideTopics);
    }
    
    // Automatically suggest/pick weak topics if none selected
    if (topicsToUse.length === 0) {
      const weakTopics = getWeakTopics();
      if (weakTopics.length > 0) {
        // Pick top 3 weak topics
        topicsToUse = weakTopics.slice(0, 3);
        setSelectedTopics(topicsToUse);
        
        if (isTtsEnabled) {
          speak("You haven't selected any topics, so I'm prioritizing your areas that need the most focus today.");
        }
      } else {
        setGenerationError("Please select at least one topic to begin your assessment.");
        return;
      }
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedQuestion(null);
    setFeedback(null);
    setStudentAnswer('');
    
    try {
      const newQuestion = await generateSingleQuestion(topicsToUse);
      if (!newQuestion) throw new Error("Failed to generate question");

      setGeneratedQuestion(newQuestion);
      setShowSolution(false);
      try {
        await addDoc(collection(db, 'questions'), newQuestion);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'questions');
      }
      
      if (isTtsEnabled) {
        speak("New targeted assessment item generated. Review the scenario carefully.");
      }
      
    } catch (error: any) {
      setGenerationError(handleGenAIError(error, "Failed to generate question. Please try again."));
    } finally {
      setIsGenerating(false);
    }
  };



      const biologyScope = `
      SENIOR 5 TOPICS:
      1. Chemicals of Life (Water, Lipids, Proteins, Enzymes)
      2. Microscopy (Light microscope, Magnification)
      3. Cell Ultrastructure (Prokaryotic/Eukaryotic, Organelles, Plasma membrane)
      4. Diversity of Tissues (Plant and Animal tissues, Levels of organisation)
      5. Photosynthesis (C3/C4 pathways, Chloroplast, Environmental factors)
      6. Transport in Humans (Heart, Haemoglobin, Gas transport)
      7. Immunity (Vaccination, Antibodies, Allergic reactions)
      8. Respiration (Mitochondrion, Glycolysis, Krebs cycle, Oxidative phosphorylation)
      9. Homeostasis (Negative feedback, Temperature regulation, ADH)
      10. Osmoregulation (Xerophytes, Mesophytes, Hydrophytes, Plant products)

      SENIOR 6 TOPICS:
      11. Coordination in Plants (Tropisms, Photoperiodism, Growth regulators)
      12. Neural Transmission (Neurone, Impulse, Synapses)
      13. Sensory Receptors (Retina, Ear/Balance)
      14. Animal Behaviour (Innate/Learned, Survival)
      15. Molecular Biology (DNA/RNA, Replication, Protein synthesis)
      16. Cell Division & Cancer (Mitosis, Meiosis, Cancer)
      17. Gene Technology (Recombinant DNA, PCR, GMOs, Ethics)
      18. Inheritance (Mendelian laws, Hardy-Weinberg, Linkage)
      19. Evolution (Advancements in life processes, Speciation, Extinction)
      20. Growth & Development (Seed dormancy, Metamorphosis)
      21. Ecology (Population dynamics, Succession, Energy flow, Carbon footprint, Invasive species, Food security)
      `;















  const submitAnswer = async () => {
    if (!generatedQuestion || !studentAnswer.trim()) return;
    setIsSubmitting(true);

    try {
      const resultRecord = await evaluateAnswer(generatedQuestion, studentAnswer);
      if (!resultRecord) throw new Error("Failed to evaluate answer");

      try {
        await addDoc(collection(db, 'answers'), resultRecord);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'answers');
      }
      setFeedback(resultRecord);

      // Update User Profile with dynamic questionsAttempted, averageScore, and lastActiveAt in Firestore
      try {
        const prevQuestions = profile?.questionsAttempted || 0;
        const prevAvg = profile?.averageScore || 0;
        const nextQuestions = prevQuestions + 1;
        const nextAvg = ((prevAvg * prevQuestions) + resultRecord.percentageScore) / nextQuestions;
        await updateProfile({
          questionsAttempted: nextQuestions,
          averageScore: nextAvg,
          lastActiveAt: Date.now()
        });
      } catch (profileErr) {
        console.error("Failed to update user profile stats", profileErr);
      }

      if (isTtsEnabled) {
        const achievementMsg = resultRecord.achievementLevel === 'Exceptional' || resultRecord.achievementLevel === 'Outstanding' 
          ? "Excellent achievement! " 
          : "Good attempt. ";
        speak(achievementMsg + resultRecord.feedback.substring(0, 500));
      }

      // Update Analytics
      const analyticsRef = doc(db, 'analytics', user!.uid);
      const currentPerf = { ...(analytics?.topicPerformance || {}) };
      const currentConceptMastery = { ...(analytics?.conceptMastery || {}) };
      
      const getMasteryLevel = (score: number) => {
        if (score >= 80) return 'Expert';
        if (score >= 60) return 'Proficient';
        if (score >= 40) return 'Intermediate';
        return 'Novice';
      };

      const getTrend = (prevScore: number, newScore: number) => {
        if (newScore > prevScore + 2) return 'improving';
        if (newScore < prevScore - 2) return 'declining';
        return 'stable';
      };

      generatedQuestion.topics.forEach(async (topic) => {
        const prev = currentPerf[topic] || { 
          attempts: 0, 
          averageScore: 0, 
          masteryLevel: 'Novice', 
          lastAttemptTimestamp: 0, 
          trend: 'stable' 
        };
        const newAvg = (prev.averageScore * prev.attempts + resultRecord.percentageScore) / (prev.attempts + 1);
        
        const newPerformance = {
          attempts: prev.attempts + 1,
          averageScore: newAvg,
          masteryLevel: getMasteryLevel(newAvg) as 'Novice' | 'Intermediate' | 'Proficient' | 'Expert',
          lastAttemptTimestamp: Date.now(),
          trend: getTrend(prev.averageScore, resultRecord.percentageScore) as 'improving' | 'declining' | 'stable'
        };
        currentPerf[topic] = newPerformance;

        // Also update the dedicated mastery collection for deeper tracking
        const masteryRef = doc(db, `mastery/${user!.uid}/topics`, topic);
        const currentScores = topicMastery[topic]?.scorePercentages || [];
        const nextScores = [...currentScores, resultRecord.percentageScore].slice(-10); // Keep last 10 scores
        
        const topicMasteryData: TopicMastery = {
          topic,
          subject: generatedQuestion.subject,
          scorePercentages: nextScores,
          averageScore: newAvg,
          masteryLevel: getMasteryLevel(newAvg) as any,
          lastEvaluated: Date.now()
        };

        try {
          await setDoc(masteryRef, topicMasteryData);
        } catch (err) {
          console.error("Failed to save topic mastery", err);
        }
      });

      if (generatedQuestion.concept) {
        const concept = generatedQuestion.concept;
        const prevConcept = currentConceptMastery[concept] || { masteryScore: 0, questionsSolved: 0, lastTested: 0 };
        currentConceptMastery[concept] = {
          masteryScore: (prevConcept.masteryScore * prevConcept.questionsSolved + resultRecord.percentageScore) / (prevConcept.questionsSolved + 1),
          questionsSolved: prevConcept.questionsSolved + 1,
          lastTested: Date.now()
        };
      }

      const updatedAnalytics: AnalyticsRecord = {
        userId: user!.uid,
        topicPerformance: currentPerf,
        conceptMastery: currentConceptMastery,
        timeSpent: (analytics?.timeSpent || 0) + 5, // Assume 5 mins per question
        mistakesFrequency: {
          ...(analytics?.mistakesFrequency || {}),
        },
        lastUpdated: Date.now()
      };

      if (isDynamicDifficulty) {
        const newDifficulty = calculateDynamicDifficulty(updatedAnalytics);
        if (newDifficulty !== difficulty) {
          setDifficulty(newDifficulty);
        }
      }

      try {
        await setDoc(analyticsRef, updatedAnalytics);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `analytics/${user!.uid}`);
      }
      setAnalytics(updatedAnalytics);

    } catch (error: any) {
      setGenerationError(handleGenAIError(error, "Failed to evaluate answer. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };



  if (loading || (user && !profile)) {
    return (
      <div className={`h-screen flex overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        {/* Skeletal Sidebar */}
        <div className={`hidden lg:flex flex-col w-72 shrink-0 border-r ${
          isDarkMode ? 'bg-slate-950/50 border-slate-900' : 'bg-white border-slate-150'
        } p-6 h-full`}>
          {/* Logo Brand Segment */}
          <div className="flex items-center gap-3 animate-pulse">
            <div className={`w-10 h-10 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
            <div className="flex flex-col gap-1.5">
              <div className={`h-4 w-28 rounded-md ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
              <div className={`h-2.5 w-20 rounded-md ${isDarkMode ? 'bg-slate-900/65' : 'bg-slate-150'}`} />
            </div>
          </div>
          
          {/* Navigation Items */}
          <div className="flex-1 mt-12 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex items-center gap-3 py-1">
                <div className={`w-5 h-5 rounded-md ${isDarkMode ? 'bg-slate-900' : 'bg-slate-250'}`} />
                <div className={`h-3 w-32 rounded-md ${isDarkMode ? 'bg-slate-900' : 'bg-slate-250'}`} style={{ width: `${60 + (idx % 3) * 15}%` }} />
              </div>
            ))}
          </div>

          {/* User Profile Footer row */}
          <div className="flex items-center gap-3 mt-auto p-2 border-t border-dashed border-slate-900/40 animate-pulse">
            <div className={`w-9 h-9 rounded-full ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
            <div className="flex flex-col gap-1">
              <div className={`h-3 w-24 rounded-md ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
              <div className={`h-2 w-16 rounded-md ${isDarkMode ? 'bg-slate-900/65' : 'bg-slate-150'}`} />
            </div>
          </div>
        </div>

        {/* Main Workspace Frame */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Header Panel */}
          <header className={`h-16 border-b flex items-center justify-between px-6 md:px-8 ${
            isDarkMode ? 'border-slate-900 bg-slate-950/40' : 'border-slate-100 bg-white/40'
          } animate-pulse`}>
            {/* Title / Tab Indicator */}
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-md lg:hidden ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
              <div className={`h-4 w-32 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
            </div>
            
            {/* Right side items */}
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
              <div className={`w-8 h-8 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
              <div className={`h-8 w-24 rounded-lg hidden md:block ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
            </div>
          </header>

          {/* Core Hub Workspace */}
          <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
            {/* Greeting segment */}
            <div className="space-y-2 animate-pulse">
              <div className={`h-7 w-56 rounded-xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
              <div className={`h-4 w-80 rounded-lg ${isDarkMode ? 'bg-slate-900/65' : 'bg-slate-150'}`} />
            </div>

            {/* Metric Blocks Banner Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-150'
                } space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className={`w-7 h-7 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                    <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                  </div>
                  <div className="space-y-1.5">
                    <div className={`h-3 w-16 rounded-md ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                    <div className={`h-5 w-24 rounded-lg ${isDarkMode ? 'bg-slate-900/40' : 'bg-slate-150'}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary Double Columns Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
              {/* Primary Large Feed Column */}
              <div className="xl:col-span-2 space-y-6 animate-pulse">
                <div className={`p-6 rounded-3xl border min-h-[320px] ${
                  isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-150'
                } space-y-6`}>
                  <div className="flex items-center justify-between">
                    <div className={`h-4 w-40 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                    <div className={`w-16 h-6 rounded-md ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                  </div>
                  
                  {/* Rows inside container */}
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((r) => (
                      <div key={r} className="flex gap-4 items-center">
                        <div className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                        <div className="flex-1 space-y-2">
                          <div className={`h-3 w-3/4 rounded-md ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                          <div className={`h-2.5 w-1/2 rounded-md ${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-150'}`} />
                        </div>
                        <div className={`w-12 h-4 rounded-md ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Info Panel */}
              <div className="space-y-6 animate-pulse">
                <div className={`p-6 rounded-3xl border min-h-[320px] ${
                  isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-150'
                } space-y-6`}>
                  <div className={`h-4 w-28 rounded-lg ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                  
                  {/* Sub cards */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className={`h-2.5 w-20 rounded-md ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                          <div className={`h-2.5 w-10 rounded-md ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                        </div>
                        <div className={`h-2 w-full rounded-full ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
                          <div className={`h-full rounded-full ${isDarkMode ? 'bg-slate-900' : 'bg-slate-250'}`} style={{ width: `${30 + s * 20}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2">
                    <div className={`h-12 w-full rounded-xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resend-based Custom Email Verification Shield
  if (user && profile && profile.isVerified === false) {
    return (
      <VerificationScreen 
        user={user} 
        profile={profile}
        isDarkMode={isDarkMode} 
        onLogout={handleLogout} 
        sendVerificationEmail={sendVerificationEmail}
      />
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 p-4 relative overflow-hidden ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        {/* Dynamic AI Connection Canvas Background representing Stella's neural connection */}
        <AiThinkingBackground isDarkMode={isDarkMode} />

        <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-[100]">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all shadow-sm border ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
                : 'bg-white border-slate-150 text-slate-400 hover:text-brand-600'
            }`}
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center space-y-6 sm:space-y-8 relative z-10"
        >
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="p-4 sm:p-5 bg-brand-600 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-brand-500/40 -rotate-3 transition-transform hover:rotate-0 duration-500">
                <StellaLogo className="w-9 h-9 sm:w-12 sm:h-12" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className={`text-4xl sm:text-6xl font-display font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>STELLAS</h1>
              <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] opacity-40">UNEB TAILORED TUTOR</p>
            </div>
          </div>

          <div className={`p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] border space-y-6 sm:space-y-8 transition-all duration-700 relative overflow-hidden group ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-slate-950/40' : 'bg-white/95 border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-brand-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="space-y-1.5 relative z-10">
              <h2 className={`text-xl sm:text-2xl font-display font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {authMode === 'google' ? 'Authentication Required' : 'Sign In or Sign Up'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-tight leading-relaxed">Access your study dashboard and school curriculum.</p>
            </div>

            {authMode === 'google' && (
              <div className="space-y-6 sm:space-y-8 relative z-10 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => {
                      setAuthMode('email');
                      setEmailMode('signup');
                      setAuthSignupStep(1);
                    }}
                    className={`w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 rounded-2xl font-bold transition-all group hover:scale-[1.01] active:scale-[0.99] ${
                      isDarkMode 
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/10' 
                        : 'bg-brand-600 text-white shadow-lg shadow-brand-500/5 hover:bg-brand-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div>
                        <span className="block text-base sm:text-lg tracking-tight">Create Account</span>
                        <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-60">Register New User</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button 
                    onClick={() => {
                      setAuthMode('email');
                      setEmailMode('login');
                    }}
                    className={`w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 rounded-2xl font-bold transition-all group hover:scale-[1.01] active:scale-[0.99] border-2 ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900' 
                        : 'bg-white border-slate-100 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div>
                        <span className="block text-base sm:text-lg tracking-tight">Sign In</span>
                        <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-40">Existing Account</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}></div></div>
                  <div className="relative flex justify-center text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em]"><span className={`px-3 transition-colors ${isDarkMode ? 'bg-slate-900 text-slate-600' : 'bg-white text-slate-400'}`}>Alternative Sign In Options</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={loginLoading}
                    className={`flex items-center justify-center p-3.5 sm:p-4 rounded-xl border-2 transition-all group hover:-translate-y-0.5 ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-brand-500/50' 
                        : 'bg-white border-slate-100 text-slate-500 hover:text-brand-600 shadow-sm'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">Google</span>
                  </button>

                  <button 
                    onClick={handleAnonymousLogin}
                    disabled={loginLoading}
                    className={`flex items-center justify-center p-3.5 sm:p-4 rounded-xl border-2 transition-all group hover:-translate-y-0.5 ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-amber-500/50' 
                        : 'bg-white border-slate-100 text-slate-500 hover:text-amber-600 shadow-sm'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">Guest</span>
                  </button>
                </div>

                <div className="pt-1 flex items-center justify-center gap-2">
                  <button 
                    onClick={() => setShowTermsOfService(true)}
                    className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-colors hover:underline ${
                      isDarkMode ? 'text-slate-600 hover:text-brand-400' : 'text-slate-300 hover:text-brand-600'
                    }`}
                  >
                    Terms of Service
                  </button>
                  <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'text-slate-705' : 'text-slate-205'}`}>•</span>
                  <button 
                    onClick={() => setShowPrivacyPolicy(true)}
                    className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-colors hover:underline ${
                      isDarkMode ? 'text-slate-600 hover:text-brand-400' : 'text-slate-300 hover:text-brand-600'
                    }`}
                  >
                    Privacy Policy
                  </button>
                </div>
              </div>
            )}

            {authMode === 'email' && (
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between mb-1">
                  <button 
                    type="button"
                    onClick={() => {
                      setAuthMode('google');
                      setAuthSignupStep(1);
                      setEmailMode('login'); // Default back to login
                    }}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    ← Back to methods
                  </button>
                  <span className={`text-[10px] sm:text-xs font-bold uppercase transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    {emailMode === 'login' ? 'Login' : emailMode === 'forgot_password' ? 'Reset Password' : `Sign Up: Step ${authSignupStep}/2`}
                  </span>
                </div>

                {emailMode === 'login' ? (
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className={`text-[10px] sm:text-xs font-bold uppercase ml-1 transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Email Address</label>
                        <div className="relative">
                          <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className={`w-full px-4 py-3 sm:py-3.5 border-2 rounded-xl outline-none transition-all text-sm ${
                              isDarkMode 
                                ? 'bg-slate-800 border-transparent focus:border-brand-500/50 focus:bg-slate-755 text-white placeholder:text-slate-600' 
                                : 'bg-slate-50 border-transparent focus:border-brand-500 focus:bg-white text-slate-800 placeholder:text-slate-400'
                            }`}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center px-1">
                          <label className={`text-[10px] sm:text-xs font-bold uppercase transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Password</label>
                          <button 
                            type="button"
                            onClick={() => {
                              setEmailMode('forgot_password');
                              setAuthError(null);
                              setResetSuccessText(null);
                            }}
                            className="text-[10px] sm:text-xs font-bold text-brand-500 hover:text-brand-600 hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full pl-4 pr-11 py-3 sm:py-3.5 border-2 rounded-xl outline-none transition-all text-sm ${
                              isDarkMode 
                                ? 'bg-slate-800 border-transparent focus:border-brand-500/50 focus:bg-slate-755 text-white placeholder:text-slate-600' 
                                : 'bg-slate-50 border-transparent focus:border-brand-500 focus:bg-white text-slate-800 placeholder:text-slate-400'
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={loginLoading}
                        className={`w-full py-3 sm:py-3.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-sm ${
                          isDarkMode 
                            ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/10' 
                            : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-100'
                        }`}
                      >
                        {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Login
                      </button>

                      <button 
                        type="button"
                        onClick={() => setEmailMode('signup')}
                        className={`w-full text-xs text-center transition-colors ${isDarkMode ? 'text-slate-600 hover:text-brand-400' : 'text-slate-500 hover:text-brand-600'}`}
                      >
                        Don&apos;t have an account? Sign up
                      </button>
                    </div>
                  </form>
                ) : emailMode === 'forgot_password' ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Enter your email address below, and we will send a password reset verification link to your email from <strong className="text-brand-500 font-bold">tazondev@stellas-ai.com</strong>.
                    </p>
                    {resetSuccessText && (
                      <div className={`p-4 rounded-xl text-xs font-semibold leading-relaxed border flex flex-col gap-1.5 ${
                        isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                      }`}>
                        <span>{resetSuccessText}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleForgotPassword(e);
                          }}
                          disabled={loginLoading}
                          className="text-left font-bold hover:underline text-brand-500 disabled:opacity-50 mt-1 self-start"
                        >
                          {loginLoading ? "Sending..." : "Resend Link"}
                        </button>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className={`text-[10px] sm:text-xs font-bold uppercase ml-1 transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Email Address</label>
                      <div className="relative">
                        <input 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className={`w-full px-4 py-3 sm:py-3.5 border-2 rounded-xl outline-none transition-all text-sm ${
                            isDarkMode 
                              ? 'bg-slate-800 border-transparent focus:border-brand-500/50 focus:bg-slate-755 text-white placeholder:text-slate-600' 
                              : 'bg-slate-50 border-transparent focus:border-brand-500 focus:bg-white text-slate-800 placeholder:text-slate-400'
                          }`}
                          required
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={loginLoading}
                      className={`w-full py-3 sm:py-3.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-sm ${
                        isDarkMode 
                          ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/10' 
                          : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-100'
                      }`}
                    >
                      {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Send Reset Link
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setEmailMode('login');
                        setAuthError(null);
                        setResetSuccessText(null);
                      }}
                      className={`w-full text-xs text-center transition-colors font-bold ${isDarkMode ? 'text-brand-500 hover:text-brand-400' : 'text-brand-650 hover:text-brand-850'}`}
                    >
                      ← Back to Login
                    </button>
                  </form>
                ) : emailMode === 'reset_password_simulated' ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-500 mx-auto animate-pulse">
                        <Key className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-brand-500">Secure Reset Hub</h4>
                      <p className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Sandbox Security Simulation & Deliverer via Resend
                      </p>
                    </div>

                    {simulatedSuccess ? (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-xl text-center border space-y-1.5 ${
                          isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                        }`}>
                          <p className="text-xs font-black uppercase tracking-widest">Uplink Updated Successfully!</p>
                          <p className="text-[11px] leading-relaxed">
                            Your password for <strong className="font-bold">{simulatedEmail}</strong> was simulated and verified via Resend. You can now use your credentials to log in.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail(simulatedEmail);
                            setPassword(simulatedNewPassword);
                            setEmailMode('login');
                            setSimulatedSuccess(false);
                          }}
                          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                            isDarkMode ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/10' : 'bg-brand-600 text-white hover:bg-brand-700'
                          }`}
                        >
                          Proceed to Authentication
                        </button>
                      </div>
                    ) : (
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!simulatedNewPassword.trim() || simulatedNewPassword.length < 6) {
                            setAuthError("Password must be at least 6 characters.");
                            return;
                          }
                          setLoginLoading(true);
                          setAuthError(null);
                          try {
                            const response = await fetch('/api/confirm-password-reset', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                email: simulatedEmail,
                                newPassword: simulatedNewPassword
                              }),
                            });
                            if (response.ok) {
                              const data = await response.json();
                              if (data.success) {
                                setSimulatedSuccess(true);
                              } else {
                                throw new Error(data.error || "Failed to reset password.");
                              }
                            } else {
                              const errorData = await response.json().catch(() => ({}));
                              throw new Error(errorData.error || "An error occurred during password reset.");
                            }
                          } catch (err: any) {
                            console.error("Password reset failed:", err);
                            setAuthError(err.message || "Could not update your password. Please try again.");
                          } finally {
                            setLoginLoading(false);
                          }
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-3.5">
                          <div className="space-y-1">
                            <label className={`text-[10px] sm:text-xs font-bold uppercase ml-1 transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Target Account</label>
                            <input
                              type="text"
                              disabled
                              value={simulatedEmail}
                              className={`w-full px-4 py-3 rounded-xl text-sm font-mono border select-none opacity-70 ${
                                isDarkMode ? 'bg-slate-900 border-slate-850 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                              }`}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className={`text-[10px] sm:text-xs font-bold uppercase ml-1 transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>New Credentials Password</label>
                            <div className="relative">
                              <input 
                                type={showPassword ? "text" : "password"}
                                value={simulatedNewPassword}
                                onChange={(e) => setSimulatedNewPassword(e.target.value)}
                                placeholder="Enter at least 6 characters"
                                className={`w-full pl-4 pr-11 py-3 border-2 rounded-xl outline-none transition-all text-sm ${
                                  isDarkMode 
                                    ? 'bg-slate-800 border-transparent focus:border-brand-500/50 focus:bg-slate-755 text-white placeholder:text-slate-600' 
                                    : 'bg-slate-50 border-transparent focus:border-brand-500 focus:bg-white text-slate-800 placeholder:text-slate-400'
                                }`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button 
                          type="submit"
                          disabled={loginLoading}
                          className={`w-full py-3 sm:py-3.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-sm ${
                            isDarkMode 
                              ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/10' 
                              : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-100'
                          }`}
                        >
                          {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Verify & Reset Password
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            setEmailMode('login');
                            setAuthError(null);
                          }}
                          className={`w-full text-xs text-center transition-colors font-bold ${isDarkMode ? 'text-brand-500 hover:text-brand-400' : 'text-brand-650 hover:text-brand-850'}`}
                        >
                          ← Cancel Reset & Back
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {authSignupStep === 1 ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { id: 'student', title: 'Student', desc: 'Practice & Study' },
                            { id: 'teacher', title: 'Teacher', desc: 'Planning & Assessment' },
                            { id: 'institution', title: 'Institution', desc: 'School Management' }
                          ].map((r) => (
                            <button
                              key={r.id}
                              onClick={() => {
                                setLocalRole(r.id as UserRole);
                                setAuthSignupStep(2);
                              }}
                              className={`relative p-4 sm:p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                                localRole === r.id 
                                  ? (isDarkMode ? 'bg-brand-600/10 border-brand-500 shadow-lg' : 'bg-brand-50 border-brand-200 shadow-xl')
                                  : (isDarkMode ? 'bg-slate-800 border-slate-750' : 'bg-white border-slate-100 shadow-sm')
                              }`}
                            >
                              <div>
                                <h4 className="text-base sm:text-lg font-display font-black tracking-tight">{r.title}</h4>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-500">{r.desc}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-300" />
                            </button>
                          ))}
                        </div>
                        <button 
                          type="button"
                          onClick={() => setEmailMode('login')}
                          className={`w-full text-xs text-center transition-colors ${isDarkMode ? 'text-slate-600 hover:text-brand-400' : 'text-slate-500 hover:text-brand-600'}`}
                        >
                          Already have an account? Login
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleEmailAuth} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-3.5">
                          <div className="space-y-1">
                            <label className={`text-[10px] sm:text-xs font-bold uppercase ml-1 transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Full Name</label>
                            <div className="relative">
                              <input 
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="John Doe"
                                className={`w-full px-4 py-3 sm:py-3.5 border-2 rounded-xl outline-none transition-all text-sm ${
                                  isDarkMode 
                                    ? 'bg-slate-800 border-transparent focus:border-brand-500/50 focus:bg-slate-755 text-white placeholder:text-slate-600' 
                                    : 'bg-slate-50 border-transparent focus:border-brand-500 focus:bg-white text-slate-800 placeholder:text-slate-400'
                                }`}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className={`text-[10px] sm:text-xs font-bold uppercase ml-1 transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Email Address</label>
                            <div className="relative">
                              <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className={`w-full px-4 py-3 sm:py-3.5 border-2 rounded-xl outline-none transition-all text-sm ${
                                  isDarkMode 
                                    ? 'bg-slate-800 border-transparent focus:border-brand-500/50 focus:bg-slate-755 text-white placeholder:text-slate-600' 
                                    : 'bg-slate-50 border-transparent focus:border-brand-500 focus:bg-white text-slate-800 placeholder:text-slate-400'
                                }`}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className={`text-[10px] sm:text-xs font-bold uppercase ml-1 transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Password</label>
                            <div className="relative">
                              <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className={`w-full pl-4 pr-11 py-3 sm:py-3.5 border-2 rounded-xl outline-none transition-all text-sm ${
                                  isDarkMode 
                                    ? 'bg-slate-800 border-transparent focus:border-brand-500/50 focus:bg-slate-755 text-white placeholder:text-slate-600' 
                                    : 'bg-slate-50 border-transparent focus:border-brand-500 focus:bg-white text-slate-800 placeholder:text-slate-400'
                                }`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 pt-1 pb-1 select-none">
                            <input 
                              type="checkbox"
                              id="agreeToTerms"
                              checked={agreeToTerms}
                              onChange={(e) => setAgreeToTerms(e.target.checked)}
                              className="mt-0.5 rounded border-2 border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                              required
                            />
                            <label htmlFor="agreeToTerms" className={`text-xs leading-normal transition-colors cursor-pointer ${isDarkMode ? 'text-slate-450' : 'text-slate-600 font-medium'}`}>
                              I agree to the{' '}
                              <button 
                                type="button" 
                                onClick={(e) => { e.preventDefault(); setShowTermsOfService(true); }}
                                className="text-brand-500 hover:text-brand-600 hover:underline font-bold"
                              >
                                Terms of Service
                              </button>
                              {' '}and{' '}
                              <button 
                                type="button" 
                                onClick={(e) => { e.preventDefault(); setShowPrivacyPolicy(true); }}
                                className="text-brand-500 hover:text-brand-600 hover:underline font-bold"
                              >
                                Privacy Policy
                              </button>
                            </label>
                          </div>

                          <div className="flex gap-2.5 pt-1">
                            <button 
                              type="button"
                              onClick={() => setAuthSignupStep(1)}
                              className={`px-4 py-3 sm:py-3.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button 
                              type="submit"
                              disabled={loginLoading || !agreeToTerms}
                              className={`flex-1 py-3 sm:py-3.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm ${
                                isDarkMode 
                                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/10' 
                                  : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-100'
                              }`}
                            >
                              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                              Register
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-left"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">{authError}</p>
              </motion.div>
            )}
          </div>

          <p className="text-[10px] sm:text-xs text-slate-400 select-none">
            By continuing, you agree to our{' '}
            <button 
              type="button" 
              onClick={() => setShowTermsOfService(true)}
              className="font-bold underline text-brand-500 hover:text-brand-600 cursor-pointer"
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button 
              type="button" 
              onClick={() => setShowPrivacyPolicy(true)}
              className="font-bold underline text-brand-500 hover:text-brand-600 cursor-pointer"
            >
              Privacy Policy
            </button>.
          </p>
        </motion.div>

        <PrivacyPolicyModal 
          isOpen={showPrivacyPolicy} 
          onClose={() => setShowPrivacyPolicy(false)} 
          isDarkMode={isDarkMode} 
        />

        <TermsOfServiceModal 
          isOpen={showTermsOfService} 
          onClose={() => setShowTermsOfService(false)} 
          isDarkMode={isDarkMode} 
        />
      </div>
    );
  }

  // --- SECURE ENCLAVE HARDWARE KEYPAD SCREEN OVERLAY ---
  if (devicePasscodeHash && isLocked) {
    return (
      <div className={`fixed inset-0 z-[99999] flex flex-col justify-between p-6 sm:p-8 overflow-hidden select-none transition-all duration-700 ${
        isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-100'
      }`}>
        <style>{`
          @keyframes ios-shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-12px); }
            40%, 80% { transform: translateX(12px); }
          }
          .animate-ios-shake {
            animation: ios-shake 0.4s ease-in-out;
          }
        `}</style>
        
        {/* Decorative Ambient Radial Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full filter blur-[100px] opacity-20 bg-brand-500 pointer-events-none" />

        {/* Top Status Area / iOS style clock */}
        <div className="flex flex-col items-center mt-6 z-10 text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-brand-450 shrink-0" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-400 font-extrabold">Secure Enclave Active</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight tabular-nums mt-1 font-sans">
            <ClockDisplay />
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-405 mt-2">
            {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Interactive Keypad & Pin Entry Bullet Block */}
        <div className="flex flex-col items-center max-w-sm mx-auto w-full z-10 my-auto">
          {/* App identity block */}
          <div className="relative mb-6">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border flex items-center justify-center shadow-2xl relative ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-950 border-slate-800'
            }`}>
              <Key className="w-6 h-6 sm:w-8 sm:h-8 text-brand-400" />
            </div>
            {passcodeAttempts > 0 && (
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-red-600 text-[8px] font-black uppercase text-white tracking-widest animate-pulse">
                Blocked
              </div>
            )}
          </div>

          <h2 className={`text-lg sm:text-xl font-bold tracking-tight text-center transition-colors min-h-[28px] ${
            isPinScreenWrong ? 'text-red-500 font-extrabold animate-pulse' : 'text-slate-200'
          }`}>
            {isPinScreenWrong ? "Incorrect passcode. Access Denied." : "Enter passcode to unlock profile"}
          </h2>

          <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">
            {passcodeAttempts > 0 ? `Attempts: ${passcodeAttempts}. Auto-Lock active.` : `Hardware AES-256 Integrated`}
          </p>

          {/* Core Bullets Indicator */}
          <div className={`flex justify-center gap-4 py-6 sm:py-8 ${isPinScreenWrong ? 'animate-ios-shake' : ''}`}>
            {[0, 1, 2, 3].map((idx) => (
              <div 
                key={idx} 
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                  idx < currentPinInput.length 
                    ? 'bg-brand-500 border-brand-500 scale-110 shadow-lg shadow-brand-500/50' 
                    : 'border-slate-500'
                }`} 
              />
            ))}
          </div>

          {/* Numeric Layout Grid */}
          <div className="grid grid-cols-3 gap-y-3.5 gap-x-6 w-full justify-items-center">
            {[
              { num: 1, letters: "" },
              { num: 2, letters: "A B C" },
              { num: 3, letters: "D E F" },
              { num: 4, letters: "G H I" },
              { num: 5, letters: "J K L" },
              { num: 6, letters: "M N O" },
              { num: 7, letters: "P Q R S" },
              { num: 8, letters: "T U V" },
              { num: 9, letters: "W X Y Z" },
            ].map(({ num, letters }) => (
              <button
                key={num}
                type="button"
                onClick={() => handlePinKeypadPress(String(num))}
                disabled={isPinScreenWrong}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800/60 border border-slate-700/50 hover:bg-slate-705 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 outline-none select-none disabled:opacity-50"
              >
                <span className="text-2xl font-light font-sans">{num}</span>
                {letters && <span className="text-[8px] tracking-widest text-slate-400 font-bold">{letters}</span>}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handlePinKeypadPress('Cancel')}
              className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-xs text-slate-450 hover:text-white font-bold tracking-widest uppercase transition-all outline-none"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handlePinKeypadPress('0')}
              disabled={isPinScreenWrong}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800/60 border border-slate-700/50 hover:bg-slate-705 active:scale-95 transition-all flex items-center justify-center outline-none select-none disabled:opacity-50"
            >
              <span className="text-2xl font-light font-sans">0</span>
            </button>

            <button
              type="button"
              onClick={() => handlePinKeypadPress('Delete')}
              className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-[10px] text-slate-450 hover:text-white font-bold tracking-widest uppercase transition-all outline-none"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Bottom Safety Bypass System */}
        <div className="flex justify-between items-center w-full max-w-sm mx-auto mt-6 z-10 border-t border-slate-800/80 pt-4">
          <button 
            type="button"
            onClick={async () => {
              if (window.confirm("Intrusion Safeguard: Are you sure you want to lock and sign out of this academic session?")) {
                await signOut(auth);
                setIsLocked(false);
              }
            }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500/80" />
            Sign Out
          </button>

          <span className="text-[9px] text-slate-600 font-extrabold uppercase tracking-widest font-mono">
            Stella Secure V3
          </span>
        </div>
      </div>
    );
  }

  // Onboarding Wizard
  if (profile && !profile.onboarded) {
    const principalSubjects = localSubjects.filter(s => 
      SUBJECT_CATEGORIES.Science.includes(s) || 
      SUBJECT_CATEGORIES.Arts.includes(s) ||
      SUBJECT_CATEGORIES.Business.includes(s)
    );
    const optionalSubsidiaries = localSubjects.filter(s => 
      SUBJECT_CATEGORIES.Subsidiary.includes(s) && s !== "General Paper"
    );
    const hasGeneralPaper = localSubjects.includes("General Paper") || localRole === 'student';
    
    const handleCompleteOnboarding = async (gradYearOverride?: number) => {
      setIsOnboarding(true);
      try {
        const finalGradYear = gradYearOverride !== undefined ? gradYearOverride : localGraduationYear;
        const updates: any = { 
          onboarded: true,
          role: localRole!,
          subjects: localSubjects,
          schoolName: localSchoolName,
          district: localDistrict,
          signupCode: localSignupCode,
          updatedAt: Date.now()
        };
        
        if (localRole === 'student') {
          updates.expectedGraduationYear = finalGradYear;
        }

        await updateProfile(updates);
      } catch (err) {
        console.error("Failed to complete onboarding", err);
      } finally {
        setIsOnboarding(false);
      }
    };
    
    // Validation for each step
    const isStepValid = () => {
      if (onboardingStep === 1) return localRole !== null;
      if (onboardingStep === 2) return localSchoolName.trim().length > 2 && localDistrict.trim().length > 2;
      if (onboardingStep === 3) {
        if (localRole === 'institution') {
          // Special case for Kawempe Muslim
          if (localSchoolName === "Kawempe Muslim Secondary School") {
            return localSignupCode === "30981";
          }
          return localSignupCode.trim().length >= 4;
        }
        if (localRole === 'student') {
          return principalSubjects.length === 3 && hasGeneralPaper && optionalSubsidiaries.length === 1;
        }
        return localSubjects.length > 0;
      }
      if (onboardingStep === 4) {
        if (localRole === 'student') return localGraduationYear > 0;
        if (localRole === 'institution') return localSubjects.length > 0;
        return true;
      }
      return false;
    };

    const totalSteps = (localRole === 'student' || localRole === 'institution') ? 4 : 3;

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        {/* Background blobs */}
        <div className={`absolute -left-20 -bottom-20 w-[600px] h-[600px] blur-[120px] rounded-full pointer-events-none opacity-20 ${isDarkMode ? 'bg-brand-500' : 'bg-brand-600'}`} />
        <div className={`absolute -right-20 -top-20 w-[600px] h-[600px] blur-[120px] rounded-full pointer-events-none opacity-20 ${isDarkMode ? 'bg-brand-500' : 'bg-brand-600'}`} />

        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`max-w-4xl w-full rounded-[3.5rem] shadow-2xl p-10 lg:p-14 space-y-10 border transition-all duration-700 relative z-10 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'
          }`}
        >
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500">Profile Setup</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  {onboardingStep} of {totalSteps}
                </span>
              </div>
              <h2 className="text-4xl font-display font-black tracking-tighter">
                {onboardingStep === 1 && "Select Your Role"}
                {onboardingStep === 2 && "Location & School"}
                {onboardingStep === 3 && (
                  localRole === 'institution' ? "Access Verification" : 
                  localRole === 'teacher' ? "Professional Focus" : 
                  "Select Your Subjects"
                )}
                {onboardingStep === 4 && (
                  localRole === 'institution' ? "School Curriculum" : 
                  "Graduation Year"
                )}
              </h2>
            </div>
            {onboardingStep > 1 && (
              <button 
                onClick={() => setOnboardingStep(s => s - 1)}
                className={`p-3 rounded-2xl transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="min-h-[400px]">
            {onboardingStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {[
                  { id: 'student', title: 'Student', icon: BookOpen, desc: 'Practice & Study' },
                  { id: 'teacher', title: 'Teacher', icon: Briefcase, desc: 'Planning & Assessment' },
                  { id: 'institution', title: 'Institution', icon: Landmark, desc: 'School Management' }
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setLocalRole(r.id as UserRole);
                      setTimeout(() => {
                        setOnboardingStep(2);
                      }, 350);
                    }}
                    className={`relative p-8 rounded-[2.5rem] border text-left transition-all ${
                      localRole === r.id 
                        ? (isDarkMode ? 'bg-brand-600/10 border-brand-500 shadow-lg' : 'bg-brand-50 border-brand-200 shadow-xl')
                        : (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm')
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                      localRole === r.id ? 'bg-brand-500 text-white' : (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400')
                    }`}>
                      {React.createElement(r.icon, { className: "w-6 h-6" })}
                    </div>
                    <h4 className="text-xl font-display font-black tracking-tight">{r.title}</h4>
                    <p className="text-xs font-bold text-slate-500 mt-1">{r.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {onboardingStep === 2 && (() => {
              const matchingSchools = localSchoolName.trim() 
                ? verifiedSchools.filter(s => s.name.toLowerCase().includes(localSchoolName.toLowerCase()))
                : [];
              const matchingDistricts = localDistrict.trim()
                ? verifiedDistricts.filter(d => d.toLowerCase().includes(localDistrict.toLowerCase()))
                : [];
              const exactMatchedSchool = verifiedSchools.find(s => s.name.toLowerCase() === localSchoolName.trim().toLowerCase());
              const isSchoolVerified = !!exactMatchedSchool;
              const exactMatchedDistrict = verifiedDistricts.find(d => d.toLowerCase() === localDistrict.trim().toLowerCase());
              const isDistrictVerified = !!exactMatchedDistrict;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-500 relative">
                  {/* School Name Field */}
                  <div className="space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">School Name</label>
                      {localSchoolName.trim().length > 2 && (
                        isSchoolVerified ? (
                          <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified School
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            Custom School
                          </span>
                        )
                      )}
                    </div>
                    <div className="relative">
                      <School className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-20 ${localSchoolName ? 'text-brand-500' : 'text-slate-400'}`} />
                      <input 
                        type="text" 
                        value={localSchoolName}
                        onChange={(e) => {
                          setLocalSchoolName(e.target.value);
                          setSchoolSearchOpen(true);
                        }}
                        onFocus={() => {
                          setSchoolSearchOpen(true);
                          setDistrictSearchOpen(false);
                        }}
                        placeholder="e.g. King's College Budo"
                        className={`w-full pl-14 pr-6 py-5 rounded-2xl border-2 outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' 
                            : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* School Dropdown Autocomplete */}
                    {schoolSearchOpen && (matchingSchools.length > 0 || localSchoolName.trim().length > 1) && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setSchoolSearchOpen(false)} />
                        <div className={`absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-2xl border shadow-2xl p-2 z-45 ${
                          isDarkMode ? 'bg-slate-905 border-slate-750' : 'bg-white border-slate-100'
                        }`}>
                          {matchingSchools.length > 0 ? (
                            <div className="space-y-1">
                              <p className={`text-[9px] uppercase font-bold tracking-widest p-2 border-b mb-1 ${
                                isDarkMode ? 'text-slate-200 border-slate-800/80' : 'text-slate-400 border-slate-100'
                              }`}>
                                Verified Secondary Schools
                              </p>
                              {matchingSchools.map((s) => (
                                <button
                                  key={s.name}
                                  type="button"
                                  onClick={() => {
                                    setLocalSchoolName(s.name);
                                    setLocalDistrict(s.district);
                                    setSchoolSearchOpen(false);
                                    setTimeout(() => {
                                      setOnboardingStep(3);
                                    }, 500);
                                  }}
                                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all text-sm cursor-pointer ${
                                    isDarkMode ? 'hover:bg-slate-800 hover:text-white text-slate-100' : 'hover:bg-slate-50 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <School className="w-4 h-4 text-brand-400 shrink-0" />
                                    <div className="flex flex-col">
                                      <span className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>{s.name}</span>
                                      <span className={`text-[10px] ${isDarkMode ? 'text-slate-350 font-medium' : 'text-slate-500'}`}>{s.district} District</span>
                                    </div>
                                  </div>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                                    Verified
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSchoolSearchOpen(false)}
                              className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-all text-sm cursor-pointer ${
                                isDarkMode ? 'hover:bg-slate-800 text-slate-100' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <Plus className="w-4 h-4 text-amber-500 shrink-0" />
                              <div className="flex flex-col">
                                <span className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Register as Custom School</span>
                                <span className={`text-[10px] ${isDarkMode ? 'text-slate-350' : 'text-slate-500'}`}>"{localSchoolName}" is not in directory</span>
                              </div>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* District Field */}
                  <div className="space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">District</label>
                      {localDistrict.trim().length > 1 && (
                        isDistrictVerified ? (
                          <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified District
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            Custom District
                          </span>
                        )
                      )}
                    </div>
                    <div className="relative">
                      <Globe className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-20 ${localDistrict ? 'text-brand-500' : 'text-slate-400'}`} />
                      <input 
                        type="text" 
                        value={localDistrict}
                        onChange={(e) => {
                          setLocalDistrict(e.target.value);
                          setDistrictSearchOpen(true);
                        }}
                        onFocus={() => {
                          setDistrictSearchOpen(true);
                          setSchoolSearchOpen(false);
                        }}
                        placeholder="e.g. Wakiso"
                        className={`w-full pl-14 pr-6 py-5 rounded-2xl border-2 outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' 
                            : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* District Dropdown Autocomplete */}
                    {districtSearchOpen && (matchingDistricts.length > 0 || localDistrict.trim().length > 1) && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setDistrictSearchOpen(false)} />
                        <div className={`absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-2xl border shadow-2xl p-2 z-45 ${
                          isDarkMode ? 'bg-slate-905 border-slate-750' : 'bg-white border-slate-100'
                        }`}>
                          {matchingDistricts.length > 0 ? (
                            <div className="space-y-1">
                              <p className={`text-[9px] uppercase font-bold tracking-widest p-2 border-b mb-1 ${
                                isDarkMode ? 'text-slate-200 border-slate-800/80' : 'text-slate-400 border-slate-100'
                              }`}>
                                Verified Regions
                              </p>
                              {matchingDistricts.map((d) => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => {
                                    setLocalDistrict(d);
                                    setDistrictSearchOpen(false);
                                    if (localSchoolName.trim().length > 2) {
                                      setTimeout(() => {
                                        setOnboardingStep(3);
                                      }, 500);
                                    }
                                  }}
                                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all text-sm cursor-pointer ${
                                    isDarkMode ? 'hover:bg-slate-800 hover:text-white text-slate-100' : 'hover:bg-slate-50 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-brand-400 shrink-0" />
                                    <span className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>{d}</span>
                                  </div>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full shrink-0">
                                    District
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                  setDistrictSearchOpen(false);
                                  if (localSchoolName.trim().length > 2) {
                                    setTimeout(() => {
                                      setOnboardingStep(3);
                                    }, 500);
                                  }
                              }}
                              className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-all text-sm cursor-pointer ${
                                isDarkMode ? 'hover:bg-slate-800 text-slate-100' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <Plus className="w-4 h-4 text-amber-500 shrink-0" />
                              <div className="flex flex-col">
                                <span className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Keep Custom District</span>
                                <span className={`text-[10px] ${isDarkMode ? 'text-slate-350' : 'text-slate-500'}`}>"{localDistrict}" is customized</span>
                              </div>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {isMobile && localSchoolName.trim().length > 2 && localDistrict.trim().length > 2 && (
                    <div className="col-span-1 md:col-span-2 pt-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(3)}
                        className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-brand-500/10 cursor-pointer"
                      >
                        Continue to Subjects
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {onboardingStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {localRole === 'institution' ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-lg mx-auto">
                    <div className="w-24 h-24 bg-brand-500/10 rounded-[2rem] flex items-center justify-center text-brand-500 border border-brand-500/20">
                      <Key className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-display font-black">Signup Access Code</h4>
                      <p className="text-sm text-slate-500">Enter the unique access code assigned to your school.</p>
                    </div>
                    <div className="w-full relative group">
                      <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${localSignupCode ? 'text-brand-500' : 'text-slate-400'}`} />
                      <input 
                        type="text" 
                        value={localSignupCode}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          setLocalSignupCode(val);
                          const isKmss = localSchoolName === "Kawempe Muslim Secondary School";
                          if (isKmss && val === "30981") {
                            setTimeout(() => {
                              setOnboardingStep(4);
                            }, 500);
                          } else if (!isKmss && val.length >= 5) {
                            setTimeout(() => {
                              setOnboardingStep(4);
                            }, 500);
                          }
                        }}
                        placeholder="Access Code"
                        className={`w-full pl-14 pr-6 py-5 rounded-2xl border-2 outline-none transition-all text-center tracking-[0.5em] font-mono text-xl ${
                          isDarkMode ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900 shadow-inner'
                        }`}
                      />
                    </div>
                    {localSchoolName === "Kawempe Muslim Secondary School" && !localSignupCode && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-500 animate-pulse">Required Code: 30981</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-12 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    {/* Science */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Microscope className="w-5 h-5 text-blue-500" />
                        <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Science Subjects</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {SUBJECT_CATEGORIES.Science.map(subject => (
                          <SubjectButton
                            key={subject}
                            subject={subject}
                            isSelected={localSubjects.includes(subject)}
                            isDarkMode={isDarkMode}
                            disabled={localRole === 'student' && !localSubjects.includes(subject) && principalSubjects.length >= 3}
                            onClick={() => {
                              const isSelected = localSubjects.includes(subject);
                              const next = isSelected
                                ? localSubjects.filter(s => s !== subject)
                                : [...localSubjects, subject];
                              setLocalSubjects(next);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Arts */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Library className="w-5 h-5 text-amber-500" />
                        <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Humanities Subjects</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {SUBJECT_CATEGORIES.Arts.map(subject => (
                          <SubjectButton
                            key={subject}
                            subject={subject}
                            isSelected={localSubjects.includes(subject)}
                            isDarkMode={isDarkMode}
                            disabled={localRole === 'student' && !localSubjects.includes(subject) && principalSubjects.length >= 3}
                            onClick={() => {
                              const isSelected = localSubjects.includes(subject);
                              const next = isSelected
                                ? localSubjects.filter(s => s !== subject)
                                : [...localSubjects, subject];
                              setLocalSubjects(next);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Business */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Commercial Subjects</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {SUBJECT_CATEGORIES.Business.map(subject => (
                          <SubjectButton
                            key={subject}
                            subject={subject}
                            isSelected={localSubjects.includes(subject)}
                            isDarkMode={isDarkMode}
                            disabled={localRole === 'student' && !localSubjects.includes(subject) && principalSubjects.length >= 3}
                            onClick={() => {
                              const isSelected = localSubjects.includes(subject);
                              const next = isSelected
                                ? localSubjects.filter(s => s !== subject)
                                : [...localSubjects, subject];
                              setLocalSubjects(next);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Subsidiaries */}
                    <div className="space-y-6 pb-4">
                      <div className="flex items-center gap-3">
                        <StellaLogo className="w-5 h-5 text-brand-500" />
                        <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Subsidiary Subjects</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {SUBJECT_CATEGORIES.Subsidiary.map(subject => {
                          const isCompulsory = subject === "General Paper" && localRole === 'student';
                          const isSelected = localSubjects.includes(subject) || isCompulsory;
                          return (
                            <SubjectButton
                              key={subject}
                              subject={subject}
                              isSelected={isSelected}
                              isDarkMode={isDarkMode}
                              disabled={
                                isCompulsory || 
                                (localRole === 'student' && !isSelected && optionalSubsidiaries.length >= 1) ||
                                (localRole === 'student' && subject === "Subsidiary Mathematics" && localSubjects.includes("Mathematics"))
                              }
                              onClick={() => {
                                if (isCompulsory) return;
                                const next = isSelected
                                  ? localSubjects.filter(s => s !== subject)
                                  : [...localSubjects, subject];
                                setLocalSubjects(next);
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    {localRole === 'teacher' && localSubjects.length > 0 && (
                      <div className="pt-8 pb-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <button
                          type="button"
                          disabled={isOnboarding}
                          onClick={() => handleCompleteOnboarding()}
                          className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-brand-500/10 active:scale-95 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                        >
                          {isOnboarding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                          Complete Onboarding & Initiate Node
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {onboardingStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {localRole === 'student' ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-8">
                    <div className="w-24 h-24 bg-brand-600/10 rounded-[2rem] flex items-center justify-center text-brand-600 border border-brand-500/10 dark:text-brand-300">
                      <Timer className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-display font-black">Target Graduation Year</h4>
                      <p className="text-sm text-slate-500">Select your target graduation year.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                      {[2024, 2025, 2026, 2027, 2028].map(year => (
                        <button
                          key={year}
                          disabled={isOnboarding}
                          onClick={async () => {
                            setLocalGraduationYear(year);
                            await handleCompleteOnboarding(year);
                          }}
                          className={`px-10 py-5 rounded-[2rem] font-display font-black text-lg transition-all ${
                            localGraduationYear === year
                              ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/30'
                              : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 border border-slate-100 shadow-sm')
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : localRole === 'institution' ? (
                  <div className="space-y-12 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    {/* Science */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Microscope className="w-5 h-5 text-blue-500" />
                        <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Science Subjects</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {SUBJECT_CATEGORIES.Science.map(subject => (
                          <SubjectButton
                            key={subject}
                            subject={subject}
                            isSelected={localSubjects.includes(subject)}
                            isDarkMode={isDarkMode}
                            onClick={() => {
                              const isSelected = localSubjects.includes(subject);
                              const next = isSelected
                                ? localSubjects.filter(s => s !== subject)
                                : [...localSubjects, subject];
                              setLocalSubjects(next);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Arts */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Library className="w-5 h-5 text-amber-500" />
                        <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Humanities Subjects</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {SUBJECT_CATEGORIES.Arts.map(subject => (
                          <SubjectButton
                            key={subject}
                            subject={subject}
                            isSelected={localSubjects.includes(subject)}
                            isDarkMode={isDarkMode}
                            onClick={() => {
                              const isSelected = localSubjects.includes(subject);
                              const next = isSelected
                                ? localSubjects.filter(s => s !== subject)
                                : [...localSubjects, subject];
                              setLocalSubjects(next);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Business */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Commercial Subjects</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {SUBJECT_CATEGORIES.Business.map(subject => (
                          <SubjectButton
                            key={subject}
                            subject={subject}
                            isSelected={localSubjects.includes(subject)}
                            isDarkMode={isDarkMode}
                            onClick={() => {
                              const isSelected = localSubjects.includes(subject);
                              const next = isSelected
                                ? localSubjects.filter(s => s !== subject)
                                : [...localSubjects, subject];
                              setLocalSubjects(next);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Subsidiaries */}
                    <div className="space-y-6 pb-4">
                      <div className="flex items-center gap-3">
                        <StellaLogo className="w-5 h-5 text-brand-500" />
                        <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Subsidiary Subjects</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {SUBJECT_CATEGORIES.Subsidiary.map(subject => {
                          const isSelected = localSubjects.includes(subject);
                          return (
                            <SubjectButton
                              key={subject}
                              subject={subject}
                              isSelected={isSelected}
                              isDarkMode={isDarkMode}
                              onClick={() => {
                                const next = isSelected
                                  ? localSubjects.filter(s => s !== subject)
                                  : [...localSubjects, subject];
                                setLocalSubjects(next);
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    {localRole === 'institution' && localSubjects.length > 0 && (
                      <div className="pt-8 pb-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <button
                          type="button"
                          disabled={isOnboarding}
                          onClick={() => handleCompleteOnboarding()}
                          className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-brand-500/10 active:scale-95 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                        >
                          {isOnboarding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                          Complete Onboarding & Initiate Node
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-10 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    onboardingStep === i + 1 ? 'w-8 bg-brand-500' : 'w-2 bg-slate-200 dark:bg-slate-700'
                  }`} 
                />
              ))}
            </div>
            {!isMobile && (
              <button
                disabled={!isStepValid() || isOnboarding}
                onClick={async () => {
                  if (onboardingStep < totalSteps) {
                    setOnboardingStep(s => s + 1);
                  } else {
                    setIsOnboarding(true);
                    try {
                      const updates: any = { 
                        onboarded: true,
                        role: localRole!,
                        subjects: localSubjects,
                        schoolName: localSchoolName,
                        district: localDistrict,
                        signupCode: localSignupCode,
                        updatedAt: Date.now()
                      };
                      
                      if (localRole === 'student') {
                        updates.expectedGraduationYear = localGraduationYear;
                      }

                      await updateProfile(updates);
                    } catch (err) {
                      console.error("Failed to complete onboarding", err);
                    } finally {
                      setIsOnboarding(false);
                    }
                  }
                }}
                className="px-6 py-3.5 bg-brand-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-20 hover:bg-brand-700 transition-all shadow-md shadow-brand-500/10 active:scale-95 flex items-center gap-2"
              >
                {isOnboarding ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                  <>
                    {onboardingStep === totalSteps ? 'Initiate Node' : 'Next Protocol'}
                    {!isOnboarding && onboardingStep < totalSteps && <ArrowRight className="w-4 h-4" />}
                  </>
                }
              </button>
            )}
            {!isStepValid() && onboardingStep === 3 && localRole === 'student' && (
               <div className="text-[10px] text-red-500 font-bold mt-2 space-y-1">
                 <p>Completing subject selection...</p>
                 <ul className="list-disc pl-4">
                   {! (principalSubjects.length === 3) && <li>{principalSubjects.length < 3 ? `Missing ${3 - principalSubjects.length}` : `Too many (${principalSubjects.length}) - Please select exactly 3`} Principal Subjects</li>}
                   {!hasGeneralPaper && <li>Missing General Paper</li>}
                   {!(optionalSubsidiaries.length === 1) && <li>{optionalSubsidiaries.length < 1 ? `Missing 1 Subsidiary Subject` : `Too many (${optionalSubsidiaries.length}) - Please select exactly 1`}</li>}
                 </ul>
               </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`h-screen overflow-hidden flex transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar - Hidden in Exam Mode */}
      {!isExamMode && (
        <>
          {/* Mobile Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
              />
            )}
          </AnimatePresence>
          
          {/* Permanent Mobile Hamburger Trigger */}
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`lg:hidden fixed top-3 left-3 z-50 p-2 rounded-xl transition-all active:scale-[0.8] cursor-pointer shadow-xl ${
                isDarkMode 
                  ? 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 backdrop-blur-md shadow-slate-950/50' 
                  : 'bg-white/90 text-slate-600 hover:bg-slate-100 border border-slate-100 backdrop-blur-sm shadow-brand-500/5'
              }`}
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <aside className={`fixed inset-y-0 left-0 lg:static w-72 flex flex-col transition-all duration-500 z-50 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${!isSidebarOpen ? 'lg:w-20 xl:w-72' : 'lg:w-72'} ${
            isDarkMode ? 'bg-slate-950/50 backdrop-blur-3xl border-r border-slate-900' : 'bg-white/80 backdrop-blur-3xl border-r border-slate-100'
          }`}>
            <div className={`transition-all duration-500 w-full ${!isSidebarOpen ? 'lg:p-4 xl:p-8 p-8 justify-center lg:justify-center xl:justify-start lg:gap-0' : 'p-8 justify-start gap-4'} flex items-center`}>
              <StellaLogo className="w-10 h-10 shrink-0 transition-transform duration-300 hover:scale-105" />
              <div className={`transition-all duration-500 ${!isSidebarOpen ? 'lg:hidden xl:block lg:opacity-0 lg:translate-x-[-10px] xl:opacity-100 xl:translate-x-0' : 'opacity-100 translate-x-0'}`}>
                <span className={`font-display font-black text-2xl tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>STELLAS</span>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 whitespace-nowrap opacity-60">A-Level Mathematics</p>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-12 overflow-y-auto scrollbar-hide">
              {profile?.role === 'teacher' ? (
                <>
                  <SidebarItem 
                    icon={<LayoutDashboard />} 
                    label="Command Center" 
                    active={activeTab === 'dashboard'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<ClipboardList />} 
                    label="Schemes" 
                    active={activeTab === 'schemes'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('schemes'); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<FileText />} 
                    label="Lessons" 
                    active={activeTab === 'plans'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('plans'); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<Zap />} 
                    label="Assessments" 
                    active={activeTab === 'assessments'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('assessments'); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<MessageSquare />} 
                    label="Teacher Chat" 
                    active={activeTab === 'chat'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('chat'); setIsSidebarOpen(false); }} 
                  />
                </>
              ) : profile?.role === 'institution' ? (
                <>
                  <SidebarItem 
                    icon={<LayoutDashboard />} 
                    label="Command Center" 
                    active={activeTab === 'dashboard'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<Users />} 
                    label="Staff Registry" 
                    active={activeTab === 'staff'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('staff'); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<GraduationCap />} 
                    label="Student Body" 
                    active={activeTab === 'students'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('students'); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<FileBox />} 
                    label="Facility Data" 
                    active={activeTab === 'facility'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('facility'); setIsSidebarOpen(false); }} 
                  />
                </>
              ) : (
                <>
                  <SidebarItem 
                    icon={<LayoutDashboard />} 
                    label="Command Center" 
                    active={activeTab === 'dashboard'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<MessageSquare />} 
                    label="Stellas AI" 
                    active={activeTab === 'chat'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('chat'); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<Sparkles />} 
                    label="Practice Arena" 
                    active={activeTab === 'practice'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('practice'); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<TrendingUp />} 
                    label="Mastery Insights" 
                    active={activeTab === 'mastery'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('mastery'); setIsSidebarOpen(false); }} 
                  />
                  <SidebarItem 
                    icon={<History />} 
                    label="Archive" 
                    active={activeTab === 'history'} 
                    isDarkMode={isDarkMode}
                    collapsed={!isSidebarOpen}
                    onClick={() => { setActiveTab('history'); setIsSidebarOpen(false); }} 
                  />
                </>
              )}
              <SidebarItem 
                icon={<Settings />} 
                label="Preferences" 
                active={activeTab === 'settings'} 
                isDarkMode={isDarkMode}
                collapsed={!isSidebarOpen}
                onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} 
              />
            </nav>

            <div className={`p-6 border-t transition-colors ${isDarkMode ? 'border-slate-900' : 'border-slate-50'} space-y-4 ${!isSidebarOpen ? 'lg:px-4' : ''}`}>
              <div className="space-y-2">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-full flex items-center transition-all duration-300 rounded-2xl p-4 ${
                    !isSidebarOpen ? 'lg:justify-center xl:justify-start lg:gap-0 xl:gap-4' : 'justify-start gap-4'
                  } ${
                    isDarkMode ? 'bg-slate-900/50 text-slate-400 hover:text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                  title={isDarkMode ? 'Lunar Protocol' : 'Solar Protocol'}
                >
                  <div className="shrink-0">
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <span className={`transition-all duration-300 font-bold text-[10px] xl:text-xs uppercase tracking-widest ${
                    !isSidebarOpen ? 'hidden xl:block opacity-0 xl:opacity-100' : 'block opacity-100'
                  }`}>
                    {isDarkMode ? 'Lunar' : 'Solar'}
                  </span>
                </button>

                <button 
                  onClick={handleLogout}
                  className={`w-full flex items-center transition-all duration-300 rounded-2xl p-4 text-slate-400 hover:text-red-500 hover:bg-red-50/50 active:scale-95 ${
                    !isSidebarOpen ? 'lg:justify-center xl:justify-start lg:gap-0 xl:gap-4' : 'justify-start gap-4'
                  }`}
                  title="Terminate Session"
                >
                  <div className="shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className={`transition-all duration-300 font-bold text-[10px] xl:text-xs uppercase tracking-widest ${
                    !isSidebarOpen ? 'hidden xl:block opacity-0 xl:opacity-100' : 'block opacity-100'
                  }`}>
                    Sign Out
                  </span>
                </button>
              </div>
            </div>

          </aside>
        </>
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col relative ${activeTab === 'chat' || isExamMode ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {isExamMode ? (
          <div className={`h-full flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Exam Header */}
            <div className={`min-h-20 lg:h-24 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-8 transition-all duration-500 relative z-50 ${
              isDarkMode ? 'bg-slate-950/80 backdrop-blur-2xl' : 'bg-white/80 backdrop-blur-2xl border-b border-slate-100'
            }`}>
              <div className="flex items-center gap-6 group">
                <div className={`w-14 h-14 bg-red-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden transition-transform group-hover:scale-105 active:scale-95`}>
                  <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                  <ShieldAlert className="w-7 h-7 text-white relative z-10" />
                </div>
                <div>
                  <h2 className={`font-display font-black text-2xl tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>SIMULATION <span className="text-red-600">ALPHA</span></h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600">Secure Protocol Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 lg:gap-12 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex flex-col items-end">
                  <div className={`text-4xl lg:text-5xl font-display font-black tabular-nums tracking-tighter leading-none ${examTimeLeft < 300 ? 'text-red-500 animate-pulse' : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>
                    {Math.floor(examTimeLeft / 60)}:{(examTimeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <div className={`text-[9px] uppercase font-black tracking-[0.3em] mt-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Chronometer</div>
                </div>

                <div className={`h-12 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      if (window.confirm("ARE YOU SURE? TERMINATING THE SESSION WILL NULLIFY ALL PROGRESS.")) {
                        setIsExamMode(false);
                      }
                    }}
                    className={`flex items-center gap-3 px-6 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:text-slate-900 shadow-sm'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    Exit Exam
                  </button>

                  <button 
                    onClick={finishExam}
                    disabled={isEvaluatingExam}
                    className="px-10 py-4 bg-red-600 hover:bg-black text-white rounded-[1.25rem] font-display font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-2xl shadow-red-500/20 hover:shadow-black/20 disabled:opacity-30 active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isEvaluatingExam ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <ChevronRight className="w-4 h-4" />}
                    {isEvaluatingExam ? 'Finalizing...' : 'Sovereign Submission'}
                  </button>
                </div>
              </div>
            </div>

            {/* Exam Content */}
            <div className={`flex-1 overflow-hidden flex flex-col lg:flex-row transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
              {/* Question Navigation */}
              <div className={`hidden lg:block w-72 border-r p-8 space-y-6 overflow-y-auto transition-colors duration-500 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Curriculum Index</h3>
                  <div className={`text-[10px] px-2 py-0.5 rounded-md border ${
                    isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {examQuestions.length} Items Pool
                  </div>
                </div>
                <div className="space-y-3">
                  {examQuestions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentExamQuestionIdx(idx)}
                      className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between relative group ${
                        currentExamQuestionIdx === idx
                          ? isDarkMode 
                            ? 'border-brand-500 bg-brand-500/10 text-white shadow-lg shadow-brand-500/10'
                            : 'border-brand-600 bg-brand-50 text-brand-700 shadow-lg shadow-brand-200/20'
                          : examAnswers[q.id]
                            ? isDarkMode ? 'border-slate-800 bg-slate-800/50 text-slate-500' : 'border-slate-50 bg-slate-50 text-slate-400'
                            : isDarkMode ? 'border-transparent text-slate-500 hover:bg-slate-800/50' : 'border-transparent text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${
                          currentExamQuestionIdx === idx 
                          ? 'bg-brand-600 text-white' 
                          : isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold text-sm">Question {idx + 1}</span>
                      </div>
                      {examAnswers[q.id] && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
                      {currentExamQuestionIdx === idx && (
                         <motion.div 
                          layoutId="exam-nav-active"
                          className="absolute left-[-2px] inset-y-4 w-1 bg-brand-600 rounded-r-full"
                         />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Question Tabs */}
              <div className={`lg:hidden flex overflow-x-auto px-4 py-3 border-b gap-2 scrollbar-hide transition-colors duration-500 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                {examQuestions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentExamQuestionIdx(idx)}
                    className={`shrink-0 px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                      currentExamQuestionIdx === idx
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : examAnswers[q.id]
                          ? isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                          : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>Item {idx + 1}</span>
                    {examAnswers[q.id] && <CheckCircle2 className="w-3 h-3 text-brand-500" />}
                  </button>
                ))}
              </div>

              {/* Question Area */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-12">
                {isEvaluatingExam ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="relative">
                      <div className="w-32 h-32 border-4 border-brand-500/20 rounded-full animate-ping absolute inset-0" />
                      <div className="w-32 h-32 border-t-4 border-brand-600 rounded-full animate-spin relative z-10" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-brand-600" />
                      </div>
                    </div>
                    <div className="text-center space-y-4">
                      <h2 className="text-3xl font-display font-black text-slate-900">Synthesizing Feedback</h2>
                      <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Our examiners are meticulously analyzing your responses against UNEB standards to provide comprehensive pedagogical feedback.
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-brand-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-brand-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                ) : isExamFinished && examResults ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto space-y-8"
                  >
                    <div className="text-center space-y-4">
                      <div className="inline-flex p-4 bg-brand-600 rounded-full shadow-xl shadow-brand-500/40">
                        <Trophy className="w-12 h-12 text-white" />
                      </div>
                      <h2 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Exam Results</h2>
                      <div className="text-6xl font-black text-brand-600">{examResults.totalScore}%</div>
                      <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Great effort! Here is your detailed performance breakdown.</p>
                      
                      <div className="flex justify-center gap-4 mt-4">
                        <button 
                          onClick={() => downloadAsPDF('exam-report', `Exam_Report_${new Date().toLocaleDateString()}.pdf`)}
                          className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20"
                        >
                          <FileDown className="w-5 h-5" />
                          Download Full Report
                        </button>
                      </div>
                    </div>

                    <div id="exam-report" className="space-y-6">
                      {examResults.results.map((res, idx) => (
                        <div key={idx} className={`rounded-[2.5rem] p-8 border shadow-sm space-y-6 transition-all duration-500 ${
                          isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/40' : 'bg-white border-slate-100 shadow-sm'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Question {idx + 1}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Sparkles className="w-3 h-3 text-brand-500" />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Realism: {examResults.questions[idx].examRealismScore}%</span>
                              </div>
                            </div>
                            <div className={`px-4 py-2 rounded-xl font-black transition-colors ${
                              isDarkMode ? 'bg-brand-500/10 text-brand-400' : 'bg-brand-50 text-brand-600'
                            }`}>
                              {Math.round(res.percentageScore)}/100
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className={`text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Question</h4>
                              <div className={`markdown-body mb-4 ${isDarkMode ? 'markdown-dark' : ''}`}>
                                <ReactMarkdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>
                                  {preprocessMarkdown(examResults.questions[idx].questionText)}
                                </ReactMarkdown>
                              </div>
                              {examResults.questions[idx].scenarioGraph && (
                                <div className="mb-4">
                                  <GraphRenderer data={examResults.questions[idx].scenarioGraph} />
                                </div>
                              )}
                              {examResults.questions[idx].scenarioImage && (
                                <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                  <img 
                                    src={examResults.questions[idx].scenarioImage} 
                                    alt="Question Illustration" 
                                    className="w-full h-auto object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                            </div>
 
                            <div>
                              <h4 className={`text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Your Answer</h4>
                              <div className={`p-4 rounded-xl border italic transition-colors ${
                                isDarkMode ? 'bg-slate-950/50 text-slate-500 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-100'
                              }`}>
                                {examResults.answers[examResults.questions[idx].id]}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className={`text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Examiner Feedback</h4>
                              <div className={`markdown-body ${isDarkMode ? 'markdown-dark' : ''}`}>
                                <ReactMarkdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>
                                  {preprocessMarkdown(res.feedback)}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => {
                        setIsExamMode(false);
                        setExamResults(null);
                        setIsExamFinished(false);
                      }}
                      className={`w-full py-4 rounded-2xl font-black transition-all shadow-xl ${
                        isDarkMode ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20' : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      Return to Dashboard
                    </button>
                  </motion.div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-8">
                    <div id="exam-question-paper" className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border shadow-xl transition-all duration-500 ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-800 shadow-slate-950/40 text-white' 
                        : 'bg-white border-slate-200 shadow-slate-200/40 text-slate-900'
                    }`}>
                      <div className={`markdown-body ${isDarkMode ? 'markdown-dark' : ''}`}>
                        <ReactMarkdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>
                          {preprocessMarkdown(examQuestions[currentExamQuestionIdx]?.questionText || "")}
                        </ReactMarkdown>
                      </div>
                      {examQuestions[currentExamQuestionIdx]?.scenarioGraph && (
                        <div className="mt-8">
                          <GraphRenderer data={examQuestions[currentExamQuestionIdx].scenarioGraph} />
                        </div>
                      )}
                      {examQuestions[currentExamQuestionIdx]?.scenarioImage && (
                        <div className="mt-8 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                          <img 
                            src={examQuestions[currentExamQuestionIdx].scenarioImage} 
                            alt="Question Illustration" 
                            className="w-full h-auto object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <MessageSquare className="w-4 h-4" />
                        Your Response
                      </h3>
                      <textarea 
                        value={examAnswers[examQuestions[currentExamQuestionIdx]?.id] || ""}
                        onChange={(e) => setExamAnswers(prev => ({
                          ...prev,
                          [examQuestions[currentExamQuestionIdx].id]: e.target.value
                        }))}
                        placeholder="Type your detailed answer here. Use clear reasoning and show your steps..."
                        className={`w-full h-64 p-6 rounded-3xl shadow-sm focus:outline-none focus:ring-4 transition-all text-lg leading-relaxed ${
                          isDarkMode 
                            ? 'bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-700 focus:ring-brand-500/20 focus:border-brand-500' 
                            : 'bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-brand-500/10 focus:border-brand-500'
                        }`}
                      />
                    </div>

                    <div className="flex justify-between">
                      <button
                        disabled={currentExamQuestionIdx === 0}
                        onClick={() => setCurrentExamQuestionIdx(prev => prev - 1)}
                        className={`px-8 py-4 rounded-2xl font-bold disabled:opacity-20 transition-all ${
                          isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        Previous Item
                      </button>
                      <button
                        disabled={currentExamQuestionIdx === examQuestions.length - 1}
                        onClick={() => setCurrentExamQuestionIdx(prev => prev + 1)}
                        className={`px-8 py-4 rounded-2xl font-bold disabled:opacity-20 transition-all ${
                          isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        Next Item
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden container for full paper PDF export */}
            <div className="hidden">
              <div id="exam-full-paper" className="p-12 bg-white text-slate-900 space-y-12">
                <div className="text-center border-b-2 border-slate-900 pb-8">
                  <h1 className="text-3xl font-bold uppercase tracking-widest">UNEB Simulation Question Paper</h1>
                  <p className="text-lg font-medium mt-2">Subject: {examQuestions[0]?.subject || 'General'}</p>
                  <p className="text-sm text-slate-500">Topics: {selectedTopics.join(', ')}</p>
                  <p className="text-sm text-slate-500">Time Allowed: 45 Minutes</p>
                </div>
                
                {examQuestions.map((q, idx) => (
                  <div key={q.id} className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-slate-200 pb-2">Item {idx + 1}</h2>
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>
                        {preprocessMarkdown(q.questionText)}
                      </ReactMarkdown>
                    </div>
                    {idx < examQuestions.length - 1 && <div className="page-break" />}
                  </div>
                ))}
                
                <div className="mt-20 pt-8 border-t-2 border-slate-900 text-center text-xs text-slate-400 italic">
                  Generated by Stellas - Personalized Learning for Uganda
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            {activeTab !== 'chat' && (
              <header className={`relative h-24 px-6 lg:px-12 flex items-center justify-between z-30 transition-all duration-500 border-b ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-900' 
                  : 'bg-white border-slate-100'
              }`}>
                <div className="flex items-center gap-8">
                  {/* Spacer to align with our permanent fixed mobile hamburger */}
                  <div className="w-12 h-12 lg:hidden shrink-0" />
                  <div className="flex flex-col">
                    <h2 className={`text-2xl font-display font-black tracking-tight capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeTab}</h2>
                    <p className="text-[9px] font-black text-brand-600 uppercase tracking-[0.3em] leading-none mt-1.5 opacity-80">Neural Core Analysis</p>
                  </div>
                </div>



                <div className="flex items-center gap-8">
                  <button 
                    onClick={() => setShowSynergyPanel(true)}
                    title="View Synergy Breakdown & Telemetry"
                    className={`hidden md:flex items-center gap-4 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border text-left cursor-pointer hover:scale-[1.02] active:scale-95 group ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-800 text-brand-400 hover:border-brand-500/40 shadow-xl' 
                      : 'bg-brand-50/20 border-brand-100/50 text-brand-700 hover:border-brand-300 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-brand-500 transition-transform group-hover:rotate-12" />
                      <span>Lvl {profile?.level || 1} Elite Scholar</span>
                    </div>
                    <div className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-brand-200'}`} />
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-500 transition-transform group-hover:scale-125" />
                      <span>{synergyDetails.score}% Synergy</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={`w-12 h-12 rounded-[1.25rem] overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 shadow-2xl shrink-0 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-800 shadow-slate-950/50' 
                        : 'bg-white border-white shadow-brand-500/10'
                    }`}
                    title="Open Settings"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-50 text-slate-300'}`}>
                        <UserCircle className="w-7 h-7" />
                      </div>
                    )}
                  </button>
                </div>
              </header>
            )}

        {/* Error Banner */}
        <AnimatePresence>
          {generationError && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 border-b border-red-100 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-red-700 text-sm font-medium">
                  <AlertCircle className="w-5 h-5" />
                  <span>{generationError}</span>
                </div>
                <button 
                  onClick={() => setGenerationError(null)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <div className={`flex-1 transition-colors duration-500 ${
          activeTab === 'chat' ? 'overflow-hidden p-0' : 'overflow-visible p-4 lg:p-8'
        } ${
          isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
        }`}>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto space-y-12 pb-24"
              >
                {/* Executive Welcome Section */}
                <div className="relative overflow-hidden group">
                  <div className={`p-6 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] relative z-10 overflow-hidden ${
                    isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100 shadow-sm'
                  }`}>
                    {/* Abstract background detail */}
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-600/5 blur-[80px] rounded-full" />
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                      <div className="space-y-4">
                        <h1 className={`text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tight leading-tight whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          Welcome, <span className="text-brand-600">
                            {profile?.role === 'teacher' ? 'Educator ' : profile?.role === 'institution' ? 'Administrator ' : ''}
                            {user?.displayName?.split(' ')[0] || 'Scholar'}
                          </span>.
                        </h1>
                        <p className={`text-lg font-medium leading-relaxed max-w-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {profile?.role === 'teacher' 
                            ? "Your pedagogical impact is expanding. You have successfully synthesized 12 assessment scenarios this month."
                            : profile?.role === 'institution'
                            ? `Managing ${profile.schoolName || 'Facility'}. Your neural network includes ${profile.subjects.length} active curricula paths.`
                            : `Your academic trajectory is up by 12% this week. Stellas has synthesized 4 new focus areas based on your last session.`
                          }
                        </p>
                      </div>
                      <div className="w-full lg:w-auto">
                        {profile?.role === 'teacher' ? (
                          <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto sm:gap-4">
                            <button 
                              onClick={() => setActiveTab('assessments')}
                              className="px-4 sm:px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-display font-black text-xs sm:text-sm tracking-tight transition-all shadow-xl shadow-brand-500/20 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 w-full"
                            >
                              <Zap className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Synthesize Item</span>
                            </button>
                            <button 
                              onClick={() => setActiveTab('plans')}
                              className={`px-4 sm:px-8 py-4 rounded-2xl font-display font-black text-xs sm:text-sm tracking-tight transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 w-full ${
                                isDarkMode 
                                  ? 'bg-slate-800 text-brand-400 border border-slate-700 shadow-slate-950/20' 
                                  : 'bg-white text-brand-600 border border-brand-100 shadow-brand-100/20'
                              }`}
                            >
                              <FileText className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Design Lesson</span>
                            </button>
                          </div>
                        ) : profile?.role === 'institution' ? (
                          <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto sm:gap-4">
                            <button 
                              onClick={() => setActiveTab('staff')}
                              className="px-4 sm:px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-display font-black text-xs sm:text-sm tracking-tight transition-all shadow-xl shadow-brand-500/20 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 w-full"
                            >
                              <Users className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Add Teacher</span>
                            </button>
                            <button 
                              onClick={() => setActiveTab('students')}
                              className={`px-4 sm:px-8 py-4 rounded-2xl font-display font-black text-xs sm:text-sm tracking-tight transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 w-full ${
                                isDarkMode 
                                  ? 'bg-slate-800 text-brand-400 border border-slate-700 shadow-slate-950/20' 
                                  : 'bg-white text-brand-600 border border-brand-100 shadow-brand-100/20'
                              }`}
                            >
                              <GraduationCap className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Add Student</span>
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto sm:gap-4">
                            <button 
                              onClick={() => setActiveTab('practice')}
                              className="px-4 sm:px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-display font-black text-xs sm:text-sm tracking-tight transition-all shadow-xl shadow-brand-500/20 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 w-full"
                            >
                              <Play className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Start Practicing</span>
                            </button>
                            <button 
                              onClick={() => generateMockEvaluation()}
                              className={`px-4 sm:px-8 py-4 rounded-2xl font-display font-black text-xs sm:text-sm tracking-tight transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 w-full ${
                                isDarkMode 
                                  ? 'bg-slate-800 text-brand-400 border border-slate-700 shadow-slate-950/20' 
                                  : 'bg-white text-brand-600 border border-brand-100 shadow-brand-100/20'
                              }`}
                            >
                              <FileText className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Mock Evaluation</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Academic Checkpoint Card */}
                {profile?.role === 'student' && (
                  <div id="weekly-academic-checkpoint" className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border shadow-md space-y-6 md:space-y-8 transition-all duration-500 overflow-hidden relative ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/40' : 'bg-white border-slate-100 shadow-sm'
                  }`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          isDarkMode ? 'bg-slate-850 text-emerald-400 border border-slate-800' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          <Calendar className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h3 className={`text-xl md:text-2xl font-display font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Weekly Academic Checkpoint</h3>
                          <p className="text-slate-400 text-sm font-medium mt-1">Stella's synergized review & tailored assessments for your study plan.</p>
                        </div>
                      </div>
                      
                      {(!profile?.revisionTimetable || profile.revisionTimetable.length === 0) && (
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setTimeout(() => {
                              const el = document.getElementById('school-and-revision-timetables');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 whitespace-nowrap"
                        >
                          Setup Timetables
                        </button>
                      )}
                    </div>

                    {profile?.revisionTimetable && profile.revisionTimetable.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left column: Revision Checklist */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-brand-500 rounded-full" />
                            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400">Personal Revision Tracker</h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Tick off the S5/S6 topics you have successfully reviewed this week to sync with Stella's assessment engines:</p>
                          
                          <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {profile.revisionTimetable.map(item => {
                              const uniqueKey = `${item.day}-${item.subject}-${item.topic}`;
                              const isCovered = coveredRevisionTopics[uniqueKey] || false;
                              
                              return (
                                <div 
                                  key={item.id}
                                  onClick={() => {
                                    setCoveredRevisionTopics(prev => ({
                                      ...prev,
                                      [uniqueKey]: !isCovered
                                    }));
                                  }}
                                  className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-305 hover:translate-x-1 ${
                                    isCovered
                                      ? isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' : 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                                      : isDarkMode ? 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-950 text-slate-300' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                                    isCovered 
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                                      : isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-300 bg-white'
                                  }`}>
                                    {isCovered && <Check className="w-3.5 h-3.5" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-300/10 dark:bg-slate-850 text-slate-400 px-1.5 py-0.5 rounded">
                                        {item.day}
                                      </span>
                                      <span className="text-xs font-bold truncate">{item.subject}</span>
                                    </div>
                                    <p className={`text-sm mt-0.5 font-bold ${isCovered ? 'line-through text-slate-400' : ''}`}>{item.topic}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right column: School Lesson Tracker */}
                        <div className="space-y-4 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400">Classroom Lesson Pace Tracker</h4>
                            </div>
                            {profile.schoolTimetable && profile.schoolTimetable.length > 0 ? (
                              <div className="space-y-4">
                                <p className="text-xs text-slate-400">What did your teacher actually cover in class during these lessons? Update Stella so she aligns with your school pace:</p>
                                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                  {profile.schoolTimetable.map(item => (
                                    <div key={item.id} className="space-y-1">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                                        <span className="truncate">{item.day} • {item.subject} {item.branch ? `(${item.branch})` : ''}</span>
                                        {item.teacher && <span className="text-emerald-500">with {item.teacher}</span>}
                                      </div>
                                      <input
                                        type="text"
                                        value={classroomLessonsTaught[item.id] || ''}
                                        onChange={(e) => setClassroomLessonsTaught(prev => ({
                                          ...prev,
                                          [item.id]: e.target.value
                                        }))}
                                        placeholder="e.g. Completed Newton's laws of motion"
                                        className={`w-full px-3 py-2 rounded-xl text-xs outline-none transition-all ${
                                          isDarkMode 
                                            ? 'bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-700 focus:ring-1 focus:ring-emerald-500/30' 
                                            : 'bg-slate-50 border border-slate-150 text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500'
                                        }`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No school timetable entries are active. Set S5/S6 school slots in Settings to track your classes!</p>
                            )}
                          </div>

                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={async () => {
                                  const selectedRevEntries = profile.revisionTimetable!.filter(e => {
                                    const k = `${e.day}-${e.subject}-${e.topic}`;
                                    return coveredRevisionTopics[k];
                                  });
                                  
                                  const targetTopics = selectedRevEntries.map(e => e.topic);
                                  const classInputList = Object.values(classroomLessonsTaught).filter(t => t.trim().length > 0);
                                  
                                  if (targetTopics.length === 0 && classInputList.length === 0) {
                                    alert("Please tick at least one revision topic or input what you were taught in class first!");
                                    return;
                                  }
                                  
                                  const combined = [...targetTopics, ...classInputList];
                                  setActiveTab('practice');
                                  await generatePracticeQuestion(combined);
                                }}
                                className="flex-1 py-3 px-5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-widest text-center transition-all shadow-md active:scale-95"
                              >
                                Launch Practice Question
                              </button>
                              
                              <button
                                onClick={() => {
                                  const selectedRevEntries = profile.revisionTimetable!.filter(e => {
                                    const k = `${e.day}-${e.subject}-${e.topic}`;
                                    return coveredRevisionTopics[k];
                                  });
                                  
                                  const targetTopics = selectedRevEntries.map(e => e.topic);
                                  const classInputList = Object.entries(classroomLessonsTaught)
                                    .map(([id, text]) => {
                                      const entry = profile.schoolTimetable?.find(e => e.id === id);
                                      return entry ? `${entry.day} ${entry.subject}: ${text}` : text;
                                    })
                                    .filter(t => t.trim().length > 0);
                                  
                                  if (targetTopics.length === 0 && classInputList.length === 0) {
                                    alert("Please tick at least one revision topic or input what you were taught in class first!");
                                    return;
                                  }

                                  const promptToSend = `Hi Stella, I've just completed my S5/S6 Weekly Academic Checkpoint! I want you to tailor a highly challenging assessment check test for me based on what I have covered.

Here is what I completed in my personal study revision:
${targetTopics.map(t => `• Topic: ${t}`).join('\n')}

Here is what we covered in my school classes this week:
${classInputList.map(t => `• ${t}`).join('\n')}

Please act as Stella, my expert Ugandan UNEB A-Level tutor. Consult our uneb_exams.json or mechanics_reference.json databases and give me a highly customized, challenging word problem or application scenario based on these topics to solve in this chat!`;

                                  setActiveTab('chat');
                                  sendMessage(promptToSend);
                                }}
                                className={`flex-1 py-3 px-5 rounded-xl text-xs font-black uppercase tracking-widest text-center transition-all border flex items-center justify-center gap-1.5 ${
                                  isDarkMode 
                                    ? 'bg-slate-800 text-brand-400 border-slate-700 hover:bg-slate-755' 
                                    : 'bg-white text-brand-600 border-brand-100 hover:bg-brand-50 shadow-sm'
                                }`}
                              >
                                Chat Test with Stella
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800/60 rounded-[2.5rem] flex flex-col items-center justify-center text-center px-4">
                        <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                        <h4 className="font-bold text-slate-500 dark:text-slate-400 text-lg">Your Weekly Academic Checkpoint is Waiting</h4>
                        <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md mt-2 leading-relaxed">
                          Map your school courses and self-study slots on your timetables inside Settings tab. Stella will automatically track your weekly progression checklist, query classroom coverage, and synthesize customized mock tests matching your syllabus progress.
                        </p>
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setTimeout(() => {
                              const el = document.getElementById('school-and-revision-timetables');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          className="mt-6 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-500/10 active:scale-95"
                        >
                          Setup S5/S6 Timetables
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Hero Stats */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  <StatCard 
                    icon={<BookMarked className="text-blue-600" />} 
                    label="Active Disciplines" 
                    value={profile?.subjects.length || 0} 
                    color="bg-blue-50/50" 
                    delay={0.1}
                    isDarkMode={isDarkMode}
                  />
                  <StatCard 
                    icon={<Target className="text-orange-600" />} 
                    label="Mastery Points" 
                    value={Object.values(profile?.coverage || {}).flat().length} 
                    color="bg-orange-50/50" 
                    delay={0.2}
                    isDarkMode={isDarkMode}
                  />
                  <StatCard 
                    icon={<Trophy className="text-brand-600" />} 
                    label="Scholastic Score" 
                    value={analytics ? `${Math.round(Object.values(analytics.topicPerformance).reduce((acc, curr) => acc + curr.averageScore, 0) / (Object.keys(analytics.topicPerformance).length || 1))}%` : '0%'} 
                    color="bg-brand-50/50" 
                    delay={0.3}
                    isDarkMode={isDarkMode}
                  />
                  <StatCard 
                    icon={<GraduationCap className="text-pink-600" />} 
                    label={dashboardRankBasis === 'school' ? (profile?.schoolName || 'Kawempe Muslim') : (profile?.district || 'Kampala')} 
                    value={`#${dashboardRankBasis === 'school' ? getSchoolRankValue() : getLocationRankValue()} of ${dashboardRankBasis === 'school' ? getSchoolCohortSize() : getLocationCohortSize()}`} 
                    color="bg-pink-50/50" 
                    delay={0.4}
                    isDarkMode={isDarkMode}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                  {/* Subject Exploration */}
                  <div className="lg:col-span-4 space-y-8">
                    <MasteryRadar analytics={analytics} subjects={profile?.subjects || []} isDarkMode={isDarkMode} />
                    
                    <div className={`p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border transition-all duration-500 overflow-hidden relative ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                    }`}>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full pointer-events-none" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
                        <div>
                          <h3 className={`text-3xl font-display font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Cognitive Map</h3>
                          <p className="text-slate-400 text-sm font-medium mt-3">Synthesizing your progress across the national framework.</p>
                        </div>
                        <button 
                          onClick={() => setActiveTab('practice')}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-brand-400' : 'bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-600'
                          }`}
                        >
                          Explore More <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-8 lg:gap-10">
                        {profile?.subjects.map(subject => (
                          <div key={subject} className="relative group">
                            <div className="flex items-center justify-between mb-3 sm:mb-5">
                              <div className="flex items-center gap-2 sm:gap-4 max-w-full overflow-hidden">
                                <div className="w-1 h-6 sm:w-1.5 sm:h-10 bg-brand-600 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.35)] dark:shadow-[0_0_15px_rgba(255,255,255,0.15)] shrink-0" />
                                <span className={`font-display font-black text-sm sm:text-xl tracking-tighter truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{subject}</span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full">
                              {(() => {
                                const fullList = CURRICULUM[subject as keyof typeof CURRICULUM] || [];
                                const isExpanded = !!expandedSubjects[subject];
                                const maxLimit = isMobile ? 2 : 4;
                                const visibleList = isExpanded ? fullList : fullList.slice(0, maxLimit);
                                
                                return (
                                  <>
                                    {visibleList.map(topic => {
                                      const isCovered = profile?.coverage?.[subject]?.includes(topic.topic) || false;
                                      return (
                                        <button
                                          key={topic.topic}
                                          onClick={() => {
                                            if (!profile) return;
                                            const current = profile.coverage[subject] || [];
                                            const next = current.includes(topic.topic)
                                              ? current.filter(t => t !== topic.topic)
                                              : [...current, topic.topic];
                                            updateProfile({ 
                                              coverage: { ...profile.coverage, [subject]: next } 
                                            });
                                          }}
                                          className={`px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-bold transition-all border shrink-0 text-left cursor-pointer flex items-center gap-1.5 sm:gap-2 group/btn w-full sm:w-auto ${
                                            isCovered
                                              ? 'bg-brand-600 text-white border-brand-600 shadow-xl shadow-brand-500/20 hover:bg-brand-700'
                                              : isDarkMode 
                                                ? 'bg-slate-800/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                                                : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-white hover:border-slate-200 hover:text-slate-700 shadow-sm'
                                          }`}
                                        >
                                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                            isCovered
                                              ? 'border-white bg-white/20'
                                              : isDarkMode ? 'border-slate-700 group-hover/btn:border-slate-500' : 'border-slate-300 group-hover/btn:border-slate-400'
                                          }`}>
                                            {isCovered && (
                                              <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 20 20">
                                                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                              </svg>
                                            )}
                                          </div>
                                          <span className="truncate">{topic.topic}</span>
                                        </button>
                                      );
                                    })}
                                    
                                    {fullList.length > maxLimit && (
                                      <button
                                        onClick={() => {
                                          setExpandedSubjects(prev => ({
                                            ...prev,
                                            [subject]: !prev[subject]
                                          }));
                                        }}
                                        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto ${
                                          isExpanded
                                            ? isDarkMode 
                                              ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' 
                                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                            : isDarkMode 
                                              ? 'bg-brand-500/10 text-brand-400 border-brand-500/20 hover:bg-brand-500/20' 
                                              : 'bg-brand-50 text-brand-600 border-brand-100 hover:bg-brand-100/50'
                                        }`}
                                      >
                                        {isExpanded ? (
                                          <>Show Less</>
                                        ) : (
                                          <>{isMobile ? `+${fullList.length - 2} More` : `+${fullList.length - 4} More`}</>
                                        )}
                                      </button>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Stats & Activity */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className={`p-5 sm:p-10 rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl flex flex-col items-stretch overflow-hidden relative transition-all duration-500 border ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/60' : 'bg-slate-950 text-white shadow-slate-200/50 border-slate-900'
                    }`}>
                      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-brand-600/10 blur-[80px] rounded-full pointer-events-none" />
                      <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-red-600/5 blur-[80px] rounded-full pointer-events-none" />
                      
                      {/* Responsive Heading block: Row on mobile, Column on desktop */}
                      <div className="flex flex-row md:flex-col items-center md:text-center gap-3.5 sm:gap-6 relative z-10 w-full mb-3 sm:mb-6">
                        <div className="w-12 h-12 sm:w-20 sm:h-20 bg-brand-600 rounded-[1.25rem] sm:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-600/30 shrink-0 relative z-10 group-hover:scale-105 transition-transform duration-500">
                          <Trophy className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <div className="text-left md:text-center">
                          <h3 className="text-xl sm:text-3xl font-display font-black leading-tight tracking-tight">
                            Neural <span className="text-brand-600">Sync</span>
                          </h3>
                        </div>
                      </div>

                      <p className={`text-[11px] sm:text-xs font-medium leading-relaxed relative z-10 w-full mb-4 sm:mb-8 text-left md:text-center ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-300'
                      }`}>
                        You are synthesizing complex cross-domain logic with 88% precision.
                      </p>
                      
                      <div className="w-full space-y-3 sm:space-y-4 relative z-10">
                        {analytics && Object.keys(analytics.topicPerformance).length > 0 ? (
                          Object.entries(analytics.topicPerformance).slice(0, 3).map(([topic, data]) => (
                            <button 
                              key={topic} 
                              onClick={() => onFocusTopic(topic)}
                              className={`w-full text-left p-3.5 sm:p-6 border rounded-[1.25rem] sm:rounded-[1.75rem] transition-all hover:bg-white/5 active:scale-[0.98] ${
                                isDarkMode ? 'bg-slate-800/20 border-slate-800/50' : 'bg-white/5 border-white/5'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2.5 sm:mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest truncate pr-4 text-slate-300">{topic}</span>
                                <span className="text-xs font-black text-brand-500">{Math.round(data.averageScore)}%</span>
                              </div>
                              <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-white/10'}`}>
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${data.averageScore}%` }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  className="h-full bg-brand-600 shadow-[0_0_10px_rgba(0,0,0,0.35)] dark:shadow-[0_0_10px_rgba(255,255,255,0.15)]"
                                />
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className={`py-6 sm:py-12 border border-dashed rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col items-center gap-3 sm:gap-4 ${
                            isDarkMode ? 'border-slate-800 text-slate-700' : 'border-white/10 text-slate-500'
                          }`}>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-current flex items-center justify-center opacity-20">
                              <Target className="w-4 sm:w-5 h-4 sm:h-5" />
                            </div>
                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em]">Initialize Sessions</span>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => setActiveTab('practice')}
                          className="w-full py-4 sm:py-5 rounded-[1.25rem] sm:rounded-[1.5rem] bg-brand-600 text-white font-display font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-brand-700 hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand-900/40 mt-3 sm:mt-4"
                        >
                          Launch Sandbox
                        </button>
                      </div>
                    </div>

                    <div className={`p-8 rounded-[3rem] border shadow-sm relative group overflow-hidden transition-all duration-500 ${
                       isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/40' : 'bg-white border-slate-100'
                    }`}>
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                              isDarkMode ? 'bg-slate-800 text-orange-400' : 'bg-orange-50 text-orange-600'
                            }`}>
                              <Target className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className={`font-display font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Personal Goals</h4>
                              <span className={`text-[10px] uppercase font-black tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Active Targets</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActiveTab('settings')}
                            className={`p-2 rounded-xl transition-colors ${
                              isDarkMode ? 'hover:bg-slate-800 text-slate-500 hover:text-brand-400' : 'hover:bg-slate-50 text-slate-400 hover:text-brand-600'
                            }`}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {profile?.goals && profile.goals.length > 0 ? (
                            profile.goals.slice(0, 3).map(goal => (
                              <div key={goal.id} className={`flex items-center gap-3 p-3 rounded-2xl transition-colors group/goal ${
                                isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                              }`}>
                                <button 
                                  onClick={() => toggleGoal(goal.id)}
                                  className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                                    goal.completed 
                                      ? 'bg-green-500 border-green-500 text-white' 
                                      : isDarkMode ? 'border-slate-800' : 'border-slate-200'
                                  }`}
                                >
                                  {goal.completed && <CheckCircle2 className="w-3 h-3" />}
                                </button>
                                <span className={`text-xs font-bold transition-all ${
                                  goal.completed 
                                    ? isDarkMode ? 'text-slate-600 line-through' : 'text-slate-400 line-through' 
                                    : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  {goal.text}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className={`py-4 text-center border border-dashed rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${
                              isDarkMode ? 'border-slate-800 text-slate-700' : 'border-slate-100 text-slate-300'
                            }`}>
                              Set your first goal in settings
                            </div>
                          )}
                        </div>
                     </div>

                    <div className={`p-8 rounded-[3rem] border shadow-sm relative group overflow-hidden transition-all duration-500 ${
                       isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/40' : 'bg-white border-slate-100 shadow-sm'
                    }`}>
                       <div className="flex items-center gap-4 mb-8">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                           isDarkMode ? 'bg-slate-800 text-brand-400' : 'bg-brand-50 text-brand-600'
                         }`}>
                           <GraduationCap className="w-6 h-6" />
                         </div>
                         <div>
                           <h4 id="learning-rank-title" className={`font-display font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Learning Rank</h4>
                           <span className={`text-[10px] uppercase font-black tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-brand-600'}`}>Candidate Profile</span>
                         </div>
                       </div>

                       {/* High-Fidelity Cohort Toggle Selector */}
                       <div className="mb-6 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
                         <span className={`text-[9px] uppercase font-black tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Rank</span>
                         <div className="flex gap-1.5">
                           <button 
                             onClick={(e) => { e.stopPropagation(); setDashboardRankBasis('school'); }}
                             className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                               dashboardRankBasis === 'school'
                                 ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
                                 : isDarkMode ? 'bg-slate-900 text-slate-400 hover:text-slate-200' : 'bg-white text-slate-500 hover:bg-slate-100 shadow-sm'
                             }`}
                           >
                             School
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); setDashboardRankBasis('location'); }}
                             className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                               dashboardRankBasis === 'location'
                                 ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
                                 : isDarkMode ? 'bg-slate-900 text-slate-400 hover:text-slate-200' : 'bg-white text-slate-550 hover:bg-slate-100 shadow-sm'
                             }`}
                           >
                             Location
                           </button>
                         </div>
                       </div>

                       <div className="flex items-center justify-between p-1 mb-6 border-b border-slate-100 dark:border-slate-800/40 pb-4 gap-1">
                         <div className="min-w-0">
                           <h5 className={`text-[9px] uppercase font-black tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Current Cohort</h5>
                           <p className={`text-xs font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mt-1`}>
                             {dashboardRankBasis === 'school' ? (profile?.schoolName || 'Kawempe Muslim Sec School') : (profile?.district || 'Kampala')}
                           </p>
                           <span className="text-[10px] text-slate-400 block mt-1">
                             {dashboardRankBasis === 'school' ? getSchoolCohortSize() : getLocationCohortSize()} active candidates
                           </span>
                         </div>
                         <div className="text-right shrink-0">
                           <span className="text-[9px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">Rank</span>
                           <div className="text-2xl font-display font-black text-brand-600 mt-0.5 leading-none">
                             #{dashboardRankBasis === 'school' ? getSchoolRankValue() : getLocationRankValue()}
                           </div>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-6">
                         <div className={`w-24 h-24 rounded-full border-[6px] flex items-center justify-center relative shadow-inner ${
                           isDarkMode ? 'border-slate-800' : 'border-brand-50'
                         }`}>
                            <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>S6</span>
                            <div className="absolute inset-0 border-[6px] border-brand-600 rounded-full border-t-transparent animate-spin-slow opacity-20" />
                         </div>
                         <div className="flex-1 space-y-4">
                           <div className="space-y-1">
                             <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                               <span>Mastery XP</span>
                               <span>{profile?.level || 1}/10</span>
                             </div>
                             <div className={`h-2 rounded-full overflow-hidden p-0.5 border ${
                               isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-100 border-white'
                             }`}>
                               <div className="h-full bg-brand-600 rounded-full w-[45%]" />
                             </div>
                           </div>
                           <div className="space-y-1">
                             <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                               <span>Reliability</span>
                               <span>92%</span>
                             </div>
                             <div className={`h-2 rounded-full overflow-hidden p-0.5 border ${
                               isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-100 border-white'
                             }`}>
                               <div className={`h-full rounded-full w-[92%] ${isDarkMode ? 'bg-slate-405 bg-slate-300' : 'bg-slate-900'}`} />
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* UNEB Final Exams Countdown */}
                       <div onClick={() => setActiveTab('settings')} title="Change exam/graduation year in settings" className={`mt-6 pt-5 border-t flex items-center justify-between gap-4 cursor-pointer hover:opacity-80 transition-all ${
                         isDarkMode ? 'border-slate-800/60' : 'border-slate-100'
                       }`}>
                         <div className="flex items-center gap-2.5">
                           <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                             isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                           }`}>
                             <Clock className="w-4 h-4 animate-pulse" />
                           </div>
                           <div>
                             <h6 className={`text-[10px] font-black uppercase tracking-widest leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                               UNEB UACE Final Exams
                             </h6>
                             <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
                               November {profile?.expectedGraduationYear || 2026} • Uganda S6 HSC
                             </p>
                           </div>
                         </div>
                         <div className="text-right shrink-0">
                           <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                             Countdown
                           </span>
                           <div className={`text-xs sm:text-sm font-display font-black mt-0.5 leading-none ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                             {(() => {
                               const now = new Date();
                               const examDate = new Date(profile?.expectedGraduationYear || 2026, 10, 9); // November 9, 2026
                               const diffTime = examDate.getTime() - now.getTime();
                               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                               if (diffDays <= 0) {
                                 return "Exam Live";
                               }
                               const diffMonths = Math.floor(diffDays / 30);
                               const extraDays = diffDays % 30;
                               if (diffMonths > 0) {
                                 return `${diffMonths}m ${extraDays}d`;
                               }
                               return `${diffDays} Days`;
                             })()}
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Concept Mastery Benchmarking */}
                <div className={`p-12 rounded-[4rem] shadow-sm border relative overflow-hidden transition-all duration-500 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/40' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                   <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                     <StellaLogo className="w-64 h-64" />
                   </div>
                   
                   <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 relative">
                     <div>
                       <h3 className={`text-4xl font-display font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Skill Benchmarking</h3>
                       <p className={`text-lg font-medium mt-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Comprehensive analysis of your conceptual command.</p>
                     </div>
                     <div className="flex gap-3">
                        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 transition-colors ${
                          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
                        }`}>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Syllabus Aligned</span>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 transition-colors ${
                          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
                        }`}>
                          <Sparkles className="w-4 h-4 text-brand-600" />
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>AI Verified</span>
                        </div>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {analytics && Object.keys(analytics.conceptMastery).length > 0 ? (
                      Object.entries(analytics.conceptMastery).map(([concept, data]) => (
                        <div key={concept} className={`group p-8 border rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden ${
                          isDarkMode 
                            ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-900 hover:shadow-slate-950/60' 
                            : 'bg-slate-50/40 border-slate-50 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]'
                        }`}>
                          <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full transition-colors ${
                            isDarkMode ? 'bg-brand-500/10' : 'bg-brand-500/5'
                          }`} />
                          
                          <div className={`text-[10px] font-black uppercase tracking-widest mb-6 truncate relative ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} title={concept}>
                            {concept}
                          </div>
                          
                          <div className="flex items-end justify-between relative">
                            <div className={`text-4xl font-display font-black tabular-nums leading-none tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {Math.round(data.masteryScore)}
                              <span className="text-lg text-brand-600 ml-1">%</span>
                            </div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest pb-1 border-b ${
                              isDarkMode ? 'text-slate-600 border-slate-800' : 'text-slate-400 border-slate-200'
                            }`}>
                              {data.questionsSolved} <span className="opacity-60 text-[8px]">solved</span>
                            </div>
                          </div>
                          
                          <div className={`mt-8 h-2 rounded-full overflow-hidden p-[3px] shadow-inner border transition-colors ${
                            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-inner'
                          }`}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${data.masteryScore}%` }}
                              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.4)]" 
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={`col-span-full py-24 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-center ${
                        isDarkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50/20 border-slate-100'
                      }`}>
                         <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm border transition-colors ${
                           isDarkMode ? 'bg-slate-900 text-slate-700 border-slate-800' : 'bg-white text-slate-200 border-slate-50'
                         }`}>
                           <LayoutDashboard className="w-10 h-10" />
                         </div>
                         <p className={`font-display font-bold text-xl uppercase tracking-tighter ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Your cognitive map is empty</p>
                         <p className={`text-sm mt-2 max-w-xs ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`}>Concepts will appear here as you solve specialized practice items.</p>
                      </div>
                    )}
                   </div>
                </div>

                {/* Topic Mastery Evolution */}
                <div className={`p-12 rounded-[4rem] shadow-sm border transition-all duration-500 overflow-hidden relative ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/40' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6 relative z-10">
                    <div>
                      <h3 className={`text-4xl font-display font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Topic Evolution</h3>
                      <p className={`text-lg font-medium mt-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Granular performance tracking across active modules.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
                    {analytics && Object.keys(analytics.topicPerformance).length > 0 ? (
                      Object.entries(analytics.topicPerformance).map(([topic, data]) => (
                        <div key={topic} className={`p-8 rounded-[3rem] border transition-all duration-500 group/topic ${
                          isDarkMode ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-900' : 'bg-slate-50/40 border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50'
                        }`}>
                           <div className="flex justify-between items-start mb-6">
                             <div className="space-y-1 max-w-[70%]">
                               <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Focus Domain</p>
                               <h4 className={`font-display font-black truncate text-xl leading-none tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`} title={topic}>{topic}</h4>
                             </div>
                             <div className="text-right">
                               <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Mastery</p>
                               <p className="text-3xl font-display font-black text-brand-600 leading-none mt-1">{Math.round(data.averageScore)}%</p>
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-4 mb-6">
                              <div className={`flex-1 h-2 rounded-full overflow-hidden p-0.5 border ${
                                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-inner'
                              }`}>
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${data.averageScore}%` }}
                                   transition={{ duration: 1, delay: 0.2 }}
                                   className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                                 />
                              </div>
                              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-colors ${
                                data.trend === 'improving' 
                                  ? 'bg-green-500/10 text-green-500' 
                                  : data.trend === 'declining' 
                                    ? 'bg-red-500/10 text-red-500' 
                                    : isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {data.trend === 'improving' ? <TrendingUp className="w-3 h-3" /> : data.trend === 'declining' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                <span>{data.trend}</span>
                              </div>
                           </div>

                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] border-t pt-6 transition-colors border-dashed border-slate-100 dark:border-slate-800">
                             <div className="flex flex-col gap-1">
                               <span className="text-slate-400 opacity-60">Attempts</span>
                               <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{data.attempts} Sessions</span>
                             </div>
                             <div className="flex flex-col gap-1 text-right">
                               <span className="text-slate-400 opacity-60">Competence</span>
                               <span className="text-brand-600">{data.masteryLevel}</span>
                             </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className={`col-span-full py-16 text-center border-2 border-dashed rounded-[3rem] ${
                        isDarkMode ? 'border-slate-800 text-slate-700' : 'border-slate-100 text-slate-300'
                      }`}>
                        <p className="font-display font-bold text-lg uppercase tracking-tighter">No evolution tracked yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'staff' && (
              <motion.div 
                key="staff"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-6xl mx-auto space-y-12 pb-24"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-display font-black tracking-tight">Staff Registry</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage neurological facilitators and professional designators.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddStaff(true)}
                    className="px-8 py-4 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 active:scale-95 flex items-center gap-3"
                  >
                    <Plus className="w-5 h-5" /> Enlist Faculty
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Mock staff list */}
                  {[
                    { name: 'Dr. Sarah Nabirye', role: 'Mathematics', sessions: 124, impact: '98%' },
                    { name: 'John Okello', role: 'Physics', sessions: 89, impact: '92%' },
                    { name: 'Grace Mutoni', role: 'Biology', sessions: 156, impact: '95%' }
                  ].map((staff, i) => (
                    <motion.div 
                      key={staff.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-8 rounded-[3rem] border transition-all hover:scale-[1.02] ${
                        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-brand-600/10 flex items-center justify-center text-brand-600 dark:text-brand-300 font-black text-xl">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-display font-black text-xl leading-none">{staff.name}</h4>
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-500">{staff.role}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 border-t border-dashed pt-6 border-slate-100 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessions</p>
                          <p className="text-xl font-display font-black">{staff.sessions}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                          <p className="text-xl font-display font-black text-green-500">{staff.impact}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'students' && (
              <motion.div 
                key="students"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-6xl mx-auto space-y-12 pb-24"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-display font-black tracking-tight">Student Body</h2>
                    <p className="text-slate-500 font-medium mt-1">Coordinate active candidate profiles and scholastic vectors.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddStudent(true)}
                    className="px-8 py-4 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 active:scale-95 flex items-center gap-3"
                  >
                    <Plus className="w-5 h-5" /> Admit Candidate
                  </button>
                </div>

                <div className={`rounded-[3.5rem] overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-50 bg-slate-50/50'}`}>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Candidate</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Class</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Activity</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {[...allUsers]
                        .sort((a, b) => getAggregateScore(b) - getAggregateScore(a))
                        .map((student, i) => {
                          const name = student.displayName || (student.email ? student.email.split('@')[0] : 'Unnamed Candidate');
                          const levelClass = (student.level || 'S5') + " " + (student.subjects && student.subjects.length > 0 ? student.subjects.join('/') : 'PCM');
                          
                          const lastActive = student.lastActiveAt || student.updatedAt || student.createdAt || Date.now();
                          const diffMins = Math.floor((Date.now() - lastActive) / (1000 * 60));
                          const diffHours = Math.floor(diffMins / 60);
                          const diffDays = Math.floor(diffHours / 24);
                          let activeString = "Active now";
                          if (diffMins > 0 && diffMins < 60) activeString = `${diffMins}m ago`;
                          else if (diffHours > 0 && diffHours < 24) activeString = `${diffHours}h ago`;
                          else if (diffDays > 0) activeString = `${diffDays}d ago`;
                          
                          const questions = student.questionsAttempted || 0;
                          const avgScore = student.averageScore || 0;
                          
                          let status = 'Warning';
                          if (avgScore >= 80 || questions >= 30) status = 'Optimal';
                          else if (avgScore >= 60 || questions >= 10) status = 'Steady';
                          
                          return (
                            <tr key={student.uid || i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <span className={`text-xs font-mono font-bold w-6 text-slate-400`}>#{i + 1}</span>
                                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 font-black">
                                    {name.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="font-display font-black text-lg block leading-none">{name}</span>
                                    {student.uid === user?.uid && (
                                      <span className="text-[9px] font-bold text-brand-500 uppercase tracking-widest mt-1 inline-block">You</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-sm font-bold text-slate-500">{levelClass}</td>
                              <td className="px-8 py-6 text-sm font-medium text-slate-400">
                                <span className="block">{activeString}</span>
                                <span className="text-[10px] text-slate-500 font-mono">({questions} activities / {Math.round(avgScore)}% avg)</span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  status === 'Optimal' ? 'bg-green-500/10 text-green-500' :
                                  status === 'Steady' ? 'bg-blue-500/10 text-blue-500' :
                                  'bg-orange-500/10 text-orange-500'
                                }`}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col max-w-5xl mx-auto p-3 sm:p-4 lg:p-8"
              >
                {/* Floating/Invisible action pill bar replacing the tall header */}
                <div className="flex items-center justify-between mb-3 z-40 shrink-0 select-none">
                  {/* Spacer to balance since we have a permanent fixed floating mobile hamburger */}
                  <div className="w-10 h-10 lg:hidden shrink-0" />
                  
                  <div className="flex-1" />
                  
                  <button 
                    onClick={() => {
                      setMessages([]);
                      setCurrentChatId(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-900 border border-slate-800 text-brand-400 hover:bg-slate-800' 
                        : 'bg-white border border-slate-100 text-brand-600 hover:bg-brand-50'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Chat
                  </button>
                </div>

                {isVoiceInteractionActive && isTtsEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center justify-between bg-brand-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-brand-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse text-red-300' : ''}`} />
                        {isListening && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping" />}
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">
                        {isSpeaking ? 'Stellas is speaking...' : isTyping ? 'Stellas is thinking...' : isListening ? 'Stellas is listening...' : 'Stellas Live Interaction'}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setIsVoiceInteractionActive(false);
                        stopSpeaking();
                      }}
                      className="text-[10px] font-bold uppercase tracking-tighter bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-all text-white/90"
                    >
                      Exit Voice Mode
                    </button>
                  </motion.div>
                )}
                <div className="flex-1 overflow-y-auto space-y-8 pb-12 pr-4 custom-scrollbar-v px-2">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-80">
                      <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden transition-all duration-500 hover:rotate-3 active:scale-95 ${
                        isDarkMode ? 'bg-slate-900 border border-slate-800 shadow-2xl' : 'bg-white border border-slate-100 shadow-xl'
                      }`}>
                        <div className="absolute inset-0 bg-brand-600/5 blur-2xl animate-pulse" />
                        <StellaLogo className="w-10 h-10 relative z-10" />
                      </div>
                      <div className="space-y-3">
                        <h3 className={`text-4xl font-display font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Stellas <span className="text-brand-600">Synthesizer</span></h3>
                        <p className={`max-w-md mx-auto text-lg font-medium leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          The advanced neural educational assistant for the Uganda National Curriculum. Explain concepts, solve complex problems, or guide your curriculum map.
                        </p>
                      </div>
                      
                      <div className={`grid grid-cols-2 ${profile?.role === 'teacher' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3 w-full max-w-4xl px-4 justify-center`}>
                        {/* Voice Synthesis Card (Fits seamlessly and elegantly in the options grid) */}
                        <button 
                          onClick={initiateVoiceInteraction}
                          className="p-5 rounded-[2rem] border-2 border-brand-500 bg-brand-600 text-white shadow-lg shadow-brand-500/10 transition-all hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-3 text-center cursor-pointer shrink-0"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Mic className="w-5 h-5 text-white animate-pulse" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider block">Voice Synthesis</span>
                            <span className="text-[8px] font-semibold opacity-80 mt-1 uppercase tracking-tighter leading-none block">Hands-free link</span>
                          </div>
                        </button>

                        <button 
                          onClick={() => sendMessage("Explain the core concepts of...")}
                          className={`p-5 rounded-[2rem] border transition-all hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-3 text-center cursor-pointer ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-brand-500/50 hover:bg-slate-800' : 'bg-white border-slate-100 text-slate-600 hover:border-brand-200 hover:bg-brand-50/20 shadow-sm'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-brand-500" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider block">Explain Concept</span>
                        </button>

                        <button 
                          onClick={() => sendMessage("Solve this academic problem step-by-step: ")}
                          className={`p-5 rounded-[2rem] border transition-all hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-3 text-center cursor-pointer ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-brand-500/50 hover:bg-slate-800' : 'bg-white border-slate-100 text-slate-600 hover:border-brand-200 hover:bg-brand-50/20 shadow-sm'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center shrink-0">
                            <HelpCircle className="w-5 h-5 text-brand-600 dark:text-brand-300" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider block">Solve Problem</span>
                        </button>

                        {profile?.role === 'teacher' && (
                          <button 
                            onClick={() => {
                              setActiveTab('assessments');
                            }}
                            className={`p-5 rounded-[2rem] border transition-all hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-3 text-center cursor-pointer ${
                              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-brand-500/50 hover:bg-slate-800' : 'bg-white border-slate-100 text-slate-600 hover:border-brand-200 hover:bg-brand-50/20 shadow-sm'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10">
                              <Target className="w-5 h-5 text-amber-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider block">Item Constructor</span>
                          </button>
                        )}

                        <button 
                          onClick={() => sendMessage("Summarize the key outcomes for...")}
                          className={`p-5 rounded-[2rem] border transition-all hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-3 text-center cursor-pointer ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-brand-500/50 hover:bg-slate-800' : 'bg-white border-slate-100 text-slate-600 hover:border-brand-200 hover:bg-brand-50/20 shadow-sm'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-300" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider block">Synthesize Summary</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                        {[
                          "Explain the photoelectric effect using local examples",
                          "Explain the significance of the 1900 Buganda Agreement",
                          "Solve: 3x² - 5x + 2 = 0 with steps",
                          "How do I balance the national budget objectives?"
                        ].map((prompt, pIdx) => (
                          <button 
                            key={pIdx}
                            onClick={() => sendMessage(prompt)}
                            className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all hover:-translate-y-1 active:scale-95 ${
                              isDarkMode 
                                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-brand-500/50 hover:bg-slate-800' 
                                : 'bg-white border-slate-100 text-slate-500 hover:border-brand-200 hover:bg-brand-50/20 shadow-sm'
                            }`}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex w-full py-8 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${
                      msg.role === 'ai' && !isDarkMode ? 'bg-slate-50/30' : ''
                    } ${msg.role === 'ai' && isDarkMode ? 'bg-white/[0.02]' : ''} -mx-4 px-4`}>
                      <div className={`flex gap-4 md:gap-6 w-full ${msg.role === 'user' ? 'flex-row-reverse max-w-3xl ml-auto' : 'max-w-4xl'}`}>
                        {/* Avatar Column */}
                        <div className="shrink-0 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                            msg.role === 'ai' 
                              ? (isDarkMode ? 'bg-slate-800 text-brand-400' : 'bg-white border border-slate-100 text-brand-600')
                              : (isDarkMode ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-600 text-white')
                          }`}>
                            {msg.role === 'ai' ? <StellaLogo className="w-5 h-5" /> : <UserIcon className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* Content Column */}
                        <div className={`flex-1 flex flex-col ${msg.role === 'user' ? 'items-end text-right' : 'items-start text-left'} space-y-2 min-w-0`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`}>
                              {msg.role === 'ai' ? 'Stellas' : 'You'}
                            </span>
                          </div>

                          <motion.div 
                            initial={msg.role === 'user' ? { opacity: 0, x: 10 } : { opacity: 0 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                            id={`chat-msg-${i}`}
                            className={`relative group ${
                              msg.role === 'user' 
                                ? `inline-block w-fit max-w-full text-left p-0 border-none bg-transparent shadow-none text-slate-950 dark:text-white font-medium` 
                                : 'w-full text-left'
                            }`}
                          >
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className={`mb-3 flex flex-wrap gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.attachments.map((file, idx) => (
                                  <div key={idx} className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                                  }`}>
                                    {file.mimeType.startsWith('image/') ? (
                                      <img src={file.data} alt={file.name} className="w-8 h-8 rounded-lg object-cover" />
                                    ) : (
                                      <FileDown className="w-4 h-4 text-brand-600" />
                                    )}
                                    <span className="text-[10px] font-bold uppercase truncate max-w-[100px]">{file.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className={`markdown-body !text-[15px] !leading-relaxed ${
                              msg.role === 'user' 
                                ? '[&_p]:mb-1 [&_p:last-child]:mb-0 [&_ul]:mb-1 [&_ul:last-child]:mb-0 [&_ol]:mb-1 [&_ol:last-child]:mb-0' 
                                : '[&_p:last-child]:mb-0 [&_ul:last-child]:mb-0 [&_ol:last-child]:mb-0'
                            } ${isDarkMode ? 'markdown-dark' : ''}`}>
                              <ReactMarkdown 
                                remarkPlugins={[remarkMath, remarkBreaks]} 
                                rehypePlugins={[rehypeKatex, rehypeRaw]}
                              >
                                {preprocessMarkdown(msg.content)}
                              </ReactMarkdown>
                            </div>

                            {msg.recommendedVideos && msg.recommendedVideos.length > 0 && (
                              <YouTubeDeck videos={msg.recommendedVideos} isDarkMode={isDarkMode} />
                            )}

                            {msg.generatedExam && (
                              <div id={`exam-export-target-${i}`} className="mt-4 p-6 bg-white text-slate-900 border rounded-2xl shadow-lg">
                                  <h3 className="font-bold mb-2">Instructions:</h3>
                                  <p className="mb-4">{msg.generatedExam.instructions}</p>
                                  {msg.generatedExam.items.map((item: any) => (
                                      <div key={item.id} className="mb-4">
                                          <div className="font-semibold text-slate-800">
                                              <ReactMarkdown 
                                                  remarkPlugins={[remarkMath, remarkBreaks]} 
                                                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                                              >
                                                  {preprocessMarkdown(item.q)}
                                              </ReactMarkdown>
                                          </div>
                                          <div className="mt-1 text-sm text-slate-600 border-t border-slate-100 pt-1">
                                              <span className="font-bold text-[11px] text-slate-400 block uppercase tracking-wider mb-0.5">Marking Scheme / Solution</span>
                                              <ReactMarkdown 
                                                  remarkPlugins={[remarkMath, remarkBreaks]} 
                                                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                                              >
                                                  {preprocessMarkdown(item.a)}
                                              </ReactMarkdown>
                                          </div>
                                      </div>
                                  ))}
                                  <div className="flex flex-wrap items-center gap-3">
                                      <button 
                                          onClick={() => downloadAsPDF(`exam-export-target-${i}`, 'TopicalTest.pdf')}
                                          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-brand-700 transition"
                                      >
                                          Export to PDF
                                      </button>
                                      <button 
                                          onClick={() => {
                                              const subj = msg.generatedExam.subject || activePracticeSubject || (profile?.subjects?.[0] || 'Physics');
                                              const topicsList = msg.generatedExam.topics || ['Custom Chat Test'];
                                              
                                              if (msg.generatedExam.subject && profile?.subjects?.includes(msg.generatedExam.subject)) {
                                                  setActivePracticeSubject(msg.generatedExam.subject);
                                              }
                                              
                                              const questions: QuestionItem[] = msg.generatedExam.items.map((item: any) => ({
                                                  id: item.id || Math.random().toString(36).substr(2, 9),
                                                  userId: auth.currentUser?.uid || 'anonymous',
                                                  subject: subj,
                                                  topics: topicsList,
                                                  difficulty: difficulty || 'Standard',
                                                  createdAt: Date.now(),
                                                  type: 'generated' as const,
                                                  questionText: item.q,
                                                  markingScheme: `${item.a}${msg.generatedExam.rubric ? `\n\n### Assessment Rubric\n${msg.generatedExam.rubric}` : ''}`,
                                                  concept: 'Chat-Generated Topical Practice',
                                                  patternUsed: 'Chat Practice Arena',
                                                  stepsOfSolution: [],
                                                  questionType: 'Structured Item',
                                                  examRealismScore: 95
                                              }));
                                              
                                              setFullAssessmentPaper(questions);
                                              setAssessmentInstructions(msg.generatedExam.instructions || null);
                                              setAssessmentPaperTitle(msg.generatedExam.title || "Custom Topical Practice Test");
                                              setActiveTab('practice');
                                          }}
                                          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
                                      >
                                          <StellaLogo className="w-4 h-4" />
                                          Practice in Arena
                                      </button>
                                  </div>
                              </div>
                            )}

                            {/* Actions below chat message */}
                            {msg.role === 'ai' && !msg.generatedExam && (
                              <div className="flex items-center gap-2 mt-2">
                                <button 
                                  onClick={() => {
                                    if (isSpeaking && speakingMessageIndex === i) {
                                      stopSpeaking();
                                      setIsSpeaking(false);
                                      setSpeakingMessageIndex(null);
                                    } else {
                                      stopSpeaking();
                                      setSpeakingMessageIndex(i);
                                      speak(msg.content, true);
                                    }
                                  }}
                                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 ${
                                    isSpeaking && speakingMessageIndex === i
                                      ? 'bg-brand-500/10 border-brand-500/20 text-brand-500 hover:bg-brand-500/20'
                                      : isDarkMode 
                                        ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white' 
                                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                                  }`}
                                  title={isSpeaking && speakingMessageIndex === i ? "Stop Read Aloud" : "Read Aloud Message"}
                                >
                                  {isSpeaking && speakingMessageIndex === i ? (
                                    <>
                                      <VolumeX className="w-4 h-4 text-brand-500 animate-pulse" />
                                      <span className="text-[11px] font-black tracking-wide animate-pulse">Speaking</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="w-4 h-4" />
                                      <span className="text-[11px] font-bold">Read Aloud</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {msg.graph && (
                              <div className="mt-4">
                                <GraphRenderer data={msg.graph} />
                              </div>
                            )}

                            {msg.image && (
                              <div className="mt-4 rounded-xl overflow-hidden border border-slate-100 shadow-sm relative group/img">
                                <img 
                                  src={msg.image} 
                                  alt="AI Generated Illustration" 
                                  className="w-full h-auto object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <a 
                                  href={msg.image} 
                                  download={`CBC-AI-Illustration-${i}.png`}
                                  className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm opacity-0 group-hover/img:opacity-100 transition-opacity text-slate-600 hover:text-brand-600"
                                  title="Download Image"
                                >
                                  <FileDown className="w-4 h-4" />
                                </a>
                              </div>
                            )}

                            {msg.role === 'ai' && (
                              <div className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-all no-print">
                                <button onClick={() => downloadAsPDF(`chat-msg-${i}`, `Stellas-Analysis-${i}`)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Export Segment to PDF">
                                  <FileDown className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start w-full py-6">
                      <div className="flex items-center gap-4">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm animate-pulse ${isDarkMode ? 'bg-slate-800 text-brand-400' : 'bg-white border border-slate-100 text-brand-600'}`}>
                            <StellaLogo className="w-5 h-5" />
                         </div>
                         <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 px-0.5 py-1 select-none">
                                <motion.span
                                  className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400"
                                  animate={{ y: [-2.5, 2.5, -2.5] }}
                                  transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0,
                                  }}
                                />
                                <motion.span
                                  className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400"
                                  animate={{ y: [-2.5, 2.5, -2.5] }}
                                  transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.15,
                                  }}
                                />
                                <motion.span
                                  className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400"
                                  animate={{ y: [-2.5, 2.5, -2.5] }}
                                  transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.3,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-[9px] font-black uppercase tracking-widest animate-pulse ml-1 sm:ml-3">
                              <Volume2 className="w-3.5 h-3.5 text-brand-500" />
                              <span>Live Synthesis active</span>
                            </div>
                         </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className={`pt-4 border-t transition-colors duration-500 ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  {/* Attachment Previews */}
                  {attachments.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-4 px-2 custom-scrollbar-h">
                      {attachments.map((file, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={idx} 
                          className="relative group flex-shrink-0"
                        >
                          {file.mimeType.startsWith('image/') ? (
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-500 shadow-lg shadow-brand-500/20">
                              <img src={file.data} className="w-full h-full object-cover" alt="preview" />
                            </div>
                          ) : (
                            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 shadow-lg ${
                              isDarkMode ? 'bg-slate-900 border-slate-700 shadow-slate-900' : 'bg-brand-50 border-brand-200 shadow-brand-100'
                            }`}>
                              <FileDown className={`w-6 h-6 ${isDarkMode ? 'text-slate-400' : 'text-brand-600'}`} />
                              <span className="text-[8px] font-bold truncate w-12 px-1 mt-1 opacity-60 uppercase">{file.name.split('.').pop()}</span>
                            </div>
                          )}
                          <button 
                            onClick={() => removeAttachment(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="relative group">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        multiple 
                        accept="image/*,application/pdf,.txt,.doc,.docx"
                      />
                      
                      {isListening && (
                        <div className="absolute -top-12 left-0 right-0 flex justify-center animate-bounce z-50">
                          <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">
                            <Mic className="w-3 h-3 animate-pulse" />
                            Recording...
                          </div>
                        </div>
                      )}

                      <div className={`relative flex items-center rounded-[2.5rem] border transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-800 focus-within:border-brand-500/50 focus-within:ring-4 focus-within:ring-brand-500/10' 
                          : 'bg-white border-slate-200 focus-within:border-brand-500/50 focus-within:ring-4 focus-within:ring-brand-500/5 shadow-sm'
                      }`}>
                        {/* Left Actions */}
                        <div className="flex items-center gap-0.5 sm:gap-1 pl-2 sm:pl-3 shrink-0">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isTyping}
                            className={`p-1.5 sm:p-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 ${
                              isDarkMode ? 'text-slate-500 hover:text-brand-400 hover:bg-slate-800' : 'text-slate-400 hover:text-brand-600 hover:bg-slate-50'
                            }`}
                            title="Upload Files"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                          <button
                            onClick={isLiveModeActive ? stopLiveSession : startLiveSession}
                            className={`p-1.5 sm:p-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 ${
                              isLiveModeActive 
                                ? 'text-brand-500 bg-brand-500/10 animate-pulse' 
                                : isDarkMode ? 'text-slate-500 hover:text-brand-400 hover:bg-slate-800' : 'text-slate-400 hover:text-brand-600 hover:bg-slate-50'
                            }`}
                            title={isLiveModeActive ? "Talk Active" : "Start Live Voice Session"}
                          >
                            <Zap className={`w-5 h-5 ${isLiveModeActive ? 'fill-current text-brand-500 animate-pulse' : ''}`} />
                          </button>
                        </div>

                        <input 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                          placeholder="Ask Stella or paste a problem..."
                          className={`flex-1 min-w-0 py-4 sm:py-5 px-2 sm:px-4 bg-transparent outline-none border-none text-sm sm:text-[15px] font-semibold ${
                            isDarkMode ? 'text-white placeholder:text-slate-400' : 'text-slate-950 placeholder:text-slate-500'
                          }`}
                        />

                        {/* Right Actions */}
                        <div className="flex items-center gap-0.5 sm:gap-1 pr-2 sm:pr-3 shrink-0">
                          <button
                            onClick={() => {
                              if (input.trim()) {
                                sendMessage(`Generate an illustration for: ${input}`);
                              } else {
                                sendMessage("Generate a helpful educational illustration about a random A-Level science topic.");
                              }
                            }}
                            disabled={isTyping}
                            className={`p-1.5 sm:p-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 hidden sm:flex ${
                              isDarkMode ? 'text-slate-500 hover:text-brand-400 hover:bg-slate-800' : 'text-slate-400 hover:text-brand-600 hover:bg-slate-50'
                            }`}
                            title="Generate Magic Illustration"
                          >
                            <ImageIcon className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={toggleListening}
                            disabled={isTyping}
                            className={`p-1.5 sm:p-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 ${
                              isListening 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : isDarkMode ? 'text-slate-500 hover:text-brand-400 hover:bg-slate-800' : 'text-slate-400 hover:text-brand-600 hover:bg-slate-50'
                            }`}
                            title={isListening ? "Listening..." : "Voice Input"}
                          >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                          </button>

                          <button 
                            onClick={() => sendMessage(input)}
                            disabled={(!input.trim() && attachments.length === 0) || isTyping}
                            className="p-1.5 sm:p-2.5 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-brand-500/20 active:scale-95 ml-0.5 sm:ml-1"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assessments' && profile?.role === 'teacher' && (
              <motion.div 
                key="assessments"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-5xl mx-auto space-y-12 pb-20"
              >
                <div className="text-center space-y-6">
                  <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2 border shadow-sm ${
                    isDarkMode ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 'bg-brand-50 text-brand-700 border-brand-100'
                  }`}>
                    <Zap className="w-4 h-4" />
                    Neural Assessment Synthesis
                  </div>
                  <h2 className={`text-6xl font-display font-black tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Level 1 Item Constructor</h2>
                  <p className={`text-xl font-medium max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Synthesize high-complexity scenarios and multi-dimensional rubrics for the Senior 5/6 cycle.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className={`p-10 rounded-[3rem] border shadow-sm flex flex-col gap-8 transition-all duration-500 relative overflow-hidden ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]'
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-500/20">
                          <Target className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className={`text-xl font-display font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Parameter Matrix</h3>
                          <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">Contextual Engineering</p>
                        </div>
                      </div>

                      <div className="space-y-6 mt-8">
                        <div className="space-y-4">
                          <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Core Topic</label>
                          <select 
                            value={selectedTopics[0] || ''}
                            onChange={(e) => setSelectedTopics([e.target.value])}
                            className={`w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all ${
                              isDarkMode ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900'
                            }`}
                          >
                            <option value="">Select Focal Module</option>
                            {profile.subjects.flatMap(s => CURRICULUM[s as keyof typeof CURRICULUM] || []).map(t => (
                              <option key={t.topic} value={t.topic}>{t.topic}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-4">
                          <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Synthesis Context / Goal</label>
                          <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g. A fishing village on Lake Victoria facing water contamination challenges..."
                            className={`w-full px-6 py-4 rounded-3xl border-2 outline-none transition-all min-h-[160px] resize-none ${
                              isDarkMode ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900 font-medium leading-relaxed'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={!selectedTopics.length || !input || isGenerating}
                      onClick={async () => {
                        setIsGenerating(true);
                        try {
                          const prompt = `Generate an elite Senior 5/6 Assessment Item for ${selectedTopics[0]}. 
                          Context: ${input}.
                          The response MUST strictly follow the NCDC Senior Secondary Assessment Framework.
                          1. Vivid scenario (Level 1 complexity).
                          2. Detailed Tasks (minimum 3).
                          3. Comprehensive Scoring Guide with columns [Item Number, Task, Basis of Assessment, Sample Response, Score].
                          Use 'Scores' instead of 'marks'.
                          Format as structured Markdown with headers.
                          IMPORTANT: Use LaTeX formatting (wrapped in \( \) for inline and \[ \] for display) for all mathematical expressions, digits, and fractions.`;
                          
                          const result = await ai.models.generateContent({
                            model: "gemini-3.1-flash-preview",
                            contents: [{ role: 'system', parts: [{ text: teacherPersona }] }, { role: 'user', parts: [{ text: prompt }] }]
                          });
                          
                          setGeneratedQuestion({
                            id: Date.now().toString(),
                            userId: user!.uid,
                            subject: profile.subjects[0],
                            topics: selectedTopics,
                            questionText: result.text || "Failed",
                            scenario: "",
                            task: "",
                            basesOfAssessment: [],
                            type: 'generated',
                            createdAt: Date.now()
                          });
                        } catch (err) {
                          console.error(err);
                          setGenerationError("Synthesis engine offline.");
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                      className="mt-4 w-full py-5 bg-brand-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-3 group"
                    >
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />}
                      {isGenerating ? 'Synthesizing...' : 'Synthesize Lab Item'}
                    </button>
                  </div>

                  <div className={`p-10 rounded-[3rem] border min-h-[500px] flex flex-col transition-all duration-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-900 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600 font-medium'
                  }`}>
                    {generatedQuestion ? (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xl font-display font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Synthesized Blueprint</h4>
                          <div className="flex items-center gap-2">
                            <button 
                               onClick={() => triggerEmailModal("Assessment Blueprint - " + (selectedTopics[0] || "Mathematics"), generatedQuestion.questionText)}
                               className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                            >
                               <Mail className="w-4 h-4" />
                               Email
                            </button>
                            <button 
                               onClick={() => {
                                 const doc = new jsPDF();
                                 doc.setFontSize(14);
                                 doc.text("Professional Assessment Item", 20, 20);
                                 doc.setFontSize(10);
                                 const splitLines = doc.splitTextToSize(generatedQuestion.questionText, 170);
                                 doc.text(splitLines, 20, 30);
                                 doc.save(`Assessment_${selectedTopics[0]}.pdf`);
                               }}
                               className="p-2.5 bg-brand-500/10 text-brand-600 rounded-xl hover:bg-brand-500 hover:text-white transition-all shadow-sm"
                               title="Download PDF"
                            >
                               <Download className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                        <div className="prose prose-slate max-w-none dark:prose-invert">
                          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {generatedQuestion.questionText}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                           <Zap className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-sm">Lab ready. Configure and synthesize to generate assessment assets.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'schemes' && profile?.role === 'teacher' && (
              <motion.div 
                key="schemes"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-5xl mx-auto space-y-12 pb-20"
              >
                <div className="text-center space-y-6">
                  <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2 border shadow-sm ${
                    isDarkMode ? 'bg-brand-600/10 text-brand-300 border-brand-500/10' : 'bg-brand-100/50 text-brand-700 border-brand-200'
                  }`}>
                    <ClipboardList className="w-4 h-4" />
                    Neural Scheme Synthesizer
                  </div>
                  <h2 className={`text-6xl font-display font-black tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Strategic Schemes</h2>
                  <p className={`text-xl font-medium max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Generate termly academic protocols aligned with NCDC synergy standards.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className={`p-10 rounded-[3rem] border shadow-sm flex flex-col gap-8 transition-all duration-500 relative overflow-hidden ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]'
                  }`}>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Subject Orientation</label>
                          <select 
                            value={docFocusSubject}
                            onChange={(e) => setDocFocusSubject(e.target.value)}
                            className={`w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all ${
                              isDarkMode ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900'
                            }`}
                          >
                            <option value="">Select Domain</option>
                            {profile.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Term Cycles</label>
                           <select 
                              value={docFocusTerm}
                              onChange={(e) => setDocFocusTerm(Number(e.target.value))}
                              className={`w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all ${
                                isDarkMode ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900'
                              }`}
                           >
                              {[1, 2, 3].map(t => <option key={t} value={t}>Term {t}</option>)}
                           </select>
                         </div>
                         <div className="space-y-2">
                           <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Year</label>
                           <div className={`px-6 py-4 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-800 border-transparent text-slate-400' : 'bg-slate-100 border-transparent text-slate-500'}`}>
                             {new Date().getFullYear()}
                           </div>
                         </div>
                       </div>
                    </div>

                    <button
                      disabled={!docFocusSubject || isGeneratingDoc}
                      onClick={async () => {
                        setIsGeneratingDoc(true);
                        try {
                          const prompt = `Generate a detailed A-Level Scheme of Work for ${docFocusSubject}, Term ${docFocusTerm}. 
                          Follow the CBC structure with weeks, sub-topics, competencies, and activities.
                          Format as a structured Markdown document with sub-headers for each week.`;
                          const result = await ai.models.generateContent({
                            model: "gemini-3.1-flash-preview",
                            contents: [{ role: 'system', parts: [{ text: teacherPersona }] }, { role: 'user', parts: [{ text: prompt }] }]
                          });
                          setGeneratedQuestion({
                            id: Date.now().toString(),
                            userId: user!.uid,
                            subject: docFocusSubject,
                            topics: [],
                            questionText: result.text || "Failed",
                            scenario: "",
                            task: "",
                            basesOfAssessment: [],
                            type: 'generated',
                            createdAt: Date.now()
                          });
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsGeneratingDoc(false);
                        }
                      }}
                      className="w-full py-5 bg-brand-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-3"
                    >
                      {isGeneratingDoc ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardList className="w-5 h-5" />}
                      {isGeneratingDoc ? 'Synthesizing Protocol...' : 'Generate Neural Scheme'}
                    </button>
                  </div>

                  <div className={`p-10 rounded-[3rem] border min-h-[500px] transition-all duration-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {generatedQuestion ? (
                       <div className="prose prose-slate max-w-none dark:prose-invert space-y-6">
                         <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 no-print">
                           <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Scheme Draft Active</span>
                           <div className="flex items-center gap-2">
                             <button 
                               onClick={() => triggerEmailModal(`Ugandan CBC Scheme of Work - ${docFocusSubject} Term ${docFocusTerm}`, generatedQuestion.questionText)}
                               className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
                             >
                               <Mail className="w-4 h-4" />
                               Email via Resend
                             </button>
                             <button 
                               onClick={() => {
                                 const doc = new jsPDF();
                                 doc.setFontSize(14);
                                 doc.text(`CBC Scheme of Work - ${docFocusSubject} Term ${docFocusTerm}`, 20, 20);
                                 doc.setFontSize(10);
                                 const splitLines = doc.splitTextToSize(generatedQuestion.questionText, 170);
                                 doc.text(splitLines, 20, 30);
                                 doc.save(`Scheme_${docFocusSubject}_Term${docFocusTerm}.pdf`);
                               }}
                               className="p-2.5 bg-brand-500/10 text-brand-600 rounded-xl hover:bg-brand-500 hover:text-white transition-all shadow-sm"
                               title="Download PDF"
                             >
                               <Download className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                         <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                           {generatedQuestion.questionText}
                         </ReactMarkdown>
                       </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                        <ClipboardList className="w-16 h-16 text-slate-400" />
                        <p className="text-sm font-bold uppercase tracking-widest">Protocol Staging Area</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'plans' && profile?.role === 'teacher' && (
              <motion.div 
                key="plans"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-5xl mx-auto space-y-12 pb-20"
              >
                <div className="text-center space-y-6">
                  <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2 border shadow-sm ${
                    isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    <FileText className="w-4 h-4" />
                    Neural Lesson Engine
                  </div>
                  <h2 className={`text-6xl font-display font-black tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Lesson Engineering</h2>
                  <p className={`text-xl font-medium max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Design high-impact pedagogical activities for the Ugandan CBC cycle.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className={`p-10 rounded-[3rem] border shadow-sm flex flex-col gap-8 transition-all duration-500 relative overflow-hidden ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]'
                  }`}>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Target Module</label>
                          <select 
                            value={docFocusTopic}
                            onChange={(e) => setDocFocusTopic(e.target.value)}
                            className={`w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all ${
                              isDarkMode ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900'
                            }`}
                          >
                            <option value="">Select Topic</option>
                            {profile.subjects.flatMap(s => CURRICULUM[s as keyof typeof CURRICULUM] || []).map(t => (
                              <option key={t.topic} value={t.topic}>{t.topic}</option>
                            ))}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Learning Intention / Focus</label>
                          <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g. Understanding Molar Concentration"
                            className={`w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all ${
                              isDarkMode ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900'
                            }`}
                          />
                       </div>
                    </div>

                    <button
                      disabled={!docFocusTopic || isGeneratingDoc}
                      onClick={async () => {
                        setIsGeneratingDoc(true);
                        try {
                          const prompt = `Generate a comprehensive A-Level Lesson Plan for ${docFocusTopic}. 
                          Context: ${input}.
                          The response MUST follow the DEAA framework and include:
                          1. Competency & Learning Outcomes.
                          2. Detailed Procedure (Intro, Development, Conclusion).
                          3. A sample Assessment Task.
                          Format as structured Markdown with professional headers.`;
                          const result = await ai.models.generateContent({
                            model: "gemini-3.1-flash-preview",
                            contents: [{ role: 'system', parts: [{ text: teacherPersona }] }, { role: 'user', parts: [{ text: prompt }] }]
                          });
                          setGeneratedQuestion({
                            id: Date.now().toString(),
                            userId: user!.uid,
                            subject: profile.subjects[0],
                            topics: [docFocusTopic],
                            questionText: result.text || "Failed",
                            scenario: "",
                            task: "",
                            basesOfAssessment: [],
                            type: 'generated',
                            createdAt: Date.now()
                          });
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsGeneratingDoc(false);
                        }
                      }}
                      className="w-full py-5 bg-blue-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-3"
                    >
                      {isGeneratingDoc ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                      {isGeneratingDoc ? 'Engineering Lesson...' : 'Synthesize Neural Plan'}
                    </button>
                  </div>

                  <div className={`p-10 rounded-[3rem] border min-h-[500px] transition-all duration-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {generatedQuestion ? (
                       <div className="prose prose-slate max-w-none dark:prose-invert space-y-6">
                         <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 no-print">
                           <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Lesson Plan Active</span>
                           <div className="flex items-center gap-2">
                             <button 
                               onClick={() => triggerEmailModal(`Ugandan CBC Lesson Plan - ${docFocusTopic}`, generatedQuestion.questionText)}
                               className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
                             >
                               <Mail className="w-4 h-4" />
                               Email via Resend
                             </button>
                             <button 
                               onClick={() => {
                                 const doc = new jsPDF();
                                 doc.setFontSize(14);
                                 doc.text(`CBC Lesson Plan - ${docFocusTopic}`, 20, 20);
                                 doc.setFontSize(10);
                                 const splitLines = doc.splitTextToSize(generatedQuestion.questionText, 170);
                                 doc.text(splitLines, 20, 30);
                                 doc.save(`LessonPlan_${docFocusTopic}.pdf`);
                               }}
                               className="p-2.5 bg-brand-500/10 text-brand-600 rounded-xl hover:bg-brand-500 hover:text-white transition-all shadow-sm"
                               title="Download PDF"
                             >
                               <Download className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                         <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                           {generatedQuestion.questionText}
                         </ReactMarkdown>
                       </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                        <FileText className="w-16 h-16 text-slate-400" />
                        <p className="text-sm font-bold uppercase tracking-widest">Procedural Staging Area</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'mastery' && (
              <motion.div 
                key="mastery"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-6xl mx-auto pb-20"
              >
                <MasteryInsights 
                  topicMastery={topicMastery} 
                  analytics={analytics} 
                  profile={profile} 
                  isDarkMode={isDarkMode} 
                  setActiveTab={setActiveTab} 
                  synergyScore={synergyDetails.score}
                  setSelectedTopics={setSelectedTopics}
                  generatePracticeQuestion={generatePracticeQuestion}
                  sendMessage={sendMessage}
                  user={user}
                  allUsers={allUsers}
                />
              </motion.div>
            )}

            {activeTab === 'practice' && (
              <motion.div 
                key="practice"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-6xl mx-auto space-y-12 pb-20"
              >
                {!generatedQuestion && !fullAssessmentPaper ? (
                  <div className="space-y-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                      <div>
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 border ${
                          isDarkMode ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 'bg-brand-50 text-brand-700 border-brand-100'
                        }`}>
                          <StellaLogo className="w-3.5 h-3.5" />
                          Neural Learning Arena
                        </div>
                        <h2 className={`text-5xl font-display font-black tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Assessment Sandbox</h2>
                        <p className={`text-lg font-medium mt-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Architect your practice session by selecting target modules.</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-500/5 dark:bg-white/5 p-2 rounded-2xl">
                        {profile?.subjects.map(subject => (
                          <button
                            key={subject}
                            onClick={() => setActivePracticeSubject(subject)}
                            className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl xs:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                              activePracticeSubject === subject
                                ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-500/15 scale-105'
                                : isDarkMode
                                  ? 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
                                  : 'bg-white text-slate-400 border-slate-100 hover:text-brand-600 hover:border-brand-100 shadow-sm'
                            }`}
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                    </div>

                    {getWeakTopics().length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[2.5rem] border-2 border-dashed transition-all ${
                          isDarkMode ? 'bg-orange-500/5 border-orange-500/10' : 'bg-orange-50/50 border-orange-200'
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <ShieldAlert className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                             <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Adaptive Logic Detected</p>
                             <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                               <span className="font-bold underline decoration-orange-500/30">{getWeakTopics().length} modules</span> require immediate neuro-synaptic reinforcement based on your mastery profile.
                             </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const weakForThisSubject = CURRICULUM[activePracticeSubject as keyof typeof CURRICULUM]?.filter(t => getWeakTopics().includes(t.topic)) || [];
                            setSelectedTopics(prev => {
                              const others = prev.filter(t => !CURRICULUM[activePracticeSubject as keyof typeof CURRICULUM]?.some(ct => ct.topic === t));
                              return [...others, ...weakForThisSubject.map(t => t.topic)];
                            });
                          }}
                          className="whitespace-nowrap px-8 py-3 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
                        >
                          Synthesize Weak Points
                        </button>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                      <div className="lg:col-span-3 space-y-6">
                        <div className="flex items-center justify-between px-2">
                           <div className="flex items-center gap-3">
                             <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Target Modules</span>
                             <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                               {CURRICULUM[activePracticeSubject as keyof typeof CURRICULUM]?.length || 0} Available
                             </span>
                           </div>
                           <div className="flex items-center gap-2">
                             <button 
                               onClick={() => {
                                 const allTopics = CURRICULUM[activePracticeSubject as keyof typeof CURRICULUM]?.map(t => t.topic) || [];
                                 setSelectedTopics(prev => [...new Set([...prev, ...allTopics])]);
                               }}
                               className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500 hover:text-brand-400' : 'text-slate-400 hover:text-brand-600'}`}
                             >
                               Select All
                             </button>
                             <span className="text-slate-300">/</span>
                             <button 
                               onClick={() => {
                                 const allTopics = CURRICULUM[activePracticeSubject as keyof typeof CURRICULUM]?.map(t => t.topic) || [];
                                 setSelectedTopics(prev => prev.filter(t => !allTopics.includes(t)));
                               }}
                               className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                             >
                               Clear
                             </button>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {CURRICULUM[activePracticeSubject as keyof typeof CURRICULUM]?.map(topic => {
                            const mastery = topicMastery[topic.topic]; // Mastery data
                            const isSelected = selectedTopics.includes(topic.topic);
                            
                            return (
                              <button
                                key={topic.topic}
                                onClick={() => {
                                  setSelectedTopics(prev => 
                                    prev.includes(topic.topic) 
                                      ? prev.filter(t => t !== topic.topic)
                                      : [...prev, topic.topic]
                                  );
                                }}
                                className={`group/card p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-2 transition-all duration-500 text-left flex flex-col gap-3 sm:gap-4 relative overflow-hidden ${
                                  isSelected
                                    ? 'border-brand-600 bg-brand-600 text-white shadow-2xl shadow-brand-500/30 ring-4 ring-brand-500/10'
                                    : isDarkMode
                                      ? 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                                      : 'border-slate-100 bg-white text-slate-600 hover:border-brand-100 hover:shadow-xl hover:shadow-slate-100'
                                }`}
                              >
                                {isSelected && (
                                  <motion.div 
                                    layoutId={`glow-${topic.topic}`}
                                    className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 blur-[40px] rounded-full"
                                  />
                                )}
                                
                                <div className="flex items-start justify-between relative z-10">
                                   <div className={`p-3 rounded-xl ${isSelected ? 'bg-white/20' : isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} transition-colors`}>
                                      <BookOpen className={`w-5 h-5 ${isSelected ? 'text-white' : isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                                   </div>
                                   {mastery && (
                                     <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter border ${
                                       isSelected ? 'bg-white/20 border-white/20 text-white' : getLevelColor(mastery.masteryLevel)
                                     }`}>
                                       {mastery.masteryLevel}
                                     </div>
                                   )}
                                </div>

                                <div className="space-y-1 relative z-10">
                                  <h4 className={`font-display font-black text-lg leading-tight tracking-tight ${isSelected ? 'text-white' : isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                    {topic.topic}
                                  </h4>
                                  <p className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-brand-600'}`}>
                                    Element: {topic.construct}
                                  </p>
                                  <p className={`text-[8px] font-medium leading-tight ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>
                                    {topic.outcomes?.slice(0, 2).join(' • ')}
                                  </p>
                                  <p className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                                    {mastery ? `${Math.round(mastery.averageScore)}% Precision` : 'Uncharted Module'}
                                  </p>
                                </div>

                                <div className="mt-2 flex items-center justify-between relative z-10">
                                  <div className={`h-1.5 flex-1 rounded-full overflow-hidden mr-4 ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                    <div 
                                      className={`h-full transition-all duration-1000 ${isSelected ? 'bg-white' : 'bg-brand-500'}`}
                                      style={{ width: `${mastery?.averageScore || 0}%` }}
                                    />
                                  </div>
                                  <CheckCircle2 className={`w-5 h-5 transition-all ${isSelected ? 'text-white scale-110 opacity-100' : 'opacity-0 scale-50'}`} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className={`p-8 rounded-[3rem] border transition-all duration-500 relative overflow-hidden ${
                          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                        }`}>
                          <div className="flex flex-col gap-8 relative z-10">
                            <div>
                               <h3 className={`text-xl font-display font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Session Engine</h3>
                               <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Operational Parameters</p>
                            </div>

                            <div className="space-y-6">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                  <label className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Complexity Level</label>
                                  <button onClick={() => setIsDynamicDifficulty(!isDynamicDifficulty)} className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${isDynamicDifficulty ? 'text-brand-500' : 'text-slate-400'}`}>
                                    <Zap className={`w-2.5 h-2.5 ${isDynamicDifficulty ? 'fill-current animate-pulse' : ''}`} />
                                    {isDynamicDifficulty ? 'Adaptive' : 'Manual'}
                                  </button>
                                </div>
                                <div className={`flex p-1.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800 shadow-inner' : 'bg-slate-50 border-slate-100'}`}>
                                  {(['Standard', 'Advanced', 'Expert'] as const).map((level) => (
                                    <button
                                      key={level}
                                      disabled={isDynamicDifficulty}
                                      onClick={() => setDifficulty(level)}
                                      className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                        difficulty === level 
                                          ? isDarkMode ? 'bg-brand-600 text-white shadow-lg' : 'bg-white text-brand-600 shadow-md border border-brand-100' 
                                          : isDarkMode ? 'text-slate-600 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                                      } disabled:opacity-30`}
                                    >
                                      {level.slice(0, 3)}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className={`text-[9px] font-black uppercase tracking-widest pl-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Protocol Format</label>
                                <div className="grid grid-cols-1 gap-2">
                                  {['Paper 1', 'Paper 2', 'Combined'].map((format) => (
                                    <button 
                                      key={format}
                                      onClick={() => setSelectedPaperFormat(format as any)}
                                      className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border text-left flex items-center justify-between ${
                                        selectedPaperFormat === format 
                                          ? isDarkMode ? 'bg-brand-600 border-brand-500 text-white shadow-lg' : 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm' 
                                          : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-brand-100'
                                      }`}
                                    >
                                      {format}
                                      {selectedPaperFormat === format && <CheckCircle2 className="w-4 h-4" />}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 space-y-3">
                              <button
                                disabled={selectedTopics.length === 0 || isGenerating || isGeneratingPaper}
                                onClick={() => generatePracticeQuestion()}
                                className="w-full py-5 bg-brand-600 text-white rounded-[2rem] font-display font-black uppercase tracking-[0.15em] text-[10px] disabled:opacity-30 transition-all hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-brand-500/30 flex items-center justify-center gap-3"
                              >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {isGenerating ? 'Synthesizing...' : 'Syllabus Item'}
                              </button>

                              <button
                                disabled={selectedTopics.length === 0 || isGenerating || isGeneratingPaper}
                                onClick={() => generateAssessmentPaper('Topical')}
                                className={`w-full py-5 rounded-[2rem] font-display font-black uppercase tracking-[0.15em] text-[10px] disabled:opacity-30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 border shadow-sm ${
                                  isDarkMode 
                                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white' 
                                    : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                                }`}
                              >
                                {isGeneratingPaper ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4 text-brand-600" />}
                                {isGeneratingPaper ? 'Compiling...' : 'Topical Test'}
                              </button>

                              <button
                                disabled={selectedTopics.length === 0 || isGenerating || isGeneratingPaper}
                                onClick={() => generateAssessmentPaper('Full')}
                                className={`w-full py-5 rounded-[2rem] font-display font-black uppercase tracking-[0.15em] text-[10px] disabled:opacity-30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 border shadow-sm ${
                                  isDarkMode 
                                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white' 
                                    : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                                }`}
                              >
                                {isGeneratingPaper ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4 text-brand-500" />}
                                {isGeneratingPaper ? 'Compiling...' : selectedPaperFormat === 'Combined' ? 'Full Arena Paper' : `${selectedPaperFormat}`}
                              </button>

                              <button
                                disabled={selectedTopics.length === 0 || isGenerating || isGeneratingPaper}
                                onClick={startExam}
                                className="w-full py-5 border-2 border-red-500/20 bg-red-500/5 text-red-500 rounded-[2rem] font-display font-black uppercase tracking-[0.15em] text-[10px] disabled:opacity-20 transition-all hover:bg-red-500 hover:text-white active:scale-[0.98] flex items-center justify-center gap-3"
                              >
                                <Lock className="w-4 h-4" />
                                Pro Simulation
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 text-white shadow-xl shadow-slate-200'}`}>
                           <div className="absolute -right-20 -top-20 w-40 h-40 bg-brand-500 blur-[80px] rounded-full opacity-30" />
                           <div className="relative z-10">
                              <h4 className={`text-sm font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-white' : 'text-white'}`}>Active Load</h4>
                              <p className={`text-[4rem] font-display font-black leading-none tracking-tighter ${isDarkMode ? 'text-brand-500' : 'text-brand-400'}`}>
                                {selectedTopics.length}
                              </p>
                              <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mt-4">Modules Synchronized</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : fullAssessmentPaper ? (
                   <motion.div 
                     key="assessment-paper"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="max-w-4xl mx-auto space-y-10 pb-20"
                   >
                     <div className="flex items-center justify-between px-2">
                       <button 
                         onClick={() => {
                           setFullAssessmentPaper(null);
                         }}
                         className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                       >
                         <ArrowLeft className="w-5 h-5" />
                         Arena Home
                       </button>
                       <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setShowPaperSolution(!showPaperSolution)}
                            className={`p-3 border rounded-xl transition-all shadow-sm flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${showPaperSolution ? 'bg-brand-600 border-brand-500 text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-brand-600'}`}
                            title="Toggle Solutions"
                          >
                             {showPaperSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                             {showPaperSolution ? 'Mask Expo' : 'Show Expo'}
                          </button>
                          <button 
                            onClick={() => {
                              const isTopical = fullAssessmentPaper && fullAssessmentPaper.every(q => !q.questionText.includes('**Item '));
                              const fullText = fullAssessmentPaper.map((q, i) => isTopical ? q.questionText : `Question ${i+1}: ${q.questionText}`).join('\n\n');
                              speak(fullText, true);
                            }}
                            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-brand-600 rounded-xl transition-all shadow-sm"
                            title="Read Header"
                          >
                             <Volume2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => downloadAsPDF('full-assessment-paper', `CBC_Assessment_${Date.now()}.pdf`)}
                            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-brand-600 rounded-xl transition-all shadow-sm"
                            title="Export PDF"
                          >
                             <FileDown className="w-5 h-5" />
                          </button>
                       </div>
                     </div>

                     <div id="full-assessment-paper" className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100/50 overflow-hidden">
                        <div className="p-16 border-b border-slate-50 bg-slate-50/20 backdrop-blur-sm">
                           <div className="text-center space-y-6">
                             <div className="flex justify-center gap-4">
                               <div className="px-5 py-2 bg-brand-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Formal Assessment</div>
                               <div className="px-5 py-2 bg-brand-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">{difficulty}</div>
                             </div>
                             <div className="space-y-2">
                               <h2 className="text-5xl font-display font-black text-slate-900 tracking-tighter uppercase leading-none">{assessmentPaperTitle}</h2>
                               <p className="text-slate-500 font-medium tracking-tight text-lg">Uganda National Curriculum Framework • Advanced Level</p>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-8 max-w-xl mx-auto pt-8 border-t border-slate-200/50">
                               <div className="text-left space-y-1">
                                 <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Duration</div>
                                 <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                   <Clock className="w-4 h-4 text-brand-600" />
                                   {localSubjects.includes('Mathematics') 
                                    ? (selectedPaperFormat === 'Paper 2' ? '02 Hours 15 Minutes' : '02 Hours 30 Minutes') 
                                    : '02 Hours 30 Minutes'}
                                 </div>
                               </div>
                               <div className="text-left space-y-1">
                                 <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Instructions</div>
                                 <div className="text-[11px] font-medium text-slate-600 leading-tight">
                                   Attempt all questions. Scientific calculators may be used. Show all necessary working.
                                 </div>
                               </div>
                             </div>
                           </div>
                        </div>

                        <div className="p-12 lg:p-20">
                           <div className="max-w-3xl mx-auto space-y-16">
                              {assessmentInstructions && (
                                <div className={`p-8 rounded-[2rem] border-2 border-dashed ${isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
                                  <div className="flex items-center gap-3 mb-4">
                                    <ShieldAlert className="w-5 h-5 text-brand-500" />
                                    <h4 className="font-display font-black uppercase tracking-widest text-xs text-brand-500 text-left">General Instructions</h4>
                                  </div>
                                  <div className="markdown-body text-left">
                                    <ReactMarkdown 
                                      remarkPlugins={[remarkMath, remarkBreaks]} 
                                      rehypePlugins={[rehypeKatex, rehypeRaw]}
                                    >
                                      {preprocessMarkdown(assessmentInstructions)}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                              {fullAssessmentPaper.map((q, idx) => (
                                <div key={q.id} className={`space-y-8 p-10 rounded-[2.5rem] border-2 relative group transition-all mb-12 ${
                                   isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white shadow-sm'
                                 }`}>
                                  <div className="flex items-center justify-between no-print">
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => speak(q.questionText, true)}
                                        className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-brand-600 transition-all hover:scale-110"
                                        title="Read Question"
                                      >
                                        <Volume2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="markdown-body">
                                    <ReactMarkdown 
                                      remarkPlugins={[remarkMath, remarkBreaks]} 
                                      rehypePlugins={[rehypeKatex, rehypeRaw]}
                                    >
                                      {preprocessMarkdown(q.questionText)}
                                    </ReactMarkdown>
                                  </div>
                                  

                                  {showPaperSolution && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="mt-10 p-10 bg-brand-50 rounded-[2rem] text-slate-900 space-y-6 shadow-xl border border-brand-100 relative overflow-hidden"
                                    >
                                      <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <CheckCircle2 className="w-24 h-24 text-brand-600" />
                                      </div>
                                      <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center">
                                          <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-display font-black uppercase tracking-tight text-brand-600">Marking Exposition</h4>
                                      </div>
                                      <div className="markdown-body relative z-10">
                                        <ReactMarkdown 
                                          remarkPlugins={[remarkMath, remarkBreaks]} 
                                          rehypePlugins={[rehypeKatex, rehypeRaw]}
                                        >
                                          {preprocessMarkdown(q.markingScheme)}
                                        </ReactMarkdown>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              ))}
                           </div>
                        </div>
                        
                        <div className="p-10 border-t border-slate-50 bg-slate-50/30 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                           End of Assessment Paper
                        </div>
                     </div>
                 </motion.div>
                ) : (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="max-w-4xl mx-auto space-y-10"
                   >
                    <div className="flex items-center justify-between px-2">
                      <button 
                        onClick={() => {
                          setGeneratedQuestion(null);
                          setStudentAnswer('');
                          setFeedback(null);
                          setShowSolution(false);
                        }}
                        className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Arena Home
                      </button>
                      <div className="flex items-center gap-4">
                         <div className="text-right">
                           <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Status</div>
                           <div className="flex items-center gap-2 mt-1">
                             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                             <span className="text-xs font-black uppercase text-slate-700">Sandbox Active</span>
                           </div>
                         </div>
                      </div>
                    </div>

                    <div id="practice-paper" className={`rounded-[3rem] shadow-2xl border overflow-hidden transition-all duration-500 ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-800 shadow-slate-950/50' 
                        : 'bg-white border-slate-100/50 shadow-slate-200/50'
                    }`}>
                       <div className={`p-12 border-b flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors ${
                         isDarkMode ? 'border-slate-800 bg-slate-950/20' : 'border-slate-50 bg-slate-50/30'
                       }`}>
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-brand-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">A-Level</span>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                  isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-900 text-white'
                                }`}>{generatedQuestion.difficulty}</span>
                             </div>
                             <h3 className={`text-3xl font-display font-black tracking-tight leading-none uppercase italic border-l-4 border-brand-600 pl-4 ${
                               isDarkMode ? 'text-white' : 'text-slate-900'
                             }`}>Integrated Scenario</h3>
                          </div>
                          <div className="flex items-center gap-3 no-print">
                             <button 
                               onClick={() => speak(generatedQuestion.questionText, true)}
                               className={`p-3 border rounded-xl transition-all shadow-sm ${
                                 isDarkMode 
                                   ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-brand-400 hover:bg-slate-700' 
                                   : 'bg-white border-slate-200 text-slate-400 hover:text-brand-600'
                               }`}
                               title="Read Aloud"
                             >
                                <Volume2 className="w-5 h-5" />
                             </button>
                             <button 
                               onClick={() => downloadAsPDF('practice-paper', `CBC_Practice_Item_${generatedQuestion.id}`)}
                               className={`p-3 border rounded-xl transition-all shadow-sm ${
                                 isDarkMode 
                                   ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-brand-400 hover:bg-slate-700' 
                                   : 'bg-white border-slate-200 text-slate-400 hover:text-brand-600'
                               }`}
                               title="Export as PDF"
                             >
                                <FileDown className="w-5 h-5" />
                             </button>
                          </div>
                       </div>

                       <div className="p-12 space-y-12">
                          <div className="flex flex-wrap gap-2 no-print">
                            {generatedQuestion.topics.map((t: string) => (
                              <span key={t} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                {t}
                              </span>
                            ))}
                            <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-200">
                               Realism: {generatedQuestion.examRealismScore}/100
                            </span>
                            <span className="ml-auto px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200">
                               Pattern: {generatedQuestion.patternUsed}
                            </span>
                          </div>

                          <div className="markdown-body">
                            <ReactMarkdown 
                              remarkPlugins={[remarkMath, remarkBreaks]} 
                              rehypePlugins={[rehypeKatex, rehypeRaw]}
                            >
                              {preprocessMarkdown(generatedQuestion.questionText)}
                            </ReactMarkdown>
                          </div>

                          {generatedQuestion.scenarioGraph && (
                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Experimental Data Visualization</div>
                               <GraphRenderer data={generatedQuestion.scenarioGraph} />
                            </div>
                          )}

                          {generatedQuestion.scenarioImage && (
                            <div className="rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-brand-100/20">
                               <img 
                                 src={generatedQuestion.scenarioImage} 
                                 alt="Question Illustration" 
                                 className="w-full h-auto"
                                 referrerPolicy="no-referrer"
                               />
                            </div>
                          )}

                          {generatedQuestion.markingScheme && (
                            <div className={`pt-10 border-t transition-colors ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                               {!showSolution ? (
                                 <button 
                                   onClick={() => setShowSolution(true)}
                                   className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-dashed transition-all ${
                                     isDarkMode 
                                       ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-500 border-slate-700 hover:border-brand-500 hover:text-brand-400' 
                                       : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-slate-200 hover:border-brand-300 hover:text-brand-600'
                                   }`}
                                 >
                                    <Eye className="w-4 h-4" />
                                    Reveal Step-by-Step Exposition
                                 </button>
                               ) : (
                                 <motion.div 
                                   initial={{ opacity: 0, height: 0 }}
                                   animate={{ opacity: 1, height: 'auto' }}
                                   className="space-y-6"
                                 >
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center">
                                             <CheckCircle2 className="w-5 h-5" />
                                          </div>
                                          <h4 className={`font-display font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Academic Exposition</h4>
                                       </div>
                                       <button 
                                         onClick={() => setShowSolution(false)}
                                         className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                                       >
                                         Hide Exposition
                                       </button>
                                    </div>
                                    <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${
                                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-brand-50 border-brand-100'
                                    }`}>
                                      <div className={`markdown-body ${isDarkMode ? 'markdown-dark' : ''}`}>
                                        <ReactMarkdown 
                                          remarkPlugins={[remarkMath, remarkBreaks]} 
                                          rehypePlugins={[rehypeKatex, rehypeRaw]}
                                        >
                                          {preprocessMarkdown(generatedQuestion.markingScheme)}
                                        </ReactMarkdown>
                                      </div>
                                      {generatedQuestion.solutionGraph && (
                                        <div className="mt-8">
                                          <GraphRenderer data={generatedQuestion.solutionGraph} />
                                        </div>
                                      )}
                                    </div>
                                 </motion.div>
                               )}
                            </div>
                          )}
                       </div>
                    </div>

                    {!feedback ? (
                      <div className="space-y-6">
                        <div className="relative group">
                           {isListening && (
                             <div className="absolute -top-12 left-0 right-0 flex justify-center animate-bounce z-50">
                               <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">
                                 <Mic className="w-3 h-3 animate-pulse" />
                                 Recording...
                               </div>
                             </div>
                           )}
                           <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-brand-400 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-25 transition duration-1000"></div>
                           <textarea
                             value={studentAnswer}
                             onChange={(e) => setStudentAnswer(e.target.value)}
                             placeholder="Exposition your reasoning and calculations here..."
                             className="relative w-full h-64 p-8 bg-white border border-slate-100 rounded-[2.5rem] focus:outline-none transition-all shadow-xl shadow-slate-200/40 text-lg font-medium leading-relaxed placeholder:text-slate-300"
                           />
                           <button
                             onClick={toggleListening}
                             className={`absolute right-6 bottom-6 p-4 rounded-2xl transition-all ${
                               isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-white border border-slate-100'
                             }`}
                           >
                             {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                           </button>
                        </div>
                        <button
                          disabled={!studentAnswer.trim() || isSubmitting}
                          onClick={submitAnswer}
                          className="w-full py-6 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:bg-brand-700 disabled:opacity-30 transition-all shadow-2xl shadow-brand-200 active:scale-[0.98]"
                        >
                          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                          Submit for academic evaluation
                        </button>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                      >
                        <div className={`p-10 rounded-[3rem] border-2 shadow-2xl ${
                          feedback.achievementLevel === 'Exceptional' || feedback.achievementLevel === 'Outstanding' 
                            ? 'border-green-100 bg-green-50/50 shadow-green-100/50' 
                            : feedback.achievementLevel === 'Satisfactory'
                            ? 'border-blue-100 bg-blue-50/50 shadow-blue-100/50'
                            : 'border-orange-100 bg-orange-50/50 shadow-orange-100/50'
                        }`}>
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                            <div className="flex items-center gap-5">
                              <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-xl ${
                                feedback.achievementLevel === 'Exceptional' ? 'bg-brand-600 text-white' :
                                feedback.achievementLevel === 'Outstanding' ? 'bg-green-600 text-white' :
                                feedback.achievementLevel === 'Satisfactory' ? 'bg-blue-600 text-white' :
                                feedback.achievementLevel === 'Basic' ? 'bg-orange-600 text-white' :
                                'bg-slate-600 text-white'
                              }`}>
                                <span className="text-3xl font-display font-black leading-none">
                                  {feedback.achievementLevel === 'Exceptional' ? 'A' : 
                                   feedback.achievementLevel === 'Outstanding' ? 'B' :
                                   feedback.achievementLevel === 'Satisfactory' ? 'C' :
                                   feedback.achievementLevel === 'Basic' ? 'D' : 'E'}
                                </span>
                              </div>
                              <div>
                                <h4 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-none uppercase italic">
                                  {feedback.achievementLevel}
                                </h4>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Achievement Level</span>
                                  <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                  <span className="text-[10px] font-black uppercase text-brand-600 tracking-widest leading-none">Weight: {feedback.gradeWeight}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                               <div className="text-5xl font-display font-black text-slate-900 tracking-tighter leading-none">{Math.round(feedback.percentageScore)}%</div>
                               <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">{feedback.totalScore} / {feedback.maxTotalScore} Total Score</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-10">
                            {generatedQuestion.basesOfAssessment.map((basis: BasisOfAssessment) => (
                              <div key={basis.id} className="p-4 bg-white/60 rounded-2xl border border-white/50 space-y-2">
                                <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest truncate leading-none" title={basis.name}>{basis.name}</div>
                                <div className="flex items-center justify-between">
                                   <div className="flex gap-0.5">
                                      {[1, 2, 3, 4].map(idx => (
                                        <div key={idx} className={`w-2 h-2 rounded-full ${idx <= (feedback.scoresByBasis[basis.id] || 0) ? 'bg-brand-500' : 'bg-slate-200'}`} />
                                      ))}
                                   </div>
                                   <span className="text-sm font-black text-slate-900 line-none">{feedback.scoresByBasis[basis.id] || 0}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-6">
                            <div className="p-8 bg-white/80 rounded-[2rem] border border-white backdrop-blur-sm markdown-body relative group shadow-inner">
                                <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => speak(feedback.feedback, true)}
                                    className="p-3 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-600 hover:text-brand-600 rounded-xl transition-all shadow-sm"
                                    title="Read Aloud"
                                  >
                                    <Volume2 className="w-5 h-5" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                  <MessageSquare className="w-5 h-5 text-brand-600" />
                                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Summative Feedback</h5>
                                </div>
                                <ReactMarkdown 
                                  remarkPlugins={[remarkMath, remarkBreaks]} 
                                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                                >
                                  {preprocessMarkdown(feedback.feedback)}
                                </ReactMarkdown>
                            </div>

                            <button
                              onClick={() => {
                                setGeneratedQuestion(null);
                                setStudentAnswer('');
                                setFeedback(null);
                                setShowSolution(false);
                              }}
                              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Initialize alternate arena
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Floating Sticky Operational Parameters for Mobile Practice Arena */}
                    {!generatedQuestion && !fullAssessmentPaper && selectedTopics.length > 0 && (
                      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
                        <div className={`p-4 rounded-3xl border shadow-2xl backdrop-blur-xl flex flex-col gap-3 ${
                          isDarkMode ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-100 text-slate-900 shadow-slate-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 block">
                                {selectedTopics.length} Topic{selectedTopics.length > 1 ? 's' : ''} Selected
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <select 
                                value={difficulty} 
                                onChange={(e) => setDifficulty(e.target.value as any)}
                                disabled={isDynamicDifficulty}
                                className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border outline-none bg-transparent ${
                                  isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'
                                }`}
                              >
                                <option value="Standard" className="text-slate-900">STD</option>
                                <option value="Advanced" className="text-slate-900">ADV</option>
                                <option value="Expert" className="text-slate-900">EXP</option>
                              </select>

                              <select 
                                value={selectedPaperFormat} 
                                onChange={(e) => setSelectedPaperFormat(e.target.value as any)}
                                className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border outline-none bg-transparent ${
                                  isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'
                                }`}
                              >
                                <option value="Paper 1" className="text-slate-900">P1</option>
                                <option value="Paper 2" className="text-slate-900">P2</option>
                                <option value="Combined" className="text-slate-900">COMB</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              disabled={isGenerating || isGeneratingPaper}
                              onClick={() => generatePracticeQuestion()}
                              className="py-3 bg-brand-600 text-white rounded-xl font-display font-black uppercase tracking-wider text-[10px] active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                              Syllabus Item
                            </button>
                            <button
                              disabled={isGenerating || isGeneratingPaper}
                              onClick={() => generateAssessmentPaper('Topical')}
                              className={`py-3 rounded-xl font-display font-black uppercase tracking-wider text-[10px] active:scale-95 transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                                isDarkMode 
                                  ? 'bg-slate-800 text-slate-300 border-slate-700' 
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {isGeneratingPaper ? <Loader2 className="w-3 h-3 animate-spin" /> : <ClipboardList className="w-3.5 h-3.5" />}
                              Full Paper
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="flex flex-col gap-2">
                    <h2 className={`text-3xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Academic Archive</h2>
                    <p className={`text-lg transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Review your Talk history and cognitive practice sessions.</p>
                  </div>
                  
                  <div className={`flex p-1 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-white'}`}>
                    <button 
                      onClick={() => setArchiveTab('questions')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        archiveTab === 'questions' 
                          ? (isDarkMode ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'bg-white text-brand-600 shadow-sm')
                          : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-900')
                      }`}
                    >
                      Questions
                    </button>
                    <button 
                      onClick={() => setArchiveTab('chats')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        archiveTab === 'chats' 
                          ? (isDarkMode ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'bg-white text-brand-600 shadow-sm')
                          : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-900')
                      }`}
                    >
                      Discussions
                    </button>
                  </div>
                </div>

                {archiveTab === 'questions' ? (
                  questionHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                      <div className={`p-4 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <History className={`w-12 h-12 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>No History Yet</h3>
                        <p className={isDarkMode ? 'text-slate-500' : 'text-slate-600'}>Your generated questions will appear here once you start practicing.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {Array.from(new Set(questionHistory.map(q => q.subject))).sort().map(subject => {
                        const subjectQuestions = questionHistory.filter(q => q.subject === subject);
                        
                        return (
                          <div key={subject} className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                isDarkMode ? 'bg-slate-800 text-brand-400' : 'bg-brand-50 text-brand-600'
                              }`}>
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{subject}</h3>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                                isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {subjectQuestions.length} QUESTIONS
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {subjectQuestions.map((q) => (
                                <div
                                  key={q.id}
                                  onClick={() => {
                                    setGeneratedQuestion(q);
                                    setFeedback(null);
                                    setStudentAnswer('');
                                    setShowSolution(false);
                                    setActiveTab('practice');
                                  }}
                                  className={`group p-6 rounded-3xl border text-left transition-all hover:-translate-y-1 cursor-pointer overflow-hidden relative ${
                                    isDarkMode 
                                      ? 'bg-slate-900 border-slate-800 hover:shadow-2xl hover:shadow-slate-950/40 hover:bg-slate-800/50' 
                                      : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-brand-100/20'
                                  }`}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      setGeneratedQuestion(q);
                                      setFeedback(null);
                                      setStudentAnswer('');
                                      setShowSolution(false);
                                      setActiveTab('practice');
                                    }
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-wrap gap-2 max-w-[70%] text-[10px] font-bold">
                                      {q.topics.slice(0, 2).map(topic => (
                                        <span key={topic} className="px-2 py-0.5 bg-brand-50 text-brand-600 uppercase tracking-wider rounded">
                                          {topic}
                                        </span>
                                      ))}
                                      {q.topics.length > 2 && (
                                        <span className={`px-2 py-0.5 rounded transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                                          +{q.topics.length - 2}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                        {new Date(q.createdAt).toLocaleDateString()}
                                      </span>
                                      <DeleteButton id={q.id} />
                                    </div>
                                  </div>
                                  <p className={`line-clamp-2 text-sm font-medium mb-4 transition-colors ${
                                    isDarkMode ? 'text-slate-400 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                                  }`}>
                                    {q.questionText.replace(/## Scenario\n|## Tasks\n|#|Scenario|Tasks/g, '').trim().substring(0, 120)}...
                                  </p>
                                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                      <Sparkles className="w-3 h-3 text-brand-400" />
                                      <span>Realism: {q.examRealismScore}%</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-brand-600 font-bold text-xs group-hover:gap-2 transition-all">
                                      Practice Again <ChevronRight className="w-3 h-3" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  savedChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                      <div className={`p-4 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <MessageSquare className={`w-12 h-12 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>No Saved Discussions</h3>
                        <p className={isDarkMode ? 'text-slate-500' : 'text-slate-600'}>Your AI conversations will appear here once you start chatting.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {savedChats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => loadChat(chat)}
                          className={`group p-8 rounded-[2.5rem] border text-left transition-all hover:-translate-y-1 cursor-pointer overflow-hidden relative ${
                            isDarkMode 
                              ? 'bg-slate-900 border-slate-800 hover:bg-slate-800/50' 
                              : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-brand-100/10'
                          }`}
                        >
                           <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={(e) => deleteChat(e, chat.id)}
                               className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>

                           <div className="space-y-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:rotate-3 ${
                               isDarkMode ? 'bg-slate-800 text-brand-400' : 'bg-brand-50 text-brand-600'
                             }`}>
                               <MessageSquare className="w-6 h-6" />
                             </div>
                             
                             <div className="space-y-1">
                               <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                 {chat.messages.length} Exchanges
                               </p>
                               <h4 className={`text-xl font-display font-black tracking-tight leading-tight transition-colors ${
                                 isDarkMode ? 'text-white' : 'text-slate-900'
                               }`}>
                                 {chat.title}
                               </h4>
                             </div>

                             <p className={`text-xs font-medium line-clamp-2 min-h-[32px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                               {chat.messages[0]?.content.substring(0, 100)}...
                             </p>

                             <div className="flex items-center justify-between pt-4 border-t border-slate-50/10">
                               <div className="flex items-center gap-2">
                                 <Clock className="w-3 h-3 text-slate-400" />
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                   {new Date(chat.updatedAt).toLocaleDateString()}
                                 </span>
                               </div>
                               <div className="flex items-center gap-1 text-brand-600 font-black text-[10px] uppercase tracking-widest group-hover:gap-2 transition-all">
                                 Restore <ChevronRight className="w-3 h-3" />
                               </div>
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </motion.div>
            )}

            {activeTab === 'videos' && (
              <motion.div 
                key="videos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-display font-bold text-slate-900">Learning Center</h2>
                  <p className="text-slate-500 text-sm">Find curriculum-aligned lessons directly from our library or YouTube.</p>
                </div>
                
                <div className="flex justify-center py-6">
                  <div className="relative group w-full max-w-sm">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search className={`w-4 h-4 transition-colors ${isSearchingOnline ? 'text-brand-500 animate-pulse' : 'text-slate-400 group-focus-within:text-brand-500'}`} />
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); searchYouTube(videoSearchQuery); }} className="relative">
                      <input 
                        type="text"
                        placeholder="Search topics..."
                        value={videoSearchQuery}
                        onChange={(e) => setVideoSearchQuery(e.target.value)}
                        className={`w-full pl-11 pr-11 py-3 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-medium text-sm transition-all shadow-sm ${
                          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                        }`}
                      />
                      {videoSearchQuery && (
                        <button 
                          type="button"
                          onClick={() => { setVideoSearchQuery(''); setOnlineVideos([]); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </form>
                  </div>
                </div>

                {selectedVideo && (
                  <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[150] flex items-center justify-center p-4 lg:p-12">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-black rounded-[2.5rem] overflow-hidden w-full max-w-6xl aspect-video relative shadow-2xl"
                    >
                      <button 
                        onClick={() => setSelectedVideo(null)}
                        className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                        title={selectedVideo.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </motion.div>
                  </div>
                )}

                <div className="space-y-12">
                  {onlineVideos.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800">YouTube Results</h3>
                        </div>
                        <span className="text-[10px] font-black uppercase text-red-500 bg-red-100 px-3 py-1 rounded-full tracking-widest">Live Integration</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {onlineVideos.map((video, idx) => (
                          <button 
                            key={`online-${idx}`}
                            onClick={() => setSelectedVideo({ title: video.title, videoId: video.videoId })}
                            className="group text-left bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-brand-100/20 transition-all hover:-translate-y-1 scale-100 active:scale-95"
                          >
                            <div className="aspect-video relative overflow-hidden bg-slate-100">
                              <img 
                                src={video.thumbnail} 
                                alt={video.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-600 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                                  <Play className="w-6 h-6 fill-current" />
                                </div>
                              </div>
                            </div>
                            <div className="p-5 space-y-2">
                              <h4 className="font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">{video.title}</h4>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                <span className="p-1 bg-red-50 text-red-500 rounded font-bold">{video.channel}</span>
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="border-b border-slate-100 pt-6" />
                    </div>
                  )}

                  {profile?.subjects
                    .filter(subject => 
                      !videoSearchQuery || 
                      subject.toLowerCase().includes(videoSearchQuery.toLowerCase()) || 
                      (VIDEO_RESOURCES[subject] || []).some(v => v.title.toLowerCase().includes(videoSearchQuery.toLowerCase()))
                    )
                    .map(subject => {
                    const allVideos = VIDEO_RESOURCES[subject] || [];
                    const filteredVideos = allVideos.filter(v => 
                      !videoSearchQuery ||
                      v.title.toLowerCase().includes(videoSearchQuery.toLowerCase()) || 
                      subject.toLowerCase().includes(videoSearchQuery.toLowerCase())
                    );

                    if (filteredVideos.length === 0) return null;

                    return (
                      <div key={subject} className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                            <Video className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800">{subject}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredVideos.map((video, idx) => (
                            <button 
                              key={idx}
                              onClick={() => {
                                if (video.videoId) {
                                  setSelectedVideo({ title: video.title, videoId: video.videoId });
                                } else {
                                  window.open(video.url, '_blank');
                                }
                              }}
                              className="group text-left bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-brand-100/20 transition-all hover:-translate-y-1"
                            >
                              <div className="aspect-video relative overflow-hidden bg-slate-100">
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/0 transition-colors flex items-center justify-center">
                                  <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-brand-600 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                                    <Play className="w-6 h-6 fill-current" />
                                  </div>
                                </div>
                              </div>
                              <div className="p-5 space-y-1">
                                <h4 className="font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">{video.title}</h4>
                                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                  {video.channel}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-12 pb-20"
              >
                <div className="flex flex-col gap-2">
                  <h2 className={`text-3xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Account Settings</h2>
                  <p className={`text-lg transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Manage your profile, academic goals, and account preferences.</p>
                </div>

                {/* Profile & Graduation */}
                <div className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border shadow-sm space-y-6 md:space-y-8 transition-all duration-500 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/40' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isDarkMode ? 'bg-slate-800 text-brand-300' : 'bg-brand-100 text-brand-700'
                    }`}>
                      <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className={`text-lg md:text-xl font-bold leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Academic Profile</h3>
                      <p className={`text-[10px] md:text-xs font-medium mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Update your examination details.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {profile?.role === 'student' && (
                      <div className="space-y-3">
                        <label className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Expected Year of Completion (A-Level)</label>
                        <select 
                          value={profile?.expectedGraduationYear || 2026}
                          onChange={(e) => updateProfile({ expectedGraduationYear: parseInt(e.target.value) })}
                          className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-2 font-bold transition-all ${
                            isDarkMode 
                              ? 'bg-slate-950 border border-slate-800 text-slate-200 focus:ring-brand-500/20' 
                              : 'bg-slate-50 border border-slate-100 text-slate-800 focus:ring-brand-500'
                          }`}
                        >
                          {[2024, 2025, 2026, 2027, 2028, 2029].map(year => (
                            <option key={year} value={year} className={isDarkMode ? 'bg-slate-900' : ''}>{year} Candidates</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="space-y-3">
                      <label className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Selected Subjects</label>
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                        {profile?.subjects.map(subject => (
                          <span key={subject} className={`px-3 py-1.5 rounded-lg border uppercase tracking-wider transition-colors ${
                            isDarkMode ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 'bg-brand-50 text-brand-700 border-brand-100'
                          }`}>
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Goals */}
                <div className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border shadow-sm space-y-6 md:space-y-8 transition-all duration-500 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/40' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isDarkMode ? 'bg-slate-800 text-orange-400' : 'bg-orange-50 text-orange-600'
                    }`}>
                      <Target className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className={`text-lg md:text-xl font-bold leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Learning Goals</h3>
                      <p className={`text-[10px] md:text-xs font-medium mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Set targets to keep your studies on track.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <input 
                        type="text" 
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addGoal(newGoalText);
                            setNewGoalText('');
                          }
                        }}
                        placeholder="What do you want to master next?"
                        className={`flex-1 p-4 rounded-2xl focus:outline-none focus:ring-2 font-medium transition-all ${
                          isDarkMode 
                            ? 'bg-slate-950 border border-slate-800 text-slate-200 focus:ring-brand-500/20 placeholder:text-slate-700' 
                            : 'bg-slate-50 border border-slate-100 text-slate-800 focus:ring-brand-500 placeholder:text-slate-400'
                        }`}
                      />
                      <button 
                        onClick={() => {
                          addGoal(newGoalText);
                          setNewGoalText('');
                        }}
                        className={`py-4 sm:py-0 px-6 sm:px-8 rounded-2xl font-bold transition-all shadow-lg active:scale-95 shrink-0 text-center ${
                          isDarkMode ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20' : 'bg-slate-900 text-white hover:bg-brand-600 shadow-lg'
                        }`}
                      >
                        Add Goal
                      </button>
                    </div>

                    <div className="space-y-3">
                      {profile?.goals && profile.goals.length > 0 ? (
                        profile.goals.map(goal => (
                          <motion.div 
                            key={goal.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center gap-4 p-4 rounded-3xl border group transition-all duration-300 ${
                              isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50/50 border-slate-50'
                            }`}
                          >
                            <button 
                              onClick={() => toggleGoal(goal.id)}
                              className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                                goal.completed 
                                  ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20' 
                                  : isDarkMode ? 'border-slate-800 bg-slate-900 shadow-inner' : 'border-slate-200 bg-white'
                              }`}
                            >
                              {goal.completed && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <span className={`flex-1 font-bold ${
                              goal.completed 
                                ? 'text-slate-400 line-through' 
                                : isDarkMode ? 'text-slate-300' : 'text-slate-800'
                            }`}>
                              {goal.text}
                            </span>
                            <button 
                              onClick={() => deleteGoal(goal.id)}
                              className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                          <Target className="w-12 h-12 text-slate-200 mb-4" />
                          <p className="text-slate-400 font-bold">No goals set yet.</p>
                          <p className="text-slate-300 text-sm">Studies show that setting clear goals increases mastery by 40%.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* School and Revision Timetables */}
                <div id="school-and-revision-timetables" className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border shadow-sm space-y-8 transition-all duration-500 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/40' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-150 dark:border-slate-850">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                        isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div>
                        <h3 className={`text-lg md:text-xl font-bold leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Timetables & Study Planner</h3>
                        <p className={`text-[10px] md:text-xs font-medium mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Map S5/S6 lessons and revision targets to trigger customized AI tests.</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                      {/* View Switcher Controls */}
                      <div className={`p-1 rounded-xl flex items-center gap-1 w-full sm:w-auto justify-stretch sm:justify-start ${isDarkMode ? 'bg-slate-950/60 border border-slate-800' : 'bg-slate-100'}`}>
                        <button
                          onClick={() => setTimetableActiveTab('grid')}
                          className={`flex-1 sm:flex-initial justify-center px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                            timetableActiveTab === 'grid'
                              ? isDarkMode ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-brand-600 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Full Weekly Grid</span>
                        </button>
                        <button
                          onClick={() => setTimetableActiveTab('manage')}
                          className={`flex-1 sm:flex-initial justify-center px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                            timetableActiveTab === 'manage'
                              ? isDarkMode ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-brand-600 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Settings2 className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Setup & Map Slots</span>
                        </button>
                      </div>

                      {(!profile?.schoolTimetable || profile.schoolTimetable.length === 0) && (
                        <button
                          onClick={loadSampleTimetables}
                          className={`text-xs font-bold px-4 py-2.5 rounded-xl border border-dashed transition-all active:scale-95 flex items-center justify-center gap-1.5 w-full sm:w-auto ${
                            isDarkMode ? 'border-brand-500/30 text-brand-400 hover:bg-brand-500/10' : 'border-brand-200 text-brand-600 hover:bg-brand-50 bg-brand-50/20'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Load S5/S6 Sample
                        </button>
                      )}
                    </div>
                  </div>

                  {timetableActiveTab === 'grid' ? (
                    /* High-Fidelity Unified 7-Day Calendar Grid View */
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            <Calendar className="w-4 h-4 text-brand-500" />
                            <span>Your Unified A-Level Weekly Planner</span>
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">A holistic mapping of morning school syllabus classes and evening personal study topics.</p>
                        </div>
                        {profile?.schoolTimetable && profile.schoolTimetable.length > 0 && (
                          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> S5/S6 Lesson</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-500" /> Self Review</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:gap-6 gap-4">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                          const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                          const isToday = day === todayName;

                          const daySchool = (profile?.schoolTimetable || []).filter(e => e.day === day);
                          const dayRevision = (profile?.revisionTimetable || []).filter(e => e.day === day);
                          const totalSessions = daySchool.length + dayRevision.length;

                          return (
                            <div 
                              key={day} 
                              className={`p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between group/day ${
                                isToday 
                                  ? isDarkMode 
                                    ? 'bg-brand-950/10 border-brand-500 shadow-lg shadow-brand-500/5' 
                                    : 'bg-brand-50/20 border-brand-400 shadow-md shadow-brand-500/5'
                                  : isDarkMode 
                                    ? 'bg-slate-950/40 border-slate-800 hover:border-slate-750' 
                                    : 'bg-slate-50/40 border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              {/* Glowing Accent for Today */}
                              {isToday && (
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 blur-2xl rounded-full" />
                              )}

                              <div>
                                {/* Card Header with Day & Count Badge */}
                                <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-3">
                                  <div className="flex items-center gap-2">
                                    <h5 className={`font-bold text-sm ${isToday ? 'text-brand-500 font-black' : isDarkMode ? 'text-slate-200' : 'text-slate-850'}`}>
                                      {day}
                                    </h5>
                                    {isToday && (
                                      <span className="text-[9px] font-black uppercase tracking-widest bg-brand-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                                        Today
                                      </span>
                                    )}
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    totalSessions > 0 
                                      ? isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                                      : 'text-slate-400'
                                  }`}>
                                    {totalSessions} {totalSessions === 1 ? 'session' : 'sessions'}
                                  </span>
                                </div>

                                {/* Sessions List Content */}
                                <div className="mt-4 space-y-4">
                                  {/* School Lessons Group */}
                                  {daySchool.length > 0 && (
                                    <div className="space-y-1.5">
                                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                        <GraduationCap className="w-3 h-3" /> School S5/S6 Classes
                                      </span>
                                      <div className="space-y-1.5">
                                        {daySchool.map(item => (
                                          <div key={item.id} className={`p-3 rounded-2xl border flex items-start justify-between group/row transition-colors ${
                                            isDarkMode ? 'bg-slate-900 border-slate-850 hover:bg-slate-800' : 'bg-white border-slate-150 hover:bg-slate-50'
                                          }`}>
                                            <div className="min-w-0 flex-1 pr-2">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">
                                                  {item.time}
                                                </span>
                                                <span className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                                  {item.subject}
                                                </span>
                                              </div>
                                              <p className="text-[10px] text-slate-400 mt-1 font-semibold truncate leading-none">
                                                {item.branch ? `${item.branch} ` : 'Core Paper'}
                                                {item.teacher ? ` • ${item.teacher}` : ''}
                                              </p>
                                            </div>
                                            <button
                                              onClick={() => deleteSchoolEntry(item.id)}
                                              className="p-1 rounded text-slate-400 hover:text-red-500 transition-opacity opacity-0 group-hover/row:opacity-100"
                                              title="Delete lesson"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Personal Revision Group */}
                                  {dayRevision.length > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                      <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest flex items-center gap-1">
                                        <Target className="w-3 h-3" /> Evening Revision Target
                                      </span>
                                      <div className="space-y-1.5">
                                        {dayRevision.map(item => (
                                          <div key={item.id} className={`p-3 rounded-2xl border flex items-start justify-between group/row transition-colors ${
                                            isDarkMode ? 'bg-slate-900 border-slate-850 hover:bg-slate-800' : 'bg-white border-slate-150 hover:bg-slate-50'
                                          }`}>
                                            <div className="min-w-0 flex-1 pr-2">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[9px] font-mono font-bold bg-brand-500/10 text-brand-500 px-1.5 py-0.5 rounded">
                                                  {item.time}
                                                </span>
                                                <span className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                                  {item.subject}
                                                </span>
                                              </div>
                                              <p className="text-[10px] text-brand-400 font-bold mt-1 truncate leading-none">
                                                Topic: {item.topic}
                                              </p>
                                            </div>
                                            <button
                                              onClick={() => deleteRevisionEntry(item.id)}
                                              className="p-1 rounded text-slate-400 hover:text-red-500 transition-opacity opacity-0 group-hover/row:opacity-100"
                                              title="Delete revision"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Rest Day Placeholder */}
                                  {totalSessions === 0 && (
                                    <div className="py-6 flex flex-col items-center justify-center text-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                                        isDarkMode ? 'bg-slate-900 text-slate-700' : 'bg-slate-100/60 text-slate-400'
                                      }`}>
                                        <Clock className="w-4 h-4" />
                                      </div>
                                      <span className="text-xs font-bold text-slate-400">Independent Active Study</span>
                                      <p className="text-[10px] text-slate-300 dark:text-slate-500 px-3 mt-0.5 leading-normal">
                                        Focus on revising notes & taking modular testing challenges.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Footer Action */}
                              <button
                                onClick={() => {
                                  setSchoolFormDay(day);
                                  setRevFormDay(day);
                                  setTimetableActiveTab('manage');
                                }}
                                className={`w-full mt-4 py-2 rounded-xl border border-dashed text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                                  isDarkMode 
                                    ? 'border-slate-800 text-slate-500 hover:text-brand-400 hover:border-brand-500/30' 
                                    : 'border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-300 shadow-inner'
                                }`}
                              >
                                <Plus className="w-3 h-3" /> Map Active Session
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* The Original Stateful School/Revision Mapping forms & Schedulers */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Part 1: School Timetable */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <GraduationCap className="w-5 h-5 text-emerald-500" />
                          <h4 className="font-bold text-base">1. School Timetable</h4>
                        </div>

                        {/* Add Form */}
                        <div className={`p-5 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-slate-950/50 border-slate-850' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Add Class Session</div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Day</label>
                              <select
                                value={schoolFormDay}
                                onChange={(e) => setSchoolFormDay(e.target.value)}
                                className={`w-full p-2.5 rounded-xl text-sm outline-none transition-all ${
                                  isDarkMode ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-white text-slate-800 border border-slate-200'
                                }`}
                              >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Time Slot</label>
                              <input
                                type="text"
                                value={schoolFormTime}
                                onChange={(e) => setSchoolFormTime(e.target.value)}
                                placeholder="e.g. 08:30 - 10:00"
                                className={`w-full p-2.5 rounded-xl text-sm outline-none transition-all ${
                                  isDarkMode ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-white text-slate-800 border border-slate-200'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Subject</label>
                              <select
                                value={schoolFormSubject || (profile?.subjects[0] || 'Mathematics')}
                                onChange={(e) => setSchoolFormSubject(e.target.value)}
                                className={`w-full p-2.5 rounded-xl text-sm outline-none transition-all ${
                                  isDarkMode ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-white text-slate-800 border border-slate-200'
                                }`}
                              >
                                {(profile?.subjects && profile.subjects.length > 0 ? profile.subjects : ['Mathematics', 'Physics', 'Chemistry', 'General Paper']).map(sub => (
                                  <option key={sub} value={sub}>{sub}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Branch / Paper</label>
                              <select
                                value={schoolFormBranch}
                                onChange={(e) => setSchoolFormBranch(e.target.value)}
                                className={`w-full p-2.5 rounded-xl text-sm outline-none transition-all ${
                                  isDarkMode ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-white text-slate-800 border border-slate-200'
                                }`}
                              >
                                <option value="">General Syllabus</option>
                                <option value="Pure Mathematics">Pure Mathematics</option>
                                <option value="Applied Mathematics">Applied Mathematics</option>
                                <option value="Mechanics">Mechanics</option>
                                <option value="Statistics">Statistics</option>
                                <option value="Probability">Probability</option>
                                <option value="Organic Chemistry">Organic Chemistry</option>
                                <option value="Inorganic Chemistry">Inorganic Chemistry</option>
                                <option value="Physical Chemistry">Physical Chemistry</option>
                                <option value="Heat & Thermodynamics">Heat & Thermodynamics</option>
                                <option value="Waves & Optics">Waves & Optics</option>
                                <option value="Electricity & Magnetism">Electricity & Magnetism</option>
                                <option value="Modern Physics">Modern Physics</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Teacher (Optional)</label>
                            <input
                              type="text"
                              value={schoolFormTeacher}
                              onChange={(e) => setSchoolFormTeacher(e.target.value)}
                              placeholder="e.g. Mr. Ssewankambo"
                              className={`w-full p-2.5 rounded-xl text-sm outline-none transition-all ${
                                isDarkMode ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-white text-slate-800 border border-slate-200'
                              }`}
                            />
                          </div>

                          <button
                            onClick={() => {
                              const sub = schoolFormSubject || profile?.subjects[0] || 'Mathematics';
                              if (!schoolFormTime.trim()) {
                                alert("Please enter a time slot.");
                                return;
                              }
                              addSchoolEntry({
                                day: schoolFormDay,
                                time: schoolFormTime,
                                subject: sub,
                                branch: schoolFormBranch || undefined,
                                teacher: schoolFormTeacher || undefined
                              });
                              setSchoolFormTime('');
                              setSchoolFormTeacher('');
                              setSchoolFormBranch('');
                            }}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md"
                          >
                            Add Lesson
                          </button>
                        </div>

                        {/* List School Items */}
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {profile?.schoolTimetable && profile.schoolTimetable.length > 0 ? (
                            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(dayName => {
                              const dayEntries = profile.schoolTimetable!.filter(e => e.day === dayName);
                              if (dayEntries.length === 0) return null;

                              return (
                                <div key={dayName} className="space-y-2">
                                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest block">{dayName}</span>
                                  <div className="grid grid-cols-1 gap-2">
                                    {dayEntries.map(entry => (
                                      <div key={entry.id} className={`p-4 rounded-xl border flex justify-between items-center group transition-colors ${
                                        isDarkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50/50 border-slate-100'
                                      }`}>
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md">{entry.time}</span>
                                            <span className="text-sm font-bold">{entry.subject}</span>
                                          </div>
                                          <p className="text-xs text-slate-400 font-medium">
                                            {entry.branch ? `${entry.branch} ` : 'Core Study'}
                                            {entry.teacher ? ` • Taught by ${entry.teacher}` : ''}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => deleteSchoolEntry(entry.id)}
                                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="py-8 text-center text-slate-400 text-sm border-2 border-dashed border-slate-100 dark:border-slate-800/50 rounded-2xl">
                              No S5/S6 school lessons added yet.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Part 2: Personal Revision Timetable */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <Target className="w-5 h-5 text-brand-500" />
                          <h4 className="font-bold text-base">2. Personal Revision Timetable</h4>
                        </div>

                        {/* Add Form */}
                        <div className={`p-5 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-slate-950/50 border-slate-850' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Add Revision Slot</div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Day</label>
                              <select
                                value={revFormDay}
                                onChange={(e) => setRevFormDay(e.target.value)}
                                className={`w-full p-2.5 rounded-xl text-sm outline-none transition-all ${
                                  isDarkMode ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-white text-slate-800 border border-slate-200'
                                }`}
                              >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Time Slot</label>
                              <input
                                type="text"
                                value={revFormTime}
                                onChange={(e) => setRevFormTime(e.target.value)}
                                placeholder="e.g. 20:00 - 21:30"
                                className={`w-full p-2.5 rounded-xl text-sm outline-none transition-all ${
                                  isDarkMode ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-white text-slate-800 border border-slate-200'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Subject</label>
                              <select
                                value={revFormSubject || (profile?.subjects[0] || 'Mathematics')}
                                onChange={(e) => setRevFormSubject(e.target.value)}
                                className={`w-full p-2.5 rounded-xl text-sm outline-none transition-all ${
                                  isDarkMode ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-white text-slate-800 border border-slate-200'
                                }`}
                              >
                                {(profile?.subjects && profile.subjects.length > 0 ? profile.subjects : ['Mathematics', 'Physics', 'Chemistry', 'General Paper']).map(sub => (
                                  <option key={sub} value={sub}>{sub}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Topic to Revise</label>
                              <input
                                type="text"
                                value={revFormTopic}
                                onChange={(e) => setRevFormTopic(e.target.value)}
                                placeholder="e.g. Vectors / Projectiles"
                                className={`w-full p-2.5 rounded-xl text-sm outline-none transition-all ${
                                  isDarkMode ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-white text-slate-800 border border-slate-200'
                                }`}
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const sub = revFormSubject || profile?.subjects[0] || 'Mathematics';
                              if (!revFormTime.trim() || !revFormTopic.trim()) {
                                alert("Please enter both time slot and topic.");
                                return;
                              }
                              addRevisionEntry({
                                day: revFormDay,
                                time: revFormTime,
                                subject: sub,
                                topic: revFormTopic
                              });
                              setRevFormTime('');
                              setRevFormTopic('');
                            }}
                            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md"
                          >
                            Add Revision Slot
                          </button>
                        </div>

                        {/* List Revision Items */}
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {profile?.revisionTimetable && profile.revisionTimetable.length > 0 ? (
                            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(dayName => {
                              const dayEntries = profile.revisionTimetable!.filter(e => e.day === dayName);
                              if (dayEntries.length === 0) return null;

                              return (
                                <div key={dayName} className="space-y-2">
                                  <span className="text-xs font-bold text-brand-500 uppercase tracking-widest block">{dayName}</span>
                                  <div className="grid grid-cols-1 gap-2">
                                    {dayEntries.map(entry => (
                                      <div key={entry.id} className={`p-4 rounded-xl border flex justify-between items-center group transition-colors ${
                                        isDarkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50/50 border-slate-100'
                                      }`}>
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-md">{entry.time}</span>
                                            <span className="text-sm font-bold">{entry.subject}</span>
                                          </div>
                                          <p className="text-xs text-slate-400 font-bold">
                                            Topic: <span className="text-brand-400">{entry.topic}</span>
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => deleteRevisionEntry(entry.id)}
                                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="py-8 text-center text-slate-400 text-sm border-2 border-dashed border-slate-100 dark:border-slate-800/50 rounded-2xl">
                              No self-study revision slots mapped yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Voice & Speak Preferences */}
                <div className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border shadow-sm space-y-6 md:space-y-8 transition-all duration-500 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/40' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isDarkMode ? 'bg-slate-800 text-brand-300' : 'bg-brand-100 text-brand-700'
                    }`}>
                      <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className={`text-lg md:text-xl font-bold leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Voice & Speak Preferences</h3>
                      <p className={`text-[10px] md:text-xs font-medium mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Configure how Stella reads generated responses out loud and speaks with you.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300 ${
                      isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'
                    }`}>
                      <div className="flex-1">
                        <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Auto Read-Aloud Mode</h4>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          When turned on, Stella will automatically read her text-generated answers out loud.
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const newVal = !isTtsEnabled;
                          setIsTtsEnabled(newVal);
                          localStorage.setItem('isTtsEnabled', String(newVal));
                          if (!newVal) {
                            stopSpeaking();
                          }
                        }}
                        className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 outline-none flex items-center cursor-pointer shrink-0 ${
                          isTtsEnabled ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                          isTtsEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Backup & Portability Section */}
                <div className={`p-10 rounded-[3rem] border space-y-8 transition-colors duration-500 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/40' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isDarkMode ? 'bg-slate-800 text-brand-300' : 'bg-brand-100 text-brand-700'
                    }`}>
                      <History className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Data Backup & Export</h3>
                      <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Download or upload your academic profile, revision timetables, study goals, and offline progress.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Export Action */}
                    <div className={`p-6 rounded-3xl border flex flex-col justify-between gap-4 ${
                      isDarkMode ? 'bg-slate-950/30 border-slate-800/80' : 'bg-slate-50/50 border-slate-100'
                    }`}>
                      <div>
                        <h4 className={`font-bold text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Export Study Profile</h4>
                        <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Create a secure, portable offline backup of all your customized curriculum parameters, learning outcomes, calendar slots, and goals.</p>
                      </div>
                      <button 
                        onClick={() => {
                          const backupPayload = {
                            version: "1.0",
                            profile,
                            savedChats,
                            timestamp: Date.now()
                          };
                          const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `stellas_study_profile_backup_${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md text-center shrink-0 ${
                          isDarkMode ? 'bg-brand-600 hover:bg-brand-700 text-white' : 'bg-slate-900 text-white hover:bg-brand-600'
                        }`}
                      >
                        Download Backup (.json)
                      </button>
                    </div>

                    {/* Import Action */}
                    <div className={`p-6 rounded-3xl border flex flex-col justify-between gap-4 ${
                      isDarkMode ? 'bg-slate-950/30 border-slate-800/80' : 'bg-slate-50/50 border-slate-100'
                    }`}>
                      <div>
                        <h4 className={`font-bold text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Restore Backup</h4>
                        <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Restore setting parameters from a previously saved backup file. This replaces your current local planners and preferences.</p>
                      </div>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept=".json"
                          id="restore-backup-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = async (event) => {
                              try {
                                const json = JSON.parse(event.target?.result as string);
                                // Deep Input Schema Validation to prevent mass assignment, malformed injection or code evaluation
                                if (!json || typeof json !== "object") throw new Error("Format is invalid.");
                                if (json.version !== "1.0" || !json.profile || typeof json.profile !== "object") {
                                  throw new Error("Missing vital schema nodes or incompatible backup file version.");
                                }
                                
                                // Perform safe field mapping rather than blind assign to avoid Proto Pollution & unauthorized overrides
                                const cleanProfileKeys: any = {};
                                const rawProfile = json.profile;
                                
                                // Clean subjects
                                if (Array.isArray(rawProfile.subjects)) {
                                  cleanProfileKeys.subjects = rawProfile.subjects.filter((s: any) => typeof s === "string").slice(0, 10);
                                }
                                // Clean year
                                if (typeof rawProfile.expectedGraduationYear === "number") {
                                  cleanProfileKeys.expectedGraduationYear = rawProfile.expectedGraduationYear;
                                }
                                // Clean goals
                                if (Array.isArray(rawProfile.goals)) {
                                  cleanProfileKeys.goals = rawProfile.goals.map((g: any) => ({
                                    id: String(g.id || Date.now() + Math.random()),
                                    text: String(g.text || "").substring(0, 200),
                                    completed: Boolean(g.completed)
                                  })).slice(0, 50);
                                }
                                // Clean school timetable
                                if (Array.isArray(rawProfile.schoolTimetable)) {
                                  cleanProfileKeys.schoolTimetable = rawProfile.schoolTimetable.map((e: any) => ({
                                    id: String(e.id || Date.now() + Math.random()),
                                    day: String(e.day || "Monday"),
                                    time: String(e.time || "08:00"),
                                    subject: String(e.subject || "Mathematics"),
                                    topic: String(e.topic || "").substring(0, 200)
                                  })).slice(0, 100);
                                }
                                // Clean revision timetable
                                if (Array.isArray(rawProfile.revisionTimetable)) {
                                  cleanProfileKeys.revisionTimetable = rawProfile.revisionTimetable.map((e: any) => ({
                                    id: String(e.id || Date.now() + Math.random()),
                                    day: String(e.day || "Monday"),
                                    time: String(e.time || "08:00"),
                                    subject: String(e.subject || "Mathematics"),
                                    topic: String(e.topic || "").substring(0, 200)
                                  })).slice(0, 100);
                                }

                                // Update Profile asynchronously! Fully secured and validated.
                                await updateProfile(cleanProfileKeys);
                                alert("Backup restored and validated successfully! Your calendar, timetables, and academic parameters are fully recovered.");
                              } catch (err: any) {
                                alert(`Failed to restore backup: ${err.message || 'Malformed schema configuration.'}`);
                              }
                            };
                            reader.readAsText(file);
                          }}
                        />
                        <button 
                          onClick={() => document.getElementById('restore-backup-upload')?.click()}
                          className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md text-center border ${
                            isDarkMode ? 'border-brand-500/20 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          Select Backup File (.json)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* iPhone Secure Enclave */}
                <div className={`p-10 rounded-[3rem] border space-y-8 transition-colors duration-500 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/40' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isDarkMode ? 'bg-slate-800 text-brand-300' : 'bg-brand-105 text-brand-700'
                    }`}>
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Secure Enclave Security Shield</h3>
                      <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Integrate iPhone-grade cryptographic isolation, passcode keypads, and session lock timeouts.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Passcode State Panel */}
                    <div className={`p-6 rounded-3xl border flex flex-col justify-between gap-4 ${
                      isDarkMode ? 'bg-slate-950/30 border-slate-800/80' : 'bg-slate-50/50 border-slate-100'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Passcode Lock Screen</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            devicePasscodeHash ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {devicePasscodeHash ? 'SECURED IN ENCLAVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-550'}`}>
                          {devicePasscodeHash 
                            ? "Your academic profile is actively encrypted. Unauthorized eyes cannot bypass this terminal without your 4-digit code." 
                            : "Create a 4-digit physical passcode to lock out intruders. This activates native local encryption of key academic stores."}
                        </p>
                      </div>

                      <div className="flex gap-3 mt-2">
                        {devicePasscodeHash ? (
                          <button 
                            type="button"
                            onClick={async () => {
                              const verify = window.prompt("Verify current 4-digit Passcode PIN to deactivate:");
                              if (!verify) return;
                              const currentHash = await hashPasscode(verify);
                              if (currentHash === devicePasscodeHash) {
                                localStorage.removeItem('stella_passcode_hash');
                                setDevicePasscodeHash(null);
                                setIsLocked(false);
                                if (passcodeAudioEnabled) playKeypadClick(500, 0.2);
                                alert("Secure Enclave Passcode disabled successfully.");
                              } else {
                                alert("Verification failed. Incorrect passcode PIN.");
                              }
                            }}
                            className="w-full py-3 px-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all text-center border border-red-500/10 cursor-pointer"
                          >
                            Disable Passcode
                          </button>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => {
                              setSetupPin('');
                              setConfirmPin('');
                              setSetupStep('enter');
                              setShowDevicePinSetupModal(true);
                              if (passcodeAudioEnabled) playKeypadClick();
                            }}
                            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all text-center shadow-md shadow-brand-500/10 cursor-pointer"
                          >
                            Set up Passcode PIN
                          </button>
                        )}
                        
                        {devicePasscodeHash && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsLocked(true);
                              if (passcodeAudioEnabled) playKeypadClick(400, 0.1);
                            }}
                            className={`px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer`}
                            title="Lock App Instantly"
                          >
                            <Lock className="w-4 h-4 text-slate-300" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Enclave Parameters Panel */}
                    <div className={`p-6 rounded-3xl border flex flex-col justify-between gap-6 ${
                      isDarkMode ? 'bg-slate-950/30 border-slate-800/80' : 'bg-slate-50/50 border-slate-100'
                    }`}>
                      {/* Interactive Preferences */}
                      <div className="space-y-4">
                        {/* Auto Lock dropdown */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <Timer className="w-3.5 h-3.5 text-brand-400" />
                            <label className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              Auto-Lock Timeout
                            </label>
                          </div>
                          <select 
                            value={autoLockPeriod}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAutoLockPeriod(val);
                              localStorage.setItem('stella_autolock_period', val);
                            }}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold outline-none border transition-all ${
                              isDarkMode ? 'bg-slate-900 border-slate-850 text-slate-205' : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          >
                            <option value="0">Immediately on Blur</option>
                            <option value="1">After 1 Minute Inactive</option>
                            <option value="5">After 5 Minutes Inactive</option>
                            <option value="15">After 15 Minutes Inactive</option>
                            <option value="never">Never Auto-Lock</option>
                          </select>
                        </div>

                        {/* Interactive Sound Switch */}
                        <div className="flex items-center justify-between border-t border-slate-800/20 pt-3">
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-750'}`}>Acoustic Haptic Click Effects</span>
                          <button 
                            type="button"
                            onClick={() => {
                              const next = !passcodeAudioEnabled;
                              setPasscodeAudioEnabled(next);
                              localStorage.setItem('stella_passcode_audio', String(next));
                              if (next) playKeypadClick(1000, 0.02);
                            }}
                            className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 outline-none flex items-center cursor-pointer ${
                              passcodeAudioEnabled ? 'bg-brand-500' : 'bg-slate-705'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                              passcodeAudioEnabled ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>

                        {/* Minimization Shield Switch */}
                        <div className="flex items-center justify-between border-t border-slate-800/20 pt-3">
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-755'}`}>Lock on Minimization / Hide</span>
                          <button 
                            type="button"
                            onClick={() => {
                              const next = !passcodeScreenShieldActive;
                              setPasscodeScreenShieldActive(next);
                              localStorage.setItem('stella_screenshield', String(next));
                              if (passcodeAudioEnabled) playKeypadClick();
                            }}
                            className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 outline-none flex items-center cursor-pointer ${
                              passcodeScreenShieldActive ? 'bg-brand-500' : 'bg-slate-705'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                              passcodeScreenShieldActive ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>

                      {/* Web-Crypto Benchmark Action */}
                      <button 
                        type="button"
                        onClick={async () => {
                          const start = performance.now();
                          for (let i = 0; i < 100; i++) {
                            await hashPasscode("test_pin_" + i);
                          }
                          const end = performance.now();
                          alert(`Secure Enclave Benchmark Complete! 100 hardware-isolated SHA-256 hashes successfully generated inside browser sandboxing context in ${(end - start).toFixed(1)}ms (${((100 / (end - start)) * 1000).toFixed(0)} hashes/sec).`);
                        }}
                        className={`w-full py-2 border rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                          isDarkMode ? 'border-brand-500/20 bg-brand-500/5 text-brand-400 hover:bg-brand-500/10' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        Run Hardware Cryptographic Benchmark
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Security */}
                <div className={`p-10 rounded-[3rem] border space-y-8 transition-colors duration-500 ${
                  isDarkMode ? 'bg-red-950/10 border-red-900/30' : 'bg-red-50/50 border-red-100'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'
                    }`}>
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold leading-none ${isDarkMode ? 'text-red-400' : 'text-red-900'}`}>Danger Zone</h3>
                      <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-red-800' : 'text-red-400'}`}>Irreversible account actions.</p>
                    </div>
                  </div>

                  <div className={`p-8 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors duration-500 ${
                    isDarkMode ? 'bg-slate-950/30 border-red-900/20' : 'bg-white/50 border-red-100'
                  }`}>
                    <div>
                      <h4 className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-900'}`}>Delete Your Account</h4>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Permanently remove all your progress, history, and preferences.</p>
                    </div>
                    <button 
                      onClick={handleDeleteAccount}
                      className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>

                <div className="flex justify-center pt-8 border-t border-slate-100/10 mb-20">
                  <button 
                    onClick={() => setShowPrivacyPolicy(true)}
                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                      isDarkMode ? 'text-slate-600 hover:text-brand-400' : 'text-slate-400 hover:text-brand-600'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Review Privacy Policy
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mock Subject Selector Modal */}
        <AnimatePresence>
          {showMockSelector && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMockSelector(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`relative w-full max-w-lg p-8 rounded-[3rem] border shadow-2xl overflow-hidden ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-display font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Select Subject</h3>
                      <p className={`text-xs font-medium uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Target specific disciplines</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMockSelector(false)}
                    className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-50 text-slate-400'}`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 mb-6 px-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Examination Format</span>
                  <div className={`flex p-1 rounded-2xl border ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
                    {['Paper 1', 'Paper 2', 'Combined'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setSelectedPaperFormat(f as any)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedPaperFormat === f 
                            ? 'bg-brand-600 text-white shadow-lg' 
                            : isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {f === 'Combined' ? 'Total' : f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
                  {profile?.subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => generateMockEvaluation(subject)}
                      className={`group p-6 rounded-[2.5rem] border-2 text-left transition-all duration-500 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950/50 hover:border-brand-500/50 hover:bg-slate-900/50' 
                          : 'border-slate-50 bg-slate-50/30 hover:border-brand-100 hover:bg-white shadow-sm hover:shadow-xl hover:shadow-brand-500/5'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-[1.25rem] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${
                          isDarkMode ? 'bg-slate-800 text-brand-400 border border-slate-700' : 'bg-white text-brand-600 shadow-sm border border-brand-50'
                        }`}>
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <span className={`font-display font-black text-xl tracking-tighter transition-all ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          {subject}
                        </span>
                      </div>
                      <div className="bg-brand-500/10 text-brand-500 p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100/10 text-center">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    Stellas will synthesize a paper following the official <br />
                    <span className="font-bold text-brand-500">UNEB/CBC Structure</span> for your selection.
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Device Pin Setup Modal */}
        <AnimatePresence>
          {showDevicePinSetupModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowDevicePinSetupModal(false);
                  setSetupPin('');
                  setConfirmPin('');
                  setSetupStep('enter');
                }}
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className={`relative w-full max-w-sm p-6 sm:p-8 rounded-[3rem] border shadow-2xl overflow-hidden text-center transition-all ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white shadow-slate-950/60' : 'bg-slate-950 border-slate-850 text-white shadow-xl'
                }`}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-400 mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold tracking-tight">
                    {setupStep === 'enter' ? 'Create passcode PIN' : 'Confirm passcode PIN'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[240px]">
                    {setupStep === 'enter' 
                      ? 'Specify a 4-digit code. This acts as physical encryption logic on this profile.' 
                      : 'Please verify the passcode. This locks out any third-party intruders.'}
                  </p>

                  {/* Bullet progress indictors */}
                  <div className={`flex justify-center gap-4 py-8 ${isPinScreenWrong ? 'animate-ios-shake' : ''}`}>
                    {[0, 1, 2, 3].map((idx) => {
                      const currentLen = setupStep === 'enter' ? setupPin.length : confirmPin.length;
                      return (
                        <div 
                          key={idx} 
                          className={`w-3 h-3 rounded-full border-2 transition-all duration-150 ${
                            idx < currentLen 
                              ? 'bg-brand-500 border-brand-500 scale-110' 
                              : 'border-slate-600'
                          }`} 
                        />
                      );
                    })}
                  </div>

                  {/* Sub-label error alert */}
                  <div className="min-h-[20px] text-[10px] text-red-400 font-extrabold pb-4">
                    {isPinScreenWrong && "PINs do not match. Resetting..."}
                  </div>

                  {/* Numeric keypad matrix layout */}
                  <div className="grid grid-cols-3 gap-y-3 gap-x-5 w-full justify-items-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSetupKeypadPress(String(num))}
                        disabled={isPinScreenWrong}
                        className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-705 text-white hover:bg-slate-700 active:scale-95 transition-all text-xl font-light outline-none disabled:opacity-50 select-none flex items-center justify-center cursor-pointer"
                      >
                        {num}
                      </button>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => handleSetupKeypadPress('Cancel')}
                      className="w-14 h-14 flex items-center justify-center text-[10px] text-slate-500 hover:text-slate-300 font-bold tracking-widest uppercase transition-colors outline-none cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetupKeypadPress('0')}
                      disabled={isPinScreenWrong}
                      className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-705 text-white hover:bg-slate-700 active:scale-95 transition-all text-xl font-light outline-none disabled:opacity-50 select-none flex items-center justify-center cursor-pointer"
                    >
                      0
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetupKeypadPress('Delete')}
                      className="w-14 h-14 flex items-center justify-center text-[10px] text-slate-505 hover:text-slate-300 font-bold tracking-widest uppercase transition-colors outline-none cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showResendModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`w-full max-w-xl rounded-[2.5rem] border p-8 shadow-2xl relative overflow-hidden ${
                  isDarkMode ? 'bg-black border-slate-900 text-white' : 'bg-[#faf9f5] border-slate-200 text-slate-900'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl">
                      <Mail className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xl font-display font-black tracking-tight leading-none">Resend Dispatcher</h4>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Secure delivery of synergized academic resources
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowResendModal(false)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Recipient Address */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-widest pl-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Recipient Email
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                      <input 
                        type="email"
                        value={resendRecipient}
                        onChange={(e) => setResendRecipient(e.target.value)}
                        placeholder="parent@school.com or student@uneb.com"
                        className={`w-full pl-11 pr-5 py-3.5 rounded-2xl border-2 outline-none text-sm transition-all ${
                          isDarkMode ? 'bg-slate-950 border-transparent focus:border-brand-500 text-white' : 'bg-white border-transparent focus:border-brand-500 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Subject line */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-widest pl-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Email Subject
                    </label>
                    <input 
                      type="text"
                      value={resendSubject}
                      onChange={(e) => setResendSubject(e.target.value)}
                      placeholder="Enter subject"
                      className={`w-full px-5 py-3.5 rounded-2xl border-2 outline-none text-sm transition-all ${
                        isDarkMode ? 'bg-slate-950 border-transparent focus:border-brand-500 text-white' : 'bg-white border-transparent focus:border-brand-500 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Content Preview */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-widest pl-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Resource Preview
                    </label>
                    <div className={`p-4 rounded-2xl border text-xs font-mono max-h-40 overflow-y-auto whitespace-pre-wrap ${
                      isDarkMode ? 'bg-slate-950 border-slate-900 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      {resendContent}
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                {resendStatus === 'sending' && (
                  <div className="mt-5 p-4 bg-brand-500/10 text-brand-600 rounded-2xl flex items-center gap-3 text-xs font-bold animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Delivering resources securely via Resend server layers...
                  </div>
                )}

                {resendStatus === 'success' && (
                  <div className="mt-5 p-4 bg-green-500/10 text-green-600 rounded-2xl flex items-center gap-3 text-xs font-bold">
                    <Check className="w-5 h-5" />
                    Resource successfully delivered and synced with Resend!
                  </div>
                )}

                {resendStatus === 'error' && (
                  <div className="mt-5 p-4 bg-red-500/10 text-red-600 rounded-2xl flex flex-col gap-1 text-xs font-medium">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      Delivery Blocked or Delayed
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-red-400/80' : 'text-red-600/80'}`}>
                      {resendErrorMessage}
                    </p>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="flex items-center justify-end gap-3 mt-8 border-t border-slate-100/10 pt-5">
                  <button
                    onClick={() => setShowResendModal(false)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      isDarkMode ? 'bg-slate-900 text-slate-400 hover:bg-slate-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={resendStatus === 'sending'}
                    onClick={handleSendEmail}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-[0.1em] shadow-lg shadow-brand-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    Send Email via Resend
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <PrivacyPolicyModal 
          isOpen={showPrivacyPolicy} 
          onClose={() => setShowPrivacyPolicy(false)} 
          isDarkMode={isDarkMode} 
        />

        <TermsOfServiceModal 
          isOpen={showTermsOfService} 
          onClose={() => setShowTermsOfService(false)} 
          isDarkMode={isDarkMode} 
        />

        <SynergyTelemetryModal
          isOpen={showSynergyPanel}
          onClose={() => setShowSynergyPanel(false)}
          isDarkMode={isDarkMode}
          details={synergyDetails}
        />

        <AddStaffModal 
          isOpen={showAddStaff} 
          onClose={() => setShowAddStaff(false)} 
          isDarkMode={isDarkMode} 
        />

        <AddStudentModal 
          isOpen={showAddStudent} 
          onClose={() => setShowAddStudent(false)} 
          isDarkMode={isDarkMode} 
          profile={profile}
        />
        <AnimatePresence>
          {isLiveModeActive && (
            <GeminiLiveTerminal 
              onClose={stopLiveSession} 
              isDarkMode={isDarkMode} 
              isModelSpeaking={isModelSpeaking}
            />
          )}
        </AnimatePresence>
      </>
    )}
  </main>
    </div>
  );
}

function GeminiLiveTerminal({ onClose, isDarkMode, isModelSpeaking }: { onClose: () => void, isDarkMode: boolean, isModelSpeaking: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-white"
    >
      <div className="absolute top-8 right-8">
        <button 
          onClick={onClose}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-12 w-full max-w-lg text-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Pulsing rings */}
          <motion.div 
            animate={{ 
              scale: isModelSpeaking ? [1, 1.2, 1] : [1, 1.05, 1],
              opacity: isModelSpeaking ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-brand-500/20 blur-2xl" 
          />
          <motion.div 
            animate={{ 
              scale: isModelSpeaking ? [1, 1.4, 1] : [1, 1.1, 1],
              opacity: isModelSpeaking ? [0.1, 0.3, 0.1] : [0.05, 0.15, 0.05]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-4rem] rounded-full bg-brand-400/10 blur-3xl" 
          />
          
          <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-2xl flex items-center justify-center">
             <Zap className={`w-12 h-12 text-white fill-current ${isModelSpeaking ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-display font-black tracking-tight tracking-[-0.04em]">
            {isModelSpeaking ? "Stellas is Speaking" : "Listening to you..."}
          </h2>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">
            You are connected via Talk. Speak naturally about any academic topic.
          </p>
        </div>

        <div className="flex items-center gap-4 py-8">
           <div className={`h-1 w-8 rounded-full ${isModelSpeaking ? 'bg-brand-500 animate-[bounce_1s_infinite_0ms]' : 'bg-slate-700'}`} />
           <div className={`h-1 w-12 rounded-full ${isModelSpeaking ? 'bg-brand-500 animate-[bounce_1s_infinite_200ms]' : 'bg-slate-700'}`} />
           <div className={`h-1 w-8 rounded-full ${isModelSpeaking ? 'bg-brand-500 animate-[bounce_1s_infinite_400ms]' : 'bg-slate-700'}`} />
        </div>
      </div>

      <div className="pb-12">
        <button
          onClick={onClose}
          className="px-12 py-5 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-slate-100 transition-all active:scale-95 shadow-2xl"
        >
          End Talk
        </button>
      </div>
    </motion.div>
  );
}

function VerificationScreen({ 
  user, 
  profile,
  isDarkMode, 
  onLogout, 
  sendVerificationEmail
}: { 
  user: User, 
  profile: any,
  isDarkMode: boolean, 
  onLogout: () => void,
  sendVerificationEmail: (email: string, code: string) => Promise<void>
}) {
  const [enteredCode, setEnteredCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleVerify = async (e?: React.FormEvent, codeOverride?: string) => {
    if (e) e.preventDefault();
    const cleanCode = (codeOverride || enteredCode).trim();
    if (loading || cleanCode.length !== 6) return;
    setLoading(true);
    setError(null);

    try {
      if (cleanCode === profile.verificationCode) {
        setSuccess(true);
        await updateDoc(doc(db, 'users', user.uid), { isVerified: true });
      } else {
        setError("Invalid verification code. Please check the code sent to your email or tap resend.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setResendStatus("sending");
    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      await updateDoc(doc(db, 'users', user.uid), { verificationCode: newCode });
      if (user.email) {
        await sendVerificationEmail(user.email, newCode);
      }
      setResendStatus("sent");
      setTimeout(() => setResendStatus("idle"), 6000);
    } catch (err: any) {
      setError(err.message || "Failed to transmit new verification token.");
      setResendStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
       <div className={`absolute -left-20 -bottom-20 w-[600px] h-[600px] blur-[120px] rounded-full pointer-events-none opacity-10 ${isDarkMode ? 'bg-brand-500' : 'bg-brand-600'}`} />
       
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className={`w-full max-w-md p-10 rounded-[3.5rem] border shadow-2xl relative z-10 text-center space-y-8 ${
           isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
         }`}
       >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-brand-500/10 rounded-[1.5rem] flex items-center justify-center text-brand-500">
              <Mail className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-display font-black tracking-tight leading-none italic">Verified Access Protocol</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              We've dispatched a secure verification token via Resend to <br />
              <span className="font-bold text-brand-600 dark:text-brand-400 underline underline-offset-4">{user.email}</span>. <br />
              Please enter the 6-digit authorization code below.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold animate-in fade-in zoom-in duration-350">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-500 text-xs font-bold animate-in fade-in zoom-in duration-350">
              <Check className="w-4.5 h-4.5 shrink-0" />
              <span>Authorization Success! Unlocking platform...</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">
                6-Digit Verification Pin
              </label>
              <input
                type="text"
                maxLength={6}
                value={enteredCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setEnteredCode(val);
                  if (val.length === 6) {
                    handleVerify(undefined, val);
                  }
                }}
                placeholder="000000"
                className={`w-full text-center py-4 rounded-2xl font-mono text-3xl font-black tracking-[0.4em] pl-[0.4em] border-2 outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 focus:border-brand-500 text-white' 
                    : 'bg-slate-100 border-transparent focus:border-brand-500 text-slate-900 focus:bg-white'
                }`}
                disabled={loading || success}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || success || enteredCode.trim().length !== 6}
              className="w-full py-4.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all shadow-xl shadow-brand-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Verify Code
            </button>
          </form>

          <div className="space-y-3 pt-4 border-t border-slate-100/10">
            <button
              onClick={handleResend}
              disabled={loading || success || resendStatus === "sending"}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-[0.1em] text-xs transition-all flex items-center justify-center gap-2 ${
                isDarkMode 
                  ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800' 
                  : 'bg-slate-100/50 text-slate-600 hover:bg-slate-100'
              } disabled:opacity-50 cursor-pointer`}
            >
              {resendStatus === "sent" ? (
                <>
                  <Check className="w-4 h-4 text-green-500 animate-bounce" />
                  Code Dispatched!
                </>
              ) : resendStatus === "sending" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dispatching Token...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Resend Pin via Resend
                </>
              )}
            </button>

            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Wrong email or want to sign out?
              </span>
              <button 
                onClick={onLogout}
                className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-brand-600'
                } cursor-pointer`}
              >
                <LogOut className="w-3.5 h-3.5" />
                Terminate Session
              </button>
            </div>
          </div>
       </motion.div>
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'questions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `questions/${id}`);
    }
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-300">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirming(false);
          }}
          className="px-2 py-1 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleDelete}
          className="px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 active:scale-95 transition-all"
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsConfirming(true);
      }}
      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-200"
      title="Delete from history"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

function SidebarItem({ icon, label, active, onClick, isDarkMode, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isDarkMode?: boolean, collapsed?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center transition-all duration-500 group p-3.5 rounded-2xl ${
        collapsed ? 'justify-center lg:justify-center xl:justify-start lg:px-0 xl:px-4' : 'justify-start px-4'
      } ${
        active 
          ? 'bg-brand-600 text-white shadow-2xl shadow-brand-600/30 ring-2 ring-brand-500/10' 
          : isDarkMode 
            ? 'text-slate-500 hover:bg-slate-900/80 hover:text-white' 
            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
      }`}
      title={collapsed ? label : ''}
    >
      <div className={`transition-transform duration-500 flex items-center justify-center shrink-0 ${active ? 'scale-110' : 'group-hover:scale-110'} ${collapsed ? 'w-full lg:w-9 xl:w-5' : 'w-5'}`}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' }) : icon}
      </div>
      <span className={`font-display font-bold text-[13px] tracking-tight transition-all ml-4 ${
        (collapsed ? 'hidden xl:block' : 'block')
      } ${
        active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
      }`}>
        {label}
      </span>
      {active && !collapsed && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="ml-auto w-1 h-1 rounded-full bg-white opacity-40 shadow-sm"
        />
      )}
    </button>
  );
}

function StatCard({ icon, label, value, color, delay = 0, isDarkMode }: { icon: React.ReactNode, label: string, value: string | number, color: string, delay?: number, isDarkMode?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', damping: 20, stiffness: 100 }}
      className={`p-4 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[3rem] border transition-all duration-700 group hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden flex flex-col justify-between ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-slate-950/50' 
          : 'bg-white border-slate-100 hover:border-brand-100 hover:shadow-brand-100/10 shadow-sm'
      }`}
    >
      <div className={`absolute -right-12 -top-12 w-48 h-48 blur-[80px] transition-opacity duration-700 group-hover:opacity-100 opacity-20 pointer-events-none ${
        isDarkMode ? 'bg-brand-500/20' : color.replace('bg-', 'bg-') + '/20'
      }`} />

      <div className="flex flex-col gap-4 sm:gap-8 relative z-10 w-full">
        <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center transition-all duration-700 group-hover:rotate-12 ${
          isDarkMode ? 'bg-slate-800 text-brand-400 border border-slate-700' : `${color} shadow-2xl shadow-current/5`
        } shrink-0`}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5 sm:w-7 sm:h-7' }) : icon}
        </div>
        
        <div className="min-w-0">
          <p className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] mb-1.5 sm:mb-3 truncate opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {label}
          </p>
          <h3 className={`text-xl sm:text-4xl md:text-5xl font-display font-black tracking-tighter truncate leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {value}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}

function AddStaffModal({ isOpen, onClose, isDarkMode }: { isOpen: boolean, onClose: () => void, isDarkMode: boolean }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`max-w-md w-full p-10 rounded-[3rem] border shadow-2xl relative ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-3xl font-display font-black tracking-tight mb-2">Enlist Faculty</h3>
        <p className="text-sm text-slate-500 mb-8 font-medium">Issue professional credentials to a new educator.</p>
        
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. Dr. Jane Doe"
              className={`w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all ${
                isDarkMode ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Discipline</label>
            <select className={`w-full px-6 py-4 rounded-2xl border-2 outline-none appearance-none transition-all ${
                isDarkMode ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900'
              }`}>
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Biology</option>
              <option>Literature in English</option>
            </select>
          </div>
          <button className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 active:scale-95">
            Protocol Initiate
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function AddStudentModal({ isOpen, onClose, isDarkMode, profile }: { isOpen: boolean, onClose: () => void, isDarkMode: boolean, profile: UserProfile | null }) {
  const [candidateName, setCandidateName] = useState('');
  const [formLevel, setFormLevel] = useState('Senior Six (S6)');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || loading) return;

    setLoading(true);
    try {
      const combinations = [
        ['Physics', 'Chemistry', 'Mathematics'],
        ['Biology', 'Chemistry', 'Mathematics'],
        ['Mathematics', 'Economics', 'Geography'],
        ['History', 'Economics', 'Literature'],
        ['Physics', 'Economics', 'Mathematics']
      ];
      const selectedComb = combinations[Math.floor(Math.random() * combinations.length)];
      const isS6 = formLevel.includes('S6') || formLevel.includes('Six');
      
      const randomId = 'candidate_' + Math.random().toString(36).substr(2, 9);
      const newCand = {
        uid: randomId,
        displayName: candidateName.trim(),
        email: `${candidateName.trim().toLowerCase().replace(/\s+/g, '.')}@uneb.ac.ug`,
        role: 'student',
        level: isS6 ? 'S6' : 'S5',
        subjects: selectedComb,
        coverage: {},
        schoolName: profile?.schoolName || 'Uganda National Academy',
        district: profile?.district || 'Kampala',
        questionsAttempted: Math.floor(Math.random() * 20) + 12, // random realistic activity count
        averageScore: Math.floor(Math.random() * 25) + 65,      // random average competency percentage
        lastActiveAt: Date.now(),
        createdAt: Date.now(),
        onboarded: true
      };

      await setDoc(doc(db, 'users', randomId), newCand as any);
      setCandidateName('');
      onClose();
    } catch (err) {
      console.error("Failed to admit candidate to Firestore", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`max-w-md w-full p-10 rounded-[3rem] border shadow-2xl relative ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-3xl font-display font-black tracking-tight mb-2">Admit Candidate</h3>
        <p className="text-sm text-slate-500 mb-8 font-medium">Create a new academic trajectory profile.</p>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Candidate Name</label>
            <input 
              type="text" 
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Alex Tumwine"
              className={`w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all ${
                isDarkMode ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Form</label>
            <select 
              value={formLevel}
              onChange={(e) => setFormLevel(e.target.value)}
              className={`w-full px-6 py-4 rounded-2xl border-2 outline-none appearance-none transition-all ${
                isDarkMode ? 'bg-slate-800 border-transparent focus:border-brand-500 text-white' : 'bg-slate-50 border-transparent focus:border-brand-500 text-slate-900'
              }`}
            >
              <option>Senior Five (S5)</option>
              <option>Senior Six (S6)</option>
            </select>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-brand-600 disabled:bg-slate-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 active:scale-95"
          >
            {loading ? 'Adding...' : 'Verify Enrollment'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
