interface RawEventPayload {
  actionType: 'click' | 'input' | 'navigation';
  url: string;
  selector: string | null;
  textContent?: string;
  inputPreview?: string;
  timestamp: number;
  metadata?: {
    viewportWidth?: number;
    viewportHeight?: number;
    clickX?: number;
    clickY?: number;
    elementRect?: any;
  };
}

interface StartRecordingMessage {
  type: 'START_RECORDING';
  guideId: string;
  apiBaseUrl: string;
  token: string;
}

interface StopRecordingMessage {
  type: 'STOP_RECORDING';
}

interface SetRecordingMessage {
  type: 'SET_RECORDING';
  recording: boolean;
  guideId: string;
  apiBaseUrl: string;
  token: string;
}

type MessageToBackground = StartRecordingMessage | StopRecordingMessage;

type MessageToContent = SetRecordingMessage;

type IncomingMessage = {
  type: 'RECORDED_EVENT';
  payload: RawEventPayload;
};

interface ExtensionState {
  recording: boolean;
  guideId: string | null;
  apiBaseUrl: string | null;
  token: string | null;
}

const state: ExtensionState = {
  recording: false,
  guideId: null,
  apiBaseUrl: null,
  token: null,
};

// Initialize state from storage
chrome.storage.sync.get(['guideId', 'token', 'apiBaseUrl', 'recording']).then((result) => {
  if (result.recording && result.guideId && result.token) {
    state.recording = true;
    state.guideId = result.guideId;
    state.token = result.token;
    state.apiBaseUrl = result.apiBaseUrl || 'http://localhost:4000/api';
    console.log('MargFlow Background: Resumed recording for guide', state.guideId);
  }
});

let eventQueue: { payload: RawEventPayload; sender: chrome.runtime.MessageSender }[] = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || eventQueue.length === 0) return;
  isProcessing = true;

  while (eventQueue.length > 0) {
    const item = eventQueue.shift();
    if (item) {
      const { payload, sender } = item;
      await handleRecordedEvent(payload, state, sender);
    }
  }

  isProcessing = false;
}

chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  if (message.type === 'START_RECORDING') {
    state.recording = true;
    state.guideId = message.guideId;
    state.apiBaseUrl = message.apiBaseUrl;
    state.token = message.token;

    chrome.storage.sync.set({
      recording: true,
      guideId: state.guideId,
      token: state.token,
      apiBaseUrl: state.apiBaseUrl
    });

    chrome.tabs.query({}).then((tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'SET_RECORDING',
            recording: true,
            guideId: state.guideId,
            apiBaseUrl: state.apiBaseUrl,
            token: state.token,
          }).catch(() => {});
        }
      });
    });
    sendResponse({ success: true });
  }

  if (message.type === 'STOP_RECORDING') {
    state.recording = false;
    state.guideId = null;
    chrome.storage.sync.remove(['guideId', 'recording']);
    
    chrome.tabs.query({}).then((tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'SET_RECORDING',
            recording: false,
          }).catch(() => {});
        }
      });
    });
    sendResponse({ success: true });
  }

  if (message.type === 'GET_STATUS') {
    sendResponse(state);
    return true;
  }

  if (message.type === 'RECORDED_EVENT' && state.recording && state.guideId && state.apiBaseUrl && state.token) {
    // Push to queue and process sequentially to avoid overwhelming the backend
    eventQueue.push({ payload: message.payload, sender });
    processQueue();
  }

  return true;
});

async function handleRecordedEvent(payload: RawEventPayload, currentState: ExtensionState, sender: chrome.runtime.MessageSender) {
  try {
    console.log('[MargFlow] Handling event:', payload.actionType, 'on', payload.url);

    // Capture the visible tab. 
    // In Manifest V3 Service Workers, we must be careful about which window we capture.
    // We try to capture the window that sent the message.
    let screenshotDataUrl: string;
    try {
      const windowId = sender.tab?.windowId;
      screenshotDataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' });
    } catch (e) {
      console.warn('[MargFlow] Failed to capture with windowId, falling back to current window:', e);
      screenshotDataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
    }
    
    if (!screenshotDataUrl) {
      console.error('[MargFlow] Screenshot capture failed - empty data URL');
      return;
    }

    // Convert data URL to Blob
    const base64Data = screenshotDataUrl.split(',')[1];
    const binStr = atob(base64Data);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    const screenshotBlob = new Blob([arr], { type: 'image/png' });

    console.log('MargFlow: Requesting presigned URL...');
    const presignedResponse = await fetch(`${currentState.apiBaseUrl}/uploads/screenshot-presigned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentState.token}`,
      },
      body: JSON.stringify({
        fileName: `screenshot-${Date.now()}.png`,
        mimeType: 'image/png',
        guideId: currentState.guideId, // Passing guideId to help backend organize
      }),
    });

    if (!presignedResponse.ok) {
      const errText = await presignedResponse.text();
      console.error('MargFlow: Failed to get presigned URL:', errText);
      return;
    }

    const { uploadUrl, key } = await presignedResponse.json();
    console.log('MargFlow: Uploading screenshot to', uploadUrl);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: screenshotBlob,
      headers: {
        'Content-Type': 'image/png',
      },
    });

    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      console.error('MargFlow: Failed to upload screenshot to MinIO:', errText);
      return;
    }

    // Generate a better title like Scribe
    let title = '';
    const text = payload.textContent?.trim();
    if (payload.actionType === 'click') {
      title = text ? `Click on "${text}"` : 'Click on element';
    } else if (payload.actionType === 'input') {
      title = `Type "${payload.inputPreview}"`;
    } else if (payload.actionType === 'navigation') {
      title = `Navigate to ${payload.url}`;
    }

    console.log('MargFlow: Creating step in backend...');
    const stepResponse = await fetch(`${currentState.apiBaseUrl}/guides/${currentState.guideId}/steps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentState.token}`,
      },
      body: JSON.stringify({
        actionType: payload.actionType,
        selector: payload.selector,
        url: payload.url,
        textContent: payload.textContent,
        inputPreview: payload.inputPreview,
        screenshotKey: key,
        title: title,
        metadata: payload.metadata,
      }),
    });

    if (!stepResponse.ok) {
      const errText = await stepResponse.text();
      console.error('MargFlow: Failed to create step:', errText);
      return;
    }

    console.log('MargFlow: Step recorded successfully');
  } catch (error) {
    console.error('MargFlow: Error handling recorded event:', error);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('MargFlow extension installed');
});