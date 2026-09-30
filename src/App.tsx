import { useMemo, useState } from 'react'
import { FilterBar } from './components/FilterBar'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { useTodos } from './hooks/useTodos'
import type { TodoFilter } from './types'
import './App.css'

function App() {
  const { todos, addTodo, toggleTodo, editTodo, deleteTodo } = useTodos()
  const [filter, setFilter] = useState<TodoFilter>('all')

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((todo) => !todo.completed).length,
      completed: todos.filter((todo) => todo.completed).length,
    }),
    [todos],
  )

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed)
    if (filter === 'completed') return todos.filter((todo) => todo.completed)
    return todos
  }, [filter, todos])

  return (
    <main className="app">
      <h1>Todo App</h1>
      <TodoForm onAdd={addTodo} />
      <FilterBar filter={filter} onChange={setFilter} counts={counts} />
      <TodoList
        todos={visibleTodos}
        onToggle={toggleTodo}
        onEdit={editTodo}
        onDelete={deleteTodo}
      />
    </main>
  )
}

export default App
