# HackthonGuarulhos
Soluções para o Desafio 1 do Experimenta 2026 — Prefeitura de Guarulhos. O desafio propõe padronizar o acesso e a gestão dos serviços socioassistenciais da SDS, unificando agendamentos, integrando sistemas fragmentados e ampliando o conhecimento da população vulnerável sobre os programas disponíveis.


sistema-agendamento/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração e conexão com o PostgreSQL
│   ├── controllers/
│   │   ├── authController.js     # Login e registro de usuários/clientes
│   │   └── agendaController.js   # Criação, listagem e cancelamento de horários
│   ├── database/
│   │   ├── migrations/          # Scripts para criar as tabelas no PostgreSQL
│   │   └── seeds/               # Dados iniciais para teste (serviços, profissionais)
│   ├── middlewares/
│   │   ├── auth.js              # Proteção de rotas (JWT)
│   │   └── errorHandler.js      # Tratamento global de erros
│   ├── models/
│   │   ├── Usuario.js           # Modelo da tabela de usuários
│   │   ├── Servico.js           # Modelo da tabela de serviços/procedimentos
│   │   └── Agendamento.js       # Modelo da tabela de agendamentos
│   ├── repositories/
│   │   └── agendaRepository.js  # Consultas SQL brutas ou via ORM (Sequelize/Prisma)
│   ├── services/
│   │   └── agendaService.js     # Regra de negócio (Validação matemática de conflito)
│   ├── routes/
│   │   └── index.js             # Centralizador de rotas HTTP
│   └── server.js                # Inicialização do servidor Express
├── .env                         # Variáveis de ambiente (Credenciais do PostgreSQL)
├── .gitignore                   # Arquivos ignorados pelo Git
├── package.json                 # Dependências do projeto
└── README.md                    # Documentação do sistema

