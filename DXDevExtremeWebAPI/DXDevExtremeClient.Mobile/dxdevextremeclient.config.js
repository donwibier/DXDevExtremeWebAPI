// NOTE object below must be a valid JSON
window.DXDevExtremeClient = $.extend(true, window.DXDevExtremeClient, {
    "config": {
        "layoutSet": "slideout",
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
                "title": "Register",
                "onExecute": "#Register"
            },
            {
                "title": "About",
                "onExecute": "#About",
                "icon": "info"
            }
        ]
    }
});
