import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "..";
import { delay } from "../../../../utils/fn";

import { ArrowLeft, ArrowRight } from "../../icons";
import { ButtonView } from "../Button/button.props";

import { PaginationProps } from "./pagination.props";
import "./pagination.scss";

const Pagination = ({
  scrollRef,
  from,
  to,
  total,
  delta,
  showNext,
  showPrev,
  disabledPrev,
  disabledNext
}: PaginationProps) => {
  const { t } = useTranslation();

  const onScrollToView = () => {
    let topPosition = 0;

    if (scrollRef && scrollRef.current) {
      topPosition = scrollRef.current.offsetTop;
    }
    
    window.scrollTo(0, topPosition);
  };

  const onNextClick = () => {
    onScrollToView();
    delay(() => {
      if (showNext) showNext();
    }, 300);
  };

  const onPrevClick = () => {
    onScrollToView();
    delay(() => {
      if (showPrev) showPrev();
    }, 300);
  };

  const pageTo = to > total ? total : to;

  return (
    <div className="pagination">
      <div className="pagination__counter">
        <p>
          {t("pages.products.table.foot.show", { from, to: pageTo, total })}
        </p>
      </div>

      {total > delta ? (
        <div className="pagination__controls">
          <Button
            view={ButtonView.unfilled}
            onClick={onPrevClick}
            disabled={disabledPrev !== undefined ? disabledPrev || pageTo === delta : pageTo === delta}
          >
            <ArrowLeft
              className="pagination__left-arrow"
              width="16px"
              height="16px"
            />

            {t("pages.products.table.foot.prevBtn", { delta })}
          </Button>

          <Button
            view={ButtonView.unfilled}
            onClick={onNextClick}
            disabled={disabledNext || false}
          >
            {t("pages.products.table.foot.nextBtn", { delta })}

            <ArrowRight
              className="pagination__right-arrow"
              width="16px"
              height="16px"
            />
          </Button>
        </div>
      ) : null}

    </div>
  );
};

export default Pagination;
