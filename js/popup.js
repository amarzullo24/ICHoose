chrome.storage.local.get(["tags"], function(items){
  
  // retrieve wheel options (if previously stored)
  let tags = [];
  if ("tags" in items) {
    tags = items["tags"];
    tagsInput = document.getElementById('tagsinput');
    tagsInput.value = tags.join(',')
  }

  // everything begins
  document.addEventListener('DOMContentLoaded', function () {

    // Set up the canvas
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
  
    // Set the dimensions of the canvas
    const width = canvas.width;
    const height = canvas.height;
  
    // Set the center point of the wheel
    const centerX = width / 2;
    const centerY = height / 2;
  
    // Set the radius of the wheel
    const radius = 100;
  
    // Set the number of slices
    let numSlices = tags.length;
  
    // Set the angle between slices (in radians)
    let sliceAngle = (2 * Math.PI) / numSlices;
  
    // Set the initial rotation angle (in radians)
    let rotationAngle = 0;
  
    // Set the spin speed (in radians per frame)
    let spinSpeed = 0.1;
  
    // Set the duration of the spin (in seconds)
    const spinDuration = 5;
  
    // Possible Colors
    const colors = ['#F49AC2', '#F5B183', '#F5D76E', '#F5F5DC', '#C5E384', '#9DC2F5', '#B39CD9', '#F5A2A2'];
  
    // Initialize array to store the color of each slice
    let sliceColors = [];
  
    const tagsInput = document.getElementById('tagsinput');
    tagsInput.addEventListener('change', updateWheel);
  
    function updateWheel() {
      tags = []
      tags = tagsInput.value.split(',');
      numSlices = tags.length;
      sliceAngle = (2 * Math.PI) / numSlices;
      sliceColors = [];
      drawWheel();
  
      // Save data to storage locally
      chrome.storage.local.set({ "tags": tags }, function(){
        console.log('tags saved');
      });
  
    }
  
    function drawWheel() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < numSlices; i++) {
        const startAngle = rotationAngle + (i * sliceAngle);
        const endAngle = startAngle + sliceAngle;
        let color = colors[i % colors.length];
        sliceColors.push(color);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = color;
        ctx.fill();
  
        // Display text on the slice
        // Calculate the angle of the baricenter of the inner triangle of the slice
        let angle = startAngle + sliceAngle/2;
        // Save the current context state
        ctx.save();
        // Translate the context to the center of the slice
        ctx.translate(centerX + (radius*1/3)*Math.cos(angle), centerY + (radius*1/3)*Math.sin(angle));
        // Rotate the context by -90 degrees
        ctx.rotate(angle);
        // Draw the text vertically
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'middle';
        ctx.fillText(tags[i], 0, 0);
        // Restore the context to the state before the translation and rotation
        ctx.restore();
      }
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius / 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#8c8c8c";
      ctx.fill();
    }
  
    function spinWheel() {
      drawWheel();
      rotationAngle = rotationAngle + spinSpeed;
    }
  
    drawWheel();
  
    let animationId;
    let startTime;
  
    // Spin the wheel when the button is clicked
    document.getElementById('spin-button').addEventListener('click', function () {
      if (!animationId) {
        startTime = Date.now();
        animationId = setInterval(spinWheel, 1000 / 60); // 60 fps
      }
    });
  
    // Stop the wheel after a certain amount of time
    setInterval(function () {
      if (animationId) {
        const elapsedTime = (Date.now() - startTime) / 1000;
  
        if (elapsedTime > spinDuration) {
          clearInterval(animationId);
          animationId = null;
          spinSpeed = 0;
  
        } else {
          // Slow down the wheel as it approaches the end of the spin
          spinSpeed = 0.1 * (1 - (elapsedTime / spinDuration));
        }
      }
    }, 1000 / 60); // 60 fps
  
  })

});