import React, { useState } from 'react';
import plantasService from '../../services/api';
import { FaSave, FaTimes, FaImage } from 'react-icons/fa';
import './PlantForm.css';

const PlantForm = ({ onPlantAdded, categorias = [], onCancel }) => {
  const initialState = {
    nome: '',
    especie: '',
    categoria: '',
    descricao: '',
    imagem: ''
  };
  
  const [planta, setPlanta] = useState(initialState);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Atualiza dados do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanta(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Marca o campo como tocado
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Limpa erro se existir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Lida com seleção de categoria
  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    
    if (value === 'nova') {
      setPlanta(prev => ({
        ...prev,
        categoria: ''
      }));
    } else {
      setPlanta(prev => ({
        ...prev,
        categoria: value
      }));
      setNovaCategoria('');
    }
  };

  // Atualiza categoria ao digitar nova
  const handleNovaCategoriaChange = (e) => {
    const value = e.target.value;
    setNovaCategoria(value);
    setPlanta(prev => ({
      ...prev,
      categoria: value
    }));
  };

  // Valida os campos do formulário
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!planta.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
      isValid = false;
    }
    
    if (!planta.especie.trim()) {
      newErrors.especie = 'Espécie é obrigatória';
      isValid = false;
    }
    
    if (!planta.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
      isValid = false;
    } else if (planta.descricao.length < 10) {
      newErrors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
      isValid = false;
    }
    
    if (planta.imagem && !isValidImageUrl(planta.imagem)) {
      newErrors.imagem = 'URL de imagem inválida';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Valida URL de imagem
  const isValidImageUrl = (url) => {
    if (!url) return true;
    return url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
  };

  // Envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marca todos os campos como tocados para mostrar erros
    const allFields = Object.keys(planta).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouchedFields(allFields);
    
    // Valida antes de enviar
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Preparar dados para envio
    const plantaToSubmit = {
      nome: planta.nome.trim(),
      especie: planta.especie.trim(),
      descricao: planta.descricao.trim()
    };
    
    // Adicionar categoria se existir
    if (planta.categoria && planta.categoria.trim()) {
      plantaToSubmit.categoria = planta.categoria.trim().toLowerCase();
    }
    
    // Adicionar imagem se existir
    if (planta.imagem && planta.imagem.trim()) {
      plantaToSubmit.imagem = planta.imagem.trim();
    }
    
    try {
      // Enviar para a API
      const novaPlanta = await plantasService.create(plantaToSubmit);
      
      // Limpar formulário
      setPlanta(initialState);
      setNovaCategoria('');
      setTouchedFields({});
      
      // Notificar componente pai
      if (onPlantAdded) {
        onPlantAdded(novaPlanta);
      }
    } catch (err) {
      // Tratar erros da API
      if (err.response && err.response.data) {
        setErrors({
          submit: `Erro: ${err.response.data.message || 'Falha ao adicionar planta'}`
        });
      } else {
        setErrors({
          submit: 'Planta salva localmente. Será sincronizada quando a conexão for restabelecida.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  // Verifica se tem erro e campo já foi tocado
  const hasError = (field) => {
    return touchedFields[field] && errors[field];
  };

  return (
    <div className="plant-form-container">
      <div className="form-header">
        <h3>Adicionar Nova Planta</h3>
        <button 
          type="button" 
          className="close-button"
          onClick={handleCancel}
          aria-label="Fechar"
        >
          <FaTimes />
        </button>
      </div>
      
      {errors.submit && (
        <div className="form-message info">
          {errors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="plant-form">
        <div className="form-row">
          <div className={`form-group ${hasError('nome') ? 'has-error' : ''}`}>
            <label htmlFor="nome">Nome da Planta*</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={planta.nome}
              onChange={handleChange}
              placeholder="Ex: Monstera Deliciosa"
            />
            {hasError('nome') && <span className="error-text">{errors.nome}</span>}
          </div>
          
          <div className={`form-group ${hasError('especie') ? 'has-error' : ''}`}>
            <label htmlFor="especie">Espécie*</label>
            <input
              type="text"
              id="especie"
              name="especie"
              value={planta.especie}
              onChange={handleChange}
              placeholder="Ex: Monstera deliciosa"
            />
            {hasError('especie') && <span className="error-text">{errors.especie}</span>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="categoria">Categoria</label>
            <select
              id="categoria"
              name="categoria"
              value={planta.categoria === '' && novaCategoria !== '' ? 'nova' : planta.categoria}
              onChange={handleCategoriaChange}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.filter(cat => cat !== 'todas').map((categoria, index) => (
                <option key={index} value={categoria}>
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </option>
              ))}
              <option value="nova">+ Nova Categoria</option>
            </select>
          </div>
          
          {(planta.categoria === '' && novaCategoria !== '') || 
           (planta.categoria === 'nova') ? (
            <div className="form-group">
              <label htmlFor="novaCategoria">Nova Categoria</label>
              <input
                type="text"
                id="novaCategoria"
                name="novaCategoria"
                value={novaCategoria}
                onChange={handleNovaCategoriaChange}
                placeholder="Nome da nova categoria"
              />
            </div>
          ) : null}
        </div>
        
        <div className={`form-group ${hasError('descricao') ? 'has-error' : ''}`}>
          <label htmlFor="descricao">Descrição*</label>
          <textarea
            id="descricao"
            name="descricao"
            value={planta.descricao}
            onChange={handleChange}
            placeholder="Descreva as características da planta, cuidados necessários, etc."
            rows="3"
          ></textarea>
          {hasError('descricao') && <span className="error-text">{errors.descricao}</span>}
        </div>
        
        <div className={`form-group ${hasError('imagem') ? 'has-error' : ''}`}>
          <label htmlFor="imagem">
            <FaImage /> URL da Imagem
          </label>
          <input
            type="url"
            id="imagem"
            name="imagem"
            value={planta.imagem}
            onChange={handleChange}
            placeholder="https://exemplo.com/imagem.jpg"
          />
          {hasError('imagem') && <span className="error-text">{errors.imagem}</span>}
        </div>
        
        {planta.imagem && !errors.imagem && (
          <div className="image-preview">
            <img 
              src={planta.imagem} 
              alt="Pré-visualização" 
              onError={(e) => {
                e.target.onerror = null;
                setErrors(prev => ({
                  ...prev,
                  imagem: 'Não foi possível carregar a imagem'
                }));
              }}
            />
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={handleCancel}
            disabled={loading}
          >
            <FaTimes /> Cancelar
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>Salvando...</>
            ) : (
              <><FaSave /> Salvar Planta</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlantForm; 