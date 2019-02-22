// middleware goes here
var middlewareObj = {};
var campground = require("../models/campground");
var Comment = require("../models/comment");

middlewareObj.checkCampgroundOwnership = function checkCampgroundOwnership(req, res, next) {
    // Is user logged in?
    if(req.isAuthenticated()){
        campground.findById(req.params.id, function(err, foundCampground) {
          if(err) {
              console.log(err);
              req.flash("error", "Campground not found!");
              res.redirect('back');
          } 
          else {
              // Make sure campground does exist before checking author
              if(!foundCampground) {
                  req.flash("error", "Campground not found!");
                  return res.redirect('back');
              }
              // does user own the campground?
              if(foundCampground.author.id.equals(req.user._id)){
                  next();
              } else {
                  req.flash("error", "You do not have permission to edit this campground!");
                  res.redirect('back');
              }
          }
        });
    } else{
        req.flash("error", "You need to be logged in to edit this campground!");
        res.redirect('back');
    }
};

middlewareObj.checkCommentOwnership = function checkCommentOwnership(req, res, next) {
    // Is user logged in?
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
          if(err) {
              console.log(err);
              req.flash("error", "Comment not found!");
              res.redirect('back');
          } 
          else {
              if(!foundComment) {
                  req.flash("error", "Comment not found!");
                  return res.redirect('back');
              }
              // does user own the comment?
              if(foundComment.author.id.equals(req.user._id)){
                  next();
              } else {
                  req.flash("error", "You do not have permission to edit this comment!");
                  res.redirect('back');
              }
          }
        });
    } else{
        req.flash("error", "You need to be logged in to edit this comment!");
        res.redirect('back');
    }
}

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to to that!");
    res.redirect('/login');
}

module.exports = middlewareObj;