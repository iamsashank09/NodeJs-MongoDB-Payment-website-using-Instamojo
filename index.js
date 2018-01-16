var express = require('express');
var bodyParser = require('body-parser')
var path = require('path')
var app = express();
app.use(express.static(path.join(__dirname, 'css')));
var MongoClient = require('mongodb').MongoClient
var autoIncrement = require("mongodb-autoincrement");
var url = "mongodb://username:password@ds235877.mlab.com:35877/nameofdatabase"; //This is the format of the URL you'll find on mlab
var request= require('request');
var json2csv = require('json2csv');
var fs = require('fs');
var Sync = require('sync');

var headers = { 'X-Api-Key': #Enter the API Key from instamojo, 'X-Auth-Token': #Enter the Auth token from instamojo}

var thecount;
var globmail;
var formdataholder;
var mydata;

MongoClient.connect(url, function(err,db){
 if (err) return console.log(err)
 var dbase = db.db('registration-db')

 console.log("Connected the DB")

app.use(bodyParser.urlencoded({extended: true}))


app.listen(process.env.PORT || 5000, function() {

	console.log(__dirname);

  app.get('/', function(req, res) {
    
    res.redirect('/index.html');
});
});

  app.post('/actionpayment', function(req, res){

    globmail = req.body.email

    formdataholder = req.body

    var payload = {
    purpose: 'CVR Street Cause Le Panga!',
    amount: '1025',
    phone: req.body.phone,
    buyer_name: req.body.teamcapname,
    redirect_url: 'https://lepanga-sccvr.herokuapp.com/success',
    send_email: false,
    webhook: 'https://lepanga-sccvr.herokuapp.com/webhook',
    send_sms: false,
    email: req.body.email,
    allow_repeated_payments: false }

    request.post('https://www.instamojo.com/api/1.1/payment-requests/', {form: payload,  headers: headers}, function(error, response, body){

  if(!error && response.statusCode == 201){
    var bd = JSON.parse(body);

    var finurl = bd.payment_request.longurl

    console.log('Sending request to instamojo')

    res.redirect(finurl);

   }
  })

  })

   app.get('/success', function(req, res){

    res.redirect('/thanks.html');
    console.log(req.body)


   })

    app.get('/download', function(req, res){

    dbase.collection("register_db").find({}).toArray(function(err, result) {
    if (err) throw err;
    

    mydata = result

    })

    res.redirect('/auth.html');

   })

    app.post('/allowdownload', function(req,res){

 
    

    if(req.body.skey==="1983")
    {
    console.log("Authentication Successful")
     
    var fields = ['_regid','_paymentid','collegename','collegename', 'teamcapname','email','phone','altphone','player2name','player2age','player3name','player3age','player4name','player4age','player5name','player5age','player6name','player6age','player7name','player7age','sub1name','sub1age','sub2name','sub2age'];

    var csv = json2csv({ data: mydata, fields: fields });

    fs.writeFile('lepanga-reg.csv', csv, function(err) {
    if (err) throw err;

    console.log('file saved');
    var downfile = __dirname + '/lepanga-reg.csv';
    res.download(downfile); 

    });

    }

    else{
      console.log("Authentication unsuccessful")
    }

    })
  

   app.post('/webhook', function(req, res){

    if((req.body)){

    autoIncrement.getNextSequence(dbase, 'register_db', function (err, autoIndex) {
      thecount = autoIndex;
    });

    dbase.collection('webhook_db').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log("Saved to webhook_db")

    });
    dbase.collection('register_db').save(formdataholder, (err, result) => {
    if (err) return console.log(err)


    console.log('saved to database')
    
  });


    var myquery = { 'email': globmail};
    var newvalues = {$set:{ '_paymentid' : req.body.payment_id, '_regid' : thecount  }};
    dbase.collection('register_db').updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document hopefully updated");
    });
}

   })

});
