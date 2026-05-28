
# CodeForge

Distributed Online Compiler using Docker.

## Features

- JWT Login/Register
- Last 5 code history per user
- Docker sandbox execution
- Python, Java, C++, JavaScript support
- SOLID architecture
- Plugin compiler system

## Docker

```bash
docker compose up --build
```

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
