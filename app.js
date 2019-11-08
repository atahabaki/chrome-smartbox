const x = {
    "youtube": "https://www.youtube.com/results?search_query=",
    "google": "https://www.google.com/search?q=",
    "bing": "https://www.bing.com/search?q=",
    "duckduckgo": "https://duckduckgo.com/?q=",
    "seslisozluk": "https://www.seslisozluk.net/",
    "yahoo": "https://search.yahoo.com/?q=",
    "torroyun": "https://www.torrentoyunindir.com/?s=",
    "yandex": "https://yandex.com.tr/search/?text=",
    "allitebooks": "http://www.allitebooks.org/?s=",
    "iconfinder":"https://www.iconfinder.com/search/?q="
}
function createURL(text, query) {
    if (x[text] != undefined) {
        return `${x[text]}${query}`;
    }
    else {
        return `${text}${query}`;
    }
}
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
    disposition = "currentTab";
    var arr, site, query;
    arr = text.split(' ');
    if (arr.length > 1) {
        site = arr[0].toLowerCase().trim();
        arr.shift();
        query = arr.join(" ").trim();
        chrome.tabs.update({
            url: createURL(site, query)
        });
    }
});
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    var arr, site, query;
    arr = text.split(' ');
    if (arr.length > 1) {
        site = arr[0].toLowerCase().trim();
        arr.shift();
        query = arr.join(" ").trim();

        if (x[site] != undefined) {
            suggest([
                { content: `${x[site]}${query}`, description: `Search on ${site} for ${query}` }
            ]);
        }
        else {
            suggest([
                { content: `http://${site} ${query}`, description: `Search on ${site} for ${query}` },
                { content: `http://${site}.com/ ${query}`, description: `Search on ${site}.com/ for ${query}` },
                { content: `http://${site}.net/ ${query}`, description: `Search on ${site}.net/ for ${query}` },
                { content: `http://${site}.org/ ${query}`, description: `Search on ${site}.org/ for ${query}` },
            ]);
        }
    }
});