(function(exports){

// Singleton Class
exports.Editor = {};

// DOM
Editor.dom = document.getElementById("editor");

// Create from model
Editor.create = function(){

	///////////////////////
	///// DESCRIPTION /////
	///////////////////////

	// Description
	var desc = Editor.createTextArea(Model.data.meta, "description", {fontSize:18});
	Editor.descriptionDOM = desc;
	Editor.dom.appendChild(Editor.descriptionDOM);

	// Divider
	var hr = document.createElement("hr");
	Editor.dom.appendChild(hr);

	//////////////////////
	///// STATES DOM /////
	//////////////////////

	var title = Editor.createTitle("<span>THINGS</span> WITH RULES");
	Editor.dom.appendChild(title);

	Editor.statesDOM = document.createElement("div");
	Editor.dom.appendChild(Editor.statesDOM);
	Editor.createStatesUI(Editor.statesDOM, Model.data.states);

	// Button - Add a state!
	var addState = document.createElement("div");
	addState.className = "editor_fancy_button";
	addState.innerHTML = "<span>+</span>make new thing";
	addState.onclick = function(){

		// New state config
		var emoji = Model.generateNewEmoji();
		var newStateConfig = {
			id: Model.generateNewID(),
			icon: emoji.icon,
			name: "[new thing]",
			description: "Click icon & paste in new emoji:\nMac: press control+command+space\nOther: copy from Emojipedia.org",
			actions: []
		};

		// Add to Model.data
		Model.data.states.push(newStateConfig);

		// Create new DOM & append to states container
		var stateDOM = Editor.createStateUI(newStateConfig);
		Editor.statesDOM.appendChild(stateDOM);

		// Hey y'all
		publish("/ui/addState",[newStateConfig.id]);
		publish("/ui/updateStateHeaders");

	};
	Editor.dom.appendChild(addState);

	// Divider
	var hr = document.createElement("hr");
	Editor.dom.appendChild(hr);

	/////////////////////
	///// WORLD DOM /////
	/////////////////////

	var title = Editor.createTitle("THE <span>WORLD</span>");
	Editor.dom.appendChild(title);

	Editor.worldDOM = document.createElement("div");
	Editor.dom.appendChild(Editor.worldDOM);

	Editor.worldDOM.appendChild(Grid.createUI());

	// Divider
	var hr = document.createElement("hr");
	Editor.dom.appendChild(hr);

	//////////////////////
	///// META STUFF /////
	//////////////////////

	/*var title = Editor.createTitle("<span>MISC</span> STUFF");
	Editor.dom.appendChild(title);*/

	// Reset to original
	var undoChanges = document.createElement("div");
	undoChanges.className = "editor_fancy_button";
	undoChanges.style.marginBottom = "20px";
	undoChanges.innerHTML = "<span style='font-size:25px; line-height:40px;'>⟳</span>undo all changes";
	undoChanges.onclick = function(){
		publish("/meta/reset");
		Model.returnToBackup();
	};
	Editor.dom.appendChild(undoChanges);

	// If options allow saving changes, and export data
	if(UI.options.edit==UI.ADVANCED){

		// Divider
		Editor.dom.appendChild(document.createElement("br"));

		// Save your changes
		var saveChanges = document.createElement("div");
		saveChanges.className = "editor_fancy_button";
		saveChanges.id = "save_changes";
		saveChanges.innerHTML = "<span style='font-size:30px; line-height:40px'>★</span>save your model";
		saveChanges.onclick = function(){
			saveLabel.innerHTML = "saving...";
			embedLabel.innerHTML = "...";
			saveLink.value = "...";
			embedLink.value = "...";
			Save.uploadModel();
		};
		Editor.dom.appendChild(saveChanges);

		// Save your changes, label & link, label & embed
		
		// save label
		var saveLabel = Editor.createLabel("when you save your model, you'll get a link here:")
		saveLabel.style.display = "block";
		saveLabel.style.margin = "10px 0";
		Editor.dom.appendChild(saveLabel);

		// save link
		var saveLink = document.createElement("input");
		saveLink.type = "text";
		saveLink.className = "editor_save_link";
		saveLink.setAttribute("readonly",true);
		saveLink.onclick = function(){
			saveLink.select();
		};
		Editor.dom.appendChild(saveLink);

		// embed label 
		var embedLabel = Editor.createLabel("and an embed code here:")
		embedLabel.style.display = "block";
		embedLabel.style.margin = "10px 0";
		Editor.dom.appendChild(embedLabel);

		// embed link
		var embedLink = document.createElement("input");
		embedLink.type = "text";
		embedLink.className = "editor_save_link";
		embedLink.setAttribute("readonly",true);
		embedLink.onclick = function(){
			embedLink.select();
		};
		Editor.dom.appendChild(embedLink);

		// divider
		Editor.dom.appendChild(document.createElement("br"));
		Editor.dom.appendChild(document.createElement("br"));
		Editor.dom.appendChild(document.createElement("br"));

		// on save success
		subscribe("/save/success",function(link){

			saveLabel.innerHTML = "here you go! <a href='"+link+"' target='_blank'>(open in new tab)</a>";
			saveLink.value = link;
			embedLabel.innerHTML = "to embed it, paste this code in your site:";

			var width = 800;
			var height = Math.round(width/(document.body.clientWidth/document.body.clientHeight));
			embedLink.value = '<iframe width="'+width+'" height="'+height+'" src="'+link+'" frameborder="0"></iframe>';
			
		});

		// Export your data
		var exportModel = document.createElement("div");
		exportModel.className = "editor_fancy_button";
		exportModel.id = "save_changes";
		exportModel.innerHTML = "<span style='font-size:25px; line-height:35px; font-family:monospace'>{}</span>export model";
		exportModel.onclick = function(){
			window.open("data:text/json;charset=utf-8, "+JSON.stringify(Model.data));
		};
		Editor.dom.appendChild(exportModel);

		// export label 
		var exportLabel = Editor.createLabel(
			"This is for those of you who want to save your sim to your own computertron! "+
			"<a href='https://github.com/ncase/simulating#how-to-run-this-on-your-own-computertron' target='_blank'>[How To Do That]</a> "+
			"Click the above button to open your sim's data in a new tab. "+
			"Save it as <span style='font-family:monospace'>[your sim name].json</span>. "+
			"(Remember the \".json\"! It's important!)"
		);
		exportLabel.style.display = "block";
		exportLabel.style.margin = "10px 0";
		Editor.dom.appendChild(exportLabel);

	}


};

Editor.createTitle = function(html){
	var dom = document.createElement("div");
	dom.className = "editor_title";
	dom.innerHTML = html;
	return dom;
};

Editor.createTextArea = function(config, propName, options){

	options = options || {};

	// Input
	var input = document.createElement("textarea");
	input.value = config[propName];
	input.className ="editor_textarea";
	input.style.fontSize = (options.fontSize || 16)+"px";

	// Update on change
	input.oninput = function(){
		config[propName] = input.value;
		_resize();
	};

	// Resize
	var _resize = function(){
		input.style.height = "1px";
    	input.style.height = (input.scrollHeight)+"px";
	};
	var _listener1 = subscribe("ui/resize",_resize);
	setTimeout(_resize,1);

	// KILL IT ALL
	var _listener2 = subscribe("/meta/reset",function(){
		unsubscribe(_listener1);
		unsubscribe(_listener2);
	});

	return input;

};

Editor.createStatesUI = function(dom, stateConfigs){

	// For each state config...
	for(var i=0;i<stateConfigs.length;i++){
		var stateConfig = stateConfigs[i];
		var stateDOM = Editor.createStateUI(stateConfig);
		dom.appendChild(stateDOM);
	}

};

Editor.createStateUI = function(stateConfig){

	// Create DOM
	var dom = document.createElement("div");
	dom.className = "editor_state";

	// Header: Icon & Title
	var stateHeader = document.createElement("div");
	stateHeader.className = "editor_state_header";
	dom.appendChild(stateHeader);

	// Icon
	var icon = document.createElement("input");
	icon.className = "editor_icon";
	icon.type = "text";
	icon.value = stateConfig.icon;
	icon.oninput = function(){
		stateConfig.icon = icon.value;
		publish("/ui/updateStateHeaders");
	};
	icon.onclick = function(){
		icon.select();
	};
	stateHeader.appendChild(icon);

	// Name
	var name = document.createElement("input");
	name.className = "editor_name";
	name.type = "text";
	name.value = stateConfig.name;
	name.oninput = function(){
		stateConfig.name = name.value;
		publish("/ui/updateStateHeaders");
	};
	stateHeader.appendChild(name);

	// Delete (except 0-blank, you CAN'T delete that)
	if(stateConfig.id!=0){
		var deleteDOM = document.createElement("div");
		deleteDOM.className ="delete_state";
		deleteDOM.innerHTML = "⊗";
		(function(stateConfig){
			deleteDOM.onclick = function(){
				Model.removeStateByID(stateConfig.id); // Splice away
				publish("/ui/removeState",[stateConfig.id]); // remove state
				publish("/ui/updateStateHeaders"); // update state headers
				Editor.statesDOM.removeChild(dom); // and, remove this DOM child
			};
		})(stateConfig);
		stateHeader.appendChild(deleteDOM);
	}

	// Description
	var description = Editor.createTextArea(stateConfig, "description");
	dom.appendChild(description);

	// Actions
	var actionConfigs = stateConfig.actions;
	var actionsDOM = Editor.createActionsUI(actionConfigs);
	dom.appendChild(actionsDOM);

	// Return dom
	return dom;

};

Editor.createActionsUI = function(actionConfigs, dom){

	// Reset/Create DOM
	if(dom){
		dom.innerHTML = "";
	}else{
		dom = document.createElement("div");
		dom.className = "editor_actions";
	}

	// List
	var list = document.createElement("ul");
	dom.appendChild(list);

	// All them actions
	for(var i=0;i<actionConfigs.length;i++){

		// Action
		var actionConfig = actionConfigs[i];

		// Entry
		var entry = document.createElement("li");
		list.appendChild(entry);

		// Delete button
		var deleteDOM = document.createElement("div");
		deleteDOM.className ="delete_action";
		deleteDOM.innerHTML = "⊗";

		(function(actionConfigs,actionConfig,list,entry){

			// WELL HERE'S THE PROBLEM, WE'RE DOING IT BY INDEX,
			// WHEN THE INDEX CAN FRIKKIN' CHANGE.

			deleteDOM.onclick = function(){
				var index = actionConfigs.indexOf(actionConfig);
				actionConfigs.splice(index,1); // Splice away
				list.removeChild(entry); // remove entry
			};

		})(actionConfigs,actionConfig,list,entry);

		entry.appendChild(deleteDOM);

		// The actual action
		var actionDOM = Editor.createActionUI(actionConfigs[i]);
		entry.appendChild(actionDOM);
		
	}

	// Add action?
	var entry = document.createElement("li");
	var addAction = Editor.createActionAdder(actionConfigs, dom);
	entry.appendChild(addAction);
	list.appendChild(entry);
	
	// Return dom
	return dom;

};

Editor.createActionUI = function(actionConfig){
	var action = Actions[actionConfig.type];
	return action.ui(actionConfig);
};

Editor.createLabel = function(words){
	var label = document.createElement("span");
	label.innerHTML = words;
	return label;
};

Editor.createActionAdder = function(actionConfigs, dom){

	var keyValues = [];

	// Default: nothing. just a label.
	keyValues.push({
		name: "+new",
		value:""
	});

	// Populate with Actions
	for(var key in Actions){
		var action = Actions[key];
		var name = action.name;
		var value = key;
		keyValues.push({name:name, value:value});
	}

	// Create select (placeholder options)
	var actionConfig = {action:""};
	var propName = "action";
	var select = Editor.createSelector(keyValues,actionConfig,propName);

	// Select has new oninput
	select.onchange = function(){

		// default, nvm
		if(select.value=="") return;

		// otherwise, add new action to this array
		var key = select.value;
		var defaultProps = Actions[key].props;
		var actionConfig = JSON.parse(JSON.stringify(defaultProps)); // clone
		actionConfig.type = key;
		actionConfigs.push(actionConfig);

		// then, force that DOM to RESET
		Editor.createActionsUI(actionConfigs, dom);

	};

	// Create a better DOM
	var selectContainer = document.createElement("div");
	selectContainer.className ="editor_new_action";
	var button = document.createElement("div");
	button.innerHTML = "+new";
	selectContainer.appendChild(button);
	selectContainer.appendChild(select);

	return selectContainer;

};

Editor.createSelector = function(keyValues, actionConfig, propName, options){

	// Select.
	var select = document.createElement("select");
	select.type = "select";

	// Options
	options = options || {};
	if(options.maxWidth) select.style.maxWidth = options.maxWidth;

	// Populate options: icon + name for each state, value is the ID.
	for(var i=0;i<keyValues.length;i++){
		
		var keyValue = keyValues[i];

		// Create option
		var option = document.createElement("option");
		option.innerHTML = keyValue.name;
		option.value = keyValue.value;
		select.appendChild(option);

		// Is it selected?
		var selectedValue = actionConfig[propName];
		if(keyValue.value==selectedValue){
			option.selected = true;
		}

	}

	// Update the state on change
	select.onchange = function(){
		actionConfig[propName] = select.value;
	};
	
	// Return
	return select;

};

Editor.createStateSelector = function(actionConfig, propName){

	// Select.
	var select = document.createElement("select");
	select.type = "select";

	// Populate options: icon + name for each state, value is the ID.
	var _populateList = function(){
		select.innerHTML = "";
		var stateConfigs = Model.data.states;
		var selectedAnOption = false;
		for(var i=0;i<stateConfigs.length;i++){
			
			var stateConfig = stateConfigs[i];

			// Create option
			var option = document.createElement("option");
			option.innerHTML = stateConfig.icon + ": " + stateConfig.name;
			option.value = stateConfig.id;
			select.appendChild(option);

			// Is it selected?
			var selectedID = actionConfig[propName];
			if(stateConfig.id==selectedID){
				option.selected = true;
				selectedAnOption = true
			}

		}

		// If none was selected, then make blank selected.
		if(!selectedAnOption){
			select.value = 0; // blank
			select.onchange();
		}

	};

	// Update the state on change
	select.onchange = function(){
		actionConfig[propName] = select.value;
	};

	// Call func
	_populateList();

	// Update to OTHERS' changes
	var _listener1 = subscribe("/ui/updateStateHeaders",_populateList);

	// KILL IT ALL
	var _listener2 = subscribe("/meta/reset",function(){
		unsubscribe(_listener1);
		unsubscribe(_listener2);
	});

	
	// Return
	return select;

};

Editor.createNumber = function(actionConfig, propName, options){

	// Options?
	options = options || {};
	options.multiplier = options.multiplier || 1;
	options.min = options.min || 0;
	options.max = options.max || 100;
	options.step = options.step || 1;

	// Input
	var input = document.createElement("input");
	input.type = "text";
	input.value = actionConfig[propName]*options.multiplier;
	input.className ="editor_number";
	input.options = options;

	// Decode value
	var _decodeValue = function(){
		
		var number;

		// Integer or not
		if(options.integer){
			number = parseInt(input.value);
		}else{
			number = parseFloat(input.value);
		}

		// Go to zero if it's just WRONG.
		if(isNaN(number)) number=0; // you messed up

		// Fix to constraints
		if(number < options.min){
			number = options.min;
		}
		if(number > options.max){
			number = options.max;
		}

		return number;
	};

	// Update on change
	input.oninput = function(){
		var number = _decodeValue();
		number /= options.multiplier;
		actionConfig[propName] = number;

		// Message?
		if(options.message) publish(options.message);
		
	};

	// When move away, fix it.
	input.onchange = function(){
		input.value = _decodeValue();
	};

	// MAKE IT SCRUBBABLE
	_makeScrubbable(input);

	// Return
	return input;

};

Editor.createProportions = function(){

	// A div, please.
	var dom = document.createElement("div");
	dom.className = "proportions";

	// Slider array!
	var sliders = [];

	// Populate...
	var proportions = Model.data.world.proportions;
	var _populate = function(){

		// Reset
		dom.innerHTML = "";
		sliders = [];

		// Also - remake all proportions so it always fits state order, using old parts
		var oldProportions = proportions;
		var newProportions = [];
		for(var i=0;i<Model.data.states.length;i++){

			// State ID
			var stateID = Model.data.states[i].id;

			// Parts
			var parts = 0;
			for(var j=0;j<oldProportions.length;j++){
				if(oldProportions[j].stateID == stateID) parts=oldProportions[j].parts;
			}

			// Do it.
			newProportions.push({stateID:stateID, parts:parts});
		}

		// Replace IN PLACE, so it's the SAME ARRAY, yo.
		var args = [0, oldProportions.length].concat(newProportions); // as arguments
		Array.prototype.splice.apply(proportions, args);

		// For each one...
		for(var i=0;i<proportions.length;i++){
			var proportion = proportions[i];
			var stateID = proportion.stateID;

			// Create Line
			var lineDOM = document.createElement("div");
			dom.appendChild(lineDOM);

			// Create Icon
			var iconDOM = document.createElement("span");
			iconDOM.innerHTML = Model.getStateByID(stateID).icon;
			lineDOM.appendChild(iconDOM);

			// Create Slider
			var slider = document.createElement("input");
			slider.type = "range";
			slider.min = 0;
			slider.max = 100;
			slider.step = 1;
			sliders.push(slider);
			lineDOM.appendChild(slider);

			// Slider value
			slider.value = proportion.parts;

			// Slider event
			(function(proportion,slider,index){
				slider.onmousedown = function(){
					selectedIndex = index;
					_createSnapshot();
				};
				slider.oninput = function(){
					proportion.parts = parseFloat(slider.value);
					_adjustAll();
					Grid.reinitialize();
				};
			})(proportion,slider,i);

		}
	};
	_populate();

	// Adjust 'em all dang it
	var selectedIndex = -1;
	var snapshot = [];
	var _createSnapshot = function(){
		snapshot = [];
		for(var i=0;i<proportions.length;i++){
			snapshot.push(proportions[i].parts); 
		}
	};
	var _adjustAll = function(){

		// SPECIAL CASE: If there's just ONE proportion, set to 100 & disable it.
		// DON'T DO ANYTHING ELSE.
		if(proportions.length==1){
			var newValue = 100;
			proportions[0].parts = newValue;
			sliders[0].value = newValue;
			sliders[0].disabled = true;
			return;
		}else{
			sliders[0].disabled = false;
		}

		// Which one's selected, if any?
		var selectedProportion = (selectedIndex<0) ? null : proportions[selectedIndex];
		var selectedSlider = (selectedIndex<0) ? null : sliders[selectedIndex];

		// FROM SNAPSHOT: Get total parts except selected
		var total = 0;
		for(var i=0;i<snapshot.length;i++){
			if(i!=selectedIndex) total+=snapshot[i];
		}
		
		// EDGE CASE: If old total IS ZERO, bump everything else by one.
		if(total==0){
			for(var i=0;i<snapshot.length;i++){
				if(i!=selectedIndex){
					snapshot[i]=1;
					total += 1;
				}
			}
		}

		// Calculate what the new total SHOULD be, from currently edited slider
		var newTotal = selectedSlider ? 100-parseInt(selectedSlider.value) : 100;

		// How much should each other slider be scaled?
		var newScale = newTotal/total;

		// Scale every non-selected proportion & slider to that, FROM SNAPSHOT
		for(var i=0;i<proportions.length;i++){
			if(i!=selectedIndex){
				var newValue = Math.round(snapshot[i]*newScale);
				proportions[i].parts = newValue;
				sliders[i].value = newValue;
			}
		}

	};

	// in case the data's bonked in the beginning, and doesn't add to 100
	_createSnapshot();
	_adjustAll();

	// When states change...
	var _listener1 = subscribe("/ui/updateStateHeaders",function(){

		// Repopulate
		_populate();

		// Adjust to a total of 100
		_createSnapshot();
		selectedIndex = -1;
		_adjustAll();

	});

	// KILL IT ALL
	var _listener2 = subscribe("/meta/reset",function(){
		unsubscribe(_listener1);
		unsubscribe(_listener2);
	});

	return dom;

};

/////////////////////////
///// EDITOR HELPER /////
/////////////////////////

var EditorShortcuts = function(dom){
	
	var self = this;
	self.dom = dom;

	var _shortcut = function(funcName){
		var nickname = funcName.charAt(0).toLowerCase() + funcName.substring(1);
		var fullname = "create"+funcName;
		self[nickname] = function(){
			var insertDOM = Editor[fullname].apply(null,arguments);
			self.dom.appendChild(insertDOM);
			return self;
		};
	};

	_shortcut("Label");
	_shortcut("StateSelector");
	_shortcut("Selector");
	_shortcut("Number");
	_shortcut("ActionsUI");
	_shortcut("Proportions");

};

exports.EditorHelper = function(tag){
	tag = tag || "span";
	var dom = document.createElement(tag);
	var shortcut = new EditorShortcuts(dom);
	return shortcut;
};

})(window);