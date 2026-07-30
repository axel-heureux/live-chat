import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Lobby() {
  const [selectedRoom, setSelectedRoom] = useState('Général')
  const [textRooms] = useState(['Général', 'Actualités', 'Développement'])
  const [voiceRooms] = useState(['Vocal 1', 'Vocal 2', 'Vocal Lounge'])
  const [users] = useState([])

  return (
    <main className="lobby-shell">
      <header className="lobby-header">
        <div>
          <p className="eyebrow">Live Chat</p>
          <h1>Salon</h1>
          <p className="subtitle">Choisissez un canal à gauche et discutez au centre.</p>
        </div>
        <Link to="/" className="guest-btn">Déconnexion</Link>
      </header>

      <div className="lobby-grid">
        <aside className="sidebar-panel">
          <div className="panel-card channel-panel">
            <h2>Salons textuels</h2>
            <ul>
              {textRooms.map((room) => (
                <li key={room} className={room === selectedRoom ? 'active-room' : ''}>
                  <button type="button" onClick={() => setSelectedRoom(room)}>{room}</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel-card channel-panel">
            <h2>Salons vocaux</h2>
            <ul>
              {voiceRooms.map((room) => (
                <li key={room}>
                  <button type="button">{room}</button>
                </li>
              ))}
            </ul>
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
            <h2>Utilisateurs connectés</h2>
            <ul>
              {users.length > 0 ? (
                users.map((user) => <li key={user}>{user}</li>)
              ) : (
                <li className="empty-state">Aucun utilisateur connecté</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  )
}
