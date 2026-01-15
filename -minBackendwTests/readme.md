done from minBackend:

npm init
npm install express 
npm i morgan dotenv mongoose mongodb
(npm install
npm update)
and add "dev": "node --watch index.js", "start": "node index.js", to scripts in package.json
npm run dev

---------------------
MONGOURL, PORT to utils/config
console.log to utils/logger
db model to models/blog
routes to controllers/blogs, in index.js app.use('/api/blogs', blogsRouter)
middelware to middelware


-----------------------
printf '\33c\e[3J';  npm run test

npm run lint

npm run dev (http://localhost:3003/api/blogs)

backend written with async await or with callback functions (blogs__.js)
