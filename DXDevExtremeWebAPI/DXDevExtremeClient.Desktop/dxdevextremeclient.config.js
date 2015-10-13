// NOTE object below must be a valid JSON
window.DXDevExtremeClient = $.extend(true, window.DXDevExtremeClient, {
    "config": {
        "layoutSet": "desktop",
        "animationSet": "default",
        "navigation": [
            {
                "title": "Home",
                "onExecute": "#Home",
                "icon": "home"
            },
            {
                "title": "Values",
                "onExecute": "#Values"
            },
            {
                "title": "Signin",
                "onExecute": "#Signin"
            },
            {
                "title": "About",
                "onExecute": "#About",
                "icon": "info"
            }

        ]
    }
});
