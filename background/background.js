/**
 * TranslateAI - Background Service Worker
 * 处理上下文菜单、消息通信、大模型 API 调用
 */

// ===== 导入词库模块 =====
import Dictionary from '../lib/dictionary.js';

// ===== 上下文菜单 =====
chrome.runtime.onInstalled.addListener(() => {
  // 划词翻译菜单
  chrome.contextMenus.create({
    id: 'translate-selection',
    title: '使用 TranslateAI 翻译「%s」',
    contexts: ['selection']
  });

  // 整个页面翻译
  chrome.contextMenus.create({
    id: 'translate-page',
    title: '翻译整个页面',
    contexts: ['page']
  });
});

// ===== 上下文菜单点击 =====
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translate-selection') {
    const text = info.selectionText;
    if (text) {
      chrome.storage.sync.get(['translateSettings']).then(config => {
        const targetLang = (config.translateSettings || {}).targetLang || 'zh';
        return handleTranslate(text, 'auto', targetLang).then(result => {
          if (result && !result.sameLanguage) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'showTranslation',
              text: result.text || text,
              translation: result.translation,
              source: result.source
            });
          }
        });
      });
    }
  } else if (info.menuItemId === 'translate-page') {
    chrome.storage.sync.get(['translateSettings']).then(config => {
      const targetLang = (config.translateSettings || {}).targetLang || 'zh';
      chrome.tabs.sendMessage(tab.id, {
        action: 'translatePage',
        targetLang: targetLang
      });
    });
  }
});

