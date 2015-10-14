/// <reference path="../js/jquery-1.11.3.min.js" />
/// <reference path="../js/knockout-3.3.0.js" />
/// <reference path="../js/dx.all.js" />

(function() {
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
        if(isWinJS) {
            try {
                new Windows.UI.Popups.MessageDialog(error.message).showAsync();
            } catch(e) {
                // Another dialog is shown
            }
        } else {
            alert(error.message);
        }
    }

    // Enable partial CORS support for IE < 10    
    $.support.cors = true;
    
    //DXDevExtremeClient.db = new DevExpress.data.ODataContext(serviceConfig.db);

    var client = {
        _baseUrl: serviceConfig.db.url,
        _loginView: 'Signin',
        _username: '',
        isCordova: !!window.cordova,
        loginProviders : ko.observableArray(),
        hasProviders : ko.observable(false),

        _ajax: function(method, url, headers, dataObj, onSuccess, onFailure) {
            var ajaxObj = {
                method: method,
                url: url,
                contentType: 'application/json; charset=utf-8',
                xhrFields: {
                    withCredentials: true
                },
                beforeSend: function (xhr) {
                    if (headers) {
                        for(var i = 0; i < headers.length; i++)
                            xhr.setRequestHeader(headers[i].name, headers[i].value);
                    }
                }
            }
            if (dataObj)
                ajaxObj = $.extend(ajaxObj, { data: JSON.stringify(dataObj) });

            $.ajax(ajaxObj)
                .done(function (data) {
                    if (onSuccess)
                        onSuccess(data);
                })
                .fail(function (err) {
                    if (onFailure)
                        onFailure(err);
                });
        },
        ajax: function (method, controllerName, actionMethod, dataObj, onSuccess, onFailure) {

            var token = sessionStorage.getItem('USRTOKEN');
            var headers = (token) ? [{ name: 'Authorization', value: 'Bearer ' + token }] : null;
            var url = this._baseUrl + '/api/' + controllerName + '/' + actionMethod;
            
            this._ajax(method, url, headers, dataObj, onSuccess, onFailure);
        },
        login: function (username, password, onSuccess, onFailure) {
            var loginData = {
                grant_type: 'password',
                username: username,
                password: password
            };
            this._ajax('POST', this._baseUrl + '/Token', null, loginData,
                function (data) {
                    this._username = data.userName;
                    sessionStorage.setItem('USRTOKEN', data.access_token);
                    DevExpress.ui.notify('You have been logged in successfully!', 'success', 3000);
                    if (onSuccess) onSuccess(data);
                },
                function(err){
                    DevExpress.ui.notify('Validation failed', 'error', 3000);
                    if (onFailure) onFailure(err);
                });
        },
        externalLogin: function (provider, url) {            
            var oauthWindow = window.open(this._baseUrl+url, "Authenticate Account", "location=0,status=0,width=600,height=750");
            // under construction !!!
            //if (!this.isCordova) {  }
        },        
        externalLoginCallback: function (fragment) {            
            sessionStorage.setItem('USRTOKEN', fragment.access_token);
            sessionStorage.setItem('USRPROV', fragment.provider);            

            var email = fragment.email ? fragment.email : fragment.username;
            var user = fragment.username ? fragment.username : "";
            if (user !== email) {
                this.ajax('POST', 'Account', 'RegisterExternal', { 'Email': email, 'Name': email },
                    function (data) {
                        //externalLogin(..) or handle at server
                        DevExpress.ui.notify('Your ' + fragment.provider + ' account has been registered!', 'success', 3000);
                    },
                    function (err) {
                        DevExpress.ui.notify('Validation failed', 'error', 3000);
                    });
            }
            else {
                DevExpress.ui.notify('You have been logged in successfully!', 'success', 3000);
                DXDevExtremeClient.app.navigate("Home", { root: true });
            }
        },        
        logout: function (redirectView) {
            sessionStorage.removeItem('USRTOKEN');
            sessionStorage.removeItem('USRPROV');
            if (redirectView)
                DXDevExtremeClient.app.navigate(redirectView, { root: true });
        },
        authenticated: function () {
            var token = sessionStorage.getItem('USRTOKEN');
            return (token !== '');
        },
        post: function (controllerName, actionMethod, dataObj, onSuccess, onFailure) {
            this.ajax('POST', controllerName, actionMethod, dataObj, onSuccess, onFailure);
        },
        get: function (controllerName, actionMethod, dataObj, onSuccess, onFailure) {
            this.ajax('GET', controllerName, actionMethod, dataObj, onSuccess, onFailure);
        }
    }    
    window.db = client;
    DXDevExtremeClient.db = client;
    /* Fetch the login providers from server*/
    var _redirectUri = location.protocol + '//' + location.host + '/oauthcomplete.html';
    client.get("Account", "ExternalLogins?returnUrl=" + _redirectUri, null,
        function (data) {
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++)
                    data[i].Url = data[i].Url + "%3Fprovider=" + data[i].Name;
                client.loginProviders(data);
            }
        },
        function (err) {
            client.hasProviders(false);
        });
}());
