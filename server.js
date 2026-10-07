const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const VALID_DIRECTIONS = ["forward", "backward", "left", "right", "stop"];

let robotState = {
    direction: "stop",
    lastCommandAt: null
};

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "robot-api",
        status: "online",
        time: new Date().toISOString()
    });
});

// Current robot state
app.get("/api/state", (req, res) => {
    res.json({
        success: true,
        ...robotState
    });
});

// Main API - designed for both webpage and Alexa backend
app.post("/api/move", (req, res) => {
    const direction = String(req.body?.direction || "").toLowerCase().trim();

    if (!VALID_DIRECTIONS.includes(direction)) {
        return res.status(400).json({
            success: false,
            error: "Invalid direction",
            allowed: VALID_DIRECTIONS
        });
    }

    robotState = {
        direction,
        lastCommandAt: new Date().toISOString()
    };

    console.log(`[ROBOT] ${direction.toUpperCase()}`);

    res.json({
        success: true,
        direction,
        message: `Robot command accepted: ${direction}`
    });
});

// Alexa-friendly GET endpoint for simple testing.
// Later, the Alexa Custom Skill can call the POST endpoint through your backend.
app.get("/api/move/:direction", (req, res) => {
    const direction = String(req.params.direction).toLowerCase().trim();

    if (!VALID_DIRECTIONS.includes(direction)) {
        return res.status(400).json({
            success: false,
            error: "Invalid direction",
            allowed: VALID_DIRECTIONS
        });
    }

    robotState = {
        direction,
        lastCommandAt: new Date().toISOString()
    };

    console.log(`[ROBOT] ${direction.toUpperCase()}`);

    res.json({
        success: true,
        direction,
        message: `Robot command accepted: ${direction}`
    });
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Robot API running on http://localhost:${PORT}`);
});
