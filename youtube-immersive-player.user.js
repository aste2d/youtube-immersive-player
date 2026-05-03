// ==UserScript==
// @name         YouTube Immersive Player | YouTube沉浸式播放器
// @namespace    https://github.com/AsterHours/youtube-immersive-player
// @description  Please check the GitHub link above. 请访问上方的GitHub链接查看说明。
// @license      MIT © Aster Hours
// @version      1.62
// @author       Aster
// @match        https://www.youtube.com/w*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/AsterHours/youtube-immersive-player/main/youtube-immersive-player.user.js
// @downloadURL  https://raw.githubusercontent.com/AsterHours/youtube-immersive-player/main/youtube-immersive-player.user.js
// ==/UserScript==

(function () {
  'use strict';

  // ==========================================================
  // CONFIG 用户设置区 / User Config / 設定
  // ==========================================================
  const CONFIG = {
    // ================= [ 快捷键 Shortcuts ] ==================
    HOTKEY_RESIZE_PLAYER: 'r',            // 切换主播放器宽度/跳转Shorts的快捷键 (默认 'r')
    HOTKEY_TOGGLE_SECONDARY: 'v',         // 显示/隐藏右侧推荐栏的快捷键 (默认 'v')
    // ========================================================

    RESIZE_WITH_R_KEY: true,              // 允许按快捷键(默认 'r')切换主播放器宽度比例
    REDIRECT_SHORTS_WITH_R_KEY: true,     // 允许按快捷键(默认 'r')在 Shorts 页面跳转到普通视频播放页面
    TOGGLE_WITH_V_KEY: true,              // 允许按快捷键(默认 'v')来显示/隐藏右侧推荐栏
    TOGGLE_WITH_MMB_ON_VIDEO: true,       // 允许在视频区域点击鼠标中键来显示/隐藏右侧推荐栏
    MMB_ACTS_AS_V_IN_FULLSCREEN: true,    // 允许在全屏模式点击鼠标中键来显示/隐藏底部推荐栏

    ENABLE_INLINE_RECS: true,             // 将侧边栏样式修改为覆盖在主界面图层之上
    ALLOW_RIGHT_ON_NORMAL: true,          // 允许在普通播放模式下使用推荐栏
    ALLOW_RIGHT_ON_THEATER: true,         // 允许在剧场宽屏模式下使用推荐栏
    AUTO_HIDE_SECONDARY_ON_LEAVE: true,   // 当鼠标离开右侧推荐栏区域时，自动隐藏
    KEEP_SECONDARY_WHEN_OVER_POPUP: true, // 当鼠标悬停在推荐栏上下文菜单时，不自动隐藏

    HIDE_PLAY_PAUSE_BEZEL: true,          // 隐藏视频中间哎哟我去怎么这么大的播放/暂停状态动画图标
    HIDE_ALL_BEZELS: false,               // 隐藏视频中间正常人大小的状态动画图标（音量等，默认不隐藏）

    FIX_POPUP_MENU_ON_TOP: true,          // 确保上下文菜单始终显示在最顶层防遮挡
    OPEN_RIGHT_ON_CHAPTER_BUTTON: true,   // 允许点击视频进度条上的章节标题按钮时展开右侧推荐栏
  };

  const STYLE_ID = 'tm-youtube-inline-recommend-style-v1-55';

  // 从 localStorage 读取状态，如果有记录且为 'true'，则默认开启，否则为 false
  let isPrimaryResized = localStorage.getItem('yt_immersive_primary_resized') === 'true';

  // 封装更新宽度的逻辑，并在初始化时立即执行一次，确保跨页面保持状态
  function updatePrimaryWidth() {
    const newWidth = isPrimaryResized
      ? 'calc(100% - min(420px, 38vw) / 1.5)'
      : 'calc(100% - min(420px, 38vw))';
    document.documentElement.style.setProperty('--tm-primary-width', newWidth);
  }
  updatePrimaryWidth();


  let css = `
    html, body { overflow-x: hidden !important; }
  `;

  if (CONFIG.ENABLE_INLINE_RECS) {
    css += `
      #secondary { display: none !important; }

      #secondary yt-lockup-view-model {
        display: flex !important;
      }
      #secondary #items,
      #secondary ytd-watch-next-secondary-results-renderer {
        scrollbar-width: none !important;
      }

      #secondary #items::-webkit-scrollbar,
      #secondary ytd-watch-next-secondary-results-renderer::-webkit-scrollbar {
        display: none !important;
      }
      #secondary .yt-lockup-view-model__content-image {
        flex: 0 0 200px !important;
        width: 200px !important;
        max-width: 200px !important;
      }
      #secondary {
        overflow: hidden !important;
      }

      ${CONFIG.ALLOW_RIGHT_ON_NORMAL ? `
      ytd-watch-flexy:not([theater]):not([fullscreen]) #secondary {
        display: block !important;
        position: absolute !important;
        top: var(--tm-ytright-top, 56px) !important;
        right: 0 !important;
        width: min(420px, 38.2vw) !important;
        height: calc(100% - var(--tm-ytright-top, 56px)) !important;
        background: linear-gradient(
          to right,
          rgba(0,0,0,0) 0%,
          var(--yt-spec-base-background) 12%,
          var(--yt-spec-base-background) 100%
        ) !important;
        overflow-y: auto !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: 9999 !important;
        transition: opacity 0.3s ease !important;
      }
      ytd-watch-flexy:not([theater]):not([fullscreen]) #secondary.show {
        opacity: 1 !important;
        pointer-events: auto !important;
      }

      ytd-watch-flexy:not([theater]):not([fullscreen]) #primary {
        flex: 0 0 var(--tm-primary-width, calc(100% - min(420px, 38vw))) !important;
        margin: 0 auto !important;
        /* 取消此处的 transition，防止 YouTube JS 计算高度时产生延迟错位 */
      }
      ytd-watch-flexy:not([theater]):not([fullscreen]).ready #primary { opacity: 1 !important; }

      ytd-watch-flexy:not([theater]):not([fullscreen]) .html5-video-container {
        display: flex !important;
        justify-content: center !important;
      }
      ytd-watch-flexy:not([theater]):not([fullscreen]) video.video-stream {
        position: relative !important;
        left: 0 !important;
        right: 0 !important;
        margin: 0 auto !important;
        max-width: 100% !important;
        max-height: 100% !important;
      }
      ` : ''}

      ${CONFIG.ALLOW_RIGHT_ON_THEATER ? `
      ytd-watch-flexy[theater]:not([fullscreen]) #secondary {
        display: block !important;
        position: fixed !important;
        top: var(--tm-ytright-top, 56px) !important;
        right: 0 !important;
        width: min(420px, 38.2vw) !important;
        height: calc(100% - var(--tm-ytright-top, 56px)) !important;
        background: linear-gradient(
          to right,
          rgba(0,0,0,0) 0%,
          var(--yt-spec-base-background) 12%,
          var(--yt-spec-base-background) 100%
        ) !important;
        overflow-y: auto !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: 10010 !important;
        transition: opacity 0.3s ease !important;
      }
      ytd-watch-flexy[theater]:not([fullscreen]) #secondary.show {
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      ` : ''}

      #secondary yt-button-renderer.yt-spec-button-view-model,
      #secondary .yt-spec-button-view-model { display: none !important; }
      #secondary #items { transform: translateX(20px); }

      #movie_player > div.ytp-overlays-container > div.ytp-overlay-bottom-right > div.ytp-fullscreen-quick-actions,
      #movie_player > div.ytp-fullscreen-grid > button { display: none !important; }
    `;
  }


  if (CONFIG.HIDE_ALL_BEZELS) {
    css += `#movie_player .ytp-bezel { display: none !important; }`;
  } else if (CONFIG.HIDE_PLAY_PAUSE_BEZEL) {
    css += `
      #movie_player .ytp-bezel[aria-label="播放"],
      #movie_player .ytp-bezel[aria-label="暂停"],
      #movie_player .ytp-bezel[aria-label="Play"],
      #movie_player .ytp-bezel[aria-label="Pause"],
      #movie_player [role="status"][aria-label="播放"] .ytp-bezel,
      #movie_player [role="status"][aria-label="暂停"] .ytp-bezel,
      #movie_player [role="status"][aria-label="Play"] .ytp-bezel,
      #movie_player [role="status"][aria-label="Pause"] .ytp-bezel { display: none !important; }
    `;
  }

  if (CONFIG.FIX_POPUP_MENU_ON_TOP) {
    css += `
      ytd-popup-container { position: relative !important; z-index: 100000 !important; }
      tp-yt-iron-dropdown { z-index: 100001 !important; }
      ytd-menu-popup-renderer { position: relative !important; z-index: 100002 !important; }
      .ytd-menu-popup-renderer,
      .ytd-simple-menu-header-renderer,
      .ytd-menu-service-item-renderer { position: relative !important; z-index: 100003 !important; }
    `;
  }


  function injectStyle() {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement('style');
      el.id = STYLE_ID;
      el.textContent = css;
      document.head.appendChild(el);
    }
  }

  function setTopVar() {
    const masthead = document.getElementById('masthead');
    const top = (masthead && masthead.offsetHeight) || 56;
    document.documentElement.style.setProperty('--tm-ytright-top', `${top}px`);
  }

  function isEnteringPopup(e) {
    if (!CONFIG.KEEP_SECONDARY_WHEN_OVER_POPUP) return false;
    const rt = e && e.relatedTarget;
    if (rt && isPopupNode(rt)) return true;
    const path = (typeof e.composedPath === 'function') ? e.composedPath() : [];
    if (path && path.some(isPopupNode)) return true;
    if (rt && rt.getRootNode) {
      const root = rt.getRootNode();
      const host = root && root.host;
      if (host && isPopupNode(host)) return true;
    }
    return false;
  }

  function isPopupNode(node) {
    if (!node || node.nodeType !== 1) return false;
    try {
      if (node.matches?.('ytd-popup-container, tp-yt-iron-dropdown, ytd-menu-popup-renderer, .ytp-ce-element, .ytd-menu-popup-renderer, [role="menu"]') || node.id === 'contentWrapper') return true;
      let p = node;
      for (let i = 0; i < 5 && p; i++) {
        if (p.matches?.('ytd-popup-container, tp-yt-iron-dropdown, ytd-menu-popup-renderer, .ytp-ce-element, .ytd-menu-popup-renderer, [role="menu"]') || p.id === 'contentWrapper') return true;
        p = p.parentElement || (p.getRootNode && p.getRootNode().host) || null;
      }
    } catch (_) {}
    return false;
  }

  function canShowRightOnCurrentMode(flexy) {
    if (!flexy) return false;
    if (flexy.hasAttribute('fullscreen')) return false;
    const isTheater = flexy.hasAttribute('theater');
    return isTheater ? !!CONFIG.ALLOW_RIGHT_ON_THEATER : !!CONFIG.ALLOW_RIGHT_ON_NORMAL;
  }

  function isRecommendedTarget(target) {
    if (!target || !target.closest) return false;
    return !!target.closest(`#secondary, ytd-compact-video-renderer, a.ytp-endscreen-content, .ytp-endscreen-content, .ytp-videowall-still, .ytp-modern-videowall-still, .ytp-videowall-content, .ytp-suggestion-panel, .ytp-suggestion-set, .ytp-ce-element, .ytp-miniplayer-suggestion, .ytp-relatedthumb-link`.replace(/\n/g, ' '));
  }

  function sendToggleKeyToPlayer() {
    const targets = [];
    const movie = document.getElementById('movie_player');
    const video = document.querySelector('video.video-stream');
    if (document.activeElement) targets.push(document.activeElement);
    if (movie) targets.push(movie);
    if (video) targets.push(video);
    targets.push(document.body, document);

    const keyStr = (CONFIG.HOTKEY_TOGGLE_SECONDARY || 'v').toLowerCase();
    const keyCode = keyStr.toUpperCase().charCodeAt(0);
    const codeStr = 'Key' + keyStr.toUpperCase();

    const opts = { key: keyStr, code: codeStr, keyCode: keyCode, which: keyCode, bubbles: true, cancelable: true };
    for (const t of targets) { try { t.dispatchEvent(new KeyboardEvent('keydown', opts)); } catch (_) {} }
    for (const t of targets) { try { t.dispatchEvent(new KeyboardEvent('keyup',   opts)); } catch (_) {} }
  }

  function performVToggle(secondary) {
    if (!CONFIG.TOGGLE_WITH_V_KEY) return;
    const flexy = document.querySelector('ytd-watch-flexy');
    if (!canShowRightOnCurrentMode(flexy)) return;
    secondary.classList.toggle('show');
  }

  function initToggle(secondary) {
    if (!secondary || secondary.dataset.tmBound) return;
    secondary.dataset.tmBound = '1';

    document.addEventListener('click', (e) => {
      if (!CONFIG.OPEN_RIGHT_ON_CHAPTER_BUTTON || !CONFIG.ENABLE_INLINE_RECS) return;
      const btn = e.target && e.target.closest?.('.ytp-chapter-title.ytp-button');
      if (!btn) return;
      const flexy = document.querySelector('ytd-watch-flexy');
      if (!canShowRightOnCurrentMode(flexy)) return;
      secondary.classList.toggle('show');
    });

    document.addEventListener('mousedown', (e) => {
      if (e.button !== 1) return;
      const flexy = document.querySelector('ytd-watch-flexy');
      const isFullscreen = !!(flexy && flexy.hasAttribute('fullscreen')) || !!document.fullscreenElement;
      if (isFullscreen && CONFIG.MMB_ACTS_AS_V_IN_FULLSCREEN) {
        if (!isRecommendedTarget(e.target)) {
          e.preventDefault();
          sendToggleKeyToPlayer();
        }
        return;
      }
      if (CONFIG.TOGGLE_WITH_MMB_ON_VIDEO) {
        const video = e.target.closest && e.target.closest('video.video-stream');
        if (!video) return;
        if (!canShowRightOnCurrentMode(flexy)) return;
        secondary.classList.toggle('show');
        e.preventDefault();
      }
    });

    // 键盘监听事件合并 (处理自定义快捷键逻辑)
    document.addEventListener('keydown', (e) => {
      const t = e.target;
      // 避免在输入框中触发快捷键
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

      // 【修复Bug】如果按下了修饰键 (Ctrl, Alt/Option, Meta/Cmd)，则直接退出，防止和系统/浏览器快捷键冲突
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (!e.key) return;

      const key = e.key.toLowerCase();
      const toggleKey = (CONFIG.HOTKEY_TOGGLE_SECONDARY || 'v').toLowerCase();
      const resizeKey = (CONFIG.HOTKEY_RESIZE_PLAYER || 'r').toLowerCase();

      // 切换侧边栏逻辑 (原V键)
      if (key === toggleKey && CONFIG.TOGGLE_WITH_V_KEY) {
        const flexy = document.querySelector('ytd-watch-flexy');
        const isFullscreen = !!(flexy && flexy.hasAttribute('fullscreen')) || !!document.fullscreenElement;
        if (isFullscreen) return;
        performVToggle(secondary);
      }

      // 切换宽度/跳转Shorts逻辑 (原R键)
      if (key === resizeKey) {
        // 先检查是否处于 Shorts 页面并需要跳转
        if (CONFIG.REDIRECT_SHORTS_WITH_R_KEY && window.location.pathname.startsWith('/shorts/')) {
          const videoId = window.location.pathname.split('/shorts/')[1];
          if (videoId) {
            window.location.href = '/watch?v=' + videoId;
          }
          return; // 结束逻辑，不再执行后续的调整比例
        }

        // 正常播放页面的调整比例逻辑
        if (CONFIG.RESIZE_WITH_R_KEY) {
          isPrimaryResized = !isPrimaryResized;

          // 每次按下快捷键切换后，将当前状态保存到 localStorage 中
          localStorage.setItem('yt_immersive_primary_resized', isPrimaryResized);

          // 应用新宽度
          updatePrimaryWidth();

          // 强制派发全局 resize 事件，通知 YouTube 的 JS 重新计算视频流的高度与宽度
          window.dispatchEvent(new Event('resize'));
          // 双重保险：稍微延迟再次触发，确保 YouTube 的播放器容器响应完毕
          setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
        }
      }
    });

    if (CONFIG.AUTO_HIDE_SECONDARY_ON_LEAVE) {
      secondary.addEventListener('mouseleave', (e) => {
        if (isEnteringPopup(e)) return;
        secondary.classList.remove('show');
      });
    }
  }

  function init() {
    injectStyle();
    setTopVar();
    if (!CONFIG.ENABLE_INLINE_RECS) return true;
    const flexy = document.querySelector('ytd-watch-flexy');
    if (!flexy) return false;
    const secondary = flexy.querySelector('#secondary');
    const primary = flexy.querySelector('#primary');
    if (!secondary || !primary) return false;
    initToggle(secondary);
    if (!flexy.classList.contains('ready')) {
      requestAnimationFrame(() => flexy.classList.add('ready'));
    }
    return true;
  }

  const tryInit = setInterval(() => { if (init()) clearInterval(tryInit); }, 500);
  window.addEventListener('resize', setTopVar);
  const app = document.querySelector('ytd-app') || document.body;
  new MutationObserver(() => { init(); }).observe(app, { childList: true, subtree: true });

})();
