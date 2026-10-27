/**
 * TranslateAI - 内置词库模块
 * 支持中英双向词典查询
 */

const Dictionary = (() => {
  // 内置基础词库（中英常用词汇）
  const builtinDict = {
    // ===== 基础词汇 =====
    'hello': { en: 'hello', zh: '你好', pos: 'int.' },
    'world': { en: 'world', zh: '世界', pos: 'n.' },
    'translate': { en: 'translate', zh: '翻译', pos: 'v.' },
    'language': { en: 'language', zh: '语言', pos: 'n.' },
    'word': { en: 'word', zh: '单词', pos: 'n.' },
    'text': { en: 'text', zh: '文本', pos: 'n.' },
    'browser': { en: 'browser', zh: '浏览器', pos: 'n.' },
    'extension': { en: 'extension', zh: '扩展', pos: 'n.' },
    'chrome': { en: 'Chrome', zh: '谷歌浏览器', pos: 'n.' },
    'google': { en: 'Google', zh: '谷歌', pos: 'n.' },
    'ai': { en: 'AI', zh: '人工智能', pos: 'n.' },
    'artificial': { en: 'artificial', zh: '人造的', pos: 'adj.' },
    'intelligence': { en: 'intelligence', zh: '智能', pos: 'n.' },
    'model': { en: 'model', zh: '模型', pos: 'n.' },
    'large': { en: 'large', zh: '大的', pos: 'adj.' },
    'language': { en: 'language', zh: '语言', pos: 'n.' },
    'model': { en: 'model', zh: '模型', pos: 'n.' },
    '你好': { en: 'hello', zh: '你好', pos: 'phrase' },
    '世界': { en: 'world', zh: '世界', pos: 'n.' },
    '翻译': { en: 'translate', zh: '翻译', pos: 'v.' },
    '语言': { en: 'language', zh: '语言', pos: 'n.' },
    '浏览器': { en: 'browser', zh: '浏览器', pos: 'n.' },
    '扩展': { en: 'extension', zh: '扩展', pos: 'n.' },
    '人工智能': { en: 'AI', zh: '人工智能', pos: 'n.' },
    '模型': { en: 'model', zh: '模型', pos: 'n.' },

    // ===== 常用动词 =====
    'be': { en: 'be', zh: '是', pos: 'v.' },
    'have': { en: 'have', zh: '有', pos: 'v.' },
    'do': { en: 'do', zh: '做', pos: 'v.' },
    'make': { en: 'make', zh: '制作', pos: 'v.' },
    'go': { en: 'go', zh: '去', pos: 'v.' },
    'come': { en: 'come', zh: '来', pos: 'v.' },
    'see': { en: 'see', zh: '看见', pos: 'v.' },
    'look': { en: 'look', zh: '看', pos: 'v.' },
    'say': { en: 'say', zh: '说', pos: 'v.' },
    'tell': { en: 'tell', zh: '告诉', pos: 'v.' },
    'give': { en: 'give', zh: '给', pos: 'v.' },
    'take': { en: 'take', zh: '拿', pos: 'v.' },
    'use': { en: 'use', zh: '使用', pos: 'v.' },
    'find': { en: 'find', zh: '找到', pos: 'v.' },
    'know': { en: 'know', zh: '知道', pos: 'v.' },
    'think': { en: 'think', zh: '思考', pos: 'v.' },
    'want': { en: 'want', zh: '想要', pos: 'v.' },
    'need': { en: 'need', zh: '需要', pos: 'v.' },
    'like': { en: 'like', zh: '喜欢', pos: 'v.' },
    'love': { en: 'love', zh: '爱', pos: 'v.' },
    '是': { en: 'be', zh: '是', pos: 'v.' },
    '有': { en: 'have', zh: '有', pos: 'v.' },
    '做': { en: 'do', zh: '做', pos: 'v.' },
    '使用': { en: 'use', zh: '使用', pos: 'v.' },
    '需要': { en: 'need', zh: '需要', pos: 'v.' },
    '喜欢': { en: 'like', zh: '喜欢', pos: 'v.' },
    '爱': { en: 'love', zh: '爱', pos: 'v.' },

    // ===== 常用名词 =====
    'computer': { en: 'computer', zh: '计算机', pos: 'n.' },
    'phone': { en: 'phone', zh: '电话', pos: 'n.' },
    'internet': { en: 'internet', zh: '互联网', pos: 'n.' },
    'data': { en: 'data', zh: '数据', pos: 'n.' },
    'information': { en: 'information', zh: '信息', pos: 'n.' },
    'system': { en: 'system', zh: '系统', pos: 'n.' },
    'network': { en: 'network', zh: '网络', pos: 'n.' },
    'server': { en: 'server', zh: '服务器', pos: 'n.' },
    'cloud': { en: 'cloud', zh: '云', pos: 'n.' },
    'software': { en: 'software', zh: '软件', pos: 'n.' },
    'hardware': { en: 'hardware', zh: '硬件', pos: 'n.' },
    'code': { en: 'code', zh: '代码', pos: 'n.' },
    'program': { en: 'program', zh: '程序', pos: 'n.' },
    'algorithm': { en: 'algorithm', zh: '算法', pos: 'n.' },
    'computer': { en: 'computer', zh: '计算机', pos: 'n.' },
    '计算机': { en: 'computer', zh: '计算机', pos: 'n.' },
    '互联网': { en: 'internet', zh: '互联网', pos: 'n.' },
    '数据': { en: 'data', zh: '数据', pos: 'n.' },
    '信息': { en: 'information', zh: '信息', pos: 'n.' },
    '系统': { en: 'system', zh: '系统', pos: 'n.' },
    '网络': { en: 'network', zh: '网络', pos: 'n.' },
    '服务器': { en: 'server', zh: '服务器', pos: 'n.' },
    '代码': { en: 'code', zh: '代码', pos: 'n.' },
    '程序': { en: 'program', zh: '程序', pos: 'n.' },
    '算法': { en: 'algorithm', zh: '算法', pos: 'n.' },

    // ===== 常用形容词 =====
    'good': { en: 'good', zh: '好的', pos: 'adj.' },
    'bad': { en: 'bad', zh: '坏的', pos: 'adj.' },
    'big': { en: 'big', zh: '大的', pos: 'adj.' },
    'small': { en: 'small', zh: '小的', pos: 'adj.' },
    'new': { en: 'new', zh: '新的', pos: 'adj.' },
    'old': { en: 'old', zh: '旧的', pos: 'adj.' },
    'fast': { en: 'fast', zh: '快的', pos: 'adj.' },
    'slow': { en: 'slow', zh: '慢的', pos: 'adj.' },
    'easy': { en: 'easy', zh: '容易的', pos: 'adj.' },
    'hard': { en: 'hard', zh: '困难的', pos: 'adj.' },
    'important': { en: 'important', zh: '重要的', pos: 'adj.' },
    'different': { en: 'different', zh: '不同的', pos: 'adj.' },
    'same': { en: 'same', zh: '相同的', pos: 'adj.' },
    'better': { en: 'better', zh: '更好的', pos: 'adj.' },
    'best': { en: 'best', zh: '最好的', pos: 'adj.' },
    '好的': { en: 'good', zh: '好的', pos: 'adj.' },
    '坏的': { en: 'bad', zh: '坏的', pos: 'adj.' },
    '大的': { en: 'big', zh: '大的', pos: 'adj.' },
    '小的': { en: 'small', zh: '小的', pos: 'adj.' },
    '新的': { en: 'new', zh: '新的', pos: 'adj.' },
    '快的': { en: 'fast', zh: '快的', pos: 'adj.' },
    '容易的': { en: 'easy', zh: '容易的', pos: 'adj.' },
    '重要的': { en: 'important', zh: '重要的', pos: 'adj.' },

    // ===== 常用副词 =====
    'very': { en: 'very', zh: '非常', pos: 'adv.' },
    'too': { en: 'too', zh: '太', pos: 'adv.' },
    'also': { en: 'also', zh: '也', pos: 'adv.' },
    'only': { en: 'only', zh: '只', pos: 'adv.' },
    'always': { en: 'always', zh: '总是', pos: 'adv.' },
    'never': { en: 'never', zh: '从不', pos: 'adv.' },
    'sometimes': { en: 'sometimes', zh: '有时', pos: 'adv.' },
    'very': { en: 'very', zh: '非常', pos: 'adv.' },
    '非常': { en: 'very', zh: '非常', pos: 'adv.' },
    '总是': { en: 'always', zh: '总是', pos: 'adv.' },

    // ===== 常用连词 =====
    'and': { en: 'and', zh: '和', pos: 'conj.' },
    'but': { en: 'but', zh: '但是', pos: 'conj.' },
    'or': { en: 'or', zh: '或者', pos: 'conj.' },
    'because': { en: 'because', zh: '因为', pos: 'conj.' },
    'so': { en: 'so', zh: '所以', pos: 'conj.' },
    'if': { en: 'if', zh: '如果', pos: 'conj.' },
    '和': { en: 'and', zh: '和', pos: 'conj.' },
    '但是': { en: 'but', zh: '但是', pos: 'conj.' },
    '或者': { en: 'or', zh: '或者', pos: 'conj.' },
    '因为': { en: 'because', zh: '因为', pos: 'conj.' },
    '所以': { en: 'so', zh: '所以', pos: 'conj.' },
    '如果': { en: 'if', zh: '如果', pos: 'conj.' },

    // ===== 常用介词 =====
    'in': { en: 'in', zh: '在...里', pos: 'prep.' },
    'on': { en: 'on', zh: '在...上', pos: 'prep.' },
    'at': { en: 'at', zh: '在', pos: 'prep.' },
    'to': { en: 'to', zh: '到', pos: 'prep.' },
    'for': { en: 'for', zh: '为了', pos: 'prep.' },
    'with': { en: 'with', zh: '和', pos: 'prep.' },
    'from': { en: 'from', zh: '从', pos: 'prep.' },
    'of': { en: 'of', zh: '的', pos: 'prep.' },

    // ===== 常用短语 =====
    'thank you': { en: 'thank you', zh: '谢谢', pos: 'phrase' },
    'excuse me': { en: 'excuse me', zh: '打扰一下', pos: 'phrase' },
    'sorry': { en: 'sorry', zh: '对不起', pos: 'phrase' },
    'no problem': { en: 'no problem', zh: '没问题', pos: 'phrase' },
    'good morning': { en: 'good morning', zh: '早上好', pos: 'phrase' },
    'good afternoon': { en: 'good afternoon', zh: '下午好', pos: 'phrase' },
    'good evening': { en: 'good evening', zh: '晚上好', pos: 'phrase' },
    'good night': { en: 'good night', zh: '晚安', pos: 'phrase' },
    'how much': { en: 'how much', zh: '多少钱', pos: 'phrase' },
    'how many': { en: 'how many', zh: '多少', pos: 'phrase' },
    '谢谢': { en: 'thank you', zh: '谢谢', pos: 'phrase' },
    '对不起': { en: 'sorry', zh: '对不起', pos: 'phrase' },
    '没问题': { en: 'no problem', zh: '没问题', pos: 'phrase' },
    '早上好': { en: 'good morning', zh: '早上好', pos: 'phrase' },
    '晚安': { en: 'good night', zh: '晚安', pos: 'phrase' },

    // ===== 科技术语 =====
    'api': { en: 'API', zh: '应用程序接口', pos: 'n.' },
    'http': { en: 'HTTP', zh: '超文本传输协议', pos: 'n.' },
    'https': { en: 'HTTPS', zh: '安全超文本传输协议', pos: 'n.' },
    'json': { en: 'JSON', zh: 'JSON数据格式', pos: 'n.' },
    'xml': { en: 'XML', zh: '可扩展标记语言', pos: 'n.' },
    'url': { en: 'URL', zh: '统一资源定位符', pos: 'n.' },
    'database': { en: 'database', zh: '数据库', pos: 'n.' },
    'framework': { en: 'framework', zh: '框架', pos: 'n.' },
    'library': { en: 'library', zh: '库', pos: 'n.' },
    'developer': { en: 'developer', zh: '开发者', pos: 'n.' },
    'programming': { en: 'programming', zh: '编程', pos: 'n.' },
    'coding': { en: 'coding', zh: '编码', pos: 'n.' },
    'debug': { en: 'debug', zh: '调试', pos: 'v.' },
    'compile': { en: 'compile', zh: '编译', pos: 'v.' },
    'deploy': { en: 'deploy', zh: '部署', pos: 'v.' },
    'database': { en: 'database', zh: '数据库', pos: 'n.' },
    '框架': { en: 'framework', zh: '框架', pos: 'n.' },
    '开发者': { en: 'developer', zh: '开发者', pos: 'n.' },
    '编程': { en: 'programming', zh: '编程', pos: 'n.' },
    '调试': { en: 'debug', zh: '调试', pos: 'v.' },
    '编译': { en: 'compile', zh: '编译', pos: 'v.' },
    '部署': { en: 'deploy', zh: '部署', pos: 'v.' },

    // ===== 生活词汇 =====
    'time': { en: 'time', zh: '时间', pos: 'n.' },
    'day': { en: 'day', zh: '天', pos: 'n.' },
    'year': { en: 'year', zh: '年', pos: 'n.' },
    'month': { en: 'month', zh: '月', pos: 'n.' },
    'week': { en: 'week', zh: '周', pos: 'n.' },
    'hour': { en: 'hour', zh: '小时', pos: 'n.' },
    'minute': { en: 'minute', zh: '分钟', pos: 'n.' },
    'second': { en: 'second', zh: '秒', pos: 'n.' },
    'today': { en: 'today', zh: '今天', pos: 'n.' },
    'tomorrow': { en: 'tomorrow', zh: '明天', pos: 'n.' },
    'yesterday': { en: 'yesterday', zh: '昨天', pos: 'n.' },
    'morning': { en: 'morning', zh: '早上', pos: 'n.' },
    'afternoon': { en: 'afternoon', zh: '下午', pos: 'n.' },
    'evening': { en: 'evening', zh: '晚上', pos: 'n.' },
    'night': { en: 'night', zh: '夜晚', pos: 'n.' },
    'now': { en: 'now', zh: '现在', pos: 'adv.' },
    'later': { en: 'later', zh: '稍后', pos: 'adv.' },
    'early': { en: 'early', zh: '早', pos: 'adj.' },
    'late': { en: 'late', zh: '晚', pos: 'adj.' },
    '时间': { en: 'time', zh: '时间', pos: 'n.' },
    '今天': { en: 'today', zh: '今天', pos: 'n.' },
    '明天': { en: 'tomorrow', zh: '明天', pos: 'n.' },
    '昨天': { en: 'yesterday', zh: '昨天', pos: 'n.' },
    '早上': { en: 'morning', zh: '早上', pos: 'n.' },
    '下午': { en: 'afternoon', zh: '下午', pos: 'n.' },
    '晚上': { en: 'evening', zh: '晚上', pos: 'n.' },
    '现在': { en: 'now', zh: '现在', pos: 'adv.' },

    // ===== 常用数字 =====
    'one': { en: 'one', zh: '一', pos: 'num.' },
    'two': { en: 'two', zh: '二', pos: 'num.' },
    'three': { en: 'three', zh: '三', pos: 'num.' },
    'four': { en: 'four', zh: '四', pos: 'num.' },
    'five': { en: 'five', zh: '五', pos: 'num.' },
    'six': { en: 'six', zh: '六', pos: 'num.' },
    'seven': { en: 'seven', zh: '七', pos: 'num.' },
    'eight': { en: 'eight', zh: '八', pos: 'num.' },
    'nine': { en: 'nine', zh: '九', pos: 'num.' },
    'ten': { en: 'ten', zh: '十', pos: 'num.' },
    '一': { en: 'one', zh: '一', pos: 'num.' },
    '二': { en: 'two', zh: '二', pos: 'num.' },
    '三': { en: 'three', zh: '三', pos: 'num.' },
    '四': { en: 'four', zh: '四', pos: 'num.' },
    '五': { en: 'five', zh: '五', pos: 'num.' },
    '六': { en: 'six', zh: '六', pos: 'num.' },
    '七': { en: 'seven', zh: '七', pos: 'num.' },
    '八': { en: 'eight', zh: '八', pos: 'num.' },
    '九': { en: 'nine', zh: '九', pos: 'num.' },
    '十': { en: 'ten', zh: '十', pos: 'num.' },
  };

  /**
   * 查询词库
   * @param {string} word - 要查询的单词或短语
   * @param {string} sourceLang - 源语言 (en/zh)
   * @param {string} targetLang - 目标语言 (en/zh)
   * @returns {Object|null} 翻译结果或 null
   */
  function lookup(word, sourceLang = 'en', targetLang = 'zh') {
    if (!word) return null;

    const lowerWord = word.toLowerCase().trim();
    const entry = builtinDict[lowerWord] || builtinDict[word.trim()];

    if (!entry) return null;

    // 源语言与目标语言相同时，保持原文（不做反向翻译）
    if (sourceLang === targetLang) {
      return { word: word.trim(), translation: word.trim(), pos: entry.pos, source: 'dictionary' };
    }

    if (sourceLang === 'en' && targetLang === 'zh') {
      return { word: lowerWord, translation: entry.zh, pos: entry.pos, source: 'dictionary' };
    }

    if (sourceLang === 'zh' && targetLang === 'en') {
      return { word: word.trim(), translation: entry.en, pos: entry.pos, source: 'dictionary' };
    }

    return null;
  }

  /**
   * 批量查询词库
   * @param {Array<string>} words - 单词数组
   * @param {string} sourceLang - 源语言
   * @param {string} targetLang - 目标语言
   * @returns {Array<Object>} 翻译结果数组
   */
  function lookupBatch(words, sourceLang = 'en', targetLang = 'zh') {
    return words.map(word => ({
      word,
      result: lookup(word, sourceLang, targetLang)
    }));
  }

  /**
   * 获取词库统计信息
   */
  function getStats() {
    return {
      total: Object.keys(builtinDict).length,
      languages: ['en', 'zh']
    };
  }

  return {
    lookup,
    lookupBatch,
    getStats,
    builtinDict
  };
})();

// ES Module 导出
export default Dictionary;
export { Dictionary };
