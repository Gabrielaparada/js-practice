const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

// function getVideo(){
//   //this is how you get the video
//   navigator.mediaDevices.getUserMedia({video: true, audio: false})
//   //this will return a promise so we can use .then
//   .then(localMediaStream => {
//    

//      this is deprecated 
//     video.src = window.URL.createObjectURL(localMediaStream);
//     // video.src = window.URL.createObjectURL(localMediaStream) //localmediastream is an object but in order to play the video we need a url so we need to use the method above to convert it into something the video player can understand
//     video.play()
//   })
// }



function getVideo() {
  //this is how you get the video
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      console.log(localMediaStream);

      //  this is deprecated 
//    video.src = window.URL.createObjectURL(localMediaStream) //localmediastream is an   object but in order to play the video we need a url so we need to use the method above to convert it into something the video player can understand
//     video.play()
  
      
      video.srcObject = localMediaStream;
      video.play();
    })
    //Error handling! In case there is any sort of error or someone does not allow you to access their camera
    .catch((err)=>{
      console.error('Noooo!! error!')
    })
  }

  function paintToCanvas(){
    //this will give us the w/h of our video
    const width = video.videoWidth;
    const height = video.videoHeight;
    console.log(width,height)
    //here we are setting the width of our canvas to be the same as our video 
    canvas.width = width;
    canvas.height = height
    //if we return interval because if we ever want to stop painting we have access to clearInterval 
    return setInterval(()=>{
      //drawImage takes an image or video, this will paint it onto the page
      //0,0 refers to top left side of the canvas, so we are basically saying, start from there and the paint the width and the height 
      ctx.drawImage(video, 0, 0, width, height)

      //getting the pixels of the image, this will return a big array of numbers. Those numbers are representative of red,green,blue,alpha
      //1 - get pixels 
      let pixels = ctx.getImageData(0,0,width,height)

      //2 - mess with pixels to achieve fun filters

      // pixels = redEffect(pixels)

      // pixels = rgbSplit(pixels)
      // ctx.globalAlpha = 0.04

      pixels = greeScreen(pixels)
      //3- put pixels back 
      ctx.putImageData(pixels, 0, 0)
    }, 16)
  }

// paintToCanvas()

function takePhoto(){
  //this for the sound
  // snap.currentTime = 0
  // snap.play()
  //taking the photo
  // 1 - take the data out of canvas - this will transform the image into text which we can use as link for the image 
  const data = canvas.toDataURL('image/jpeg')
  //2 - creating a link
  const link = document.createElement('a')
  //3 - set the data as the ref
  link.href = data
  link.setAttribute('download', 'badass')

  //this will allow you to create a download link
  // link.textContent = 'Download image'


  link.innerHTML = `<img src="${data}" alt="portrait"/>`
  strip.insertBefore(link, strip.firstChild)
  console.log(data)
}

function redEffect(pixels){
  for (let i = 0; i < pixels.data.length; i+=4){
    //now we have access to RGBA
    pixels.data[i + 0] = pixels.data[i + 0] + 50  // red
    pixels.data[i + 1] = pixels.data[i + 1] - 50; //green
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //blue
  }
  return pixels;
}

function rgbSplit(pixels){
  for (let i = 0; i < pixels.data.length; i += 4) {
  //reversing the values
  pixels.data[i - 500] = pixels.data[i + 0]  // red
  pixels.data[i + 300] = pixels.data[i + 1]  //green
  pixels.data[i - 250] = pixels.data[i + 2]  //blue
  }
  return pixels
}

function greeScreen(pixels){
  //this is going to hold the minimun and maximun greens
  const levels = {}

  document.querySelectorAll('.rgb input').forEach((input)=> {
    levels[input.name] = input.value
  })

  for (i = 0; i < pixels.data.length; i = i + 4) {
    //we use this to figure out what that RGBA values are
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];
    

    //if the red,green and blue are anywhere in between the min and max value we take those out! the 4th pixel is the alpha, is set to 0 which means transparent
    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;

  console.log(levels)
}
getVideo()

//canplay is what allows the video to play on page load 
video.addEventListener('canplay', paintToCanvas)