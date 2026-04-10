namespace Neo4JPOC.Models
{
    /// <summary>
    /// Represents a movie node in the Neo4j graph database.
    /// </summary>
    public class Movie
    {
        /// <summary>
        /// Unique movie title (primary identifier).
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Year the movie was released.
        /// </summary>
        public int Released { get; set; }

        /// <summary>
        /// Movie tagline or short description.
        /// </summary>
        public string TagLine { get; set; }
    }
}
