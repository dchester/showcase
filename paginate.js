

var paginator = new pagination.SearchPaginator({
	prelink: '/',
	rowsPerPage: 10,
	totalResult: 24,
	current: 3 
});

console.log(paginator.getPaginationData());
	
