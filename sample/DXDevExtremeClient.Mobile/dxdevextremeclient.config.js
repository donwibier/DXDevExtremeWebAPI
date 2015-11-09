// NOTE object below must be a valid JSON
window.DXDevExtremeClient = $.extend(true, window.DXDevExtremeClient, {
    "config": {
        "layoutSet": "slideout",
        "animationSet": "default",
        "navigation": [
             {
                 "title": "Home",
                 "onExecute": "#home",
                 "icon": "home"
             },
             {
                 "title": "Films",
                 "onExecute": "#films"
             },
            {
                "title": "Values",
                "onExecute": "#Values"
            },
            {
                "title": "About",
                "onExecute": "#About",
                "icon": "info"
            }
        ]
    }
});
