(function(exports){

var firebaseURL = 'https://torrid-inferno-877.firebaseio.com/models/';
var myDataRef = new Firebase(firebaseURL);
Firebase.goOffline(); // to reduce currently open connections

///////////////////

exports.Save = {};

Save.baseURL = firebaseURL;
Save.uploadModel = function(){

	Firebase.goOnline(); 
    var saved = myDataRef.push(Model.data,function(){
    	var currentURL = [location.protocol, '//', location.host, location.pathname].join('');
    	var link = currentURL+"?remote="+saved.key();
        publish("/save/success",[link]);
        Firebase.goOffline();
    });

};

})(window);