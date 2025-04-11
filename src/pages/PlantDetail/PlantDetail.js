import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrashAlt } from 'react-icons/fa';
import plantasService from '../../services/api';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import './PlantDetail.css';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [planta, setPlanta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchPlanta = async () => {
      try {
        setLoading(true);
        const data = await plantasService.getById(id);
        setPlanta(data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar planta:', err);
        setError('Não foi possível carregar os detalhes desta planta.');
        setLoading(false);
      }
    };

    fetchPlanta();
  }, [id]);

  const handleGoBack = () => {
    navigate('/');
  };
  
  const handleEdit = () => {
    navigate(`/planta/editar/${id}`);
  };
  
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    setShowDeleteDialog(false);
    
    try {
      await plantasService.delete(id);
      showNotification('Planta excluída com sucesso!', 'success');
      
      // Redirecionar para a página inicial após breve pausa
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Erro ao excluir planta:', err);
      showNotification('Erro ao excluir planta. Tente novamente.', 'error');
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };
  
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  if (loading) {
    return (
      <div className="plant-detail-container">
        <div className="loading">Carregando detalhes da planta...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plant-detail-container">
        <div className="error">{error}</div>
        <button className="back-button" onClick={handleGoBack}>
          <FaArrowLeft /> Voltar para o Catálogo
        </button>
      </div>
    );
  }

  if (!planta) {
    return (
      <div className="plant-detail-container">
        <div className="error">Planta não encontrada</div>
        <button className="back-button" onClick={handleGoBack}>
          <FaArrowLeft /> Voltar para o Catálogo
        </button>
      </div>
    );
  }

  return (
    <>
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="plant-detail-container">
        <div className="plant-detail-header">
          <button className="back-button" onClick={handleGoBack}>
            <FaArrowLeft /> Voltar para o Catálogo
          </button>
          
          <div className="action-buttons">
            <button className="edit-button" onClick={handleEdit}>
              <FaEdit /> Editar
            </button>
            <button className="delete-button" onClick={handleDeleteClick}>
              <FaTrashAlt /> Excluir
            </button>
          </div>
        </div>

        <div className="plant-detail-content">
          <div className="plant-detail-image-container">
            {planta.imagem ? (
              <img src={planta.imagem} alt={planta.nome} className="plant-detail-image" />
            ) : (
              <img src="/placeholder-plant.svg" alt="Imagem não disponível" className="plant-detail-image" />
            )}
            
            {planta.id.toString().startsWith('local_') && (
              <div className="sync-badge">
                Pendente de sincronização
              </div>
            )}
          </div>

          <div className="plant-detail-info">
            <h1 className="plant-name">{planta.nome}</h1>
            <p className="plant-species">{planta.especie}</p>
            
            {planta.categoria && (
              <span className="plant-category">
                {planta.categoria.charAt(0).toUpperCase() + planta.categoria.slice(1)}
              </span>
            )}
            
            <div className="plant-description-section">
              <h2>Descrição</h2>
              <p className="plant-description">{planta.descricao}</p>
            </div>
            
            <div className="plant-meta">
              <p className="plant-id">ID: {planta.id}</p>
              {planta.id.toString().startsWith('local_') && (
                <p className="plant-sync-status">
                  ⚠️ Esta planta está armazenada localmente e será sincronizada com o servidor quando possível
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir a planta ${planta.nome}? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
};

export default PlantDetail; 