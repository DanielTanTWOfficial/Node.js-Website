var express                 = require("express"),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    campground              = require("./models/campground"),
    Comment                 = require("./models/comment"),
    passport                = require("passport"),
    localStrategy           = require("passport-local"),
    methodOverride          = require("method-override"),
    User                    = require("./models/user"),
    flash                   = require("connect-flash");
    
var commentRoutes           = require("./routes/comments"),
    campgroundRoutes        = require("./routes/campgrounds"),
    indexRoutes              = require("./routes/index");
    
var app = express();

var url = process.env.DATABASEURL || "mongodb://localhost/yelpcamp";

// export DATABASEURL=...
console.log(process.env.DATABASEURL);

// Connect to DB (with separation of concerns)
mongoose.connect(url, {useNewUrlParser: true});  //Use a localhost database for testing/production purpose

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());

app.set("view engine", "ejs");

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Th3 Cr@zy stuff is all h3r3 m8",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// push current user value to every page
app.use(function(req, res, next) {
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use(indexRoutes)

app.use('/campgrounds/:id/comments', commentRoutes)

app.use('/campgrounds', campgroundRoutes)

app.listen(process.env.PORT, process.env.ID, function() {
    console.log("YelpCamp Server Started!");
});