// miniappData.ts — 小程序预览共享数据层

export interface Robot {
  id: string; name: string; model: string;
  status: 'patrolling' | 'responding' | 'online' | 'charging' | 'warning' | 'offline';
  battery: number; speed: number;
  location: string; zone: string;
  totalPatrols: number; todayMileage: number; todayAlerts: number;
  lastSeen: string; cameraFeed: string; currentTask: string;
}

export interface Incident {
  id: string; title: string; level: 'urgent' | 'important' | 'normal';
  status: 'open' | 'handling' | 'closed';
  location: string; reportedBy: string; reportedAt: string;
  assignedRobotId?: string; description?: string;
}

export interface Task {
  id: string; title: string;
  type: 'patrol' | 'inspection' | 'guide' | 'response';
  status: 'running' | 'pending' | 'completed';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  progress: number; location: string; assignedRobot: string;
  startTime: string; endTime: string; description: string;
  routeMode?: string; waypoints?: string[];
}

export const robots: Robot[] = [
  {
    id: 'RBT-001', name: '巡逻一号', model: 'PatrolBot X3',
    status: 'patrolling', battery: 78, speed: 1.2,
    location: 'A栋一楼大堂', zone: 'A区',
    totalPatrols: 12, todayMileage: 8.6, todayAlerts: 2,
    lastSeen: '2分钟前',
    cameraFeed: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-lobby-FRM4Q6FmYMxk3dsSBwyZMJ.webp',
    currentTask: '例行巡逻 - A区',
  },
  {
    id: 'RBT-002', name: '巡逻二号', model: 'PatrolBot X3',
    status: 'responding', battery: 45, speed: 2.1,
    location: 'B栋走廊3F', zone: 'B区',
    totalPatrols: 8, todayMileage: 5.2, todayAlerts: 1,
    lastSeen: '刚刚',
    cameraFeed: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-corridor-B2fBPwLKXMEATuiRj7ZeNu.webp',
    currentTask: '响应告警 - B区3楼',
  },
  {
    id: 'RBT-003', name: '门卫机器人', model: 'GuardBot G2',
    status: 'online', battery: 92, speed: 0,
    location: '南门入口', zone: '门禁区',
    totalPatrols: 0, todayMileage: 0.8, todayAlerts: 0,
    lastSeen: '刚刚',
    cameraFeed: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-gate-mE4APdMUCGAGz3JSVQqicF.webp',
    currentTask: '门禁值守',
  },
  {
    id: 'RBT-004', name: '停车场巡逻', model: 'PatrolBot X3',
    status: 'warning', battery: 18, speed: 0.8,
    location: 'B2停车场', zone: '地下区',
    totalPatrols: 5, todayMileage: 3.1, todayAlerts: 3,
    lastSeen: '5分钟前',
    cameraFeed: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-parking-JLBVqhVJLBVqhVJLBVqhV.webp',
    currentTask: '停车场巡逻',
  },
  {
    id: 'RBT-005', name: '楼顶监控', model: 'AerialBot A1',
    status: 'charging', battery: 35, speed: 0,
    location: '充电桩 #3', zone: '顶层',
    totalPatrols: 3, todayMileage: 2.0, todayAlerts: 0,
    lastSeen: '20分钟前',
    cameraFeed: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448343701/HFYbqWehiYBEtoszsN67kM/cam-rooftop-XYZ123ABC456DEF789.webp',
    currentTask: '充电中',
  },
];

