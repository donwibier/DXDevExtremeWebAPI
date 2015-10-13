window.auth = (function () {
    var auth = {};

    auth.getInfo = function getInfo() {
        var parts = window.location.href.split(/[?#&]/);
        var result = {};
        if (parts.length > 1) {
            for (var i = 1; i < parts.length; i++) {
                var pair = parts[i].split("=", 2);
                var key = decodeURIComponent(pair[0]);                
                var val = (pair.length > 1) ? decodeURIComponent(pair[1]) : "";
                result[key] = val;
            }
        }
        return result;
    };

    return auth;
})();

var fragment = auth.getInfo();
window.location.hash = fragment.state || '';
if ((window.opener) && (window.opener.db) && (window.opener.db.externalLoginCallback)) {
    window.opener.db.externalLoginCallback(fragment);
}
window.close();
