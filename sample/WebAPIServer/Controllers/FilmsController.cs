using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using WebAPIServer.Models;

namespace WebAPIServer.Controllers
{
    [Authorize]
    public class FilmsController : ApiController
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        // GET: api/Films
        public IQueryable<FilmDTO> GetFilms()
        {
            var films = from f in db.Films
                        select new FilmDTO
                        {
                            Id = f.Id,
                            Title = f.Title,
                            Director = f.Director,
                            ReleaseYear = f.ReleaseYear,
                            Distributor = f.Distributor,
                            ProductionCompany = f.ProductionCompany
                        };
            return films;
        }

        // GET: api/Films/5
        [ResponseType(typeof(FilmDetailDTO))]
        public IHttpActionResult GetFilm(int id)
        {
            var film = db.Films
                .Select(f =>
                    new FilmDetailDTO
                    {
                        Id = f.Id,
                        Title = f.Title,
                        Director = f.Director,
                        ReleaseYear = f.ReleaseYear,
                        Distributor = f.Distributor,
                        ProductionCompany = f.ProductionCompany
                    }).SingleOrDefault(f => f.Id == id);

            if (film == null)
            {
                return NotFound();
            }

            film.Actors = (from l in db.FilmActors
                           where l.FilmId == id
                           select new FilmActorDTO { Id = l.Id, Actor = l.Actor }).ToList();
            film.Locations = (from l in db.FilmLocations
                              where l.FilmId == id
                              select new FilmLocationDTO { Id = l.Id, Location = l.Location }).ToList();
            film.Writers = (from l in db.FilmWriters
                            where l.FilmId == id
                            select new FilmWriterDTO { Id = l.Id, Writer = l.Writer }).ToList();
            film.FunFacts = (from l in db.FilmFunFacts
                             where l.FilmId == id
                             select new FilmFunFactDTO { Id = l.Id, Fact = l.Fact }).ToList();
            return Ok(film);
        }
        // PUT: api/Films/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutFilm(int id, Film film)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != film.Id)
            {
                return BadRequest();
            }

            db.Entry(film).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FilmExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Films
        [ResponseType(typeof(Film))]
        public IHttpActionResult PostFilm(Film film)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Films.Add(film);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = film.Id }, film);
        }

        // DELETE: api/Films/5
        [ResponseType(typeof(Film))]
        public IHttpActionResult DeleteFilm(int id)
        {
            Film film = db.Films.Find(id);
            if (film == null)
            {
                return NotFound();
            }

            db.Films.Remove(film);
            db.SaveChanges();

            return Ok(film);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool FilmExists(int id)
        {
            return db.Films.Count(e => e.Id == id) > 0;
        }
    }
}