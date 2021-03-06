const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const UserSchema = require('./models/user');

module.exports = passport => {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser((id, done) => {
        UserSchema.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK
    },
        (token, refreshToken, profile, done) => {
            UserSchema.findOne({ 'google.id ': profile.id }, (err, user) => {
                if (err) return done(err);
                if (user) {
                    return done(null, user);
                } else {
                    const newUser = new UserSchema();

                    newUser.google.id = profile.id;
                    newUser.google.token = token;
                    newUser.google.name = profile.displayName;
                    newUser.google.email = profile.emails[0].value;

                    newUser.save(err => {
                        if (err) throw err;
                        return done(null, newUser);
                    });
                }
            })
        }))

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({ passReqToCallback: true },
        (req, username, password, done) => {
            UserSchema.findOne({ 'local.username' :  username }, (err, user) => {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'Ce nom d\'utilisateur est déjà utilisé'));
                } else if (req.body.password !== req.body.confirmPassword) {
                    return done(null, false, req.flash('signupMessage', 'Les mots de passe doivent être identiques'));
                } else {
                    const newUser = new UserSchema();
                    newUser.local.username = username;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.save((err) => {
                        if (err)
                            throw err;
                        req.session.username = username;
                        return done(null, newUser);
                    });
                }
            });
        })
    );

    passport.use('local-login', new LocalStrategy({ passReqToCallback: true },
        (req, username, password, done) => {
            UserSchema.findOne({ 'local.username':  username }, (err, user) => {
                if (err)
                    return done(err);
                if (!user || !user.validPassword(password)) {
                    return done(null, false, req.flash('loginMessage', 'Nom d\'utilisateur ou mot de passe incorrect(s)'));
                }
                req.session.username = username;
                return done(null, user);
            });
        }
    ))
}