DXDevExtremeClient.Values = function (params) {
    
    //var _datasource = new DevExpress.data.DataSource({
    //	pageSize: 20,
    //	load: function (options) {
    //	    return DXDevExtremeClient.db.get('Values', '', null, null, datasourceError);
    //   },
    //	byKey: function(key) {
    //	    return DXDevExtremeClient.db.get('Values', encodeURIComponent(key), null, null, datasourceError);
    //	},
    //	insert: function (values) {
    //	    return DXDevExtremeClient.db.post('Values', '', values, null, datasourceError);
    //    },
    	
    //	update: function (key, values) {
    //	    return DXDevExtremeClient.db.put('Values', encodeURIComponent(key), values, null, datasourceError);
    //    },
    	
    //	remove: function (key) {
    //	    return DXDevExtremeClient.db.del('Values', encodeURIComponent(key), null, null, datasourceError);
    //    }
    	
    //});

    function datasourceError(err) {
        var msg = (err.responseJSON && err.responseJSON.Message) ? err.responseJSON.Message : err;
        DevExpress.ui.notify('The server returned an error:' + msg, 'error', 3000);
    }
    var _datasource = ko.observableArray();

    function getValues() {
        //_datasource.load();
        db.get('Values', '', null, function (data) {           
            _datasource(data);
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