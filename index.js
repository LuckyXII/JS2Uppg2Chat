/*jshint esnext: true, moz: true*/
/*jslint browser:true */

//=============================================================
//GLOBALS
var provider = new firebase.auth.GithubAuthProvider();
var loginBtn = document.getElementById("loginBtn");
var profilePic = document.getElementById("profilePic");

//=============================================================
//Main



//=============================================================
//Callbacks
loginBtn.addEventListener("click", login$logout);

//=============================================================
//FIREBASE

//Authenticate User GitHub
function authGithub(){
    firebase.auth().signInWithPopup(provider)
    .then((result)=>{
        console.log(result);
        getLogedinUserInfo(result);
    })
    .catch((error)=>{
        console.log(error);
    });
}


//=============================================================
//functions

function login$logout(){
    let gitHubIcon = document.getElementById("GH");
    if(loginBtn.textContent == "Log In"){
        authGithub();
        loginBtn.textContent = "Log Out";
        gitHubIcon.style.display = "none";
        profilePic.style.display = "inline-block";
    }
    else if(loginBtn.textContent == "Log Out"){
        localStorage.removeItem("logedinUser");
        loginBtn.textContent = "Log In";
        gitHubIcon.style.display = "inline-block";
        profilePic.style.display = "none";
    }
}

function getLogedinUserInfo(result){
    let user = result.user.providerData[0];
    let logedinUser = {
        name: user.displayName,
        email: user.email,
        profilePic: user.photoURL,
        uid: user.uid
    };
    localStorage.setItem("logedinUser", logedinUser);
    profilePic.src=user.photoURL;
    firebase.database().ref("users/" + user.uid).set(logedinUser);
}