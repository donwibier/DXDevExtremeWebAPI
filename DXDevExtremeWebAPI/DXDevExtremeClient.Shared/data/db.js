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

        ajax: function (method, controllerName, actionMethod, dataObj, onSuccess, onFailure) {
            var ajaxObj = {
                type: method,
                url: this._baseUrl + '/api/' + controllerName + '/' + actionMethod,
                contentType: 'application/json; charset=utf-8'
            };
            var token = sessionStorage.getItem('USRTOKEN');
            if (token) {
                var hdrs = { Authorization: 'Bearer ' + token };
                ajaxObj = $.extend(ajaxObj, { headers: hdrs });
            }
            if (typeof dataObj !== 'undefined')
                ajaxObj = $.extend(ajaxObj, { data: JSON.stringify(dataObj) });

            $.ajax(ajaxObj)
                .done(onSuccess)
                .fail(onFailure);
        },
        login: function (username, password, onSuccess, onFailure) {
            var loginData = {
                grant_type: 'password',
                username: username,
                password: password
            };
            $.ajax({
                type: 'POST',
                url: this._baseUrl + '/Token',
                data: loginData
            }).done(function (data) {
                this._username = data.userName;
                sessionStorage.setItem('USRTOKEN', data.access_token);
                onSuccess(data);
            }).fail(onFailure);

        },
        //==
        oauthCompletedCB : function (fragment, onSuccess, onFailure) {
            debugger;
            //var db = this.DXDevExtremeClient.db;
            var loginData = {
                Provider: fragment.provider,
                ExternalAccessToken: fragment.access_token
            };
            this.get('Account', 'ExternalLogin?provider=' + fragment.provider, null,
                function (data) {
                    debugger;
                    this._username = data.userName;
                    sessionStorage.setItem('USRTOKEN', data.access_token);
                    if (onSuccess) {
                        onSuccess(data);
                    }
                },
                function (data) {
                    debugger;
                    if (onFailure) {
                        onFailure(data);
                    }
                });
            


            //if (fragment.haslocalaccount === 'False') {

                //authService.logOut();

                //authService.externalAuthData = {
                //    provider: fragment.provider,
                //    userName: fragment.external_user_name,
                //    externalAccessToken: fragment.external_access_token
                //};

                    

            //}
            //else {
                //Obtain access token and redirect to orders
                //var externalData = { provider: fragment.provider, externalAccessToken: fragment.external_access_token };
                //authService.obtainAccessToken(externalData).then(function (response) {
            //}
        },

        //==
        externalLogin: function (provider, url) {
            //var u = this._baseUrl + url;
            var oauthWindow = window.open(this._baseUrl+url, "Authenticate Account", "location=0,status=0,width=600,height=750");
            // under construction !!!
            //if (!this.isCordova) {

            //    url = (this._baseUrl + url).replace(/((?:.*)redirect_uri=)(.+)((?:[\&|\s]).*)/, "$1" + encodeURIComponent(window.location) + "$3");                
                //debugger;
                //window.location.replace(url);
            //}
        },
        logout: function (redirectView) {
            sessionStorage.removeItem('USRTOKEN');
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
    //api%2FAccount%2FExternalLoginCallback
    //client.get("Account", "ExternalLogins?returnUrl=%2F", null,
    //    function (data) {
    //        client.hasExternalLogins(data.length > 0);
    //        if (client.hasExternalLogins) {
    //            client.externalLogins = ko.observableArray(data);
    //        }
    //    },
    //    function (data) {
    //        client.hasExternalLogins(false);            
    //    }
    //);
    //window.oauthCompletedCB = client.oauthCompletedCB;
    window.db = client;
    DXDevExtremeClient.db = client;
}());
