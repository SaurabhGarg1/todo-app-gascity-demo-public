import { FormEvent, useState } from 'react'

interface TodoFormProps {
  onAdd: (text: string) => boolean
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const [text, setText] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (onAdd(text)) {
      setText('')
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <label htmlFor="todo-input" className="sr-only">New todo</label>
      <input
        id="todo-input"
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="What needs to be done?"
      />
      <button type="submit">Add</button>
    </form>
  )
}
