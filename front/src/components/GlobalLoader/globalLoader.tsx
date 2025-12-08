import { selectAnyDesktopLoading } from "@/store/slices/loadingSlice";
import { useSelector } from "react-redux";
import cls from "./globalLoader.module.scss";

export function GlobalLoader() {
  const isLoading = useSelector(selectAnyDesktopLoading);

  if (!isLoading) return null;

  return (
    <div className="global-loader">
      <div className={cls.spinnerContainer}>
        <div className={cls.spinner}></div>
      </div>
    </div>
  );
}
