const express = require("express");
const path = require("path");

const Alexa = require("ask-sdk-core");
const { ExpressAdapter } = require("ask-sdk-express-adapter");

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// ROBOT STATE
// =====================================================

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

// =====================================================
// ROBOT CONTROL
// =====================================================

function setRobotDirection(direction) {
    direction = String(direction).toLowerCase().trim();

    if (!VALID_DIRECTIONS.includes(direction)) {
        console.log(`[ROBOT] Invalid direction: ${direction}`);
        return false;
    }

    robotState = {
        direction: direction,
        lastCommandAt: new Date().toISOString()
    };

    console.log(`[ROBOT] ${direction.toUpperCase()}`);

    return true;
}

// =====================================================
// EXPRESS MIDDLEWARE
// =====================================================

// Frontend
app.use(express.static(path.join(__dirname, "public")));

// JSON parser ONLY for API routes
app.use("/api", express.json());

// HTTP logger
app.use((req, res, next) => {
    console.log(
        `[HTTP] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`
    );

    next();
});

// =====================================================
// API ROUTES
// =====================================================

// Health
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "robot-api",
        status: "online",
        time: new Date().toISOString()
    });
});

// Robot state
app.get("/api/state", (req, res) => {
    res.json({
        success: true,
        state: robotState
    });
});

// POST /api/move
app.post("/api/move", (req, res) => {
    const { direction } = req.body;

    if (!direction) {
        return res.status(400).json({
            success: false,
            error: "Direction is required"
        });
    }

    const success = setRobotDirection(direction);

    if (!success) {
        return res.status(400).json({
            success: false,
            error: "Invalid direction",
            validDirections: VALID_DIRECTIONS
        });
    }

    res.json({
        success: true,
        direction: robotState.direction,
        timestamp: robotState.lastCommandAt
    });
});

// GET /api/move/:direction
app.get("/api/move/:direction", (req, res) => {
    const success = setRobotDirection(req.params.direction);

    if (!success) {
        return res.status(400).json({
            success: false,
            error: "Invalid direction",
            validDirections: VALID_DIRECTIONS
        });
    }

    res.json({
        success: true,
        direction: robotState.direction,
        timestamp: robotState.lastCommandAt
    });
});

// =====================================================
// ALEXA - LAUNCH REQUEST
// =====================================================

const LaunchRequestHandler = {

    canHandle(handlerInput) {
        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "LaunchRequest";
    },

    handle(handlerInput) {

        console.log("[ALEXA] LaunchRequest received");

        return handlerInput.responseBuilder
            .speak("Robot controller is ready.")
            .getResponse();
    }
};

// =====================================================
// ALEXA - MOVE FORWARD
// =====================================================

const MoveForwardIntentHandler = {

    canHandle(handlerInput) {

        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        &&
        Alexa.getIntentName(
            handlerInput.requestEnvelope
        ) === "MoveForwardIntent";
    },

    handle(handlerInput) {

        console.log("[ALEXA] MoveForwardIntent");

        setRobotDirection("forward");

        return handlerInput.responseBuilder
            .speak("Moving forward.")
            .getResponse();
    }
};

// =====================================================
// ALEXA - MOVE BACKWARD
// =====================================================

const MoveBackwardIntentHandler = {

    canHandle(handlerInput) {

        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        &&
        Alexa.getIntentName(
            handlerInput.requestEnvelope
        ) === "MoveBackwardIntent";
    },

    handle(handlerInput) {

        console.log("[ALEXA] MoveBackwardIntent");

        setRobotDirection("backward");

        return handlerInput.responseBuilder
            .speak("Moving backward.")
            .getResponse();
    }
};

// =====================================================
// ALEXA - MOVE LEFT
// =====================================================

