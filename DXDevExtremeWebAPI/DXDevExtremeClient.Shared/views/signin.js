DXDevExtremeClient.Signin = function (params) {
    
    var db = DXDevExtremeClient.db;
    var _username = ko.observable('');
    var _password = ko.observable('');
    var _externalLogins = db.externalLogins;
    var _hasExternalLogins = db.hasExternalLogins;
    var _noProvidersText = ko.observable("Fetching external login providers..");
    var _externalProviderSubscription = null;

    function updateProviders() {
        var hasProviders = (arguments.length > 0) ? arguments[0] : _hasExternalLogins();
        if (!hasProviders){
            _noProvidersText("No external login-providers configured");
        }        
    }

    function clear() {
        _username('');
        _password('');
    }

    function viewShown() {
        clear();
        _externalProviderSubscription = db.hasExternalLogins.subscribe(updateProviders);
        updateProviders();
    }
    
    function viewHidden() {
        _externalProviderSubscription.dispose();
    }

    function register() {
        DXDevExtremeClient.app.navigate("Register");
    }

    function login(args) {
        DXDevExtremeClient.db.login(_username(), _password(), onSuccess, onFail)
    }

    function externalLogin(args) {
        DXDevExtremeClient.db.externalLogin(args.model.Url, args.model.Name, onExternalSuccess, onFail);
    }

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
        viewHidden: viewHidden,
        hasExternalLogins: _hasExternalLogins,
        externalLogins: _externalLogins,
        noProvidersText: _noProvidersText,
        username: _username,
        password: _password,
        registerClick: register,
        loginClick: login,
        externalLoginClick: externalLogin,
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
            singleColumnScreen: 'xs sm',
            rows: [
                { ratio: 1 },                
                { ratio: 2, screen: 'xs sm' }                
            ],
            cols: [
                { ratio: 2 },
                { ratio: 2, screen: 'md lg' }                
            ]
        }
    };
    return viewModel;
};