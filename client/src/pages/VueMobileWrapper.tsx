// ============================================================
// VueMobileWrapper.tsx — React 路由中挂载 Vue 移动端应用
// 通过 createApp 将 MobileApp.vue 挂载到一个独立 DOM 节点
// ============================================================
import { useEffect, useRef } from 'react';
import { createApp, type App } from 'vue';
import MobileApp from '@/vue/MobileApp.vue';

export default function VueMobileWrapper() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 挂载 Vue 应用
    const app = createApp(MobileApp);
    app.mount(containerRef.current);
    appRef.current = app;

    return () => {
      // 卸载时销毁 Vue 应用
      appRef.current?.unmount();
      appRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ minHeight: '100vh' }} />;
}
