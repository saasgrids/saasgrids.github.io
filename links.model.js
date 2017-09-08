
var mongoose = require('mongoose')
   ,Schema = mongoose.Schema

var linkModel = new Schema({
    redirectURl : String,
    html : String,
});

module.exports = mongoose.model('linkdetails', linkModel);