## Sobre o Projeto

O backend da aplicação **[NarutoDex](https://github.com/dominguesrenan/narutodexapp)** é responsável por fornecer os dados necessários para as duas interfaces (**web** e **mobile**) e para a API.

- Acesse também o **[Frontend Web](https://github.com/dominguesrenan/narutodex-web)**
- Acesse também o **[Mobile App](https://github.com/dominguesrenan/narutodex-app)**

## Tecnologias Utilizadas

### Backend/API (narutodex-api)
- **Runtime**: Node.js com TypeScript
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: Express Validator
- **Segurança**: Bcrypt para hash de senhas
- **CORS**: Configuração para múltiplas origens

## Estrutura do Banco de Dados

O banco PostgreSQL possui as seguintes entidades principais:

- **aldeias**: Vilas do universo Naruto (Konoha, Suna, Kiri, etc.)
- **clas**: Clãs ninja (Uchiha, Uzumaki, Hyuga, etc.)
- **bijuus**: Bijuu do universo Naruto
- **elementos**: Elementos da natureza (Fogo, Água, Terra, etc.)
- **jutsus**: Técnicas ninja associadas aos personagens
- **ranks**: Níveis ninja (Genin, Chunin, Jonin, Kage)
- **times**: Times e organizações (Time 7, Akatsuki, etc.)
- **personagens**: Personagens principais com relacionamentos ao "**sensei**"

## Documentação da API

### Endpoints Principais

#### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login usuário
- `GET /auth/me` - Dados do usuário autenticado

#### Aldeias

- `GET /api/naruto/aldeias` - Listar aldeias
- `GET /api/naruto/aldeias/:id` - Detalhes de aldeia

#### Bijuu

- `GET /api/naruto/bijuus` - Listar bijuu
- `GET /api/naruto/bijuus/:id` - Detalhes de bijuu

#### Clãs

- `GET /api/naruto/clas` - Listar clãs
- `GET /api/naruto/clas/:id` - Detalhes de clã

#### Elementos

- `GET /api/naruto/elementos` - Listar elementos
- `GET /api/naruto/elementos/:id` - Detalhes de elemento

#### Jutsus

- `GET /api/naruto/jutsus` - Listar jutsus
- `GET /api/naruto/jutsus/:id` - Detalhes de jutsu

#### Ranks

- `GET /api/naruto/ranks` - Listar ranks
- `GET /api/naruto/ranks/:id` - Detalhes de rank

#### Times

- `GET /api/naruto/times` - Listar times
- `GET /api/naruto/times/:id` - Detalhes de time

#### Personagens
- `GET /api/personagens` - Listar personagens com filtros
- `GET /api/personagens/:id` - Detalhes do personagem
- `POST /api/personagens` - Criar personagem (autenticado)
- `PUT /api/personagens/:id` - Atualizar personagem (autenticado)
- `DELETE /api/personagens/:id` - Deletar personagem (autenticado)

#### Estatísticas

- `GET /api/naruto/stats` - Estatísticas gerais


### Exemplos de Uso

#### Buscar personagens por aldeia

```bash
GET /api/personagens?aldeia_id=1
```

#### Buscar personagens por clã

```bash
GET /api/personagens?cla_id=2
```

#### Buscar personagens vivos

```bash
GET /api/personagens?vivo=true
```

#### Filtros combinados

```bash
GET /api/personagens?aldeia_id=1&cla_id=2&vivo=true
```

#### Autocomplete de aldeias

```bash
GET /api/personagens/aldeias/autocomplete?q=konoha
```

---

## Desenvolvido por

[**Renan Domingues**](https://www.linkedin.com/in/renan-domingues-4808b2172/)  
Desenvolvedor Full Stack

[![GitHub](https://img.shields.io/badge/-renandomingues-181717?style=flat-square&logo=github&logoColor=white&link=https://github.com/dominguesrenan)](https://github.com/dominguesrenan) [![LinkedIn](https://img.shields.io/badge/-Renan%20Domingues-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/renan-domingues-4808b2172/)](https://www.linkedin.com/in/renan-domingues-4808b2172/)