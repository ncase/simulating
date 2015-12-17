window.addEventListener("load",function(){

/***

On scroll, tell each playable iframe whether they're on screen,
and if so, how far they are along the page.

Parallax Parameter:
< 0: below viewing screen
0 < x < 1: on screen
> 1: above viewing screen

Pick the last one on screen to be the one being played

***/
var onscroll = function(){
	var scrollY = window.pageYOffset;
	var innerHeight = window.innerHeight;
	var playables = document.querySelectorAll(".example>iframe, .splash>iframe");
	var messages = [];

	// Calculate parallax, and is it the last one on screen?
	for(var i=0;i<playables.length;i++){
		var p = playables[i];
		var top = p.offsetTop-innerHeight;
		var bottom = p.offsetTop+p.clientHeight;
		var parallax = (scrollY-top)/(bottom-top); // from 0 to 1
		messages[i] = {
			isOnScreen: (0<parallax && parallax<1),
			parallax: parallax
		};
	}

	// Send all the messages
	for(var i=0;i<messages.length;i++){
		var p = playables[i];
		var m = messages[i];
		p.contentWindow.postMessage(m,"*");
	}

};

window.addEventListener("scroll",onscroll,false);
setTimeout(onscroll,500);
setTimeout(onscroll,1000);
setTimeout(onscroll,1500);
setTimeout(onscroll,2000);

/***

When an input changes, update all spans that reuse it.

***/

var reader_texts = document.querySelectorAll(".reader_input");
for(var i=0;i<reader_texts.length;i++){
	var text = reader_texts[i];
	var _onInput = (function(t){

		var name = t.getAttribute("name");
		var selector = ".reader_output[name="+name+"]";
		var outputs = document.querySelectorAll(selector);

		return function(){

			for(var j=0;j<outputs.length;j++){
				var output = outputs[j];
				if(t.value==""){
					output.innerHTML = output.getAttribute("placeholder");
				}else{
					output.innerHTML = t.value;
				}
			}

		};
	})(text);
	_onInput();
	text.oninput = text.onchange = _onInput;
}

/***

When a choice changes, only show its corresponding span.

***/

var reader_choices = document.querySelectorAll(".reader_choice");

// FOR EACH CHOICE...
for(var i=0;i<reader_choices.length;i++){

	var choice = reader_choices[i];

	// When you make a selection...
	var _onSelect = (function(c){

		// Get ALL the Reflections affected by it.
		var name = c.getAttribute("name");
		var selector = ".reader_reflect[name="+name+"]";
		var reflections = document.querySelectorAll(selector);

		return function(event){

			// This choice's value
			var value = this.value;

			// For each Reflection
			for(var j=0;j<reflections.length;j++){

				var reflection = reflections[j];
				var children = reflection.children;

				// Hide every response, EXCEPT for the one
				for(var k=0;k<children.length;k++){
					var child = children[k];
					var isResponse = (child.getAttribute("value")==value);
					child.style.display = isResponse ? "inline" : "none";
				}

			}

		};

	})(choice);

	// Do it for the currently selected one
	var selected = choice.querySelector("input[type=radio][checked]");
	_onSelect.call(selected);

	// APPLY IT TO ALL THE RADIO BUTTONS
	var radios = choice.querySelectorAll("input[type=radio]");
	Array.prototype.forEach.call(radios, function(radio){
		radio.addEventListener('change', _onSelect);
	});

}

/***

BIGFOOT - Footnotes 

***/

$.bigfoot({
	buttonMarkup: "<div class='bigfoot-footnote__container'> <button class=\"bigfoot-footnote__button\" id=\"{{SUP:data-footnote-backlink-ref}}\" data-footnote-number=\"{{FOOTNOTENUM}}\" data-footnote-identifier=\"{{FOOTNOTEID}}\" alt=\"See Footnote {{FOOTNOTENUM}}\" rel=\"footnote\" data-bigfoot-footnote=\"{{FOOTNOTECONTENT}}\"> 💬{{SUP:label}} </button></div>"
});

},false);