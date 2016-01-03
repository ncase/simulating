window.browserSupportsEmoji = function(){

	var canvas = document.createElement('canvas'),
		context = canvas.getContext && canvas.getContext('2d');
	if ( ! context || ! context.fillText ) {
		return false;
	}

	/*
	 * This creates a smiling emoji, and checks to see if there is any image data in the
	 * center pixel. In browsers that don't support emoji, the character will be rendered
	 * as an empty square, so the center pixel will be blank.
	 */
	context.textBaseline = 'top';
	context.font = '32px Arial';
	context.fillText( String.fromCharCode( 55357, 56835 ), 0, 0 );
	var supportsEmoji = (context.getImageData( 16, 16, 1, 1 ).data[0] !== 0);
	return supportsEmoji;

};