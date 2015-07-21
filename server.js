var express = require('express');
var app = express();
var server = require('http').Server(app);
var sio = require('socket.io');
var io = sio(server);
var request = require('superagent');
var currentSong, dj;

function elect(socket){
	dj = socket;
	io.sockets.emit("announcement", socket.nickname + " is the new dj!");
	socket.emit("elected");
	//socket.dj???
	socket.dj = true;
	socket.on("disconnect", function(){
		dj = null;
		io.sockets.emit("announcement", "the dj left - next one to be join becomes dj");
	});
}

io.sockets.on('connection', function(socket){
	/*console.log("someone connected");
	socket.emit('news', {name:"hello, ran"});
	socket.on('other_event', function(msg){
		console.log(msg);
	});*/
	socket.on('join', function(name){
		socket.nickname = name;
		socket.broadcast.emit("announcement", name + " joined the chat room.");
		if(!dj){
			elect(socket);
		} else {
			socket.emit("song", currentSong);
		}
	});
	socket.on('text', function(msg, fn){
		socket.broadcast.emit('text', socket.nickname, msg);
		fn( Date.now() );
	});
	socket.on('search', function(q, fn){
		console.log('listen search: ' + q);

		request.get('http://lib9.service.kugou.com/websearch/index.php?page=1&keyword='+ q +'&cmd=100&pagesize=25' )
				.end(function(err, res){
					//console.log(JSON.parse(res.text).data.songs);
					//console.log(res.status);
					var songs = JSON.parse(res.text).data.songs;
					//console.log(songs);
					var count = 1;

					songs.forEach(function(song,index,songs){
						request.get('http://m.kugou.com/app/i/getSongInfo.php?hash=' + song.hash + '&cmd=playInfo')
						.end(function(err, res){
							song.url = JSON.parse(res.text).url;
							console.log(song.url);
							count ++;	
							if(200 == res.status && songs.length == count - 1){
								fn(songs);
								console.log(songs);
							};
						});	
					
					});
                	//if(200 == res.status) fn(songs);
			 	});
	});

	socket.on('song', function(song){
		if(socket.dj){
			currentSong = song;
			//console.log('song');
			socket.broadcast.emit('song', song);
		}
	});

});
app.use(express.static(__dirname + '/public'));
server.listen(3000);










