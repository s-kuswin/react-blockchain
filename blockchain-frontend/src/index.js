/*
 * @Author: shirongwei-lhq
 * @Date: 2025-08-19 09:33:33
 * @LastEditors: shirongwei-lhq
 * @LastEditTime: 2025-08-19 16:40:24
 * @Description: 
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 为浏览器环境配置Buffer
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);