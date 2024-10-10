import { Fragment, useMemo } from "react";
import { ArrowIcon } from "../../icons";

export type TableHeadItemProps = {
  item: string;
  className?: string;
  onClick?: () => void;
};


const TableHeadItem = ({ item, className, onClick }: TableHeadItemProps) => {

  const splittedClasses = useMemo(() => className ? className.split(' ') : '', [className]);

  const isAddonDisplayed = useMemo(() => splittedClasses &&
    !splittedClasses.includes('sort-default'), [splittedClasses]);


  return (
    <td className={className} title={item} onClick={onClick}>
      <div>
        <span>{item}</span>

        {isAddonDisplayed && (
          <Fragment>
            &nbsp;
            <ArrowIcon width="16px" height="16px" rotate={className?.split(' ').includes('ascending') ? 0 : 180} fill={'green'} />
          </Fragment>
        )}
      </div>
    </td>
  );
};

export default TableHeadItem;
