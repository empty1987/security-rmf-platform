<script setup lang="ts">
// ============================================================
// MobileApp.vue — 移动端主组件（Vue 3 SFC）
// 从 MobileApp.tsx 迁移，保持布局、样式、功能完全一致
// Design: 业务优先，快速操作，大字大按钮，颜色驱动
// ============================================================
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  robots, incidents, tasks, alerts, guardShifts,
  getRobotStatusLabel, getTaskStatusLabel,
  type Incident, type Robot, type Task,
} from '@/lib/mockData'
import IncidentModal from './IncidentModal.vue'
import RobotLiveView from './RobotLiveView.vue'

// ---- 常量 ----
const INCIDENT_LEVEL_CONFIG = {
  urgent: { label: '紧急', bg: 'bg-red-500', light: 'bg-red-500/15 border-red-500/30', text: 'text-red-400', border: 'border-red-500/40', dot: '#ef4444' },
  important: { label: '重要', bg: 'bg-amber-500', light: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400', border: 'border-amber-500/40', dot: '#f59e0b' },
  normal: { label: '一般', bg: 'bg-sky-500', light: 'bg-sky-500/15 border-sky-500/30', text: 'text-sky-400', border: 'border-sky-500/40', dot: '#38bdf8' },
}

const INCIDENT_STATUS_CONFIG = {
  open: { label: '待处置', badge: 'bg-red-500/15 text-red-400 border-red-500/25' },
  handling: { label: '处置中', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  closed: { label: '已关闭', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
}

function robotStatusColor(status: Robot['status']) {
  switch (status) {
    case 'patrolling': return { dot: '#38bdf8', text: 'text-sky-400', bg: 'bg-sky-500/15 border-sky-500/25' }
    case 'responding': return { dot: '#fb923c', text: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/25' }
    case 'online': case 'idle': return { dot: '#34d399', text: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25' }
    case 'charging': return { dot: '#a78bfa', text: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/25' }
    case 'warning': return { dot: '#fbbf24', text: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/25' }
    default: return { dot: '#64748b', text: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/25' }
  }
}

// ---- 全局状态 ----
const activeTab = ref('incidents')
const showLiveView = ref(false)
const liveViewRobotId = ref<string | undefined>(undefined)
const currentTime = ref(new Date())

const urgentCount = computed(() => incidents.filter(i => i.level === 'urgent' && i.status !== 'closed').length)
const unreadAlerts = computed(() => alerts.filter((a: any) => !a.acknowledged).length)

const tabs = [
  { id: 'incidents', label: '事件' },
  { id: 'robots', label: '机器人' },
  { id: 'tasks', label: '任务' },
  { id: 'me', label: '我的' },
]
const tabTitles: Record<string, string> = {
  incidents: '事件处置', robots: '机器人管理', tasks: '我的任务', me: '个人中心',
}

let clockTimer: ReturnType<typeof setInterval>
onMounted(() => { clockTimer = setInterval(() => { currentTime.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(clockTimer))

function openLiveView(robotId?: string) {
  liveViewRobotId.value = robotId
  showLiveView.value = true
}

// ---- 事件处置 Tab ----
const selectedIncident = ref<Incident | null>(null)
const openIncidents = computed(() => incidents.filter(i => i.status !== 'closed'))
const closedCount = computed(() => incidents.filter(i => i.status === 'closed').length)

// ---- 机器人管理 Tab ----
const selectedRobot = ref<Robot | null>(null)
const sendingCmd = ref<string | null>(null)
const toastMsg = ref('')
const toastDesc = ref('')
const showToast = ref(false)

function showToastMsg(msg: string, desc = '') {
  toastMsg.value = msg
  toastDesc.value = desc
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2500)
}

function sendCommand(robot: Robot, cmd: string) {
  sendingCmd.value = cmd
  setTimeout(() => {
    sendingCmd.value = null
    showToastMsg(`指令已发送`, `${robot.name}：${cmd}`)
  }, 1200)
}

const robotStats = computed(() => [
  { label: '在线', value: robots.filter(r => r.status !== 'offline').length, color: 'text-emerald-400' },
  { label: '巡逻中', value: robots.filter(r => r.status === 'patrolling').length, color: 'text-sky-400' },
  { label: '需关注', value: robots.filter(r => r.status === 'warning').length, color: 'text-amber-400' },
])

// ---- 任务 Tab ----
const taskFilter = ref<'all' | 'running' | 'pending' | 'completed'>('all')
const filteredTasks = computed(() => tasks.filter((t: Task) => taskFilter.value === 'all' ? true : t.status === taskFilter.value))

const priorityColor: Record<string, string> = {
  urgent: 'text-red-400 bg-red-500/10 border-red-500/25',
  high: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  medium: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
  low: 'text-slate-400 bg-slate-500/10 border-slate-500/25',
}
const priorityLabel: Record<string, string> = { urgent: '紧急', high: '高', medium: '中', low: '低' }

const taskTabs = computed(() => [
  { key: 'all', label: '全部', count: tasks.length },
  { key: 'running', label: '进行中', count: tasks.filter((t: Task) => t.status === 'running').length },
  { key: 'pending', label: '待开始', count: tasks.filter((t: Task) => t.status === 'pending').length },
  { key: 'completed', label: '已完成', count: tasks.filter((t: Task) => t.status === 'completed').length },
])

// ---- 个人中心 Tab ----
const guard = computed(() => guardShifts.find((g: any) => g.status === 'on-duty') ?? guardShifts[0])

function formatTime(d: Date) {
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen py-8" style="background: oklch(0.09 0.02 240)">
    <!-- 手机外壳 -->
    <div
      class="relative flex flex-col overflow-hidden"
      style="width:390px; height:780px; background:oklch(0.10 0.022 240); border-radius:44px; border:2px solid rgba(255,255,255,0.1); box-shadow:0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)"
    >
      <!-- 状态栏 -->
      <div class="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <span class="text-xs text-slate-400 font-mono">{{ formatTime(currentTime) }}</span>
        <div class="w-20 h-5 rounded-full bg-black flex items-center justify-center" style="border:1px solid rgba(255,255,255,0.1)">
          <span class="text-xs text-slate-500 font-semibold">安保系统</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div v-if="urgentCount > 0" class="w-2 h-2 rounded-full bg-red-500 urgent-blink" />
          <span class="text-xs text-emerald-400">在线</span>
        </div>
      </div>

      <!-- 页面标题 -->
      <div class="px-5 pb-3 flex items-center justify-between border-b border-white/8 shrink-0">
        <h1 class="text-base font-bold text-white font-display">
          {{ showLiveView ? '实时监控' : tabTitles[activeTab] }}
        </h1>
        <div class="relative">
          <button class="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <span v-if="unreadAlerts > 0" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {{ unreadAlerts }}
          </span>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto px-4 py-4" style="scrollbar-width:none">
        <!-- 实时画面 -->
        <Transition name="slide-right" mode="out-in">
          <div v-if="showLiveView" key="liveview">
            <RobotLiveView :initial-robot-id="liveViewRobotId" @back="showLiveView = false" />
          </div>

          <!-- Tab 内容 -->
          <Transition v-else name="tab-fade" mode="out-in">
            <div :key="activeTab">

              <!-- ===== 事件处置 Tab ===== -->
              <div v-if="activeTab === 'incidents'" class="space-y-4">
                <!-- 当班状态横幅 -->
                <div
                  class="rounded-2xl p-4 flex items-center gap-4"
                  :style="{
                    background: urgentCount > 0
                      ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))'
                      : 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))',
                    border: urgentCount > 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)',
                  }"
                >
                  <div :class="`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${urgentCount > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20'}`">
                    <svg v-if="urgentCount > 0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400 siren-pulse"><path d="M11 5c-2.8 0-5 2.2-5 5v6h10v-6c0-2.8-2.2-5-5-5z"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/><path d="M2 10h2"/><path d="M20 10h2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div class="flex-1">
                    <div :class="`text-base font-bold font-display ${urgentCount > 0 ? 'text-red-300' : 'text-emerald-300'}`">
                      {{ urgentCount > 0 ? `${urgentCount} 起紧急事件待处置` : '园区安全，无紧急事件' }}
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5">
                      {{ formatTime(currentTime) }} · 共 {{ openIncidents.length }} 件待处置
                    </div>
                  </div>
                </div>

                <!-- 快捷操作 -->
                <div class="grid grid-cols-3 gap-2">
                  <button @click="openLiveView()" class="flex flex-col items-center gap-2 py-3 rounded-2xl border bg-sky-500/10 border-sky-500/20 text-sky-400 active:scale-95 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                    <span class="text-xs font-medium">查看监控</span>
                  </button>
                  <button @click="showToastMsg('上报事件', '功能开发中')" class="flex flex-col items-center gap-2 py-3 rounded-2xl border bg-amber-500/10 border-amber-500/20 text-amber-400 active:scale-95 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                    <span class="text-xs font-medium">上报事件</span>
                  </button>
                  <button @click="showToastMsg('已呼叫值班长')" class="flex flex-col items-center gap-2 py-3 rounded-2xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 active:scale-95 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span class="text-xs font-medium">呼叫支援</span>
                  </button>
                </div>

                <!-- 事件列表 -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-semibold text-slate-200">待处置事件</span>
                    <span class="text-xs text-slate-500">{{ openIncidents.length }} 件</span>
                  </div>
                  <div class="space-y-2.5">
                    <button
                      v-for="incident in openIncidents"
                      :key="incident.id"
                      @click="selectedIncident = incident"
                      class="w-full text-left rounded-2xl border p-4 transition-all hover:brightness-110 active:scale-98"
                      :class="INCIDENT_LEVEL_CONFIG[incident.level]?.border ?? 'border-white/10'"
                      style="background: oklch(0.145 0.025 240)"
                    >
                      <div class="flex items-start gap-3">
                        <div :class="`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${INCIDENT_LEVEL_CONFIG[incident.level]?.light} ${INCIDENT_LEVEL_CONFIG[incident.level]?.text}`">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <span :class="`text-xs px-1.5 py-0.5 rounded-full font-bold ${INCIDENT_LEVEL_CONFIG[incident.level]?.bg} text-white`">
                              {{ INCIDENT_LEVEL_CONFIG[incident.level]?.label }}
                            </span>
                            <span :class="`text-xs px-1.5 py-0.5 rounded border ${INCIDENT_STATUS_CONFIG[incident.status]?.badge}`">
                              {{ INCIDENT_STATUS_CONFIG[incident.status]?.label }}
                            </span>
                          </div>
                          <div class="text-sm font-semibold text-slate-100 leading-tight mb-1">{{ incident.title }}</div>
                          <div class="flex items-center gap-3 text-xs text-slate-500">
                            <span class="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                              {{ incident.location }}
                            </span>
                            <span class="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {{ incident.reportedAt }}
                            </span>
                          </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-600 shrink-0 mt-1"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                      <div v-if="incident.assignedRobotId" class="mt-2.5 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-xs text-sky-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>
                        <span>{{ robots.find(r => r.id === incident.assignedRobotId)?.name ?? incident.assignedRobotId }} 正在响应</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div class="text-xs text-slate-600 text-center py-2">今日已关闭 {{ closedCount }} 件事件</div>
              </div>

              <!-- ===== 机器人管理 Tab ===== -->
              <div v-else-if="activeTab === 'robots'" class="space-y-4">
                <!-- 机器人详情 -->
                <div v-if="selectedRobot" class="space-y-4">
                  <button @click="selectedRobot = null" class="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                    返回机器人列表
                  </button>

                  <div class="rounded-2xl border border-white/10 overflow-hidden" style="background: oklch(0.145 0.025 240)">
                    <div class="relative cursor-pointer" @click="openLiveView(selectedRobot.id)">
                      <img :src="selectedRobot.cameraFeed" alt="实时画面" class="w-full h-36 object-cover" />
                      <div class="absolute inset-0 bg-black/30 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                        <span class="text-white text-sm font-semibold">点击查看实时画面</span>
                      </div>
                      <div class="absolute top-2 left-2 flex items-center gap-1">
                        <div class="rec-blink flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444"><circle cx="12" cy="12" r="10"/></svg>
                          <span class="text-xs text-white font-mono">LIVE</span>
                        </div>
                      </div>
                      <div class="absolute top-2 right-2">
                        <span :class="`text-xs px-2 py-0.5 rounded-full font-semibold ${robotStatusColor(selectedRobot.status).bg} border`">
                          {{ getRobotStatusLabel(selectedRobot.status) }}
                        </span>
                      </div>
                    </div>

                    <div class="p-4 space-y-3">
                      <div>
                        <div class="text-lg font-bold text-slate-100 font-display">{{ selectedRobot.name }}</div>
                        <div class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          {{ selectedRobot.location }}
                        </div>
                      </div>
                      <div class="grid grid-cols-3 gap-2">
                        <div
                          v-for="item in [
                            { label: '电量', value: selectedRobot.battery + '%', color: selectedRobot.battery < 20 ? 'text-red-400' : selectedRobot.battery < 50 ? 'text-amber-400' : 'text-emerald-400' },
                            { label: '速度', value: selectedRobot.speed + 'km/h', color: 'text-sky-400' },
                            { label: '今日巡逻', value: selectedRobot.totalPatrols + '次', color: 'text-violet-400' },
                          ]"
                          :key="item.label"
                          class="text-center py-2.5 rounded-xl border border-white/5"
                          style="background: oklch(0.12 0.02 240)"
                        >
                          <div :class="`text-base font-bold font-display ${item.color}`">{{ item.value }}</div>
                          <div class="text-xs text-slate-600 mt-0.5">{{ item.label }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p class="text-sm font-semibold text-slate-300 mb-3">发送指令</p>
                    <div class="grid grid-cols-2 gap-2.5">
                      <button
                        v-for="item in [
                          { label: '立即停止', color: 'text-red-400 bg-red-500/10 border-red-500/25', cmd: '立即停止' },
                          { label: '返回充电', color: 'text-violet-400 bg-violet-500/10 border-violet-500/25', cmd: '返回充电' },
                          { label: '继续巡逻', color: 'text-sky-400 bg-sky-500/10 border-sky-500/25', cmd: '继续巡逻' },
                          { label: '前往指定点', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25', cmd: '前往指定点' },
                        ]"
                        :key="item.label"
                        @click="sendCommand(selectedRobot!, item.cmd)"
                        :disabled="sendingCmd !== null"
                        :class="`flex items-center gap-2.5 p-3.5 rounded-2xl border ${item.color} active:scale-95 transition-all disabled:opacity-50`"
                      >
                        <svg v-if="sendingCmd === item.cmd" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-anim"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        <span class="text-sm font-semibold">{{ item.label }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 机器人列表 -->
                <template v-else>
                  <div class="grid grid-cols-3 gap-2">
                    <div
                      v-for="item in robotStats"
                      :key="item.label"
                      class="text-center py-3 rounded-2xl border border-white/8"
                      style="background: oklch(0.155 0.025 240)"
                    >
                      <div :class="`text-2xl font-bold font-display ${item.color}`">{{ item.value }}</div>
                      <div class="text-xs text-slate-500 mt-0.5">{{ item.label }}</div>
                    </div>
                  </div>

                  <div class="space-y-2.5">
                    <button
                      v-for="robot in robots"
                      :key="robot.id"
                      @click="selectedRobot = robot"
                      class="w-full text-left rounded-2xl border border-white/8 overflow-hidden transition-all hover:border-white/15 active:scale-98"
                      style="background: oklch(0.145 0.025 240)"
                    >
                      <div class="flex items-center gap-3 p-3.5">
                        <div class="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                          <img :src="robot.cameraFeed" :alt="robot.name" class="w-full h-full object-cover" />
                          <div
                            class="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-black/40"
                            :style="{ background: robotStatusColor(robot.status).dot, boxShadow: `0 0 5px ${robotStatusColor(robot.status).dot}` }"
                          />
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="text-sm font-bold text-slate-100 font-display">{{ robot.name }}</span>
                            <span :class="`text-xs px-1.5 py-0.5 rounded border ${robotStatusColor(robot.status).bg} ${robotStatusColor(robot.status).text}`">
                              {{ getRobotStatusLabel(robot.status) }}
                            </span>
                          </div>
                          <div class="text-xs text-slate-500 flex items-center gap-1 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            {{ robot.location }}
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="flex-1 h-1.5 rounded-full bg-white/8">
                              <div
                                class="h-full rounded-full transition-all"
                                :style="{ width: robot.battery + '%', background: robot.battery < 20 ? '#ef4444' : robot.battery < 50 ? '#f59e0b' : '#34d399' }"
                              />
                            </div>
                            <span class="text-xs text-slate-600 shrink-0">{{ robot.battery }}%</span>
                          </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-600 shrink-0"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                      <div v-if="robot.status === 'warning'" class="px-3.5 pb-2.5 flex items-center gap-1.5 text-xs text-amber-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10H7M21 6H3M21 14H3M21 18H7"/></svg>
                        电量不足，建议返回充电
                      </div>
                    </button>
                  </div>
                </template>
              </div>

              <!-- ===== 任务 Tab ===== -->
              <div v-else-if="activeTab === 'tasks'" class="space-y-4">
                <div class="flex gap-2 overflow-x-auto pb-1" style="scrollbar-width: none">
                  <button
                    v-for="tab in taskTabs"
                    :key="tab.key"
                    @click="taskFilter = tab.key as typeof taskFilter"
                    :class="`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm transition-all ${taskFilter === tab.key ? 'bg-sky-500/20 border border-sky-500/40 text-sky-300 font-semibold' : 'bg-white/5 border border-white/8 text-slate-400'}`"
                  >
                    {{ tab.label }}
                    <span :class="`text-xs px-1.5 rounded-full ${taskFilter === tab.key ? 'bg-sky-500/30 text-sky-300' : 'bg-white/8 text-slate-500'}`">{{ tab.count }}</span>
                  </button>
                </div>

                <div class="space-y-2.5">
                  <div
                    v-for="task in filteredTasks"
                    :key="task.id"
                    class="rounded-2xl border border-white/8 p-4"
                    style="background: oklch(0.145 0.025 240)"
                  >
                    <div class="flex items-start gap-3 mb-3">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                          <span :class="`text-xs px-1.5 py-0.5 rounded border ${priorityColor[task.priority] ?? priorityColor.medium}`">
                            {{ priorityLabel[task.priority] }}
                          </span>
                          <span class="text-xs text-slate-500">{{ getTaskStatusLabel(task.status) }}</span>
                        </div>
                        <div class="text-sm font-semibold text-slate-100">{{ task.title }}</div>
                        <div class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          {{ task.location }}
                        </div>
                      </div>
                    </div>

                    <div v-if="task.status === 'running'" class="mb-3">
                      <div class="flex justify-between text-xs text-slate-500 mb-1">
                        <span>执行进度</span><span>{{ task.progress }}%</span>
                      </div>
                      <div class="h-2 rounded-full bg-white/8">
                        <div class="h-full rounded-full bg-sky-500 transition-all duration-700" :style="{ width: task.progress + '%' }" />
                      </div>
                    </div>

                    <div v-if="robots.find(r => r.id === task.assignedRobot)" class="flex items-center gap-2 mb-3 px-2.5 py-2 rounded-xl border border-sky-500/15 bg-sky-500/5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-sky-400"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>
                      <span class="text-xs text-sky-300">{{ robots.find(r => r.id === task.assignedRobot)?.name }}</span>
                      <span class="text-xs text-slate-500">·</span>
                      <span class="text-xs text-slate-500">{{ robots.find(r => r.id === task.assignedRobot)?.location }}</span>
                    </div>

                    <div v-if="task.status === 'running'" class="flex gap-2">
                      <button @click="showToastMsg('已标记完成', task.title)" class="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 active:scale-95 transition-all">完成任务</button>
                      <button @click="showToastMsg('已请求支援')" class="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-500/15 border border-amber-500/25 text-amber-300 active:scale-95 transition-all">需要支援</button>
                    </div>
                    <button v-else-if="task.status === 'pending'" @click="showToastMsg('已开始任务', task.title)" class="w-full py-2.5 rounded-xl text-sm font-semibold bg-sky-500/15 border border-sky-500/25 text-sky-300 active:scale-95 transition-all">开始任务</button>
                  </div>
                </div>
              </div>

              <!-- ===== 个人中心 Tab ===== -->
              <div v-else-if="activeTab === 'me'" class="space-y-4">
                <div class="rounded-2xl border border-white/8 p-5" style="background: oklch(0.145 0.025 240)">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-2xl font-bold text-sky-300 font-display shrink-0">
                      {{ guard.guardName.slice(0, 1) }}
                    </div>
                    <div>
                      <div class="text-xl font-bold text-slate-100 font-display">{{ guard.guardName }}</div>
                      <div class="text-sm text-slate-400 mt-0.5">{{ guard.guardId }} · 安保一队</div>
                      <div class="mt-1.5 flex items-center gap-1.5">
                        <div class="w-2 h-2 rounded-full bg-emerald-400" />
                        <span class="text-xs text-emerald-400 font-semibold">值班中</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <div
                    v-for="item in [
                      { label: '完成任务', value: guard.tasksCompleted, color: 'text-emerald-400' },
                      { label: '处置事件', value: 2, color: 'text-sky-400' },
                      { label: '巡逻时长', value: '4.5h', color: 'text-violet-400' },
                    ]"
                    :key="item.label"
                    class="text-center py-3 rounded-2xl border border-white/8"
                    style="background: oklch(0.155 0.025 240)"
                  >
                    <div :class="`text-xl font-bold font-display ${item.color}`">{{ item.value }}</div>
                    <div class="text-xs text-slate-500 mt-0.5">{{ item.label }}</div>
                  </div>
                </div>

                <div class="rounded-2xl border border-white/8 overflow-hidden" style="background: oklch(0.145 0.025 240)">
                  <div class="px-4 py-3 border-b border-white/8 text-sm font-semibold text-slate-200">班次信息</div>
                  <div
                    v-for="item in [
                      { label: '班次', value: guard.shiftStart + ' - ' + guard.shiftEnd },
                      { label: '负责区域', value: guard.zone ?? guard.area },
                      { label: '班组', value: '安保一队' },
                    ]"
                    :key="item.label"
                    class="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0"
                  >
                    <span class="text-sm text-slate-400">{{ item.label }}</span>
                    <span class="text-sm text-slate-200">{{ item.value }}</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <button
                    v-for="item in [
                      { label: '消息通知设置', msg: '通知设置功能开发中' },
                      { label: '交班记录', msg: '交班记录功能开发中' },
                      { label: '退出登录', msg: '已退出' },
                    ]"
                    :key="item.label"
                    @click="showToastMsg(item.msg)"
                    class="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-white/8 text-slate-300 hover:bg-white/5 transition-all active:scale-98"
                    style="background: oklch(0.145 0.025 240)"
                  >
                    <span class="text-sm flex-1 text-left">{{ item.label }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-600"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </div>

            </div>
          </Transition>
        </Transition>
      </div>

      <!-- 底部导航 -->
      <div
        v-if="!showLiveView"
        class="absolute bottom-0 left-0 right-0 flex items-center border-t border-white/8 px-2 pb-3 pt-2 shrink-0"
        style="background: oklch(0.10 0.022 240)"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all ${activeTab === tab.id ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`"
        >
          <div class="relative">
            <!-- 事件 Tab 图标 -->
            <svg v-if="tab.id === 'incidents'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5c-2.8 0-5 2.2-5 5v6h10v-6c0-2.8-2.2-5-5-5z"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/></svg>
            <!-- 机器人 Tab 图标 -->
            <svg v-else-if="tab.id === 'robots'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
            <!-- 任务 Tab 图标 -->
            <svg v-else-if="tab.id === 'tasks'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>
            <!-- 我的 Tab 图标 -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
            <!-- 紧急事件角标 -->
            <span
              v-if="tab.id === 'incidents' && urgentCount > 0"
              class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold urgent-pulse"
              style="font-size: 8px"
            >{{ urgentCount }}</span>
          </div>
          <span class="text-xs">{{ tab.label }}</span>
          <div v-if="activeTab === tab.id" class="w-1 h-1 rounded-full bg-sky-400" />
        </button>
      </div>
    </div>

    <!-- 事件处置弹窗 -->
    <Teleport to="body">
      <IncidentModal
        v-if="selectedIncident"
        :incident="selectedIncident"
        @close="selectedIncident = null"
      />
    </Teleport>

    <!-- 简易 Toast -->
    <Teleport to="body">
      <Transition name="toast-fade">
        <div
          v-if="showToast"
          class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-2xl text-sm font-semibold text-white shadow-xl"
          style="background: oklch(0.2 0.04 240); border: 1px solid rgba(255,255,255,0.12)"
        >
          {{ toastMsg }}
          <div v-if="toastDesc" class="text-xs text-slate-400 mt-0.5 font-normal">{{ toastDesc }}</div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.tab-fade-enter-from { opacity: 0; transform: translateY(10px); }
.tab-fade-leave-to   { opacity: 0; transform: translateY(-10px); }

.slide-right-enter-active, .slide-right-leave-active { transition: opacity 0.25s, transform 0.25s; }
.slide-right-enter-from { opacity: 0; transform: translateX(40px); }
.slide-right-leave-to   { opacity: 0; transform: translateX(40px); }

.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translate(-50%, -8px); }

.urgent-blink { animation: urgentBlink 0.8s ease-in-out infinite; }
@keyframes urgentBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.urgent-pulse { animation: urgentPulse 1s ease-in-out infinite; }
@keyframes urgentPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }

.siren-pulse { animation: sirenPulse 1s ease-in-out infinite; }
@keyframes sirenPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }

.rec-blink { animation: recBlink 1.2s ease-in-out infinite; }
@keyframes recBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.spin-anim { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
