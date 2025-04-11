import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PlantList.css';

const PlantList = () => {
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // URL da API - será substituída pela variável de ambiente em produção
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    const fetchPlantas = async () => {
      try {
        const response = await axios.get(`${API_URL}/plantas`);
        setPlantas(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar as plantas. Tente novamente mais tarde.');
        setLoading(false);
        console.error('Erro:', err);
      }
    };

    fetchPlantas();
  }, [API_URL]);

  if (loading) return <div className="loading">Carregando plantas...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="plant-list">
      <h2>Catálogo de Plantas</h2>
      {plantas.length === 0 ? (
        <p>Nenhuma planta encontrada.</p>
      ) : (
        <div className="plants-grid">
          {plantas.map(planta => (
            <div key={planta.id} className="plant-card">
              {planta.imagem && (
                <img src={planta.imagem} alt={planta.nome} className="plant-image" />
              )}
              <h3>{planta.nome}</h3>
              <p className="species">{planta.especie}</p>
              <p className="description">{planta.descricao}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantList;