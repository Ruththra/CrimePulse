import ballerina/http;
import ballerina/log;
import ballerina/lang.'string as string;

// Set the NewsAPI key in Config.toml (e.g., apiKey="<your API key>")
configurable string apiKey = ?;

// Service-level CORS config to allow all origins:contentReference[oaicite:2]{index=2}.
@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}
service /newsfeed on new http:Listener(8081) {

    // GET /news – returns filtered crime news about Sri Lanka
    resource function get news() returns json|error {
        log:printInfo("Fetching crime news from NewsAPI");

        // Use a proper client config record for timeout
        http:Client newsApiClient = check new ("https://newsapi.org", { timeout: 60 });

        // CHANGE 1: Use /v2/everything with a boolean query + local domains (optional).
        // Tip: if results are empty, remove the &domains=... part first.
        string query = "/v2/everything"
            + "?q=(crime%20OR%20murder%20OR%20robbery%20OR%20assault%20OR%20kidnapping)"
            + "%20AND%20(%22Sri%20Lanka%22%20OR%20Colombo%20OR%20Kandy%20OR%20Galle%20OR%20Jaffna)";
            //+ "&language=en&sortBy=publishedAt&pageSize=50";
            //+ "&domains=newsfirst.lk,adaderana.lk,dailymirror.lk,dailynews.lk,sundaytimes.lk,colombopage.com";

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

        // it since the query already filters; keeping it double-checks relevance).
        json[] filtered = [];
        json payload = <json>jsonResponse;

        if payload is map<json> {
            json articlesField = payload["articles"];
            if (articlesField is json[]) {
                foreach json article in articlesField {
                    if article is map<json> {
                        string title = "";
                        string description = "";

                        var t = article["title"];
                        if t is string { title = t; }

                        var d = article["description"];
                        if d is string { description = d; }

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
                            filtered.push(article);
                        }
                    }
                }
            }
        }

        return { articles: filtered };
    }

}
