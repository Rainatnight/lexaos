import { fileEndPoint } from "@/shared/api/fileEndpoint";

export const getFilePath = (file?: string) => {
  if (!file) return "";

  const host = process.env.NEXT_PUBLIC_SOCKET;
  const lastPart = fileEndPoint + "/" + file;
  return host
    ? host[host.length - 1] === "/"
      ? host + lastPart
      : host + "/" + lastPart
    : "";
};
