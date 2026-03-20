// ============================================================
// VideoMonitor — 视频监控中心（业务端管理人员）
// 功能：多路视频宫格、放大查看、PTZ控制、机器人快速指派
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2, Minimize2, Bot, MapPin, Zap, Activity,
  ChevronLeft, ChevronRight, Circle, LayoutGrid,
  LayoutPanelLeft, Navigation, X, Send, CheckCircle2,
  Loader2, ArrowUp, ArrowDown, ArrowLeft as AL, ArrowRight as AR,
  ZoomIn, ZoomOut, RotateCcw, Volume2, VolumeX
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { robots, incidents, getRobotStatusLabel, type Robot } from '@/lib/mockData';
import { toast } from 'sonner';

const onlineRobots = robots.filter(r => r.status !== 'offline');

function robotStatusColor(status: Robot['status']) {
  switch (status) {
    case 'patrolling': return { dot: '#38bdf8', text: 'text-sky-400', badge: 'bg-sky-500/15 text-sky-400 border-sky-500/25' };
    case 'responding': return { dot: '#fb923c', text: 'text-orange-400', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/25' };
    case 'online': case 'idle': return { dot: '#34d399', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' };
    case 'charging': return { dot: '#a78bfa', text: 'text-violet-400', badge: 'bg-violet-500/15 text-violet-400 border-violet-500/25' };
    case 'warning': return { dot: '#fbbf24', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25' };
    default: return { dot: '#64748b', text: 'text-slate-400', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/25' };
  }
}

// ---- 单个摄像头格 ----
function CameraCell({
  robot,
  isActive,
  onClick,
  isFullscreen,
}: {
  robot: Robot;
  isActive: boolean;
  onClick: () => void;
  isFullscreen?: boolean;
}) {
  const [time, setTime] = useState(new Date());
  const [frame, setFrame] = useState(0);
  const sc = robotStatusColor(robot.status);

  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date()), 1000);
    const t2 = setInterval(() => setFrame(f => (f + 1) % 9999), 80);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer rounded-xl transition-all ${
        isActive ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-transparent' : 'hover:ring-1 hover:ring-white/20'
      }`}
      style={{ aspectRatio: '16/9', background: '#000' }}
    >
      <img src={robot.cameraFeed} alt={robot.name} className="w-full h-full object-cover" />

      {/* 扫描线 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)' }}
      />

      {/* 移动扫描条 */}
      <motion.div
        className="absolute left-0 right-0 h-6 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(56,189,248,0.05), transparent)' }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* 四角框 */}
      {['top-1.5 left-1.5 border-t-2 border-l-2 rounded-tl', 'top-1.5 right-1.5 border-t-2 border-r-2 rounded-tr',
        'bottom-1.5 left-1.5 border-b-2 border-l-2 rounded-bl', 'bottom-1.5 right-1.5 border-b-2 border-r-2 rounded-br'].map((cls, i) => (
        <div key={i} className={`absolute w-4 h-4 border-sky-400/50 pointer-events-none ${cls}`} />
      ))}

      {/* 左上：REC + 时间 */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
        <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="flex items-center gap-1">
          <Circle size={6} className="fill-red-500 text-red-500" />
          <span className="text-xs font-mono text-red-400 font-bold" style={{ fontSize: 9 }}>REC</span>
        </motion.div>
        <span className="text-xs font-mono text-green-400/70" style={{ fontSize: 9 }}>
          {time.toLocaleTimeString('zh-CN', { hour12: false })}
        </span>
      </div>

      {/* 右上：机器人ID */}
      <div className="absolute top-2 right-2 text-right pointer-events-none">
        <div className="text-xs font-mono text-green-400/70" style={{ fontSize: 9 }}>{robot.id}</div>
      </div>

      {/* 底部信息栏 */}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 flex items-center gap-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: sc.dot, boxShadow: `0 0 4px ${sc.dot}` }}
        />
        <span className="text-xs text-white font-semibold flex-1 truncate">{robot.name}</span>
        <span className="text-xs text-slate-300 shrink-0">{robot.location}</span>
      </div>

      {/* 告警状态红框 */}
      {robot.status === 'warning' && (
        <motion.div
          className="absolute inset-0 border-2 border-red-500/70 rounded-xl pointer-events-none"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}

      {/* 帧数（右下角，小字） */}
      <div className="absolute bottom-6 right-2 pointer-events-none">
        <span className="text-green-400/40 font-mono" style={{ fontSize: 8 }}>
          {String(frame).padStart(4, '0')}
        </span>
      </div>
    </motion.div>
  );
}

// ---- PTZ 控制面板 ----
function PTZControl({ robot, onClose }: { robot: Robot; onClose: () => void }) {
  const [muted, setMuted] = useState(false);
  const send = (cmd: string) => toast.success(`PTZ指令：${cmd}`, { description: robot.name });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute bottom-4 right-4 rounded-2xl border border-white/15 p-4 z-20"
      style={{ background: 'oklch(0.13 0.025 240)', width: 200 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-300">云台控制</span>
        <button onClick={onClose} className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center">
          <X size={10} className="text-slate-400" />
        </button>
      </div>
      {/* 方向控制 */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <div />
        <button onClick={() => send('上移')} className="aspect-square rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-slate-300 active:scale-90 transition-all"><ArrowUp size={14} /></button>
        <div />
        <button onClick={() => send('左移')} className="aspect-square rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-slate-300 active:scale-90 transition-all"><AL size={14} /></button>
        <button onClick={() => send('居中')} className="aspect-square rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 active:scale-90 transition-all"><RotateCcw size={12} /></button>
        <button onClick={() => send('右移')} className="aspect-square rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-slate-300 active:scale-90 transition-all"><AR size={14} /></button>
        <div />
        <button onClick={() => send('下移')} className="aspect-square rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-slate-300 active:scale-90 transition-all"><ArrowDown size={14} /></button>
        <div />
      </div>
      {/* 缩放 + 音频 */}
      <div className="flex gap-1.5">
        <button onClick={() => send('放大')} className="flex-1 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center gap-1 text-slate-300 text-xs active:scale-90 transition-all"><ZoomIn size={12} />放大</button>
        <button onClick={() => send('缩小')} className="flex-1 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center gap-1 text-slate-300 text-xs active:scale-90 transition-all"><ZoomOut size={12} />缩小</button>
        <button onClick={() => setMuted(m => !m)} className={`py-1.5 px-2 rounded-lg flex items-center justify-center transition-all ${muted ? 'bg-red-500/20 text-red-400' : 'bg-white/8 text-slate-300'}`}>
          {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
      </div>
    </motion.div>
  );
}

// ---- 主页面 ----
export default function VideoMonitor() {
  const [layout, setLayout] = useState<'2x2' | '3x2' | '1x1'>('2x2');
  const [activeIdx, setActiveIdx] = useState(0);
  const [fullscreenRobot, setFullscreenRobot] = useState<Robot | null>(null);
  const [showPTZ, setShowPTZ] = useState(false);
  const [dispatchTarget, setDispatchTarget] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);

  const gridCount = layout === '2x2' ? 4 : layout === '3x2' ? 6 : 1;
  const displayRobots = onlineRobots.slice(0, gridCount);
  const openIncidents = incidents.filter(i => i.status !== 'closed');

  const handleDispatch = (robotId: string, incidentId: string) => {
    setDispatching(true);
    setTimeout(() => {
      setDispatching(false);
      setDispatchTarget(null);
      const robot = robots.find(r => r.id === robotId);
      const incident = incidents.find(i => i.id === incidentId);
      toast.success(`${robot?.name} 已派出`, { description: `前往 ${incident?.location}` });
    }, 1800);
  };

  return (
    <AdminLayout title="视频监控">
      <div className="flex gap-4 h-full">
        {/* ── 左侧：视频宫格 ── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* 工具栏 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/8">
              {[
                { key: '2x2', icon: <LayoutGrid size={14} />, label: '2×2' },
                { key: '3x2', icon: <LayoutPanelLeft size={14} />, label: '3×2' },
                { key: '1x1', icon: <Maximize2 size={14} />, label: '单屏' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setLayout(opt.key as typeof layout)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
                    layout === opt.key ? 'bg-sky-500/20 text-sky-300 border border-sky-500/25' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.icon}{opt.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              {onlineRobots.length} 路在线 · {robots.filter(r => r.status === 'offline').length} 路离线
            </div>
          </div>

          {/* 视频宫格 */}
          <div
            className={`grid gap-2 flex-1`}
            style={{
              gridTemplateColumns: layout === '1x1' ? '1fr' : layout === '2x2' ? '1fr 1fr' : '1fr 1fr 1fr',
            }}
          >
            {displayRobots.map((robot, idx) => (
              <CameraCell
                key={robot.id}
                robot={robot}
                isActive={activeIdx === idx}
                onClick={() => setActiveIdx(idx)}
              />
            ))}
          </div>

          {/* 缩略图切换栏（单屏模式） */}
          {layout === '1x1' && (
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {onlineRobots.map((robot, idx) => (
                <button
                  key={robot.id}
                  onClick={() => setActiveIdx(idx)}
                  className="shrink-0 relative rounded-lg overflow-hidden transition-all"
                  style={{
                    width: 80, height: 52,
                    border: activeIdx === idx ? '2px solid #38bdf8' : '2px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <img src={robot.cameraFeed} alt={robot.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-0.5 left-0 right-0 text-center">
                    <span className="text-white/70 font-mono" style={{ fontSize: 8 }}>{robot.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── 右侧：机器人状态 + 事件快速派遣 ── */}
        <div className="w-64 flex flex-col gap-3 shrink-0">
          {/* 当前选中机器人详情 */}
          {onlineRobots[activeIdx] && (() => {
            const robot = onlineRobots[activeIdx];
            const sc = robotStatusColor(robot.status);
            return (
              <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.145 0.022 240)' }}>
                <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200 font-display">{robot.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${sc.badge}`}>{getRobotStatusLabel(robot.status)}</span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={10} />{robot.location}
                  </div>
                  {/* 电量 */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>电量</span><span>{robot.battery}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/8">
                      <div className="h-full rounded-full" style={{ width: `${robot.battery}%`, background: robot.battery < 20 ? '#ef4444' : robot.battery < 50 ? '#f59e0b' : '#34d399' }} />
                    </div>
                  </div>
                  {/* 快速指令 */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {[
                      { label: '停止', action: () => toast.success(`${robot.name} 已停止`) },
                      { label: '返充电', action: () => toast.success(`${robot.name} 返回充电`) },
                      { label: '继续', action: () => toast.success(`${robot.name} 继续执行`) },
                      { label: 'PTZ', action: () => setShowPTZ(v => !v) },
                    ].map(btn => (
                      <button
                        key={btn.label}
                        onClick={btn.action}
                        className="py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/8 text-slate-300 hover:bg-white/10 transition-all active:scale-95"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 待处置事件 → 快速派遣 */}
          <div className="rounded-xl border border-white/8 overflow-hidden flex-1" style={{ background: 'oklch(0.145 0.022 240)' }}>
            <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-200 font-display">待处置事件</span>
              <span className="text-xs text-red-400 font-semibold">{openIncidents.length} 件</span>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 320 }}>
              {openIncidents.map(incident => {
                const lvColor = incident.level === 'urgent' ? 'border-red-500/30 bg-red-500/5' : incident.level === 'important' ? 'border-amber-500/30 bg-amber-500/5' : 'border-sky-500/20 bg-sky-500/5';
                const lvText = incident.level === 'urgent' ? 'text-red-400' : incident.level === 'important' ? 'text-amber-400' : 'text-sky-400';
                return (
                  <div key={incident.id} className={`rounded-xl border p-3 ${lvColor}`}>
                    <div className={`text-xs font-semibold mb-1 ${lvText}`}>{incident.title}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                      <MapPin size={9} />{incident.location}
                    </div>
                    {incident.assignedRobotId ? (
                      <div className="text-xs text-sky-400 flex items-center gap-1">
                        <Bot size={10} />
                        {robots.find(r => r.id === incident.assignedRobotId)?.name} 响应中
                      </div>
                    ) : (
                      <button
                        onClick={() => setDispatchTarget(incident.id)}
                        className="w-full py-1.5 rounded-lg text-xs font-semibold bg-sky-500/15 border border-sky-500/25 text-sky-300 hover:bg-sky-500/25 transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        <Send size={10} />派遣机器人
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PTZ 控制浮层 */}
      <AnimatePresence>
        {showPTZ && onlineRobots[activeIdx] && (
          <PTZControl robot={onlineRobots[activeIdx]} onClose={() => setShowPTZ(false)} />
        )}
      </AnimatePresence>

      {/* 快速派遣弹窗 */}
      <AnimatePresence>
        {dispatchTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setDispatchTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl border border-white/15 p-6 w-80"
              style={{ background: 'oklch(0.13 0.025 240)' }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-base font-bold text-slate-100 font-display mb-1">选择派遣机器人</h3>
              <p className="text-xs text-slate-500 mb-4">
                前往：{incidents.find(i => i.id === dispatchTarget)?.location}
              </p>
              <div className="space-y-2 mb-4">
                {onlineRobots.filter(r => r.status !== 'responding').map(robot => {
                  const sc = robotStatusColor(robot.status);
                  return (
                    <button
                      key={robot.id}
                      onClick={() => !dispatching && handleDispatch(robot.id, dispatchTarget)}
                      disabled={dispatching}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/8 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all active:scale-98 disabled:opacity-50"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                        <img src={robot.cameraFeed} alt={robot.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-slate-200">{robot.name}</div>
                        <div className="text-xs text-slate-500">{robot.location}</div>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${sc.badge}`}>{getRobotStatusLabel(robot.status)}</span>
                      {dispatching ? <Loader2 size={14} className="text-sky-400 animate-spin" /> : <Send size={14} className="text-slate-600" />}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setDispatchTarget(null)} className="w-full py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 border border-white/8 hover:bg-white/5 transition-all">
                取消
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
