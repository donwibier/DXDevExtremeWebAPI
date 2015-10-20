(function () {
    "use strict";
    /* returns a dictionary with all url querystring and hash parts */
    window.getUrlParts = function (url) {
        var parts = url.split(/[?#&]/);
        var result = {};
        result["url"] = parts[0];

        if (parts.length > 1) {
            for (var i = 1; i < parts.length; i++) {
                var pair = parts[i].split("=", 2);
                var key = decodeURIComponent(pair[0]);
                var val = (pair.length > 1) ? decodeURIComponent(pair[1]) : "";
                result[key] = val;
            }
        }
        return result;
    }
})();