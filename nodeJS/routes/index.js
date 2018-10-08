const router = require('express').Router();
const UserSchema = require('../models/user');

function getUnixTime() {
	return Date.now() / 1000 | 0;
};

router.get('/', (req, res, next) => {
	res.render('login');
	// if (req.session.authentificated) {
	// 	res.render('index');
	// } else {
	// 	res.redirect('/login');
	// };
});

router.get('/login', (req, res, next) => {
	if (req.session.authentificated) {
		res.redirect('widgets');
	} else {
		res.render('login');
	};
});

router.post('/login', (req, res) => {
	// console.log(req.body.email, req.body.password);
	if (req.body.email == "a@a.com") {
		req.session.authentificated = true;
		res.redirect("/widgets");
	} else {
		res.redirect("/login");
	};
});

router.post('/logout', (req,res) => {
	req.session.authentificated = false;
	res.redirect('/login');
});

router.post('/register', (req, res) => {
	const {
		password1,
		password2,
		email
	} = req.body;

	if (password1 === password2 && password1.length > 6) {

	} else {

	}
	console.log(password1, password2, email);
});

router.get('/about.json', (req, res, next) => {
	const fs = require('fs');
	const about = JSON.parse(fs.readFileSync('about.json', 'utf8'));

	about.client.host = req.ip.split(':').pop();
	about.server.current_time = getUnixTime();
	res.send(about);
});

router.get('/widgets', (req, res) => {
	if (req.session.authentificated) {
		res.render('widgets');
	} else {
		res.redirect('/login');
	};
});

module.exports = router;