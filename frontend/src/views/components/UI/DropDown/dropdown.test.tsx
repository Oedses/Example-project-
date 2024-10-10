import Enzyme, { mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

import { DropDown } from '.';
import { DropDownItem } from './DropDownItem';

Enzyme.configure({ adapter: new Adapter() });

describe('<DropDown /> component', () => {
  it('<DropDown /> toggles the rendering of the content by click', () => {
    const dropDown = mount(
      <DropDown
        title='title'
        items={[]}
        maxWidth={1200}
        withArrow
        emptyState='No elements...'
      />);

      const bellButton = dropDown.find("[data-test='dropdown-button']");

      const dropDownContainer = dropDown.find("[data-test='dropdown-container']");
      expect(dropDownContainer).toMatchObject({});

      bellButton.simulate('click');

      expect(dropDownContainer.text()).toEqual('No elements...');

      bellButton.simulate('click');

      expect(dropDownContainer).toMatchObject({});
  });

  it('<DropDown /> renders with no elements', () => {
    const dropDown = mount(
      <DropDown
        title='title'
        items={[]}
        maxWidth={1200}
        withArrow
        emptyState='No elements...'
      />);

      const bellButton = dropDown.find("[data-test='dropdown-button']");

      const dropDownContainer = dropDown.find("[data-test='dropdown-container']");
      expect(dropDownContainer).toMatchObject({});

      bellButton.simulate('click');

      const newDropDownContainer = dropDown.find("[data-test='dropdown-container']");
      expect(newDropDownContainer).toBeTruthy();

      const dropDownItems = dropDown.find("[data-test='dropdown-item']");

      expect(dropDownItems).toMatchObject({});
      expect(dropDownContainer.text()).toEqual('No elements...');
  });

  it('<DropDown /> renders with few elements', () => {
    const items = ['hello', 'world', 'bruh'].map(el => (
      <DropDownItem
        key={el}
        title={el}
      />
    ));

    const dropDown = mount(
      <DropDown
        title='title'
        items={items}
        maxWidth={1200}
        withArrow
        emptyState='No elements...'
      />);

      const bellButton = dropDown.find("[data-test='dropdown-button']");

      const dropDownContainer = dropDown.find("[data-test='dropdown-container']");
      expect(dropDownContainer).toMatchObject({});

      bellButton.simulate('click');

      const newDropDownContainer = dropDown.find("[data-test='dropdown-container']");
      expect(newDropDownContainer).toBeTruthy();

      const dropDownItems = dropDown.find("[data-test='dropdown-item']");
      expect(dropDownItems).toHaveLength(items.length);
  });
});