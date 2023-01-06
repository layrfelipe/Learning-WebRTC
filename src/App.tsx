import { useRef, useEffect } from "react";

import "./App.css";

function App() {
  const localVideoRef = useRef<any>();
  const remoteVideoRef = useRef<any>();
  const pc = useRef<any>();
  const textRef = useRef<any>();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach( track => {
          _pc.addTrack(track, stream)
        })
      })
      .catch(e => console.log("getUserMedia error...", e));

    const _pc = new RTCPeerConnection();

    _pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log(JSON.stringify(e.candidate));
      }
    };

    _pc.oniceconnectionstatechange = (e) => {
      console.log(e);
    };

    _pc.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.current = _pc;

  }, []);


  const createOffer = () => {
    pc.current.createOffer({
      offerToReceiveAudio: 0,
      offerToReceiveVideo: 1
    })
      .then((sdp: any) => {
        console.log(JSON.stringify(sdp));
        pc.current.setLocalDescription(sdp);

      })
      .catch((e: any) => console.log(e));
  }


  const createAnswer = () => {
    pc.current.createAnswer({
      offerToReceiveAudio: 0,
      offerToReceiveVideo: 1
    })
      .then((sdp: any) => {
        console.log(JSON.stringify(sdp));
        pc.current.setLocalDescription(sdp);

      })
      .catch((e: any) => console.log(e));
  }


  const setRemoteDescription = () => {
    const sdp = JSON.parse(textRef.current.value);
    console.log(sdp);

    pc.current.setRemoteDescription(new RTCSessionDescription(sdp));
  }


  const addCandidate = () => {
    const candidate = JSON.parse(textRef.current.value);
    console.log("adding candidate...", candidate)
    
    pc.current.addIceCandidate(new RTCIceCandidate(candidate));
    console.log(remoteVideoRef.current)
  }


  return (
    <div className="app">
      <div className="app-wrapper">
        <div className="video-wrappers">
          <video className="video" autoPlay ref={localVideoRef}></video>
          <video className="video" autoPlay ref={remoteVideoRef} id="remote"></video>
        </div>

        <div className="button-wrappers">
          <button className="button" onClick={ createOffer }>Create offer SDP</button>
          <button className="button" id="answer" onClick={ createAnswer }>Create answer SDP</button>
        </div>

        <textarea className="sdpTextArea" ref={textRef}></textarea>

        <div className="button-wrappers">
          <button className="button" onClick={ setRemoteDescription }>Set Remote Description</button>
          <button className="button" id="answer" onClick={ addCandidate }>Add candidate</button>
        </div>
      </div>
    </div>
  );
}

export default App;
