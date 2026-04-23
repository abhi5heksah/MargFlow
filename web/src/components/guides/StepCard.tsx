import { useState, useEffect } from 'react';
import { Step } from '../../services/guidesService';
import { uploadsService } from '../../services/uploadsService';

interface StepCardProps {
  step: Step;
  index: number;
  onDelete: () => void;
}

export default function StepCard({ step, index, onDelete }: StepCardProps) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(step.title);

  useEffect(() => {
    if (step.screenshotKey) {
      uploadsService.getViewUrl(step.screenshotKey).then(({ url }) => {
        setScreenshotUrl(url);
      }).catch(() => {});
    }
  }, [step.screenshotKey]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid #eef2f6',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      marginBottom: 32,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#eef2ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6366f1',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditing(false)}
              autoFocus
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#1e293b',
                border: '1px solid #6366f1',
                borderRadius: 4,
                padding: '2px 8px',
                outline: 'none',
              }}
            />
          ) : (
            <h3 
              onClick={() => setIsEditing(true)}
              style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', cursor: 'text' }}
            >
              {title}
            </h3>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a
            href={step.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open website"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </a>
          <button
            onClick={onDelete}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Screenshot Container */}
      <div style={{ padding: 16 }}>
        <div style={{ 
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          background: '#f8fafc',
          border: '1px solid #f1f5f9',
          minHeight: 300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}>
          {screenshotUrl ? (
            <div style={{ 
              position: 'relative', 
              width: '100%',
              transition: 'transform 0.2s ease-out',
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}>
              <img
                src={screenshotUrl}
                alt={`Step ${index} screenshot`}
                style={{ width: '100%', display: 'block' }}
              />
              
              {/* Highlight Ring (Scribe Style) */}
              {step.metadata && (step.metadata as any).clickX !== undefined && (
                <div style={{
                  position: 'absolute',
                  top: `${((step.metadata as any).clickY / (step.metadata as any).viewportHeight) * 100}%`,
                  left: `${((step.metadata as any).clickX / (step.metadata as any).viewportWidth) * 100}%`,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  border: '4px solid #f97316', // Scribe orange
                  background: 'transparent',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.15)', // Dim background
                  pointerEvents: 'none',
                  zIndex: 10,
                }} />
              )}
            </div>
          ) : (
            <div style={{ padding: 48, color: '#94a3b8' }}>Loading screenshot...</div>
          )}

          {/* Zoom Controls (Bottom Right Floating) */}
          <div style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 20,
          }}>
            <button 
              onClick={handleZoomIn}
              style={{
                padding: '12px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #e2e8f0',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button 
              onClick={handleZoomOut}
              style={{
                padding: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div style={{ padding: '0 24px 16px', display: 'flex', gap: 12 }}>
        <div style={{ fontSize: 12, color: '#94a3b8', background: '#f8fafc', padding: '4px 10px', borderRadius: 6 }}>
          Step {index}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', background: '#f8fafc', padding: '4px 10px', borderRadius: 6, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {step.url}
        </div>
      </div>
    </div>
  );
}