var ShowcaseImageList = function(args) {

	var container = args.container;
	var input = args.input;
	var files = args.files;

	var dropzone = new Dropzone(container, {
		url: "/files",
		clickable: true,
		addRemoveLinks: true
	});

	var sync = function() {
		var file_ids = [];
		var previews = container.querySelectorAll(".dz-preview");
		[].forEach.call(previews, function(el) {
			var id = el.getAttribute("data-file-id");
			if (!id) return;
			file_ids.push(id);
		});

		input.value = JSON.stringify({ file_ids: file_ids });
	}

	var populate = function() {

		var mockFiles = [];

		files.forEach(function(file) {
			mockFiles.push({
				name: file.original_filename,
				id: file.file_id,
				url: file.url,
				size: file.size
			});
		});

		mockFiles.forEach(function(file) {
			dropzone.emit("addedfile", file);
			dropzone.emit("thumbnail", file, file.url);
		});

		var previews = container.querySelectorAll('.dz-preview');

		[].forEach.call(previews, function(el, index) {
			var file_id = files[index].file_id;
			el.setAttribute("data-file-id", file_id);
		});

		sync();
	}

	populate();

	dropzone.on("complete", function(file) {
		console.log('added file!');
		console.log(file);
		var response = JSON.parse(file.xhr.responseText);
		file.previewElement.setAttribute("data-file-id", response[0].id);
		sync();
	});

	dropzone.on("removedfile", function() {
		console.log('removed file!');
		sync();
	});

	$(container).sortable({
		placeholder: "dz-preview ui-state-highlight",
		items: ".dz-preview",
		update: function() {
			console.log("order");
			sync();
		}
	});

	$(container).disableSelection();
};

