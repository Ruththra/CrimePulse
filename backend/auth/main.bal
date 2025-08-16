import ballerina/http;
// import ballerina/mime;
// import ballerina/file;
// import ballerina/io;
import ballerina/uuid;
// import ballerina/lang.'string as string;
import ballerinax/mongodb;


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
    private final mongodb:Database AccountsDb;

    function init() returns error? {
    self.AccountsDb = check mongoClient->getDatabase(DB_NAME);
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


            mongodb:Collection usersCol = check self.AccountsDb->getCollection(COLLECTION_UNREGISTEREDUSERS);
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

    
}