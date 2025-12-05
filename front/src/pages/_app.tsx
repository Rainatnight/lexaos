import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "@/store";
import StoreProvider from "@/store/StoreProvider";
import { SessionContainer } from "@/components/SessionContainer/SessionContainer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider>
      <Provider store={store}>
        <SessionContainer />
        <Component {...pageProps} />
      </Provider>
    </StoreProvider>
  );
}
