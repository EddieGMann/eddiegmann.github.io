function qrcode(url) {
    const canvas = document.getElementById('qrcodecanvas');

    // Clear the canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    QRCode.toCanvas(canvas, url, {
        width: canvas.width,
        height: canvas.height,
        errorCorrectionLevel: 'H', // High error correction
    }).then(() => {
        console.log('QR Code generated successfully.');
    }).catch((error) => {
        console.error(error);
        alert('Failed to generate QR code.');
    });
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
        alert('Invalid URL format. Please enter a valid URL starting with http:// or



