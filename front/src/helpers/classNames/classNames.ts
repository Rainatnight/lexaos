/**
 *
 * @param cls  - класс по умолчанию
 * @param mods - объект в котором ключ это название класса а значение это boolean по которому мы определяем надо ли этот класс добавлять
 * @param aditional - массив дополнительных классов
 */

export type Mods = Record<string, boolean | string | undefined>;

export function classNames(
  cls: string,
  mods: Mods = {},
  aditional: Array<string | undefined> = []
): string {
  return [
    cls,
    ...aditional.filter(Boolean),
    ...Object.entries(mods)
      .filter(([, value]) => !!value) // убрали первый аргумент
      .map(([key]) => key), // убрали второй аргумент
  ].join(" ");
}
