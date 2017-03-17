const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const randomstring = require("randomstring");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  secret: '$2a$10$4MB/p0o2EaNzp5.o25XRiOxPcrTtRPEPl0OofqTwKe0sAsdJCJEw6'
}));

var PORT = process.env.PORT || 3000;

var urlDatabase = {
  "b2xVn2": {
    user: 'egEt9K',
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    date: "Thu Mar 16 2017",
    totalVisits: 5,
    uniqueVisits: 3
  },
  "9sm5xK": {
    user: '59tsaS',
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    date: "Wed Mar 15 2017",
    totalVisits: 3,
    uniqueVisits: 1
  }
};

const users = {
  "egEt9K": {
    id: "egEt9K",
    name: "Rick",
    email: "Rick@GetSchwifty.com",
    password: "$2a$10$IH8JQGn/mbJC7SYe.YwXkO2z8G1KmvWAGxJihIPEhFUGTgscUuATy"
  },
  "59tsaS": {
    id: "59tsaS",
    name: "Morty",
    email: "Morty@GetSchwifty.com",
    password: "$2a$10$KlY/dQIauFVmqgvrsJ.Z2uZBDc1z.Zfae.QMu2OCh4cQRSgMghs4O"
  }
};

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
      urls[key] = urlDatabase[key];
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

function checkPassword(password, id){
  return bcrypt.compareSync(password, users[id].password);
}

function hashPassword(password){
  return bcrypt.hashSync(password, 10);
}

app.get("/", (req, res) => {
  // If logged in -> homepage, else -> login page
  req.session.userId ? res.redirect('/urls') : res.redirect('/login');
});

app.get("/urls", (req, res) => {
  if (req.session.userId){
    // Logged in
    let id = req.session.userId;
    let templateVars = {
      'urls': getLinksByUserId(id),
      'user': { 'name': users[id].name, 'email':users[id].email }
    };
    res.render("urls_index", templateVars);
  } else {
    // User not logged in
    res.redirect('/error');
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.userId){
    // Logged in
    let id = req.session.userId;
    let templateVars = { 'user': { 'name': users[id].name, 'email':users[id].email }  };
    res.render("urls_new", templateVars);
  } else {
    // User not logged in
    res.redirect('/error');
  }
});

app.get("/urls/:id", (req, res) => {
  if ( req.session.userId ){
    // Logged in
    // Get user id and shortURL
    let id = req.session.userId;
    let shortURL = req.params.id;
    if ( linkExists(shortURL) ) {
      // shortURL exists
      if ( linkOwnedById(shortURL, id) ){
        // Owned by current user
        let link = urlDatabase[shortURL];
        let templateVars = {
          'shortURL': link.shortURL,
          'longURL': link.longURL,
          'user': { 'name': users[id].name, 'email':users[id].email }
        };
        res.render("urls_show", templateVars);
      } else {
        // Exists but not owned by current user
        let templateVars = { errorMsg: "You do not own this URL. ", loggedIn: true };
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
  if ( linkExists(shortURL) ){
    // Link exists
    urlDatabase[shortURL].totalVisits++;
    if ( !req.cookies.hasOwnProperty(shortURL) ){
      res.cookie(shortURL, 1);
      urlDatabase[shortURL].uniqueVisits++;
    }
    let longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    // Not found
    res.redirect("/404");
  }
});

app.post("/urls", (req, res) => {
  if ( req.session.userId ){
    // Logged in
    let id = req.session.userId;
    let longURL = req.body['longURL'];
    let shortURL = generateRandomString(urlDatabase);
    // create link obj
    urlDatabase[shortURL] = {
      'user': id,
      'shortURL': shortURL,
      'longURL': longURL,
      'date': Date().toDateString(),
      'totalVisits': 0,
      'uniqueVisits': 0
    };
    res.redirect('/urls/' + shortURL);
  } else {
    // User not logged in
    res.redirect('/error');
  }
});

app.post("/urls/:id", (req, res) => {
  if ( req.session.userId ){
    // Logged in
    let id = req.session.userId;
    let shortURL = req.params.id;
    if ( linkExists(shortURL) ) {
      // Link exists
      if ( linkOwnedById(shortURL, id) ){
        // Linked owned by current user
        let longURL = req.body['longURL'];
        let date = urlDatabase[shortURL].date;
        let visits = urlDatabase[shortURL].totalVisits;
        let unique = urlDatabase[shortURL].uniqueVisits;
        urlDatabase[shortURL] = {
          'user': id,
          'shortURL': shortURL,
          'longURL': longURL,
          'date': date,
          'totalVisits': visits,
          'uniqueVisits': unique
        };
        res.redirect('/urls/');
      } else {
        // ShortURL not owned by current user, or doesn't exist
        let templateVars = { errorMsg: "You do not own this URL. ", loggedIn: true };
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
  if ( req.session.userId ){
    // Logged in
    let id = req.session.userId;
    let shortURL = req.params.id;
    if ( linkExists(shortURL) ){
      // Link exists
      if ( linkOwnedById(shortURL, id) ){
        // Linked owned by current user
        delete urlDatabase[shortURL];
        res.redirect('/urls/');
      } else {
        // ShortURL not owned by current user, or doesn't exist
        let templateVars = { errorMsg: "You do not own this URL. ", loggedIn: true };
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
  if ( req.session.userId ){
    // Logged in
    res.redirect('/');
  } else {
    // Not logged in
    res.render('login');
  }
});

app.get("/register", (req, res) => {
  if ( req.session.userId ){
    // Logged in
    res.redirect('/');
  } else {
    // Not logged in
    res.render('register');
  }
});

app.post("/register", (req, res) => {
  if ( req.session.userId ){
    // Logged in
    res.redirect('/');
  } else {
    // Not logged in
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    if (email === '' || password === ''){
      // Email or Password empty
      let templateVars = { errorMsg: "Email or Password field empty.", loggedIn: false };
      res.status(400);
      res.redirect('/error', templateVars);
    } else if ( getUserIdByEmail(email) ){
      // User already exists
      let templateVars = { errorMsg: "Email already in use.", loggedIn: false };
      res.status(400);
      res.redirect('/error', templateVars);
    } else {
      // Create user id, and user obj
      let id = generateRandomString(users);
      users[id] = {
        'id': id,
        'name': name,
        'email': email,
        'password': hashPassword( req.body.password )
      };
      // Set cookie for session
      req.session.userId = id;
      res.redirect('/');
    }
  }
});

app.post("/login", (req, res) => {
  if ( req.session.userId ){
    // User already logged in
    res.redirect('/');
  } else {
    // Attempt login
    let email = req.body.email;
    let password = req.body.password;
    let id = getUserIdByEmail(email);
    if ( id && checkPassword(password, id) ) {
      // User exists, password correct
      req.session.userId = id;
      res.redirect('/');
    } else {
      // Email address not found, or password doesn't match
      let templateVars = { errorMsg: "Password and email don't match user.", loggedIn: false };
      res.status(403);
      res.render('error', templateVars);
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/error", (req, res) => {
  let templateVars;
  if (req.session.userId){
    templateVars = { 'user': { 'name': users[id].name, 'email':users[id].email } };
  }
  res.status(401);
  res.render('error');
});

app.get("/404", (req, res) => {
  let templateVars;
  if (req.session.userId){
    templateVars = { user: { 'name': users[ req.session.userId ].name, 'email':users[ req.session.userId ].email } };
  }
  res.status(404);
  res.render('404', templateVars);
});

app.get("*", (req, res) => {
  res.redirect("/404");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});