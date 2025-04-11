import React, { useState, useEffect, useCallback } from 'react';
import plantasService from '../../services/api';
import PlantForm from './PlantForm';
import PlantCard from './PlantCard';
import PendingUploads from './PendingUploads';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import './PlantList.css';

const PlantList = () => {
  const [plantas, setPlantas] = useState([]);
  const [filteredPlantas, setFilteredPlantas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('todas');
  const [isSearching, setIsSearching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [apiStatus, setApiStatus] = useState('verificando');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Carregar todas as plantas ao iniciar
  useEffect(() => {
    fetchPlantas();
  }, []);

  const fetchPlantas = async () => {
    try {
      setLoading(true);
      
      // Verificar status da API
      try {
        await plantasService.ping();
        setApiStatus('conectado');
      } catch (pingError) {
        setApiStatus('desconectado');
      }
      
      const data = await plantasService.getAll();
      setPlantas(data);
      setFilteredPlantas(data);
    } catch (err) {
      console.error('Erro ao carregar plantas:', err);
      
      if (err.message && err.message.includes('Network Error')) {
        setError('Erro de conexão. Modo offline ativado.');
      } else if (err.response && err.response.status === 404) {
        setError('API indisponível. Modo offline ativado.');
      } else {
        setError('Erro ao carregar plantas. Modo offline ativado.');
      }
      
      setPlantas([]);
      setFilteredPlantas([]);
      setApiStatus('desconectado');
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar plantas (memoizada com useCallback)
  const searchPlantas = useCallback(async () => {
    if (!searchTerm.trim()) {
      setFilteredPlantas(plantas);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await plantasService.search(searchTerm);
      setFilteredPlantas(results);
    } catch (err) {
      // Fallback para busca no frontend
      const term = searchTerm.toLowerCase();
      const results = plantas.filter(planta => 
        planta.nome?.toLowerCase().includes(term) || 
        planta.especie?.toLowerCase().includes(term) ||
        planta.descricao?.toLowerCase().includes(term)
      );
      setFilteredPlantas(results);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, plantas]);

  // Função para filtrar por categoria (memoizada com useCallback)
  const filterByCategory = useCallback(async (category) => {
    if (category === 'todas') {
      setFilteredPlantas(plantas);
      return;
    }
    
    try {
      const results = await plantasService.filterByCategory(category);
      setFilteredPlantas(results);
    } catch (err) {
      // Fallback para filtro no frontend
      const results = plantas.filter(planta => 
        planta.categoria?.toLowerCase() === category.toLowerCase()
      );
      setFilteredPlantas(results);
    }
  }, [plantas]);

  // Lidar com mudança na busca
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchPlantas();
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchTerm, searchPlantas]);

  // Lidar com mudança no filtro
  useEffect(() => {
    filterByCategory(filter);
  }, [filter, filterByCategory]);

  // Função para mostrar uma notificação
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Função para excluir uma planta
  const handleDeletePlant = async (id) => {
    try {
      await plantasService.delete(id);
      
      // Atualizar as listas de plantas
      const updatedPlantas = plantas.filter(planta => planta.id !== id);
      setPlantas(updatedPlantas);
      setFilteredPlantas(filteredPlantas.filter(planta => planta.id !== id));
      
      showNotification('Planta excluída com sucesso!');
    } catch (err) {
      showNotification('Erro ao excluir planta.', 'error');
    }
  };

  // Função para adicionar uma nova planta
  const handlePlantAdded = (newPlant) => {
    // Adicionar a nova planta à lista
    const updatedPlantas = [...plantas, newPlant];
    setPlantas(updatedPlantas);
    
    // Atualizar a lista filtrada se necessário
    if (filter === 'todas' || 
        (newPlant.categoria && newPlant.categoria.toLowerCase() === filter.toLowerCase())) {
      setFilteredPlantas([...filteredPlantas, newPlant]);
    }
    
    // Fechar o formulário após adicionar
    setShowForm(false);
    showNotification('Planta adicionada com sucesso!');
  };

  // Extrair categorias únicas das plantas
  const categorias = ['todas', ...new Set(plantas
    .filter(planta => planta.categoria)
    .map(planta => planta.categoria.toLowerCase()))];

  return (
    <div className="plant-list">
      <div className="plant-list-header">
        <div>
          <h2>Catálogo de Plantas</h2>
          <div className={`api-status ${apiStatus}`}>
            {apiStatus === 'conectado' ? 'Online' : 'Offline'}
          </div>
        </div>
        <button 
          className="add-plant-button" 
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus /> {showForm ? 'Cancelar' : 'Nova Planta'}
        </button>
      </div>
      
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {showForm && (
        <PlantForm 
          onPlantAdded={handlePlantAdded} 
          categorias={categorias}
          onCancel={() => setShowForm(false)}
        />
      )}
      
      <div className="search-filter-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar plantas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {categorias.map((categoria, index) => (
              <option key={index} value={categoria}>
                {categoria === 'todas' ? 'Todas as categorias' : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <PendingUploads />
      
      {loading ? (
        <div className="loading-indicator">Carregando plantas...</div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchPlantas} className="retry-button">Tentar novamente</button>
        </div>
      ) : isSearching ? (
        <div className="loading-indicator">Buscando...</div>
      ) : filteredPlantas.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma planta encontrada.</p>
          <button onClick={() => setShowForm(true)} className="empty-add-button">
            <FaPlus /> Adicionar planta
          </button>
        </div>
      ) : (
        <div className="plants-grid">
          {filteredPlantas.map(planta => (
            <PlantCard 
              key={planta.id || `temp-${planta.nome}`} 
              planta={planta} 
              onDelete={handleDeletePlant}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantList; 