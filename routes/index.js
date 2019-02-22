var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User    = require("../models/user");

// landing page
router.get("/", function(req, res) {
    res.render("landing");
});

// signup
router.get('/register', function(req, res) {
   res.render('register'); 
});

// new register
router.post('/register', function(req, res) {
   var newUser = new User({username: req.body.username});
   User.register(newUser, req.body.password, function(err, user) {
      if(err){
          req.flash("error", err.message);
          console.log(err);
          return res.redirect('/register');
      }
      passport.authenticate("local")(req, res, function() {
          req.flash("success", "Welcome to YelpCamp, " + user.username + "!");
         res.redirect('/campgrounds'); 
      });
   });
});

// login page
router.get('/login', function(req, res) {
    res.render('login');
});

// handle login
router.post('/login', passport.authenticate("local", 
    {
        successRedirect: '/campgrounds',
        failureRedirect: '/login'
    }), function(req, res) {
        
});

// logout
router.get('/logout', function(req, res) {
   req.logout();
   req.flash("success", "You have been logged out!");
   res.redirect('/campgrounds');
});

// middleware -> Now in middleware/index.js
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;