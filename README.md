# TranslateAI - Chrome 翻译插件

一款支持**内置词库翻译**和**大模型 AI 翻译**的 Chrome 浏览器扩展。

中文 | [English](README.en.md)

## 截图

截图待补充，拍摄要求与文件命名见 [screenshots/README.md](screenshots/README.md)。

## 功能特性

- **划词翻译**：鼠标选中文字，自动弹出翻译提示框
- **弹窗翻译**：点击工具栏图标，输入文本即时翻译
- **整页翻译**：右键菜单一键翻译整个网页
- **词库优先**：内置中英常用词汇库，离线精确匹配，未收录内容自动转大模型
- **AI 增强**：支持 OpenAI、DeepSeek、通义千问等兼容接口，可翻译任意语言
- **目标语言固定**：设置成中文后，英文、俄文、阿拉伯文、日文等任何语言都统一翻译成中文，不会反向往回翻
- **源语言自动识别**：按文字体系识别中/日/韩/俄/阿/泰等语种，已是目标语言的内容自动跳过
- **双向翻译**：中英互译，支持交换语言方向

## 安装方法

### 1. 开发者模式加载（推荐）

1. 打开 Chrome 浏览器，地址栏输入 `chrome://extensions/`
2. 右上角打开「开发者模式」开关
3. 点击左上角「加载已解压的扩展程序」
4. 选择本插件目录（`temp_20261027_01`）
5. 插件即安装成功，工具栏会出现 ⚡ 图标

### 2. 打包成 CRX（可选）

```bash
# 在扩展目录中执行
chrome --pack-extension=C:\path\to\temp_20261027_01 --pack-extension-key=your_key.pem
```

生成 `.crx` 文件后，可直接拖拽到 Chrome 扩展页面安装。

## 使用方法

### 划词翻译
1. 在任意网页选中需要翻译的文字
2. 鼠标悬停，自动弹出翻译结果
3. 结果标注来源：`词库` 或 `AI`

### 弹窗翻译
1. 点击工具栏 ⚡ 图标打开翻译面板
2. 输入或粘贴要翻译的文本
3. 选择源语言和目标语言
4. 点击「翻译」或按 Enter 键

### 整页翻译
1. 在网页任意位置右键
2. 选择「翻译整个页面」
3. 页面内容将被翻译为目标语言

### 右键菜单翻译
1. 选中文字
2. 右键选择「使用 TranslateAI 翻译」

## 配置大模型

插件默认使用内置词库翻译。如需更精准的翻译，请配置大模型：

1. 点击工具栏图标 → ⚙️ 设置
2. 在「大模型 API」区域打开开关
3. **点击「快速预设」中的服务商按钮**（DeepSeek / OpenAI / 通义千问 / 本地 Ollama），地址与模型会自动填入
4. 只需粘贴你的 **API Key**，点击「测试连接」验证后「保存配置」

### 支持的大模型平台

| 平台 | API 地址 | 推荐模型 |
|------|----------|----------|
| OpenAI | `https://api.openai.com/v1/chat/completions` | `gpt-4o-mini`, `gpt-3.5-turbo` |
| DeepSeek | `https://api.deepseek.com/v1/chat/completions` | `deepseek-chat` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` | `qwen-turbo` |
| Moonshot | `https://api.moonshot.cn/v1/chat/completions` | `moonshot-v1-8k` |
| 本地 Ollama | `http://localhost:11434/v1/chat/completions` | `qwen2`, `llama3` |

## 翻译模式说明

- **词库优先模式**（默认）：先查词库，未命中再调用 AI
- **AI 优先模式**：优先使用大模型翻译，词库作为备选

可在设置页切换翻译优先级。自定义词库支持任意目标语言，优先级高于内置词库。

## 自定义词库

设置页 →「词库管理」：

- **导出**：下载当前内置词库 + 已导入的自定义词条（JSON）
- **导入**：合并进本地自定义词库，命中后不再调用大模型，省 token 也更快

词条格式（两种都支持）：

```json
{
  "hello": { "en": "hello", "zh": "你好", "pos": "int." },
  "world": { "en": "world", "translations": { "zh": "世界", "ja": "世界" } }
}
```

也接受 `{ "entries": { ... } }` 形式的导出文件，导入时会自动合并。

## 文件结构

```
translateai/
├── manifest.json          # 扩展清单（Manifest V3）
├── LICENSE                # MIT 许可证
├── lib/
│   └── dictionary.js       # 内置词库模块（ES Module）
├── background/
│   └── background.js       # Service Worker（菜单、消息、API调用）
├── content/
│   ├── content.js          # 划词翻译、页面翻译
│   └── content.css         # 提示框样式
├── popup/
│   ├── popup.html          # 弹窗界面
│   ├── popup.css           # 弹窗样式
│   └── popup.js            # 弹窗逻辑
├── options/
│   ├── options.html        # 设置页面
│   ├── options.css         # 设置样式
│   └── options.js          # 设置逻辑
├── screenshots/            # 截图与拍摄指引
├── icons/
│   ├── icon16.png          # 16x16 图标
│   ├── icon32.png          # 32x32 图标
│   ├── icon48.png          # 48x48 图标
│   └── icon128.png         # 128x128 图标
├── README.md               # 中文文档（本文档）
└── README.en.md            # 英文文档
```

## 技术栈

- **Manifest V3**：Chrome 扩展最新标准
- **ES Modules**：模块化代码组织
- **Chrome Storage API**：本地存储配置
- **Chrome Context Menus API**：右键菜单
- **Chrome Tabs API**：跨页面通信
- **Fetch API**：大模型 HTTP 调用

## 隐私说明

- 翻译文本仅发送到你配置的大模型 API，不经过任何第三方服务器
- API Key 与设置保存在浏览器扩展存储中；使用 `chrome.storage.sync` 时会随 Chrome 账号同步，如不希望同步可改为 `chrome.storage.local`
- 插件不收集、不上报任何用户数据

## 常见问题

**Q: 词库翻译没有结果？**
A: 内置词库仅含常用词汇。请在设置中配置大模型 API 以获得完整翻译能力。

**Q: 大模型 API 调用失败？**
A: 检查 API 地址、Key 是否正确，模型名称是否支持。点击「测试连接」排查。

**Q: 整页翻译会修改网页吗？**
A: 是的，整页翻译会替换页面文本节点内容。可随时点击「撤销」恢复原页面。

**Q: 支持哪些语言？**
A: 目标语言可选 16 种（中/英/日/韩/俄/阿/法/德/西/葡/意/泰/越/土/印地/印尼）。源语言保持「自动检测」，英文、俄文、阿拉伯文等都会统一翻译成你设定的目标语言。内置词库仅覆盖中英，其余语言需要大模型。

## 许可证

[MIT](LICENSE)
