using Microsoft.AspNetCore.Mvc;
using Neo4JPOC.DTO;
using Neo4JPOC.Models;
using Neo4JPOC.Repository;

namespace Neo4JPOC.Controllers
{
    /// <summary>
    /// Neo4j Movie Database API — Create, read, update, and delete movies and actors.
    /// Manage ACTED_IN relationships and explore the actor graph.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly Repo _repo;

        public MoviesController(Repo repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Create a new movie node in the graph.
        /// </summary>
        /// <param name="movie">Movie with title, release year, and optional tagline</param>
        /// <returns>Success or error message</returns>
        [HttpPost("create-movie")]
        public async Task<IActionResult> CreateMovie([FromBody] Movie movie)
        {
            var result = await _repo.CreateMovieAsync(movie.Title, movie.Released, movie.TagLine);
            return result ? Ok("Movie created successfully") : BadRequest("Failed to create movie");
        }

        /// <summary>
        /// Create a new person/actor node in the graph.
        /// </summary>
        /// <param name="actor">Person with name and birth year</param>
        /// <returns>Success or error message</returns>
        [HttpPost("create-actor")]
        public async Task<IActionResult> CreateActor([FromBody] Person actor)
        {
            var result = await _repo.CreateActorAsync(actor.Name, actor.Born);
            return result ? Ok("Actor created successfully") : BadRequest("Failed to create actor");
        }

        /// <summary>
        /// Create an ACTED_IN relationship between an actor and a movie.
        /// </summary>
        /// <param name="data">Object with actorName and movieTitle</param>
        /// <returns>Success or error message</returns>
        [HttpPost("create-relationship")]
        public async Task<IActionResult> CreateRelationship([FromBody] CreateRelationshipRequest data)
        {
            string actorName = data.actorName;
            string movieTitle = data.movieTitle;
            var result = await _repo.CreateRelationshipAsync(actorName, movieTitle);
            return result ? Ok("Relationship created successfully") : BadRequest("Failed to create relationship");
        }

        /// <summary>
        /// Retrieve all movies from the graph.
        /// </summary>
        /// <returns>List of all movies ordered by release year (descending)</returns>
        [HttpGet("movies")]
        public async Task<IActionResult> GetAllMovies()
        {
            var movies = await _repo.GetAllMovies();
            return Ok(movies);
        }

        /// <summary>
        /// Get a movie with all its cast members (actors).
        /// </summary>
        /// <param name="title">Movie title</param>
        /// <returns>Movie details with list of actors, or 404 if not found</returns>
        [HttpGet("movie-with-actors/{title}")]
        public async Task<IActionResult> GetMovieWithActors(string title)
        {
            var movieWithActors = await _repo.GetMovieWithActors(title);
            return movieWithActors != null ? Ok(movieWithActors) : NotFound("Movie not found");
        }

        /// <summary>
        /// Get all actors who appeared in a specific movie.
        /// </summary>
        /// <param name="movieTitle">Movie title</param>
        /// <returns>List of actors in the movie</returns>
        [HttpGet("movie-actors/{movieTitle}")]
        public async Task<IActionResult> GetMovieActors(string movieTitle)
        {
            var actors = await _repo.GetMovieActorsAsync(movieTitle);
            return Ok(actors);
        }

        /// <summary>
        /// Update a movie's tagline.
        /// </summary>
        /// <param name="data">Object with movieTitle and newTagLine</param>
        /// <returns>Success or error message</returns>
        [HttpPut("update-movie-tagline")]
        public async Task<IActionResult> UpdateMovieTagLine([FromBody] UpdateMovieTagLine data)
        {
            string movieTitle = data.movieTitle;
            string newTagLine = data.newTagline;
            var result = await _repo.UpdateMovieTagLineAsync(movieTitle, newTagLine);
            return result ? Ok("Movie tagline updated successfully") : BadRequest("Failed to update tagline");
        }

        /// <summary>
        /// Update an actor's birth year.
        /// </summary>
        /// <param name="data">Object with personName and newBornYear</param>
        /// <returns>Success or error message</returns>
        [HttpPut("update-person-born")]
        public async Task<IActionResult> UpdatePersonBorn([FromBody] UpdatePersonBornRequest data)
        {
            string personName = data.personName;
            int newBornYear = data.newBornYear;
            var result = await _repo.UpdatePersonBornAsync(personName, newBornYear);
            return result ? Ok("Person birth year updated successfully") : BadRequest("Failed to update birth year");
        }

        /// <summary>
        /// Create or update a movie (MERGE operation). If the movie exists, it updates properties.
        /// </summary>
        /// <param name="movie">Movie with title, release year, and optional tagline</param>
        /// <returns>Success or error message</returns>
        [HttpPost("merge-movie")]
        public async Task<IActionResult> MergeMovie([FromBody] Movie movie)
        {
            var result = await _repo.MergeMovieAsync(movie.Title, movie.Released, movie.TagLine);
            return result ? Ok("Movie merged successfully") : BadRequest("Failed to merge movie");
        }

        /// <summary>
        /// Delete a movie node and all its relationships from the graph.
        /// </summary>
        /// <param name="title">Movie title</param>
        /// <returns>Success or error message</returns>
        [HttpDelete("delete-movie/{title}")]
        public async Task<IActionResult> DeleteMovie(string title)
        {
            var result = await _repo.DeleteMovieAsync(title);
            return result ? Ok("Movie deleted successfully") : BadRequest("Failed to delete movie");
        }

        /// <summary>
        /// Delete a person/actor node and all their relationships from the graph.
        /// </summary>
        /// <param name="name">Person name</param>
        /// <returns>Success or error message</returns>
        [HttpDelete("delete-person/{name}")]
        public async Task<IActionResult> DeletePerson(string name)
        {
            var result = await _repo.DeletePersonAsync(name);
            return result ? Ok("Person deleted successfully") : BadRequest("Failed to delete person");
        }

        /// <summary>
        /// Remove an actor from a movie by deleting the ACTED_IN relationship.
        /// </summary>
        /// <param name="data">Object with personName and movieTitle</param>
        /// <returns>Success or error message</returns>
        [HttpDelete("remove-actor-from-movie")]
        public async Task<IActionResult> RemoveActorFromMovie([FromBody] RemoveActorRequest data)
        {
            string personName = data.personName;
            string movieTitle = data.movieTitle;
            var result = await _repo.RemoveActorFromMovieAsync(personName, movieTitle);
            return result ? Ok("Actor removed from movie successfully") : BadRequest("Failed to remove actor from movie");
        }

        /// <summary>
        /// Find all actors who worked with a given actor in the same movies.
        /// </summary>
        /// <param name="actorName">Actor name</param>
        /// <returns>List of co-actor names</returns>
        [HttpGet("co-actors/{actorName}")]
        public async Task<IActionResult> GetCoActors(string actorName)
        {
            var coActors = await _repo.GetCoActorNameAsync(actorName);
            return Ok(coActors);
        }
    }
}
