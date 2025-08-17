import ballerina/http;
// import ballerina/mime;
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
    private final mongodb:Database accountsDb;

    function init() returns error? {
    self.accountsDb = check mongoClient->getDatabase(DB_NAME);
    }

    // resource function get identify(http:Caller caller, http:Request req) returns error? {
    //     http:Cookie[] cookies = req.getCookies();
    //     http:Cookie? cookie = ();

    //     // Look for the cookie named "unreg_user_id"
    //     foreach http:Cookie c in cookies {
    //         if c.name == "unreg_user_id" {
    //             cookie = c;
    //             break;
    //         }
    //     }

    //     http:Response resp = new;

    //     if cookie is () {
    //         // Create new ID
    //         string newId = uuid:createType4AsString();
    //         http:Cookie newCookie = new (
    //             name = "unreg_user_id",
    //             value = newId,
    //             path = "/",
    //             httpOnly = true,
    //             maxAge = 60 * 60 * 24 * 365 // 1 year
    //         );

    //         // Attach cookie to response
    //         resp.addCookie(newCookie);

    //         // Add message body
    //         resp.setTextPayload(string `New unregistered user ID created and cookie set: ${newId}`);
    //     } else {
    //         // Return existing ID
    //         resp.setTextPayload(string `Existing unregistered user ID: ${cookie.value}`);
    //     }

    //     // Send only ONE response
    //     check caller->respond(resp);
    //     // return;
    // }

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
            map<json> newUser = { id: newId };
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
        check caller->respond(resp);
        
    }

    resource function post createRegisteredUser(http:Caller caller, http:Request req) returns error? {

        http:Cookie[] cookies = req.getCookies();
        http:Cookie? cookie  = ();

        // Look for the cookie named "unreg_user_id"
        foreach http:Cookie c in cookies {
            if c.name == "reg_user_id" {
                cookie = c;
                break;
            }
        }

        if cookie is () {

            json|error payload = req.getJsonPayload();
            if payload is error {
            http:Response resp = new;
            resp.statusCode = 400;
            resp.setJsonPayload({ message: "Invalid JSON payload" });
            check caller->respond(resp);
            return;
            }

            if payload is map<json> {
                string username = "";
                string password = "";
                string email = "";
                string phone = "";
                string icNumber = "";

                if payload["username"] is string {
                    string uname = <string>payload["username"];
                    username = uname.trim();
                }

                if payload["password"] is string {
                    string pwd = <string>payload["password"];
                    password = pwd;
                }
                if payload["email"] is string {
                    string mail = <string>payload["email"];
                    email = mail.trim();
                }
                if payload["phone"] is string {
                    string ph = <string>payload["phone"];
                    phone = ph.trim();
                }
                if payload["icNumber"] is string {
                    string ic = <string>payload["icNumber"];
                    icNumber = ic.trim();
                }

                // Basic validation on mandatory fields
                if username == "" || password == "" || email == "" || phone == "" || icNumber == "" {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "All fields (username, password, email, phone, icNumber) are required" });
                    check caller->respond(resp);
                    return;
                }

                // Password validation: at least 8 chars, one uppercase, one lowercase, one digit, one special char
                if !validatePassword(password) {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "Password must be at least 8 characters including uppercase, lowercase, digit and special character" });
                    check caller->respond(resp);
                    return;
                }

                // Email validation (basic regex)
                if !validateEmail(email) {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "Invalid email format" });
                    check caller->respond(resp);
                    return;
                }

                // Verify email via OTP (simulate sending and validation)
                boolean emailVerified = verifyEmailOtp(email);
                if !emailVerified {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "Email verification failed" });
                    check caller->respond(resp);
                    return;
                }

                // Validate Sri Lankan IC number format (e.g. 9 digits + V or X)
                if !validateSriLankanIC(icNumber) {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "Invalid Sri Lankan IC number format" });
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
                    icNumber: icNumber
                };

                check regUsersCol->insertOne(newUser);

                http:Cookie newCookie = new (
                    name = "reg_user_id",
                    value = id,
                    path = "/",
                    httpOnly = true,
                    maxAge = 60 * 60 * 24 * 365 // 1 year
                );

                http:Response resp = new;
                resp.addCookie(newCookie);
                resp.statusCode = 201;
                resp.setJsonPayload({ message: "User registered successfully", id: id });
                check caller->respond(resp);

            } else {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Invalid JSON payload structure" });
                check caller->respond(resp);
            }
            
        } else {
            // Return existing ID
            http:Response resp = new;
            resp.statusCode = 400;
            resp.setJsonPayload({ message: "You already have an account" });
            check caller->respond(resp);
            }
    }
    resource function post logoutRegisteredUser(http:Caller caller, http:Request req) returns error? {
        http:Cookie[] cookies = req.getCookies();
        http:Cookie? cookie = ();
        foreach http:Cookie c in cookies {
            if c.name == "reg_user_id" {
                cookie = c;
                break;
            }
        }
        http:Response resp = new;
        // Check if user is actually logged in
        if cookie is () {
            resp.statusCode = 400;
            resp.setJsonPayload({ message: "No login cookie found. You are not logged in." });
            check caller->respond(resp);
            return;
        }
        
        // Remove the cookie by setting its maxAge to 0
        // We create an expired cookie with the same attributes as the original
        // to ensure the browser properly removes it
        
        // http:Cookie expiredCookie = new (
        //     name = "reg_user_id",
        //     value = "",
        //     path = "/",
        //     httpOnly = true,
        //     maxAge = 0 // Instructs browser to delete immediately
        // );
        
        // Also add a header to remove the cookie, which provides an additional way
        // for the browser to remove the cookie
        resp.setHeader("Set-Cookie", "reg_user_id=; Path=/; HttpOnly; Max-Age=0");
        // resp.addCookie(expiredCookie);
        resp.statusCode = 200;
        resp.setJsonPayload({ message: "Logout successful. Cookie removed." });
        check caller->respond(resp);
    }//Here could not able to delete predefined cookie

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

            json|error payload = req.getJsonPayload();
            if payload is error {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Invalid JSON payload" });
                check caller->respond(resp); return;
            }

            string username = "";
            string email = "";
            string password = "";
            if payload is map<json> {
                if payload.hasKey("username") && payload["username"] is string {
                    username = (<string>payload["username"]).trim();
                }
                if payload.hasKey("email") && payload["email"] is string {
                    email = (<string>payload["email"]).trim();
                }
                if payload.hasKey("password") && payload["password"] is string {
                    password = <string>payload["password"];
                }
            } else {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Invalid JSON object" });
                check caller->respond(resp); return;
            }

            if password == "" || (username == "" || email == "") {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Missing required fields: password and either username or email" });
                check caller->respond(resp); return;
            }
            
            // Hash password
            string hashedPassword = bytesToHex(crypto:hashSha256(password.toBytes()));
            
            // Query by username or email
            mongodb:Collection regUsersCol = check self.accountsDb->getCollection(COLLECTION_REGISTEREDUSERS);
            stream<RegisteredUser, error?> foundUsers = check regUsersCol->find({ username: username });
            RegisteredUser[] matches = check from RegisteredUser u in foundUsers select u;

            if matches.length() == 0 {
                http:Response resp = new;
                resp.statusCode = 401;
                resp.setJsonPayload({ message: "User not found" });
                check caller->respond(resp); return;
            }
            RegisteredUser user = matches[0];
            if user.password != hashedPassword && user.email != email {
                http:Response resp = new;
                resp.statusCode = 401;
                resp.setJsonPayload({ message: "Incorrect password or email" });
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
            resp.addCookie(loginCookieNew);
            resp.statusCode = 200;
            resp.setJsonPayload({ message: "Login successful", id: user.id });
            check caller->respond(resp);

        } 
        else {
            http:Response resp = new;
            resp.statusCode = 403;
            resp.setJsonPayload({ message: "You are already logged in" });
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

            json|error payload = req.getJsonPayload();
            if payload is error {
            http:Response resp = new;
            resp.statusCode = 400;
            resp.setJsonPayload({ message: "Invalid JSON payload" });
            check caller->respond(resp);
            return;
            }

            if payload is map<json> {
                string username = "";
                string password = "";
                string email = "";
                string phone = "";
                string icNumber = "";

                if payload["username"] is string {
                    string uname = <string>payload["username"];
                    username = uname.trim();
                }

                if payload["password"] is string {
                    string pwd = <string>payload["password"];
                    password = pwd;
                }
                if payload["email"] is string {
                    string mail = <string>payload["email"];
                    email = mail.trim();
                }
                if payload["phone"] is string {
                    string ph = <string>payload["phone"];
                    phone = ph.trim();
                }
                if payload["icNumber"] is string {
                    string ic = <string>payload["icNumber"];
                    icNumber = ic.trim();
                }

                // Basic validation on mandatory fields
                if username == "" || password == "" || email == "" || phone == "" || icNumber == "" {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "All fields (username, password, email, phone, icNumber) are required" });
                    check caller->respond(resp);
                    return;
                }

                // Password validation: at least 8 chars, one uppercase, one lowercase, one digit, one special char
                if !validatePassword(password) {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "Password must be at least 8 characters including uppercase, lowercase, digit and special character" });
                    check caller->respond(resp);
                    return;
                }

                // Email validation (basic regex)
                if !validateEmail(email) {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "Invalid email format" });
                    check caller->respond(resp);
                    return;
                }

                // Verify email via OTP (simulate sending and validation)
                boolean emailVerified = verifyEmailOtp(email);
                if !emailVerified {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "Email verification failed" });
                    check caller->respond(resp);
                    return;
                }

                // Validate Sri Lankan IC number format (e.g. 9 digits + V or X)
                if !validateSriLankanIC(icNumber) {
                    http:Response resp = new;
                    resp.statusCode = 400;
                    resp.setJsonPayload({ message: "Invalid Sri Lankan IC number format" });
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
                    icNumber: icNumber
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
                resp.addCookie(newCookie);
                resp.statusCode = 201;
                resp.setJsonPayload({ message: "User registered successfully", id: id });
                check caller->respond(resp);

            } else {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Invalid JSON payload structure" });
                check caller->respond(resp);
            }
            
        } else {
            // Return existing ID
            http:Response resp = new;
            resp.statusCode = 400;
            resp.setJsonPayload({ message: "You already have an account" });
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

            json|error payload = req.getJsonPayload();
            if payload is error {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Invalid JSON payload" });
                check caller->respond(resp); return;
            }

            string username = "";
            string email = "";
            string password = "";
            if payload is map<json> {
                if payload.hasKey("username") && payload["username"] is string {
                    username = (<string>payload["username"]).trim();
                }
                if payload.hasKey("email") && payload["email"] is string {
                    email = (<string>payload["email"]).trim();
                }
                if payload.hasKey("password") && payload["password"] is string {
                    password = <string>payload["password"];
                }
            } else {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Invalid JSON object" });
                check caller->respond(resp); return;
            }

            if password == "" || (username == "" || email == "") {
                http:Response resp = new;
                resp.statusCode = 400;
                resp.setJsonPayload({ message: "Missing required fields: password and either username or email" });
                check caller->respond(resp); return;
            }
            
            // Hash password
            string hashedPassword = bytesToHex(crypto:hashSha256(password.toBytes()));
            
            // Query by username or email
            mongodb:Collection regUsersCol = check self.accountsDb->getCollection(COLLECTION_ADMINS);
            stream<RegisteredUser, error?> foundUsers = check regUsersCol->find({ username: username });
            RegisteredUser[] matches = check from RegisteredUser u in foundUsers select u;

            if matches.length() == 0 {
                http:Response resp = new;
                resp.statusCode = 401;
                resp.setJsonPayload({ message: "User not found" });
                check caller->respond(resp); return;
            }
            RegisteredUser user = matches[0];
            if user.password != hashedPassword && user.email != email {
                http:Response resp = new;
                resp.statusCode = 401;
                resp.setJsonPayload({ message: "Incorrect password or email" });
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
            resp.addCookie(loginCookieNew);
            resp.statusCode = 200;
            resp.setJsonPayload({ message: "Login successful", id: user.id });
            check caller->respond(resp);

        } 
        else {
            http:Response resp = new;
            resp.statusCode = 403;
            resp.setJsonPayload({ message: "You are already logged in" });
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
};



//ToDos
//OTP verification for email must to be full filled