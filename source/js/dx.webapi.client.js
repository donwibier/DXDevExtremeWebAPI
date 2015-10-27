//Created by Don Wibier /DEVEXPRESS (donw@devexpress.com)
//Homepage: https://github.com/donwibier/DXDevExtremeWebAPI

/*jslint white: true, this: true, browser:true */
/*global window, location, $ */
(function () {
    "use strict";    

    var DX = window.DX || {};
    DX.Utils = DX.Utils || {};
    DX.Utils.version = DX.Utils.version ||
        function () {
            return "v1.0.0.5";
        };
    DX.Utils.getUrlParts = DX.Utils.getUrlParts ||
        function (url) {
            var parts= url.split(/[?#&]/),
                result = {url : parts[0]};

            parts.forEach(function (value, index) {
                if (index > 0) {
                    var pair = value.split("=", 2),
                        key = decodeURIComponent(pair[0]),
                        val = (pair.length > 1) ? decodeURIComponent(pair[1]) : "";
                    result[key] = val;
                }
            });
            return result;
        };
    DX.Utils.removeTrailingSlash = DX.Utils.removeTrailingSlash ||
        function (url) {
            var parts,
                result = "";
            if (url) {
                parts = url.split(/([?#])/);
                parts[0] = (parts[0][parts[0].length - 1] === '/') ? parts[0].substr(0, parts[0].length - 1) : parts[0];
                result = parts.join("");
            }
            return result;
        };
    
    DX.WebAPI = DX.WebAPI || {};
    DX.WebAPI.Client = function (serviceUrl, actionEvents) {

        this.baseUrl = DX.Utils.removeTrailingSlash(serviceUrl);
        this.events = actionEvents || {};
        this.controllerEndPoint = '/api';
        this.tokenEndPoint = '/Token';
        this.username = '';
        this.loginProviders = [];
        this.hasProviders = false;
        this.persistToken = false;
        // private member                
        this.popupRef = null;        
    };

    DX.WebAPI.Client.prototype = {
        dispatchEvents: function (handlers, eventArgs) {
            if (handlers) {
                handlers.forEach(function (element) {
                    element(eventArgs.args, eventArgs.sender);
                });
            }
        },
        coreAjax: function (method, url, headers, dataObj, onSuccess, onFailure) {
            var self = this,
                ajaxObj = {
                    method: method,
                    url: url,
                    contentType: 'application/json; charset=utf-8',
                    xhrFields: { withCredentials: true },
                    beforeSend: function (xhr) {
                        if (headers) {
                            $.each(headers, function (index) { xhr.setRequestHeader(headers[index].name, headers[index].value); });
                        }
                    }
                };
            if (dataObj) {
                ajaxObj = $.extend(ajaxObj, { data: JSON.stringify(dataObj) });
            }

            $.ajax(ajaxObj)
                .done(function (data) {
                    self.dispatchEvents([onSuccess], { sender: self, args: data });
                })
                .fail(function (err) {
                    self.dispatchEvents((err.status === 401 ? [self.events.signinAction] : [onFailure]), { sender: self, args: err });
                });
        },
        ajax: function (method, controllerName, actionMethod, dataObj, onSuccess, onFailure) {
            var token = window[(this.persistToken?'local':'session') + 'Storage'].getItem(this.baseUrl + '_TOKEN'),
                headers = (token) ? [{ name: 'Authorization', value: 'Bearer ' + token }] : null,
                url = this.baseUrl + this.controllerEndPoint + '/' + controllerName + '/' + actionMethod;

            this.coreAjax(method, url, headers, dataObj, onSuccess, onFailure);
        },
        post: function (controllerName, actionMethod, dataObj, onSuccess, onFailure) {
            this.ajax('POST', controllerName, actionMethod, dataObj, onSuccess, onFailure);
        },
        get: function (controllerName, actionMethod, dataObj, onSuccess, onFailure) {
            this.ajax('GET', controllerName, actionMethod, dataObj, onSuccess, onFailure);
        },
        put: function (controllerName, actionMethod, dataObj, onSuccess, onFailure) {
            this.ajax('PUT', controllerName, actionMethod, dataObj, onSuccess, onFailure);
        },
        del: function (controllerName, actionMethod, dataObj, onSuccess, onFailure) {
            this.ajax('DELETE', controllerName, actionMethod, dataObj, onSuccess, onFailure);
        },
        login: function (username, password, onSuccess, onFailure) {
            var self = this,
                loginData = {
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
                window[(this.persistToken ? 'local' : 'session') + 'Storage'].setItem(self.baseUrl + '_TOKEN', data.access_token);
                self.dispatchEvents([onSuccess, self.events.authenticatedAction], { sender: self, args: data });
            }).fail(function (err) {
                self.dispatchEvents([onFailure, self.events.accessDeniedAction], { sender: self, args: err });
            });
        },
        logout: function (logoutAction) {
            window[(this.persistToken ? 'local' : 'session') + 'Storage'].removeItem(this.baseUrl + '_TOKEN');
            window[(this.persistToken ? 'local' : 'session') + 'Storage'].removeItem(this.baseUrl + '_PROVIDER');
            this.dispatchEvents([logoutAction, this.events.logoutAction], { sender: this, args: null });
        },
        authenticated: function () {
            var token = window[(this.persistToken ? 'local' : 'session') + 'Storage'].getItem(this.baseUrl + '_TOKEN');
            return (token !== '');
        },
        populateProviders: function (onPopulateAction) {
            var self = this,
                isCordova = !!window.cordova,
                redirectUri = isCordova ? this.baseUrl + '/oauthcompletedummy.html' : location.protocol + '//' + location.host + '/oauthcomplete.html';
            this.get("Account", "ExternalLogins?returnUrl=" + redirectUri, null,
                function (data) {
                    if (data.length > 0) {
                        $.each(data, function (index) {
                            data[index].Url = data[index].Url + "%3Fprovider=" + data[index].Name;
                        });
                        self.loginProviders = data;
                    }
                    self.dispatchEvents([onPopulateAction, self.events.providersPopulatedAction], { sender: self, args: data });
                },
                function (err) {
                    self.hasProviders = false;
                    self.dispatchEvents([onPopulateAction, self.events.providersPopulatedAction], { sender: self, args: err });
                });
        },
        externalLogin: function (provider, url) {
            var self = this,
                isCordova = !!window.cordova;
            if (isCordova) {
                this.popupRef = window.open(this.baseUrl + url, '_blank', 'location=no');
                this.popupRef.addEventListener('loadstop', self.externalLoginCordovaLoadStopEvent);
            }
            else {
                this.popupRef = window.open(this.baseUrl + url, "Authenticate " + provider + " Account", "location=0,status=0,width=600,height=750");
            }
        },
        externalLoginCordovaLoadStopEvent: function (event) {
            var self = this,
                testUrl = self.baseUrl + '/oauthcomplete.html',
                cburl = (event.url);
            if (cburl.indexOf(testUrl) === 0) {
                var fragments = DX.Utils.getUrlParts(cburl);
                self.externalLoginCallback(fragments);
                self.popupRef.removeEventListener('loadstop', self.externalLoginCordovaLoadStopEvent);
                self.popupRef.close();
            }
        },
        externalLoginCallback: function (fragment) {
            var email = fragment.email || fragment.username,
                user = fragment.username || "";
            window[(this.persistToken ? 'local' : 'session') + 'Storage'].setItem(this.baseUrl + '_TOKEN', fragment.access_token);
            window[(this.persistToken ? 'local' : 'session') + 'Storage'].setItem(this.baseUrl + '_PROVIDER', fragment.provider);

            if (user !== email) {
                this.externalRegister(email);
            }
            else {
                this.dispatchEvents([this.events.externalAuthenticatedAction], { sender: this, args: fragment });
            }
        },
        externalRegister: function (email) {
            var self = this;
            this.ajax('POST', 'Account', 'RegisterExternal', { Email: email, Name: email },
                function (data) {
                    self.dispatchEvents([self.events.externalRegisteredAction], { sender: self, args: data });
                },
                function (err) {
                    self.dispatchEvents([self.events.externalRegisterErrorAction], { sender: self, args: err });
                }
            );
        }
    };

    window.DX = DX;
}());

