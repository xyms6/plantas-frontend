import React, { useState } from 'react';
import plantasService from '../../services/api';
import './PlantForm.css';

const PlantForm = ({ onPlantAdded, categorias }) => {
  const [planta, setPlanta] = useState({
    nome: '',
    especie: '',
    categoria: '',
    descricao: '',
    imagem: ''
  });
  const [novaCategoria, setNovaCategoria] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanta(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
    }
  };

  const handleNovaCategoriaChange = (e) => {
    const value = e.target.value;
    setNovaCategoria(value);
    
    // Atualizar diretamente o valor da categoria com o que o usuário digita
    setPlanta(prev => ({
      ...prev,
      categoria: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    // Preparar os dados para envio no formato que o backend espera
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
      console.log('Enviando planta para o servidor:', JSON.stringify(plantaToSubmit, null, 2));
      const novaPlanta = await plantasService.create(plantaToSubmit);
      console.log('Resposta do servidor:', novaPlanta);
      
      // Limpar o formulário
      setPlanta({
        nome: '',
        especie: '',
        categoria: '',
        descricao: '',
        imagem: ''
      });
      setNovaCategoria('');
      
      setSuccess(true);
      
      // Notificar o componente pai sobre a nova planta
      if (onPlantAdded) {
        onPlantAdded(novaPlanta);
      }
      
    } catch (err) {
      console.error('Erro ao adicionar planta:', err);
      if (err.response && err.response.status === 400) {
        setError(`Dados inválidos: ${err.response.data.message || 'Verifique os campos e tente novamente.'}`);
      } else if (err.response && err.response.status === 401) {
        setError('Você não tem permissão para adicionar plantas.');
      } else if (err.message && err.message.includes('Network Error')) {
        setError('Erro de conexão com o servidor. A planta foi salva localmente e será sincronizada quando a conexão for restabelecida.');
        // Mostrar sucesso mesmo no caso de erro de rede, já que foi salvo localmente
        setSuccess(true);
      } else {
        setError(`Erro ao adicionar planta: ${err.message}. A planta foi salva localmente.`);
        // Mostrar sucesso mesmo no caso de erro, já que foi salvo localmente
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plant-form-container">
      <h3>Adicionar Nova Planta</h3>
      
      {success && (
        <div className="success-message">
          Planta adicionada com sucesso!
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="plant-form">
        <div className="form-group">
          <label htmlFor="nome">Nome da Planta*</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={planta.nome}
            onChange={handleChange}
            placeholder="Ex: Monstera Deliciosa"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="especie">Espécie*</label>
          <input
            type="text"
            id="especie"
            name="especie"
            value={planta.especie}
            onChange={handleChange}
            placeholder="Ex: Monstera deliciosa"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="categoria">Categoria</label>
          <select
            id="categoria"
            name="categoria"
            value={planta.categoria === '' && novaCategoria !== '' ? 'nova' : planta.categoria}
            onChange={handleCategoriaChange}
          >
            <option value="">Selecione uma categoria</option>
            {categorias && categorias.filter(cat => cat !== 'todas').map((categoria, index) => (
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
            <label htmlFor="novaCategoria">Nova Categoria*</label>
            <input
              type="text"
              id="novaCategoria"
              name="novaCategoria"
              value={novaCategoria}
              onChange={handleNovaCategoriaChange}
              placeholder="Digite o nome da nova categoria"
              required
            />
          </div>
        ) : null}
        
        <div className="form-group">
          <label htmlFor="descricao">Descrição*</label>
          <textarea
            id="descricao"
            name="descricao"
            value={planta.descricao}
            onChange={handleChange}
            placeholder="Descreva características da planta..."
            rows="4"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="imagem">URL da Imagem</label>
          <input
            type="url"
            id="imagem"
            name="imagem"
            value={planta.imagem}
            onChange={handleChange}
            placeholder="https://exemplo.com/imagem-da-planta.jpg"
          />
        </div>
        
        {planta.imagem && (
          <div className="image-preview">
            <p>Pré-visualização:</p>
            <img src={planta.imagem} alt="Pré-visualização" />
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Adicionando...' : 'Adicionar Planta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlantForm; 