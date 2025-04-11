import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaChevronDown, FaChevronUp, FaSync } from 'react-icons/fa';
import plantasService from '../../services/api';
import './PendingUploads.css';

const PendingUploads = () => {
  const [pendingPlants, setPendingPlants] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [syncingStatus, setSyncingStatus] = useState('idle');

  const loadPendingPlants = () => {
    const data = localStorage.getItem('plantas_pending_uploads');
    if (data) {
      try {
        const plants = JSON.parse(data);
        setPendingPlants(plants);
      } catch (err) {
        console.error('Erro ao carregar plantas pendentes:', err);
      }
    }
  };

  useEffect(() => {
    // Carregar plantas pendentes do localStorage
    loadPendingPlants();
    
    // Recarregar a cada 5 segundos para manter atualizado
    const interval = setInterval(loadPendingPlants, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleForceSyncClick = async () => {
    if (pendingPlants.length === 0) return;
    
    setSyncingStatus('syncing');
    
    try {
      // Verificar conexão com a API
      const isOnline = await plantasService.ping();
      
      if (!isOnline) {
        setSyncingStatus('error');
        setTimeout(() => setSyncingStatus('idle'), 3000);
        return;
      }
      
      // Sincronizar plantas pendentes
      for (const plant of pendingPlants) {
        try {
          await plantasService.create(plant);
          
          // Remover da lista de pendentes
          const pendingData = localStorage.getItem('plantas_pending_uploads');
          if (pendingData) {
            const pendingList = JSON.parse(pendingData);
            const updatedList = pendingList.filter(p => p.id !== plant.id);
            localStorage.setItem('plantas_pending_uploads', JSON.stringify(updatedList));
          }
        } catch (err) {
          console.error('Erro ao sincronizar planta:', err);
        }
      }
      
      // Recarregar plantas pendentes
      loadPendingPlants();
      
      setSyncingStatus('success');
      setTimeout(() => setSyncingStatus('idle'), 3000);
    } catch (err) {
      console.error('Erro ao sincronizar plantas:', err);
      setSyncingStatus('error');
      setTimeout(() => setSyncingStatus('idle'), 3000);
    }
  };

  if (pendingPlants.length === 0) {
    return null;
  }

  return (
    <div className="pending-uploads">
      <div className="pending-header" onClick={() => setShowDetails(!showDetails)}>
        <span className="pending-icon"><FaCloudUploadAlt /></span>
        <span className="pending-count">
          {pendingPlants.length} {pendingPlants.length === 1 ? 'planta' : 'plantas'} pendente{pendingPlants.length > 1 ? 's' : ''} de sincronização
        </span>
        <button 
          className={`sync-button ${syncingStatus}`} 
          onClick={(e) => {
            e.stopPropagation();
            handleForceSyncClick();
          }} 
          disabled={syncingStatus === 'syncing'}
        >
          <FaSync className={syncingStatus === 'syncing' ? 'rotating' : ''} />
          {syncingStatus === 'idle' && 'Sincronizar Agora'}
          {syncingStatus === 'syncing' && 'Sincronizando...'}
          {syncingStatus === 'success' && 'Sincronizado!'}
          {syncingStatus === 'error' && 'Erro ao sincronizar'}
        </button>
        <span className="pending-toggle">{showDetails ? <FaChevronUp /> : <FaChevronDown />}</span>
      </div>
      
      {showDetails && (
        <div className="pending-list">
          {pendingPlants.map((plant, index) => (
            <div key={index} className="pending-item">
              <strong>{plant.nome}</strong> - <em>{plant.especie}</em>
              <span className="pending-status">Aguardando conexão...</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingUploads; 