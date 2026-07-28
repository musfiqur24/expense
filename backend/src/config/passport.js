import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env, hasGoogleOAuthCredentials } from "./env.js";
import User from "../models/User.js";
import { seedDefaultCategories } from "../services/categoryService.js";

function googleEmail(profile) {
  return profile.emails?.find((email) => email.verified)?.value || profile.emails?.[0]?.value || "";
}

export function configurePassport() {
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  if (!hasGoogleOAuthCredentials) {
    console.warn("Google OAuth is disabled: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required.");
    return passport;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = googleEmail(profile).toLowerCase();
          if (!email) return done(null, false, { message: "Google did not return an email address" });

          const displayName = profile.displayName || email.split("@")[0];
          const user = await User.findOneAndUpdate(
            { googleId: profile.id },
            {
              $set: {
                email,
                displayName,
                givenName: profile.name?.givenName || "",
                familyName: profile.name?.familyName || "",
                avatarUrl: profile.photos?.[0]?.value || "",
                lastLoginAt: new Date()
              },
              $setOnInsert: {
                googleId: profile.id
              }
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
          );

          await seedDefaultCategories(user._id);
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  return passport;
}

export default passport;
