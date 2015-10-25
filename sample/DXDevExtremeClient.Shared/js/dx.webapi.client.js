//Created by Don Wibier /DEVEXPRESS (donw@devexpress.com)
//https://github.com/donwibier/DXDevExtremeWebAPI

(function () {
	"use strict";

	var DX = DX || {};

	DX.Utils = DX.Utils || {
        version: function () {
            return "v1.0.0.3";
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
        },
        removeTrailingSlash: function (url) {
            if (!url)
                return "";
            var parts = url.split(/([?#])/);
            var result = (parts[0].substr(parts[0].length - 1) == '/') ? parts[0].substr(0, parts[0].length - 1) : parts[0];
            for(var i = 1; i < parts.length; i++)
                result += parts[i];
            return result;
        }
    };


    DX.WebAPI = DX.WebAPI || {};
   
	DX.WebAPI.Client = function DX_WebAPI_Client(serviceUrl, actionEvents) {

	    this.baseUrl = DX.Utils.removeTrailingSlash(serviceUrl);	    
	    this.events = actionEvents || {};
	    this.controllerEndPoint = '/api';
	    this.tokenEndPoint = '/Token';
	    this.username = '';

	    this.loginProviders = [];
	    this.hasProviders = false;
	    // private members
	    this._extWnd = null;
	    this._isCordova = !!window.cordova;

	}

	DX.WebAPI.Client.prototype = {
	    _dispatchEvents: function (handlers, eventArgs) {
	        for (var i = 0; i < handlers.length; i++) {
	            if (handlers[i]) {
	                handlers[i](eventArgs.args, eventArgs.sender);
	            }
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
                    self._dispatchEvents([onSuccess], { sender: self, args: data });
                })
                .fail(function (err) {
                    if (err.status === 401) 
                        self._dispatchEvents([self.events.signinAction], { sender: self, args: err });                    
                    else
                        self._dispatchEvents([onFailure], { sender: self, args: err });                    
                });
        },
        ajax : function (method, controllerName, actionMethod, dataObj, onSuccess, onFailure) {
	    
            var token = sessionStorage.getItem(this.baseUrl + '_TOKEN');
            var headers = (token) ? [{ name: 'Authorization', value: 'Bearer ' + token }] : null;
            var url = this.baseUrl + this.controllerEndPoint + '/' + controllerName + '/' + actionMethod;

            this._ajax(method, url, headers, dataObj, onSuccess, onFailure);
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
        },
        login : function (username, password, onSuccess, onFailure) {
            var self = this;
            var loginData = {
                grant_type: 'password',
                username: username,
                password: password
            };
            $.ajax({
                type: 'POST',
                url: this.baseUrl + this.tokenEndPoint,
                data: loginData
            }).done(function (data) {
                self.username = data.userName;
                sessionStorage.setItem(self.baseUrl + '_TOKEN', data.access_token);
                self._dispatchEvents([onSuccess, self.events.authenticatedAction], { sender: self, args: data });
            }).fail(function (err) {
                self._dispatchEvents([onFailure, self.events.accessDeniedAction], { sender: self, args: err });
            });
        },
        logout: function (logoutAction) {
            sessionStorage.removeItem(this.baseUrl + '_TOKEN');
            sessionStorage.removeItem(this.baseUrl + '_PROVIDER');
            this._dispatchEvents([logoutAction, this.events.logoutAction], { sender: this, args: data });
        },
        authenticated: function () {
            var token = sessionStorage.getItem(this.baseUrl + '_TOKEN');
            return (token !== '');
        },
        populateProviders: function (onPopulateAction) {
            var self = this;
            var _redirectUri = (this.isCordova ? this.baseUrl + '/oauthcompletedummy.html' : location.protocol + '//' + location.host + '/oauthcomplete.html');
            this.get("Account", "ExternalLogins?returnUrl=" + _redirectUri, null,
                function (data) {
                    if (data.length > 0) {
                        for (var i = 0; i < data.length; i++)
                            data[i].Url = data[i].Url + "%3Fprovider=" + data[i].Name;
                        self.loginProviders = data;
                    }
                    self._dispatchEvents([onPopulateAction, self.events.providersPopulatedAction], { sender: self, args: data });
                },
                function (err) {
                    self.hasProviders = false;
                    self._dispatchEvents([onPopulateAction, self.events.providersPopulatedAction], { sender: self, args: err });
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
            sessionStorage.setItem(this.baseUrl + '_TOKEN', fragment.access_token);
            sessionStorage.setItem(this.baseUrl + '_PROVIDER', fragment.provider);

            var email = fragment.email ? fragment.email : fragment.username;
            var user = fragment.username ? fragment.username : "";
            if (user !== email) {
                this.externalRegister(email);
            }
            else {
                this._dispatchEvents([this.events.externalAuthenticatedAction], { sender: this, args: fragment });               
            }
        },
        externalRegister : function (email) {
            var self = this;
            this.ajax('POST', 'Account', 'RegisterExternal', { 'Email': email, 'Name': email },
                function (data) {
                    self._dispatchEvents([self.events.externalRegisteredAction], { sender: self, args: data });       
                },
                function (err) {
                    self._dispatchEvents([self.events.externalRegisterErrorAction], { sender: self, args: data });
                }
            );
        },
	}

	window.DX = DX;
})();