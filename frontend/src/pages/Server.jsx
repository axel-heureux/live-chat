import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Server() {
  const [ownServers, setOwnServers] = useState([])
  const [userId, setUserId] = useState(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setUserId(id)
    }
  }, [searchParams])
  const [selectedServer, setSelectedServer] = useState(null)
  const [form, setForm] = useState({ name: '' })
  const [editId, setEditId] = useState(null)
  const navigate = useNavigate()

  const selected = ownServers.find((server) => server.id === selectedServer) || null

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const generateUuid = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const random = Math.floor(Math.random() * 16)
      const value = char === 'x' ? random : (random & 0x3) | 0x8
      return value.toString(16)
    })
  }

  const handleCreateOrUpdate = async () => {
    if (!form.name.trim()) return

    try {
      if (editId) {
        // persist update
        const res = await fetch(`${API_URL}/servers/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name })
        })
        if (!res.ok) throw new Error('Erreur lors de la mise à jour')
      } else {
        const newServer = {
          id: generateUuid(),
          name: form.name,
          owner_id: userId || null
        }

        const res = await fetch(`${API_URL}/servers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newServer)
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || 'Erreur lors de la création du serveur')
        }
      }

      // reload servers from backend (no front cache)
      await loadServers()
      setForm({ name: '' })
      setEditId(null)
    } catch (err) {
      console.error('Failed to create/update server:', err)
    }
  }

  useEffect(() => {
    // load servers from backend (only servers owned by this user)
    loadServers()
  }, [userId])

  async function loadServers() {
    try {
      const res = await fetch(`${API_URL}/servers`)
      if (!res.ok) return setOwnServers([])
      const data = await res.json()
      if (userId) {
        setOwnServers(data.filter((s) => s.owner_id === userId))
      } else {
        setOwnServers([])
      }
    } catch (err) {
      console.error('Failed to load servers:', err)
      setOwnServers([])
    }
  }

  const handleEdit = (server) => {
    setEditId(server.id)
    setForm({ name: server.name })
  }

  const handleJoinServer = async (serverId) => {
    if (!userId) {
      console.warn('No user id available for join')
      return
    }

    try {
      const res = await fetch(`${API_URL}/servers/${serverId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // transmets userId directement comme String (UUID) sans Number()
        body: JSON.stringify({ user_id: userId })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Erreur lors de l’adhésion au serveur')
      }

      navigate(`/lobby?serverId=${serverId}&id=${userId}`)
    } catch (err) {
      console.error('Failed to join server:', err)
    }
  }

  const handleDelete = (serverId) => {
    // delete on backend then reload list
    ;(async () => {
      try {
        const res = await fetch(`${API_URL}/servers/${serverId}`, { method: 'DELETE' })
        if (!res.ok) {
          console.warn('Delete returned', res.status)
        }
      } catch (err) {
        console.error('Failed to delete on server:', err)
      } finally {
        await loadServers()
        if (selectedServer === serverId) setSelectedServer(null)
      }
    })()
  }

  return (
    <main className="server-shell">
      <section className="server-card">
        <div className="server-header">
          <div>
            <p className="eyebrow">Live Chat</p>
            <h1>Choisissez ou gérez votre serveur</h1>
            <p className="subtitle">Créez, modifiez et supprimez votre serveur personnel.</p>
          </div>
        </div>

        <div className="server-grid">
          <aside className="server-sidepanel">
            <div className="panel-card server-manager">
              <h2>Mon serveur</h2>
              <label>
                Nom du serveur
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Mon serveur privé"
                />
              </label>
              <button type="button" className="submit-btn" onClick={handleCreateOrUpdate}>
                {editId ? 'Sauvegarder le serveur' : 'Créer le serveur'}
              </button>
              {editId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setEditId(null)
                    setForm({ name: '', description: '' })
                  }}
                >
                  Annuler
                </button>
              )}
              <div className="logout-action">
                <Link to="/" className="text-btn danger">Déconnexion</Link>
              </div>
            </div>
            </aside>
            
            <section>
              <div className="panel-card server-list-card">
                <h2>Mes serveurs</h2>
                <ul>
                  {ownServers.length > 0 ? (
                    ownServers.map((server) => (
                      <li key={server.id} className={server.id === selectedServer ? 'active-room' : ''}>
                        <div className="server-row">
                          <button type="button" onClick={() => setSelectedServer(server.id)}>
                            {server.name}
                          </button>
                          <div className="server-actions">
                            <button type="button" className="primary-join" onClick={() => handleJoinServer(server.id)}>
                              Rejoindre
                            </button>
                            <button type="button" className="text-btn" onClick={() => handleEdit(server)}>
                              Modifier
                            </button>
                            <button type="button" className="text-btn danger" onClick={() => handleDelete(server.id)}>
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="empty-state">Aucun serveur personnel créé</li>
                  )}
                </ul>
              </div>
            </section>

        </div>
      </section>
    </main>
  )
}
