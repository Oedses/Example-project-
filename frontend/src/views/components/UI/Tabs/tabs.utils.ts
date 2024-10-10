import { ObjWithKeys, Label } from "../../../../../../shared/types/common";

export const getCurrentTab = (tabs: ObjWithKeys<Label>, selected: string) =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Object.entries(tabs).find(([key, value]) => value.value === selected)![1];