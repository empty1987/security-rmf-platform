// ============================================================
// MOCK DATA — Security RMF Platform
// Simulates real-time robot fleet, tasks, alerts, and events
// ============================================================

export type RobotStatus = 'online' | 'patrolling' | 'responding' | 'charging' | 'offline' | 'warning';
export type TaskType = 'patrol' | 'respond' | 'guide' | 'inspect' | 'delivery';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type AlertLevel = 'info' | 'warning' | 'critical';

export interface Robot {
  id: string;
  name: string;
  model: string;
  status: RobotStatus;
  battery: number;
  location: string;
  floor: number;
  x: number; // percentage position on map
  y: number;
  currentTask?: string;
  speed: number; // km/h
  uptime: number; // hours today
  totalPatrols: number;
  lastSeen: string;
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedRobot?: string;
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

export interface PatrolRoute {
  id: string;
  name: string;
  waypoints: { x: number; y: number; name: string }[];
  floor: number;
  duration: number; // minutes
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
  shift: 'morning' | 'afternoon' | 'night';
  startTime: string;
  endTime: string;
  zone: string;
  status: 'active' | 'off' | 'break';
  avatar: string;
}

// ---- ROBOTS ----
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
    uptime: 8.2,
    totalPatrols: 16,
    lastSeen: '刚刚',
  },
];

// ---- TASKS ----
export const tasks: Task[] = [
  {
    id: 'TSK-001',
    type: 'patrol',
    title: 'A栋一楼例行巡逻',
    description: '按预设路线对A栋一楼进行例行安全巡检，覆盖大厅、走廊、消防通道',
    status: 'running',
    priority: 'medium',
    assignedRobot: 'RBT-001',
    location: 'A栋一楼',
    floor: 1,
    createdAt: '08:00',
    startedAt: '08:02',
    progress: 65,
  },
  {
    id: 'TSK-002',
    type: 'patrol',
    title: 'C栋二楼夜间巡逻',
    description: '对C栋二楼办公区域进行夜间安全巡检',
    status: 'running',
    priority: 'medium',
    assignedRobot: 'RBT-005',
    location: 'C栋二楼',
    floor: 2,
    createdAt: '22:00',
    startedAt: '22:05',
    progress: 40,
  },
  {
    id: 'TSK-003',
    type: 'respond',
    title: '紧急响应：B栋三楼异常',
    description: '传感器检测到B栋三楼走廊有异常活动，派遣机器人前往核查',
    status: 'running',
    priority: 'urgent',
    assignedRobot: 'RBT-002',
    location: 'B栋三楼',
    floor: 3,
    createdAt: '14:23',
    startedAt: '14:24',
    progress: 80,
  },
  {
    id: 'TSK-004',
    type: 'inspect',
    title: '地下停车场安全检查',
    description: '对D栋地下停车场进行定期安全检查，记录车辆信息',
    status: 'running',
    priority: 'low',
    assignedRobot: 'RBT-006',
    location: 'D栋地下停车场',
    floor: -1,
    createdAt: '13:00',
    startedAt: '13:05',
    progress: 90,
  },
  {
    id: 'TSK-005',
    type: 'guide',
    title: '访客引导：张总一行',
    description: '引导访客张总一行前往B栋会议室，预计3人',
    status: 'running',
    priority: 'medium',
    assignedRobot: 'RBT-003',
    location: '访客中心 → B栋会议室',
    floor: 1,
    createdAt: '14:00',
    startedAt: '14:15',
    progress: 30,
  },
  {
    id: 'TSK-006',
    type: 'patrol',
    title: 'A栋屋顶巡检',
    description: '对A栋屋顶设备区进行安全巡检',
    status: 'pending',
    priority: 'low',
    location: 'A栋屋顶',
    floor: 10,
    createdAt: '14:30',
    progress: 0,
  },
  {
    id: 'TSK-007',
    type: 'patrol',
    title: 'B栋一楼大厅巡逻',
    description: '完成B栋一楼大厅例行巡逻任务',
    status: 'completed',
    priority: 'medium',
    assignedRobot: 'RBT-001',
    location: 'B栋一楼',
    floor: 1,
    createdAt: '10:00',
    startedAt: '10:02',
    completedAt: '10:45',
    progress: 100,
  },
  {
    id: 'TSK-008',
    type: 'respond',
    title: '门禁异常响应',
    description: '处理E栋侧门门禁异常报警',
    status: 'completed',
    priority: 'high',
    assignedRobot: 'RBT-005',
    location: 'E栋侧门',
    floor: 1,
    createdAt: '11:30',
    startedAt: '11:31',
    completedAt: '11:52',
    progress: 100,
  },
];

