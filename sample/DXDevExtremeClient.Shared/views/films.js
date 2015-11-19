DXDevExtremeClient.films = function (params) {
    /*
    "use strict";
    var ds = ko.observableArray();

    function datasourceError(err) {
        var msg = (err.responseJSON && err.responseJSON.Message) ? err.responseJSON.Message : err;
        DevExpress.ui.notify('The server returned an error:' + msg, 'error', 3000);
    }

    function viewShownEvent() {
        db.get('Films', '', null,
                    function (data) {
                        ds(data);
                    },
                    function (err, sender) {
                        if (!sender.authorizeError(err))
                            datasourceError(err, sender);
                    });
    }

    var viewModel = {
        dataSource: ds,
        viewShown: viewShownEvent
    };
    */
    function viewShownEvent() {
        db.Films.load();
    }

    var viewModel = {
        dataSource: db.Films,        
        viewShown: viewShownEvent
    };
    
    return viewModel;
};