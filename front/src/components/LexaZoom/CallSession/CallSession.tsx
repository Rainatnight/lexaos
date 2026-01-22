import React, { useEffect, useRef, useState } from "react";
import cls from "./CallSession.module.scss";
import { ChatUser } from "../LexaZoom";
import useSession from "@/shared/hooks/useSession";

type Props = {
  user: ChatUser;
  onEndCall: () => void;
  isInitiator: boolean;
};

export const CallSession = ({ user, onEndCall, isInitiator }: Props) => {
  const { socket } = useSession();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [localStream] = useState(() => new MediaStream());

  if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.onnegotiationneeded = async () => {
      try {
        if (!pcRef.current) return;
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socket?.emit("webrtc:offer", { toUserId: user._id, sdp: offer });
      } catch (err) {
        console.error("Ошибка renegotiation:", err);
      }
    };

    // удалённый поток
    pc.ontrack = (event) => {
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("webrtc:ice-candidate", {
          toUserId: user._id,
          candidate: event.candidate,
        });
      }
    };

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

    // Привязываем локальный поток к видео
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

    return () => {
      pc.close();
      pcRef.current = null;

      localStream.getTracks().forEach((track) => track.stop());

      socket?.off("webrtc:offer", handleOffer);
      socket?.off("webrtc:answer", handleAnswer);
      socket?.off("webrtc:ice-candidate", handleICE);
    };
  }, [socket, user._id, localStream]);

  useEffect(() => {
    if (!isInitiator) return;
    if (!pcRef.current) return;

    const createOffer = async () => {
      try {
        const offer = await pcRef.current!.createOffer();
        await pcRef.current!.setLocalDescription(offer);
        socket?.emit("webrtc:offer", { toUserId: user._id, sdp: offer });
      } catch (err) {
        console.error("Ошибка создания offer:", err);
      }
    };

    createOffer();
  }, [isInitiator, socket, user._id]);

  const toggleVideo = async () => {
    if (!pcRef.current) return;

    const videoTrack = localStream.getVideoTracks()[0];

    //  если видео уже есть — просто включаем / выключаем
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
      return;
    }

    // если видео ещё нет — получаем камеру
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      if (!track) return;

      pcRef.current.addTrack(track, localStream);
      localStream.addTrack(track);
      setIsVideoOn(true);
    } catch (err) {
      console.error("Не удалось включить видео", err);
    }
  };

  const toggleAudio = async () => {
    if (!pcRef.current) return;

    const audioTrack = localStream.getAudioTracks()[0];

    //  если аудио уже есть — просто mute / unmute
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioOn(audioTrack.enabled);
      return;
    }

    //  если аудио ещё нет — получаем микрофон
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];
      if (!track) return;

      // ❗️ВАЖНО: добавляем в localStream
      localStream.addTrack(track);

      // ❗️И В ТОТ ЖЕ STREAM добавляем в PeerConnection
      pcRef.current.addTrack(track, localStream);

      setIsAudioOn(true);
    } catch (err) {
      console.error("Не удалось включить микрофон", err);
    }
  };

  return (
    <div className={cls.callSession}>
      <video ref={localVideoRef} autoPlay muted className={cls.localVideo} />
      <div className={cls.localLabel}>Вы</div>

      <video ref={remoteVideoRef} autoPlay className={cls.remoteVideo} />
      <div className={cls.userLabel}>{user.login}</div>

      <div className={cls.controls}>
        <div className={cls.control} onClick={toggleVideo}>
          <img
            src={
              isVideoOn ? "/img/sounds/video.png" : "/img/sounds/no-video.png"
            }
            alt={isVideoOn ? "Video on" : "Video off"}
          />
        </div>

        <div className={cls.control} onClick={toggleAudio}>
          <img
            src={isAudioOn ? "/img/sounds/mute.png" : "/img/sounds/unmute.png"}
            alt={isAudioOn ? "Mic on" : "Mic off"}
          />
        </div>
      </div>

      <button className={cls.endCallBtn} onClick={onEndCall}>
        Завершить
      </button>
    </div>
  );
};
