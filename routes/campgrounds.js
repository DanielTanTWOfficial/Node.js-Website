var express = require("express");
var router  = express.Router({mergeParams: true});
var campground = require("../models/campground");
var middleware = require("../middleware");

// campgrounds page
router.get("/", function(req, res) {
    // Get data from DB
    campground.find({}, function(err, allCamps) {
        if(err) {
            console.log(err);
        }
        else {
            res.render("campgrounds/index", {campgrounds: allCamps, currentUser: req.user});
        }
    });
});

// add new campground
router.post("/", middleware.isLoggedIn, function(req, res) {
    // redirect to campground's page
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    campground.create(newCampground, function (err, data) {
        if(err) {
            console.log(err);
        }
        else {
             res.redirect("/campgrounds");
        }
    });
   
});

router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new"); 
});

router.get("/:id", function(req, res) {
   campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
       if(err) {
           console.log(err);
       }
       else {
           console.log(foundCampground);
           res.render("campgrounds/show", {campground: foundCampground});
       }
   });
});

// EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
    campground.findById(req.params.id, function(err, foundCampground) {
        if(err) {
            console.log(err);
            res.redirect('back');
        }
        res.render('campgrounds/edit', {campground: foundCampground});
});
});

// UPDATE CAMPGROUND ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
    // find and update the correct campground
    campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updateCampground) {
       if(err) {
           console.log(err);
           res.redirect('/campgrounds');
       } 
       else {
           req.flash("success", "Campground updated!");
           res.redirect('/campgrounds/' + req.params.id);
       }
    });
    //redirect somewhere(show page)
});

// DESTROY CAMPGROUND ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res) {
   campground.findByIdAndRemove(req.params.id, function(err) {
       if(err) {
           console.log(err);
           res.redirect('/campgrounds');
       }
       else {
           req.flash("success", "Campground deleted!");
           res.redirect('/campgrounds');
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

function checkCampgroundOwnership(req, res, next) {
    // Is user logged in?
    if(req.isAuthenticated()){
        campground.findById(req.params.id, function(err, foundCampground) {
          if(err) {
              console.log(err);
              res.redirect('back');
          } 
          else {
              // does user own the comment?
              if(foundCampground.author.id.equals(req.user._id)){
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