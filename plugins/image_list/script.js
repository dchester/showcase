Showcase.namespace("Showcase.Plugins.ImageList");

Showcase.Plugins.ImageList = Showcase.Class.create({

	initialize: function(args) {

		this.container = args.container;
		this.input = args.input;
		this.files = args.files;

		var dropzone = new Dropzone(this.container, {
			url: "/files",
			clickable: true,
			addRemoveLinks: true
		});

		this.dropzone = dropzone;

		this.populate();

		dropzone.on("complete", function(file) {
			var response = JSON.parse(file.xhr.responseText);
			file.previewElement.setAttribute("data-file-id", response[0].id);
			this.sync();

		}.bind(this));

		dropzone.on("removedfile", function() {
			this.sync();

		}.bind(this));

		$(this.container).sortable({
			placeholder: "dz-preview ui-state-highlight",
			items: ".dz-preview",
			update: function() {
				this.sync();
			}.bind(this)
		});

		$(this.container).disableSelection();
	},

	sync: function() {

		var file_ids = [];
		var previews = this.container.querySelectorAll(".dz-preview");
		[].forEach.call(previews, function(el) {
			var id = el.getAttribute("data-file-id");
			if (!id) return;
			file_ids.push(id);
		});

		this.input.value = JSON.stringify({ file_ids: file_ids });
	},

	populate: function() {

		var mockFiles = [];

		this.files.forEach(function(file) {
			mockFiles.push({
				name: file.original_filename,
				id: file.file_id,
				url: file.url,
				size: file.size
			});
		});

		mockFiles.forEach(function(file) {
			this.dropzone.emit("addedfile", file);
			this.dropzone.emit("thumbnail", file, file.url);

		}.bind(this));

		var previews = this.container.querySelectorAll('.dz-preview');

		[].forEach.call(previews, function(el, index) {
			var file_id = this.files[index].file_id;
			el.setAttribute("data-file-id", file_id);
		}.bind(this));

		this.sync();
	}
});

