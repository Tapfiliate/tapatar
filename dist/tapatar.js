/**
  * Tapatar - 1.0.2
  * Copyright © 2015 Tapfiliate B.V.
  * Licensed under the MIT license.
  * https://tapfiliate.com/open-source/tapatar/
  */
;;(function ($, window, document, undefined) {
    "use strict";

    window.Tptr = window.Tptr || {};

    // Tapatar Source
    var sourceDefaults = {
        id: 'unknown',
        title: 'Unknown',
        icon: function() {
            var fileName = (this.id !== 'unknown') ? this.id + '.svg' : 'source.svg';

            return this.delegate.options.image_url_prefix + fileName;
        },
        image_data: null,
        delegate: null
    };

    function TapatarSource(options) {
        this.options = $.extend({}, sourceDefaults, options);
        $.extend(this, this.options);
    }

    TapatarSource.prototype.setImageData = function(data, pick) {
        this.image_data = data;
        this.delegate.imageDataSet(this, pick);
    };

    TapatarSource.prototype.pick = function() {
        this.delegate.pickSource(this);
    };

    TapatarSource.prototype.getInstance = function() {
        return $.extend(true, {}, this);
    };

    TapatarSource.prototype.downloadImage = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function(e) {
          if (this.status == 200) {
            var uInt8Array = new Uint8Array(this.response);
            var i = uInt8Array.length;
            var binaryString = new Array(i);
            while (i--)
            {
              binaryString[i] = String.fromCharCode(uInt8Array[i]);
            }
            var data = binaryString.join('');
            var base64 = window.btoa(data);
            callback("data:image/png;base64,"+base64, 'success');
          } else {
            callback(null, 'error', this.status);
          }
        };
        
        xhr.onerror = xhr.onabort = function(e) {
            callback(null, 'error', e.error);
        };

        xhr.send();
    }

    Tptr.TapatarSource = TapatarSource;
})(jQuery, window, document);
;var Tptr = Tptr || {};
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
;var Tptr = Tptr || {};
Tptr.sources = Tptr.sources || {};
Tptr.sources.gravatar = new Tptr.TapatarSource({
  id: 'gravatar',
  title: 'Gravatar',
  action: {
    content: 'Pick',
    onClick: function(evt) {
        if (this.image_data) {
          this.setImageData(this.image_data, true);
        }
    }
  },
  onAdd: function() {
    var MD5=function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()};

    var size = size || 200;

    try {
      var email = this.delegate.options.sources.gravatar.email;

      if (!email) {
        throw 'no email';
      }
    } catch(err) {
      try {
        this.delegate.options.sources.gravatar.enabled = false;
      } catch(err) {}

      return;
    }

    // Hardcode the secure base url, because that's just how we roll..
    var url = 'https://secure.gravatar.com/avatar/' + MD5(email) + '.jpg?s=' + size + '&d=404';
    var self = this;
    this.downloadImage(url, function(dataUri){
        if (dataUri) {
          self.setImageData(dataUri);
        } else {
          try {
            self.delegate.options.sources.gravatar.enabled = false;
          } catch(err) {}
        }
    })
  },
});
;var Tptr = Tptr || {};
Tptr.sources = Tptr.sources || {};
Tptr.sources.local = new Tptr.TapatarSource({
  id: 'local',
  title: 'local',
  action: {
    content: 'Browse',
    onClick: function(evt) {
        this.fileInput.click();
    }
  },
  onAdd: function() {
    var self = this;
    this.fileInput = $('<input type="file" style="display:none;" accept=".png,.jpeg,.jpg,.gif">');
    function handleFileSelect(evt) {
      var files = evt.target.files;

      for (var i = 0, f; f = files[i]; i++) {

        // Only process image files.
        if (!f.type.match('image.*')) {
          continue;
        }

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            self.setImageData(e.target.result, true);
          };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
      }
    }

    self.fileInput.on('change', handleFileSelect);
  },
});
;;(function ($, window, document, undefined ) {
    "use strict";

    window.Tptr = window.Tptr || {};

    var pluginName = "tapatar",
        defaults = {
            sources: {
                local: {enabled: true, order: 1},
                facebook: {enabled: true, order: 2},
                gravatar: {enabled: true, order: 3}
            },
            image_url_prefix: 'img/',
            default_image: function() {
                return this.image_url_prefix + 'default.svg';
            },
            templates: {
                widget: '<div class="tptr-widget"><span class="tptr-widget-pick">pick</span></div>',
                overlay: '<div class="tptr-container" style="display: none"><div class="tptr-overlay"></div></div>',
                picker: '<div class="tptr-picker"><div class="tptr-close"></div><div class="tptr-image-holder tptr-box-part"><div class="tptr-big-image"> </div></div><div class="tptr-sources-holder tptr-box-part"><div class="tptr-sources"></div><button class="tptr-save">Save</button></div></div>',
                source: '<div class="tptr-source"><div class="tptr-source-part tptr-source-icon"><img /></div><div class="tptr-source-part tptr-source-content"></div><div class="tptr-source-part tptr-source-image-preview"></div><button class="tptr-source-part tptr-source-pick">Pick</button></div>'
            }
        };

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend(true, {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.sources = [];
        this.pickerActive = false;

        this.init();

        return this;
    }

    Plugin.prototype = {
        init: function() {
            if (!$(this.element).is('input[type=hidden]')) {
                throw 'Tapatar target element should be an input of type hidden';
            }

            // Register sources
            for (var key in this.options.sources) {
                if (this.options.sources[key].enabled && Tptr.sources[key]) {
                    this.registerSource(Tptr.sources[key]);
                }
            }

            // Wrap the input
            var $tptrEl = $('<div class="tptr"></div>');
            $(this.element).addClass('tptr-file-input').hide().wrap($tptrEl);
            this.$tptrEl = $(this.element).parent();
            var $innerEl = $('<div class="tptr-inner"></div>');
            this.$tptrEl.append('<div class="tptr-inner"></div>');
            var $innerEl = this.$tptrEl.find('.tptr-inner');

            var self = this;

            // Set the widget image
            var $widgetTemplate = $(this.options.templates.widget);
            $widgetTemplate.css('background-image', 'url(' + this._getImageFromPathOrFunction(this.options.default_image, this.options) + ')');

            // Add the widget and attach the click handler
            $innerEl
                .html($widgetTemplate)
                .on('click', function(){
                    self._popPicker();
                });
        },
        registerSource: function(source) {
            source = source.getInstance();
            if (!source.id) throw 'Source id missing';
            source.delegate = this;

            this.sources[source.id] = source;

            if (source.onAdd) source.onAdd();
        },
        pickSource: function(source) {
            this.selectedSource = source.id;
            this._setPickedImage(source);
            $(this.element).trigger('tapatar.source.picked', [source]);
        },
        imageDataSet: function(source, pick) {
            this._updateSourceUi(source);
            $(this.element).trigger('tapatar.source.image_data.set', [source]);
            if (pick === true) this.pickSource(source);
        },
        _registerHandlers: function() {
            var self = this;

            // Register click handler for the sources' pick buttons and image preview
            this.$containerEl.on('click', '.tptr-source-image-preview', function(){
                var sourceId = $(this).parents('[data-source-id]').data('source-id');
                self.selectedSource = sourceId;
                self._setPickedImage(self.sources[sourceId]);
            });

            // Register click handler for the save button
            this.$containerEl.on('click', '.tptr-save', function() {
                self._save();
            });

            // Register click handler for the save button
            this.$containerEl.on('click', '.tptr-close', function() {
                self._closePicker();
            });

            $(document).on('keyup', function(e) {
                if (e.keyCode == 27) { self._closePicker() }
            });
        },
        _getImageFromPathOrFunction: function(prop, context) {
            if (typeof prop == 'function') return $.proxy(prop, context)();

            return prop;
        },
        _setPickedImage: function(source) {
            if (!source.image_data) return;
            this.$containerEl.find('.tptr-image-holder .tptr-big-image').css('background-image', 'url(' + source.image_data + ')');
        },
        _popPicker: function() {
            var sources = '';

            var $picker = $(this.options.templates.picker);
            var imageData = (this.selectedSource)
                                ? this.sources[this.selectedSource].image_data
                                : this._getImageFromPathOrFunction(this.options.default_image, this.options);
            $picker.find('.tptr-big-image').css('background-image', 'url(' + imageData + ')');

            // Sort sources and append
            var $sourcesHolder = $picker.find('.tptr-sources');
            var sorted = [];
            for (var source in this.options.sources) {
                sorted.push([source, this.options.sources[source].order])
                sorted.sort(function(a, b) {return a[1] - b[1]})
            }

            sorted.reverse();

            for (var i = sorted.length - 1; i >= 0; i--) {
                var source = this.sources[sorted[i][0]];
                if (source && this.options.sources[source.id].enabled) {
                    $sourcesHolder.append($(this._buildSource(source)));
                }
            };

            var $overlay = $(this.options.templates.overlay);
            $overlay.find('.tptr-overlay').html($picker);
            $('body').append($overlay);

            var self = this;

            this.pickerActive = true;
            $overlay.fadeIn();
            this.$containerEl = $overlay;
            this._registerHandlers();
            this._updateAllSourcesUi();
        },
        _closePicker: function() {
            this.$containerEl.fadeOut(function(){ $(this).remove() });
        },
        _buildSource: function(source) {
            var $el = $(this.options.templates.source);
            $el.find('.tptr-source-content').html(source.title);
            $el.attr('data-source-id', source.id);

            $el.find('.tptr-source-icon img').attr('src', this._getImageFromPathOrFunction(source.icon, source));

            var $pickEl = $el.find('.tptr-source-pick');

            if (source.action) {
                $pickEl.html(source.action.content);
                if (source.action.onClick) {
                    $pickEl.on('click', $.proxy(source.action.onClick, source));
                }
            } else {
                $pickEl.prop('disabled');
            }

            return $el;
        },
        _getSourceEl: function (source) {
            return this.$containerEl.find('[data-source-id=' + source.id +']');
        },
        _updateAllSourcesUi: function() {
            for (var source in this.sources) {
                this._updateSourceUi(this.sources[source])
            };
        },
        _updateSourceUi: function(source) {
            if (!this.pickerActive) return;

            this._setPreviewImage(source);
        },
        _setPreviewImage: function(source) {
            if (!source.image_data) return;

            this._getSourceEl(source).find('.tptr-source-image-preview').html($('<div></div>').css('background-image', 'url(' + source.image_data + ')'));
        },
        _save: function() {
            var source = this.sources[this.selectedSource];
            if (source) {
                var imgData = source.image_data;
                $(this.element).val(imgData);
                this.$tptrEl.find('.tptr-widget').css('background-image', 'url(' + imgData + ')');
                
                if(source.onSave) source.onSave(imgData);
            }

            this._closePicker();
        }
    };

    $.fn[pluginName] = function ( options ) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            // Creates a new plugin instance, for each selected element, and
            // stores a reference within the element's data
            return this.each(function() {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            // Call a public plugin method (not starting with an underscore) for each
            // selected element.
            if (Array.prototype.slice.call(args, 1).length == 0 && $.inArray(options, $.fn[pluginName].getters) != -1) {
                // If the user does not pass any arguments and the method allows to
                // work as a getter then break the chainability so we can return a value
                // instead the element reference.
                var instance = $.data(this[0], 'plugin_' + pluginName);
                return instance[options].apply(instance, Array.prototype.slice.call(args, 1));
            } else {
                // Invoke the speficied method on each selected element
                return this.each(function() {
                    var instance = $.data(this, 'plugin_' + pluginName);
                    if (instance instanceof Plugin && typeof instance[options] === 'function') {
                        instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                    }
                });
            }
        }
    };

    $.fn[pluginName].getters = [];
})(jQuery, window, document);
