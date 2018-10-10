const router = require('express').Router();
const UserSchema = require('../models/user');
const bcrypt = require('bcrypt');



function getUnixTime() {
	return Date.now() / 1000 | 0;
};

router.get('/', (req, res, next) => {
	res.render('index');
	// if (req.session.authentificated) {
	// 	res.render('index');
	// } else {
	// 	res.redirect('/login');
	// };
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

	if (password1 === password2) {
		bcrypt.hash(password1, 10, (err, hash) => hashedPassword = hash);
		// console.log(hashedPassword);
		const user = new UserSchema({
			email,
			password: password1
		});
		user.save((err) => {
			if (err) throw err;
			console.log('User saved!');
		})
		// const user = new UserSchema({
		// 	email
		// })
		req.session.authentificated = true;
		res.redirect('/widgets');
	} else {
		req.flash('info', {msg: 'Blabla pas bon'});
		res.redirect('/login');
	}
	// console.log(password1, password2, email);
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
	if (req.session.authentificated) {
		res.render('widgets');
	} else {
		res.redirect('/login');
	};
});

module.exports = router;