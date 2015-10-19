DXDevExtremeClient.Values = function (params) {

    var _datasource = ko.observableArray();

    function getValues() {
        DXDevExtremeClient.db.get('Values', '', null, function (data) {
            var result = [];
            for (var i = 0; i < data.length; i++) {
                result.push({
                    id: i,
                    value: data[i]
                });
            }
            _datasource(result);
        },
        function (err) {
            DevExpress.ui.notify('The server returned an error' + err, 'error', 3000);
        });
    }

    var viewModel = {
        dataSource: _datasource,
        viewShown: getValues
    };

    return viewModel;
};