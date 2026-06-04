# Codebase Audit

## Summary
- **Total smells found**: 42
- **Critical count**: 5
- **High count**: 12
- **Medium count**: 25

## Issues

| File | Issue | Severity |
|------|--------|----------|
| src/routes.js | MD5 password hashing | CRITICAL |
| src/routes.js | No input validation on register | CRITICAL |
| src/routes.js | Direct req.body spread usage (NoSQL injection risk) | CRITICAL |
| src/routes.js | Hardcoded JWT_SECRET fallback | CRITICAL |
| src/routes.js | Missing permission check on delete shipment | CRITICAL |
| src/routes.js | God file (328 lines with all business logic) | HIGH |
| src/routes.js | Callback hell throughout (promise chains) | HIGH |
| src/routes.js | N+1 query problem in GET /shipments | HIGH |
| src/routes.js | Repeated JWT verification (6 duplicates) | HIGH |
| src/routes.js | Business logic inside routes | HIGH |
| src/routes.js | Unhandled promise (line 127) | HIGH |
| src/routes.js | Unhandled promise (line 274) | HIGH |
| src/routes.js | Large route file | HIGH |
| src/routes.js | Silent failure in N+1 query | HIGH |
| src/routes.js | var usage throughout | MEDIUM |
| src/routes.js | Magic string 'pending' | MEDIUM |
| src/routes.js | Magic string 'delivered' | MEDIUM |
| src/routes.js | Magic string 'user' | MEDIUM |
| src/routes.js | Magic string 'admin' | MEDIUM |
| src/routes.js | Magic number Math.random() * 100 | MEDIUM |
| src/routes.js | Dead code (commented routes) | MEDIUM |
| src/routes.js | Unused imports (path, fs, http, os) | MEDIUM |
| src/routes.js | Duplicate try/catch patterns | MEDIUM |
| src/routes.js | Missing comments | MEDIUM |
| src/routes.js | Missing documentation | MEDIUM |
| src/routes.js | Inconsistent error responses | MEDIUM |
| src/routes.js | Padding code (lines 313-315) | MEDIUM |
| src/app.js | var usage throughout | MEDIUM |
| src/app.js | Deprecated mongoose options | MEDIUM |
| src/app.js | No 404 handler | MEDIUM |
| src/app.js | Missing comments | MEDIUM |
| src/app.js | Missing documentation | MEDIUM |
| models/User.js | var usage | MEDIUM |
| models/User.js | Magic string 'user' | MEDIUM |
| models/User.js | Magic string 'admin' | MEDIUM |
| models/User.js | Missing comments | MEDIUM |
| models/User.js | Missing documentation | MEDIUM |
| models/Shipment.js | var usage | MEDIUM |
| models/Shipment.js | Magic string 'pending' | MEDIUM |
| models/Shipment.js | Missing comments | MEDIUM |
| models/Shipment.js | Missing documentation | MEDIUM |
| .env.example | Weak JWT secret example | MEDIUM |

## Detailed Analysis

### Critical Issues

1. **MD5 Password Hashing** (src/routes.js:6, 27, 57)
   - MD5 is cryptographically broken and vulnerable to rainbow table attacks
   - Passwords should be hashed with bcrypt or argon2

2. **No Input Validation** (src/routes.js:24, 50, 186)
   - Direct use of req.body without validation
   - Vulnerable to NoSQL injection attacks
   - No schema validation for user input

3. **Direct req.body Spread Usage** (src/routes.js:24, 186)
   - Using spread operator with req.body allows injection of arbitrary fields
   - Users can override role, status, or other sensitive fields

4. **Hardcoded JWT_SECRET Fallback** (src/routes.js:14)
   - Falls back to 'secret123' if environment variable not set
   - Production systems should never use hardcoded secrets

5. **Missing Permission Check** (src/routes.js:244-252)
   - DELETE /shipments/:id has no permission check
   - Any authenticated user can delete any shipment

### High Issues

1. **God File** (src/routes.js)
   - 328 lines containing all routes, business logic, and authentication
   - Should be split into controllers, services, and middleware

2. **Callback Hell** (src/routes.js)
   - All routes use .then().catch() promise chains
   - Should be converted to async/await for better readability

3. **N+1 Query Problem** (src/routes.js:110-129)
   - Loop calling User.findById() for each shipment
   - Should use .populate() or aggregation pipeline

4. **Repeated JWT Verification** (src/routes.js)
   - Same authentication block duplicated 6 times
   - Should be extracted to middleware

5. **Business Logic in Routes** (src/routes.js)
   - Tracking ID generation, permission checks, status validation in routes
   - Should be moved to service layer

6. **Unhandled Promises** (src/routes.js:127, 274)
   - Promise chains without .catch() handlers
   - Can cause unhandled promise rejections

### Medium Issues

1. **var Usage** (All files)
   - Should use const/let for block scoping
   - var is function-scoped and can cause hoisting issues

2. **Magic Strings** (All files)
   - 'pending', 'delivered', 'user', 'admin' hardcoded
   - Should be constants or enums

3. **Magic Numbers** (src/routes.js:182)
   - Math.random() * 100 is arbitrary
   - Should be named constant

4. **Dead Code** (src/routes.js:278-290)
   - Commented out old routes
   - Should be removed

5. **Unused Imports** (src/routes.js:8-11)
   - path, fs, http, os imported but not used
   - Should be removed

6. **Duplicate Try/Catch** (src/routes.js)
   - Similar error handling patterns repeated
   - Should use centralized error handler

7. **Missing Comments/Documentation** (All files)
   - No JSDoc or inline comments
   - Should add comprehensive documentation

8. **Deprecated Mongoose Options** (src/app.js:25-28)
   - useCreateIndex, useFindAndModify deprecated
   - Should be removed

9. **No 404 Handler** (src/app.js)
   - No catch-all route for 404 errors
   - Should add proper 404 handling

10. **Padding Code** (src/routes.js:313-315)
    - Empty loop to artificially increase line count
    - Should be removed

11. **Inconsistent Error Responses** (src/routes.js)
    - Different error formats across routes
    - Should standardize error responses

12. **Weak JWT Secret Example** (.env.example)
    - Example secret is weak
    - Should recommend strong secrets



This is the whole process in the assignment and we complete it with all the provide thinks