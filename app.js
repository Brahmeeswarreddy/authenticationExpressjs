const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const databasePath = path.join(__dirname, "covid19India.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  console.log(password);
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username=${username}`;
  const dbUser = await db.get(selectUserQuery);
  if (password.length < 5) {
    response.send(400);
    response.send("Password is too short");
  }
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
      user(username, name, password, gender, location)
      VALUES('${username}','${name}','${hashedPassword}','${gender}','${location}')`;
    await database.run(createUserQuery);
    response.send("'User created successfully");
  } else {
    response.send(400);
    response.send("User already exists");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `
  SELECT * FROM user WHERE username='${username}'`;
  const dbUser = await database.get(selectUserQuery);
  if (dbUser === undefined) {
    response.send(400);
    response.send("Invalid User");
  } else {
    const isPasswordisMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordisMatched === true) {
      response.send("Login success");
    } else {
      response.send(400);
      response.send("Invalid Password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const checkselectUserQuery = `
  SELECT * FROM user WHERE username='${username}'`;
  const dbUser = await db.get(checkselectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("User not registered");
  } else {
    const isPasswordisMatched = await bcrypt.compare(
      oldPassword,
      dbUser.password
    );
    if (isPasswordisMatched === true) {
      const lengthOfNewPassword = newPassword.length;
      if (lengthOfNewPassword < 5) {
        response.send(400);
        response.send("Password is too short");
      } else {
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatePass = `
              UPDATE user 
               SET password='${encryptedPassword}'
               WHERE username='${username}'`;
        await db.run(updatePass);
        response.send("Password updated");
      }
    } else {
      response.send(400);
      response.send("Invalid current password");
    }
  }
});
module.exports = app;
