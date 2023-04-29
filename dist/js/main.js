const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const downloadBtn = $(".download-video-btn");
$(".download-video-btn").classList.add("disabled");

$(".download-video-section").scrollIntoView({ behavior: "smooth", block: "start" });
let chunks = [];
let mediaRecorder;

async function setupStream() {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
        });

        setupVideoFeedback(stream);

        return stream;
    } catch (error) {
        console.log(error);
    }
}

function setupVideoFeedback(stream) {
    if (stream) {
        // const videoElement = document.createElement("video");
        // videoElement.srcObject = stream;
        // videoElement.autoplay = true;
        // videoElement.classList.add("w-full");
        // videoElement.classList.add("h-auto");
        // $(".video-feedback").appendChild(videoElement);
        const videoFeedback = $(".video-feedback");
        videoFeedback.srcObject = stream;
        videoFeedback.autoplay = true;
    } else {
        console.warn("Không có stream: ", stream);
    }
}

async function startRecording() {
    const stream = await setupStream();
    stream.getVideoTracks()[0].onended = function () {
        console.log(123);
        stopRecording();
    };
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data);
    };

    mediaRecorder.onstop = handleStop;

    mediaRecorder.start(200);
    $(".download-video-btn").classList.add("disabled");
    $(".start-btn").disabled = true;
    $(".stop-btn").disabled = false;
    return mediaRecorder;
}

function handleStop() {
    const blob = new Blob(chunks, { type: "video/webm" });

    const videoDownload = $(".video-download");
    videoDownload.src = URL.createObjectURL(blob);
    videoDownload.load();
    downloadBtn.href = URL.createObjectURL(blob);
    downloadBtn.download = `recorded-video.webm`;

    chunks = [];

    downloadBtn.classList.remove("disabled");
    $(".start-btn").disabled = false;
    $(".stop-btn").disabled = true;
    console.log("Recording stop .....");
}

function stopRecording() {
    mediaRecorder.stop();
}

$(".start-btn").addEventListener("click", startRecording);
$(".stop-btn").addEventListener("click", stopRecording);
downloadBtn.addEventListener("click", () => {
    if (Array.from(downloadBtn.classList).includes("disabled")) return;
    downloadBtn.classList.add("disabled");
    $(".start-btn").disabled = false;
    $(".stop-btn").disabled = true;
});
