//Created by Don Wibier /DEVEXPRESS (donw@devexpress.com)
//Homepage: https://github.com/donwibier/DXDevExtremeWebAPI

/*jslint white: true, this: true, browser:true */
/*global window, location, $, DevExpress*/
(function () {
    "use strict";    

    var DX = window.DX || {};
    DX.Utils = DX.Utils || {};
    DX.Utils.version = DX.Utils.version ||
        function () {
            return "v1.0.0.9";
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
    DX.Utils.join = DX.Utils.join ||
        function (arr, separator, skipEmpty) {
            var result = '';
            if (arr && !skipEmpty) {
                result = arr.join(separator);
            }
            else {                
                arr.forEach(function (value/*, index*/) {
                    var v = (value || '');
                    if (v.toString() !== '') {
                        result += (result !== '' ? separator : '') + v.toString();
                    }
                });
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
        this.data = {};
        // private member                
        this.popupRef = null;        
    };

    DX.WebAPI.Client.prototype = {
        dispatchEvents: function (handlers, eventArgs) {
            if (handlers) {
                handlers.forEach(function (element) {
                    if (element) {
                        element(eventArgs.args, eventArgs.sender);
                    }
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
                    self.dispatchEvents([onFailure], { sender: self, args: err });                    
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
        authorizeError: function (err) {
            var self = this;
            if (err.status === 401){
                self.dispatchEvents([self.events.signinAction], { sender: self, args: err });
                return true;
            }
            else {
                return false;
            }
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
        },        
        registerDatasource: function (options) {

            if (!DevExpress || !DevExpress.data || !DevExpress.data.CustomStore) {
                return null;
            }               
            var store = new DX.WebAPI.DXStore(this, options);            
            this.data[options.apiName||options.apiController] = store;
            return store.Datasource;
        }
    };

    DX.WebAPI.DXStore = function (client, options) {

        this.client = client;
        this.options = options;
        this.controller = options.apiController || '',
        this.listAction = options.apiListAction || '';
        this.byKeyAction = options.apiByKeyAction || '';
        this.insertAction = options.apiInsertAction || '';
        this.updateAction = options.apiUpdateAction || '';
        this.removeAction = options.apiRemoveAction || '';
        
        this.options.store = new DevExpress.data.CustomStore({
            load: this.load,
            byKey: this.byKey,
            insert: this.insert,
            update: this.update,
            remove: this.remove
        });
        this.options.store.owner = this;
        this.Datasource = new DevExpress.data.DataSource(this.options);        
    };

    DX.WebAPI.DXStore.prototype = {
        load: function (options) {
            var d = $.Deferred();
            this.owner.client.get(this.owner.controller, this.owner.listAction, null,
                function (data) {
                    d.resolve(data);
                },
                function (err, sender) {
                    d.reject(err);
                    if (!sender.authorizeError(err)) {
                        sender.dispatchEvents([sender.events.datasourceError], { sender: this.owner, args: err });
                    }
                });
            return d.promise();
        },
        byKey: function (key) {
            var d = $.Deferred();
            this.owner.client.get(this.owner.controller, DX.Utils.join([this.owner.byKeyAction, encodeURIComponent(key)], '/', true), null,
                function (data) {
                    d.resolve(data);
                },
                function (err, sender) {
                    d.reject(err);
                    if (!sender.authorizeError(err)) {
                        sender.dispatchEvents([sender.events.datasourceError], { sender: this.owner, args: err });
                    }
                });
            return d.promise();
        },
        insert: function (values) {
            var d = $.Deferred();
            this.owner.client.post(this.owner.controller, this.owner.insertAction, values,
                function (data) {
                    d.resolve(data);
                },
                function (err, sender) {
                    d.reject(err);
                    if (!sender.authorizeError(err)) {
                        sender.dispatchEvents([sender.events.datasourceError], { sender: this.owner, args: err });
                    }
                });
            return d.promise();
        },
        update: function (key, values) {
            var d = $.Deferred();
            this.owner.client.put(this.owner.controller, DX.Utils.join([this.owner.updateAction, encodeURIComponent(key)], '/', true), values,
                function (data) {
                    d.resolve(data);
                },
                function (err, sender) {
                    d.reject(err);
                    if (!sender.authorizeError(err)) {
                        sender.dispatchEvents([sender.events.datasourceError], { sender: this.owner, args: err });
                    }
                });
            return d.promise();
        },
        remove: function (key) {
            var d = $.Deferred();
            this.owner.client.del(this.owner.controller, DX.Utils.join([this.owner.removeAction, encodeURIComponent(key)], '/', true), null,
                function (data) {
                    d.resolve(data);
                },
                function (err, sender) {
                    d.reject(err);
                    if (!sender.authorizeError(err)) {
                        sender.dispatchEvents([sender.events.datasourceError], { sender: this.owner, args: err });
                    }
                });
            return d.promise();
        }

    };


    window.DX = DX;
}());

