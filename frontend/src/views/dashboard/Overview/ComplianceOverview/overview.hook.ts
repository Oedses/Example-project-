import { useTranslation } from "react-i18next";
import UserContext from "../../../../store/contexts/user-context";

export const useOverview = () => {
  const { data: { name } } = UserContext.useContext();
  const { t } = useTranslation();

  return {
    t,
    name,
  };
};
