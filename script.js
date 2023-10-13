const video = document.getElementById('video');
startVideo();
function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

function captureImage()
{
  let canvas = document.getElementById("forcapture");
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  let image_data_url = canvas.toDataURL('image/jpeg');
  canvas.style.display = 'none';
  // data url of the image
  const imgTarget = document.getElementById('myImg');
  imgTarget.setAttribute('src', image_data_url)
  imgTarget.style.display = '';
}
function startDetection(){
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.loadSsdMobilenetv1Model('/models')
]).then(startVideo)



video.addEventListener('play', async () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)

  const input = document.getElementById('myImg')
  const imageDetect = await faceapi.detectSingleFace(input, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

  setInterval(async () => {
    const innerHTML = document.getElementById('status');
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()
    // console.log(detections.length)
    if(detections.length > 1){
        innerHTML.innerHTML =`<p style="font-weight: bold; color: red;">There Are Two Faces Detected</p>`
    }else{
      try{
        const faceMatcher = new faceapi.FaceMatcher(detections)
        const bestMatch = faceMatcher.findBestMatch(imageDetect.descriptor)
        const bMatch = bestMatch.toString();
        innerHTML.innerHTML =  `<p style="font-weight: bold; color: green;">${bMatch}</p>`
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      }catch(e){
        innerHTML.innerHTML = `<p style="font-weight: bold; color: red;">Hand or something covered your face, or you are out of frame</p>`;
        // console.log(e)
      }
    }
    
  }, 100)
})
}