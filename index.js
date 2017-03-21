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
var GHlogin = document.getElementById("GHlogin");
var FBlogin = document.getElementById("FBlogin");
var loginOpt = document.getElementById("loginOptions");
var chat = document.getElementById("chat");
var mehBtn = document.getElementById("mehBtn");


//=============================================================
//Main
isLogedin();


//=============================================================
//Callbacks
mehBtn.addEventListener("click", ()=>{
    let totalMeh = document.getElementById("totalMeh");
    if(mehBtn.textContent == "Press for Meh"){
        totalMeh.style.display = "block"; 
        mehBtn.textContent = "Un-Meh";
    }else if( mehBtn.textContent == "Un-Meh"){
        totalMeh.style.display = "none"; 
        mehBtn.textContent = "Press for Meh";
    }
    
});
FBlogin.addEventListener("click", ()=>{
    authFacebook();
    loginOpt.style.display = "none";
    loginBtn.textContent = "Log Out";
});
GHlogin.addEventListener("click", ()=>{
    authGithub();
    loginOpt.style.display = "none";
    loginBtn.textContent = "Log Out";
});
loginBtn.addEventListener("click", login$logout);
chatInput.addEventListener("keydown", (e)=>{
    if(e.keyCode === 13 ){
        addMessage();
    }
});
chatBtn.addEventListener("click", addMessage);

//=============================================================
//FIREBASE

//update online
firebase.database().ref("online/").on("value", (snapshot)=>{
    let online = snapshot.val();
    let userDiv = document.getElementById("onlineUsers");
    let li;
    
    userDiv.textContent ="";
    
    for(let user in online){
        if(online[user].online){
            li = newElement("li");
            li.textContent = online[user].username;
            userDiv.appendChild(li);
        }
    }
});


//updateChat
firebase.database().ref("messages/").on("value", (snapshot)=>{
    let data = snapshot.val();
   
    let message, isMine,rate, elm;
    let myUser = JSON.parse(localStorage.getItem("logedinUser")).userName;
    let thumbUp;
    let thumbDown;
    
    //clear chat
    chat.textContent = "";
    
    for(let msg in data){
        message = data[msg];
        rate = message.ratings;
        if(message.sender == myUser){
            isMine = true; 
        }
        else{
            isMine = false;
        }
            
        elm = newElement("div");
        elm.innerHTML = newMessage(message.sender,message.userPic,message.content,message.ID,rate.posRate,rate.negRate,message.date,isMine);
        
        
        chat.appendChild(elm);
        
        
        if(chat.children.length === 0){
            chat.appendChild(elm);    
        }
        else if(chat.children.length > 0){
            chat.insertBefore(elm,chat.children[0]);
        }
        
        thumbUp = elm.children[0].children[0].children[4].children[0].children[0];
        thumbDown = elm.children[0].children[0].children[4].children[1].children[0];
        
        thumbUp.addEventListener("click", rateMsg);
        thumbDown.addEventListener("click", rateMsg);
       
        
        
            
    }
});

//authenticate users Facebook
function authFacebook(){
    let provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider)
    .then((result)=>{
        console.log(result);
        exsistingUser(result);
    })
    .catch((error)=>{
        console.log(error);
    });
    
}

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
    firebase.auth().signOut().then(()=>{
        chat.textContent ="";
    })
    .catch(function(error) {
      console.log(error);
    });
}


//=============================================================
//functions

//-------------------------------------------
//Online

function isOnline(user,status){
    
    firebase.database().ref("online/" + user.uid).once("value", (snapshot)=>{
        let onlineUsers = snapshot.val();
        let updateObj = {};
        
        let obj = {
            uid: user.uid,
            username: user.userName,
            online: status
        };
        
        if(onlineUsers !== null){
            
            updateObj["online/"+obj.uid] = obj;
            update(updateObj);
        }
        else{ //new online user
            firebase.database().ref("online/" + user.uid).set(obj);
        }
    });
}


//END
//-------------------------------------------
//Messages

