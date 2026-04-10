# 🚀 Guia de Deploy - FetchDesk

Instruções passo a passo para fazer deploy de toda a arquitetura no stack free (Vercel + Render + Neon + CloudAMQP).

## 📋 Pré-requisitos

- Contas criadas em:
  - [Vercel](https://vercel.com)
  - [Render](https://render.com)
  - [Neon](https://neon.tech)
  - [CloudAMQP](https://www.cloudamqp.com)
- Git instalado e repositório no GitHub
- Node.js 20+ instalado localmente

---

## 1️⃣ Preparar Repositório

```bash
# Fazer commit de todas as mudanças
git add .
git commit -m "feat: add deploy configuration files"
git push origin main
```

---

## 2️⃣ Deploy do Frontend - Vercel

### Passo 1: Conectar ao Vercel

1. Acessa https://vercel.com/import
2. Seleciona seu repositório do GitHub
3. Escolhe o projeto `FetchDesk`
4. No framework, seleciona **Vite**

### Passo 2: Variáveis de Ambiente

Na aba **Environment Variables** do Vercel, add:

```
VITE_API_URL = https://fetchdesk-nest.onrender.com
```

### Passo 3: Deploy

Clica em **Deploy** - Vercel vai fazer build automático com `npm run build`

✅ Frontend estará disponível em: `https://<seu-app>.vercel.app`

---

## 3️⃣ Setup do Banco de Dados - Neon

### Passo 1: Criar Projeto

1. Acessa https://neon.tech
2. Clica em **Create a project**
3. Nome: `FetchDesk`
4. Região: deixa padrão
5. Clica **Create project**

### Passo 2: Copiar Connection String

1. Na página do projeto, copia a **Connection string**
2. Formata assim:
   ```
   postgres://user:password@host:5432/dbname
   ```

Separa os valores:
- **DATABASE_HOST** = host
- **DATABASE_PORT** = 5432
- **DATABASE_NAME** = dbname
- **DATABASE_USER** = user
- **DATABASE_PASSWORD** = password

---

## 4️⃣ Setup do RabbitMQ - CloudAMQP

### Passo 1: Criar Instância

1. Acessa https://www.cloudamqp.com
2. Sign Up → seleciona a opção **free** (Lemur)
3. Cria nova instância
4. Nome: `FetchDesk`
5. Clica **Create Instance**

### Passo 2: Copiar URL

1. Na página da instância, copia a **URL**
   ```
   amqps://user:password@host:5671/vhost
   ```

---

## 5️⃣ Deploy do Backend - Render (Docker)

### Passo 1: Conectar ao Render

1. Acessa https://render.com
2. Clica em **New** → **Web Service**
3. Seleciona seu repositório do GitHub
4. Escolhe a opção de **Docker** (não o serviço Node padrão)
5. Configura:
   - **Name**: `fetchdesk-nest`
   - **Instance Type**: `Free`
   - **Dockerfile Path**: `Dockerfile`
   - **Docker Command**: deixa em branco
   - **Pre-Deploy Command**: deixa em branco

### Passo 2: Variáveis de Ambiente

Na aba **Environment**, adiciona:

```env
NODE_ENV=production
FRONTEND_URL=https://<seu-app>.vercel.app
DATABASE_URL=postgres://<user>:<password>@<host>:5432/<dbname>?sslmode=require
DATABASE_SSL=true
RABBITMQ_URL=<url-completa-do-cloudamqp>
```

> Se você preferir usar variáveis separadas, ainda funciona. Mas em Render/Docker é mais confiável passar `DATABASE_URL` completo e `DATABASE_SSL=true`.

### Passo 3: Deploy

Clica em **Create Web Service** - início automático do deploy

✅ Backend estará disponível em: `https://fetchdesk-nest.onrender.com`

---

## 6️⃣ Cron Job - Manter App Acordada

### Opção A: UptimeRobot (Recomendado)

1. Acessa https://uptimerobot.com/
2. Cria conta (free)
3. Clica **Add Monitor** → **HTTP(s)**
4. Configura:
   - **Friendly Name**: `FetchDesk Keep Alive`
   - **URL**: `https://fetchdesk-nest.onrender.com/health`
   - **Monitoring Interval**: `10 minutes`
   - **HTTP Method**: `GET`
5. Salva

✅ Pronto! App vai receber ping a cada 10 minutos.

### Opção B: GitHub Actions

Arquivo `.github/workflows/keep-alive.yml` já está configurado com cron job a cada 10 minutos. Nada a fazer - funciona automaticamente!

---

## 7️⃣ Testar Tudo

### Verificar Frontend

```bash
# Abre seu app Vercel
https://<seu-app>.vercel.app
```

Deveria carregar sem erros de CORS.

### Verificar API

```bash
# Testa health check
curl https://fetchdesk-nest.onrender.com/health

# Output esperado:
# {"status":"ok","timestamp":"2026-04-09..."}
```

### Testar Banco de Dados

Na home do app, clica em **Balcão** → deveria carregar lista de clientes (se houver dados no DB).

---

## 🔧 Troubleshooting

### App fica "dormindo" após 15 min

- Solução: UptimeRobot ou GitHub Actions (já configurado)
- Alternativa: Upgrade Render para plano pago (~$12/mês)

### Erro 502 no Render

1. Verifica logs em **Render Dashboard**
2. Vai para **Logs** do seu web service
3. Procura por erros de conexão com DB ou RabbitMQ
4. Verifica se variáveis de env estão corretas

### CORS Errors

1. Verifica que `FRONTEND_URL` no Render bate com URL do Vercel
2. Verifica `vercel.json` tem `vite` como framework
3. Limpa cache/cookies no navegador

### Banco não conecta

1. Testa connection string com `psql`
2. Verifica se IP do Render está autorizado no Neon (normalmente automático)
3. Verifica variáveis de env estão formatadas corretamente

---

## 📊 Custos

| Serviço | Plano | Custo |
|---------|-------|-------|
| Vercel | Free | $0 |
| Render | Free | $0* |
| Neon | Free | $0 |
| CloudAMQP | Free | $0 |
| **TOTAL** | - | **$0** |

*Render "dorme" após 15 min de inatividade. Upgrade para ~$12/mês remove isso.

---

## ✅ Checklist Final

- [ ] Frontend deployado no Vercel
- [ ] Backend deployado no Render
- [ ] Banco de dados criado no Neon
- [ ] RabbitMQ criado no CloudAMQP
- [ ] Variáveis de env configuradas em todos os serviços
- [ ] CORS funcionando (sem erros no console)
- [ ] Health check respondendo (`/health`)
- [ ] UptimeRobot ou GitHub Actions mantendo app acordada
- [ ] App carrega página inicial sem erros

---

Pronto! 🎉 Seu projeto está em produção!
