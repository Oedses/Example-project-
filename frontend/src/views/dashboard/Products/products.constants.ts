import { t } from "i18next";
import { Roles, Status } from "../../../../../shared/types/common";
import { Issuer } from "../../../../../shared/types/issuer";
import { Product, isInterestProduct } from "../../../../../shared/types/product";
import {  ProductCategory } from "../../../../../shared/types/product";

import { formatDate } from "../../../utils/fn";

import { DateUtils } from "../../components/UI/DatePicker/datepicker.utils";
import { Row, TableCellTypes, TableCell } from "../../components/UI/Table";
import { MAX_VALUE_LENGTH } from "../../components/UI/Table/table.constants";

export const limitStep = 10;

const tPath = 'components.table';

export const rolesForCreate = [
  Roles.admin
];

export const centeredColumns = {
  investor: [3, 4, 6],
  admin: [3, 5],
  issuer: [2, 4],
  compliance: [3, 5]
};

const tableHeads = {
  investor:[
    "pages.products.table.head.product",
    "pages.products.table.head.issuer",
    "pages.products.table.head.category",
    "pages.products.table.head.volume",
    "pages.products.table.head.ticketSize",
    "pages.products.table.head.paymentType",
    "pages.products.table.head.couponRate",
    "pages.products.table.head.maturity",
  ],
  admin: [
    "pages.products.table.head.product",
    "pages.products.table.head.issuer",
    "pages.products.table.head.category",
    "pages.products.table.head.volume",
    "pages.products.table.head.paymentType",
    "pages.products.table.head.couponRate",
    "pages.products.table.head.maturity",
    "pages.products.table.head.status"
  ],
  issuer: [
    "pages.products.table.head.product",
    "pages.products.table.head.category",
    "pages.products.table.head.volume",
    "pages.products.table.head.paymentType",
    "pages.products.table.head.couponRate",
    "pages.products.table.head.maturity",
    "pages.products.table.head.status"
  ],
  compliance: [
    "pages.products.table.head.product",
    "pages.products.table.head.issuer",
    "pages.products.table.head.category",
    "pages.products.table.head.volume",
    "pages.products.table.head.paymentType",
    "pages.products.table.head.couponRate",
    "pages.products.table.head.maturity",
    "pages.products.table.head.status",
  ]
};

export const theadData = (role: Roles = Roles.investor): string[] => tableHeads[role];

export const createProductsExportData = ( data: Product[], role: Roles ) => {

  if (!data) return [];

  let exportData = [];

  exportData = data.map((product: Product) => {
    
    const name =  product.name;

    const issuer = (product.issuer as Pick<Issuer, "id" | "name">).name;

    const category = t(`${tPath}.products.category.${product.category.toLowerCase()}`);

    const availableVolume = ((product.realAvailableVolume! || product.availableVolume!) * product.ticketSize!);

    const paymentType = t(`${tPath}.products.type.${(product.paymentType).toLowerCase()}`);

    const couponRate = isInterestProduct(product) ? `${product.couponRate} %` : "N/A";

    const maturityDate = isInterestProduct(product) ? DateUtils.addDeltaToDate(new Date(product.listingDate!), {
      ...DateUtils.defaultDelta,
      [product.maturityUnit as string]: product.maturity
    }, true) : null;

    const maturity = maturityDate ? formatDate(maturityDate.toISOString()) : "N/A";

    const status = product.status || Status.processing;

    const isAccessRole = (role === Roles.admin || role === Roles.compliance);

    let retValue = isAccessRole ? {
      product: name,
      issuer: issuer,
      category: category,
      availableVolume: availableVolume,
      paymentType: paymentType,
      couponRate: couponRate,
      maturity: maturity,
      status: status,
    } : {
      product: name,
      category: category,
      availableVolume: availableVolume,
      paymentType: paymentType,
      couponRate: couponRate,
      maturity: maturity,
      status: status,
    };

    return retValue;
  });

  return exportData;
};

export const createProductRows = (data: Product[], role: Roles = Roles.investor): Row[] => {
  return data.map((product: Product) => {
    const productName = product.name;
    const isProductNameWithTooltip = productName.length > MAX_VALUE_LENGTH;

    const name = {
      type: TableCellTypes.STRING,
      value: productName,
      withTooltip: isProductNameWithTooltip
    };

    const category = {
      type: TableCellTypes.STRING,
      value: t(`${tPath}.products.category.${product.category.toLowerCase()}`)
    };
    
    let issuer = {
      type: TableCellTypes.STRING,
      value: (product.issuer as Pick<Issuer, "id" | "name">).name,
    };
    issuer = { ...issuer, withTooltip: issuer.value.length > MAX_VALUE_LENGTH } as any;

    const totalVolume = {
      type: TableCellTypes.CURRENCY,
      value: ((product.realAvailableVolume! || product.availableVolume!) * product.ticketSize!)
    };

    const couponRate = {
      type: TableCellTypes.STRING,
      value: isInterestProduct(product) ? `${product.couponRate} %` : "N/A",
    };

    const maturityDate = isInterestProduct(product) ? DateUtils.addDeltaToDate(new Date(product.listingDate!), {
      ...DateUtils.defaultDelta,
      [product.maturityUnit as string]: product.maturity
    }, true) : null;

    const maturity = {
      type: TableCellTypes.STRING,
      value: maturityDate
        ? formatDate(maturityDate.toISOString())
        : "N/A",
    };

    const status = {
      type: TableCellTypes.STATUS,
      value: t(
        `${tPath}.status.${(product.status || Status.processing).toLowerCase()}`
      ),
      status: product.status || Status.processing,
    };

    const paymentType = {
      type: TableCellTypes.STRING,
      value: t(
        `${tPath}.products.type.${(product.paymentType).toLowerCase()}`
      ),
    };

    const ticketSize = {
      type: TableCellTypes.CURRENCY,
      value: product?.ticketSize ? (product.ticketSize).toString() : "N/A"
    };

    const rowData = {
      type: TableCellTypes.ROW_DATA,
      value: product.id || "",
      rowData: {
        navigateUrl: `/products/${product.id}`,
      }
    };

    const tableRows = {
      investor: [
        name,
        issuer,
        category,
        totalVolume,
        ticketSize,
        paymentType,
        couponRate,
        maturity,
        rowData
      ],
      admin: [
        name,
        issuer,
        category,
        totalVolume,
        paymentType,
        couponRate,
        maturity,
        status,
        rowData
      ],
      issuer: [
        name,
        category,
        totalVolume,
        paymentType,
        couponRate,
        maturity,
        status,
        rowData
      ],
      compliance: [
        name,
        issuer,
        category,
        totalVolume,
        paymentType,
        couponRate,
        maturity,
        status,
        rowData
      ]
    };

    return tableRows[role] as TableCell[];
  });
};


type TypeProductCategory = {
  [key in ProductCategory]: string;
} & { [all:string]: string };


export const MappingProductCategory: TypeProductCategory = {
  Bond: "pages.products.productCategory.bond",
  Certificate: "pages.products.productCategory.certificate",
  Share: "pages.products.productCategory.share",
  all: "pages.products.productCategory.all",
};