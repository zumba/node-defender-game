$(function() {
	var socket = io.connect(host + '/stats', {
		secure: secureHost
	});
	var templateCache = {}

	// Retrieve an underscore template object
	var renderTemplate = function(template, data) {
		data = data || {};
		if (templateCache[template]) {
			return templateCache[template](data);
		}
		$.ajax({
			url: '/templates/' + template + '.html',
			method: 'GET',
			async: false,
			success: function(result) {
				templateCache[template] = _.template(result);
			}
		});

		return templateCache[template](data);
	}

	socket
		// top 10 list
		.on('top10', function (data) {
			var top10 = $('#top10');
			top10.find('.leader-row').remove();
			if (!data) {
				return;
			}
			_.each(data, function(entry, index) {
				top10.append(renderTemplate('leader_row', {
					place: index + 1,
					image: entry.image,
					username: _.escape(entry.username),
					score: Number(entry.score).toLocaleString()
				}));
			});
		})
		// Current players
		.on('playerRefresh', function(data) {
			var playerList;
			if (data.length === 0) {
				$('#playerList')
					.html('<p>No players :(</p>');
				return;
			}
			playerList = $('<p/>').html(data.join(', '));

			$('#playerList')
				.html('')
				.append(playerList);
		});
})
