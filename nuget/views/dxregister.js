REPLACE_WITH_APP_OBJECT.DXRegister = function (params) {

    var _username = ko.observable('');
    var _password = ko.observable('');
    var _passwordRetype = ko.observable('');

    var _errorPopupVisible = ko.observable(false);    
    var _errorPopupMessages = ko.observableArray();

    function clear() {
        _username('');
        _password('');
        _passwordRetype('');
    }
    function register() {
        var data = {
            Email: _username(),
            Password: _password(),
            ConfirmPassword: _passwordRetype()
        };

        db.post('Account', 'Register', data, onSuccess, onFail);
    }

    function errorPopupClose() {
        _errorPopupVisible(false);
    }

    function onSuccess(args) {
        DevExpress.ui.notify('You have been registered successfully!', 'success', 3000);
        db.owner.app.navigate('home', { root: true });
    }

    function onFail(args) {
        var err = args.error();        
        if ((err) && (err.responseJSON) && (err.responseJSON.ModelState)) {
            var errMsgs = err.responseJSON.ModelState[''];
            _errorPopupMessages(errMsgs);
            _errorPopupVisible(true);
        }
        else {
            DevExpress.ui.notify('Registration failed!', 'error', 3000);
        }
        
    }

    var viewModel = {
        username: _username,
        password: _password,
        passwordRetype: _passwordRetype,
        registerClick: register,
        viewShown: clear,
        popupVisible: _errorPopupVisible,
        registrationErrors: _errorPopupMessages,
        hidePopupClick: errorPopupClose,
        popupWidth: function() { return $(window).width() * 0.6 }
    };

    return viewModel;
};
