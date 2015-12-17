function Agent(x,y){

	var self = this;

	// Space & State
	self.x = x;
	self.y = y;
	self.stateID = 0;

	// For updating
	self.updated = false;
	self.nextStateID = self.stateID;
	self.markAsNotUpdated = function(){
		self.updated = false;
	};
	self.calculateNextState = function(){

		// If already "updated"
		if(self.updated) return;

		// Stay the same by default
		self.nextStateID = self.stateID;

		// Get actions to perform
		var state = Model.getStateByID(self.stateID);
		if(state){
			PerformActions(self, state.actions);
		}else{
			// state has been deleted. become a zero.
			self.forceState(0);
		}
		

	};
	self.gotoNextState = function(){
		self.stateID = self.nextStateID;
	};
	self.forceState = function(stateID){
		stateID = stateID || 0;
		self.stateID = self.nextStateID = stateID;
		self.updated = true;
	};

}