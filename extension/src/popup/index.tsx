import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string };
}

interface ExtensionState {
  apiBaseUrl: string;
  email: string;
  password: string;
  token: string | null;
  isLoggedIn: boolean;
  recording: boolean;
  guideId: string | null;
}

const Popup: React.FC = () => {
  const [state, setState] = useState<ExtensionState>({
    apiBaseUrl: '',
    email: '',
    password: '',
    token: null,
    isLoggedIn: false,
    recording: false,
    guideId: null,
  });

  useEffect(() => {
    // 1. Initial load from storage for UI responsiveness
    chrome.storage.sync.get(['apiBaseUrl', 'token', 'guideId', 'recording']).then((result) => {
      setState((prev) => ({
        ...prev,
        apiBaseUrl: result.apiBaseUrl || 'http://localhost:4000/api',
        token: result.token || null,
        isLoggedIn: !!result.token,
        guideId: result.guideId || null,
        recording: !!result.recording,
      }));

      // 2. Double check with background script for the "true" state
      chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (bgState) => {
        if (bgState) {
          setState((prev) => ({
            ...prev,
            recording: bgState.recording,
            guideId: bgState.guideId,
            token: bgState.token || prev.token,
          }));
        }
      });
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${state.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.email, password: state.password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data: AuthResponse = await response.json();

      await chrome.storage.sync.set({
        token: data.accessToken,
        apiBaseUrl: state.apiBaseUrl,
      });

      setState((prev) => ({
        ...prev,
        token: data.accessToken,
        isLoggedIn: true,
      }));
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials and API URL.');
    }
  };


  const handleStartRecording = async () => {
    if (!state.token) {
      alert('Please login first');
      return;
    }

    try {
      const response = await fetch(`${state.apiBaseUrl}/guides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Failed to create guide');

      const guide = await response.json();

      await chrome.storage.sync.set({ guideId: guide.id });

      chrome.runtime.sendMessage({
        type: 'START_RECORDING',
        guideId: guide.id,
        apiBaseUrl: state.apiBaseUrl,
        token: state.token,
      });

      setState((prev) => ({
        ...prev,
        recording: true,
        guideId: guide.id,
      }));
    } catch (error) {
      console.error('Start recording error:', error);
      alert('Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = () => {
    chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });

    chrome.storage.sync.remove(['guideId', 'recording']);

    setState((prev) => ({
      ...prev,
      recording: false,
      guideId: null,
    }));
  };

  const handleLogout = async () => {
    await chrome.storage.sync.remove(['token', 'guideId', 'recording']);
    setState((prev) => ({
      ...prev,
      token: null,
      isLoggedIn: false,
      recording: false,
      guideId: null,
      password: '',
    }));
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#6366f1' }}>
        MargFlow Recorder
      </h2>

      {!state.isLoggedIn ? (
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
              API URL
            </label>
            <input
              type="url"
              value={state.apiBaseUrl}
              onChange={(e) => setState((prev) => ({ ...prev, apiBaseUrl: e.target.value }))}
              placeholder="http://localhost:4000/api"
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
              Email
            </label>
            <input
              type="email"
              value={state.email}
              onChange={(e) => setState((prev) => ({ ...prev, email: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
              Password
            </label>
            <input
              type="password"
              value={state.password}
              onChange={(e) => setState((prev) => ({ ...prev, password: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                fontSize: 13,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </form>
      ) : (
        <div>
          <div style={{
            padding: 12,
            background: '#dcfce7',
            borderRadius: 6,
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 13, color: '#166534' }}>
              {state.recording ? 'Recording in progress...' : 'Ready to record'}
            </p>
          </div>

          {!state.recording ? (
            <button
              onClick={handleStartRecording}
              style={{
                width: '100%',
                padding: '12px',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 8,
              }}
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              style={{
                width: '100%',
                padding: '12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 8,
              }}
            >
              Stop Recording
            </button>
          )}

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      )}

      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 16, textAlign: 'center' }}>
        v0.1.0
      </p>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<Popup />);