const express = require('express')
const app = express()
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
const validator = require('validator')

app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
// Connection URL
var url = 'mongodb://localhost:27017/myproject';
var db
var errors = ""
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, database) {
  //assert.equal(null, err);
  console.log("Connected correctly to server");
  db = database
  // db.close();
  app.listen(8000, function(){
	  console.log('Listening')
  })
});


app.get('/', function(req, res){
	// res.sendFile(__dirname + '/index.html')
	res.render('index.ejs', {errors: errors})
	errors = ""
	// delete res.session.error
})

app.post('/form', function(req, res){
	console.log("Here")
	console.log(req.body)
	console.log("Here")
	var first_name = req.param('first_name')
	console.log("Here")
	var last_name = req.param('last_name')
	var tel = req.param('usrtel')
	console.log(first_name)
	console.log("Here")
	var error = ""
	var b = true
	if(first_name == null || !validator.isAlpha(first_name)){
		error = error + "Please enter a valid first name\n"
		b = !b
	}
	if(last_name == null || !validator.isAlpha(last_name)){
		error = error + "Please enter a valid last name\n"
		b = !b
	}
	if(tel == null || !validator.isMobilePhone(tel, 'en-IN')){
		error = error + "Please enter a valid phone number\n"
		b = !b
	}

	if(!b){
		// req.session.error = error.split('\n')
		errors = error.split('\n')
		// res.render('index.ejs', {errors: error.split('\n')})
		res.redirect('/')
	}
	else{
		db.collection('patients').save(req.body, function(err, result){
	      if (err) return console.log(err)

	      console.log('saved to database')
	      res.redirect('/')
	  })
	}
})

app.get('/list', function(req, res){
 	var cursor = db.collection('patients').find().toArray(function(err, results) {
  		//console.log(results)
  		// send HTML file populated with quotes here
  		res.render('patient_list.ejs', {patients:results})
  	})
})

app.post('/search', function(req, res){
	console.log(req.body)
	var name = req.param('patient_search')
	if(name == null || name.length == 0){
		console.log("Here")
		res.redirect('/list')
	}
	console.log(name == null)
	name = name.split(" ")
	var cursor;
	if(name.length > 1){
		cursor = db.collection('patients').find({first_name: name[0], last_name: name[1]})
	}else{
		cursor = db.collection('patients').find({$or:[{first_name: name[0]}, {last_name: name[0]}]})
	}
	cursor.toArray(function(err, results){
		res.render('patient_list.ejs', {patients:results})
	})
	// console.log(name)
})