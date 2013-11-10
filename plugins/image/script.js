Showcase.namespace("Showcase.Plugins.Image");

Showcase.Plugins.Image = Showcase.Class.create({

	initialize: function(args) {

		this.container = args.container;
		this.input = args.input;
		this.file = args.file;

		var dropzone = new Dropzone(this.container, {
			url: "/files",
			clickable: true,
			addRemoveLinks: true,
			maxFiles: 1
		});

		this.dropzone = dropzone;

		this.populate();

		dropzone.on("complete", function(file) {
			console.log('added file!');
			console.log(file);
			var response = JSON.parse(file.xhr.responseText);
			file.previewElement.setAttribute("data-file-id", response[0].id);
			this.sync();

		}.bind(this));

		dropzone.on("removedfile", function() {
			console.log('removed file!');
			this.sync();

		}.bind(this));
	},

	sync: function() {

		var preview = this.container.querySelector(".dz-preview");

		if (preview) {
			var file_id = preview.getAttribute("data-file-id");
			this.input.value = JSON.stringify({ file_id: file_id });
			this.container.classList.add("populated");
		} else {
			this.input.value = "";
			this.container.classList.remove("populated");
		}
	},

	populate: function() {

		var file = this.file;

		if (!file) return;

		var mockFile = {
			name: file.original_filename,
			id: file.file_id,
			url: file.url,
			size: file.size
		};

		this.dropzone.emit("addedfile", mockFile);
		this.dropzone.emit("thumbnail", mockFile, mockFile.url);

		var preview = this.container.querySelector('.dz-preview');

		var file_id = this.file.file_id;
		preview.setAttribute("data-file-id", file_id);

		this.sync();
	}
});

