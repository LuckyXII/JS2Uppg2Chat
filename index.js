/*jshint esnext: true, moz: true*/
/*jslint browser:true */

//=============================================================
//GLOBALS
var provider = new firebase.auth.GithubAuthProvider();
var loginBtn = document.getElementById("loginBtn");

//=============================================================
//Main



//=============================================================
//Callbacks
loginBtn.addEventListener("click", authGithub);

//=============================================================
//FIREBASE

//Authenticate User GitHub
function authGithub(){
    firebase.auth().signInWithPopup(provider)
    .then((result)=>{
        console.log(result);
    })
    .catch((error)=>{
        console.log(error);
    });
}


//=============================================================
//functions