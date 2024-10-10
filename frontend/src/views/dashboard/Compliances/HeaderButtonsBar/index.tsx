import { useTranslation } from "react-i18next";
import { Button } from '../../../components/UI';
import { DownloadIcon, FilterIcon } from "../../../components/icons";
import { ButtonView } from "../../../components/UI/Button/button.props";
import './header-buttons-bar.scss';

type HeaderButtonsBarProps = {
  onShowFilters: () => void;
  onExportResults: () => void;
};

const HeaderButtonsBar = ({ onShowFilters, onExportResults }: HeaderButtonsBarProps) => {
  const { t } = useTranslation();

  return (
    <div className='buttons-container'>
      <Button
        view={ButtonView.unfilled}
        onClick={onExportResults}
      >
        <DownloadIcon />

        {t('pages.admin.overview.complianceLog.exportResults')}
      </Button>
      <Button
        view={ButtonView.unfilled}
        onClick={onShowFilters}
      >
        <FilterIcon />

        {t('pages.admin.overview.complianceLog.showFilters')}
      </Button>
    </div>
  );
};

export default HeaderButtonsBar;