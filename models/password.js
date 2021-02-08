const mongoose = require('mongoose')
const user = require('./user');

const passwordSchema = mongoose.Schema({
    password: String,
    application: String,
    username: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'  
    }
});


const passwordDB = mongoose.model('passwordDB', passwordSchema);

module.exports = passwordDB;