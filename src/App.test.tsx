import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders empty state', () => {
    render(<App />)
    expect(screen.getByText('Todo App')).toBeInTheDocument()
    expect(screen.getByText('No todos yet. Add one above.')).toBeInTheDocument()
  })

  it('adds a todo and filters views', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('New todo'), 'Write tests')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByText('Write tests')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /active/ }))

    expect(screen.queryByText('Write tests')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /completed/ }))
    expect(screen.getByText('Write tests')).toBeInTheDocument()
  })
})
