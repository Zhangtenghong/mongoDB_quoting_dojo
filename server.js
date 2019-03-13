const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const flash = require('express-flash')
const session = require('express-session')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));
app.use(session({
  secret: 'keyboardkitteh',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(flash());

mongoose.connect('mongodb://localhost/basic_mongoose');
var QuoteSchema = new mongoose.Schema({
  name:  { type: String, required: true, minlength: 3},
  quote: { type: String, required: true, minlength: 6 },
}, {timestamps:true});
mongoose.model('Quote', QuoteSchema);
var Quote = mongoose.model('Quote') 

app.get('/', function(req, res) {
    res.render('index');
})

app.post('/quotes', function(req, res) {
    console.log("POST DATA", req.body);
    var quote = new Quote({name: req.body.name, quote: req.body.quote});
    quote.save(function(err) {
    if(err) {
      console.log('something went wrong', err);
      for(var key in err.errors){
        req.flash('quote', err.errors[key].message);
      }
      return res.redirect('/')
    } else { 
      console.log('successfully added a user!');
    }
    return res.redirect('/quotes');
    })
})

app.get('/quotes', function(req,res){
  Quote.find({}).sort({date: 'desc'}).exec(function(err, dataFromDatabase){
    if(err){
      console.log(err);
    }
    console.log(dataFromDatabase);
    return res.render('quotes',{quote:dataFromDatabase})
  })
})

app.listen(8000, function() {
    console.log("listening on port 8000");
})