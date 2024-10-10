import { t } from "i18next";
import {
  ComplianceLogItem,
  Roles,
} from "../../../../../shared/types/common";

import {
  formatDate,
  getActionNameValue,
} from "../../../utils";

import { Row, TableCellTypes, TableCell } from "../../components/UI/Table";
import ComplianceActionTooltip from "./ComplianceTooltip";

export const limitStep = 10;

const tPath = 'components.table.complianceLog';

export const getRequestedName = (
  requestedBy: ComplianceLogItem["requestedBy"] | undefined
): string => {
  if (!requestedBy) return "-";

  if (
    requestedBy?.role === Roles.admin ||
    (requestedBy?.role === Roles.investor &&
      requestedBy.type === "Natural person")
  )
    return `${requestedBy.firstName} ${requestedBy.lastName}`;

  if (
    requestedBy?.role === Roles.investor &&
    requestedBy.type === "Legal entity"
  )
    return requestedBy?.companyName;

  if (requestedBy?.role === Roles.issuer) return requestedBy?.name as string;

  return "-";
};

export const createComplianceLogExportData = ( data: ComplianceLogItem[], isCompliancePage: boolean ) => {

  if (!data) return [];

  let exportData = [];

  exportData = data.map((item: ComplianceLogItem) => {
    const date = formatDate(item.date);

    const relatedBy = getRequestedName(item.requestedBy);
  
    const isArrayPayment = item.action.investors && item.action.investors?.length > 0 || false;
    let actionType = t(`${tPath}.action.${getActionNameValue(item.action)}`);

    if (isArrayPayment) {
      actionType += ' ' + t(`${tPath}.toAllInvestors`);
    }

    const relatedTo = item.action.entityName;

    const remarks = item.remarks || "";

    const status = item.status;

    let retValue = isCompliancePage ? {
      date: date,
      relatedBy: relatedBy,
      actionType: actionType,
      relatedTo: relatedTo,
      remarks: remarks,
      status: status
    } : {
      date: date,
      actionType: actionType,
      relatedTo: relatedTo,
      remarks: remarks,
      status: status
    };

    return retValue;
  });

  return exportData;
};

export const createComplianceLogRows = (
  userId: string,
  data: ComplianceLogItem[],
  onOpenComplianceDetails: (id: string) => void,
  isCompliancePage: boolean
): Row[] => {
  if (!data) return [];

  return data.map((item: ComplianceLogItem) => {
    const logDate = {
      type: TableCellTypes.DATE,
      value: formatDate(item.date),
    };

    const isArrayPayment = item.action.investors && item.action.investors?.length > 0 || false;

    const requestedBy = {
      type: TableCellTypes.STRING_WITH_LINK,
      value: "",
      stringWithLinkData: [
        {
          type: TableCellTypes.STRING,
          value: getRequestedName(item.requestedBy),
        },
        {
          type: TableCellTypes.STRING,
          contentClasses: 'form__entity-bg',
          value: item.requestedBy?.role,
        },
      ]
    };

    let actionNameValue = t(`${tPath}.action.${getActionNameValue(item.action)}`);

    if (isArrayPayment) {
      actionNameValue += ' ' + t(`${tPath}.toAllInvestors`);
    }

    const actionName: TableCell[] = [
      {
        type: TableCellTypes.STRING,
        value: actionNameValue,
      },
    ];

    const receiverData = item.action.receiver ? [
      {
        type: TableCellTypes.STRING,
        value: t(`${tPath}.to`),
      },
      {
        type: TableCellTypes.STRING,
        value: item.action.receiver?.name,
        onClick: `/${item.action.receiver.role}/${item.action.receiver?.id}`,
      }
    ] : [];

    const action = {
      type: TableCellTypes.STRING_WITH_LINK,
      value: "",
      tooltip: <ComplianceActionTooltip items={item.action.investors} />,
      stringWithLinkData: [
        ...actionName,
        ...receiverData
      ],
    };

    const requestedTo = {
      type: TableCellTypes.STRING,
      value: item.action.entityName,
    };

    const remarks = {
      type: TableCellTypes.STRING,
      value: item.remarks || "",
    };

    const status = {
      type: TableCellTypes.STATUS,
      value: item.status,
      status: item.status,
    };

    const rowData = {
      type: TableCellTypes.ROW_DATA,
      value: item.id || "",
      rowData: {
        callback: () => onOpenComplianceDetails(item.id!),
      }
    };

    if (!isCompliancePage) {
      return [
        rowData,
        logDate,
        action,
        requestedTo,
        remarks,
        status,
      ];
    }

    return [
      rowData,
      logDate,
      requestedBy,
      action,
      requestedTo,
      remarks,
      status,
    ];
  });
};

export const complianceLogTHeader = (isCompliancePage: boolean) =>
  !isCompliancePage ?
    [
      "pages.complianceLog.table.head.date",
      "pages.complianceLog.table.head.action",
      "pages.complianceLog.table.head.relatedTo",
      "pages.complianceLog.table.head.remarks",
      "pages.complianceLog.table.head.status",
    ]
    : [
      "pages.complianceLog.table.head.date",
      "pages.complianceLog.table.head.relatedBy",
      "pages.complianceLog.table.head.action",
      "pages.complianceLog.table.head.relatedTo",
      "pages.complianceLog.table.head.remarks",
      "pages.complianceLog.table.head.status",
    ];
