import dynamic from "next/dynamic";

const NotFound = dynamic(() => import("@/components/NotFound/NotFound"), {
  ssr: false,
});

export default function Custom404() {
  return <NotFound />;
}
