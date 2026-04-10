namespace Neo4JPOC.Models
{
    /// <summary>
    /// Composite response object containing a movie and its cast.
    /// </summary>
    public class MovieWithActors
    {
        /// <summary>
        /// Movie details.
        /// </summary>
        public Movie Movie { get; set; }

        /// <summary>
        /// List of actors who appeared in the movie.
        /// </summary>
        public List<Person> Actors { get; set; }
    }
}
