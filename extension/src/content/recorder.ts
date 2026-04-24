const state = {
  recording: false,
  guideId: null as string | null,
  apiBaseUrl: null as string | null,
  token: null as string | null,
};

chrome.storage.sync.get(['apiBaseUrl', 'token', 'guideId', 'recording']).then((result) => {
  if (result.apiBaseUrl) state.apiBaseUrl = result.apiBaseUrl;
  if (result.token) state.token = result.token;
  if (result.recording && result.guideId) {
    state.guideId = result.guideId;
    state.recording = true;
    console.log('MargFlow: Recording active for guide', state.guideId);
    
    // Auto-attach listeners if already recording
    document.addEventListener('click', handleClick, true);
    document.addEventListener('input', handleInput, true);
    window.addEventListener('beforeunload', handleNavigation);
  }
});

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

function generateSelector(element: Element): string | null {
  if (element.id) {
    return `#${element.id}`;
  }

  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector = `${selector}#${current.id}`;
      parts.unshift(selector);
      break;
    }

    if (current.className) {
      const classes = current.className.trim().split(/\s+/).filter(c => c.length < 30);
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 2).join('.');
      }
    }

    const siblings = current.parentElement?.children;
    if (siblings) {
      const sameTagSiblings = Array.from(siblings).filter(s => s.tagName === current!.tagName);
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(current as Element) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    parts.unshift(selector);
    current = current.parentElement;
  }

  return parts.join(' > ');
}

function handleClick(event: MouseEvent) {
  if (!state.recording || !state.guideId) return;

  const target = event.target as Element;
  const selector = generateSelector(target);
  const rect = target.getBoundingClientRect();
  const payload: RawEventPayload = {
    actionType: 'click',
    url: window.location.href,
    selector,
    textContent: target.textContent?.trim().substring(0, 50) || (target as HTMLInputElement).value?.substring(0, 50),
    timestamp: Date.now(),
    metadata: {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      clickX: event.clientX,
      clickY: event.clientY,
      elementRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }
    },
  };

  chrome.runtime.sendMessage({ type: 'RECORDED_EVENT', payload });
}

function handleInput(event: Event) {
  if (!state.recording || !state.guideId) return;

  const target = event.target as HTMLInputElement;
  const selector = generateSelector(target);

  let inputPreview = target.value;
  if (target.type === 'password') {
    inputPreview = '******';
  } else if (inputPreview.length > 50) {
    inputPreview = inputPreview.substring(0, 50) + '...';
  }

  const payload: RawEventPayload = {
    actionType: 'input',
    url: window.location.href,
    selector,
    textContent: target.value.substring(0, 100),
    inputPreview,
    timestamp: Date.now(),
  };

  chrome.runtime.sendMessage({ type: 'RECORDED_EVENT', payload });
}

function handleNavigation() {
  if (!state.recording || !state.guideId) return;

  const payload: RawEventPayload = {
    actionType: 'navigation',
    url: window.location.href,
    selector: null,
    timestamp: Date.now(),
  };

  chrome.runtime.sendMessage({ type: 'RECORDED_EVENT', payload });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SET_RECORDING') {
    state.recording = message.recording;
    state.guideId = message.guideId;
    state.apiBaseUrl = message.apiBaseUrl;
    state.token = message.token;

    if (state.recording) {
      document.addEventListener('click', handleClick, true);
      document.addEventListener('input', handleInput, true);
      window.addEventListener('beforeunload', handleNavigation);
    } else {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('input', handleInput, true);
      window.removeEventListener('beforeunload', handleNavigation);
    }
  }

  return true;
});