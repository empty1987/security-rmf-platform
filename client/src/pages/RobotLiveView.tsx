// ============================================================
// RobotLiveView — 机器人实时画面页（移动端穿透）
// Design: Fullscreen camera feed with HUD overlay, robot switcher
// Accessed from: Mobile HomeTab → 在线机器人 stat card
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bot, Zap, MapPin, Activity, Radio,
  Maximize2, ChevronLeft, ChevronRight, Wifi, WifiOff,
  AlertTriangle, Eye, Clock, Signal, Circle
} from 'lucide-react';
import { robots, getRobotStatusLabel, type Robot } from '@/lib/mockData';

// ---- 每台机器人对应的摄像头画面 ----
const ROBOT_CAMERA_FEEDS: Record<string, {
  url: string;
  scene: string;
  nightVision: boolean;
}> = {
  'RBT-001': {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-lobby-FRM4Q6FmYMxk3dsSBwyZMJ.webp',
    scene: '大堂正面',
    nightVision: false,
  },
  'RBT-002': {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-corridor-B2fBPwLKXMEATuiRj7ZeNu.webp',
    scene: '走廊巡逻',
    nightVision: true,
  },
  'RBT-003': {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-gate-mE4APdMUCGAGz3JSVQqicF.webp',
    scene: '门禁入口',
    nightVision: true,
  },
  'RBT-004': {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-parking-ezPidMAk5iBv7x2hus9kw9.webp',
    scene: '地下停车场',
    nightVision: false,
  },
  'RBT-005': {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-rooftop-P43YfMsL6trTtkoA5KSaVN.webp',
    scene: '楼顶巡逻',
    nightVision: false,
  },
  'RBT-006': {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-parking-ezPidMAk5iBv7x2hus9kw9.webp',
    scene: '停车场 D区',
    nightVision: false,
  },
};

// ---- 在线/可查看的机器人 ----
const onlineRobots = robots.filter(r => r.status !== 'offline');

