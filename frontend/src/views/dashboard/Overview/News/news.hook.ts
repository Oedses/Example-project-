import { NewsItem } from "./news.constants";

type useNewsProps = {
  news?: NewsItem[];
};

type Activity = {
  [k: string]: NewsItem[]
};

const useNews = ({ news }: useNewsProps) => {
  let sortedData = news!.reduce((acc, curr) => {
    if (!acc[curr.date as string]) {
      return { ...acc, [curr.date as string]: [curr] };
    }

    return { ...acc, [curr.date as string]: [...acc[curr.date as string], curr] };

  }, {} as Activity);

  const dateKeys = Object.keys(sortedData).sort((curr, next) => {
    const [cDay, cMonth, cYear] = curr.split('-');
    const [nDay, nMonth, nYear] = next.split('-');

    const currSeconds = new Date(Number(cYear), Number(cMonth) - 1, Number(cDay)).getTime();
    const nextSeconds = new Date(Number(nYear), Number(nMonth) - 1, Number(nDay)).getTime();

    return currSeconds - nextSeconds;
  });

  return {
    dateKeys,
    sortedData
  };
};

export { useNews };