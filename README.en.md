# TranslateAI — Chrome Translation Extension

A Chrome extension that translates with a **built-in offline dictionary** first, and falls back to **LLM translation** when you need better accuracy.

[中文文档](README.md) | English

## Features

- **Select-to-translate** — Select any text on a page and a translation card pops up automatically
- **Popup translation** — Click the toolbar icon, type or paste text, translate instantly
- **Whole-page translation** — One right-click translates the entire page, with an undo button
- **Dictionary first** — Ships with a built-in Chinese↔English glossary for instant offline lookups; anything not covered is sent to the LLM
- **LLM support** — Works with OpenAI, DeepSeek, Qwen and any OpenAI-compatible endpoint
- **Fixed target language** — Set the target to Chinese once, and English, Russian, Arabic, Japanese … all get translated into Chinese. No accidental reverse translation
- **Automatic source detection** — Detects Chinese / Japanese / Korean / Russian / Arabic / Thai by script, and skips content that is already in the target language
- **Bidirectional** — Chinese↔English with a one-click language swap

## Screenshots

Screenshots are pending. See [screenshots/README.md](screenshots/README.md) for the shot list and capture guidelines.

## Installation

### 1. Load as an unpacked extension (recommended)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** in the top-right corner
3. Click **Load unpacked**
4. Select this project folder
5. The ⚡ icon appears in the toolbar — you're done

### 2. Package as CRX (optional)

```bash
chrome --pack-extension=C:\path\to\translateai --pack-extension-key=your_key.pem
```

Drag the generated `.crx` file into the extensions page to install.

## Usage

### Select-to-translate
1. Select text on any web page
2. The translation card appears automatically
3. The card is tagged with its source: `Dictionary` or `AI`

### Popup translation
1. Click the ⚡ toolbar icon
2. Type or paste the text
3. Pick the target language (source stays on auto-detect)
4. Click **Translate** or press Enter

### Whole-page translation
1. Right-click anywhere on the page
2. Choose **Translate entire page**
3. The page is translated into your configured target language

### Context-menu translation
1. Select text
2. Right-click → **Translate with TranslateAI**

## Configuring an LLM

The extension works out of the box with the built-in dictionary. For accurate translation of arbitrary languages, configure an LLM:

1. Toolbar icon → ⚙️ **Settings**
2. Enable the **LLM API** switch
3. Click a **Quick preset** button (DeepSeek / OpenAI / Qwen / local Ollama) — endpoint and model are filled in for you
4. Paste your **API key**, click **Test connection**, then **Save**

### Supported providers

| Provider | Endpoint | Suggested model |
|----------|----------|-----------------|
| OpenAI | `https://api.openai.com/v1/chat/completions` | `gpt-4o-mini`, `gpt-3.5-turbo` |
| DeepSeek | `https://api.deepseek.com/v1/chat/completions` | `deepseek-chat` |
| Qwen (DashScope) | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` | `qwen-turbo` |
| Moonshot | `https://api.moonshot.cn/v1/chat/completions` | `moonshot-v1-8k` |
| Local Ollama | `http://localhost:11434/v1/chat/completions` | `qwen2`, `llama3` |

## Translation modes

- **Dictionary first** (default) — Look up the glossary, call the LLM only on a miss
- **AI first** — Always use the LLM, keep the glossary as fallback

Switch modes in Settings. Custom dictionary entries support any target language and take priority over the built-in glossary.

## Custom dictionary

Settings → **Dictionary**:

- **Export** — Download the built-in glossary plus your imported entries as JSON
- **Import** — Merge entries into a local custom dictionary; hits skip the LLM entirely, saving tokens and latency

Entry format (both forms are accepted):

```json
{
  "hello": { "en": "hello", "zh": "你好", "pos": "int." },
  "world": { "en": "world", "translations": { "zh": "世界", "ja": "世界" } }
}
```

Exported files shaped as `{ "entries": { ... } }` are also supported and merged on import.

## Project structure

```
translateai/
├── manifest.json           # Extension manifest (Manifest V3)
├── LICENSE                 # MIT license
├── lib/
│   └── dictionary.js       # Built-in glossary (ES Module)
├── background/
│   └── background.js       # Service worker (menus, messaging, API calls)
├── content/
│   ├── content.js          # Select-to-translate, page translation
│   └── content.css         # Translation card styles
├── popup/
│   ├── popup.html          # Popup UI
│   ├── popup.css           # Popup styles
│   └── popup.js            # Popup logic
├── options/
│   ├── options.html        # Settings page
│   ├── options.css         # Settings styles
│   └── options.js          # Settings logic
├── screenshots/            # Screenshots and capture guidelines
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── README.md               # Chinese docs
└── README.en.md            # English docs (this file)
```

## Tech stack

- **Manifest V3** — Current Chrome extension platform
- **ES Modules** — Modular code organisation
- **Chrome Storage API** — Configuration persistence
- **Chrome Context Menus API** — Right-click actions
- **Chrome Tabs API** — Cross-page messaging
- **Fetch API** — LLM HTTP calls

## Privacy

- Translated text is sent only to the LLM endpoint you configure — no third-party server in between
- API keys and settings live in extension storage; `chrome.storage.sync` syncs them with your Chrome account, which you can switch to `chrome.storage.local` if you'd rather not
- The extension collects and reports no user data

## FAQ

**Q: The dictionary lookup returns nothing.**
A: The built-in glossary only covers common words. Configure an LLM API to translate arbitrary text.

**Q: LLM requests fail.**
A: Check the endpoint, API key and model name. Use **Test connection** in Settings to narrow it down.

**Q: Does page translation modify the page?**
A: Yes — text nodes are replaced. Click **Undo** on the banner to restore the original content.

**Q: Which languages are supported?**
A: 16 target languages (Chinese, English, Japanese, Korean, Russian, Arabic, French, German, Spanish, Portuguese, Italian, Thai, Vietnamese, Turkish, Hindi, Indonesian). Source stays on auto-detect so English, Russian, Arabic and others all land in your configured target language. The built-in glossary only covers Chinese↔English; everything else needs an LLM.

## License

[MIT](LICENSE)
