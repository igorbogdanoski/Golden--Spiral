import { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, Star, ChevronRight, PenTool, X, Award, 
  CheckCircle, AlertTriangle, XCircle, Calculator, Compass, Scale, 
  Coins, FlaskConical, Hammer, FileText, Book, Volume2, VolumeX, 
  Zap, HelpCircle, RefreshCw, Settings, Unlock, 
  Printer, Eraser, ListX, ArrowRight 
} from 'lucide-react';

// --- AUDIO ENGINE (Singleton Pattern to prevent memory leaks) ---
const audioCtxRef: { current: AudioContext | null } = { current: null };

const getAudioContext = () => {
    if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioCtxRef.current = new AudioContext();
        }
    }
    // Resume context if suspended (common browser policy requirement)
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
};

const playSound = (type: string) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    
    if (type === 'success') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, now); osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1); gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5); osc.start(now); osc.stop(now + 0.5);
    } else if (type === 'error') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(100, now + 0.2); gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'click') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05); osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'victory') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc2 = ctx.createOscillator(); const gain2 = ctx.createGain(); osc2.connect(gain2); gain2.connect(ctx.destination);
            osc2.type = 'square'; osc2.frequency.setValueAtTime(freq, now + i*0.1); gain2.gain.setValueAtTime(0.1, now + i*0.1); gain2.gain.exponentialRampToValueAtTime(0.01, now + i*0.1 + 0.4); osc2.start(now + i*0.1); osc2.stop(now + i*0.1 + 0.4);
        });
    }
  } catch (e) { console.error(e); }
};

// --- DATA ---
const HEROES = [
    { id: 'builder', name: 'Градител', icon: '👷', power: 'Алатки', desc: 'Задачи со изградба, материјали и работници.', color: 'bg-orange-500' },
    { id: 'explorer', name: 'Истражувач', icon: '🤠', power: 'Брзи Чизми', desc: 'Задачи со мапи, патувања и гориво.', color: 'bg-green-600' },
    { id: 'scholar', name: 'Научник', icon: '🎓', power: 'Мудрост', desc: 'Задачи со експерименти, табели и логика.', color: 'bg-purple-600' }
];

const ARTIFACTS = [
  { id: 1, name: "Трговска Вага", icon: <Scale size={24} className="text-amber-800" />, desc: "Ја мери вредноста на нештата.", rule: "Права пропорција: y = k·x" },
  { id: 2, name: "Кралски Златник", icon: <Coins size={24} className="text-amber-600" />, desc: "Симбол на правична поделба.", rule: "Делење: Собери ги деловите, па подели го вкупното." },
  { id: 3, name: "Магичен Еликсир", icon: <FlaskConical size={24} className="text-purple-700" />, desc: "Совршена смеса на состојки.", rule: "Рецепти: Односот (a:b) мора да остане ист." },
  { id: 4, name: "Древен Свиток", icon: <FileText size={24} className="text-slate-700" />, desc: "Табели со податоци.", rule: "Табела: Коефициентот k = y/x е константен." },
  { id: 5, name: "Златен Компас", icon: <Compass size={24} className="text-red-700" />, desc: "Покажува пат на мапата.", rule: "Размер: 1cm на мапа = n cm во природа." },
  { id: 6, name: "Крилеста Чизма", icon: <div className="text-2xl">🪽</div>, desc: "Брзина на патување.", rule: "Брзина: v = S / t (Пат поделено со Време)." },
  { id: 7, name: "Мајсторски Чекан", icon: <Hammer size={24} className="text-stone-700" />, desc: "Алатка за градба.", rule: "Обратна: Работници · Денови = Константа." }
];

const LEVELS = [
  { id: 1, x: 15, y: 75, title: "Пазар", category: "prop_direct_fruit", artifact: ARTIFACTS[0], bg: "bg-blue-50" },
  { id: 2, x: 35, y: 60, title: "Ризница", category: "ratio_share", artifact: ARTIFACTS[1], bg: "bg-yellow-50" },
  { id: 3, x: 25, y: 35, title: "Кула", category: "recipe_ratio", artifact: ARTIFACTS[2], bg: "bg-purple-50" },
  { id: 4, x: 55, y: 25, title: "Библиотека", category: "prop_table_fill", artifact: ARTIFACTS[3], bg: "bg-stone-100" },
  { id: 5, x: 80, y: 30, title: "Картографија", category: "map_scale", artifact: ARTIFACTS[4], bg: "bg-green-50" },
  { id: 6, x: 85, y: 60, title: "Канјон", category: "speed_distance", artifact: ARTIFACTS[5], bg: "bg-cyan-50" },
  { id: 7, x: 60, y: 80, title: "Пирамида", category: "prop_inverse_workers", artifact: ARTIFACTS[6], bg: "bg-orange-50" }
];

