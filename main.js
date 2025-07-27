const localDescriptionDiv = document.getElementById("localDescription");
const remoteDescTextArea = document.getElementById("remoteDescription");
const localIceCandidatesDiv = document.getElementById("localIceCandidates");
const iceCandidateInput = document.getElementById("iceCandidateInput");
const messageInput = document.getElementById("messageInput");
const receivedMessagesDiv = document.getElementById("receivedMessages");
const statusDiv = document.getElementById("status");

let pc;
let dc;
let isOfferer = false;

// init connection
function init() {
  pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      localIceCandidatesDiv.innerHTML +=
        JSON.stringify(event.candidate) + "<br>";
    }
  };
  pc.ondatachannel = (event) => {
    dc = event.channel;
    setupDataChannel();
  };
}

function setupDataChannel() {
  dc.onopen = () => {
    statusDiv.textContent = "Data channel open";
  };
  dc.onmessage = (event) => {
    receivedMessagesDiv.innerHTML += event.data + "<br>";
  };
}

async function createOffer() {
  isOfferer = true;
  dc = pc.createDataChannel("chat");
  setupDataChannel();
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  localDescriptionDiv.textContent = JSON.stringify(pc.localDescription);
}

async function createAnswer() {
  if (isOfferer) {
    alert("You are the offerer, cannot create answer.");
    return;
  }
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  localDescriptionDiv.textContent = JSON.stringify(pc.localDescription);
}

async function setRemoteDescription() {
  const remoteDescText = remoteDescTextArea.value;
  try {
    const remoteDesc = JSON.parse(remoteDescText);
    await pc.setRemoteDescription(new RTCSessionDescription(remoteDesc));
  } catch (e) {
    alert("Invalid remote description");
  }
}

async function addIceCandidate() {
  const candidateText = iceCandidateInput.value;
  try {
    const candidate = JSON.parse(candidateText);
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
    iceCandidateInput.value = "";
  } catch (e) {
    alert("Invalid ICE candidate");
  }
}

function sendMessage() {
  if (dc && dc.readyState === "open") {
    const message = messageInput.value;
    dc.send(message);
    messageInput.value = "";
  } else {
    alert("Data channel is not open.");
  }
}

init();
