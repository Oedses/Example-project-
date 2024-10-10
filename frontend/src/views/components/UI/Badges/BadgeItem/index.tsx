import './../badges.scss';

import { Option } from './../../Select';

type BadgeItemProps = {
  value: Option;
  onRemove: () => void;
};

const BadgeItem = ({ value, onRemove }: BadgeItemProps) => (
  <div className="badge__item">
    <div className="badge__item--text">
      <p>{value.label}</p>
    </div>

    {/* &#10006; */}
    {/* &#x2715; */}
    <button type='button' onClick={onRemove}>
      <span>
        &#x2715;
      </span>
    </button>
  </div>
);

export { BadgeItem };