// --- ADVANCED PROBLEM GENERATOR ---
const generateProblem = (category: string, difficulty: number, heroId: string | undefined) => {
  // --- LEVEL 1: DIRECT PROPORTION ---
  if (category === 'prop_direct_fruit') {
    if (difficulty === 0) { // Easy
        const d = heroId === 'builder' ? {n:'тули', q1:10, p:50, q2:20, u:'пар.'} : 
                  heroId === 'explorer' ? {n:'шишиња вода', q1:5, p:100, q2:10, u:'пар.'} : 
                  {n:'тетратки', q1:2, p:60, q2:4, u:'пар.'};
        return { 
            data: {q1:d.q1, p1:d.p, unit:d.u},
            question: `Ако ${d.q1} ${d.u} ${d.n} чинат ${d.p} ден., колку чинат ${d.q2} ${d.u}?`, 
            answer: (d.p/d.q1)*d.q2, unit: 'ден.', 
            hint: `Ова е лесно: двојно повеќе количина = двојно повеќе пари.` 
        };
    } else if (difficulty === 1) { // Medium
        const d = heroId === 'builder' ? {n:'боја', q1:2.5, p:500, q2:4, u:'kg'} : 
                  heroId === 'explorer' ? {n:'гориво', q1:1.5, p:120, q2:5, u:'l'} : 
                  {n:'моливи', q1:6, p:234, q2:10, u:'пар.'};
        const unit = d.p/d.q1;
        return { 
            data: {q1:d.q1, p1:d.p, unit:d.u},
            question: `За ${d.q1} ${d.u} ${d.n} се плаќа ${d.p} ден. Колку чинат ${d.q2} ${d.u}?`, 
            answer: unit*d.q2, unit: 'ден.', 
            hint: `Прво најди цена за 1 ${d.u} (${d.p}:${d.q1}).`, 
            explanation: `1 ${d.u} чини ${unit} ден. ${d.q2} * ${unit} = ${unit*d.q2}.` 
        };
    } else { // BOSS
        return { 
            data: null,
            question: `БОС: Трговецот нуди зделка: 5 вреќи зачини за 2500 ден. или 8 вреќи за 3800 ден. Колку чинат 10 вреќи според поевтината понуда?`,
            answer: 4750, unit: 'ден.', 
            hint: `Пресметај ја поединечната цена (за 1 вреќа) за двете понуди и избери ја помалата.`,
            explanation: `Понуда 1: 2500/5=500 ден/вреќа. Понуда 2: 3800/8=475 ден/вреќа. Поевтино е 475. 10 * 475 = 4750.`
        };
    }
  }

  // --- LEVEL 2: RATIO SHARE ---
  if (category === 'ratio_share') {
      if (difficulty === 0) {
          return { data: {r1:1, r2:4}, question: `Подели 100 златници во размер 1:4. Колку е помалиот дел?`, answer: 20, unit: 'злат.', hint: `Вкупно делови: 1+4=5. 100:5=20.`, explanation: `Помалиот дел е 1 * 20 = 20.` };
      } else if (difficulty === 1) {
          const d = heroId === 'builder' ? {t:180, r1:4, r2:5, n:'kg малтер'} : heroId === 'explorer' ? {t:1000, r1:3, r2:7, n:'денари'} : {t:1200, r1:2, r2:3, n:'деца'};
          const p = d.t/(d.r1+d.r2);
          return { data: {r1:d.r1, r2:d.r2}, question: `Вкупно ${d.t} ${d.n} се делат во размер ${d.r1}:${d.r2}. Колку е поголемиот дел?`, answer: p*Math.max(d.r1,d.r2), unit: '', hint: `Најди 1 дел, па помножи со поголемиот број.`, explanation: `Вкупно делови: ${d.r1+d.r2}. Еден дел: ${p}. Поголемиот: ${Math.max(d.r1,d.r2)} * ${p}.` };
      } else { // BOSS
          return {
              data: null,
              question: `БОС: Наследство се дели во размер 3:5. Ако разликата меѓу деловите е 400 златници, колку изнесува вкупното наследство?`,
              answer: 1600, unit: 'злат.',
              hint: `Разликата во делови е 5-3=2 дела. 2 дела = 400.`,
              explanation: `2 дела = 400, значи 1 дел = 200. Вкупно има 3+5=8 дела. 8 * 200 = 1600.`
          };
      }
  }

  // --- LEVEL 3: RECIPES ---
  if (category === 'recipe_ratio') {
      if (difficulty === 0) return { data:{r1:4, r2:1}, question: `Однос вода:сок е 4:1. За 2 литри сок, колку вода треба?`, answer: 8, unit: 'l', hint: `4 пати повеќе вода.`, explanation: `2 * 4 = 8.` };
      if (difficulty === 1) return { data:{r1:3, r2:2}, question: `Рецепт: брашно и шеќер 3:2. За 600g брашно, колку шеќер?`, answer: 400, unit: 'g', hint: `600 е 3 дела. 1 дел е 200.`, explanation: `2 дела * 200 = 400.` };
      return {
          data: null,
          question: `БОС: За магичен бетон (Цемент:Песок:Камен) односот е 1:2:3. Ако вкупно ти требаат 1200kg бетон, колку песок ќе ставиш?`,
          answer: 400, unit: 'kg',
          hint: `Собери ги сите делови (1+2+3). Песокот е 2 дела.`,
          explanation: `Вкупно 6 делови. 1200:6 = 200kg по дел. Песок (2 дела) = 400kg.`
      };
  }

  // --- LEVEL 4: TABLES ---
  if (category === 'prop_table_fill') {
      if (difficulty === 0) return { data:{x1:1, y1:10, x2:5}, question: `Ако 1 молив е 10 ден, 2 се 20 ден. Колку се 5?`, answer: 50, unit: 'ден.', hint: `Лесно множење.`, explanation: `5 * 10 = 50.` };
      if (difficulty === 1) return { data:{x1:4, y1:48, x2:7}, question: `Табела: x=4, y=48. Најди y кога x=7.`, answer: 84, unit: '', hint: `k = 48/4 = 12.`, explanation: `y = 12 * 7 = 84.` };
      return {
          data: null,
          question: `БОС: Во табелата има вредности: (3, 15), (5, 25), (10, ?). Кој број недостасува за да биде права пропорција?`,
          answer: 50, unit: '',
          hint: `Коефициентот е ист секаде (15:3 = 5).`,
          explanation: `k=5. 10 * 5 = 50.`
      };
  }

  // --- LEVEL 5: MAP SCALE ---
  if (category === 'map_scale') {
      if (difficulty === 0) return { data:{cm:5, sc:100, u:'cm'}, question: `Размер 1:100. Ако на планот е 5cm, колку е во живо? (во cm)`, answer: 500, unit: 'cm', hint: `Само помножи со 100.`, explanation: `5 * 100 = 500.` };
      if (difficulty === 1) return { data:{cm:4, sc:500000, u:'km'}, question: `Мапа 1:500,000. Пат 4cm. Колку km е тоа?`, answer: 20, unit: 'km', hint: `4*500000 = 2000000cm. Претвори во km (дели со 100,000).`, explanation: `2000000 / 100000 = 20.` };
      if (heroId === 'builder') {
          return { data:null, question: `БОС: План 1:100. Собата на хартија е 3cm на 4cm. Колкава е реалната ПЛОШТИНА во m²?`, answer: 12, unit: 'm²', hint: `Пресметај ги реалните страни во метри, па помножи ги.`, explanation: `Страни: 3m и 4m. Плоштина = 3*4 = 12m².` };
      } else {
          return { data:null, question: `БОС: Размер 1:2,000,000. Растојанието е 8.5 cm. Колку km е тоа?`, answer: 170, unit: 'km', hint: `Внимавај со децималата.`, explanation: `8.5 * 20 = 170 km.` };
      }
  }

  // --- LEVEL 6: SPEED ---
  if (category === 'speed_distance') {
      if (difficulty === 0) return { data:{t:2}, question: `Возиш 60 km/h. Колку ќе поминеш за 2 часа?`, answer: 120, unit: 'km', hint: `Брзина * Време.`, explanation: `60 * 2 = 120.` };
      if (difficulty === 1) return { data:{t:4}, question: `Помина 240km за 4 часа. Колку ќе поминеш за 7 часа со иста брзина?`, answer: 420, unit: 'km', hint: `Најди брзина (240:4).`, explanation: `Брзина = 60 km/h. 60 * 7 = 420.` };
      return { 
          data:null,
          question: `БОС: Автомобил вози 80km/h, а камион 60km/h. Тргнуваат еден кон друг од градови оддалечени 280km. По колку часа ќе се сретнат?`,
          answer: 2, unit: 'h',
          hint: `Собирај ги брзините (се доближуваат со 80+60 km/h).`,
          explanation: `Вкупна брзина 140 km/h. Време = 280 / 140 = 2 часа.`
      };
  }

  // --- LEVEL 7: INVERSE (WORK) ---
  if (category === 'prop_inverse_workers') {
      if (difficulty === 0) return { data:{w1:4, d1:10}, question: `4 работници = 10 дена. 8 работници = ? дена.`, answer: 5, unit: 'дена', hint: `Двојно повеќе луѓе = двојно помалку време.`, explanation: `4*10=40. 40/8=5.` };
      if (difficulty === 1) return { data:{w1:6, d1:12}, question: `6 пумпи полнат базен за 12 часа. За колку ќе го наполнат 9 пумпи?`, answer: 8, unit: 'часа', hint: `Вкупно работа: 6*12=72. 72:9=?`, explanation: `72/9=8.` };
      return {
          data:null,
          question: `БОС: Мачка и пол, за ден и пол, јаде глувче и пол. Колку глувчиња ќе изедат 12 мачки за 30 дена?`,
          answer: 240, unit: 'глув.',
          hint: `Ова е трик! Најди колку јаде 1 мачка за 1 ден.`,
          explanation: `1 мачка за 1.5 ден јаде 1 глувче. За 1 ден јаде 2/3. (Или: 1 мачка јаде 1 глувче на 1.5 дена). За 30 дена (20 периоди), 1 мачка јаде 20. 12 мачки * 20 = 240.`
      };
  }

  return { question: "Error", answer: 0 };
};

