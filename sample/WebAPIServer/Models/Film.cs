using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebAPIServer.Models
{    
    public class Film
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(250)]
        [Required]
        public string Title { get; set; }
        public int ReleaseYear { get; set; }
        [StringLength(250)]
        public string ProductionCompany { get; set; }
        [StringLength(250)]
        public string Distributor { get; set; }
        [StringLength(250)]
        public string Director { get; set; }
        public List<FilmLocation> Locations { get; set; }
        public List<FilmWriter> Writers { get; set; }
        public List<FilmActor> Actors{ get; set; } 
        public List<FilmFunFact> FunFacts { get; set; }

    }

}
