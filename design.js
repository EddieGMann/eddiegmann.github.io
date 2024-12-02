<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code on Canvas</title>
    <style>
        canvas {
            border: 1px solid #000;
        }
    </style>
</head>
<body>
    <h1>Generate QR Code on Canvas</h1>
    <label for="urlInput">Enter URL:</label>
    <input type="text" id="urlInput" placeholder="https://example.com">
    <button id="generateButton">Generate QR Code</button>
    <br><br>
    <canvas id="qrcodecanvas" width="250" height="250"></canvas>

    <!-- Include the QR Code Library -->
    <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
    <!-- Link to external JavaScript -->
    <script src="script.js"></script>
</body>
</html>

