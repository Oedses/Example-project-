import React, { DetailedHTMLProps, HTMLAttributes } from "react";
import { Modify } from "../../../../../../../shared/types/common";
import { CheckMarkIcon } from "../../../icons";
import Button from "../../Button";
import { ButtonView } from "../../Button/button.props";

export type NotificationsFooterProps = Modify<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {
  data: {
    content: JSX.Element;
    onClick: () => void;
  }[]
}>;

const NotificationsFooter = ({ data, className }: NotificationsFooterProps) => (
  <section className={className}>
    {data.map((item, index) => (
      <Button
        key={index}
        view={ButtonView.unfilled}
        className='notifications__footer--button'
        fullWidth
        onClick={item.onClick}
      >
        <CheckMarkIcon />

        {item.content}
      </Button>
    ))}
  </section>
);

export { NotificationsFooter };