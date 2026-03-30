/**
 * MpTasks.tsx — 移动端任务管理（重构版）
 * 核心交互：选机器人 → 下拉选预案 → 快速修改参数 → 一键执行
 * 预案制定由 PC 端管理，移动端只做"快速执行"
 */
import { useState, useRef, useEffect } from 'react';
import {
  robots, tasks as initTasks,
  getTaskStatusLabel, getTaskPriorityLabel, getTaskPriorityClass,
  TYPE_ICON, TYPE_LABEL, ROUTE_MODE_LABEL,
} from '../miniappData';
import type { Task } from '../miniappData';
import type { MpPage } from '../MiniappPreview';

interface Props { navigate: (p: MpPage) => void; }

// ---- 预案库（来自 PC 端管理，移动端只读执行） ----
const PRESET_PLANS = [
  { id: 'P001', name: '全园区例行巡逻',   type: 'patrol',     icon: '🔄', color: '#38bdf8', areas: ['A栋', 'B栋', 'C栋', '停车场'],          defaultSpeed: 'normal', defaultLoops: 3, estimatedMin: 90,  robotCount: 4 },
  { id: 'P002', name: '访客引导接待',     type: 'guide',      icon: '👋', color: '#a78bfa', areas: ['A栋大厅', '大门岗'],                     defaultSpeed: 'slow',   defaultLoops: 1, estimatedMin: 30,  robotCount: 1 },
  { id: 'P003', name: '应急安全响应',     type: 'response',   icon: '🚨', color: '#ef4444', areas: ['全园区'],                               defaultSpeed: 'fast',   defaultLoops: 1, estimatedMin: 15,  robotCount: 4 },
  { id: 'P004', name: '停车场夜间巡逻',   type: 'patrol',     icon: '🔄', color: '#38bdf8', areas: ['B1停车场', 'B2停车场'],                  defaultSpeed: 'normal', defaultLoops: 6, estimatedMin: 240, robotCount: 2 },
  { id: 'P005', name: '设备安全检查',     type: 'inspection', icon: '🔍', color: '#34d399', areas: ['设备间', 'A栋', '停车场'],               defaultSpeed: 'slow',   defaultLoops: 1, estimatedMin: 60,  robotCount: 3 },
  { id: 'P006', name: '周界防入侵巡逻',   type: 'patrol',     icon: '🔄', color: '#38bdf8', areas: ['南门', '北门', '东围墙', '西围墙'],      defaultSpeed: 'normal', defaultLoops: 4, estimatedMin: 120, robotCount: 2 },
  { id: 'P007', name: '会议室安全检查',   type: 'inspection', icon: '🔍', color: '#34d399', areas: ['会议室区', 'A栋二楼'],                   defaultSpeed: 'slow',   defaultLoops: 1, estimatedMin: 20,  robotCount: 1 },
  { id: 'P008', name: '重要人员护送',     type: 'guide',      icon: '👋', color: '#a78bfa', areas: ['大门岗', 'A栋', 'VIP通道'],             defaultSpeed: 'slow',   defaultLoops: 1, estimatedMin: 15,  robotCount: 2 },
];

const SPEED_OPTS = [
  { value: 'slow',   label: '慢速', sub: '0.5m/s', color: '#34d399' },
  { value: 'normal', label: '正常', sub: '1.0m/s', color: '#38bdf8' },
  { value: 'fast',   label: '快速', sub: '1.8m/s', color: '#f59e0b' },
];

