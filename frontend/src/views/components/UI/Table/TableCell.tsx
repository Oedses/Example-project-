import { useMemo, useState } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import NumberFormat from "react-number-format";
import { To, useNavigate } from "react-router";
import { TableCell, TableCellTypes } from "./";
import { TextColors } from "./table.constants";

type StatusCellProps = Pick<TableCell, 'contentClasses' | 'value' | 'status'>;
const StatusCell = ({ contentClasses, value, status }: StatusCellProps) => (
  <div className={classNames("table__status-wrapper", contentClasses)}>
    <div
      className={classNames(
        "table__status",
        `table__status_${status?.toLowerCase()}`,
      )}
    ></div>

    <p>{value}</p>
  </div>
);

const renderSwitch = ({
  type,
  value,
  onClick,
  status,
  color,
  stringWithLinkData,
  tooltip,
  contentClasses,
  withTooltip = false
}: TableCell) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const { t } = useTranslation();

  const navigate = useNavigate();

  const onTooltipSwitch = () => {
    if (!tooltip) return;

    setIsTooltipOpen(prev => !prev);
  };

  const tooltipClasses = useMemo(() => classNames("table__tooltip", {
    "table__tooltip--open": isTooltipOpen
  }), [isTooltipOpen]);



  switch (type) {
    case TableCellTypes.STRING:
      let displayValue = value;

      const tempValue = value as string;

      ["years", "months"].forEach((el) => {
        if (tempValue && tempValue?.includes(el))
          displayValue = tempValue?.replace(el, t(el));
      });

      return (
        <p
          className={classNames("table__string", contentClasses, {
            "with-tooltip": withTooltip,
            "table__string--with-number": !isNaN(Number(value))
          })}
          data-tooltip={displayValue}
        >
          {t(displayValue)}
        </p>
      );

    case TableCellTypes.PERCENT:
      return value ? (
        <p className={classNames("table__string", contentClasses)}>
          {Number(value).toFixed(2)}&nbsp;%
        </p>
      ) : 'N/A';

    case TableCellTypes.LINK:
      const clickHandler = onClick ? () =>  navigate(onClick as To) : null;
      return (
        <p
          className={classNames("table__link", contentClasses, {
            "with-tooltip": withTooltip
          })}
          onClick={clickHandler as any}
          data-tooltip={value}
        >
          {value}
        </p>
      );

    case TableCellTypes.DATE:
      return <p className={classNames("table__date", contentClasses)}>{value}</p>;

    case TableCellTypes.CURRENCY:
      return (
        <NumberFormat
          value={Number(value) || 0}
          style={{ color: color ? color : "#000000" }}
          displayType={"text"}
          decimalScale={2}
          fixedDecimalScale
          thousandSeparator="."
          decimalSeparator=","
          prefix={"€\u00a0"}
        />
      );

    case TableCellTypes.STATUS:
      return <StatusCell contentClasses={contentClasses} value={value} status={status} />;

    case TableCellTypes.COLORED_STRING:
      const colorValue: TextColors = color || TextColors.gray;

      return (
        <p
          className={classNames(
            contentClasses,
            "table__colored-string",
            `table__colored-string-${colorValue}`
          )}
        >
          {value}
        </p>
      );

    case TableCellTypes.STRING_WITH_LINK:
      return (
        <section className='table__string-with-link'>
          <p className={classNames({
            "with-tooltip": withTooltip
          })}
          onMouseEnter={onTooltipSwitch}
          onMouseLeave={onTooltipSwitch}
          >
            {stringWithLinkData!.map((item) => {
              return item.type === TableCellTypes.STRING ? (
                <span className={classNames(item.contentClasses)} key={item.value}>
                  {item.value.replaceAll(" ", "\u00a0")}&nbsp;
                </span>
              ) : (
                <span
                  key={item.value}
                  className="table__link"
                  onClick={() => item?.onClick && navigate(item.onClick)}
                >
                  {item.value.replaceAll(" ", "\u00a0")}&nbsp;
                </span>
              );
            })}
          </p>

          {Boolean(tooltip) ? (
            <div className={tooltipClasses}>
              {tooltip}
            </div>
          ) : null}

        </section>
      );

    default:
      return null;
  }
};

const TableCellView = (cellData: TableCell) => {
  const cellClasses = classNames(`table-cell__${cellData.type}`, {
    'table-cell__centered': cellData?.isCentered
  });

  return <td className={cellClasses}>{renderSwitch(cellData)}</td>;
};

export default TableCellView;

