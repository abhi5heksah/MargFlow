import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { guidesService } from '../services/guidesService';
import { uploadsService } from '../services/uploadsService';
import { useState, useEffect } from 'react';
import { Step } from '../services/guidesService';

export default function PublicGuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const [screenshotUrls, setScreenshotUrls] = useState<Record<string, string>>({});

  const { data: guide, isLoading, error } = useQuery({
    queryKey: ['public-guide', slug],
    queryFn: () => guidesService.get(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (guide?.steps) {
      guide.steps.forEach(async (step: Step) => {
        if (step.screenshotKey && !screenshotUrls[step.id]) {
          try {
            const { url } = await uploadsService.getViewUrl(step.screenshotKey);
            setScreenshotUrls((prev) => ({ ...prev, [step.id]: url }));
          } catch {
            console.error('Failed to get screenshot URL');
          }
        }
      });
    }
  }, [guide]);

  if (isLoading) return <p style={{ textAlign: 'center', padding: 48 }}>Loading...</p>;
  if (error) return <p style={{ textAlign: 'center', padding: 48, color: 'var(--error)' }}>Guide not found</p>;
  if (!guide) return null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <header style={{ marginBottom: 48, textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{guide.title}</h1>
        {guide.description && (
          <p style={{ fontSize: 18, color: 'var(--text-muted)' }}>{guide.description}</p>
        )}
        {guide.owner?.name && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 16 }}>
            by {guide.owner.name}
          </p>
        )}
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {guide.steps?.map((step: Step, index: number) => (
          <div
            key={step.id}
            style={{
              background: 'var(--surface)',
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ padding: 24 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}>
                <span style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 14,
                }}>
                  {index + 1}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>{step.title || `${step.actionType} on ${step.selector || 'element'}`}</h3>
              </div>

              {step.description && (
                <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>{step.description}</p>
              )}

              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <p><strong>Action:</strong> {step.actionType}</p>
                {step.selector && <p><strong>Selector:</strong> <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{step.selector}</code></p>}
                <p><strong>URL:</strong> <a href={step.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{step.url}</a></p>
                {step.textContent && <p><strong>Text:</strong> {step.textContent}</p>}
              </div>
            </div>

            {step.screenshotKey && screenshotUrls[step.id] && (
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <img
                  src={screenshotUrls[step.id]}
                  alt={`Step ${index + 1}`}
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <footer style={{
        marginTop: 48,
        textAlign: 'center',
        padding: 24,
        color: 'var(--text-muted)',
        fontSize: 14,
      }}>
        <p>Created with MargFlow</p>
      </footer>
    </div>
  );
}