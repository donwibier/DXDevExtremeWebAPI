DXDevExtremeClient.Signin = function (params) {

    var app = DXDevExtremeClient;
    var db = app.db;
    var _username = ko.observable('');
    var _password = ko.observable('');
    
    var _noProvidersText = ko.observable("Fetching external login providers..");
    var _loginProviders = ko.observableArray();
    var _hasProviders = ko.observable(false);
    
    var _redirectUri = location.protocol + '//' + location.host + '/oauthcomplete.html';
    
    app.db.get("Account", "ExternalLogins?returnUrl=" + _redirectUri, null,
        function (data) {
            debugger;
            if (data.length > 0) {            
                for (var i = 0; i < data.length; i++)
                    data[i].Url = data[i].Url + "%3Fprovider=" + data[i].Name; 
                _loginProviders(data);
            }
        },
        function (data) {
            _hasProviders(false);
        });


    function updateProviders() {
        var hasProviders = (arguments.length > 0) ? arguments[0] : _hasProviders();
        if (!hasProviders) {
            _noProvidersText("No external login-providers configured");
        }        
    }

    function clear() {
        _username('');
        _password('');
    }

    function viewShown() {
        clear();        
        updateProviders();
    }
    
    /*function viewHidden() {
        
    }*/

    function register() {
        app.navigate("Register");
    }

    function login(args) {
        app.db.login(_username(), _password(), onSuccess, onFail)
    }

    function prepLoginProviderUrl(url) {        
        var result = app.db._baseUrl + url;    
        return result;
    }

    function externalLogin(args) {
        app.db.externalLogin(args.model.Name, args.model.Url);
    }

    function onSuccess(data) {
        DevExpress.ui.notify('You have been logged in successfully!', 'success', 3000);
        app.navigate('Home', { root: true });
    }

    function onExternalSuccess(data) {
        DevExpress.ui.notify('You have been logged in successfully!', 'success', 3000);
        app.navigate('Home', { root: true });
    }

    function onFail(data) {
        DevExpress.ui.notify('Validation failed', 'error', 3000);
    }


    var viewModel = {
        viewShown: viewShown,
        /*viewHidden: viewHidden,*/
        hasProviders: _hasProviders,
        loginProviders: _loginProviders,
        noProvidersText: _noProvidersText,
        username: _username,
        password: _password,
        registerClick: register,
        loginClick: login,
        externalLoginClick: externalLogin
    };
    return viewModel;
};