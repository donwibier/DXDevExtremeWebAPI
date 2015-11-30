DX JavaScript WebAPI Client
Author: Don Wibier /DEVEXPRESS 
https://github.com/donwibier/DXDevExtremeWebAPI

NOTES:
Though I have created and tested this in a DevExtreme application, it doesn't have dependencies
on DevExtreme, and can be used with other frameworks as well.

!! This project is not related with the productline of DevExpress !!
!! Issues and questions should be posted on the GitHub repo and not be sent to DevExpress support!!

Purpose:
This package contains the JavaScript DX.WebAPI.Client which allows you to call
WebAPI Action methods decorated with the [Authorize] attribute.

The class has all functionality built in to exchange the username / password for a bearer token,
and also implements the functionality to get the configured external login providers like Facebook,
Twitter etc. and get an authorization token from those parties, and exchange this token for protected 
WebAPI calls.

This will also work with Cordova based apps, by using the InAppBrowser Cordova plugin!

Usage:
Initialize the WebAPI client like:

    var client = new DX.WebAPI.Client(serviceRootUrl, globalEventsObj);

serviceRootUrl:
    The root location of your WebAPI service (Don't specify the /api/ )

globalEventsObject:
    An object which has events configured (specific to the application) which will be fired when 
    global states for authorization change.

Example:

	Include in your index.html:

	<!-- Place under:
	<script type="text/javascript" src="js/dx.all.js"></script>
	-->
    <script type="text/javascript" src="js/dx.webapi.client.js"></script>

	<!-- Add the default Signin, Register and ConfirmExternal views -->
    <link rel="dx-template" type="text/html" href="views/dxsignin.dxview" />
    <script type="text/javascript" src="views/dxsignin.js"></script>

    <link rel="dx-template" type="text/html" href="views/dxregister.dxview" />
    <script type="text/javascript" src="views/dxregister.js"></script>

    <link rel="dx-template" type="text/html" href="views/dxconfirmexternal.dxview" />
    <script type="text/javascript" src="views/dxconfirmexternal.js"></script>

	Include in your startup javascript code (index.js or data/db.js)

	 function createWebAPIClient(applicationObj, serviceUrl) {
		var actionEvents = {
			signinAction: function (args, sender) {
				applicationObj.app.navigate('DXSignin', { root: true });
				DevExpress.ui.notify('The server requires you to login', 'error', 3000);
			},
			authenticatedAction: function (args, sender) {
				DevExpress.ui.notify('You have been logged in successfully!', 'success', 3000);
			},
			externalAuthenticatedAction: function (args, sender) {
				DevExpress.ui.notify('You have been logged in successfully!', 'success', 3000);
				applicationObj.app.navigate('home', { root: true });
			},
			externalRegisteredAction: function (args, sender) {
				DevExpress.ui.notify('Your external account has been registered!', 'success', 3000);
			},
			externalRegisterErrorAction: function (args, sender) {
				DevExpress.ui.notify('Registration failed', 'error', 3000);
			},
			providersPopulatedAction: function (args, sender) {
				sender.loginProviders = ko.observableArray(sender.loginProviders);
				sender.hasProviders = ko.observable(args.length > 0);
			},
			logoutAction: function (args, sender) {
				applicationObj.app.navigate('home', { root: true });
			}
		};

		var result = new DX.WebAPI.Client(serviceUrl, actionEvents);
		result.owner = applicationObj;
		/* Fetch the login providers from server and set correct redirectUrl */
		result.populateProviders();
		return result;
	}

	window.db = createWebAPIClient(REPLACE_WITH_APP_OBJECT, 'http://mywebapiservice.com');
	//==
	// for multichannel project
	// window.db = new DX.WebAPI.Client(serviceConfig.db.url, actionEvents);    


The DX.WebAPI.Client exposes the folowing properties:

    baseUrl (string)
        The location of your WebAPI Service
	    
    controllerEndPoint (string = '/api') 
        The controller prefix path

    tokenEndPoint (string '/Token')
        The endpoint for the Bearer token exchange

    username (string)
        The authenticated user

    loginProviders (array)
        The configured external authentication providers on the WebAPI server

    hasProviders (boolean)
        Returns wether there are external authentication providers configured

The DX.WebAPI.Client exposes the following methods:

    ajax(method, controllerName, actionMethod, dataObj, onSuccess, onFailure) 
    post(controllerName, actionMethod, dataObj, onSuccess, onFailure) 
    get(controllerName, actionMethod, dataObj, onSuccess, onFailure) 
    put(controllerName, actionMethod, dataObj, onSuccess, onFailure) 
    del(controllerName, actionMethod, dataObj, onSuccess, onFailure) 

    login(username, password, onSuccess, onFailure) 
    logout(logoutAction) 
    authenticated() 

    populateProviders: function(onPopulateAction)
    externalLogin(provider, url) 
    externalRegister(email) 

The onSuccess parameter: 
    function(args, sender){ /* your code */ }
The onFailure parameter: 
    function(args, sender){ /* your code */ }

External Authentication note:
If you want to get e.g. Facebook login to work, configure the app on https://developer.facebook.com
Insert the AppID and App Secret in the WebAPI/App_Start/Startup.Auth.cs

!!Important for Cordova!!
Place an empty html file in the root of your WebAPI project:
    oauthcompletedummy.html