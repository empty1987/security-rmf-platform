// ============================================================
// AlertCenter — 告警中心
// ============================================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, CheckCircle2, MapPin, Bot, Clock, X } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { alerts, getAlertLevelLabel, type Alert } from '@/lib/mockData';
import { toast } from 'sonner';

const levelConfig: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  critical: { bg: 'bg-red-500/8', border: 'border-l-red-500 border-red-500/15', icon: 'text-red-400', text: 'text-red-400' },
  warning: { bg: 'bg-amber-500/8', border: 'border-l-amber-500 border-amber-500/15', icon: 'text-amber-400', text: 'text-amber-400' },
  info: { bg: 'bg-sky-500/8', border: 'border-l-sky-500 border-sky-500/15', icon: 'text-sky-400', text: 'text-sky-400' },
};

function AlertCard({ alert, onAcknowledge }: { alert: Alert; onAcknowledge: (id: string) => void }) {
  const cfg = levelConfig[alert.level];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: alert.acknowledged ? 0.55 : 1, y: 0 }}
      className={`rounded-xl border-l-4 border p-4 ${cfg.bg} ${cfg.border} transition-opacity`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${cfg.icon}`}>
          {alert.level === 'critical' ? <AlertTriangle size={18} /> :
           alert.level === 'warning' ? <AlertTriangle size={18} /> : <Bell size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                alert.level === 'critical' ? 'bg-red-500/20 text-red-400' :
                alert.level === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                'bg-sky-500/20 text-sky-400'
              }`}>
                {getAlertLevelLabel(alert.level)}
              </span>
              <span className="text-sm font-semibold text-slate-200">{alert.title}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 font-mono-data">{alert.timestamp}</span>
              {!alert.acknowledged && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 transition-all"
                >
                  <CheckCircle2 size={11} />
                  确认
                </button>
              )}
              {alert.acknowledged && (
                <span className="text-xs text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  已确认
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-2">{alert.description}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><MapPin size={10} />{alert.location} · {alert.floor}楼</span>
            {alert.robotId && <span className="flex items-center gap-1"><Bot size={10} />{alert.robotId}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AlertCenter() {
  const [alertList, setAlertList] = useState(alerts);
  const [filter, setFilter] = useState<string>('all');

  const handleAcknowledge = (id: string) => {
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    toast.success('告警已确认');
  };

  const handleAcknowledgeAll = () => {
    setAlertList(prev => prev.map(a => ({ ...a, acknowledged: true })));
    toast.success('所有告警已确认');
  };

  const filtered = filter === 'all' ? alertList :
    filter === 'unread' ? alertList.filter(a => !a.acknowledged) :
    alertList.filter(a => a.level === filter);

  const unread = alertList.filter(a => !a.acknowledged).length;

  return (
    <AdminLayout title="告警中心">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '今日告警', value: alertList.length, color: 'text-slate-200' },
          { label: '紧急', value: alertList.filter(a => a.level === 'critical').length, color: 'text-red-400' },
          { label: '警告', value: alertList.filter(a => a.level === 'warning').length, color: 'text-amber-400' },
          { label: '未处理', value: unread, color: unread > 0 ? 'text-red-400' : 'text-emerald-400' },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-white/8 p-4" style={{ background: 'oklch(0.145 0.022 240)' }}>
            <div className="text-xs text-slate-500 mb-2">{item.label}</div>
            <div className={`text-3xl font-bold font-display ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Filter & actions */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'unread', label: '未处理' },
            { key: 'critical', label: '紧急' },
            { key: 'warning', label: '警告' },
            { key: 'info', label: '通知' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                filter === item.key
                  ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                  : 'border-white/8 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {unread > 0 && (
          <button
            onClick={handleAcknowledgeAll}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 transition-all"
          >
            <CheckCircle2 size={14} />
            全部确认
          </button>
        )}
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-3">
        {filtered.map(alert => (
          <AlertCard key={alert.id} alert={alert} onAcknowledge={handleAcknowledge} />
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-500/50" />
            <div className="text-sm">暂无告警</div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
