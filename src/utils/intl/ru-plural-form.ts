import { isNil } from "es-toolkit";

type RuPluralFormParams = {
  count?: number | null; // Опциональное количество
  one: string; // 1, 21, 31...
  few: string; // 2–4, 22–24...
  many: string; // 0, 5–20, 25+, 100...
  zero?: string; // Опционально — специальная форма для 0
  none?: string; // Оционально - специальная форма, когда count nullish
  placeholder?: string; // Какой плейсхолдер использовать (%d, {n}, {count} и т.д.)
};

const rules = new Intl.PluralRules("ru-RU", { type: "cardinal" });

export function ruPluralForm({
  count,
  one,
  few,
  many,
  zero,
  none = "Нет доступны вариантов",
  placeholder = "%d",
}: RuPluralFormParams): string {
  if (isNil(count)) {
    return none;
  }

  const category = rules.select(count);
  let form: string;

  if (count === 0 && zero !== undefined) {
    form = zero;
  } else {
    switch (category) {
      case "one":
        form = one;
        break;
      case "few":
        form = few;
        break;
      default:
        form = many;
        break;
    }
  }

  return form.replace(placeholder, count.toString());
}
