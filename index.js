/*jshint esnext: true, moz: true*/
/*jslint browser:true */

//=============================================================
//GLOBALS
var provider = new firebase.auth.GithubAuthProvider();
var loginBtn = document.getElementById("loginBtn");
var profilePic = document.getElementById("profilePic");
var gitHubIcon = document.getElementById("GH");
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
        exsistingUser(result);
    })
    .catch((error)=>{
        console.log(error);
    });
}

function signOutGithub(){
    firebase.auth().signOut().then( (result)=> {
      console.log(result);
    }).catch(function(error) {
      console.log(error);
    });
}


//=============================================================
//functions


//Log in --------------------------------------------

function isLogedin(){
    let logedin = localStorage.getItem("logedinUser");
    let user;
    if(logedin !== null){
        user = JSON.parse(logedin);
        
        profilePic.src=user.profilePic;
        gitHubIcon.style.display = "none";
        profilePic.style.display = "inline-block";
        greetings.textContent = `Welcome ${user.username}`;
    }
}

//log in and out
function login$logout(){
    if(loginBtn.textContent == "Log In"){
        authGithub();
        loginBtn.textContent = "Log Out";
    }
    else if(loginBtn.textContent == "Log Out"){
        signOutGithub();
        localStorage.removeItem("logedinUser");
        loginBtn.textContent = "Log In";
        gitHubIcon.style.display = "inline-block";
        profilePic.style.display = "none";
        greetings.textContent = "Log in with GitHub";
    }
}

//check is new or exsisting user
function exsistingUser(result){
    let user = result.user.providerData[0];
    let username;
    let logedinUser = {
        name: user.displayName,
        email: user.email,
        profilePic: user.photoURL,
        uid: user.uid,
        userName: username
    };
    
    console.log(`users/${user.uid}`);
    firebase.database().ref(`users/${user.uid}`).once("value",(snapshot)=>{
        if(snapshot.val() === null){
            console.log(snapshot.val());
            firstTimeUser(user); 
        }
        else if(snapshot.val().userName !== undefined){
            username = snapshot.val().userName;
            let logedinUser = {
                name: user.displayName,
                email: user.email,
                profilePic: user.photoURL,
                uid: user.uid,
                userName: username
            };
            
            profilePic.src=user.photoURL;
            gitHubIcon.style.display = "none";
            profilePic.style.display = "inline-block";
            greetings.textContent = `Welcome ${username}`;
            localStorage.setItem("logedinUser", JSON.stringify(logedinUser));
        }
    });       
}

// new users set their userNames
function firstTimeUser(user){
    let newUserDiv = document.getElementById("newUser");
    let message = newUserDiv.children[1];
    let newUsername,foundUser;
    let submit = document.getElementById("submitUsername");
    
    newUserDiv.style.display = "flex";
    
    submit.addEventListener("click", ()=>{
        newUsername = newUserDiv.children[2].value;
        if(newUsername !== ""){
            firebase.database().ref("users/").once("value", (snapshot)=>{
                let user = snapshot.val();
                for(let prop in user){
                    console.log(user[prop]);
                    if(user[prop] == newUsername){
                        foundUser = true; 
                    }
                    else{
                        foundUser = false;
                    }
                }
            });
        }else{
            message.style.color = "red";
            message.textContent = "Error: field empty";
        }
        
        if(foundUser){
            message.style.color = "red";
            message.textContent = "Error: Username taken";
        }
        else if(!foundUser){
            newUserDiv.style.display = "none";
            setLogedinUserInfo(user,newUsername);
        }
        
    });  
}

//add new user to database
function setLogedinUserInfo(user,username){
    
    let logedinUser = {
        name: user.displayName,
        email: user.email,
        profilePic: user.photoURL,
        uid: user.uid,
        userName: username
    };
    localStorage.setItem("logedinUser", JSON.stringify(logedinUser));
    profilePic.src=user.photoURL;
    gitHubIcon.style.display = "none";
    profilePic.style.display = "inline-block";
    firebase.database().ref("users/" + user.uid).set(logedinUser);
}


//END
//--------------------------------------------------