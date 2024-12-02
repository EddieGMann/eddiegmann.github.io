function qrcode(url) {
    const canvas = document.getElementById('qrcodecanvas');

    // Ensure the canvas exists
    if (!canvas) {
        alert('Canvas element not found.');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        alert('Failed to get canvas context.');
        return;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate the QR Code
    QRCode.toCanvas(canvas, url, {
        width: canvas.width,
        height: canvas.height,
        errorCorrectionLevel: 'H', // High error correction
    }).then(() => {
        console.log('QR Code generated successfully.');

        // Add an empty circle in the middle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 50; // Radius of the circle

        // Clear a circular area in the middle
        ctx.save(); // Save the current state
        ctx.globalCompositeOperation = 'destination-out'; // Cut out the circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore(); // Restore the canvas state to avoid affecting future drawings
    })
}

document.getElementById('generateButton').addEventListener('click', function () {
    const url = document.getElementById('urlInput').value.trim();

    if (!url) {
        alert('Please enter a URL.');
        return;
    }

    try {
        // Validate URL format
        const validatedUrl = new URL(url);
        qrcode(validatedUrl.href); // Call the function with the validated URL
    } catch (e) {
        alert('Invalid URL format. Please enter a valid URL starting with http:// or https://');
        console.error('URL validation error:', e);
    }
});
