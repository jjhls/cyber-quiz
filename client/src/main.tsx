import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import AuthProvider from './components/AuthProvider'
import { useThemeStore, Theme } from './stores/themeStore'
import './index.css'

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme: currentTheme } = useThemeStore();
  const [isDark, setIsDark] = useState(currentTheme === 'dark');

  useEffect(() => {
    setIsDark(currentTheme === 'dark');
  }, [currentTheme]);

  const antTheme = {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#3b82f6',
      borderRadius: 12,
      colorBgBase: isDark ? '#0f172a' : '#ffffff',
      colorBgContainer: isDark ? '#1e293b' : '#ffffff',
      colorTextBase: isDark ? '#f1f5f9' : '#0f172a',
      colorBorder: isDark ? '#334155' : '#e2e8f0',
    },
    components: {
      Layout: {
        bodyBg: isDark ? '#020617' : '#f8fafc',
        headerBg: isDark ? '#0f172a' : '#ffffff',
        footerBg: isDark ? '#0f172a' : '#ffffff',
      },
      Card: {
        colorBgContainer: isDark ? '#1e293b' : '#ffffff',
      },
      Table: {
        colorBgContainer: isDark ? '#1e293b' : '#ffffff',
        headerBg: isDark ? '#0f172a' : '#f8fafc',
      },
      Modal: {
        contentBg: isDark ? '#1e293b' : '#ffffff',
      },
      Input: {
        colorBgContainer: isDark ? '#1e293b' : '#ffffff',
      },
      Select: {
        colorBgContainer: isDark ? '#1e293b' : '#ffffff',
      },
    },
  };

  return (
    <ConfigProvider locale={zhCN} theme={antTheme}>
      {children}
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeWrapper>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeWrapper>
    </BrowserRouter>
  </React.StrictMode>,
)
