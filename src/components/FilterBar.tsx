import type { TodoFilter } from '../types'

interface FilterBarProps {
  filter: TodoFilter
  onChange: (filter: TodoFilter) => void
  counts: { all: number; active: number; completed: number }
}

const FILTERS: TodoFilter[] = ['all', 'active', 'completed']

export function FilterBar({ filter, onChange, counts }: FilterBarProps) {
  return (
    <div className="filter-bar" role="group" aria-label="Filter todos">
      {FILTERS.map((value) => (
        <button
          key={value}
          type="button"
          className={filter === value ? 'active' : ''}
          onClick={() => onChange(value)}
        >
          {value} ({counts[value]})
        </button>
      ))}
    </div>
  )
}
