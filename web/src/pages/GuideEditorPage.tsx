import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guidesService, Guide } from '../services/guidesService';
import { uploadsService } from '../services/uploadsService';
import StepCard from '../components/guides/StepCard';

export default function GuideEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: guide, isLoading } = useQuery({
    queryKey: ['guide', id],
    queryFn: () => guidesService.get(id!),
    enabled: !!id,
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (guide) {
      setTitle(guide.title);
      setDescription(guide.description || '');
    }
  }, [guide]);

  const updateMutation = useMutation({
    mutationFn: (data: { title?: string; description?: string; status?: 'DRAFT' | 'PUBLISHED' }) =>
      guidesService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide', id] });
      queryClient.refetchQueries({ queryKey: ['guide', id] });
    },
  });

  const deleteStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      const step = guide?.steps?.find(s => s.id === stepId);
      if (step?.screenshotKey) {
        await uploadsService.deleteScreenshot(step.screenshotKey).catch(() => {});
      }
      await guidesService.deleteStep(stepId);
      if (guide?.steps) {
        const remainingSteps = guide.steps
          .filter(s => s.id !== stepId)
          .sort((a, b) => a.index - b.index)
          .map((s, i) => ({ id: s.id, index: i }));
        await guidesService.reorderSteps(guide.id, remainingSteps);
      }
    },
    onMutate: async (stepId: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['guide', id] });

      // Snapshot the previous value
      const previousGuide = queryClient.getQueryData<Guide>(['guide', id]);

      // Optimistically update to the new value
      if (previousGuide) {
        queryClient.setQueryData<Guide>(['guide', id], {
          ...previousGuide,
          steps: previousGuide.steps?.filter(s => s.id !== stepId),
        });
      }

      // Return a context object with the snapshotted value
      return { previousGuide };
    },
    onError: (_err, _stepId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousGuide) {
        queryClient.setQueryData(['guide', id], context.previousGuide);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to keep server in sync
      queryClient.invalidateQueries({ queryKey: ['guide', id] });
      queryClient.refetchQueries({ queryKey: ['guide', id] });
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (!guide) return <p>Guide not found</p>;

  return (
    <div style={{ width: '100%', padding: '20 24px', margin:'20 20px', boxSizing: 'border-box' }}>
      <button
        onClick={() => navigate('/guides')}
        style={{
          padding: '8px 16px',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 6,
          cursor: 'pointer',
          marginBottom: 24,
        }}
      >
        Back to Guides
      </button>

      <div style={{
        background: 'var(--surface)',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        border: '1px solid var(--border)',
      }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => updateMutation.mutate({ title })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => updateMutation.mutate({ description })}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 6,
              fontSize: 14,
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => updateMutation.mutate({ status: 'PUBLISHED' })}
            disabled={updateMutation.isPending}
            style={{
              padding: '10px 20px',
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Publish
          </button>
          <button
            onClick={() => updateMutation.mutate({ status: 'DRAFT' })}
            disabled={updateMutation.isPending}
            style={{
              padding: '10px 20px',
              background: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Unpublish
          </button>
          <button
            onClick={() => {
              const data = JSON.stringify(guide, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${guide.title.replace(/\s+/g, '_')}_guide.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: '#6366f1',
              border: '1px solid #6366f1',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Export JSON
          </button>
          <span style={{
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            background: guide.status === 'PUBLISHED' ? '#dcfce7' : '#f1f5f9',
            color: guide.status === 'PUBLISHED' ? '#16a34a' : '#64748b',
          }}>
            {guide.status}
          </span>
        </div>

        {guide.publicSlug && (
          <div style={{ marginTop: 16, padding: 12, background: '#f1f5f9', borderRadius: 6 }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Public URL: <code style={{ background: 'white', padding: '2px 6px', borderRadius: 4 }}>/public/{guide.publicSlug}</code>
            </p>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Steps ({guide.steps?.length || 0})</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {guide.steps?.map((step, index) => (
          <StepCard
            key={step.id}
            step={step}
            index={index + 1}
            onDelete={() => deleteStepMutation.mutate(step.id)}
          />
        ))}
      </div>

      {!guide.steps?.length && (
        <div style={{
          textAlign: 'center',
          padding: 48,
          background: 'var(--surface)',
          borderRadius: 12,
          border: '2px dashed var(--border)',
        }}>
          <p style={{ color: 'var(--text-muted)' }}>No steps yet</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
            Use the Chrome extension to record steps
          </p>
        </div>
      )}
    </div>
  );
}