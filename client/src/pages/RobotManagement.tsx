// ============================================================
// RobotManagement — 机器人管理页面
// ============================================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, MapPin, Activity, Play, Pause, RotateCcw, Settings, ChevronDown } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { robots, getRobotStatusLabel, type Robot } from '@/lib/mockData';
import { toast } from 'sonner';

const statusBadge: Record<string, string> = {
  online: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  patrolling: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  responding: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  charging: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  offline: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
};

function RobotDetailCard({ robot }: { robot: Robot }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-white/8 overflow-hidden"
      style={{ background: 'oklch(0.145 0.022 240)' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
            <Bot size={20} className="text-sky-400" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 font-display">{robot.name}</div>
            <div className="text-xs text-slate-500 font-mono-data">{robot.id} · {robot.model}</div>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-lg border ${statusBadge[robot.status]}`}>
          {getRobotStatusLabel(robot.status)}
        </span>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Battery */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400 flex items-center gap-1"><Zap size={11}/>电量</span>
            <span className={`text-sm font-bold font-mono-data ${robot.battery < 20 ? 'text-red-400' : robot.battery < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {robot.battery}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${robot.battery}%`,
                background: robot.battery < 20 ? 'linear-gradient(90deg, #f87171, #ef4444)' :
                  robot.battery < 50 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' :
                  'linear-gradient(90deg, #34d399, #10b981)',
              }}
            />
          </div>
        </div>

        <div className="rounded-lg p-3 bg-white/3 border border-white/5">
          <div className="text-xs text-slate-500 mb-1">当前位置</div>
          <div className="text-sm text-slate-200 flex items-center gap-1">
            <MapPin size={11} className="text-sky-400 shrink-0" />
            <span className="truncate">{robot.location}</span>
          </div>
        </div>

        <div className="rounded-lg p-3 bg-white/3 border border-white/5">
          <div className="text-xs text-slate-500 mb-1">移动速度</div>
          <div className="text-sm text-slate-200 font-mono-data">{robot.speed} km/h</div>
        </div>

        <div className="rounded-lg p-3 bg-white/3 border border-white/5">
          <div className="text-xs text-slate-500 mb-1">今日运行</div>
          <div className="text-sm text-slate-200 font-mono-data">{robot.uptime}h</div>
        </div>

        <div className="rounded-lg p-3 bg-white/3 border border-white/5">
          <div className="text-xs text-slate-500 mb-1">今日巡逻</div>
          <div className="text-sm text-slate-200 font-mono-data">{robot.totalPatrols} 次</div>
        </div>

        {robot.currentTask && (
          <div className="col-span-2 rounded-lg p-3 bg-sky-500/8 border border-sky-500/20">
            <div className="text-xs text-sky-400 mb-1 flex items-center gap-1"><Activity size={10}/>当前任务</div>
            <div className="text-sm text-slate-200 font-mono-data">{robot.currentTask}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => toast.success(`已发送暂停指令给 ${robot.name}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
        >
          <Pause size={12} />
          暂停
        </button>
        <button
          onClick={() => toast.success(`已发送返航指令给 ${robot.name}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
        >
          <RotateCcw size={12} />
          返航
        </button>
        <button
          onClick={() => toast.info(`${robot.name} 设置`, { description: '功能开发中' })}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs bg-sky-500/15 border border-sky-500/25 text-sky-400 hover:bg-sky-500/25 transition-all"
        >
          <Settings size={12} />
          设置
        </button>
      </div>
    </motion.div>
  );
}

export default function RobotManagement() {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? robots : robots.filter(r => r.status === filter);

  return (
    <AdminLayout title="机器人管理">
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: '全部', count: robots.length },
          { key: 'patrolling', label: '巡逻中', count: robots.filter(r => r.status === 'patrolling').length },
          { key: 'responding', label: '响应中', count: robots.filter(r => r.status === 'responding').length },
          { key: 'online', label: '待命', count: robots.filter(r => r.status === 'online').length },
          { key: 'charging', label: '充电中', count: robots.filter(r => r.status === 'charging').length },
          { key: 'warning', label: '异常', count: robots.filter(r => r.status === 'warning').length },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
              filter === item.key
                ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                : 'border-white/8 text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {item.label}
            <span className="ml-1.5 text-xs opacity-70">{item.count}</span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => toast.success('批量指令', { description: '功能开发中' })}
            className="px-3 py-1.5 rounded-lg text-sm bg-sky-500/15 border border-sky-500/25 text-sky-400 hover:bg-sky-500/25 transition-all flex items-center gap-1.5"
          >
            <Play size={13} />
            批量派遣
          </button>
        </div>
      </div>

      {/* Robot cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(robot => (
          <RobotDetailCard key={robot.id} robot={robot} />
        ))}
      </div>
    </AdminLayout>
  );
}
