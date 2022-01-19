import { shallow, mount } from 'enzyme';
import { useSelector, useDispatch } from 'react-redux';
import { act } from 'react-dom/test-utils';
import { TOGGLE_FOLDER } from '../../../store/reducers/folders';
import Folder from '../Folder.js';
import { DISABLE_STUB } from '../../../store/reducers/stubs.js';

const mockUseDispatch = jest.fn();

jest.mock('webextension-polyfill', () => ({
  runtime: { connect: jest.fn(() => ({ onMessage: { addListener: jest.fn() } })) },
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => mockUseDispatch),
}));

const folder = {
  name: 'Test Folder',
  id: 'calvin',
  open: true,
  stubs: [],
};
const defaultState = { folders: { byHash: { calvin: { ...folder, open: true } } } };
function mockStore(state = defaultState) {
  useSelector.mockImplementation((selector) => selector(state));
}

describe('Folder', () => {
  let wrapper;

  beforeEach(() => {
    mockStore();
    wrapper = shallow(<Folder id={'calvin'} />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // it('renders', () => {
  //   expect(wrapper).toMatchSnapshot();
  // });

  it('shows name from props', () => {
    expect(wrapper.find('input').get(0).props.defaultValue).toEqual('Test Folder');
  });

  it('is open by default', () => {
    expect(wrapper.find('.folder').hasClass('open')).toBe(true);
  });

  it('is closed via state', () => {
    mockStore({ folders: { byHash: { asdf: { ...folder, open: false } } } });
    const component = shallow(<Folder id={'asdf'} />);
    expect(component.find('.folder').hasClass('open')).toBe(false);
  });

  it('closes the folder in the store', () => {
    wrapper.find('.header').simulate('click');
    expect(mockUseDispatch.mock.calls[0][0].type).toBe(TOGGLE_FOLDER);
  });

  // it('can start editing', () => {
  //   mockStore({ folders: { ...defaultState.folders, editing: 'calvin' } });
  //   let component;
  //   act(() => {
  //     component = mount(<Folder id={'calvin'} />);
  //   });
  //   console.log(component.find('input').getElement());
  //   expect(component.find('input').getDOMNode().disabled).toBe(true);
  // });

  // it('transitions to editing after click', () => {
  //   const component = shallow(<Folder key={1} id={0} folder={folder} editing={true} disabled={false} actions={{}} />);
  //   component.find('.edit').simulate('click');
  //   expect(component.find('.folder__name').getDOMNode().disabled).toBe(false);
  // });

  // it('saves edited name after input blur', () => {
  //   const component = shallow(
  //     <Folder key={1} id={0} folder={folder} editing={true} disabled={false} actions={actions} />
  //   );
  //   component.find('.edit').simulate('click');
  //   component.find('.folder__name').simulate('blur');
  //   expect(actions.editFolder).toBeCalled();
  // });

  it('is not disabled with no stubs', () => {
    expect(wrapper.find('.folder').hasClass('disabled')).toBe(false);
  });

  it('is not disabled when stubs are enabled', () => {
    mockStore({ folders: { byHash: { calvin: { ...folder, stubs: ['stub'] } } }, stubs: { stub: {} } });
    const component = shallow(<Folder id={'calvin'} />);
    expect(component.find('.folder').hasClass('disabled')).toBe(false);
  });

  it('is disabled via all stubs being disabled', () => {
    mockStore({ folders: { byHash: { calvin: { ...folder, stubs: ['stub'] } } }, stubs: { stub: { disabled: true } } });
    const component = shallow(<Folder id={'calvin'} />);
    expect(component.find('.folder').hasClass('disabled')).toBe(true);
  });
});
