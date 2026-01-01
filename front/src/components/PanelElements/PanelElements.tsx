import { defaultIcons, openFolder } from "@/store/slices/desktopSlice";
import cls from "./PanelElements.module.scss";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";

export const PanelElements = () => {
  const dispatch = useAppDispatch();

  return (
    <ul className={cls.list}>
      {defaultIcons.map((el) => (
        <li
          className={cls.el}
          key={el.id}
          onClick={(e) => {
            dispatch(
              openFolder({
                id: el.id,
                x: e.clientX,
                y: e.clientY,
              })
            );
          }}
        >
          <img src={`/img/icons/${el.id}.png`} alt={el.name} />
          <p>{el.name}</p>
        </li>
      ))}
    </ul>
  );
};
