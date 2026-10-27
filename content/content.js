/**
 * TranslateAI - Content Script
 * 划词翻译、悬浮提示、页面翻译
 */

// ===== 状态 =====
let isPageTranslated = false;
let selectionTimeout = null;
let translationToken = 0;

// ===== 初始化 =====
(async function init() {
  const settings = await chrome.storage.sync.get(['translateSettings']);
  const config = settings.translateSettings || {};

  // 监听来自 background 的消息
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'translatePage') {
      translatePage(msg.targetLang || 'zh').then(() => {
        sendResponse({ success: true });
      });
      return true;
    }
    if (msg.action === 'translateSelection') {
      translateSelection(msg.text, msg.sourceLang, msg.targetLang).then(result => {
        showTranslateResult(result, window.getSelection().toString());
        sendResponse({ success: true });
      });
      return true;
    }
    if (msg.action === 'showTranslation') {
      showTranslateResult({
        word: msg.text,
        translation: msg.translation,
        source: msg.source
      }, msg.text);
      sendResponse({ success: true });
      return false;
    }
  });

  // 监听鼠标划词
  document.addEventListener('mouseup', handleMouseUp);

  // 页面加载完成后，如果启用了自动翻译，执行翻译
  if (config.autoTranslateOnLoad) {
    detectLanguageAndTranslate();
  }
})();

// ===== 鼠标划词处理 =====
function handleMouseUp() {
  clearTimeout(selectionTimeout);
  const selection = window.getSelection().toString().trim();

  if (!selection || selection.length < 2) {
    hideTooltip();
    return;
  }

  // 延迟显示，避免快速点击时触发
  selectionTimeout = setTimeout(async () => {
    const settings = await chrome.storage.sync.get(['translateSettings']);
    const config = settings.translateSettings || {};
    if (!config.hoverTranslation) return;

    const rect = getSelectionRect();
    const token = ++translationToken;

    // 先给出「翻译中」反馈，避免等待接口时界面无响应
    showLoading(rect, selection);

    const result = await translateSelection(selection, 'auto', config.targetLang || 'zh');
    if (token !== translationToken) return; // 已有更新的请求，丢弃旧结果

    renderResult(result, selection, rect);
  }, 300);
}

// ===== 取选区位置（视口坐标）=====
function getSelectionRect() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  if (!rect || (!rect.width && !rect.height)) return null;
  return rect;
}

// ===== 翻译选区文本 =====
async function translateSelection(text, sourceLang, targetLang) {
  if (!text || text.trim().length < 2) return null;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'translateText',
      text: text.trim(),
      sourceLang: sourceLang,
      targetLang: targetLang
    });

    if (response && response.success) {
      return response.data;
    }
  } catch (e) {
    console.error('翻译失败:', e);
  }

  return null;
}

// ===== 翻译中状态 =====
function showLoading(rect, text) {
  const tooltip = createTooltip();
  const word = tooltip.querySelector('.tooltip-word');
  word.textContent = text.length > 28 ? `${text.slice(0, 28)}…` : text;

  const badge = tooltip.querySelector('.tooltip-source');
  badge.textContent = '翻译中';
  badge.className = 'tooltip-source source-loading';

  const body = tooltip.querySelector('.tooltip-translation');
  body.textContent = '';
  const spinner = document.createElement('span');
  spinner.className = 'translateai-loading';
  body.appendChild(spinner);

  positionTooltip(tooltip, rect);
}

// ===== 显示翻译结果 =====
function showTranslateResult(result, originalText) {
  renderResult(result, originalText, getSelectionRect());
}

function renderResult(result, originalText, rect) {
  if (!result) {
    hideTooltip();
    return;
  }

  // 已是目标语言：不弹框，避免无意义的反向翻译
  if (result.sameLanguage) {
    hideTooltip();
    return;
  }

  const tooltip = createTooltip();
  tooltip.querySelector('.tooltip-word').textContent = result.word || originalText;
  tooltip.querySelector('.tooltip-translation').textContent = result.translation || '未找到翻译';

  // 来源标记
  const sourceBadge = tooltip.querySelector('.tooltip-source');
  if (result.source === 'dictionary') {
    sourceBadge.textContent = '词库';
    sourceBadge.className = 'tooltip-source source-dict';
  } else if (result.source === 'llm') {
    sourceBadge.textContent = 'AI';
    sourceBadge.className = 'tooltip-source source-llm';
  } else {
    sourceBadge.textContent = '未翻译';
    sourceBadge.className = 'tooltip-source source-unknown';
  }

  positionTooltip(tooltip, rect);
}

