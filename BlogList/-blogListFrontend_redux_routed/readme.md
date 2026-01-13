https://fullstackopen.com/en/part7/exercises_extending_the_bloglist

extends BlogList frontend from https://fullstackopen.com/en/part5/
to add redux. Model for redux: -redux_anecdotes (uses redux toolkit to avoid boiler plate code)

npm run dev to run this frontend / ok
npm run lint / ok

backend: (both served on http://localhost:3003/api/blogs)
npm run server here on other terminal (json server, uses routes option and routes.json to serve on api/)
npm run dev in blogListBackend (there app.use(cors())) - this uses mongodb connexion.

Notes
-Ex 7.20 and 7.21 (styling): see NotificationMui.jsx
-end to end tests in blogList_routed-e2e. To test, backend has to run with npm run start:test and frontend with npm run dev; then, can do
npm run test:chromium in blogList_routed-e2e.
