import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import Server from './pages/Server'
import Lobby from './pages/Lobby'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/server" element={<Server />} />
        <Route path="/lobby" element={<Lobby />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
