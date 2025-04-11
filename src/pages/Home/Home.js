import React from 'react';
import { FaSeedling, FaSearch, FaLeaf } from 'react-icons/fa';
import PlantList from '../../components/Plants/PlantList';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Bem-vindo ao Jardim Botânico</h1>
          <p>Explore nossa coleção de plantas e descubra a beleza da natureza</p>
          <div className="search-bar">
            <input type="text" placeholder="Pesquisar plantas..." />
            <button type="button">
              <FaSearch /> Buscar
            </button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <FaSeedling className="feature-icon" />
          <h3>Plantas Raras</h3>
          <p>Conheça espécies raras e exóticas da flora mundial</p>
        </div>
        <div className="feature-card">
          <FaLeaf className="feature-icon" />
          <h3>Catálogo Completo</h3>
          <p>Mais de 500 espécies catalogadas com detalhes</p>
        </div>
      </section>

      <section className="plants-section">
        <h2>Nossa Coleção</h2>
        <PlantList />
      </section>
    </div>
  );
};

export default Home; 