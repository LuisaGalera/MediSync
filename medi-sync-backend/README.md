# Medi Sync — Backend

Sistema de agendamento de consultas médicas e centralização do histórico clínico.

**Projeto Integrador — UniEVANGÉLICA | Engenharia de Software | 6º Período**

## Tecnologias

- Node.js + Express.js
- PostgreSQL
- JWT (autenticação)
- bcrypt (hash de senhas)
- dotenv (variáveis de ambiente)

## Estrutura do Projeto

```
src/
├── config/         # Conexão com banco de dados
├── controllers/    # Recebem requisições HTTP e acionam serviços
├── services/       # Lógica de negócio e regras (RN-001 a RN-005)
├── repositories/   # Acesso ao banco de dados (queries SQL)
├── routes/         # Mapeamento de endpoints da API
├── middlewares/    # JWT, permissões, tratamento de erros
├── app.js          # Configuração do Express
└── server.js       # Ponto de entrada
database/
└── schema.sql      # Script de criação do banco PostgreSQL
```

## Como Rodar

**1. Instalar dependências**
```bash
npm install
```

**2. Configurar variáveis de ambiente**
```bash
cp .env.example .env
# Edite o .env com as suas credenciais do PostgreSQL
```

**3. Criar o banco de dados**
```bash
psql -U postgres -f database/schema.sql
```

**4. Iniciar o servidor**
```bash
npm run dev   # desenvolvimento (com nodemon)
npm start     # produção
```

## Endpoints Principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/registrar | Cadastro de usuário (RN-001) |
| POST | /api/auth/login | Login e geração de token JWT |
| POST | /api/consultas | Agendar consulta (RN-002, RN-004) |
| PATCH | /api/consultas/:id/cancelar | Cancelar consulta (RN-004) |
| PATCH | /api/consultas/:id/reagendar | Reagendar consulta |
| GET | /api/consultas/historico/:paciente_id | Histórico do paciente |
| GET | /api/profissionais | Listar profissionais |
| GET | /api/recomendacoes/:paciente_id | Recomendações (RF-003) |
| GET | /api/relatorios/mensal | Relatório mensal (RN-005) — admin |

## Regras de Negócio Implementadas

- **RN-001** — CPF único; senha armazenada apenas como hash bcrypt
- **RN-002** — Sem sobreposição de horários por profissional; critérios de prioridade na fila
- **RN-003** — Alerta automático quando disponibilidade < 20% da capacidade mensal
- **RN-004** — Limite de 1 consulta por especialidade por mês; cancelamento exige 24h de antecedência
- **RN-005** — Relatórios mensais agregados, acessíveis apenas por administradores

## Repositório

https://github.com/FranthescaAssis/Medi_Sync
