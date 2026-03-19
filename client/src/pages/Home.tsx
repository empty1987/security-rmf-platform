// ============================================================
// Home — Platform Entry Page
// Design: Dark hero with three terminal entry cards
// ============================================================
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Monitor, Briefcase, Smartphone, Shield, ChevronRight, Activity, Bot, AlertTriangle } from 'lucide-react';
import { statistics } from '@/lib/mockData';

const entries = [
  {
    path: '/command',
    icon: Monitor,
    title: '大屏端',
    subtitle: '指挥中心',
    description: '全局实时监控，机器人位置追踪，告警可视化，适用于指挥中心大屏显示',
    color: 'sky',
    gradient: 'from-sky-500/20 to-sky-500/5',
    border: 'border-sky-500/30',
    iconBg: 'bg-sky-500/20 border-sky-500/40',
    iconColor: 'text-sky-400',
    badge: '实时监控',
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
    features: ['机器人实时位置', '告警推送', '任务进度', '趋势图表'],
  },
  {
    path: '/admin',
    icon: Briefcase,
    title: '业务端',
    subtitle: '管理后台',
    description: '机器人管理、任务调度、访客管理、巡逻路线配置，适用于管理人员使用',
    color: 'violet',
    gradient: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/30',
    iconBg: 'bg-violet-500/20 border-violet-500/40',
    iconColor: 'text-violet-400',
    badge: '全功能管理',
    badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
    features: ['机器人管理', '任务调度', '访客管理', '保安排班'],
  },
  {
    path: '/mobile',
    icon: Smartphone,
    title: '移动端',
    subtitle: '保安 App',
    description: '一线保安专用，接收任务通知、处理告警、查看机器人状态，适用于移动设备',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/20 border-emerald-500/40',
    iconColor: 'text-emerald-400',
    badge: '移动优先',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    features: ['任务接收', '告警处理', '机器人状态', '快捷操作'],
  },
];

const liveStats = [
  { icon: <Bot size={14} />, label: '在线机器人', value: `${statistics.onlineRobots}/${statistics.totalRobots}`, color: 'text-sky-400' },
  { icon: <Activity size={14} />, label: '执行中任务', value: statistics.activePatrols, color: 'text-emerald-400' },
  { icon: <AlertTriangle size={14} />, label: '今日告警', value: statistics.todayAlerts, color: 'text-amber-400' },
  { icon: <Shield size={14} />, label: '巡逻覆盖率', value: `${statistics.patrolCoverage}%`, color: 'text-violet-400' },
];

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'oklch(0.11 0.025 240)' }}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/hero-command-center-QwBGkXy4YcUJLnW2Fjw6k9.webp"
          alt=""
          className="w-full h-full object-cover opacity-8"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, oklch(0.11 0.025 240 / 0.3), oklch(0.11 0.025 240))' }} />
      </div>

      <div className="relative flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
              <Shield size={18} className="text-sky-400" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-display">安保多机器人协作平台</div>
              <div className="text-xs text-slate-500">Security RMF · 参考 Open-RMF 架构</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="status-dot online" />
            <span className="text-xs text-emerald-400">系统运行正常</span>
            <span className="text-xs text-slate-600 ml-2 font-mono-data">v1.0.0</span>
          </div>
        </header>

        {/* Hero section */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs text-sky-400 mb-6">
              <Activity size={11} className="animate-pulse" />
              实时运行中 · {statistics.onlineRobots} 台机器人在线
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white font-display mb-4 leading-tight">
              智能安保
              <span className="text-sky-400 text-glow-blue"> 多机器人 </span>
              协作平台
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              参考 Open-RMF 架构设计，统一调度多台安保机器人，实现巡逻、响应、引导全流程自动化管理
            </p>
          </motion.div>

          {/* Live stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-6 mb-12 px-6 py-3 rounded-2xl border border-white/8"
            style={{ background: 'oklch(0.145 0.022 240)' }}
          >
            {liveStats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-2">
                {i > 0 && <div className="w-px h-4 bg-white/10 mr-4" />}
                <span className={stat.color}>{stat.icon}</span>
                <div>
                  <div className={`text-lg font-bold font-display ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Entry cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
              >
                <Link href={entry.path}>
                  <div
                    className={`group rounded-2xl border ${entry.border} bg-gradient-to-b ${entry.gradient} p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                    style={{ boxShadow: `0 0 0 0 transparent` }}
                  >
                    {/* Icon & badge */}
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-12 h-12 rounded-2xl ${entry.iconBg} border flex items-center justify-center`}>
                        <entry.icon size={22} className={entry.iconColor} />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg border ${entry.badgeColor}`}>
                        {entry.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="mb-1">
                      <div className="text-xs text-slate-500 mb-0.5">{entry.subtitle}</div>
                      <div className="text-xl font-bold text-white font-display">{entry.title}</div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-400 mb-5 leading-relaxed">{entry.description}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {entry.features.map(f => (
                        <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-slate-400">
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className={`flex items-center gap-2 text-sm font-medium ${entry.iconColor} group-hover:gap-3 transition-all`}>
                      <span>进入{entry.title}</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-white/8 flex items-center justify-between text-xs text-slate-600">
          <span>Security RMF Platform · 参考 Open-RMF 架构</span>
          <span className="font-mono-data">系统运行时间：{statistics.systemUptime}%</span>
        </footer>
      </div>
    </div>
  );
}
