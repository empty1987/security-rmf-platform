<script setup lang="ts">
// ============================================================
// IncidentModal.vue — 事件处置弹窗（Vue 3 SFC）
// 从 MobileApp.tsx IncidentModal 迁移
// ============================================================
import { ref, computed } from 'vue'
import { robots, getRobotStatusLabel, type Incident, type Robot } from '@/lib/mockData'

const props = defineProps<{ incident: Incident }>()
const emit = defineEmits<{ close: [] }>()

const INCIDENT_LEVEL_CONFIG = {
  urgent: {
    label: '紧急', bg: 'bg-red-500',
    light: 'bg-red-500/15 border-red-500/30', text: 'text-red-400', border: 'border-red-500/40',
  },
  important: {
    label: '重要', bg: 'bg-amber-500',
    light: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400', border: 'border-amber-500/40',
  },
  normal: {
    label: '一般', bg: 'bg-sky-500',
    light: 'bg-sky-500/15 border-sky-500/30', text: 'text-sky-400', border: 'border-sky-500/40',
  },
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

type Step = 'detail' | 'dispatch' | 'dispatching' | 'done'
const step = ref<Step>('detail')
const selectedRobot = ref<Robot | null>(null)
const toastMsg = ref('')
const toastDesc = ref('')
const showToast = ref(false)

const lv = computed(() => INCIDENT_LEVEL_CONFIG[props.incident.level] ?? INCIDENT_LEVEL_CONFIG.normal)
const availableRobots = computed(() => robots.filter(r => r.status !== 'offline' && r.status !== 'charging'))

function toast(msg: string, desc = '') {
  toastMsg.value = msg
  toastDesc.value = desc
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2500)
}

function handleDispatch() {
  if (!selectedRobot.value) return
  step.value = 'dispatching'
  setTimeout(() => {
    step.value = 'done'
    toast(`${selectedRobot.value!.name} 已派出`, `正前往 ${props.incident.location}`)
  }, 2000)
}

function handleCallSupport() {
  toast('已通知支援', '值班长已收到通知')
  emit('close')
}

function handleSelfHandle() {
  toast('已标记处置中')
  emit('close')
}

function handleFalseAlarm() {
  toast('已关闭事件')
  emit('close')
}
</script>

