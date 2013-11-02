var socket = io.connect(host + '/stats', {
	secure: secureHost
});
socket
	.on('top10', function (data) {
		// Defunct atm
		return;
		var $toplist;
		$toplist = $('<ol/>');
		_.each(data, function(entry) {
			$toplist.append('<li><span>' + _.escape(entry.username) + '</span> <span>' + Number(entry.score).toLocaleString() + '</span></li>');
		});
		$('#top10')
			.html('')
			.append($toplist);
	})
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
