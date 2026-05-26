# SmartSplit Production Launch Checklist

## Authentication and Database

1. Create a Firebase project.
2. Enable Authentication providers:
   - Google
   - Email/password, if username/email login should remain available
3. Add authorized domains:
   - `satya99-c.github.io`
   - Any custom domain you add later
4. Create a Firestore database.
5. Publish the rules from `firestore.rules`.
6. Copy Firebase web app config into `firebase-config.js`.

Each signed-in user stores data under:

```text
users/{firebaseAuthUserId}
```

The saved document contains:

```text
profile
expenses
trackingFiles
userDetails
updatedAt
```

## Play Store

GitHub Pages is only the web version. For Play Store publishing, wrap the web app as an Android app using Capacitor or Trusted Web Activity, then upload an Android App Bundle (`.aab`) in Google Play Console.

Required before upload:

- Google Play Developer account
- Android package name, for example `com.smartsplit.app`
- App icon and feature graphic
- Privacy policy URL
- Data safety answers
- Signed release build

## Monetization

Use AdMob for the Android app. AdSense is for websites; AdMob is the Google product for in-app ads.

Needed before adding ads:

- AdMob account
- AdMob app ID
- Ad unit IDs for banner/interstitial/rewarded ads
- Consent flow for users where required

For the web version, AdSense can be added separately after the site is approved.
