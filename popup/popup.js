/**
 * TranslateAI - Popup Script
 */

// ===== DOM 元素 =====
const $inputText = document.getElementById('inputText');
const $sourceLang = document.getElementById('sourceLang');
const $targetLang = document.getElementById('targetLang');
const $swapBtn = document.getElementById('swapBtn');
const $translateBtn = document.getElementById('translateBtn');
const $resultArea = document.getElementById('resultArea');
const $resultText = document.getElementById('resultText');
const $resultSource = document.getElementById('resultSource');
const $copyBtn = document.getElementById('copyBtn');
const $dictCount = document.getElementById('dictCount');
const $llmStatus = document.getElementById('llmStatus');
const $openOptions = document.getElementById('openOptions');
const $translatePageBtn = document.getElementById('translatePageBtn');
const $toggleMode = document.getElementById('toggleMode');
const $modeLabel = document.getElementById('modeLabel');

// ===== 初始化 =====
async function init() {
  await loadSettings();
  await loadStats();
  bindEvents();
}

// ===== 加载设置 =====
async function loadSettings() {
  const config = await chrome.storage.sync.get(['llmConfig', 'translateSettings']);
  const settings = config.translateSettings || {};

  if (config.llmConfig && config.llmConfig.enabled) {
    $llmStatus.textContent = '已启用';
    $llmStatus.className = 'stat-value llm-enabled';
  }

  if (settings.sourceLang) $sourceLang.value = settings.sourceLang;
  if (settings.targetLang) $targetLang.value = settings.targetLang;
}

// ===== 加载词库统计 =====
async function loadStats() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getDictionaryStats' });
    if (response && response.success && response.data) {
      $dictCount.textContent = response.data.total;
      return;
    }
  } catch (e) {
    // 忽略
  }
  $dictCount.textContent = '—';
}

// ===== 绑定事件 =====
function bindEvents() {
  $translateBtn.addEventListener('click', handleTranslate);
  $swapBtn.addEventListener('click', swapLanguages);
  $copyBtn.addEventListener('click', copyResult);
  $openOptions.addEventListener('click', openOptions);
  $translatePageBtn.addEventListener('click', translatePage);
  $toggleMode.addEventListener('click', togglePriority);

  // 自动翻译输入框内容
  $inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  });
}

// ===== 交换语言 =====
function swapLanguages() {
  const source = $sourceLang.value;

  // 源语言为自动检测时，无法反向，只交换文本内容
  if (source !== 'auto') {
    $sourceLang.value = $targetLang.value;
    $targetLang.value = source;
  }

  // 交换输入和结果
  const input = $inputText.value;
  $inputText.value = $resultText.textContent;
  $resultText.textContent = input;

  if (input) {
    handleTranslate();
  }
}

// ===== 翻译处理 =====
async function handleTranslate() {
  const text = $inputText.value.trim();
  if (!text) return;

  $translateBtn.disabled = true;
  $translateBtn.querySelector('.btn-text').style.display = 'none';
  $translateBtn.querySelector('.btn-loading').style.display = 'inline-flex';

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'translateText',
      text: text,
      sourceLang: $sourceLang.value,
      targetLang: $targetLang.value
    });

    if (response.success && response.data) {
      showResult(response.data);
    } else {
      $resultArea.style.display = 'block';
      $resultText.textContent = response.error || '翻译失败，请重试';
      $resultSource.style.display = 'none';
    }
  } catch (e) {
    $resultArea.style.display = 'block';
    $resultText.textContent = '翻译出错: ' + e.message;
    $resultSource.style.display = 'none';
  } finally {
    $translateBtn.disabled = false;
    $translateBtn.querySelector('.btn-text').style.display = 'inline';
    $translateBtn.querySelector('.btn-loading').style.display = 'none';
  }
}

// ===== 显示结果 =====
function showResult(data) {
  $resultArea.style.display = 'block';

  if (data.sameLanguage) {
    $resultText.textContent = '这段文本已经是目标语言，无需翻译。';
    $resultSource.style.display = 'none';
    return;
  }

  $resultText.textContent = data.translation;

  const labels = { dictionary: '词库', llm: 'AI', unknown: '未翻译' };
  const classes = { dictionary: 'dict', llm: 'llm', unknown: 'unknown' };

  if (data.source && labels[data.source]) {
    $resultSource.textContent = labels[data.source];
    $resultSource.className = 'result-source source-' + classes[data.source];
    $resultSource.style.display = 'inline';
  } else {
    $resultSource.style.display = 'none';
  }
}

// ===== 复制结果 =====
async function copyResult() {
  const text = $resultText.textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    $copyBtn.textContent = '已复制';
    setTimeout(() => $copyBtn.textContent = '复制', 1500);
  } catch (e) {
    // fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    $copyBtn.textContent = '已复制';
    setTimeout(() => $copyBtn.textContent = '复制', 1500);
  }
}

// ===== 打开设置页 =====
function openOptions() {
  chrome.runtime.openOptionsPage();
  window.close();
}

// ===== 翻译当前页面 =====
async function translatePage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  const url = tab.url || '';
  // 浏览器内置页面无法注入脚本
  if (/^(chrome|edge|about|devtools|chrome-extension|chrome-search):/i.test(url)) {
    showNotice('当前页面不支持翻译（浏览器内置页面）');
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'translatePage',
      targetLang: $targetLang.value
    });
    window.close();
  } catch (e) {
    showNotice('无法连接当前页面，请刷新页面后重试');
  }
}

// ===== 结果区提示 =====
function showNotice(message) {
  $resultArea.style.display = 'block';
  $resultText.textContent = message;
  $resultSource.style.display = 'none';
}

// ===== 切换翻译优先级 =====
async function togglePriority() {
  const config = await chrome.storage.sync.get(['translateSettings']);
  const settings = config.translateSettings || {};

  const newMode = settings.llmPriority ? 'dictionary' : 'llm';
  await chrome.storage.sync.set({
    translateSettings: {
      ...settings,
      llmPriority: newMode === 'llm'
    }
  });

  $modeLabel.textContent = newMode === 'llm' ? 'AI 优先' : '词库优先';
}

// ===== 启动 =====
init();
