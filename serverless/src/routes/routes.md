# Routes Directory 📁

## Purpose 🎯
This directory contains all the route definitions for the API. Routes map incoming HTTP requests to the appropriate controllers and middleware.

## Structure 🏗️
- Each file corresponds to a specific domain or functionality (e.g., `external.routes.ts` for 3rd party APIs, `internal.routes.ts` for internal system communication).
- Routes are grouped logically and can be versioned (e.g., `/api/v1/email`).

## Usage 🛠️
1. Define routes using `express.Router()`.
2. Apply middleware (e.g., authentication, validation) at the route level.
3. Map routes to controller methods.