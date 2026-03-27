/**
 * MpRobotCamera.tsx — 机器人实时画面页
 * 含：事件上下文横幅、HUD 叠加、机器人切换、状态卡
 */
import { useState, useEffect } from 'react';
import { robots, incidents, getRobotStatusLabel, getRobotStatusClass, getBatteryClass } from '../miniappData';

interface Props { robotId?: string; incidentId?: string; goBack: () => void; }

const STATUS_COLOR: Record<string, string> = {
  sky: '#38bdf8', amber: '#f59e0b', success: '#34d399', violet: '#a78bfa', warning: '#f59e0b', offline: '#64748b',
};
const LEVEL_COLOR: Record<string, string> = { urgent: '#ef4444', important: '#f59e0b', normal: '#38bdf8' };
const LEVEL_LABEL: Record<string, string> = { urgent: '紧急', important: '重要', normal: '一般' };

export default function MpRobotCamera({ robotId, incidentId, goBack }: Props) {
  const [currentIdx, setCurrentIdx] = useState(() => {
    if (robotId) { const i = robots.findIndex(r => r.id === robotId); return i >= 0 ? i : 0; }
    return 0;
  });
  const [frame, setFrame] = useState(0);

  const incident = incidentId ? incidents.find(i => i.id === incidentId) : null;
  const robot = robots[currentIdx];
  const sc = getRobotStatusClass(robot.status);
  const statusColor = STATUS_COLOR[sc] || '#38bdf8';
  const bc = getBatteryClass(robot.battery);
  const batteryColor = bc === 'high' ? '#34d399' : bc === 'mid' ? '#f59e0b' : '#ef4444';

  useEffect(() => {
    const t = setInterval(() => setFrame(f => f + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds() + frame % 60).padStart(2,'0').slice(-2)}`;

  return (
    <div style={{ background: '#000', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 事件上下文横幅 */}
      {incident && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          background: `linear-gradient(135deg,${LEVEL_COLOR[incident.level]}22,${LEVEL_COLOR[incident.level]}08)`,
          borderBottom: `1px solid ${LEVEL_COLOR[incident.level]}40`,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: LEVEL_COLOR[incident.level], display: 'inline-block', flexShrink: 0 }}></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{incident.title}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>📍 {incident.location}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: LEVEL_COLOR[incident.level], padding: '2px 8px', borderRadius: 100, background: `${LEVEL_COLOR[incident.level]}22`, border: `1px solid ${LEVEL_COLOR[incident.level]}44`, flexShrink: 0 }}>
            {LEVEL_LABEL[incident.level]}
          </span>
        </div>
      )}

      {/* 主画面区 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <img src={robot.cameraFeed} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { (e.target as HTMLImageElement).style.background = '#1e293b'; }} />

        {/* 扫描线动效 */}
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(56,189,248,0.015) 2px, rgba(56,189,248,0.015) 4px)', pointerEvents: 'none' }}></div>

        {/* 四角 HUD 框 */}
        {[
          { top: 8, left: 8, borderTop: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8' },
          { top: 8, right: 8, borderTop: '2px solid #38bdf8', borderRight: '2px solid #38bdf8' },
          { bottom: 8, left: 8, borderBottom: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8' },
          { bottom: 8, right: 8, borderBottom: '2px solid #38bdf8', borderRight: '2px solid #38bdf8' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 20, height: 20, ...s, pointerEvents: 'none' }}></div>
        ))}

        {/* HUD 顶部信息 */}
        <div style={{ position: 'absolute', top: 12, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 14px', pointerEvents: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
            <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, letterSpacing: 1 }}>REC</span>
          </div>
          <span style={{ fontSize: 11, color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>{robot.id}</span>
        </div>

        {/* HUD 底部信息 */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 14px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', pointerEvents: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{robot.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>📍 {robot.location}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>{timeStr}</div>
              <div style={{ fontSize: 11, color: batteryColor }}>⚡ {robot.battery}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 机器人切换缩略图 */}
      <div style={{ background: '#0a0f1e', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {robots.map((r, i) => {
            const rsc = getRobotStatusClass(r.status);
            const rColor = STATUS_COLOR[rsc] || '#38bdf8';
            return (
              <div key={r.id} onClick={() => setCurrentIdx(i)} style={{
                flexShrink: 0, width: 64, cursor: 'pointer',
                borderRadius: 10, overflow: 'hidden',
                border: i === currentIdx ? `2px solid #38bdf8` : '2px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ position: 'relative', height: 44 }}>
                  <img src={r.cameraFeed} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.background = '#1e293b'; }} />
                  <span style={{ position: 'absolute', top: 3, left: 3, width: 6, height: 6, borderRadius: '50%', background: rColor, display: 'inline-block' }}></span>
                </div>
                <div style={{ padding: '3px 5px', background: 'rgba(0,0,0,0.5)' }}>
                  <div style={{ fontSize: 9, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 机器人状态卡 */}
      <div style={{ background: '#0a0f1e', padding: '10px 14px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{robot.name}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, padding: '2px 10px', borderRadius: 100, background: `${statusColor}18`, border: `1px solid ${statusColor}40` }}>{getRobotStatusLabel(robot.status)}</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { l: '速度', v: `${robot.speed}m/s`, c: '#38bdf8' },
            { l: '里程', v: `${robot.todayMileage}km`, c: '#34d399' },
            { l: '任务', v: robot.currentTask, c: '#94a3b8' },
          ].map(s => (
            <div key={s.l} style={{ flex: s.l === '任务' ? 2 : 1 }}>
              <div style={{ fontSize: 10, color: '#475569' }}>{s.l}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: s.c, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
