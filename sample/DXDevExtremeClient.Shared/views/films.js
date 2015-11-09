DXDevExtremeClient.films = function (params) {
    /*
    var ds = ko.observableArray();

    function datasourceError(err) {
        var msg = (err.responseJSON && err.responseJSON.Message) ? err.responseJSON.Message : err;
        DevExpress.ui.notify('The server returned an error:' + msg, 'error', 3000);
    }
    */
    function viewShownEvent() {
        db.Films.load();
        /*
        db.get('Films', '', null,
                    function (data) {
                        ds(data);
                    },
                    function (err, sender) {
                        if (!sender.authorizeError(err))
                            datasourceError(err, sender);
                    });
        */
    }

    var viewModel = {
        dataSource: /*ds*/db.Films,        
        viewShown: viewShownEvent
    };

    return viewModel;
};