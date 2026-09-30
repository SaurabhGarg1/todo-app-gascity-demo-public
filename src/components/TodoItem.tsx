import { useState } from 'react'
import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onEdit: (id: string, text: string) => boolean
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)

  function saveEdit() {
    if (onEdit(todo.id, draft)) {
      setEditing(false)
    }
  }

  return (
    <li className={`todo-item${todo.completed ? ' completed' : ''}`}>
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        {editing ? (
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={saveEdit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') saveEdit()
              if (event.key === 'Escape') {
                setDraft(todo.text)
                setEditing(false)
              }
            }}
            autoFocus
          />
        ) : (
          <span onDoubleClick={() => setEditing(true)}>{todo.text}</span>
        )}
      </label>
      <button type="button" onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  )
}
