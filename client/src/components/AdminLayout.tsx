// ============================================================
// AdminLayout — 业务端管理后台布局
// Design: Left sidebar nav + top header + main content
// ============================================================
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Shield, LayoutDashboard, Bot, ClipboardList, AlertTriangle,
  MapPin, Users, Settings, ChevronRight, Bell, LogOut,
  Monitor, Smartphone, Activity, Menu, X
} from 'lucide-react';
import { alerts } from '@/lib/mockData';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: '总览', exact: true },
  { path: '/admin/robots', icon: Bot, label: '机器人管理' },
  { path: '/admin/tasks', icon: ClipboardList, label: '任务调度' },
  { path: '/admin/alerts', icon: AlertTriangle, label: '告警中心' },
  { path: '/admin/patrol', icon: MapPin, label: '巡逻路线' },
  { path: '/admin/visitors', icon: Users, label: '访客管理' },
  { path: '/admin/guards', icon: Shield, label: '保安排班' },
  { path: '/admin/settings', icon: Settings, label: '系统设置' },
];

const viewLinks = [
  { path: '/command', icon: Monitor, label: '大屏端' },
  { path: '/mobile', icon: Smartphone, label: '移动端' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'oklch(0.11 0.025 240)' }}>
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-white/8 transition-all duration-300 shrink-0 ${sidebarOpen ? 'w-56' : 'w-14'}`}
        style={{ background: 'oklch(0.13 0.025 240)' }}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-white/8 gap-3">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center shrink-0">
            <Shield size={14} className="text-sky-400" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white font-display whitespace-nowrap">安保 RMF</div>
              <div className="text-xs text-slate-500 whitespace-nowrap">管理后台</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = item.exact ? location === item.path : location.startsWith(item.path);
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group relative ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}>
                  <item.icon size={16} className="shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                  {isActive && sidebarOpen && <ChevronRight size={12} className="ml-auto text-sky-400" />}
                  {item.label === '告警中心' && unacknowledgedAlerts > 0 && (
                    <span className={`${sidebarOpen ? 'ml-auto' : 'absolute top-1 right-1'} text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold`}>
                      {unacknowledgedAlerts}
                    </span>
                  )}
                  {/* Tooltip for collapsed state */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 rounded bg-slate-800 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* View switcher */}
        <div className="p-2 border-t border-white/8">
          {sidebarOpen && <div className="text-xs text-slate-500 px-3 mb-1">切换视图</div>}
          {viewLinks.map(item => (
            <Link key={item.path} href={item.path}>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all cursor-pointer">
                <item.icon size={14} className="shrink-0" />
                {sidebarOpen && <span className="text-xs">{item.label}</span>}
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/8 shrink-0"
          style={{ background: 'oklch(0.13 0.025 240)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-slate-200 transition-colors">
              {sidebarOpen ? <Menu size={18} /> : <Menu size={18} />}
            </button>
            {title && <h1 className="text-base font-semibold text-slate-200 font-display">{title}</h1>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Activity size={12} className="animate-pulse" />
              <span>系统正常</span>
            </div>
            <div className="relative">
              <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all">
                <Bell size={15} />
              </button>
              {unacknowledgedAlerts > 0 && (
                <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unacknowledgedAlerts}
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 text-xs font-bold font-display">
              管
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
