let history = [];
let redoStack = []; // Stack for redo functionality

const sizeInput = document.getElementById('size');
const sizeValue = document.getElementById('sizeValue');
sizeInput.addEventListener('input', function() {
    sizeValue.textContent = this.value; // Update the displayed boldness value
});

const colorInput = document.getElementById('color');
const colorValue = document.getElementById('colorValue');
colorInput.addEventListener('input', function() {
    colorValue.textContent = this.value; // Update the displayed color value
});

document.getElementById('clearbtn').addEventListener('click', () => {
    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear');
});

socket.on('clear', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Redo button event listener
document.getElementById('redobtn').addEventListener('click', redo);
document.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key === 'y') { // Ctrl + Y for redo
        redo();
    }
});

// Undo button event listener
document.getElementById('undobtn').addEventListener('click', undo); // Undo button event listener
document.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key === 'z') { // Ctrl + Z for undo
        undo();
    }
});

//save button event listener
document.getElementById('savebtn').addEventListener('click', () => {
    const link = document.createElement('a'); // Create a link element
    link.download = 'Drawing.png'; // Set the download attribute with a filename
    link.href = canvas.toDataURL(); // Convert canvas to data URL and set as href
    link.click(); // Programmatically click the link to trigger download
});

function saveState(){
// Save the current state of the canvas to history
history.push(ctx.getImageData(0,0, canvas.width, canvas.height));
redoStack = [];
}

function undo(){
// Undo the last action by restoring the last saved state
    if(history.length > 0){
        const lastState = history.pop(); // Get the last saved state
        redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); // Save the current state to redo stack
        ctx.putImageData(lastState, 0, 0); // Restore the last saved state
    }
}

function redo() {
    // Redo the last undone action by restoring the next saved state
    if(redoStack.length > 0){ // Check if there are states to redo
        const nextState = redoStack.pop(); // Get the next saved state
        history.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); // Save the current state to redo stack
        ctx.putImageData(nextState, 0, 0); // Restore the next saved state
    }
}