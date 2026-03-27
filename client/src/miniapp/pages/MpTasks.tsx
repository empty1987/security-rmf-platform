/**
 * MpTasks.tsx — 任务管理页
 * 含：任务列表、3步新建任务（路线配置）、任务详情弹窗（开始/暂停/取消）
 */
import { useState } from 'react';
import { tasks as initTasks, robots, Task, getTaskStatusLabel, getTaskPriorityLabel, getTaskPriorityClass, TYPE_ICON, TYPE_LABEL, ROUTE_MODE_LABEL, SPEED_LABEL } from '../miniappData';
import type { MpPage } from '../MiniappPreview';

interface Props { navigate: (p: MpPage) => void; }

const PRIORITY_COLOR: Record<string, string> = { urgent: '#ef4444', important: '#f59e0b', normal: '#38bdf8', success: '#34d399' };

export default function MpTasks({ navigate: _navigate }: Props) {
  const [taskList, setTaskList] = useState(initTasks.map(t => ({ ...t })));
  const [showCreate, setShowCreate] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [showDetail, setShowDetail] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState('');

  // 新建任务表单
  const [form, setForm] = useState({
    type: 'patrol', title: '', location: '', robot: '', priority: 'medium', startTime: '08:00', endTime: '10:00', description: '',
    routeMode: 'loop', waypoints: [''] as string[], speed: 'normal', loops: 2,
  });

  const running = taskList.filter(t => t.status === 'running');
  const pending = taskList.filter(t => t.status === 'pending');
  const completed = taskList.filter(t => t.status === 'completed');
  const detailTask = taskList.find(t => t.id === detailTaskId);

  const openDetail = (id: string) => { setDetailTaskId(id); setShowDetail(true); };
  const detailStart = () => {
    setTaskList(list => list.map(t => t.id === detailTaskId ? { ...t, status: 'running' as const } : t));
    setShowDetail(false);
  };
  const detailPause = () => {
    setTaskList(list => list.map(t => t.id === detailTaskId ? { ...t, status: 'pending' as const } : t));
    setShowDetail(false);
  };
  const detailCancel = () => {
    if (!window.confirm('确认取消该任务？')) return;
    setTaskList(list => list.filter(t => t.id !== detailTaskId));
    setShowDetail(false);
  };

  const addWaypoint = () => setForm(f => ({ ...f, waypoints: [...f.waypoints, ''] }));
  const updateWaypoint = (i: number, v: string) => setForm(f => { const w = [...f.waypoints]; w[i] = v; return { ...f, waypoints: w }; });
  const removeWaypoint = (i: number) => setForm(f => ({ ...f, waypoints: f.waypoints.filter((_, idx) => idx !== i) }));

  const submitCreate = () => {
    const robot = robots.find(r => r.id === form.robot);
    const newTask: Task = {
      id: `TASK-${Date.now()}`, title: form.title || `新建${TYPE_LABEL[form.type]}任务`,
      type: form.type as Task['type'], status: 'pending', priority: form.priority as Task['priority'],
      progress: 0, location: form.location, assignedRobot: form.robot,
      startTime: form.startTime, endTime: form.endTime, description: form.description,
      routeMode: form.routeMode, waypoints: form.waypoints.filter(w => w.trim()),
    };
    setTaskList(list => [newTask, ...list]);
    setShowCreate(false); setCreateStep(1);
    setForm({ type: 'patrol', title: '', location: '', robot: '', priority: 'medium', startTime: '08:00', endTime: '10:00', description: '', routeMode: 'loop', waypoints: [''], speed: 'normal', loops: 2 });
  };

  const TaskCard = ({ t }: { t: Task }) => {
    const pc = getTaskPriorityClass(t.priority);
    const pColor = PRIORITY_COLOR[pc] || '#38bdf8';
    return (
      <div onClick={() => openDetail(t.id)} style={{ margin: '0 16px 10px', padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{TYPE_ICON[t.type]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>🤖 {t.assignedRobot} · ⏰ {t.startTime}{t.endTime ? `–${t.endTime}` : ''}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: pColor, padding: '3px 8px', borderRadius: 100, background: `${pColor}18`, border: `1px solid ${pColor}40`, flexShrink: 0 }}>{getTaskPriorityLabel(t.priority)}</span>
        </div>
        {t.status === 'running' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>任务进度</span>
              <span style={{ fontSize: 11, color: '#38bdf8' }}>{t.progress}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${t.progress}%`, background: 'linear-gradient(90deg,#0ea5e9,#6366f1)', borderRadius: 100 }}></div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>📍 {t.location}</span>
          <span style={{ fontSize: 11, color: '#475569' }}>详情 ›</span>
        </div>
      </div>
    );
  };

  return (
    <div className="mp-page" style={{ background: '#0a0f1e' }}>
      {/* 统计条 */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px' }}>
        {[
          { num: running.length, label: '进行中', color: '#34d399' },
          { num: pending.length, label: '待开始', color: '#38bdf8' },
          { num: completed.length, label: '已完成', color: '#64748b' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '12px 0', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.num}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 新建任务按钮 */}
      <div style={{ padding: '0 16px 16px' }}>
        <button onClick={() => { setShowCreate(true); setCreateStep(1); }} style={{ width: '100%', padding: '13px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          ＋ 新建任务
        </button>
      </div>

      {/* 进行中 */}
      {running.length > 0 && (
        <>
          <div style={{ padding: '0 16px 8px', fontSize: 13, fontWeight: 700, color: '#34d399' }}>进行中</div>
          {running.map(t => <TaskCard key={t.id} t={t} />)}
        </>
      )}

      {/* 待开始 */}
      {pending.length > 0 && (
        <>
          <div style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>待开始</div>
          {pending.map(t => <TaskCard key={t.id} t={t} />)}
        </>
      )}

      {/* 已完成 */}
      {completed.length > 0 && (
        <>
          <div style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#64748b' }}>已完成</div>
          {completed.map(t => <TaskCard key={t.id} t={t} />)}
        </>
      )}

      {/* 新建任务弹窗（3步向导） */}
      {showCreate && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }} onClick={() => setShowCreate(false)}>
          <div style={{ width: '100%', background: '#111827', borderRadius: '24px 24px 0 0', maxHeight: '85%', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 100, margin: '12px auto' }}></div>
            {/* 步骤指示器 */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[1, 2, 3].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: createStep >= s ? 'linear-gradient(135deg,#0ea5e9,#6366f1)' : 'rgba(255,255,255,0.08)', color: createStep >= s ? '#fff' : '#64748b', flexShrink: 0 }}>{s}</div>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: createStep > s ? 'linear-gradient(90deg,#0ea5e9,#6366f1)' : 'rgba(255,255,255,0.08)', margin: '0 6px' }}></div>}
                </div>
              ))}
              <div style={{ marginLeft: 12, fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
                {createStep === 1 ? '基本信息' : createStep === 2 ? '路线配置' : '确认创建'}
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '14px 16px 0' }}>
              {/* 步骤1：基本信息 */}
              {createStep === 1 && (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>任务类型</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                      {Object.entries(TYPE_LABEL).map(([k, v]) => (
                        <button key={k} onClick={() => setForm(f => ({ ...f, type: k }))} style={{ padding: '10px 0', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: form.type === k ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)', border: form.type === k ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.1)', color: form.type === k ? '#38bdf8' : '#94a3b8' }}>
                          {TYPE_ICON[k]} {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  {[
                    { l: '任务名称', k: 'title', ph: '如：A区夜间巡逻' },
                    { l: '执行区域', k: 'location', ph: '如：A区全域' },
                  ].map(f => (
                    <div key={f.k} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>{f.l}</div>
                      <input value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>分配机器人</div>
                    <select value={form.robot} onChange={e => setForm(f => ({ ...f, robot: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 14 }}>
                      <option value="">请选择机器人</option>
                      {robots.filter(r => r.status !== 'offline').map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    {[{ l: '开始时间', k: 'startTime' }, { l: '结束时间', k: 'endTime' }].map(f => (
                      <div key={f.k}>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>{f.l}</div>
                        <input type="time" value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 步骤2：路线配置 */}
              {createStep === 2 && (
                <div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>路线模式</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                      {Object.entries(ROUTE_MODE_LABEL).map(([k, v]) => (
                        <button key={k} onClick={() => setForm(f => ({ ...f, routeMode: k }))} style={{ padding: '10px 0', borderRadius: 12, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: form.routeMode === k ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)', border: form.routeMode === k ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.1)', color: form.routeMode === k ? '#38bdf8' : '#94a3b8' }}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>路线点位</span>
                      <button onClick={addWaypoint} style={{ fontSize: 12, color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer' }}>＋ 添加点位</button>
                    </div>
                    {form.waypoints.map((w, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#38bdf8', flexShrink: 0 }}>{i + 1}</div>
                        <input value={w} onChange={e => updateWaypoint(i, e.target.value)} placeholder={`点位 ${i + 1}，如：A栋大门`} style={{ flex: 1, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 13 }} />
                        {form.waypoints.length > 1 && <button onClick={() => removeWaypoint(i)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>✕</button>}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>巡逻速度</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {Object.entries(SPEED_LABEL).map(([k, v]) => (
                        <button key={k} onClick={() => setForm(f => ({ ...f, speed: k }))} style={{ flex: 1, padding: '9px 0', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: form.speed === k ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)', border: form.speed === k ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.1)', color: form.speed === k ? '#38bdf8' : '#94a3b8' }}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>循环次数</span>
                    <button onClick={() => setForm(f => ({ ...f, loops: Math.max(1, f.loops - 1) }))} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}>－</button>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', minWidth: 24, textAlign: 'center' }}>{form.loops}</span>
                    <button onClick={() => setForm(f => ({ ...f, loops: Math.min(20, f.loops + 1) }))} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}>＋</button>
                  </div>
                </div>
              )}

              {/* 步骤3：确认 */}
              {createStep === 3 && (
                <div style={{ paddingBottom: 8 }}>
                  <div style={{ padding: 14, borderRadius: 14, background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{form.title || `新建${TYPE_LABEL[form.type]}任务`}</div>
                    {[
                      { l: '任务类型', v: `${TYPE_ICON[form.type]} ${TYPE_LABEL[form.type]}` },
                      { l: '执行区域', v: form.location || '未填写' },
                      { l: '分配机器人', v: robots.find(r => r.id === form.robot)?.name || '未选择' },
                      { l: '执行时间', v: `${form.startTime} – ${form.endTime}` },
                      { l: '路线模式', v: ROUTE_MODE_LABEL[form.routeMode] },
                      { l: '路线点位', v: form.waypoints.filter(w => w.trim()).join(' → ') || '未配置' },
                      { l: '巡逻速度', v: SPEED_LABEL[form.speed] },
                      { l: '循环次数', v: `${form.loops} 次` },
                    ].map(item => (
                      <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{item.l}</span>
                        <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600, maxWidth: '55%', textAlign: 'right' }}>{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div style={{ padding: '12px 16px 20px', display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {createStep > 1 && (
                <button onClick={() => setCreateStep(s => s - 1)} style={{ flex: 1, padding: '13px 0', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>上一步</button>
              )}
              {createStep < 3 ? (
                <button onClick={() => setCreateStep(s => s + 1)} style={{ flex: 2, padding: '13px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>下一步</button>
              ) : (
                <button onClick={submitCreate} style={{ flex: 2, padding: '13px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>确认创建</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 任务详情弹窗 */}
      {showDetail && detailTask && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }} onClick={() => setShowDetail(false)}>
          <div style={{ width: '100%', background: '#111827', borderRadius: '24px 24px 0 0', padding: '0 0 20px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 100, margin: '12px auto' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{TYPE_ICON[detailTask.type]}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{detailTask.title}</span>
              </div>
              <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '12px 16px' }}>
              {[
                { l: '状态', v: getTaskStatusLabel(detailTask.status), color: detailTask.status === 'running' ? '#34d399' : detailTask.status === 'pending' ? '#38bdf8' : '#64748b' },
                { l: '优先级', v: getTaskPriorityLabel(detailTask.priority) },
                { l: '执行区域', v: detailTask.location },
                { l: '分配机器人', v: detailTask.assignedRobot },
                { l: '执行时间', v: `${detailTask.startTime}${detailTask.endTime ? ` – ${detailTask.endTime}` : ''}` },
                { l: '任务说明', v: detailTask.description },
              ].map(item => (
                <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{item.l}</span>
                  <span style={{ fontSize: 12, color: (item as any).color || '#e2e8f0', fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{item.v}</span>
                </div>
              ))}
              {detailTask.status === 'running' && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>任务进度</span>
                    <span style={{ fontSize: 12, color: '#38bdf8' }}>{detailTask.progress}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${detailTask.progress}%`, background: 'linear-gradient(90deg,#0ea5e9,#6366f1)', borderRadius: 100 }}></div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '0 16px' }}>
              {detailTask.status === 'pending' && (
                <button onClick={detailStart} style={{ flex: 1, padding: '13px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#059669,#34d399)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✅ 立即开始</button>
              )}
              {detailTask.status === 'running' && (
                <button onClick={detailPause} style={{ flex: 1, padding: '13px 0', borderRadius: 14, border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>⏸ 暂停任务</button>
              )}
              <button onClick={detailCancel} style={{ flex: 1, padding: '13px 0', borderRadius: 14, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✕ 取消任务</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
