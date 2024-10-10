import { createSeparatorsNumber } from "../../../../utils/fn";
import { getOrCreateTooltip } from "../LineChart/line-chart.utils";

export const externalTooltipHandler = (context: { chart: any; tooltip: any; }) => {
  const { chart, tooltip } = context;

  const tooltipEl = getOrCreateTooltip(chart);

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  const tableRoot = tooltipEl.querySelector('table');

  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const tooltipHead = document.createElement('thead');

    titleLines.forEach((title: string) => {
      const titleLine = document.createElement('tr');

      const text = document.createElement('td');
      text.textContent = title;

      titleLine.className = 'tooltip__title';

      titleLine.appendChild(text);
      tooltipHead.appendChild(titleLine);
    });

    const tooltipBody = document.createElement('tbody');
    tooltipBody.className = 'tooltip__body';

    tooltip.body[0].before.forEach((rowLabel: string, i: number) => {
      const bodyLine = document.createElement('tr');
      const label = document.createElement('td');
      const value = document.createElement('td');

      label.append(`${rowLabel}: `);

      value.append(`€ ${createSeparatorsNumber(Number(tooltip.body[0].after[i]))}`);

      bodyLine.style.color = '#000000';

      bodyLine.appendChild(label);
      bodyLine.appendChild(value);
      tooltipBody.appendChild(bodyLine);
    });


    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    tableRoot.appendChild(tooltipHead);
    tableRoot.appendChild(tooltipBody);
  }

  const { offsetLeft: positionX } = chart.canvas;

  tooltipEl.className = 'tooltip';
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  tooltipEl.style.top = tooltip.caretY - 30 + 'px';
};