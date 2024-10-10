import { Holding } from '../../../shared/types/holding';
import { Product } from '../../../shared/types/product';
import { formatDate, getProductTotalAmount, toCamelCase, transpose } from './fn';

describe('fn.ts module', () => {
  describe('formatDate function', () => {
    let fn: jest.Mock<ReturnType<typeof formatDate>, Parameters<typeof formatDate>>;

    afterEach(() => fn.mockClear());

    const formatDateTestData = [
      '2022-02-04T02:15:00.000Z',
      '2022-01-31T09:01:00.000Z',
      '2022-01-01T13:14:00.000Z',
      '2022-01-04T22:00:00.000Z',
      '09-09-2022',
      undefined
    ];

    it('returns correct date withTimezone', () => {
      fn = jest.fn(formatDate);

      const expectedData = [
        '2022-02-04T00:00:00.000Z',
        '2022-01-31T00:00:00.000Z',
        '2022-01-01T00:00:00.000Z',
        '2022-01-04T00:00:00.000Z',
        'N/A',
        'N/A'
      ];

      formatDateTestData.forEach(data => fn(data, false, true));

      fn.mock.results.forEach(({ value }, index) => expect(value).toBe(expectedData[index]));
    });

    it('returns correct date without time', () => {
      fn = jest.fn(formatDate);

      const expectedData = [
        '04-02-2022',
        '31-01-2022',
        '01-01-2022',
        '04-01-2022',
        'N/A',
        'N/A'
      ];

      formatDateTestData.forEach(data => fn(data));

      fn.mock.results.forEach(({ value }, index) => expect(value).toBe(expectedData[index]));
    });

    it('returns correct date with time', () => {
      fn = jest.fn(formatDate);

      const expectedData = [
        '04-02-2022 02:15',
        '31-01-2022 09:01',
        '01-01-2022 13:14',
        '04-01-2022 22:00',
        'N/A',
        'N/A'
      ];

      formatDateTestData.forEach(data => fn(data, true));

      fn.mock.results.forEach(({ value }, index) => expect(value).toBe(expectedData[index]));
    });
  });

  describe('toCamelCase function', () => {
    let fn: jest.Mock<ReturnType<typeof toCamelCase>, Parameters<typeof toCamelCase>>;

    afterEach(() => fn.mockClear());

    it('returns the word in lowercase if string is from one word', () => {
      fn = jest.fn(toCamelCase);

      const testData = [
        'Address',
        'email'
      ];

      const expectedData = testData.map(el => el.toLowerCase());

      testData.forEach(data => fn(data));

      fn.mock.results.forEach(({ value }, index) => expect(value).toEqual(expectedData[index]));
    });

    it('returns the word sequence as camelCase word', () => {
      fn = jest.fn(toCamelCase);

      const testData = [
        'Company name',
        'Kvk number',
        'variable to be camel cased'
      ];

      const expectedData = [
        'companyName',
        'kvkNumber',
        'variableToBeCamelCased'
      ];

      testData.forEach(data => fn(data));

      fn.mock.results.forEach(({ value }, index) => expect(value).toEqual(expectedData[index]));
    });
  });

  describe('getProductTotalAmount function', () => {
    let mockGetProductTotalAmount: jest.Mock<ReturnType<typeof getProductTotalAmount>, Parameters<typeof getProductTotalAmount>>;

    afterEach(() => mockGetProductTotalAmount.mockClear());

    describe('with array of \"Products\"', () => {
      it('returns correct total amount with CORRECT array', () => {
        mockGetProductTotalAmount = jest.fn(getProductTotalAmount);

        const correctProductsData: Partial<Product>[] = [
          {
            "ticketSize": 1000000,
            "quantity": 50,
          },
          {
            "ticketSize": 100000,
            "quantity": 5000,
          }
        ];

        const expectedData = [
          50000000,
          500000000
        ];

        correctProductsData.forEach(product => mockGetProductTotalAmount(product as Product));

        mockGetProductTotalAmount.mock.results.forEach(({ value }, index) => expect(value).toEqual(expectedData[index]));
      });

      it('returns \"0\" as total amount with INCORRECT array', () => {
        mockGetProductTotalAmount = jest.fn(getProductTotalAmount);

        const incorrectProductsData: Partial<Product>[] = [
          {
            "ticketSize": 1000000,
            "quantity": undefined,
          },
          {
            "ticketSize": undefined,
            "quantity": 5000,
          }
        ];

        const expectedData = [
          0,
          0
        ];

        incorrectProductsData.forEach(product => mockGetProductTotalAmount(product as Product));

        mockGetProductTotalAmount.mock.results.forEach(({ value }, index) => expect(value).toEqual(expectedData[index]));
      });
    });

    describe('with array of \"Holdings\"', () => {
      it('returns correct total amount with CORRECT array', () => {
        mockGetProductTotalAmount = jest.fn(getProductTotalAmount);

        const correctHoldingData: Partial<Holding>[] = [
          {
            "price": 1000000,
            "quantity": 50,
          },
          {
            "price": 100000,
            "quantity": 5000,
          }
        ];

        const expectedData = [
          50000000,
          500000000
        ];

        correctHoldingData.forEach(product => mockGetProductTotalAmount(product as Product));

        mockGetProductTotalAmount.mock.results.forEach(({ value }, index) => expect(value).toEqual(expectedData[index]));
      });

      it('returns \"0\" as total amount with INCORRECT array', () => {
        mockGetProductTotalAmount = jest.fn(getProductTotalAmount);

        const incorrectHoldingData: Partial<Holding>[] = [
          {
            "price": 1000000,
            "quantity": undefined,
          },
          {
            "price": undefined,
            "quantity": 5000,
          }
        ];

        const expectedData = [
          0,
          0
        ];

        incorrectHoldingData.forEach(holding => mockGetProductTotalAmount(holding as Holding));

        mockGetProductTotalAmount.mock.results.forEach(({ value }, index) => expect(value).toEqual(expectedData[index]));
      });
    });
  });

  describe('transpose function', () => {
    let mockTranspose: jest.Mock<ReturnType<typeof transpose>, Parameters<typeof transpose>>;

    afterEach(() => mockTranspose.mockClear());

    it('returns empty array with falsy values or empty array', () => {
      mockTranspose = jest.fn(transpose);

      const inputData = [
        [],
        [[]]
      ];

      const expectedData = [
        [],
        []
      ];

      inputData.forEach(data => mockTranspose(data));

      mockTranspose.mock.results.forEach(({ value }, index) => expect(value).toEqual(expectedData[index]));
    });

    it('returns transponated array of NxN dimensions', () => {
      mockTranspose = jest.fn(transpose);

      const inputData = [
        [
          [1, 2],
          [1, 2],
        ],
        [
          [1, 2, 3],
          [1, 2, 3],
          [1, 2, 3]
        ],
        [
          [1, 2, 3, 4],
          [1, 2, 3, 4],
          [1, 2, 3, 4],
          [1, 2, 3, 4]
        ],
      ];

      const expectedData = [
        [[1, 1], [2, 2]],
        [
          [1, 1, 1],
          [2, 2, 2],
          [3, 3, 3],
        ],
        [
          [1, 1, 1, 1],
          [2, 2, 2, 2],
          [3, 3, 3, 3],
          [4, 4, 4, 4],
        ],
      ];

      inputData.forEach(data => mockTranspose(data));

      mockTranspose.mock.results.forEach(({ value }, index) => expect(value).toEqual(expectedData[index]));
    });
  });
});