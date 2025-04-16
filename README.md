# Swagger Enhance Extension

This extension detects Swagger/OpenAPI pages, applies custom styling to improve UI readability, and adds a button to open definitions in Postman.

## Project Structure
```
swagger-enhance/
  ├── manifest.json
  ├── background.js
  ├── content.js
  ├── styles.css
  ├── icons/
  │   ├── icon-16.png
  │   ├── icon-48.png
  │   └── icon-128.png
  └── postman-icon.png
```

## Building and Installing the Extension

In Microsoft Edge:
- Go to `edge://extensions/`
- Enable "Developer mode" (toggle in the bottom-left)
- Click "Load unpacked"
- Select your `swagger-enhance` directory

The extension will now detect Swagger pages and apply the custom styling.