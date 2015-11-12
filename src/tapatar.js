;(function ($, window, document, undefined ) {
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
                picker: '<div class="tptr-picker"><div class="tptr-close"></div><div class="tptr-image-holder tptr-box-part"><img class="tptr-big-image"></div><div class="tptr-sources-holder tptr-box-part"><div class="tptr-sources"></div><button class="tptr-save">Save</button></div></div>',
                source: '<div class="tptr-source"><div class="tptr-source-part tptr-source-icon"><img /></div><div class="tptr-source-part tptr-source-content"></div><div class="tptr-source-part tptr-source-image-preview"></div><button class="tptr-source-part tptr-source-pick">Pick</button></div>'
            },
            cropper: {
                enabled: false,
                options: {
                    // https://github.com/fengyuanchen/cropper
                }
            }
        };

    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( true, defaults, options) ;
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

            this._registerHandlers();

            // Add the widget and attach the click handler
            $innerEl
                .html($widgetTemplate)
                .on('click', function(){
                    self._popPicker();
                });
        },
        registerSource: function(source) {
            if (!source.id) throw 'Source id missing';
            source.delegate = this;

            this.sources[source.id] = source;

            if (source.onAdd) source.onAdd();
        },
        pickSource: function(source) {
            this.selectedSource = source.id;
            this._setPickedImage(source);
            if (this.options.cropper.enabled) this._addCropper(source);
        },
        imageDataSet: function(source, pick) {
            this._updateSourceUi(source);
            if (pick === true) this.pickSource(source);
        },
        _registerHandlers: function() {
            var self = this;

            // Register click handler for the sources' pick buttons and image preview
            $(document).on('click', '.tptr-source-image-preview', function(){
                var sourceId = $(this).parents('[data-source-id]').data('source-id');
                self.selectedSource = sourceId;
                self._setPickedImage(self.sources[sourceId]);
            });

            // Register click handler for the save button
            $(document).on('click', '.tptr-save', function() {
                self._save();
            });

            // Register click handler for the save button
            $(document).on('click', '.tptr-close', function() {
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
            this.$containerEl.find('.tptr-big-image').attr('src', source.image_data);
        },
        _popPicker: function() {
            var sources = '';

            var $picker = $(this.options.templates.picker);
            var imageData = (this.selectedSource)
                                ? this.sources[this.selectedSource].image_data
                                : this._getImageFromPathOrFunction(this.options.default_image, this.options);
            $picker.find('.tptr-big-image').attr('src', imageData);

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
        _addCropper: function(source) {
            var $img = this.$containerEl.find('.tptr-big-image');
            $img
                .cropper(this.options.cropper.options)
                .on('crop.cropper', this._cropEvent.bind(this, source, $img));
        },
        _cropEvent: function(source, $img) {
            source.setImageData($img.cropper('getCroppedCanvas').toDataURL());
            this._setPickedImage(source);
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
            var imgData = this.sources[this.selectedSource].image_data;
            $(this.element).val(imgData);
            this.$tptrEl.find('.tptr-widget').css('background-image', 'url(' + imgData + ')');
            this._closePicker();
        }
    };

    $.fn[pluginName] = function ( options ) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            // Creates a new plugin instance, for each selected element, and
            // stores a reference withint the element's data
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
