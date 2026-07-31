import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Lobby() {
  const [searchParams] = useSearchParams()
  const [serverName, setServerName] = useState('Salon')
  const [serverId, setServerId] = useState(null)
  const [userId, setUserId] = useState(null)

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [textRooms, setTextRooms] = useState([])
  const [voiceRooms, setVoiceRooms] = useState([])
  const [users, setUsers] = useState([])

  const [channelForm, setChannelForm] = useState({ name: '', type: 'text' })
  const [editChannelId, setEditChannelId] = useState(null)

  useEffect(() => {
    const sid = searchParams.get('serverId')
    const uid = searchParams.get('id')
    if (sid) setServerId(sid)
    if (uid) setUserId(uid)
  }, [searchParams])

  useEffect(() => {
    if (serverId) {
      loadServer()
      loadChannels()
      loadUsers()
    }
  }, [serverId])

  async function loadUsers() {
    try {
      // 1. On force l'ID de votre serveur en dur ici pour le test
      const forcedServerId = 'b0eff0f3-cf59-469c-a405-905d4f273fde';
      
      // 2. On utilise cet ID forcé pour la requête
      const res = await fetch(`${API_URL}/servers/${forcedServerId}/users`)
      
      if (!res.ok) {
        console.error("Erreur serveur :", res.status)
        return
      }
      
      const data = await res.json()
      console.log("Utilisateurs (FORCÉ) :", data) // Regardez votre console (F12)
      setUsers(data)
      
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  async function loadServer() {
    try {
      const res = await fetch(`${API_URL}/servers`)
      if (!res.ok) return
      const data = await res.json()
      const sv = data.find((s) => s.id === serverId)
      if (sv) setServerName(sv.name)
    } catch (err) {
      console.error('Failed to load server:', err)
    }
  }

  async function loadChannels() {
    try {
      const res = await fetch(`${API_URL}/channels?server_id=${serverId}`)
      if (!res.ok) return
      const data = await res.json()
      setTextRooms(data.filter((c) => c.type === 'text'))
      setVoiceRooms(data.filter((c) => c.type === 'voice'))
      if (!selectedRoom && data.length > 0) setSelectedRoom(data[0].name)
    } catch (err) {
      console.error('Failed to load channels:', err)
    }
  }

  const handleChannelChange = (e) => {
    const { name, value } = e.target
    setChannelForm((c) => ({ ...c, [name]: value }))
  }

  const handleCreateOrUpdateChannel = async () => {
    if (!channelForm.name.trim() || !serverId) return
    try {
      if (editChannelId) {
        const res = await fetch(`${API_URL}/channels/${editChannelId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: channelForm.name, type: channelForm.type })
        })
        if (!res.ok) throw new Error('Update failed')
      } else {
        const payload = {
          id: `ch-${Date.now()}`,
          name: channelForm.name,
          type: channelForm.type,
          server_id: serverId
        }
        const res = await fetch(`${API_URL}/channels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Create failed')
      }
      setChannelForm({ name: '', type: 'text' })
      setEditChannelId(null)
      await loadChannels()
    } catch (err) {
      console.error('Failed to create/update channel:', err)
    }
  }

  const handleEditChannel = (channel) => {
    setEditChannelId(channel.id)
    setChannelForm({ name: channel.name, type: channel.type })
  }

  const handleDeleteChannel = async (id) => {
    try {
      const res = await fetch(`${API_URL}/channels/${id}`, { method: 'DELETE' })
      if (!res.ok) console.warn('Delete channel returned', res.status)
    } catch (err) {
      console.error('Failed to delete channel:', err)
    } finally {
      await loadChannels()
      if (selectedRoom && selectedRoom.id === id) setSelectedRoom(null)
    }
  }

  return (
    <main className="lobby-shell">

      <div className="lobby-layout">
        <aside className="channel-panel sidebar-panel">
          <div className="channel-panel-header">
            <div>
              <p className="eyebrow">Serveur</p>
              <h2>{serverName}</h2>
            </div>
            <button type="button" className="icon-btn small" aria-label="Paramètres du serveur">⚙</button>
          </div>

          <div className="channel-group">
            <div className="channel-group-header">
              <h3>Salons textuels</h3>
              <button type="button" className="icon-btn small" aria-label="Ajouter salon textuel" onClick={() => setChannelForm({ name: '', type: 'text' })}>
                +
              </button>
            </div>
            <ul className="channel-list">
              {textRooms.length > 0 ? (
                textRooms.map((room) => (
                  <li key={room.id} className={room.name === selectedRoom ? 'active-channel' : ''}>
                    <button type="button" className="channel-button" onClick={() => setSelectedRoom(room.name)}>
                      <span className="channel-icon">#</span>
                      {room.name}
                    </button>
                    <div className="channel-actions">
                      <button type="button" className="icon-btn" onClick={() => handleEditChannel(room)} aria-label="Modifier">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
                          <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
                        </svg>
                      </button>
                      <button type="button" className="icon-btn danger" onClick={() => handleDeleteChannel(room.id)} aria-label="Supprimer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12z" fill="currentColor"/>
                          <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="empty-state">Aucun salon textuel</li>
              )}
            </ul>
          </div>

          <div className="channel-group">
            <div className="channel-group-header">
              <h3>Salons vocaux</h3>
              <button type="button" className="icon-btn small" aria-label="Ajouter salon vocal" onClick={() => setChannelForm({ name: '', type: 'voice' })}>
                +
              </button>
            </div>
            <ul className="channel-list">
              {voiceRooms.length > 0 ? (
                voiceRooms.map((room) => (
                  <li key={room.id} className={room.name === selectedRoom ? 'active-channel' : ''}>
                    <button type="button" className="channel-button" onClick={() => setSelectedRoom(room.name)}>
                      <span className="channel-icon">🔊</span>
                      {room.name}
                    </button>
                    <div className="channel-actions">
                      <button type="button" className="icon-btn" onClick={() => handleEditChannel(room)} aria-label="Modifier">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
                          <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
                        </svg>
                      </button>
                      <button type="button" className="icon-btn danger" onClick={() => handleDeleteChannel(room.id)} aria-label="Supprimer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12z" fill="currentColor"/>
                          <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="empty-state">Aucun salon vocal</li>
              )}
            </ul>
          </div>
            
          {/* Donne en argument GET l'id de user pour retourner aux serveurs */}
          <div className="profile-actions">
            <Link to={`/server?id=${userId || ''}`} className="text-btn">Retour aux serveurs</Link>
            <Link to="/" className="text-btn danger">Déconnexion</Link>
          </div>
        </aside>

        <section className="chat-panel">
          <div className="panel-card chat-card">
            <div className="chat-header">
              <div>
                <p className="eyebrow">Canal actif</p>
                <h2>{selectedRoom}</h2>
              </div>
            </div>

            <div className="message-feed empty-feed">
              <div className="empty-state">
                <p>Aucun message pour le moment. Rejoignez le salon pour commencer.</p>
              </div>
            </div>

            <div className="chat-input-bar">
              <input type="text" placeholder="Écrire un message..." />
              <button type="button" className="submit-btn">Envoyer</button>
            </div>
          </div>
        </section>

        <aside className="users-panel">
          <div className="panel-card users-card">
            <h2>Utilisateurs</h2>
            <ul>
              {users && users.length > 0 ? (
                users.map((user, index) => (
                  <li key={user.user_id || index}>
                    {user.pseudo || `Utilisateur (${user.user_id})`}
                  </li>
                ))
              ) : (
                <li className="empty-state">Aucun utilisateur trouvé</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  )
}
