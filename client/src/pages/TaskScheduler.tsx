// ============================================================
// TaskScheduler — 任务调度页面
// ============================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, MapPin, Bot, Clock, ChevronRight,
  Play, Pause, X, CheckCircle2, AlertTriangle, Filter
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import {
  tasks, robots, getTaskTypeLabel, getTaskStatusLabel,
  type Task, type TaskType
} from '@/lib/mockData';
import { toast } from 'sonner';

const priorityBadge: Record<string, string> = {
  low: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  medium: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  high: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  urgent: 'bg-red-500/15 text-red-400 border-red-500/25',
};

const priorityLabel: Record<string, string> = {
  low: '低', medium: '中', high: '高', urgent: '紧急'
};

const statusBadge: Record<string, string> = {
  running: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  pending: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  failed: 'bg-red-500/15 text-red-400 border-red-500/25',
  cancelled: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
};

const typeIcon: Record<TaskType, React.ReactNode> = {
  patrol: <span className="text-sky-400">🔵</span>,
  respond: <span className="text-red-400">🔴</span>,
  guide: <span className="text-emerald-400">🟢</span>,
  inspect: <span className="text-amber-400">🟡</span>,
  delivery: <span className="text-violet-400">🟣</span>,
};

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <motion.tr
      layout
      className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {typeIcon[task.type]}
          <div>
            <div className="text-sm text-slate-200">{task.title}</div>
            <div className="text-xs text-slate-500 font-mono-data">{task.id}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-slate-400">{getTaskTypeLabel(task.type)}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-1.5 py-0.5 rounded border ${priorityBadge[task.priority]}`}>
          {priorityLabel[task.priority]}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-1.5 py-0.5 rounded border ${statusBadge[task.status]}`}>
          {getTaskStatusLabel(task.status)}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <MapPin size={10} />
          <span className="truncate max-w-24">{task.location}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {task.assignedRobot ? (
          <div className="flex items-center gap-1 text-xs text-sky-400">
            <Bot size={10} />
            <span className="font-mono-data">{task.assignedRobot}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-600">未分配</span>
        )}
      </td>
      <td className="px-4 py-3">
        {task.status === 'running' && (
          <div className="flex items-center gap-2">
            <div className="flex-1 w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-sky-500" style={{ width: `${task.progress}%` }} />
            </div>
            <span className="text-xs font-mono-data text-sky-400">{task.progress}%</span>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <ChevronRight size={14} className="text-slate-600" />
      </td>
    </motion.tr>
  );
}

function NewTaskModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    type: 'patrol' as TaskType,
    title: '',
    location: '',
    priority: 'medium',
    robot: '',
    description: '',
  });

  const handleSubmit = () => {
    if (!form.title || !form.location) {
      toast.error('请填写任务名称和地点');
      return;
    }
    toast.success('任务创建成功', { description: `${form.title} 已加入任务队列` });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl"
        style={{ background: 'oklch(0.17 0.025 240)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white font-display">新建任务</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Task type */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">任务类型</label>
            <div className="grid grid-cols-5 gap-2">
              {(['patrol', 'respond', 'guide', 'inspect', 'delivery'] as TaskType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setForm(f => ({ ...f, type }))}
                  className={`py-2 rounded-lg text-xs border transition-all ${
                    form.type === type
                      ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                      : 'border-white/8 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {typeIcon[type]}
                  <div className="mt-1">{getTaskTypeLabel(type)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">任务名称</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="输入任务名称..."
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>

          {/* Location & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">执行地点</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="如：A栋一楼"
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">优先级</label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 transition-colors"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>
          </div>

          {/* Assign robot */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">分配机器人（可选）</label>
            <select
              value={form.robot}
              onChange={e => setForm(f => ({ ...f, robot: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 transition-colors"
            >
              <option value="">自动分配</option>
              {robots.filter(r => r.status === 'online' || r.status === 'patrolling').map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">任务描述</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="详细描述任务要求..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sm text-sky-300 hover:bg-sky-500/30 transition-all font-medium"
          >
            创建任务
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TaskScheduler() {
  const [filter, setFilter] = useState<string>('all');
  const [showNewTask, setShowNewTask] = useState(false);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <AdminLayout title="任务调度">
      <AnimatePresence>
        {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} />}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          {[
            { key: 'all', label: '全部', count: tasks.length },
            { key: 'running', label: '执行中', count: tasks.filter(t => t.status === 'running').length },
            { key: 'pending', label: '待执行', count: tasks.filter(t => t.status === 'pending').length },
            { key: 'completed', label: '已完成', count: tasks.filter(t => t.status === 'completed').length },
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
        </div>

        <button
          onClick={() => setShowNewTask(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sm text-sky-300 hover:bg-sky-500/30 transition-all font-medium"
        >
          <Plus size={15} />
          新建任务
        </button>
      </div>

      {/* Task table */}
      <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.145 0.022 240)' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              {['任务', '类型', '优先级', '状态', '地点', '机器人', '进度', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onClick={() => toast.info(`任务详情：${task.title}`, { description: task.description })}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-sm">暂无任务</div>
        )}
      </div>
    </AdminLayout>
  );
}
