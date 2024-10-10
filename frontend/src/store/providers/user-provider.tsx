import { FC } from "react";
import UserContext, { initialUserState } from "../contexts/user-context";
import Provider from "./provider";

const UserProvider: FC = ({ children }) => (
  <Provider
    initialState={initialUserState}
    ContextComponent={UserContext}
  >
    {children}
  </Provider>
);

export default UserProvider;