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
setInterval(onscroll,1000); // just update every second, whatever.

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

HELPING WITH THE SIMS 
open in a new tab,
and embedding them

***/

// Update example (separate func so can call for zoo over and over)
var updateExample = function(example){

	// Get iframe src
	var iframe = example.querySelector("iframe");
	var src = iframe.src;

	// Get the DOM
	var container = example.querySelector("#example_link");
	if(container.getAttribute("manual")) return; // NOPE
	container.innerHTML = ""; // clear

	// New DOM!
	var dom = document.createElement("span");

	// Link
	var link = document.createElement("a");
	link.innerHTML = "open in new tab";
	link.href = src;
	link.target = "_blank";
	dom.appendChild(link);

	// Divider
	var divider = document.createElement("span");
	divider.innerHTML = "&nbsp;||&nbsp;";
	dom.appendChild(divider);

	// Embed text
	var embed = document.createElement("span");
	embed.innerHTML = "embed";
	embed.style.cursor = "pointer";
	embed.onclick = function(){
		embed.style.cursor = "";
		embed.innerHTML = "paste this code in your site:&nbsp;";
		readonly.style.display = "inline-block";
	};
	dom.appendChild(embed);

	// Readonly input
	var readonly = document.createElement("input");
	var width = 800;
	var height = Math.round(width/(iframe.clientWidth/iframe.clientHeight));
	readonly.value = '<iframe width="'+width+'" height="'+height+'" src="'+src+'" frameborder="0"></iframe>';
	readonly.setAttribute("readonly",true);
	readonly.onclick = function(){
		readonly.select();
	};
	dom.appendChild(readonly);

	// Put it all in
	container.appendChild(dom);

};

// For each example...
var examples = document.querySelectorAll(".example");
for(var i=0;i<examples.length;i++){
	updateExample(examples[i]);
}

/***

ZOO SELECT

***/

var zoo_iframe = document.getElementById("zoo_iframe");
zoo_iframe.onload = onscroll;
var zoo_options = document.querySelectorAll("#zoo_select > div");

// Zoo click handler for all of them
var onSelectZoo = function(event){

	var simSource = event.target.getAttribute("src");
	zoo_iframe.src = simSource;

	// All de-selected...
	for(var i=0;i<zoo_options.length;i++){
		var option = zoo_options[i];
		option.removeAttribute("selected");
	}

	// ...except the one just selected, obviously.
	event.target.setAttribute("selected","true");

	// And update the Example Link
	updateExample(document.getElementById("zoo_example"));

};
for(var i=0;i<zoo_options.length;i++){
	var option = zoo_options[i];
	option.onclick = onSelectZoo;
}

// Run on the first one.
onSelectZoo({
	target: document.querySelector("#zoo_select > div:nth-child(1)")
});


},false);