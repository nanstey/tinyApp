const express = require("express");
const app = express();

const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const randomstring = require("randomstring");

var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/login", (req, res) => {
  res.render('urls_login');
});

app.get("/", (req, res) => {
  if (req.cookies["username"]){
    res.redirect('/urls/')
  }
  res.redirect('/error')
});

app.get("/error", (req, res) => {
  res.status(401);
  res.render('error');
});

app.get("/urls", (req, res) => {
  if (req.cookies["username"]){
    let templateVars = {
      urls: urlDatabase,
      username: req.cookies["username"]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/error')
  }
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["username"]){
    let templateVars = { username: req.cookies["username"] };
    res.render("urls_new");
  } else {
    res.redirect('/error')
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.cookies["username"]){
    let templateVars = {
      shortURL: req.params.id, longURL:
      urlDatabase[req.params.id],
      username: req.cookies["username"]
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect('/error')
  }
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body);
  let shortURL = req.params.id;
  let longURL = req.body['longURL'];
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/')
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let shortURL = generateRandomString();
  let longURL = req.body['longURL'];
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/' + shortURL);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls/');
});

app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls/');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/login');
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return randomstring.generate(6);
}

