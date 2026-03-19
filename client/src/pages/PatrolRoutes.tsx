// ============================================================
// PatrolRoutes — 巡逻路线管理
// ============================================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ToggleLeft, ToggleRight, Plus, Edit, Play } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { patrolRoutes, type PatrolRoute } from '@/lib/mockData';
import { toast } from 'sonner';

function RouteCard({ route }: { route: PatrolRoute }) {
  const [active, setActive] = useState(route.active);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/8 overflow-hidden"
      style={{ background: 'oklch(0.145 0.022 240)' }}
    >
      {/* Map preview */}
      <div className="h-40 relative overflow-hidden" style={{ background: 'oklch(0.11 0.025 240)' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <pattern id={`grid-${route.id}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(56,189,248,0.06)" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#grid-${route.id})`} />

          {/* Route path */}
          <polyline
            points={route.waypoints.map(w => `${w.x},${w.y}`).join(' ')}
            fill="none"
            stroke={active ? 'rgba(56,189,248,0.7)' : 'rgba(100,116,139,0.5)'}
            strokeWidth="1.5"
            strokeDasharray="3,2"
          />

          {/* Waypoints */}
          {route.waypoints.slice(0, -1).map((wp, i) => (
            <g key={i}>
              <circle cx={wp.x} cy={wp.y} r="2.5" fill={active ? 'rgba(56,189,248,0.2)' : 'rgba(100,116,139,0.2)'} stroke={active ? '#38bdf8' : '#64748b'} strokeWidth="0.8" />
              <circle cx={wp.x} cy={wp.y} r="1" fill={active ? '#38bdf8' : '#64748b'} />
              <text x={wp.x + 3} y={wp.y + 1} fill={active ? 'rgba(56,189,248,0.7)' : 'rgba(100,116,139,0.7)'} fontSize="3" fontFamily="Noto Sans SC">{wp.name}</text>
            </g>
          ))}
        </svg>
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
            {active ? '已启用' : '已停用'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-semibold text-slate-200 font-display">{route.name}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono-data">{route.id}</div>
          </div>
          <button
            onClick={() => {
              setActive(!active);
              toast.success(`路线 ${active ? '已停用' : '已启用'}：${route.name}`);
            }}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {active ? <ToggleRight size={22} className="text-emerald-400" /> : <ToggleLeft size={22} />}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-white/3 border border-white/5">
            <div className="text-xs text-slate-500 mb-1">楼层</div>
            <div className="text-sm font-mono-data text-slate-200">{route.floor === -1 ? 'B1' : `${route.floor}F`}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/3 border border-white/5">
            <div className="text-xs text-slate-500 mb-1">时长</div>
            <div className="text-sm font-mono-data text-slate-200">{route.duration}min</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/3 border border-white/5">
            <div className="text-xs text-slate-500 mb-1">频率</div>
            <div className="text-xs font-mono-data text-slate-200">{route.frequency}</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-2">巡逻点位 ({route.waypoints.length - 1} 个)</div>
          <div className="flex flex-wrap gap-1.5">
            {route.waypoints.slice(0, -1).map((wp, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
                {wp.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => toast.info(`编辑路线：${route.name}`, { description: '地图编辑器功能开发中' })}
            className="flex-1 py-2 rounded-lg text-xs border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all flex items-center justify-center gap-1"
          >
            <Edit size={12} />
            编辑
          </button>
          <button
            onClick={() => toast.success(`立即执行：${route.name}`, { description: '已将任务加入队列' })}
            className="flex-1 py-2 rounded-lg text-xs bg-sky-500/15 border border-sky-500/25 text-sky-400 hover:bg-sky-500/25 transition-all flex items-center justify-center gap-1"
          >
            <Play size={12} />
            立即执行
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function PatrolRoutes() {
  return (
    <AdminLayout title="巡逻路线">
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-slate-400">{patrolRoutes.length} 条路线，{patrolRoutes.filter(r => r.active).length} 条已启用</div>
        <button
          onClick={() => toast.success('新建路线', { description: '地图编辑器功能开发中' })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sm text-sky-300 hover:bg-sky-500/30 transition-all"
        >
          <Plus size={15} />
          新建路线
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {patrolRoutes.map(route => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </AdminLayout>
  );
}
