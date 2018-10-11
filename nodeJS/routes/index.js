const router = require('express').Router();
const passport = require('passport');
const widgets = require('../widgets/widgets');

router.get('/', (req, res, next) => {
	res.render('index');
});

router.get('/profil', isLoggedIn, (req, res) => {
	res.render('profil', { user: req.user });
});

router.get('/login', (req, res) => {
	res.render('login', { message: req.flash('loginMessage') });
});

router.post('/login', passport.authenticate('local-login', {
	successRedirect : '/widgets', // redirect to the secure profile section
	failureRedirect : '/login', // redirect back to the signup page if there is an error
	failureFlash : true // allow flash messages
}));

router.get('/signup', (req, res) => {
	res.render('signup', { message: req.flash('signupMessage') });
});

router.post('/signup', passport.authenticate('local-signup', {
	successRedirect : '/widgets', // redirect to the secure profile section
	failureRedirect : '/signup', // redirect back to the signup page if there is an error
	failureFlash : true // allow flash messages
}));

router.get('/about.json', (req, res, next) => {
	const fs = require('fs');
	const about = JSON.parse(fs.readFileSync('about.json', 'utf8'));

	about.client.host = req.ip.split(':').pop();
	about.server.current_time = getUnixTime();
	res.send(about);
});

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
})

router.get('/widgets', isLoggedIn ,(req, res) => {
	res.render('widgets', {
		citiesList: widgets.weatherCities
	});
});

router.get('/login/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

router.get('/login/google/callback', (req, res, next) => {
	passport.authenticate('google', {
		successRedirect: '/profil',
		failureRedirect: '/login'
	})
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	req.flash('loginMessage', 'Vous devez être connecté pour accèder à ce contenu');
	res.redirect('/login');
}

function getUnixTime() {
	return Date.now() / 1000 | 0;
};


module.exports = router;