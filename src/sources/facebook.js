var Tptr = Tptr || {};
Tptr.sources = Tptr.sources || {};
Tptr.sources.facebook = new Tptr.TapatarSource({
  id: 'facebook',
  title: 'Facebook',
  action: {
    content: 'Get',
    onClick: function(evt) {
      var self = this;

      if (self.imageLoaded) {
        self.pick();

        return;
      }

      if (self.fbStatus === 'connected') {
          getPicture(true);
      } else {
          FB.login(function(){
            getPicture(true);
          });
      }

      function getPicture(set) {
        FB.api('/me/picture?type=large', function(response) {
          self.downloadImage(response.data.url, function(dataUri){
              if (dataUri) {
                self.setImageData(dataUri, set);
                self.imageLoaded = true
              } else {
                try {
                  self.delegate.options.sources.facebook.enabled = false;
                } catch(err) {}
              }
          })
        });
      }
    }
  },
  onAdd: function() {
    var self = this;
    if (!self.delegate.options.sources.facebook.appId) {
        self.delegate.options.sources.facebook.enabled = false;
        return;
    }

    window.fbAsyncInit = function() {
      FB.init({
        appId      : self.delegate.options.sources.facebook.appId,
        xfbml      : true,
        version    : 'v2.3'
      });

      FB.getLoginStatus(function(response) {
        self.fbStatus = response.status;

        // if (self.fbStatus === 'connected') {
        //   getPicture();
        // }
      });
    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  },
});