// ---- 状态颜色 ----
function statusColor(status: Robot['status']) {
  switch (status) {
    case 'patrolling': return { dot: '#38bdf8', text: 'text-sky-400', bg: 'bg-sky-500/20 border-sky-500/30' };
    case 'responding': return { dot: '#fb923c', text: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30' };
    case 'online': return { dot: '#34d399', text: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' };
    case 'charging': return { dot: '#a78bfa', text: 'text-violet-400', bg: 'bg-violet-500/20 border-violet-500/30' };
    case 'warning': return { dot: '#fbbf24', text: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' };
    default: return { dot: '#64748b', text: 'text-slate-400', bg: 'bg-slate-500/20 border-slate-500/30' };
  }
}

// ---- 扫描线动效覆盖层 ----
function ScanlineOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 扫描线 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        }}
      />
      {/* 移动扫描条 */}
      <motion.div
        className="absolute left-0 right-0 h-8"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(56,189,248,0.06), transparent)',
        }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      {/* 四角 HUD 框 */}
      {[
        'top-2 left-2 border-t-2 border-l-2 rounded-tl-lg',
        'top-2 right-2 border-t-2 border-r-2 rounded-tr-lg',
        'bottom-2 left-2 border-b-2 border-l-2 rounded-bl-lg',
        'bottom-2 right-2 border-b-2 border-r-2 rounded-br-lg',
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute w-5 h-5 border-sky-400/60 ${cls}`}
        />
      ))}
    </div>
  );
}

// ---- 主页面 ----
interface RobotLiveViewProps {
  onBack: () => void;
  initialRobotId?: string;
}

export default function RobotLiveView({ onBack, initialRobotId }: RobotLiveViewProps) {
  const [selectedIdx, setSelectedIdx] = useState(() => {
    if (initialRobotId) {
      const idx = onlineRobots.findIndex(r => r.id === initialRobotId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [signalStrength, setSignalStrength] = useState(4);
  const [frameCount, setFrameCount] = useState(0);

  const robot = onlineRobots[selectedIdx];
  const feed = ROBOT_CAMERA_FEEDS[robot.id] ?? ROBOT_CAMERA_FEEDS['RBT-001'];
  const sc = statusColor(robot.status);

  // 时钟
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // 模拟帧率计数器（增加真实感）
  useEffect(() => {
    const t = setInterval(() => {
      setFrameCount(c => (c + 1) % 10000);
      // 随机信号强度波动
      if (Math.random() < 0.1) setSignalStrength(Math.floor(Math.random() * 2) + 3);
    }, 100);
    return () => clearInterval(t);
  }, []);

  const prevRobot = () => setSelectedIdx(i => (i - 1 + onlineRobots.length) % onlineRobots.length);
  const nextRobot = () => setSelectedIdx(i => (i + 1) % onlineRobots.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full"
      style={{ background: 'oklch(0.07 0.02 240)' }}
    >
      {/* ── 顶部导航 ── */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">返回</span>
        </button>
        <div className="text-sm font-semibold text-slate-200 font-display">实时画面</div>
        <div className="flex items-center gap-1.5">
          {/* 信号强度 */}
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="rounded-sm transition-colors"
              style={{
                width: 3,
                height: 4 + i * 2,
                background: i <= signalStrength ? '#38bdf8' : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── 主摄像头画面 ── */}
      <div className="relative mx-4 rounded-2xl overflow-hidden shrink-0" style={{ aspectRatio: '16/9' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={robot.id}
            src={feed.url}
            alt={`${robot.name} 实时画面`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* 扫描线 + HUD 框 */}
        <ScanlineOverlay />

        {/* 夜视色调叠加 */}
        {feed.nightVision && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(0, 40, 20, 0.25)', mixBlendMode: 'multiply' }}
          />
        )}

        {/* 左上：REC + 时间戳 */}
        <div className="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-none">
          <motion.div
            className="flex items-center gap-1"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <Circle size={7} className="fill-red-500 text-red-500" />
            <span className="text-xs font-mono-data text-red-400 font-bold">REC</span>
          </motion.div>
          <span className="text-xs font-mono-data text-green-400/80">
            {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
          </span>
        </div>

        {/* 右上：机器人 ID + 场景 */}
        <div className="absolute top-2.5 right-3 text-right pointer-events-none">
          <div className="text-xs font-mono-data text-green-400/80">{robot.id}</div>
          <div className="text-xs text-slate-400/80">{feed.scene}</div>
        </div>

        {/* 左下：电量 */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 pointer-events-none">
          <Zap size={10} className={robot.battery < 20 ? 'text-red-400' : 'text-amber-400'} />
          <span className="text-xs font-mono-data text-green-400/80">BAT {robot.battery}%</span>
        </div>

        {/* 右下：帧计数 */}
        <div className="absolute bottom-2.5 right-3 pointer-events-none">
          <span className="text-xs font-mono-data text-green-400/50">
            FRAME {String(frameCount).padStart(5, '0')}
          </span>
        </div>

        {/* 状态告警遮罩（warning 状态闪烁红框） */}
        {robot.status === 'warning' && (
          <motion.div
            className="absolute inset-0 border-2 border-red-500/60 rounded-2xl pointer-events-none"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}

        {/* 左右切换箭头 */}
        <button
          onClick={prevRobot}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={nextRobot}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── 当前机器人信息卡 ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={robot.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mx-4 mt-3 rounded-xl border border-white/8 p-3.5 shrink-0"
          style={{ background: 'oklch(0.145 0.025 240)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center shrink-0">
              <Bot size={18} className="text-sky-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-slate-100 text-sm font-display">{robot.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${sc.bg} ${sc.text}`}>
                  {getRobotStatusLabel(robot.status)}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={9} />
                <span className="truncate">{robot.location}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-mono-data text-slate-500">{robot.model}</div>
              <div className="text-xs font-mono-data text-slate-600 mt-0.5">{robot.id}</div>
            </div>
          </div>

          {/* 状态数据行 */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                icon: <Zap size={12} className={robot.battery < 20 ? 'text-red-400' : 'text-amber-400'} />,
                label: '电量',
                value: `${robot.battery}%`,
                color: robot.battery < 20 ? 'text-red-400' : robot.battery < 50 ? 'text-amber-400' : 'text-emerald-400',
              },
              {
                icon: <Activity size={12} className="text-sky-400" />,
                label: '速度',
                value: `${robot.speed} km/h`,
                color: 'text-sky-400',
              },
              {
                icon: <Clock size={12} className="text-violet-400" />,
                label: '今日运行',
                value: `${robot.uptime}h`,
                color: 'text-violet-400',
              },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-lg p-2 text-center border border-white/5"
                style={{ background: 'oklch(0.12 0.02 240)' }}
              >
                <div className="flex justify-center mb-1">{item.icon}</div>
                <div className={`text-sm font-bold font-mono-data ${item.color}`}>{item.value}</div>
                <div className="text-xs text-slate-600 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          {/* 当前任务 */}
          {robot.currentTask && (
            <div className="mt-2.5 flex items-center gap-2 px-2.5 py-2 rounded-lg border border-sky-500/15 bg-sky-500/5">
              <Radio size={11} className="text-sky-400 shrink-0" />
              <span className="text-xs text-sky-300">执行任务：</span>
              <span className="text-xs text-sky-400 font-mono-data font-medium">{robot.currentTask}</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── 机器人缩略图切换栏 ── */}
      <div className="mx-4 mt-3 shrink-0">
        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
          <Eye size={10} />
          在线机器人 · {onlineRobots.length} 台
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {onlineRobots.map((r, idx) => {
            const f = ROBOT_CAMERA_FEEDS[r.id] ?? ROBOT_CAMERA_FEEDS['RBT-001'];
            const sc2 = statusColor(r.status);
            const isActive = idx === selectedIdx;
            return (
              <motion.button
                key={r.id}
                onClick={() => setSelectedIdx(idx)}
                whileTap={{ scale: 0.95 }}
                className="shrink-0 relative rounded-xl overflow-hidden transition-all"
                style={{
                  width: 72,
                  height: 48,
                  border: isActive ? `2px solid #38bdf8` : '2px solid rgba(255,255,255,0.08)',
                  boxShadow: isActive ? '0 0 10px rgba(56,189,248,0.35)' : 'none',
                }}
              >
                <img
                  src={f.url}
                  alt={r.name}
                  className="w-full h-full object-cover"
                />
                {/* 暗色遮罩 */}
                <div
                  className="absolute inset-0"
                  style={{ background: isActive ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.45)' }}
                />
                {/* 状态点 */}
                <div
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ background: sc2.dot, boxShadow: `0 0 4px ${sc2.dot}` }}
                />
                {/* 机器人名 */}
                <div className="absolute bottom-0.5 left-0 right-0 text-center">
                  <span className="text-white/80 font-mono-data" style={{ fontSize: 8 }}>
                    {r.id.replace('RBT-', '#')}
                  </span>
                </div>
                {/* 选中高亮扫描线 */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(56,189,248,0.06) 3px, rgba(56,189,248,0.06) 4px)',
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── 底部指示点 ── */}
      <div className="flex justify-center gap-1.5 mt-3 pb-2 shrink-0">
        {onlineRobots.map((_, i) => (
          <button
            key={i}
            onClick={() => setSelectedIdx(i)}
            className="rounded-full transition-all"
            style={{
              width: i === selectedIdx ? 16 : 6,
              height: 6,
              background: i === selectedIdx ? '#38bdf8' : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
