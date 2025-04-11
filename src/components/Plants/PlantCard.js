import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEye, FaEdit, FaSyncAlt } from 'react-icons/fa';
import ConfirmDialog from '../Common/ConfirmDialog';
import './PlantCard.css';

const PlantCard = ({ planta, onDelete }) => {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleViewClick = () => {
    navigate(`/planta/${planta.id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
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

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const isLocalPlant = planta.id && planta.id.toString().startsWith('local_');
  const placeholderImage = '/placeholder-plant.svg';

  return (
    <>
      <div 
        className={`plant-card ${isLocalPlant ? 'plant-card-local' : ''}`}
        onClick={handleViewClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="plant-image-wrapper">
          <img 
            src={planta.imagem || placeholderImage} 
            alt={planta.nome} 
            className="plant-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholderImage;
            }}
          />
          
          {isLocalPlant && (
            <div className="sync-badge">
              <FaSyncAlt className="sync-icon" />
              <span>Pendente</span>
            </div>
          )}
        </div>
        
        <div className="plant-info">
          <h3 className="plant-name">{planta.nome}</h3>
          <p className="plant-species">{planta.especie}</p>
          
          {planta.categoria && (
            <span className="plant-category">
              {planta.categoria.charAt(0).toUpperCase() + planta.categoria.slice(1)}
            </span>
          )}
          
          <p className="plant-description">
            {truncateText(planta.descricao, 100)}
          </p>
          
          <div className={`card-actions ${isHovered ? 'visible' : ''}`}>
            <button 
              className="card-btn view-btn" 
              onClick={handleViewClick}
              aria-label="Ver detalhes"
            >
              <FaEye />
              <span>Detalhes</span>
            </button>
            <button 
              className="card-btn edit-btn" 
              onClick={handleEditClick}
              aria-label="Editar planta"
            >
              <FaEdit />
              <span>Editar</span>
            </button>
            <button 
              className="card-btn delete-btn" 
              onClick={handleDeleteClick}
              aria-label="Excluir planta"
            >
              <FaTrash />
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Excluir planta"
        message={`Tem certeza que deseja excluir "${planta.nome}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmDialog(false)}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
};

export default PlantCard; 