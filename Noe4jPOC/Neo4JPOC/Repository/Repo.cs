using Microsoft.Extensions.Options;
using Neo4j.Driver;
using Neo4JPOC.Models;

namespace Neo4JPOC.Repository
{
    public class Repo
    {
        private readonly IAsyncSession _session;
        private readonly ILogger<Repo> _logger;

        public Repo(IDriver driver, ILogger<Repo> logger, IOptions<Neo4jSetup> neo4jSettingsOptions)
        {
            _logger = logger;
            var neo4jSettings = neo4jSettingsOptions.Value;
            _session = driver.AsyncSession(o => o.WithDatabase(neo4jSettings.Neo4jDatabase));
        }

        // ── CREATE ────────────────────────────────────────────────────────────────
        // Create operations keep the original casing provided by the user.

        public async Task<bool> CreateMovieAsync(string title, int released, string tagline)
        {
            var cypher = """
                CREATE (m:Movie {title:$title, released:$released, tagline:$tagline})
                RETURN m
                """;
            var result = await _session.RunAsync(cypher, new { title, released, tagline });
            return (await result.ToListAsync()).Count > 0;
        }

        public async Task<bool> CreateActorAsync(string name, int born)
        {
            var cypher = """
                CREATE (p:Person {name:$name, born:$born})
                RETURN p
                """;
            var result = await _session.RunAsync(cypher, new { name, born });
            return (await result.ToListAsync()).Count > 0;
        }

        public async Task<bool> CreateRelationshipAsync(string actorName, string movieTitle)
        {
            // Case-insensitive lookup so "keanu reeves" finds "Keanu Reeves"
            var cypher = """
                MATCH (p:Person)  WHERE toLower(p.name)  = toLower($actorName)
                MATCH (m:Movie)   WHERE toLower(m.title) = toLower($movieTitle)
                MERGE (p)-[r:ACTED_IN]->(m)
                RETURN r
                """;
            var result = await _session.RunAsync(cypher, new { actorName, movieTitle });
            return (await result.ToListAsync()).Count > 0;
        }

        // ── READ ──────────────────────────────────────────────────────────────────

        public async Task<List<Movie>> GetAllMovies()
        {
            var cypher = """
                MATCH (m:Movie)
                RETURN m.title AS Title, m.released AS Released, m.tagline AS TagLine
                ORDER BY m.released DESC
                """;
            var result  = await _session.RunAsync(cypher);
            var records = await result.ToListAsync();
            return records.Select(r => new Movie
            {
                Title    = r["Title"].As<string>(),
                Released = r["Released"].As<int>(),
                TagLine  = r["TagLine"].As<string>()
            }).ToList();
        }

        public async Task<MovieWithActors?> GetMovieWithActors(string title)
        {
            var cypher = """
                MATCH (m:Movie) WHERE toLower(m.title) = toLower($title)
                OPTIONAL MATCH (m)<-[:ACTED_IN]-(p:Person)
                RETURN m.title AS Title, m.released AS Released, m.tagline AS TagLine,
                       collect(CASE WHEN p IS NOT NULL THEN {name: p.name, born: p.born} END) AS Actors
                """;
            var res     = await _session.RunAsync(cypher, new { title });
            var records = await res.ToListAsync();
            if (records.Count == 0) return null;

            var record = records[0];
            var actors = record["Actors"]
                .As<List<Dictionary<string, object>>>()
                .Where(a => a != null && a.ContainsKey("name") && a["name"] != null)
                .Select(a => new Person
                {
                    Name = a["name"].ToString()!,
                    Born = a.ContainsKey("born") && a["born"] != null ? Convert.ToInt32(a["born"]) : 0
                }).ToList();

            return new MovieWithActors
            {
                Movie = new Movie
                {
                    Title    = record["Title"].As<string>(),
                    Released = record["Released"].As<int>(),
                    TagLine  = record["TagLine"].As<string>()
                },
                Actors = actors
            };
        }

        public async Task<List<Person>> GetMovieActorsAsync(string movieTitle)
        {
            var cypher = """
                MATCH (p:Person)-[:ACTED_IN]->(m:Movie)
                WHERE toLower(m.title) = toLower($movieTitle)
                RETURN p.name AS name, p.born AS born
                ORDER BY p.name
                """;
            var result  = await _session.RunAsync(cypher, new { movieTitle });
            var records = await result.ToListAsync();
            return records.Select(r => new Person
            {
                Name = r["name"].As<string>(),
                Born = r["born"].As<int>()
            }).ToList();
        }

        public async Task<List<string>> GetCoActorNameAsync(string actorName)
        {
            var cypher = """
                MATCH (p1:Person)-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(p2:Person)
                WHERE toLower(p1.name) = toLower($name)
                  AND p1.name <> p2.name
                RETURN DISTINCT p2.name AS CoActorName
                ORDER BY p2.name
                """;
            var result  = await _session.RunAsync(cypher, new { name = actorName });
            var records = await result.ToListAsync();
            return records.Select(r => r["CoActorName"].As<string>()).ToList();
        }

        // ── UPDATE ────────────────────────────────────────────────────────────────

        public async Task<bool> UpdateMovieTagLineAsync(string movieTitle, string newTagLine)
        {
            var cypher = """
                MATCH (m:Movie) WHERE toLower(m.title) = toLower($movieTitle)
                SET m.tagline = $newTagLine
                RETURN m
                """;
            var result = await _session.RunAsync(cypher, new { movieTitle, newTagLine });
            return (await result.ToListAsync()).Count > 0;
        }

        public async Task<bool> UpdatePersonBornAsync(string personName, int newBornYear)
        {
            var cypher = """
                MATCH (p:Person) WHERE toLower(p.name) = toLower($name)
                SET p.born = $born
                RETURN p
                """;
            var result = await _session.RunAsync(cypher, new { name = personName, born = newBornYear });
            return (await result.ToListAsync()).Count > 0;
        }

        // ── UPSERT ────────────────────────────────────────────────────────────────

        public async Task<bool> MergeMovieAsync(string title, int released, string tagline)
        {
            var cypher = """
                MERGE (m:Movie {title:$title})
                ON CREATE SET m.released = $released, m.tagline = $tagline
                ON MATCH  SET m.released = $released, m.tagline = $tagline
                RETURN m
                """;
            var result = await _session.RunAsync(cypher, new { title, released, tagline });
            return (await result.ToListAsync()).Count > 0;
        }

        // ── DELETE ────────────────────────────────────────────────────────────────

        public async Task<bool> DeleteMovieAsync(string title)
        {
            var cypher = """
                MATCH (m:Movie) WHERE toLower(m.title) = toLower($title)
                DETACH DELETE m
                """;
            await _session.RunAsync(cypher, new { title });
            return true;
        }

        public async Task<bool> DeletePersonAsync(string name)
        {
            var cypher = """
                MATCH (p:Person) WHERE toLower(p.name) = toLower($name)
                DETACH DELETE p
                """;
            await _session.RunAsync(cypher, new { name });
            return true;
        }

        public async Task<bool> RemoveActorFromMovieAsync(string personName, string movieTitle)
        {
            var cypher = """
                MATCH (p:Person)-[r:ACTED_IN]->(m:Movie)
                WHERE toLower(p.name)  = toLower($personName)
                  AND toLower(m.title) = toLower($movieTitle)
                DELETE r
                """;
            await _session.RunAsync(cypher, new { personName, movieTitle });
            return true;
        }
    }
}
