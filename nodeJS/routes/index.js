const router = require('express').Router();
const UserSchema = require('../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');
const passportLocal = require('passport-local');
const LocalStrategy = passportLocal.Strategy;


passport.use(new LocalStrategy((username, password, done) => {
	User.findOne({ username }, (err, user) => {
		if (err) return done(err);
		if (!user) {
			return done(null, false, { message: 'Incorrect username.' });
		}
		if (!user.validPassword(password)) {
			return done(null, false, { message: 'Incorrect password.' });
		}
		return done(null, false, { message: 'Incorrect password.' });
	});
	}
));


passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

function getUnixTime() {
	return Date.now() / 1000 | 0;
};

router.get('/', (req, res, next) => {
	res.render('index');
});

// router.get('/login', (req, res, next) => {
// 	if (req.session.authentificated) {
// 		res.redirect('widgets');
// 	} else {
// 		res.render('login');
// 	};
// });

// router.post('/login', (req, res) => {
// 	// console.log(req.body.email, req.body.password);
// 	if (req.body.email == "a@a.com") {
// 		req.session.authentificated = true;
// 		res.redirect("/widgets");
// 	} else {
// 		res.redirect("/login");
// 	};
// });

router.post('/login',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true })
);

router.post('/logout', (req,res) => {
	// req.session.authentificated = false;
	res.redirect('/login');
});

router.post('/register', (req, res) => {
	const {
		password1,
		password2,
		email
	} = req.body;

});

router.get('/login', (req, res) => {
	console.log('Inside GET /login callback function')
	console.log(req.sessionID)
	res.send(`You got the login page!\n`)
});

router.post('/login', (req, res) => {
	console.log('Inside POST /login callback function')
	console.log(req.body)
	res.send(`You posted to the login page!\n`)
});

router.get('/about.json', (req, res, next) => {
	const fs = require('fs');
	const about = JSON.parse(fs.readFileSync('about.json', 'utf8'));

	about.client.host = req.ip.split(':').pop();
	about.server.current_time = getUnixTime();
	res.send(about);
});

router.get('/widgets', (req, res) => {
	// if (req.session.authentificated) {
	// 	res.render('widgets');
	// } else {
	// 	res.redirect('/login');
	// };
	res.redirect('/login');
});

module.exports = router;