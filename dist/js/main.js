const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
let chunks = [];
let mediaRecorder;

async function setupStream() {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
        });
        setupVideoFeedback(stream);
        // console.log({ stream, audio });
        // return { stream, audio };
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
    // const { stream, audio } = await setupStream();
    const stream = await setupStream();
    // mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data);
    };

    mediaRecorder.onstop = handleStop();

    mediaRecorder.start(200);
    $(".start-btn").disabled = true;
    $(".stop-btn").disabled = false;
    return mediaRecorder;
}

function handleStop() {
    const blob = new Blob(chunks, { type: "video/mp4" });
    chunks = [];

    const downloadBtn = $(".download-video-btn");
    downloadBtn.href = URL.createObjectURL(blob);
    downloadBtn.download = "screen-recording.mp4";
    downloadBtn.disabled = false;

    const videoDownload = $(".video-download");
    videoDownload.src = URL.createObjectURL(blob);
    videoDownload.load();
    videoDownload.onloadedata = () => {
        const sectionDownloadVideo = $(".download-video-section");
        sectionDownloadVideo.classList.remove("hidden");
        sectionDownloadVideo.scrollIntroView({ behavior: "smooth", block: "start" });
    };
}

function stopRecording() {
    mediaRecorder.stop();
    $(".start-btn").disabled = false;
    $(".stop-btn").disabled = true;
    console.log("Recording stop .....");
}

$(".start-btn").addEventListener("click", startRecording);
$(".stop-btn").addEventListener("click", stopRecording);
