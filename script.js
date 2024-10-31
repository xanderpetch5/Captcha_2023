class Captcha { // a class which defines my captcha images (each canvas and their bahviour)
    constructor(id, image) {
        this.id = id;
        this.canvas = document.getElementById(this.id);
        this.WIDTH = this.canvas.width;
        this.HEIGHT = this.canvas.height;
        this.selected = false;
        this.image = image;

        this.boundToggleSelection = this.toggleSelection.bind(this); //this is to make sure the event is removed properly

        this.canvas.addEventListener('click', this.boundToggleSelection, false); // add click checker
        this.drawImage(); // draws whichever image is selected
    }

    toggleSelection() {
        this.selected = !this.selected;
        this.drawClicked(175, 85, 10);
    }

    drawImage() {
        if (this.image === 'snow') {
            this.drawSnow(this.WIDTH / 2, this.HEIGHT / 2, this.WIDTH / 5, 6);
        } else if (this.image === 'sun') {
            this.drawSun(this.WIDTH / 2, this.HEIGHT / 2, this.WIDTH / 6.5, 25, this.WIDTH / 20);
        }
    }

    drawClicked(x, y, radius) { // behaviour when is clicked
        let ctx = this.canvas.getContext("2d");
        if (this.selected) {
            ctx.beginPath();
            ctx.strokeStyle = '#FF5555';
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#FF0000';
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        } else {
            ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
            // only redraw the image if the canvas is being deselected
            if (this.image == 'snow') {
                this.drawSnow(this.WIDTH / 2, this.HEIGHT / 2, this.WIDTH / 5, 6);
            }
            else if (this.image == 'sun') {
                this.drawSun(this.WIDTH / 2, this.HEIGHT / 2, this.WIDTH / 6.5, 25, this.WIDTH / 20);
            }
        }
    }
    

    drawSun(x, y, radius, numRays, rayLength) { //draws a sun
        let ctx = this.canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        for (let i = 0; i < numRays; i++) {
            let angle = (Math.PI * 2) * (i / numRays);
            let rayX = x + Math.cos(angle) * (radius + rayLength);
            let rayY = y + Math.sin(angle) * (radius + rayLength);
            ctx.moveTo(x, y);
            ctx.lineTo(rayX, rayY);
        }
        ctx.stroke();
    }
    drawSnow(x, y, radius, numPoints) { // draws a snowflake
        let ctx = this.canvas.getContext("2d");
        ctx.beginPath();
        for (let i = 0; i < numPoints * 2; i++) {
            let angle = Math.PI * i / numPoints;
            let dist = i % 2 === 0 ? radius : radius / 2;
            let snowX = x + Math.cos(angle) * dist;
            let snowY = y + Math.sin(angle) * dist;
            ctx.lineTo(snowX, snowY);
        }
        ctx.fillStyle = '#99ccff'
        ctx.fill();
        ctx.closePath();
    }
    getSelected() {
        return this.selected;
    }
    getImage() {
        return this.image;
    }
    clearCanvas() { // clears canvas
        let canvas = document.getElementById(this.id);
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    removeClickListener() { // even thought the canvas can be reset, and the canvas list, the event listener still exists, so need to remove it
        this.canvas.removeEventListener('click', this.boundToggleSelection, false);
    }
    
}



function drawMessage(id, isSuccess) { // behaviour for the result image
    let c = document.getElementById(id);
    let ctx = c.getContext("2d");

    if (isSuccess) {
        // draw a green smiley face when successful
        ctx.beginPath();
        ctx.arc(50, 50, 30, 0, Math.PI * 2, true);
        ctx.moveTo(65, 50);
        ctx.arc(50, 50, 15, 0, Math.PI, false);  
        ctx.moveTo(45, 45);
        ctx.arc(40, 45, 5, 0, Math.PI * 2, true);  
        ctx.moveTo(65, 45);
        ctx.arc(60, 45, 5, 0, Math.PI * 2, true);  
        ctx.strokeStyle = "#008000";
        ctx.stroke();
    } else {
        // draw a red frowny face when failing
        ctx.beginPath();
        ctx.arc(50, 50, 30, 0, Math.PI * 2, true); 
        ctx.moveTo(35, 65);
        ctx.arc(50, 65, 15, Math.PI, 0, false); 
        ctx.moveTo(45, 45);
        ctx.arc(40, 45, 5, 0, Math.PI * 2, true);  
        ctx.moveTo(65, 45);
        ctx.arc(60, 45, 5, 0, Math.PI * 2, true); 
        ctx.strokeStyle = "#FF0000";
        ctx.stroke();
    }
    
    
    
}


function submitClicked(correctImage) { // behaviour when submit is clicked
    if (isCaptchaDone) return;

    let resultText = document.getElementById("result");
    resultText.textContent = "";

    if (isSelectionCorrect(canvasList, correctImage)) {
        resultText.innerText += " CORRECT";
        drawMessage('resultCanvas', true);
        isCaptchaDone = true;
    } else {
        handleIncorrectSelection();
    }
}

function isSelectionCorrect(arr, correctImage) { // returns true if the correct captcha images are selected and false otherwise
    let clickedList = getClickedList(arr);
    let correctList = getCorrectList(arr, correctImage);
    return JSON.stringify(clickedList) === JSON.stringify(correctList);
}

function handleIncorrectSelection() { // behaviour for incorrect choice
    tries++;
    let resultText = document.getElementById("result");

    if (tries < 2) {
        resultText.innerText += " INCORRECT. Try again. Select all the grid cells that contain a " + correctImage;
        reset();
    } else { // decides incorrect final result
        resultText.innerText += " INCORRECT. You have exhausted your opportunities.";
        drawMessage('resultCanvas', false);
        isCaptchaDone = true;
    }
}

function getCorrectList(arr, correctImage) { // returns boolean array of which captchas should be selected for a correct result
    let correctList = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].image == correctImage) { correctList.push(true); }
        else { correctList.push(false); }
    }
    return correctList;
}

function shuffleArray(arr) { // shuffles an array making it random every time
    let newArray = [...arr];
    for (let i = newArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}


function getClickedList(arr) { // returns boolean array of which captcha images are selected
    let clickedList = [];
    for (let i = 0; i < arr.length; i++) {
        clickedList.push(arr[i].getSelected());
    }
    return clickedList;

}

 
function reload(){ // reloads page
    location.reload();
}


let images = ['sun', 'snow'];
let canvasList = [];
let correctImage = images[Math.floor(Math.random() * images.length)]; // chooses correct image
let correctList = [];
let isCorrect = true;
let selectedImage = '';
let h2 = document.getElementById('selectText');
let tries = 0;
let isCaptchaDone = false;

switch (correctImage) {
    case ("snow"): h2.innerText += " snowflakes"; break;
    case ("sun"): h2.innerText += " images of suns"; break;
    default: h2.innerText += "ERROR"; break;
}



function reset(){ // resets canvases and puts new images up
    for (let i = 0; i < canvasList.length; i++) {
        canvasList[i].clearCanvas();
        canvasList[i].removeClickListener();
    }

    canvasList = [];

    images = ['sun', 'snow'];

    for (let i = 2; i < 5; i++) {
        images[i] = images[Math.floor(Math.random() * images.length)];
    }

    images = shuffleArray(images);

    for (let i = 0; i < 5; i++) {
        let id = 'canvas' + (i + 1);
        canvasList.push(new Captcha(id, images[i]));
    }
}


reset(); //starts program