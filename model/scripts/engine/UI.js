(function(exports){

/////////////////////////
//// VARS AND STUFF /////
/////////////////////////

// Get the path to the JSON
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// UI Vars, like options
exports.UI = {
	options:{},
	NONE: 0,
	BASIC: 1,
	ADVANCED: 2
};

// How much UI to show?
// Edit Sidebar: 0-none, 1-basic, 2-advanced
// Play Controls: 0-none, 1-basic, 2-advanced
// BG: 0-none, 1-basic(grid)
UI.options.edit = getParameterByName("edit") || 2;
UI.options.play = getParameterByName("play") || 2;
UI.options.bg = getParameterByName("bg") || 1;


///////////////////////////////
///// HIDE INTERAFACES??? /////
///////////////////////////////

// Edit Sidebar
if(UI.options.edit==UI.NONE){
	document.getElementById("editor_container").style.display = "none";
}

// Play Controls
if(UI.options.play==UI.NONE){
	document.getElementById("play_container").style.display = "none";
}
if(UI.options.play==UI.BASIC){
	document.getElementById("play_controls").setAttribute("basic",true);
}

// The Background
if(UI.options.bg==UI.NONE){
	// CSS: transparent BG, no grid.
	var css = document.getElementById("ui_style");
	css.innerHTML = "#grid_bg, #grid_bg>div>div{ border: none; }";
}


/////////////////////////
///// PLAY CONTROLS /////
/////////////////////////

// RESET 
var play_reset = document.getElementById("play_reset");
play_reset.onclick = function(){
	Grid.reinitialize();
};

// PLAY/PAUSE
var play_pause = document.getElementById("play_pause");
play_pause.onclick = function(){
	Model.data.meta.play = !Model.data.meta.play;
	updatePauseUI();
};
var updatePauseUI = function(){
	if(Model.data.meta.play){
		play_pause.innerHTML = "pause";
		play_pause.setAttribute("paused",false);
	}else{
		play_pause.innerHTML = "play";
		play_pause.setAttribute("paused",true);
	}
};

// STEP
var play_step = document.getElementById("play_step");
play_step.onclick = function(){
	Model.pause();
	updatePauseUI();
	Grid.step();
	publish("/grid/updateAgents");
};

// PLAYBACK SPEED - OnInput, coz firefox, remember.
var playback_speed = document.getElementById("control_fps");
playback_speed.oninput = function(){
	Model.data.meta.fps = parseInt(playback_speed.value);
};

// UPDATE THE PLAYBACK UI
subscribe("/model/init",function(){
	updatePauseUI();
	playback_speed.value = Model.data.meta.fps;
});
subscribe("/meta/reset/complete",function(){
	updatePauseUI();
	playback_speed.value = Model.data.meta.fps;
});

/////////////////////////
///// CHANGE STATES /////
/////////////////////////

// Toggle brush
var play_draw = document.getElementById("play_draw");
var play_draw_icon = document.querySelector("#play_draw > div");
play_draw.onclick = function(){
	
	// Get what the next state should be
	var state = Model.getStateByID(Model.data.meta.draw);
	var stateIndex = Model.data.states.indexOf(state);
	var nextIndex = (stateIndex+1)%Model.data.states.length;
	var nextState = Model.data.states[nextIndex];
	Model.data.meta.draw = nextState.id;

	// Update brush icon
	_updateBrushIcon();

};
var _updateBrushIcon = function(){
	var state = Model.getStateByID(Model.data.meta.draw);
	play_draw_icon.innerHTML = state.icon;
};

// The default brush
subscribe("/model/init",function(){
	_updateBrushIcon();
});

// when state header icon is changed
subscribe("/ui/updateStateHeaders",_updateBrushIcon);

// when state is deleted
subscribe("/ui/removeState",function(deleted_id){
	if(Model.data.meta.draw==deleted_id){
		Model.data.meta.draw = 0;
		_updateBrushIcon();
	}
});

// Mouse down
var Mouse = { x:0, y:0, pressed:false };
var getMousePosition = function(event){

	var rx = event.clientX - Grid.dom.offsetLeft;
	var ry = event.clientY - Grid.dom.offsetTop;
	var x = Math.floor(rx/Grid.tileSize);
	var y = Math.floor(ry/Grid.tileSize);

	if(x<0) x=0;
	if(x>=Grid.array[0].length) x=Grid.array[0].length-1;
	if(y<0) y=0;
	if(y>=Grid.array.length) y=Grid.array.length-1;

	return {x:x, y:y};

};
Grid.dom.addEventListener("mousedown",function(event){
	Mouse.pressed = true;
	var pos = getMousePosition(event);
	Mouse.x = pos.x;
	Mouse.y = pos.y;
	changeCell();
},false);
Grid.dom.addEventListener("mousemove",function(event){

	if(!Mouse.pressed) return;
	
	var pos = getMousePosition(event);

	// New position
	if(pos.x!=Mouse.x || pos.y!=Mouse.y){
		Mouse.x = pos.x;
		Mouse.y = pos.y;
		changeCell();
	}
	
},false);
window.addEventListener("mouseup",function(event){
	Mouse.pressed = false;
},false);

// Change state of cell
var changeCell = function(){

	var x = Mouse.x;
	var y = Mouse.y;

	// Get the agent there
	var agent = Grid.array[y][x];

	// Swap agent to brush state
	agent.forceState(Model.data.meta.draw);

	// Update the rendering
	publish("/grid/updateAgents");

};

////////////////////////////
//// MAKE IT SCRUBBABLE ////
////////////////////////////

// Mouse, #2
var Mouse2 = {
	x: 0,
	y: 0
};

var scrubInput = null;
var scrubPosition = {x:0, y:0};
var scrubStartValue = 0;
exports._makeScrubbable = function(input){

	input.addEventListener("mousedown",function(e){
		scrubInput = e.target;
		scrubPosition.x = e.clientX;
		scrubPosition.y = e.clientY;
		scrubStartValue = parseFloat(input.value);
	},false);
	input.addEventListener("click",function(e){
		e.target.select();
	},false);

};
window.addEventListener("mousemove",function(e){
	
	// Mouse2
	Mouse2.x = e.clientX;
	Mouse2.y = e.clientY;

	// If browser allows it, try to find x/y relative to canvas rather than page
	if(e.offsetX != undefined){
		Mouse2.x = e.offsetX;
		Mouse2.y = e.offsetY;
	}
	else if(e.layerX != undefined && e.originalTarget != undefined){
		Mouse2.x = e.layerX-e.originalTarget.offsetLeft;
		Mouse2.y = e.layerY-e.originalTarget.offsetTop;
	}

	// Scrubbing
	if(!scrubInput) return;
	scrubInput.blur();
	var deltaX = e.clientX - scrubPosition.x;
	deltaX = Math.round(deltaX/10)*scrubInput.options.step; // STEP for every 10px
	var val = scrubStartValue + deltaX;

	// Integer or not?
	if(scrubInput.options.integer){
		scrubInput.value = (Math.round(val*10)/10).toFixed(0);
	}else{
		scrubInput.value = (Math.round(val*10)/10).toFixed(1);
	}

	// Fix to constraints
	if(scrubInput.value < scrubInput.options.min){
		scrubInput.value = scrubInput.options.min;
	}
	if(scrubInput.value > scrubInput.options.max){
		scrubInput.value = scrubInput.options.max;
	}

	// Change value
	if(scrubInput.oninput){
		scrubInput.oninput();
	}

},false);
window.addEventListener("mouseup",function(event){
	scrubInput = null;
},false);


/////////////////////////
//// SCROLLING STUFF ////
/////////////////////////

var editor_container = document.getElementById('editor_container');
window.onresize = function(){
	Ps.update(editor_container);
};
Ps.initialize(editor_container,{
	suppressScrollX: true
});
subscribe("/model/init",function(){
	Ps.update(editor_container);
});
subscribe("/meta/reset",function(){
	editor_container.scrollTop = 0;
	Ps.update(editor_container);
});

///////////////////////
//// RESIZE SHTUFF ////
///////////////////////

window.addEventListener("resize",function(){
	publish("ui/resize");
},false);



})(window);