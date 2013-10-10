var socket = io.connect('//localhost:8080/stats');
socket
	.on('top10', function (data) {
		var $toplist;
		$toplist = $('<ol/>');
		_.each(data, function(entry) {
			$toplist.append('<li>' + entry.username + ': ' + entry.round + '</li>');
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
			$playerList.append('<li>' + player + '</li>');
		});
		$('#playerList')
			.html('')
			.append($playerList);
	});