// ===== 定位提示框（自动避开视口边缘）=====
function positionTooltip(tooltip, rect) {
  tooltip.classList.add('visible');

  const margin = 10;
  const width = tooltip.offsetWidth || 240;
  const height = tooltip.offsetHeight || 72;

  let left;
  let top;

  if (rect) {
    left = rect.left + rect.width / 2 - width / 2;
    top = rect.bottom + 8;
    // 下方空间不足时显示在选区上方
    if (top + height > window.innerHeight - margin) {
      top = rect.top - height - 8;
    }
  } else {
    left = window.innerWidth / 2 - width / 2;
    top = window.innerHeight * 0.25;
  }

  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
  top = Math.max(margin, top);

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

// ===== 创建提示框 =====
function createTooltip() {
  let tooltip = document.getElementById('translateai-tooltip');
  if (tooltip) return tooltip;

  tooltip = document.createElement('div');
  tooltip.id = 'translateai-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.innerHTML = `
    <div class="tooltip-header">
      <span class="tooltip-word"></span>
      <span class="tooltip-source"></span>
    </div>
    <div class="tooltip-translation"></div>
  `;
  document.body.appendChild(tooltip);
  return tooltip;
}

// ===== 隐藏提示框 =====
function hideTooltip() {
  translationToken++; // 作废进行中的请求，避免结果晚到后重新弹出
  const tooltip = document.getElementById('translateai-tooltip');
  if (tooltip) {
    tooltip.classList.remove('visible');
    tooltip.style.display = 'none';
  }
}

// ===== 页面翻译 =====
async function translatePage(targetLang) {
  if (isPageTranslated) {
    // 恢复原文
    restorePage();
    return;
  }

  // 目标语言固定取设置值，不根据页面语种反向翻译
  if (!targetLang) {
    const settings = await chrome.storage.sync.get(['translateSettings']);
    targetLang = (settings.translateSettings || {}).targetLang || 'zh';
  }

  // 获取页面文本节点（限制数量，避免误翻超长页面消耗大量额度）
  const MAX_NODES = 500;
  let nodes = getTextNodes();
  if (nodes.length > MAX_NODES) {
    nodes = nodes.slice(0, MAX_NODES);
  }

  const originalTexts = [];
  for (const node of nodes) {
    originalTexts.push(node.textContent);
  }

  // 批量翻译（带进度提示）
  const progress = showProgress(originalTexts.length);
  const translations = await batchTranslate(originalTexts, targetLang, (done, total) => {
    updateProgress(progress, done, total);
  });
  removeProgress(progress);

  // 应用翻译：只替换确实发生变化的文本，已是目标语言的内容保持原样
  let changed = 0;
  let index = 0;
  for (const node of nodes) {
    const translated = translations[index];
    if (translated && translated !== node.textContent) {
      node.textContent = translated;
      changed++;
    }
    index++;
  }

  isPageTranslated = true;

  // 显示状态指示
  showPageTranslationStatus(targetLang, changed);
}

// ===== 获取文本节点 =====
function getTextNodes() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        // 跳过 script/style/textarea 等
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (['script', 'style', 'textarea', 'code', 'pre'].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        // 跳过插件自己注入的元素
        if (parent.closest && parent.closest('#translateai-tooltip, #translateai-progress, #translateai-banner')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  return nodes;
}

// ===== 粗略判断文本是否已是目标语言（省去无谓的请求）=====
function looksLikeTarget(text, targetLang) {
  if (targetLang === 'zh') {
    return /[\u4e00-\u9fff]/.test(text) && !/[a-zA-Z]{4,}/.test(text);
  }
  if (targetLang === 'ja') return /[\u3040-\u30ff]/.test(text);
  if (targetLang === 'ko') return /[\uac00-\ud7af]/.test(text);
  if (targetLang === 'ru') return /[\u0400-\u04ff]/.test(text);
  if (targetLang === 'ar') return /[\u0600-\u06ff]/.test(text);
  // 拉丁语系语种之间无法可靠区分，不做预判
  return false;
}

// ===== 批量翻译 =====
async function batchTranslate(texts, targetLang, onProgress) {
  // 页面翻译并发不宜过高，避免触发大模型限流
  const concurrency = 3;
  const results = new Array(texts.length).fill(null);
  const translatable = /[a-zA-Z\u00c0-\u024f\u0400-\u04ff\u0600-\u06ff\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/;

  let finished = 0;
  let cursor = 0;

  const report = () => {
    finished++;
    if (onProgress) onProgress(finished, texts.length);
  };

  async function worker() {
    while (cursor < texts.length) {
      const i = cursor++;
      const raw = texts[i];
      const text = raw.trim();

      // 纯数字/符号，或已是目标语言，直接保留原文
      if (!text || !translatable.test(text)) {
        report();
        continue;
      }
      if (looksLikeTarget(text, targetLang)) {
        results[i] = raw;
        report();
        continue;
      }

      try {
        const response = await chrome.runtime.sendMessage({
          action: 'translateText',
          text: text,
          sourceLang: 'auto',
          targetLang: targetLang
        });
        if (response && response.success && response.data) {
          const data = response.data;
          // 已是目标语言时保留原文（包括原有空格）
          results[i] = data.sameLanguage ? raw : data.translation;
        }
      } catch (e) {
        console.error('批量翻译失败:', e);
      } finally {
        report();
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// ===== 页面翻译进度提示 =====
function showProgress(total) {
  const el = document.createElement('div');
  el.id = 'translateai-progress';
  el.textContent = `翻译中 0 / ${total}`;
  el.style.cssText = `
    position: fixed;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
    background: #fffdf8;
    color: #1b1813;
    padding: 9px 18px;
    border: 1px solid #e5ddce;
    border-radius: 12px;
    font-family: "Segoe UI Variable Text", "Microsoft YaHei UI", -apple-system, sans-serif;
    font-size: 12.5px;
    letter-spacing: 0.04em;
    z-index: 2147483647;
    box-shadow: 0 6px 24px rgba(27, 24, 19, 0.16);
  `;
  document.body.appendChild(el);
  return el;
}

function updateProgress(el, done, total) {
  if (!el || !el.isConnected) return;
  el.textContent = `翻译中 ${done} / ${total}`;
}

function removeProgress(el) {
  if (el && el.isConnected) el.remove();
}

// ===== 恢复页面 =====
function restorePage() {
  // 简单实现：刷新页面
  window.location.reload();
  isPageTranslated = false;
}

// ===== 语言名称 =====
const LANGUAGE_LABELS = {
  zh: '中文', en: 'English', ja: '日本語', ko: '한국어', ru: 'Русский',
  ar: 'العربية', fr: 'Français', de: 'Deutsch', es: 'Español',
  pt: 'Português', it: 'Italiano', th: 'ไทย', vi: 'Tiếng Việt',
  tr: 'Türkçe', hi: 'हिन्दी', id: 'Bahasa Indonesia'
};

// ===== 显示页面翻译状态 =====
function showPageTranslationStatus(targetLang, changed) {
  const lang = LANGUAGE_LABELS[targetLang] || targetLang;
  const summary = changed ? `页面已翻译为${lang}` : `页面已是${lang}，无需翻译`;

  const banner = document.createElement('div');
  banner.id = 'translateai-banner';
  banner.innerHTML = `
    <span>${summary}</span>
    <button id="translateai-undo">撤销</button>
  `;
  banner.style.cssText = `
    position: fixed;
    top: 14px;
    right: 14px;
    background: #fffdf8;
    color: #1b1813;
    padding: 10px 12px 10px 15px;
    border: 1px solid #e5ddce;
    border-radius: 12px;
    font-family: "Segoe UI Variable Text", "Microsoft YaHei UI", -apple-system, sans-serif;
    font-size: 12.5px;
    letter-spacing: 0.02em;
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 6px 24px rgba(27, 24, 19, 0.16);
  `;

  document.body.appendChild(banner);

  banner.querySelector('#translateai-undo').addEventListener('click', () => {
    restorePage();
  });

  // 5秒后自动隐藏
  setTimeout(() => {
    banner.style.opacity = '0';
    setTimeout(() => banner.remove(), 500);
  }, 5000);
}

// ===== 自动翻译（目标语言固定，不反向往回翻）=====
async function detectLanguageAndTranslate() {
  const settings = await chrome.storage.sync.get(['translateSettings']);
  const config = settings.translateSettings || {};
  translatePage(config.targetLang || 'zh');
}

// ===== 点击外部隐藏提示框 =====
document.addEventListener('mousedown', (event) => {
  const tooltip = document.getElementById('translateai-tooltip');
  if (tooltip && !tooltip.contains(event.target)) {
    hideTooltip();
  }
});
