import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Strategy as AppleStrategy } from "passport-apple";
import { storage } from "../storage";
import "dotenv/config";

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "/api/auth/google/callback",
                passReqToCallback: true,
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    let user = await storage.getUserByGoogleId(profile.id);
                    if (!user && profile.emails?.[0].value) {
                        user = await storage.getUserByEmail(profile.emails[0].value);
                        if (user) {
                            // Update existing user with googleId
                            user = await storage.updateUser(user.id, { googleId: profile.id, avatarUrl: profile.photos?.[0]?.value });
                        }
                    }

                    if (!user) {
                        // Create new user
                        user = await storage.createUser({
                            username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substring(7),
                            email: profile.emails?.[0].value,
                            googleId: profile.id,
                            avatarUrl: profile.photos?.[0]?.value,
                            role: "member",
                        });
                    }
                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );
}

// Microsoft Strategy
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    passport.use(
        new MicrosoftStrategy(
            {
                clientID: process.env.MICROSOFT_CLIENT_ID,
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
                callbackURL: "/api/auth/microsoft/callback",
                scope: ["user.read"],
            },
            async (accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    let user = await storage.getUserByMicrosoftId(profile.id);
                    if (!user && profile.emails?.[0].value) {
                        user = await storage.getUserByEmail(profile.emails[0].value);
                        if (user) {
                            user = await storage.updateUser(user.id, { microsoftId: profile.id });
                        }
                    }

                    if (!user) {
                        user = await storage.createUser({
                            username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substring(7),
                            email: profile.emails?.[0].value,
                            microsoftId: profile.id,
                            role: "member",
                        });
                    }
                    return done(null, user);
                } catch (err: any) {
                    return done(err);
                }
            }
        )
    );
}

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await storage.getUserById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;
