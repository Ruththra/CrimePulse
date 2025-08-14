import ballerina/http;
import ballerina/io;
import ballerina/uuid;

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

// This service listens on port 8080 and exposes a simple endpoint.
// service /api on new http:Listener(8080) {

//     // Example GET endpoint: http://localhost:8080/api/hello
//     resource function get hello() returns string {
//         return "Hello from Ballerina backend!";
//     }

//     // Example POST endpoint: http://localhost:8080/api/sendComplaint
//     resource function post sendComplaint(http:Caller caller, http:Request req) returns  Complaint|error? {
//         json payload = check req.getJsonPayload();
//         // Insert the complaint into MongoDB
//         mongodb:InsertOneResult result = check mongoClient->insertOne(DB_NAME, COLLECTION_NAME, payload);
//         http:Response resp = new;
//         resp.setPayload({message: "Complaint received and saved to DB", insertedId: result.insertedId.toString()});
//         check caller->respond(resp);
//     }
// }

// public type Complaint record {
//     string name;
//     string email;
//     string complaint;
// };


// public function main() {
//     io:println("CrimePulse Gateway service started.");
// }

service /api on new http:Listener(9091) {
    private final mongodb:Database moviesDb;

    resource function get hello() returns string {
        return "Hello from Ballerina backend!";
    }

    function init() returns error? {
        self.moviesDb = check mongoClient->getDatabase("movies");
    }

    resource function get movies() returns Movie[]|error {
        mongodb:Collection movies = check self.moviesDb->getCollection("movies");
        stream<Movie, error?> result = check movies->find();
        return from Movie m in result
            select m;
    }

    resource function get movies/[string id]() returns Movie|error {
        return getMovie(self.moviesDb, id);
    }

    resource function post movies(MovieInput input) returns Movie|error {
        io:println("Inserting movie: ");

        string id = uuid:createType1AsString();
        Movie movie = {id, ...input};
        io:println("Inserting movie: ");
        mongodb:Collection movies = check self.moviesDb->getCollection("movies");
        check movies->insertOne(movie);
        return movie;
    }

    resource function put movies/[string id](MovieUpdate update) returns Movie|error {
        mongodb:Collection movies = check self.moviesDb->getCollection("movies");
        mongodb:UpdateResult updateResult = check movies->updateOne({id}, {set: update});
        if updateResult.modifiedCount != 1 {
            return error(string `Failed to update the movie with id ${id}`);
        }
        return getMovie(self.moviesDb, id);
    }

    resource function delete movies/[string id]() returns string|error {
        mongodb:Collection movies = check self.moviesDb->getCollection("movies");
        mongodb:DeleteResult deleteResult = check movies->deleteOne({id});
        if deleteResult.deletedCount != 1 {
            return error(string `Failed to delete the movie ${id}`);
        }
        return id;
    }
}

isolated function getMovie(mongodb:Database moviesDb, string id) returns Movie|error {
    mongodb:Collection movies = check moviesDb->getCollection("movies");
    stream<Movie, error?> findResult = check movies->find({id});
    Movie[] result = check from Movie m in findResult
        select m;
    if result.length() != 1 {
        return error(string `Failed to find a movie with id ${id}`);
    }
    return result[0];
}

public type MovieInput record {|
    string title;
    int year;
    string directorId;
|};

public type MovieUpdate record {|
    string title?;
    int year?;
    string directorId?;
|};

public type Movie record {|
    readonly string id;
    *MovieInput;
|};