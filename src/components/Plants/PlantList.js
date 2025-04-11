import React, { useState, useEffect } from 'react';
import plantasService from '../../services/api';
import PlantForm from './PlantForm';
import PlantCard from './PlantCard';
import PendingUploads from './PendingUploads';
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
    const fetchPlantas = async () => {
      try {
        setLoading(true);
        
        // Verificar se a API está online
        try {
          await plantasService.ping();
          setApiStatus('conectado');
        } catch (pingError) {
          console.error('Erro ao verificar API:', pingError);
          setApiStatus('desconectado');
        }
        
        const data = await plantasService.getAll();
        setPlantas(data);
        setFilteredPlantas(data);
        setLoading(false);
      } catch (err) {
        console.error('Erro detalhado:', err);
        
        // Mensagens de erro mais específicas para o Azure
        if (err.message && err.message.includes('Network Error')) {
          setError('Erro de conexão. Se sua internet está funcionando, o servidor pode estar offline. Você ainda pode adicionar plantas que serão sincronizadas quando o servidor estiver disponível.');
          setApiStatus('desconectado');
        } else if (err.response && err.response.status === 404) {
          setError('Endpoint não encontrado na API. Você ainda pode adicionar plantas que serão sincronizadas quando o servidor estiver disponível.');
          setApiStatus('parcial');
        } else if (err.response && err.response.status >= 500) {
          setError('Problema no servidor. Você ainda pode adicionar plantas que serão sincronizadas quando o servidor estiver disponível.');
          setApiStatus('desconectado');
        } else {
          setError('Erro ao carregar as plantas. Você ainda pode adicionar plantas que serão sincronizadas quando o servidor estiver disponível.');
          setApiStatus('desconectado');
        }
        
        // Mesmo com erro, definimos plantas como um array vazio
        setPlantas([]);
        setFilteredPlantas([]);
        setLoading(false);
      }
    };

    fetchPlantas();
  }, []);

  // Função para buscar plantas usando o termo de busca
  const searchPlantas = async () => {
    if (!searchTerm.trim()) {
      setFilteredPlantas(plantas);
      return;
    }
    
    setIsSearching(true);
    try {
      // Verificar se o backend suporta busca por API
      // Se sim, usamos a API de busca, senão fazemos a filtragem no frontend
      try {
        const results = await plantasService.search(searchTerm);
        setFilteredPlantas(results);
      } catch (searchError) {
        // Fallback para busca no frontend se a API de busca não existir
        const term = searchTerm.toLowerCase();
        const results = plantas.filter(planta => 
          planta.nome.toLowerCase().includes(term) || 
          planta.especie.toLowerCase().includes(term) ||
          planta.descricao.toLowerCase().includes(term)
        );
        setFilteredPlantas(results);
      }
    } catch (err) {
      console.error('Erro na busca:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Função para filtrar por categoria
  const filterByCategory = async (category) => {
    if (category === 'todas') {
      setFilteredPlantas(plantas);
      return;
    }
    
    try {
      // Verificar se o backend suporta filtro por categoria
      // Se sim, usamos a API, senão fazemos a filtragem no frontend
      try {
        const results = await plantasService.filterByCategory(category);
        setFilteredPlantas(results);
      } catch (filterError) {
        // Fallback para filtro no frontend
        const results = plantas.filter(planta => 
          planta.categoria && planta.categoria.toLowerCase() === category.toLowerCase()
        );
        setFilteredPlantas(results);
      }
    } catch (err) {
      console.error('Erro no filtro:', err);
    }
  };

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
    }, 5000);
  };

  // Função para excluir uma planta
  const handleDeletePlant = async (id) => {
    try {
      await plantasService.delete(id);
      
      // Atualizar as listas de plantas
      const updatedPlantas = plantas.filter(planta => planta.id !== id);
      setPlantas(updatedPlantas);
      setFilteredPlantas(filteredPlantas.filter(planta => planta.id !== id));
      
      showNotification('Planta excluída com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao excluir planta:', err);
      showNotification('Erro ao excluir planta. Tente novamente.', 'error');
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
    
    showNotification('Planta adicionada com sucesso!');
  };

  // Extrair categorias únicas das plantas
  const categorias = ['todas', ...new Set(plantas
    .filter(planta => planta.categoria)
    .map(planta => planta.categoria.toLowerCase()))];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };
  
  return (
    <div className="plant-list">
      <h2>Catálogo de Plantas</h2>
      <p className="plant-list-subtitle">
        Explore nossa seleção de plantas ornamentais e medicinais, escolhidas a dedo para embelezar seu jardim e casa.
      </p>
      
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="api-indicator">
        <span className="azure-icon"></span>
        <span className={`status-${apiStatus}`}></span>
        {apiStatus === 'conectado' ? 'Conectado à API' : 
         apiStatus === 'parcial' ? 'Conectado parcialmente à API' : 
         'API não disponível - Modo Offline'}
      </div>
      
      <PendingUploads />
      
      <button className="toggle-form-button" onClick={toggleForm}>
        {showForm ? 'Ocultar Formulário' : '+ Adicionar Nova Planta'}
      </button>
      
      {showForm && (
        <PlantForm 
          onPlantAdded={handlePlantAdded} 
          categorias={categorias}
        />
      )}
      
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Buscar plantas..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        
        <select 
          className="filter-dropdown"
          value={filter}
          onChange={handleFilterChange}
        >
          {categorias.map((categoria, index) => (
            <option key={index} value={categoria}>
              {categoria === 'todas' ? 'Todas as categorias' : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <div className="loading">Carregando plantas...</div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
          <p className="error-subtitle">Você pode adicionar plantas usando o botão acima</p>
        </div>
      ) : isSearching ? (
        <div className="loading">Buscando...</div>
      ) : filteredPlantas.length === 0 ? (
        <div className="no-results">
          <p>Nenhuma planta encontrada com os critérios selecionados.</p>
          <p>Adicione novas plantas usando o botão acima.</p>
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