//add rating
function rateMsg(e){
    let msgID = e.target.title;
    let msgClass = e.target.className;
    let user = JSON.parse(localStorage.getItem("logedinUser")).userName;
    let rating ={}, obj ={}, newrating = {};
    let ratedOnce;
    
    
    //check if rated before
    firebase.database().ref(`ratings/${msgID}`).once("value", (snapshot)=>{
        let data = snapshot.val();
        
        
        //update rating
        if(data !== null){
            
            ratedOnce = data.raters.filter((users)=>{
                return users == user;
            });
            
            if(ratedOnce.length === 0){

                rating = {
                    msgID:data.msgID,
                    raters:data.raters,
                    posRate:data.posRate,
                    negRate:data.negRate
                };

                if(msgClass === "fa fa-thumbs-o-up thumbUp"){
                    rating.posRate++;
                }
                else if(msgClass === "fa fa-thumbs-o-down thumbDown"){
                    rating.negRate++;
                }

                obj["ratings/" +msgID] = rating;
                obj["messages/" +msgID +"/ratings"] = rating;

                update(obj);
            }else{
                alert("already rated");
            }
        }
        //new rating
        else{
            newrating ={
                msgID:msgID,
                raters:[user],
                posRate:0,
                negRate:0
            };
            
            if(msgClass === "fa fa-thumbs-o-up thumbUp"){
                newrating.posRate++;
            }
            else if(msgClass === "fa fa-thumbs-o-down thumbDown"){
                newrating.negRate++;
            }
            
            firebase.database().ref("ratings/" + msgID).set(newrating);
            obj["messages/" +msgID +"/ratings"] = newrating;
            update(obj);
        }
    });
}



//add msg to database
function addMessage(){
    let d = new Date();
    let year = d.getFullYear();
    let minutes = d.getMinutes();
    let month = d.getMonth()+1;
    let day = d.getDate();
    let hours = d.getHours();
    let seconds = d.getSeconds();
    let milseconds = d.getMilliseconds();
    let currDate = currentDate();
    let user = JSON.parse(localStorage.getItem("logedinUser"));
    //let messageID = (`${user.userName}${month}${day}${minutes}${seconds}${milseconds}`);
    let messageID = `${year}${month}${day}${hours}${minutes}${seconds}${milseconds}`;
    
    if(chatInput.value !== ""){
        let chatObj = {
            sender: user.userName,
            content: chatInput.value,
            date: currDate,
            ID: messageID,
            userPic:user.profilePic,
            ratings:{
                raters:[""],
                posRate:0,
                negRate:0
            }
        };

        firebase.database().ref("messages/" + messageID).set(chatObj);
        chatInput.value = "";
    }else{
        chatBtn.disabled = true;
    }
    
}

function newMessage(userName,userPic,text,msgID,posRate,negRate,date,isMine){
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
                            <div class="messageInfo">${userName} ${date}</div>
                            <div class="profilePic"><img src="${userPic}" alt="profile"/></div>
                            <p class="messageContent">${text}</p><br>
                            <div class="messageRating">
                                <div class="posRate">
                                    <i title="${msgID}" class="fa fa-thumbs-o-up thumbUp" aria-hidden="true"></i>
                                    <p>${posRate}</p>
                                </div>
                                <div class="negRate">
                                    <i title="${msgID}" class="fa fa-thumbs-o-down thumbDown" aria-hidden="true"></i>
                                    <p>${negRate}</p>
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
        isOnline(user,true);
        
        if(user.uid == 14220419){
            mehBtn.style.display = "block";
        }
    }
}

//log in and out
function login$logout(){
    let user = JSON.parse(localStorage.getItem("logedinUser"));
    
    
    if(loginBtn.textContent == "Log In"){
        loginOpt.style.display = "block";
    }
    else if(loginBtn.textContent == "Log Out"){
        signOutGithub();
        isOnline(user,false);
        localStorage.removeItem("logedinUser");
        loginBtn.textContent = "Log In";
        gitHubIcon.style.display = "inline-block";
        profilePic.style.display = "none";
        greetings.textContent = "Log In";
         mehBtn.style.display = "none";
    }
}

//check is new or exsisting user
function exsistingUser(result){
    let user = result.user.providerData[0];
    let username;
    
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
            isOnline(logedinUser,true);
            location.reload();
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
    let month = addZero(d.getMonth()+1);
    let day = addZero(d.getDate());
    let hours = addZero(d.getHours());
    let minutes = addZero(d.getMinutes());
    let seconds = addZero(d.getSeconds());
    
    
    return `${month}/${day} ${hours}:${minutes}:${seconds}`; 
}

function addZero(date){
    if(date < 10){
        return "0"+date;
    }else{
        return date;
    }
}

function newElement(elm){
    return document.createElement(elm);
}

function update(obj){
    firebase.database().ref().update(obj);
}