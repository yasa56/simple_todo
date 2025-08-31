import { useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY = 'todo.items.v1'

function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }, [key, state])
  return [state, setState]
}

export default function App() {
  const [items, setItems] = useLocalStorageState(STORAGE_KEY, [])
  const [filter, setFilter] = useState('all') // all | active | completed
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const inputRef = useRef(null)

  const filtered = useMemo(() => {
    if (filter === 'active') return items.filter(i => !i.done)
    if (filter === 'completed') return items.filter(i => i.done)
    return items
  }, [items, filter])

  function addItem(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    const newItem = { id: crypto.randomUUID(), text: trimmed, done: false, createdAt: Date.now() }
    setItems(prev => [newItem, ...prev])
    setText('')
    inputRef.current?.focus()
  }

  function toggleItem(id) {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, done: !i.done } : i)))
  }

  function startEditing(item) {
    setEditingId(item.id)
    setEditingText(item.text)
  }

  function saveEditing(id) {
    const trimmed = editingText.trim()
    if (!trimmed) {
      // if empty on save, delete
      deleteItem(id)
      return
    }
    setItems(prev => prev.map(i => (i.id === id ? { ...i, text: trimmed } : i)))
    setEditingId(null)
    setEditingText('')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingText('')
  }

  function deleteItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function clearCompleted() {
    setItems(prev => prev.filter(i => !i.done))
  }

  const remainingCount = items.filter(i => !i.done).length
  const completedCount = items.length - remainingCount

  return (
    <div className="app">
      <div className="card">
        <h1 className="title">To-Do</h1>

        <form onSubmit={addItem} className="add">
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What needs doing?"
            aria-label="New todo"
            autoFocus
          />
          <button type="submit" aria-label="Add todo">Add</button>
        </form>

        <div className="toolbar" role="group" aria-label="Filter todos">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >All</button>
          <button
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >Active</button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >Completed</button>

          <div className="spacer" />
          <button
            onClick={clearCompleted}
            disabled={completedCount === 0}
            title="Delete all completed"
          >
            Clear completed ({completedCount})
          </button>
        </div>

        <ul className="list">
          {filtered.length === 0 && (
            <li className="empty">Nothing here yet.</li>
          )}
          {filtered.map(item => (
            <li key={item.id} className="row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleItem(item.id)}
                  aria-label={`Mark "${item.text}" ${item.done ? 'active' : 'completed'}`}
                />
                <span className={item.done ? 'done' : ''} />
              </label>

              {editingId === item.id ? (
                <>
                  <input
                    className="editInput"
                    value={editingText}
                    onChange={e => setEditingText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEditing(item.id)
                      if (e.key === 'Escape') cancelEditing()
                    }}
                    aria-label="Edit todo"
                    autoFocus
                  />
                  <div className="actions">
                    <button onClick={() => saveEditing(item.id)}>Save</button>
                    <button onClick={cancelEditing} className="secondary">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <span
                    className={`text ${item.done ? 'strike' : ''}`}
                    title={new Date(item.createdAt).toLocaleString()}
                  >
                    {item.text}
                  </span>
                  <div className="actions">
                    <button onClick={() => startEditing(item)}>Edit</button>
                    <button onClick={() => deleteItem(item.id)} className="danger">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        <div className="footer">
          <span>{remainingCount} item{remainingCount !== 1 ? 's' : ''} left</span>
        </div>
      </div>
      <footer className="credits">
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">Vite</a> +{' '}
        <a href="https://react.dev" target="_blank" rel="noreferrer">React</a>
      </footer>
    </div>
  )
}
