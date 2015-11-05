;(function ($, window, document, undefined) {
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
