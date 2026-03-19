// ============================================================
// VisitorManagement — 访客管理页面
// ============================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Bot, Clock, Building, CheckCircle2, X, LogOut } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { visitors, robots, type Visitor } from '@/lib/mockData';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; badge: string }> = {
  waiting: { label: '等待中', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  inside: { label: '在场', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  left: { label: '已离场', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
};

function VisitorCard({ visitor }: { visitor: Visitor }) {
  const cfg = statusConfig[visitor.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/8 p-4 hover:border-sky-500/20 transition-all"
      style={{ background: 'oklch(0.145 0.022 240)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sm font-bold text-sky-400 font-display">
            {visitor.name[0]}
          </div>
          <div>
            <div className="font-semibold text-slate-200">{visitor.name}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Building size={10} />
              {visitor.company}
            </div>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-lg border ${cfg.badge}`}>{cfg.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div>
          <div className="text-slate-500">拜访对象</div>
          <div className="text-slate-300">{visitor.host}</div>
        </div>
        <div>
          <div className="text-slate-500">来访目的</div>
          <div className="text-slate-300">{visitor.purpose}</div>
        </div>
        <div>
          <div className="text-slate-500">登记时间</div>
          <div className="text-slate-300 font-mono-data">{visitor.checkIn}</div>
        </div>
        {visitor.checkOut && (
          <div>
            <div className="text-slate-500">离场时间</div>
            <div className="text-slate-300 font-mono-data">{visitor.checkOut}</div>
          </div>
        )}
      </div>

      {visitor.robotGuide && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
          <Bot size={12} className="text-emerald-400" />
          <span className="text-xs text-emerald-400">引导机器人：{visitor.robotGuide}</span>
        </div>
      )}

      {visitor.status === 'inside' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => toast.success(`已为 ${visitor.name} 派遣引导机器人`)}
            className="flex-1 py-1.5 rounded-lg text-xs bg-sky-500/15 border border-sky-500/25 text-sky-400 hover:bg-sky-500/25 transition-all flex items-center justify-center gap-1"
          >
            <Bot size={11} />
            派遣引导
          </button>
          <button
            onClick={() => toast.info(`${visitor.name} 已办理离场`)}
            className="flex-1 py-1.5 rounded-lg text-xs border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all flex items-center justify-center gap-1"
          >
            <LogOut size={11} />
            办理离场
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function VisitorManagement() {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? visitors : visitors.filter(v => v.status === filter);

  return (
    <AdminLayout title="访客管理">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          {[
            { key: 'all', label: '全部', count: visitors.length },
            { key: 'inside', label: '在场', count: visitors.filter(v => v.status === 'inside').length },
            { key: 'waiting', label: '等待中', count: visitors.filter(v => v.status === 'waiting').length },
            { key: 'left', label: '已离场', count: visitors.filter(v => v.status === 'left').length },
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
          onClick={() => toast.success('访客登记', { description: '功能开发中，请在前台系统登记' })}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sm text-sky-300 hover:bg-sky-500/30 transition-all"
        >
          <Plus size={15} />
          登记访客
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(visitor => (
          <VisitorCard key={visitor.id} visitor={visitor} />
        ))}
      </div>
    </AdminLayout>
  );
}
