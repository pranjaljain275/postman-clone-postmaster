const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport=require("passport")
const { v4: uuidv4 } = require('uuid');
const {UserModel}=require("../Model/user.model")
passport.use(new GoogleStrategy({
    clientID: "298513693852-mss3d1bacmbdrt1ft3tnnv33hjfespnk.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:7575/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    let email=profile._json.email
    const user=new UserModel({
        email,
        password:uuidv4()
    })
    await user.save()

      return cb(null, user);
 
  }
));

module.exports={
    passport
}