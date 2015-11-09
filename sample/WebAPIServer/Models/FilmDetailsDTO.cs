using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;

namespace WebAPIServer.Models
{
    public abstract class FilmDetailDTOBase
    {
        public virtual int Id { get; set; }
    }
    public class FilmActorDTO : FilmDetailDTOBase
    {
        [StringLength(250)]
        [Required]
        public string Actor { get; set; }

    }

    public class FilmFunFactDTO : FilmDetailDTOBase
    {
        [Required]
        public string Fact { get; set; }

    }
    public class FilmLocationDTO : FilmDetailDTOBase
    {
        [StringLength(250)]
        [Required]
        public string Location { get; set; }

    }

    public class FilmWriterDTO : FilmDetailDTOBase
    {
        [StringLength(250)]
        [Required]
        public string Writer { get; set; }

    }
}
