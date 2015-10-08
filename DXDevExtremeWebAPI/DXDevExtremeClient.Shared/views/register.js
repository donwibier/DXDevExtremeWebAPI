DXDevExtremeClient.Register = function (params) {

    var _username = ko.observable('');
    var _password = ko.observable('');
    var _passwordRetype = ko.observable('');

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

        DXDevExtremeClient.db.post('Account', 'Register', data, onSuccess, onFail);
    }

    function onSuccess(data) {
        DevExpress.ui.notify('You have been registered successfully!', 'success', 3000);
        DXDevExtremeClient.app.navigate('Home', { root: true });
    }

    function onFail(data) {
        DevExpress.ui.notify('Unable to register !', 'error', 3000);
    }

    var viewModel = {
        username: _username,
        password: _password,
        passwordRetype: _passwordRetype,
        registerClick: register,
        viewShown: clear
    };

    return viewModel;
};