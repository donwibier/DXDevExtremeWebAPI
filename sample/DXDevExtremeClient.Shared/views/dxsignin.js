REPLACE_WITH_APP_OBJECT.DXSignin = function (params) {

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
        db.owner.app.navigate("DXRegister");
    }

    function login(args) {
        db.login(_username(), _password(),
            function (data) {
                db.owner.app.back();
            }, 
            function (err) {
                DevExpress.ui.notify('Username and / or password incorrect', 'error', 3000);
            });
    }

    function externalLogin(args) {
        db.externalLogin(args.model.Name, args.model.Url);
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