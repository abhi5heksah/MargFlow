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
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(step.title);

  useEffect(() => {
    if (step.screenshotKey) {
      uploadsService.getViewUrl(step.screenshotKey).then(({ url }) => {
        setScreenshotUrl(url);
      }).catch(() => {});
    }
  }, [step.screenshotKey]);



  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid #eef2f6',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      marginBottom: 32,
      minHeight: 600,
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
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                border: '1px solid #3b82f6',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this step?')) {
                onDelete();
              }
            }}
            title="Delete step"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'transparent',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'transparent';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

       {/* Screenshot Container */}
       <div style={{ padding: 20 }}>
         <div style={{ 
           position: 'relative',
           borderRadius: 12,
           overflow: 'hidden',
           background: '#f8fafc',
           border: '1px solid #f1f5f9',
           display: 'flex',
         }}>
           {screenshotUrl ? (
             <div style={{ 
               position: 'relative', 
               width: '100%',
               transition: 'transform 0.2s ease-out',
               transformOrigin: 'top center',
             }}>
               <img
                 src={screenshotUrl}
                 alt={`Step ${index} screenshot`}
                 style={{ width: '100%', display: 'block' }}
               />
               
               {/* Highlight Ring (Restored without shadow) */}
               {step.metadata && (step.metadata as any).clickX !== undefined && (
                 <div style={{
                   position: 'absolute',
                   top: `${((step.metadata as any).clickY / (step.metadata as any).viewportHeight) * 100}%`,
                   left: `${((step.metadata as any).clickX / (step.metadata as any).viewportWidth) * 100}%`,
                   width: 40,
                   height: 40,
                   borderRadius: '50%',
                   border: '3px solid #f97316', // Original orange
                   background: 'rgba(249, 115, 22, 0.1)', // Subtle orange fill
                   transform: 'translate(-50%, -50%)',
                   pointerEvents: 'none',
                   zIndex: 10,
                   boxShadow: '0 0 0 4px rgba(249, 115, 22, 0.2)', // Local depth shadow
                 }} />
               )}
             </div>
           ) : (
             <div style={{ padding: 48, color: '#94a3b8' }}>Loading screenshot...</div>
           )}



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