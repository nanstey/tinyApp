const randomstring = require("randomstring");
const bcrypt = require('bcrypt');
const moment = require('moment');

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

  visitors: {
    "kXlNVw": {
      "WKQ9eZ": {
        id: "WKQ9eZ",
        timestamp: '2017/03/17 12:12:45 pm',
        shortURL: "b2xVn2",
        visitorId: "kXlNVw"
      }
    },
    "oMY7pQ": {
      "Q4sUny": {
        id: "Q4sUny",
        timestamp: '2017/03/16 11:26:29 am',
        shortURL: "b2xVn2",
        visitorId: "oMY7pQ"
      }
    },
    "iX8Y9l": {
      "JNyiRW": {
        id: "JNyiRW",
        timestamp: '2017/03/17 2:28:33 pm',
        shortURL: "9sm5xK",
        visitorId: "iX8Y9l"
      },
      "tcMuhH": {
        id: "tcMuhH",
        timestamp: '2017/03/16 5:15:06 pm',
        shortURL: "9sm5xK",
        visitorId: "iX8Y9l"
      },
      "Rw4RxW": {
        id: "Rw4RxW",
        timestamp: '2017/03/14 1:56:39 pm',
        shortURL: "9sm5xK",
        visitorId: "iX8Y9l"
      }
    },
    "rHWJ0q": {
      "4COUOR": {
        id: "4COUOR",
        timestamp: '2017/03/17 2:28:33 pm',
        shortURL: "b2xVn2",
        visitorId: "rHWJ0q"
      },
      "t11nBx": {
        id: "t11nBx",
        timestamp: '2017/03/16 1:28:33 pm',
        shortURL: "b2xVn2",
        visitorId: "rHWJ0q"
      },
      "H3mi4M": {
        id: "H3mi4M",
        timestamp: '2017/03/15 4:56:27 pm',
        shortURL: "b2xVn2",
        visitorId: "rHWJ0q"
      }
    }
  },

  generateRandomString: function() {
    return randomstring.generate(6);
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

  getVisitsByLink: function(link) {
    let visits = {};
    for (let key in this.visitors){
      for (let i in this.visitors[key]){
        if ( this.visitors[key][i].shortURL === link){
          visits[i] = this.visitors[key][i];
        }
      }
    }
    return visits;
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

  makeTimestamp: function() {
    return moment().utcOffset(-7).format("YYYY/MM/DD h:mm:ss a");
  },

  checkURL: function(url) {
    var res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if(res == null){
      return false;
    } else {
      return true;
    }
  },

};