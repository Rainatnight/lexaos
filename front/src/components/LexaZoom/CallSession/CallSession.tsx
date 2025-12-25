import React, { useEffect, useRef, useState } from "react";
import cls from "./CallSession.module.scss";
import { ChatUser } from "../LexaZoom";
import useSession from "@/shared/hooks/useSession";

type Props = {
  user: ChatUser;
  onEndCall: () => void;
  isInitiator: boolean; // true если мы звонящий
};

export const CallSession = ({ user, onEndCall, isInitiator }: Props) => {
  const { socket } = useSession();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    // Получаем локальный поток
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        if (pcRef.current) {
          stream
            .getTracks()
            .forEach((track) => pcRef.current!.addTrack(track, stream));
        }
      })
      .catch((err) => {
        console.error("Ошибка доступа к камере/микрофону:", err);
        alert("Нужен доступ к камере и микрофону для звонка");
        onEndCall();
      });

    // Удалённый поток
    pc.ontrack = (event) => {
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = event.streams[0];
    };

    // ICE кандидаты
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("webrtc:ice-candidate", {
          toUserId: user._id,
          candidate: event.candidate,
        });
      }
    };

    // Слушаем события WebRTC через сокет
    const handleOffer = async ({ fromUserId, sdp }: any) => {
      if (fromUserId !== user._id) return;
      if (!pcRef.current) return;

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      socket?.emit("webrtc:answer", { toUserId: fromUserId, sdp: answer });
    };

    const handleAnswer = async ({ fromUserId, sdp }: any) => {
      if (fromUserId !== user._id) return;
      if (!pcRef.current) return;

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    const handleICE = async ({ fromUserId, candidate }: any) => {
      if (fromUserId !== user._id) return;
      if (!pcRef.current) return;

      try {
        await pcRef.current.addIceCandidate(candidate);
      } catch (err) {
        console.error(err);
      }
    };

    socket?.on("webrtc:offer", handleOffer);
    socket?.on("webrtc:answer", handleAnswer);
    socket?.on("webrtc:ice-candidate", handleICE);

    return () => {
      pc.close();
      pcRef.current = null;
      localStream?.getTracks().forEach((track) => track.stop());

      socket?.off("webrtc:offer", handleOffer);
      socket?.off("webrtc:answer", handleAnswer);
      socket?.off("webrtc:ice-candidate", handleICE);
    };
  }, [socket, user._id]);

  // Если мы инициатор, создаём offer
  useEffect(() => {
    if (!isInitiator) return;
    if (!pcRef.current) return;

    const pc = pcRef.current;

    const createOffer = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket?.emit("webrtc:offer", { toUserId: user._id, sdp: offer });
      } catch (err) {
        console.error("Ошибка создания offer:", err);
      }
    };

    createOffer();
  }, [isInitiator, socket, user._id]);

  return (
    <div className={cls.callSession}>
      <video ref={localVideoRef} autoPlay muted className={cls.localVideo} />
      <div className={cls.localLabel}>Вы</div>

      <video ref={remoteVideoRef} autoPlay className={cls.remoteVideo} />
      <div className={cls.userLabel}>{user.login}</div>

      <button className={cls.endCallBtn} onClick={onEndCall}>
        Завершить
      </button>
    </div>
  );
};
