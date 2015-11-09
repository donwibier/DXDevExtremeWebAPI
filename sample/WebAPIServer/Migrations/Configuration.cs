namespace WebAPIServer.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Data.Entity.Validation;
    using System.Linq;
    using Models;

    internal sealed class Configuration : DbMigrationsConfiguration<WebAPIServer.Models.ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        static int parseInt(string year)
        {
            int result;
            if (!int.TryParse(year, out result))
                result = 0;
            return result;
        }

        protected override void Seed(WebAPIServer.Models.ApplicationDbContext context)
        {
            Console.WriteLine("Starting to fill the DB");
            //  This method will be called after migrating to the latest version.            
            try
            {
                FilmImport import = FilmImport.CreateFromResource("WebAPIServer.App_Data.rows.xml");
                foreach (FilmImportRow row in import.Rows)
                {
                    string title = row.title;

                    var film = (from f in context.Films
                                where f.Title == title
                                select f).FirstOrDefault();
                    if (film == null)
                    {
                        film = new Film()
                        {
                            Title = row.title,
                            ReleaseYear = parseInt(row.release_year),
                            ProductionCompany = row.production_company,
                            Distributor = row.distributor,
                            Director = row.director
                        };
                        film = context.Films.Add(film);
                        context.SaveChanges();
                    }
                    if (!String.IsNullOrEmpty(row.locations))
                    {
                        var location = (from l in context.FilmLocations
                                        where (l.FilmId == film.Id) && (l.Location == row.locations)
                                        select l).FirstOrDefault();
                        if (location == null)
                            context.FilmLocations.Add(new FilmLocation { Film = film, Location = row.locations });
                    }
                    if (!String.IsNullOrEmpty(row.fun_facts))
                    {
                        var fact = (from f in context.FilmFunFacts
                                    where (f.FilmId == film.Id) && (f.Fact == row.fun_facts)
                                    select f).FirstOrDefault();
                        if (fact == null)
                            context.FilmFunFacts.Add(new FilmFunFact { Film = film, Fact = row.fun_facts }); ;
                    }
                    string[] writers = String.IsNullOrEmpty(row.writer) ? null : row.writer.Split(',');
                    if (writers != null)
                    {
                        foreach (string wrt in writers)
                        {
                            string trimmedWriter = wrt.Trim();
                            if (!String.IsNullOrEmpty(trimmedWriter))
                            {
                                var writer = (from w in context.FilmWriters
                                              where (w.FilmId == film.Id) && (w.Writer == trimmedWriter)
                                              select w).FirstOrDefault();
                                if (writer == null)
                                    context.FilmWriters.Add(new FilmWriter { Film = film, Writer = trimmedWriter.Trim() });
                            }
                        }
                    }
                    foreach (string act in new string[] { row.actor_1, row.actor_2, row.actor_3 })
                    {
                        if (!String.IsNullOrEmpty(act))
                        {
                            var actor = (from a in context.FilmActors
                                         where (a.FilmId == film.Id) && (a.Actor == act)
                                         select a).FirstOrDefault();
                            if (actor == null)
                                context.FilmActors.Add(new FilmActor { Film = film, Actor = act });
                        }
                    }
                    context.SaveChanges();
                }
            }
            catch (DbEntityValidationException e)
            {
                foreach (var eve in e.EntityValidationErrors)
                {
                    Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                        eve.Entry.Entity.GetType().Name, eve.Entry.State);
                    foreach (var ve in eve.ValidationErrors)
                    {
                        Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                            ve.PropertyName, ve.ErrorMessage);
                    }
                }
                throw;
            }
        }
    }
}
