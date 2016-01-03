(function(exports){

// Chrome and Safari
var _test1 = function(callback){

	// Just draws a smiley, tests if it's there
	var canvas = document.createElement('canvas'),
		context = canvas.getContext('2d');
	context.textBaseline = 'top';
	context.font = '32px Arial';
	context.fillText( String.fromCharCode( 55357, 56835 ), 0, 0 );
	var supportsEmoji = (context.getImageData( 16, 16, 1, 1 ).data[0] !== 0);
	
	// Call back immediately
	callback(supportsEmoji);

};

// For Firefox, gawd
var _test2 = function(callback){

	// Does some bullshenanigans with doing an SVG first.
	var canvas = document.createElement('canvas'),
    div = document.createElement('div'),
    context = canvas.getContext('2d'),
    emoji = String.fromCharCode( 55357, 56835 ),
    style = '32px Arial';

	div.style.font = style;
	div.innerHTML = emoji;

	var svgData = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
	           '<foreignObject width="100%" height="100%">' +
	           '<div xmlns="http://www.w3.org/1999/xhtml" style="font: ' + style + '">' + emoji +
	           '</div></foreignObject>' +
	           '</svg>';

	// ASYNC, CRAP.
	var img = new Image();
	img.onload = function(){
		context.drawImage(img, 0, 0);
		var supportsEmoji = (context.getImageData( 16, 16, 1, 1 ).data[0] !== 0);
		callback(supportsEmoji);
	}
	img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));

};

// Please please PLEASE work in other browsers on other OS's.
// Run all tests...
exports.IfDoesNotSupportEmoji = function(callback){

	// for testing...
	//callback(); return;

	_test1(function(pass1){
		if(pass1) return;

		_test2(function(pass2){
			if(pass2) return;
			callback();
		});

	});

};

})(window);