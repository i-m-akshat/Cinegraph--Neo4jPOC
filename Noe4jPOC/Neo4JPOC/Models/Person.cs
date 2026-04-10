namespace Neo4JPOC.Models
{
    /// <summary>
    /// Represents a person/actor node in the Neo4j graph database.
    /// </summary>
    public class Person
    {
        /// <summary>
        /// Person's full name (primary identifier).
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Person's birth year.
        /// </summary>
        public int Born { get; set; }
    }
}
