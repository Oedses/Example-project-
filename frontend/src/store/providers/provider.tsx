import { useState, ReactNode } from "react";
import Context from "../contexts/context";

interface IProvider<T> {
  initialState: T;
  ContextComponent: Context<T>;
  children: ReactNode;
}

export type UpdateData<T> = {
  [key in keyof Partial<T>]: T[keyof T];
};

const Provider = <T extends {}, >({ children, initialState, ContextComponent }: IProvider<T>) => {
  const [data, setData] = useState<T>(initialState);

  const updateData = (newData: UpdateData<T>) => setData((prev) => ({ ...prev, ...newData }));

  const value = {
    data,
    setData: updateData
  };

  return (
    <ContextComponent.context.Provider value={value}>
      { children }
    </ContextComponent.context.Provider>
  );
};

export default Provider;