Showcase.namespace("Showcase.Plugins.DisplayOrder");

Showcase.Plugins.DisplayOrder = Showcase.Class.create({

	initialize: function(args) {

		this.container = args.container;
		this.workspace_handle = args.workspace_handle;
		this.collection_name = args.collection_name;

		this.items = [];

		$(this.container).sortable({
			items: 'tr:not(:first)',
			handle: '.sorted-column .display-order',
			forcePlaceholderSize: true,
			tolerance: 'pointer',
			start: function(event, ui) {
				ui.placeholder.height(ui.item.height());
			},
			update: function(event, ui) {

				var row = ui.item.context;
				this.place(row);

			}.bind(this)
		});

		this._addListeners();
	},

	place: function(row) {

		var rows = this.rows();
		var i;

		rows.forEach(function(r, index) { if (r === row) i = index; });
		var initial_value = this.rowValue(row);

		if (rows.length == 1) {

			// only one row; nothing to do
			return;

		} else if (rows.length == 2) {

			// two rows: swap values
			var reference_row = rows[i - 1] || rows [i + 1];
			var reference_value = this.rowValue(reference_row);
			this.saveRow(row, reference_value);
			this.saveRow(reference_row, initial_value);

		} else if (rows[i - 1] && rows[i + 1]) {

			// common case -- in between existing rows
			var value = (this.rowValue(rows[i - 1]) + this.rowValue(rows[i + 1])) / 2;
			this.saveRow(row, value);

		} else if (rows[i - 1] && !rows[i + 1] && rows[i - 2]) {

			// moved to last position with two previous
			var reference_value = this.rowValue(rows[i - 1]);
			this.saveRow(row, reference_value);
			this.saveRow(rows[i - 1], (reference_value + this.rowValue(rows[i - 2])) / 2);

		} else if (rows[i + 1] && !rows[i - 1] && rows[i + 2]) {

			// moved to first position with two subsequent
			var reference_value = this.rowValue(rows[i + 1]);
			this.saveRow(row, reference_value);
			this.saveRow(rows[i + 1], (reference_value + this.rowValue(rows[i + 2])) / 2);

		} else {
			return;
		}
	},

	rows: function() {
		return [].slice.call( this.container.querySelectorAll('tr.item-row') );
	},

	rowValue: function(row, value) {
		var el = row.querySelector('.display-order');
		if (value) return el.setAttribute('data-initial-value', value);
		return Number(el.getAttribute('data-initial-value'));
	},

	saveRow: function(row, value) {

		var item_id = row.getAttribute('data-item-id');
		this.rowValue(row, value);

		$.ajax({
			url: '/api/' + this.workspace_handle + '/' + this.collection_name + '/' + item_id,
			data: { display_order: value },
			type: 'PATCH'
		});
	},

	_addListeners: function() {

		var up_buttons = [].slice.call(this.container.querySelectorAll('button.up'));
		var dn_buttons = [].slice.call(this.container.querySelectorAll('button.dn'));

		up_buttons.forEach(function(btn) {
			btn.addEventListener('click', function(e) {
				var row = btn.parentNode.parentNode.parentNode.parentNode;
				var rows = this.rows();

				var i;
				rows.forEach(function(r, index) { if (r === row) i = index; });


				if (rows[i - 1]) {
					row.parentNode.insertBefore(row, rows[i - 1]);
				}
				this.place(row);

			}.bind(this));
		}, this);

		dn_buttons.forEach(function(btn) {
			btn.addEventListener('click', function(e) {
				var row = btn.parentNode.parentNode.parentNode.parentNode;
				var rows = this.rows();

				var i;
				rows.forEach(function(r, index) { if (r === row) i = index; });

				if (rows[i + 1]) {
					row.parentNode.insertBefore(rows[i + 1], row);
				}
				this.place(rows[i + 1]);
			}.bind(this));
		}, this);
	}
});

window.addEventListener('load', function() {
	var table = document.querySelector('.items-table tbody');
	if (table) {
		new Showcase.Plugins.DisplayOrder({
			container: table,
			workspace_handle: Showcase.page.workspace_handle,
			collection_name: Showcase.page.collection_name
		});
	}
});

