const express = require('express');
const connection = require('./database/connection');
const cors = require('cors');


// Data Base Connection
connection();

// Node Server Creation
const app = express();
const port = 3700;


// CORS Setup
app.use(cors());


// Middlewares (configuration to convert data from body to JSON)
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// Load Route Files
const UserRoutes = require('./routes/user');
const PostRoutes = require('./routes/post');
const FollowRoutes = require('./routes/follow');

// Routes Setup
app.use("/api/user", UserRoutes);
app.use("/api/post", PostRoutes);
app.use("/api/follow", FollowRoutes);


// Server creation and http request listening
app.listen(port, () => {
    console.log(`######## Servidor corriendo correctamente en la url: http://localhost:${port} ########`);
});