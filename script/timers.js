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
			console.log(timestamp, {hours, minutes, seconds});
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
		start: function() {
			start = Date.now();
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
			console.log(val);
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
		element: null
	}
}
function newTimerMinutes(name, time) {
	return newTimerSeconds(name, time * 60);
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
	}
}

window.onbeforeunload = function (e) {
    e = e || window.event;

    let isConfirmationRequired = false;
    for (let timer of globalTimers) {
    	if (timer.isRunning()) {
    		isConfirmationRequired = true;
    		console.log(timer.getName());
    		break;
    	}
    }
    if (isConfirmationRequired) {
    	let question = 'You have timers running. Do you really want to close this page?';

	    if (e) {
	        e.returnValue = question;
	    }

	    return question;
    }
};

document.getElementById('new-timer-create').onclick = function() {
	let minutes = document.getElementById('new-timer-duration').value;
	let name = document.getElementById('new-timer-name').value;
	createNewTimer(name, minutes);
}

let globalTimers = [];

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
	    	} else {
	    		document.title = 'ACHTUNG! ' + timer.getName();
				timer.element.querySelector('.started').innerHTML = 'Stopped: ' + timer.ago() + ' ago';
				timer.element.querySelector('.reset-timer').classList.remove('hidden');
				timer.element.classList.add('alert');
	    	}
		}
    	
    }
},1000);

for (let reduceElement of document.querySelectorAll('.reduce')) {
	let updateTimers = function() {
		for (let timer of globalTimers) {
			timer.element.querySelector('.name').innerHTML = timer.description();
		}
	};
	reduceElement.onclick = updateTimers;
}
			