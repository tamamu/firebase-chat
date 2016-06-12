var displayName = null;
var id = null;
var uid = null;

$(function(){
	$('#submit').on('click', submit);
	$('#logout').on('click', logout);
	construct();
	checkLoggedIn();
});

function checkLoggedIn(){
	firebase.auth().onAuthStateChanged(function(user) {
		if(user){
			$('#login-form').hide();
			$('#content').show();
			if(user.displayName==null){
				user.displayName = "名無し";
			}
			displayName = user.displayName;
			id = user.email;
			uid = user.uid;
		} else {
			$('#login-form').show();
			$('#content').hide();
			$('#signin').on('click', signin);
			$('#create-account').on('click', createAccount);
			$('#login-with-google').on('click', loginWithGoogle);
		}
	});
}

function loginWithGoogle(){
	var provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider).then(function(result) {
		var token = result.credential.accessToken;
		var user = result.user;
		console.log(user);
	}).catch(function(error) {
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // The email of the user's account used.
	  var email = error.email;
	  // The firebase.auth.AuthCredential type that was used.
	  var credential = error.credential;
	  console.log(errorCode);
	  console.log(errorMessage);
	  console.log(email);
	  console.log(credential);
	});
}

function logout(){
	firebase.auth().signOut().then(function() {
		//
	}, function(error) {
		console.log(error);
	});
}

function construct(){
	firebase.database().ref('posts/').on('child_added', function(data) {
		console.log(data.val());
		$('<li>').text(data.val().body).prependTo('#messages');
	});
}

function createAccount(){
	var email = document.getElementById('email').value;
	var password = document.getElementById('password').value;
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(errorCode);
		console.log(errorMessage);
		alert("登録するメールアドレスとパスワードを入力してください");
	});
}

function signin(){
	var email = document.getElementById('email').value;
	var password = document.getElementById('password').value;
	firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(errorCode);
		console.log(errorMessage);
	});
}

function submit(){
	var remark = document.getElementById('remark').value;
	if(remark===""){
		return false;
	}
	document.getElementById('remark').value = "";
	console.log(writeNewPost(uid, displayName, remark));
}

function writeNewPost(uid, username, body){
	var postData = {
		username: username,
		uid: uid,
		body: body,
		date: new Date()
	};
	var newPostKey = firebase.database().ref().child('posts').push().key;

	var updates = {};
	updates['/posts/' + newPostKey] = postData;
	updates['/user-posts/' + uid + '/' + newPostKey] = postData;

	return firebase.database().ref().update(updates);
}