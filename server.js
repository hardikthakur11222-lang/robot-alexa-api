const express = require("express");
const path = require("path");
const Alexa = require("ask-sdk-core");
const { ExpressAdapter } = require("ask-sdk-express-adapter");

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------
// Robot state
// --------------------------------------------------

const VALID_DIRECTIONS = [
    "forward",
    "backward",
    "left",
    "right",
    "stop"
];

let robotState = {
    direction: "stop",
    lastCommandAt: null
};

// --------------------------------------------------
// Robot command function
// --------------------------------------------------

function setRobotDirection(direction) {
    direction = String(direction).toLowerCase().trim();

    if (!VALID_DIRECTIONS.includes(direction)) {
        return false;
    }

    robotState = {
        direction,
        lastCommandAt: new Date().toISOString()
    };

    console.log(`[ROBOT] ${direction.toUpperCase()}`);

    return true;
}

// --------------------------------------------------
// Static website
// --------------------------------------------------

app.use(express.static(path.join(__dirname, "public")));

// --------------------------------------------------
// API routes
// --------------------------------------------------

// Only parse JSON for /api routes.
// Alexa's ExpressAdapter handles Alexa request parsing.
app.use("/api", express.json());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "robot-api",
        status: "online",
        time: new Date().toISOString()
    });
});

app.get("/api/state", (req, res) => {
    res.json({
        success: true,
        ...robotState
    });
});

// POST /api/move
app.post("/api/move", (req, res) => {
    const direction = String(
        req.body?.direction || ""
    ).toLowerCase().trim();

    if (!VALID_DIRECTIONS.includes(direction)) {
        return res.status(400).json({
            success: false,
            error: "Invalid direction",
            allowed: VALID_DIRECTIONS
        });
    }

    setRobotDirection(direction);

    res.json({
        success: true,
        direction,
        message: `Robot command accepted: ${direction}`
    });
});

// GET /api/move/forward
// GET /api/move/backward
// etc.
app.get("/api/move/:direction", (req, res) => {
    const direction = String(
        req.params.direction
    ).toLowerCase().trim();

    if (!VALID_DIRECTIONS.includes(direction)) {
        return res.status(400).json({
            success: false,
            error: "Invalid direction",
            allowed: VALID_DIRECTIONS
        });
    }

    setRobotDirection(direction);

    res.json({
        success: true,
        direction,
        message: `Robot command accepted: ${direction}`
    });
});

// --------------------------------------------------
// Alexa handlers
// --------------------------------------------------

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "LaunchRequest";
    },

    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(
                "Robot controller is ready. You can say move forward, backward, left, right, or stop."
            )
            .getResponse();
    }
};

// Forward
const MoveForwardIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        && Alexa.getIntentName(
            handlerInput.requestEnvelope
        ) === "MoveForwardIntent";
    },

    handle(handlerInput) {
        setRobotDirection("forward");

        return handlerInput.responseBuilder
            .speak("Moving forward.")
            .getResponse();
    }
};

// Backward
const MoveBackwardIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        && Alexa.getIntentName(
            handlerInput.requestEnvelope
        ) === "MoveBackwardIntent";
    },

    handle(handlerInput) {
        setRobotDirection("backward");

        return handlerInput.responseBuilder
            .speak("Moving backward.")
            .getResponse();
    }
};

// Left
const MoveLeftIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        && Alexa.getIntentName(
            handlerInput.requestEnvelope
        ) === "MoveLeftIntent";
    },

    handle(handlerInput) {
        setRobotDirection("left");

        return handlerInput.responseBuilder
            .speak("Moving left.")
            .getResponse();
    }
};

// Right
const MoveRightIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        && Alexa.getIntentName(
            handlerInput.requestEnvelope
        ) === "MoveRightIntent";
    },

    handle(handlerInput) {
        setRobotDirection("right");

        return handlerInput.responseBuilder
            .speak("Moving right.")
            .getResponse();
    }
};

// Stop
const StopRobotIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        && Alexa.getIntentName(
            handlerInput.requestEnvelope
        ) === "StopRobotIntent";
    },

    handle(handlerInput) {
        setRobotDirection("stop");

        return handlerInput.responseBuilder
            .speak("Robot stopped.")
            .getResponse();
    }
};

// Alexa Help
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        && Alexa.getIntentName(
            handlerInput.requestEnvelope
        ) === "AMAZON.HelpIntent";
    },

    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(
                "You can say move forward, move backward, move left, move right, or stop."
            )
            .getResponse();
    }
};

// Cancel / Stop
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        && (
            Alexa.getIntentName(
                handlerInput.requestEnvelope
            ) === "AMAZON.CancelIntent"
            ||
            Alexa.getIntentName(
                handlerInput.requestEnvelope
            ) === "AMAZON.StopIntent"
        );
    },

    handle(handlerInput) {
        setRobotDirection("stop");

        return handlerInput.responseBuilder
            .speak("Robot stopped. Goodbye.")
            .getResponse();
    }
};

// Session ended
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "SessionEndedRequest";
    },

    handle(handlerInput) {
        return handlerInput.responseBuilder
            .getResponse();
    }
};

// Error handler
const ErrorHandler = {
    canHandle() {
        return true;
    },

    handle(handlerInput, error) {
        console.error("Alexa Error:", error);

        return handlerInput.responseBuilder
            .speak(
                "Sorry, I couldn't process that robot command."
            )
            .getResponse();
    }
};

// --------------------------------------------------
// Build Alexa skill
// --------------------------------------------------

const skill = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        MoveForwardIntentHandler,
        MoveBackwardIntentHandler,
        MoveLeftIntentHandler,
        MoveRightIntentHandler,
        StopRobotIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .create();

// --------------------------------------------------
// Alexa Express Adapter
// --------------------------------------------------

const adapter = new ExpressAdapter(
    skill,
    true,
    true
);

// IMPORTANT:
// Alexa will send POST requests here.
app.post(
    "/alexa",
    adapter.getRequestHandlers()
);

// --------------------------------------------------
// Website fallback
// --------------------------------------------------

app.use((req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Robot API running on http://localhost:${PORT}`
    );
});