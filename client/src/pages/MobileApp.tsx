// ============================================================
// MobileApp — 移动端一线保安 App
// Design: Mobile-first, bottom tab navigation, card-based UI
// Simulates a phone screen within the browser
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Home, Bot, AlertTriangle, ClipboardList, User,
  Bell, MapPin, Zap, CheckCircle2, Phone, Radio, Camera,
  ChevronRight, ArrowLeft, Clock, Activity, Navigation,
  MessageSquare, Settings, LogOut
} from 'lucide-react';
import {
  robots, tasks, alerts, guardShifts,
  getRobotStatusLabel, getTaskStatusLabel, getAlertLevelLabel
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

// ---- Home Tab ----
function HomeTab() {
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
          { label: '在线机器人', value: 5, icon: <Bot size={16} className="text-sky-400" />, color: 'text-sky-400' },
          { label: '未处理告警', value: unreadAlerts.length, icon: <AlertTriangle size={16} className="text-red-400" />, color: 'text-red-400' },
          { label: '执行中任务', value: activeTasks.length, icon: <Activity size={16} className="text-emerald-400" />, color: 'text-emerald-400' },
        ].map(item => (
          <div key={item.label} className="rounded-xl p-3 border border-white/8 text-center" style={{ background: 'oklch(0.155 0.025 240)' }}>
            <div className="flex justify-center mb-1.5">{item.icon}</div>
            <div className={`text-xl font-bold font-display ${item.color}`}>{item.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
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
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">当前任务</div>
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
  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;

  const tabContent: Record<string, React.ReactNode> = {
    home: <HomeTab />,
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
          <h1 className="text-base font-bold text-white font-display">{tabTitles[activeTab]}</h1>
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
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tabContent[activeTab]}
            </motion.div>
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
