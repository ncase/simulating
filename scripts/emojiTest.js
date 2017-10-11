(function(exports){

// SCREW IT.
// According to Can I Emoji: http://caniemoji.com/
// Mac: EVERYTHING WORKS for 10.7 and higher
// Windows: FAIL ON VISTA/XP, otherwise EVERYTHING EXCEPT CHROME
// iOS & Andoid & Windows Phone: YES BUT THIS ISN'T MOBILE-FRIENDLY
// Linux/Everything Else: SORRY

exports.IfDoesNotSupportEmoji = function(fail){

	// Mac: EVERYTHING WORKS for 10.7 and higher
	if(platform.os.family=="OS X"){
		var version = parseInt(platform.os.version.split(".")[1]);
		if(version>=7){
			return;
		}else{
			fail(); return;	
		}
	}

	// Windows: FAIL ON VISTA/XP, otherwise EVERYTHING EXCEPT CHROME(lower than v53)
	var isWindows = (platform.os.family.search("Windows")>=0); // it contains "Windows" somewhere
	if(isWindows){
		if(platform.os.family=="Windows Vista / Server 2008"){
			fail(); return;
		}
		if(platform.os.family=="Windows XP 64-bit / Server 2003"){
			fail(); return;
		}
		if(platform.os.family=="Windows XP"){
			fail(); return;
		}
		if(platform.name=="Chrome"){
			// Chrome added support for color emoji in version 53 released September 2016
			var chromeVersion = parseInt(platform.version.split(".")[0]);
			if(chromeVersion>=53){
				return;
			}else{
				fail(); return;	
			}
		}
		return;
	}

	// iOS & Andoid & Windows Phone: YES BUT THIS ISN'T MOBILE-FRIENDLY
	if(platform.os.family=="Android") return;
	if(platform.os.family=="iOS") return;
	if(platform.os.family=="Windows Phone") return;

	// Linux/Everything Else: SORRY
	fail();

};

})(window);
