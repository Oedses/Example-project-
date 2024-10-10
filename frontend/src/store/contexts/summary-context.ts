import Context from './context';

export type SummaryStore = {
  isShown: boolean;
  isSuccess: boolean;

  title: string;
  subtitle: string;

  closeButtonText: string;

  onCloseCallback: () => void;
};


export const initialSummaryState: SummaryStore = {
  isShown: false,
  isSuccess: false,

  title: '',
  subtitle: '',

  closeButtonText: 'close',

  onCloseCallback: () => {}
};

const SummaryContext = new Context(initialSummaryState);

export default SummaryContext;