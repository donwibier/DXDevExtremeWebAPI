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
    var client = new DX.WebAPI.Client(serviceConfig.db.url,
        {
            signinAction: function (sender, args) {
                DXDevExtremeClient.app.navigate('Signin', { root: true });
                DevExpress.ui.notify('The server requires you to login', 'error', 3000);
            },
            accessDeniedAction: function (sender, args) {
                DevExpress.ui.notify('Validation failed', 'error', 3000);
            },
            authenticatedAction: function (sender, args) {
                DevExpress.ui.notify('You have been logged in successfully!', 'success', 3000);
            },
            externalAuthenticatedAction: function (sender, args) {
                DevExpress.ui.notify('You have been logged in successfully!', 'success', 3000);
                DXDevExtremeClient.app.navigate('Home', {root:true});
            },
            externalRegisteredAction: function (sender, args) {
                DevExpress.ui.notify('Your external account has been registered!', 'success', 3000);
            },
            externalRegisterErrorAction: function (sender, args) {
                DevExpress.ui.notify('Registration failed', 'error', 3000);
            },
            providersPopulatedAction: function (sender, args) {
                sender.loginProviders = ko.observableArray(sender.loginProviders);
                sender.hasProviders = ko.observable(args.length > 0);
            }
        });
   
    window.db = client;
    DXDevExtremeClient.db = client;

    /* Fetch the login providers from server and set correct redirectUrl */
    client.populateProviders();
}());
