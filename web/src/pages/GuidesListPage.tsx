import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { guidesService, Guide } from '../services/guidesService';

export default function GuidesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: guides, isLoading } = useQuery({
    queryKey: ['guides'],
    queryFn: guidesService.list,
  });

  const createMutation = useMutation({
    mutationFn: guidesService.create,
    onSuccess: (guide) => {
      queryClient.invalidateQueries({ queryKey: ['guides'] });
      navigate(`/guides/${guide.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: guidesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guides'] });
    },
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>My Guides</h1>
        <button
          onClick={() => createMutation.mutate({})}
          disabled={createMutation.isPending}
          style={{
            padding: '10px 20px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
          }}
        >
          + New Guide
        </button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : !guides?.length ? (
        <div style={{
          textAlign: 'center',
          padding: 48,
          background: 'var(--surface)',
          borderRadius: 12,
          border: '2px dashed var(--border)',
        }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No guides yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Use the Chrome extension to start recording your first guide</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {guides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              onEdit={() => navigate(`/guides/${guide.id}`)}
              onDelete={() => deleteMutation.mutate(guide.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GuideCard({ guide, onEdit, onDelete }: { guide: Guide; onEdit: () => void; onDelete: () => void }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 12,
      padding: 20,
      border: '1px solid var(--border)',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{guide.title}</h3>
        <span style={{
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 500,
          background: guide.status === 'PUBLISHED' ? '#dcfce7' : '#f1f5f9',
          color: guide.status === 'PUBLISHED' ? 'var(--success)' : 'var(--secondary)',
        }}>
          {guide.status}
        </span>
      </div>

      {guide.description && (
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>{guide.description}</p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {guide._count?.steps || 0} steps
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            style={{
              padding: '6px 12px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              color: 'var(--error)',
              border: '1px solid var(--error)',
              borderRadius: 4,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {guide.publicSlug && (
        <div style={{ marginTop: 12, padding: 8, background: '#f1f5f9', borderRadius: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Public: /public/{guide.publicSlug}
          </span>
        </div>
      )}
    </div>
  );
}