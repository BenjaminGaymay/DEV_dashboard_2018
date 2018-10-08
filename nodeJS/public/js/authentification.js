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

	const emailInput = document.getElementById('emailInput');
	const passwordInput = document.getElementById('passwordInput');
	const btnLogIn = document.getElementById('btnLogIn');
	const btnSignUp = document.getElementById('btnSignUp');
	const btnLogOut = document.getElementById('btnLogOut');


	if (btnLogIn) {

		// Log In
		btnLogIn.addEventListener("click", e => {
			const email = emailInput.value;
			const password = passwordInput.value;


			firebase.auth().signInWithEmailAndPassword(email, password);
		});

		// Create account
		btnSignUp.addEventListener("click", e => {
			const email = emailInput.value;
			const password = passwordInput.value;
			const auth = firebase.auth();

			firebase.auth().createUserWithEmailAndPassword(email, password);
		});

	} else {

		// Log Out
		btnLogOut.addEventListener("click", e => {
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