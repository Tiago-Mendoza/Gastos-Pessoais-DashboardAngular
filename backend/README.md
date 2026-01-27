# Backend de Teste - Controle de Gastos Pessoais

Este é um backend de teste usando `json-server` para simular uma API REST.

## ⚠️ IMPORTANTE

**Este backend deve estar rodando para que o frontend funcione!**

O frontend Angular está configurado para se conectar em `http://localhost:3000`.

## Instalação

```bash
npm install
```

## Como usar

### 1. Iniciar o servidor backend:

```bash
npm start
```

Isso iniciará o servidor na porta `3000` por padrão.

### 2. Em outro terminal, iniciar o frontend:

```bash
cd ..
ng serve
```

O frontend ficará disponível em `http://localhost:4200` e se conectará automaticamente ao backend na porta 3000.

### Com delay (para simular latência):

```bash
npm run start:dev
```

## Endpoints disponíveis

O json-server cria automaticamente os seguintes endpoints:

### Despesas
- `GET /despesas` - Lista todas as despesas
- `GET /despesas/:id` - Busca uma despesa por ID
- `POST /despesas` - Cria uma nova despesa
- `PUT /despesas/:id` - Atualiza uma despesa
- `PATCH /despesas/:id` - Atualiza parcialmente uma despesa
- `DELETE /despesas/:id` - Remove uma despesa

### Receitas
- `GET /receitas` - Lista todas as receitas
- `GET /receitas/:id` - Busca uma receita por ID
- `POST /receitas` - Cria uma nova receita
- `PUT /receitas/:id` - Atualiza uma receita
- `PATCH /receitas/:id` - Atualiza parcialmente uma receita
- `DELETE /receitas/:id` - Remove uma receita

### Orçamentos
- `GET /orcamentos` - Lista todos os orçamentos
- `GET /orcamentos/:id` - Busca um orçamento por ID
- `POST /orcamentos` - Cria um novo orçamento
- `PUT /orcamentos/:id` - Atualiza um orçamento
- `PATCH /orcamentos/:id` - Atualiza parcialmente um orçamento
- `DELETE /orcamentos/:id` - Remove um orçamento

## Exemplos de uso

### Criar uma despesa:
```bash
curl -X POST http://localhost:3000/despesas \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Supermercado",
    "valor": 150.00,
    "categoria": "Alimentação",
    "data": "2026-01-25T00:00:00.000Z",
    "tipoPagamento": "débito",
    "tipoDespesa": "variável"
  }'
```

### Buscar despesas por categoria:
```bash
curl "http://localhost:3000/despesas?categoria=Alimentação"
```

### Buscar despesas por mês:
```bash
curl "http://localhost:3000/despesas?data_gte=2026-01-01&data_lte=2026-01-31"
```

## Nota

Este é apenas para testes. Em produção, use um backend real com banco de dados adequado.
