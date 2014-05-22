exports.fixtures = {
	book_fields: [
		{
			title: 'Title',
			name: 'title',
			description: 'title',
			data_type: 'string',
			is_required: 1,
			index: 0,
			meta: ''
		}, {
			title: 'Author',
			name: 'author',
			description: 'author',
			data_type: 'string',
			is_required: 1,
			index: 1,
			meta: ''
		}, {
			title: 'ISBN',
			name: 'isbn',
			description: 'isbn',
			data_type: 'number',
			is_required: 1,
			index: 2,
			meta: ''
		}, {
			title: 'Public Domain',
			name: 'is_public_domain',
			description: 'Is this book in the public domain?',
			data_type: 'checkbox',
			is_required: 0,
			index: 3,
			meta: ''
		}, {
			title: 'Book Image',
			name: 'book_image',
			description: 'A cover image for the book',
			data_type: 'image',
			is_required: 0,
			index: 4,
			meta: ''
		}
	]
};

exports.showcase = {
	"database": {
		"dialect": "sqlite",
		"storage": '/var/tmp/showcase-tester.sqlite',
		"database": "cms",
		"logging": false
	},
	"files": {
		"tmp_path": "/var/tmp",
		"storage_path": "/var/tmp"
	}
};