<template>
  <!-- 遮罩 -->
  <Transition name="modal-fade">
    <div
      class="fixed inset-0 z-50 flex items-end justify-center"
      style="background: rgba(0,0,0,0.7)"
      @click="emit('close')"
    >
      <!-- 弹窗面板 -->
      <Transition name="modal-slide">
        <div
          class="w-full max-w-sm rounded-t-3xl overflow-hidden"
          style="background: oklch(0.12 0.025 240); max-height: 85vh"
          @click.stop
        >
          <!-- 拖拽条 -->
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1 rounded-full bg-white/20" />
          </div>

          <!-- 标题栏 -->
          <div class="flex items-center gap-3 px-5 py-3 border-b border-white/8">
            <div :class="`w-2.5 h-2.5 rounded-full ${lv.bg}`" />
            <span class="font-bold text-slate-100 font-display flex-1 text-sm">{{ incident.title }}</span>
            <button @click="emit('close')" class="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div class="overflow-y-auto px-5 py-4" style="max-height: 70vh">
            <!-- 详情步骤 -->
            <div v-if="step === 'detail'" class="space-y-4">
              <div class="rounded-2xl border border-white/8 p-4 space-y-3" style="background: oklch(0.155 0.025 240)">
                <div class="flex items-center gap-2">
                  <span :class="`text-xs px-2 py-0.5 rounded-full border ${lv.light} ${lv.text}`">{{ lv.label }}</span>
                  <span class="text-xs text-slate-500">{{ incident.type }}</span>
                  <span class="text-xs text-slate-600 ml-auto">{{ incident.reportedAt }}</span>
                </div>
                <p class="text-sm text-slate-300 leading-relaxed">{{ incident.description }}</p>
                <div class="flex items-center gap-1.5 text-xs text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>{{ incident.location }}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button @click="step = 'dispatch'" class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 transition-all active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
                  <span class="text-sm font-semibold">派遣机器人</span>
                </button>
                <button @click="handleCallSupport" class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span class="text-sm font-semibold">呼叫支援</span>
                </button>
                <button @click="handleSelfHandle" class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>
                  <span class="text-sm font-semibold">我去处理</span>
                </button>
                <button @click="handleFalseAlarm" class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-500/15 border border-slate-500/30 text-slate-400 hover:bg-slate-500/25 transition-all active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  <span class="text-sm font-semibold">误报关闭</span>
                </button>
              </div>
            </div>

            <!-- 派遣步骤 -->
            <div v-else-if="step === 'dispatch'" class="space-y-4">
              <button @click="step = 'detail'" class="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                返回
              </button>
              <div>
                <p class="text-sm font-semibold text-slate-200 mb-1">选择派遣机器人</p>
                <p class="text-xs text-slate-500 mb-3">选择一台机器人前往 {{ incident.location }}</p>
              </div>
              <div class="space-y-2">
                <button
                  v-for="robot in availableRobots"
                  :key="robot.id"
                  @click="selectedRobot = robot"
                  :class="`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${selectedRobot?.id === robot.id ? 'border-sky-500/60 bg-sky-500/15' : 'border-white/8 bg-white/3 hover:bg-white/6'}`"
                >
                  <div :class="`w-10 h-10 rounded-xl flex items-center justify-center ${robotStatusColor(robot.status).bg} border shrink-0`">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="robotStatusColor(robot.status).text"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
                  </div>
                  <div class="flex-1 text-left">
                    <div class="text-sm font-semibold text-slate-200">{{ robot.name }}</div>
                    <div class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ robot.location }}
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <div :class="`text-xs font-medium ${robotStatusColor(robot.status).text}`">{{ getRobotStatusLabel(robot.status) }}</div>
                    <div class="text-xs text-slate-600 mt-0.5">⚡ {{ robot.battery }}%</div>
                  </div>
                  <svg v-if="selectedRobot?.id === robot.id" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-sky-400 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                </button>
              </div>
              <button
                @click="handleDispatch"
                :disabled="!selectedRobot"
                class="w-full py-4 rounded-2xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
                :style="{ background: selectedRobot ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'rgba(255,255,255,0.05)', color: 'white' }"
              >
                {{ selectedRobot ? `派遣 ${selectedRobot.name} 前往` : '请先选择机器人' }}
              </button>
            </div>

            <!-- 派遣中 -->
            <div v-else-if="step === 'dispatching'" class="flex flex-col items-center justify-center py-12 gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-sky-400 spin-anim"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <p class="text-slate-300 font-semibold">正在派遣 {{ selectedRobot?.name }}...</p>
              <p class="text-xs text-slate-500">机器人正在规划路径</p>
            </div>

            <!-- 完成 -->
            <div v-else-if="step === 'done'" class="flex flex-col items-center justify-center py-12 gap-4">
              <div class="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              </div>
              <p class="text-slate-200 font-bold text-lg">派遣成功</p>
              <p class="text-sm text-slate-400">{{ selectedRobot?.name }} 正前往 {{ incident.location }}</p>
              <button @click="emit('close')" class="mt-2 px-8 py-3 rounded-2xl bg-sky-500/15 border border-sky-500/25 text-sky-300 text-sm font-semibold">
                完成
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- 简易 Toast -->
  <Transition name="toast-fade">
    <div
      v-if="showToast"
      class="fixed top-16 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-2xl text-sm font-semibold text-white shadow-xl"
      style="background: oklch(0.2 0.04 240); border: 1px solid rgba(255,255,255,0.12)"
    >
      {{ toastMsg }}
      <div v-if="toastDesc" class="text-xs text-slate-400 mt-0.5 font-normal">{{ toastDesc }}</div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-slide-enter-active, .modal-slide-leave-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.modal-slide-enter-from, .modal-slide-leave-to { transform: translateY(100%); }

.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translate(-50%, -8px); }

.spin-anim { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
