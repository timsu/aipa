import { isAxiosError } from "axios";

export function smartTruncate(input: string, truncationPoint: number) {
  const previousWordIndex = input.lastIndexOf(" ", truncationPoint);
  const truncatedString = input.slice(0, previousWordIndex).trim();

  const withoutPrepositions = truncatedString.replace(/\b(with|on|in|at|to|for|of)$/gi, "").trim();

  const filesShortened = withoutPrepositions.split(" ").map((word) => {
    if (word.includes("/")) return word.substring(word.lastIndexOf("/") + 1);
    else return word;
  });

  return filesShortened.join(" ");
}

export function fuzzyParseJSON(input: string) {
  if (!input) return null;
  const firstBracket = input.indexOf("[");
  const firstBrace = input.indexOf("{");

  if (firstBracket == -1 && firstBrace == -1) return null;
  const isArray = firstBracket > -1 && firstBracket < firstBrace;

  const jsonStart = input.indexOf(isArray ? "[" : "{");
  const jsonEnd = input.lastIndexOf(isArray ? "]" : "}");

  if (jsonStart == -1 || jsonEnd == -1) return null;

  const json = input.substring(jsonStart, jsonEnd + 1);
  try {
    return JSON.parse(json);
  } catch (e) {
    // sometimes trailing commas are generated. sometimes no commas are generated,
    const fixedJsonString = json.replace(/"\n"/g, '",').replace(/,\s*([\]}])/g, "$1");
    try {
      return JSON.parse(fixedJsonString);
    } catch (e) {
      return null;
    }
  }
}

export function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export function pluralize(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function unwrapError(error: any) {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (!data) return error.message;
    if (typeof data === "string") {
      if (data.startsWith("<!DOCTYPE html>")) return error.message;
      return data;
    }
    if (typeof data === "object") {
      if (typeof data.error == "string") return data.error;
      if (typeof data.message == "string") return data.message;
      if (typeof data.error == "object") {
        if (typeof data.error.message == "string") return data.error.message;
        return JSON.stringify(data.error);
      }
      return JSON.stringify(data);
    }
  }
  return error.message;
}

export function titleCase(input: string) {
  return input
    .split(" ")
    .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
    .join(" ");
}
