import { Investor, InvestorType, isLegalEntity, isNaturalPerson } from "../../../shared/types/investor";



describe('shared/investor.ts module', () => {
  const naturalPersonsTestData: Partial<Investor>[] = [
    {
      id: "61dd45b430cf4a99bde1b366",
      firstName: "Max",
      lastName: "Zhivaev",
    },
    {
      id: "61dd45b430cf4a99bde1b366",
      address: "13123",
      bsn: "123",
      city: "123",
      companyName: "",
      email: "dizas@me.com",
      firstName: "Max",
      kvk: "",
      lastName: "Zhivaev",
      phone: "+331111111111",
      postcode: "13123",
      type: "Natural person" as InvestorType
    },
    {
      id: "9d8427f1-164c-497d-b08b-dc21ec73ae15",
      companyName: "some company",
    }
  ];

  const legalEntitiesTestData: Partial<Investor>[] = [
    {
      id: "9d8427f1-164c-497d-b08b-dc21ec73ae15",
      type: "Legal entity" as InvestorType,
      companyName: "some company",
      email: "kat220896@bazarmurah.xyz",
      phone: "+5645656456",
      kvk: "12345678",
      address: "gfhfghfghg",
      postcode: "4565fd",
      city: "fghfghf",
      createdAt: new Date("2022-02-17T10:24:20.796Z")
    },
    {
      id: "9d8427f1-164c-497d-b08b-dc21ec73ae15",
      companyName: "some company",
    },
    {
      id: "61dd45b430cf4a99bde1b366",
      firstName: "Max",
      lastName: "Zhivaev",
    },
  ];

  it('\'isNaturalPerson\' detects if investor natural person', () => {

    const expectedData = [true, true, false];
    const fn = jest.fn(isNaturalPerson);

    naturalPersonsTestData.forEach(data => fn(data));

    fn.mock.results.forEach(({ value }, index) => expect(value).toBe(expectedData[index]));
  });

  it('\'isLegalEntity\' detects if investor legal entity', () => {
    const fn = jest.fn(isLegalEntity);

    const expectedData = [true, true, false];

    legalEntitiesTestData.forEach(data => fn(data));

    fn.mock.results.forEach(({ value }, index) => expect(value).toBe(expectedData[index]));
  });
});
