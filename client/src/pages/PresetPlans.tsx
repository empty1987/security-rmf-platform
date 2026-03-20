// ============================================================
// PresetPlans — 任务预案管理（业务端管理人员）
// 功能：预案列表、一键启动、新建预案、预案详情
// 设计：业务化，简单直观，无技术术语
// ============================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Plus, Edit, Trash2, ChevronRight, Clock,
  Bot, MapPin, Shield, Zap, CheckCircle2, Loader2,
  X, AlertTriangle, Navigation, Eye, Copy, Star,
  MoreHorizontal
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { presets, robots, type Preset } from '@/lib/mockData';
import { toast } from 'sonner';

// ---- 预案类型图标 & 颜色 ----
const PRESET_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string; label: string }> = {
  patrol: {
    icon: <Navigation size={16} />,
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
    border: 'border-sky-500/30',
    label: '巡逻预案',
  },
  emergency: {
    icon: <AlertTriangle size={16} />,
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    label: '应急预案',
  },
  visitor: {
    icon: <Eye size={16} />,
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/30',
    label: '访客引导',
  },
  inspection: {
    icon: <Shield size={16} />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    label: '安全检查',
  },
};

// ---- 启动确认弹窗 ----
function LaunchModal({ preset, onClose }: { preset: Preset; onClose: () => void }) {
  const [step, setStep] = useState<'confirm' | 'launching' | 'done'>('confirm');
  const cfg = PRESET_TYPE_CONFIG[preset.type ?? 'patrol'] ?? PRESET_TYPE_CONFIG.patrol;
  const availableRobots = robots.filter(r => r.status !== 'offline' && r.status !== 'charging');

  const handleLaunch = () => {
    setStep('launching');
    setTimeout(() => {
      setStep('done');
      toast.success(`预案已启动`, { description: `${preset.name} 正在执行` });
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="rounded-2xl border border-white/15 overflow-hidden w-96"
        style={{ background: 'oklch(0.13 0.025 240)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.border} border ${cfg.color}`}>
            {cfg.icon}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-100 font-display">{preset.name}</div>
            <div className="text-xs text-slate-500">{cfg.label}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center text-slate-400 hover:text-slate-200">
            <X size={14} />
          </button>
        </div>

        <div className="p-5">
          {step === 'confirm' && (
            <div className="space-y-4">
              {/* 预案信息 */}
              <div className="rounded-xl border border-white/8 p-4 space-y-2.5" style={{ background: 'oklch(0.155 0.025 240)' }}>
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">执行区域</div>
                    <div className="text-sm text-slate-200">{(preset.areas ?? []).join('、')}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={13} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">预计时长</div>
                    <div className="text-sm text-slate-200">{preset.estimatedDuration} 分钟</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Bot size={13} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">需要机器人</div>
                    <div className="text-sm text-slate-200">{preset.robotCount} 台（当前可用 {availableRobots.length} 台）</div>
                  </div>
                </div>
              </div>

              {/* 将执行的机器人 */}
              <div>
                <div className="text-xs text-slate-500 mb-2">将自动分配以下机器人：</div>
                <div className="space-y-1.5">
                  {availableRobots.slice(0, preset.robotCount).map(robot => (
                    <div key={robot.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-white/5 bg-white/3">
                      <div className="w-6 h-6 rounded-md overflow-hidden shrink-0">
                        <img src={robot.cameraFeed} alt={robot.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-slate-300 flex-1">{robot.name}</span>
                      <span className="text-xs text-slate-500">{robot.location}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleLaunch}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-98 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
              >
                <Play size={16} />
                立即启动预案
              </button>
            </div>
          )}

          {step === 'launching' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2 size={36} className="text-sky-400 animate-spin" />
              <p className="text-slate-300 font-semibold">正在启动预案...</p>
              <p className="text-xs text-slate-500">机器人正在接收任务指令</p>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <p className="text-slate-100 font-bold text-lg">预案已启动</p>
              <p className="text-sm text-slate-400 text-center">{preset.robotCount} 台机器人正在执行任务</p>
              <button onClick={onClose} className="mt-1 px-8 py-2.5 rounded-xl bg-sky-500/15 border border-sky-500/25 text-sky-300 text-sm font-semibold">
                完成
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- 新建/编辑预案弹窗 ----
function EditModal({ preset, onClose }: { preset?: Preset; onClose: () => void }) {
  const [name, setName] = useState(preset?.name ?? '');
  const [type, setType] = useState<string>(preset?.type ?? 'patrol');
  const [areas, setAreas] = useState(preset?.areas?.join('、') ?? '');
  const [duration, setDuration] = useState(String(preset?.estimatedDuration ?? 30));
  const [robotCount, setRobotCount] = useState(String(preset?.robotCount ?? 2));

  const handleSave = () => {
    if (!name.trim()) { toast.error('请输入预案名称'); return; }
    toast.success(preset ? '预案已更新' : '预案已创建', { description: name });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="rounded-2xl border border-white/15 overflow-hidden w-96"
        style={{ background: 'oklch(0.13 0.025 240)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <span className="text-sm font-bold text-slate-100 font-display">{preset ? '编辑预案' : '新建预案'}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center text-slate-400 hover:text-slate-200">
            <X size={14} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* 预案名称 */}
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">预案名称</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例：夜间全园巡逻"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
            />
          </div>
          {/* 预案类型 */}
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">预案类型</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRESET_TYPE_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-sm ${
                    type === key ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'border-white/8 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {cfg.icon}{cfg.label}
                </button>
              ))}
            </div>
          </div>
          {/* 执行区域 */}
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">执行区域（用、分隔）</label>
            <input
              value={areas}
              onChange={e => setAreas(e.target.value)}
              placeholder="例：A栋、B栋、停车场"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
            />
          </div>
          {/* 时长 + 机器人数 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">预计时长（分钟）</label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">需要机器人数</label>
              <input
                type="number"
                value={robotCount}
                onChange={e => setRobotCount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-98"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            {preset ? '保存修改' : '创建预案'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- 主页面 ----
export default function PresetPlans() {
  const [launchTarget, setLaunchTarget] = useState<Preset | null>(null);
  const [editTarget, setEditTarget] = useState<Preset | undefined>(undefined);
  const [showEdit, setShowEdit] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? presets : presets.filter(p => p.type === filter);

  return (
    <AdminLayout title="任务预案">
      {/* 工具栏 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/8">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm transition-all ${filter === 'all' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/25' : 'text-slate-400 hover:text-slate-200'}`}
          >
            全部
          </button>
          {Object.entries(PRESET_TYPE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5 ${filter === key ? `bg-sky-500/20 text-sky-300 border border-sky-500/25` : 'text-slate-400 hover:text-slate-200'}`}
            >
              {cfg.icon}{cfg.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowEdit(true); }}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-sky-500/15 border border-sky-500/25 text-sky-300 hover:bg-sky-500/25 transition-all"
        >
          <Plus size={14} />新建预案
        </button>
      </div>

      {/* 预案卡片网格 */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(preset => {
          const cfg = PRESET_TYPE_CONFIG[preset.type ?? 'patrol'] ?? PRESET_TYPE_CONFIG.patrol;
          return (
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/8 overflow-hidden"
              style={{ background: 'oklch(0.145 0.022 240)' }}
            >
              {/* 卡片头部 */}
              <div className={`px-5 py-4 border-b border-white/8 flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.border} border ${cfg.color} shrink-0`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-100 font-display truncate">{preset.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{cfg.label}</div>
                </div>
                {preset.isDefault && (
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star size={11} className="fill-amber-400" />
                    <span>常用</span>
                  </div>
                )}
              </div>

              {/* 卡片内容 */}
              <div className="px-5 py-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-base font-bold text-slate-200 font-display">{preset.robotCount}</div>
                    <div className="text-xs text-slate-500">机器人</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-bold text-slate-200 font-display">{preset.estimatedDuration}</div>
                    <div className="text-xs text-slate-500">分钟</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-bold text-slate-200 font-display">{(preset.areas ?? []).length}</div>
                    <div className="text-xs text-slate-500">区域</div>
                  </div>
                </div>

                {/* 区域标签 */}
                <div className="flex flex-wrap gap-1.5">
                  {(preset.areas ?? []).map((area: string) => (
                    <span key={area} className="text-xs px-2 py-0.5 rounded-full border border-white/8 text-slate-400 bg-white/3">
                      {area}
                    </span>
                  ))}
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setLaunchTarget(preset)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                  >
                    <Play size={14} />
                    立即启动
                  </button>
                  <button
                    onClick={() => { setEditTarget(preset); setShowEdit(true); }}
                    className="w-10 h-10 rounded-xl border border-white/8 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => toast.info('已复制预案')}
                    className="w-10 h-10 rounded-xl border border-white/8 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 弹窗 */}
      <AnimatePresence>
        {launchTarget && <LaunchModal preset={launchTarget} onClose={() => setLaunchTarget(null)} />}
        {showEdit && <EditModal preset={editTarget} onClose={() => setShowEdit(false)} />}
      </AnimatePresence>
    </AdminLayout>
  );
}
