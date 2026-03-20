// ============================================================
// MOCK DATA — Security RMF Platform (Business-Oriented Redesign)
// ============================================================

export type RobotStatus = 'online' | 'patrolling' | 'responding' | 'charging' | 'offline' | 'warning' | 'idle';
export type TaskType = 'patrol' | 'respond' | 'guide' | 'inspect' | 'delivery';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type AlertLevel = 'info' | 'warning' | 'critical';
export type IncidentLevel = 'urgent' | 'important' | 'normal';
export type IncidentStatus = 'open' | 'handling' | 'closed';

export interface Robot {
  id: string;
  name: string;
  model: string;
  status: RobotStatus;
  battery: number;
  location: string;
  floor: number;
  x: number;
  y: number;
  currentTask?: string;
  speed: number;
  uptime: number;
  totalPatrols: number;
  lastSeen: string;
  cameraFeed: string; // CDN url
  cameraScene: string;
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedRobot?: string;
  assignedGuard?: string;
  location: string;
  floor: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress: number;
}

export interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  description: string;
  location: string;
  floor: number;
  timestamp: string;
  acknowledged: boolean;
  robotId?: string;
}

export interface Incident {
  id: string;
  level: IncidentLevel;
  type: '可疑人员' | '设备故障' | '访客异常' | '入侵告警' | '火警' | '其他';
  title: string;
  description: string;
  location: string;
  floor: number;
  status: IncidentStatus;
  reportedBy: string;
  reportedAt: string;
  assignedRobotId?: string;
  assignedGuard?: string;
  resolvedAt?: string;
  note?: string;
}

export interface PatrolRoute {
  id: string;
  name: string;
  waypoints: { x: number; y: number; name: string }[];
  floor: number;
  duration: number;
  frequency: string;
  active: boolean;
}

export interface Visitor {
  id: string;
  name: string;
  company: string;
  host: string;
  purpose: string;
  checkIn: string;
  checkOut?: string;
  status: 'waiting' | 'inside' | 'left';
  robotGuide?: string;
}

export interface GuardShift {
  id: string;
  guardName: string;
  guardId: string;
  area: string;
  zone?: string; // alias for area
  shift?: string; // e.g. '白班' | '夜班'
  shiftStart: string;
  shiftEnd: string;
  status: 'on-duty' | 'off-duty' | 'break';
  tasksCompleted: number;
}

export interface Preset {
  id: string;
  name: string;
  icon: string;
  description: string;
  scenario: string;
  robotIds: string[];
  taskCount: number;
  estimatedDuration: string;
  status: 'idle' | 'running' | 'completed';
  lastUsed?: string;
  color: string;
  // 业务化扩展字段
  type?: 'patrol' | 'emergency' | 'visitor' | 'inspection';
  areas?: string[];
  robotCount?: number;
  isDefault?: boolean;
  estimatedDurationMin?: number;
}

