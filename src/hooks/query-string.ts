import { parse, ParsedQuery } from "query-string";

type UseQueryString = ParsedQuery<string>;
export function useQueryString(): UseQueryString {
  return parse(window.location.search);
}
