var fragment = DX.Utils.getUrlParts(window.location.href);
window.location.hash = fragment.state || '';
if ((window.opener) && (window.opener.db) && (window.opener.db.externalLoginCallback)) {
    window.opener.db.externalLoginCallback(fragment);
}
window.close();
