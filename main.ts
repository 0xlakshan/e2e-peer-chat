const localDescriptionDiv: HTMLDivElement = document.getElementById("localDescription") as HTMLDivElement;
const remoteDescTextArea: HTMLTextAreaElement = document.getElementById("remoteDescription") as HTMLTextAreaElement;
const localIceCandidatesDiv: HTMLDivElement = document.getElementById("localIceCandidates") as HTMLDivElement;
const iceCandidateInput: HTMLInputElement = document.getElementById("iceCandidateInput") as HTMLInputElement;
const messageInput: HTMLInputElement = document.getElementById("messageInput") as HTMLInputElement;
const receivedMessagesDiv: HTMLDivElement = document.getElementById("receivedMessages") as HTMLDivElement;
const statusDiv: HTMLDivElement = document.getElementById("status") as HTMLDivElement;

let pc: RTCPeerConnection;
let dc: RTCDataChannel | undefined;
let isOfferer: boolean = false;

function init(): void {
  pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  pc.onicecandidate = (event: RTCPeerConnectionIceEvent): void => {
    if (event.candidate) {
      localIceCandidatesDiv.innerHTML += `${JSON.stringify(event.candidate)}<br>`;
    }
  };

  pc.oniceconnectionstatechange = (): void => {
    statusDiv.textContent = `ICE state: ${pc.iceConnectionState}`;
  };

  pc.onconnectionstatechange = (): void => {
    statusDiv.textContent = `Connection state: ${pc.connectionState}`;
  };

  pc.ondatachannel = (event: RTCDataChannelEvent): void => {
    dc = event.channel;
    setupDataChannel();
  };
}

function setupDataChannel(): void {
  if (!dc) return;

  dc.onopen = (): void => {
    statusDiv.textContent = "Data channel open";
  };

  dc.onclose = (): void => {
    statusDiv.textContent = "Data channel closed";
  };

  dc.onmessage = (event: MessageEvent): void => {
    receivedMessagesDiv.innerHTML += `${event.data}<br>`;
  };
}

async function createOffer(): Promise<void> {
  if (pc.signalingState !== "stable") return;
  isOfferer = true;
  dc = pc.createDataChannel("chat");
  setupDataChannel();
  try {
    const offer: RTCSessionDescriptionInit = await pc.createOffer();
    await pc.setLocalDescription(offer);
    localDescriptionDiv.textContent = JSON.stringify(pc.localDescription);
  } catch (e: unknown) {
    console.error("Error creating offer:", e);
    statusDiv.textContent = "Error creating offer";
  }
}

async function createAnswer(): Promise<void> {
  if (isOfferer || pc.signalingState !== "have-remote-offer") return;
  try {
    const answer: RTCSessionDescriptionInit = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    localDescriptionDiv.textContent = JSON.stringify(pc.localDescription);
  } catch (e: unknown) {
    console.error("Error creating answer:", e);
    statusDiv.textContent = "Error creating answer";
  }
}

async function setRemoteDescription(): Promise<void> {
  const remoteDescText: string = remoteDescTextArea.value.trim();
  if (!remoteDescText) return;
  try {
    const remoteDesc: RTCSessionDescriptionInit = JSON.parse(remoteDescText);
    await pc.setRemoteDescription(new RTCSessionDescription(remoteDesc));
    if (!isOfferer && pc.signalingState === "have-remote-offer") {
      await createAnswer();
    }
  } catch (e: unknown) {
    console.error("Invalid remote description:", e);
    statusDiv.textContent = "Invalid remote description";
  }
}

async function addIceCandidate(): Promise<void> {
  const candidateText: string = iceCandidateInput.value.trim();
  if (!candidateText) return;
  try {
    const candidate: RTCIceCandidateInit = JSON.parse(candidateText);
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
    iceCandidateInput.value = "";
  } catch (e: unknown) {
    console.error("Invalid ICE candidate:", e);
    statusDiv.textContent = "Invalid ICE candidate";
  }
}

function sendMessage(): void {
  if (dc?.readyState === "open") {
    const message: string = messageInput.value.trim();
    if (message) {
      dc.send(message);
      messageInput.value = "";
    }
  } else {
    statusDiv.textContent = "Data channel not open";
  }
}

init();
