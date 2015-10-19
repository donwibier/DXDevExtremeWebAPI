DXDevExtremeClient.Values = function (params) {
    /*
        var _valuesSource = new DevExpress.data.CustomStore({
    	pageSize: 20,
    	load: function (options) {
    	    return DXDevExtremeClient.db.get('Values', '', null, null);
       },
    	byKey: function(key) {
    	    return DXDevExtremeClient.db.get('Values', encodeURIComponent(key), null, null, datasourceError);
    	},
    	insert: function (values) {
    	    return DXDevExtremeClient.db.post('Values', '', values, null, datasourceError);
        },
    	
    	update: function (key, values) {
    	    return DXDevExtremeClient.db.put('Values', encodeURIComponent(key), values, null, datasourceError);
        },
    	
    	remove: function (key) {
    	    return DXDevExtremeClient.db.del('Values', encodeURIComponent(key), null, null, datasourceError);
        }
    	
    });
    */
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