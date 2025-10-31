// API configuration
const API_URL = 'http://localhost:3000';

/*
    Function to check the health of the tRPC API server
*/
async function checkHealth() {
    const statusDiv = document.getElementById('status');
    const refreshBtn = document.getElementById('refreshBtn');

    // Disable button and show loading state
    refreshBtn.disabled = true;
    statusDiv.innerHTML = '<p>🔄 Checking API status...</p>';

    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();

        if (response.ok) {
            statusDiv.innerHTML = `
                <div class="success">
                    <h2>✅ API is healthy!</h2>
                    <p><strong>Status:</strong> ${data.status}</p>
                    <p><strong>Timestamp:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                    <p><strong>API URL:</strong> ${API_URL}</p>
                </div>
            `;
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        statusDiv.innerHTML = `
            <div class="error">
                <h2>❌ API is not responding</h2>
                <p><strong>Error:</strong> ${error.message}</p>
                <p><strong>API URL:</strong> ${API_URL}</p>
                <p>Make sure the API server is running:</p>
                <code>cd api && npm run dev</code>
            </div>
        `;
    } finally {
        // Re-enable button
        refreshBtn.disabled = false;
    }
}

/*
    Function to set up a system tray menu with options specific to the window mode.
*/
function setTray() {
    // Tray menu is only available in window mode
    if(NL_MODE != "window") {
        console.log("INFO: Tray menu is only available in the window mode.");
        return;
    }

    // Define tray menu items
    let tray = {
        icon: "/resources/icons/trayIcon.png",
        menuItems: [
            {id: "REFRESH", text: "Refresh Health Check"},
            {id: "SEP", text: "-"},
            {id: "QUIT", text: "Quit"}
        ]
    };

    // Set the tray menu
    Neutralino.os.setTray(tray);
}

/*
    Function to handle click events on the tray menu items.
*/
function onTrayMenuItemClicked(event) {
    switch(event.detail.id) {
        case "REFRESH":
            checkHealth();
            break;
        case "QUIT":
            Neutralino.app.exit();
            break;
    }
}

/*
    Function to handle the window close event by gracefully exiting the Neutralino application.
*/
function onWindowClose() {
    Neutralino.app.exit();
}

// Initialize Neutralino
Neutralino.init();

// Register event listeners
Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
Neutralino.events.on("windowClose", onWindowClose);

// Conditional initialization: Set up system tray if not running on macOS
if(NL_OS != "Darwin") { // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
    setTray();
}

// Check health on page load
checkHealth();