// ---- ALERTS ----
export const alerts: Alert[] = [
  {
    id: 'ALT-001',
    level: 'critical',
    title: '区域入侵告警',
    description: 'B栋三楼走廊检测到非授权人员活动，已派遣RBT-002前往核查',
    location: 'B栋三楼',
    floor: 3,
    timestamp: '14:23:15',
    acknowledged: false,
    robotId: 'RBT-002',
  },
  {
    id: 'ALT-002',
    level: 'warning',
    title: '机器人电量低',
    description: 'RBT-006 电量仅剩11%，建议立即返回充电站',
    location: 'D栋地下停车场',
    floor: -1,
    timestamp: '14:20:03',
    acknowledged: false,
    robotId: 'RBT-006',
  },
  {
    id: 'ALT-003',
    level: 'warning',
    title: '门禁异常',
    description: 'C栋消防通道门禁传感器离线，请人工检查',
    location: 'C栋消防通道',
    floor: 2,
    timestamp: '14:15:42',
    acknowledged: true,
  },
  {
    id: 'ALT-004',
    level: 'info',
    title: '访客到访',
    description: '访客张总一行3人已通过前台登记，引导机器人已就位',
    location: '访客中心',
    floor: 1,
    timestamp: '14:12:00',
    acknowledged: true,
    robotId: 'RBT-003',
  },
  {
    id: 'ALT-005',
    level: 'info',
    title: '巡逻任务完成',
    description: 'RBT-001 完成A栋一楼第12次巡逻，未发现异常',
    location: 'A栋一楼',
    floor: 1,
    timestamp: '13:58:22',
    acknowledged: true,
    robotId: 'RBT-001',
  },
  {
    id: 'ALT-006',
    level: 'critical',
    title: '烟雾传感器触发',
    description: 'A栋二楼茶水间烟雾传感器触发，已通知消防系统',
    location: 'A栋二楼茶水间',
    floor: 2,
    timestamp: '12:45:11',
    acknowledged: true,
  },
];

// ---- PATROL ROUTES ----
export const patrolRoutes: PatrolRoute[] = [
  {
    id: 'RT-001',
    name: 'A栋一楼标准路线',
    waypoints: [
      { x: 20, y: 30, name: '大厅入口' },
      { x: 35, y: 30, name: '前台区域' },
      { x: 35, y: 55, name: '走廊A段' },
      { x: 20, y: 55, name: '消防通道' },
      { x: 20, y: 30, name: '大厅入口' },
    ],
    floor: 1,
    duration: 25,
    frequency: '每2小时',
    active: true,
  },
  {
    id: 'RT-002',
    name: 'B栋全层路线',
    waypoints: [
      { x: 55, y: 20, name: 'B栋入口' },
      { x: 70, y: 20, name: '电梯厅' },
      { x: 70, y: 45, name: '办公区' },
      { x: 55, y: 45, name: '会议室区' },
      { x: 55, y: 20, name: 'B栋入口' },
    ],
    floor: 1,
    duration: 35,
    frequency: '每3小时',
    active: true,
  },
  {
    id: 'RT-003',
    name: '地下停车场路线',
    waypoints: [
      { x: 75, y: 30, name: '入口坡道' },
      { x: 90, y: 30, name: 'P1区' },
      { x: 90, y: 50, name: 'P2区' },
      { x: 75, y: 50, name: 'P3区' },
      { x: 75, y: 30, name: '入口坡道' },
    ],
    floor: -1,
    duration: 40,
    frequency: '每4小时',
    active: false,
  },
];

// ---- VISITORS ----
export const visitors: Visitor[] = [
  {
    id: 'VIS-001',
    name: '张建国',
    company: '华远科技有限公司',
    host: '李总',
    purpose: '商务洽谈',
    checkIn: '14:15',
    status: 'inside',
    robotGuide: 'RBT-003',
  },
  {
    id: 'VIS-002',
    name: '王芳',
    company: '华远科技有限公司',
    host: '李总',
    purpose: '商务洽谈',
    checkIn: '14:15',
    status: 'inside',
    robotGuide: 'RBT-003',
  },
  {
    id: 'VIS-003',
    name: '陈明',
    company: '华远科技有限公司',
    host: '李总',
    purpose: '商务洽谈',
    checkIn: '14:15',
    status: 'inside',
    robotGuide: 'RBT-003',
  },
  {
    id: 'VIS-004',
    name: '刘海波',
    company: '政府采购中心',
    host: '赵经理',
    purpose: '设备验收',
    checkIn: '10:30',
    checkOut: '12:00',
    status: 'left',
  },
  {
    id: 'VIS-005',
    name: '孙晓燕',
    company: '安防设备公司',
    host: '技术部',
    purpose: '设备维护',
    checkIn: '09:00',
    checkOut: '11:30',
    status: 'left',
  },
];

