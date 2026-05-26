worldcup-fan-planner-2026/
│
├── README.md
├── package.json
├── .env.example
├── docker-compose.yml
│
├── docs/
│   ├── project-brief.md
│   ├── architecture.md
│   ├── api-integrations.md
│   ├── database-schema.md
│   └── roadmap.md
│
├── agents/
│   ├── README_AGENTS.md
│   ├── domain-expert.md
│   ├── developer.md
│   ├── quality-assurance.md
│   └── auditor.md
│
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── flights.routes.js
│   │   │   ├── matches.routes.js
│   │   │   ├── time.routes.js
│   │   │   └── itinerary.routes.js
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── amadeus.service.js
│   │   │   ├── thesportsdb.service.js
│   │   │   ├── time.service.js
│   │   │   ├── weather.service.js
│   │   │   └── recommendation.service.js
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── prisma/
│   │       └── schema.prisma
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── routes/
│   │   ├── pages/
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MapView.jsx
│   │   │   └── Itinerary.jsx
│   │   ├── components/
│   │   │   ├── WorldMap.jsx
│   │   │   ├── FlightCard.jsx
│   │   │   ├── ProfileDropdown.jsx
│   │   │   ├── NewspaperDropdown.jsx
│   │   │   └── Timeline.jsx
│   │   ├── store/
│   │   ├── services/
│   │   └── styles/
│
└── tests/
    ├── backend/
    └── frontend/