import ballerina/http;
import ballerina/mime;
import ballerina/file;
import ballerina/io;
import ballerina/uuid;
import ballerina/lang.'string as string;
import ballerinax/mongodb;


configurable int PORT = ?;
configurable string SERVER_URL = ?;
configurable string FRONTEND_COMPLAINT_URL = ?;


configurable string MONGO_URI = ?;
configurable string DB_NAME = ?;
configurable string COLLECTION_ASSAULT = ?;
configurable string COLLECTION_CYBERCRIME = ?;
configurable string COLLECTION_MISSINGPERSON = ?;
configurable string COLLECTION_THEFT = ?;
configurable string COLLECTION_OTHER = ?;

configurable string CLOUDINARY_CLOUD_NAME = ?;
configurable string CLOUDINARY_API_KEY = ?;
configurable string CLOUDINARY_API_SECRET = ?;
configurable string CLOUDINARY_URL = ?;


mongodb:Client mongoClient = check new ({
    connection: MONGO_URI
});

http:CorsConfig corsConfig = {
    allowCredentials: true,
    allowHeaders: ["Content-Type", "Authorization" , "CORELATION-ID", "Access-Control-Allow-Origin"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowOrigins: [FRONTEND_COMPLAINT_URL],
    exposeHeaders: ["Content-Length", "ETag"]
};

listener http:Listener complaintListen = new (PORT);

service /complaints on complaintListen {
    private final mongodb:Database ComplaintsDb;

    // @http:ResourceConfig {
    //     cors: {
    //         allowOrigins: [FRONTEND_COMPLAINT_URL],
    //         allowCredentials: true,
    //         allowHeaders: ["Content-Type", "Authorization" , "CORELATION-ID" , "Access-Control-Allow-Origin"],
    //         allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    //         exposeHeaders: ["Content-Length", "ETag"]
    //     }
    // }

    function init() returns error? {
        self.ComplaintsDb = check mongoClient->getDatabase(DB_NAME);
    }


    resource function get hello() returns string {
        return "Hello from Ballerina backend!";
    }




    // resource function post upload(http:Caller caller, http:Request req) returns error? {
    //     mime:Entity|error fileEntity = req.getEntity("file");
    //     if fileEntity is mime:Entity {
    //         // Read file as byte array
    //         byte[] fileBytes = check fileEntity.getByteArray();

    //         // Cloudinary API details
    //         string cloudName = CLOUDINARY_CLOUD_NAME;
    //         string apiKey = CLOUDINARY_API_KEY;
    //         string apiSecret = CLOUDINARY_API_SECRET;
    //         string apiUrl = string `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    //         // Prepare request
    //         http:Client cloudinaryClient = check new (apiUrl);

    //         // Create form-data
    //         mime:Entity filePart = new;
    //         check filePart.setByteArray(fileBytes, contentType = "image/jpeg");

    //         http:Request uploadReq = new;
    //         uploadReq.setBody(filePart);
    //         uploadReq.addFormField("file", "data:image/jpeg;base64," + base64Encode(fileBytes));
    //         uploadReq.addFormField("upload_preset", "<your-upload-preset>");

    //         // Send POST request to Cloudinary
    //         http:Response cloudResp = check cloudinaryClient->post("", uploadReq);
    //         string respJson = check cloudResp.getText();

    //         // Send Cloudinary response back to client
    //         check caller->respond(respJson);
    //     } else {
    //         check caller->respond("No file uploaded");
    //     }
    // }

    // function base64Encode(byte[] bytes) returns string {
    //     return check base64Encode(bytes);
    // }

    resource function post submit(http:Caller caller, http:Request req, string creator) returns error? {

        string id = uuid:createType4AsString();
        string mediaPath = "";// Initialize mediaPath to an empty string.


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
            // return;
        }

        string category = "";
        string description = "";
        string incidentDate = "";
        string incidentTime = "";
        string location = "";
        boolean mediaPresent = false;
        byte[] mediaBytes = [];
        string mediaContentType = "";
        string mediaOriginalFileName = "";


        foreach mime:Entity part in bodyParts {
            mime:ContentDisposition? cd = part.getContentDisposition();
            string? partName = cd is mime:ContentDisposition ? cd.name : ();

            if partName is string {
                match partName {
                    "category" => {
                        var value = part.getText();
                        if value is string {
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

                    "recaptcha" => {
                        _ = check part.getText();
                    }

                    "media" => {
                        var bytesResult = part.getByteArray();
                        if bytesResult is byte[] {
                            mediaBytes = bytesResult;
                            mediaPresent = true;
                        }
                        var ct = part.getContentType();
                        if ct is string {
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


        map<string> errors = {};


        if category == "" {
            errors["category"] = "Please select a category";
        }

        string trimmedDesc = description.trim();
        if trimmedDesc == "" {
            errors["description"] = "Description is required";
        } else {
            int descLen = string:length(trimmedDesc);
            if descLen < 20 {
                errors["description"] = "Description must be at least 20 characters";
            }
        }


        if incidentDate == "" {
            errors["date"] = "Date is required";
        }
        if incidentTime == "" {
            errors["time"] = "Time is required";
        }

        if location.trim() == "" {
            errors["location"] = "Location is required";
        }

        if mediaPresent {
            int sizeInBytes = mediaBytes.length();
            if sizeInBytes > 10 * 1024 * 1024 {
                errors["media"] = "File size must be less than 10MB";
            }
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


        if errors.length() > 0 {
            http:Response resp = new;
            resp.statusCode = 400;
            resp.setJsonPayload({
                errors: errors
            });
        addCorsHeaders(resp);
        check caller->respond(resp);

        }


        if mediaPresent {
            string uploadDir = "./uploads";//Online storage tobe configured

            boolean dirExists = check file:test(uploadDir, file:EXISTS);
            if !dirExists {
                check file:createDir(uploadDir, file:RECURSIVE);
            }
            string extension = "";
            if mediaOriginalFileName != "" {
                int lastDot = string:lastIndexOf(mediaOriginalFileName, ".") ?: 0;
                if lastDot >= 0 {
                    extension = string:substring(mediaOriginalFileName, lastDot, string:length(mediaOriginalFileName));
                }
            }

            string fileName = id + extension;
            string filePath = uploadDir + "/" + fileName;
            mediaPath = filePath; // Store the path for the Complaint record.
            check io:fileWriteBytes(filePath, mediaBytes);
        }


        string rawUuid = uuid:createType4AsString();
        int len = string:length(rawUuid);
        string suffix = len >= 6 ? string:substring(rawUuid, len - 6, len) : rawUuid;
        string reference = "CP-" + suffix;


        http:Response successResp = new;
        successResp.statusCode = 201;
        successResp.setJsonPayload({
            reference: reference,
            message: "Complaint submitted successfully"
        });


        Complaint complaint = {
            id: id,
            creator: creator,
            category: category,
            description: description,
            date: incidentDate,
            time: incidentTime,
            location: location,
            mediaPath: mediaPresent ? mediaPath : (),
            verified: false,
            pending: true, 
            resolved: false
        };

    if category == "Assault"{
        io:println("inside assault");
        mongodb:Collection complaints = check self.ComplaintsDb->getCollection(COLLECTION_ASSAULT);
        check complaints->insertOne(complaint);
        http:Response resp = new;
        resp.setPayload({message: "Complaint received and saved to DB"});
        addCorsHeaders(resp);
        resp.statusCode = 200;
        check caller->respond(resp);
    }
    else if category == "CyberCrime" {
        mongodb:Collection complaints = check self.ComplaintsDb->getCollection(COLLECTION_CYBERCRIME);
        check complaints->insertOne(complaint);
        http:Response resp = new;
        resp.setPayload({message: "Complaint received and saved to DB"});
        addCorsHeaders(resp);
        resp.statusCode = 200;
        check caller->respond(resp);
    }
    else if category == "MissingPerson" {
        mongodb:Collection complaints = check self.ComplaintsDb->getCollection(COLLECTION_MISSINGPERSON);
        check complaints->insertOne(complaint);
        http:Response resp = new;
        resp.setPayload({message: "Complaint received and saved to DB"});
        addCorsHeaders(resp);
        resp.statusCode = 200;
        check caller->respond(resp);
    }
    else if category == "Theft" {
        mongodb:Collection complaints = check self.ComplaintsDb->getCollection(COLLECTION_THEFT);
        check complaints->insertOne(complaint);
        http:Response resp = new;
        resp.setPayload({message: "Complaint received and saved to DB"});
        addCorsHeaders(resp);
        resp.statusCode = 200;
        check caller->respond(resp);
    }
    else {
        io:println("Inside Other");
        mongodb:Collection complaints = check self.ComplaintsDb->getCollection(COLLECTION_OTHER);
        check complaints->insertOne(complaint);
        http:Response resp = new;
        resp.setPayload({message: "Complaint received and saved to DB"});
        addCorsHeaders(resp);
        resp.statusCode = 200;
        check caller->respond(resp);
    }
    
    
}

    // Retrieves all complaints in the database
    resource function get getAllComplaints(http:Caller caller, http:Request req) returns error? {
        io:println("Retrieving all complaints");
        Complaint[] allComplaints = [];
        string[] collections = [
            COLLECTION_ASSAULT,
            COLLECTION_CYBERCRIME,
            COLLECTION_MISSINGPERSON,
            COLLECTION_THEFT,
            COLLECTION_OTHER
        ];
        foreach string colName in collections {
            mongodb:Collection complaints = check self.ComplaintsDb->getCollection(colName);
            stream<Complaint, error?> result = check complaints->find();
            Complaint[] tempList = check from Complaint c in result select c;
            // Merge into allComplaints
            allComplaints = [...allComplaints, ...tempList];
        }

        json[] allComplaintsJson = [];

        foreach Complaint c in allComplaints{
            json complaintJson = {
                id: c.id,
                category: c.category,
                description: c.description,
                date: c.date,
                time: c.time,
                location: c.location,
                verified: c.verified,
                pending: c.pending,
                resolved: c.resolved
            };
            if c.mediaPath is string {
                // complaintJson["mediaPath"] = c.mediaPath;
                map<json> withMedia = <map<json>> complaintJson;
                withMedia["mediaPath"] = c.mediaPath;
                complaintJson = <json>withMedia;
            }
            allComplaintsJson.push(complaintJson);
        }
        http:Response resp = new;
        if allComplaints.length() == 0 {
            resp.statusCode = 404;
            resp.setJsonPayload({message: "No complaints found"});
        } else {
            resp.statusCode = 200;
            resp.setJsonPayload(allComplaintsJson);
        }
        check caller->respond(resp);
    }

    // Retrieves complaints by category
    resource function get getComplaintsByCategory(http:Caller caller, http:Request req) returns error? {
        string? category = req.getQueryParamValue("category");
        if category is () || category.trim() == "" {
            http:Response resp = new;
            resp.statusCode = 400;
            resp.setJsonPayload({ "error": "Missing or empty 'category' query parameter" });
            check caller->respond(resp);
            // return [];
        }

        string collectionName;
        match category {
            "Assault" => {collectionName = COLLECTION_ASSAULT;}
            "CyberCrime" => {collectionName = COLLECTION_CYBERCRIME;}
            "MissingPerson" => {collectionName = COLLECTION_MISSINGPERSON;}
            "Theft" => {collectionName = COLLECTION_THEFT;}
            _ => {collectionName = COLLECTION_OTHER;}
        }

        mongodb:Collection complaints = check self.ComplaintsDb->getCollection(collectionName);
        stream<Complaint, error?> result = check complaints->find();
        Complaint[] found = check from Complaint c in result select c;
        json[] foundJson = [];
        foreach Complaint c in found {
            json complaintJson = {
                id: c.id,
                category: c.category,
                description: c.description,
                date: c.date,
                time: c.time,
                location: c.location,
                verified: c.verified,
                pending: c.pending,
                resolved: c.resolved
            };
            if c.mediaPath is string {
                // complaintJson["mediaPath"] = c.mediaPath;
                map<json> withMedia = <map<json>> complaintJson;
                withMedia["mediaPath"] = c.mediaPath;
                complaintJson = <json>withMedia;
            }
            foundJson.push(complaintJson);
        }
        http:Response resp = new;
        if found.length() == 0 {
            resp.statusCode = 404;
            resp.setJsonPayload({message: "No complaints found"});
        } else {
            resp.statusCode = 200;
            resp.setJsonPayload(foundJson);
        }
        check caller->respond(resp);
    }

    // resource function get getComplaintAssault(http:Caller caller, http:Request req) returns error?{
    //     io:println("Retrieving complaints for category: Assault");
    //     mongodb:Collection complaints = check self.ComplaintsDb->getCollection(COLLECTION_ASSAULT);
    //     stream<Complaint, error?> result = check complaints->find();
    //     Complaint[] found = check from Complaint c in result select c;
    //     json[] foundJson = [];
    //     foreach Complaint c in found {
    //         json complaintJson = {
    //             id: c.id,
    //             category: c.category,
    //             description: c.description,
    //             date: c.date,
    //             time: c.time,
    //             location: c.location
    //         };
    //         if c.mediaPath is string {
    //             // complaintJson["mediaPath"] = c.mediaPath;
    //             map<json> withMedia = <map<json>> complaintJson;
    //             withMedia["mediaPath"] = c.mediaPath;
    //             complaintJson = <json>withMedia;
    //         }
    //         foundJson.push(complaintJson);
    //     }
    //     http:Response resp = new;
    //     if found.length() == 0 {
    //         resp.statusCode = 404;
    //         resp.setJsonPayload({message: "No complaints found"});
    //     } else {
    //         resp.statusCode = 200;
    //         resp.setJsonPayload(foundJson);
    //     }
    //     check caller->respond(resp);
        
    // }

    // // Retrieves all complaints by creator
    resource function get getComplaintsOfCreator(http:Caller caller, http:Request req, string creator) returns error? {
        io:println("Retrieving complaints for creator: " + creator);
        string[] collections = [
            COLLECTION_ASSAULT,
            COLLECTION_CYBERCRIME,
            COLLECTION_MISSINGPERSON,
            COLLECTION_THEFT,
            COLLECTION_OTHER
        ];
        Complaint[] allFoundComplaints = [];
        
        foreach string colName in collections {
            mongodb:Collection complaints = check self.ComplaintsDb->getCollection(colName);
            stream<Complaint, error?> result = check complaints->find({creator: creator});
            Complaint[] found = check from Complaint c in result select c;
            // Add found complaints to the overall collection
            allFoundComplaints = [...allFoundComplaints, ...found];
        }
        
        // Convert all found complaints to JSON
        json[] allFoundComplaintsJson = [];
        foreach Complaint c in allFoundComplaints {
            json complaintJson = {
                id: c.id,
                creator: c.creator,
                category: c.category,
                description: c.description,
                date: c.date,
                time: c.time,
                location: c.location,
                verified: c.verified,
                pending: c.pending,
                resolved: c.resolved
            };
            if c.mediaPath is string {
                map<json> withMedia = <map<json>> complaintJson;
                withMedia["mediaPath"] = c.mediaPath;
                complaintJson = <json>withMedia;
            }
            allFoundComplaintsJson.push(complaintJson);
        }
        
        http:Response resp = new;
        if allFoundComplaints.length() == 0 {
            resp.statusCode = 404;
            resp.reasonPhrase = "No complaints found";
            resp.setJsonPayload({message: "No complaints found"});
        } else {
            resp.statusCode = 200;
            resp.setJsonPayload(allFoundComplaintsJson);
        }
        addCorsHeaders(resp);
        check caller->respond(resp);
    }
}

public type Complaint record {
    readonly string id;
    readonly string creator;
    string category;
    string description;
    string date;
    string time;
    string location;
    string? mediaPath; // optional
    boolean verified;
    boolean pending;
    boolean resolved;
};


function addCorsHeaders(http:Response resp) {
    resp.setHeader("Access-Control-Allow-Origin", FRONTEND_COMPLAINT_URL);
    resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, CORELATION-ID, Access-Control-Allow-Origin");
    resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    resp.setHeader("Access-Control-Allow-Credentials", "true");
};