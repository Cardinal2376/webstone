import React, { useState, useEffect, useMemo } from 'react';
import zhubaoImg from './images/zhubao.jpg';
import meibaoImg from './images/meibao.jpg';
import { Crown, Diamond, Scroll, RefreshCw, Trophy, AlertCircle, Play, Save, X, RotateCcw, Check, Hexagon, Hand, Dices, ArrowLeftRight } from 'lucide-react';

// --- 常量定义 ---

const COLORS = {
  BLUE: 'blue',
  WHITE: 'white',
  GREEN: 'green',
  BLACK: 'black',
  RED: 'red',
  PEARL: 'pearl',
  GOLD: 'gold',
  GREY: 'grey', // For Stick/Neutral
};

// Display Order for UI consistency
const DISPLAY_COLORS = [COLORS.BLUE, COLORS.WHITE, COLORS.GREEN, COLORS.BLACK, COLORS.RED, COLORS.PEARL, COLORS.GOLD];

const COLOR_MAP = {
  [COLORS.BLUE]: { bg: 'bg-blue-500', text: 'text-blue-900', ring: 'ring-blue-300', name: '蓝宝石' },
  [COLORS.WHITE]: { bg: 'bg-slate-100 shadow-inner border-slate-900', text: 'text-slate-800', ring: 'ring-slate-300', name: '钻石' },
  [COLORS.GREEN]: { bg: 'bg-emerald-500', text: 'text-emerald-900', ring: 'ring-emerald-300', name: '祖母绿' },
  [COLORS.BLACK]: { bg: 'bg-slate-800', text: 'text-slate-100', ring: 'ring-slate-500', name: '黑玛瑙' },
  [COLORS.RED]: { bg: 'bg-red-500', text: 'text-red-900', ring: 'ring-red-300', name: '红宝石' },
  [COLORS.PEARL]: { bg: 'bg-pink-300', text: 'text-pink-900', ring: 'ring-pink-200', name: '珍珠' },
  [COLORS.GOLD]: { bg: 'bg-yellow-400', text: 'text-yellow-900', ring: 'ring-yellow-200', name: '黄金' },
  [COLORS.GREY]: { bg: 'bg-stone-400', text: 'text-stone-900', ring: 'ring-stone-300', name: '通用' }, // Stick
};

const ABILITIES = {
  AGAIN: 'recycle', // 再次行动
  BONUS_TOKEN: 'add', // 拿取棋盘上一个同色代币
  STEAL: 'take', // 拿对手一个代币
  PRIVILEGE: 'privilege', // 拿一个特权
  STICK: 'stick', // 复制颜色 (作为万能颜色奖励)
};

const WIN_CONDITIONS = {
  POINTS: 20,
  CROWNS: 10,
  SINGLE_COLOR_POINTS: 10,
};

// --- CSV 数据 (内嵌) ---
// level,color,color_num,point,crowns,function,price_white,price_blue,price_green,price_red,price_black,price_pink
const RAW_CARD_DATA = [
  {level:1,color:'White',color_num:1,point:0,crowns:0,func:'none',price:{white:0,blue:1,green:1,red:1,black:1,pearl:0}},
  {level:1,color:'Blue',color_num:1,point:0,crowns:0,func:'none',price:{white:1,blue:0,green:1,red:1,black:1,pearl:0}},
  {level:1,color:'Green',color_num:1,point:0,crowns:0,func:'none',price:{white:1,blue:1,green:0,red:1,black:1,pearl:0}},
  {level:1,color:'Red',color_num:1,point:0,crowns:0,func:'none',price:{white:1,blue:1,green:1,red:0,black:1,pearl:0}},
  {level:1,color:'Black',color_num:1,point:0,crowns:0,func:'none',price:{white:1,blue:1,green:1,red:1,black:0,pearl:0}},
  {level:1,color:'White',color_num:1,point:1,crowns:0,func:'none',price:{white:0,blue:0,green:2,red:3,black:0,pearl:0}},
  {level:1,color:'Blue',color_num:1,point:1,crowns:0,func:'none',price:{white:0,blue:0,green:0,red:2,black:3,pearl:0}},
  {level:1,color:'Green',color_num:1,point:1,crowns:0,func:'none',price:{white:3,blue:0,green:0,red:0,black:2,pearl:0}},
  {level:1,color:'Red',color_num:1,point:1,crowns:0,func:'none',price:{white:2,blue:3,green:0,red:0,black:0,pearl:0}},
  {level:1,color:'Black',color_num:1,point:1,crowns:0,func:'none',price:{white:0,blue:2,green:3,red:0,black:0,pearl:0}},
  {level:1,color:'White',color_num:1,point:0,crowns:0,func:'recycle',price:{white:0,blue:2,green:2,red:0,black:0,pearl:1}},
  {level:1,color:'Blue',color_num:1,point:0,crowns:0,func:'recycle',price:{white:0,blue:0,green:2,red:2,black:0,pearl:1}},
  {level:1,color:'Green',color_num:1,point:0,crowns:0,func:'recycle',price:{white:0,blue:0,green:0,red:2,black:2,pearl:1}},
  {level:1,color:'Red',color_num:1,point:0,crowns:0,func:'recycle',price:{white:2,blue:0,green:0,red:0,black:2,pearl:1}},
  {level:1,color:'Black',color_num:1,point:0,crowns:0,func:'recycle',price:{white:2,blue:2,green:0,red:0,black:0,pearl:1}},
  {level:1,color:'White',color_num:1,point:0,crowns:1,func:'none',price:{white:0,blue:3,green:0,red:0,black:0,pearl:0}},
  {level:1,color:'Blue',color_num:1,point:0,crowns:1,func:'none',price:{white:0,blue:0,green:3,red:0,black:0,pearl:0}},
  {level:1,color:'Green',color_num:1,point:0,crowns:1,func:'none',price:{white:0,blue:0,green:0,red:3,black:0,pearl:0}},
  {level:1,color:'Red',color_num:1,point:0,crowns:1,func:'none',price:{white:0,blue:0,green:0,red:0,black:3,pearl:0}},
  {level:1,color:'Black',color_num:1,point:0,crowns:1,func:'none',price:{white:3,blue:0,green:0,red:0,black:0,pearl:0}},
  {level:1,color:'White',color_num:1,point:0,crowns:0,func:'add',price:{white:0,blue:0,green:0,red:2,black:2,pearl:0}},
  {level:1,color:'Blue',color_num:1,point:0,crowns:0,func:'add',price:{white:2,blue:0,green:0,red:0,black:2,pearl:0}},
  {level:1,color:'Green',color_num:1,point:0,crowns:0,func:'add',price:{white:2,blue:2,green:0,red:0,black:0,pearl:0}},
  {level:1,color:'Red',color_num:1,point:0,crowns:0,func:'add',price:{white:0,blue:2,green:2,red:0,black:0,pearl:0}},
  {level:1,color:'Black',color_num:1,point:0,crowns:0,func:'add',price:{white:0,blue:0,green:2,red:2,black:0,pearl:0}},
  {level:1,color:'Stick',color_num:1,point:1,crowns:0,func:'none',price:{white:2,blue:0,green:2,red:0,black:1,pearl:1}},
  {level:1,color:'Stick',color_num:1,point:1,crowns:0,func:'none',price:{white:0,blue:2,green:0,red:2,black:1,pearl:1}},
  {level:1,color:'Stick',color_num:1,point:1,crowns:0,func:'none',price:{white:0,blue:0,green:0,red:0,black:4,pearl:1}},
  {level:1,color:'Stick',color_num:1,point:0,crowns:1,func:'none',price:{white:4,blue:0,green:0,red:0,black:0,pearl:1}},
  {level:1,color:'none',color_num:0,point:3,crowns:0,func:'none',price:{white:0,blue:0,green:0,red:4,black:0,pearl:1}},

  {level:2,color:'White',color_num:1,point:1,crowns:0,func:'take',price:{white:0,blue:4,green:0,red:3,black:0,pearl:0}},
  {level:2,color:'Blue',color_num:1,point:1,crowns:0,func:'take',price:{white:0,blue:0,green:4,red:0,black:3,pearl:0}},
  {level:2,color:'Green',color_num:1,point:1,crowns:0,func:'take',price:{white:3,blue:0,green:0,red:4,black:0,pearl:0}},
  {level:2,color:'Red',color_num:1,point:1,crowns:0,func:'take',price:{white:0,blue:3,green:0,red:0,black:4,pearl:0}},
  {level:2,color:'Black',color_num:1,point:1,crowns:0,func:'take',price:{white:4,blue:0,green:3,red:0,black:0,pearl:0}},
  {level:2,color:'White',color_num:2,point:1,crowns:0,func:'none',price:{white:0,blue:5,green:2,red:0,black:0,pearl:0}},
  {level:2,color:'Blue',color_num:2,point:1,crowns:0,func:'none',price:{white:0,blue:0,green:5,red:2,black:0,pearl:0}},
  {level:2,color:'Green',color_num:2,point:1,crowns:0,func:'none',price:{white:0,blue:0,green:0,red:5,black:2,pearl:0}},
  {level:2,color:'Red',color_num:2,point:1,crowns:0,func:'none',price:{white:2,blue:0,green:0,red:0,black:5,pearl:0}},
  {level:2,color:'Black',color_num:2,point:1,crowns:0,func:'none',price:{white:5,blue:2,green:0,red:0,black:0,pearl:0}},
  {level:2,color:'White',color_num:1,point:2,crowns:0,func:'privilege',price:{white:4,blue:0,green:0,red:0,black:2,pearl:1}},
  {level:2,color:'Blue',color_num:1,point:2,crowns:0,func:'privilege',price:{white:2,blue:4,green:0,red:0,black:0,pearl:1}},
  {level:2,color:'Green',color_num:1,point:2,crowns:0,func:'privilege',price:{white:0,blue:2,green:4,red:0,black:0,pearl:1}},
  {level:2,color:'Red',color_num:1,point:2,crowns:0,func:'privilege',price:{white:0,blue:0,green:2,red:4,black:0,pearl:1}},
  {level:2,color:'Black',color_num:1,point:2,crowns:0,func:'privilege',price:{white:0,blue:0,green:0,red:2,black:4,pearl:1}},
  {level:2,color:'White',color_num:1,point:2,crowns:1,func:'none',price:{white:0,blue:0,green:2,red:2,black:2,pearl:1}},
  {level:2,color:'Blue',color_num:1,point:2,crowns:1,func:'none',price:{white:2,blue:0,green:0,red:2,black:2,pearl:1}},
  {level:2,color:'Green',color_num:1,point:2,crowns:1,func:'none',price:{white:2,blue:2,green:0,red:0,black:2,pearl:1}},
  {level:2,color:'Red',color_num:1,point:2,crowns:1,func:'none',price:{white:2,blue:2,green:2,red:0,black:0,pearl:1}},
  {level:2,color:'Black',color_num:1,point:2,crowns:1,func:'none',price:{white:0,blue:2,green:2,red:2,black:0,pearl:1}},
  {level:2,color:'Stick',color_num:1,point:0,crowns:2,func:'none',price:{white:0,blue:6,green:0,red:0,black:0,pearl:1}},
  {level:2,color:'Stick',color_num:1,point:0,crowns:2,func:'none',price:{white:0,blue:0,green:6,red:0,black:0,pearl:1}},
  {level:2,color:'Stick',color_num:1,point:2,crowns:0,func:'none',price:{white:0,blue:0,green:6,red:0,black:0,pearl:1}},
  {level:2,color:'none',color_num:0,point:5,crowns:0,func:'none',price:{white:0,blue:6,green:0,red:0,black:0,pearl:1}},

  {level:3,color:'White',color_num:1,point:3,crowns:2,func:'none',price:{white:0,blue:3,green:0,red:5,black:3,pearl:1}},
  {level:3,color:'Blue',color_num:1,point:3,crowns:2,func:'none',price:{white:3,blue:0,green:3,red:0,black:5,pearl:1}},
  {level:3,color:'Green',color_num:1,point:3,crowns:2,func:'none',price:{white:5,blue:3,green:0,red:3,black:0,pearl:1}},
  {level:3,color:'Red',color_num:1,point:3,crowns:2,func:'none',price:{white:0,blue:5,green:3,red:0,black:3,pearl:1}},
  {level:3,color:'Black',color_num:1,point:3,crowns:2,func:'none',price:{white:3,blue:0,green:5,red:3,black:0,pearl:1}},
  {level:3,color:'White',color_num:1,point:4,crowns:0,func:'none',price:{white:6,blue:2,green:0,red:0,black:2,pearl:0}},
  {level:3,color:'Blue',color_num:1,point:4,crowns:0,func:'none',price:{white:2,blue:6,green:2,red:0,black:0,pearl:0}},
  {level:3,color:'Green',color_num:1,point:4,crowns:0,func:'none',price:{white:0,blue:2,green:6,red:2,black:0,pearl:0}},
  {level:3,color:'Red',color_num:1,point:4,crowns:0,func:'none',price:{white:0,blue:0,green:2,red:6,black:2,pearl:0}},
  {level:3,color:'Black',color_num:1,point:4,crowns:0,func:'none',price:{white:2,blue:0,green:0,red:2,black:6,pearl:0}},
  {level:3,color:'none',color_num:0,point:6,crowns:0,func:'none',price:{white:8,blue:0,green:0,red:0,black:0,pearl:0}},
  {level:3,color:'Stick',color_num:1,point:3,crowns:0,func:'recycle',price:{white:0,blue:0,green:0,red:8,black:0,pearl:0}},
  {level:3,color:'Stick',color_num:1,point:0,crowns:3,func:'none',price:{white:0,blue:0,green:0,red:0,black:8,pearl:0}},
];

