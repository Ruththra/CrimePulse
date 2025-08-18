import ballerina/http;
import ballerina/mime;
import ballerina/file;
import ballerina/io;
import ballerina/uuid;
import ballerina/lang.'string as string;

// Configure an HTTP listener on port 8080.  The frontend should send
// requests to this listener at the `/complaints` path.
listener http:Listener complaintListener = new (8080);

service /complaints on complaintListener {

    resource function post submit(http:Request req) returns http:Response|error {
        // Attempt to extract the body parts.  If the request does not
        // contain a multipart payload this returns a ParserError.
        mime:Entity[]|mime:ParserError bodyPartsResult = check req.getBodyParts();
        if bodyPartsResult is mime:ParserError {
            http:Response errorResp = new;
            errorResp.statusCode = 400;
            // Provide a generic message when the incoming payload is not
            // multipart.  The client can interpret this as a bad request.
            errorResp.setJsonPayload({
                message: "Invalid multipart body"
            });
            return errorResp;
        }
        mime:Entity[] bodyParts = <mime:Entity[]> bodyPartsResult;

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
            return resp;
        }

        // If a media file was provided and validated, persist it in the
        // `uploads` directory.  The directory is created on demand.
        if mediaPresent {
            string uploadDir = "./uploads";
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
            string newUuid = uuid:createType4AsString();
            string fileName = newUuid + extension;
            string filePath = uploadDir + "/" + fileName;
            // Write the byte array to disk.  Errors propagate to
            // the resource's return type through `check`.
            check io:fileWriteBytes(filePath, mediaBytes);
        }

        // Generate a concise reference number.  The React frontend
        // extracts the last six digits of the current timestamp to
        // produce a code like `CP-123456`.  Here we generate a UUID,
        // strip the hyphens, and take the last six characters to
        // achieve similar uniqueness.
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
        return successResp;
    }
}