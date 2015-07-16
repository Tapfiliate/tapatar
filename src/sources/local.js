var Tptr = Tptr || {};
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
