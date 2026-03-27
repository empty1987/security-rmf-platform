/**
 * MpRobotDetail.tsx — 机器人详情页（重构版）
 * 三大功能区 Tab：① 实时监控画面  ② 任务执行地图  ③ 手动操控盘
 * 另含：快捷指令、巡逻任务下发、今日统计
 */
import { useState, useRef, useEffect } from 'react';
import {
  robots, tasks,
  getRobotStatusLabel, getRobotStatusClass, getBatteryClass,
  SPEED_LABEL, ROUTE_MODE_LABEL,
} from '../miniappData';
import type { MpPage } from '../MiniappPreview';

interface Props { robotId: string; navigate: (p: MpPage) => void; goBack: () => void; }

const STATUS_COLOR: Record<string, string> = {
  sky: '#38bdf8', amber: '#f59e0b', success: '#34d399',
  violet: '#a78bfa', warning: '#f59e0b', offline: '#64748b',
};

const QUICK_OPS = [
  { key: 'stop',    icon: '⏹', label: '立即停止', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)' },
  { key: 'restart', icon: '🔁', label: '重启任务', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  { key: 'charge',  icon: '⚡', label: '返回充电', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
  { key: 'photo',   icon: '📸', label: '拍照上报', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)' },
  { key: 'alarm',   icon: '🔔', label: '发出警报', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)' },
  { key: 'voice',   icon: '📢', label: '语音播报', color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)' },
];

/* ---- 每台机器人的园区地图路径点（SVG坐标，画布 320×200） ---- */
const ROBOT_MAP_DATA: Record<string, {
  zone: string;
  path: { x: number; y: number; label: string }[];
  robotPos: { x: number; y: number };
  buildings: { x: number; y: number; w: number; h: number; label: string; color: string }[];
}> = {
  'RBT-001': {
    zone: 'A区全域',
    path: [
      { x: 40,  y: 160, label: 'A栋大门' },
      { x: 80,  y: 100, label: 'A栋走廊' },
      { x: 150, y: 60,  label: 'A栋中庭' },
      { x: 230, y: 80,  label: 'A栋后门' },
      { x: 280, y: 150, label: '停车场入口' },
    ],
    robotPos: { x: 150, y: 60 },
    buildings: [
      { x: 20,  y: 20,  w: 80,  h: 60,  label: 'A栋', color: 'rgba(56,189,248,0.12)' },
      { x: 130, y: 20,  w: 80,  h: 50,  label: 'B栋', color: 'rgba(99,102,241,0.1)' },
      { x: 220, y: 30,  w: 80,  h: 55,  label: 'C栋', color: 'rgba(52,211,153,0.1)' },
      { x: 20,  y: 130, w: 280, h: 50,  label: '停车场', color: 'rgba(245,158,11,0.07)' },
    ],
  },
  'RBT-002': {
    zone: 'B栋3楼',
    path: [
      { x: 50,  y: 100, label: 'B栋入口' },
      { x: 110, y: 80,  label: '1楼大厅' },
      { x: 160, y: 60,  label: '电梯厅' },
      { x: 220, y: 80,  label: '3楼走廊' },
      { x: 270, y: 120, label: '3楼尽头' },
    ],
    robotPos: { x: 220, y: 80 },
    buildings: [
      { x: 30,  y: 30,  w: 260, h: 130, label: 'B栋楼层平面', color: 'rgba(239,68,68,0.08)' },
      { x: 140, y: 40,  w: 40,  h: 30,  label: '电梯',  color: 'rgba(99,102,241,0.15)' },
      { x: 200, y: 40,  w: 80,  h: 30,  label: '走廊',  color: 'rgba(56,189,248,0.1)' },
    ],
  },
  'RBT-003': {
    zone: '南门入口',
    path: [
      { x: 60,  y: 150, label: '外围道路' },
      { x: 120, y: 120, label: '闸机A' },
      { x: 160, y: 100, label: '门卫亭' },
      { x: 220, y: 120, label: '闸机B' },
      { x: 270, y: 150, label: '内侧道路' },
    ],
    robotPos: { x: 160, y: 100 },
    buildings: [
      { x: 20,  y: 60,  w: 280, h: 40,  label: '围墙', color: 'rgba(100,116,139,0.15)' },
      { x: 130, y: 70,  w: 60,  h: 60,  label: '门卫亭', color: 'rgba(52,211,153,0.15)' },
      { x: 80,  y: 100, w: 30,  h: 30,  label: '闸机A', color: 'rgba(56,189,248,0.12)' },
      { x: 210, y: 100, w: 30,  h: 30,  label: '闸机B', color: 'rgba(56,189,248,0.12)' },
    ],
  },
  'RBT-004': {
    zone: 'B1-B2停车场',
    path: [
      { x: 40,  y: 40,  label: 'B1入口' },
      { x: 100, y: 60,  label: 'B1-A区' },
      { x: 160, y: 100, label: '坡道' },
      { x: 220, y: 140, label: 'B2-A区' },
      { x: 280, y: 160, label: 'B2出口' },
    ],
    robotPos: { x: 220, y: 140 },
    buildings: [
      { x: 20,  y: 20,  w: 130, h: 80,  label: 'B1停车场', color: 'rgba(245,158,11,0.1)' },
      { x: 160, y: 110, w: 140, h: 70,  label: 'B2停车场', color: 'rgba(239,68,68,0.08)' },
      { x: 140, y: 70,  w: 30,  h: 60,  label: '坡道',    color: 'rgba(100,116,139,0.15)' },
    ],
  },
  'RBT-005': {
    zone: '顶层',
    path: [
      { x: 60,  y: 80,  label: '充电桩#3' },
      { x: 130, y: 60,  label: '顶层东侧' },
      { x: 200, y: 80,  label: '顶层中央' },
      { x: 260, y: 120, label: '顶层西侧' },
    ],
    robotPos: { x: 60, y: 80 },
    buildings: [
      { x: 20,  y: 30,  w: 280, h: 140, label: '楼顶平台', color: 'rgba(99,102,241,0.08)' },
      { x: 30,  y: 55,  w: 50,  h: 40,  label: '充电区',  color: 'rgba(167,139,250,0.15)' },
      { x: 240, y: 55,  w: 50,  h: 40,  label: '设备间',  color: 'rgba(52,211,153,0.12)' },
    ],
  },
};

/* ---- 任务地图组件 ---- */
function TaskMap({ robotId, taskTitle, progress }: { robotId: string; taskTitle: string; progress: number }) {
  const mapData = ROBOT_MAP_DATA[robotId] || ROBOT_MAP_DATA['RBT-001'];
  const { path, robotPos, buildings } = mapData;
  const totalSegs = path.length - 1;
  const progressRatio = Math.min(progress / 100, 1);
  const segIdx = Math.min(Math.floor(progressRatio * totalSegs), totalSegs - 1);
  const segProgress = (progressRatio * totalSegs) - segIdx;
  const fromPt = path[segIdx];
  const toPt = path[Math.min(segIdx + 1, path.length - 1)];
  const rx = progress > 0 ? fromPt.x + (toPt.x - fromPt.x) * segProgress : robotPos.x;
  const ry = progress > 0 ? fromPt.y + (toPt.y - fromPt.y) * segProgress : robotPos.y;
  const passedCount = Math.floor(progressRatio * totalSegs) + 1;
  const uid = robotId.replace('-', '');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700 }}>📍 {mapData.zone}</span>
        <span style={{ fontSize: 10, color: '#64748b' }}>{taskTitle || '无执行中任务'}</span>
      </div>
      <svg viewBox="0 0 320 200" style={{ width: '100%', height: 'auto', borderRadius: 10, background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(56,189,248,0.15)', display: 'block' }}>
        <defs>
          <pattern id={`grid${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56,189,248,0.05)" strokeWidth="0.5" />
          </pattern>
          <filter id={`glow${uid}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id={`pg${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <rect width="320" height="200" fill={`url(#grid${uid})`} />
        {buildings.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.color} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" rx="3" />
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="sans-serif">{b.label}</text>
          </g>
        ))}
        {path.map((pt, i) => {
          if (i === 0) return null;
          const prev = path[i - 1];
          const passed = i < passedCount;
          return <line key={`l${i}`} x1={prev.x} y1={prev.y} x2={pt.x} y2={pt.y} stroke={passed ? '#38bdf8' : 'rgba(100,116,139,0.4)'} strokeWidth={passed ? 2 : 1.5} strokeDasharray={passed ? 'none' : '4 3'} opacity={passed ? 0.8 : 0.5} />;
        })}
        {path.map((pt, i) => {
          const passed = i < passedCount;
          const isCurrent = i === Math.min(segIdx + 1, path.length - 1) && progress > 0 && progress < 100;
          return (
            <g key={`p${i}`}>
              <circle cx={pt.x} cy={pt.y} r={isCurrent ? 7 : 5} fill={passed ? '#38bdf8' : 'rgba(100,116,139,0.3)'} stroke={isCurrent ? '#fff' : (passed ? 'rgba(56,189,248,0.5)' : 'rgba(100,116,139,0.5)')} strokeWidth={isCurrent ? 1.5 : 1} />
              {isCurrent && <circle cx={pt.x} cy={pt.y} r={11} fill="none" stroke="rgba(56,189,248,0.3)" strokeWidth="1.5"><animate attributeName="r" values="7;13;7" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" /></circle>}
              <text x={pt.x} y={pt.y + 3} textAnchor="middle" fontSize="6" fill={passed ? '#0a0f1e' : 'rgba(255,255,255,0.4)'} fontWeight="bold" fontFamily="monospace">{i + 1}</text>
              {i % 2 === 0 && <text x={pt.x} y={pt.y - 9} textAnchor="middle" fontSize="7" fill={passed ? 'rgba(56,189,248,0.8)' : 'rgba(100,116,139,0.6)'} fontFamily="sans-serif">{pt.label}</text>}
            </g>
          );
        })}
        <g>
          <circle cx={rx} cy={ry} r={14} fill="none" stroke="rgba(56,189,248,0.25)" strokeWidth="1"><animate attributeName="r" values="10;18;10" dur="1.8s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite" /></circle>
          <circle cx={rx} cy={ry} r={9} fill="rgba(56,189,248,0.25)" stroke="#38bdf8" strokeWidth="1.5" filter={`url(#glow${uid})`} />
          <text x={rx} y={ry + 4} textAnchor="middle" fontSize="9" fontFamily="sans-serif">🤖</text>
        </g>
        <rect x="10" y="188" width="300" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
        <rect x="10" y="188" width={Math.max(0, 300 * progress / 100)} height="6" rx="3" fill={`url(#pg${uid})`} />
        <text x="160" y="197" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.4)" fontFamily="monospace">{progress}%</text>
      </svg>
      <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' as const }}>
        {path.map((pt, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 6, background: i < passedCount ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${i < passedCount ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: i < passedCount ? '#38bdf8' : '#475569', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 9, color: i < passedCount ? '#94a3b8' : '#475569' }}>{pt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- 操控盘组件 ---- */
function DPad({ robotName }: { robotName: string }) {
  const [activeDir, setActiveDir] = useState<string | null>(null);
  const [speed, setSpeed] = useState(3);
  const [cmdLog, setCmdLog] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const DIR_LABEL: Record<string, string> = { forward: '前进', left: '左转', right: '右转', backward: '后退' };
  const DIRS = [
    { dir: 'forward',  arrow: '▲', label: '前进', row: 1, col: 2 },
    { dir: 'left',     arrow: '◀', label: '左转', row: 2, col: 1 },
    { dir: 'right',    arrow: '▶', label: '右转', row: 2, col: 3 },
    { dir: 'backward', arrow: '▼', label: '后退', row: 3, col: 2 },
  ];

  const startMove = (dir: string) => {
    setActiveDir(dir);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCmdLog(prev => [`${now} ${DIR_LABEL[dir]} ${speed}档`, ...prev].slice(0, 4));
    }, 500);
  };

  const stopMove = () => {
    setActiveDir(null);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const btnStyle = (dir: string): React.CSSProperties => ({
    width: 56, height: 56, borderRadius: 14,
    border: `1.5px solid ${activeDir === dir ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
    background: activeDir === dir ? 'linear-gradient(135deg,rgba(56,189,248,0.3),rgba(99,102,241,0.2))' : 'rgba(255,255,255,0.04)',
    color: activeDir === dir ? '#38bdf8' : '#94a3b8',
    fontSize: 18, cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
    userSelect: 'none', boxShadow: activeDir === dir ? '0 0 12px rgba(56,189,248,0.35)' : 'none',
    transition: 'all 0.1s', WebkitUserSelect: 'none', touchAction: 'none',
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* 方向键网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,56px)', gridTemplateRows: 'repeat(3,56px)', gap: 6 }}>
          {DIRS.map(({ dir, arrow, label, row, col }) => (
            <button key={dir} style={{ ...btnStyle(dir), gridRow: row, gridColumn: col }}
              onMouseDown={() => startMove(dir)} onMouseUp={stopMove} onMouseLeave={stopMove}
              onTouchStart={(e) => { e.preventDefault(); startMove(dir); }}
              onTouchEnd={(e) => { e.preventDefault(); stopMove(); }}
            >
              <span>{arrow}</span>
              <span style={{ fontSize: 8, color: activeDir === dir ? '#38bdf8' : '#475569' }}>{label}</span>
            </button>
          ))}
          {/* 中心停止键 */}
          <button style={{ gridRow: 2, gridColumn: 2, width: 56, height: 56, borderRadius: 14, border: `1.5px solid ${activeDir ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`, background: activeDir ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)', color: activeDir ? '#ef4444' : '#475569', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, userSelect: 'none' }} onClick={stopMove}>
            <span style={{ fontSize: 16 }}>⏹</span>
            <span style={{ fontSize: 8 }}>停止</span>
          </button>
        </div>

        {/* 右侧状态 + 速度 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ padding: '8px 10px', borderRadius: 10, background: activeDir ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${activeDir ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.06)'}`, textAlign: 'center' }}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{activeDir ? '🟢' : '⚪'}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: activeDir ? '#38bdf8' : '#475569' }}>{activeDir ? DIR_LABEL[activeDir] : '待命'}</div>
            <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>{robotName}</div>
          </div>
          <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 9, color: '#64748b', marginBottom: 6 }}>速度档位</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,2,3,4,5].map(v => (
                <button key={v} onClick={() => setSpeed(v)} style={{ flex: 1, height: 22, borderRadius: 6, border: `1px solid ${speed >= v ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'}`, background: speed >= v ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.03)', color: speed >= v ? '#38bdf8' : '#475569', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>{v}</button>
              ))}
            </div>
            <div style={{ fontSize: 9, color: '#38bdf8', textAlign: 'center', marginTop: 4 }}>
              {speed}档 · {speed <= 2 ? '慢速' : speed <= 3 ? '正常' : '快速'}
            </div>
          </div>
        </div>
      </div>

      {cmdLog.length > 0 && (
        <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 9, color: '#475569', marginBottom: 4 }}>📡 指令记录</div>
          {cmdLog.map((log, i) => (
            <div key={i} style={{ fontSize: 10, color: i === 0 ? '#38bdf8' : '#475569', padding: '1px 0', fontFamily: 'monospace' }}>{i === 0 ? '▶ ' : '  '}{log}</div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 10, color: '#334155', textAlign: 'center', marginTop: 8 }}>长按方向键持续移动，松开自动停止</div>
    </div>
  );
}

/* ---- 监控画面组件 ---- */
function CameraFeed({ robot }: { robot: typeof robots[0] }) {
  const [scanY, setScanY] = useState(0);
  const [frameCount, setFrameCount] = useState(Math.floor(Math.random() * 9000) + 1000);
  useEffect(() => {
    const t1 = setInterval(() => setScanY(y => (y + 2) % 100), 30);
    const t2 = setInterval(() => setFrameCount(f => f + 1), 67);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);
  const now = new Date();
  const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
      {robot.cameraFeed
        ? <img src={robot.cameraFeed} alt="实时画面" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#0a0f1e,#0d1a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 32 }}>📷</span></div>
      }
      {/* 扫描线 */}
      <div style={{ position: 'absolute', left: 0, right: 0, height: 2, top: `${scanY}%`, background: 'linear-gradient(90deg,transparent,rgba(56,189,248,0.5),transparent)', pointerEvents: 'none' }} />
      {/* HUD 四角 */}
      {([{ top: 4, left: 4, borderTop: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8' }, { top: 4, right: 4, borderTop: '2px solid #38bdf8', borderRight: '2px solid #38bdf8' }, { bottom: 4, left: 4, borderBottom: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8' }, { bottom: 4, right: 4, borderBottom: '2px solid #38bdf8', borderRight: '2px solid #38bdf8' }] as React.CSSProperties[]).map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 14, height: 14, ...s, pointerEvents: 'none' }} />
      ))}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '6px 10px', background: 'linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700, letterSpacing: 1 }}>LIVE</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>{robot.name}</span>
        </div>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>#{frameCount.toString().padStart(6,'0')}</span>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 10px', background: 'linear-gradient(to top,rgba(0,0,0,0.75),transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>{ts}</span>
        <span style={{ fontSize: 8, color: 'rgba(56,189,248,0.8)' }}>{robot.location}</span>
      </div>
    </div>
  );
}

/* ---- 主组件 ---- */
export default function MpRobotDetail({ robotId, navigate, goBack }: Props) {
  const robot = robots.find(r => r.id === robotId) || robots[0];
  const currentTask = tasks.find(t => t.assignedRobot === robotId && t.status === 'running');
  const patrolTasks = tasks.filter(t => t.type === 'patrol');

  const [activeTab, setActiveTab] = useState<'camera' | 'map' | 'control'>('camera');
  const [selectedPatrolId, setSelectedPatrolId] = useState('');
  const [editPatrol, setEditPatrol] = useState({ location: '', speed: 'normal', loops: 1 });
  const [toast, setToast] = useState('');

  const sc = getRobotStatusClass(robot.status);
  const statusColor = STATUS_COLOR[sc] || '#38bdf8';
  const bc = getBatteryClass(robot.battery);
  const batteryColor = bc === 'high' ? '#34d399' : bc === 'mid' ? '#f59e0b' : '#ef4444';

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleQuickOp = (key: string) => {
    const msgs: Record<string, string> = { stop: '✅ 已发送停止指令', restart: '🔁 已重启当前任务', charge: '⚡ 已指令返回充电桩', photo: '📸 拍照上报成功', alarm: '🔔 警报已触发', voice: '📢 语音播报已启动' };
    showToast(msgs[key] || '✅ 指令已发送');
  };

  const selectPatrol = (id: string) => {
    const t = patrolTasks.find(p => p.id === id);
    setSelectedPatrolId(id);
    setEditPatrol({ location: t?.location || '', speed: 'normal', loops: 1 });
  };

  const executePatrol = () => {
    const t = patrolTasks.find(p => p.id === selectedPatrolId);
    if (!t) return;
    showToast(`▶ 已下发：${t.title}`);
  };

  const TABS = [
    { key: 'camera'  as const, icon: '📹', label: '监控画面' },
    { key: 'map'     as const, icon: '🗺️', label: '任务地图' },
    { key: 'control' as const, icon: '🕹️', label: '操控盘'  },
  ];

  return (
    <div className="mp-page" style={{ background: '#0a0f1e', minHeight: '100%' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', padding: '8px 18px', borderRadius: 20, background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(56,189,248,0.35)', color: '#e2e8f0', fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' as const }}>
          {toast}
        </div>
      )}

      {/* 机器人信息头部 */}
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${statusColor}22,${statusColor}11)`, border: `1.5px solid ${statusColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🤖</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{robot.name}</span>
              <span style={{ padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${statusColor}20`, border: `1px solid ${statusColor}40`, color: statusColor }}>{getRobotStatusLabel(robot.status)}</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{robot.model} · {robot.id}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>📍 {robot.location}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: batteryColor, fontFamily: 'monospace' }}>{robot.battery}%</div>
            <div style={{ fontSize: 9, color: '#475569' }}>电量</div>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', marginTop: 3 }}>
              <div style={{ width: `${robot.battery}%`, height: '100%', borderRadius: 2, background: batteryColor }} />
            </div>
          </div>
        </div>
        {currentTask && (
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>▶</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{currentTask.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ width: `${currentTask.progress}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }} />
                </div>
                <span style={{ fontSize: 10, color: '#38bdf8', fontFamily: 'monospace', flexShrink: 0 }}>{currentTask.progress}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab 切换 */}
      <div style={{ display: 'flex', padding: '10px 16px 0', gap: 6 }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `1.5px solid ${activeTab === tab.key ? 'rgba(56,189,248,0.45)' : 'rgba(255,255,255,0.07)'}`, background: activeTab === tab.key ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.03)', color: activeTab === tab.key ? '#38bdf8' : '#64748b', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'all 0.2s' }}>
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 功能区内容 */}
      <div style={{ padding: '12px 16px' }}>

        {/* ① 监控画面 */}
        {activeTab === 'camera' && (
          <div>
            <CameraFeed robot={robot} />
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { num: `${robot.speed}m/s`, label: '当前速度', color: '#38bdf8' },
                { num: `${robot.todayMileage}km`, label: '今日里程', color: '#34d399' },
                { num: (robot as any).todayAlerts ?? 0, label: '今日告警', color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={{ padding: '8px 0', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.num}</div>
                  <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ② 任务地图 */}
        {activeTab === 'map' && (
          <div>
            <TaskMap robotId={robotId} taskTitle={currentTask?.title || (robot as any).currentTask || ''} progress={currentTask?.progress ?? 0} />
            <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, letterSpacing: 1 }}>快速下发巡逻任务</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {patrolTasks.map(t => (
                  <div key={t.id} onClick={() => selectPatrol(t.id)} style={{ padding: '8px 12px', borderRadius: 10, cursor: 'pointer', background: selectedPatrolId === t.id ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedPatrolId === t.id ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.07)'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>🔄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{t.title}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{t.location} · {ROUTE_MODE_LABEL[t.routeMode || 'loop'] || '循环巡逻'}</div>
                    </div>
                    {selectedPatrolId === t.id && <span style={{ fontSize: 14, color: '#38bdf8' }}>✓</span>}
                  </div>
                ))}
              </div>
              {selectedPatrolId && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    {['slow','normal','fast'].map(s => (
                      <button key={s} onClick={() => setEditPatrol(p => ({ ...p, speed: s }))} style={{ flex: 1, padding: '7px 0', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: editPatrol.speed === s ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)', border: editPatrol.speed === s ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.1)', color: editPatrol.speed === s ? '#38bdf8' : '#94a3b8' }}>{SPEED_LABEL[s]}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>循环次数</span>
                    <button onClick={() => setEditPatrol(p => ({ ...p, loops: Math.max(1, p.loops - 1) }))} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}>－</button>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8', minWidth: 20, textAlign: 'center' }}>{editPatrol.loops}</span>
                    <button onClick={() => setEditPatrol(p => ({ ...p, loops: Math.min(10, p.loops + 1) }))} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}>＋</button>
                  </div>
                  <button onClick={executePatrol} style={{ width: '100%', padding: '11px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>▶ 立即执行巡逻任务</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ③ 操控盘 */}
        {activeTab === 'control' && (
          <div>
            <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 10, letterSpacing: 1 }}>手动操控 · {robot.name}</div>
              <DPad robotName={robot.name} />
            </div>
            <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 10, letterSpacing: 1 }}>快捷指令</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {QUICK_OPS.map(op => (
                  <button key={op.key} onClick={() => handleQuickOp(op.key)} style={{ padding: '10px 4px', borderRadius: 12, border: `1px solid ${op.border}`, background: op.bg, color: op.color, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 20 }}>{op.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>{op.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 今日统计（所有Tab均显示） */}
      <div style={{ margin: '0 16px 24px', padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 10, letterSpacing: 1 }}>今日统计</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {[
            { num: (robot as any).todayAlerts ?? 0, label: '预警', color: '#f59e0b' },
            { num: robot.totalPatrols,               label: '任务', color: '#38bdf8' },
            { num: `${robot.todayMileage}`,          label: '里程km', color: '#34d399' },
            { num: robot.lastSeen,                   label: '活跃', color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '8px 0', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.num}</div>
              <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