const MoveLeftIntentHandler = {

    canHandle(handlerInput) {

        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        &&
        Alexa.getIntentName(
            handlerInput.requestEnvelope
        ) === "MoveLeftIntent";
    },

    handle(handlerInput) {

        console.log("[ALEXA] MoveLeftIntent");

        setRobotDirection("left");

        return handlerInput.responseBuilder
            .speak("Moving left.")
            .getResponse();
    }
};

// =====================================================
// ALEXA - MOVE RIGHT
// =====================================================

const MoveRightIntentHandler = {

    canHandle(handlerInput) {

        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        &&
        Alexa.getIntentName(
            handlerInput.requestEnvelope
        ) === "MoveRightIntent";
    },

    handle(handlerInput) {

        console.log("[ALEXA] MoveRightIntent");

        setRobotDirection("right");

        return handlerInput.responseBuilder
            .speak("Moving right.")
            .getResponse();
    }
};

// =====================================================
// ALEXA - STOP ROBOT
// =====================================================

const StopRobotIntentHandler = {

    canHandle(handlerInput) {

        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        &&
        Alexa.getIntentName(
            handlerInput.requestEnvelope
        ) === "StopRobotIntent";
    },

    handle(handlerInput) {

        console.log("[ALEXA] StopRobotIntent");

        setRobotDirection("stop");

        return handlerInput.responseBuilder
            .speak("Robot stopped.")
            .getResponse();
    }
};

// =====================================================
// ALEXA - HELP
// =====================================================

const HelpIntentHandler = {

    canHandle(handlerInput) {

        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "IntentRequest"
        &&
        Alexa.getIntentName(
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

// =====================================================
// ALEXA - CANCEL / STOP
// =====================================================

const CancelAndStopIntentHandler = {

    canHandle(handlerInput) {

        const requestType = Alexa.getRequestType(
            handlerInput.requestEnvelope
        );

        const intentName = Alexa.getIntentName(
            handlerInput.requestEnvelope
        );

        return requestType === "IntentRequest"
            &&
            (
                intentName === "AMAZON.CancelIntent"
                ||
                intentName === "AMAZON.StopIntent"
            );
    },

    handle(handlerInput) {

        console.log("[ALEXA] Cancel/Stop");

        setRobotDirection("stop");

        return handlerInput.responseBuilder
            .speak("Robot stopped.")
            .getResponse();
    }
};

// =====================================================
// ALEXA - SESSION ENDED
// =====================================================

const SessionEndedRequestHandler = {

    canHandle(handlerInput) {

        return Alexa.getRequestType(
            handlerInput.requestEnvelope
        ) === "SessionEndedRequest";
    },

    handle(handlerInput) {

        console.log("[ALEXA] Session ended");

        return handlerInput.responseBuilder
            .getResponse();
    }
};

// =====================================================
// ALEXA ERROR HANDLER
// =====================================================

const ErrorHandler = {

    canHandle() {
        return true;
    },

    handle(handlerInput, error) {

        console.error("[ALEXA ERROR]");
        console.error(error);

        return handlerInput.responseBuilder
            .speak("Sorry, there was a problem controlling the robot.")
            .getResponse();
    }
};

// =====================================================
// CREATE ALEXA SKILL
// =====================================================

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

    .addErrorHandlers(
        ErrorHandler
    )

    .create();

// =====================================================
// EXPRESS ADAPTER
// =====================================================
//
// TEMPORARY TEST MODE
//
// false = disable signature verification
// false = disable timestamp verification
//
// We are using this temporarily to diagnose Alexa.
// =====================================================

const adapter = new ExpressAdapter(
    skill,
    false,
    false
);

// =====================================================
// ALEXA ENDPOINT
// =====================================================

app.post(
    "/alexa",

    (req, res, next) => {

        console.log("[ALEXA] POST /alexa received");

        next();
    },

    adapter.getRequestHandlers()
);

// =====================================================
// FRONTEND FALLBACK
// =====================================================

app.use((req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});

// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Robot API running on http://localhost:${PORT}`
        );

        console.log(
            `Alexa endpoint: http://localhost:${PORT}/alexa`
        );
    }
);