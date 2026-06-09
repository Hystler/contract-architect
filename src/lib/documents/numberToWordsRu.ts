const onesMale = [
  "",
  "один",
  "два",
  "три",
  "четыре",
  "пять",
  "шесть",
  "семь",
  "восемь",
  "девять"
];

const onesFemale = [
  "",
  "одна",
  "две",
  "три",
  "четыре",
  "пять",
  "шесть",
  "семь",
  "восемь",
  "девять"
];

const teens = [
  "десять",
  "одиннадцать",
  "двенадцать",
  "тринадцать",
  "четырнадцать",
  "пятнадцать",
  "шестнадцать",
  "семнадцать",
  "восемнадцать",
  "девятнадцать"
];

const tens = [
  "",
  "",
  "двадцать",
  "тридцать",
  "сорок",
  "пятьдесят",
  "шестьдесят",
  "семьдесят",
  "восемьдесят",
  "девяносто"
];

const hundreds = [
  "",
  "сто",
  "двести",
  "триста",
  "четыреста",
  "пятьсот",
  "шестьсот",
  "семьсот",
  "восемьсот",
  "девятьсот"
];

const groups = [
  { forms: ["", "", ""], female: false },
  { forms: ["тысяча", "тысячи", "тысяч"], female: true },
  { forms: ["миллион", "миллиона", "миллионов"], female: false },
  { forms: ["миллиард", "миллиарда", "миллиардов"], female: false }
];

export function numberToWordsRu(value: number | string | null | undefined) {
  const amount = Math.max(0, Math.round(Number(value ?? 0) * 100) / 100);
  const rubles = Math.floor(amount);
  const kopecks = Math.round((amount - rubles) * 100);

  const rublesWords = integerToWordsRu(rubles);
  return `${rublesWords} ${plural(rubles, ["рубль", "рубля", "рублей"])} ${kopecks
    .toString()
    .padStart(2, "0")} ${plural(kopecks, ["копейка", "копейки", "копеек"])}`;
}

function integerToWordsRu(value: number) {
  if (value === 0) {
    return "ноль";
  }

  const parts: string[] = [];
  let remaining = value;
  let groupIndex = 0;

  while (remaining > 0 && groupIndex < groups.length) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      const group = groups[groupIndex];
      const chunkWords = chunkToWords(chunk, group.female);
      const groupName = groupIndex === 0 ? "" : plural(chunk, group.forms);
      parts.unshift([chunkWords, groupName].filter(Boolean).join(" "));
    }
    remaining = Math.floor(remaining / 1000);
    groupIndex += 1;
  }

  return parts.join(" ");
}

function chunkToWords(value: number, female: boolean) {
  const words: string[] = [];
  const hundred = Math.floor(value / 100);
  const ten = Math.floor((value % 100) / 10);
  const one = value % 10;

  if (hundred) {
    words.push(hundreds[hundred]);
  }

  if (ten === 1) {
    words.push(teens[one]);
  } else {
    if (ten) {
      words.push(tens[ten]);
    }
    if (one) {
      words.push((female ? onesFemale : onesMale)[one]);
    }
  }

  return words.join(" ");
}

function plural(value: number, forms: [string, string, string] | string[]) {
  const absolute = Math.abs(value) % 100;
  const last = absolute % 10;

  if (absolute > 10 && absolute < 20) {
    return forms[2];
  }
  if (last > 1 && last < 5) {
    return forms[1];
  }
  if (last === 1) {
    return forms[0];
  }
  return forms[2];
}
