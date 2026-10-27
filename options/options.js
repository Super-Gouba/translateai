/**
 * TranslateAI - Options Page Script
 */

// ===== DOM 元素 =====
const $sourceLang = document.getElementById('sourceLang');
const $targetLang = document.getElementById('targetLang');
const $hoverTranslation = document.getElementById('hoverTranslation');
const $autoTranslateOnLoad = document.getElementById('autoTranslateOnLoad');
const $llmPriority = document.getElementById('llmPriority');
const $llmEnabled = document.getElementById('llmEnabled');
const $llmConfig = document.getElementById('llmConfig');
const $llmApiUrl = document.getElementById('llmApiUrl');
const $llmApiKey = document.getElementById('llmApiKey');
const $llmModel = document.getElementById('llmModel');
const $llmTemperature = document.getElementById('llmTemperature');
const $exportDict = document.getElementById('exportDict');
const $importDict = document.getElementById('importDict');
const $dictFile = document.getElementById('dictFile');
const $testLLM = document.getElementById('testLLM');
const $saveLLM = document.getElementById('saveLLM');
const $llmTestResult = document.getElementById('llmTestResult');
const $resetBtn = document.getElementById('resetBtn');
const $saveStatus = document.getElementById('saveStatus');
const $presetBtns = document.querySelectorAll('.preset-btn');
const $dictTotal = document.getElementById('dictTotal');
const $dictEn = document.getElementById('dictEn');
const $dictZh = document.getElementById('dictZh');

// ===== 服务商预设 =====
const PROVIDER_PRESETS = {
  deepseek: {
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
  },
  openai: {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini'
  },
  qwen: {
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-turbo'
  },
  ollama: {
    apiUrl: 'http://localhost:11434/v1/chat/completions',
    model: 'qwen2'
  }
};

// ===== 应用预设 =====
function applyPreset(key) {
  const preset = PROVIDER_PRESETS[key];
  if (!preset) return;

  $llmApiUrl.value = preset.apiUrl;
  $llmModel.value = preset.model;
  if (!$llmTemperature.value) $llmTemperature.value = '0.3';

  $presetBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === key);
  });

  showSaveStatus('预设已填入，请粘贴 API Key 后点击保存配置');
}

// ===== 初始化 =====
async function init() {
  await loadSettings();
  await loadDictStats();
  bindEvents();
  initNavSpy();
}

// ===== 侧边栏导航高亮 =====
function initNavSpy() {
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  if (!navItems.length) return;

  const setActive = (id) => {
    navItems.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
  };

  const sections = navItems
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-15% 0px -70% 0px' });

  sections.forEach(section => observer.observe(section));
  navItems.forEach(a => {
    a.addEventListener('click', () => setActive(a.getAttribute('href').slice(1)));
  });
}

// ===== 加载词库统计 =====
async function loadDictStats() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getDictionaryStats' });
    if (response && response.success && response.data) {
      $dictTotal.textContent = response.data.total;
      $dictEn.textContent = response.data.en;
      $dictZh.textContent = response.data.zh;
    }
  } catch (e) {
    // 忽略
  }
}

// ===== 加载设置 =====
async function loadSettings() {
  const config = await chrome.storage.sync.get(['llmConfig', 'translateSettings']);

  const settings = config.translateSettings || {};
  $sourceLang.value = settings.sourceLang || 'auto';
  $targetLang.value = settings.targetLang || 'zh';
  $hoverTranslation.checked = settings.hoverTranslation !== false;
  $autoTranslateOnLoad.checked = settings.autoTranslateOnLoad === true;
  $llmPriority.checked = settings.llmPriority === true;

  const llm = config.llmConfig || {};
  $llmEnabled.checked = llm.enabled === true;
  $llmApiUrl.value = llm.apiUrl || '';
  $llmApiKey.value = llm.apiKey || '';
  $llmModel.value = llm.model || '';
  $llmTemperature.value = llm.temperature !== undefined ? llm.temperature : 0.3;

  // 首次使用：默认填入 DeepSeek 预设
  if (!llm.apiUrl) {
    applyPreset('deepseek');
  } else {
    markActivePreset(llm.apiUrl);
  }

  toggleLLMConfig();
}

// ===== 标记当前预设 =====
function markActivePreset(apiUrl) {
  let matched = '';
  for (const [key, preset] of Object.entries(PROVIDER_PRESETS)) {
    if (preset.apiUrl === apiUrl) matched = key;
  }
  $presetBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === matched);
  });
}

// ===== 保存翻译设置 =====
async function saveSettings() {
  const settings = {
    sourceLang: $sourceLang.value,
    targetLang: $targetLang.value,
    hoverTranslation: $hoverTranslation.checked,
    autoTranslateOnLoad: $autoTranslateOnLoad.checked,
    llmPriority: $llmPriority.checked
  };

  await chrome.storage.sync.set({ translateSettings: settings });
  showSaveStatus('翻译设置已保存');
}

