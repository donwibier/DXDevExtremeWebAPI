// NOTE object below must be a valid JSON
window.DXDevExtremeClient = $.extend(true, window.DXDevExtremeClient, {
    "config": {
        "endpoints": {
            "db": {
                "local": "http://dxdonwebapi.azurewebsites.net/",
                "production": "http://dxdonwebapi.azurewebsites.net"
            }
        },
        "services": {
            "db": {
                "entities": {
                }
            }
        }
    }
});
