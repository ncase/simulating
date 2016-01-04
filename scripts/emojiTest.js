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

	// Windows: FAIL ON VISTA/XP, otherwise EVERYTHING EXCEPT CHROME
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
			fail(); return;	
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