using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.Google;
using Microsoft.Owin.Security.OAuth;
using Owin;
using WebAPIServer.Providers;
using WebAPIServer.Models;

namespace WebAPIServer
{
    public partial class Startup
    {
        public static OAuthAuthorizationServerOptions OAuthOptions { get; private set; }
        //added
        public const string MicrosoftClientID = "";
        public const string MicrosoftSecret = "";

        public const string FacebookAppID = "1430818973893850";
        public const string FacebookSecret = "7342ab8e4669dd12d81bc1196b9cceaa";

        public const string TwitterKey = "ujBJf6SlNxvE7PDQPOHu62uo1";
        public const string TwitterSecret = "JA2WRDxQvpAzUfvrQlerBX3xpBPxQ8tChRBsD1jwxNTTgmvxQI";

        public const string GoogleClientID = "";
        public const string GoogleSecret = "";
        //==

        public static string PublicClientId { get; private set; }

        // For more information on configuring authentication, please visit http://go.microsoft.com/fwlink/?LinkId=301864
        public void ConfigureAuth(IAppBuilder app)
        {
            // Configure the db context and user manager to use a single instance per request
            app.CreatePerOwinContext(ApplicationDbContext.Create);
            app.CreatePerOwinContext<ApplicationUserManager>(ApplicationUserManager.Create);

            // Enable the application to use a cookie to store information for the signed in user
            // and to use a cookie to temporarily store information about a user logging in with a third party login provider
            app.UseCookieAuthentication(new CookieAuthenticationOptions());
            app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

            // Configure the application for OAuth based flow
            PublicClientId = "self";
            OAuthOptions = new OAuthAuthorizationServerOptions
            {
                TokenEndpointPath = new PathString("/Token"),
                Provider = new ApplicationOAuthProvider(PublicClientId),
                AuthorizeEndpointPath = new PathString("/api/Account/ExternalLogin"),
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(14),
                // In production mode set AllowInsecureHttp = false
                AllowInsecureHttp = true
            };

            // Enable the application to use bearer tokens to authenticate users
            app.UseOAuthBearerTokens(OAuthOptions);

            // Uncomment the following lines to enable logging in with third party login providers
            if (!String.IsNullOrEmpty(MicrosoftClientID) && !String.IsNullOrEmpty(MicrosoftSecret))
                app.UseMicrosoftAccountAuthentication(clientId: MicrosoftClientID, clientSecret: MicrosoftSecret);

            if (!String.IsNullOrEmpty(TwitterSecret) && !String.IsNullOrEmpty(TwitterSecret))
                app.UseTwitterAuthentication(consumerKey: TwitterKey,consumerSecret: TwitterSecret);

            if (!String.IsNullOrEmpty(FacebookAppID) && !String.IsNullOrEmpty(FacebookSecret))
                app.UseFacebookAuthentication(appId: FacebookAppID,appSecret: FacebookSecret);

            if (!String.IsNullOrEmpty(GoogleClientID) && !String.IsNullOrEmpty(GoogleSecret))
            {
                app.UseGoogleAuthentication(new GoogleOAuth2AuthenticationOptions()
                {
                    ClientId = GoogleClientID,
                    ClientSecret = GoogleSecret
                });
            }
        }
    }
}
