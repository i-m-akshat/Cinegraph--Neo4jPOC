# CineGraph — Neo4j Movie Explorer

A full-stack graph database application that demonstrates Neo4j CRUD operations, relationship management, and graph traversal through an elegant pastel-themed UI.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Running with Docker (Recommended)](#running-with-docker-recommended)
- [Running Locally (Without Docker)](#running-locally-without-docker)
- [Accessing the Applications](#accessing-the-applications)
- [Opening Neo4j Browser](#opening-neo4j-browser)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Graph Schema](#graph-schema)
- [Environment Variables](#environment-variables)

---

## Overview

CineGraph is a proof-of-concept application that uses Neo4j as a graph database to store movies, actors, and the relationships between them. It provides a full CRUD interface through a React frontend and an ASP.NET Core backend, allowing you to:

- Manage movies and actors as graph nodes
- Create and remove `ACTED_IN` relationships between actors and movies
- Explore co-actor networks (find all actors who shared a movie)
- Search movies and actors with **case-insensitive** matching

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v3 |
| **Backend** | ASP.NET Core (.NET 10), C# |
| **Database** | Neo4j 5.20 (Community Edition) |
| **API Docs** | Swashbuckle / Swagger UI |
| **Container** | Docker, Docker Compose, nginx |

---

## Project Structure

```
Neo4jMoviePOC/
├── docker-compose.yml          # Orchestrates all three services
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # Layout, Navbar, Modal, Toast
│   │   ├── pages/              # Dashboard, Movies, Actors, Graph Explorer
│   │   ├── services/api.ts     # Axios API client
│   │   └── types/index.ts      # TypeScript interfaces
│   ├── nginx.conf              # nginx config (proxies /api to backend)
│   └── Dockerfile
│
└── Noe4jPOC/
    └── Neo4JPOC/               # ASP.NET Core Web API
        ├── Controllers/        # MoviesController
        ├── DTO/                # Request DTOs
        ├── Models/             # Movie, Person, MovieWithActors
        ├── Repository/         # Neo4j Cypher queries (Repo.cs)
        ├── Program.cs          # App entry point, DI, CORS, Swagger
        ├── appsettings.json    # Neo4j connection config
        └── Dockerfile
```

---

## Prerequisites

### For Docker (Recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Ports `3000`, `5081`, `7474`, `7687` must be free

### For Local Development
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) and npm
- [Neo4j Desktop](https://neo4j.com/download/) or a running Neo4j instance

---

## Running with Docker (Recommended)

### 1. Clone / navigate to the project root

```bash
cd Neo4jMoviePOC
```

### 2. First-time build and start

```bash
docker compose up --build
```

This will:
1. Pull the Neo4j 5.20 image and start the database
2. Build and start the .NET backend (waits for Neo4j to be healthy)
3. Build and start the React frontend (waits for backend to be healthy)

> **First build takes 3–5 minutes** — Docker downloads base images and compiles the app.

### 3. Subsequent starts (no rebuild needed)

```bash
docker compose up
```

Or run in the background (detached):

```bash
docker compose up -d
```

### 4. Stop all services

```bash
docker compose down
```

To also remove all stored data (Neo4j volumes):

```bash
docker compose down -v
```

### 5. Rebuild a single service

```bash
docker compose up --build backend
docker compose up --build frontend
```

### 6. View logs

```bash
docker compose logs -f              # all services
docker compose logs -f backend      # backend only
docker compose logs -f neo4j        # neo4j only
```

---

## Running Locally (Without Docker)

### 1. Start Neo4j

Option A — **Neo4j Desktop**:
1. Download and install [Neo4j Desktop](https://neo4j.com/download/)
2. Create a new local database
3. Set the password to `Password1` (or update `appsettings.json`)
4. Start the database

Option B — **Neo4j Docker only**:
```bash
docker run -d \
  --name neo4j-local \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/Password1 \
  neo4j:5.20-community
```

### 2. Start the backend

```bash
cd Noe4jPOC/Neo4JPOC
dotnet restore
dotnet run
```

Backend will be available at `http://localhost:5081`

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

> In development mode, Vite proxies all `/api` requests to `http://localhost:5081` automatically.

---

## Accessing the Applications

| Service | URL | Description |
|---|---|---|
| **Frontend** | http://localhost:3000 | React UI (Docker) |
| **Frontend** | http://localhost:5173 | React UI (local dev) |
| **Backend API** | http://localhost:5081 | ASP.NET Core REST API |
| **Swagger UI** | http://localhost:5081/swagger | Interactive API documentation |
| **Neo4j Browser** | http://localhost:7474 | Graph database UI |

---

## Opening Neo4j Browser

The Neo4j Browser is a web-based interface to run Cypher queries and visually explore the graph.

### Steps

1. Open your browser and go to:
   ```
   http://localhost:7474
   ```

2. You will see the Neo4j Browser login screen:

   | Field | Value |
   |---|---|
   | Connect URL | `neo4j://localhost:7687` |
   | Authentication type | Username / Password |
   | Username | `neo4j` |
   | Password | `Password1` |

3. Click **Connect**

### Useful Cypher Queries in Neo4j Browser

Once connected, you can run queries directly. Click the `$` prompt at the top and try:

```cypher
// View all movies
MATCH (m:Movie) RETURN m

// View all actors
MATCH (p:Person) RETURN p

// View the full graph (movies + actors + relationships)
MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) RETURN p, r, m

// Find all actors in a specific movie
MATCH (p:Person)-[:ACTED_IN]->(m:Movie {title: "The Matrix"})
RETURN p.name, p.born

// Find co-actors of a specific actor
MATCH (p1:Person {name: "Keanu Reeves"})-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(p2:Person)
WHERE p1 <> p2
RETURN DISTINCT p2.name

// Count all nodes
MATCH (n) RETURN labels(n) AS Label, count(n) AS Count

// Delete all data (use carefully)
MATCH (n) DETACH DELETE n
```

### Visualising the Graph

After running a query that returns nodes and relationships, Neo4j Browser shows an **interactive graph visualisation**. You can:
- Drag nodes around to explore the graph
- Click a node to see its properties
- Double-click a node to expand its relationships
- Use the toolbar to zoom in/out

---

## API Documentation (Swagger)

Swagger UI provides an interactive interface to explore and test all API endpoints.

1. Make sure the backend is running
2. Open: **http://localhost:5081/swagger**
3. Expand any endpoint, click **Try it out**, fill in the fields and click **Execute**

---

## Features

### Dashboard
- Overview statistics (movie count, node count, endpoint count)
- Quick-action shortcuts to all sections
- Recent movies grid

### Movies
- List all movies with search (case-insensitive, searches title, tagline, and year)
- Create a new movie
- Merge / Upsert — creates the movie if it doesn't exist, updates it if it does
- View movie detail with full cast
- Edit movie tagline
- Delete movie (also removes all relationships)

### Actors
- Create a new actor
- Update an actor's birth year
- Delete an actor (also removes all relationships)
- Search actors by movie — enter a movie title to list its entire cast

### Graph Explorer
- **Link Actor to Movie** — create an `ACTED_IN` relationship
- **Remove Actor from Movie** — delete an `ACTED_IN` relationship
- **Find Co-Actors** — discover all actors who appeared in the same movies as a given actor

---

## API Endpoints

Base URL: `http://localhost:5081/api/movies`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/movies` | Get all movies |
| `GET` | `/movie-with-actors/{title}` | Get movie + cast |
| `GET` | `/movie-actors/{movieTitle}` | Get actors in a movie |
| `GET` | `/co-actors/{actorName}` | Get co-actors of an actor |
| `POST` | `/create-movie` | Create a new movie |
| `POST` | `/create-actor` | Create a new actor |
| `POST` | `/create-relationship` | Link actor to movie |
| `POST` | `/merge-movie` | Create or update a movie |
| `PUT` | `/update-movie-tagline` | Update a movie's tagline |
| `PUT` | `/update-person-born` | Update an actor's birth year |
| `DELETE` | `/delete-movie/{title}` | Delete a movie |
| `DELETE` | `/delete-person/{name}` | Delete an actor |
| `DELETE` | `/remove-actor-from-movie` | Remove actor from movie |

> All lookup operations are **case-insensitive** — `"the matrix"` finds `"The Matrix"`.

---

## Graph Schema

```
(:Person)-[:ACTED_IN]->(:Movie)
```

| Node | Properties |
|---|---|
| `Movie` | `title` (string), `released` (int), `tagline` (string) |
| `Person` | `name` (string), `born` (int) |

| Relationship | From | To |
|---|---|---|
| `ACTED_IN` | `Person` | `Movie` |

---

## Environment Variables

These are pre-configured in `docker-compose.yml`. Change them if your setup differs.

| Variable | Default | Description |
|---|---|---|
| `Neo4jSettings__Neo4jConnection` | `neo4j://neo4j:7687` | Neo4j Bolt connection URL |
| `Neo4jSettings__Neo4jUser` | `neo4j` | Neo4j username |
| `Neo4jSettings__Neo4jPassword` | `Password1` | Neo4j password |
| `Neo4jSettings__Neo4jDatabase` | `neo4j` | Neo4j database name |
| `ASPNETCORE_URLS` | `http://+:5081` | Backend listening address |
| `NEO4J_AUTH` | `neo4j/Password1` | Neo4j container credentials |
