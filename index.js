/*jshint esnext: true, moz: true*/
/*jslint browser:true */

//=============================================================
//GLOBALS
var provider = new firebase.auth.GithubAuthProvider();
var loginBtn = document.getElementById("loginBtn");
var profilePic = document.getElementById("profilePic");
var greetings = document.getElementById("greeting");

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
        existingUser(result);
    })
    .catch((error)=>{
        console.log(error);
    });
}


//=============================================================
//functions


//Log in --------------------------------------------
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

function existingUser(result){
    let user = result.user.providerData[0];
    let id = user.uid;
    
    firebase.database().ref("users/" + id).once("value",(snapshot)=>{
        let userName;
        try{
            userName = snapshot.val().userName;
        }catch(e){
            console.log(e);
        }
            
        if(snapshot.val() === null){
            firstTimeUser(user);
            
        }
        else if(userName !== undefined){
            greetings.textContent = `Welcome ${userName}`;
        }

    });       
}

function getLogedinUserInfo(user,username){
    
    let logedinUser = {
        name: user.displayName,
        email: user.email,
        profilePic: user.photoURL,
        uid: user.uid,
        userName: username
    };
    localStorage.setItem("logedinUser", JSON.stringify(logedinUser));
    profilePic.src=user.photoURL;
    firebase.database().ref("users/" + username).set(logedinUser);
}

function firstTimeUser(user){
    let newUserDiv = document.getElementById("newUser");
    let message = newUserDiv.children[1].textContent;
    let newUsername;
    let submit = newUserDiv.children[3];
    
    newUserDiv.style.display = "flex";
    
    submit.addEventListener("click", ()=>{
        newUsername = newUserDiv.children[2].value;
        if(newUsername !== ""){
            firebase.database().ref("users/").once("value", (snapshot)=>{
                let data = snapshot.val();
                for(let prop in data){
                    if(data[prop] == newUsername ){
                        message.style.color = "red";
                        message = "Error: Username taken";
                    }
                    else{
                        newUserDiv.style.display = "none";
                        getLogedinUserInfo(user,newUsername);
                    }
                }
            });
        }else{
            message.style.color = "red";
            message = "Error: field empty";
        }
    });
    
}

//END
//--------------------------------------------------