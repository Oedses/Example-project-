import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getErrorMessageName } from "../../../../../utils/fn";
import { validateErrorsLabels } from "../../../../../utils/validation";

import AdminService from "../../../../../services/AdminService";

import ComplianceContext from "../../../../../store/contexts/compliance-log-context";
import SummaryContext from "../../../../../store/contexts/summary-context";

import { ButtonProps } from "../../../../components/UI/Button/button.props";

export type RejectComplianceFormProps = {
  callback?: () => void
};

const useRejectComplianceForm = ({
  callback = () => {}
}: RejectComplianceFormProps) => {
  const [isFetching, setIsFetching] = useState(false);
  const [reasonError, setReasonError] = useState('');

  const {
    data: { rejectLogId },
    setData: setComplianceData
  } = ComplianceContext.useContext();

  const { setData: setSummaryData } = SummaryContext.useContext();

  const reasonRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();

  const onReasonChange = () => setReasonError('');

  const onSubmit: ButtonProps['onClick'] = (e) => {
    if (e) e.preventDefault();

    const reason = reasonRef.current?.value;

    if (!reason) return setReasonError(t(validateErrorsLabels.required));

    setIsFetching(true);

    AdminService.rejectCompliance(rejectLogId, reason!)
      .then(() => {
        setComplianceData({
          rejectLogId:  '',
        });
        callback();
      })
      .catch((err) => {
        const errorMessageName = getErrorMessageName(err.response.data.stack);
        const errorMsg = t(`error.backend.${errorMessageName}`);

        setComplianceData({ rejectLogId: '' });

        setSummaryData({
          isShown: true,
          isSuccess: false,
          title: 'pages.complianceLog.rejectForm.error.title',
          subtitle: errorMsg
        });
      })
      .finally(() => setIsFetching(false));
  };

  return {
    t,
    reasonRef,
    isFetching,
    onSubmit,
    reasonError,
    onReasonChange
  };
};

export { useRejectComplianceForm };