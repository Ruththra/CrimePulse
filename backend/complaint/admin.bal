import ballerina/http;
import ballerina/log;

// Simple service running on localhost:9090
service /hello on new http:Listener(9090) {

    resource function get greet() returns string {
        log:printInfo("Endpoint /hello/greet was called");
        return "Hello from another Ballerina service!";
    }
}