// --- VISUAL MODELS ---
const VisualModel = ({ category, data, compact = false }: { category: string, data: any, compact?: boolean }) => {
  if (!data) return null;
  if (category === 'prop_direct_fruit') return <div className="flex gap-4 items-center justify-center p-2 bg-white/50 rounded"><div className="text-center">📦<br/>{data.q1} {data.unit} = {data.p1}</div><div>➜</div><div className="text-center">📦<br/>1 {data.unit} = ?</div></div>;
  if (category === 'ratio_share' || category === 'recipe_ratio') return <div className="flex flex-col gap-2 p-2"><div className="flex gap-1 items-center"><span className="w-8 text-right font-bold text-xs">{category === 'ratio_share' ? 'A' : '1'}:</span>{[...Array(Math.min(data.r1, 10))].map((_,i)=><div key={i} className={`w-4 h-4 bg-blue-500 rounded ${compact?'w-2 h-2':''}`}></div>)}</div><div className="flex gap-1 items-center"><span className="w-8 text-right font-bold text-xs">{category === 'ratio_share' ? 'B' : '2'}:</span>{[...Array(Math.min(data.r2, 10))].map((_,i)=><div key={i} className={`w-4 h-4 bg-green-500 rounded ${compact?'w-2 h-2':''}`}></div>)}</div></div>;
  if (category === 'prop_table_fill') return <div className="grid grid-cols-2 gap-px bg-slate-300 w-32 mx-auto text-center text-sm"><div className="bg-slate-100">X</div><div className="bg-slate-100">Y</div><div className="bg-white">{data.x1}</div><div className="bg-white">{data.y1}</div><div className="bg-yellow-100">{data.x2}</div><div className="bg-yellow-100 font-bold text-blue-600">?</div></div>;
  if (category === 'prop_inverse_workers') return <div className="flex flex-col gap-1 items-center"><span className="text-xs font-bold text-purple-700">Работа (Area)</span><div className="grid gap-0.5" style={{gridTemplateColumns:`repeat(${data.d1}, 1fr)`}}>{[...Array(Math.min(data.w1*data.d1, 50))].map((_,i)=><div key={i} className={`bg-purple-400 rounded-sm ${compact?'w-1 h-1':'w-3 h-3'}`}></div>)}</div></div>;
  if (category === 'speed_distance') return <div className="w-full h-4 bg-slate-200 rounded flex overflow-hidden">{[...Array(data.t)].map((_,i)=><div key={i} className="h-full bg-blue-400 border-r border-white/50 flex items-center justify-center text-[8px] text-white" style={{width:`${100/data.t}%`}}>1h</div>)}</div>;
  if (category === 'map_scale') return <div className="flex items-center justify-center gap-2"><div className="w-16 h-1 bg-slate-800 relative"><div className="absolute -top-3 w-full text-center text-[10px]">{data.cm}cm</div></div><span>= ? {data.u}</span></div>;
  return null;
};

