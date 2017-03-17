const randomstring = require("randomstring");
const bcrypt = require('bcrypt');

module.exports = {

  urlDatabase: {
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
  },

  users: {
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
  },

  generateRandomString: function(obj) {
    let str = '';
    do {
      str = randomstring.generate(6);
    } while( obj.hasOwnProperty(str) );
    return str;
  },

  getUserIdByEmail: function(email) {
    for (let key in this.users){
      if ( this.users[key]['email'].toLowerCase() === email.toLowerCase() ){
        return key;
      }
    }
    return false;
  },

  getLinksByUserId: function(id) {
    let urls = {};
    for (let key in this.urlDatabase){
      if ( this.urlDatabase[key].user === id ){
        urls[key] = this.urlDatabase[key];
      }
    }
    return urls;
  },

  linkOwnedById: function(link, id) {
    if (this.urlDatabase[link].user === id){
      return true;
    }
    return false;
  },

  linkExists: function(link) {
    return this.urlDatabase.hasOwnProperty(link);
  },

  checkPassword: function(password, id) {
    return bcrypt.compareSync(password, this.users[id].password);
  },

  hashPassword: function(password) {
    return bcrypt.hashSync(password, 10);
  },

  makeDate: function() {
    return new Date().toDateString();
  },

  checkURL: function(url) {
    var res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if(res == null){
      return false;
    } else {
      return true;
    }
  }

};