// --- 数据生成辅助函数 ---

const generateId = () => Math.random().toString(36).substr(2, 9);

// 螺旋坐标映射 (5x5 棋盘)
const SPIRAL_COORDS = [
  {r:2,c:2}, {r:2,c:1}, {r:1,c:1}, {r:1,c:2}, {r:1,c:3},
  {r:2,c:3}, {r:3,c:3}, {r:3,c:2}, {r:3,c:1}, {r:3,c:0},
  {r:2,c:0}, {r:1,c:0}, {r:0,c:0}, {r:0,c:1}, {r:0,c:2},
  {r:0,c:3}, {r:0,c:4}, {r:1,c:4}, {r:2,c:4}, {r:3,c:4},
  {r:4,c:4}, {r:4,c:3}, {r:4,c:2}, {r:4,c:1}, {r:4,c:0}
];

// 创建初始袋子
const createBag = () => {
  let bag = [];
  [COLORS.BLUE, COLORS.WHITE, COLORS.GREEN, COLORS.BLACK, COLORS.RED].forEach(c => {
    for(let i=0; i<4; i++) bag.push(c);
  });
  bag.push(COLORS.PEARL, COLORS.PEARL);
  for(let i=0; i<3; i++) bag.push(COLORS.GOLD);
  return bag.sort(() => Math.random() - 0.5);
};

// 转换 RAW 数据
const createDecksFromData = () => {
  const decks = { 1: [], 2: [], 3: [] };
  
  RAW_CARD_DATA.forEach(d => {
    const bonusColor = d.color === 'Stick' ? COLORS.GREY : (COLORS[d.color.toUpperCase()] || null);
    const cost = {};
    if(d.price.white > 0) cost[COLORS.WHITE] = d.price.white;
    if(d.price.blue > 0) cost[COLORS.BLUE] = d.price.blue;
    if(d.price.green > 0) cost[COLORS.GREEN] = d.price.green;
    if(d.price.red > 0) cost[COLORS.RED] = d.price.red;
    if(d.price.black > 0) cost[COLORS.BLACK] = d.price.black;
    if(d.price.pearl > 0) cost[COLORS.PEARL] = d.price.pearl;

    decks[d.level].push({
      id: generateId(),
      level: d.level,
      bonusColor: bonusColor,
      bonusCount: d.color_num, // 1 or 2
      cost: cost,
      points: d.point,
      crowns: d.crowns,
      ability: d.func === 'none' ? null : d.func
    });
  });

  // Shuffle
  decks[1].sort(() => Math.random() - 0.5);
  decks[2].sort(() => Math.random() - 0.5);
  decks[3].sort(() => Math.random() - 0.5);
  return decks;
};

const createRoyals = () => {
  return [
    { id: 'r1', points: 2, ability: 'recycle', text: '2分，再次行动' },
    { id: 'r2', points: 3, ability: null, text: '3分' },
    { id: 'r3', points: 2, ability: 'take', text: '2分，拿取对手1代币' },
    { id: 'r4', points: 2, ability: 'privilege', text: '2分，拿取1卷轴' },
  ];
};

// --- 组件 ---

const EditableName = ({ name, onChange, isCurrent, playerId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);

  useEffect(() => {
    setTempName(name);
  }, [name]);

  const handleSave = () => {
    if (tempName.trim()) {
      onChange(tempName);
    } else {
      setTempName(name); // Revert if empty
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex gap-1 items-center">
        <input 
          type="text" 
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          className="text-base font-bold text-slate-800 w-32 px-1 py-0.5 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoFocus
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
      </div>
    );
  }

  return (
    <span 
      id={`player-${playerId}-name`}
      onClick={() => setIsEditing(true)}
      className={`font-bold text-xl cursor-pointer hover:underline decoration-dashed underline-offset-4 ${isCurrent ? 'text-slate-800' : 'text-slate-500'}`}
      title="点击修改名字"
    >
      {name}
    </span>
  );
};

const FloatingText = ({ text, x, y, color = 'text-yellow-500' }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div 
            className={`fixed pointer-events-none z-[100] font-black text-2xl drop-shadow-md animate-float-up ${color}`}
            style={{ left: x, top: y }}
        >
            {text}
        </div>
    );
};

const TokenIcon = ({ color, size = 'md', className = '', count }) => {
  let sizeClass = 'w-8 h-8'; // default md
  if (size === 'sm') sizeClass = 'w-6 h-6';
  if (size === 'lg') sizeClass = 'w-12 h-12 md:w-14 md:h-14';
  if (size === 'xl') sizeClass = 'w-14 h-14 md:w-16 md:h-16';

  const bgClass = COLOR_MAP[color]?.bg || 'bg-gray-300';
  const ringClass = COLOR_MAP[color]?.ring || 'ring-gray-300';
  
  // 珍珠和黄金用特殊样式
  const isSpecial = color === COLORS.GOLD || color === COLORS.PEARL;
  
  return (
    <div className={`relative ${className}`}>
        <div className={`${bgClass} ${sizeClass} rounded-full border-2 border-white/80 shadow-md flex items-center justify-center ${isSpecial ? 'ring-2 ' + ringClass : ''}`} title={COLOR_MAP[color]?.name || color}>
        {color === COLORS.GOLD && <span className="text-xs md:text-sm text-yellow-900 font-black">G</span>}
        {color === COLORS.PEARL && <span className="text-xs md:text-sm text-pink-900 font-black">P</span>}
        {color === COLORS.GREY && <span className="text-xs text-stone-700 font-bold">?</span>}
        </div>
        {count !== undefined && (
            <div className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border border-white font-bold shadow-sm">
                {count}
            </div>
        )}
    </div>
  );
};

