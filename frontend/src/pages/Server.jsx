import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Server() {
  const [ownServers, setOwnServers] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [editId, setEditId] = useState(null)
  const navigate = useNavigate()

  const selected = ownServers.find((server) => server.id === selectedServer) || null

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleCreateOrUpdate = () => {
    if (!form.name.trim()) return

    if (editId) {
      setOwnServers((current) =>
        current.map((item) =>
          item.id === editId ? { ...item, name: form.name, description: form.description } : item
        )
      )
      setEditId(null)
    } else {
      const newServer = {
        id: `server-${Date.now()}`,
        name: form.name,
        description: form.description || 'Serveur personnel.'
      }
      setOwnServers((current) => [...current, newServer])
      setSelectedServer(newServer.id)
    }

    setForm({ name: '', description: '' })
  }

  const handleEdit = (server) => {
    setEditId(server.id)
    setForm({ name: server.name, description: server.description })
  }

  const handleDelete = (serverId) => {
    setOwnServers((current) => current.filter((item) => item.id !== serverId))
    if (selectedServer === serverId) {
      setSelectedServer(null)
    }
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
              <label>
                Description
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Par exemple : discussion texte ou vocal"
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
            </div>

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
          </aside>

          <section className="server-main">
            <div className="panel-card preview-card">
              <p className="eyebrow">Serveur sélectionné</p>
              <h2>{selected?.name || 'Aucun serveur sélectionné'}</h2>
              <p>{selected?.description || 'Sélectionnez un serveur personnel à gauche.'}</p>
              <button
                className="submit-btn"
                type="button"
                onClick={() => navigate('/lobby')}
                disabled={!selected}
              >
                Continuer vers le salon
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
