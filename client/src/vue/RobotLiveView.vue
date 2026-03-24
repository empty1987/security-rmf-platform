<script setup lang="ts">
// ============================================================
// RobotLiveView.vue — 机器人实时画面页（Vue 3 SFC）
// 从 RobotLiveView.tsx 迁移，保持布局、样式、功能完全一致
// ============================================================
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { robots, getRobotStatusLabel, type Robot } from '@/lib/mockData'

// ---- Props ----
const props = defineProps<{
  initialRobotId?: string
}>()
const emit = defineEmits<{
  back: []
}>()

// ---- 摄像头画面数据 ----
const ROBOT_CAMERA_FEEDS: Record<string, { url: string; scene: string; nightVision: boolean }> = {
  'RBT-001': {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-lobby-FRM4Q6FmYMxk3dsSBwyZMJ.webp',
    scene: '大堂正面',
    nightVision: false,
  },
  'RBT-002': {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-corridor-B2fBPwLKXMEATuiRj7ZeNu.webp',
    scene: '走廊巡逻',
    nightVision: true,
  },
  'RBT-003': {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-gate-mE4APdMUCGAGz3JSVQqicF.webp',
    scene: '门禁入口',
    nightVision: true,
  },
  'RBT-004': {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-parking-ezPidMAk5iBv7x2hus9kw9.webp',
    scene: '地下停车场',
    nightVision: false,
  },
  'RBT-005': {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-rooftop-P43YfMsL6trTtkoA5KSaVN.webp',
    scene: '楼顶巡逻',
    nightVision: false,
  },
  'RBT-006': {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-parking-ezPidMAk5iBv7x2hus9kw9.webp',
    scene: '停车场 D区',
    nightVision: false,
  },
}

const onlineRobots = robots.filter(r => r.status !== 'offline')

