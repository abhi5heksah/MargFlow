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

chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  if (message.type === 'START_RECORDING') {
    state.recording = true;
    state.guideId = message.guideId;
    state.apiBaseUrl = message.apiBaseUrl;
    state.token = message.token;

    // Notify all tabs
    chrome.tabs.query({}).then((tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'SET_RECORDING',
            recording: true,
            guideId: state.guideId,
            apiBaseUrl: state.apiBaseUrl,
            token: state.token,
          }).catch(() => {}); // Ignore tabs where content script isn't loaded
        }
      });
    });
    sendResponse({ success: true });
  }

  if (message.type === 'STOP_RECORDING') {
    state.recording = false;
    state.guideId = null;
    
    // Notify all tabs
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

  if (message.type === 'RECORDED_EVENT' && state.recording && state.guideId && state.apiBaseUrl && state.token) {
    handleRecordedEvent(message.payload, state);
  }

  return true;
});

async function handleRecordedEvent(payload: RawEventPayload, currentState: ExtensionState) {
  try {
    // Capture the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    const screenshotDataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
    
    // Convert data URL to Blob without fetch
    const base64Data = screenshotDataUrl.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const screenshotBlob = new Blob([byteArray], { type: 'image/png' });

    const presignedResponse = await fetch(`${currentState.apiBaseUrl}/uploads/screenshot-presigned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentState.token}`,
      },
      body: JSON.stringify({
        fileName: `screenshot-${Date.now()}.png`,
        mimeType: 'image/png',
      }),
    });

    if (!presignedResponse.ok) {
      console.error('Failed to get presigned URL');
      return;
    }

    const { uploadUrl, key } = await presignedResponse.json();

    await fetch(uploadUrl, {
      method: 'PUT',
      body: screenshotBlob,
      headers: {
        'Content-Type': 'image/png',
      },
    });

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
      console.error('Failed to create step');
      return;
    }

    console.log('Step recorded successfully');
  } catch (error) {
    console.error('Error handling recorded event:', error);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('MargFlow extension installed');
});