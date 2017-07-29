
var mongoose = require('mongoose')
   ,Schema = mongoose.Schema

var postSchema = new Schema({
    Name : String,
    Email : String,
    Company : String,
    FC : {}
});

module.exports = mongoose.model('earlyaccessdetails', postSchema);