// ===== 保存大模型配置 =====
async function saveLLMConfig() {
  const apiUrl = $llmApiUrl.value.trim();
  const apiKey = $llmApiKey.value.trim();

  // 开启 API 时必须填写地址和 Key
  if ($llmEnabled.checked) {
    if (!apiUrl || !apiKey) {
      showSaveStatus('请先填写 API 地址和 API Key');
      return;
    }
    if (!/^https?:\/\//.test(apiUrl)) {
      showSaveStatus('API 地址需以 http:// 或 https:// 开头');
      return;
    }
  }

  const llmConfig = {
    enabled: $llmEnabled.checked,
    apiUrl: apiUrl,
    apiKey: apiKey,
    model: $llmModel.value.trim(),
    temperature: parseFloat($llmTemperature.value) || 0.3
  };

  await chrome.storage.sync.set({ llmConfig });
  showSaveStatus('大模型配置已保存');
}

// ===== 切换 LLM 配置显示 =====
function toggleLLMConfig() {
  if ($llmEnabled.checked) {
    $llmConfig.style.display = 'block';
    // 开启但未填地址时，自动带上 DeepSeek 预设
    if (!$llmApiUrl.value) applyPreset('deepseek');
  } else {
    $llmConfig.style.display = 'none';
  }
}

// ===== 测试大模型连接 =====
async function testLLM() {
  $llmTestResult.className = 'test-result';
  $llmTestResult.textContent = '正在测试连接...';
  $llmTestResult.style.display = 'block';

  const apiUrl = $llmApiUrl.value;
  const apiKey = $llmApiKey.value;
  const model = $llmModel.value;

  if (!apiUrl || !apiKey) {
    $llmTestResult.className = 'test-result error';
    $llmTestResult.textContent = '请填写 API 地址和 API Key';
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages: [
          { role: 'user', content: '测试' }
        ],
        max_tokens: 10
      })
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply) {
        $llmTestResult.className = 'test-result success';
        $llmTestResult.textContent = `连接成功！模型回复: "${reply}"`;
      } else {
        $llmTestResult.className = 'test-result success';
        $llmTestResult.textContent = '连接成功，但未收到回复内容';
      }
    } else {
      const errorText = await response.text();
      $llmTestResult.className = 'test-result error';
      $llmTestResult.textContent = `连接失败 (${response.status}): ${errorText.substring(0, 100)}`;
    }
  } catch (e) {
    $llmTestResult.className = 'test-result error';
    $llmTestResult.textContent = `请求失败: ${e.message}`;
  }
}

// ===== 导出词库 =====
async function exportDictionary() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'exportDictionary' });
    if (!response || !response.success) {
      showSaveStatus('导出失败，请重试');
      return;
    }

    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translateai-dict.json';
    a.click();
    URL.revokeObjectURL(url);
    showSaveStatus('词库已导出');
  } catch (e) {
    showSaveStatus('导出失败：' + e.message);
  }
}

// ===== 导入词库 =====
function importDictionary(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      // 兼容 { entries: {...} } 和直接是词条映射两种格式
      const entries = data.entries && typeof data.entries === 'object' ? data.entries : data;

      const response = await chrome.runtime.sendMessage({
        action: 'importDictionary',
        entries: entries
      });

      if (response && response.success) {
        showSaveStatus(`已导入 ${response.data.count} 个词条`);
        await loadDictStats();
      } else {
        showSaveStatus('导入失败：' + ((response && response.error) || '未知错误'));
      }
    } catch (err) {
      showSaveStatus('导入失败：文件不是合法的 JSON');
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // 允许重复选择同一文件
}

// ===== 恢复默认 =====
async function resetSettings() {
  await chrome.storage.sync.set({
    translateSettings: {
      sourceLang: 'auto',
      targetLang: 'zh',
      hoverTranslation: true,
      autoTranslateOnLoad: false,
      llmPriority: false
    },
    llmConfig: {
      enabled: false,
      apiUrl: '',
      apiKey: '',
      model: '',
      temperature: 0.3
    }
  });

  location.reload();
}

// ===== 显示保存状态 =====
function showSaveStatus(message) {
  $saveStatus.textContent = message;
  setTimeout(() => $saveStatus.textContent = '', 2000);
}

// ===== 绑定事件 =====
function bindEvents() {
  $llmEnabled.addEventListener('change', toggleLLMConfig);

  // 服务商预设
  $presetBtns.forEach(btn => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });

  // 保存翻译设置
  $sourceLang.addEventListener('change', saveSettings);
  $targetLang.addEventListener('change', saveSettings);
  $hoverTranslation.addEventListener('change', saveSettings);
  $autoTranslateOnLoad.addEventListener('change', saveSettings);
  $llmPriority.addEventListener('change', saveSettings);

  // 保存 LLM 配置
  $saveLLM.addEventListener('click', saveLLMConfig);
  $testLLM.addEventListener('click', testLLM);

  // 词库
  $exportDict.addEventListener('click', exportDictionary);
  $importDict.addEventListener('click', () => $dictFile.click());
  $dictFile.addEventListener('change', importDictionary);

  // 重置
  $resetBtn.addEventListener('click', resetSettings);
}

// ===== 启动 =====
init();
