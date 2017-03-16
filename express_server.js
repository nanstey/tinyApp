const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const randomstring = require("randomstring");

var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": {
    user: 'egEt9K',
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    user: '59tsaS',
    shortURL: "9sm5xK",
    longURL: "http://www.google.com"
  },
};

const users = {
  "egEt9K": {
    id: "egEt9K",
    name: "Rick",
    email: "Rick@GetSchwifty.com",
    password: "WubbaLubbaDubDub"
  },
 "59tsaS": {
    id: "59tsaS",
    name: "Morty",
    email: "Morty@GetSchwifty.com",
    password: "OhJeez"
  }
}

app.get("/", (req, res) => {
  // If logged in -> homepage, else -> login page
  req.cookies["user_id"] ? res.redirect('/urls') : res.redirect('/login');
});

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]){
    // Logged in
    let id = req.cookies["user_id"];
    let templateVars = {
      urls: getLinksByUserId(id),
      user: users[id].name
    };
    res.render("urls_index", templateVars);
  } else {
    // User not logged in
    res.redirect('/error');
  }
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]){
    // Logged in
    let id = req.cookies["user_id"];
    let templateVars = { user: users[id].name  };
    res.render("urls_new", templateVars);
  } else {
    // User not logged in
    res.redirect('/error')
  }
});

app.get("/urls/:id", (req, res) => {
  if ( req.cookies["user_id"] ){
    // Logged in
    // Get user id and shortURL
    let id = req.cookies["user_id"];
    let shortURL = req.params.id;
    if ( linkExists(shortURL) ) {
      // shortURL exists
      if ( linkOwnedById(shortURL, id) ){
        // Owned by current user
        let link = urlDatabase[shortURL];
        let templateVars = {
          'shortURL': link.shortURL,
          'longURL': link.longURL,
          'user': users[id].name
        };
        res.render("urls_show", templateVars);
      } else {
        // Exists but not owned by current user
        let templateVars = { error_msg: "You do not own this URL. ", logged_in: true }
        res.status(403);
        res.render('error', templateVars);
      }
    } else {
      // Not found
      res.redirect('/404');
    }
  } else {
    // User not logged in
    res.redirect('/error');
  }
});

app.get("/u/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL].longURL;
  if (longURL){
    res.redirect(longURL);
  } else {
    // Not found
    res.redirect("/404");
  }
});

app.post("/urls", (req, res) => {
  if ( req.cookies["user_id"] ){
    // Logged in
    let id = req.cookies["user_id"];
    let longURL = req.body['longURL'];
    let shortURL = generateRandomString(urlDatabase);
    // create link obj
    urlDatabase[shortURL] = {
      'user': id,
      'shortURL': shortURL,
      'longURL': longURL
    };
    res.redirect('/urls/' + shortURL);
  } else {
    // User not logged in
    res.redirect('/error');
  }
});

app.post("/urls/:id", (req, res) => {
  if ( req.cookies["user_id"] ){
    // Logged in
    let id = req.cookies["user_id"];
    let shortURL = req.params.id;
    if ( linkExists(shortURL) ) {
      // Link exists
      if ( linkOwnedById(shortURL, id) ){
        // Linked owned by current user
        let longURL = req.body['longURL'];
        urlDatabase[shortURL] = {
          'user': id,
          'shortURL': shortURL,
          'longURL': longURL
        };
        res.redirect('/urls/');
      } else {
        // ShortURL not owned by current user, or doesn't exist
        let templateVars = { error_msg: "You do not own this URL. ", logged_in: true };
        res.status(403);
        res.render('error', templateVars);
      }
    } else {
      // Link doesn't exist
      res.redirect('/404');
    }
  } else {
    // User not logged in
    res.redirect('/error');
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if ( req.cookies["user_id"] ){
    // Logged in
    let id = req.cookies["user_id"];
    let shortURL = req.params.id;
    if ( linkExists(shortURL) ){
      // Link exists
      if ( linkOwnedById(shortURL, id) ){
        // Linked owned by current user
        delete urlDatabase[shortURL];
        res.redirect('/urls/');
      } else {
        // ShortURL not owned by current user, or doesn't exist
        let templateVars = { error_msg: "You do not own this URL. ", logged_in: true };
        res.status(403);
        res.render('error', templateVars);
      }
    } else {
      // Link doesn't exist
      res.redirect('/404');
    }
  } else {
    // User not logged in
    res.redirect('/error');
  }
});

app.get("/login", (req, res) => {
  if ( req.cookies["user_id"] ){
    // Logged in
    res.redirect('/');
  } else {
    // Not logged in
    res.render('login');
  }
});

app.get("/register", (req, res) => {
  if ( req.cookies["user_id"] ){
    // Logged in
    res.redirect('/');
  } else {
    // Not logged in
    res.render('register');
  }
});

app.post("/register", (req, res) => {
  if ( req.cookies["user_id"] ){
    // Logged in
    res.redirect('/');
  } else {
    // Not logged in
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    if (email === '' || password === ''){
      // Email or Password empty
      let templateVars = { error_msg: "Email or Password field empty.", logged_in: false };
      res.status(400);
      res.redirect('/error', templateVars);
    } else if ( getUserIdByEmail(email) ){
      // User already exists
      let templateVars = { error_msg: "Email already in use.", logged_in: false };
      res.status(400);
      res.redirect('/error', templateVars);
    } else {
      // Create user id, and user obj
      let id = generateRandomString(users);
      users[id] = {
        'id': id,
        'name': name,
        'email': email,
        'password': password
      };
      // Set cookie for session
      res.cookie('user_id', id);
      console.log(users);
      res.redirect('/');
    }
  }
});

app.post("/login", (req, res) => {
  if ( req.cookies["user_id"] ){
    // User already logged in
    res.redirect('/');
  } else {
    // Attempt login
    let email = req.body.email;
    let password = req.body.password;
    let id = getUserIdByEmail(email);
    if (id && password === users[id].password){
      // User exists, password correct
      res.cookie('user_id', id);
      res.redirect('/')
    } else {
      // Email address not found, or password doesn't match
      let templateVars = { error_msg: "Password and email don't match user.", logged_in: false };
      res.status(403);
      res.render('error', templateVars);
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get("/error", (req, res) => {
  res.status(401);
  res.render('error');
});

app.get("/404", (req, res) => {
  let templateVars = { user: users[ req.cookies["user_id"] ] };
  res.status(404);
  res.render('404', templateVars);
});

app.get("*", (req, res) => {
  res.redirect("/404");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(obj) {
  let str = '';
  do {
    str = randomstring.generate(6);
  } while( obj.hasOwnProperty(str) );
  return str;
}

function getUserIdByEmail(email){
  for (let key in users){
    if ( users[key]['email'].toLowerCase() === email.toLowerCase() ){
      return key;
    }
  }
  return false;
}

function getLinksByUserId(id){
  let urls = {};
  for (let key in urlDatabase){
    if ( urlDatabase[key].user === id ){
      urls[key] = urlDatabase[key]
    }
  }
  return urls;
}

function linkOwnedById(link, id){
  if (urlDatabase[link].user === id){
    return true;
  }
  return false;
}

function linkExists(link){
  return urlDatabase.hasOwnProperty(link);
}