// ---- 机器人数据 ----
export const robots: Robot[] = [
  {
    id: 'RBT-001',
    name: '巡逻一号',
    model: 'SecureBot X3',
    status: 'patrolling',
    battery: 87,
    location: 'A栋一楼大厅',
    floor: 1,
    x: 28,
    y: 42,
    currentTask: 'TSK-001',
    speed: 1.2,
    uptime: 6.5,
    totalPatrols: 12,
    lastSeen: '刚刚',
    cameraFeed: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-lobby-FRM4Q6FmYMxk3dsSBwyZMJ.webp',
    cameraScene: 'A栋大厅',
  },
  {
    id: 'RBT-002',
    name: '巡逻二号',
    model: 'SecureBot X3',
    status: 'responding',
    battery: 62,
    location: 'B栋三楼走廊',
    floor: 3,
    x: 58,
    y: 28,
    currentTask: 'TSK-003',
    speed: 1.8,
    uptime: 6.5,
    totalPatrols: 10,
    lastSeen: '刚刚',
    cameraFeed: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-corridor-B2fBPwLKXMEATuiRj7ZeNu.webp',
    cameraScene: 'B栋走廊',
  },
  {
    id: 'RBT-003',
    name: '引导机器人',
    model: 'GuideBot G2',
    status: 'online',
    battery: 95,
    location: '访客中心',
    floor: 1,
    x: 72,
    y: 65,
    currentTask: 'TSK-005',
    speed: 0.8,
    uptime: 4.2,
    totalPatrols: 0,
    lastSeen: '2分钟前',
    cameraFeed: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-gate-mE4APdMUCGAGz3JSVQqicF.webp',
    cameraScene: '访客中心',
  },
  {
    id: 'RBT-004',
    name: '巡逻三号',
    model: 'SecureBot X3',
    status: 'charging',
    battery: 23,
    location: '充电站 C区',
    floor: 1,
    x: 15,
    y: 78,
    speed: 0,
    uptime: 3.1,
    totalPatrols: 8,
    lastSeen: '5分钟前',
    cameraFeed: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-parking-ezPidMAk5iBv7x2hus9kw9.webp',
    cameraScene: 'C区充电站',
  },
  {
    id: 'RBT-005',
    name: '巡逻四号',
    model: 'SecureBot X5',
    status: 'patrolling',
    battery: 74,
    location: 'C栋二楼',
    floor: 2,
    x: 45,
    y: 55,
    currentTask: 'TSK-002',
    speed: 1.4,
    uptime: 7.0,
    totalPatrols: 14,
    lastSeen: '刚刚',
    cameraFeed: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-rooftop-P43YfMsL6trTtkoA5KSaVN.webp',
    cameraScene: 'C栋二楼',
  },
  {
    id: 'RBT-006',
    name: '巡逻五号',
    model: 'SecureBot X5',
    status: 'warning',
    battery: 11,
    location: 'D栋地下停车场',
    floor: -1,
    x: 82,
    y: 38,
    currentTask: 'TSK-004',
    speed: 0.6,
    uptime: 5.8,
    totalPatrols: 9,
    lastSeen: '刚刚',
    cameraFeed: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-parking-ezPidMAk5iBv7x2hus9kw9.webp',
    cameraScene: 'D栋停车场',
  },
];

// ---- 事件数据 ----
export const incidents: Incident[] = [
  {
    id: 'INC-001',
    level: 'urgent',
    type: '可疑人员',
    title: 'B栋三楼发现可疑人员徘徊',
    description: '监控发现一名陌生人在B栋三楼办公区反复徘徊，无人陪同，已超过20分钟。',
    location: 'B栋三楼走廊',
    floor: 3,
    status: 'handling',
    reportedBy: '巡逻二号',
    reportedAt: '10分钟前',
    assignedRobotId: 'RBT-002',
    assignedGuard: '张明',
  },
  {
    id: 'INC-002',
    level: 'important',
    type: '入侵告警',
    title: 'D栋停车场围栏传感器触发',
    description: '地下停车场东侧围栏振动传感器触发，疑似有人翻越，已派机器人前往核查。',
    location: 'D栋地下停车场',
    floor: -1,
    status: 'handling',
    reportedBy: '系统自动',
    reportedAt: '25分钟前',
    assignedRobotId: 'RBT-006',
  },
  {
    id: 'INC-003',
    level: 'normal',
    type: '访客异常',
    title: '访客超时未离场',
    description: '访客李先生预约至16:00，现已17:30仍在园区内，需确认情况。',
    location: '访客中心',
    floor: 1,
    status: 'open',
    reportedBy: '系统自动',
    reportedAt: '30分钟前',
  },
  {
    id: 'INC-004',
    level: 'urgent',
    type: '设备故障',
    title: 'A栋大门门禁系统离线',
    description: 'A栋正门门禁控制器失去响应，现处于常开状态，存在安全隐患。',
    location: 'A栋正门',
    floor: 1,
    status: 'open',
    reportedBy: '系统自动',
    reportedAt: '5分钟前',
  },
  {
    id: 'INC-005',
    level: 'normal',
    type: '其他',
    title: '员工遗失工牌申报',
    description: '研发部员工王芳申报工牌遗失，需临时授权并挂失原卡。',
    location: 'C栋二楼',
    floor: 2,
    status: 'closed',
    reportedBy: '王芳',
    reportedAt: '2小时前',
    resolvedAt: '1小时前',
    note: '已临时授权新卡，原卡已挂失。',
  },
];

