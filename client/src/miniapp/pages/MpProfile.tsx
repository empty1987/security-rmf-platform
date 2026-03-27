/**
 * MpProfile.tsx — 个人中心页
 */
import { useState } from 'react';

const userInfo = {
  guardName: '张建国', guardId: 'G-2024-087', role: '安保队长', team: 'A班',
  avatarText: '张', shift: '08:00 – 20:00', zone: 'A区 + 南门',
};
const todayStats = { handledIncidents: 3, completedTasks: 5, robotsManaged: 4, patrolHours: 6.5 };

const MENU_GROUPS = [
  {
    title: '工作设置',
    items: [
      { icon: '🔔', label: '告警通知设置', desc: '配置推送方式和级别' },
      { icon: '🤖', label: '机器人绑定', desc: '管理负责的机器人' },
      { icon: '🗺', label: '巡逻区域设置', desc: '查看和修改负责区域' },
    ],
  },
  {
    title: '账号',
    items: [
      { icon: '🔑', label: '修改密码', desc: '' },
      { icon: '📞', label: '紧急联系人', desc: '设置应急联系方式' },
      { icon: '❓', label: '帮助与反馈', desc: '' },
    ],
  },
];

export default function MpProfile() {
  const [onDuty, setOnDuty] = useState(true);

  return (
    <div className="mp-page" style={{ background: '#0a0f1e' }}>
      {/* 用户信息卡 */}
      <div style={{ margin: '12px 16px', padding: 16, borderRadius: 16, background: 'linear-gradient(135deg,rgba(14,165,233,0.15),rgba(99,102,241,0.1))', border: '1px solid rgba(56,189,248,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {userInfo.avatarText}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{userInfo.guardName}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{userInfo.role} · {userInfo.team}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>工号：{userInfo.guardId}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: onDuty ? '#34d399' : '#64748b', display: 'inline-block' }}></span>
              <span style={{ fontSize: 11, color: onDuty ? '#34d399' : '#64748b', fontWeight: 600 }}>{onDuty ? '值班中' : '休息中'}</span>
            </div>
            <button onClick={() => setOnDuty(d => !d)} style={{ fontSize: 10, color: '#64748b', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '2px 8px', cursor: 'pointer' }}>切换</button>
          </div>
        </div>
      </div>

      {/* 今日工作统计 */}
      <div style={{ margin: '0 16px 12px', padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' as const }}>今日工作</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {[
            { num: todayStats.handledIncidents, label: '处置事件', color: '#38bdf8' },
            { num: todayStats.completedTasks, label: '完成任务', color: '#34d399' },
            { num: todayStats.robotsManaged, label: '管理机器人', color: '#f59e0b' },
            { num: `${todayStats.patrolHours}h`, label: '巡逻时长', color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '12px 0', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.num}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 班次信息 */}
      <div style={{ margin: '0 16px 12px', padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' as const }}>当前班次</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b' }}>班次时间</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginTop: 2 }}>{userInfo.shift}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#64748b' }}>负责区域</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginTop: 2 }}>{userInfo.zone}</div>
          </div>
        </div>
      </div>

      {/* 菜单组 */}
      {MENU_GROUPS.map(group => (
        <div key={group.title} style={{ margin: '0 16px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' as const }}>{group.title}</div>
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            {group.items.map((item, i) => (
              <div key={item.label} onClick={() => alert(`${item.label}：功能开发中`)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', borderBottom: i < group.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <span style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: '#e2e8f0' }}>{item.label}</div>
                  {item.desc && <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{item.desc}</div>}
                </div>
                <span style={{ color: '#475569', fontSize: 16 }}>›</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 退出登录 */}
      <div style={{ padding: '8px 16px 32px' }}>
        <button onClick={() => alert('退出登录')} style={{ width: '100%', padding: '13px 0', borderRadius: 14, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          退出登录
        </button>
      </div>
    </div>
  );
}
