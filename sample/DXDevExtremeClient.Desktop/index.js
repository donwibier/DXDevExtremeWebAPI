$(function() {
    var startupView = "home";
    DevExpress.devices.current("desktop");

    DXDevExtremeClient.app = new DevExpress.framework.html.HtmlApplication({
        namespace: DXDevExtremeClient,
        layoutSet: DevExpress.framework.html.layoutSets[DXDevExtremeClient.config.layoutSet],
        animationSet: DevExpress.framework.html.animationSets[DXDevExtremeClient.config.animationSet],
        mode: "webSite",
        navigation: DXDevExtremeClient.config.navigation,
        commandMapping: DXDevExtremeClient.config.commandMapping,
        navigateToRootViewMode: "keepHistory",
        useViewTitleAsBackText: true
    });

    $(window).unload(function() {
        DXDevExtremeClient.app.saveState();
    });

    DXDevExtremeClient.app.router.register(":view/:id", { view: startupView, id: undefined });
    DXDevExtremeClient.app.navigate();    
});