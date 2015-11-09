using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;

namespace WebAPIServer.Models
{
    public abstract class FilmDetailBase
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public virtual int Id { get; set; }
        [ForeignKey("Film")]
        [Required]
        public virtual int FilmId { get; set; }
        [ForeignKey("FilmId")]
        public virtual Film Film { get; set; }

    }
    public class FilmActor : FilmDetailBase
    {
        [StringLength(250)]
        [Required]
        public string Actor { get; set; }

    }

    public class FilmFunFact : FilmDetailBase
    {
        [Required]
        public string Fact { get; set; }

    }
    public class FilmLocation : FilmDetailBase
    {
        [StringLength(250)]
        [Required]
        public string Location { get; set; }

    }

    public class FilmWriter : FilmDetailBase
    {
        [StringLength(250)]
        [Required]
        public string Writer { get; set; }

    }
}
