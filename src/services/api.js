import axios from 'axios';

// Configuração da URL base da API
const API_URL = process.env.REACT_APP_API_URL || 'https://plantas-api-dvczcfeqcybveeh5.brazilsouth-01.azurewebsites.net';

// Chave para armazenamento local
const STORAGE_KEY = 'plantas_local_cache';
const PENDING_UPLOADS_KEY = 'plantas_pending_uploads';

// Criar uma instância do axios com as configurações base
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Funções para gerenciar cache local
const localCache = {
  // Salvar dados no cache local
  save: (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  
  // Obter dados do cache local
  get: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  // Adicionar planta ao cache local
  addPlant: (planta) => {
    const plantas = localCache.get();
    // Gerar ID temporário local
    const tempId = `local_${Date.now()}`;
    const plantaComId = { ...planta, id: tempId };
    plantas.push(plantaComId);
    localCache.save(plantas);
    return plantaComId;
  },
  
  // Gerenciar plantas pendentes para upload
  pendingUploads: {
    add: (planta) => {
      const pendingPlantas = localCache.pendingUploads.get();
      pendingPlantas.push(planta);
      localStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pendingPlantas));
    },
    
    get: () => {
      const data = localStorage.getItem(PENDING_UPLOADS_KEY);
      return data ? JSON.parse(data) : [];
    },
    
    remove: (id) => {
      const pendingPlantas = localCache.pendingUploads.get();
      const filteredPlantas = pendingPlantas.filter(p => p.id !== id);
      localStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(filteredPlantas));
    },
    
    clear: () => {
      localStorage.removeItem(PENDING_UPLOADS_KEY);
    }
  }
};

