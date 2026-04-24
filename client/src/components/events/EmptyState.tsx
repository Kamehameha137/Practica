import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  hasSearch?: boolean;
}

export function EmptyState({ hasSearch = false }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">◌</div>
      <h3>
        {hasSearch ? 'Ничего не найдено' : 'Мероприятий пока нет'}
      </h3>
      <p style={{ marginBottom: '24px' }}>
        {hasSearch
          ? 'Попробуйте изменить параметры поиска или фильтры'
          : 'Создайте первое мероприятие, чтобы начать планировать'}
      </p>
      {!hasSearch && (
        <Link to="/create" className="btn btn-primary">
          <Plus size={16} />
          Создать мероприятие
        </Link>
      )}
    </div>
  );
}