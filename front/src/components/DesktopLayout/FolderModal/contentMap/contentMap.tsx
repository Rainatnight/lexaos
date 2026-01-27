import { LexaChat } from "@/components/LexaChat/LexaChat";
import { FolderContent } from "../FolderContent/FolderContent";
import { FolderFooter } from "../FolderFooter/FolderFooter";
import { Calculexa } from "@/components/Calculexa/Calculexa";
import { TextEditor } from "@/components/TextEditor/TextEditor";
import { Terminal } from "@/components/Terminal/Terminal";
import { JSX } from "react";

export function getFolderContent(
  item: any,
  children: any[],
  zoomNode: React.RefObject<JSX.Element>,
) {
  switch (item.type) {
    case "folder":
    case "bin":
    case "pc":
      return (
        <>
          <FolderContent folders={children} parentId={item.id} />
          <FolderFooter folders={children} item={item} />
        </>
      );
    case "chat":
      return <LexaChat />;
    case "zoom":
      return zoomNode.current;
    case "calc":
      return <Calculexa />;
    case "txt":
      return <TextEditor item={item} />;
    case "term":
      return <Terminal />;
    default:
      return null;
  }
}
