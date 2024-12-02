function qrcode(url, imageFile) {
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

        // If an image file is provided, draw it in the circle
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const radius = 50; // Circle radius
                    const imageSize = radius * 2; // Ensure the image fits within the circle

                    // Clip the canvas to the circle
                    ctx.save(); // Save the current canvas state
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip(); // Only draw inside the circle

                    // Draw the image, scaled to fit the circle
                    ctx.drawImage(
                        img,
                        centerX - radius,
                        centerY - radius,
                        imageSize,
                        imageSize
                    );

                    ctx.restore(); // Restore the canvas state to remove clipping
                };
                img.src = event.target.result; // Set the image source to the file data
            };
            reader.readAsDataURL(imageFile); // Read the image file
        }
    })
}

document.getElementById('generateButton').addEventListener('click', function () {
    const url = document.getElementById('urlInput').value.trim();
    const imageInput = document.getElementById('imageInput');
    const imageFile = imageInput.files[0]; // Get the uploaded file

    if (!url) {
        alert('Please enter a URL.');
        return;
    }

    try {
        // Validate URL format
        const validatedUrl = new URL(url);
        qrcode(validatedUrl.href, imageFile); // Call the function with the validated URL and image file
    } catch (e) {
        alert('Invalid URL format. Please enter a valid URL starting with http:// or https://');
        console.error('URL validation error:', e);
    }
});
