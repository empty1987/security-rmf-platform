// ============================================================
// MobileApp — 移动端一线保安 App
// Design: Mobile-first, bottom tab navigation, card-based UI
// Simulates a phone screen within the browser
// ============================================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Home, Bot, AlertTriangle, ClipboardList, User,
  Bell, MapPin, Zap, CheckCircle2, Phone, Radio, Camera,
  ChevronRight, ArrowLeft, Clock, Activity, Navigation,
  MessageSquare, Settings, LogOut, Crosshair, Loader2,
  Wifi, WifiOff, CheckCheck, X, LocateFixed, Signal
} from 'lucide-react';
import RobotLiveView from './RobotLiveView';
import {
  robots, tasks, alerts, guardShifts,
  getRobotStatusLabel, getTaskStatusLabel, getAlertLevelLabel,
  type Robot
} from '@/lib/mockData';
import { toast } from 'sonner';

// ---- Tab definitions ----
const tabs = [
  { id: 'home', icon: Home, label: '首页' },
  { id: 'robots', icon: Bot, label: '机器人' },
  { id: 'tasks', icon: ClipboardList, label: '任务' },
  { id: 'alerts', icon: AlertTriangle, label: '告警' },
  { id: 'me', icon: User, label: '我的' },
];

// ---- 计算两点距离（模拟坐标系）----
function calcDistance(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

// ---- 呼叫状态类型 ----
type CallState =
  | 'idle'
  | 'locating'     // 正在获取当前位置
  | 'matching'     // 正在匹配最近机器人
  | 'calling'      // 正在呼叫
  | 'dispatched'   // 已派遣，机器人前往中
  | 'arrived'      // 机器人已到达
  | 'failed';      // 呼叫失败

// ---- 一键呼叫最近机器人组件 ----
function CallNearestRobotPanel() {
  const [callState, setCallState] = useState<CallState>('idle');
  const [nearestRobot, setNearestRobot] = useState<Robot | null>(null);
  const [eta, setEta] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [userLocation] = useState({ x: 28, y: 55, name: 'A栋一楼走廊' }); // 模拟保安当前位置
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 清理计时器
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // 当 dispatched 后开始倒计时
  useEffect(() => {
    if (callState === 'dispatched' && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timerRef.current!);
            setCallState('arrived');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState, countdown]);

  const handleCall = async () => {
    if (callState !== 'idle' && callState !== 'failed') return;

    // Step 1: 定位
    setCallState('locating');
    setNearestRobot(null);
    await new Promise(r => setTimeout(r, 1200));

    // Step 2: 匹配最近可用机器人
    setCallState('matching');
    await new Promise(r => setTimeout(r, 900));

    const available = robots.filter(r =>
      r.status === 'online' || r.status === 'patrolling'
    );
    if (available.length === 0) {
      setCallState('failed');
      toast.error('呼叫失败', { description: '当前无可用机器人，请联系指挥中心' });
      return;
    }

    const nearest = available.reduce((prev, cur) => {
      const dPrev = calcDistance(userLocation.x, userLocation.y, prev.x, prev.y);
      const dCur = calcDistance(userLocation.x, userLocation.y, cur.x, cur.y);
      return dCur < dPrev ? cur : prev;
    });

    const dist = calcDistance(userLocation.x, userLocation.y, nearest.x, nearest.y);
    const estimatedEta = Math.max(1, Math.round(dist / 8)); // 模拟速度换算为分钟

    setNearestRobot(nearest);

    // Step 3: 发出呼叫
    setCallState('calling');
    await new Promise(r => setTimeout(r, 1000));

    // Step 4: 已派遣
    setEta(estimatedEta);
    setCountdown(estimatedEta * 10); // 演示用：每秒=10秒，加速体验
    setCallState('dispatched');
    toast.success(`${nearest.name} 已出发`, {
      description: `预计 ${estimatedEta} 分钟后到达 ${userLocation.name}`,
    });
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('idle');
    setNearestRobot(null);
    toast.info('已取消呼叫');
  };

  // ---- 状态配置 ----
  const stateConfig: Record<CallState, {
    label: string;
    subLabel: string;
    btnLabel: string;
    btnColor: string;
    icon: React.ReactNode;
    showCancel: boolean;
  }> = {
    idle: {
      label: '一键呼叫最近机器人',
      subLabel: `当前位置：${userLocation.name}`,
      btnLabel: '立即呼叫',
      btnColor: 'from-sky-500 to-sky-600',
      icon: <Radio size={22} className="text-white" />,
      showCancel: false,
    },
    locating: {
      label: '正在获取当前位置…',
      subLabel: 'GPS 定位中',
      btnLabel: '定位中…',
      btnColor: 'from-slate-600 to-slate-700',
      icon: <LocateFixed size={22} className="text-sky-400 animate-pulse" />,
      showCancel: false,
    },
    matching: {
      label: '正在匹配最近机器人…',
      subLabel: 'RMF 调度引擎计算中',
      btnLabel: '匹配中…',
      btnColor: 'from-slate-600 to-slate-700',
      icon: <Loader2 size={22} className="text-violet-400 animate-spin" />,
      showCancel: false,
    },
    calling: {
      label: `正在呼叫 ${nearestRobot?.name ?? ''}…`,
      subLabel: '等待机器人响应',
      btnLabel: '呼叫中…',
      btnColor: 'from-amber-500 to-amber-600',
      icon: <Signal size={22} className="text-amber-400 animate-pulse" />,
      showCancel: false,
    },
    dispatched: {
      label: `${nearestRobot?.name ?? ''} 正在赶来`,
      subLabel: `预计 ${eta} 分钟后到达 · ${nearestRobot?.location ?? ''}`,
      btnLabel: '取消呼叫',
      btnColor: 'from-red-600 to-red-700',
      icon: <Bot size={22} className="text-emerald-400" />,
      showCancel: true,
    },
    arrived: {
      label: `${nearestRobot?.name ?? ''} 已到达！`,
      subLabel: `已抵达 ${userLocation.name}`,
      btnLabel: '完成',
      btnColor: 'from-emerald-500 to-emerald-600',
      icon: <CheckCheck size={22} className="text-white" />,
      showCancel: false,
    },
    failed: {
      label: '呼叫失败',
      subLabel: '无可用机器人，请联系指挥中心',
      btnLabel: '重新呼叫',
      btnColor: 'from-sky-500 to-sky-600',
      icon: <WifiOff size={22} className="text-red-400" />,
      showCancel: false,
    },
  };

  const cfg = stateConfig[callState];
  const isLoading = callState === 'locating' || callState === 'matching' || callState === 'calling';
  const isDispatched = callState === 'dispatched';
  const isArrived = callState === 'arrived';

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{
        background: 'linear-gradient(145deg, oklch(0.16 0.03 230), oklch(0.13 0.025 240))',
        borderColor: isArrived
          ? 'rgba(52,211,153,0.35)'
          : isDispatched
          ? 'rgba(56,189,248,0.3)'
          : 'rgba(56,189,248,0.15)',
        boxShadow: isArrived
          ? '0 0 24px rgba(52,211,153,0.15)'
          : isDispatched
          ? '0 0 20px rgba(56,189,248,0.1)'
          : 'none',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-white/8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isArrived
              ? 'rgba(52,211,153,0.15)'
              : isDispatched
              ? 'rgba(56,189,248,0.15)'
              : 'rgba(56,189,248,0.1)',
            border: isArrived
              ? '1px solid rgba(52,211,153,0.3)'
              : '1px solid rgba(56,189,248,0.2)',
          }}
        >
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-100 font-display leading-tight">{cfg.label}</div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin size={9} />
            <span className="truncate">{cfg.subLabel}</span>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-0">
          {(['locating', 'matching', 'calling', 'dispatched', 'arrived'] as CallState[]).map((step, i, arr) => {
            const stepOrder: Record<CallState, number> = {
              idle: -1, locating: 0, matching: 1, calling: 2, dispatched: 3, arrived: 4, failed: -1,
            };
            const currentOrder = stepOrder[callState];
            const stepO = stepOrder[step];
            const done = currentOrder > stepO;
            const active = currentOrder === stepO;
            const stepLabels: Record<string, string> = {
              locating: '定位', matching: '匹配', calling: '呼叫', dispatched: '派遣', arrived: '到达',
            };
            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                    style={{
                      background: done
                        ? 'rgba(52,211,153,0.2)'
                        : active
                        ? 'rgba(56,189,248,0.25)'
                        : 'rgba(255,255,255,0.05)',
                      border: done
                        ? '1px solid rgba(52,211,153,0.5)'
                        : active
                        ? '1px solid rgba(56,189,248,0.5)'
                        : '1px solid rgba(255,255,255,0.08)',
                      color: done ? '#34d399' : active ? '#38bdf8' : '#475569',
                    }}
                  >
                    {done ? <CheckCheck size={10} /> : active && isLoading ? <Loader2 size={10} className="animate-spin" /> : i + 1}
                  </div>
                  <span className="text-xs" style={{ color: done ? '#34d399' : active ? '#38bdf8' : '#475569' }}>
                    {stepLabels[step]}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className="h-px flex-1 mx-1 mb-4 transition-all duration-500"
                    style={{
                      background: done ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.06)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispatched: robot info + ETA countdown */}
      <AnimatePresence>
        {(isDispatched || isArrived) && nearestRobot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-3 rounded-xl border border-white/8 overflow-hidden"
            style={{ background: 'oklch(0.145 0.022 240)' }}
          >
            <div className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200">{nearestRobot.name}</div>
                <div className="text-xs text-slate-500 font-mono-data">{nearestRobot.id} · {nearestRobot.model}</div>
              </div>
              <div className="text-right">
                {isArrived ? (
                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-medium">已到达</span>
                  </div>
                ) : (
                  <>
                    <div className="text-lg font-bold text-sky-400 font-mono-data leading-none">
                      {Math.ceil(countdown / 10)}
                    </div>
                    <div className="text-xs text-slate-500">分钟</div>
                  </>
                )}
              </div>
            </div>

            {/* ETA progress bar */}
            {isDispatched && (
              <div className="px-3 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">预计到达进度</span>
                  <span className="text-xs text-sky-400 font-mono-data">
                    {Math.round(((eta * 10 - countdown) / (eta * 10)) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-sky-500"
                    animate={{ width: `${((eta * 10 - countdown) / (eta * 10)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin size={8} />
                    出发：{nearestRobot.location}
                  </span>
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin size={8} />
                    目标：{userLocation.name}
                  </span>
                </div>
              </div>
            )}

            {/* Arrived animation */}
            {isArrived && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-3 pb-3 flex items-center gap-2"
              >
                <div className="flex-1 h-1.5 rounded-full bg-emerald-500/30 overflow-hidden">
                  <div className="h-full w-full rounded-full bg-emerald-500" />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action button */}
      <div className="px-4 pb-4 flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={isDispatched ? handleCancel : isArrived ? () => setCallState('idle') : handleCall}
          disabled={isLoading}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${cfg.btnColor} ${isLoading ? 'opacity-60 cursor-not-allowed' : 'active:brightness-90'}`}
        >
          {isLoading && <Loader2 size={15} className="animate-spin" />}
          {cfg.btnLabel}
        </motion.button>
      </div>
    </div>
  );
}

// ---- Home Tab ----
function HomeTab({ onOpenLiveView }: { onOpenLiveView: () => void }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const unreadAlerts = alerts.filter(a => !a.acknowledged);
  const activeTasks = tasks.filter(t => t.status === 'running');

  return (
    <div className="flex flex-col gap-4">
      {/* Hero card */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, oklch(0.2 0.06 230), oklch(0.15 0.04 240))',
          border: '1px solid rgba(56,189,248,0.2)',
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/mobile-bg-4coscnJLmKE5vMSntept6U.webp"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-sky-300/70">当前班次 · 下午班</div>
              <div className="text-lg font-bold text-white font-display">李明 保安</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white font-mono-data">
                {currentTime.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-sky-300/70">
                {currentTime.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="status-dot online" />
            <span className="text-xs text-emerald-400">值班中 · A栋区域</span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '在线机器人', value: 5, icon: <Bot size={16} className="text-sky-400" />, color: 'text-sky-400', clickable: true },
          // @ts-ignore
          { label: '未处理告警', value: unreadAlerts.length, icon: <AlertTriangle size={16} className="text-red-400" />, color: 'text-red-400', clickable: false },
          { label: '执行中任务', value: activeTasks.length, icon: <Activity size={16} className="text-emerald-400" />, color: 'text-emerald-400', clickable: false },
        ].map(item => (
          <div
            key={item.label}
            className={`rounded-xl p-3 border border-white/8 text-center transition-all ${
              (item as any).clickable ? 'cursor-pointer active:scale-95 hover:border-sky-500/40 hover:bg-sky-500/5' : ''
            }`}
            style={{ background: 'oklch(0.155 0.025 240)' }}
            onClick={(item as any).clickable ? onOpenLiveView : undefined}
          >
            <div className="flex justify-center mb-1.5">{item.icon}</div>
            <div className={`text-xl font-bold font-display ${item.color}`}>{item.value}</div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-0.5">
              {item.label}
              {(item as any).clickable && <ChevronRight size={9} className="text-sky-500/60" />}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">快捷操作</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Radio size={20} className="text-sky-400" />, label: '呼叫机器人', color: 'border-sky-500/20 bg-sky-500/8' },
            { icon: <AlertTriangle size={20} className="text-red-400" />, label: '紧急报警', color: 'border-red-500/20 bg-red-500/8' },
            { icon: <Navigation size={20} className="text-emerald-400" />, label: '查看地图', color: 'border-emerald-500/20 bg-emerald-500/8' },
            { icon: <MessageSquare size={20} className="text-violet-400" />, label: '联系指挥', color: 'border-violet-500/20 bg-violet-500/8' },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => toast.info(action.label, { description: '功能开发中' })}
              className={`rounded-xl p-4 border flex flex-col items-center gap-2 transition-all active:scale-95 ${action.color}`}
            >
              {action.icon}
              <span className="text-xs text-slate-300">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent alerts */}
      {unreadAlerts.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>最新告警</span>
            <span className="text-red-400">{unreadAlerts.length} 未处理</span>
          </div>
          <div className="flex flex-col gap-2">
            {unreadAlerts.slice(0, 2).map(alert => (
              <div
                key={alert.id}
                className={`rounded-xl p-3 border-l-2 ${
                  alert.level === 'critical' ? 'border-l-red-500 bg-red-500/8 border-red-500/15' :
                  'border-l-amber-500 bg-amber-500/8 border-amber-500/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-200">{alert.title}</span>
                  <span className="text-xs text-slate-500 font-mono-data">{alert.timestamp}</span>
                </div>
                <div className="text-xs text-slate-400">{alert.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Robots Tab ----
function RobotsTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">机器人状态 · {robots.length} 台</div>
      {robots.map(robot => (
        <motion.div
          key={robot.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-white/8 p-4 active:bg-white/5 transition-all"
          style={{ background: 'oklch(0.155 0.025 240)' }}
          onClick={() => toast.info(`${robot.name} 详情`, { description: `${robot.location} · 电量${robot.battery}%` })}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center shrink-0">
              <Bot size={18} className="text-sky-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-medium text-slate-200">{robot.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${
                  robot.status === 'patrolling' ? 'bg-sky-500/15 text-sky-400 border-sky-500/25' :
                  robot.status === 'responding' ? 'bg-orange-500/15 text-orange-400 border-orange-500/25' :
                  robot.status === 'charging' ? 'bg-violet-500/15 text-violet-400 border-violet-500/25' :
                  robot.status === 'warning' ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' :
                  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                }`}>
                  {getRobotStatusLabel(robot.status)}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                <MapPin size={9} />
                <span className="truncate">{robot.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={10} className={robot.battery < 20 ? 'text-red-400' : 'text-amber-400'} />
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${robot.battery}%`,
                      background: robot.battery < 20 ? '#f87171' : robot.battery < 50 ? '#fbbf24' : '#34d399',
                    }}
                  />
                </div>
                <span className="text-xs font-mono-data text-slate-400">{robot.battery}%</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-600 shrink-0" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ---- Tasks Tab ----
function TasksTab() {
  const myTasks = tasks.filter(t => t.status === 'running' || t.status === 'pending');

  return (
    <div className="flex flex-col gap-3">
      {/* ===== 一键呼叫最近机器人 ===== */}
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
        <Radio size={11} className="text-sky-400" />
        快速呼叫
      </div>
      <CallNearestRobotPanel />

      {/* 分隔 */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-white/6" />
        <span className="text-xs text-slate-600">当前任务</span>
        <div className="flex-1 h-px bg-white/6" />
      </div>

      {/* 任务列表 */}
      {myTasks.map(task => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/8 p-4"
          style={{ background: 'oklch(0.155 0.025 240)' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="font-medium text-slate-200 text-sm mb-0.5">{task.title}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={9} />
                {task.location}
              </div>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded border ml-2 shrink-0 ${
              task.status === 'running' ? 'bg-sky-500/15 text-sky-400 border-sky-500/25' :
              'bg-slate-500/15 text-slate-400 border-slate-500/25'
            }`}>
              {getTaskStatusLabel(task.status)}
            </span>
          </div>

          {task.assignedRobot && (
            <div className="flex items-center gap-1.5 mb-2 text-xs text-sky-400">
              <Bot size={10} />
              <span className="font-mono-data">{task.assignedRobot}</span>
            </div>
          )}

          {task.status === 'running' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">任务进度</span>
                <span className="text-xs font-mono-data text-sky-400">{task.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${task.progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => toast.success('已接受任务')}
              className="flex-1 py-2 rounded-lg text-xs bg-sky-500/15 border border-sky-500/25 text-sky-400 hover:bg-sky-500/25 transition-all"
            >
              接受任务
            </button>
            <button
              onClick={() => toast.info('任务详情', { description: task.description })}
              className="flex-1 py-2 rounded-lg text-xs border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
            >
              查看详情
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ---- Alerts Tab ----
function AlertsTab() {
  const [alertList, setAlertList] = useState(alerts);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-slate-500 uppercase tracking-wider">告警通知</div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          alertList.filter(a => !a.acknowledged).length > 0
            ? 'bg-red-500/20 text-red-400'
            : 'bg-emerald-500/20 text-emerald-400'
        }`}>
          {alertList.filter(a => !a.acknowledged).length} 未读
        </span>
      </div>

      {alertList.map(alert => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: alert.acknowledged ? 0.55 : 1, x: 0 }}
          className={`rounded-xl p-4 border-l-2 ${
            alert.level === 'critical' ? 'border-l-red-500 bg-red-500/5 border-red-500/15' :
            alert.level === 'warning' ? 'border-l-amber-500 bg-amber-500/5 border-amber-500/15' :
            'border-l-sky-500 bg-sky-500/5 border-sky-500/15'
          }`}
        >
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                alert.level === 'critical' ? 'bg-red-500/20 text-red-400' :
                alert.level === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                'bg-sky-500/20 text-sky-400'
              }`}>
                {getAlertLevelLabel(alert.level)}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono-data">{alert.timestamp}</span>
          </div>
          <div className="text-sm font-medium text-slate-200 mb-1">{alert.title}</div>
          <div className="text-xs text-slate-400 mb-2">{alert.description}</div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin size={9} />
              {alert.location}
            </span>
            {!alert.acknowledged && (
              <button
                onClick={() => setAlertList(prev => prev.map(a => a.id === alert.id ? { ...a, acknowledged: true } : a))}
                className="text-xs text-emerald-400 flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              >
                <CheckCircle2 size={10} />
                确认
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ---- Me Tab ----
function MeTab() {
  const guard = guardShifts.find(g => g.guardId === 'G001');

  return (
    <div className="flex flex-col gap-4">
      {/* Profile card */}
      <div className="rounded-2xl p-5 border border-white/8" style={{ background: 'oklch(0.155 0.025 240)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-xl font-bold text-sky-400 font-display">
            李明
          </div>
          <div>
            <div className="text-lg font-bold text-white font-display">李明</div>
            <div className="text-xs text-slate-500 font-mono-data">G001 · 高级保安</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="status-dot online" />
              <span className="text-xs text-emerald-400">值班中</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '今日巡逻', value: '6次' },
            { label: '处理告警', value: '3次' },
            { label: '值班时长', value: '6.5h' },
          ].map(item => (
            <div key={item.label} className="text-center p-2 rounded-lg bg-white/3 border border-white/5">
              <div className="text-sm font-bold text-sky-400 font-display">{item.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift info */}
      <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.155 0.025 240)' }}>
        <div className="px-4 py-3 border-b border-white/8 text-sm font-medium text-slate-200">班次信息</div>
        {guard && [
          { label: '班次', value: '下午班 (14:00-22:00)' },
          { label: '负责区域', value: guard.zone },
          { label: '班组', value: '安保一队' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0">
            <span className="text-sm text-slate-400">{item.label}</span>
            <span className="text-sm text-slate-200">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Menu items */}
      <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.155 0.025 240)' }}>
        {[
          { icon: <Bell size={16} className="text-slate-400" />, label: '通知设置' },
          { icon: <Settings size={16} className="text-slate-400" />, label: '系统设置' },
          { icon: <Phone size={16} className="text-slate-400" />, label: '紧急联系' },
        ].map((item, i) => (
          <button
            key={item.label}
            onClick={() => toast.info(item.label, { description: '功能开发中' })}
            className="w-full flex items-center justify-between px-4 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-sm text-slate-300">{item.label}</span>
            </div>
            <ChevronRight size={14} className="text-slate-600" />
          </button>
        ))}
      </div>

      <button
        onClick={() => toast.error('已退出登录')}
        className="w-full py-3 rounded-xl border border-red-500/20 bg-red-500/8 text-red-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-500/15 transition-all"
      >
        <LogOut size={16} />
        退出登录
      </button>
    </div>
  );
}

// ---- Main Mobile App ----
export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [showLiveView, setShowLiveView] = useState(false);
  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;

  const openLiveView = useCallback(() => setShowLiveView(true), []);
  const closeLiveView = useCallback(() => setShowLiveView(false), []);

  const tabContent: Record<string, React.ReactNode> = {
    home: <HomeTab onOpenLiveView={openLiveView} />,
    robots: <RobotsTab />,
    tasks: <TasksTab />,
    alerts: <AlertsTab />,
    me: <MeTab />,
  };

  const tabTitles: Record<string, string> = {
    home: '安保中心',
    robots: '机器人状态',
    tasks: '我的任务',
    alerts: '告警通知',
    me: '我的',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'oklch(0.08 0.02 240)' }}
    >
      {/* Phone frame */}
      <div
        className="relative w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl"
        style={{
          background: 'oklch(0.11 0.025 240)',
          border: '2px solid rgba(56,189,248,0.15)',
          boxShadow: '0 0 60px rgba(56,189,248,0.1), 0 40px 80px rgba(0,0,0,0.5)',
          minHeight: '780px',
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <span className="text-xs text-slate-400 font-mono-data">
            {new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="status-dot online" />
            <span className="text-xs text-emerald-400">在线</span>
          </div>
        </div>

        {/* App header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-white/8">
          <h1 className="text-base font-bold text-white font-display">
            {showLiveView ? '实时画面' : tabTitles[activeTab]}
          </h1>
          <div className="relative">
            <button className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-400">
              <Bell size={15} />
            </button>
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                {unreadAlerts}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ maxHeight: '620px' }}>
          <AnimatePresence mode="wait">
            {showLiveView ? (
              <motion.div
                key="liveview"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <RobotLiveView onBack={closeLiveView} />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom tab bar */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center border-t border-white/8 px-2 pb-2 pt-2"
          style={{ background: 'oklch(0.13 0.025 240)' }}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const hasAlert = tab.id === 'alerts' && unreadAlerts > 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="relative">
                  <tab.icon size={20} />
                  {hasAlert && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold" style={{ fontSize: '8px' }}>
                      {unreadAlerts}
                    </span>
                  )}
                </div>
                <span className="text-xs">{tab.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-sky-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop hint */}
      <div className="absolute top-4 right-4 text-xs text-slate-600 hidden lg:block">
        移动端预览 · 实际部署为独立 App
      </div>
    </div>
  );
}
