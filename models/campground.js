var mongoose = require("mongoose");

// Setup Schema
var campgroundSchema = new mongoose.Schema({
   name: String,
   price: String,
   image: String,
   description: String,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
       { 
         type: mongoose.Schema.Types.ObjectId, 
         ref: "Comment"
       }
    ]
});

var campground = mongoose.model("Campground", campgroundSchema);
module.exports = campground;