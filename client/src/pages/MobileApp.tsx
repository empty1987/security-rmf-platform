// ============================================================
// MobileApp — 移动端（安保人员核心操作端）
// Design Philosophy: 业务优先，快速操作，大字大按钮，颜色驱动
// 核心场景：事件处置、机器人调度、任务管理
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Home, Bot, ClipboardList, User,
  Bell, MapPin, Zap, CheckCircle2, ChevronRight,
  AlertTriangle, Activity, Clock, Radio, Camera,
  Phone, MessageSquare, LogOut, ArrowLeft,
  Loader2, CheckCheck, X, Navigation, Siren,
  Wrench, UserX, Eye, Send, MoreHorizontal,
  BatteryLow, Circle
} from 'lucide-react';
import { motion as m } from 'framer-motion';
import {
  robots, incidents, tasks, alerts, guardShifts,
  getRobotStatusLabel, getTaskStatusLabel,
  getIncidentLevelLabel, getIncidentStatusLabel,
  type Incident, type Robot, type Task,
} from '@/lib/mockData';
import RobotLiveView from './RobotLiveView';
import { toast } from 'sonner';

// ============================================================
// 常量与工具
// ============================================================
const INCIDENT_LEVEL_CONFIG = {
  urgent: {
    label: '紧急',
    bg: 'bg-red-500',
    light: 'bg-red-500/15 border-red-500/30',
    text: 'text-red-400',
    border: 'border-red-500/40',
    dot: '#ef4444',
  },
  important: {
    label: '重要',
    bg: 'bg-amber-500',
    light: 'bg-amber-500/15 border-amber-500/30',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    dot: '#f59e0b',
  },
  normal: {
    label: '一般',
    bg: 'bg-sky-500',
    light: 'bg-sky-500/15 border-sky-500/30',
    text: 'text-sky-400',
    border: 'border-sky-500/40',
    dot: '#38bdf8',
  },
};

