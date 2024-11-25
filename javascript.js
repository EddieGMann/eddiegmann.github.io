 // Fetch the nav.html and insert it into the 'navbar' div
fetch('navigationpane.html')
	.then(response => response.text())
	.then(data => {
                document.getElementById('navbar').innerHTML = data;
 });

function docolor() {
	var colbox = document.getElementById("userinputcolor");
	var clrchoice = document.getElementById("clr");
	var color= clrchoice.value;
	colbox.style.backgroundColor = color;

}

function dosquare() {
	var squarebox = document.getElementById("squaresizeslide");
	var szchoice = document.getElementById("sqsldr");
	var size = parseInt(szchoice.value, 10);
	var ctxsq = squarebox.getContext("2d");
	var colbox = document.getElementById("userinputcolor");
	var clrchoice = document.getElementById("clr");
	var color = clrchoice.value;
	ctxsq.clearRect(0,0, squarebox.width, squarebox.height);
	ctxsq.fillStyle = color;
	ctxsq.fillRect(10,10,size,size);

}

let paintcanvas = document.getElementById("userpaint");
let context = paintcanvas.getContext("2d");
let isPainting = false;
let brushColor = "#00BB00";
let brushSize = 10;

// Update brush color when color input changes
function updateColor() {
    brushColor = document.getElementById("paintclr").value;
}

// Update brush size when slider changes
function updateBrushSize() {
    brushSize = parseInt(document.getElementById("brushsldr").value, 10);
}

// Resize canvas and draw border
function canvassize() {
    let width = document.getElementById("setwidth").value;
    let height = document.getElementById("setheight").value;

    if (width > 0 && height > 0) {
        paintcanvas.width = width;
        paintcanvas.height = height;

    } else {
        alert("Please enter valid positive numbers for width and height.");
    }
}

// Start painting when mouse is pressed
function startPaint(e) {
    isPainting = true;
    doPaint(e); // Start painting immediately
}

// Stop painting when mouse is released
function endPaint() {
    isPainting = false;
    context.beginPath(); // Reset the path so each stroke is separate
}

// Draw circles to represent brush strokes on the canvas
function doPaint(e) {
    if (!isPainting) return;

    // Get mouse position within the canvas
	 const rect = paintcanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.fillStyle = brushColor;
    context.beginPath();
    context.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    context.fill();
}

// Event listeners for mouse actions on the canvas
paintcanvas.addEventListener("mousedown", startPaint);
paintcanvas.addEventListener("mouseup", endPaint);
paintcanvas.addEventListener("mousemove", doPaint);
paintcanvas.addEventListener("mouseleave", endPaint); // Stop painting if mouse leaves canvas


function clrcanvas() {
	var dirtycanvas = document.getElementById("userpaint");
	var ctxsq = dirtycanvas.getContext("2d");
	ctxsq.clearRect(0,0, dirtycanvas.width, dirtycanvas.height);

}

let splitstorywords = [];
let currentWordIndex = 0;
let intervalId;
let xPosition = 25; // Starting x position for words
let yPosition = 35; // Starting y position for lines
let lineHeight = 20; // Space between lines

function storyupload() {
    var storywords = document.getElementById("userstorytime").value;
    var storyctx = document.getElementById("userstorycanvas").getContext("2d");
    var canvasWidth = document.getElementById("userstorycanvas").width;

    storyctx.clearRect(0, 0, canvasWidth, document.getElementById("userstorycanvas").height); // Clear previous content

    splitstorywords = storywords.split(" "); // Split the input into words
    currentWordIndex = 0;
    xPosition = 25; // Reset x position
    yPosition = 35; // Reset y position

    if (intervalId) clearInterval(intervalId); // Clear any previous intervals
    intervalId = setInterval(displayNextWord, 500); // Display words every 500ms
}

function displayNextWord() {
    if (currentWordIndex < splitstorywords.length) {
        var storyboard = document.getElementById("userstorycanvas");
        var storyctx = storyboard.getContext("2d");

        storyctx.font = "20px Arial";
        storyctx.fillStyle = "blue";

        // Get the current word
        var word = splitstorywords[currentWordIndex];

        // Measure the width of the word
        var wordWidth = storyctx.measureText(word).width;

        // Check if the word exceeds the canvas width
        if (xPosition + wordWidth > storyboard.width - 10) {
            // If the word doesn't fit, move to the next line
            xPosition = 25; // Reset to starting x position
            yPosition += lineHeight; // Move to the next line
        }

        // Display the word at the current position
        storyctx.fillText(word, xPosition, yPosition);

        // Update x position for the next word
        xPosition += wordWidth + 10; // Add some space between words

        currentWordIndex++;
    } else {
        clearInterval(intervalId); // Stop the interval when all words are displayed
    }
}




function clearstoryboard(){
	var dirtystoryboard = document.getElementById("userstorycanvas");
	var dirtystoryboardctx = dirtystoryboard.getContext("2d");
	
	dirtystoryboardctx.clearRect(0,0, dirtystoryboard.width, dirtystoryboard.height);
}

function storyoutloud(){
	var outloudwords = document.getElementById("userstorytime").value;
	// Check if the browser supports SpeechSynthesis
            if ('speechSynthesis' in window) {
                // Create a new speech synthesis utterance
                var outloud = new SpeechSynthesisUtterance(outloudwords);
                
                // Set properties of the voice if desired
                outloud.rate = 1;  // Speed of speech
                outloud.pitch = 1; // Pitch of speech

                // Speak the text
                window.speechSynthesis.speak(outloud);
            } else {
                alert("Sorry, your browser does not support text-to-speech.");
            }
        }

    
function userPhotoUpload() {
    var sentphoto = document.getElementById("photofileinput");
    var photocanvas = document.getElementById("userphotoinput");
    var uploadedFile = sentphoto.files[0]; // Access the file

    if (!uploadedFile) {
        alert("No file chosen!");
        return;
    }

    var uploadedPhotoName = uploadedFile.name;
    alert("Chose " + uploadedPhotoName);

    var maxWidth = 800;  // Max width for the canvas
    var maxHeight = 600; // Max height for the canvas

    var reader = new FileReader();
    reader.onload = function(event) {
        var img = new Image();
        img.onload = function() {
            var imgWidth = img.width;
            var imgHeight = img.height;

            // Scale image to fit within maxWidth and maxHeight while maintaining aspect ratio
            var scaleFactor = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);

            // Calculate the new width and height of the image
            var newWidth = imgWidth * scaleFactor;
            var newHeight = imgHeight * scaleFactor;

            // Resize the canvas to fit the scaled image
            photocanvas.width = newWidth;
            photocanvas.height = newHeight;

            var context = photocanvas.getContext("2d");

            // Clear the canvas
            context.clearRect(0, 0, photocanvas.width, photocanvas.height);

            // Draw the image onto the resized canvas
            context.drawImage(img, 0, 0, newWidth, newHeight);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(uploadedFile);
}


















