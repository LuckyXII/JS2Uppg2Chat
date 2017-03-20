/*jshint esnext: true, moz: true*/
/*jslint browser:true */

//=============================================================
//GLOBALS
var loginBtn = document.getElementById("loginBtn");
var profilePic = document.getElementById("profilePic");
var gitHubIcon = document.getElementById("GH");
var greetings = document.getElementById("greeting");
var chatBtn = document.getElementById("sendBtn");
var chatInput = document.getElementById("chatInput");

//=============================================================
//Main
isLogedin();


//=============================================================
//Callbacks
loginBtn.addEventListener("click", login$logout);
chatInput.addEventListener("keydown", (e)=>{
    if(e.keyCode === 13 ){
        addMessage();
    }
});
chatBtn.addEventListener("click", addMessage);

//=============================================================
//FIREBASE

//updateRating
fireBase.database().ref("ratings/").on("value", (snapshot)=>{
    
});

//updateChat
firebase.database().ref("messages/").on("value", (snapshot)=>{
    let data = snapshot.val();
    let chat = document.getElementById("chat");
    let message, isMine;
    let myID = JSON.parse(localStorage.getItem("logedinUser")).uid;
    
    //clear chat
    chat.textContent = "";
    
    for(let msg in data){
        message = data[msg];
        if(message.ID == myID){
            isMine = true; 
        }
        else{
            isMine = false;
        }
          chat.appendChild(newMessage(message.userName,message.content,message.ID,isMine));
            
    }
});

//Authenticate User GitHub
function authGithub(){
    let provider = new firebase.auth.GithubAuthProvider();
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
    firebase.auth().signOut().then(()=>{})
    .catch(function(error) {
      console.log(error);
    });
}


//=============================================================
//functions

//-------------------------------------------
//Messages

//add rating
function rateMsg(e){
    let msgID = e.target.title;
}

//add msg to database
function addMessage(){
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth();
    let day = d.getDate();
    let minutes = d.getMinutes();
    let seconds = d.getSeconds();
    let currDate = currentDate();
    let user = JSON.parse(localStorage.getItem("logedinUser"));
    let messageID = (`${user.userName}${year}${month}${day}${minutes}${seconds}`);
    
    if(chatInput.value !== ""){
        let chatObj = {
            sender: user.userName,
            content: chatInput.value,
            date: currDate,
            ID: messageID
        };

        firebase.database().ref("messages/" + messageID).set(chatObj);
    }else{
        chatBtn.disabled = true;
    }
    
}

function newMessage(user,text,msgID,isMine){
    let className, float;
   
    if(isMine){
        className = "messageMine";
        float = "floatRight";
    }
    else if(!isMine){
        className = "messageOthers";
        float = "";
    }
    
    let message = `<div class="message ${float}">
                       <div class=${className}>
                            <div class="messageInfo">${user}${currentDate()}</div>
                            <div class="profilePic"></div>
                            <p class="messageContent">${text}</p><br>
                            <div class="messageRating">
                                <div class="posRate">
                                    <i title="${msgID}" class="fa fa-thumbs-o-up thumbUp" aria-hidden="true"></i>
                                    <p>0</p>
                                </div>
                                <div class="negRate">
                                    <i title="${msgID}" class="fa fa-thumbs-o-down thumbDown" aria-hidden="true"></i>
                                    <p>0</p>
                                </div>
                            </div>
                        </div>
                    </div>`;
    return message;
}

//END
//--------------------------------------------
//Log in 

function isLogedin(){
    let logedin = localStorage.getItem("logedinUser");
    let user;
    if(logedin !== null){
        user = JSON.parse(logedin);
        
        profilePic.src=user.profilePic;
        gitHubIcon.style.display = "none";
        profilePic.style.display = "inline-block";
        greetings.textContent = `Welcome ${user.userName}`;
        loginBtn.textContent = "Log Out";
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

//END Login
//--------------------------------------------------
// misc

function currentDate(){
    let d = new Date();
    let month = d.getMonth();
    let day = d.getDate();
    let hours = d.gethours();
    let minutes = d.getMinutes();
    let seconds = d.getSeconds();
    
    return `${month}/${day} ${hours}:${minutes}:${seconds}`; 
}