const CardView = ({ card, onClick, canBuy, isReserved = false, isSelected = false }) => {
  const costEntries = Object.entries(card.cost);
  
  return (
    <div 
      onClick={onClick}
      className={`relative w-24 h-32 rounded-lg border flex flex-col justify-between p-1 cursor-pointer transition-all hover:-translate-y-1 shadow-sm
        ${isSelected ? 'ring-4 ring-yellow-400 scale-105 z-10' : ''}
        ${canBuy ? 'border-green-500 shadow-green-200' : 'border-slate-200'}
        ${isReserved ? 'bg-yellow-50' : 'bg-white/90'}
      `}
    >
      {/* Header: Points & Crown */}
      <div className="flex justify-between items-start">
        <span className="font-black text-2xl leading-none text-slate-800 drop-shadow-sm">{card.points > 0 ? card.points : ''}</span>
        {card.crowns > 0 && (
          <div className="flex flex-col items-center -mt-0.5">
            {[...Array(card.crowns)].map((_, i) => <Crown key={i} size={12} className="text-yellow-600 fill-current mb-[-2px]" />)}
          </div>
        )}
        {/* Bonus Jewel */}
        {card.bonusColor && (
           <div className={`w-6 h-6 rounded border border-black/10 ${COLOR_MAP[card.bonusColor]?.bg || 'bg-gray-300'} shadow-sm flex items-center justify-center`}>
             {card.bonusCount > 1 && <span className="text-xs font-bold text-white/90">{card.bonusCount}</span>}
             {card.bonusColor === COLORS.GREY && <span className="text-[10px] font-bold text-stone-700">?</span>}
           </div>
        )}
      </div>

      {/* Ability Icon */}
      {card.ability && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1 shadow-sm border border-slate-100">
          {card.ability === 'recycle' && <RefreshCw size={18} className="text-indigo-600" />}
          {card.ability === 'privilege' && <Scroll size={18} className="text-pink-600" />}
          {card.ability === 'take' && <Hand size={18} className="text-red-600" />}
          {card.ability === 'add' && <Hexagon size={18} className="text-green-600 fill-green-100" />}
          {card.ability === 'stick' && <div className="text-xs font-bold text-stone-600">粘</div>}
        </div>
      )}

      {/* Cost */}
      <div className="flex flex-wrap gap-0.5 content-end justify-start">
        {costEntries.map(([color, count]) => {
          const isLight = color === COLORS.WHITE || color === COLORS.PEARL || color === COLORS.GOLD;
          return (
            <div key={color} className={`rounded-full px-1.5 py-[1px] text-[11px] font-bold flex items-center gap-0.5 shadow-sm ${COLOR_MAP[color]?.bg} ${isLight ? 'text-slate-900 border border-slate-300' : 'text-white'}`}>
              {count}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 主游戏逻辑 ---

export default function SplendorDuel() {
  // --- State ---
  const [history, setHistory] = useState([]); // Undo Stack
  const [future, setFuture] = useState([]); // Redo Stack
  
  // Game State
  const [board, setBoard] = useState(Array(25).fill(null));
  const [bag, setBag] = useState([]);
  const [decks, setDecks] = useState({ 1: [], 2: [], 3: [] });
  const [pyramid, setPyramid] = useState({ 1: [], 2: [], 3: [] });
  const [royals, setRoyals] = useState([]);
  
  const [players, setPlayers] = useState([
    { id: 0, name: '玩家 1', tokens: {}, cards: [], reserved: [], privileges: 0, crowns: 0, points: 0 },
    { id: 1, name: '玩家 2', tokens: {}, cards: [], reserved: [], privileges: 0, crowns: 0, points: 0 }
  ]);
  const [turn, setTurn] = useState(0); // 0 or 1
  const [phase, setPhase] = useState('OPTIONAL'); 
  // Phases: OPTIONAL, MANDATORY, USE_PRIVILEGE, DISCARD, ROYAL_SELECTION, GAME_OVER, STICK_SELECTION, STEAL_SELECTION, ADD_TOKEN_SELECTION
  
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null); // { card, type: 'board'|'reserved' }
  const [message, setMessage] = useState('游戏开始！');
  const [winner, setWinner] = useState(null);
  const [privilegeAvailable, setPrivilegeAvailable] = useState(3); 
  const [hasRefilled, setHasRefilled] = useState(false);
  const [logs, setLogs] = useState([]); // Game logs
  const [isProcessing, setIsProcessing] = useState(false); // Prevent rapid clicks

  // Dice State
  const [showDice, setShowDice] = useState(false);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  // Animation State
  const [animations, setAnimations] = useState([]); // [{ id, text, x, y, color }]

  const showAnimation = (text, selector, colorClass = 'text-yellow-500', offsetX = 0, offsetY = 0) => {
      const el = document.querySelector(selector);
      if (el) {
          const rect = el.getBoundingClientRect();
          const x = rect.left + rect.width / 2 + offsetX;
          const y = rect.top + rect.height / 2 + offsetY;
          const id = Date.now() + Math.random();
          setAnimations(prev => [...prev, { id, text, x, y, color: colorClass }]);
          
          // Auto remove from state after duration
          setTimeout(() => {
              setAnimations(prev => prev.filter(a => a.id !== id));
          }, 1500);
      }
  };

  // Temp state for Stick ability (attaching card)
  const [pendingStickCard, setPendingStickCard] = useState(null);
  const [pendingAddTokenColor, setPendingAddTokenColor] = useState(null); // For Add ability validation
  
  const [viewingPlayerCards, setViewingPlayerCards] = useState(null); // Player ID to show cards for

  // 初始化
  useEffect(() => {
    initGame();
  }, []);

  const addLog = (text) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs(prev => {
          // Filter duplicates within last 2 seconds
          if (prev.length > 0 && prev[0].text === text && (Date.now() - prev[0].timestamp < 2000)) {
              return prev;
          }
          return [{ id: Date.now() + Math.random(), timestamp: Date.now(), time, text }, ...prev];
      });
  };

  const exportGame = () => {
    const currentState = {
        board: board,
        bag: bag,
        decks: decks,
        pyramid: pyramid,
        royals: royals,
        players: players,
        turn,
        phase,
        privilegeAvailable,
        message,
        winner,
        logs,
        hasRefilled
    };
    const data = JSON.stringify({ history, currentState, future });
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(data).then(() => {
            alert("游戏记录已复制到剪贴板！");
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert("复制失败，请手动复制控制台输出。");
            console.log(data);
        });
    } else {
         console.log(data);
         alert("复制失败 (Clipboard API unavailable)，请查看控制台。");
    }
  };

  const importGame = () => {
      const data = prompt("请粘贴游戏记录 JSON:");
      if (!data) return;
      try {
          const { history: newHistory, currentState, future: newFuture } = JSON.parse(data);
          if (!currentState) throw new Error("Invalid Data");
          
          setHistory(newHistory || []);
          setFuture(newFuture || []);
          
          setBoard(currentState.board);
          setBag(currentState.bag);
          setDecks(currentState.decks);
          setPyramid(currentState.pyramid);
          setRoyals(currentState.royals);
          setPlayers(currentState.players);
          setTurn(currentState.turn);
          setPhase(currentState.phase);
          setPrivilegeAvailable(currentState.privilegeAvailable);
          setMessage(currentState.message);
          setWinner(currentState.winner);
          setLogs(currentState.logs || []);
          setHasRefilled(currentState.hasRefilled);
          
          alert("游戏记录导入成功！");
      } catch (e) {
          alert("导入失败：数据格式错误");
          console.error(e);
      }
  };

  const saveState = () => {
    const currentState = {
        board: JSON.parse(JSON.stringify(board)),
        bag: [...bag],
        decks: JSON.parse(JSON.stringify(decks)),
        pyramid: JSON.parse(JSON.stringify(pyramid)),
        royals: JSON.parse(JSON.stringify(royals)),
        players: JSON.parse(JSON.stringify(players)),
        turn,
        phase,
        privilegeAvailable,
        message,
        winner,
        logs,
        hasRefilled
    };
    setHistory(prev => [...prev, currentState]);
    setFuture([]); // Clear redo stack on new action
  };

  const undo = () => {
      if (history.length === 0) return;
      const prevState = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      
      // Save current state to Future for Redo
      const currentState = {
        board: JSON.parse(JSON.stringify(board)),
        bag: [...bag],
        decks: JSON.parse(JSON.stringify(decks)),
        pyramid: JSON.parse(JSON.stringify(pyramid)),
        royals: JSON.parse(JSON.stringify(royals)),
        players: JSON.parse(JSON.stringify(players)),
        turn,
        phase,
        privilegeAvailable,
        message,
        winner,
        logs,
        hasRefilled
      };
      setFuture(prev => [currentState, ...prev]);
      
      setBoard(prevState.board);
      setBag(prevState.bag);
      setDecks(prevState.decks);
      setPyramid(prevState.pyramid);
      setRoyals(prevState.royals);
      setPlayers(prevState.players);
      setTurn(prevState.turn);
      setPhase(prevState.phase);
      setPrivilegeAvailable(prevState.privilegeAvailable);
      setMessage(prevState.message);
      setWinner(prevState.winner);
      setLogs(prevState.logs || []);
      
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs(prevLogs => [{ id: Date.now(), time, text: `${players[turn].name} 执行了撤销` }, ...prevLogs]);

      setHasRefilled(prevState.hasRefilled);
      
      setHistory(newHistory);
      setSelectedCells([]);
      setSelectedCard(null);
      setPendingStickCard(null);
  };

  const redo = () => {
      if (future.length === 0) return;
      const nextState = future[0];
      const newFuture = future.slice(1);

      // Save current state to History
       const currentState = {
        board: JSON.parse(JSON.stringify(board)),
        bag: [...bag],
        decks: JSON.parse(JSON.stringify(decks)),
        pyramid: JSON.parse(JSON.stringify(pyramid)),
        royals: JSON.parse(JSON.stringify(royals)),
        players: JSON.parse(JSON.stringify(players)),
        turn,
        phase,
        privilegeAvailable,
        message,
        winner,
        logs,
        hasRefilled
      };
      setHistory(prev => [...prev, currentState]);

      setBoard(nextState.board);
      setBag(nextState.bag);
      setDecks(nextState.decks);
      setPyramid(nextState.pyramid);
      setRoyals(nextState.royals);
      setPlayers(nextState.players);
      setTurn(nextState.turn);
      setPhase(nextState.phase);
      setPrivilegeAvailable(nextState.privilegeAvailable);
      setMessage(nextState.message);
      setWinner(nextState.winner);
      setLogs(nextState.logs || []);
      setHasRefilled(nextState.hasRefilled);

      setFuture(newFuture);
      setSelectedCells([]);
      setSelectedCard(null);
      setPendingStickCard(null);
  };

  const initGame = () => {
    const newBag = createBag();
    const newDecks = createDecksFromData();
    
    // Pyramid: Level 3 (3 cards), Level 2 (4 cards), Level 1 (5 cards)
    const newPyramid = {
      3: newDecks[3].splice(0, 3),
      2: newDecks[2].splice(0, 4),
      1: newDecks[1].splice(0, 5)
    };
    
    // 填充棋盘
    const newBoard = Array(25).fill(null);
    let bagIdx = 0;
    for (let i = 0; i < SPIRAL_COORDS.length && bagIdx < newBag.length; i++) {
      const {r, c} = SPIRAL_COORDS[i];
      newBoard[r * 5 + c] = newBag[bagIdx++];
    }

    setBag(newBag.slice(bagIdx));
    setDecks(newDecks);
    setPyramid(newPyramid);
    setBoard(newBoard);
    setRoyals(createRoyals());
    setPlayers([
      { id: 0, name: '猪宝', tokens: {}, cards: [], reserved: [], privileges: 0, crowns: 0, points: 0 },
      { id: 1, name: '妹宝', tokens: {}, cards: [], reserved: [], privileges: 1, crowns: 0, points: 0 }
    ]);
    setPrivilegeAvailable(2); 
    setTurn(0);
    setPhase('OPTIONAL');
    setWinner(null);
    setHistory([]);
    setHasRefilled(false);
    setLogs([{ id: Date.now(), time: new Date().toLocaleTimeString(), text: '游戏开始！' }]);
    setMessage('游戏开始，玩家 1 请行动。');
  };

  // --- 辅助逻辑 ---

  const currentPlayer = players[turn];
  const opponent = players[turn === 0 ? 1 : 0];

  const getPlayerBonus = (player) => {
    const bonus = {};
    player.cards.forEach(c => {
      // Handle standard colored cards
      if (c.bonusColor && c.bonusColor !== COLORS.GREY) {
         bonus[c.bonusColor] = (bonus[c.bonusColor] || 0) + (c.bonusCount || 1);
      }
      // Stick cards inherit color
      if (c.bonusColor === COLORS.GREY && c.attachedToColor) {
         bonus[c.attachedToColor] = (bonus[c.attachedToColor] || 0) + 1;
      }
    });
    return bonus;
  };

  const getPlayerPointsByColor = (player) => {
      const points = {};
      player.cards.forEach(c => {
         const color = (c.bonusColor === COLORS.GREY && c.attachedToColor) ? c.attachedToColor : c.bonusColor;
         if(color && color !== COLORS.GREY) {
             points[color] = (points[color] || 0) + c.points;
         }
      });
      return points;
  };

  const calculateCost = (card, player) => {
    const bonus = getPlayerBonus(player);
    const cost = { ...card.cost };
    let missing = 0;
    const payment = {};

    Object.keys(cost).forEach(color => {
      const required = cost[color];
      const discount = bonus[color] || 0;
      const toPay = Math.max(0, required - discount);
      const has = player.tokens[color] || 0;

      if (has >= toPay) {
        payment[color] = toPay;
      } else {
        payment[color] = has;
        missing += (toPay - has);
      }
    });

    return { missing, payment };
  };

  const checkWin = (player) => {
    if (player.points >= WIN_CONDITIONS.POINTS) return true;
    if (player.crowns >= WIN_CONDITIONS.CROWNS) return true;
    
    // 10 Points in one color
    const pointsByColor = {};
    player.cards.forEach(c => {
       const color = (c.bonusColor === COLORS.GREY && c.attachedToColor) ? c.attachedToColor : c.bonusColor;
       if(color) {
           pointsByColor[color] = (pointsByColor[color] || 0) + c.points;
       }
    });
    if (Object.values(pointsByColor).some(p => p >= WIN_CONDITIONS.SINGLE_COLOR_POINTS)) return true;
    
    return false;
  };

  const endTurn = () => {
    if (checkWin(currentPlayer)) {
      setWinner(currentPlayer);
      setPhase('GAME_OVER');
      addLog(`游戏结束！${currentPlayer.name} 获胜！`);
      return;
    }

    const totalTokens = Object.values(currentPlayer.tokens).reduce((a, b) => a + b, 0);
    if (totalTokens > 10) {
      setPhase('DISCARD');
      setMessage(`你的代币超过10个 (${totalTokens})，请弃置多余的代币。`);
      return;
    }

    setTurn(turn === 0 ? 1 : 0);
    setPhase('OPTIONAL');
    setSelectedCells([]);
    setSelectedCard(null);
    setPendingStickCard(null);
    setPendingAddTokenColor(null);
    setHasRefilled(false);
    setMessage(`${players[turn === 0 ? 1 : 0].name} 的回合。`);
  };

  // --- 动作实现 ---

  const usePrivilege = () => {
    if (phase !== 'OPTIONAL') return;
    if (currentPlayer.privileges <= 0) {
      alert("你没有卷轴！");
      return;
    }
    if (hasRefilled) {
        alert("本回合已补充过棋盘，无法再使用卷轴（顺序限制）。");
        return;
    }
    saveState(); // Save before action
    setMessage("使用卷轴：请点击棋盘上的一个宝石或珍珠（不可选黄金）。");
    setPhase('USE_PRIVILEGE');
  };

  const handlePrivilegeClick = (idx) => {
    const token = board[idx];
    if (!token || token === COLORS.GOLD) {
      alert("必须选择非黄金代币。");
      return;
    }
    
    const newBoard = [...board];
    newBoard[idx] = null;
    const newPlayers = [...players];
    const p = newPlayers[turn];
    
    p.tokens[token] = (p.tokens[token] || 0) + 1;
    p.privileges -= 1;
    setPrivilegeAvailable(prev => prev + 1);

    showAnimation(`-1`, `#player-${p.id}-privilege-container`, 'text-red-500', 0, -20);
    showAnimation(`+1`, `#player-${p.id}-token-${token}`, 'text-green-500', 0, -10);

    setBoard(newBoard);
    setPlayers(newPlayers);
    setPhase('OPTIONAL'); 
    addLog(`${p.name} 使用卷轴，拿取了一个 ${COLOR_MAP[token].name}`);
    setMessage("卷轴使用完毕。");
  };

  const refillBoard = () => {
    if (phase !== 'OPTIONAL') return;
    if (bag.length === 0) {
      alert("袋子已空，无法补充。");
      return;
    }
    
    // Logic check: User must have empty board? No, rule says "at start of turn (optional)".
    // Rule: "Optional Action: Replenish the Game Board... until bag is empty."
    // Active state handled by button disabled logic below.
    
    saveState();
    setHasRefilled(true);

    const newBoard = [...board];
    let bagIdx = 0;
    const currentBag = [...bag];
    
    // Collect empty positions in spiral order
    const emptyPositions = [];
    for (let i = 0; i < SPIRAL_COORDS.length && bagIdx < currentBag.length; i++) {
      const {r, c} = SPIRAL_COORDS[i];
      const idx = r * 5 + c;
      if (newBoard[idx] === null) {
        emptyPositions.push({ idx, token: currentBag[bagIdx++] });
      }
    }

    // Clear board first
    const clearedBoard = [...board];
    emptyPositions.forEach(({ idx }) => {
      clearedBoard[idx] = null;
    });
    setBoard(clearedBoard);

    // Animate tokens appearing one by one
    emptyPositions.forEach(({ idx, token }, index) => {
      setTimeout(() => {
        setBoard(prev => {
          const updated = [...prev];
          updated[idx] = token;
          return updated;
        });
      }, index * 80); // 80ms delay between each token
    });

    setBag(currentBag.slice(bagIdx));

    const newPlayers = [...players];
    const oppIdx = turn === 0 ? 1 : 0;
    if (privilegeAvailable > 0) {
      newPlayers[oppIdx].privileges += 1;
      setPrivilegeAvailable(prev => prev - 1);
      showAnimation(`+1`, `#player-${oppIdx}-privilege-container`, 'text-pink-500', 0, -20);
    } else if (newPlayers[turn].privileges > 0) {
       newPlayers[oppIdx].privileges += 1;
       newPlayers[turn].privileges = Math.max(0, newPlayers[turn].privileges - 1);
       showAnimation(`-1`, `#player-${turn}-privilege-container`, 'text-red-500', 0, -20);
       showAnimation(`+1`, `#player-${oppIdx}-privilege-container`, 'text-pink-500', 0, -20);
    }
    
    setPlayers(newPlayers);
    addLog(`${players[turn].name} 补充了棋盘，对手获得一个卷轴`);
    setMessage("棋盘已补充，对手获得一个卷轴。");
  };

  const isValidSelection = (indices) => {
    if (indices.length === 0) return false;
    if (indices.length > 3) return false;
    // Check for gold
    if (indices.some(i => board[i] === COLORS.GOLD)) return false;
    
    if (indices.length === 1) return true;

    // Sort indices to make it easier
    const sorted = [...indices].sort((a, b) => a - b);
    
    // Convert to row/col
    const coords = sorted.map(i => ({ r: Math.floor(i / 5), c: i % 5 }));

    // Check if all same row
    const isSameRow = coords.every(p => p.r === coords[0].r);
    if (isSameRow) {
        // Check adjacency: consecutive columns
        return coords.every((p, i) => i === 0 || p.c === coords[i-1].c + 1);
    }

    // Check if all same col
    const isSameCol = coords.every(p => p.c === coords[0].c);
    if (isSameCol) {
        // Check adjacency: consecutive rows
        return coords.every((p, i) => i === 0 || p.r === coords[i-1].r + 1);
    }

    // Check diagonals
    // Main diagonal (dr = 1, dc = 1) => idx diff is 6
    // Anti diagonal (dr = 1, dc = -1) => idx diff is 4
    
    // Calculate diffs between sorted indices
    const diffs = [];
    for(let i=1; i<sorted.length; i++) {
        diffs.push(sorted[i] - sorted[i-1]);
    }
    
    // If all diffs are 6, check boundary wrapping
    if (diffs.every(d => d === 6)) {
        // Check valid diagonal geometry (not wrapping around board edges)
        // For +6 (dr=1, dc=1), each step col must increase by 1
        return coords.every((p, i) => i === 0 || p.c === coords[i-1].c + 1);
    }

    // If all diffs are 4, check boundary wrapping
    if (diffs.every(d => d === 4)) {
        // For +4 (dr=1, dc=-1), each step col must decrease by 1
        return coords.every((p, i) => i === 0 || p.c === coords[i-1].c - 1);
    }

    return false;
  };

  const handleCardClick = (card, type) => {
    if (phase !== 'OPTIONAL' && phase !== 'MANDATORY') return;
    setSelectedCard({ card, type });
  };

  const handleBoardClick = (idx) => {
    if (phase === 'USE_PRIVILEGE') {
      handlePrivilegeClick(idx);
      return;
    }
    if (phase === 'ADD_TOKEN_SELECTION') {
        handleAddTokenSelection(idx);
        return;
    }
    if (phase !== 'OPTIONAL' && phase !== 'MANDATORY') return;
    
    const token = board[idx];
    if (!token) return;

    // Clear card selection if clicking board
    setSelectedCard(null);

    let newSelection = [];
    if (selectedCells.includes(idx)) {
      newSelection = selectedCells.filter(i => i !== idx);
      // If deselecting breaks connectivity, it's allowed (user might be correcting)
      // But we only validate on "Take" button, or validation on click?
      // Better UX: Allow free selection, validate on Confirm. 
      // Or strict selection? Strict is better for learning rules.
      // Let's allow free click toggle, but visual feedback or validation on confirm.
      // User asked for: "You didn't judge strict line rule".
      // So we will use isValidSelection on confirm.
    } else {
      if (selectedCells.length >= 3) return;
      newSelection = [...selectedCells, idx];
    }
    
    if (phase === 'OPTIONAL' && newSelection.length > 0) {
         saveState(); 
         setPhase('MANDATORY');
    }

    setSelectedCells(newSelection);
  };

  const confirmTakeTokens = () => {
    if (isProcessing) return;
    if (selectedCells.length === 0) return;
    if (!isValidSelection(selectedCells)) {
        alert("选择无效！必须是同一行、同一列或对角线上的连续代币。");
        return;
    }

    setIsProcessing(true);

    const tokensTaken = selectedCells.map(i => board[i]);
    const newPlayers = [...players];
    const p = newPlayers[turn];
    const opp = newPlayers[turn === 0 ? 1 : 0];

    // Aggregate token counts for animation
    const tokenCounts = {};
    tokensTaken.forEach(t => {
        p.tokens[t] = (p.tokens[t] || 0) + 1;
        tokenCounts[t] = (tokenCounts[t] || 0) + 1;
    });

    // Trigger animations
    Object.entries(tokenCounts).forEach(([color, count], index) => {
        setTimeout(() => {
             showAnimation(`+${count}`, `#player-${p.id}-token-${color}`, 'text-green-500', 0, -10);
        }, index * 150);
    });

    const newBoard = [...board];
    selectedCells.forEach(i => newBoard[i] = null);
    setBoard(newBoard);

    // Special rules
    const colors = tokensTaken.filter(t => t !== COLORS.PEARL);
    const pearls = tokensTaken.filter(t => t === COLORS.PEARL);
    const isThreeSame = colors.length === 3 && colors.every(c => c === colors[0]);
    const isTwoPearls = pearls.length >= 2;

    if (isThreeSame || isTwoPearls) {
       if (privilegeAvailable > 0) {
         opp.privileges++;
         setPrivilegeAvailable(prev => prev - 1);
         addLog(`触发特殊规则（同色/双珍珠）：对手获得一个卷轴`);
         
         showAnimation(`+1`, `#player-${opp.id}-privilege-container`, 'text-pink-500', 0, -20);

       } else if (p.privileges > 0) {
         opp.privileges++;
         p.privileges--;
         addLog(`触发特殊规则（同色/双珍珠）：对手抢夺一个卷轴`);

         showAnimation(`-1`, `#player-${p.id}-privilege-container`, 'text-red-500', 0, -20);
         showAnimation(`+1`, `#player-${opp.id}-privilege-container`, 'text-pink-500', 0, -20);
       }
    }

    setPlayers(newPlayers);
    
    // Log tokens taken details
    const counts = {};
    tokensTaken.forEach(t => counts[t] = (counts[t] || 0) + 1);
    const desc = Object.entries(counts).map(([c, n]) => `${n}${COLOR_MAP[c].name}`).join(', ');
    addLog(`${p.name} 拿取了: ${desc}`);
    
    endTurn();
    setIsProcessing(false);
  };

  const selectRoyal = (royal) => {
    const newPlayers = [...players];
    const p = newPlayers[turn];
    
    p.points += royal.points;
    setRoyals(royals.filter(r => r.id !== royal.id));
    setPlayers(newPlayers);
    addLog(`${p.name} 领取了皇家卡（${royal.points}分）`);
    
    // Royals might have abilities too
     if (royal.ability === 'recycle') {
        setPhase('OPTIONAL');
        setMessage("皇家奖励：再次行动！");
    } else if (royal.ability === 'take') {
         handleAbility('take', newPlayers, royal);
    } else if (royal.ability === 'privilege') {
         handleAbility('privilege', newPlayers, royal);
    } else {
        endTurn();
    }
  };

  // Reserve
  const executeReserve = (card, fromPyramid = true) => {
    if (currentPlayer.reserved.length >= 3) {
      alert("保留区已满。");
      return;
    }
    const goldIdx = board.findIndex(t => t === COLORS.GOLD);
    if (goldIdx === -1) {
        // Rule nuance: can reserve without gold? User said "Take 1 gold AND reserve".
        // Usually if no gold, you can still reserve but get no gold.
        // User text: "不可执行的情况：游戏板上无黄金代币". Strictly followed.
        alert("棋盘无黄金，无法保留。");
        return;
    }

    if (phase === 'OPTIONAL') saveState();

    const newBoard = [...board];
    newBoard[goldIdx] = null;
    setBoard(newBoard);

    const newPlayers = [...players];
    newPlayers[turn].tokens[COLORS.GOLD] = (newPlayers[turn].tokens[COLORS.GOLD] || 0) + 1;
    newPlayers[turn].reserved.push(card);
    setPlayers(newPlayers);

    const goldMsg = board.includes(COLORS.GOLD) ? "，并获得了 1个黄金" : ""; // Note: logic in reserve checked this, but here we assume success
    // Actually we already updated state so checking board now might be stale? 
    // No, we setBoard BEFORE this. But we removed Gold.
    // So gold was taken if it was valid.
    
    const cardInfo = `(${card.points}分${card.bonusColor ? ', ' + (COLOR_MAP[card.bonusColor]?.name || card.bonusColor) : ''})`;
    if (fromPyramid) {
      replaceCardInPyramid(card);
      addLog(`${newPlayers[turn].name} 保留了一张 Level ${card.level} 卡牌 ${cardInfo}${goldMsg}`);
    } else {
      setDecks(prev => {
        const newDeck = [...prev[card.level]];
        newDeck.pop();
        return { ...prev, [card.level]: newDeck };
      });
      addLog(`${newPlayers[turn].name} 盲抽保留了一张 Level ${card.level} 卡牌${goldMsg}`);
    }
    
    endTurn();
  };

  const replaceCardInPyramid = (cardToRemove) => {
    const lvl = cardToRemove.level;
    const currentLevelCards = [...pyramid[lvl]];
    const currentDeck = [...decks[lvl]];
    
    const idx = currentLevelCards.findIndex(c => c && c.id === cardToRemove.id);
    if (idx !== -1) {
        if (currentDeck.length > 0) {
            currentLevelCards[idx] = currentDeck.pop();
        } else {
            currentLevelCards[idx] = null; 
        }
    }
    
    setPyramid(prev => ({ ...prev, [lvl]: currentLevelCards }));
    setDecks(prev => ({ ...prev, [lvl]: currentDeck }));
  };

  // Buy
  const executeBuy = (card, isReserved) => {
    if (isProcessing) return;
    
    const { missing, payment } = calculateCost(card, currentPlayer);
    const playerGold = currentPlayer.tokens[COLORS.GOLD] || 0;

    if (missing > playerGold) {
      alert("资源不足！");
      return;
    }

    setIsProcessing(true);

    if (phase === 'OPTIONAL') saveState();

    const newPlayers = [...players];
    const p = newPlayers[turn];

    // Pay
    Object.entries(payment).forEach(([c, amount]) => p.tokens[c] -= amount);
    if (missing > 0) p.tokens[COLORS.GOLD] -= missing;

    // Log detailed info
    const costStr = Object.entries(card.cost).map(([c, v]) => `${v}${COLOR_MAP[c].name}`).join(', ');
    const paidStr = Object.entries(payment).filter(([_,v])=>v>0).map(([c, v]) => `${v}${COLOR_MAP[c].name}`).join(', ');
    const goldStr = missing > 0 ? `，并使用了 ${missing}个黄金替代` : '';
    const abilityMap = { recycle: '再次行动', add: '获得同色代币', take: '拿取对手代币', privilege: '拿取卷轴', stick: '复制颜色' };
    const abilityStr = card.ability ? ` [功能:${abilityMap[card.ability] || card.ability}]` : '';
    const bonusStr = card.bonusColor ? ` [奖励:${COLOR_MAP[card.bonusColor]?.name || card.bonusColor} x${card.bonusCount||1}]` : '';
    addLog(`${p.name} 购买了 Level ${card.level} 卡牌 (${card.points}分)${bonusStr}${abilityStr}。原价: ${costStr}。支付: ${paidStr}${goldStr}。`);

    // Add card
    p.cards.push(card);
    
    // Animations for card gain
    if (card.bonusColor) {
        showAnimation(`+1`, `#player-${p.id}-bonus-${card.bonusColor}`, 'text-blue-600', 0, -20);
    }
    if (card.points > 0) {
        showAnimation(`+${card.points}`, `#player-${p.id}-points`, 'text-blue-600', 0, -20);
    }
    if (card.crowns > 0) {
         showAnimation(`+${card.crowns}`, `#player-${p.id}-crowns`, 'text-yellow-600', 0, -20);
    }

    p.points += card.points;
    p.crowns += card.crowns;

    if (isReserved) {
      p.reserved = p.reserved.filter(c => c.id !== card.id);
    } else {
      replaceCardInPyramid(card);
    }

    // Return tokens to bag
    const newBag = [...bag];
    Object.entries(payment).forEach(([c, amount]) => {
        for(let k=0; k<amount; k++) newBag.push(c);
    });
    for(let k=0; k<missing; k++) newBag.push(COLORS.GOLD);
    setBag(newBag.sort(() => Math.random() - 0.5));
    setPlayers(newPlayers);
    // Log moved up for detail access

    setSelectedCard(null); // Auto close modal
    // Logic flow: Check Royal -> Check Ability -> End
    checkRoyalAndAbility(newPlayers, card);
    setIsProcessing(false);
  };

  const checkRoyalAndAbility = (currentPlayers, card) => {
      const player = currentPlayers[turn];
      // Check Royals
      const crowns = player.crowns;
      // Trigger if we hit 3 or 6 crowns exactly? Or just have enough.
      // Assuming we handle "taken" logic by checking if we already have the royal? 
      // The simplified logic: if (crowns >= 3 && preCrowns < 3) ...
      // But we don't have preCrowns easily.
      // Let's rely on the fact that we just added crowns.
      // If we have >= 3 crowns and don't have a 3-crown royal? No.
      // The prompt implied repetitive checks, maybe we should be careful.
      // For now, keep the trigger logic simple but pass the updated players.
      
      const triggerRoyal = (crowns >= 3 && crowns - card.crowns < 3) || 
                           (crowns >= 6 && crowns - card.crowns < 6);

      if (triggerRoyal && royals.length > 0) {
          setPhase('ROYAL_SELECTION');
          // Note: We don't call setPlayers here because executeBuy already did, 
          // and we haven't modified players further yet.
      }
      
      if (card.bonusColor === COLORS.GREY) {
          setPendingStickCard(card);
          setPhase('STICK_SELECTION');
          setMessage("请选择你的一张已有颜色卡牌进行关联 (Stick)");
      } else if (card.ability) {
          handleAbility(card.ability, currentPlayers, card);
      } else if (triggerRoyal && royals.length > 0) {
          setPhase('ROYAL_SELECTION');
          setMessage("恭喜获得皇冠！请选择皇家卡。");
      } else {
          endTurn();
      }
  };

  const handleAbility = (ability, passedPlayers = null, card = null) => {
      // Use passedPlayers if available (from executeBuy), else clone state
      const activePlayers = passedPlayers ? [...passedPlayers] : [...players];
      const p = activePlayers[turn];
      const opp = activePlayers[turn === 0 ? 1 : 0];

      if (ability === 'recycle') { // AGAIN
          setMessage("再次行动！");
          addLog(`${p.name} 触发能力：再次行动`);
          showAnimation("Again!", `#player-${p.id}-name`, 'text-indigo-500', 0, -40);
          setPhase('OPTIONAL'); 
          // Ensure players are updated if we modified them (we didn't here, but consistent)
          if(passedPlayers) setPlayers(activePlayers);
      } else if (ability === 'privilege') {
          if (privilegeAvailable > 0) {
              p.privileges++;
              setPrivilegeAvailable(v => v-1);
              showAnimation(`+1`, `#player-${p.id}-privilege-container`, 'text-pink-500', 0, -20);
          } else if (opp.privileges > 0) {
              opp.privileges--;
              p.privileges++;
              showAnimation(`-1`, `#player-${opp.id}-privilege-container`, 'text-red-500', 0, -20);
              showAnimation(`+1`, `#player-${p.id}-privilege-container`, 'text-pink-500', 0, -20);
          }
          addLog(`${p.name} 触发能力：获得卷轴`);
          setPlayers(activePlayers);
          checkRoyalAfterAbility();
      } else if (ability === 'take') { // Steal
          setPhase('STEAL_SELECTION');
          setMessage("能力触发：请点击对手的一枚代币（非黄金）进行偷取。");
          if(passedPlayers) setPlayers(activePlayers);
      } else if (ability === 'add') { // Bonus Token
          // Use the passed card to determine color
          const targetCard = card || p.cards[p.cards.length - 1];
          const targetColor = targetCard ? targetCard.bonusColor : null;
          
          if (targetColor && targetColor !== COLORS.GREY) {
              if (board.includes(targetColor)) {
                  setPendingAddTokenColor(targetColor);
                  setPhase('ADD_TOKEN_SELECTION');
                  setMessage(`能力触发：请从棋盘上拿取一个 ${COLOR_MAP[targetColor].name}`);
                  if(passedPlayers) setPlayers(activePlayers);
              } else {
                  addLog(`能力触发失败：棋盘上没有 ${COLOR_MAP[targetColor].name}`);
                  // If failed, we still need to save the player state from executeBuy!
                  if(passedPlayers) setPlayers(activePlayers);
                  checkRoyalAfterAbility();
              }
          } else {
              if(passedPlayers) setPlayers(activePlayers);
              checkRoyalAfterAbility();
          }
      } else {
          if(passedPlayers) setPlayers(activePlayers);
          checkRoyalAfterAbility();
      }
  };

  const checkRoyalAfterAbility = () => {
      // Check if we still need to select royal
      // This is complex state management. 
      // For MVP, just End Turn.
      endTurn();
  };

  const handleStickSelection = (targetCard) => {
      // targetCard must be owned by player and have a color
      if (!targetCard.bonusColor || targetCard.bonusColor === COLORS.GREY) {
          alert("必须选择带有颜色的卡牌。");
          return;
      }
      const newPlayers = [...players];
      const p = newPlayers[turn];
      
      // Update the pending stick card in player's hand
      const cardInHand = p.cards.find(c => c.id === pendingStickCard.id);
      if(cardInHand) {
          cardInHand.attachedToColor = targetCard.bonusColor;
      }
      
      setPlayers(newPlayers);
      setPendingStickCard(null);
      
      // Check Royal Trigger (re-evaluate because Royal phase was skipped for Stick selection)
      const crowns = p.crowns;
      const cardCrowns = pendingStickCard.crowns || 0;
      const triggerRoyal = (crowns >= 3 && crowns - cardCrowns < 3) || 
                           (crowns >= 6 && crowns - cardCrowns < 6);

      if (triggerRoyal && royals.length > 0) {
          setPhase('ROYAL_SELECTION');
          setMessage("恭喜获得皇冠！请选择皇家卡。");
      } else {
          endTurn();
      }
  };

  const handleStealSelection = (color) => {
      if (phase !== 'STEAL_SELECTION') return;
      const newPlayers = [...players];
      const p = newPlayers[turn];
      const opp = newPlayers[turn === 0 ? 1 : 0];
      
      if (opp.tokens[color] > 0 && color !== COLORS.GOLD) {
          opp.tokens[color]--;
          p.tokens[color] = (p.tokens[color] || 0) + 1;
          
          showAnimation(`-1`, `#player-${opp.id}-token-${color}`, 'text-red-500', 0, -10);
          showAnimation(`+1`, `#player-${p.id}-token-${color}`, 'text-green-500', 0, -10);

          setPlayers(newPlayers);
          setPhase('OPTIONAL'); // Or whatever next phase
          addLog(`${p.name} 偷取了对手一个 ${COLOR_MAP[color].name}`);
          checkRoyalAfterAbility();
      }
  };

  const handleAddTokenSelection = (idx) => {
      if (phase !== 'ADD_TOKEN_SELECTION') return;
      const token = board[idx];
      
      if (token === pendingAddTokenColor) {
          const newBoard = [...board];
          newBoard[idx] = null;
          
          const newPlayers = [...players];
          newPlayers[turn].tokens[token] = (newPlayers[turn].tokens[token] || 0) + 1;
          
          showAnimation(`+1`, `#player-${players[turn].id}-token-${token}`, 'text-green-500', 0, -10);

          setBoard(newBoard);
          setPlayers(newPlayers);
          setPendingAddTokenColor(null);
          
          addLog(`${players[turn].name} 通过能力拿取了棋盘上的 ${COLOR_MAP[token].name}`);
          checkRoyalAfterAbility();
      } else {
          alert(`必须选择 ${COLOR_MAP[pendingAddTokenColor].name}`);
      }
  };


  const discardToken = (color) => {
      const newPlayers = [...players];
      const p = newPlayers[turn];
      if (p.tokens[color] > 0) {
          p.tokens[color]--;
          setBag([...bag, color].sort(() => Math.random() - 0.5));
          addLog(`${p.name} 弃置了一个 ${COLOR_MAP[color].name}`);
          const total = Object.values(p.tokens).reduce((a,b)=>a+b, 0);
          if (total <= 10) {
              setPlayers(newPlayers);
              endTurn();
          } else {
              setPlayers(newPlayers);
          }
      }
  };

  const updatePlayerName = (id, newName) => {
      const newPlayers = [...players];
      newPlayers[id].name = newName;
      setPlayers(newPlayers);
  };

  const swapPlayerNames = () => {
    setPlayers(prev => {
        const newPlayers = [
            { ...prev[0], name: prev[1].name },
            { ...prev[1], name: prev[0].name }
        ];
        return newPlayers;
    });
    addLog("交换了先后手（玩家名称）");
    setMessage(`已交换先后手：${players[1].name} ⟷ ${players[0].name}`);
  };

  const rollDice = () => {
    setShowDice(true);
    setIsRolling(true);
    let count = 0;
    const interval = setInterval(() => {
        setDiceValue(Math.floor(Math.random() * 6) + 1);
        count++;
        if (count > 20) { // Roll for ~2 seconds
            clearInterval(interval);
            setIsRolling(false);
        }
    }, 100);
  };

  // --- 渲染 ---

    return (
    <div className="min-h-screen bg-sky-50 text-slate-900 font-sans p-1 md:p-2 select-none text-base">
      {animations.map(anim => (
          <FloatingText key={anim.id} text={anim.text} x={anim.x} y={anim.y} color={anim.color} />
      ))}
      
      {/* 顶部信息栏 */}
      <div className="flex justify-between items-center mb-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
           {/* <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-1.5 rounded-lg shadow-md">
               <Diamond size={24} />
           </div> */}
           <div>
               <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                   <span>璀璨宝石-猪妹对决</span>
                   <div className="flex items-center gap-1 ml-1">
                       <img src={zhubaoImg} className="w-8 h-8 rounded-full border-2 border-sky-400 object-cover shadow-sm" alt="Zhubao" />
                       <span className="text-yellow-500 font-extrabold italic text-sm">⚡VS⚡</span>
                       <img src={meibaoImg} className="w-8 h-8 rounded-full border-2 border-pink-400 object-cover shadow-sm" alt="Meibao" />
                   </div>
               </h1>
               <div className="text-xs text-slate-500 font-medium">SPLENDOR DUEL</div>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
             {/* Action Buttons */}
             <div className="flex items-center gap-2 mr-2">
                <button 
                    onClick={rollDice}
                    className="flex items-center gap-1 text-purple-500 hover:text-purple-700 transition-colors mr-2"
                    title="掷骰子"
                >
                    <Dices size={20} />
                    <span className="text-base font-bold">骰子</span>
                </button>
                <button 
                    onClick={swapPlayerNames}
                    className="flex items-center gap-1 text-orange-500 hover:text-orange-700 transition-colors mr-2"
                    title="交换先/后手名字"
                >
                    <ArrowLeftRight size={20} />
                    <span className="text-base font-bold">交换</span>
                </button>
                <button 
                    onClick={undo}
                    disabled={history.length === 0}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors"
                    title="撤销上一步"
                >
                    <RotateCcw size={20} />
                    <span className="text-base font-bold">撤销</span>
                </button>
                <button 
                    onClick={redo}
                    disabled={future.length === 0}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors"
                    title="重做 (向前)"
                >
                    <RotateCcw size={20} className="scale-x-[-1]" />
                    <span className="text-base font-bold">重做</span>
                </button>
                <button 
                    onClick={() => {
                        if(confirm('确定要强制跳过回合吗？')) {
                            addLog(`${players[turn].name} 强制跳过了回合`);
                            endTurn();
                        }
                    }}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors ml-2"
                    title="强制跳过回合 (解决卡死问题)"
                >
                    <Play size={20} />
                    <span className="text-base font-bold">跳过</span>
                </button>
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <button 
                    onClick={exportGame}
                    className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
                    title="导出完整游戏记录到剪贴板"
                >
                    <Save size={20} />
                    <span className="text-base font-bold">导出</span>
                </button>
                <button 
                    onClick={importGame}
                    className="flex items-center gap-1 text-slate-500 hover:text-green-600 transition-colors"
                    title="导入游戏记录 (粘贴 JSON)"
                >
                    <Play size={20} />
                    <span className="text-base font-bold">导入</span>
                </button>
             </div>

            <div className="text-center">
                {winner ? (
                    <div className="text-orange-500 font-black text-xl animate-pulse">
                        🏆 {winner.name} 获胜！ 🏆
                    </div>
                ) : (
                    <div className={`px-6 py-1.5 rounded-full font-bold text-base shadow-sm transition-colors ${turn === 0 ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                        当前回合: {players[turn].name}
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full max-w-7xl mx-auto">
        
        {/* 左侧：金字塔 */}
        <div className="lg:col-span-5 space-y-4 order-2 lg:order-1 overflow-y-auto max-h-[calc(100vh-80px)] pb-20">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-4">
            {[3, 2, 1].map(level => (
                <div key={level} className="relative">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Level {level}</span>
                            <button
                                className="px-2 py-0.5 text-xs font-bold text-white bg-slate-400 rounded hover:bg-slate-500 transition-colors"
                                onClick={() => {
                                    if(decks[level].length === 0) return;
                                    if (phase === 'MANDATORY' || phase === 'OPTIONAL') {
                                            const hiddenCard = { 
                                                id: `deck-${level}-${Date.now()}`, 
                                                level: level, 
                                                isDeckCard: true, 
                                                points: '?', crowns: 0, cost: {}, 
                                                bonusColor: null 
                                            };
                                            setSelectedCard({ card: hiddenCard, type: 'deck' });
                                    }
                                }}
                                disabled={decks[level].length === 0}
                            >
                                抽牌库 ({decks[level].length})
                            </button>
                        </div>
                    </div>
                    
                    <div className={`grid gap-3 justify-center ${level === 1 ? 'grid-cols-5' : 'grid-cols-5'}`}>
                    {/* Visible Cards */}
                    {pyramid[level].map((card, pIdx) => {
                        if (!card) return <div key={`empty-${level}-${pIdx}`} className="w-24 h-32 rounded-lg border border-slate-100 bg-slate-50/50"></div>;
                        
                        const {missing} = calculateCost(card, currentPlayer);
                        const canBuy = missing <= (currentPlayer.tokens[COLORS.GOLD] || 0);
                        const isSel = selectedCard && selectedCard.card.id === card.id;
                        return (
                            <div key={card.id} className="flex justify-center">
                                <CardView 
                                    card={card} 
                                    canBuy={canBuy && (phase === 'MANDATORY' || phase === 'OPTIONAL')}
                                    isSelected={isSel}
                                    onClick={() => handleCardClick(card, 'board')}
                                />
                            </div>
                        );
                    })}
                    </div>
                </div>
            ))}
            </div>
        </div>

        {/* 中间：棋盘与控制 */}
        <div className="lg:col-span-4 flex flex-col items-center gap-6 order-1 lg:order-2">
            
            {/* 提示信息 */}
            <div className={`px-6 py-2 rounded-full border flex items-center gap-3 shadow-sm w-full justify-center transition-colors z-20 relative
                ${phase === 'DISCARD' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-slate-200 text-slate-700'}
            `}>
                <AlertCircle size={20} className={phase === 'DISCARD' ? 'text-red-500' : 'text-blue-500'} />
                <span className="font-bold text-lg">{message}</span>
            </div>

            {/* 棋盘区域 */}
            <div className="relative flex flex-col items-center">
                <div className="grid grid-cols-5 gap-2 p-3 bg-[#eecfa1] rounded-2xl shadow-xl border-4 border-[#d2b48c] scale-110 origin-top mt-2">
                    {board.map((token, idx) => (
                        <div 
                            key={idx}
                            onClick={() => handleBoardClick(idx)}
                            className={`
                                w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200
                                ${token ? 'hover:scale-105' : 'bg-[#f9e4c6] border-2 border-[#e6cca0] shadow-inner'}
                                ${selectedCells.includes(idx) ? 'ring-4 ring-yellow-400 scale-110 z-10 shadow-lg' : ''}
                                ${phase === 'USE_PRIVILEGE' && token && token !== COLORS.GOLD ? 'animate-pulse ring-4 ring-pink-400' : ''}
                                ${phase === 'ADD_TOKEN_SELECTION' && token === pendingAddTokenColor ? 'animate-bounce ring-4 ring-green-400 z-20' : ''}
                                ${phase === 'ADD_TOKEN_SELECTION' && token && token !== pendingAddTokenColor ? 'opacity-50' : ''}
                            `}
                        >
                            {token && <TokenIcon color={token} size="xl" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* 动作按钮栏 */}
            <div className="flex flex-wrap justify-center gap-2 w-full mt-8">
                {phase === 'OPTIONAL' && (
                    <>
                        <button 
                            onClick={refillBoard} 
                            disabled={bag.length === 0}
                            className="flex flex-col items-center justify-center w-20 h-20 bg-white hover:bg-indigo-50 text-indigo-600 border-2 border-indigo-100 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw size={28} className="mb-1" />
                            <span className="text-xs font-bold">刷新</span>
                        </button>
                        <button 
                            onClick={usePrivilege} 
                            disabled={currentPlayer.privileges === 0 || hasRefilled}
                            className="flex flex-col items-center justify-center w-20 h-20 bg-white hover:bg-pink-50 text-pink-600 border-2 border-pink-100 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                        >   
                            {currentPlayer.privileges > 0 && (
                                <div className="absolute top-1 right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{currentPlayer.privileges}</div>
                            )}
                            <Scroll size={28} className="mb-1" />
                            <span className="text-xs font-bold">卷轴</span>
                        </button>
                    </>
                )}
                
                {/* 代币确认 */}
                {(phase === 'OPTIONAL' || phase === 'MANDATORY') && selectedCells.length > 0 && (
                    <button onClick={confirmTakeTokens} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-slate-300 transition-all transform hover:-translate-y-1 mt-4">
                        <Check size={20} />
                        <span className="font-bold">拿取代币</span>
                    </button>
                )}

                {/* 卡牌操作确认弹窗/区域 */}
                {selectedCard && (
                   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setSelectedCard(null)}>
                       <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                           <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">选择行动</h3>
                           <div className="flex justify-center mb-6">
                               <CardView card={selectedCard.card} />
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                               <button 
                                   onClick={() => executeBuy(selectedCard.card, selectedCard.type === 'reserved')}
                                   disabled={(() => {
                                       const { missing } = calculateCost(selectedCard.card, currentPlayer);
                                       return missing > (currentPlayer.tokens[COLORS.GOLD] || 0);
                                   })()}
                                   className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold shadow-md shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                               >
                                   <Diamond size={18} /> 购买
                               </button>
                               
                               {selectedCard.type === 'board' && (
                                   <button 
                                       onClick={() => executeReserve(selectedCard.card, selectedCard.type !== 'deck')}
                                       disabled={currentPlayer.reserved.length >= 3 || !board.includes(COLORS.GOLD)}
                                       className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 py-3 rounded-xl font-bold shadow-md shadow-yellow-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                                   >
                                       <Save size={18} /> 保留 (+1金)
                                   </button>
                               )}

                               {selectedCard.type === 'deck' && (
                                   <button 
                                       onClick={() => {
                                           const realCard = decks[selectedCard.card.level][decks[selectedCard.card.level].length-1];
                                           if(realCard) executeReserve(realCard, false);
                                           setSelectedCard(null);
                                       }}
                                       disabled={currentPlayer.reserved.length >= 3 || !board.includes(COLORS.GOLD)}
                                       className="col-span-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 py-3 rounded-xl font-bold shadow-md shadow-yellow-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                                   >
                                       <Save size={18} /> 盲抽保留 (+1金)
                                   </button>
                               )}
                           </div>
                           <button onClick={() => setSelectedCard(null)} className="w-full mt-4 text-slate-400 hover:text-slate-600 text-sm font-bold">取消</button>
                       </div>
                   </div>
                )}
            </div>

            {/* Log Panel (New) */}
            <div className="w-full bg-white/50 rounded-xl border border-slate-200 max-h-32 overflow-y-auto p-2 text-sm text-slate-600 shadow-inner select-text">
                <div className="font-bold text-slate-400 mb-1 sticky top-0 bg-white/80 backdrop-blur-sm px-1">游戏记录</div>
                <div className="flex flex-col gap-1">
                    {logs.slice().sort((a, b) => b.id - a.id).map(log => (
                        <div key={log.id} className="flex gap-2">
                            <span className="text-slate-400 font-mono text-xs">{log.time}</span>
                            <span>{log.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 皇家卡 */}
            {royals.length > 0 && (
                <div className="w-full bg-slate-100 p-2 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Crown size={16} className="text-purple-500" />
                        <span className="text-sm font-bold text-slate-400 uppercase">Royal Cards</span>
                    </div>
                    <div className="flex gap-2 justify-center flex-wrap">
                        {royals.map(r => (
                            <div 
                                key={r.id} 
                                className={`w-32 h-20 bg-white border-2 border-purple-100 rounded-lg p-2 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:border-purple-300 transition-colors
                                    ${phase === 'ROYAL_SELECTION' ? 'ring-4 ring-yellow-400 animate-pulse cursor-pointer' : ''}
                                `}
                                onClick={() => phase === 'ROYAL_SELECTION' && selectRoyal(r)}
                            >
                                <div className="font-black text-xl text-purple-800">{r.points} 分</div>
                                <div className="text-xs text-slate-500 leading-tight mt-1">{r.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* 右侧：玩家状态 */}
        <div className="lg:col-span-3 space-y-2 order-3 overflow-y-auto max-h-[calc(100vh-80px)] pb-20">
            {players.map((p) => {
                const isCurrent = p.id === currentPlayer.id;
                const bonus = getPlayerBonus(p);
                const pointsByColor = getPlayerPointsByColor(p);

                return (
                    <div key={p.id} className={`p-2 rounded-2xl border-2 transition-all ${isCurrent ? 'bg-white border-blue-400 shadow-md' : 'bg-slate-50 border-transparent opacity-80 hover:opacity-100'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <EditableName 
                                key={`${p.id}-${p.name}`}
                                name={p.name} 
                                isCurrent={isCurrent} 
                                playerId={p.id}
                                onChange={(newName) => updatePlayerName(p.id, newName)} 
                            />
                            <div className="flex gap-2 text-base font-bold">
                                <div id={`player-${p.id}-points`} className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full relative">
                                    <Trophy size={16} className="mr-1"/>{p.points}
                                </div>
                                <div id={`player-${p.id}-crowns`} className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full relative">
                                    <Crown size={16} className="mr-1"/>{p.crowns}
                                </div>
                            </div>
                        </div>

                        {/* 特权卷轴展示 (Player Hand) */}
                        <div id={`player-${p.id}-privilege-container`} className="flex gap-1 mb-1 min-h-[20px]">
                            {[...Array(p.privileges)].map((_, i) => (
                                <Scroll key={i} size={16} className="text-pink-400" />
                            ))}
                        </div>

                        {/* 资源统计 (Tokens & Bonuses aligned) */}
                        <div className="grid grid-cols-8 gap-0.5 mb-1 bg-slate-100/50 p-1 rounded-xl relative">
                            {DISPLAY_COLORS.map(color => {
                                const tokenCount = p.tokens[color] || 0;
                                const bonusCount = bonus[color] || 0;
                                const points = pointsByColor[color] || 0;
                                const isBonusColor = color !== COLORS.GOLD && color !== COLORS.PEARL;

                                return (
                                    <div key={color} className="flex flex-col items-center gap-1">
                                        {/* Token */}
                                        <div 
                                            id={`player-${p.id}-token-${color}`}
                                            className={`relative cursor-pointer transition-all ${tokenCount === 0 ? 'opacity-30 grayscale' : 'hover:scale-110'}`} 
                                            onClick={() => {
                                                if (phase === 'DISCARD' && isCurrent) discardToken(color);
                                                if (phase === 'STEAL_SELECTION' && p.id !== currentPlayer.id) handleStealSelection(color);
                                            }}
                                        >
                                            <TokenIcon color={color} size="sm" count={tokenCount} />
                                            {phase === 'STEAL_SELECTION' && p.id !== currentPlayer.id && tokenCount > 0 && color !== COLORS.GOLD && (
                                                <div className="absolute inset-0 flex items-center justify-center z-10 animate-bounce">
                                                    <Hand size={16} className="text-red-500 drop-shadow-sm" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Bonus Count */}
                                        {isBonusColor ? (
                                            <div id={`player-${p.id}-bonus-${color}`} className={`flex flex-col items-center justify-center w-full h-11 rounded-lg shadow-sm border ${color === COLORS.WHITE ? '' : 'border-transparent'} ${COLOR_MAP[color].bg}`}>
                                                <span className={`text-sm font-black ${color === COLORS.WHITE ? 'text-slate-800' : 'text-white drop-shadow-sm'}`}>{bonusCount}</span>
                                                <span className={`text-[10px] font-bold leading-none ${
                                                    color === COLORS.WHITE 
                                                        ? (points >= 10 ? 'text-green-600 animate-pulse' : 'text-slate-400')
                                                        : (points >= 10 ? 'text-yellow-300 animate-pulse' : 'text-white/80')
                                                }`}>
                                                    {points > 0 ? points + 'pt' : ''}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="w-full h-11"></div>
                                        )}
                                    </div>
                                );
                            })}
                            <div className="flex items-center justify-center">
                                <button 
                                    onClick={() => setViewingPlayerCards(p.id)}
                                    className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 text-xs font-bold px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                                    title="查看所有已购卡牌"
                                >
                                    展开
                                </button>
                            </div>
                        </div>

                        {/* 保留卡 */}
                        {p.reserved.length > 0 && (
                            <div className="mt-1 pt-1 border-t border-slate-100">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Reserved Cards</div>
                                <div className="flex gap-2 overflow-x-auto py-1">
                                    {p.reserved.map(card => {
                                        const {missing} = calculateCost(card, p);
                                        const canBuy = missing <= (p.tokens[COLORS.GOLD] || 0);
                                        const isSel = selectedCard && selectedCard.card.id === card.id;
                                        
                                        return (
                                            <div key={card.id} className="scale-90 origin-top-left -mr-2">
                                                <CardView 
                                                    card={card} 
                                                    canBuy={canBuy && isCurrent && (phase === 'MANDATORY' || phase === 'OPTIONAL')} 
                                                    isReserved={true}
                                                    isSelected={isSel}
                                                    onClick={() => isCurrent && handleCardClick(card, 'reserved')}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            
            {/* 公共区域：剩余卷轴 */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mt-2">
                <div className="flex justify-between items-center">
                    <div className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Scroll size={18} className="text-pink-500" />
                        <span>剩余卷轴</span>
                    </div>
                    <div className="flex gap-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={`transition-all duration-500 ${i < privilegeAvailable ? 'opacity-100 scale-100' : 'opacity-20 grayscale scale-90'}`}>
                                <div className="bg-pink-100 p-2 rounded-lg shadow-sm border border-pink-200">
                                    <Scroll size={20} className="text-pink-600" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* Stick Card Selection Modal */}
      {phase === 'STICK_SELECTION' && (
         <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
             <div className="bg-white p-6 rounded-xl max-w-lg text-center">
                 <h3 className="text-xl font-bold mb-4">选择关联颜色</h3>
                 <p className="mb-6 text-slate-600">请点击下方你自己的一张已有颜色的卡牌，将新卡牌依附于其上。</p>
                 <div className="flex gap-2 flex-wrap justify-center">
                     {/* Show player's colored cards */}
                     {players[turn].cards.filter(c => c.bonusColor && c.bonusColor !== COLORS.GREY).map(c => (
                         <div key={c.id} onClick={() => handleStickSelection(c)} className="cursor-pointer hover:ring-4 hover:ring-indigo-300 rounded-lg transition-all">
                             <CardView card={c} />
                         </div>
                     ))}
                 </div>
                 {players[turn].cards.filter(c => c.bonusColor && c.bonusColor !== COLORS.GREY).length === 0 && (
                     <div className="text-red-500 font-bold mt-4">
                         警告：你没有可依附的卡牌！（规则上此时不应购买此卡，本次操作无效）
                         <button onClick={endTurn} className="block mx-auto mt-2 bg-slate-800 text-white px-4 py-2 rounded">跳过</button>
                     </div>
                 )}
             </div>
         </div>
      )}

      {/* Dice Modal */}
      {showDice && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => !isRolling && setShowDice(false)}>
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-bounce-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-black text-slate-800 mb-6">🎲 掷骰子</h3>
                
                <div className={`w-32 h-32 bg-red-500 rounded-2xl shadow-inner border-4 border-red-600 flex items-center justify-center transition-transform duration-100 ${isRolling ? 'animate-spin' : ''}`}>
                    <span className="text-white font-black text-6xl drop-shadow-md">{diceValue}</span>
                </div>

                <div className="mt-8 text-slate-500 font-bold text-lg">
                    {isRolling ? 'Rolling...' : '点击空白处关闭'}
                </div>
                
                {!isRolling && (
                    <button 
                        onClick={rollDice}
                        className="mt-4 px-6 py-2 bg-slate-100 hover:text-slate-800 rounded-full font-bold transition-colors"
                    >
                        再掷一次
                    </button>
                )}
            </div>
        </div>
      )}

      {/* View Player Cards Modal */}
      {viewingPlayerCards !== null && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewingPlayerCards(null)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-800">
                          {players[viewingPlayerCards].name} 的卡牌 ({players[viewingPlayerCards].cards.length})
                      </h3>
                      <button onClick={() => setViewingPlayerCards(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                          <X size={24} className="text-slate-500" />
                      </button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                      <div className="flex flex-wrap gap-3 justify-center">
                          {players[viewingPlayerCards].cards
                              .slice()
                              .sort((a, b) => {
                                  // Sort by color index based on DISPLAY_COLORS
                                  const colorA = a.bonusColor || 'z'; // 'z' for no color (end)
                                  const colorB = b.bonusColor || 'z';
                                  const indexA = DISPLAY_COLORS.indexOf(colorA);
                                  const indexB = DISPLAY_COLORS.indexOf(colorB);
                                  // Handle cases where color might not be in DISPLAY_COLORS (e.g. GREY/Stick)
                                  const safeIndexA = indexA === -1 ? 99 : indexA;
                                  const safeIndexB = indexB === -1 ? 99 : indexB;
                                  
                                  if (safeIndexA !== safeIndexB) return safeIndexA - safeIndexB;
                                  // Secondary sort by points
                                  return b.points - a.points;
                              })
                              .map(card => (
                                  <CardView key={card.id} card={card} />
                          ))}
                          {players[viewingPlayerCards].cards.length === 0 && (
                              <div className="text-slate-400 font-bold italic py-10">暂无卡牌</div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
