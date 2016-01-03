window.isOnScreen = true;// (window.top == window);
window.addEventListener("message", function(event){
	window.isOnScreen = event.data.isOnScreen;
}, false);