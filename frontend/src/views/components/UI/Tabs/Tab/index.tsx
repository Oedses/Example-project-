import { ReactElement } from "react";

export type TabProps = {
  title: string;
  id: string;
  rightAddons?: string | number;
  children: ReactElement<any, any>;
};

const Tab = ({ children }: TabProps) => <section>{children}</section>;

export { Tab };
