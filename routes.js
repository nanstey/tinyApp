const data = require('./data_functions');

module.exports = function(app){

  app.get("/", (req, res) => {
    // If logged in -> homepage, else -> login page
    req.session.userId ? res.redirect('/urls') : res.redirect('/login');
  });

  app.get("/urls", (req, res) => {
    if (req.session.userId){
      // Logged in
      let id = req.session.userId;
      let templateVars = {
        'urls': data.getLinksByUserId(id),
        'user': { 'name': data.users[id].name, 'email': data.users[id].email }
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
      let templateVars = { 'user': { 'name': data.users[id].name, 'email': data.users[id].email }  };
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
      if ( data.linkExists(shortURL) ) {
        // shortURL exists
        if ( data.linkOwnedById(shortURL, id) ){
          // Owned by current user
          let link = data.urlDatabase[shortURL];
          let templateVars = {
            'shortURL': link.shortURL,
            'longURL': link.longURL,
            'user': { 'name': data.users[id].name, 'email': data.users[id].email }
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
      data.urlDatabase[shortURL].totalVisits++;
      if ( !req.cookies.hasOwnProperty(shortURL) ){
        res.cookie(shortURL, 1);
        data.urlDatabase[shortURL].uniqueVisits++;
      }
      let longURL = data.urlDatabase[shortURL].longURL;
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
      let shortURL = data.generateRandomString(data.urlDatabase);
      // create link obj
      data.urlDatabase[shortURL] = {
        'user': id,
        'shortURL': shortURL,
        'longURL': longURL,
        'date': data.makeDate(),
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
      if ( data.linkExists(shortURL) ) {
        // Link exists
        if ( data.linkOwnedById(shortURL, id) ){
          // Linked owned by current user
          let longURL = req.body['longURL'];
          let date = data.urlDatabase[shortURL].date;
          let visits = data.urlDatabase[shortURL].totalVisits;
          let unique = data.urlDatabase[shortURL].uniqueVisits;
          data.urlDatabase[shortURL] = {
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
      if ( data.linkExists(shortURL) ){
        // Link exists
        if ( data.linkOwnedById(shortURL, id) ){
          // Linked owned by current user
          delete data.urlDatabase[shortURL];
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
      } else if ( data.getUserIdByEmail(email) ){
        // User already exists
        let templateVars = { errorMsg: "Email already in use.", loggedIn: false };
        res.status(400);
        res.redirect('/error', templateVars);
      } else {
        // Create user id, and user obj
        let id = data.generateRandomString(data.users);
        data.users[id] = {
          'id': id,
          'name': name,
          'email': email,
          'password': data.hashPassword( req.body.password )
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
      let id = data.getUserIdByEmail(email);
      if ( id && data.checkPassword(password, id) ) {
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
      templateVars = { 'user': { 'name': data.users[id].name, 'email': data.users[id].email } };
    }
    res.status(401);
    res.render('error');
  });

  app.get("/404", (req, res) => {
    let templateVars;
    if (req.session.userId){
      let id = req.session.userId;
      templateVars = { 'user': { 'name': data.users[id].name, 'email': data.users[id].email } };
    }
    res.status(404);
    res.render('404', templateVars);
  });

  app.get("*", (req, res) => {
    res.redirect("/404");
  });

};