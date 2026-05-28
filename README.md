
# CodeForge

Distributed Online Compiler using Docker and Kubernetes.

## Features

- JWT Login/Register
- Last 5 code history per user
- Docker sandbox execution
- Kubernetes deployment
- Python, Java, C++, JavaScript support
- SOLID architecture
- Plugin compiler system

## Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```