// ---- 任务预案 ----
export const presets: Preset[] = [
  {
    id: 'PST-001',
    name: '夜间全面巡逻',
    icon: '🌙',
    description: '启动所有可用机器人按预设路线对全园区进行系统性夜间巡逻，覆盖所有楼层和停车场。',
    scenario: '每日22:00自动触发，也可手动启动',
    robotIds: ['RBT-001', 'RBT-002', 'RBT-005', 'RBT-006'],
    taskCount: 8,
    estimatedDuration: '剠4小时',
    status: 'idle',
    lastUsed: '昨晙22:00',
    color: '#6366f1',
    type: 'patrol',
    areas: ['A栋', 'B栋', 'C栋', '停车场'],
    robotCount: 4,
    isDefault: true,
    estimatedDurationMin: 120,
  },
  {
    id: 'PST-002',
    name: '访客高峰引导',
    icon: '👥',
    description: '工作日上午9-11点及下午14-16点，引导机器人在大厅待命，自动迎接并引导访客至目的地。',
    scenario: '工作日访客高峰时段',
    robotIds: ['RBT-003'],
    taskCount: 3,
    estimatedDuration: '持续运行',
    status: 'running',
    lastUsed: '今天 09:00',
    color: '#0ea5e9',
    type: 'visitor',
    areas: ['A栋大厅', '大门岗'],
    robotCount: 1,
    isDefault: true,
    estimatedDurationMin: 240,
  },
  {
    id: 'PST-003',
    name: '紧急封锁模式',
    icon: '🔒',
    description: '发生安全事件时，所有机器人立即前往各楼层出入口就位，配合人员实施封锁管控。',
    scenario: '安全事件应急响应',
    robotIds: ['RBT-001', 'RBT-002', 'RBT-003', 'RBT-005'],
    taskCount: 6,
    estimatedDuration: '持续至手动解除',
    status: 'idle',
    color: '#ef4444',
    type: 'emergency',
    areas: ['A栋', 'B栋', 'C栋', 'D栋', '大门岗'],
    robotCount: 4,
    estimatedDurationMin: 60,
  },
  {
    id: 'PST-004',
    name: '火警疏散协助',
    icon: '🚨',
    description: '火警触发后，机器人自动前往各疏散通道引导人员撤离，并实时回传现场画面。',
    scenario: '消防系统联动触发',
    robotIds: ['RBT-001', 'RBT-002', 'RBT-003', 'RBT-005', 'RBT-006'],
    taskCount: 10,
    estimatedDuration: '持续至警报解除',
    status: 'idle',
    color: '#f97316',
    type: 'emergency',
    areas: ['A栋', 'B栋', 'C栋', 'D栋', '大门岗', '停车场'],
    robotCount: 5,
    estimatedDurationMin: 30,
  },
  {
    id: 'PST-005',
    name: '节假日値守',
    icon: '🏖️',
    description: '节假日期间减少人员配置，机器人加密巡逻频次，重点覆盖出入口、停车场和设备间。',
    scenario: '法定节假日',
    robotIds: ['RBT-001', 'RBT-005', 'RBT-006'],
    taskCount: 5,
    estimatedDuration: '全天运行',
    status: 'idle',
    lastUsed: '上周六',
    color: '#10b981',
    type: 'inspection',
    areas: ['A栋', '停车场', '大门岗', '设备间'],
    robotCount: 3,
    isDefault: true,
    estimatedDurationMin: 480,
  },
  {
    id: 'PST-006',
    name: '重要会议保障',
    icon: '🎯',
    type: 'inspection',
    areas: ['会议室区', 'A栋二楼'],
    robotCount: 2,
    estimatedDurationMin: 180,
    description: '重要会议期间，机器人在会议室周边区域加强巡逻，并对非授权人员进行预警提示。',
    scenario: '重要会议前手动启动',
    robotIds: ['RBT-001', 'RBT-003'],
    taskCount: 4,
    estimatedDuration: '会议期间',
    status: 'idle',
    color: '#8b5cf6',
  },
];

