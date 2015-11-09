using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebAPIServer.Models
{
    public class FilmDTO
    {
        public virtual int Id { get; set; }
        [StringLength(250)]
        [Required]
        public virtual string Title { get; set; }
        public virtual int ReleaseYear { get; set; }
        [StringLength(250)]
        public virtual string ProductionCompany { get; set; }
        [StringLength(250)]
        public virtual string Distributor { get; set; }
        [StringLength(250)]
        public virtual string Director { get; set; }
    }

    public class FilmDetailDTO:FilmDTO
    {
        public List<FilmLocationDTO> Locations { get; set; }
        public List<FilmWriterDTO> Writers { get; set; }
        public List<FilmActorDTO> Actors { get; set; }
        public List<FilmFunFactDTO> FunFacts { get; set; }
    }
}
