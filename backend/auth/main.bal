import ballerina/http;
import ballerina/mime;
// import ballerina/file;
// import ballerina/io;
import ballerina/uuid;
import ballerina/lang.'string as string;
import ballerinax/mongodb;
import ballerina/lang.regexp;
import ballerina/crypto;
import ballerina/lang.'int as int;

configurable int PORT = ?;
configurable string SERVER_URL = ?;
configurable string FRONTEND_AUTH_URL = ?;


configurable string MONGO_URI = ?;
configurable string DB_NAME = ?;
configurable string COLLECTION_ADMINS = ?;
configurable string COLLECTION_REGISTEREDUSERS = ?;
configurable string COLLECTION_UNREGISTEREDUSERS = ?;

mongodb:Client mongoClient = check new ({
    connection: MONGO_URI
});

listener http:Listener authListener = new (PORT);

service /auth on authListener {

    resource function options [string... path] (http:Caller caller, http:Request req) returns error? {
        http:Response resp = new;
        addCorsHeaders(resp);
        resp.statusCode = 204;
        resp.setPayload("");
        check caller->respond(resp);
    }

    private final mongodb:Database accountsDb;

    function init() returns error? {
        self.accountsDb = check mongoClient->getDatabase(DB_NAME);
    }

    resource function get identify(http:Caller caller, http:Request req) returns error? {
        http:Cookie[] cookies = req.getCookies();
        http:Cookie? cookie = ();

        // Look for the cookie named "unreg_user_id"
        foreach http:Cookie c in cookies {
            if c.name == "unreg_user_id" {
                cookie = c;
                break;
            }
        }

        http:Response resp = new;

        if cookie is http:Cookie {
            // Return existing ID
            resp.setJsonPayload({
                message: "Existing unregistered user ID found",
                unreg_user_id: cookie.value
            });
        } else {
            // Create new ID
            string newId = uuid:createType4AsString();
            http:Cookie newCookie = new (
                name = "unreg_user_id",
                value = newId,
                path = "/",
                httpOnly = true,
                maxAge = 60 * 60 * 24 * 365 // 1 year
            );

            // Attach cookie to response
            resp.addCookie(newCookie);

            // Also store in database
            mongodb:Collection usersCol = check self.accountsDb->getCollection(COLLECTION_UNREGISTEREDUSERS);
            map<json> newUser = { id: newId };
            check usersCol->insertOne(newUser);

            // Add message body
            resp.setJsonPayload({
                message: "New unregistered user ID created and cookie set",
                unreg_user_id: newId
            });
        }

        // Send response with CORS headers
        addCorsHeaders(resp);
        resp.statusCode = 200;
        check caller->respond(resp);
    }
    resource function get identifyUnregisteredUser(http:Caller caller, http:Request req) returns error? {
        http:Cookie[] cookies = req.getCookies();
        http:Cookie? cookie = ();

        // Look for the cookie named "unreg_user_id"
        foreach http:Cookie c in cookies {
            if c.name == "unreg_user_id" {
                cookie = c;
                break;
            }
        }

        http:Response resp = new;

        if cookie is http:Cookie {
            // Return existing ID
            resp.setJsonPayload({
                message: "Existing unregistered user ID found",
                unreg_user_id: cookie.value,
                status: "true"
            });
        } else {
            // Add message body
            resp.setJsonPayload({
                message: "Unregistered user ID not found",
                status: "false"
            });
        }

        // Send response with CORS headers
        addCorsHeaders(resp);
        resp.statusCode = 200;
        check caller->respond(resp);
    }
    resource function get identifyRegisteredUser(http:Caller caller, http:Request req) returns error? {
        http:Cookie[] cookies = req.getCookies();
        http:Cookie? cookie = ();

        // Look for the cookie named "unreg_user_id"
        foreach http:Cookie c in cookies {
            if c.name == "reg_user_id" {
                cookie = c;
                break;
            }
        }

        http:Response resp = new;

        if cookie is http:Cookie {
            // Return existing ID
            resp.setJsonPayload({
                message: "Existing registered user ID found",
                reg_user_id: cookie.value,
                status: "true"
            });
        } else {
            // Add message body
            resp.setJsonPayload({
                message: "Registered user ID not found",
                status: "false"
            });
        }

        // Send response with CORS headers
        addCorsHeaders(resp);
        resp.statusCode = 200;
        check caller->respond(resp);
    }
    resource function get identifyAdmin(http:Caller caller, http:Request req) returns error? {
        http:Cookie[] cookies = req.getCookies();
        http:Cookie? cookie = ();

        // Look for the cookie named "unreg_user_id"
        foreach http:Cookie c in cookies {
            if c.name == "admin_user_id" {
                cookie = c;
                break;
            }
        }

        http:Response resp = new;

        if cookie is http:Cookie {
            // Return existing ID
            resp.setJsonPayload({
                message: "Existing admin user ID found",
                admin_user_id: cookie.value,
                status: "true"
            });
        } else {
            // Add message body
            resp.setJsonPayload({
                message: "Admin user ID not found",
                status: "false"
            });
        }

        // Send response with CORS headers
        addCorsHeaders(resp);
        resp.statusCode = 200;
        check caller->respond(resp);
    }




    
        // Create or confirm unregistered user based only on cookie ID
        resource function post createUnregisteredUser(http:Caller caller, http:Request req) returns error? {
            
            http:Cookie[] cookies = req.getCookies();
            http:Cookie? cookie  = ();
    
            // Look for the cookie named "unreg_user_id"
            foreach http:Cookie c in cookies {
                if c.name == "unreg_user_id" {
                    cookie = c;
                    break;
                }
            }
    
            // Parse multipart form data
            mime:Entity[]|mime:ParserError bodyPartsResult = check req.getBodyParts();
            mime:Entity[] bodyParts = [];
            if bodyPartsResult is mime:Entity[] {
                bodyParts = bodyPartsResult;
            } else {
                http:Response errorResp = new;
                errorResp.statusCode = 400;
                errorResp.setJsonPayload({
                    message: "Invalid multipart body"
                });
                addCorsHeaders(errorResp);
                check caller->respond(errorResp);
                return;
            }
            
            // Extract form fields
            string username = "";
            string password = "";
            
            foreach mime:Entity part in bodyParts {
                mime:ContentDisposition? cd = part.getContentDisposition();
                string? partName = cd is mime:ContentDisposition ? cd.name : ();
                
                if partName is string {
                    match partName {
                        "username" => {
                            var value = part.getText();
                            if value is string {
                                username = value.trim();
                            }
                        }
                        "password" => {
                            var value = part.getText();
                            if value is string {
                                password = value;
                            }
                        }
                        // Ignore any unexpected parts.
                        _ => {
                            // Do nothing.
                        }
                    }
                }
            }
    
            http:Response resp = new;
    
            if cookie is () {
                // Create new ID
                string newId = uuid:createType4AsString();
                http:Cookie newCookie = new (
                    name = "unreg_user_id",
                    value = newId,
                    path = "/",
                    httpOnly = true,
                    maxAge = 60 * 60 * 24 * 365 // 1 year
                );
    
                mongodb:Collection usersCol = check self.accountsDb->getCollection(COLLECTION_UNREGISTEREDUSERS);
                map<json> newUser = {
                    id: newId,
                    username: username,
                    password: password
                };
                check usersCol->insertOne(newUser);
                // Attach cookie to response
                resp.addCookie(newCookie);
    
                // Add message body
                resp.setTextPayload(string `New unregistered user ID created and cookie set: ${newId}`);
            } else {
                // Return existing ID
                resp.setTextPayload(string `Existing unregistered user ID: ${cookie.value}`);
            }
    
            // Send only ONE response
            addCorsHeaders(resp);
            resp.statusCode = 200;
            check caller->respond(resp);
            
        }
    resource function post createRegisteredUser(http:Caller caller, http:Request req) returns error? {
        // io:println("inside registered user...");
        http:Cookie[] cookies = req.getCookies();
        http:Cookie? cookie  = ();
        
        // Look for the cookie named "reg_user_id"
        foreach http:Cookie c in cookies {
            if c.name == "reg_user_id" {
                cookie = c;
                break;
            }
        }
        
        if cookie is () {
            // Parse multipart form data
            mime:Entity[]|mime:ParserError bodyPartsResult = check req.getBodyParts();
            mime:Entity[] bodyParts = [];
            if bodyPartsResult is mime:Entity[] {
                bodyParts = bodyPartsResult;
            } else {
                http:Response errorResp = new;
                errorResp.statusCode = 400;
                errorResp.setJsonPayload({
                    message: "Invalid multipart body"
                });
                addCorsHeaders(errorResp);
                check caller->respond(errorResp);
                return;
            }
            
            // Extract form fields
            string username = "";
            string password = "";
            string email = ""; // Required by backend but not in frontend form
            string phone = "";
            string icNumber = "";
            
            foreach mime:Entity part in bodyParts {
                mime:ContentDisposition? cd = part.getContentDisposition();
                string? partName = cd is mime:ContentDisposition ? cd.name : ();
                
                if partName is string {
                    match partName {
                        "username" => {
                            var value = part.getText();
                            if value is string {
                                username = value.trim();
                            }
                        }
                        "password" => {
                            var value = part.getText();
                            if value is string {
                                password = value;
                            }
                        }
                        "email" => {
                            var value = part.getText();
                            if value is string {
                                email = value.trim();
                            }
                        }
                        "phone" => {
                            var value = part.getText();
                            if value is string {
                                phone = value.trim();
                            }
                        }
                        "icNumber" => {
                            var value = part.getText();
                            if value is string {
                                icNumber = value.trim();
                            }
                        }
                        // Ignore any unexpected parts.
                        _ => {
                            // Do nothing.
                        }
                    }
                }
            }
            
            // Basic validation on mandatory fields
            if username == "" || password == "" || phone == "" || icNumber == "" {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "All fields (username, password, phone, icNumber) are required" });
                addCorsHeaders(resp);
                check caller->respond(resp);
                return;
            }
            
            // For now, we'll use the phone number as a placeholder for email since the frontend doesn't have an email field
            if email == "" {
                email = phone + "@placeholder.com";
            }
            
            // Password validation: at least 8 chars, one uppercase, one lowercase, one digit, one special char
            if !validatePassword(password) {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Password must be at least 8 characters including uppercase, lowercase, digit and special character" });
                addCorsHeaders(resp);
                check caller->respond(resp);
                return;
            }
            
            // Email validation (basic regex)
            if !validateEmail(email) {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Invalid email format" });
                addCorsHeaders(resp);
                check caller->respond(resp);
                return;
            }
            
            // Verify email via OTP (simulate sending and validation)
            boolean emailVerified = verifyEmailOtp(email);
            if !emailVerified {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Email verification failed" });
                addCorsHeaders(resp);
                check caller->respond(resp);
                return;
            }
            
            // Validate Sri Lankan IC number format (e.g. 9 digits + V or X)
            if !validateSriLankanIC(icNumber) {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Invalid Sri Lankan IC number format" });
                addCorsHeaders(resp);
                check caller->respond(resp);
                return;
            }
            
            // Check if user already exists (by username or email)
            mongodb:Collection regUsersCol = check self.accountsDb->getCollection(COLLECTION_REGISTEREDUSERS);
            
            // Check username exists
            stream<RegisteredUser, error?> existingUsers = check regUsersCol->find({ username: username });
            RegisteredUser[] usersList = check from RegisteredUser u in existingUsers select u;
            if usersList.length() > 0 {
                http:Response resp = new;
                resp.statusCode = 409;
                resp.setJsonPayload({ message: "Username already exists" });
                addCorsHeaders(resp);
                check caller->respond(resp);
                return;
            }
            
            // Check email exists
            existingUsers = check regUsersCol->find({ email: email });
            usersList = check from RegisteredUser u in existingUsers select u;
            if usersList.length() > 0 {
                http:Response resp = new;
                resp.statusCode = 409;
                resp.setJsonPayload({ message: "Email already registered" });
                addCorsHeaders(resp);
                check caller->respond(resp);
                return;
            }
            
            string id = uuid:createType4AsString();
            
            // Hash the password before saving
            string hashedPassword = bytesToHex(crypto:hashSha256(password.toBytes()));
            // Create user record
            RegisteredUser newUser = {
                id: id,
                username: username,
                password: hashedPassword,
                email: email,
                phone: phone,
                icNumber: icNumber,
                isVerified: false
            };
            // io:println("Inserting new user: ", newUser);
            check regUsersCol->insertOne(newUser);
            // io:println("User inserted successfully");
            
            http:Cookie newCookie = new (
                name = "reg_user_id",
                value = id,
                path = "/",
                httpOnly = true,
                maxAge = 60 * 60 * 24 * 365 // 1 year
            );
            
            http:Response resp = new;
            // Remove any existing unregistered user cookie
            // resp.setHeader("Set-Cookie", "unreg_user_id=; Path=/; HttpOnly; Max-Age=0");
            resp.addCookie(newCookie);
            resp.statusCode = 201;
            resp.setJsonPayload({ message: "User registered successfully", id: id });
            addCorsHeaders(resp);
            check caller->respond(resp);
        } else {
            // Return existing ID
            http:Response resp = new;
            resp.statusCode = 400;
            resp.setJsonPayload({ message: "You already have an account" });
            addCorsHeaders(resp);
            check caller->respond(resp);
        }
    }

    resource function post logout(http:Caller caller, http:Request req) returns error? {
        http:Cookie[] cookies = req.getCookies();
        
        // Check for admin cookie first
        http:Cookie? adminCookie = ();
        foreach http:Cookie c in cookies {
            if c.name == "admin_user_id" {
                adminCookie = c;
                break;
            }
        }
        
        // Check for registered user cookie if no admin cookie found
        http:Cookie? regCookie = ();
        if adminCookie is () {
            foreach http:Cookie c in cookies {
                if c.name == "reg_user_id" {
                    regCookie = c;
                    break;
                }
            }
        }
        
        http:Response resp = new;
        
        // Handle admin logout
        if adminCookie is http:Cookie {
            resp.setHeader("Set-Cookie", "admin_user_id=; Path=/; HttpOnly; Max-Age=0");
            resp.statusCode = 200;
            resp.setJsonPayload({ message: "Admin logout successful. Cookie removed." });
            addCorsHeaders(resp);
            check caller->respond(resp);
            return;
        }
        
        // Handle registered user logout
        if regCookie is http:Cookie {
            resp.setHeader("Set-Cookie", "reg_user_id=; Path=/; HttpOnly; Max-Age=0");
            resp.statusCode = 200;
            resp.setJsonPayload({ message: "Registered user logout successful. Cookie removed." });
            addCorsHeaders(resp);
            check caller->respond(resp);
            return;
        }
        
        // No valid cookie found
        resp.statusCode = 400;
        resp.setJsonPayload({ message: "No login cookie found. You are not logged in." });
        addCorsHeaders(resp);
        check caller->respond(resp);
    }

    resource function post loginRegisteredUser(http:Caller caller, http:Request req) returns error? {
        http:Cookie[] cookies = req.getCookies();
        http:Cookie? loginCookie = ();
        foreach http:Cookie c in cookies {
            if c.name == "reg_user_id" {
                loginCookie = c;
                break;
            }
        }
        if loginCookie is () {
            // Parse multipart form data
            mime:Entity[]|mime:ParserError bodyPartsResult = check req.getBodyParts();
            mime:Entity[] bodyParts = [];
            if bodyPartsResult is mime:Entity[] {
                bodyParts = bodyPartsResult;
            } else {
                http:Response errorResp = new;
                errorResp.statusCode = 400;
                errorResp.setJsonPayload({
                    message: "Invalid multipart body"
                });
                addCorsHeaders(errorResp);
                check caller->respond(errorResp);
                return;
            }
            
            // Extract form fields
            // string username = "";
            string password = "";
            string email = "";
            
            foreach mime:Entity part in bodyParts {
                mime:ContentDisposition? cd = part.getContentDisposition();
                string? partName = cd is mime:ContentDisposition ? cd.name : ();
                
                if partName is string {
                    match partName {
                        // "username" => {
                        //     var value = part.getText();
                        //     if value is string {
                        //         username = value.trim();
                        //     }
                        // }
                        "password" => {
                            var value = part.getText();
                            if value is string {
                                password = value;
                            }
                        }
                        "email" => {
                            var value = part.getText();
                            if value is string {
                                email = value.trim();
                            }
                        }
                        // Ignore any unexpected parts.
                        _ => {
                            // Do nothing.
                        }
                    }
                }
            }

            if password == "" && email == "" {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Missing required fields: password and email" });
                addCorsHeaders(resp);
                check caller->respond(resp); return;
            }
            
            // Hash password
            string hashedPassword = bytesToHex(crypto:hashSha256(password.toBytes()));
            
            // Query by username or email
            mongodb:Collection regUsersCol = check self.accountsDb->getCollection(COLLECTION_REGISTEREDUSERS);
            stream<RegisteredUser, error?> foundUsers = check regUsersCol->find(email != "" ? { email: email } : { password: hashedPassword });
            RegisteredUser[] matches = check from RegisteredUser u in foundUsers select u;

            if matches.length() == 0 {
                http:Response resp = new;
                resp.statusCode = 401;
                resp.setJsonPayload({ message: "User not found" });
                addCorsHeaders(resp);
                check caller->respond(resp); return;
            }
            RegisteredUser user = matches[0];
            if user.password != hashedPassword {
                http:Response resp = new;
                resp.statusCode = 401;
                resp.setJsonPayload({ message: "Incorrect password" });
                addCorsHeaders(resp);
                check caller->respond(resp); return;
            }
            // Create login cookie
            http:Cookie loginCookieNew = new (
                name = "reg_user_id",
                value = user.id,
                path = "/",
                httpOnly = true,
                maxAge = 60 * 60 * 24 * 365 // 1 year
            );
            http:Response resp = new;
            // Remove any existing unregistered user cookie
            // resp.setHeader("Set-Cookie", "unreg_user_id=; Path=/; HttpOnly; Max-Age=0");
            resp.addCookie(loginCookieNew);
            resp.statusCode = 200;
            resp.setJsonPayload({ message: "Login successful", id: user.id });
            addCorsHeaders(resp);
            check caller->respond(resp);

        }
        else {
            http:Response resp = new;
            resp.statusCode = 403;
            resp.setJsonPayload({ message: "You are already logged in" });
            addCorsHeaders(resp);
            check caller->respond(resp); return;
        }
    }

    resource function post createAdmin(http:Caller caller, http:Request req) returns error? {

        http:Cookie[] cookies = req.getCookies();
        http:Cookie? cookie  = ();

        // Look for the cookie named "admin_user_id"
        foreach http:Cookie c in cookies {
            if c.name == "admin_user_id" {
                cookie = c;
                break;
            }
        }

        if cookie is () {

            // Parse multipart form data
            mime:Entity[]|mime:ParserError bodyPartsResult = check req.getBodyParts();
            mime:Entity[] bodyParts = [];
            if bodyPartsResult is mime:Entity[] {
                bodyParts = bodyPartsResult;
            } else {
                http:Response errorResp = new;
                errorResp.statusCode = 400;
                errorResp.setJsonPayload({
                    message: "Invalid multipart body"
                });
                addCorsHeaders(errorResp);
                check caller->respond(errorResp);
                return;
            }
            
            // Extract form fields
            string username = "";
            string password = "";
            string email = "";
            string phone = "";
            string icNumber = "";
            
            foreach mime:Entity part in bodyParts {
                mime:ContentDisposition? cd = part.getContentDisposition();
                string? partName = cd is mime:ContentDisposition ? cd.name : ();
                
                if partName is string {
                    match partName {
                        "username" => {
                            var value = part.getText();
                            if value is string {
                                username = value.trim();
                            }
                        }
                        "password" => {
                            var value = part.getText();
                            if value is string {
                                password = value;
                            }
                        }
                        "email" => {
                            var value = part.getText();
                            if value is string {
                                email = value.trim();
                            }
                        }
                        "phone" => {
                            var value = part.getText();
                            if value is string {
                                phone = value.trim();
                            }
                        }
                        "icNumber" => {
                            var value = part.getText();
                            if value is string {
                                icNumber = value.trim();
                            }
                        }
                        // Ignore any unexpected parts.
                        _ => {
                            // Do nothing.
                        }
                    }
                }
            }

                // Basic validation on mandatory fields
                if username == "" || password == "" || email == "" || phone == "" || icNumber == "" {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "All fields (username, password, email, phone, icNumber) are required" });
                    addCorsHeaders(resp);
                    check caller->respond(resp);
                    return;
                }

                // Password validation: at least 8 chars, one uppercase, one lowercase, one digit, one special char
                if !validatePassword(password) {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "Password must be at least 8 characters including uppercase, lowercase, digit and special character" });
                    addCorsHeaders(resp);
                    check caller->respond(resp);
                    return;
                }

                // Email validation (basic regex)
                if !validateEmail(email) {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "Invalid email format" });
                    addCorsHeaders(resp);
                    check caller->respond(resp);
                    return;
                }

                // Verify email via OTP (simulate sending and validation)
                boolean emailVerified = verifyEmailOtp(email);
                if !emailVerified {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "Email verification failed" });
                    addCorsHeaders(resp);
                    check caller->respond(resp);
                    return;
                }

                // Validate Sri Lankan IC number format (e.g. 9 digits + V or X)
                if !validateSriLankanIC(icNumber) {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "Invalid Sri Lankan IC number format" });
                    addCorsHeaders(resp);
                    check caller->respond(resp);
                    return;
                }

                // Check if user already exists (by username or email)
                mongodb:Collection regUsersCol = check self.accountsDb->getCollection(COLLECTION_ADMINS);

                // Check username exists
                stream<RegisteredUser, error?> existingUsers = check regUsersCol->find({ username: username });
                RegisteredUser[] usersList = check from RegisteredUser u in existingUsers select u;
                if usersList.length() > 0 {
                    http:Response resp = new;
                    resp.statusCode = 409;
                    resp.setJsonPayload({ message: "Username already exists" });
                    addCorsHeaders(resp);
                    check caller->respond(resp);
                    return;
                }

                // Check email exists
                existingUsers = check regUsersCol->find({ email: email });
                usersList = check from RegisteredUser u in existingUsers select u;
                if usersList.length() > 0 {
                    http:Response resp = new;
                    resp.statusCode = 409;
                    resp.setJsonPayload({ message: "Email already registered" });
                    addCorsHeaders(resp);
                    check caller->respond(resp);
                    return;
                }

                string id = uuid:createType4AsString();

                // Hash the password before saving
                string hashedPassword = bytesToHex(crypto:hashSha256(password.toBytes()));
                // Create user record
                RegisteredUser newUser = {
                    id: id,
                    username: username,
                    password: hashedPassword,
                    email: email,
                    phone: phone,
                    icNumber: icNumber,
                    isVerified: true
                };

                check regUsersCol->insertOne(newUser);

                http:Cookie newCookie = new (
                    name = "admin_user_id",
                    value = id,
                    path = "/",
                    httpOnly = true,
                    maxAge = 60 * 60 * 24 * 365 // 1 year
                );

                http:Response resp = new;
                // Remove any existing unregistered user cookie
                // resp.setHeader("Set-Cookie", "unreg_user_id=; Path=/; HttpOnly; Max-Age=0");
                resp.addCookie(newCookie);
                resp.statusCode = 201;
                resp.setJsonPayload({ message: "User registered successfully", id: id });
                addCorsHeaders(resp);
                check caller->respond(resp);

        } else {
            // Return existing ID
            http:Response resp = new;
            resp.statusCode = 400;
            resp.setJsonPayload({ message: "You already have an account" });
            addCorsHeaders(resp);
            check caller->respond(resp);
        }
    }


    resource function post loginAdmin(http:Caller caller, http:Request req) returns error? {
        http:Cookie[] cookies = req.getCookies();
        http:Cookie? loginCookie = ();
        foreach http:Cookie c in cookies {
            if c.name == "admin_user_id" {
                loginCookie = c;
                break;
            }
        }
        if loginCookie is () {
            // Parse multipart form data
            mime:Entity[]|mime:ParserError bodyPartsResult = check req.getBodyParts();
            mime:Entity[] bodyParts = [];
            if bodyPartsResult is mime:Entity[] {
                bodyParts = bodyPartsResult;
            } else {
                http:Response errorResp = new;
                errorResp.statusCode = 400;
                errorResp.setJsonPayload({
                    message: "Invalid multipart body"
                });
                addCorsHeaders(errorResp);
                check caller->respond(errorResp);
                return;
            }
            
            // Extract form fields
            string username = "";
            string password = "";
            // string email = "";
            
            foreach mime:Entity part in bodyParts {
                mime:ContentDisposition? cd = part.getContentDisposition();
                string? partName = cd is mime:ContentDisposition ? cd.name : ();
                
                if partName is string {
                    match partName {
                        "username" => {
                            var value = part.getText();
                            if value is string {
                                username = value.trim();
                            }
                        }
                        "password" => {
                            var value = part.getText();
                            if value is string {
                                password = value;
                            }
                        }
                        // "email" => {
                        //     var value = part.getText();
                        //     if value is string {
                        //         email = value.trim();
                        //     }
                        // }
                        // Ignore any unexpected parts.
                        _ => {
                            // Do nothing.
                        }
                    }
                }
            }

            if password == "" && username == "" {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Missing required fields: password and username" });
                addCorsHeaders(resp);
                check caller->respond(resp); return;
            }
            
            // Hash password
            string hashedPassword = bytesToHex(crypto:hashSha256(password.toBytes()));
            
            // Query by username or email
            mongodb:Collection regUsersCol = check self.accountsDb->getCollection(COLLECTION_ADMINS);
            stream<RegisteredUser, error?> foundUsers = check regUsersCol->find(username != "" ? { username: username } : { password: hashedPassword });
            RegisteredUser[] matches = check from RegisteredUser u in foundUsers select u;

            if matches.length() == 0 {
                http:Response resp = new;
                resp.statusCode = 401;
                resp.setJsonPayload({ message: "User not found" });
                addCorsHeaders(resp);
                check caller->respond(resp); return;
            }
            RegisteredUser user = matches[0];
            if user.password != hashedPassword {
                http:Response resp = new;
                resp.statusCode = 401;
                resp.setJsonPayload({ message: "Incorrect password" });
                addCorsHeaders(resp);
                check caller->respond(resp); return;
            }
            // Create login cookie
            http:Cookie loginCookieNew = new (
                name = "admin_user_id",
                value = user.id,
                path = "/",
                httpOnly = true,
                maxAge = 60 * 60 * 24 * 365 // 1 year
            );
            http:Response resp = new;
            // Remove any existing unregistered user cookie
            resp.setHeader("Set-Cookie", "unreg_user_id=; Path=/; HttpOnly; Max-Age=0");
            resp.addCookie(loginCookieNew);
            resp.statusCode = 200;
            resp.setJsonPayload({ message: "Login successful", id: user.id });
            addCorsHeaders(resp);
            check caller->respond(resp);

        }
        else {
            http:Response resp = new;
            resp.statusCode = 403;
            resp.setJsonPayload({ message: "You are already logged in" });
            addCorsHeaders(resp);
            check caller->respond(resp); return;
        }
    }


    

}


