var Sort = require('../lib/sort.js');

exports.serialize = function(test) {

	var serialized_sort = Sort.serialize([ { field_name: 'title' } ])
	test.equal(serialized_sort, "title");

	serialized_sort = Sort.serialize([ { field_name: 'title', order: 'desc' } ]);
	test.equal(serialized_sort, "title:desc");

	serialized_sort = Sort.serialize([ { field_name: 'title', order: 'esc' } ]);
	test.equal(serialized_sort, "title");

	serialized_sort = Sort.serialize([ { field_name: 'title', order: 'asc' } ]);
	test.equal(serialized_sort, "title");

	serialized_sort = Sort.serialize([ { field_name: 'title', order: 'asc' }, { field_name: 'count', order: 'desc' } ]);
	test.equal(serialized_sort, "title,count:desc");

	serialized_sort = Sort.serialize([]);
	test.equal(serialized_sort, "");

	serialized_sort = Sort.serialize(null);
	test.equal(serialized_sort, "");

	test.done();
};

exports.deserialize = function(test) {

	var sort = Sort.deserialize("title:desc");
	test.deepEqual(sort, [ { field_name: 'title', order: 'desc' } ])

	sort = Sort.deserialize("title:asc");
	test.deepEqual(sort, [ { field_name: 'title', order: 'asc' } ])

	sort = Sort.deserialize("title");
	test.deepEqual(sort, [ { field_name: 'title', order: 'asc' } ])

	sort = Sort.deserialize("title,count:desc");
	test.deepEqual(sort,[ { field_name: 'title', order: 'asc' }, { field_name: 'count', order: 'desc' } ]);

	sort = Sort.deserialize("");
	test.equal(sort, null);

	test.done();
};
