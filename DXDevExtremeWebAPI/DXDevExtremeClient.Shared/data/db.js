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
            if (dataObj)
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
        externalLogin: function (provider, url) {            
            var oauthWindow = window.open(this._baseUrl+url, "Authenticate Account", "location=0,status=0,width=600,height=750");
            // under construction !!!
            //if (!this.isCordova) {  }
        },        
        externalLoginCallback: function (fragment, onSuccess, onFailure) {            
            sessionStorage.setItem('USRTOKEN', fragment.access_token);
            sessionStorage.setItem('USRPROV', fragment.provider);            

            var email = fragment.email ? fragment.email : fragment.username;
            var user = fragment.username ? fragment.username : "";
            if (user !== email) {
                $.ajax({
                    url: this._baseUrl + '/api/Account/RegisterExternal',
                    data: { 'Email': email, 'Name': email },
                    method: 'POST',
                    xhrFields: {
                        withCredentials: true
                    },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + fragment.access_token);
                    },
                    success: function (data) {
                        DevExpress.ui.notify('Your ' + fragment.provider + ' account has been registered!', 'success', 3000);
                    },
                    failure: function (data) {                    
                        DevExpress.ui.notify('Validation failed', 'error', 3000);
                    }
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
}());
