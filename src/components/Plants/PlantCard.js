import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaEye, FaEdit } from 'react-icons/fa';
import ConfirmDialog from '../Common/ConfirmDialog';
import './PlantCard.css';

const PlantCard = ({ planta, onDelete }) => {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleViewClick = (e) => {
    e.stopPropagation();
    navigate(`/planta/${planta.id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    // Implementar a edição posteriormente
    navigate(`/planta/editar/${planta.id}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    setShowConfirmDialog(false);
    if (onDelete) {
      onDelete(planta.id);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const isLocalPlant = planta.id && planta.id.toString().startsWith('local_');

  return (
    <>
      <div className="plant-card">
        <div className="plant-image-container">
          {planta.imagem ? (
            <img src={planta.imagem} alt={planta.nome} className="plant-image" />
          ) : (
            <img src="/placeholder-plant.svg" alt="Imagem não disponível" className="plant-image" />
          )}
          {isLocalPlant && (
            <div className="local-badge">
              Pendente de sincronização
            </div>
          )}
        </div>
        
        <div className="plant-card-content">
          <h3>{planta.nome}</h3>
          <p className="species">{planta.especie}</p>
          {planta.categoria && (
            <span className="category-tag">
              {planta.categoria.charAt(0).toUpperCase() + planta.categoria.slice(1)}
            </span>
          )}
          <p className="description">{truncateText(planta.descricao, 120)}</p>
          
          <div className="card-actions">
            <button 
              className="card-action-btn view" 
              onClick={handleViewClick}
              aria-label="Ver detalhes"
            >
              <FaEye /> Ver
            </button>
            <button 
              className="card-action-btn edit" 
              onClick={handleEditClick}
              aria-label="Editar planta"
            >
              <FaEdit /> Editar
            </button>
            <button 
              className="card-action-btn delete" 
              onClick={handleDeleteClick}
              aria-label="Excluir planta"
            >
              <FaTrashAlt /> Excluir
            </button>
          </div>
        </div>
      </div>

      {/* Diálogo de confirmação para exclusão */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
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

export default PlantCard; 