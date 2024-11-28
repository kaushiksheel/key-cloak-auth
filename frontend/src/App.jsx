import React, { useState, useEffect, useCallback } from "react";
import Keycloak from "keycloak-js";
import axios from "axios";

const App = () => {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [publicData, setPublicData] = useState("");
  const [protectedData, setProtectedData] = useState("");

  const initKeycloak = useCallback(async () => {
    const keycloakInstance = new Keycloak({
      url: "http://localhost:8080",
      realm: "myrealm",
      clientId: "myclient",
    });

    try {
      const authenticated = await keycloakInstance.init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        pkceMethod: "S256",
        checkLoginIframe: false,
        enableLogging: true,
      });

      setKeycloak(keycloakInstance);
      setAuthenticated(authenticated);

      if (authenticated) {
        keycloakInstance.onTokenExpired = () => {
          keycloakInstance.updateToken(30);
        };
      }
    } catch (error) {
      console.error("Keycloak init error", error);
    }
  }, []);

  useEffect(() => {
    initKeycloak();
  }, [initKeycloak]);

  const login = () => keycloak?.login();
  const logout = () => keycloak?.logout();

  const fetchPublicData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/public");
      setPublicData(response.data.message);
    } catch (error) {
      console.error("Error fetching public data", error);
    }
  };

  const fetchProtectedData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/protected", {
        headers: { Authorization: `Bearer ${keycloak?.token}` },
      });
      setProtectedData(response.data.message);
    } catch (error) {
      console.error("Error fetching protected data", error);
    }
  };

  if (!keycloak) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Keycloak React Example</h1>
      {authenticated ? (
        <div>
          <p>User is authenticated</p>
          <button onClick={logout}>Logout</button>
          <button onClick={fetchPublicData}>Fetch Public Data</button>
          <button onClick={fetchProtectedData}>Fetch Protected Data</button>
          <p>Public Data: {publicData}</p>
          <p>Protected Data: {protectedData}</p>
        </div>
      ) : (
        <div>
          <p>User is not authenticated</p>
          <button onClick={login}>Login</button>
        </div>
      )}
    </div>
  );
};

export default App;
