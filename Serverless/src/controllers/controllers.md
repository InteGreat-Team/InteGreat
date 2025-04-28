# Controllers Directory 🎮

## Purpose 🎯
Controllers handle incoming HTTP requests, extract data, and return responses. They act as the bridge between routes and services.

## Responsibilities 📋
- Extract data from requests (params, body, query).
- Call appropriate services to process the request.
- Return HTTP responses (success or error).

## Best Practices 🌟
- Keep controllers lightweight (move business logic to services).
- Use try-catch blocks for error handling.
- Validate request data before processing.