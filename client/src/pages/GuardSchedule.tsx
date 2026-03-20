// ============================================================
// GuardSchedule — 保安排班页面
// ============================================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, MapPin, Plus, Edit, Calendar } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { guardShifts } from '@/lib/mockData';
import { toast } from 'sonner';

const shiftLabel: Record<string, string> = {
  morning: '早班 08:00-20:00',
  afternoon: '午班 14:00-22:00',
  night: '夜班 22:00-06:00',
};

const statusConfig: Record<string, { label: string; badge: string; dot: string }> = {
  'on-duty': { label: '值班中', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-400' },
  'break': { label: '休息中', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25', dot: 'bg-amber-400' },
  'off-duty': { label: '休班', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/25', dot: 'bg-slate-500' },
};

const shiftGroups = ['morning', 'afternoon', 'night'];
const shiftNames: Record<string, string> = { morning: '早班', afternoon: '午班', night: '夜班' };

function getInitials(name: string) {
  return name.slice(0, 1);
}

export default function GuardSchedule() {
  const [view, setView] = useState<'list' | 'shift'>('shift');

  return (
    <AdminLayout title="保安排班">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/8">
          <button
            onClick={() => setView('shift')}
            className={`px-3 py-1.5 rounded-md text-sm transition-all ${view === 'shift' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/25' : 'text-slate-400 hover:text-slate-200'}`}
          >
            按班次
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-md text-sm transition-all ${view === 'list' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/25' : 'text-slate-400 hover:text-slate-200'}`}
          >
            列表视图
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => toast.info('排班日历', { description: '功能开发中' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-white/8 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            <Calendar size={14} />
            日历视图
          </button>
          <button
            onClick={() => toast.success('新增排班', { description: '功能开发中' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-sky-500/15 border border-sky-500/25 text-sky-300 hover:bg-sky-500/25 transition-all"
          >
            <Plus size={14} />
            新增排班
          </button>
        </div>
      </div>

      {view === 'shift' ? (
        <div className="grid grid-cols-3 gap-4">
          {shiftGroups.map(shift => {
            const guards = guardShifts.filter(g => g.shift === shift);
            const activeCount = guards.filter(g => g.status === 'on-duty').length;
            return (
              <div key={shift} className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.145 0.022 240)' }}>
                <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200 font-display">{shiftNames[shift]}</div>
                    <div className="text-xs text-slate-500">{shiftLabel[shift]}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-lg border ${activeCount > 0 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-slate-500/15 text-slate-400 border-slate-500/25'}`}>
                    {activeCount} 在岗
                  </span>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  {guards.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-600">暂无排班</div>
                  )}
                  {guards.map(guard => {
                    const cfg = statusConfig[guard.status] ?? statusConfig['off-duty'];
                    return (
                      <motion.div
                        key={guard.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/3 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sm font-bold text-sky-400 font-display shrink-0">
                          {getInitials(guard.guardName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium text-slate-200">{guard.guardName}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={9} />
                            <span>{guard.zone ?? guard.area}</span>
                          </div>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.145 0.022 240)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['保安', '工号', '班次', '区域', '状态', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guardShifts.map(guard => {
                const cfg = statusConfig[guard.status] ?? statusConfig['off-duty'];
                return (
                  <tr key={guard.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-xs font-bold text-sky-400 font-display">
                          {getInitials(guard.guardName)}
                        </div>
                        <span className="text-sm text-slate-200">{guard.guardName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono-data">{guard.guardId}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{shiftLabel[guard.shift ?? 'morning']}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={10} />
                        {guard.zone ?? guard.area}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${cfg.badge}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toast.info(`编辑 ${guard.guardName} 排班`)}
                        className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <Edit size={11} />
                        编辑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
