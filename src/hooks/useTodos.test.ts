import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY, useTodos } from './useTodos'

describe('useTodos', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('adds, toggles, edits, and deletes todos', () => {
    const { result } = renderHook(() => useTodos())

    act(() => {
      expect(result.current.addTodo('Buy milk')).toBe(true)
    })
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Buy milk')

    const id = result.current.todos[0].id

    act(() => {
      result.current.toggleTodo(id)
    })
    expect(result.current.todos[0].completed).toBe(true)

    act(() => {
      expect(result.current.editTodo(id, 'Buy oat milk')).toBe(true)
    })
    expect(result.current.todos[0].text).toBe('Buy oat milk')

    act(() => {
      result.current.deleteTodo(id)
    })
    expect(result.current.todos).toHaveLength(0)
  })

  it('rejects blank todos', () => {
    const { result } = renderHook(() => useTodos())

    act(() => {
      expect(result.current.addTodo('   ')).toBe(false)
    })
    expect(result.current.todos).toHaveLength(0)
  })

  it('persists todos to localStorage', () => {
    const { result } = renderHook(() => useTodos())

    act(() => {
      result.current.addTodo('Persist me')
    })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].text).toBe('Persist me')
  })
})