const ScratchPad = ({ onClose }: { onClose: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null); 
  const contextRef = useRef<CanvasRenderingContext2D | null>(null); 
  const [isDrawing, setIsDrawing] = useState(false);
  
  useEffect(() => { 
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * 2; 
      canvas.height = canvas.offsetHeight * 2; 
      const ctx = canvas.getContext("2d");
      if (ctx) {
          ctx.scale(2, 2); 
          ctx.lineCap = "round"; 
          ctx.strokeStyle = "#2563eb"; 
          ctx.lineWidth = 3; 
          contextRef.current = ctx; 
      }
  }, []);
  
  const start = (e: any) => { 
      if (!contextRef.current) return;
      // Handle both mouse and touch events
      const { offsetX, offsetY } = e.nativeEvent ? e.nativeEvent : 
        (e.touches && e.touches[0] ? 
            { 
                offsetX: e.touches[0].clientX - e.target.getBoundingClientRect().left,
                offsetY: e.touches[0].clientY - e.target.getBoundingClientRect().top 
            } : { offsetX: 0, offsetY: 0 });

      contextRef.current.beginPath(); 
      contextRef.current.moveTo(offsetX, offsetY); 
      setIsDrawing(true); 
  };
  
  const end = () => { 
      if (contextRef.current) contextRef.current.closePath(); 
      setIsDrawing(false); 
  };
  
  const draw = (e: any) => { 
      if (!isDrawing || !contextRef.current) return; 
      const { offsetX, offsetY } = e.nativeEvent ? e.nativeEvent : 
      (e.touches && e.touches[0] ? 
          { 
              offsetX: e.touches[0].clientX - e.target.getBoundingClientRect().left,
              offsetY: e.touches[0].clientY - e.target.getBoundingClientRect().top 
          } : { offsetX: 0, offsetY: 0 });
      contextRef.current.lineTo(offsetX, offsetY); 
      contextRef.current.stroke(); 
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/95 z-50 flex flex-col p-4 animate-fade-in">
        <div className="flex justify-between mb-2">
            <span className="font-bold text-slate-500 flex gap-2"><PenTool/> Тетратка</span>
            <div className="flex gap-2">
                <button onClick={clearCanvas} className="bg-slate-100 px-3 py-1 rounded-full text-slate-600 text-xs font-bold flex items-center gap-1 hover:bg-slate-200">
                    <Eraser size={14}/> Избриши
                </button>
                <button onClick={onClose} className="bg-red-100 p-1 rounded-full text-red-500"><X/></button>
            </div>
        </div>
        <canvas 
            ref={canvasRef} 
            onMouseDown={start} 
            onMouseUp={end} 
            onMouseMove={draw} 
            onTouchStart={start} 
            onTouchEnd={end} 
            onTouchMove={draw} 
            className="flex-grow border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-crosshair touch-none" 
        />
    </div>
  );
};

