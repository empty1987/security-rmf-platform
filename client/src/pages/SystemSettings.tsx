// ============================================================
// SystemSettings — 系统设置页面
// ============================================================
import { useState } from 'react';
import { Settings, Shield, Bell, Bot, Network, Database, Info } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { statistics } from '@/lib/mockData';
import { toast } from 'sonner';

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div>
        <div className="text-sm text-slate-200">{label}</div>
        {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );
}

function Toggle({ defaultChecked = false, onChange }: { defaultChecked?: boolean; onChange?: (v: boolean) => void }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      onClick={() => { setChecked(!checked); onChange?.(!checked); }}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-200 ${checked ? 'bg-sky-500' : 'bg-white/15'}`}
      style={{ height: '22px', width: '40px' }}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
}

export default function SystemSettings() {
  return (
    <AdminLayout title="系统设置">
      <div className="max-w-2xl flex flex-col gap-6">
        {/* RMF Core */}
        <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.145 0.022 240)' }}>
          <div className="px-5 py-3 border-b border-white/8 flex items-center gap-2">
            <Network size={15} className="text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-200 font-display">RMF 核心配置</h3>
          </div>
          <div className="px-5">
            <SettingRow label="RMF 调度模式" description="任务分配算法">
              <select className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50">
                <option>最近优先</option>
                <option>负载均衡</option>
                <option>优先级优先</option>
              </select>
            </SettingRow>
            <SettingRow label="任务冲突检测" description="自动检测机器人路径冲突">
              <Toggle defaultChecked={true} onChange={v => toast.info(`冲突检测已${v ? '开启' : '关闭'}`)} />
            </SettingRow>
            <SettingRow label="自动充电阈值" description="电量低于此值自动返回充电">
              <div className="flex items-center gap-2">
                <input type="range" min="10" max="30" defaultValue="20" className="w-24 accent-sky-500" />
                <span className="text-sm text-slate-300 font-mono-data w-8">20%</span>
              </div>
            </SettingRow>
            <SettingRow label="机器人心跳间隔" description="状态上报频率">
              <select className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50">
                <option>1秒</option>
                <option>5秒</option>
                <option>10秒</option>
              </select>
            </SettingRow>
          </div>
        </div>

        {/* Alert settings */}
        <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.145 0.022 240)' }}>
          <div className="px-5 py-3 border-b border-white/8 flex items-center gap-2">
            <Bell size={15} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200 font-display">告警配置</h3>
          </div>
          <div className="px-5">
            <SettingRow label="紧急告警声音" description="紧急告警时播放提示音">
              <Toggle defaultChecked={true} onChange={v => toast.info(`告警声音已${v ? '开启' : '关闭'}`)} />
            </SettingRow>
            <SettingRow label="移动端推送" description="向保安手机推送告警通知">
              <Toggle defaultChecked={true} />
            </SettingRow>
            <SettingRow label="自动派遣响应" description="紧急告警自动派遣最近机器人">
              <Toggle defaultChecked={false} onChange={v => toast.info(`自动派遣已${v ? '开启' : '关闭'}`)} />
            </SettingRow>
            <SettingRow label="告警超时时间" description="未处理告警升级时间">
              <select className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50">
                <option>5分钟</option>
                <option>10分钟</option>
                <option>30分钟</option>
              </select>
            </SettingRow>
          </div>
        </div>

        {/* Display settings */}
        <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.145 0.022 240)' }}>
          <div className="px-5 py-3 border-b border-white/8 flex items-center gap-2">
            <Settings size={15} className="text-violet-400" />
            <h3 className="text-sm font-semibold text-slate-200 font-display">显示设置</h3>
          </div>
          <div className="px-5">
            <SettingRow label="大屏刷新率" description="地图和数据刷新频率">
              <select className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50">
                <option>1秒</option>
                <option>2秒</option>
                <option>5秒</option>
              </select>
            </SettingRow>
            <SettingRow label="机器人轨迹显示" description="在地图上显示历史轨迹">
              <Toggle defaultChecked={false} />
            </SettingRow>
            <SettingRow label="楼层切换动画" description="地图楼层切换过渡效果">
              <Toggle defaultChecked={true} />
            </SettingRow>
          </div>
        </div>

        {/* System info */}
        <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'oklch(0.145 0.022 240)' }}>
          <div className="px-5 py-3 border-b border-white/8 flex items-center gap-2">
            <Info size={15} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-200 font-display">系统信息</h3>
          </div>
          <div className="px-5">
            {[
              { label: '平台版本', value: 'v1.0.0' },
              { label: 'RMF 核心版本', value: 'Open-RMF 1.0 (参考)' },
              { label: '系统运行时间', value: `${statistics.systemUptime}%` },
              { label: '机器人总数', value: `${statistics.totalRobots} 台` },
              { label: '今日任务量', value: `${statistics.todayTasks} 项` },
            ].map(item => (
              <SettingRow key={item.label} label={item.label}>
                <span className="text-sm text-slate-400 font-mono-data">{item.value}</span>
              </SettingRow>
            ))}
          </div>
        </div>

        <button
          onClick={() => toast.success('设置已保存')}
          className="w-full py-3 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 text-sm font-medium hover:bg-sky-500/30 transition-all"
        >
          保存设置
        </button>
      </div>
    </AdminLayout>
  );
}
