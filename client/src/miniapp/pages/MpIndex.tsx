/**
 * MpIndex.tsx — 事件处置首页
 * 对应小程序 pages/index/index
 */
import { useState } from 'react';
import {
  incidents, robots, Incident,
  getIncidentLevelLabel, getIncidentStatusLabel, getRobotStatusLabel, getRobotStatusClass,
} from '../miniappData';
import type { MpPage } from '../MiniappPreview';

interface Props { navigate: (p: MpPage) => void; }

export default function MpIndex({ navigate }: Props) {
  const [incidentList, setIncidentList] = useState([...incidents]);
  const [showDispatch, setShowDispatch] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [currentIncidentId, setCurrentIncidentId] = useState('');
  const [selectedRobotId, setSelectedRobotId] = useState('');
  const [reportForm, setReportForm] = useState({ level: 'normal', title: '', location: '', description: '' });

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const open = incidentList.filter(i => i.status !== 'closed');
  const closed = incidentList.filter(i => i.status === 'closed');
  const urgentCount = open.filter(i => i.level === 'urgent').length;

  const levelColor = (l: string) => ({ urgent: '#ef4444', important: '#f59e0b', normal: '#38bdf8' }[l] || '#38bdf8');
  const levelBg = (l: string) => ({ urgent: 'rgba(239,68,68,0.12)', important: 'rgba(245,158,11,0.1)', normal: 'rgba(56,189,248,0.08)' }[l] || '');
  const levelBorder = (l: string) => ({ urgent: 'rgba(239,68,68,0.35)', important: 'rgba(245,158,11,0.3)', normal: 'rgba(56,189,248,0.25)' }[l] || '');

  const availableRobots = robots.filter(r => r.status !== 'offline' && r.status !== 'charging').map(r => ({
    ...r, statusLabel: getRobotStatusLabel(r.status), statusClass: getRobotStatusClass(r.status),
  }));
  const currentIncident = incidentList.find(i => i.id === currentIncidentId);

  const dispatchRobot = (id: string) => {
    setCurrentIncidentId(id); setSelectedRobotId(''); setShowDispatch(true);
  };
  const confirmDispatch = () => {
    if (!selectedRobotId) return;
    setIncidentList(list => list.map(i => i.id === currentIncidentId ? { ...i, assignedRobotId: selectedRobotId, status: 'handling' as const } : i));
    setShowDispatch(false);
  };
  const selfHandle = (id: string) => {
    setIncidentList(list => list.map(i => i.id === id ? { ...i, status: 'handling' as const } : i));
  };
  const submitReport = () => {
    if (!reportForm.title.trim()) return;
    const newInc: Incident = {
      id: `INC-${Date.now()}`, title: reportForm.title,
      level: reportForm.level as 'urgent' | 'important' | 'normal',
      status: 'open', location: reportForm.location || '待定',
      reportedBy: '当前保安', reportedAt: timeStr, description: reportForm.description,
    };
    setIncidentList(list => [newInc, ...list]);
    setShowReport(false);
    setReportForm({ level: 'normal', title: '', location: '', description: '' });
  };

  return (
    <div className="mp-page" style={{ background: '#0a0f1e' }}>
      {/* 状态横幅 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
        borderRadius: 14, margin: '12px 16px',
        background: urgentCount > 0 ? 'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.05))' : 'linear-gradient(135deg,rgba(52,211,153,0.2),rgba(52,211,153,0.05))',
        border: `1px solid ${urgentCount > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(52,211,153,0.3)'}`,
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {urgentCount > 0 ? '⚠' : '✓'}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>
            {urgentCount > 0 ? `${urgentCount} 起紧急事件待处置` : '园区安全，无紧急事件'}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{timeStr} · 共 {open.length} 件待处置</div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px', marginBottom: 16 }}>
        {[
          { icon: '📷', label: '查看监控', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)', action: () => navigate({ name: 'robot-camera', incidentId: open.find(i => i.level === 'urgent')?.id }) },
          { icon: '📢', label: '上报事件', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', action: () => setShowReport(true) },
          { icon: '📞', label: '呼叫支援', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)', action: () => alert('支援已呼叫') },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            padding: '14px 0', borderRadius: 14, border: `1px solid ${btn.border}`,
            background: btn.bg, cursor: 'pointer',
          }}>
            <span style={{ fontSize: 22 }}>{btn.icon}</span>
            <span style={{ fontSize: 12, color: btn.color, fontWeight: 600 }}>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* 待处置事件列表 */}
      <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>待处置事件</span>
        <span style={{ fontSize: 12, color: '#64748b' }}>{open.length} 件</span>
      </div>

      {open.map(inc => (
        <div key={inc.id} style={{
          margin: '0 16px 12px', padding: 14, borderRadius: 14,
          background: levelBg(inc.level), border: `1px solid ${levelBorder(inc.level)}`,
          borderLeft: `4px solid ${levelColor(inc.level)}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: levelColor(inc.level), display: 'inline-block' }}></span>
              <span style={{ fontSize: 11, fontWeight: 700, color: levelColor(inc.level), padding: '2px 8px', borderRadius: 100, background: `${levelColor(inc.level)}22`, border: `1px solid ${levelColor(inc.level)}44` }}>
                {getIncidentLevelLabel(inc.level)}
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8', padding: '2px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {getIncidentStatusLabel(inc.status)}
              </span>
            </div>
            <span style={{ fontSize: 11, color: '#64748b' }}>{inc.reportedAt}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{inc.title}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>📍 {inc.location} · 👤 {inc.reportedBy}</div>
          {inc.assignedRobotId && (
            <div style={{ fontSize: 12, color: '#38bdf8', marginBottom: 8 }}>
              🤖 {robots.find(r => r.id === inc.assignedRobotId)?.name} 正在响应
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => dispatchRobot(inc.id)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>派遣机器人</button>
            <button onClick={() => selfHandle(inc.id)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>我去处理</button>
            <button style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>详情 ›</button>
          </div>
        </div>
      ))}

      {open.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
          <div>暂无待处置事件</div>
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '8px 0 16px', fontSize: 12, color: '#475569' }}>
        今日已关闭 {closed.length} 件事件
      </div>

      {/* 派遣机器人弹窗 */}
      {showDispatch && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }} onClick={() => setShowDispatch(false)}>
          <div style={{ width: '100%', background: '#111827', borderRadius: '24px 24px 0 0', padding: '0 0 16px', maxHeight: '75%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 100, margin: '12px auto' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>选择派遣机器人</span>
              <button onClick={() => setShowDispatch(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', padding: '8px 16px' }}>前往：{currentIncident?.location}</div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {availableRobots.map(r => (
                <div key={r.id} onClick={() => setSelectedRobotId(r.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  background: selectedRobotId === r.id ? 'rgba(56,189,248,0.1)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer',
                }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={r.cameraFeed} style={{ width: 56, height: 40, borderRadius: 8, objectFit: 'cover', border: selectedRobotId === r.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>📍 {r.location}</div>
                    <div style={{ fontSize: 11, color: '#38bdf8' }}>{r.statusLabel} · ⚡{r.battery}%</div>
                  </div>
                  {selectedRobotId === r.id && <span style={{ color: '#38bdf8', fontSize: 18 }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 16px 0' }}>
              <button onClick={confirmDispatch} style={{
                width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                background: selectedRobotId ? 'linear-gradient(135deg,#0ea5e9,#6366f1)' : 'rgba(255,255,255,0.08)',
                color: selectedRobotId ? '#fff' : '#64748b', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>
                {selectedRobotId ? '确认派遣' : '请先选择机器人'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 上报事件弹窗 */}
      {showReport && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }} onClick={() => setShowReport(false)}>
          <div style={{ width: '100%', background: '#111827', borderRadius: '24px 24px 0 0', padding: '0 0 24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 100, margin: '12px auto' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>上报新事件</span>
              <button onClick={() => setShowReport(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '12px 16px 0' }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>事件级别</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ v: 'urgent', l: '🔴 紧急' }, { v: 'important', l: '🟡 重要' }, { v: 'normal', l: '🔵 一般' }].map(opt => (
                    <button key={opt.v} onClick={() => setReportForm(f => ({ ...f, level: opt.v }))} style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      background: reportForm.level === opt.v ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
                      border: reportForm.level === opt.v ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.1)',
                      color: reportForm.level === opt.v ? '#38bdf8' : '#94a3b8',
                    }}>{opt.l}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>事件标题</div>
                <input value={reportForm.title} onChange={e => setReportForm(f => ({ ...f, title: e.target.value }))} placeholder="请简要描述事件" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>发生位置</div>
                <input value={reportForm.location} onChange={e => setReportForm(f => ({ ...f, location: e.target.value }))} placeholder="如：A栋3楼走廊" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>详细描述</div>
                <textarea value={reportForm.description} onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))} placeholder="请详细描述事件情况..." rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 14, resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <button onClick={submitReport} style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>提交上报</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
