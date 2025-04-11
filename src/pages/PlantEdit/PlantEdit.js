import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import plantasService from '../../services/api';
import './PlantEdit.css';

const PlantEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [planta, setPlanta] = useState({
    nome: '',
    especie: '',
    categoria: '',
    descricao: '',
    imagem: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
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
        setError('Não foi possível carregar os detalhes desta planta para edição.');
        setLoading(false);
      }
    };

    fetchPlanta();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanta({
      ...planta,
      [name]: value
    });
  };

  const handleGoBack = () => {
    navigate(`/planta/${id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Atualizar a planta
      const updatedPlanta = await plantasService.update(id, planta);
      
      showNotification('Planta atualizada com sucesso!', 'success');
      
      // Redirecionar para a página de detalhes após a atualização
      setTimeout(() => {
        navigate(`/planta/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Erro ao atualizar planta:', err);
      setError('Não foi possível atualizar a planta. Por favor, tente novamente.');
      showNotification('Erro ao atualizar planta', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  if (loading) {
    return (
      <div className="plant-edit-container">
        <div className="loading">Carregando planta para edição...</div>
      </div>
    );
  }

  if (error && !planta.id) {
    return (
      <div className="plant-edit-container">
        <div className="error">{error}</div>
        <button className="back-button" onClick={() => navigate('/')}>
          <FaArrowLeft /> Voltar para o Catálogo
        </button>
      </div>
    );
  }

  const isLocalPlant = planta.id && planta.id.toString().startsWith('local_');

  return (
    <>
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="plant-edit-container">
        <div className="plant-edit-header">
          <button className="back-button" onClick={handleGoBack}>
            <FaArrowLeft /> Voltar para Detalhes
          </button>
          <h1>Editar Planta</h1>
        </div>

        {isLocalPlant && (
          <div className="warning-message">
            Esta planta está armazenada localmente e ainda não foi sincronizada com o servidor.
            As alterações serão salvas localmente até que a conexão seja estabelecida.
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="plant-edit-form">
          <div className="form-group">
            <label htmlFor="nome">Nome da Planta*</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={planta.nome}
              onChange={handleChange}
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
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoria</label>
            <input
              type="text"
              id="categoria"
              name="categoria"
              value={planta.categoria}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="descricao">Descrição*</label>
            <textarea
              id="descricao"
              name="descricao"
              value={planta.descricao}
              onChange={handleChange}
              rows="6"
              required
            ></textarea>
          </div>

          <div className="form-group full-width">
            <label htmlFor="imagem">URL da Imagem</label>
            <input
              type="url"
              id="imagem"
              name="imagem"
              value={planta.imagem || ''}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem.jpg"
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
              type="button"
              onClick={handleGoBack}
              className="cancel-button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={saving}
            >
              {saving ? 'Salvando...' : (
                <>
                  <FaSave /> Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PlantEdit; 