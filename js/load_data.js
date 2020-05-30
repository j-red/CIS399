/**
* Requests the file and executes a callback with the parsed result once
* it is available
* @param {string} path - The path to the file.
* @param {function} callback - The callback function to execute once the result is available
*/
function fetchJSONFile(path, callback) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                let data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
}

/* these functions will be executed as a callback when data parsing is done */
/* Load Instagram data set. */
fetchJSONFile('data/ig_data.json', function(data) {
    populate_ig_dataset(data);
});

/* Load Twitter data set. */
fetchJSONFile('data/tw_data.json', function(data) {
    populate_tw_dataset(data);
});