export const incidents: Incident[] = [
  { id: 'INC-001', title: 'B区3楼发现可疑人员', level: 'urgent', status: 'handling', location: 'B栋3楼走廊', reportedBy: '张保安', reportedAt: '14:32', assignedRobotId: 'RBT-002', description: '发现一名陌生人在走廊徘徊，无访客证件' },
  { id: 'INC-002', title: '南门闸机故障', level: 'important', status: 'open', location: '南门入口', reportedBy: '李保安', reportedAt: '13:58', description: '南门1号闸机无法正常开启' },
  { id: 'INC-003', title: '停车场B2区车辆刮擦', level: 'normal', status: 'open', location: 'B2停车场', reportedBy: '系统告警', reportedAt: '13:21', description: '监控发现车辆碰撞事件' },
  { id: 'INC-004', title: 'A栋消防通道占用', level: 'important', status: 'open', location: 'A栋1楼消防通道', reportedBy: '王保安', reportedAt: '12:45', description: '有车辆停放在消防通道' },
  { id: 'INC-005', title: '访客超时未离场', level: 'normal', status: 'closed', location: 'C栋会议室', reportedBy: '前台', reportedAt: '11:30', description: '访客预约时间已过，仍在园区内' },
];

export const tasks: Task[] = [
  { id: 'TASK-001', title: 'A区全域例行巡逻', type: 'patrol', status: 'running', priority: 'medium', progress: 65, location: 'A区全域', assignedRobot: 'RBT-001', startTime: '14:00', endTime: '16:00', description: '例行巡逻，重点关注A栋出入口', routeMode: 'loop', waypoints: ['A栋大门', 'A栋走廊', 'A栋后门'] },
  { id: 'TASK-002', title: 'B区响应告警', type: 'response', status: 'running', priority: 'urgent', progress: 30, location: 'B栋3楼', assignedRobot: 'RBT-002', startTime: '14:32', endTime: '', description: '响应B区3楼可疑人员告警' },
  { id: 'TASK-003', title: '南门访客引导', type: 'guide', status: 'pending', priority: 'low', progress: 0, location: '南门入口', assignedRobot: 'RBT-003', startTime: '15:00', endTime: '15:30', description: '引导15:00预约访客前往C栋' },
  { id: 'TASK-004', title: '停车场夜间巡逻', type: 'patrol', status: 'pending', priority: 'medium', progress: 0, location: 'B1-B2停车场', assignedRobot: 'RBT-004', startTime: '18:00', endTime: '22:00', description: '停车场夜间安全巡逻' },
  { id: 'TASK-005', title: 'A区设备检查', type: 'inspection', status: 'completed', priority: 'high', progress: 100, location: 'A区机房', assignedRobot: 'RBT-001', startTime: '09:00', endTime: '10:30', description: '定期设备巡检' },
];

// 工具函数
export const getRobotStatusLabel = (s: string) => ({ patrolling: '巡逻中', responding: '响应中', online: '待命', charging: '充电中', warning: '需关注', offline: '离线' }[s] || s);
export const getRobotStatusClass = (s: string) => ({ patrolling: 'sky', responding: 'amber', online: 'success', charging: 'violet', warning: 'warning', offline: 'offline' }[s] || 'sky');
export const getBatteryClass = (b: number) => b > 50 ? 'high' : b > 20 ? 'mid' : 'low';
export const getIncidentLevelLabel = (l: string) => ({ urgent: '紧急', important: '重要', normal: '一般' }[l] || l);
export const getIncidentStatusLabel = (s: string) => ({ open: '待处置', handling: '处置中', closed: '已关闭' }[s] || s);
export const getTaskStatusLabel = (s: string) => ({ running: '进行中', pending: '待开始', completed: '已完成' }[s] || s);
export const getTaskPriorityLabel = (p: string) => ({ urgent: '紧急', high: '重要', medium: '普通', low: '低优先' }[p] || p);
export const getTaskPriorityClass = (p: string) => ({ urgent: 'urgent', high: 'important', medium: 'normal', low: 'success' }[p] || 'normal');
export const TYPE_ICON: Record<string, string> = { patrol: '🔄', inspection: '🔍', guide: '👋', response: '🚨' };
export const TYPE_LABEL: Record<string, string> = { patrol: '巡逻', inspection: '检查', guide: '引导', response: '响应' };
export const ROUTE_MODE_LABEL: Record<string, string> = { loop: '循环巡逻', oneway: '单程路线', random: '随机巡逻', fixed: '定点驻守' };
export const SPEED_LABEL: Record<string, string> = { slow: '慢速', normal: '正常', fast: '快速' };
