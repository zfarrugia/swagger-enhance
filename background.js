// Listen for tab updates to detect Swagger pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if the page is loaded completely
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: checkForSwagger
        });
    }
});

function checkForSwagger() {
    // This function will be injected into the page
    // We'll just send a message back to our content script
    // The content script will handle the actual detection logic
    chrome.runtime.sendMessage({ action: "checkSwagger" });
}