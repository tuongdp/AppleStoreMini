const UNITS = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const TENS = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
const SCALES = ["", "nghìn", "triệu", "tỷ"];

function readThreeDigits(num) {
  const hundred = Math.floor(num / 100);
  const ten = Math.floor((num % 100) / 10);
  const unit = num % 10;

  let result = "";
  if (hundred > 0) {
    result += UNITS[hundred] + " trăm ";
  }
  if (ten > 0) {
    result += TENS[ten];
    if (unit > 0) {
      if (unit === 1 && ten > 1) result += " mốt";
      else if (unit === 5) result += " lăm";
      else result += " " + UNITS[unit];
    }
  } else if (unit > 0) {
    if (hundred > 0) result += "lẻ " + UNITS[unit];
    else result += UNITS[unit];
  }
  return result.trim();
}

export function numberToWords(num) {
  if (num === 0) return "không đồng";
  if (num < 0) return "âm " + numberToWords(-num);

  let n = Math.round(num);
  const parts = [];

  let scaleIndex = 0;
  while (n > 0) {
    const threeDigits = n % 1000;
    if (threeDigits > 0) {
      const words = readThreeDigits(threeDigits);
      if (scaleIndex > 0) {
        parts.unshift(words + " " + SCALES[scaleIndex]);
      } else {
        parts.unshift(words);
      }
    }
    n = Math.floor(n / 1000);
    scaleIndex++;
  }

  let result = parts.join(" ");

  if (result) {
    result = result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
  }

  return result || "không đồng";
}
