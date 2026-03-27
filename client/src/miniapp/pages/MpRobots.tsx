/**
 * MpRobots.tsx — 机器人列表页
 */
import { useState } from 'react';
import { robots, getRobotStatusLabel, getRobotStatusClass, getBatteryClass } from '../miniappData';
import type { MpPage } from '../MiniappPreview';

interface Props { navigate: (p: MpPage) => void; }

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'patrolling', label: '巡逻中' },
  { key: 'responding', label: '响应中' },
  { key: 'online', label: '待命' },
  { key: 'warning', label: '需关注' },
  { key: 'offline', label: '离线' },
];

const STATUS_COLOR: Record<string, string> = {
  sky: '#38bdf8', amber: '#f59e0b', success: '#34d399', violet: '#a78bfa', warning: '#f59e0b', offline: '#64748b',
};

export default function MpRobots({ navigate }: Props) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? robots : robots.filter(r => r.status === filter);
  const onlineCount = robots.filter(r => r.status !== 'offline').length;
  const warningCount = robots.filter(r => r.status === 'warning' || r.battery < 20).length;

  return (
    <div className="mp-page" style={{ background: '#0a0f1e' }}>
      {/* 统计条 */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px' }}>
        {[
          { num: robots.length, label: '总数', color: '#94a3b8' },
          { num: onlineCount, label: '在线', color: '#34d399' },
          { num: warningCount, label: '需关注', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '12px 0', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.num}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 筛选 tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 100, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: filter === f.key ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
            border: filter === f.key ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.08)',
            color: filter === f.key ? '#38bdf8' : '#64748b',
          }}>{f.label}</button>
        ))}
      </div>

      {/* 机器人卡片 */}
      {filtered.map(r => {
        const sc = getRobotStatusClass(r.status);
        const color = STATUS_COLOR[sc] || '#38bdf8';
        const bc = getBatteryClass(r.battery);
        const batteryColor = bc === 'high' ? '#34d399' : bc === 'mid' ? '#f59e0b' : '#ef4444';
        return (
          <div key={r.id} onClick={() => navigate({ name: 'robot-detail', robotId: r.id })} style={{
            margin: '0 16px 12px', borderRadius: 16, overflow: 'hidden',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
          }}>
            {/* 摄像头缩略图 */}
            <div style={{ position: 'relative', height: 120 }}>
              <img src={r.cameraFeed} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(10,15,30,0.9))' }}></div>
              <div style={{ position: 'absolute', top: 8, left: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}` }}></span>
                <span style={{ fontSize: 11, color, fontWeight: 700, background: `${color}22`, padding: '2px 8px', borderRadius: 100, border: `1px solid ${color}44` }}>{getRobotStatusLabel(r.status)}</span>
              </div>
              <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 11, fontWeight: 700, color: batteryColor, background: `${batteryColor}22`, padding: '2px 8px', borderRadius: 100, border: `1px solid ${batteryColor}44` }}>⚡{r.battery}%</div>
              <div style={{ position: 'absolute', bottom: 8, left: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.id}</div>
              </div>
            </div>
            {/* 信息行 */}
            <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>📍 {r.location}</div>
                <div style={{ fontSize: 12, color: '#38bdf8', marginTop: 2 }}>🔄 {r.currentTask}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>{r.speed} m/s</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>里程 {r.todayMileage}km</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
