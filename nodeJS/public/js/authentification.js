(function() {
	const config = {
		apiKey: "AIzaSyBxW4lBdIKKuaUAsAl3wJe4KvvGeA_qCco",
		authDomain: "dashboard-fa9f0.firebaseapp.com",
		databaseURL: "https://dashboard-fa9f0.firebaseio.com",
		projectId: "dashboard-fa9f0",
		storageBucket: "dashboard-fa9f0.appspot.com",
		messagingSenderId: "831630185347"
	};

	firebase.initializeApp(config);

	const btnLogIn = document.getElementById('btn-log-in');
	const btnSignUp = document.getElementById('btn-register');
	const btnLogOut = document.getElementById('btn-log-out');


	if (btnLogIn) {

		// Log In
		btnLogIn.addEventListener("click", e => {
			e.preventDefault();
			const email = document.getElementById('input-login-email').value;
			const password = document.getElementById('input-login-password').value;


			firebase.auth().signInWithEmailAndPassword(email, password);
		});

		// Create account
		btnSignUp.addEventListener("click", e => {
			e.preventDefault();
			const email = document.getElementById('input-register-email').value;
			const password = document.getElementById('input-register-password').value;
			const password2 = document.getElementById('input-register-password2').value;

			if (password == password2) {
				firebase.auth().createUserWithEmailAndPassword(email, password);
			};
		});

	} else {

		// Log Out
		btnLogOut.addEventListener("click", e => {
			e.preventDefault();
			firebase.auth().signOut();
		});
	};

	// Detect connection changements
	firebase.auth().onAuthStateChanged(firebaseUser => {
		if (firebaseUser) {
			socket.emit('logIn', {"user": firebaseUser, "URL": window.location.pathname});
		} else {
			socket.emit('notConnected', {"URL": window.location.pathname});
		};
	});

}());