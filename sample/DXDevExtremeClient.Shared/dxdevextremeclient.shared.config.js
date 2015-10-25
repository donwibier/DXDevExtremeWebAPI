// NOTE object below must be a valid JSON
window.DXDevExtremeClient = $.extend(true, window.DXDevExtremeClient, {
    "config": {
        "endpoints": {
            "db": {
                "local": "http://localhost:5806",
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
