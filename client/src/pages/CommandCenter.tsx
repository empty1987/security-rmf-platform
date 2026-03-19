// ============================================================
// CommandCenter — 大屏端指挥中心
// Design: Full-screen dark tactical dashboard
// Layout: Left panel (robots) + Center (map) + Right panel (tasks/alerts)
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Bot, AlertTriangle, CheckCircle2, Activity,
  Zap, MapPin, Clock, ChevronRight, Bell, Radio,
  TrendingUp, Users, Eye
} from 'lucide-react';
import CampusMap from '@/components/CampusMap';
import {
  robots, tasks, alerts, statistics,
  getRobotStatusLabel, getAlertLevelLabel,
  type Robot, type Alert
} from '@/lib/mockData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { hourlyStats } from '@/lib/mockData';

const statusBg: Record<string, string> = {
  online: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  patrolling: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  responding: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  charging: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  offline: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const alertBg: Record<string, string> = {
  critical: 'border-l-red-500 bg-red-500/5',
  warning: 'border-l-amber-500 bg-amber-500/5',
  info: 'border-l-sky-500 bg-sky-500/5',
};

const alertIcon: Record<string, React.ReactNode> = {
  critical: <AlertTriangle size={14} className="text-red-400" />,
  warning: <AlertTriangle size={14} className="text-amber-400" />,
  info: <Bell size={14} className="text-sky-400" />,
};

function StatCard({ icon, label, value, sub, color = 'blue' }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
  const colors: Record<string, string> = {
    blue: 'text-sky-400',
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    violet: 'text-violet-400',
  };
  return (
    <div className="flex-1 rounded-lg p-3 border border-white/5 bg-white/3 flex flex-col gap-1 panel-glow">
      <div className="flex items-center gap-2">
        <span className={colors[color]}>{icon}</span>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className={`text-2xl font-bold font-display ${colors[color]} text-glow-blue`}>{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function RobotCard({ robot, selected, onClick }: { robot: Robot; selected: boolean; onClick: () => void }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={`rounded-lg p-3 border cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-sky-500/60 bg-sky-500/10'
          : 'border-white/5 bg-white/3 hover:border-sky-500/30 hover:bg-sky-500/5'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-sky-400" />
          <span className="text-xs font-mono-data text-sky-300">{robot.id}</span>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded border ${statusBg[robot.status]}`}>
          {getRobotStatusLabel(robot.status)}
        </span>
      </div>
      <div className="text-sm font-medium text-slate-200 mb-1">{robot.name}</div>
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
        <MapPin size={10} />
        <span className="truncate">{robot.location}</span>
      </div>
      {/* Battery bar */}
      <div className="flex items-center gap-2">
        <Zap size={10} className={robot.battery < 20 ? 'text-red-400 animate-blink-critical' : 'text-amber-400'} />
        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${robot.battery}%`,
              background: robot.battery < 20 ? '#f87171' : robot.battery < 50 ? '#fbbf24' : '#34d399',
            }}
          />
        </div>
        <span className={`text-xs font-mono-data ${robot.battery < 20 ? 'text-red-400' : 'text-slate-400'}`}>
          {robot.battery}%
        </span>
      </div>
    </motion.div>
  );
}

function AlertItem({ alert }: { alert: Alert }) {
  return (
    <div className={`rounded-lg p-3 border-l-2 ${alertBg[alert.level]} ${alert.acknowledged ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-2">
        {alertIcon[alert.level]}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-medium text-slate-200 truncate">{alert.title}</span>
            <span className="text-xs text-slate-500 shrink-0 font-mono-data">{alert.timestamp}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{alert.description}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={9} className="text-slate-500" />
            <span className="text-xs text-slate-500">{alert.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommandCenter() {
  const [selectedRobot, setSelectedRobot] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlerts] = useState(alerts.filter(a => !a.acknowledged));

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const selectedRobotData = robots.find(r => r.id === selectedRobot);
  const activeTasks = tasks.filter(t => t.status === 'running');

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col" style={{ background: 'oklch(0.11 0.025 240)' }}>
      {/* Top header bar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-white/8 shrink-0"
        style={{ background: 'oklch(0.13 0.025 240)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
            <Shield size={16} className="text-sky-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white font-display">安保多机器人协作平台</div>
            <div className="text-xs text-slate-500">Security RMF · 指挥中心</div>
          </div>
        </div>

        {/* Center stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="status-dot online" />
            <span className="text-xs text-slate-300">在线机器人</span>
            <span className="text-sm font-bold text-emerald-400 font-display">{statistics.onlineRobots}/{statistics.totalRobots}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="status-dot critical" />
            <span className="text-xs text-slate-300">紧急告警</span>
            <span className="text-sm font-bold text-red-400 font-display">{activeAlerts.filter(a => a.level === 'critical').length}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-sky-400" />
            <span className="text-xs text-slate-300">执行中任务</span>
            <span className="text-sm font-bold text-sky-400 font-display">{activeTasks.length}</span>
          </div>
        </div>

        {/* Time */}
        <div className="text-right">
          <div className="text-lg font-bold text-white font-mono-data text-glow-blue">
            {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
          </div>
          <div className="text-xs text-slate-500">
            {currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Robot list */}
        <aside className="w-72 flex flex-col border-r border-white/8 overflow-hidden shrink-0"
          style={{ background: 'oklch(0.13 0.025 240)' }}>
          {/* Stats row */}
          <div className="p-3 grid grid-cols-2 gap-2 border-b border-white/8">
            <StatCard icon={<Bot size={14}/>} label="机器人总数" value={statistics.totalRobots} color="blue" />
            <StatCard icon={<Activity size={14}/>} label="巡逻中" value={statistics.activePatrols} color="green" />
          </div>

          {/* Robot list */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">机器人状态</span>
              <span className="text-xs text-sky-400">{robots.length} 台</span>
            </div>
            {robots.map(robot => (
              <RobotCard
                key={robot.id}
                robot={robot}
                selected={selectedRobot === robot.id}
                onClick={() => setSelectedRobot(selectedRobot === robot.id ? null : robot.id)}
              />
            ))}
          </div>

          {/* Selected robot detail */}
          <AnimatePresence>
            {selectedRobotData && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-sky-500/20 overflow-hidden"
                style={{ background: 'oklch(0.15 0.03 230)' }}
              >
                <div className="p-3">
                  <div className="text-xs font-medium text-sky-400 mb-2 flex items-center gap-1">
                    <Eye size={12} />
                    机器人详情
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: '型号', value: selectedRobotData.model },
                      { label: '速度', value: `${selectedRobotData.speed} km/h` },
                      { label: '今日运行', value: `${selectedRobotData.uptime}h` },
                      { label: '今日巡逻', value: `${selectedRobotData.totalPatrols} 次` },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="text-slate-500">{item.label}</div>
                        <div className="text-slate-200 font-mono-data">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {selectedRobotData.currentTask && (
                    <div className="mt-2 p-2 rounded bg-sky-500/10 border border-sky-500/20">
                      <div className="text-xs text-slate-400">当前任务</div>
                      <div className="text-xs text-sky-300 font-mono-data">{selectedRobotData.currentTask}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Center: Map */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Map area */}
          <div className="flex-1 relative">
            <CampusMap
              selectedRobot={selectedRobot}
              onRobotClick={id => setSelectedRobot(selectedRobot === id ? null : id)}
              className="w-full h-full"
            />
            {/* Map overlay info */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <div className="px-3 py-1.5 rounded-lg text-xs font-mono-data border border-sky-500/20 bg-black/60 text-sky-300 backdrop-blur-sm">
                <Radio size={10} className="inline mr-1.5 animate-pulse" />
                实时监控 · 1楼平面图
              </div>
            </div>
          </div>

          {/* Bottom chart */}
          <div className="h-28 border-t border-white/8 p-3" style={{ background: 'oklch(0.13 0.025 240)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 flex items-center gap-1"><TrendingUp size={11}/>今日活动趋势</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-sky-400 inline-block rounded"/>巡逻</span>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-red-400 inline-block rounded"/>告警</span>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-400 inline-block rounded"/>任务</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={70}>
              <AreaChart data={hourlyStats} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorPatrols" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'oklch(0.17 0.025 240)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '6px', fontSize: '11px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="patrols" stroke="#38bdf8" strokeWidth={1.5} fill="url(#colorPatrols)" />
                <Area type="monotone" dataKey="alerts" stroke="#f87171" strokeWidth={1.5} fill="url(#colorAlerts)" />
                <Area type="monotone" dataKey="tasks" stroke="#34d399" strokeWidth={1.5} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </main>

        {/* Right panel: Tasks & Alerts */}
        <aside className="w-80 flex flex-col border-l border-white/8 overflow-hidden shrink-0"
          style={{ background: 'oklch(0.13 0.025 240)' }}>
          {/* Stats */}
          <div className="p-3 grid grid-cols-2 gap-2 border-b border-white/8">
            <StatCard icon={<AlertTriangle size={14}/>} label="今日告警" value={statistics.todayAlerts} color="amber" />
            <StatCard icon={<Users size={14}/>} label="访客在场" value={statistics.activeVisitors} color="violet" />
          </div>

          {/* Alerts */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">实时告警</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${activeAlerts.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {activeAlerts.length} 未处理
              </span>
            </div>
            {alerts.map(alert => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>

          {/* Active tasks */}
          <div className="border-t border-white/8 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">执行中任务</span>
              <span className="text-xs text-sky-400">{activeTasks.length} 项</span>
            </div>
            <div className="flex flex-col gap-2">
              {activeTasks.slice(0, 3).map(task => (
                <div key={task.id} className="rounded-lg p-2.5 border border-white/5 bg-white/3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-200 truncate flex-1">{task.title}</span>
                    <span className="text-xs font-mono-data text-sky-400 ml-2">{task.progress}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-sky-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  {task.assignedRobot && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Bot size={9} className="text-slate-500" />
                      <span className="text-xs text-slate-500 font-mono-data">{task.assignedRobot}</span>
                      <ChevronRight size={9} className="text-slate-600" />
                      <span className="text-xs text-slate-500 truncate">{task.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