const PRIORITY_OPTS = [
  { value: 'urgent', label: '紧急', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  { value: 'high',   label: '重要', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { value: 'medium', label: '普通', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
];

const STATUS_COLOR: Record<string, string> = {
  running: '#38bdf8', pending: '#f59e0b', completed: '#34d399', failed: '#ef4444', cancelled: '#64748b',
};
const PRIORITY_COLOR: Record<string, string> = {
  urgent: '#ef4444', high: '#f59e0b', medium: '#38bdf8', low: '#64748b',
  important: '#f59e0b', normal: '#38bdf8', success: '#34d399',
};
const TYPE_LABEL_MAP: Record<string, string> = { patrol: '巡逻', guide: '引导', response: '响应', inspection: '检查' };

// ---- 通用下拉选择器 ----
function Dropdown<T extends { value: string; label: string }>({
  options, value, onChange, placeholder, renderOption, renderSelected,
}: {
  options: T[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  renderOption?: (opt: T) => React.ReactNode;
  renderSelected?: (opt: T | undefined) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: open ? 50 : 'auto' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${open ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.1)'}`, background: 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, transition: 'border-color 0.2s' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {selected
            ? (renderSelected ? renderSelected(selected) : <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{selected.label}</span>)
            : <span style={{ fontSize: 13, color: '#475569' }}>{placeholder || '请选择'}</span>}
        </div>
        <span style={{ fontSize: 10, color: '#475569', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(13,20,40,0.98)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden', maxHeight: 240, overflowY: 'auto' }}>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{ padding: '10px 14px', cursor: 'pointer', background: opt.value === value ? 'rgba(56,189,248,0.1)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
            >
              {renderOption ? renderOption(opt) : <span style={{ fontSize: 13, color: opt.value === value ? '#38bdf8' : '#e2e8f0' }}>{opt.label}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- 任务卡片 ----
function TaskCard({ task, onDetail }: { task: Task; onDetail: (t: Task) => void }) {
  const sc = STATUS_COLOR[task.status] || '#64748b';
  const pc = PRIORITY_COLOR[getTaskPriorityClass(task.priority)] || '#38bdf8';
  return (
    <div
      onClick={() => onDetail(task)}
      style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', marginBottom: 8 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${sc}15`, border: `1px solid ${sc}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {TYPE_ICON[task.type] || '📋'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{task.title}</span>
            <span style={{ padding: '1px 7px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: `${pc}18`, border: `1px solid ${pc}35`, color: pc, flexShrink: 0 }}>{getTaskPriorityLabel(task.priority)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: task.status === 'running' ? 6 : 0 }}>
            <span style={{ fontSize: 10, color: '#64748b' }}>📍 {task.location}</span>
            <span style={{ fontSize: 10, color: '#64748b' }}>🤖 {task.assignedRobot}</span>
            <span style={{ fontSize: 10, color: sc, fontWeight: 600, marginLeft: 'auto' }}>{getTaskStatusLabel(task.status)}</span>
          </div>
          {task.status === 'running' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                <div style={{ width: `${task.progress}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }} />
              </div>
              <span style={{ fontSize: 9, color: '#38bdf8', fontFamily: 'monospace', flexShrink: 0 }}>{task.progress}%</span>
            </div>
          )}
        </div>
        <span style={{ fontSize: 12, color: '#334155', flexShrink: 0 }}>›</span>
      </div>
    </div>
  );
}

// ---- 任务详情底部弹窗 ----
function TaskDetailModal({ task, onClose, onAction }: { task: Task; onClose: () => void; onAction: (action: string, taskId: string) => void }) {
  const sc = STATUS_COLOR[task.status] || '#64748b';
  const pc = PRIORITY_COLOR[getTaskPriorityClass(task.priority)] || '#38bdf8';
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ width: '100%', borderRadius: '20px 20px 0 0', background: '#0d1428', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 16px 32px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${sc}15`, border: `1px solid ${sc}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{TYPE_ICON[task.type] || '📋'}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{task.title}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{task.id} · {TYPE_LABEL[task.type]}</div>
          </div>
          <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${sc}18`, border: `1px solid ${sc}35`, color: sc }}>{getTaskStatusLabel(task.status)}</span>
        </div>
        {[
          { l: '执行区域', v: task.location },
          { l: '分配机器人', v: task.assignedRobot },
          { l: '优先级', v: getTaskPriorityLabel(task.priority), color: pc },
          { l: '计划时间', v: `${task.startTime} - ${task.endTime}` },
          { l: '路线模式', v: ROUTE_MODE_LABEL[task.routeMode || ''] || '标准路线' },
          { l: '任务描述', v: task.description },
        ].map(item => (
          <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, padding: '0 2px' }}>
            <span style={{ fontSize: 12, color: '#64748b', flexShrink: 0 }}>{item.l}</span>
            <span style={{ fontSize: 12, color: (item as any).color || '#e2e8f0', fontWeight: 600, maxWidth: '60%', textAlign: 'right' as const }}>{item.v}</span>
          </div>
        ))}
        {task.status === 'running' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>任务进度</span>
              <span style={{ fontSize: 12, color: '#38bdf8' }}>{task.progress}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${task.progress}%`, background: 'linear-gradient(90deg,#0ea5e9,#6366f1)', borderRadius: 100 }} />
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {task.status === 'pending' && (
            <button onClick={() => { onAction('start', task.id); onClose(); }} style={{ flex: 1, padding: '13px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#059669,#34d399)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✅ 立即开始</button>
          )}
          {task.status === 'running' && (
            <button onClick={() => { onAction('pause', task.id); onClose(); }} style={{ flex: 1, padding: '13px 0', borderRadius: 14, border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>⏸ 暂停任务</button>
          )}
          <button onClick={() => { onAction('cancel', task.id); onClose(); }} style={{ flex: 1, padding: '13px 0', borderRadius: 14, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✕ 取消任务</button>
        </div>
      </div>
    </div>
  );
}

// ---- 主组件 ----
export default function MpTasks({ navigate: _navigate }: Props) {
  const [taskList, setTaskList] = useState<Task[]>(initTasks.map(t => ({ ...t })));
  const [filterStatus, setFilterStatus] = useState<'all' | 'running' | 'pending' | 'completed'>('all');
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState('');

  // 快速下发面板状态
  const [selRobotId, setSelRobotId] = useState('');
  const [selPresetId, setSelPresetId] = useState('');
  const [editSpeed, setEditSpeed] = useState('normal');
  const [editLoops, setEditLoops] = useState(1);
  const [editPriority, setEditPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const selPreset = PRESET_PLANS.find(p => p.id === selPresetId);

  const handleSelectPreset = (id: string) => {
    const p = PRESET_PLANS.find(x => x.id === id);
    if (p) { setSelPresetId(id); setEditSpeed(p.defaultSpeed); setEditLoops(p.defaultLoops); }
  };

  const handleExecute = () => {
    if (!selRobotId) { showToast('⚠️ 请先选择机器人'); return; }
    if (!selPresetId) { showToast('⚠️ 请先选择任务预案'); return; }
    setSubmitting(true);
    setTimeout(() => {
      const robot = robots.find(r => r.id === selRobotId);
      const speedLabel = SPEED_OPTS.find(s => s.value === editSpeed)?.label || '正常';
      const newTask: Task = {
        id: `TASK-${Date.now().toString().slice(-4)}`,
        title: selPreset!.name,
        type: selPreset!.type as Task['type'],
        status: 'running',
        priority: editPriority as Task['priority'],
        progress: 0,
        location: selPreset!.areas.join(' / '),
        assignedRobot: selRobotId,
        startTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        endTime: '—',
        description: `由 ${robot?.name || selRobotId} 执行，速度：${speedLabel}，循环 ${editLoops} 次`,
        routeMode: 'loop',
        waypoints: selPreset!.areas,
      };
      setTaskList(prev => [newTask, ...prev]);
      setSubmitting(false);
      setPanelOpen(false);
      setSelRobotId(''); setSelPresetId('');
      showToast(`✅ 任务已下发至 ${robot?.name || selRobotId}`);
    }, 1200);
  };

  const handleTaskAction = (action: string, taskId: string) => {
    const msgs: Record<string, string> = { start: '✅ 任务已开始', pause: '⏸ 任务已暂停', cancel: '✕ 任务已取消' };
    setTaskList(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      if (action === 'start') return { ...t, status: 'running' as const };
      if (action === 'pause') return { ...t, status: 'pending' as const };
      if (action === 'cancel') return { ...t, status: 'cancelled' as const };
      return t;
    }));
    showToast(msgs[action] || '✅ 操作成功');
  };

  const filtered = taskList.filter(t => {
    if (filterStatus === 'all') return t.status !== 'cancelled';
    return t.status === filterStatus;
  });

  const counts = {
    all: taskList.filter(t => t.status !== 'cancelled').length,
    running: taskList.filter(t => t.status === 'running').length,
    pending: taskList.filter(t => t.status === 'pending').length,
    completed: taskList.filter(t => t.status === 'completed').length,
  };

  const robotOptions = robots.filter(r => r.status !== 'offline').map(r => ({ value: r.id, label: `${r.name} · ${r.id}`, robot: r }));
  const presetOptions = PRESET_PLANS.map(p => ({ value: p.id, label: p.name, preset: p }));

  // 估算时间
  const estMin = selPreset ? Math.round(selPreset.estimatedMin * editLoops / selPreset.defaultLoops) : 0;

  return (
    <div className="mp-page" style={{ background: '#0a0f1e', minHeight: '100%' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', padding: '8px 18px', borderRadius: 20, background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(56,189,248,0.35)', color: '#e2e8f0', fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' as const }}>
          {toast}
        </div>
      )}

      {/* 任务详情弹窗 */}
      {detailTask && <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} onAction={handleTaskAction} />}

      {/* 快速下发面板 */}
      {panelOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setPanelOpen(false)}>
          <div style={{ width: '100%', borderRadius: '20px 20px 0 0', background: '#0d1428', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 16px 32px', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>⚡ 快速下发任务</div>
              <span style={{ fontSize: 10, color: '#334155', padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>预案由 PC 端管理</span>
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginBottom: 18 }}>选择机器人和预案，可快速修改参数后执行</div>

            {/* 选择机器人 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, letterSpacing: 1 }}>① 选择执行机器人</div>
              <Dropdown
                options={robotOptions}
                value={selRobotId}
                onChange={setSelRobotId}
                placeholder="请选择机器人"
                renderOption={(opt) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>🤖</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{opt.robot.name}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{opt.robot.id} · 电量 {opt.robot.battery}% · {opt.robot.location}</div>
                    </div>
                    <span style={{ fontSize: 10, color: opt.robot.status === 'online' ? '#34d399' : '#f59e0b', flexShrink: 0 }}>
                      {opt.robot.status === 'online' ? '待命' : opt.robot.status === 'patrolling' ? '巡逻中' : '响应中'}
                    </span>
                  </div>
                )}
                renderSelected={(opt) => opt ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🤖</span>
                    <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{opt.robot.name}</span>
                    <span style={{ fontSize: 10, color: '#64748b' }}>电量 {opt.robot.battery}%</span>
                  </div>
                ) : null}
              />
            </div>

            {/* 选择预案 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, letterSpacing: 1 }}>② 选择任务预案</div>
              <Dropdown
                options={presetOptions}
                value={selPresetId}
                onChange={handleSelectPreset}
                placeholder="请选择任务预案"
                renderOption={(opt) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{opt.preset.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{opt.preset.name}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{opt.preset.areas.slice(0, 3).join(' · ')}{opt.preset.areas.length > 3 ? '...' : ''} · 约{opt.preset.estimatedMin}分钟</div>
                    </div>
                    <span style={{ fontSize: 10, color: opt.preset.color, padding: '1px 6px', borderRadius: 6, background: `${opt.preset.color}15`, border: `1px solid ${opt.preset.color}30`, flexShrink: 0 }}>
                      {TYPE_LABEL_MAP[opt.preset.type] || opt.preset.type}
                    </span>
                  </div>
                )}
                renderSelected={(opt) => opt ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{opt.preset.icon}</span>
                    <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{opt.preset.name}</span>
                    <span style={{ fontSize: 10, color: '#64748b' }}>约{opt.preset.estimatedMin}分钟</span>
                  </div>
                ) : null}
              />
            </div>

            {/* 快速修改参数 */}
            {selPreset && (
              <div style={{ padding: 14, borderRadius: 14, background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.12)', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 10, letterSpacing: 1 }}>③ 快速调整参数</div>

                {/* 速度 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>执行速度</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {SPEED_OPTS.map(s => (
                      <button key={s.value} onClick={() => setEditSpeed(s.value)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `1px solid ${editSpeed === s.value ? s.color + '55' : 'rgba(255,255,255,0.08)'}`, background: editSpeed === s.value ? s.color + '18' : 'rgba(255,255,255,0.03)', color: editSpeed === s.value ? s.color : '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{s.label}</span>
                        <span style={{ fontSize: 9 }}>{s.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 循环次数 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>循环次数</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => setEditLoops(l => Math.max(1, l - 1))} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>－</button>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8', minWidth: 28, textAlign: 'center' as const }}>{editLoops}</span>
                    <button onClick={() => setEditLoops(l => Math.min(20, l + 1))} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>＋</button>
                    <span style={{ fontSize: 11, color: '#475569' }}>次 · 预计约 <span style={{ color: '#38bdf8', fontWeight: 700 }}>{estMin}</span> 分钟</span>
                  </div>
                </div>

                {/* 优先级 */}
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>任务优先级</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {PRIORITY_OPTS.map(p => (
                      <button key={p.value} onClick={() => setEditPriority(p.value)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `1px solid ${editPriority === p.value ? p.color + '55' : 'rgba(255,255,255,0.08)'}`, background: editPriority === p.value ? p.bg : 'rgba(255,255,255,0.03)', color: editPriority === p.value ? p.color : '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{p.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 执行按钮 */}
            <button
              onClick={handleExecute}
              disabled={submitting || !selRobotId || !selPresetId}
              style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', background: submitting || !selRobotId || !selPresetId ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: submitting || !selRobotId || !selPresetId ? '#334155' : '#fff', fontSize: 15, fontWeight: 800, cursor: submitting || !selRobotId || !selPresetId ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
            >
              {submitting ? '⏳ 下发中...' : '▶ 立即执行任务'}
            </button>
          </div>
        </div>
      )}

      {/* 顶部统计 */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
          {[
            { num: counts.running,   label: '进行中', color: '#38bdf8' },
            { num: counts.pending,   label: '待开始', color: '#f59e0b' },
            { num: counts.completed, label: '已完成', color: '#34d399' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 0', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.num}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 快速下发按钮 */}
        <button
          onClick={() => setPanelOpen(true)}
          style={{ width: '100%', padding: '13px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <span style={{ fontSize: 16 }}>⚡</span>
          <span>快速下发任务</span>
        </button>

        {/* 状态筛选 Tab */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {([['all', '全部'], ['running', '进行中'], ['pending', '待开始'], ['completed', '已完成']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilterStatus(key)} style={{ flex: 1, padding: '7px 0', borderRadius: 10, border: `1px solid ${filterStatus === key ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.07)'}`, background: filterStatus === key ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.03)', color: filterStatus === key ? '#38bdf8' : '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              {label}{key !== 'all' && counts[key] > 0 && <span style={{ marginLeft: 3, fontSize: 9 }}>({counts[key]})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* 任务列表 */}
      <div style={{ padding: '0 16px 24px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#334155' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 13 }}>暂无任务，点击上方"快速下发任务"开始</div>
          </div>
        ) : (
          filtered.map(t => <TaskCard key={t.id} task={t} onDetail={setDetailTask} />)
        )}
      </div>
    </div>
  );
}
