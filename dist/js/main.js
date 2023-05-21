const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const downloadBtn = $(".download-video-btn");
$(".download-video-btn").classList.add("disabled");

$(".download-video-section").scrollIntoView({ behavior: "smooth", block: "start" });
let chunks = [];
let mediaRecorder;

function setupVideoFeedback(stream) {
    if (stream) {
        const videoFeedback = $(".video-feedback");
        videoFeedback.srcObject = stream;
        videoFeedback.autoplay = true;
    } else {
        console.warn("Không có stream: ", stream);
    }
}

async function startRecording() {
    // lấy stream màn hình để quay
    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
    });

    // lắng nghe nếu như tắt stream sẽ tự động stopRecording
    stream.getVideoTracks()[0].onended = function () {
        stopRecording();
    };

    // view ra tag videoFeedback
    setupVideoFeedback(stream);

    // tạo mới đối tượng Recording
    mediaRecorder = new MediaRecorder(stream);

    // lắng nghe sự kiện dữ liệu sẽ lưu dữ liệu vào mảng chunks
    mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data);
    };

    // lắng nghe sự kiện stop Recording
    mediaRecorder.onstop = handleStop;

    // startRecording
    mediaRecorder.start(200);

    const isCheck = Array.from($(".switch_button").classList).includes("switch-check");
    if (isCheck) {
        clock.timeOut = {
            h: +$(".clockH").value,
            m: +$(".clockM").value,
            s: +$(".clockS").value,
        };
        clock.start($(".h"), $(".m"), $(".s"));
    }

    $(".download-video-btn").classList.add("disabled");
    $(".start-btn").disabled = true;
    $(".stop-btn").disabled = false;
    return mediaRecorder;
}

function handleStop() {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const fileName = `recorded-video.webm`;

    const videoDownload = $(".video-download");
    videoDownload.src = url;
    videoDownload.load();
    downloadBtn.href = url;
    downloadBtn.download = fileName;

    chunks = [];

    downloadBtn.classList.remove("disabled");
    $(".start-btn").disabled = false;
    $(".stop-btn").disabled = true;
    downloadBtn.click();

    console.log("Recording stop .....");
}

function stopRecording() {
    mediaRecorder.stop();
}

$(".start-btn").addEventListener("click", function () {
    startRecording();
});
$(".stop-btn").addEventListener("click", function () {
    stopRecording();
    clock.stop();
    clock.reset();
});
downloadBtn.addEventListener("click", () => {
    if (Array.from(downloadBtn.classList).includes("disabled")) return;
    downloadBtn.classList.add("disabled");
    $(".start-btn").disabled = false;
    $(".stop-btn").disabled = true;
});

$(".switch_button").addEventListener("click", function () {
    $(".switch_button").classList.toggle("switch-check");
});

const clock = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    timerId: null,
    timeOut: {
        h: 0,
        m: 0,
        s: 0,
    },
    start: function (elementHour, elementMinute, elementSecond) {
        this.timerId = setInterval(() => {
            this.seconds++;
            if (this.seconds === 60) {
                this.seconds = 0;
                this.minutes++;
            }
            if (this.minutes === 60) {
                this.minutes = 0;
                this.hours++;
            }
            const hour = this.hours.toString().padStart(2, "0");
            const minute = this.minutes.toString().padStart(2, "0");
            const second = this.seconds.toString().padStart(2, "0");
            elementHour.innerText = hour;
            elementMinute.innerText = minute;
            elementSecond.innerText = second;
            // console.log(`${hour}:${minute}:${second}`);
            this.timeOutEnd(hour, minute, second);
        }, 1000);
    },
    reset: function () {
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        console.log("clock reset");
    },
    stop: function () {
        clearInterval(this.timerId);
        this.timerId = null;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        console.log("clock stop");
    },
    timeOutEnd: function (hour, minute, second) {
        const timeCurrent = this.convertToMilliseconds(hour, minute, second);
        const timeEnd = this.convertToMilliseconds(
            this.timeOut.h,
            this.timeOut.m,
            this.timeOut.s
        );
        console.log(timeCurrent, timeEnd);
        if (timeCurrent >= timeEnd) {
            this.stop();
            this.reset();
            stopRecording();
        }
    },
    convertToMilliseconds: function (hours, minutes, seconds) {
        var totalSeconds = +hours * 3600 + +minutes * 60 + +seconds;
        var milliseconds = totalSeconds * 1000;
        return milliseconds;
    },
};
// Bắt đầu đồng hồ đếm thời gian
// clock.start(h, m, s);

// Dừng đồng hồ đếm thời gian
// clock.stop();

// Đặt lại giá trị đồng hồ đếm thời gian về 0
// clock.reset();
