import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createQueryString } from "../../../utils/fn";
import UserContext from "../../../store/contexts/user-context";
import { User } from "../../../../../shared/types/user";
import { Query } from "../../../../../shared/types/response";
import AuthService from "../../../services/AuthService";

export const useMyAccount = () => {
  const { data: { id: userId } } = UserContext.useContext();

  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);

  const getUser = () => {
    setLoading(true);

    const query: Query = {
      id: userId,
    };

    AuthService.getUserData(createQueryString(query))
      .then((res) => {
        const { data } = res;
        setUserData(data);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (userId) {
      getUser();
    }
  }, [userId]);

  return {
    t,
    isLoading,
    userData,
    getUser
  };
};
