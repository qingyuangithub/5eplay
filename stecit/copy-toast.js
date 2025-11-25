(function() {
    'use strict';

    // 等待整个 HTML 加载 完成
    document.addEventListener('DOMContentLoaded', function() {

        // 1. 注入 CSS 样式
        const style = document.createElement('style');
        style.textContent = `
            /* 父容器，用于将提示框居中 */
            .toast-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center; /* 水平居中 */
                align-items: center;     /* 垂直居中 */
                pointer-events: none;    /* 让鼠标事件穿透过去，不影响页面操作 */
                z-index: 9999999;        /* 确保在最上层 */
            }

            /* 核心：复制提示框 (Toast) 样式 */
            .copy-toast {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                font-size: 16px;
                font-weight: 500;
                color: white;
                background-color: rgba(30, 30, 30, 0.9); /* 深色半透明背景 */
                transform: translateY(20px); /* 初始位置向下偏移一点 */
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }

            .copy-toast.show {
                transform: translateY(0); /* 移动到居中位置 */
                opacity: 1;
            }
            
            /* 成功和失败状态只改变图标颜色 */
            .copy-toast.success svg {
                color: #4CAF50; /* 绿色图标 */
            }

            .copy-toast.error svg {
                color: #F44336; /* 红色图标 */
            }

            .copy-toast svg {
                width: 24px;
                height: 24px;
                fill: currentColor;
            }
        `;
        document.documentElement.appendChild(style);

        // 2. 创建提示框元素
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';

        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path id="toast-icon-path" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span id="toast-message">复制成功</span>
        `;

        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);

        const iconPath = toast.querySelector('#toast-icon-path');
        const messageSpan = toast.querySelector('#toast-message');

        // 3. 定义并暴露 showCopyToast 函数到全局
        window.showCopyToast = function(message, type = 'success') {
            messageSpan.textContent = message;
            if (type === 'success') {
                toast.classList.remove('error');
                toast.classList.add('success');
                iconPath.setAttribute('d', 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z');
            } else if (type === 'error') {
                toast.classList.remove('success');
                toast.classList.add('error');
                iconPath.setAttribute('d', 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z');
            }

            // 先确保元素是隐藏的，以防连续点击
            toast.classList.remove('show');
            // 强制重排，让过渡效果能重新触发
            void toast.offsetWidth;
            // 显示提示框
            toast.classList.add('show');

            // 3 秒后自动隐藏
            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        };
        //showCopyToast("你的消息", "success" 或 "error")

    }); // 关闭 DOMContentLoaded 事件监听器

})();