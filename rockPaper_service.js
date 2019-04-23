/*
Matthew Chambers
CSC 346, Spring 2019
Homework 2

This js acts as a middle man to allow the rockPaper.js
to communicate with the database
requires the following to be installed to run:
	node
	mysql
	
SECURITY: user input of username and password are never checked 
		NEEDS TO BE FIXED
*/

"use strict";

(function() {
		
	const express = require("express");
	const app = express();
	let fs = require('fs');
	let mysql = require('mysql');
	
	const  bodyParser = require('body-parser');
	const jsonParser = bodyParser.json();

	app.use(express.static('public'));
	
	/** creates a mysql connection object to connect to the database
		Returns: the connection object
		SECURITY: users should never see this but this information
					should still be in a seperate file
	*/
	function makeConnection(){
		let con = mysql.createConnection({
		  host     : 'cs346p2mysqlrockpaper.ccvzhpt8n1yb.us-east-1.rds.amazonaws.com',
		  user     : 'egamIrorriM',
		  password : 'KingsHorses',
		  port     : '3306',
		  database : 'testdb'
		});
		
		return con;
		
	}
	
	/** checks if the given username and password are in the database*/
	function logIn(userName, pass, res) {
		
		let con = makeConnection();
		let json = {};

		con.connect(function(err) {
			if (err) throw err;
			
			let question = "SELECT * FROM user WHERE name='" + userName + "' AND password ='"+ pass +"'";
			
			con.query(question, function (err, result, fields) {
				if (err) throw err;
				
				if(result.length <= 0){
					json["exists"] = null;
					res.send(json);
				} else {
					json["exists"] = "true";
					res.send(json);
				}
			});
		});
		
	}
	
	
	/** tries to add the given username and password as a new instanceof
		in the database
	*/
	function addUser(userName, pass, res) {
		
		let con = makeConnection();
		
		con.connect(function(err) {
			if (err) throw err;
			
			let question = "SELECT * FROM user WHERE name='" + userName + "'";
			
			con.query(question, function (err, result, fields) {
				if (err) throw err;
				
				
				
				if(result.length > 0){
					res.send("Username already in use.");
					
				} else {
					let insert = "INSERT INTO user (name, password) VALUES ('"+userName +"', '"+pass +"')";
					
					con.query(insert, function (err, result) {
						if (err) throw err;
						
						res.send("New account created.");
						
					});
					
					
				}
					
				
			});
		});
		
	}
	
	/** ensures there is no problem with the program talking back and forth on the same computer*/
	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept");
		next();
	});
	
	/** checks for logIn, add user, and get all waiting games requests*/
	app.get('/', function (req, res) {
		
		let params = req.query;
		let request = params.mode;
		//let bookTitle = params.title;
		
		
		if( request == "logIn"){
			logIn(params.userName, params.pass, res);
			
		}
		
		if( request == "addUser"){
			addUser(params.userName, params.pass, res);
			//console.log("adding user");
			//res.send("you win");
		}
		
		if( request == "getAllWaiting"){
			sendAllWaitingGames(params.userName, res);
			
		}
		
	
		
		
		
	});
	
	/** sends back as a reply a json that contains
		the gameid name and players of every game with a 'waiting' status and
		that contains the given player
	*/
	function sendAllWaitingGames(userName, res){
		let con = makeConnection();
		
		con.connect(function(err) {
			if (err) throw err;
			
			let question = "SELECT * FROM game WHERE status='waiting' AND (p1name ='" +
						userName + "' OR p2name='" +userName + "')";
		
		
			con.query(question, function (err, result, fields) {
				
				let json = {};
				
				addGameDisplayData( json, result);
				
				res.send(json);
				
			});
			//let question = "SELECT * FROM user WHERE name='" + userName + "'";
			
		});
		
		return;
	}
	
	/** adds the game's information to the given json object
		using the resulting query response
	*/
	function addGameDisplayData(json, result){
		
		let gameArray = [];
		for(let i = 0; i < result.length; i++){
			let gameNode = {};
			
			gameNode["id"] = result[i]["idgame"];
			gameNode["player1"] = result[i]["p1name"];
			gameNode["player2"] = result[i]["p2name"];
			gameNode["gameName"] = result[i]["name"];
			
			gameArray[i] = gameNode;
		}
		
		json["waiting"] = gameArray;
		
		return;
		
	}
	
	/** used to collect larger amouts of data then the get.post
		currently takes care of add game requests
	*/
	app.post('/', jsonParser, function (req, res) {
					
		const request = req.body.request;
		
		if(request == "addGame"){
			const gameName = req.body.gameName;
			const player1 = req.body.userName;
			const player2 = req.body.opponent;
			
			createNewGame(gameName, player1, player2, res);
		}
		
	});
	
	/** tries to create a new game instance in the database
		with the included usernames if those usernames are in the
		user table
	*/
	function createNewGame(gameName, player1, player2, res){
		let con = makeConnection();
		
		con.connect(function(err) {
			if (err) throw err;
			
			let question = "SELECT * FROM user WHERE name='" +
							player1 + "' OR name='" + player2 +"'";
		
			con.query(question, function (err, result, fields) {
				if(result.length == 2){
					 addNewGame(con, res, gameName, player1, player2);
					
					
				}else {
					res.send("Failure");
					
				}
				
			});
			
		});
		
	}
	
	/** creats a new instance into the game table of the database
	*/
	function addNewGame(con, res, gameName, player1, player2){
		
		
		let insert = "INSERT INTO game (name, p1name, p2name) VALUES ('"+
					gameName +"', '"+player1 + "', '"+player2 +"')";
					
		con.query(insert, function (err, result) {
			if (err) throw err;
						
			res.send("New account created.");
		});
		
		
	}
	

	app.listen(3000);
	
	
}) ();
