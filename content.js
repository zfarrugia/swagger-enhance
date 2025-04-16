﻿// Flag to track if we've already processed this page
let swaggerProcessed = false;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "checkSwagger" && !swaggerProcessed) {
        detectSwagger();
    }
});

// Also check on page load
document.addEventListener('DOMContentLoaded', () => {
    detectSwagger();
});

// Check again after a short delay to catch dynamically loaded Swagger UIs
setTimeout(() => {
    detectSwagger();
}, 1500);

function detectSwagger() {
    // Detect if current page is a Swagger UI page
    const isSwagger =
        document.querySelector('.swagger-ui') !== null ||
        document.querySelector('[data-name="SwaggerUI"]') !== null ||
        document.querySelector('#swagger-ui') !== null ||
        document.title.toLowerCase().includes('swagger') ||
        document.title.toLowerCase().includes('api documentation');

    if (isSwagger && !swaggerProcessed) {
        console.log("Swagger UI detected - applying enhancements");
        applySwaggerEnhancements();
        swaggerProcessed = true;
    }
}

function applySwaggerEnhancements() {
    // Apply custom styling
    applyCustomStyling();

    // Add Postman integration button
    addPostmanButton();

    // Watch for dynamic content changes in Swagger UI
    observeSwaggerChanges();
}

function applyCustomStyling() {
    // Add a class to the body for our custom CSS to target
    document.body.classList.add('swagger-enhance-extension');

    // For any elements that might be added dynamically, we'll also add inline styles
    // Specifically target JSON/response areas
    const targetSelectors = [
        '.swagger-ui .highlight-code',
        '.swagger-ui .responses-wrapper',
        '.swagger-ui pre',
        '.swagger-ui .response',
        '.swagger-ui .body-param__text',
        '.swagger-ui .model-example'
    ];

    targetSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style.maxHeight = '500px';
            el.style.overflowY = 'scroll';
        });
    });
}

function addPostmanButton() {
    // First, try to find the OpenAPI/Swagger definition URL
    let definitionUrl = findDefinitionUrl();

    if (!definitionUrl) {
        console.log("Could not find definition URL");
        return;
    }

    // Create Postman button
    const postmanButton = document.createElement('div');
    postmanButton.className = 'postman-import-button';
    postmanButton.innerHTML = `
    <a href="https://app.getpostman.com/run-collection/import?collection=${encodeURIComponent(definitionUrl)}" 
       target="_blank" 
       title="Import into Postman">
      <img src="${chrome.runtime.getURL('postman-icon.png')}" alt="Postman" />
      Import to Postman
    </a>
  `;

    // Insert button in Swagger UI header
    const header = document.querySelector('.swagger-ui .topbar') ||
        document.querySelector('.swagger-ui .information-container') ||
        document.querySelector('.swagger-ui');

    if (header) {
        header.style.position = 'relative'; // Ensure we can position our button
        header.appendChild(postmanButton);
    }
}

function findDefinitionUrl() {
    // Try various methods to find the Swagger/OpenAPI definition URL

    // Method 1: Look for explicitly defined URL in script tags or variables
    const scripts = document.querySelectorAll('script:not([src])');
    let definitionUrl = null;

    for (const script of scripts) {
        const text = script.textContent;

        // Look for common patterns in Swagger initialization
        const urlMatch = text.match(/url\s*:\s*["']([^"']+)["']/);
        if (urlMatch && (urlMatch[1].endsWith('.json') || urlMatch[1].endsWith('.yaml') || urlMatch[1].endsWith('.yml'))) {
            definitionUrl = urlMatch[1];
            break;
        }

        // Look for spec URL patterns
        const specMatch = text.match(/spec\s*:\s*["']([^"']+)["']/);
        if (specMatch && (specMatch[1].endsWith('.json') || specMatch[1].endsWith('.yaml') || specMatch[1].endsWith('.yml'))) {
            definitionUrl = specMatch[1];
            break;
        }
    }

    // Method 2: Check for common API definition paths
    if (!definitionUrl) {
        const currentUrl = new URL(window.location.href);
        const possiblePaths = [
            '/swagger/v1/swagger.json',
            '/api-docs/swagger.json',
            '/swagger/docs/v1',
            '/api/swagger.json',
            '/openapi.json',
            '/swagger.json'
        ];

        for (const path of possiblePaths) {
            const fullUrl = `${currentUrl.origin}${path}`;

            // We can't directly check if these URLs exist due to CORS,
            // but we can use this as a fallback option
            definitionUrl = fullUrl;
            break;
        }
    }

    // Method 3: Try to extract from link elements or other sources
    if (!definitionUrl) {
        const linkElement = document.querySelector('link[rel="swagger"], link[type="application/json"], link[type="application/yaml"]');
        if (linkElement && linkElement.href) {
            definitionUrl = linkElement.href;
        }
    }

    // Convert relative URL to absolute if needed
    if (definitionUrl && !definitionUrl.startsWith('http')) {
        const base = window.location.origin;
        definitionUrl = new URL(definitionUrl, base).href;
    }

    return definitionUrl;
}

function observeSwaggerChanges() {
    // Create a mutation observer to watch for changes in the Swagger UI
    // This ensures our styles are applied to dynamically loaded content
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // If new nodes were added, check if they're Swagger components
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === 1) { // Element node
                        // Check if this is a Swagger response or code area
                        if (node.classList &&
                            (node.classList.contains('highlight-code') ||
                                node.classList.contains('responses-wrapper') ||
                                node.classList.contains('body-param__text') ||
                                node.classList.contains('model-example'))) {
                            // Apply our styles
                            node.style.maxHeight = '500px';
                            node.style.overflowY = 'scroll';
                        }

                        // Also check children
                        const elements = node.querySelectorAll('.highlight-code, .responses-wrapper, pre, .response, .body-param__text, .model-example');
                        elements.forEach(el => {
                            el.style.maxHeight = '500px';
                            el.style.overflowY = 'scroll';
                        });
                    }
                }
            }
        });
    });

    // Start observing the entire document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}