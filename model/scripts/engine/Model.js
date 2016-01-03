/**********************

All agents, objects and such should be shallow shells.
That is, this ONE JSON file should control ALL the behavior.
This way, it's really easy to change it at runtime,
as well as serialize & deserialize.

***********************/

(function(exports){

	// Singleton
	window.Model = {};

	// Data
	Model.data = {};
	Model.backup = null;

	// Init
	Model.init = function(data){

		// Save data (and backup for a reset)
		Model.data = data;
		Model.backup = JSON.parse(JSON.stringify(Model.data));

		// Initialize crap
		Grid.initialize();

		// Any controls at all?
		if(UI.options.edit!=UI.NONE) Editor.create(Model.data);

		// Paused?
		Model.isPlaying = (UI.options.paused==UI.NONE);

		// Update the emoji
		publish("/grid/updateSize");

		// Start animating
		requestAnimationFrame(Model.tick);
		publish("/grid/updateAgents"); // show it at first, in case it's paused

		// Publish
		publish("/model/init");

	};

	// Return to backup.
	Model.returnToBackup = function(){

		// Copy to the main model.
		Model.data = JSON.parse(JSON.stringify(Model.backup));

		// Reinitialize Grid
		Grid.reinitialize();

		// Back to original description
		Editor.descriptionDOM.value = Model.data.meta.description;
		Editor.descriptionDOM.oninput();

		// Remove & recreate all the states
		Editor.statesDOM.innerHTML = "";
		Editor.createStatesUI(Editor.statesDOM, Model.data.states);
		publish("/ui/updateStateHeaders");

		// Also, recreate World UI
		Editor.worldDOM.innerHTML = "";
		Editor.worldDOM.appendChild(Grid.createUI());

		// Publish message
		publish("/meta/reset/complete");

	};

	// Playing...
	Model.isPlaying = true;
	Model.play = function(){
		Model.isPlaying = true;
	};
	Model.pause = function(){
		Model.isPlaying = false;
	};
	var _lastTimestamp = null;
	var _ticker = 0;
	Model.tick = function(timestamp){

		// RAF
		requestAnimationFrame(Model.tick);

		// Figure out the timing...
		if(!_lastTimestamp) _lastTimestamp=timestamp;
		var delta = timestamp-_lastTimestamp;
		_ticker += delta;
		_lastTimestamp=timestamp;

		// If _ticker is below the limit to update, don't.
		var tickerLimit = 1000/Model.data.meta.fps;
		if(_ticker<tickerLimit) return;
		
		// Otherwise, find out how many steps you missed.
		var steps = 0;
		while(_ticker>=tickerLimit){
			steps++;
			_ticker -= tickerLimit;
		}
		if(steps>3) steps=3; // yeah don't go overboard here.

		// Paused, or not seen - also don't update
		if(!Model.isPlaying) return;
		if(!window.isOnScreen) return;

		// If after all that, it should STEP...
		for(var i=0;i<steps;i++){
			Grid.step();
		}

		// ...and UPDATE SCREEN
		publish("/grid/updateAgents");

	};

	// Helper Functions
	Model.getStateByID = function(id){
		for(var i=0;i<Model.data.states.length;i++){
			var state = Model.data.states[i];
			if(state.id==id) return state;
		}
		return null;
	};
	Model.removeStateByID = function(id){
		for(var i=0;i<Model.data.states.length;i++){
			var state = Model.data.states[i];
			if(state.id==id){
				Model.data.states.splice(i,1);
				return;
			}
		}
	};
	Model.generateNewID = function(){
		var highestID = -1;
		for(var i=0;i<Model.data.states.length;i++){
			var state = Model.data.states[i];
			if(highestID < state.id){
				highestID = state.id;
			}
		}
		return highestID+1;
	};

	// Just cycle through emoji!
	var emojiIndex = -1;
	var emojis = [
		{ icon: "😺" },
		{ icon: "📕" },
		{ icon: "💀" },
		{ icon: "🍇" },
		{ icon: "🎱" },
		{ icon: "🍵" },
		{ icon: "🐚" }
	];
	Model.generateNewEmoji = function(){
		return { icon: "💩" };
		/*
		emojiIndex = (emojiIndex+1)%emojis.length;
		return emojis[emojiIndex];
		*/
	};

})(window);
