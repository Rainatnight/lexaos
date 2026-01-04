import "@/styles/globals.scss";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "@/store";
import StoreProvider from "@/store/StoreProvider";
import { SessionContainer } from "@/components/SessionContainer/SessionContainer";
import { GlobalLoader } from "@/components/GlobalLoader/globalLoader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <StoreProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <GlobalLoader />
          <SessionContainer />
          <Component {...pageProps} />
        </QueryClientProvider>
      </Provider>
    </StoreProvider>
  );
}
