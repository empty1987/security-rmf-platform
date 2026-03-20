// ============================================================
// AdminDashboard — 业务端管理后台总览
// Design: Card-based dashboard with charts and quick actions
// ============================================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot, AlertTriangle, CheckCircle2, Activity, Users,
  TrendingUp, Clock, Zap, Shield, MapPin, ChevronRight,
  PlayCircle, PauseCircle, RefreshCw
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import {
  robots, tasks, alerts, statistics, visitors, guardShifts,
  getRobotStatusLabel, getTaskTypeLabel, getTaskStatusLabel,
  hourlyStats, taskDistribution
} from '@/lib/mockData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from 'sonner';

function MetricCard({ icon, label, value, change, color, sub }: {
  icon: React.ReactNode; label: string; value: string | number;
  change?: string; color: string; sub?: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-5 border ${c.border} ${c.bg} flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center ${c.text}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className={`text-3xl font-bold font-display ${c.text}`}>{value}</div>
        {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
      </div>
      {change && (
        <div className="flex items-center gap-1 text-xs text-emerald-400">
          <TrendingUp size={11} />
          {change}
        </div>
      )}
    </motion.div>
  );
}

const statusBadge: Record<string, string> = {
  online: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  patrolling: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  responding: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  charging: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  offline: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  running: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  pending: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  failed: 'bg-red-500/15 text-red-400 border-red-500/25',
};

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState<'robots' | 'tasks'>('robots');

  const activeTasks = tasks.filter(t => t.status === 'running');
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <AdminLayout title="系统总览">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={<Bot size={18} />}
          label="在线机器人"
          value={`${statistics.onlineRobots}/${statistics.totalRobots}`}
          sub="1台充电中"
          color="blue"
          change="系统正常运行"
        />
        <MetricCard
          icon={<Activity size={18} />}
          label="执行中任务"
          value={activeTasks.length}
          sub={`今日共 ${statistics.todayTasks} 项`}
          color="green"
        />
        <MetricCard
          icon={<AlertTriangle size={18} />}
          label="未处理告警"
          value={unacknowledgedAlerts.length}
          sub={`今日共 ${statistics.todayAlerts} 条`}
          color={unacknowledgedAlerts.length > 0 ? 'red' : 'green'}
        />
        <MetricCard
          icon={<Users size={18} />}
          label="在场访客"
          value={statistics.activeVisitors}
          sub={`今日共 ${statistics.todayVisitors} 人`}
          color="violet"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Charts */}
        <div className="col-span-2 rounded-xl border border-white/8 p-5" style={{ background: 'oklch(0.145 0.022 240)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 font-display">今日任务活动</h3>
            <span className="text-xs text-slate-500">按小时统计</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourlyStats} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="hour" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'oklch(0.17 0.025 240)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="patrols" name="巡逻" fill="rgba(56,189,248,0.7)" radius={[3,3,0,0]} />
              <Bar dataKey="alerts" name="告警" fill="rgba(248,113,113,0.7)" radius={[3,3,0,0]} />
              <Bar dataKey="tasks" name="任务" fill="rgba(52,211,153,0.7)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task distribution pie */}
        <div className="rounded-xl border border-white/8 p-5" style={{ background: 'oklch(0.145 0.022 240)' }}>
          <h3 className="text-sm font-semibold text-slate-200 font-display mb-4">任务类型分布</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={taskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {taskDistribution.map((entry: { name: string; value: number; color: string }, index: number) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'oklch(0.17 0.025 240)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1 mt-1">
            {taskDistribution.map((item: { name: string; value: number; color: string }) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <span className="text-slate-300 font-mono-data">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid: Robots + Tasks + Alerts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Robot status */}
        <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.145 0.022 240)' }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
            <h3 className="text-sm font-semibold text-slate-200 font-display">机器人状态</h3>
            <span className="text-xs text-sky-400 cursor-pointer hover:underline">查看全部</span>
          </div>
          <div className="divide-y divide-white/5">
            {robots.map(robot => (
              <div key={robot.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors">
                <div className={`status-dot ${robot.status === 'patrolling' || robot.status === 'responding' ? 'online' : robot.status === 'warning' ? 'warning' : robot.status === 'offline' ? 'offline' : 'online'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-200 truncate">{robot.name}</div>
                  <div className="text-xs text-slate-500 truncate">{robot.location}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${statusBadge[robot.status]}`}>
                    {getRobotStatusLabel(robot.status)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Zap size={9} className="text-amber-400" />
                    <span className="text-xs font-mono-data text-slate-400">{robot.battery}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active tasks */}
        <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.145 0.022 240)' }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
            <h3 className="text-sm font-semibold text-slate-200 font-display">任务列表</h3>
            <button
              onClick={() => toast.success('新建任务', { description: '请在任务调度页面创建新任务' })}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
            >
              + 新建
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {tasks.slice(0, 6).map(task => (
              <div key={task.id} className="px-5 py-3 hover:bg-white/3 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-200 truncate flex-1">{task.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ml-2 shrink-0 ${statusBadge[task.status]}`}>
                    {getTaskStatusLabel(task.status)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={9} />
                    {task.location}
                  </span>
                  {task.assignedRobot && (
                    <span className="flex items-center gap-1">
                      <Bot size={9} />
                      {task.assignedRobot}
                    </span>
                  )}
                </div>
                {task.status === 'running' && (
                  <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${task.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Guards */}
        <div className="flex flex-col gap-4">
          {/* Alerts */}
          <div className="rounded-xl border border-white/8 overflow-hidden flex-1" style={{ background: 'oklch(0.145 0.022 240)' }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
              <h3 className="text-sm font-semibold text-slate-200 font-display">最新告警</h3>
              {unacknowledgedAlerts.length > 0 && (
                <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/25">
                  {unacknowledgedAlerts.length} 未读
                </span>
              )}
            </div>
            <div className="divide-y divide-white/5">
              {alerts.slice(0, 4).map(alert => (
                <div key={alert.id} className={`px-5 py-3 hover:bg-white/3 transition-colors ${!alert.acknowledged ? 'bg-red-500/3' : ''}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={13} className={
                      alert.level === 'critical' ? 'text-red-400 mt-0.5' :
                      alert.level === 'warning' ? 'text-amber-400 mt-0.5' : 'text-sky-400 mt-0.5'
                    } />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-200 truncate">{alert.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono-data">{alert.timestamp}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guard shifts */}
          <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.145 0.022 240)' }}>
            <div className="px-5 py-3 border-b border-white/8">
              <h3 className="text-sm font-semibold text-slate-200 font-display">值班保安</h3>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {guardShifts.filter(g => g.status === 'on-duty' || g.status === 'break').map(guard => (
                <div key={guard.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-xs font-bold text-sky-400 font-display shrink-0">
                    {guard.guardName.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-200">{guard.guardName}</div>
                    <div className="text-xs text-slate-500">{guard.zone ?? guard.area}</div>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${guard.status === 'on-duty' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-amber-500/15 text-amber-400 border-amber-500/25'}`}>
                    {guard.status === 'on-duty' ? '値班中' : '休息'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
