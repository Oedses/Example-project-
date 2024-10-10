import { useState, ReactElement, useEffect, useMemo } from "react";
import Style from "style-it";
import classnames from 'classnames';

import "./tabs.scss";
import { useWindowSize } from "../../Hooks/useWindowSize";
import { Label } from "../../../../../../shared/types/common";

export type TabsProps = {
  selectedId: Label;
  onChange: (selectedId: string) => void;
  children: ReactElement<any>;
};

const Tabs = ({ selectedId, onChange, children }: TabsProps) => {
  const content = children.props.children;

  if (!content.length) return null;
  
  const uniqueId = 'tabs__' + (Math.random() + 1).toString(36).substring(2);
  const [activeTab, setActiveTab] = useState(selectedId.value);

  const [activeTabOffset, setActiveTabOffset] = useState<number[]>([0, 0]);
  const [tabsOffset, setTabsOffset] = useState<number>(41);

  const { width } = useWindowSize();

  const tabsTitles = useMemo(() => content.map((child: any) => child.props.title), [content]);
  const tabsIds = content.map((child : any) => child.props.id);

  const onTabClick = (index: number) => {
    setActiveTab(tabsIds[index]);
    onChange((tabsIds as never)[index]);
  };

  const getActiveTabLeftPos = () => {
    return activeTabOffset[0] < tabsOffset ?
    0 :
    activeTabOffset[0] - tabsOffset;
  };

  const getActiveTabWidth = () => {
    if (activeTabOffset[0] < tabsOffset) {
      return activeTabOffset[1] - tabsOffset;
    }

    return activeTabOffset[1] - activeTabOffset[0];
  };

  const styles = `
  #${uniqueId} .tabs__titles + span::after {
    left: ${getActiveTabLeftPos()}px;
    width: ${getActiveTabWidth()}px;
    }
  `;

  const tabTitleClases = (id: string) => classnames("tabs__titles-item", {
    "tabs__titles-item-active": id === activeTab
  });

  useEffect(() => {
    const activeTitle = document.querySelector(`#${uniqueId} .tabs__titles-item-active`);

    if (!activeTitle) return;

    const { left, right } = activeTitle.getBoundingClientRect();

    setActiveTabOffset([left, right]);
  }, [activeTab, width, tabsTitles]);

  useEffect(() => {
    const tabsEl = document.querySelector(`#${uniqueId} .tabs__container`)!;
    const activeTitle = document.querySelector(`#${uniqueId} .tabs__titles-item-active`)!;

    tabsEl!.addEventListener('scroll', () => {
      const { left, right } = activeTitle.getBoundingClientRect();

      setActiveTabOffset([left, right]);
    });
  }, [activeTab, tabsTitles]);

  useEffect(() => {
    const tabsEl = document.querySelector(`#${uniqueId} .tabs__container`)!;
    const { left } = tabsEl?.getBoundingClientRect();

    setTabsOffset(left);

  }, [width]);

  return (
        <Style>
          {styles}
          <section id={uniqueId} className="tabs">
            <div className="tabs__container">
              <ol className="tabs__titles">
                  {tabsTitles.map((title: string, index: number) => (
                    <li
                      key={title + index}
                      className={tabTitleClases(tabsIds[index])}
                      onClick={() => onTabClick(index)}
                    >
                      <h4 className="tab__title">
                        {title}
                      </h4>
                      <span className="tab__addons">
                        {!isNaN(Number(content[index].props?.rightAddons)) ? content[index].props?.rightAddons : ''}
                      </span>
                    </li>
                  ))}
              </ol>

              <span></span>
            </div>

            <section className="tabs__content">
              {content.find((child: any) => child.props.id === activeTab)}
            </section>
          </section>
       </Style>
  );
};

export default Tabs;
