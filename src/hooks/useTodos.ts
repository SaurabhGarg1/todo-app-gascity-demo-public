import { useCallback, useEffect, useState } from 'react'
import type { Todo } from '../types'

export const STORAGE_KEY = 'todo-app-2:v1'

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Todo[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveTodos(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos())

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const addTodo = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return false

    setTodos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: trimmed,
        completed: false,
        createdAt: Date.now(),
      },
    ])
    return true
  }, [])

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }, [])

  const editTodo = useCallback((id: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return false

    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: trimmed } : todo)),
    )
    return true
  }, [])

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }, [])

  return { todos, addTodo, toggleTodo, editTodo, deleteTodo }
}
