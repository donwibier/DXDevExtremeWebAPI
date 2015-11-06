DXDevExtremeClient.Values = function (params) {
    "use strict";
     
    var _datasource = new DevExpress.data.DataSource({
        pageSize: 20,
        store: new DevExpress.data.CustomStore({
            load: function (options) {
                var d = $.Deferred();
                DXDevExtremeClient.db.get('Values', '', null,
                    function (data) {
                        d.resolve(data);
                    },
                    function (err) {
                        d.reject(err);
                    });
                return d.promise();
            },
            byKey: function (key) {
                var d = $.Deferred();
                DXDevExtremeClient.db.get('Values', encodeURIComponent(key), null,
                    function (data) {
                        d.resolve(data);
                    },
                    function (err) {
                        datasourceError(err);
                        d.reject(err);
                    });
                return d.promise();
            }/*,
                insert: function (values) {
                    var d = $.Deferred();
                    DXDevExtremeClient.db.post('Values', '', values,
                        function (data) {
                            d.resolve(data);
                        },
                        function (err) {
                            datasourceError(err);
                            d.reject(err);
                        });
                    return d.promise();
                },
                update: function (key, values) {
                    var d = $.Deferred();
                    DXDevExtremeClient.db.put('Values', encodeURIComponent(key), values,
                        function (data) {
                            d.resolve(data);
                        },
                        function (err) {
                            datasourceError(err);
                            d.reject(err);
                        });
                    return d.promise();
                },
                remove: function (key) {
                    var d = $.Deferred();
                    DXDevExtremeClient.db.del('Values', encodeURIComponent(key), null,
                        function (data) {
                            d.resolve(data);
                        },
                        function (err) {
                            datasourceError(err);
                            d.reject(err);
                        });
                    return d.promise();
                }*/
        })
    });

    function datasourceError(err) {
        var msg = (err.responseJSON && err.responseJSON.Message) ? err.responseJSON.Message : err;
        DevExpress.ui.notify('The server returned an error:' + msg, 'error', 3000);
    }

    function getValues() {
        _datasource.load();
    }

    var viewModel = {
        dataSource: _datasource,
        viewShown: getValues
    };

    return viewModel;

};