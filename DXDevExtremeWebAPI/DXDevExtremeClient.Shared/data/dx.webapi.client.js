(function () {
	"use strict";

	var DX = DX || {};

	DX.Utils = DX.Utils || {
        version: function () {
            return "v1.0.0.1";
        },
        getUrlParts : function (url) {
            var parts = url.split(/[?#&]/);
            var result = {};
            result["url"] = parts[0];

            if (parts.length > 1) {
                for (var i = 1; i < parts.length; i++) {
                    var pair = parts[i].split("=", 2);
                    var key = decodeURIComponent(pair[0]);
                    var val = (pair.length > 1) ? decodeURIComponent(pair[1]) : "";
                    result[key] = val;
                }
            }
            return result;
        }
    };


    DX.WebAPI = DX.WebAPI || {};
    /*
     * serviceUrl = the location of the WebAPI service (without trailing slash !)
     * actionEvents is an object which can have the following structure:
        actionEvents = {
            signinAction : function(sender, args){},
            accessDeniedAction : function(sender, args){},
            authenticatedAction : function(sender, args){},
            externalAuthenticatedAction : function(sender, args){},
            externalRegisteredAction : function(sender, args){},				
            externalRegisterErrorAction : function(sender, args){},
            providersPopulatedAction: function (sender, args) { }
        }
     */
	DX.WebAPI.Client = function DX_WebAPI_Client(serviceUrl, actionEvents) {

	    this.baseUrl = serviceUrl;
	    this.events = actionEvents;
	    this.username = '';
	    this._extWnd = null;
	    this._isCordova = !!window.cordova;

	    this.loginProviders = [];
	    this.hasProviders = false;
	}

	DX.WebAPI.Client.prototype = {
	    _dispatchEvent: function(name){
	        if (this.events[name])
	        {
	            this.events[name](arguments.slice(1));
	        }
	    },

        _ajax : function (method, url, headers, dataObj, onSuccess, onFailure) {
	        var self = this;
	        var ajaxObj = {
	            method: method,
	            url: url,
	            contentType: 'application/json; charset=utf-8',
	            xhrFields: { withCredentials: true },
	            beforeSend: function (xhr) {
	                if (headers) {
	                    for (var i = 0; i < headers.length; i++)
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
                    if (err.status === 401) {
                        if (self.events.signinAction) {
                            self.events.signinAction(self, err);
                        }
                    }
                    else{ 
                        if (onFailure)
                            onFailure(self, err);
                 
                        if (self.events.accessDeniedAction)
                            self.events.accessDeniedAction(self, err);
                    }
                });
        },
        ajax : function (method, controllerName, actionMethod, dataObj, onSuccess, onFailure) {
	    
            var token = sessionStorage.getItem('USRTOKEN');
            var headers = (token) ? [{ name: 'Authorization', value: 'Bearer ' + token }] : null;
            var url = this.baseUrl + '/api/' + controllerName + '/' + actionMethod;

            this._ajax(method, url, headers, dataObj, onSuccess, onFailure);
        },
        login : function (username, password, onSuccess, onFailure) {
            var self = this;
            var loginData = {
                grant_type: 'password',
                username: username,
                password: password
            };
            this._ajax('POST', this.baseUrl + '/Token', null, loginData,
                function (data) {
                    self.username = data.userName;
                    sessionStorage.setItem('USRTOKEN', data.access_token);                    
                    if (onSuccess) {
                        onSuccess(self, data);
                    }
                    else if (self.events.authenticatedAction){
                        self.events.authenticatedAction(self, data);
                    }               
                },
                function (err) {
                    if (onFailure) 
                        onFailure(err);
                    else if (self.events.accessDeniedAction)
                        self.events.accessDeniedAction(self, err);                    
                
                });
        },
        populateProviders: function(onPopulateAction){
            var self = this;
            var _redirectUri = (this.isCordova ? this.baseUrl : location.protocol + '//' + location.host) + '/oauthcomplete.html';
            this.get("Account", "ExternalLogins?returnUrl=" + _redirectUri, null,
                function (data) {
                    if (data.length > 0) {
                        for (var i = 0; i < data.length; i++)
                            data[i].Url = data[i].Url + "%3Fprovider=" + data[i].Name;
                        self.loginProviders = data;
                    }
                    if (onPopulateAction)
                        onPopulateAction(self, data);
                    else if (self.events.providersPopulatedAction)
                        self.events.providersPopulatedAction(self, data);
                },
                function (err) {
                    self.hasProviders = false;
                    if (onPopulateAction)
                        onPopulateAction(self, err);
                    else if (self.events.providersPopulatedAction)
                        self.events.providersPopulatedAction(self, err);
                });
        },
        externalLogin : function (provider, url) {
            if (!this.isCordova) {
                this._extWnd = window.open(this.baseUrl + url, "Authenticate Account", "location=0,status=0,width=600,height=750");
            }
            else {
                var self = this;
                this._extWnd = window.open(this.baseUrl + url, '_blank', 'location=no');
                this._extWnd.addEventListener('loadstop', self._externalLoginCordovaLoadStop);
            }
        },
        _externalLoginCordovaLoadStop : function(event){
            var self = this;
            var testUrl = self.baseUrl + '/oauthcomplete.html';
            var cburl = (event.url);
            if (cburl.indexOf(testUrl) === 0) {
                var fragments = getUrlParts(cburl);
                self.externalLoginCallback(fragments);
                self._extWnd.removeEventListener('loadstop', self._externalLoginCordovaLoadStop);
                self._extWnd.close();
            }
        },
        externalLoginCallback : function (fragment) {
            sessionStorage.setItem('USRTOKEN', fragment.access_token);
            sessionStorage.setItem('USRPROV', fragment.provider);

            var email = fragment.email ? fragment.email : fragment.username;
            var user = fragment.username ? fragment.username : "";
            if (user !== email) {
                this.externalRegister(email);
            }
            else {
                if (this.events.externalAuthenticatedAction)
                    this.events.externalAuthenticatedAction(this, fragment);
            }
        },
        externalRegister : function (email) {
            var self = this;
            this.ajax('POST', 'Account', 'RegisterExternal', { 'Email': email, 'Name': email },
                function (data) {
                    if (self.events.externalRegisteredAction)
                        self.events.externalRegisteredAction(self, data);
                },
                function (err) {
                    if (self.events.externalRegisterErrorAction)
                        self.events.externalRegisterErrorAction(self, err);
                }
            );
        },
        logout : function (redirectView) {
            sessionStorage.removeItem('USRTOKEN');
            sessionStorage.removeItem('USRPROV');
            if (redirectView)
                DXDevExtremeClient.app.navigate(redirectView, { root: true });
        },
        authenticated : function () {
            var token = sessionStorage.getItem('USRTOKEN');
            return (token !== '');
        },
        post : function (controllerName, actionMethod, dataObj, onSuccess, onFailure) {
            this.ajax('POST', controllerName, actionMethod, dataObj, onSuccess, onFailure);
        },
        get : function (controllerName, actionMethod, dataObj, onSuccess, onFailure) {
            this.ajax('GET', controllerName, actionMethod, dataObj, onSuccess, onFailure);
        },
        put : function (controllerName, actionMethod, dataObj, onSuccess, onFailure) {
            this.ajax('PUT', controllerName, actionMethod, dataObj, onSuccess, onFailure);
        },
        del : function (controllerName, actionMethod, dataObj, onSuccess, onFailure) {
            this.ajax('DELETE', controllerName, actionMethod, dataObj, onSuccess, onFailure);
        }
	}

	window.DX = DX;
})();