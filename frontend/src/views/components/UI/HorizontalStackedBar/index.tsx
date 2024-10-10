import React, { useState, useLayoutEffect } from "react";
import { colors, desktopBreakPoint } from "./horizontal-stacked-bar.constants";

import { BarLabel } from "./BarLabel";

import "./horizontal-stacked-bar.scss";
import { useWindowSize } from "../../Hooks/useWindowSize";
import classnames from "classnames";

export type HorizontalStackedBarData = {
  data: {
    label: string;
    amount?: string | number;
    percent?: number;
    showAmount?: boolean;
    barColor?: string;
  };
};

type HorizontalStackedBarProps = {
  data: HorizontalStackedBarData[];
  showAmount?: boolean;
  showPercents?: boolean;
  showAllLabels?: boolean;
  maxLength?: number;
};

const HorizontalStackedBar = ({
  data,
  showAmount,
  showPercents,
  showAllLabels,
  maxLength
}: HorizontalStackedBarProps) => {
  const [desktopLabelsLayoutStyles, setDesktopLabelsLayoutStyles] = useState<any>(null);

  const { width } = useWindowSize();

  const isMobile = width! < desktopBreakPoint;

  let sortedData = data.sort(
    (curr, next) => Number(next.data.amount) - Number(curr.data.amount)
  );

  if (maxLength && sortedData.length > maxLength) {
    sortedData = sortedData.slice(0, maxLength);
  }
  const isDataValid = sortedData.some(item => {
    const value = Number(item.data.amount);
    return !isNaN(value) && value > 0;
  });

  const dataForLabels = width! > desktopBreakPoint && !showAllLabels ?
    sortedData.slice(0, 3).filter(item => Number(item.data.amount) > 0) :
    [ ...sortedData ];

  const totalAmount = sortedData.reduce(
    (acc, curr) => acc + Number(curr.data.amount),
    0
  );

  const percents: number[] = sortedData.reduce(
    (acc, curr) => [...acc, (Number(curr.data.amount) / totalAmount) * 100],
    [] as number[]
  );


  const labelsClasses = classnames({
    "horizontal-bar__labels__wrapper": !isMobile,
    "horizontal-bar__labels__mobile": isMobile
  });

  const barLabelWrapperClasses = classnames({
    "horizontal-bar__label": !isMobile,
    "horizontal-bar__labels__mobile": isMobile
  });

  useLayoutEffect(() => {
    const persentsToShow = showAllLabels ? [...percents] : percents.slice(0, 3);

    setDesktopLabelsLayoutStyles({
      display: 'grid',
      gridTemplateColumns: persentsToShow.reduce((acc, curr, index) => {
        if (index === 0) {
          const firstBar = document.querySelectorAll('.horizontal-bar__item')[0];
          const chart = document.querySelector('.horizontal-bar__chart')!;

          const firstBarPercentWidth = (firstBar?.clientWidth / chart?.clientWidth) * 100;

          const currentWidth = firstBarPercentWidth < 80 && !showAllLabels ?
            `${firstBar.clientWidth - 12}px` :
            '100fr';

          return persentsToShow.filter(item => item > 0).length > 2 ?
            `${acc} ${currentWidth}` :
            `${acc} ${curr}fr`;
        }

        return `${acc} ${curr}fr`;
      }, '') });
  }, [width]);

  return isDataValid ? (
    <section className="horizontal-bar">
      <section className="horizontal-bar__wrapper">
        <div className="horizontal-bar__chart">
          {sortedData
            .filter((item) => Number(item.data.amount) > 0)
            .map((item, index) => {
              const idx = index > colors.length - 1 ? index - colors.length + 1 : index;
              const barColor = item.data?.barColor || colors[idx];

              return (
                  <div
                    key={item.data.label + index.toString()}
                    className="horizontal-bar__item"
                    style={{
                      minWidth: Number(item.data.amount) > 0 ? '4px' : 0,
                      width: `${percents[index]}%`,
                      backgroundColor: barColor,
                    }}
                  >
                  </div>
              );
            })}
        </div>
        <div
          className={labelsClasses}
          style={ width! >= desktopBreakPoint ? desktopLabelsLayoutStyles : {}}
        >
            {dataForLabels.map((item, idx) => {
                const labelColor = item.data?.barColor || colors[idx > colors.length ? idx - colors.length : idx];

                return (
                  <BarLabel
                    key={item.data.label + idx.toString()}
                    item={{
                      ...item,
                      data: {
                        ...item.data,
                        ...(showPercents && { percent: percents[idx] }),
                        ...(showAmount && { showAmount }),
                      },
                    }}
                    additionalStyle={{ labelColor }}
                    wrapperClassName={barLabelWrapperClasses}
                  />
                );
              })}
          </div>
      </section>
    </section>
  ) : null;
};

export { HorizontalStackedBar };
