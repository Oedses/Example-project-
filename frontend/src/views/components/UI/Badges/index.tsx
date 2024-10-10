import { hoc } from '../../../../utils';
import { ArrowDown } from '../../icons';

import { useBadgesProps } from './badges.hook';
import './badges.scss';

const Badges = hoc(useBadgesProps, ({
  t,
  selectRef,

  label,
  allLabel,
  placeholder,
  errorMessage,
  badges,
  availableBadges,
  isOpen,

  onAddOption,
  onToggle,
  onOpen,

  badgesWrapperClasses,
  badgedOptionClasses,
  badgesContainerClasses,
  liClasses,
  liClassesAll,
  onAllOption
}) => (
  <div className={badgesWrapperClasses}>
      {label && <label className="label">{label}</label>}

      <div className={badgesContainerClasses} ref={selectRef}>
        <div className={badgedOptionClasses} onClick={onToggle}>
          <div className='badges__content'>
            {badges?.length ? badges : (
              <p>{placeholder}</p>
            )}
          </div>

          {!isOpen && <ArrowDown width="16px" height="16px" onClick={onOpen} />}
        </div>

        {isOpen && (
          <div className="badges__list-container">
            {availableBadges?.length ? (
              <ul className="badges__list">
                {availableBadges?.length > 1 && (
                  <li
                    className={liClassesAll()}
                    onClick={() => onAllOption()}
                    key={'all'}
                  >
                    <p>
                      {allLabel}
                    </p>
                  </li>
                )}

                {availableBadges.map((option, index) => (
                  <li
                    className={liClasses(option)}
                    onClick={() => onAddOption(option)}
                    key={index}
                  >
                    <p>
                      {option.label}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('components.select.empty')}</p>
            )}
          </div>
        )}
      </div>

      {errorMessage && <span className="badges__error">{errorMessage}</span>}
    </div>
));

export { Badges };