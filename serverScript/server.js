// var express = require('express');
// var app = express.createServer();

// app.get('/*', function(req, res){
//   var body = 'Hello World';
//   res.setHeader('Content-Type', 'text/plain');
//   res.setHeader('Content-Length', body.length);
//   res.end(body);
// });

// app.listen(process.env.PORT);
var express = require('express');
var analytic = require('./analytic.js');
var fileAdmin = require('./fileAdmin.js');

var app = express.createServer();
app.use(express.bodyParser());

app.get('/gettestdata', function (req, res) {
    var jsonp = fileAdmin.getJsonp();
    res.send(jsonp);
});

app.get('/data/categories', function (req, res) {
    res.send('');
});

app.get('/data/outcomecategories', function (req, res) {
    res.send('');
});

app.post('/postPersonalData', function (request, response) {
    response.send(analytic.getTestData(request.body));
});

app.post('/postCompanyData', function (req, res) {
    var dataString = '\r\n' + req.body.category + '\t' + req.body.date + '\t' + req.body.amount + '\t' + req.body.GST;
    fileAdmin.appendCDataFile(dataString);
    res.send(dataString);
});

app.get('/getPersonalData', function (req, res) {
    res.send(analytic.getAllPersonalData());
});

app.get('/getCompanyData', function (req, res) {
    res.send(analytic.getAllCompanyData());
});

app.listen(process.env.PORT);