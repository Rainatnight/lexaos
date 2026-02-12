import cls from "./Bars.module.scss";

export const Bars = ({ array, barStates }) => {
  return (
    <div className={cls.bars}>
      {array.map((value, index) => (
        <div key={index} className={cls.barWrapper}>
          <div className={cls.value}>{value}</div>
          <div
            className={`${cls.bar} ${cls[barStates[index] || "default"]}`}
            style={{ height: `${value * 3}px` }}
          />
        </div>
      ))}
    </div>
  );
};
