// background.js - Slide Assist Service Worker

// Enable side panel opening on extension icon click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Error setting side panel behavior:", error));

// Message Listener for screenshot capturing and CORS-free API routing
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureTab") {
    // Robust window query: get the window ID of the active tab
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
        // Fallback to active tab in currentWindow
        chrome.tabs.query({ active: true, currentWindow: true }, (fallbackTabs) => {
          if (chrome.runtime.lastError || !fallbackTabs || fallbackTabs.length === 0) {
            captureTab(null, sendResponse);
          } else {
            captureTab(fallbackTabs[0].windowId, sendResponse);
          }
        });
      } else {
        captureTab(tabs[0].windowId, sendResponse);
      }
    });
    return true; // Keep message channel open for async response
  }

  if (message.action === "callGemini") {
    callGeminiAPI(message.payload)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === "callOpenAI") {
    callOpenAIAPI(message.payload)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === "callAnthropic") {
    callAnthropicAPI(message.payload)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === "callImagen") {
    callImagenAPI(message.payload)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === "callDalle") {
    callDalleAPI(message.payload)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Capture helper function
function captureTab(windowId, sendResponse) {
  chrome.tabs.captureVisibleTab(windowId, { format: "jpeg", quality: 75 }, (dataUrl) => {
    if (chrome.runtime.lastError) {
      console.warn("Capture with windowId failed, retrying with null:", chrome.runtime.lastError.message);
      // Fallback: try capturing without specifying windowId
      chrome.tabs.captureVisibleTab(null, { format: "jpeg", quality: 75 }, (dataUrlFallback) => {
        if (chrome.runtime.lastError) {
          console.error("Fallback capture failed:", chrome.runtime.lastError.message);
          sendResponse({ error: chrome.runtime.lastError.message });
        } else if (!dataUrlFallback) {
          sendResponse({ error: "No image data returned from fallback capture." });
        } else {
          sendResponse({ dataUrl: dataUrlFallback });
        }
      });
    } else if (!dataUrl) {
      sendResponse({ error: "No image data returned from capture." });
    } else {
      sendResponse({ dataUrl: dataUrl });
    }
  });
}

// --- API Helper Functions ---

async function callGeminiAPI({ apiKey, model, contents, jsonMode }) {
  const selectedModel = model || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
  
  const body = {
    contents: contents
  };

  if (jsonMode) {
    body.generationConfig = {
      responseMimeType: "application/json"
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText || response.statusText}`);
  }

  return await response.json();
}

async function callOpenAIAPI({ apiKey, model, messages, jsonMode }) {
  const selectedModel = model || "gpt-4o-mini";
  const url = "https://api.openai.com/v1/chat/completions";

  const body = {
    model: selectedModel,
    messages: messages
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText || response.statusText}`);
  }

  return await response.json();
}

async function callAnthropicAPI({ apiKey, model, messages }) {
  const selectedModel = model || "claude-3-5-sonnet-20241022";
  const url = "https://api.anthropic.com/v1/messages";

  const body = {
    model: selectedModel,
    max_tokens: 4000,
    messages: messages
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerously-allow-browser": "true"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText || response.statusText}`);
  }

  return await response.json();
}

async function callImagenAPI({ apiKey, model, prompt }) {
  // Use chosen model or fallback to gemini-3.1-flash-image which supports image generation in this environment
  const selectedModel = model || "gemini-3.1-flash-image";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "2K"
      }
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Imagen API error (${response.status}): ${errText || response.statusText}`);
  }

  const data = await response.json();
  
  // Extract base64 image data from Gemini generateContent response structure
  let base64Data = "";
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
    const parts = data.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Data = part.inlineData.data;
        break;
      } else if (part.inline_data && part.inline_data.data) {
        base64Data = part.inline_data.data;
        break;
      }
    }
  }

  if (!base64Data) {
    throw new Error("No image data found in Gemini response: " + JSON.stringify(data));
  }

  // Format to match what sidepanel.js expects: response.data.generatedImages[0].image.imageBytes
  return {
    generatedImages: [
      {
        image: {
          imageBytes: base64Data
        }
      }
    ]
  };
}

async function callDalleAPI({ apiKey, model, prompt }) {
  const url = "https://api.openai.com/v1/images/generations";
  const selectedModel = model || "dall-e-3";

  const body = {
    model: selectedModel,
    prompt: prompt,
    n: 1,
    size: selectedModel === "dall-e-3" ? "1792x1024" : "1024x1024",
    response_format: "b64_json"
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DALL-E API error (${response.status}): ${errText || response.statusText}`);
  }

  return await response.json();
}
