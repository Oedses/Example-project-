import { useState } from "react";
import { useTranslation } from "react-i18next";
import UserService from "../../../../../services/UserService";
import SummaryContext from "../../../../../store/contexts/summary-context";
import { ButtonProps } from "../../../../components/UI/Button/button.props";

export type RejectComplianceFormProps = {
  id?: string;
  email?: string;
  callback?: () => void;
};

const createSuccessSubtitle = (email: string) => `The account of ${email} has been deleted.`;

const useConfirmDeleteUser = ({ id, email, callback }: RejectComplianceFormProps) => {
  const [isFetching, setIsFetching] = useState(false);

  const { setData: setSummaryData } = SummaryContext.useContext();

  const { t } = useTranslation();

  const showFailureSummary = (subtitle: string) => {
    setSummaryData({
      isShown: true,
      isSuccess: false,
      title: 'Unable to remove account',
      subtitle
    });
  };

  const showSuccessSummary = () => {
    setSummaryData({
      isShown: true,
      isSuccess: true,
      title: 'Account deleted',
      subtitle: createSuccessSubtitle(email!)
    });
  };


  const onSubmit: ButtonProps['onClick'] = (e) => {
    if (e) e.preventDefault();

    setIsFetching(true);

    UserService.remove(id!)
      .then(() => showSuccessSummary())
      .catch((err) => showFailureSummary(err.response.data.message))
      .finally(() => {
        if (callback) callback();
        setIsFetching(false);
      });
  };

  return {
    t,
    isFetching,
    onSubmit,
    email
  };
};

export { useConfirmDeleteUser };