// Adicionar token de autenticação, se necessário
const addAuthToken = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Interceptors para tratamento de requisições
api.interceptors.request.use(
  config => {
    // Adicionar token a cada requisição, se disponível
    addAuthToken();
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptors para tratamento de respostas
api.interceptors.response.use(
  response => response,
  error => {
    // Capturar e tratar erros HTTP específicos
    if (error.response) {
      const { status, data } = error.response;
      console.error(`Erro HTTP ${status}: ${JSON.stringify(data)}`);
      
      // Tratar erros 401 (não autorizado)
      if (status === 401) {
        // Limpar o token e redirecionar para login, se necessário
        localStorage.removeItem('authToken');
        console.error('Sessão expirada ou inválida. Por favor, faça login novamente.');
      }
      
      // Tratar erros 404 (não encontrado)
      if (status === 404) {
        console.error('Recurso não encontrado:', error.config.url);
      }
      
      // Tratar erros 500 (erro no servidor)
      if (status >= 500) {
        console.error('Erro no servidor. Por favor, tente novamente mais tarde.');
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      
      // Se estamos fazendo um GET, podemos tentar procurar os dados no cache local
      if (error.config && error.config.method === 'get') {
        console.log('Tentando obter dados do cache local devido à falha de conexão...');
      }
    } else {
      // Erro na configuração da requisição
      console.error('Erro ao configurar requisição:', error.message);
    }
    
    // Adicionar propriedade para identificar que este erro foi tratado pelo interceptor
    error.isHandledByInterceptor = true;
    
    // Rethrow para que o componente possa lidar com o erro específico
    return Promise.reject(error);
  }
);

// Sincronizar plantas pendentes quando a conexão for restabelecida
const sincronizarPlantasPendentes = async () => {
  const pendingPlantas = localCache.pendingUploads.get();
  
  if (pendingPlantas.length === 0) return;
  
  console.log(`Sincronizando ${pendingPlantas.length} plantas pendentes`);
  
  // Verificar se a API está online
  try {
    const isOnline = await plantasService.ping();
    if (!isOnline) {
      console.log('API offline, não foi possível sincronizar');
      return;
    }
    
    for (const planta of pendingPlantas) {
      try {
        console.log('Tentando sincronizar planta:', planta.nome);
        
        // Criar cópia da planta sem o id local
        const plantaParaEnviar = { ...planta };
        if (plantaParaEnviar.id && plantaParaEnviar.id.toString().startsWith('local_')) {
          delete plantaParaEnviar.id;
        }
        
        // Enviar para o servidor
        await axios({
          method: 'post',
          url: `${API_URL}/plantas`,
          data: plantaParaEnviar,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 15000
        });
        
        // Remover da fila de pendentes
        localCache.pendingUploads.remove(planta.id);
        console.log('Planta sincronizada com sucesso:', planta.nome);
      } catch (err) {
        console.error('Erro ao sincronizar planta:', err);
        // Manter na fila para tentar novamente mais tarde
      }
    }
  } catch (err) {
    console.error('Erro na verificação da API:', err);
  }
};

// Verificar conexão periodicamente e tentar sincronizar
setInterval(async () => {
  try {
    await plantasService.ping();
    sincronizarPlantasPendentes();
  } catch (err) {
    // API ainda está offline
  }
}, 60000); // Verifica a cada minuto

// Métodos de serviço para interagir com a API
const plantasService = {
  // Verificar se a API está online
  ping: async () => {
    try {
      const response = await api.get('/plantas');
      return response.status === 200;
    } catch (error) {
      console.error('Erro no ping:', error);
      return false;
    }
  },

  // Obter todas as plantas
  getAll: async () => {
    try {
      const response = await api.get('/plantas');
      
      // Atualizar o cache local com os dados mais recentes
      localCache.save(response.data);
      
      return response.data;
    } catch (err) {
      // Se falhar, tentar usar o cache local
      const cachedData = localCache.get();
      if (cachedData.length > 0) {
        return cachedData;
      }
      throw err;
    }
  },

  // Obter planta por ID
  getById: async (id) => {
    // Se o ID começar com "local_", é uma planta local
    if (id.toString().startsWith('local_')) {
      const plantas = localCache.get();
      const planta = plantas.find(p => p.id === id);
      if (planta) return planta;
      throw new Error('Planta não encontrada no cache local');
    }
    
    try {
      const response = await api.get(`/plantas/${id}`);
      return response.data;
    } catch (err) {
      // Tentar buscar no cache local
      const plantas = localCache.get();
      const planta = plantas.find(p => p.id === id);
      if (planta) return planta;
      throw err;
    }
  },

  // Buscar plantas por termo
  search: async (term) => {
    try {
      const response = await api.get(`/plantas/busca?termo=${encodeURIComponent(term)}`);
      return response.data;
    } catch (err) {
      // Fallback para busca local
      const plantas = localCache.get();
      const termLower = term.toLowerCase();
      return plantas.filter(planta => 
        planta.nome.toLowerCase().includes(termLower) || 
        planta.especie.toLowerCase().includes(termLower) ||
        (planta.descricao && planta.descricao.toLowerCase().includes(termLower))
      );
    }
  },

  // Filtrar plantas por categoria
  filterByCategory: async (category) => {
    try {
      const response = await api.get(`/plantas/categoria/${encodeURIComponent(category)}`);
      return response.data;
    } catch (err) {
      // Fallback para filtro local
      const plantas = localCache.get();
      return plantas.filter(planta => 
        planta.categoria && planta.categoria.toLowerCase() === category.toLowerCase()
      );
    }
  },
  
  // Adicionar nova planta
  create: async (plantaData) => {
    try {
      // Verificar conexão com o servidor
      console.log('Tentando enviar para:', `${API_URL}/plantas`);
      console.log('Dados enviados:', JSON.stringify(plantaData, null, 2));
      
      // Tentar salvar no servidor com headers explícitos
      const response = await axios({
        method: 'post',
        url: `${API_URL}/plantas`,
        data: plantaData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Adicionar headers CORS para permitir a comunicação
          'Access-Control-Allow-Origin': '*'
        },
        // Aumentar o timeout para dar mais tempo para o servidor responder
        timeout: 15000
      });
      
      console.log('Resposta do servidor:', response);
      
      // Atualizar o cache local
      const plantas = localCache.get();
      if (response.data && response.data.id) {
        plantas.push(response.data);
        localCache.save(plantas);
        
        // Remover da fila de pendentes, se já existir
        const pendingPlantas = localCache.pendingUploads.get();
        const existingIndex = pendingPlantas.findIndex(p => 
          p.nome === plantaData.nome && p.especie === plantaData.especie);
        if (existingIndex !== -1) {
          pendingPlantas.splice(existingIndex, 1);
          localStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pendingPlantas));
        }
      }
      
      return response.data;
    } catch (err) {
      console.error('Erro detalhado na criação:', err);
      console.error('Mensagem de erro:', err.message);
      if (err.response) {
        console.error('Status do erro:', err.response.status);
        console.error('Dados da resposta de erro:', err.response.data);
      }
      
      // Se falhar, salvar localmente e na fila de pendentes
      const plantaLocal = localCache.addPlant(plantaData);
      localCache.pendingUploads.add(plantaLocal);
      
      return plantaLocal;
    }
  },
  
  // Atualizar planta existente (exemplo para futura implementação)
  update: async (id, plantaData) => {
    // Se for uma planta local, apenas atualizar o cache
    if (id.toString().startsWith('local_')) {
      const plantas = localCache.get();
      const index = plantas.findIndex(p => p.id === id);
      
      if (index !== -1) {
        plantas[index] = { ...plantas[index], ...plantaData };
        localCache.save(plantas);
        return plantas[index];
      }
      
      throw new Error('Planta não encontrada no cache local');
    }
    
    try {
      const response = await api.put(`/plantas/${id}`, plantaData);
      
      // Atualizar o cache local
      const plantas = localCache.get();
      const index = plantas.findIndex(p => p.id === id);
      
      if (index !== -1) {
        plantas[index] = response.data;
        localCache.save(plantas);
      }
      
      return response.data;
    } catch (err) {
      throw err;
    }
  },
  
  // Deletar planta
  delete: async (id) => {
    // Se for uma planta local, apenas remover do cache
    if (id.toString().startsWith('local_')) {
      console.log('Excluindo planta local:', id);
      
      // Remover do cache principal
      const plantas = localCache.get();
      const filteredPlantas = plantas.filter(p => p.id !== id);
      localCache.save(filteredPlantas);
      
      // Remover da fila de pendentes, se existir
      localCache.pendingUploads.remove(id);
      
      return { success: true, message: 'Planta local excluída com sucesso' };
    }
    
    try {
      console.log('Tentando excluir planta do servidor:', id);
      
      // Fazer a requisição com opções estendidas
      const response = await axios({
        method: 'delete',
        url: `${API_URL}/plantas/${id}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('Resposta da exclusão:', response);
      
      // Atualizar o cache local
      const plantas = localCache.get();
      const filteredPlantas = plantas.filter(p => p.id !== id);
      localCache.save(filteredPlantas);
      
      return response.data || { success: true, message: 'Planta excluída com sucesso' };
    } catch (err) {
      console.error('Erro ao excluir planta:', err);
      
      if (err.response && err.response.status === 404) {
        // Se o servidor retorna 404, significa que a planta não existe
        // Vamos removê-la do cache local de qualquer forma
        const plantas = localCache.get();
        const filteredPlantas = plantas.filter(p => p.id !== id);
        localCache.save(filteredPlantas);
        
        return { success: true, message: 'Planta não encontrada no servidor, mas removida do cache local' };
      }
      
      throw err;
    }
  }
};

export default plantasService; 