// ---- 任务数据 ----
export const tasks: Task[] = [
  {
    id: 'TSK-001',
    type: 'patrol',
    title: 'A栋一楼例行巡逻',
    description: '按预设路线对A栋一楼进行例行安全巡逻，重点检查出入口和消防通道。',
    status: 'running',
    priority: 'medium',
    assignedRobot: 'RBT-001',
    assignedGuard: '李伟',
    location: 'A栋一楼',
    floor: 1,
    createdAt: '08:00',
    startedAt: '08:05',
    progress: 65,
  },
  {
    id: 'TSK-002',
    type: 'patrol',
    title: 'C栋二楼安全检查',
    description: '对C栋二楼办公区进行安全检查，确认人员离场后的门窗状态。',
    status: 'running',
    priority: 'medium',
    assignedRobot: 'RBT-005',
    location: 'C栋二楼',
    floor: 2,
    createdAt: '17:30',
    startedAt: '17:35',
    progress: 40,
  },
  {
    id: 'TSK-003',
    type: 'respond',
    title: '响应B栋三楼可疑人员',
    description: '前往B栋三楼核查可疑人员情况，配合安保人员处置。',
    status: 'running',
    priority: 'urgent',
    assignedRobot: 'RBT-002',
    assignedGuard: '张明',
    location: 'B栋三楼',
    floor: 3,
    createdAt: '17:20',
    startedAt: '17:21',
    progress: 80,
  },
  {
    id: 'TSK-004',
    type: 'inspect',
    title: '停车场围栏告警核查',
    description: '前往D栋停车场东侧核查围栏告警情况。',
    status: 'running',
    priority: 'high',
    assignedRobot: 'RBT-006',
    location: 'D栋地下停车场',
    floor: -1,
    createdAt: '17:05',
    startedAt: '17:06',
    progress: 55,
  },
  {
    id: 'TSK-005',
    type: 'guide',
    title: '引导访客至会议室',
    description: '引导访客李总一行前往A栋三楼会议室301。',
    status: 'running',
    priority: 'medium',
    assignedRobot: 'RBT-003',
    location: '访客中心→A栋三楼',
    floor: 1,
    createdAt: '17:00',
    startedAt: '17:02',
    progress: 90,
  },
  {
    id: 'TSK-006',
    type: 'patrol',
    title: '夜间B栋全楼巡逻',
    description: '夜间对B栋全楼进行系统性安全巡逻。',
    status: 'pending',
    priority: 'medium',
    location: 'B栋全楼',
    floor: 1,
    createdAt: '17:30',
    progress: 0,
  },
];

