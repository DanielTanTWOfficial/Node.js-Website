var express = require("express");
var router  = express.Router({mergeParams: true});  // mergeParams makes this file get the same parameters as app.js
var campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// new comments
router.get("/new", middleware.isLoggedIn, function(req, res){
   // find campground by id
   campground.findById(req.params.id, function(err, campground) {
       if(err){
           console.log(err);
       }
       else {
           res.render("comments/new", {campground: campground});
       }
   });
});

// new comments post
router.post("/", middleware.isLoggedIn, function(req, res) {
   // lookup campground using ID
   campground.findById(req.params.id, function(err, campground) {
       if(err) {
           console.log(err);
           res.redirect("/campgrounds");
       }
       else {
           Comment.create(req.body.comment, function(err, comment) {
               if(err) {
                   console.log(err);
               }
               else {
                   // add username and ID to comments
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   // save comment
                   comment.save();
                   campground.comments.push(comment);
                   campground.save();
                   console.log(comment);
                   res.redirect("/campgrounds/" + campground._id);
               }
           });
       }
   });
   // create new comment
   // connect comment to campground
   // redirect to campground show page
});

// EDIT COMMENTS ROUTE
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
       if(err) {
           console.log(err);
           res.redirect('back');
       } else {
           res.render('comments/edit', {campground_id: req.params.id, comment: foundComment}); 
       }
    });
});

// UPDATE COMMENT ROUTE
router.put('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
   // find and update the correct campground
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
       if(err) {
           console.log(err);
           res.redirect('back');
       } 
       else {
           req.flash("success", "Comment updated!");
           res.redirect('/campgrounds/' + req.params.id);
       }
    });
    //redirect somewhere(show page)
});

// DESTROY COMMENT ROUTE
router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
   Comment.findByIdAndRemove(req.params.comment_id, function(err) {
       if(err) {
           console.log(err);
           res.redirect('back');
       }
       else {
           req.flash("success", "Comment deleted!");
           res.redirect('/campgrounds/' + req.params.id);
       }
   }); 
});

// middleware -> now stored in middleware/index.js
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkCommentOwnership(req, res, next) {
    // Is user logged in?
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
          if(err) {
              console.log(err);
              res.redirect('back');
          } 
          else {
              // does user own the campground?
              if(foundComment.author.id.equals(req.user._id)){
                  next();
              } else {
                  res.redirect('back');
              }
          }
        });
    } else{
        res.redirect('back');
    }
}

module.exports = router;