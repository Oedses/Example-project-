import { createSeparatorsNumber } from "../../../../utils";

export const getOrCreateTooltip = (chart: { canvas: { parentNode: { querySelector: (arg0: string) => any; appendChild: (arg0: any) => void; }; }; }) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
    tooltipEl.style.borderRadius = '3px';
    tooltipEl.style.color = 'white';
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';

    const table = document.createElement('table');
    table.style.margin = '0px';

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

export const externalTooltipHandler = (context: { chart: any; tooltip: any; }) => {
  const { chart, tooltip } = context;

  const isAdminChart = window.location.pathname === '/admin/overview';

  const tooltipEl = getOrCreateTooltip(chart);

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  const tableRoot = tooltipEl.querySelector('table');

  if (tooltip.body) {

    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map((b: { lines: any; }) => b.lines);
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tooltip.beforeBody.forEach((bBody: string, i: number) => {
      const bodyLine = document.createElement('tr');
      const label = document.createElement('td');
      const value = document.createElement('td');

      const valueLabel = bodyLines[0] || 0;

      label.append(`${tooltip.beforeBody[i]}: `);
      if (valueLabel?.length) {
        value.append(`€ ${createSeparatorsNumber(Number(valueLabel[i]))}`);
      } else {
        value.append(`€ ${createSeparatorsNumber(valueLabel)}`);
      }


      if (i === 0 && valueLabel?.length === 2 && Number(valueLabel[0]) > 0) {
        value.style.color = '#28A745';
      }

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

  const tooltipTopDelta = isAdminChart ? 60 : -30;

  tooltipEl.className = 'tooltip';
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  tooltipEl.style.top = tooltip.caretY - tooltipTopDelta + 'px';
};