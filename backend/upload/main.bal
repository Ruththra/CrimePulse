import ballerina/http;
import ballerina/io;
import ballerina/mime;

public function uploadImage(string cloudName, string apiKey, string uploadPreset, string publicId, string filePath) returns error? {
    // Create Cloudinary client
    http:Client cloudinary = check new ("https://api.cloudinary.com");

    // Read file content
    byte[] fileContent = check io:fileReadBytes(filePath);
    
    // Create multipart entity for file
    mime:Entity fileEntity = new;
    fileEntity.setByteArray(fileContent, contentType = "application/octet-stream");
    
    // Create multipart entity for API key
    mime:Entity apiEntity = new;
    apiEntity.setText(apiKey, contentType = "text/plain");
    
    // Create multipart entity for upload preset
    mime:Entity presetEntity = new;
    presetEntity.setText(uploadPreset, contentType = "text/plain");
    
    // Create multipart entity for public ID
    mime:Entity publicIdEntity = new;
    publicIdEntity.setText(publicId, contentType = "text/plain");
    
    // Create content disposition for file
    mime:ContentDisposition fileDisposition = new;
    fileDisposition.name = "file";
    fileEntity.setContentDisposition(fileDisposition);
    
    // Create content disposition for API key
    mime:ContentDisposition apiDisposition = new;
    apiDisposition.name = "api_key";
    apiEntity.setContentDisposition(apiDisposition);
    
    // Create content disposition for preset
    mime:ContentDisposition presetDisposition = new;
    presetDisposition.name = "upload_preset";
    presetEntity.setContentDisposition(presetDisposition);
    
    // Create content disposition for public ID
    mime:ContentDisposition publicIdDisposition = new;
    publicIdDisposition.name = "public_id";
    publicIdEntity.setContentDisposition(publicIdDisposition);
    
    // Create multipart array
    mime:Entity[] multipartEntities = [fileEntity, apiEntity, presetEntity, publicIdEntity];
    
    // Create request with multipart data
    http:Request request = new;
    request.setBodyParts(multipartEntities);
    
    // Make the request
    http:Response response = check cloudinary->post(string `/v1_1/${cloudName}/image/upload`, request);

    // Handle response
    json|error payload = response.getJsonPayload();
    if payload is error {
        return error("Error getting response payload: " + payload.message());
    } else {
        // Check if Cloudinary returned an error
        if payload.toString().indexOf("error") >= 0 {
            string errorMsg = payload.toString();
            if errorMsg.indexOf("Upload preset must be specified when using unsigned upload") >= 0 {
                return error("Cloudinary error: Upload preset '" + uploadPreset + "' is not configured for unsigned uploads in Cloudinary. Please check your Cloudinary settings.");
            } else {
                return error("Cloudinary error: " + errorMsg);
            }
        } else {
            io:println("Upload response: ", payload);
        }
    }
}

public function main(string... args) returns error? {
    string cloudName = "dkgn7oiok";        // Your Cloud Name
    string apiKey = "689696854287771";       // Your API Key
    string uploadPreset = "CrimePulse";    // Or "first_preset"
    string publicId = "70d5c698-b0e4-4b87-b175-76bd363c9806";        // Public ID for the image

    // Default file path (can override with CLI argument)
    string filePath = "./spiderman.jpg";
    if (args.length() > 0) {
        filePath = args[0];
    }
    
    // Upload the image
    error? result = uploadImage(cloudName, apiKey, uploadPreset, publicId, filePath);
    if result is error {
        io:println("Upload failed: ", result.message());
    } else {
        io:println("Upload completed successfully");
    }
}