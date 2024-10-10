import { createContext, useContext } from "react";
import { UpdateData } from "../providers/provider";

export interface IContext<T extends {}> {
  data: T;
  setData: (newData: UpdateData<T>) => void;
}

class Context<T> {
  constructor(
    private _initialState: T
  ) {}

  public context = createContext<IContext<T>>({
    data: this._initialState,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setData: (newData: UpdateData<T>) => {}
  });

  public useContext = () => useContext(this.context);
}

export default Context;