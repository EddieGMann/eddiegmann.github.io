function qrcode(url, imageSource) {
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

        // If an image source is provided, draw it in the circle
        if (imageSource) {
            const img = new Image();
            img.onload = function () {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = 50; // Circle radius
                const imageSize = radius * 1.3; // Ensure the image fits within the circle

                // Clip the canvas to the circle
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                // Draw the image
                ctx.drawImage(
                    img,
                    centerX - radius * .2,
                    centerY - radius * .2,
                    imageSize,
                    imageSize
                );

                ctx.restore(); // Restore the canvas state to remove clipping
            };
            img.src = imageSource; // Set the image source
        }
    })
}

document.getElementById('generateButton').addEventListener('click', function () {
    const url = document.getElementById('urlInput').value.trim();
    const imageOptions = document.getElementById('imageOptions');
    const imageInput = document.getElementById('imageInput');
    let imageSource = null;

    if (!url) {
        alert('Please enter a URL.');
        return;
    }

    // Determine the image source
    switch (imageOptions.value) {
        case 'image1':
            imageSource = 'images/CRTP_FullColor_RGB.jpg'; // Replace with actual image URL or path
            break;
        case 'image2':
            imageSource = 'path/to/image2.png'; // Replace with actual image URL or path
            break;
        case 'image3':
            imageSource = 'path/to/image3.png'; // Replace with actual image URL or path
            break;
        case 'none':
            imageSource = null; // No image selected
            break;
        default:
            alert('Invalid image selection.');
            return;
    }

    // If a custom image is uploaded, override the dropdown selection
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            qrcode(url, event.target.result); // Call the function with the uploaded image data
        };
        reader.readAsDataURL(file);
        return; // Return early to avoid calling `qrcode` again
    }

    // Validate URL format
    try {
        const validatedUrl = new URL(url);
        qrcode(validatedUrl.href, imageSource); // Call the function with the validated URL and image source
    } catch (e) {
        alert('Invalid URL format. Please enter a valid URL starting with http:// or https://');
        console.error('URL validation error:', e);
    }
});
