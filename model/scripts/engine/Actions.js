/***

Agent actions! They're basically short code statements.
Actions can include other actions, like “if condition then [Other Action]”
Also it uses an external JSON object, so it's easier to make
a realtime for-human-consumption UI.

***/

(function(exports){

exports.Actions = {};

// Perform Actions. Recursive.
exports.PerformActions = function(agent, actionConfigs){
	
	// To tell if the agent's switched states.
	// As soon as it does that, STOP DOING ACTIONS
	var initialNextState = agent.nextStateID;

	// Go through all actions until it switches states.
	for(var i=0;i<actionConfigs.length;i++){
		var config = actionConfigs[i];
		var action = Actions[config.type];
		action.step(agent,config);
		if(agent.nextStateID!=initialNextState) return;
	}
	
};

// GO_TO_STATE: Simply go to that state
Actions.go_to_state = {
	
	name: "Turn into...",

	props: {stateID:0},
	
	step: function(agent,config){
		agent.nextStateID = config.stateID;
	},

	ui: function(config){
		return EditorHelper()
				.label("Turn into ")
				.stateSelector(config, "stateID")
				.dom;
	}

};

// IF_NEIGHBOR: If more/less/equal X neighbors are a certain state, do a thing
Actions.if_neighbor = {
	
	name: "If certain number of certain neighbors...",

	props: {
		sign: ">=",
		num: 3,
		stateID: 0,
		actions:[]
	},

	step: function(agent,config){

		// First, get num of actual neighbors that are STATE
		var count = Grid.countNeighbors(agent, config.stateID);

		// Did condition pass?
		var pass;
		switch(config.sign){
			case "<":
				pass = (count<config.num);
				break;
			case "<=":
				pass = (count<=config.num);
				break;
			case ">":
				pass = (count>config.num);
				break
			case ">=":
				pass = (count>=config.num);
				break;
			case "=":
				pass = (count==config.num);
				break;
		}

		// If so, perform the following actions.
		if(pass){
			PerformActions(agent, config.actions);
		}

	},

	ui: function(config){

		return EditorHelper()
				.label("If ")
				.selector([
					{ name:"less than (<)", value:"<" },
					{ name:"up to (≤)", value:"<=" },
					{ name:"more than (>)", value:">" },
					{ name:"at least (≥)", value:">=" },
					{ name:"exactly (=)", value:"=" }
				],config,"sign")
				.label(" ")
				.number(config, "num", {
					integer:true,
					min:0, max:8,
					step:1
				})
				.label(" neighbors are ")
				.stateSelector(config, "stateID")
				.actionsUI(config.actions)
				.dom;

	}

};

// IF_RANDOM: With a X% chance, do a thing
Actions.if_random = {
	
	name: "With a X% chance...",

	props: {
		probability: 0.01,
		actions:[]
	},

	step: function(agent,config){

		// If dice roll wins, perform the following actions.
		if(Math.random()<config.probability){
			PerformActions(agent, config.actions);
		}

	},

	ui: function(config){

		return EditorHelper()
				.label("With a ")
				.number(config, "probability", {
					multiplier:100,
					min:0, max:100,
					step:0.1
				})
				.label("% chance,")
				.actionsUI(config.actions)
				.dom;

	}

};

// MOVE_TO: Move to a (nearby|global) (state) spot in and leave behind (state) 
Actions.move_to = {
	
	name: "Move to...",

	props: {
		space: 0,
		spotStateID: 0,
		leaveStateID: 0,
	},

	step: function(agent,config){

		// Get possible spots
		var spots;
		if(config.space==0){ // local
			spots = Grid.getNeighbors(agent);
		}else if(config.space==1){ // global
			spots = Grid.getAllAgents();
		}

		// Filter for only those whose states == spotStateID
		var eligible = spots.filter(function(agent){
			return(agent.stateID==config.spotStateID);
		});

		// If no eligible spots, WELP.
		if(eligible.length==0){
			return;
		}

		// Randomly pick one
		var chosenSpot = eligible[Math.floor(Math.random()*eligible.length)];

		// Force that agent to my state
		chosenSpot.forceState(agent.stateID);

		// Turn my state to leaveState
		agent.nextStateID = config.leaveStateID;

	},

	ui: function(config){

		return EditorHelper()
				.label("Move to ")
				.selector([
					{ name:"a neighboring", value:0 },
					{ name:"any", value:1 }
				],config,"space")
				.stateSelector(config, "spotStateID")
				.label(" spot & leave behind ")
				.stateSelector(config, "leaveStateID")
				.dom;

	}

}; 

})(window);
