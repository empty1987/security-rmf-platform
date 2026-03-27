/**
 * MpRobotDetail.tsx — 机器人详情页
 * 含：实时画面预览、快捷操作、巡逻任务选择执行、手动操控盘、今日统计
 */
import { useState, useRef } from 'react';
import { robots, tasks, getRobotStatusLabel, getRobotStatusClass, getBatteryClass, SPEED_LABEL } from '../miniappData';
import type { MpPage } from '../MiniappPreview';

interface Props { robotId: string; navigate: (p: MpPage) => void; goBack: () => void; }

const STATUS_COLOR: Record<string, string> = {
  sky: '#38bdf8', amber: '#f59e0b', success: '#34d399', violet: '#a78bfa', warning: '#f59e0b', offline: '#64748b',
};

const QUICK_OPS = [
  { key: 'stop',    icon: '⏹', label: '立即停止',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)' },
  { key: 'restart', icon: '🔁', label: '重启任务',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)' },
  { key: 'charge',  icon: '⚡', label: '返回充电',  color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.25)' },
  { key: 'photo',   icon: '📸', label: '拍照上报',  color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',   border: 'rgba(56,189,248,0.25)' },
  { key: 'alarm',   icon: '🔔', label: '发出警报',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)' },
  { key: 'voice',   icon: '📢', label: '语音播报',  color: '#34d399', bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.25)' },
];

export default function MpRobotDetail({ robotId, navigate, goBack }: Props) {
  const robot = robots.find(r => r.id === robotId) || robots[0];
  const patrolTasks = tasks.filter(t => t.type === 'patrol');

  const [selectedPatrolId, setSelectedPatrolId] = useState('');
  const [editPatrol, setEditPatrol] = useState({ location: '', speed: 'normal', loops: 1 });
  const [isMoving, setIsMoving] = useState(false);
  const [moveDir, setMoveDir] = useState('');
  const [manualSpeed, setManualSpeed] = useState(3);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sc = getRobotStatusClass(robot.status);
  const statusColor = STATUS_COLOR[sc] || '#38bdf8';
  const bc = getBatteryClass(robot.battery);
  const batteryColor = bc === 'high' ? '#34d399' : bc === 'mid' ? '#f59e0b' : '#ef4444';

  const handleQuickOp = (key: string) => {
    const msgs: Record<string, string> = {
      stop: '已发送停止指令', restart: '已重启当前任务', charge: '已指令返回充电桩',
      photo: '拍照上报成功', alarm: '警报已触发', voice: '语音播报已启动',
    };
    alert(msgs[key] || '指令已发送');
  };

  const selectPatrol = (id: string) => {
    const t = patrolTasks.find(p => p.id === id);
    setSelectedPatrolId(id);
    setEditPatrol({ location: t?.location || '', speed: 'normal', loops: 1 });
  };

  const executePatrol = () => {
    const t = patrolTasks.find(p => p.id === selectedPatrolId);
    if (!t) return;
    const speedLabel = SPEED_LABEL[editPatrol.speed] || editPatrol.speed;
    alert(`已下发巡逻任务\n机器人：${robot.name}\n任务：${t.title}\n区域：${editPatrol.location}\n速度：${speedLabel}，循环 ${editPatrol.loops} 次`);
  };

  const startMove = (dir: string) => {
    setIsMoving(true); setMoveDir(dir);
    if (moveTimer.current) clearTimeout(moveTimer.current);
    moveTimer.current = setTimeout(() => { setIsMoving(false); setMoveDir(''); }, 3000);
  };
  const stopMove = () => { setIsMoving(false); setMoveDir(''); if (moveTimer.current) clearTimeout(moveTimer.current); };

  const DPadBtn = ({ dir, arrow }: { dir: string; arrow: string }) => (
    <button
      onMouseDown={() => startMove(dir)} onMouseUp={stopMove} onMouseLeave={stopMove}
      onTouchStart={() => startMove(dir)} onTouchEnd={stopMove}
      style={{
        width: 60, height: 60, borderRadius: 14, border: `1px solid ${isMoving && moveDir === dir ? '#38bdf8' : 'rgba(255,255,255,0.12)'}`,
        background: isMoving && moveDir === dir ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)',
        color: '#e2e8f0', fontSize: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2, userSelect: 'none',
      }}
    >
      <span>{arrow}</span>
      <span style={{ fontSize: 9, color: '#64748b' }}>{dir}</span>
    </button>
  );

  return (
    <div className="mp-page" style={{ background: '#0a0f1e' }}>
      {/* 实时画面预览 */}
      <div onClick={() => navigate({ name: 'robot-camera', robotId: robot.id })} style={{ position: 'relative', height: 160, cursor: 'pointer', margin: '12px 16px', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        <img src={robot.cameraFeed} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.background = '#1e293b'; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(10,15,30,0.85))' }}></div>
        <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1s infinite' }}></span>
          <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, letterSpacing: 1 }}>LIVE</span>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 11, color: '#94a3b8' }}>{robot.id}</div>
        <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{robot.name}</span>
          <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>点击全屏查看</span>
        </div>
        <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 13, color: '#64748b' }}>⛶</div>
      </div>

      {/* 状态行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 12px' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: statusColor, padding: '4px 12px', borderRadius: 100, background: `${statusColor}18`, border: `1px solid ${statusColor}40` }}>
          {getRobotStatusLabel(robot.status)}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: batteryColor }}>⚡ {robot.battery}%</span>
        <span style={{ fontSize: 12, color: '#64748b' }}>{robot.speed} m/s</span>
        {robot.battery < 20 && <span style={{ fontSize: 11, color: '#ef4444', marginLeft: 'auto' }}>⚠ 低电量</span>}
      </div>

      {/* 基本信息 */}
      <div style={{ margin: '0 16px 12px', padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' as const }}>基本信息</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { l: '型号', v: robot.model },
            { l: '当前位置', v: robot.location },
            { l: '所属区域', v: robot.zone },
            { l: '当前任务', v: robot.currentTask, color: '#38bdf8' },
          ].map(item => (
            <div key={item.l}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{item.l}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: item.color || '#e2e8f0', marginTop: 2 }}>{item.v}</div>
            </div>
          ))}
        </div>
        {/* 电量进度条 */}
        <div style={{ marginTop: 12, height: 6, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${robot.battery}%`, background: batteryColor, borderRadius: 100, transition: 'width 0.3s' }}></div>
        </div>
      </div>

      {/* 任务快捷操作 */}
      <div style={{ margin: '0 16px 12px', padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>任务快捷操作</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {QUICK_OPS.map(op => (
            <button key={op.key} onClick={() => handleQuickOp(op.key)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 0',
              borderRadius: 12, background: op.bg, border: `1px solid ${op.border}`, cursor: 'pointer',
            }}>
              <span style={{ fontSize: 20 }}>{op.icon}</span>
              <span style={{ fontSize: 11, color: op.color, fontWeight: 600 }}>{op.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 巡逻任务选择执行 */}
      <div style={{ margin: '0 16px 12px', padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>巡逻任务执行</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {patrolTasks.map(t => (
            <div key={t.id} onClick={() => selectPatrol(t.id)} style={{
              padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
              background: selectedPatrolId === t.id ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.03)',
              border: selectedPatrolId === t.id ? '1px solid rgba(56,189,248,0.35)' : '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{t.title}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>📍 {t.location} · ⏰ {t.startTime}–{t.endTime}</div>
            </div>
          ))}
        </div>
        {selectedPatrolId && (
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>修改参数（可选）</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>执行区域</div>
              <input value={editPatrol.location} onChange={e => setEditPatrol(p => ({ ...p, location: e.target.value }))} style={{ width: '100%', padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>巡逻速度</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['slow', 'normal', 'fast'].map(s => (
                  <button key={s} onClick={() => setEditPatrol(p => ({ ...p, speed: s }))} style={{
                    flex: 1, padding: '7px 0', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: editPatrol.speed === s ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
                    border: editPatrol.speed === s ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    color: editPatrol.speed === s ? '#38bdf8' : '#94a3b8',
                  }}>{SPEED_LABEL[s]}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>循环次数</span>
              <button onClick={() => setEditPatrol(p => ({ ...p, loops: Math.max(1, p.loops - 1) }))} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}>－</button>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8', minWidth: 20, textAlign: 'center' }}>{editPatrol.loops}</span>
              <button onClick={() => setEditPatrol(p => ({ ...p, loops: Math.min(10, p.loops + 1) }))} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}>＋</button>
            </div>
            <button onClick={executePatrol} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              ▶ 立即执行巡逻任务
            </button>
          </div>
        )}
        {!selectedPatrolId && <div style={{ textAlign: 'center', fontSize: 12, color: '#475569', padding: '8px 0' }}>请先选择上方任务，再点击执行</div>}
      </div>

      {/* 手动操控盘 */}
      <div style={{ margin: '0 16px 12px', padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>手动操控</div>
        <div style={{ fontSize: 11, color: '#475569', marginBottom: 14 }}>长按方向键持续移动，松开自动停止</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <DPadBtn dir="前进" arrow="▲" />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <DPadBtn dir="左转" arrow="◀" />
            <div style={{ width: 60, height: 60, borderRadius: 14, background: isMoving ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isMoving ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <span style={{ fontSize: 16 }}>{isMoving ? '🟢' : '⬤'}</span>
              <span style={{ fontSize: 9, color: isMoving ? '#38bdf8' : '#64748b' }}>{isMoving ? moveDir : '停止'}</span>
            </div>
            <DPadBtn dir="右转" arrow="▶" />
          </div>
          <DPadBtn dir="后退" arrow="▼" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <span style={{ fontSize: 11, color: '#64748b', flexShrink: 0 }}>手动速度</span>
          <input type="range" min={1} max={5} value={manualSpeed} onChange={e => setManualSpeed(Number(e.target.value))} style={{ flex: 1, accentColor: '#38bdf8' }} />
          <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 700, minWidth: 30 }}>{manualSpeed} 档</span>
        </div>
      </div>

      {/* 今日统计 */}
      <div style={{ margin: '0 16px 24px', padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>今日统计</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { num: (robot as any).todayAlerts ?? 2, label: '预警数量', color: '#f59e0b' },
            { num: robot.totalPatrols, label: '任务执行次数', color: '#38bdf8' },
            { num: `${robot.todayMileage}km`, label: '行驶里程', color: '#34d399' },
            { num: robot.lastSeen, label: '最近活动', color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '12px 0', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.num}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
