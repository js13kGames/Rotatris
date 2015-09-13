define('view/social', ['utils'], function (Utils) {
    return function () {
        Utils.loadScript('facebook-jssdk', "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4");
        Utils.loadScript('twitter-wjs', "//platform.twitter.com/widgets.js");
        Utils.loadScript('google-plusone', "https://apis.google.com/js/plusone.js");
    };
});
