// Startup file for cPanel "Setup Node.js App" (Phusion Passenger), which
// loads the app with require() and so can't start an ES module directly.
import("./src/index.js");