// Global Styles Component
const GlobalStyles = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bree+Serif&family=Nunito:wght@400;700;900&display=swap');
      
      body { font-family: 'Nunito', sans-serif; }
      h1, h2, h3, .fantasy-font { font-family: 'Bree Serif', serif; }
      
      .pattern-grid {
        background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
        background-size: 20px 20px;
      }
      
      .animate-dash {
        stroke-dasharray: 10;
        animation: dash 30s linear infinite;
      }
      
      @keyframes dash {
        to { stroke-dashoffset: -1000; }
      }
      
      .paper-texture {
        background-color: #fffbf0;
        background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
      }
  
      .btn-3d {
        transition: all 0.1s;
        box-shadow: 0px 4px 0px 0px rgba(0,0,0,0.2);
      }
      .btn-3d:active {
        transform: translateY(4px);
        box-shadow: 0px 0px 0px 0px rgba(0,0,0,0.2);
      }
    `}</style>
);

// --- MAIN APP ---
export default function MathQuestApp() {
  const [gameState, setGameState] = useState('hero_select'); 
  const [hero, setHero] = useState<any>(null);
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [inventory, setInventory] = useState<any[]>([]);
  const [levelProgress, setLevelProgress] = useState(0); 
  const [currentProblem, setCurrentProblem] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null); 
  const [attempts, setAttempts] = useState(0);
  const [showScratch, setShowScratch] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showJournal, setShowJournal] = useState(false);
  const [score, setScore] = useState(0);
  const [questTime, setQuestTime] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [inputShake, setInputShake] = useState(false);
  const [mistakesLog, setMistakesLog] = useState<any[]>([]);
  const [showMistakes, setShowMistakes] = useState(false);
  
  // Teacher Admin State
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminMsg, setAdminMsg] = useState('');

  // Persistence (v27 - New Save Slot)
  useEffect(() => {
    const saved = localStorage.getItem('mathQuestFinal_v27');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUnlockedLevel(data.unlockedLevel || 1);
        setScore(data.score || 0);
        setMistakesLog(data.mistakesLog || []);
        const restoredInv = [];
        for(let i=1; i<data.unlockedLevel; i++) { if (i <= LEVELS.length) restoredInv.push(LEVELS[i-1].artifact); }
        setInventory(restoredInv);
      } catch(e){}
    }
  }, []);

  useEffect(() => { localStorage.setItem('mathQuestFinal_v27', JSON.stringify({ unlockedLevel, inventory, score, mistakesLog })); }, [unlockedLevel, inventory, score, mistakesLog]);

  useEffect(() => {
      let interval: any;
      if (gameState === 'level' && !feedback) {
          interval = setInterval(() => setQuestTime(t => t + 1), 1000);
      }
      return () => clearInterval(interval);
  }, [gameState, feedback]);

  const playFx = (type: string) => { if (audioEnabled) playSound(type); };
  const selectHero = (h: any) => { setHero(h); playFx('victory'); setGameState('map'); };

  const startLevel = (levelId: number) => {
    if (levelId > unlockedLevel) return;
    playFx('click');
    setCurrentLevelId(levelId); setLevelProgress(0); setGameState('level'); loadNextProblem(levelId, 0);
  };

  const loadNextProblem = (lvlId: number, progress: number) => {
    const levelData = LEVELS.find(l => l.id === lvlId);
    if (!levelData) return;
    // 0=Easy, 1=Medium, 2=Boss
    const problem = generateProblem(levelData.category, progress, hero?.id);
    setCurrentProblem({ ...problem, isBoss: progress === 2, category: levelData.category });
    setUserAnswer(''); setFeedback(null); setAttempts(0); setQuestTime(0); setShowConfetti(false);
  };

  const checkAnswer = () => {
    const num = parseFloat(userAnswer.toString().replace(/\s/g, '').replace(',', '.'));
    if (isNaN(num)) { setFeedback({ type: 'error', msg: 'Внеси број!' }); playFx('error'); return; }
    
    if (Math.abs(num - currentProblem.answer) < 0.1) {
        let pts = 100 + (levelProgress * 50); 
        const timeLimit = hero?.id === 'explorer' ? 45 : 30;
        if (questTime < timeLimit) pts += 50; 
        
        // Builder Power: Hints don't cost points
        if (attempts > 0 && hero?.id !== 'builder') pts = Math.max(10, pts - attempts * 30);
        
        setScore(s => s + pts);
        setFeedback({ type: 'success', msg: `Точно! +${pts} поени` }); 
        playFx('success');
        setShowConfetti(true);
    } else {
        const newAttempts = attempts + 1; setAttempts(newAttempts); playFx('error');
        setInputShake(true); setTimeout(()=>setInputShake(false), 500);
        
        // Log mistake if attempts == 1
        if (newAttempts === 1) {
            setMistakesLog(prev => [...prev, { q: currentProblem.question, a: currentProblem.answer, u: currentProblem.unit, e: currentProblem.explanation, category: currentProblem.category, data: currentProblem.data }]);
        }

        if (hero?.id === 'scholar' && newAttempts === 1) { setFeedback({ type: 'warning', msg: 'Научникот те штити од оваа грешка!' }); }
        else if (newAttempts >= 3) setFeedback({ type: 'error', msg: `Решение: ${currentProblem.answer}` });
        else setFeedback({ type: 'warning', msg: currentProblem.hint });
    }
  };

  const nextStep = () => {
    playFx('click');
    if (feedback?.type === 'success' || attempts >= 3) {
        const nextProg = levelProgress + 1;
        if (nextProg >= 3) completeLevel(); else { setLevelProgress(nextProg); loadNextProblem(currentLevelId, nextProg); }
    }
  };

  const completeLevel = () => {
      playFx('victory');
      const levelData = LEVELS.find(l => l.id === currentLevelId);
      if (!levelData) return;
      setUnlockedLevel(prev => {
          if (currentLevelId === prev && currentLevelId < LEVELS.length) return prev + 1;
          else if (currentLevelId === LEVELS.length) return LEVELS.length + 1;
          return prev;
      });
      setInventory(prev => {
          if (!prev.find(a => a.id === levelData.artifact.id)) return [...prev, levelData.artifact];
          return prev;
      });
      setGameState('victory');
  };
  
  // --- ADMIN FUNCTIONS ---
  const unlockMap = () => {
      if (adminPin === '314') {
          setUnlockedLevel(8); // Unlocks map interaction
          setAdminPin(''); 
          setAdminMsg("Мапата е отклучена! Можете да кликнете на кое било ниво.");
          setTimeout(() => { setShowAdmin(false); setAdminMsg(''); }, 2000);
      } else {
          setAdminMsg("Погрешен ПИН!");
      }
  };

  const completeGame = () => {
      if (adminPin === '314') {
          setUnlockedLevel(8); 
          setInventory(LEVELS.map(l => l.artifact)); // Fills artifacts to trigger victory screen
          setAdminPin(''); 
          setShowAdmin(false);
      } else {
          setAdminMsg("Погрешен ПИН!");
      }
  };

  // --- RENDERERS ---
  const renderMap = () => (
    <div className="min-h-screen bg-[#e6dcc3] p-4 font-serif relative overflow-hidden flex flex-col">
        <GlobalStyles />
        <div className="absolute inset-0 pointer-events-none opacity-40 paper-texture pattern-grid"></div>
        {showJournal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#fdf6e3] w-full max-w-lg rounded-2xl shadow-2xl border-4 border-[#8b7355] flex flex-col max-h-[80vh] animate-scale-up paper-texture">
                    <div className="bg-[#8b7355] p-4 flex justify-between items-center text-[#fdf6e3]">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Book/> Дневник</h2>
                        <button onClick={() => setShowJournal(false)}><X/></button>
                    </div>
                    <div className="p-4 overflow-y-auto space-y-4">
                        {LEVELS.map(lvl => {
                            const isUnlocked = inventory.find(a => a.id === lvl.artifact.id);
                            const demoProblem = generateProblem(lvl.category, 0, hero?.id);
                            return (
                                <div key={lvl.id} className={`p-4 rounded-xl border-2 ${isUnlocked ? 'bg-white border-[#8b7355]' : 'bg-gray-200 border-gray-300 opacity-60'}`}>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="text-2xl">{isUnlocked ? lvl.artifact.icon : '🔒'}</div>
                                        <div><h3 className="font-bold text-[#5c4a35]">{lvl.artifact.name}</h3><p className="text-xs text-slate-500">{isUnlocked ? lvl.artifact.desc : "????"}</p></div>
                                    </div>
                                    {isUnlocked && (
                                        <div className="mt-2 bg-amber-50 p-2 rounded border border-amber-100 flex flex-col gap-2">
                                            <p className="text-xs text-amber-900 font-bold">{lvl.artifact.rule}</p>
                                            <div className="opacity-80 scale-95 origin-left border-t border-amber-200 pt-2"><VisualModel category={lvl.category} data={demoProblem.data} compact={true}/></div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )}
        
        {/* Admin Modal */}
        {showAdmin && (
             <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                 <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl relative">
                     <button onClick={()=>setShowAdmin(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                     <h3 className="font-bold mb-4 text-center text-lg flex items-center justify-center gap-2"><Settings size={18}/> Наставнички Панел</h3>
                     <input type="password" placeholder="Внеси ПИН (314)" className="w-full border-2 border-slate-200 p-3 mb-4 rounded-lg text-center font-mono text-lg outline-none focus:border-blue-500" value={adminPin} onChange={e=>setAdminPin(e.target.value)} />
                     
                     {adminMsg && <div className="mb-4 p-2 bg-blue-50 text-blue-700 text-sm text-center rounded">{adminMsg}</div>}
                     
                     <div className="space-y-3">
                         <button onClick={unlockMap} className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 btn-3d"><Unlock size={18}/> Отклучи Мапа (Демо)</button>
                         <button onClick={completeGame} className="w-full bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 btn-3d"><Award size={18}/> Прикажи Диплома</button>
                     </div>
                 </div>
             </div>
        )}

        <div className="relative z-10 flex justify-between items-center bg-[#fdf6e3] border-4 border-[#8b7355] p-3 rounded-lg shadow-xl mb-4">
            <div className="flex items-center gap-3">
                <div className={`text-3xl rounded-full p-1 border-2 border-yellow-500 shadow-md ${hero?.color || 'bg-slate-800'}`}>{hero?.icon}</div>
                <div><h1 className="text-xl font-bold text-[#5c4a35] uppercase tracking-wide">Мапа на Тајните</h1><p className="text-xs text-[#8b7355] font-bold">Херој: {hero?.name} | Поени: {score}</p></div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setShowAdmin(true)} className="p-2 text-[#5c4a35] bg-[#e6dcc3] rounded-full border border-[#8b7355] opacity-50 hover:opacity-100 btn-3d"><Settings size={20}/></button>
                <button onClick={() => setShowJournal(true)} className="p-2 text-[#5c4a35] bg-[#e6dcc3] rounded-full border border-[#8b7355] btn-3d"><Book size={20}/></button>
                <button onClick={() => setAudioEnabled(!audioEnabled)} className="p-2 text-[#5c4a35] bg-[#e6dcc3] rounded-full border border-[#8b7355] btn-3d">{audioEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}</button>
                <button onClick={() => { localStorage.removeItem('mathQuestFinal_v27'); window.location.reload(); }} className="p-2 bg-red-100 text-red-600 rounded-full border border-red-300 btn-3d" title="Ресетирај Игра"><RefreshCw size={20}/></button>
            </div>
        </div>

        <div className="flex-grow relative w-full max-w-4xl mx-auto border-8 border-double border-[#8b7355] bg-[#fdf6e3] rounded-lg shadow-2xl overflow-hidden p-4 paper-texture">
            <div className="absolute top-10 right-10 opacity-20 text-[#8b7355] pointer-events-none"><Compass size={120} /></div>
            
            {/* SVG Paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {LEVELS.map((lvl, idx) => {
                    if (idx === LEVELS.length - 1) return null;
                    const next = LEVELS[idx + 1]; const revealed = unlockedLevel > idx;
                    return <line key={lvl.id} x1={`${lvl.x}%`} y1={`${lvl.y}%`} x2={`${next.x}%`} y2={`${next.y}%`} stroke={revealed ? "#8b4513" : "transparent"} strokeWidth="4" strokeDasharray="10, 5" strokeLinecap="round" className={revealed ? "animate-dash" : ""}/>;
                })}
            </svg>

            {LEVELS.map((lvl) => {
                if (lvl.id > unlockedLevel) return null; 
                const isCurrent = lvl.id === unlockedLevel; const isDone = lvl.id < unlockedLevel;
                return (
                    <div key={lvl.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ left: `${lvl.x}%`, top: `${lvl.y}%` }}>
                        <button onClick={() => startLevel(lvl.id)} className={`group flex flex-col items-center gap-2 transition-transform duration-300 ${isCurrent ? 'scale-110' : 'scale-100'}`}>
                            
                            {/* Current Hero Avatar Marker */}
                            {isCurrent && (
                                <div className="absolute -top-12 animate-bounce z-20 drop-shadow-lg">
                                    <div className={`text-4xl p-1 rounded-full border-2 border-white ${hero?.color || 'bg-slate-800'}`}>{hero?.icon}</div>
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center shadow-lg transition-transform group-hover:-translate-y-1 btn-3d ${isDone ? 'bg-[#556b2f] border-[#3d4d21] text-[#e6dcc3]' : isCurrent ? 'bg-[#cd853f] border-[#8b4513] text-white animate-pulse' : 'bg-gray-400'}`}>
                                {isDone ? <CheckCircle size={28}/> : lvl.id}
                            </div>
                            <div className={`px-2 py-1 bg-[#fdf6e3] border border-[#8b7355] rounded shadow text-xs font-bold text-[#5c4a35] whitespace-nowrap`}>{lvl.title}</div>
                        </button>
                    </div>
                )
            })}
        </div>
        
        <div className="mt-4 bg-[#5c4a35] p-3 rounded-lg shadow-inner flex justify-center gap-2 overflow-x-auto border-t-4 border-[#3e3223]">
            {ARTIFACTS.map(art => {
                const found = inventory.find(a => a.id === art.id);
                return <div key={art.id} className={`w-10 h-10 min-w-[2.5rem] bg-[#3e3223] rounded border-2 transition-all duration-500 ${found ? 'border-[#ffd700] shadow-[0_0_10px_gold] scale-110' : 'border-[#5c4a35]'} flex items-center justify-center`}>{found ? <div className="text-xl filter drop-shadow-md">{art.icon}</div> : <div className="text-[#5c4a35] text-xs">?</div>}</div>
            })}
        </div>

        {inventory.length === LEVELS.length && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white p-8 rounded-3xl max-w-lg w-full text-center border-4 border-yellow-400 shadow-2xl relative overflow-hidden print-container paper-texture">
                  {showMistakes ? (
                      <div className="h-full flex flex-col">
                          <h3 className="text-2xl font-bold text-red-600 mb-4">Твоите Грешки</h3>
                          <div className="flex-grow overflow-y-auto space-y-4 text-left p-2">
                              {mistakesLog.length === 0 ? <p className="text-center text-green-600">Немаше грешки! Браво!</p> : mistakesLog.map((m, i) => (
                                  <div key={i} className="bg-slate-50 p-3 rounded border border-slate-200">
                                      <p className="font-bold text-sm text-slate-800 mb-1">{m.q}</p>
                                      <p className="text-xs text-green-600 font-bold">Точно: {m.a} {m.u}</p>
                                      <p className="text-xs text-slate-500 mt-1">{m.e}</p>
                                  </div>
                              ))}
                          </div>
                          <button onClick={() => setShowMistakes(false)} className="mt-4 bg-slate-200 py-2 rounded font-bold">Назад</button>
                      </div>
                  ) : (
                    <>
                        <style>{`@media print { .print-container { position: absolute; top:0; left:0; width:100%; height:100%; border:none; box-shadow:none; } .no-print { display: none; } }`}</style>
                        <div className="mb-4 inline-block p-4 rounded-full bg-yellow-100 text-yellow-600 shadow-inner animate-spin-slow"><Star size={64} fill="currentColor"/></div>
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-2 fantasy-font">ЗЛАТНАТА СПИРАЛА!</h2>
                        <p className="text-slate-600 mb-6 text-sm">Ги собра сите делови. Погледни ја совршената хармонија.</p>
                        <div className="w-48 h-32 mx-auto mb-6 border-2 border-slate-300 relative bg-slate-50 overflow-hidden shadow-lg transform rotate-1">
                            <div className="absolute top-0 right-0 w-32 h-32 border border-amber-500 bg-amber-100"></div><div className="absolute top-0 right-32 w-16 h-16 border border-amber-500 bg-amber-200"></div><div className="absolute top-16 right-32 w-16 h-16 border border-amber-500 bg-amber-300"></div>
                            <svg className="absolute inset-0 w-full h-full pointer-events-none"><path d="M 192 0 A 192 192 0 0 1 0 192" fill="none" stroke="red" strokeWidth="2" /></svg>
                            <div className="absolute bottom-2 right-2 text-xs font-mono text-slate-400">φ ≈ 1.618</div>
                        </div>
                        
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 relative">
                            <div className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow">ОФИЦИЈАЛНО</div>
                            <h3 className="font-bold text-slate-700 uppercase mb-4 fantasy-font tracking-widest">📜 Диплома</h3>
                            <input type="text" placeholder="Твоето Име" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full text-center text-xl font-bold border-b-2 border-slate-300 bg-transparent mb-2 fantasy-font text-blue-900"/>
                            <div className="mt-4 text-2xl font-mono bg-slate-800 text-yellow-400 py-2 rounded tracking-widest">{score + 1000}-MST</div>
                        </div>

                        <div className="flex gap-2 no-print flex-col">
                            <button onClick={() => setShowMistakes(true)} className="bg-amber-100 text-amber-800 py-2 rounded font-bold flex items-center justify-center gap-2 hover:bg-amber-200 btn-3d"><ListX size={18}/> Прегледај Грешки</button>
                            <div className="flex gap-2">
                                <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 btn-3d"><Printer/> Печати</button>
                                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-900 transition btn-3d">Играј Повторно</button>
                            </div>
                        </div>
                    </>
                  )}
              </div>
          </div>
        )}
    </div>
  );

  const renderLevel = () => {
      const levelData = LEVELS.find(l => l.id === currentLevelId);
      if (!levelData) return null;
      const isBoss = currentProblem?.isBoss;
      // Get hero color for UI theme
      const heroColor = hero?.color.replace('bg-', '') || 'blue-600';
      
      return (
        <div className={`min-h-screen p-4 font-sans flex flex-col transition-colors duration-500 ${isBoss ? 'bg-slate-800' : levelData.bg} relative overflow-hidden`}>
            {/* Ambient Background for Level */}
            {!isBoss && <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")`}}></div>}
            
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                    <div className="absolute w-full h-full animate-pulse bg-green-100/20"></div>
                    <div className="text-6xl animate-bounce">🎉 ⭐ 🏆</div>
                </div>
            )}

            {showScratch && <ScratchPad onClose={() => setShowScratch(false)} />}
            
            <div className="flex justify-between items-center mb-6 relative z-10">
                <button onClick={() => { playFx('click'); setGameState('map'); }} className={`font-bold flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/20 transition ${isBoss ? 'text-white' : 'text-slate-700'}`}><ChevronRight className="rotate-180"/> Назад</button>
                <div className="flex gap-2">{[0,1,2].map(i => (<div key={i} className={`w-8 h-2 rounded-full transition-all ${i < levelProgress ? 'bg-green-500' : i === levelProgress ? 'bg-amber-500 scale-125' : 'bg-gray-300/50'}`}></div>))}</div>
                {isBoss && <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black tracking-widest animate-pulse shadow-lg shadow-red-500/50">BOSS</span>}
            </div>
            
            <div className="bg-white rounded-3xl shadow-2xl flex-grow flex flex-col relative overflow-hidden border border-slate-100 animate-slide-up">
                <div className={`p-6 text-white font-bold flex justify-between items-center relative overflow-hidden ${isBoss ? 'bg-slate-700' : hero?.color || 'bg-blue-600'}`}>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10 flex items-center gap-3"><span className="bg-white/20 px-3 py-1 rounded-lg text-sm uppercase tracking-wide shadow-sm">Ниво {currentLevelId}</span>{isBoss ? <AlertTriangle className="text-yellow-400"/> : <Calculator className="opacity-80"/>}</div>
                    <button onClick={() => { playFx('click'); setShowScratch(true); }} className="relative z-10 bg-white text-slate-800 p-2 rounded-lg hover:scale-110 transition shadow-lg btn-3d" title="Отвори Тетратка"><PenTool size={20} className={isBoss ? 'text-slate-700' : `text-${heroColor}`}/></button>
                </div>
                
                <div className="p-6 md:p-10 flex-grow flex flex-col justify-center max-w-2xl mx-auto w-full">
                    <p className="text-xl md:text-2xl font-medium text-slate-800 text-center mb-10 leading-relaxed font-serif">{currentProblem?.question}</p>
                    
                    <div className="flex flex-col gap-6">
                        <div className={`relative group transition-transform ${inputShake ? 'translate-x-2' : ''}`}>
                            <input type="text" inputMode="decimal" value={userAnswer} onChange={e => setUserAnswer(e.target.value)} placeholder="?" disabled={feedback?.type === 'success'} className="w-full text-center text-4xl font-bold py-4 border-b-4 border-slate-200 outline-none focus:border-blue-500 bg-transparent transition-colors text-slate-700" onKeyDown={(e) => e.key === 'Enter' && !feedback && checkAnswer()}/>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">{currentProblem?.unit}</span>
                        </div>
                        {!feedback || feedback.type === 'warning' ? (
                            <button onClick={checkAnswer} className={`w-full text-white py-5 rounded-2xl font-bold text-xl transition active:scale-95 shadow-xl btn-3d ${hero?.color || 'bg-blue-600'} hover:opacity-90`}>
                                Провери Одговор <ArrowRight className="inline ml-2"/>
                            </button>
                        ) : (
                            <button onClick={nextStep} className={`w-full py-5 rounded-2xl font-bold text-xl transition active:scale-95 shadow-xl flex items-center justify-center gap-2 btn-3d ${feedback.type === 'success' ? 'bg-green-500 text-white shadow-green-200/50' : 'bg-slate-800 text-white'}`}>{feedback.type === 'success' ? 'Продолжи' : 'Следна Задача'} <ChevronRight/></button>
                        )}
                    </div>
                    {feedback && (
                        <div className={`mt-8 p-5 rounded-2xl flex items-start gap-4 animate-fade-in ${feedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-100' : feedback.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                            <div className={`p-2 rounded-full shrink-0 ${feedback.type === 'success' ? 'bg-green-200' : feedback.type === 'warning' ? 'bg-amber-200' : 'bg-red-200'}`}>{feedback.type === 'success' ? <CheckCircle className="shrink-0" size={24}/> : feedback.type === 'warning' ? <HelpCircle className="shrink-0" size={24}/> : <XCircle className="shrink-0" size={24}/>}</div>
                            <div className="w-full">
                                <p className="font-bold text-lg">{feedback.msg}</p>
                                <div className="mt-4 p-3 bg-white/50 rounded-xl border border-black/5 shadow-inner">
                                    <VisualModel category={currentProblem.category} data={currentProblem.data} />
                                </div>
                                {feedback.type === 'error' && <p className="text-base mt-2 opacity-90 border-t border-red-200 pt-2">{currentProblem.explanation}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )
  };

  const renderVictory = () => {
      const levelData = LEVELS.find(l => l.id === currentLevelId);
      if (!levelData) return null;
      return (
          <div className={`min-h-screen flex items-center justify-center p-6 text-center font-sans relative overflow-hidden ${levelData.bg}`}>
               <GlobalStyles />
              <div className="z-10 max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border-4 border-white animate-scale-up paper-texture">
                  <div className="w-32 h-32 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center text-6xl shadow-inner animate-bounce border-4 border-white">{levelData.artifact.icon}</div>
                  <h1 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-wide fantasy-font">НИВОТО Е ПОМИНАТО!</h1>
                  <p className="text-slate-500 mb-8 text-lg">Го пронајде артефактот: <br/><strong className="text-slate-800 text-xl">{levelData.artifact.name}</strong></p>
                  <button onClick={() => { playFx('click'); setGameState('map'); }} className="w-full bg-amber-500 text-white font-bold py-4 rounded-xl hover:bg-amber-600 transition shadow-xl shadow-amber-200/50 flex items-center justify-center gap-2 btn-3d"><MapIcon size={20}/> Врати се на Мапата</button>
              </div>
          </div>
      )
  }

  // --- HERO SELECTION RENDER ---
  const renderHeroSelect = () => (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        <GlobalStyles />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-2 text-yellow-400 tracking-wider z-10 text-center fantasy-font drop-shadow-lg">ИЗБЕРИ ГО ТВОЈОТ ХЕРОЈ</h1>
        <p className="text-slate-400 mb-10 z-10 text-center text-lg">Секој херој има посебна моќ за решавање задачи.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl z-10 w-full">
            {HEROES.map(hero => (
                <button key={hero.id} onClick={() => selectHero(hero)} className="group bg-slate-800 border-2 border-slate-700 hover:border-yellow-400 rounded-2xl p-8 transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] flex flex-col items-center text-center btn-3d">
                    <div className="text-7xl mb-6 transform transition-transform group-hover:scale-125">{hero.icon}</div>
                    <h3 className="text-2xl font-bold mb-3">{hero.name}</h3>
                    <div className={`${hero.color} text-white px-3 py-1 rounded-full text-xs font-bold mb-4 flex items-center gap-1 uppercase tracking-wide`}><Zap size={12}/> {hero.power}</div>
                    <p className="text-sm text-slate-400 leading-relaxed">{hero.desc}</p>
                </button>
            ))}
        </div>
    </div>
  );

  return (
    <>
        {gameState === 'hero_select' && renderHeroSelect()}
        {gameState === 'map' && renderMap()}
        {gameState === 'level' && renderLevel()}
        {gameState === 'victory' && renderVictory()}
    </>
  );
}