import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { InputDefaultProps } from '../../../../../../shared/types/common';

import { Option } from '../Select';
import { BadgeItem } from './BadgeItem';

export enum BadgeOperation {
  add,
  remove
}

export interface BadgesProps extends InputDefaultProps {
  options?: Option[];
  values?: Option[] | null;
  onChange?: (v: Option, operation: BadgeOperation) => void;
}

const useBadgesProps = ({
  label,
  className,
  errorMessage,
  placeholder,
  options,
  values,
  disabled,
  onChange
}: BadgesProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [availableBadges, setAvailableBadges] = useState<Option[]>([]);

  const selectRef = useRef<HTMLDivElement>(null);

  const { t, i18n } = useTranslation();

  const allLabel = useMemo(() => t('components.badges.all'), [i18n.language]);

  const onToggle = () => !disabled && setIsOpen(!isOpen);
  const onOpen = () => !disabled && setIsOpen(true);

  const isOptionActive = (option: Option) => {
    if (!values) return false;

    return values.some(el => Object.keys(el).every(key => el[key as keyof Option] === option[key as keyof Option]));
  };

  const onClick = (e: MouseEvent) => {
    if (disabled) return;

    if (selectRef.current && !selectRef.current.contains(e.target as Node) &&
      (e.target as Node).nodeName !== 'svg' &&
      (e.target as Node).nodeName !== 'path'
    ) {
      setIsOpen(false);
    }
  };

  const onAddOption = (selectedOption: Option) => {
    setIsOpen(false);

    if (!isOptionActive(selectedOption)) {
      onChange!(selectedOption, BadgeOperation.add);
    }
  };

  const onAllOption = () => {
    setIsOpen(false);

    availableBadges.map(option => {
      if (!isOptionActive(option)) {
        onChange!(option, BadgeOperation.add);
      }
    });
  };

  const badgesWrapperClasses = classNames('badges', className, {
    badges_opened: isOpen
  });

  const badgedOptionClasses = classNames('badges__selected-option', {
    'badges__selected-option_placeholder': !values && placeholder,
    badges_disabled: disabled
  });


  const badgesContainerClasses = classNames("badges__container", {
    "badges__container-with-error": errorMessage
  });

  const liClasses = (option: Option) => classNames('badges__option', {
    'badges__option-active': isOptionActive(option)
  });

  const liClassesAll = () => classNames('badges__option', {
    'badges__option-active': options?.length === values?.length
  });


  const badges = useMemo(() => {
    if (!values) return [];

    return values.map((option) => (<BadgeItem key={option.value} value={option} onRemove={() => onChange!(option, BadgeOperation.remove)} />));
  }, [values]);

  useEffect(() => {
    const selectedValues = values ? values.map(badge => badge.value) : [];

    setAvailableBadges(options ? options.filter(badge => !selectedValues.includes(badge.value)) : []);
  }, [values, options]);

  useEffect(() => {
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return {
    t,
    selectRef,

    label,
    allLabel,
    placeholder,
    errorMessage,
    badges,
    availableBadges,
    isOpen,

    onClick,
    onAddOption,
    onToggle,
    onOpen,

    badgesWrapperClasses,
    badgedOptionClasses,
    badgesContainerClasses,
    liClasses,
    liClassesAll,
    onAllOption
  };
};

export { useBadgesProps };
