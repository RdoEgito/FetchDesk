# FetchDesk - Delivery & Order Management

Sistema de gerenciamento de pedidos e entregas com arquitetura moderna baseada em **React** (frontend) e **NestJS** (backend).

## 🏗️ Estrutura do Projeto

```
FetchDesk/
├── FetchDesk.Client.React/          # Frontend em React + Vite
├── FetchDesk.Nest/                  # Backend em NestJS + TypeORM
├── FetchDesk.Shared.TS/             # DTOs e interfaces compartilhadas (TypeScript)
├── docker-compose.yml               # Orquestração de containers (produção)
├── docker-compose.dev.yml           # Orquestração de containers (desenvolvimento)
└── DEPLOY.md                        # Guia de deploy para produção
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 20+
- Docker & Docker Compose (para banco de dados e RabbitMQ)

### Desenvolvimento Local

**1. Instalar dependências**
```bash
cd FetchDesk.Client.React && npm install
cd ../FetchDesk.Nest && npm install
cd ../FetchDesk.Shared.TS && npm install
```

**2. Iniciar com Docker Compose (dev)**
```bash
docker-compose -f docker-compose.dev.yml up
```

Serviços:
- 🖥️ Frontend React: http://localhost:5173
- 🔌 Backend NestJS: http://localhost:5000
- 🗄️ PostgreSQL: localhost:5432
- 🐰 RabbitMQ: http://localhost:15672

**3. Variáveis de Ambiente**

Copie `.env.example` para `.env` (se existir) ou configure manualmente:

**FetchDesk.Nest/.env**
```env
DATABASE_URL=postgres://admin:adminpassword@database:5432/order_management_db
RABBITMQ_URL=amqp://rabbitmq:5672
NODE_ENV=development
```

**FetchDesk.Client.React/.env**
```env
VITE_API_BASE_URL=http://localhost:5000
```

## 📦 Tecnologias

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Bootstrap 5** - CSS framework

### Backend
- **NestJS** - Node.js framework
- **TypeORM** - ORM para PostgreSQL
- **Socket.io** - WebSocket real-time
- **RabbitMQ** - Message queue
- **Swagger** - API documentation

### Shared
- **TypeScript** - DTOs e interfaces compartilhadas

## 🔌 API Endpoints

Documentação interativa disponível em: `http://localhost:5000/api/docs` (Swagger)

Principais recursos:
- `GET/POST /customers` - Gerenciar clientes
- `GET/POST /products` - Catálogo de produtos
- `GET/POST /orders` - Gerenciar pedidos
- `PATCH /items/:id/deliver` - Marcar item como entregue

## 🚀 Deployment

Veja [DEPLOY.md](./DEPLOY.md) para instruções completas de deploy em produção com:
- ✅ Vercel (Frontend)
- ✅ Render (Backend)
- ✅ Neon (PostgreSQL)
- ✅ CloudAMQP (RabbitMQ)

## 📝 Scripts Disponíveis

### Frontend
```bash
npm run dev      # Desenvolvimento com hot reload
npm run build    # Build para produção
npm run preview  # Preview build local
```

### Backend
```bash
npm run dev      # Desenvolvimento com watch mode
npm run build    # Compilar TypeScript
npm start        # Executar build em produção
```

## 🗄️ Banco de Dados

Migrações automáticas via TypeORM. Para resetar o banco:

```bash
# Delete volume do PostgreSQL
docker volume rm fetchdesk_postgres_data

# Reinicie o container
docker-compose -f docker-compose.dev.yml restart database
```

## 📚 Estrutura do Código

### Frontend (`FetchDesk.Client.React/src/`)
- `pages/` - Componentes de página
- `components/` - Componentes reutilizáveis
- `api.js` - Funções de integração com API
- `styles/` - Estilos CSS

### Backend (`FetchDesk.Nest/src/`)
- `modules/` - Módulos NestJS (customers, products, orders)
- `gateways/` - WebSocket gateways
- `services/` - Lógica de negócio
- `entities/` - Modelos de banco de dados
- `dtos/` - Data Transfer Objects

## 🆘 Troubleshooting

**CORS errors?**
- Verifique se `VITE_API_BASE_URL` está correto

**Socket.io não conecta?**
- Verifique se backend está rodando em http://localhost:5000
- Verifique se nenhuma porta está bloqueada

**Banco de dados vazio?**
- Execute migrations: veja [Banco de Dados](#-banco-de-dados)

## 📄 Licença

MIT