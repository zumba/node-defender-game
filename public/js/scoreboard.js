var socket = io.connect(host + '/stats', {
	secure: secureHost
});
socket
	.on('top10', function (data) {
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
		if (data.length === 0) {
			$('#playerList')
				.html('<p>No players :(</p>');
			return;
		}
		var $playerList;
		$playerList = $('<ul/>');
		_.each(data, function(player) {
			$playerList.append('<li>' + _.escape(player) + '</li>');
		});
		$('#playerList')
			.html('')
			.append($playerList);
	});
