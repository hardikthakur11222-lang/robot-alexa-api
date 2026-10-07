const express = require("express");
const path = require("path");

const Alexa = require("ask-sdk-core");
const { ExpressAdapter } = require("ask-sdk-express-adapter");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================================
   ROBOT
========================================================= */

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

function setRobotDirection(direction) {
    const value = String(direction || "")
        .trim()
        .toLowerCase();

    if (!VALID_DIRECTIONS.includes(value)) {
        console.log(`[ROBOT] Invalid direction: ${value}`);
        return false;
    }

    robotState = {
        direction: value,
        lastCommandAt: new Date().toISOString()
    };

    console.log(`[ROBOT] ${value.toUpperCase()}`);

    return true;
}

/* =========================================================
   STATIC WEBSITE
========================================================= */

app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   HTTP LOGGER
========================================================= */

app.use((req, res, next) => {
    console.log(
        `[HTTP] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`
    );

    next();
});

/* =========================================================
   API JSON PARSER
   IMPORTANT:
   Do NOT use app.use(express.json()) globally.
   Alexa ExpressAdapter needs to parse /alexa itself.
========================================================= */

app.use("/api", express.json());

/* =========================================================
   HEALTH
========================================================= */

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "robot-api",
        status: "online",
        time: new Date().toISOString()
    });
});

/* =========================================================
   STATE
========================================================= */

app.get("/api/state", (req, res) => {
    res.status(200).json({
        success: true,
        state: robotState
    });
});

/* =========================================================
   MOVE POST
========================================================= */

app.post("/api/move", (req, res) => {
    const direction = req.body?.direction;

    if (!direction) {
        return res.status(400).json({
            success: false,
            error: "Direction is required",
            validDirections: VALID_DIRECTIONS
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

    return res.status(200).json({
        success: true,
        direction: robotState.direction,
        timestamp: robotState.lastCommandAt
    });
});

/* =========================================================
   MOVE GET
========================================================= */

app.get("/api/move/:direction", (req, res) => {
    const success = setRobotDirection(req.params.direction);

    if (!success) {
        return res.status(400).json({
            success: false,
            error: "Invalid direction",
            validDirections: VALID_DIRECTIONS
        });
    }

    return res.status(200).json({
        success: true,
        direction: robotState.direction,
        timestamp: robotState.lastCommandAt
    });
});

/* =========================================================
   ALEXA LAUNCH
========================================================= */

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(
                handlerInput.requestEnvelope
            ) === "LaunchRequest"
        );
    },

    handle(handlerInput) {
        console.log("[ALEXA] LaunchRequest received");

        return handlerInput.responseBuilder
            .speak("Robot controller is ready.")
            .reprompt(
                "You can say move forward, move backward, move left, move right, or stop."
            )
            .getResponse();
    }
};

/* =========================================================
   FORWARD
========================================================= */

const MoveForwardIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(
                handlerInput.requestEnvelope
            ) === "IntentRequest" &&
            Alexa.getIntentName(
                handlerInput.requestEnvelope
            ) === "MoveForwardIntent"
        );
    },

    handle(handlerInput) {
        console.log("[ALEXA] MoveForwardIntent");

        setRobotDirection("forward");

        return handlerInput.responseBuilder
            .speak("Moving forward.")
            .getResponse();
    }
};

/* =========================================================
   BACKWARD
========================================================= */

const MoveBackwardIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(
                handlerInput.requestEnvelope
            ) === "IntentRequest" &&
            Alexa.getIntentName(
                handlerInput.requestEnvelope
            ) === "MoveBackwardIntent"
        );
    },

    handle(handlerInput) {
        console.log("[ALEXA] MoveBackwardIntent");

        setRobotDirection("backward");

        return handlerInput.responseBuilder
            .speak("Moving backward.")
            .getResponse();
    }
};

/* =========================================================
   LEFT
========================================================= */

const MoveLeftIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(
                handlerInput.requestEnvelope
            ) === "IntentRequest" &&
            Alexa.getIntentName(
                handlerInput.requestEnvelope
            ) === "MoveLeftIntent"
        );
    },

    handle(handlerInput) {
        console.log("[ALEXA] MoveLeftIntent");

        setRobotDirection("left");

        return handlerInput.responseBuilder
            .speak("Turning left.")
            .getResponse();
    }
};

/* =========================================================
   RIGHT
========================================================= */

const MoveRightIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(
                handlerInput.requestEnvelope
            ) === "IntentRequest" &&
            Alexa.getIntentName(
                handlerInput.requestEnvelope
            ) === "MoveRightIntent"
        );
    },

    handle(handlerInput) {
        console.log("[ALEXA] MoveRightIntent");

        setRobotDirection("right");

        return handlerInput.responseBuilder
            .speak("Turning right.")
            .getResponse();
    }
};

/* =========================================================
   STOP
========================================================= */

const StopRobotIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(
                handlerInput.requestEnvelope
            ) === "IntentRequest" &&
            Alexa.getIntentName(
                handlerInput.requestEnvelope
            ) === "StopRobotIntent"
        );
    },

    handle(handlerInput) {
        console.log("[ALEXA] StopRobotIntent");

        setRobotDirection("stop");

        return handlerInput.responseBuilder
            .speak("Robot stopped.")
            .getResponse();
    }
};

/* =========================================================
   HELP
========================================================= */

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(
                handlerInput.requestEnvelope
            ) === "IntentRequest" &&
            Alexa.getIntentName(
                handlerInput.requestEnvelope
            ) === "AMAZON.HelpIntent"
        );
    },

    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(
                "You can say move forward, move backward, move left, move right, or stop."
            )
            .reprompt(
                "What would you like the robot to do?"
            )
            .getResponse();
    }
};

/* =========================================================
   AMAZON STOP / CANCEL
========================================================= */

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        const requestType = Alexa.getRequestType(
            handlerInput.requestEnvelope
        );

        const intentName = Alexa.getIntentName(
            handlerInput.requestEnvelope
        );

        return (
            requestType === "IntentRequest" &&
            (
                intentName === "AMAZON.CancelIntent" ||
                intentName === "AMAZON.StopIntent"
            )
        );
    },

    handle(handlerInput) {
        console.log("[ALEXA] Stop/Cancel");

        setRobotDirection("stop");

        return handlerInput.responseBuilder
            .speak("Robot stopped.")
            .getResponse();
    }
};

/* =========================================================
   SESSION ENDED
========================================================= */

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return (
            Alexa.getRequestType(
                handlerInput.requestEnvelope
            ) === "SessionEndedRequest"
        );
    },

    handle(handlerInput) {
        console.log("[ALEXA] Session ended");

        return handlerInput.responseBuilder
            .getResponse();
    }
};

/* =========================================================
   ERROR HANDLER
========================================================= */

const ErrorHandler = {
    canHandle() {
        return true;
    },

    handle(handlerInput, error) {
        console.error("[ALEXA ERROR]");
        console.error(error);

        return handlerInput.responseBuilder
            .speak(
                "Sorry, there was a problem controlling the robot."
            )
            .getResponse();
    }
};

/* =========================================================
   CREATE SKILL
========================================================= */

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

/* =========================================================
   ALEXA EXPRESS ADAPTER
========================================================= */

const adapter = new ExpressAdapter(
    skill,
    false,
    false
);

/* =========================================================
   ALEXA ENDPOINT

   IMPORTANT:
   No express.json() before this route.
========================================================= */

app.post(
    "/alexa",

    (req, res, next) => {
        console.log("[ALEXA] POST /alexa received");
        next();
    },

    adapter.getRequestHandlers()
);

/* =========================================================
   FRONTEND FALLBACK
========================================================= */

app.use((req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});

/* =========================================================
   SERVER ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
    console.error("[SERVER ERROR]");
    console.error(err);

    if (!res.headersSent) {
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

/* =========================================================
   START
========================================================= */

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