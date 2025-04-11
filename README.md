# Catálogo de Plantas - Frontend

Aplicação React para exibir um catálogo de plantas com funcionalidades de busca e filtragem.

## Recursos

- Exibição de plantas em um grid responsivo
- Busca por nome, espécie ou descrição
- Filtragem por categorias
- Design moderno e interativo
- Integração com backend REST API

## Tecnologias

- React
- Axios para requisições HTTP
- CSS para estilização

## Configuração

O aplicativo utiliza a API em:
- Produção: `https://plantas-api-dvczcfeqcybveeh5.brazilsouth-01.azurewebsites.net`
- Desenvolvimento: `http://localhost:8080`

## Instalação

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm start

# Build para produção
npm run build
```

## Estrutura do Projeto

- `/src/components` - Componentes React
- `/src/services` - Serviços para integração com a API
- `/public` - Arquivos estáticos

## Endpoints da API

- `GET /plantas` - Lista todas as plantas
- `GET /plantas/{id}` - Obtém uma planta específica
- `GET /plantas/busca?termo={termo}` - Busca plantas por termo
- `GET /plantas/categoria/{categoria}` - Filtra plantas por categoria
