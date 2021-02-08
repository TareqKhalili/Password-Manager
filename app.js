const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passwordDB = require('./models/password');
const User = require('./models/user');
const passport = require('passport');
const expressSession = require('express-session');
const passportLocal = require('passport-local');

let data = [];

mongoose.connect(config.db.connection, {useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex: true });


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(expressSession({ 
    secret: "dulhqwdqwidioqwjdfioqwjfipopoqwjpojqfwpoj",
    resave: false,
    saveUninitialized: false
 }));


app.use(passport.initialize());
app.use(passport.session()); // allows persistent sesions 
passport.serializeUser(User.serializeUser()); // encodes data into the session (passport-local-mongoose)
passport.deserializeUser(User.deserializeUser()); // decodes data from the session

const localStretagy = passportLocal.Strategy;
passport.use(new localStretagy(User.authenticate()));


app.get('/', (req, res) => {
    res.redirect('login');
});

app.get('/login', (req, res) => {
    res.render('login')
})


app.post('/login', passport.authenticate('local', {
    failureRedirect: 'login'
}),async (req, res) => {
    try {
        user = await User.findOne({username: req.body.username});
        res.redirect(`home/${user._id}`);
    } catch (error) {
        res.send(err);
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    try {
        const newUser = await User.register(new User({
            username: req.body.username
        }),req.body.password);
        passport.authenticate('local')(req, res, () => {
            res.redirect(`/home/${newUser._id}`);
        });
    } catch (error) {
        res.redirect('/signup')
    }
 

});

app.get('/home/:id', isLoggedIn,async (req, res) => {
    try {
        data = await passwordDB.find({userId: req.params.id});
        res.render("landing-page", {data, id: req.params.id});
    } catch (error) {
        res.send(error)
    }
})

app.post('/home/:id', async (req, res) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    password = ""
    for (let index = 0, n = charset.length; index < 32; index++) {
        password += charset.charAt(Math.floor(Math.random() * n))
    }
    try {
       // let data = await passwordDB.find({userId: req.params.id});
        res.render('generated', {password, data, id: req.params.id});
    } catch (error) {
        res.send(error)
    }
    password = "";
})

app.post('/home/:id/add', (req, res) => {
    let current = new passwordDB ({
        password: req.body.generatedPassword,
        application: req.body.application,
        username: req.body.username,
        userId: req.params.id
    })
    current.save((err) => {
        if (err) {
            res.send(err)
        } else {
            res.redirect(`/home/${req.params.id}`);
        }
    })
    
});

app.delete("/home/:userId/:passwordId", (req, res) => {
    passwordDB.findByIdAndDelete(req.params.passwordId, (err) => {
        if (err) alert("error occured")
        else {
            res.redirect(`/home/${req.params.userId}`);
        }
    })
})


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('login');
    }
}


app.get('/logout', (req, res) => {
    req.logout();
    data = [];
    res.redirect('/login');
})


app.listen('8080')

