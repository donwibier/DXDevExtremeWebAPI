/// <reference path="../js/jquery-1.11.3.min.js" />
/// <reference path="../js/knockout-3.3.0.js" />
/// <reference path="../js/dx.all.js" />

(function () {
    var isWinJS = "WinJS" in window;
    var endpointSelector = new DevExpress.EndpointSelector(DXDevExtremeClient.config.endpoints);
    var serviceConfig = $.extend(true, {}, DXDevExtremeClient.config.services, {
        db: {
            url: endpointSelector.urlFor("db"),

            // To enable JSONP support, uncomment the following line
            //jsonp: !isWinJS,

            // To allow cookies and HTTP authentication with CORS, uncomment the following line
            // withCredentials: true,

            errorHandler: handleServiceError
        }
    });

    function handleServiceError(error) {
        if (isWinJS) {
            try {
                new Windows.UI.Popups.MessageDialog(error.message).showAsync();
            } catch (e) {
                // Another dialog is shown
            }
        } else {
            alert(error.message);
        }
    }

    // Enable partial CORS support for IE < 10    
    $.support.cors = true;    

    //DXDevExtremeClient.db = new DevExpress.data.ODataContext(serviceConfig.db);

    window.my = DXDevExtremeClient; // your application object
    var actionEvents = {
        signinAction: function (args, sender) {
            my.app.navigate('DXSignin', { root: true });
            DevExpress.ui.notify('The server requires you to login', 'error', 3000);
        },
        authenticatedAction: function (args, sender) {
            DevExpress.ui.notify('You have been logged in successfully!', 'success', 3000);
        },
        externalAuthenticatedAction: function (args, sender) {
            DevExpress.ui.notify('You have been logged in successfully!', 'success', 3000);
            my.app.navigate('home', { root: true });
        },
        externalRegisteredAction: function (args, sender) {
            DevExpress.ui.notify('Your external account has been registered!', 'success', 3000);
        },
        externalRegisterErrorAction: function (args, sender) {
            DevExpress.ui.notify('Registration failed', 'error', 3000);
        },
        providersPopulatedAction: function (args, sender) {
            sender.loginProviders = ko.observableArray(sender.loginProviders);
            sender.hasProviders = ko.observable(args.length > 0);
        },
        logoutAction: function (args, sender) {
            my.app.navigate('home', { root: true });
        }
    };

    // Extend the db Client object with the Films DataSource
    var db = db || new DX.WebAPI.Client(serviceConfig.db.url, actionEvents);
    db.Films = db.Films || new DevExpress.data.DataSource({
        pageSize: 20,
        store: new DevExpress.data.CustomStore({
            load: function (options) {
                var d = $.Deferred();
                db.get('Films', '', null,
                    function (data) {
                        d.resolve(data);
                    },
                    function (err, sender) {
                        d.reject(err);
                        if (!sender.authorizeError(err))
                            datasourceError(err, sender);
                    });
                return d.promise();
            },
            byKey: function (key) {
                var d = $.Deferred();
                db.get('Films', encodeURIComponent(key), null,
                    function (data) {
                        d.resolve(data);
                    },
                    function (err, sender) {
                        d.reject(err);
                        if (!sender.authorizeError(err))
                            datasourceError(err, sender);
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

    window.db = db; //new DX.WebAPI.Client(serviceConfig.db.url, actionEvents);
    DXDevExtremeClient.db = db; //window.db;

    /* Fetch the login providers from server and set correct redirectUrl */
    window.db.populateProviders();

}());
