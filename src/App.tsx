import { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

// initializing socket with namespace defined on signalling server
const socket = io(
  "/webRTCPeers",
  {
    path: "/learning-WebRTC"
  }
);

function App() {
  const localVideoRef = useRef<any>();
  const remoteVideoRef = useRef<any>();
  const pc = useRef<any>(); // peer connection


  // managing visibility of components with states
  const [ offerVisible, setOfferVisible ] = useState(true)
  const [ answerVisible, setAnswerVisible ] = useState(true)
  const [ status, setStatus ] = useState("Make a call now")


  // only on first render (no deps)
  useEffect(() => {
    socket.on("connection-success", success => {
      console.log(success);
    })

    // immediately sets incoming remote SDP incoming from signalling server
    socket.on("sdp", data => {
      pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
      if (data.sdp.type === "offer") {
        // if comes an offer, user should press "Answer"
        setOfferVisible(false);
        setAnswerVisible(true);
        setStatus("Incoming call...");
      }
      // if comes an answer, the call is set
      else if (data.type.sdp === "answer") {
        setStatus("Call established");
      }
    })

    // immediately sets new candidate (incoming from signalling server)
    socket.on("candidate", candidate => {
      pc.current.addIceCandidate(new RTCIceCandidate(candidate))
    })

    // defines new connection
    const _pc = new RTCPeerConnection();

    // gets access to mic and camera and binds them to HTML element video
    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach( track => {
          _pc.addTrack(track, stream);
        })
      })
      .catch(e => console.log("getUserMedia error...", e));

    // new ice candidate event
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

    // binds ref to connection
    pc.current = _pc;

  }, []);


  // takes an ice candidate or a sdp and emits an event
  const sendToPeer = (eventType: any, payload: any) => {
    socket.emit(eventType, payload)
  }


  // sets local SDP when an offer (made by caller peer) or an answer (made by callee peer)
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


  // manage through react states the UI action buttons
  const showHideButtons = () => {
    if(offerVisible) {
      return (
        <>
          <button className="button" onClick={createOffer}>Call</button>
        </>
      )
    }
    else if (answerVisible && status === "Incoming call...") {
      return (
          <>
            <button className="button" onClick={createAnswer}>Answer</button>
          </>
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
