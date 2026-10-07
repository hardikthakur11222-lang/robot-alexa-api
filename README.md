# Robot Alexa API

A small Node.js project with:

- Forward / Backward / Left / Right / Stop API
- Web control panel
- Virtual robot box
- JSON API
- Health endpoint
- Alexa-ready API structure
- Works locally and can later be deployed to Render/Railway/etc.

## 1. Requirements

Install Node.js LTS.

Check:

```powershell
node --version
npm --version
```

## 2. Install

Open PowerShell in this project folder:

```powershell
npm install
```

## 3. Run

```powershell
npm start
```

Open:

http://localhost:3000

## 4. API

### POST

```http
POST /api/move
Content-Type: application/json
```

Body:

```json
{
  "direction": "forward"
}
```

Allowed:

- forward
- backward
- left
- right
- stop

### GET test endpoint

You can test in a browser:

```text
http://localhost:3000/api/move/forward
http://localhost:3000/api/move/backward
http://localhost:3000/api/move/left
http://localhost:3000/api/move/right
http://localhost:3000/api/move/stop
```

### Health

```text
http://localhost:3000/api/health
```

## 5. How Alexa will fit in

The current API is the command endpoint.

Later:

```text
Alexa
  ↓
Alexa Custom Skill
  ↓
Your public HTTPS server
  ↓
POST /api/move
  ↓
Virtual robot / ESP32
```

The webpage and Alexa can therefore use the same robot command API.

## Important

`localhost` is NOT available to Alexa over the Internet.

After local testing, deploy this server to a public HTTPS host such as Render or Railway. Then the Alexa integration can use the public URL.

## Security

This first version intentionally keeps authentication out so the prototype is easy to test.

Before controlling a real robot over the Internet, add authentication/API keys and command safety limits.
