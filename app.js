
const canvas = document.getElementById('dcanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let isErasing = false;

const socket = io('http://localhost:3000'); // Connect to the server

canvas.addEventListener( 'mousedown', startDrawing);
canvas.addEventListener( 'mousemove', draw);
canvas.addEventListener( 'mouseup', stopDrawing);
canvas.addEventListener( 'mouseout', stopDrawing);

document.getElementById('eraserbtn').addEventListener('click', () => {
    isErasing = !isErasing; // Toggle eraser mode
    document.getElementById('eraserbtn').classList.toggle('active', isErasing)
    document.getElementById('eraserbtn').textContent = isErasing ? 'Eraser On' : 'Eraser Off'; // Update button text
    ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
});

const eraserSizeInput = document.getElementById('eraserSize');
const eraserSizeValue = document.getElementById('eraserSizeValue');
eraserSizeInput.addEventListener('input', function() {
    eraserSizeValue.textContent = this.value; // Update the displayed eraser size value
});

function resizecanvas() {
    canvas.width = window.innerWidth * .8; // 80% of the window width
    canvas.height = window.innerHeight * .8; // 80% of the window height
}

resizecanvas(); // Initial resize
window.addEventListener('resize', resizecanvas); // Resize on window resize

function startDrawing(e) {
    // Save the current state before starting to draw
    saveState(); // Save the current state of the canvas
    isDrawing = true;
    draw(e); // Call draw once to start the line immediately
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isErasing) {
        ctx.lineWidth = document.getElementById('eraserSize').value;
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.lineWidth = document.getElementById('size').value;
        ctx.lineCap = 'round';
        ctx.strokeStyle = document.getElementById('color').value;
        ctx.globalCompositeOperation = 'source-over';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Emit drawing data to the server
    socket.emit('draw', {
        x,
        y,
        isErasing,
        lineWidth: isErasing
            ? document.getElementById('eraserSize').value
            : document.getElementById('size').value,
        strokeStyle: document.getElementById('color').value,
    });
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath(); // Reset the path to avoid connecting lines
}

socket.on('draw', (data) => {
    ctx.lineWidth = data.lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = data.isErasing ? 'rgba(0,0,0,0)' : data.strokeStyle;
    ctx.globalCompositeOperation = data.isErasing ? 'destination-out' : 'source-over';

    ctx.lineTo(data.x, data.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);
});