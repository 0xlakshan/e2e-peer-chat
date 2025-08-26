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

function init() {
  pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      localIceCandidatesDiv.innerHTML += `${JSON.stringify(event.candidate)}<br>`;
    }
  };

  pc.oniceconnectionstatechange = () => {
    statusDiv.textContent = `ICE state: ${pc.iceConnectionState}`;
  };

  pc.onconnectionstatechange = () => {
    statusDiv.textContent = `Connection state: ${pc.connectionState}`;
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

  dc.onclose = () => {
    statusDiv.textContent = "Data channel closed";
  };

  dc.onmessage = (event) => {
    receivedMessagesDiv.innerHTML += `${event.data}<br>`;
  };
}

async function createOffer() {
  if (pc.signalingState !== "stable") return;
  isOfferer = true;
  dc = pc.createDataChannel("chat");
  setupDataChannel();
  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    localDescriptionDiv.textContent = JSON.stringify(pc.localDescription);
  } catch (e) {
    console.error("Error creating offer:", e);
    statusDiv.textContent = "Error creating offer";
  }
}

async function createAnswer() {
  if (isOfferer || pc.signalingState !== "have-remote-offer") return;
  try {
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    localDescriptionDiv.textContent = JSON.stringify(pc.localDescription);
  } catch (e) {
    console.error("Error creating answer:", e);
    statusDiv.textContent = "Error creating answer";
  }
}

async function setRemoteDescription() {
  const remoteDescText = remoteDescTextArea.value.trim();
  if (!remoteDescText) return;
  try {
    const remoteDesc = JSON.parse(remoteDescText);
    await pc.setRemoteDescription(new RTCSessionDescription(remoteDesc));
    if (!isOfferer && pc.signalingState === "have-remote-offer") {
      await createAnswer();
    }
  } catch (e) {
    console.error("Invalid remote description:", e);
    statusDiv.textContent = "Invalid remote description";
  }
}

async function addIceCandidate() {
  const candidateText = iceCandidateInput.value.trim();
  if (!candidateText) return;
  try {
    const candidate = JSON.parse(candidateText);
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
    iceCandidateInput.value = "";
  } catch (e) {
    console.error("Invalid ICE candidate:", e);
    statusDiv.textContent = "Invalid ICE candidate";
  }
}

function sendMessage() {
  if (dc?.readyState === "open") {
    const message = messageInput.value.trim();
    if (message) {
      dc.send(message);
      messageInput.value = "";
    }
  } else {
    statusDiv.textContent = "Data channel not open";
  }
}

init();
