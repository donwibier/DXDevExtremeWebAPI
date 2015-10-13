DXDevExtremeClient.Confirmexternal = function (params) {

    var _email = ko.observable('');

    function clear(){
        _email('');
    }

    function confirm() {
        var data = {
            Email: _email()            
        };

        DXDevExtremeClient.db.post('Account', 'RegisterExternal', data, onSuccess, onFail);
    }

    function onSuccess(data) {
        debugger;


        DevExpress.ui.notify('You have been registered successfully!', 'success', 3000);
        DXDevExtremeClient.app.navigate('Home', { root: true });

    }

    function onFail(data){
        DevExpress.ui.notify('Unable to register !', 'error', 3000);
    }

    var viewModel = {
        viewShown: function() {
            clear();
        },
        email: _email,
        confirmClick: confirm
    };

    return viewModel;
};