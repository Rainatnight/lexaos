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
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
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

  // Включение видео
  const enableVideo = async () => {
    if (!pcRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      if (!track) return;

      const pc = pcRef.current;

      // Добавляем только если ещё нет такого трека
      const senderExists = pc
        .getSenders()
        .some((s) => s.track?.kind === "video");
      if (!senderExists) {
        pc.addTrack(track, stream);

        // Добавляем трек в существующий локальный поток
        if (localStream) {
          localStream.addTrack(track);
        } else {
          setLocalStream(stream);
        }
        if (localVideoRef.current)
          localVideoRef.current.srcObject = localStream || stream;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Включение/выключение аудио
  const toggleAudio = async () => {
    if (!pcRef.current) return;

    if (!isAudioOn) {
      try {
        // Получаем только аудио
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioTrack = audioStream.getAudioTracks()[0];
        if (!audioTrack) return;

        // Проверяем, есть ли уже аудио-трек
        const senderExists = pcRef.current
          .getSenders()
          .some((sender) => sender.track?.kind === "audio");

        if (!senderExists) {
          pcRef.current.addTrack(audioTrack, audioStream);
        }

        // Добавляем трек в локальный поток для отображения (или просто для управления)
        setLocalStream((prev) => {
          const newStream = prev
            ? new MediaStream([...prev.getTracks(), audioTrack])
            : new MediaStream([audioTrack]);
          if (localVideoRef.current)
            localVideoRef.current.srcObject = newStream;
          return newStream;
        });

        setIsAudioOn(true);
      } catch (err) {
        console.error("Не удалось включить микрофон", err);
      }
    } else {
      // Выключаем аудио
      if (!localStream) return;

      // Удаляем аудио трек из локального потока
      localStream.getAudioTracks().forEach((track) => track.stop());

      setLocalStream((prev) => {
        if (!prev) return null;
        const newStream = new MediaStream(prev.getVideoTracks());
        if (localVideoRef.current) localVideoRef.current.srcObject = newStream;
        return newStream;
      });

      // Удаляем аудио-трек из PeerConnection
      pcRef.current
        .getSenders()
        .filter((sender) => sender.track?.kind === "audio")
        .forEach((sender) => pcRef.current?.removeTrack(sender));

      setIsAudioOn(false);
    }
  };

  return (
    <div className={cls.callSession}>
      <video ref={localVideoRef} autoPlay muted className={cls.localVideo} />
      <div className={cls.localLabel}>Вы</div>

      <video ref={remoteVideoRef} autoPlay className={cls.remoteVideo} />
      <div className={cls.userLabel}>{user.login}</div>

      <div className={cls.controls}>
        {!isVideoOn && <button onClick={enableVideo}>Включить видео</button>}
        <button onClick={toggleAudio}>
          {isAudioOn ? "Выключить микрофон" : "Включить микрофон"}
        </button>
      </div>

      <button className={cls.endCallBtn} onClick={onEndCall}>
        Завершить
      </button>
    </div>
  );
};
