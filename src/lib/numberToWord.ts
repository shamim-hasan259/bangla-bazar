export const ConvertToWord = (number: number): string => {
  const ones: string[] = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens: string[] = [
    "",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens: string[] = [
    "",
    "Ten",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const thousands: string[] = [
    "",
    "Thousand",
    "Million",
    "Billion",
    "Trillion",
  ];

  if (number === 0) {
    return "Zero";
  }

  let numStr: string = "";
  let count: number = 0;

  while (number > 0) {
    if (number % 1000 !== 0) {
      numStr =
        convertThreeDigitsToWords(number % 1000, ones, teens, tens) +
        " " +
        thousands[count] +
        " " +
        numStr;
    }
    number = Math.floor(number / 1000);
    count++;
  }

  return numStr.trim();
};

function convertThreeDigitsToWords(
  num: number,
  ones: string[],
  teens: string[],
  tens: string[]
): string {
  let numStr: string = "";

  if (num >= 100) {
    numStr += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }

  if (num >= 11 && num <= 19) {
    numStr += teens[num - 10] + " ";
  } else if (num === 10 || num >= 20) {
    numStr += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  }

  if (num >= 1 && num <= 9) {
    numStr += ones[num] + " ";
  }

  return numStr.trim();
}
