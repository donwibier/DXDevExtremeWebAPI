REPLACE_WITH_APP_OBJECT.DXConfirmexternal = function (params) {
        
    var _email = ko.observable('');

    function clear() {
        _email('');
    }

    function confirm() {
        db.externalRegister(_email());
    }

    var viewModel = {
        viewShown: function () {
            clear();
        },
        email: _email,
        confirmClick: confirm
    };

    return viewModel;
};