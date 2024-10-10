import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/UI";
import { CheckMarkIcon } from "../../../components/icons";
import { ButtonView } from "../../../components/UI/Button/button.props";
import { Spinner } from "../../../components/UI/Spinner";
import ComplianceContext from "../../../../store/contexts/compliance-log-context";
import AdminService from "../../../../services/AdminService";

type ComplianceActionsProps = {
    complianceId: string;
    onClose: () => void;
    callback: () => void;
    openSnackBar: (message: string) => void
};

const ComplianceActions = ({ complianceId, onClose, callback, openSnackBar }: ComplianceActionsProps) => {
    const { t } = useTranslation();
    const [isLoading, setLoading] = useState(true);
    
    const { data, setData: setComplianceData } = ComplianceContext.useContext();

    const onReject = () => () => {
        setComplianceData({ rejectLogId: complianceId });
        setLoading(true);
        onClose();
    };

    const onApprove = () => async () => {
        setLoading(true);

        await AdminService.approveCompliance(complianceId)
            .then(() => {
                callback();
                onClose();
            })
            .catch(err => {
                openSnackBar(err.response.data.message);
                console.log(err);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!data.rejectLogId) setLoading(false);
    }, [data.rejectLogId]);

    if (isLoading) return <Spinner />;

    return (
        <section className='compliance-details__decision'>
            <Button
                view={ButtonView.redLayout}
                onClick={onReject()}
                disabled={isLoading}
            >
                {t('pages.complianceLog.reject')}
            </Button>

            <Button
                view={ButtonView.green}
                fullWidth={true}
                onClick={onApprove()}
                disabled={isLoading}
            >
                <CheckMarkIcon width="16px" height="16px" />

                {t('pages.complianceLog.approve')}
            </Button>
        </section>
    );
};

export default ComplianceActions;