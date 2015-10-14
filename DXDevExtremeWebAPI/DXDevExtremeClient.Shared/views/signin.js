DXDevExtremeClient.Signin = function (params) {

    var app = DXDevExtremeClient;
    var db = app.db;
    var _username = ko.observable('');
    var _password = ko.observable('');
    
    var _noProvidersText = ko.observable("Fetching external login providers..");

    function updateProviders() {
        if (!db.hasProviders) {
            _noProvidersText("No external login-providers configured");
        }        
    }

    function clear() {
        _username('');
        _password('');
    }


    function register() {
        app.navigate("Register");
    }

    function login(args) {
        db.login(_username(), _password(), onSuccess, onFail)
    }

    function prepLoginProviderUrl(url) {        
        var result = db._baseUrl + url;    
        return result;
    }

    function externalLogin(args) {
        db.externalLogin(args.model.Name, args.model.Url);
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
        viewShown: function () {
            clear();
            updateProviders();
        },
        //viewHidden: function () { },
        hasProviders: db.hasProviders,
        loginProviders: db.loginProviders,
        noProvidersText: _noProvidersText,
        username: _username,
        password: _password,
        registerClick: register,
        loginClick: login,
        externalLoginClick: externalLogin
    };
    return viewModel;
};