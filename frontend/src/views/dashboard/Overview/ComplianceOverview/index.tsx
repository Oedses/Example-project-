import { Fragment } from "react";

import { hoc } from "../../../../utils";

import { Heading } from "../../../components/UI/Heading";
import ComplianceLog from "../../Compliances";

import { useOverview } from "./overview.hook";
import "./overview.scss";

const AdminOverview = hoc(
  useOverview,
  ({
    t,
    name,
  }) => {
    return (
      <Fragment>
        <div className="content">
          <section className="content__header">
            <Heading view="main" active>
              {t('pages.admin.overview.title')} {name}
            </Heading>
          </section>

          <ComplianceLog withTitle={false} limitStep={20} />
        </div>
      </Fragment>
    );
  }
);

export default AdminOverview;
