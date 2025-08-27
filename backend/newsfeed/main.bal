import ballerina/http;
import ballerina/log;
import ballerina/lang.'string as string;

// Set the NewsAPI key in Config.toml (e.g., apiKey="<your API key>")
configurable string apiKey = ?;

// Service-level CORS config to allow all origins
@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}
service /newsfeed on new http:Listener(8083) {

    // GET /news – returns filtered crime news about Sri Lanka with images
    resource function get news() returns json|error {
        log:printInfo("Fetching crime news from NewsAPI");

        // Use a proper client config record for timeout
        http:Client newsApiClient = check new ("https://newsapi.org", { timeout: 60 });

        // Build the query string
        string query = "/v2/everything"
            + "?q=(crime%20OR%20murder%20OR%20robbery%20OR%20assault%20OR%20kidnapping)"
            + "%20AND%20(%22Sri%20Lanka%22%20OR%20Colombo%20OR%20Kandy%20OR%20Galle%20OR%20Jaffna)";
        
        map<string|string[]> headers = { "X-Api-Key": apiKey };

        http:Response|error resp = newsApiClient->get(query, headers);
        if (resp is error) {
            return error("Failed to fetch news: " + resp.message());
        }
        if (resp.statusCode != 200) {
            return error("Failed to fetch news: HTTP " + resp.statusCode.toString());
        }

        json|error jsonResponse = resp.getJsonPayload();
        if (jsonResponse is error) {
            return error("Failed to parse news data");
        }

        json[] filtered = [];
        json payload = <json>jsonResponse;

        if payload is map<json> {
            json articlesField = payload["articles"];
            if (articlesField is json[]) {
                foreach json article in articlesField {
                    if (article is map<json>) {
                        string title = "";
                        string description = "";
                        string image = ""; // New field for the image URL

                        var t = article["title"];
                        if t is string { title = t; }

                        var d = article["description"];
                        if d is string { description = d; }

                        var img = article["urlToImage"]; // Fetch the image URL
                        if img is string { image = img; }

                        // Case-insensitive checks
                        string titleLower = string:toLowerAscii(title);
                        string descLower  = string:toLowerAscii(description);

                        boolean hasCrimeKeyword =
                            string:includes(titleLower, "crime")   || string:includes(descLower, "crime")   ||
                            string:includes(titleLower, "murder")  || string:includes(descLower, "murder")  ||
                            string:includes(titleLower, "robbery") || string:includes(descLower, "robbery") ||
                            string:includes(titleLower, "assault") || string:includes(descLower, "assault") ||
                            string:includes(titleLower, "kidnap")  || string:includes(descLower, "kidnap");

                        if (hasCrimeKeyword) {
                            // Add the image URL along with the other article data
                            json filteredArticle = {
                                "title": title,
                                "description": description,
                                "url": article["url"], // The URL of the article
                                "image": image // Add the image URL here
                            };
                            filtered.push(filteredArticle);
                        }
                    }
                }
            }
        }

        return { articles: filtered };
    }
}