// ---- GUARD SHIFTS ----
export const guardShifts: GuardShift[] = [
  { id: 'GRD-001', guardName: '李明', guardId: 'G001', shift: 'afternoon', startTime: '14:00', endTime: '22:00', zone: 'A栋', status: 'active', avatar: 'LM' },
  { id: 'GRD-002', guardName: '张伟', guardId: 'G002', shift: 'afternoon', startTime: '14:00', endTime: '22:00', zone: 'B栋', status: 'active', avatar: 'ZW' },
  { id: 'GRD-003', guardName: '王强', guardId: 'G003', shift: 'afternoon', startTime: '14:00', endTime: '22:00', zone: 'C栋', status: 'break', avatar: 'WQ' },
  { id: 'GRD-004', guardName: '刘洋', guardId: 'G004', shift: 'afternoon', startTime: '14:00', endTime: '22:00', zone: '停车场', status: 'active', avatar: 'LY' },
  { id: 'GRD-005', guardName: '陈浩', guardId: 'G005', shift: 'morning', startTime: '06:00', endTime: '14:00', zone: '门卫', status: 'off', avatar: 'CH' },
  { id: 'GRD-006', guardName: '赵磊', guardId: 'G006', shift: 'night', startTime: '22:00', endTime: '06:00', zone: 'A栋', status: 'off', avatar: 'ZL' },
];

// ---- STATISTICS ----
export const statistics = {
  totalRobots: 6,
  onlineRobots: 5,
  activePatrols: 4,
  todayAlerts: 6,
  criticalAlerts: 1,
  todayTasks: 8,
  completedTasks: 2,
  visitorsToday: 5,
  activeVisitors: 3,
  patrolCoverage: 94,
  systemUptime: 99.7,
};

// ---- HOURLY STATS (for charts) ----
export const hourlyStats = [
  { hour: '06:00', patrols: 2, alerts: 0, tasks: 2 },
  { hour: '07:00', patrols: 3, alerts: 1, tasks: 3 },
  { hour: '08:00', patrols: 4, alerts: 0, tasks: 4 },
  { hour: '09:00', patrols: 4, alerts: 1, tasks: 5 },
  { hour: '10:00', patrols: 3, alerts: 2, tasks: 4 },
  { hour: '11:00', patrols: 4, alerts: 1, tasks: 3 },
  { hour: '12:00', patrols: 2, alerts: 0, tasks: 2 },
  { hour: '13:00', patrols: 3, alerts: 0, tasks: 3 },
  { hour: '14:00', patrols: 4, alerts: 3, tasks: 5 },
];

// ---- TASK TYPE DISTRIBUTION ----
export const taskDistribution = [
  { name: '例行巡逻', value: 45, color: 'oklch(0.62 0.22 230)' },
  { name: '异常响应', value: 25, color: 'oklch(0.6 0.22 25)' },
  { name: '访客引导', value: 15, color: 'oklch(0.7 0.18 145)' },
  { name: '设施检查', value: 10, color: 'oklch(0.75 0.18 55)' },
  { name: '物品配送', value: 5, color: 'oklch(0.65 0.15 270)' },
];

// Helper functions
export function getRobotStatusLabel(status: RobotStatus): string {
  const map: Record<RobotStatus, string> = {
    online: '待命',
    patrolling: '巡逻中',
    responding: '响应中',
    charging: '充电中',
    offline: '离线',
    warning: '异常',
  };
  return map[status];
}

export function getTaskTypeLabel(type: TaskType): string {
  const map: Record<TaskType, string> = {
    patrol: '例行巡逻',
    respond: '异常响应',
    guide: '访客引导',
    inspect: '设施检查',
    delivery: '物品配送',
  };
  return map[type];
}

export function getTaskStatusLabel(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    pending: '待执行',
    running: '执行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  };
  return map[status];
}

export function getAlertLevelLabel(level: AlertLevel): string {
  const map: Record<AlertLevel, string> = {
    info: '通知',
    warning: '警告',
    critical: '紧急',
  };
  return map[level];
}
