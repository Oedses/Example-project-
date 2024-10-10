import { Roles } from "../../../../shared/types/common";
import Context from "./context";

export type UserStore = {
  role: Roles;

  id: string;
  email: string;
  name: string;
};

export const initialUserState: UserStore = {
  role: '' as Roles,
  id: '',
  email: '',
  name: ''
};

const UserContext = new Context(initialUserState);

export default UserContext;