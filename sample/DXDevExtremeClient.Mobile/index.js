$(function() {
    var startupView = "home";

    // Uncomment the line below to disable platform-specific look and feel and to use the Generic theme for all devices
    // DevExpress.devices.current({ platform: "generic" });

    if(DevExpress.devices.real().platform === "win8") {
        $("body").css("background-color", "#000");
    }

    $(document).on("deviceready", function () {
        navigator.splashscreen.hide();
        if (window.devextremeaddon) {
            window.devextremeaddon.setup();
        }
        $(document).on("backbutton", function () {
            DevExpress.processHardwareBackButton();
        });
    });

    function onNavigatingBack(e) {
        if(e.isHardwareButton && !DXDevExtremeClient.app.canBack()) {
            e.cancel = true;
            exitApp();
        }
    }

    function exitApp() {
        switch (DevExpress.devices.real().platform) {
            case "android":
                navigator.app.exitApp();
                break;
            case "win8":
                window.external.Notify("DevExpress.ExitApp");
                break;
        }
    }

    DXDevExtremeClient.app = new DevExpress.framework.html.HtmlApplication({
        namespace: DXDevExtremeClient,
        layoutSet: DevExpress.framework.html.layoutSets[DXDevExtremeClient.config.layoutSet],
        animationSet: DevExpress.framework.html.animationSets[DXDevExtremeClient.config.animationSet],
        navigation: DXDevExtremeClient.config.navigation,
        commandMapping: DXDevExtremeClient.config.commandMapping,
        navigateToRootViewMode: "keepHistory",
        useViewTitleAsBackText: true
    });

    $(window).unload(function() {
        DXDevExtremeClient.app.saveState();
    });

    DXDevExtremeClient.app.router.register(":view/:id", { view: startupView, id: undefined });
    DXDevExtremeClient.app.on("navigatingBack", onNavigatingBack);
    DXDevExtremeClient.app.navigate();
});