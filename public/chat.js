window.onload = function(){
	var timer;
	var socket = io.connect('http://localhost:3000');
	var form = document.getElementById('dj'), results = document.getElementById('results');
	var playing = document.getElementById('playing');

	form.onsubmit = function(){
		results.innerHTML = '';
		socket.emit('search', document.getElementById('s').value, function(songs){
			for(var i = 0, l = songs.length; i < l; i ++){
				(function(song){
					var li = document.createElement('li');
					li.innerHTML = song.filename;
					var a = document.createElement('a');
					a.href = '#';
					a.innerHTML = '选择';
					a.onclick = function(){
						socket.emit('song', song);
						play(song);
						return false;
					};
					li.appendChild(a);
					results.appendChild(li);
				})(songs[i]);
			}
		});
		return false;
	};
	socket.on('elected', function(){
		form.className = "isDJ";
	});
	/*socket.on('news', function(msg){
		console.log(msg);
		socket.emit('other_event', {my: "hello server"});
	});*/
	socket.on('connect', function(){
		socket.emit('join', prompt("What is your nickname?"));
		document.getElementById('chat').style.display = 'block';
		document.getElementById('song').style.display = 'block';
	});
	socket.on('announcement', function(msg){
		var li = document.createElement('li');
		li.className = "announcement";
		li.innerHTML = msg;
		document.getElementById('message').appendChild(li);

		function hiddenA(){
		var anno = document.getElementsByClassName('announcement');
		for(var i = 0; i < anno.length; i ++){
			anno[i].style.display = "none";
			}
		}
		setTimeout(function(){
			hiddenA();
			},10000);
	});
	var input = document.getElementById('input');
	document.querySelector("#form").onsubmit = function(){
		var li = addMessage("me", input.value, "self");
		socket.emit('text', input.value, function( date ){
			var span = document.createElement("span");
			span.className = "glyphicon glyphicon-ok";
			span.title = date;
			li.appendChild(span);
		});
		

		input.value = '';
		input.focus();
		return false;
	};
	function addMessage(from, text, class_name){
		if(text == '') return;
		var li = document.createElement("li");
		var date = new Date();
		li.className = "message";
		li.innerHTML = "(" + date.getHours() +":" + date.getMinutes() + ":" + date.getSeconds() + ") <b class='" + class_name + "'>" + from + "</b>: " + text;
		var ul = document.getElementById("message");
		ul.appendChild(li);
		scrollToBottom(ul);
		return li;
	}
	function scrollToBottom(element){
		if(element.scrollTop != element.scrollHeight - element.offsetHeight){
			element.scrollTop = element.scrollHeight - element.offsetHeight
		}
	}
	socket.on('text',function(name,msg){
		addMessage(name,msg, "others");
	});
	function play(song){
		if(!song) return;
		playing.innerHTML = '<hr><b>Now Playing:</b>' + song.filename + '<br>';

		var iframe = document.createElement('iframe');
		iframe.frameborder = 0;
		iframe.style.width = 0;
		iframe.style.height = 0;
		iframe.src = song.url;
		playing.appendChild(iframe);
	}
	socket.on('song',function(song){
		console.log('receive');
		play(song);
	});

};
















