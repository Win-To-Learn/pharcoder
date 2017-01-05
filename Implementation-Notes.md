# Game State and Network Protocols

Here is an overview of the major landmarks for game state when a user logs in and the network transitions that drive them.

1. Player is presented with login form defined in `login.html`
2. Player submits credentials over http. This is implemented as an AJAX request to a RESTful(ish) endpoint at `/api/login`. The content of the request is a JSON encoded Javascript object. For a guest login it's just `{tag: SELECTED GAMERTAG}`; for a registered login it's `{user: USERNAME, pass: PASSWORD}`.
3. The login information is received by the `loginPOST` function implemented in `SessionHandler.js`. Assuming the credentials check out, we create a "ticket" with the player's information in a special MongoDB collection, set the unique id of the ticket as a session variable, and redirect to `play.html'.
4. The server checks for the `ticketid` session variable before serving `play.html`. If it's not there it redirects back to `login.html`.
5. `play.html` contains our Phaser application. It starts off in a Phaser state called Boot that preloads a couple assets for a progress bar for the "real" Preload state.
6. In the boot state we made an AJAX call to the endpoint `/api/identity`. This in authenticated by the `ticketid` in the session variable and returns a JSON encoded object with the `ticketid` value as well as the address of the game server to login to. While we currently have a single server handling login and game logic, this architecture allows for the possibility of separating the two and directing users to an appropriate game server based on whatever business or load balancing logic we want.
7. After getting a response from REST endpoint, the client initiates a socket.io connection with the specified game server.
8. One the game server has accepted the connection, the client sends a socket.io `'login'` message with the `ticketid` value. The server checks that the id corresponds with a known and recently logged in user (registered or guest) and replies with a `'loginSuccess'` message containing a player data object that will allow the client to recognize itself in physics updates from the server.
9. Meanwhile, once the Boot state finishes preloading the progress bar assets, it switches to the Preload state where it loads the rest of the game assets.
10. Once the preloading has finished and the client has received the `'loginSuccess'` message, the game switches to the Space state. The `create` function in the Space state sends a `'ready'` message to the server which tells it to start sending physics updates.


