<h1 align="center">
  <br>
  <img src="icons/icon128.png" alt="Slide Assist Logo" width="128">
  <br>
  Slide Assist
  <br>
</h1>

<h4 align="center">Your AI-Powered Presentation Copilot for Canva & Google Slides.</h4>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#installation">Installation</a> •
  <a href="#configuration">Configuration</a>
</p>

---

**Slide Assist** is a powerful, locally-installed Chrome Extension designed for professionals, consultants, and students. It natively hooks into Canva and Google Slides to automatically analyze your presentation decks, suggest high-converting copy, fetch verified real-world statistics, and generate boardroom-ready charts. 

## Features

✨ **Slide Audit (Copilot)**
- **Visual Analysis:** Captures your active slide and uses Vision AI to analyze layout, typography, and contrast.
- **Copywriting:** Suggests punchy, professional alternatives to your slide text.
- **One-Click Copy:** Easily click any suggested text to instantly copy it to your clipboard.

📊 **Chart Studio (Data Puller)**
- **Verified Statistics:** Type a metric (e.g., "SaaS Growth past 5 years") and the AI will scrape and aggregate real data into a clean table.
- **Boardroom Chart Generation:** Click "Generate Chart" to automatically render a think-cell style, high-definition data chart based perfectly on your custom color palette and font settings.
- **Font Scanner:** Automatically scans your current slide to detect the exact font family being used and applies it to your generated charts for seamless integration.

💬 **AI Chat Assistant**
- Ask questions, brainstorm presentation outlines, or refine your talking points with an integrated context-aware AI chatbot.

## Installation

Because this is a private developer extension, you can install it directly from this repository:

1. **Download/Clone** this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`
3. Toggle **Developer mode** ON in the top right corner.
4. Click **Load unpacked** in the top left corner.
5. Select the `slide-assist` folder you just downloaded.
6. The extension is now installed! Pin it to your Chrome toolbar for easy access.

## Configuration

Slide Assist supports multiple LLM providers. To use the AI features, you must configure your API keys:

1. Open the **Slide Assist** extension panel.
2. Navigate to the ⚙️ **Settings** tab.
3. Select your preferred provider (**Gemini**, **OpenAI**, or **Anthropic**).
4. Enter your API key (stored securely and locally on your device).
5. Click **Save Settings**. 

---

<p align="center">Built with Vanilla JS, HTML, CSS, and modern LLM APIs.</p>
