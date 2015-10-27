// NOTE object below must be a valid JSON
window.DXDevExtremeClient = $.extend(true, window.DXDevExtremeClient, {
    "config": {
        "layoutSet": "desktop",
        "animationSet": "default",
        "navigation": [
            {
                "title": "Home",
                "onExecute": "#home",
                "icon": "home"
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
