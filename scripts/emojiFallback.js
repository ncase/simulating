(function(){

IfDoesNotSupportEmoji(function(){

	// Add this new style
	var style = document.createElement("style");
	style.innerHTML = ''+
	'@font-face {'+
		'font-family: "OpenSansEmoji";'+
		'src: url("styles/fonts/OpenSansEmoji.otf") format("opentype");'+
	'}'+
	'#emoji_warning {'+
		'display: block;'+
	'}';
	document.body.appendChild(style);

});

})();