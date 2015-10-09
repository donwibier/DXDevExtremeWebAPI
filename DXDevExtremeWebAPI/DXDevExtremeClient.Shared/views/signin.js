DXDevExtremeClient.Signin = function (params) {
    
    var db = DXDevExtremeClient.db;
    var _username = ko.observable('');
    var _password = ko.observable('');
    
    var _noProvidersText = ko.observable("Fetching external login providers..");
    var _loginProviders = ko.observableArray();
    var _hasProviders = ko.observable(false);
    
    //var _redirectUri = location.protocol + '//' + location.host + '/index.html';
    
    db.get("Account", "ExternalLogins?returnUrl=/"/* + encodeURIComponent(window.location)*/, null,
        function (data) {
            _hasProviders(data.length > 0);
            if (_hasProviders) {
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
        DXDevExtremeClient.app.navigate("Register");
    }

    function login(args) {
        DXDevExtremeClient.db.login(_username(), _password(), onSuccess, onFail)
    }

    function prepLoginProviderUrl(url) {        
        var result = db._baseUrl + url;    
        return result;
    }
    //function externalLogin(args) {
    //    DXDevExtremeClient.db.externalLogin(args.model.Url, args.model.Name, onExternalSuccess, onFail);
    //}

    function onSuccess(data) {
        DevExpress.ui.notify('You have been logged in successfully!', 'success', 3000);
        DXDevExtremeClient.app.navigate('Home', { root: true });
    }

    function onExternalSuccess(data) {
        DevExpress.ui.notify('You have been logged in successfully!', 'success', 3000);
        DXDevExtremeClient.app.navigate('Home', { root: true });
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
        /*externalLoginClick: externalLogin,*/
        boxOptions: {
            screenByWidth: function(width) {
                if( width < 768 )
                    return 'xs';
                if( width < 992 )
                    return 'sm';
                if( width < 1200 )
                    return 'md';
                return 'lg';
            },
            singleColumnScreen: 'xs sm'
        },
        prepLoginProviderUrl: prepLoginProviderUrl
    };
    return viewModel;
};