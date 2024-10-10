export type NewsItem = {
  date: Date | string;
  title: string;
  content: string;
  id?: string | number;
};

export const mockNews: NewsItem[] = [
  {
    date: '10-07-2021',
    title: 'AEX doet klein stapje terug',
    content: 'De Amsterdamse beurs is deze week per saldo licht gedaald.',
    id: 'hello-news'
  },
  {
    date: '10-07-2021',
    title: 'Olieprijs hoger gesloten',
    content: 'De prijs voor een vat ruwe olie is vrijdag hoger gesloten.',
    id: 'hello-news2'
  },
  {
    date: '10-07-2021',
    title: 'Europese beurzen hoger gesloten',
    content: 'De Europese beurzen zijn vrijdag hoger gesloten, na een slechte donderdag.',
    id: 'hello-nes'
  },
  {
    date: '09-07-2021',
    title: 'Beursagenda: Nederlandse bedrijven',
    content: '',
    id: 'hello-nws'
  },
  {
    date: '09-07-2021',
    title: 'Update: ING in gesprek over Oostenrijkse activiteiten',
    content: 'ING is in gesprek met bank99 van de Österreichische Post over de retailtak in Oostenrijk.',
    id: 'hello-n5ews'
  },
  {
    date: '09-07-2021',
    title: 'Update: ING in gesprek over Oostenrijkse activiteiten',
    content: 'ING is in gesprek met bank99 van de Österreichische Post over de retailtak in Oostenrijk.',
    id: 'hello-n3ews'
  },
  {
    date: '09-07-2021',
    title: 'Update: ING in gesprek over Oostenrijkse activiteiten',
    content: 'ING is in gesprek met bank99 van de Österreichische Post over de retailtak in Oostenrijk.',
    id: 'hello5-news'
  },

];