function statusColor(status: Robot['status']) {
  switch (status) {
    case 'patrolling': return { dot: '#38bdf8', text: 'text-sky-400', bg: 'bg-sky-500/20 border-sky-500/30' }
    case 'responding': return { dot: '#fb923c', text: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30' }
    case 'online': return { dot: '#34d399', text: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' }
    case 'charging': return { dot: '#a78bfa', text: 'text-violet-400', bg: 'bg-violet-500/20 border-violet-500/30' }
    case 'warning': return { dot: '#fbbf24', text: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' }
    default: return { dot: '#64748b', text: 'text-slate-400', bg: 'bg-slate-500/20 border-slate-500/30' }
  }
}

// ---- 状态 ----
function getInitialIdx() {
  if (props.initialRobotId) {
    const idx = onlineRobots.findIndex(r => r.id === props.initialRobotId)
    return idx >= 0 ? idx : 0
  }
  return 0
}
const selectedIdx = ref(getInitialIdx())

const currentTime = ref(new Date())
const signalStrength = ref(4)
const frameCount = ref(0)

const robot = computed(() => onlineRobots[selectedIdx.value])
const feed = computed(() => ROBOT_CAMERA_FEEDS[robot.value.id] ?? ROBOT_CAMERA_FEEDS['RBT-001'])
const sc = computed(() => statusColor(robot.value.status))

// ---- 定时器 ----
let clockTimer: ReturnType<typeof setInterval>
let frameTimer: ReturnType<typeof setInterval>

onMounted(() => {
  clockTimer = setInterval(() => { currentTime.value = new Date() }, 1000)
  frameTimer = setInterval(() => {
    frameCount.value = (frameCount.value + 1) % 10000
    if (Math.random() < 0.1) signalStrength.value = Math.floor(Math.random() * 2) + 3
  }, 100)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(frameTimer)
})

// ---- 方法 ----
function prevRobot() {
  selectedIdx.value = (selectedIdx.value - 1 + onlineRobots.length) % onlineRobots.length
}
function nextRobot() {
  selectedIdx.value = (selectedIdx.value + 1) % onlineRobots.length
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('zh-CN', { hour12: false })
}
function padFrame(n: number) {
  return String(n).padStart(5, '0')
}
</script>

<template>
  <div class="flex flex-col h-full" style="background: oklch(0.07 0.02 240)">
    <!-- 顶部导航 -->
    <div class="flex items-center justify-between px-4 py-3 shrink-0">
      <button
        @click="emit('back')"
        class="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        <span class="text-sm">返回</span>
      </button>
      <div class="text-sm font-semibold text-slate-200 font-display">实时画面</div>
      <!-- 信号强度 -->
      <div class="flex items-center gap-1.5">
        <div
          v-for="i in [1,2,3,4]"
          :key="i"
          class="rounded-sm transition-colors"
          :style="{
            width: '3px',
            height: (4 + i * 2) + 'px',
            background: i <= signalStrength ? '#38bdf8' : 'rgba(255,255,255,0.12)',
          }"
        />
      </div>
    </div>

    <!-- 主摄像头画面 -->
    <div class="relative mx-4 rounded-2xl overflow-hidden shrink-0" style="aspect-ratio: 16/9">
      <Transition name="cam-fade" mode="out-in">
        <img
          :key="robot.id"
          :src="feed.url"
          :alt="`${robot.name} 实时画面`"
          class="w-full h-full object-cover"
        />
      </Transition>

      <!-- 扫描线覆盖层 -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <!-- 扫描线 -->
        <div
          class="absolute inset-0"
          style="background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)"
        />
        <!-- 移动扫描条 -->
        <div class="scan-bar absolute left-0 right-0 h-8" style="background: linear-gradient(to bottom, transparent, rgba(56,189,248,0.06), transparent)" />
        <!-- 四角 HUD 框 -->
        <div class="absolute w-5 h-5 border-t-2 border-l-2 rounded-tl-lg border-sky-400/60 top-2 left-2" />
        <div class="absolute w-5 h-5 border-t-2 border-r-2 rounded-tr-lg border-sky-400/60 top-2 right-2" />
        <div class="absolute w-5 h-5 border-b-2 border-l-2 rounded-bl-lg border-sky-400/60 bottom-2 left-2" />
        <div class="absolute w-5 h-5 border-b-2 border-r-2 rounded-br-lg border-sky-400/60 bottom-2 right-2" />
      </div>

      <!-- 夜视色调叠加 -->
      <div
        v-if="feed.nightVision"
        class="absolute inset-0 pointer-events-none"
        style="background: rgba(0,40,20,0.25); mix-blend-mode: multiply"
      />

      <!-- 左上：REC + 时间戳 -->
      <div class="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-none">
        <div class="flex items-center gap-1 rec-blink">
          <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444"><circle cx="12" cy="12" r="10"/></svg>
          <span class="text-xs font-mono text-red-400 font-bold">REC</span>
        </div>
        <span class="text-xs font-mono text-green-400/80">{{ formatTime(currentTime) }}</span>
      </div>

      <!-- 右上：机器人 ID + 场景 -->
      <div class="absolute top-2.5 right-3 text-right pointer-events-none">
        <div class="text-xs font-mono text-green-400/80">{{ robot.id }}</div>
        <div class="text-xs text-slate-400/80">{{ feed.scene }}</div>
      </div>

      <!-- 左下：电量 -->
      <div class="absolute bottom-2.5 left-3 flex items-center gap-1.5 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="robot.battery < 20 ? 'text-red-400' : 'text-amber-400'"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span class="text-xs font-mono text-green-400/80">BAT {{ robot.battery }}%</span>
      </div>

      <!-- 右下：帧计数 -->
      <div class="absolute bottom-2.5 right-3 pointer-events-none">
        <span class="text-xs font-mono text-green-400/50">FRAME {{ padFrame(frameCount) }}</span>
      </div>

      <!-- warning 状态红框闪烁 -->
      <div
        v-if="robot.status === 'warning'"
        class="absolute inset-0 border-2 border-red-500/60 rounded-2xl pointer-events-none warning-blink"
      />

      <!-- 左右切换箭头 -->
      <button
        @click="prevRobot"
        class="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <button
        @click="nextRobot"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>

    <!-- 机器人信息卡 -->
    <Transition name="info-fade" mode="out-in">
      <div
        :key="robot.id"
        class="mx-4 mt-3 rounded-xl border border-white/8 p-3.5 shrink-0"
        style="background: oklch(0.145 0.025 240)"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-sky-400"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="font-semibold text-slate-100 text-sm font-display">{{ robot.name }}</span>
              <span :class="`text-xs px-1.5 py-0.5 rounded border ${sc.bg} ${sc.text}`">
                {{ getRobotStatusLabel(robot.status) }}
              </span>
            </div>
            <div class="text-xs text-slate-500 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ robot.location }}
            </div>
          </div>
        </div>

        <!-- 数据指标 -->
        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="item in [
              { label: '电量', value: robot.battery + '%', color: robot.battery < 20 ? 'text-red-400' : robot.battery < 50 ? 'text-amber-400' : 'text-emerald-400' },
              { label: '速度', value: robot.speed + 'km/h', color: 'text-sky-400' },
              { label: '今日巡逻', value: robot.totalPatrols + '次', color: 'text-violet-400' },
            ]"
            :key="item.label"
            class="text-center py-2 rounded-xl border border-white/5"
            style="background: oklch(0.12 0.02 240)"
          >
            <div :class="`text-sm font-bold font-display ${item.color}`">{{ item.value }}</div>
            <div class="text-xs text-slate-600 mt-0.5">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 底部缩略图导航 -->
    <div class="flex gap-2 px-4 mt-3 overflow-x-auto pb-2 shrink-0" style="scrollbar-width: none">
      <button
        v-for="(r, idx) in onlineRobots"
        :key="r.id"
        @click="selectedIdx = idx"
        :class="`relative shrink-0 rounded-xl overflow-hidden transition-all ${selectedIdx === idx ? 'ring-2 ring-sky-400' : 'opacity-50 hover:opacity-75'}`"
        style="width: 56px; height: 40px"
      >
        <img
          :src="ROBOT_CAMERA_FEEDS[r.id]?.url ?? ROBOT_CAMERA_FEEDS['RBT-001'].url"
          :alt="r.name"
          class="w-full h-full object-cover"
        />
        <div
          class="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-black/40"
          :style="{ background: statusColor(r.status).dot }"
        />
      </button>
    </div>

    <!-- 指示点 -->
    <div class="flex justify-center gap-1.5 mt-2 mb-1 shrink-0">
      <div
        v-for="(_, idx) in onlineRobots"
        :key="idx"
        :class="`rounded-full transition-all ${selectedIdx === idx ? 'w-4 h-1.5 bg-sky-400' : 'w-1.5 h-1.5 bg-white/20'}`"
      />
    </div>
  </div>
</template>

<style scoped>
/* 摄像头画面切换动效 */
.cam-fade-enter-active,
.cam-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.cam-fade-enter-from { opacity: 0; transform: scale(1.03); }
.cam-fade-leave-to   { opacity: 0; transform: scale(0.97); }

/* 信息卡切换动效 */
.info-fade-enter-active,
.info-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.info-fade-enter-from { opacity: 0; transform: translateY(8px); }
.info-fade-leave-to   { opacity: 0; transform: translateY(-8px); }

/* REC 闪烁 */
.rec-blink {
  animation: recBlink 1.2s ease-in-out infinite;
}
@keyframes recBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* warning 红框闪烁 */
.warning-blink {
  animation: warnBlink 0.8s ease-in-out infinite;
}
@keyframes warnBlink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

/* 扫描条动效 */
.scan-bar {
  animation: scanMove 3s linear infinite;
}
@keyframes scanMove {
  from { top: 0%; }
  to   { top: 100%; }
}
</style>