// ===== 消息处理 =====
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'translateText') {
    handleTranslate(msg.text, msg.sourceLang, msg.targetLang)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 异步响应
  }

  if (msg.action === 'getDictionaryStats') {
    const keys = Object.keys(Dictionary.builtinDict);
    const en = keys.filter(k => /^[a-z][a-z0-9 '\-]*$/i.test(k)).length;
    sendResponse({ success: true, data: { total: keys.length, en, zh: keys.length - en } });
    return false;
  }

  // 导出词库（内置词条 + 自定义词条）
  if (msg.action === 'exportDictionary') {
    getUserDict().then(custom => {
      sendResponse({
        success: true,
        data: {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          entries: Dictionary.builtinDict,
          customEntries: custom
        }
      });
    });
    return true;
  }

  // 导入词库（合并进本地自定义词库）
  if (msg.action === 'importDictionary') {
    importUserDict(msg.entries)
      .then(count => sendResponse({ success: true, data: { count } }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  return false;
});

// ===== 自定义词库 =====
let userDictCache = null;

async function getUserDict() {
  if (userDictCache) return userDictCache;
  const stored = await chrome.storage.local.get('customDict');
  userDictCache = stored.customDict || {};
  return userDictCache;
}

async function importUserDict(entries) {
  if (!entries || typeof entries !== 'object') {
    throw new Error('词库文件格式不正确');
  }

  const current = await getUserDict();
  let count = 0;

  for (const [key, value] of Object.entries(entries)) {
    const word = String(key).trim().toLowerCase();
    if (!word || typeof value !== 'object' || value === null) continue;

    // 已内置且内容一致的词条无需重复存储，避免遮挡内置词库的后续更新
    const builtin = Dictionary.builtinDict[word];
    if (builtin && builtin.en === value.en && builtin.zh === value.zh && !value.translations) {
      continue;
    }

    // 统一成 { en, zh, translations? } 结构
    current[word] = {
      en: value.en || '',
      zh: value.zh || '',
      pos: value.pos || '',
      translations: value.translations && typeof value.translations === 'object'
        ? value.translations
        : undefined
    };
    count++;
  }

  await chrome.storage.local.set({ customDict: current });
  userDictCache = current;
  return count;
}

// 从自定义词条中取目标语言译文
function translateFromCustomEntry(entry, targetLang, original) {
  if (entry.translations && entry.translations[targetLang]) {
    return entry.translations[targetLang];
  }
  if (targetLang === 'zh' && entry.zh) return entry.zh;
  if (targetLang === 'en' && entry.en) return entry.en;
  if (entry.en === original && entry.zh) return entry.zh;
  return null;
}

// ===== 语言定义 =====
const LANGUAGE_NAMES = {
  zh: 'Simplified Chinese',
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean',
  ru: 'Russian',
  ar: 'Arabic',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  pt: 'Portuguese',
  it: 'Italian',
  th: 'Thai',
  vi: 'Vietnamese',
  tr: 'Turkish',
  hi: 'Hindi',
  id: 'Indonesian'
};

// 按文字体系识别语言（仅用于可靠可判的语种）
function detectScriptLang(text) {
  if (/[\u3040-\u30ff]/.test(text)) return 'ja';   // 日文假名
  if (/[\uac00-\ud7af]/.test(text)) return 'ko';   // 韩文
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';   // 汉字
  if (/[\u0400-\u04ff]/.test(text)) return 'ru';   // 西里尔文
  if (/[\u0600-\u06ff]/.test(text)) return 'ar';   // 阿拉伯文
  if (/[\u0e00-\u0e7f]/.test(text)) return 'th';   // 泰文
  if (/[\u0590-\u05ff]/.test(text)) return 'he';   // 希伯来文
  if (/[\u0900-\u097f]/.test(text)) return 'hi';   // 天城文
  return 'latin';                                  // 拉丁字母（语种不确定）
}

// ===== 翻译处理 =====
async function handleTranslate(text, sourceLang, targetLang) {
  if (!text) throw new Error('文本不能为空');

  const target = targetLang || 'zh';
  const source = sourceLang === 'auto' || !sourceLang ? detectScriptLang(text) : sourceLang;

  // 已是目标语言，直接原样返回，不做反向翻译
  if (source === target) {
    return {
      word: text,
      text: text,
      translation: text,
      source: 'same',
      sameLanguage: true
    };
  }

  const config = await chrome.storage.sync.get(['llmConfig', 'translateSettings']);
  const llmConfig = config.llmConfig || {};
  const settings = config.translateSettings || {};
  const llmReady = !!(llmConfig.enabled && llmConfig.apiKey);
  const llmFirst = settings.llmPriority === true;

  // AI 优先模式：大模型可用时先走大模型
  if (llmReady && llmFirst) {
    return await callLLM(text, target, llmConfig);
  }

  // 词库模式：先查自定义词库（支持任意目标语言），再查内置中英词库
  // 拉丁字母统一按英文尝试查词，命中即返回，未命中再交给大模型
  const dictSource = source === 'latin' ? 'en' : source;
  const dictResult = await tryDictionary(text, dictSource, target);
  if (dictResult) return dictResult;

  if (llmReady) {
    return await callLLM(text, target, llmConfig);
  }

  return {
    word: text,
    text: text,
    translation: `（词库未收录。目标语言「${LANGUAGE_NAMES[target] || target}」的完整翻译需在设置中配置大模型 API）`,
    source: 'unknown'
  };
}

// ===== 词库查询（只做精确匹配，避免把句子拆词误译）=====
async function tryDictionary(text, sourceLang, targetLang) {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 40) return null;

  // 1. 自定义词库优先，可支持任意目标语言
  try {
    const custom = await getUserDict();
    const entry = custom[trimmed.toLowerCase()] || custom[trimmed];
    if (entry) {
      const translation = translateFromCustomEntry(entry, targetLang, trimmed);
      if (translation && translation.trim() !== trimmed) {
        return {
          word: trimmed,
          text: text,
          translation: translation,
          pos: entry.pos || '',
          source: 'dictionary'
        };
      }
    }
  } catch (e) {
    // 忽略自定义词库读取失败，继续查内置词库
  }

  // 2. 内置词库仅覆盖中英
  if (targetLang !== 'zh' && targetLang !== 'en') return null;
  if (sourceLang !== 'zh' && sourceLang !== 'en') return null;
  if (sourceLang === targetLang) return null;

  try {
    const result = Dictionary.lookup(trimmed, sourceLang, targetLang);
    if (result) {
      result.text = text;
    }
    return result;
  } catch (e) {
    return null;
  }
}

// ===== 大模型 API 调用 =====
async function callLLM(text, targetLang, config) {
  const {
    apiUrl = 'https://api.deepseek.com/v1/chat/completions',
    apiKey,
    model = 'deepseek-chat',
    temperature = 0.3
  } = config;

  const targetName = LANGUAGE_NAMES[targetLang] || targetLang;

  const systemPrompt = 'You are a professional translator. Detect the source language automatically and translate into the requested target language. Keep the original meaning, tone and formatting. Output only the translation, with no explanations, notes or quotation marks.';

  const prompt = `Translate the following text into ${targetName}. The text may be in any language (English, Russian, Arabic, Japanese, etc.). If it is already entirely in ${targetName}, return it unchanged.\n\nText:\n${text}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: temperature
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const translation = data.choices?.[0]?.message?.content?.trim();

  if (!translation) throw new Error('API 未返回有效翻译');

  return {
    word: text,
    text: text,
    translation: translation,
    pos: '',
    source: 'llm'
  };
}
