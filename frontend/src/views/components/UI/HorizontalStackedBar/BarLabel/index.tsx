import NumberFormat from "react-number-format";
import classnames from "classnames";

import { HorizontalStackedBarData } from "..";

export type BarLabelProps = {
  item: HorizontalStackedBarData,
  wrapperClassName?: string;
  additionalStyle?: { [k: string]: string | number };
  label?:string
};

const BarLabel = ({ label, item, wrapperClassName, additionalStyle }: BarLabelProps) => (
  <div className={wrapperClassName || 'horizontal-bar__labels'}>
    <div
      key={item.data.label}
      className={`${wrapperClassName || 'horizontal-bar__labels'}-item`}
      style={additionalStyle}
    >
      <span
        className={`${wrapperClassName || 'horizontal-bar__labels'}-dot`}
        style={{ backgroundColor: additionalStyle?.labelColor as string }}
      />

      <div className={`${wrapperClassName || 'horizontal-bar__labels'}-wrapper`}>
        <div className={`${wrapperClassName || 'horizontal-bar__labels'}-title`}>
          <span className={`${wrapperClassName || 'horizontal-bar__labels'}-label`}>
            {label || item.data.label}
          </span>

          {item.data?.percent && (
            <span className={classnames(`${wrapperClassName || 'horizontal-bar__labels'}-percent`, {
              'new-line': !item.data.showAmount
            })}>
              {item.data.percent.toFixed(0)}&nbsp;%
            </span>
          )}
        </div>

        {!item.data?.percent && (
          <div className={`${wrapperClassName || 'horizontal-bar__labels'}-amount`}>
            <NumberFormat
              value={Number(item.data.amount)}
              displayType={"text"}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator="."
              decimalSeparator=","
              prefix={"€\u00a0"}
            />
          </div>
        )}
      </div>
    </div>
  </div>
);

export { BarLabel };