// ---- 告警数据 ----
export const alerts: Alert[] = [
  {
    id: 'ALT-001',
    level: 'critical',
    title: 'B栋三楼发现可疑人员',
    description: '巡逻二号在B栋三楼检测到未授权人员，已触发告警。',
    location: 'B栋三楼走廊',
    floor: 3,
    timestamp: '10分钟前',
    acknowledged: false,
    robotId: 'RBT-002',
  },
  {
    id: 'ALT-002',
    level: 'critical',
    title: 'A栋门禁系统离线',
    description: 'A栋正门门禁控制器失去响应，处于常开状态。',
    location: 'A栋正门',
    floor: 1,
    timestamp: '5分钟前',
    acknowledged: false,
  },
  {
    id: 'ALT-003',
    level: 'warning',
    title: '巡逻五号电量严重不足',
    description: '巡逻五号电量仅剩11%，仍在执行任务，建议立即返回充电。',
    location: 'D栋停车场',
    floor: -1,
    timestamp: '15分钟前',
    acknowledged: false,
    robotId: 'RBT-006',
  },
  {
    id: 'ALT-004',
    level: 'warning',
    title: '停车场围栏振动告警',
    description: 'D栋停车场东侧围栏振动传感器触发，疑似有人翻越。',
    location: 'D栋停车场东侧',
    floor: -1,
    timestamp: '25分钟前',
    acknowledged: true,
    robotId: 'RBT-006',
  },
  {
    id: 'ALT-005',
    level: 'info',
    title: '巡逻三号充电完成',
    description: '巡逻三号已充电至23%，可重新投入使用。',
    location: '充电站 C区',
    floor: 1,
    timestamp: '30分钟前',
    acknowledged: true,
    robotId: 'RBT-004',
  },
];

// ---- 巡逻路线 ----
export const patrolRoutes: PatrolRoute[] = [
  {
    id: 'RT-001',
    name: 'A栋一楼标准路线',
    waypoints: [
      { x: 20, y: 30, name: '正门' },
      { x: 40, y: 30, name: '大厅' },
      { x: 60, y: 30, name: '电梯厅' },
      { x: 60, y: 60, name: '消防通道' },
      { x: 20, y: 60, name: '侧门' },
    ],
    floor: 1,
    duration: 15,
    frequency: '每2小时',
    active: true,
  },
  {
    id: 'RT-002',
    name: 'B栋全楼路线',
    waypoints: [
      { x: 25, y: 25, name: 'B栋入口' },
      { x: 50, y: 25, name: 'B栋大厅' },
      { x: 75, y: 25, name: 'B栋后门' },
      { x: 75, y: 75, name: 'B栋三楼' },
      { x: 25, y: 75, name: 'B栋楼梯' },
    ],
    floor: 1,
    duration: 30,
    frequency: '每3小时',
    active: true,
  },
];

// ---- 访客数据 ----
export const visitors: Visitor[] = [
  {
    id: 'VIS-001',
    name: '李总',
    company: '华为技术有限公司',
    host: '研发部 王总监',
    purpose: '技术合作洽谈',
    checkIn: '14:30',
    status: 'inside',
    robotGuide: 'RBT-003',
  },
  {
    id: 'VIS-002',
    name: '张先生',
    company: '个人',
    host: '行政部 陈主任',
    purpose: '设备维修',
    checkIn: '09:00',
    checkOut: '11:30',
    status: 'left',
  },
  {
    id: 'VIS-003',
    name: '王芳团队（3人）',
    company: '审计事务所',
    host: '财务部 刘总',
    purpose: '年度审计',
    checkIn: '10:00',
    status: 'inside',
  },
];

// ---- 保安排班 ----
export const guardShifts: GuardShift[] = [
  { id: 'GS-001', guardName: '张明', guardId: 'G001', area: 'A栋+B栋', zone: 'A栋+B栋', shift: 'morning', shiftStart: '08:00', shiftEnd: '20:00', status: 'on-duty', tasksCompleted: 5 },
  { id: 'GS-002', guardName: '李伟', guardId: 'G002', area: 'C栋+D栋', zone: 'C栋+D栋', shift: 'morning', shiftStart: '08:00', shiftEnd: '20:00', status: 'on-duty', tasksCompleted: 3 },
  { id: 'GS-003', guardName: '王强', guardId: 'G003', area: '停车场', zone: '停车场', shift: 'afternoon', shiftStart: '14:00', shiftEnd: '22:00', status: 'break', tasksCompleted: 4 },
  { id: 'GS-004', guardName: '刘洋', guardId: 'G004', area: '大门岗', zone: '大门岗', shift: 'afternoon', shiftStart: '14:00', shiftEnd: '22:00', status: 'on-duty', tasksCompleted: 8 },
  { id: 'GS-005', guardName: '陈磊', guardId: 'G005', area: 'A栋+B栋', zone: 'A栋+B栋', shift: 'night', shiftStart: '22:00', shiftEnd: '06:00', status: 'off-duty', tasksCompleted: 0 },
  { id: 'GS-006', guardName: '赵鑫', guardId: 'G006', area: 'C栋+D栋', zone: 'C栋+D栋', shift: 'night', shiftStart: '22:00', shiftEnd: '06:00', status: 'off-duty', tasksCompleted: 0 },
];

