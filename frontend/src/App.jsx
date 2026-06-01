import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { Bounties } from './pages/Bounties'
import { QuestionDetail } from './pages/QuestionDetail'
import { PostQuestion } from './pages/PostQuestion'
import { Profile } from './pages/Profile'
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bounties" element={<Bounties />} />
          <Route path="/question/:id" element={<QuestionDetail />} />
          <Route path="/post" element={<PostQuestion />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App