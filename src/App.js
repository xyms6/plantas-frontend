import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { FaLeaf, FaGithub } from 'react-icons/fa';
import './App.css';
import Home from './pages/Home/Home';
import PlantDetail from './pages/PlantDetail/PlantDetail';
import PlantEdit from './pages/PlantEdit/PlantEdit';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <div className="header-container">
            <Link to="/" className="logo">
              <FaLeaf className="logo-icon" />
              <div className="logo-text">Jardim <span>Botânico</span></div>
            </Link>
            <nav className="nav-menu">
              <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
                Início
              </NavLink>
              <NavLink to="/pendentes" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Pendentes
              </NavLink>
            </nav>
          </div>
        </header>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/planta/:id" element={<PlantDetail />} />
            <Route path="/planta/editar/:id" element={<PlantEdit />} />
          </Routes>
        </main>
        
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-text">
              © 2025 Jardim Botânico - Todos os direitos reservados
            </div>
            <div className="footer-links">
              <a href="https://github.com/seu-usuario/plantas-frontend" className="footer-link" target="_blank" rel="noopener noreferrer">
                <FaGithub /> GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;