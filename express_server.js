//******************//
//***  TINY APP  ***//
//******************//

// Description:
//    A web application for creating and managing redirect shortlinks

// Usage:
//    Start the server with:   `node express_server.js`
//    Visit the homepage at:   http://localhost:3000/
//    Register and start making links!

// Details:
//    This file only contains the core server settings
//    Routes are contained in `routes.js`
//    Default data and functions contained in `data_functions.js`

const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  secret: '$2a$10$4MB/p0o2EaNzp5.o25XRiOxPcrTtRPEPl0OofqTwKe0sAsdJCJEw6'
}));

require('./routes')(app);

var PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});