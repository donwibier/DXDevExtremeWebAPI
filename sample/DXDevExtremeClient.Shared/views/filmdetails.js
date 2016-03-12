DXDevExtremeClient.filmdetails = function (params) {

    var id = params.id,
        filmTitle = ko.observable(),
        filmReleaseYear = ko.observable(),
        filmProductionCompany = ko.observable(),
        filmDistributor = ko.observable(),
        filmDirector = ko.observable(),

        filmFunFacts = ko.observableArray(),
        filmLocations = ko.observableArray(),
        filmWriters = ko.observableArray(),
        filmActors = ko.observableArray(),
        isReady = $.Deferred();

    function viewShownEvent() {
        db.data.Films.byKey(id).done(function (data) {
            filmTitle(data.Title),
            filmReleaseYear(data.ReleaseYear);
            filmProductionCompany(data.ProductionCompany);
            filmDistributor(data.Distributor);
            filmDirector(data.Director);

            filmFunFacts(data.FunFacts);
            filmLocations(data.Locations);
            filmWriters(data.Writers);
            filmActors(data.Actors);

            isReady.resolve();
        });
    }

    var viewModel = {

        viewShown: viewShownEvent,
        id: id,
        isReady: isReady.promise(),
        film: {
            Title: filmTitle,
            ReleaseYear: filmReleaseYear,
            ProductionCompany: filmProductionCompany,
            Distributor: filmDistributor,
            Director: filmDirector,

            FunFacts: filmFunFacts,
            Locations: filmLocations,
            Writers: filmWriters,
            Actors: filmActors
        }
    };

    return viewModel;
};