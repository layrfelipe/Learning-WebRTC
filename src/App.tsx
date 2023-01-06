import { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io(
  "/webRTCPeers",
  {
    path: "/learning-WebRTC"
  }
);

function App() {
  const localVideoRef = useRef<any>();
  const remoteVideoRef = useRef<any>();
  const pc = useRef<any>();

  const [ offerVisible, setOfferVisible ] = useState(true)
  const [ answerVisible, setAnswerVisible ] = useState(true)
  const [ status, setStatus ] = useState("Make a call now")

  useEffect(() => {
    socket.on("connection-success", success => {
      console.log(success);
    })

    socket.on("sdp", data => {
      pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
      if(data.sdp.type === "offer") {
        setOfferVisible(false);
        setAnswerVisible(true);
        setStatus("Incoming call...");
      }
      else {
        setStatus("Call established");
      }
    })

    socket.on("candidate", candidate => {
      pc.current.addIceCandidate(new RTCIceCandidate(candidate))
    })

    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach( track => {
          _pc.addTrack(track, stream);
        })
      })
      .catch(e => console.log("getUserMedia error...", e));

    const _pc = new RTCPeerConnection();

    _pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendToPeer("candidate", e.candidate);
      }
    };

    _pc.oniceconnectionstatechange = (e: any) => {
      console.log(e);
    };

    _pc.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.current = _pc;

  }, []);

  const sendToPeer = (eventType: any, payload: any) => {
    socket.emit(eventType, payload)
  }

  const processSDP = (sdp: any) => {
    pc.current.setLocalDescription(sdp);
    sendToPeer("sdp", { sdp });
  }

  const createOffer = () => {
    pc.current.createOffer({
      offerToReceiveAudio: 0,
      offerToReceiveVideo: 1
    })
      .then((sdp: any) => {
        processSDP(sdp)
        setOfferVisible(false)
        setStatus("Calling...");
      })
      .catch((e: any) => console.log(e));
  }

  const createAnswer = () => {
    pc.current.createAnswer({
      offerToReceiveAudio: 0,
      offerToReceiveVideo: 1
    })
      .then((sdp: any) => {
        processSDP(sdp);
        setAnswerVisible(false);
        setStatus("Call established");
      })
      .catch((e: any) => console.log(e));
  }

  const showHideButtons = () => {
    if(offerVisible) {
      return (
        <div>
          <button className="button" onClick={createOffer}>Call</button>
        </div>
      )
    }
    else if (answerVisible && status === "Incoming call...") {
      return (
        <div>
          <button className="button" onClick={createAnswer}>Answer</button>
        </div>
      )
    }
  }

  return (
    <div className="app">
      <h1>REAL-TIME COMUNICATION</h1>
      <div className="video-wrappers">
        <video className="video" autoPlay ref={localVideoRef}></video>
        <video className="video" autoPlay ref={remoteVideoRef} id="remote"></video>
      </div>
      <p className="status">{ status }</p>
      { showHideButtons() }
    </div>
  );
}

export default App;
