import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#3b82f6',
            borderRadius: 12,
            colorBgBase: '#0f172a',
            colorBgContainer: '#1e293b',
            colorTextBase: '#f1f5f9',
            colorBorder: '#334155',
          },
          components: {
            Layout: {
              bodyBg: '#020617',
              headerBg: '#0f172a',
              footerBg: '#0f172a',
            },
            Card: {
              colorBgContainer: '#1e293b',
            },
            Table: {
              colorBgContainer: '#1e293b',
              headerBg: '#0f172a',
            },
            Modal: {
              contentBg: '#1e293b',
            },
            Input: {
              colorBgContainer: '#1e293b',
            },
            Select: {
              colorBgContainer: '#1e293b',
            },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
