const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
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