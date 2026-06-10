# How Neo4j Works in This Repository

This repository implements a **movie graph application** where Neo4j is the primary database.  
The system is composed of:

- **Neo4j database** (`neo4j:5.20-community`)  
- **ASP.NET Core backend** (`Noe4jPOC/Neo4JPOC`)  
- **React frontend** (`frontend`)

Neo4j stores movies, people (actors), and actor-to-movie relationships. The backend executes Cypher queries via the official Neo4j .NET driver, and the frontend consumes REST endpoints exposed by the backend.

---

## 1) Runtime Architecture

### Docker wiring
In `docker-compose.yml`:

- Neo4j runs on:
  - `7474` (Neo4j Browser HTTP)
  - `7687` (Bolt protocol for app connections)
- Backend receives Neo4j config from environment variables:
  - `Neo4jSettings__Neo4jConnection=neo4j://neo4j:7687`
  - `Neo4jSettings__Neo4jUser=neo4j`
  - `Neo4jSettings__Neo4jPassword=Password1`
  - `Neo4jSettings__Neo4jDatabase=neo4j`
- Frontend talks to backend through `/api` (nginx/Vite proxy behavior).

For local development, fallback values are in `Noe4jPOC/Neo4JPOC/appsettings.json` (typically `neo4j://localhost:7687`).

---

## 2) Backend Neo4j Initialization

In `Noe4jPOC/Neo4JPOC/Program.cs`:

1. `Neo4jSettings` section is bound into `Neo4jSetup`.
2. A singleton Neo4j `IDriver` is registered:
   - `GraphDatabase.Driver(...)`
   - `AuthTokens.Basic(user, password)`
3. `Repo` is registered as scoped service and injected into `MoviesController`.

In `Noe4jPOC/Neo4JPOC/Repository/Repo.cs`:

- Constructor creates an async session with explicit database:
  - `driver.AsyncSession(o => o.WithDatabase(neo4jSettings.Neo4jDatabase))`
- Every API operation maps to one Cypher query executed through this session.

---

## 3) Graph Data Model

The graph schema used by the app is:

```cypher
(:Person)-[:ACTED_IN]->(:Movie)
```

### Node labels and properties

- `:Movie`
  - `title` (string)
  - `released` (int)
  - `tagline` (string)
- `:Person`
  - `name` (string)
  - `born` (int)

### Relationship

- `:ACTED_IN`
  - Direction: `Person -> Movie`
  - Created with `MERGE` in relationship API to avoid duplicate links.

---

## 4) Request Flow (End-to-End)

Typical flow:

1. User action in React page (e.g., link actor to movie in `GraphExplorerPage.tsx`)
2. Frontend calls helper in `frontend/src/services/api.ts`
3. API call hits `MoviesController` route under `/api/movies/...`
4. Controller delegates to `Repo`
5. `Repo` executes Cypher against Neo4j
6. Result is mapped to DTO/model and returned to frontend

So the frontend never speaks Bolt/Cypher directly; it always goes through backend REST.

---

## 5) Cypher Query Patterns Used

All major operations are in `Repo.cs`.

## Create

- **Create movie**
  - `CREATE (m:Movie {...}) RETURN m`
- **Create actor**
  - `CREATE (p:Person {...}) RETURN p`
- **Create relationship**
  - Match actor and movie by case-insensitive name/title
  - `MERGE (p)-[r:ACTED_IN]->(m) RETURN r`

## Read

- **Get all movies**
  - `MATCH (m:Movie) RETURN ... ORDER BY m.released DESC`
- **Get movie with actors**
  - `MATCH movie` + `OPTIONAL MATCH` actors
  - `collect(...)` builds actor list
- **Get actors by movie**
  - `MATCH (p)-[:ACTED_IN]->(m) ... RETURN p`
- **Get co-actors**
  - `MATCH (p1)-[:ACTED_IN]->(m)<-[:ACTED_IN]-(p2)`
  - excludes same person and returns distinct co-actors

## Update

- **Update movie tagline**
  - `MATCH movie SET m.tagline = ... RETURN m`
- **Update person born year**
  - `MATCH person SET p.born = ... RETURN p`

## Upsert

- **Merge movie**
  - `MERGE (m:Movie {title:$title})`
  - `ON CREATE SET ...`
  - `ON MATCH SET ...`

## Delete

- **Delete movie/person**
  - `DETACH DELETE` so connected relationships are removed automatically
- **Remove actor from movie**
  - match `ACTED_IN` edge and `DELETE r`

---

## 6) Case-Insensitive Behavior

Most lookup/update/delete queries use:

```cypher
WHERE toLower(property) = toLower($input)
```

This allows inputs like `"the matrix"` to match `"The Matrix"` and makes API behavior user-friendly in the UI.

---

## 7) API Surface Backed by Neo4j

Controller: `Noe4jPOC/Neo4JPOC/Controllers/MoviesController.cs`

Examples:

- `POST /api/movies/create-movie`
- `POST /api/movies/create-actor`
- `POST /api/movies/create-relationship`
- `GET /api/movies/movies`
- `GET /api/movies/movie-with-actors/{title}`
- `GET /api/movies/movie-actors/{movieTitle}`
- `GET /api/movies/co-actors/{actorName}`
- `PUT /api/movies/update-movie-tagline`
- `PUT /api/movies/update-person-born`
- `POST /api/movies/merge-movie`
- `DELETE /api/movies/delete-movie/{title}`
- `DELETE /api/movies/delete-person/{name}`
- `DELETE /api/movies/remove-actor-from-movie`

Each endpoint maps almost 1:1 to a Cypher query in `Repo`.

---

## 8) Frontend Features That Depend on Neo4j

Key pages:

- `MoviesPage.tsx` → lists/searches movies from graph data
- `MovieDetailPage.tsx` → fetches movie + cast aggregation
- `ActorsPage.tsx` → creates/updates/deletes actors and movie cast lookups
- `GraphExplorerPage.tsx` → relationship creation/removal and co-actor traversal

These features are graph-native:
- relationship-centric operations (`ACTED_IN`)
- path-like traversal for co-actors
- aggregate cast retrieval with optional match and collection

---

## 9) Operational Notes

- Neo4j Browser is available at `http://localhost:7474` for direct query inspection.
- The backend currently uses one async session object inside `Repo`; all data operations execute through it.
- APOC plugin is enabled in Docker (`NEO4J_PLUGINS=["apoc"]`), though current repository queries are standard Cypher and do not require APOC calls.

---

## 10) In Short

Neo4j is the core persistence layer for this project.  
The backend acts as a Cypher execution layer and API boundary, and the frontend consumes those APIs to provide CRUD + graph exploration.  
The design intentionally models domain relationships explicitly (`Person` ↔ `Movie`) so traversals like co-actors are simple, performant, and natural in graph form.
