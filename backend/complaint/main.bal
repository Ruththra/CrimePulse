import ballerina/http;
import ballerina/mime;
import ballerina/file;
import ballerina/io;
import ballerina/uuid;
import ballerina/lang.'string as string;
import ballerinax/mongodb;

configurable string MONGO_URI = ?;
configurable string DB_NAME = ?;
configurable string COLLECTION_NAME = ?;

// mongodb:Client mongodb = check new ({
//     connection: MONGO_URI
// });
mongodb:Client mongoClient = check new ({
    connection: MONGO_URI
});
//_________________________________________________________________________________

// The service-level CORS config applies globally to each `resource`.
http:CorsConfig corsConfig = {
    allowCredentials: true,
    allowHeaders: ["Content-Type", "Authorization" , "CORELATION-ID", "Access-Control-Allow-Origin"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowOrigins: ["http://localhost:8080/complaint"],
    exposeHeaders: ["Content-Length", "ETag"]
};


listener http:Listener complaintListen = new (8081);
// listener http:Listener complaintListen = new (8081, host = "http://localhost:8080");

service /complaints on complaintListen {
    private final mongodb:Database ComplaintsDb;

    @http:ResourceConfig {
        cors: {
            allowOrigins: ["http://localhost:8080/complaint"],
            allowCredentials: true,
            allowHeaders: ["Content-Type", "Authorization" , "CORELATION-ID" , "Access-Control-Allow-Origin"],
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            exposeHeaders: ["Content-Length", "ETag"]
        }
    }

    function init() returns error? {
        self.ComplaintsDb = check mongoClient->getDatabase(DB_NAME);
    }

    resource function post submit(http:Caller caller, http:Request req) returns error? {

        string id = uuid:createType4AsString();
        string mediaPath = "";// Initialize mediaPath to an empty string.


        // Attempt to extract the body parts.  If the request does not
        // contain a multipart payload this returns a ParserError.
        mime:Entity[]|mime:ParserError bodyPartsResult = check req.getBodyParts();
        mime:Entity[] bodyParts = [];
        if bodyPartsResult is mime:Entity[] {
            bodyParts = bodyPartsResult;
        } else {
            http:Response errorResp = new;
            errorResp.statusCode = 400;
            // Provide a generic message when the incoming payload is not
            // multipart.  The client can interpret this as a bad request.
            errorResp.setJsonPayload({
                message: "Invalid multipart body"
            });
            check caller->respond(errorResp);
            // return;
        }

        // Variables to hold the parsed form fields.  Empty values
        // indicate that a field has not been provided.
        string category = "";
        string description = "";
        string incidentDate = "";
        string incidentTime = "";
        string location = "";
        // Track whether a media part was present.  Use a separate flag
        // because a zero-length byte array could be a valid file.
        boolean mediaPresent = false;
        byte[] mediaBytes = [];
        string mediaContentType = "";
        string mediaOriginalFileName = "";

        // Iterate through the body parts.  Each part has an associated
        // Content-Disposition header with the form field name and
        // optionally a filename for file uploads.
        foreach mime:Entity part in bodyParts {
            mime:ContentDisposition? cd = part.getContentDisposition();
            string? partName = cd is mime:ContentDisposition ? cd.name : ();
            // Skip parts without a name; these are not expected from the
            // client form.  Unknown names are also ignored.
            if partName is string {
                match partName {
                    "category" => {
                        var value = part.getText();
                        if value is string {
                            // Trim whitespace to avoid accidental spaces.
                            category = value.trim();
                        }
                    }
                    "description" => {
                        var value = part.getText();
                        if value is string {
                            description = value;
                        }
                    }
                    "date" => {
                        var value = part.getText();
                        if value is string {
                            incidentDate = value;
                        }
                    }
                    "time" => {
                        var value = part.getText();
                        if value is string {
                            incidentTime = value;
                        }
                    }
                    "location" => {
                        var value = part.getText();
                        if value is string {
                            location = value;
                        }
                    }
                    // The frontend includes a reCAPTCHA checkbox.  Since
                    // the check happens on the client side, simply parse
                    // and ignore this field here.
                    "recaptcha" => {
                        _ = check part.getText();
                    }
                    // The file input is named "media".  Extract its
                    // binary content, content type and original filename.
                    "media" => {
                        var bytesResult = part.getByteArray();
                        if bytesResult is byte[] {
                            mediaBytes = bytesResult;
                            mediaPresent = true;
                        }
                        var ct = part.getContentType();
                        if ct is string {
                            // The content type is already a string (e.g. image/jpeg).
                            mediaContentType = ct;
                        }
                        mediaOriginalFileName = cd is mime:ContentDisposition ? cd.fileName : "";
                    }
                    // Ignore any unexpected parts.
                    _ => {
                        // Do nothing.
                    }
                }
            }
        }

        // Build a map of validation errors keyed by form field name.
        // An empty map indicates that all validations have passed.
        map<string> errors = {};

        // Category is mandatory.  The frontend ensures the value is one
        // of several predefined options, so presence is the only check.
        if category == "" {
            errors["category"] = "Please select a category";
        }

        // Description must be present and at least 20 characters long
        // (after trimming leading/trailing whitespace).
        string trimmedDesc = description.trim();
        if trimmedDesc == "" {
            errors["description"] = "Description is required";
        } else {
            int descLen = string:length(trimmedDesc);
            if descLen < 20 {
                errors["description"] = "Description must be at least 20 characters";
            }
        }

        // Date and time are required fields.  The frontend restricts
        // `date` to today or earlier via the `max` attribute, but here
        // we simply check for presence.  Additional parsing could be
        // added if needed (e.g. to reject future dates).
        if incidentDate == "" {
            errors["date"] = "Date is required";
        }
        if incidentTime == "" {
            errors["time"] = "Time is required";
        }

        // Location cannot be empty when trimmed.
        if location.trim() == "" {
            errors["location"] = "Location is required";
        }

        // If a media file was uploaded, enforce size and type constraints.
        if mediaPresent {
            // File size must not exceed 10 MB (10 * 1024 * 1024 bytes).
            int sizeInBytes = mediaBytes.length();
            if sizeInBytes > 10 * 1024 * 1024 {
                errors["media"] = "File size must be less than 10MB";
            }
            // Acceptable MIME types: JPEG, PNG, MP4 and MOV (QuickTime).
            if mediaContentType != "" {
                boolean allowed = mediaContentType == "image/jpeg" ||
                                 mediaContentType == "image/png" ||
                                 mediaContentType == "video/mp4" ||
                                 mediaContentType == "video/quicktime";
                if !allowed {
                    errors["media"] = "Only JPG, PNG, MP4, and MOV files are allowed";
                }
            }
        }

        // If any validation errors were recorded, respond with a 400
        // status and the error map.  The client can use this map to
        // display per-field error messages.
        if errors.length() > 0 {
            http:Response resp = new;
            resp.statusCode = 400;
            resp.setJsonPayload({
                errors: errors
            });
            // return resp;
        check caller->respond(resp);

        }

        // If a media file was provided and validated, persist it in the
        // `uploads` directory.  The directory is created on demand.
        if mediaPresent {
            string uploadDir = "./uploads";//Online storage tobe configured
            // Check whether the directory exists.  If it does not
            // exist, create it (recursively) before writing the file.
            boolean dirExists = check file:test(uploadDir, file:EXISTS);
            if !dirExists {
                // Create any missing parent directories as well.
                check file:createDir(uploadDir, file:RECURSIVE);
            }
            // Determine the file extension from the original filename
            // (including the leading dot).  If no dot is found, the
            // extension is left empty.
            string extension = "";
            if mediaOriginalFileName != "" {
                int lastDot = string:lastIndexOf(mediaOriginalFileName, ".") ?: 0;
                if lastDot >= 0 {
                    extension = string:substring(mediaOriginalFileName, lastDot, string:length(mediaOriginalFileName));
                }
            }
            // Construct a unique filename using a UUID with hyphens
            // removed.  This mitigates collisions even under high
            // concurrency.  Note that hyphens are removed to produce
            // shorter filenames.
            string fileName = id + extension;
            string filePath = uploadDir + "/" + fileName;
            mediaPath = filePath; // Store the path for the Complaint record.
            // Write the byte array to disk.  Errors propagate to
            // the resource's return type through `check`.
            check io:fileWriteBytes(filePath, mediaBytes);
        }

        // Generate a concise reference number.  The React frontend
        // extracts the last six digits of the current timestamp to
        // produce a code like `CP-123456`.  Here we generate a UUID,
        // strip the hyphens, and take the last six characters to
        // achieve similar uniqueness.
        //________________________________________________
        string rawUuid = uuid:createType4AsString();
        int len = string:length(rawUuid);
        string suffix = len >= 6 ? string:substring(rawUuid, len - 6, len) : rawUuid;
        string reference = "CP-" + suffix;

        // Construct the success response with status 201 (Created).
        http:Response successResp = new;
        successResp.statusCode = 201;
        successResp.setJsonPayload({
            reference: reference,
            message: "Complaint submitted successfully"
        });
        //________________________________________________________
        // Create a Complaint record to store in the database.
        Complaint complaint = {
            id: id,
            category: category,
            description: description,
            date: incidentDate,
            time: incidentTime,
            location: location,
            mediaPath: mediaPresent ? mediaPath : ()
        };
    mongodb:Collection complaints = check self.ComplaintsDb->getCollection(COLLECTION_NAME);
    check complaints->insertOne(complaint);
    http:Response resp = new;
    resp.setPayload({message: "Complaint received and saved to DB"});
    check caller->respond(resp);
    
        // return successResp;
    }
}

public type Complaint record {
    readonly string id;
    string category;
    string description;
    string date;
    string time;
    string location;
    string? mediaPath; // optional
};





//___________________________________________________________________________________

// Pass cors as part of listener config
// listener http:Listener apiListener = new (8081, host = "http://localhost:5173");


// service /api on apiListener {

//     private final mongodb:Database ComplaintsDb;

//     function init() returns error? {
//         self.ComplaintsDb = check mongoClient->getDatabase(DB_NAME);
//     }

// //     // Example GET endpoint: http://localhost:8080/api/hello
//     resource function get hello() returns string {
//         return "Hello from Ballerina backend!";
//     }

//     // Example POST endpoint: http://localhost:8080/api/complaint
//     resource function post complaint(http:Caller caller, http:Request req) returns error? {
//         string id = uuid:createType1AsString();
//         json payload = check req.getJsonPayload();
//         Complaint complaint = {
//             id: id,
//             name: (check payload.name).toString(),
//             email: (check payload.email).toString(),
//             complaint: (check payload.complaint).toString()
//         };

//         mongodb:Collection complaints = check self.ComplaintsDb->getCollection(COLLECTION_NAME);
//         check complaints->insertOne(complaint);
//         http:Response resp = new;
//         resp.setPayload({message: "Complaint received and saved to DB"});
//         check caller->respond(resp);

//         // No explicit return needed, since response is sent via caller.
//         // return "Complaint received and saved to DB";
//     }
// }

// public type Complaint record {
//     readonly string id;
//     string name;
//     string email;
//     string complaint;
// };


// service /api on new http:Listener(9091) {
//     private final mongodb:Database moviesDb;

//     resource function get hello() returns string {
//         return "Hello from Ballerina backend!";
//     }

//     function init() returns error? {
//         self.moviesDb = check mongoClient->getDatabase("movies");
//     }

//     resource function get movies() returns Movie[]|error {
//         mongodb:Collection movies = check self.moviesDb->getCollection("movies");
//         stream<Movie, error?> result = check movies->find();
//         return from Movie m in result
//             select m;
//     }

//     resource function get movies/[string id]() returns Movie|error {
//         return getMovie(self.moviesDb, id);
//     }

//     resource function post movies(MovieInput input) returns Movie|error {
//         string id = uuid:createType1AsString();
//         Movie movie = {id, ...input};
//         io:println("Inserting movie: ");
//         mongodb:Collection movies = check self.moviesDb->getCollection("movies");
//         check movies->insertOne(movie);
//         return movie;
//     }

//     resource function put movies/[string id](MovieUpdate update) returns Movie|error {
//         mongodb:Collection movies = check self.moviesDb->getCollection("movies");
//         mongodb:UpdateResult updateResult = check movies->updateOne({id}, {set: update});
//         if updateResult.modifiedCount != 1 {
//             return error(string `Failed to update the movie with id ${id}`);
//         }
//         return getMovie(self.moviesDb, id);
//     }

//     resource function delete movies/[string id]() returns string|error {
//         mongodb:Collection movies = check self.moviesDb->getCollection("movies");
//         mongodb:DeleteResult deleteResult = check movies->deleteOne({id});
//         if deleteResult.deletedCount != 1 {
//             return error(string `Failed to delete the movie ${id}`);
//         }
//         return id;
//     }
// }

// isolated function getMovie(mongodb:Database moviesDb, string id) returns Movie|error {
//     mongodb:Collection movies = check moviesDb->getCollection("movies");
//     stream<Movie, error?> findResult = check movies->find({id});
//     Movie[] result = check from Movie m in findResult
//         select m;
//     if result.length() != 1 {
//         return error(string `Failed to find a movie with id ${id}`);
//     }
//     return result[0];
// }

// public type MovieInput record {|
//     string title;
//     int year;
//     string directorId;
// |};

// public type MovieUpdate record {|
//     string title?;
//     int year?;
//     string directorId?;
// |};

// public type Movie record {|
//     readonly string id;
//     *MovieInput;
// |};


//_____________________________________________________________________________________________________________________________