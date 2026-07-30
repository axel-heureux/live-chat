import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
}

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('Bienvenue sur Live Chat')
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.email.trim()) {
      nextErrors.email = 'L’email est requis.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Format d’email invalide.'
    }

    if (!form.password) {
      nextErrors.password = 'Le mot de passe est requis.'
    } else if (form.password.length < 6) {
      nextErrors.password = 'Au moins 6 caractères.'
    }

    if (mode === 'signup') {
      if (!form.name.trim()) {
        nextErrors.name = 'Le nom est requis.'
      }

      if (!form.confirmPassword) {
        nextErrors.confirmPassword = 'La confirmation est requise.'
      } else if (form.confirmPassword !== form.password) {
        nextErrors.confirmPassword = 'Les mots de passe ne correspondent pas.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) {
      setMessage('Veuillez corriger les erreurs ci-dessous.')
      return
    }

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue.')
      }

      setMessage(data.message)
      const userId = data.user?.id
      if (userId) {
        navigate(`/server?id=${encodeURIComponent(userId)}`)
      } else {
        navigate('/server')
      }
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Live Chat</p>
          <h1>{mode === 'login' ? 'Connexion' : 'Inscription'}</h1>
          <p className="subtitle">
            {mode === 'login'
              ? 'Accédez à votre espace en quelques secondes.'
              : 'Créez votre compte et commencez à chatter.'}
          </p>
        </div>

        <div className="mode-switch" role="tablist" aria-label="Mode d’authentification">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login')
              setMessage('Bienvenue sur Live Chat')
              setErrors({})
            }}
          >
            Connexion
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => {
              setMode('signup')
              setMessage('Créer un nouveau compte')
              setErrors({})
            }}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="name">Nom complet</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Jean Dupont"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="vous@example.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>
          )}

          <button type="submit" className="submit-btn">
            {mode === 'login' ? 'Entrer en tant qu’invité' : 'S’inscrire'}
          </button>
        </form>

        <p className="feedback">{message}</p>
      </section>
    </main>
  )
}