// ---- 工具函数 ----
export function getRobotStatusLabel(status: RobotStatus): string {
  const map: Record<RobotStatus, string> = {
    online: '待命',
    patrolling: '巡逻中',
    responding: '响应中',
    charging: '充电中',
    offline: '离线',
    warning: '需关注',
    idle: '空闲',
  };
  return map[status] ?? status;
}

export function getTaskStatusLabel(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    pending: '待开始',
    running: '进行中',
    completed: '已完成',
    failed: '已失败',
    cancelled: '已取消',
  };
  return map[status] ?? status;
}

export function getAlertLevelLabel(level: AlertLevel): string {
  const map: Record<AlertLevel, string> = {
    info: '提示',
    warning: '警告',
    critical: '紧急',
  };
  return map[level] ?? level;
}

export function getIncidentLevelLabel(level: IncidentLevel): string {
  const map: Record<IncidentLevel, string> = {
    urgent: '紧急',
    important: '重要',
    normal: '一般',
  };
  return map[level] ?? level;
}

export function getIncidentStatusLabel(status: IncidentStatus): string {
  const map: Record<IncidentStatus, string> = {
    open: '待处置',
    handling: '处置中',
    closed: '已关闭',
  };
  return map[status] ?? status;
}

// ---- 兼容旧页面的导出 ----
export const statistics = {
  totalRobots: robots.length,
  onlineRobots: robots.filter(r => r.status !== 'offline').length,
  activePatrols: robots.filter(r => r.status === 'patrolling').length,
  todayAlerts: alerts.length,
  resolvedAlerts: alerts.filter(a => a.acknowledged).length,
  todayVisitors: visitors.length,
  coverageRate: 94,
  patrolDistance: 28.6,
  systemUptime: '99.8%',
  todayTasks: tasks.length,
  patrolCoverage: 94,
  activeVisitors: visitors.filter(v => v.status === 'inside').length,
};

export const taskDistribution = [
  { name: '例行巡逻', value: 45, color: '#38bdf8' },
  { name: '告警响应', value: 25, color: '#f87171' },
  { name: '访客引导', value: 15, color: '#a78bfa' },
  { name: '安全检查', value: 10, color: '#34d399' },
  { name: '其他', value: 5, color: '#94a3b8' },
];

export const hourlyStats = [
  { hour: '00:00', alerts: 1, patrols: 3 },
  { hour: '02:00', alerts: 0, patrols: 3 },
  { hour: '04:00', alerts: 0, patrols: 3 },
  { hour: '06:00', alerts: 1, patrols: 4 },
  { hour: '08:00', alerts: 2, patrols: 5 },
  { hour: '10:00', alerts: 3, patrols: 6 },
  { hour: '12:00', alerts: 1, patrols: 5 },
  { hour: '14:00', alerts: 2, patrols: 6 },
  { hour: '16:00', alerts: 4, patrols: 6 },
  { hour: '18:00', alerts: 5, patrols: 5 },
  { hour: '20:00', alerts: 2, patrols: 4 },
  { hour: '22:00', alerts: 1, patrols: 3 },
];

export function getTaskTypeLabel(type: TaskType): string {
  const map: Record<TaskType, string> = {
    patrol: '例行巡逻',
    respond: '告警响应',
    guide: '访客引导',
    inspect: '安全检查',
    delivery: '物品配送',
  };
  return map[type] ?? type;
}
