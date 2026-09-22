# Sentinel motion monitor

A dependency-free, browser-based motion detector that uses the device camera. Video stays in the browser; it is not uploaded or recorded.

## Run it

### Windows executable

Double-click `Sentinel.exe`. It starts the built-in local web server and opens the monitor automatically. Keep its command window open while you use the monitor. Copy `Sentinel.exe` together with `index.html`, `app.js`, and `styles.css` when moving Sentinel to another laptop.

### Batch launcher

Double-click `Start-Sentinel.bat`. It opens the monitor at `http://localhost:8080` automatically. Keep the command window it opens running while you use the monitor.

### From PowerShell

Serve this folder over `localhost` (camera APIs require a secure context or localhost), for example:

```powershell
py -m http.server 8080
```

Then visit `http://localhost:8080`, allow camera access, and choose **Start monitoring**. Adjust the sensitivity slider: *High* detects smaller changes, while *Low* filters them out.
