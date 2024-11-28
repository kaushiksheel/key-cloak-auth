import express from "express";
import Keycloak from "keycloak-connect";
import cors from "cors";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

const keycloakConfig = {
  realm: "myrealm",
  "auth-server-url": "http://localhost:8080/",
  "ssl-required": "external",
  resource: "myclient",
  "public-client": true,
  "confidential-port": 0,
};

const keycloak = new Keycloak({}, keycloakConfig);

app.use(keycloak.middleware());

app.get("/api/public", (req, res) => {
  res.json({ message: "This is a public endpoint" });
});

app.get("/api/protected", keycloak.protect(), (req, res) => {
  res.json({
    message: "This is a protected endpoint",
    user: req.kauth.grant.access_token.content,
  });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
