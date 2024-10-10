import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';

import { disableScroll, enableScroll } from '../../../../utils';

import { useWindowSize } from '../../Hooks/useWindowSize';

import { StrokeArrowIcon } from '../../icons';

import './dropdown.scss';
import { Spinner } from '../Spinner';

export type DropDownProps = {
  title: string | JSX.Element;
  titleLabel?: string | number;
  maxWidth?: number;
  withArrow: boolean
  items?: any[] | JSX.Element[];
  responsive?: boolean;
  wrapperClassName?: string;
  mobileClassName?: string;
  emptyState: string;
  footer?: JSX.Element;
  onBlur?: () => void;
  onSwitchCallback?: (isDropped: boolean) => void;
  isFetching?: boolean
};

const DropDown = ({
  title,
  items,
  maxWidth,
  withArrow,
  titleLabel,
  mobileClassName,
  wrapperClassName,
  emptyState,
  footer,
  onBlur,
  onSwitchCallback,
  isFetching
}: DropDownProps) => {
  const [isDropped, setIsDropped] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { width } = useWindowSize();

  const onToggleDropDown = () => {
    if (!mobileClassName && maxWidth && width! < maxWidth) return enableScroll();
    setIsDropped(dropped => !dropped);
  };

  const onToggle = (value: boolean) => {
    if (!mobileClassName && maxWidth && width! < maxWidth) return enableScroll();
    setIsDropped(value);
  };

  const onDropdownBlur = () => {
    onToggle(false);
    if (onBlur) onBlur();
  };

  useEffect(() => {
    if (!mobileClassName && maxWidth && width! < maxWidth) {
      setIsDropped(true);
      enableScroll();
    }
    if (width! > maxWidth!) setIsDropped(false);
  }, [width, maxWidth, mobileClassName]);

  useEffect(() => {
    if (isDropped) {
      disableScroll();
    }
    else enableScroll();

    if (onSwitchCallback) onSwitchCallback(isDropped);
  }, [isDropped]);

  useEffect(() => {
    const onClickOutside = (event: globalThis.MouseEvent) => {
      if (isDropped && dropdownRef.current && !dropdownRef.current.contains(event.target as any)) {
        onToggle(false);
      }
    };
    document.addEventListener('click', onClickOutside, true);
    return () => {
      document.removeEventListener('click', onClickOutside, true);
    };
  }, [onDropdownBlur]);

  return (
    <section
      className={classnames("dropdown", wrapperClassName, {
        [mobileClassName!]: mobileClassName && maxWidth && width! < maxWidth
      })}
      ref={dropdownRef}
      >
      {(mobileClassName || !maxWidth || (maxWidth && width! > maxWidth)) && (
        <div
        className="dropdown__title"
        data-test="dropdown-button"
        onClick={onToggleDropDown}
        >
          <h5>
            {title}

            {titleLabel && titleLabel !== '0' ? (
              <span>
                {titleLabel}
              </span>
            ) : null}
          </h5>
          {withArrow && (
            <StrokeArrowIcon width="16px" height="8px" rotate={isDropped ? 0 : 180} />
          )}
        </div>
      )}

      {isDropped && (
        <div className={classnames("dropdown__container", {
          "dropdown__container-mobile": maxWidth && width! < maxWidth
        })} data-test="dropdown-container">
          <div className={classnames("dropdown__items", {
            "dropdown__items-mobile": maxWidth && width! < maxWidth
          })}>
            {isFetching ? <Spinner /> : (
              items?.length ? items  : emptyState
            )}
          </div>
          <section >
            { footer }
          </section>
        </div>
      )}
    </section>
  );
};

export { DropDown };