function validatePassword(string pwd) returns boolean {
    boolean hasUpper = false;
    boolean hasLower = false;
    boolean hasDigit = false;
    boolean hasSpecial = false;

    if pwd.length() < 8 {
        return false;
    }

    foreach int i in 0 ..< pwd.length() {
        string:Char charAt = pwd[i];
        int c = string:toCodePointInt(charAt);
        if c >= 65 && c <= 90 {
            hasUpper = true;
        } else if c >= 97 && c <= 122 {
            hasLower = true;
        } else if c >= 48 && c <= 57 {
            hasDigit = true;
        } else if (c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126) {
            hasSpecial = true;
        }
    }
    return hasUpper && hasLower && hasDigit && hasSpecial;
}

function validateEmail(string email) returns boolean {
    // Simple regex pattern for email validation, adjust as needed
    regexp:RegExp pattern =re `^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$`;
    return email.matches(pattern);
}

function verifyEmailOtp(string email) returns boolean {
    // For demo, always return true (OTP verified)
    // Extend this function to send an OTP and verify user input
    return true;
}

function validateSriLankanIC(string ic) returns boolean {
    // Typical old NIC: 9 digits followed by 'V' or 'X'
    // New NIC: 12 digits
    if ic.matches(re `^[0-9]{9}[VX]$`) || ic.matches(re `^[0-9]{12}$`) {
    return true;
    }
    return false;
}


// Helper function to convert byte array to hex string
function bytesToHex(byte[] data) returns string {
    string hexStr = "";
    foreach byte b in data {
        hexStr += int:toHexString(b); // 2-digit uppercase hex
    }
    return hexStr;
}

type RegisteredUser record {
    string id;
    string username;
    string password; // Ideally should be hashed
    string email;
    string phone;
    string icNumber;
    boolean isVerified;
};


function addCorsHeaders(http:Response resp) {
    resp.setHeader("Access-Control-Allow-Origin", FRONTEND_AUTH_URL);
    resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, CORELATION-ID, Access-Control-Allow-Origin");
    resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    resp.setHeader("Access-Control-Allow-Credentials", "true");
    resp.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
};


//ToDos
//OTP verification for email must to be full filled
//2FA for login