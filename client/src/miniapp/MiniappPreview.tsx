/**
 * MiniappPreview.tsx
 * 微信小程序 H5 预览容器 — 手机模拟器框架
 * 设计：深色安防主题，iPhone 外壳，内嵌完整小程序页面
 */
import { useState } from 'react';
import MpIndex from './pages/MpIndex';
import MpRobots from './pages/MpRobots';
import MpRobotDetail from './pages/MpRobotDetail';
import MpRobotCamera from './pages/MpRobotCamera';
import MpTasks from './pages/MpTasks';
import MpProfile from './pages/MpProfile';

export type MpPage =
  | { name: 'index' }
  | { name: 'robots' }
  | { name: 'robot-detail'; robotId: string }
  | { name: 'robot-camera'; robotId?: string; incidentId?: string }
  | { name: 'tasks' }
  | { name: 'profile' };

export type TabName = 'index' | 'robots' | 'tasks' | 'profile';

const TABS: { key: TabName; icon: string; label: string }[] = [
  { key: 'index',   icon: '🚨', label: '事件处置' },
  { key: 'robots',  icon: '🤖', label: '机器人' },
  { key: 'tasks',   icon: '📋', label: '任务' },
  { key: 'profile', icon: '👤', label: '我的' },
];

export default function MiniappPreview() {
  const [page, setPage] = useState<MpPage>({ name: 'index' });
  const [activeTab, setActiveTab] = useState<TabName>('index');
  const [pageStack, setPageStack] = useState<MpPage[]>([]);

  const navigate = (target: MpPage) => {
    setPageStack(s => [...s, page]);
    setPage(target);
  };

  const goBack = () => {
    const stack = [...pageStack];
    const prev = stack.pop();
    if (prev) { setPage(prev); setPageStack(stack); }
  };

  const switchTab = (tab: TabName) => {
    setActiveTab(tab);
    setPage({ name: tab } as MpPage);
    setPageStack([]);
  };

  const isTabPage = ['index', 'robots', 'tasks', 'profile'].includes(page.name);
  const canGoBack = pageStack.length > 0;

  const renderPage = () => {
    switch (page.name) {
      case 'index':
        return <MpIndex navigate={navigate} />;
      case 'robots':
        return <MpRobots navigate={navigate} />;
      case 'robot-detail':
        return <MpRobotDetail robotId={page.robotId} navigate={navigate} goBack={goBack} />;
      case 'robot-camera':
        return <MpRobotCamera robotId={page.robotId} incidentId={page.incidentId} goBack={goBack} />;
      case 'tasks':
        return <MpTasks navigate={navigate} />;
      case 'profile':
        return <MpProfile />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (page.name) {
      case 'index': return '事件处置';
      case 'robots': return '机器人管理';
      case 'robot-detail': return '机器人详情';
      case 'robot-camera': return '实时画面';
      case 'tasks': return '任务管理';
      case 'profile': return '个人中心';
      default: return '';
    }
  };

  return (
    <div className="mp-preview-wrapper">
      {/* 左侧说明 */}
      <div className="mp-side-info">
        <div className="mp-side-logo">
          <span style={{ fontSize: 32 }}>🤖</span>
          <span className="mp-side-title">安保机器人</span>
          <span className="mp-side-sub">小程序预览</span>
        </div>
        <div className="mp-side-nav">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`mp-side-btn ${activeTab === t.key && isTabPage ? 'active' : ''}`}
              onClick={() => switchTab(t.key)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <div className="mp-side-tip">
          <p>📱 模拟微信小程序界面</p>
          <p>点击左侧切换页面</p>
          <p>或在手机内操作导航</p>
        </div>
      </div>

      {/* 手机模拟器 */}
      <div className="mp-phone-shell">
        {/* 手机顶部装饰 */}
        <div className="mp-phone-top">
          <div className="mp-notch">
            <div className="mp-camera-dot"></div>
          </div>
        </div>

        {/* 微信状态栏 */}
        <div className="mp-wechat-bar">
          <span className="mp-wechat-time">
            {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}
          </span>
          <span className="mp-wechat-icons">●●● ⚡</span>
        </div>

        {/* 小程序导航栏 */}
        <div className="mp-nav-bar">
          {canGoBack && (
            <button className="mp-back-btn" onClick={goBack}>‹</button>
          )}
          <span className="mp-nav-title">{getTitle()}</span>
          <span className="mp-nav-more">···</span>
        </div>

        {/* 页面内容区 */}
        <div className="mp-page-content">
          {renderPage()}
        </div>

        {/* tabBar */}
        {isTabPage && (
          <div className="mp-tabbar">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`mp-tab-item ${activeTab === t.key ? 'mp-tab-active' : ''}`}
                onClick={() => switchTab(t.key)}
              >
                <span className="mp-tab-icon">{t.icon}</span>
                <span className="mp-tab-label">{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* 手机底部 Home 条 */}
        <div className="mp-home-bar"></div>
      </div>
    </div>
  );
}
