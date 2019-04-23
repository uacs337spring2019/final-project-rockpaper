/*
Matthew Chambers
CSC 346, Spring 2019
Homework 2

holds all of the logic fore the rockPaper html
sends messages to rockPaper_service.js and holds
log ins.
uses cookies to keep track of log ins if the buttons is clicked.
*/


"use strict";

(function() {
	
	
	let SERVER_ADDRESS = "http://ec2-52-206-46-141.compute-1.amazonaws.com/";
	let loggedInUserName = null;
	
	
	window.onload = function() {
		
		//console.log (document.cookie);
		if ( getCookie("rockPaperId").length < 3){
			enterLogIn();
	
		} else {
			loggedInUserName = getCookie("rockPaperId");
			
			enterLobby();
		}
		
		
		
	};
	
	
	/** verifies the username and password is at least 3 characters long
		then tries to send the informationn to rockPaper_service to 
		determin if username and password are real.
		** NEEDS TO ADD CHECKING FOR USER INPUT **
	*/
	function logInAttempt() {
		let username = document.getElementById("loginName").value;
		let pass = document.getElementById("loginPass").value;
		
		if(username.length < 3 || pass.length < 3){
			let logErrorDiv = document.getElementById("errorLog");
			logErrorDiv.innerHTML =  "Username and password must be at least 3 characters long.";
			return;
		}
		
		let url = SERVER_ADDRESS + "?mode=logIn&userName=" +
					username + "&pass=" + pass;
		
		// sends message to rockPaper_service
		fetch(url)
		    .then(checkStatus)
		    .then(function(responseText) {
				let json = JSON.parse(responseText);
				
				//let descriptionDiv = document.getElementById("description");
				//descriptionDiv.innerHTML = responseText;
				if(json["exists"] != null) {
					
					let logErrorDiv = document.getElementById("errorLog");
					logErrorDiv.innerHTML =  "";
					 
					loggedInUserName = username;
					enterLobby();
					
				} else {
					let logErrorDiv = document.getElementById("errorLog");
					logErrorDiv.innerHTML =  "Username or password not recognized.";
					
				}
				
		    })
		    .catch(function(error) {
				let logErrorDiv = document.getElementById("errorLog");
				logErrorDiv.innerHTML =  error;
		});
		
	}
	
	
	
	/** determins if the new user input set is a viable set
		** SECURITY: NEEDS TO ADD CHECKING FOR USER INPUT **
	*/
	function checkValidity(username, pass, passRep){
		
		if(username.length < 3 || pass.length < 3){
			let logErrorDiv = document.getElementById("errorLog");
			logErrorDiv.innerHTML =  "Username and password must be at least 3 characters long.";
			return 0;
		}
		
		if(pass != passRep){
			let logErrorDiv = document.getElementById("errorLog");
			logErrorDiv.innerHTML =  "passwords dont match.";
			return 0;
		}
		
		return 1;
		
	}
	
	/** sends a request to rockPaper_service to add this 
		name password pair to be a new user account.
	*/
	function makeNewUser() {
		let username = document.getElementById("newName").value;
		let pass = document.getElementById("newPass").value;
		let passRep = document.getElementById("newPassRep").value;
		
		if( checkValidity(username, pass, passRep) == 0) {
			return;
		}
		
		
		let url = SERVER_ADDRESS + "?mode=addUser&userName=" +
					username + "&pass=" + pass;
		
		
		fetch(url)
		    .then(checkStatus)
		    .then(function(responseText) {
				
				//let descriptionDiv = document.getElementById("description");
				//descriptionDiv.innerHTML = responseText;
				
				let logErrorDiv = document.getElementById("errorLog");
				logErrorDiv.innerHTML =  responseText;
				
		    })
		    .catch(function(error) {
				let logErrorDiv = document.getElementById("errorLog");
				logErrorDiv.innerHTML =  error;
		});
		
	}
	
	/** displays all of the lobby buttons and text divs to the HTML*/
	function enterLobby(){
		
		clearPage();
		
		addNewGameDiv();
		
		addOptionsButtons();
		
		getWaitingGames();
		
	}
	
	/** adds all of the HTML objects for the new game div*/
	function addNewGameDiv(){
		
		let newGame = document.getElementById("newGame");
		
		let newGameDivTitle = document.createElement("h2");
		newGameDivTitle.innerHTML = "Make a new game";
		newGame.appendChild(newGameDivTitle);
		
		let newGameTitle = document.createElement("h3");
		newGameTitle.innerHTML = "Name of game:";
		newGame.appendChild(newGameTitle);
		
		let nameText = document.createElement("textarea");
		nameText.id = "newGameName";
		nameText.rows = 1;
		nameText.cols = 30;
		newGame.appendChild(nameText);
		
		let setOpponentHeader = document.createElement("h3");
		setOpponentHeader.innerHTML = "Opponent username:";
		newGame.appendChild(setOpponentHeader);
		
		let setOpponentText = document.createElement("textarea");
		setOpponentText.id = "setOpponentText";
		setOpponentText.rows = 1;
		setOpponentText.cols = 30;
		newGame.appendChild(setOpponentText);
		
		
		
		let newGameButton = makeNewButton( "newGameButton", "Create New Game", newGame);
		newGameButton.onclick = sendNewGame;
		
		
	}
	
	/** asks the rockPaper_service for all of the games
		that the current user is part of to be displayed.
	*/
	function getWaitingGames(){

		let url = SERVER_ADDRESS + "?mode=getAllWaiting&userName=" + loggedInUserName;
		
		
		fetch(url)
		    .then(checkStatus)
		    .then(function(responseText) {
				
				let json = JSON.parse(responseText);
				
				//console.log(json);
				//console.log(json["waiting"]);
				
				addAllWaitingGames(json["waiting"] );
				
		    })
		    .catch(function(error) {
				let logErrorDiv = document.getElementById("errorLog");
				logErrorDiv.innerHTML =  error;
		});
		
	}
	
	/** given a list adds all of the objects to the HTML
		to display the list of games
	*/
	function addAllWaitingGames( gameList ) {
		
	
		//console.log("starting to add");
		
		let waitingGames = document.getElementById("waitingGames");
		waitingGames.innerHTML = "";
		
		let header = document.createElement("h2");
		header.innerHTML = "Your Current Games";
		waitingGames.appendChild(header);
		
		let refreshButton = makeNewButton( "refreshButton", "Refresh", waitingGames);
		refreshButton.onclick = getWaitingGames;
		
		for( let i = 0; i < gameList.length; i++){
			let id = gameList[i]["id"];
			let name = gameList[i]["gameName"];
			let player1 = gameList[i]["player1"];
			let player2 = gameList[i]["player2"];
			
			let gameDiv = makeNewGameDiv(id, name, player1, player2);
			waitingGames.appendChild(gameDiv);
		
		}
	
	}
	
	/** creates a single game div and returns it
	*/
	function makeNewGameDiv(id, name, player1, player2){
		
		let gameDiv = document.createElement("div");
		gameDiv.className  = "gameHolder";
		gameDiv.value = id;
		
		let header = document.createElement("h3");
		header.innerHTML = name;
		gameDiv.appendChild(header);
		
		let playersText = document.createElement("p");
		playersText.innerHTML = "Player1: " + player1 + "   Player2: " + player2;
		gameDiv.appendChild(playersText);
		
		return gameDiv;
		
	}
	
	
	/** adds the various options buttons to the HTML
		mainly used for the cookie example
	*/
	function addOptionsButtons(){
		
		let options = document.getElementById("optionsButtons");
		
		let basicCookieButton = makeNewButton( "basicCookieButton", "make basic cookie", options);
		basicCookieButton.onclick = makeBassicCookie;
		
		let expireCookieButton = makeNewButton( "expireCookieButton", "make cookie with experation date", options);
		expireCookieButton.onclick = makeExpireCookie;
		
		let siteCookie = makeNewButton( "siteCookie", "make site cookie", options);
		siteCookie.onclick = makeSiteCookie;
		
		let sessionCookie = makeNewButton( "sessionCookie", "make session cookie", options);
		sessionCookie.onclick = makeSessionCookie;
		
		let logCookiesButton = makeNewButton( "logCookiesButton", "show cookies", options);
		logCookiesButton.onclick = logCookies;
		
		let logOutButton = makeNewButton( "logOutButton", "Log Out", options);
		logOutButton.onclick = logOut;
		
	}
	
	/** creates the simplest of cookies to hold the username*/
	function makeBassicCookie() {
		
		let name = "rockPaperId";
		let value = loggedInUserName;
		document.cookie = name + "=" + value;
	}
	
	/** creates a cookie that holds the username and has an experation date*/
	function makeExpireCookie() {
		 //document.cookie = ID_COOKIE_NAME + "=" + loggedInUserName;
		 
		let name = "rockPaperId";
		let value = loggedInUserName;
		let expires;
		let days = 1;
		
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = ", expires=" + date.toGMTString();
  
		document.cookie = name + "=" + value + expires;
		
	}
	
	/** makes a cookie to hold the username and had an experation date and path*/
	function makeSiteCookie() {
		let name = "rockPaperId";
		let value = loggedInUserName;
		let expires;
		let days = 1;
		let path = "/";
		
		
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = ", expires=" + date.toGMTString();
  
		document.cookie = name + "=" + value + expires + ", path=" + path;
		
	}
	
	/** makes a session cookie, mainly used to show how a page can have 2 cookies*/
	function makeSessionCookie() {
		let name = "session";
		let value = "12345";
		let expires;
		let days = 1;
		let path = "/";
		
		
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = ", expires=" + date.toGMTString();
  
		document.cookie = name + "=" + value + expires + ", path=" + path;
	}
	
	/** shows all of the cookies for the site to the user*/
	function logCookies() {
		
		 alert(document.cookie);
		
	}
	
	/** this code is taken from https://www.w3schools.com/js/js_cookies.asp */
	function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
			  c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
			  return c.substring(name.length, c.length);
			}
		  }
		  return "";
	}
	
	/** logs the user out of the site and displays the log in screen*/
	function logOut() {
		
		document.cookie = "rockPaperId=";
		loggedInUserName = null;
		
		enterLogIn();
	}
	

	
	/** sends a request toe rockPaper_service to make a new game
		with the sent parameters 
	*/
	function sendNewGame() {
		let newGameName = document.getElementById("newGameName").value;
		
		let opponentName = document.getElementById("setOpponentText").value;
		
		const message = {request: "addGame",
					gameName: newGameName, 
					userName: loggedInUserName,
					opponent: opponentName};
		const fetchOptions = {
			method : 'POST',
			headers : {
				'Accept': 'application/json',
				'Content-Type' : 'application/json'
			},
			body : JSON.stringify(message)
		};
		let url = SERVER_ADDRESS;
		
		fetch(url, fetchOptions)
			.then(checkStatus)
			.then(function(responseText) {
				
				if(responseText == "Failure") {
					let logErrorDiv = document.getElementById("errorLog");
					logErrorDiv.innerHTML = "Game was unable to be created, please make sure opponents name is right.";
					
				} else {
					getWaitingGames();
					
				}
			})
			.catch(function(error) {
				let logErrorDiv = document.getElementById("errorLog");
				logErrorDiv.innerHTML = error;
				
			});
		
	}
	
	/** adds everything to the HTML to display the log in screen*/
	function enterLogIn() {
		clearPage();
		
		addLogInDiv();
		
		addNewUserDiv();
		
	}
	
	/** adds the HTML objects to allow a user to log in*/
	function addLogInDiv(){
		let logInSec = document.getElementById("logIn");
		
		let userTitle = document.createElement("h2");
		userTitle.innerHTML = "Log In";
		logInSec.appendChild(userTitle);
		
		let userName = document.createElement("h3");
		userName.innerHTML = "Username:";
		logInSec.appendChild(userName);
		
		let nameText = document.createElement("textarea");
		nameText.id = "loginName";
		nameText.rows = 1;
		nameText.cols = 30;
		logInSec.appendChild(nameText);
		
		let userPass = document.createElement("h3");
		userPass.innerHTML = "Password:";
		logInSec.appendChild(userPass);
		
		let namePass = document.createElement("textarea");
		namePass.id = "loginPass";
		namePass.rows = 1;
		namePass.cols = 30;
		logInSec.appendChild(namePass);
		
		let logButton = makeNewButton( "logInButton", "Log In", logInSec);
		logButton.onclick = logInAttempt;
	
		
	}
	
	
	/** adds the HTML objects to rockPaper.html to allow the 
		user to make a new account
	*/
	function addNewUserDiv(){
		let newUserSec = document.getElementById("newUser");
		
		let userTitle = document.createElement("h2");
		userTitle.innerHTML = "New user";
		newUserSec.appendChild(userTitle);
		
		let userName = document.createElement("h3");
		userName.innerHTML = "Username:";
		newUserSec.appendChild(userName);
		
		let nameText = document.createElement("textarea");
		nameText.id = "newName";
		nameText.rows = 1;
		nameText.cols = 30;
		newUserSec.appendChild(nameText);
		
		let userPass = document.createElement("h3");
		userPass.innerHTML = "Password:";
		newUserSec.appendChild(userPass);
		
		let namePass = document.createElement("textarea");
		namePass.id = "newPass";
		namePass.rows = 1;
		namePass.cols = 30;
		newUserSec.appendChild(namePass);
		
		let userPassRep = document.createElement("h3");
		userPassRep.innerHTML = "Repeat Password:";
		newUserSec.appendChild(userPassRep);
		
		let namePassRep = document.createElement("textarea");
		namePassRep.id = "newPassRep";
		namePassRep.rows = 1;
		namePassRep.cols = 30;
		newUserSec.appendChild(namePassRep);
		
		
		let logButton = makeNewButton( "newUserButton", "Make new user", newUserSec);
		logButton.onclick = makeNewUser;
		
		
	}
	
	/** removes all of the HTML objects that have been created by rockPaper.js*/
	function clearPage(){
		document.getElementById("logIn").innerHTML = "";
		
		document.getElementById("newUser").innerHTML = "";
		
		document.getElementById("newGame").innerHTML = "";
		
		document.getElementById("optionsButtons").innerHTML = "";
		
		document.getElementById("waitingGames").innerHTML = "";
		
		
	}
	
	/** creates a new HTML button object with the given id, text on the button
		and attaches it to the 'attachTo' object
	*/
	function makeNewButton(newId, innerText, attachTo){
		
		let newButton = document.createElement("button");
		newButton.id = newId;
		newButton.innerHTML = innerText;
		attachTo.appendChild(newButton);
		return newButton;
		
	}
	
	
	/** checks the status of the return AJAX result, returns an error if needed*/
	function checkStatus(response) {  
		if (response.status >= 200 && response.status < 300) {  
			return response.text();
		} else if (response.status == 410) {
			return Promise.reject(new Error("There is no data on this state.")); 
		} else {  
			return Promise.reject(new Error(response.status+": "+response.statusText)); 
		} 
	}
	


	
}) ();