const INCIDENT_STATUS_CONFIG = {
  open: { label: '待处置', badge: 'bg-red-500/15 text-red-400 border-red-500/25' },
  handling: { label: '处置中', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  closed: { label: '已关闭', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
};

const INCIDENT_TYPE_ICON: Record<string, React.ReactNode> = {
  '可疑人员': <UserX size={16} />,
  '设备故障': <Wrench size={16} />,
  '访客异常': <User size={16} />,
  '入侵告警': <Siren size={16} />,
  '火警': <AlertTriangle size={16} />,
  '其他': <MoreHorizontal size={16} />,
};

function robotStatusColor(status: Robot['status']) {
  switch (status) {
    case 'patrolling': return { dot: '#38bdf8', text: 'text-sky-400', bg: 'bg-sky-500/15 border-sky-500/25' };
    case 'responding': return { dot: '#fb923c', text: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/25' };
    case 'online': case 'idle': return { dot: '#34d399', text: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25' };
    case 'charging': return { dot: '#a78bfa', text: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/25' };
    case 'warning': return { dot: '#fbbf24', text: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/25' };
    default: return { dot: '#64748b', text: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/25' };
  }
}

// ============================================================
// 事件处置弹窗
// ============================================================
function IncidentModal({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const [step, setStep] = useState<'detail' | 'dispatch' | 'dispatching' | 'done'>('detail');
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const lv = INCIDENT_LEVEL_CONFIG[incident.level];
  const availableRobots = robots.filter(r => r.status !== 'offline' && r.status !== 'charging');

  const handleDispatch = () => {
    if (!selectedRobot) return;
    setStep('dispatching');
    setTimeout(() => {
      setStep('done');
      toast.success(`${selectedRobot.name} 已派出`, { description: `正前往 ${incident.location}` });
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-sm rounded-t-3xl overflow-hidden"
        style={{ background: 'oklch(0.12 0.025 240)', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 拖拽条 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* 标题栏 */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8">
          <div className={`w-2.5 h-2.5 rounded-full ${lv.bg}`} />
          <span className="font-bold text-slate-100 font-display flex-1 text-sm">{incident.title}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center text-slate-400">
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: '70vh' }}>
          {step === 'detail' && (
            <div className="space-y-4">
              {/* 事件信息 */}
              <div className="rounded-2xl border border-white/8 p-4 space-y-3" style={{ background: 'oklch(0.155 0.025 240)' }}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${lv.light} ${lv.text}`}>{lv.label}</span>
                  <span className="text-xs text-slate-500">{incident.type}</span>
                  <span className="text-xs text-slate-600 ml-auto">{incident.reportedAt}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{incident.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={11} />
                  <span>{incident.location}</span>
                </div>
              </div>

              {/* 快速操作按钮 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep('dispatch')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 transition-all active:scale-95"
                >
                  <Bot size={22} />
                  <span className="text-sm font-semibold">派遣机器人</span>
                </button>
                <button
                  onClick={() => { toast.success('已通知支援', { description: '值班长已收到通知' }); onClose(); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all active:scale-95"
                >
                  <Phone size={22} />
                  <span className="text-sm font-semibold">呼叫支援</span>
                </button>
                <button
                  onClick={() => { toast.success('已标记处置中'); onClose(); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all active:scale-95"
                >
                  <CheckCheck size={22} />
                  <span className="text-sm font-semibold">我去处理</span>
                </button>
                <button
                  onClick={() => { toast.info('已关闭事件'); onClose(); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-500/15 border border-slate-500/30 text-slate-400 hover:bg-slate-500/25 transition-all active:scale-95"
                >
                  <X size={22} />
                  <span className="text-sm font-semibold">误报关闭</span>
                </button>
              </div>
            </div>
          )}

          {step === 'dispatch' && (
            <div className="space-y-4">
              <button onClick={() => setStep('detail')} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
                <ArrowLeft size={14} /> 返回
              </button>
              <div>
                <p className="text-sm font-semibold text-slate-200 mb-1">选择派遣机器人</p>
                <p className="text-xs text-slate-500 mb-3">选择一台机器人前往 {incident.location}</p>
              </div>
              <div className="space-y-2">
                {availableRobots.map(robot => {
                  const sc = robotStatusColor(robot.status);
                  const isSelected = selectedRobot?.id === robot.id;
                  return (
                    <button
                      key={robot.id}
                      onClick={() => setSelectedRobot(robot)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                        isSelected ? 'border-sky-500/60 bg-sky-500/15' : 'border-white/8 bg-white/3 hover:bg-white/6'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sc.bg} border shrink-0`}>
                        <Bot size={18} className={sc.text} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-slate-200">{robot.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={9} />{robot.location}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-xs font-medium ${sc.text}`}>{getRobotStatusLabel(robot.status)}</div>
                        <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-0.5 justify-end">
                          <Zap size={9} />{robot.battery}%
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={18} className="text-sky-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleDispatch}
                disabled={!selectedRobot}
                className="w-full py-4 rounded-2xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
                style={{ background: selectedRobot ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : undefined, backgroundColor: selectedRobot ? undefined : 'rgba(255,255,255,0.05)', color: 'white' }}
              >
                {selectedRobot ? `派遣 ${selectedRobot.name} 前往` : '请先选择机器人'}
              </button>
            </div>
          )}

          {step === 'dispatching' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 size={40} className="text-sky-400 animate-spin" />
              <p className="text-slate-300 font-semibold">正在派遣 {selectedRobot?.name}...</p>
              <p className="text-xs text-slate-500">机器人正在规划路径</p>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <p className="text-slate-200 font-bold text-lg">派遣成功</p>
              <p className="text-sm text-slate-400">{selectedRobot?.name} 正前往 {incident.location}</p>
              <button onClick={onClose} className="mt-2 px-8 py-3 rounded-2xl bg-sky-500/15 border border-sky-500/25 text-sky-300 text-sm font-semibold">
                完成
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Tab 1: 事件处置（首页）
// ============================================================
function IncidentsTab({ onOpenLiveView }: { onOpenLiveView: () => void }) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const openIncidents = incidents.filter(i => i.status !== 'closed');
  const urgentCount = openIncidents.filter(i => i.level === 'urgent').length;

  return (
    <div className="space-y-4">
      {/* 当班状态横幅 */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{
          background: urgentCount > 0
            ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))'
            : 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))',
          border: urgentCount > 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)',
        }}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${urgentCount > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
          {urgentCount > 0
            ? <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity }}><Siren size={24} className="text-red-400" /></motion.div>
            : <Shield size={24} className="text-emerald-400" />
          }
        </div>
        <div className="flex-1">
          <div className={`text-base font-bold font-display ${urgentCount > 0 ? 'text-red-300' : 'text-emerald-300'}`}>
            {urgentCount > 0 ? `${urgentCount} 起紧急事件待处置` : '园区安全，无紧急事件'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {currentTime.toLocaleTimeString('zh-CN', { hour12: false })} · 共 {openIncidents.length} 件待处置
          </div>
        </div>
      </div>

      {/* 快捷操作行 */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: <Camera size={18} />, label: '查看监控', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', action: onOpenLiveView },
          { icon: <Navigation size={18} />, label: '上报事件', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', action: () => toast.info('上报事件', { description: '功能开发中' }) },
          { icon: <Phone size={18} />, label: '呼叫支援', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', action: () => toast.success('已呼叫值班长') },
        ].map(item => (
          <button
            key={item.label}
            onClick={item.action}
            className={`flex flex-col items-center gap-2 py-3 rounded-2xl border ${item.bg} ${item.color} active:scale-95 transition-all`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 事件列表 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-200">待处置事件</span>
          <span className="text-xs text-slate-500">{openIncidents.length} 件</span>
        </div>
        <div className="space-y-2.5">
          {openIncidents.map(incident => {
            const lv = INCIDENT_LEVEL_CONFIG[incident.level];
            const st = INCIDENT_STATUS_CONFIG[incident.status];
            return (
              <motion.button
                key={incident.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedIncident(incident)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${lv.border} hover:brightness-110`}
                style={{ background: `oklch(0.145 0.025 240)` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${lv.light} ${lv.text} border`}>
                    {INCIDENT_TYPE_ICON[incident.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${lv.bg} text-white`}>{lv.label}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${st.badge}`}>{st.label}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-100 leading-tight mb-1">{incident.title}</div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={9} />{incident.location}</span>
                      <span className="flex items-center gap-1"><Clock size={9} />{incident.reportedAt}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 shrink-0 mt-1" />
                </div>
                {incident.assignedRobotId && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-xs text-sky-400">
                    <Bot size={11} />
                    <span>{robots.find(r => r.id === incident.assignedRobotId)?.name ?? incident.assignedRobotId} 正在响应</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 已关闭事件折叠 */}
      <div>
        <div className="text-xs text-slate-600 text-center py-2">
          今日已关闭 {incidents.filter(i => i.status === 'closed').length} 件事件
        </div>
      </div>

      {/* 事件处置弹窗 */}
      <AnimatePresence>
        {selectedIncident && (
          <IncidentModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Tab 2: 机器人管理
// ============================================================
function RobotsTab({ onOpenLiveView }: { onOpenLiveView: (robotId?: string) => void }) {
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [sendingCmd, setSendingCmd] = useState<string | null>(null);

  const sendCommand = (robot: Robot, cmd: string) => {
    setSendingCmd(cmd);
    setTimeout(() => {
      setSendingCmd(null);
      toast.success(`指令已发送`, { description: `${robot.name}：${cmd}` });
    }, 1200);
  };

  if (selectedRobot) {
    const sc = robotStatusColor(selectedRobot.status);
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedRobot(null)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft size={14} /> 返回机器人列表
        </button>

        {/* 机器人详情卡 */}
        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'oklch(0.145 0.025 240)' }}>
          {/* 实时画面预览 */}
          <div className="relative cursor-pointer" onClick={() => onOpenLiveView(selectedRobot.id)}>
            <img src={selectedRobot.cameraFeed} alt="实时画面" className="w-full h-36 object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2">
              <Camera size={20} className="text-white" />
              <span className="text-white text-sm font-semibold">点击查看实时画面</span>
            </div>
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <Circle size={7} className="fill-red-500 text-red-500" />
              </motion.div>
              <span className="text-xs text-white font-mono">LIVE</span>
            </div>
            <div className="absolute top-2 right-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sc.bg} border`}>{getRobotStatusLabel(selectedRobot.status)}</span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <div className="text-lg font-bold text-slate-100 font-display">{selectedRobot.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin size={10} />{selectedRobot.location}
              </div>
            </div>

            {/* 状态数据 */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '电量', value: `${selectedRobot.battery}%`, color: selectedRobot.battery < 20 ? 'text-red-400' : selectedRobot.battery < 50 ? 'text-amber-400' : 'text-emerald-400' },
                { label: '速度', value: `${selectedRobot.speed}km/h`, color: 'text-sky-400' },
                { label: '今日巡逻', value: `${selectedRobot.totalPatrols}次`, color: 'text-violet-400' },
              ].map(item => (
                <div key={item.label} className="text-center py-2.5 rounded-xl border border-white/5" style={{ background: 'oklch(0.12 0.02 240)' }}>
                  <div className={`text-base font-bold font-display ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 操作指令 */}
        <div>
          <p className="text-sm font-semibold text-slate-300 mb-3">发送指令</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: '立即停止', icon: <X size={18} />, color: 'text-red-400 bg-red-500/10 border-red-500/25', cmd: '立即停止' },
              { label: '返回充电', icon: <Zap size={18} />, color: 'text-violet-400 bg-violet-500/10 border-violet-500/25', cmd: '返回充电' },
              { label: '继续巡逻', icon: <Navigation size={18} />, color: 'text-sky-400 bg-sky-500/10 border-sky-500/25', cmd: '继续巡逻' },
              { label: '前往指定点', icon: <MapPin size={18} />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/25', cmd: '前往指定点' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => sendCommand(selectedRobot, item.cmd)}
                disabled={sendingCmd !== null}
                className={`flex items-center gap-2.5 p-3.5 rounded-2xl border ${item.color} active:scale-95 transition-all disabled:opacity-50`}
              >
                {sendingCmd === item.cmd ? <Loader2 size={18} className="animate-spin" /> : item.icon}
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 统计行 */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '在线', value: robots.filter(r => r.status !== 'offline').length, color: 'text-emerald-400' },
          { label: '巡逻中', value: robots.filter(r => r.status === 'patrolling').length, color: 'text-sky-400' },
          { label: '需关注', value: robots.filter(r => r.status === 'warning').length, color: 'text-amber-400' },
        ].map(item => (
          <div key={item.label} className="text-center py-3 rounded-2xl border border-white/8" style={{ background: 'oklch(0.155 0.025 240)' }}>
            <div className={`text-2xl font-bold font-display ${item.color}`}>{item.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 机器人列表 */}
      <div className="space-y-2.5">
        {robots.map(robot => {
          const sc = robotStatusColor(robot.status);
          return (
            <motion.button
              key={robot.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRobot(robot)}
              className="w-full text-left rounded-2xl border border-white/8 overflow-hidden transition-all hover:border-white/15"
              style={{ background: 'oklch(0.145 0.025 240)' }}
            >
              <div className="flex items-center gap-3 p-3.5">
                {/* 摄像头缩略图 */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <img src={robot.cameraFeed} alt={robot.name} className="w-full h-full object-cover" />
                  <div
                    className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-black/40"
                    style={{ background: sc.dot, boxShadow: `0 0 5px ${sc.dot}` }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-100 font-display">{robot.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${sc.bg} ${sc.text}`}>
                      {getRobotStatusLabel(robot.status)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                    <MapPin size={9} />{robot.location}
                  </div>
                  {/* 电量条 */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${robot.battery}%`,
                          background: robot.battery < 20 ? '#ef4444' : robot.battery < 50 ? '#f59e0b' : '#34d399',
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 shrink-0">{robot.battery}%</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600 shrink-0" />
              </div>
              {robot.status === 'warning' && (
                <div className="px-3.5 pb-2.5 flex items-center gap-1.5 text-xs text-amber-400">
                  <BatteryLow size={11} />
                  <span>电量不足，建议返回充电</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Tab 3: 我的任务
// ============================================================
function TasksTab() {
  const [filter, setFilter] = useState<'all' | 'running' | 'pending' | 'completed'>('all');
  const myTasks = tasks.filter(t => filter === 'all' ? true : t.status === filter);

  const priorityColor: Record<string, string> = {
    urgent: 'text-red-400 bg-red-500/10 border-red-500/25',
    high: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    medium: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
    low: 'text-slate-400 bg-slate-500/10 border-slate-500/25',
  };
  const priorityLabel: Record<string, string> = { urgent: '紧急', high: '高', medium: '中', low: '低' };

  return (
    <div className="space-y-4">
      {/* 筛选器 */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {[
          { key: 'all', label: '全部', count: tasks.length },
          { key: 'running', label: '进行中', count: tasks.filter(t => t.status === 'running').length },
          { key: 'pending', label: '待开始', count: tasks.filter(t => t.status === 'pending').length },
          { key: 'completed', label: '已完成', count: tasks.filter(t => t.status === 'completed').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm transition-all ${
              filter === tab.key
                ? 'bg-sky-500/20 border border-sky-500/40 text-sky-300 font-semibold'
                : 'bg-white/5 border border-white/8 text-slate-400'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 rounded-full ${filter === tab.key ? 'bg-sky-500/30 text-sky-300' : 'bg-white/8 text-slate-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 任务列表 */}
      <div className="space-y-2.5">
        {myTasks.map(task => {
          const pc = priorityColor[task.priority] ?? priorityColor.medium;
          const robot = robots.find(r => r.id === task.assignedRobot);
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/8 p-4"
              style={{ background: 'oklch(0.145 0.025 240)' }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${pc}`}>{priorityLabel[task.priority]}</span>
                    <span className="text-xs text-slate-500">{getTaskStatusLabel(task.status)}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-100">{task.title}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin size={9} />{task.location}
                  </div>
                </div>
              </div>

              {/* 进度条（进行中任务） */}
              {task.status === 'running' && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>执行进度</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8">
                    <motion.div
                      className="h-full rounded-full bg-sky-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              {/* 关联机器人 */}
              {robot && (
                <div className="flex items-center gap-2 mb-3 px-2.5 py-2 rounded-xl border border-sky-500/15 bg-sky-500/5">
                  <Bot size={12} className="text-sky-400" />
                  <span className="text-xs text-sky-300">{robot.name}</span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-slate-500">{robot.location}</span>
                </div>
              )}

              {/* 操作按钮 */}
              {task.status === 'running' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.success('已标记完成', { description: task.title })}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 active:scale-95 transition-all"
                  >
                    完成任务
                  </button>
                  <button
                    onClick={() => toast.info('已请求支援')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-500/15 border border-amber-500/25 text-amber-300 active:scale-95 transition-all"
                  >
                    需要支援
                  </button>
                </div>
              )}
              {task.status === 'pending' && (
                <button
                  onClick={() => toast.success('已开始任务', { description: task.title })}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-sky-500/15 border border-sky-500/25 text-sky-300 active:scale-95 transition-all"
                >
                  开始任务
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Tab 4: 我的（个人中心）
// ============================================================
function MeTab() {
  const guard = guardShifts.find(g => g.status === 'on-duty') ?? guardShifts[0];
  return (
    <div className="space-y-4">
      {/* 个人信息卡 */}
      <div className="rounded-2xl border border-white/8 p-5" style={{ background: 'oklch(0.145 0.025 240)' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-2xl font-bold text-sky-300 font-display shrink-0">
            {guard.guardName.slice(0, 1)}
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100 font-display">{guard.guardName}</div>
            <div className="text-sm text-slate-400 mt-0.5">{guard.guardId} · 安保一队</div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold">值班中</span>
            </div>
          </div>
        </div>
      </div>

      {/* 今日数据 */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '完成任务', value: guard.tasksCompleted, color: 'text-emerald-400' },
          { label: '处置事件', value: 2, color: 'text-sky-400' },
          { label: '巡逻时长', value: '4.5h', color: 'text-violet-400' },
        ].map(item => (
          <div key={item.label} className="text-center py-3 rounded-2xl border border-white/8" style={{ background: 'oklch(0.155 0.025 240)' }}>
            <div className={`text-xl font-bold font-display ${item.color}`}>{item.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 班次信息 */}
      <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.145 0.025 240)' }}>
        <div className="px-4 py-3 border-b border-white/8 text-sm font-semibold text-slate-200">班次信息</div>
        {[
          { label: '班次', value: `${guard.shiftStart} - ${guard.shiftEnd}` },
          { label: '负责区域', value: guard.zone ?? guard.area },
          { label: '班组', value: '安保一队' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0">
            <span className="text-sm text-slate-400">{item.label}</span>
            <span className="text-sm text-slate-200">{item.value}</span>
          </div>
        ))}
      </div>

      {/* 功能入口 */}
      <div className="space-y-2">
        {[
          { icon: <Bell size={16} />, label: '消息通知设置', action: () => toast.info('通知设置功能开发中') },
          { icon: <MessageSquare size={16} />, label: '交班记录', action: () => toast.info('交班记录功能开发中') },
          { icon: <LogOut size={16} />, label: '退出登录', action: () => toast.info('已退出') },
        ].map(item => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-white/8 text-slate-300 hover:bg-white/5 transition-all active:scale-98"
            style={{ background: 'oklch(0.145 0.025 240)' }}
          >
            <span className="text-slate-500">{item.icon}</span>
            <span className="text-sm flex-1 text-left">{item.label}</span>
            <ChevronRight size={14} className="text-slate-600" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 主组件
// ============================================================
const tabs = [
  { id: 'incidents', label: '事件', icon: Siren },
  { id: 'robots', label: '机器人', icon: Bot },
  { id: 'tasks', label: '任务', icon: ClipboardList },
  { id: 'me', label: '我的', icon: User },
];

const tabTitles: Record<string, string> = {
  incidents: '事件处置',
  robots: '机器人管理',
  tasks: '我的任务',
  me: '个人中心',
};

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('incidents');
  const [showLiveView, setShowLiveView] = useState(false);
  const [liveViewRobotId, setLiveViewRobotId] = useState<string | undefined>(undefined);

  const openLiveView = useCallback((robotId?: string) => {
    setLiveViewRobotId(robotId);
    setShowLiveView(true);
  }, []);
  const closeLiveView = useCallback(() => setShowLiveView(false), []);

  const urgentCount = incidents.filter(i => i.level === 'urgent' && i.status !== 'closed').length;
  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;

  const tabContent: Record<string, React.ReactNode> = {
    incidents: <IncidentsTab onOpenLiveView={() => openLiveView()} />,
    robots: <RobotsTab onOpenLiveView={openLiveView} />,
    tasks: <TasksTab />,
    me: <MeTab />,
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-8" style={{ background: 'oklch(0.09 0.02 240)' }}>
      {/* 手机外壳 */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 390,
          height: 780,
          background: 'oklch(0.10 0.022 240)',
          borderRadius: 44,
          border: '2px solid rgba(255,255,255,0.1)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* 状态栏 */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
          <span className="text-xs text-slate-400 font-mono-data">
            {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          <div className="w-20 h-5 rounded-full bg-black flex items-center justify-center" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-xs text-slate-500 font-semibold">安保系统</span>
          </div>
          <div className="flex items-center gap-1.5">
            {urgentCount > 0 && (
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
            )}
            <span className="text-xs text-emerald-400">在线</span>
          </div>
        </div>

        {/* 页面标题 */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-white/8 shrink-0">
          <h1 className="text-base font-bold text-white font-display">
            {showLiveView ? '实时监控' : tabTitles[activeTab]}
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

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'none' }}>
          <AnimatePresence mode="wait">
            {showLiveView ? (
              <motion.div
                key="liveview"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.25 }}
              >
                <RobotLiveView onBack={closeLiveView} initialRobotId={liveViewRobotId} />
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

        {/* 底部导航 */}
        {!showLiveView && (
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center border-t border-white/8 px-2 pb-3 pt-2 shrink-0"
            style={{ background: 'oklch(0.10 0.022 240)' }}
          >
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const hasUrgent = tab.id === 'incidents' && urgentCount > 0;
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
                    {hasUrgent && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold"
                        style={{ fontSize: 8 }}
                      >
                        {urgentCount}
                      </motion.span>
                    )}
                  </div>
                  <span className="text-xs">{tab.label}</span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-sky-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
