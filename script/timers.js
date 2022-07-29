"use strict";
function newTimerSeconds(name, time) {
	time = time * 1000;
	let start = 0;
	function formatTime(arr) {
		return arr.map(function(x,i) {
			return ('0' + x).slice(-2);
		}).join(':');
	}
	function timestampToObject(timestamp) {
			let hours = Math.floor(timestamp / 3600);
			let minutes = Math.floor((timestamp - (hours * 3600)) / 60);
			let seconds = Math.floor(timestamp - (hours * 3600) - (minutes * 60));
			return {hours, minutes, seconds};
	}

	function getGlobalPercentReduce() {
		let result = 0;
		result += (document.getElementById('reduce-15').checked ? 15 : 0);
		result += (document.getElementById('reduce-3').checked ? 3 : 0);
		return result;
	}

	function getTime() {
		let reduce = getGlobalPercentReduce();
		if (reduce > 0) {
			return time * ((100 - getGlobalPercentReduce())/100);
		}
		return time;
	}
	return {
		start: function(time) {
			if (!time) {
				time = Date.now();
			}
			start = time;
		},
		reset: function() {
			start = 0;
		},
		secondsLeft: function() {
			if (start === 0) {
				return 0;
			}
			return Math.round((getTime() - (Date.now() - start)) / 1000);
		},
		value: function() {
			let val = this.secondsLeft();
			if (val < 0) {
				return '00:00:00';
			}
			let {hours, minutes, seconds} = timestampToObject(val);
			
			return formatTime([hours, minutes, seconds]);
		},
		isRunning: function() {
			if (start === 0) {
				return false;
			}
			return this.secondsLeft() >= 0;
		},
		isStarted: function() {
			if (start === 0) {
				return false;
			}
			return true;
		},
		ago: function() {
			let val = this.secondsLeft();
			if (val > 0) {
				return null;
			}
			val = val * (-1);
			let {hours, minutes, seconds} = timestampToObject(val);
			
			return formatTime([hours, minutes, seconds]);
		},
		description: function() {
			return name + ' (' + this.getDuration() + ')';
		},
		getName: function() {
			return name;
		},
		getStart: function() {
			let date = new Date(start);			
			return formatTime([date.getHours(), date.getMinutes(), date.getSeconds()]);
		},
		getDuration: function() {
			let {hours, minutes, seconds} = timestampToObject(getTime()/1000);
			
			return formatTime([hours, minutes, seconds]);
		},
		getObjectForSave: function() {
			return {
				time: time/60000,
				name: name,
				start: start
			}
		},
		element: null
	}
}
function newTimerMinutes(name, time) {
	return newTimerSeconds(name, time * 60);
}

function saveGlobalTimers() {
	let objectsForSave = [];
	for (let timer of globalTimers) {
		objectsForSave.push(timer.getObjectForSave());
	}
	window.localStorage.setItem("globalTimers", JSON.stringify(objectsForSave));

	let reduce = {};
	for (let id of ['reduce-15', 'reduce-3']) {
		reduce[id] = document.getElementById(id).checked;
	}
	window.localStorage.setItem("reduce", JSON.stringify(reduce));
}

function extractGlobalVariables() {
	let timers = window.localStorage.getItem("globalTimers");
	timers = JSON.parse(timers);
	if (timers) {
		for (let savedTimer of timers) {
			let timer = createNewTimer(savedTimer.name, savedTimer.time);
			if (savedTimer.start > 0) {
				timer.start(savedTimer.start);
			}
		}
	}
	
	let reduce = window.localStorage.getItem("reduce");
	reduce = JSON.parse(reduce);
	if (reduce) {
		for (let id of ['reduce-15', 'reduce-3']) {
			document.getElementById(id).checked = reduce[id]
		}
		updateTimers();
	}
	
}

function createNewTimer(name, minutes) {
	if (minutes > 0) {
		let timer = newTimerMinutes(name, minutes);
		let template = document.getElementById('new-timer-template');
		timer.element = template.content.cloneNode(true).children[0];
		timer.element.querySelector('.name').innerHTML = timer.description();
		timer.element.querySelector('.start-timer').onclick=function(){
			timer.start();
			timer.element.querySelector('.name').innerHTML = timer.description();
			timer.element.querySelector('.data').innerHTML = timer.value();
			timer.element.querySelector('.start-timer').classList.add('hidden');
		}
		timer.element.querySelector('.reset-timer').onclick=function(){
			timer.reset();
			document.title = 'Timers page';
			timer.element.querySelector('.data').classList.remove('alert');
			timer.element.classList.remove('alert');
			timer.element.querySelector('.started').innerHTML = '';
			timer.element.querySelector('.data').innerHTML = '';
			timer.element.querySelector('.name').innerHTML = timer.description();
			timer.element.querySelector('.reset-timer').classList.add('hidden');
			timer.element.querySelector('.start-timer').classList.remove('hidden');
		}
		document.getElementById('running-timers').appendChild(timer.element);
		globalTimers.push(timer);
		return timer;
	}
	return null;
}

window.onbeforeunload = function (e) {
	saveGlobalTimers();
};

document.getElementById('new-timer-create').onclick = function() {
	let minutes = document.getElementById('new-timer-duration').value;
	let name = document.getElementById('new-timer-name').value;
	createNewTimer(name, minutes);
}

let globalTimers = [];

extractGlobalVariables();

if (globalTimers.length === 0) {
	let predefinedTimers = [
		{
			name: 'Spider',
			time: 30
		},
		{
			name: 'Werewolf',
			time: 60
		},
		{
			name: 'Beetle',
			time: 24 * 60
		},
		{
			name: 'Krab',
			time: 36 * 60
		},
		{
			name: 'Tunnel Bear',
			time: 48 * 60
		},
		{
			name: 'Snail',
			time: 96 * 60
		},
	];


	for (let predefinedTimer of predefinedTimers) {
		let {name, time} = predefinedTimer;
		if (time > 0) {
			createNewTimer(name, time);	
		}
	}
}



setInterval(function(){
	for (let timer of globalTimers) {
		if (timer.isStarted()) {
			if (timer.isRunning()) {
				let val = '';
				val = timer.value();
				timer.element.querySelector('.data').innerHTML = val;
				if (timer.secondsLeft() < 60) {
					timer.element.querySelector('.data').classList.add('alert');
				}
				timer.element.querySelector('.start-timer').classList.add('hidden');
				timer.element.querySelector('.reset-timer').classList.remove('hidden');
	    	} else {
	    		document.title = 'ACHTUNG! ' + timer.getName();
				timer.element.querySelector('.started').innerHTML = 'Stopped: ' + timer.ago() + ' ago';
				timer.element.classList.add('alert');
	    	}
		}
    	
    }
},1000);
function updateTimers() {
	for (let timer of globalTimers) {
		timer.element.querySelector('.name').innerHTML = timer.description();
	}
};
for (let reduceElement of document.querySelectorAll('.reduce')) {
	reduceElement.onclick = updateTimers;
}
			