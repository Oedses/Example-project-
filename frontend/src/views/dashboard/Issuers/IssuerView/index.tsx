import { Fragment, lazy } from 'react';

import { hoc } from '../../../../utils';
import { Button, Popup, Table } from '../../../components/UI';

import { Breadcrumps } from '../../../components/UI/Breadcrumps';
import { ButtonView } from '../../../components/UI/Button/button.props';
import { Heading } from '../../../components/UI/Heading';
import { List } from '../../../components/UI/List';
import { Section } from '../../../components/UI/Section';
import { Spinner } from '../../../components/UI/Spinner';
import ComplianceLog from '../../Compliances';
import ConfirmDeleteUser from '../../Investors/InvestorView/ConfirmDeleteUser';
import TransactionsView from "../../Transactions";

import { Roles } from './../../../../../../shared/types/common';

import { useIssuerView } from './issuer-view.hook';

import './issuer-view.scss';

const CreateIssuerForm = lazy(() => import("../CreateIssuerForm"));


const IssuerView = hoc(useIssuerView, ({
  t,
  width,
  role,
  isFetching,
  breadcrumps,
  details,
  summary,
  productsRows,
  productTHeader,
  showEditForm,
  onToggleEditForm,
  issuerData,
  issuerId,
  showDeleteUserConfirm,
  isIssuerActive,
  onToggleConfirmDeleteUser,
  onRequestDeactivate,
  onAfterDeleteUser,
  getIssuerData
}) => (

  <section className="issuer-view">
    <Popup visible={showDeleteUserConfirm} onClose={onToggleConfirmDeleteUser}>
      <ConfirmDeleteUser id={issuerId} email={issuerData.email!} callback={onAfterDeleteUser} />
    </Popup>

    <div className="content-wrapper">
      <div className="content">
        {isFetching ? <Spinner /> : (
          <Fragment>
            <section className="content__header">
              <Breadcrumps items={breadcrumps} />

              {Roles.compliance !== role &&
                <Button
                  view={ButtonView.redLayout}
                  onClick={isIssuerActive ? onRequestDeactivate : onToggleConfirmDeleteUser}
                  disabled={isIssuerActive && issuerData.isRequestDeactivate}
                >
                  {t(`pages.issuer.view.${isIssuerActive ? 'deactivate' : 'delete'}`)}
                </Button>
              }

              {showEditForm && (
                <CreateIssuerForm
                  visible={showEditForm}
                  editData={{
                    initialValues: issuerData,
                    id: issuerId
                  }}
                  onClose={onToggleEditForm}
                />
              )}
            </section>

            <section className='issuer-view__content'>
              <article className='issuer-view__right'>
                <Section className='issuer-view__details'>
                  <Heading view='secondary' active>
                    {t('pages.issuer.view.details.title')}
                  </Heading>

                  <List
                    type='vertical'
                    items={details}
                  />
                </Section>
              </article>

              <article className='issuer-view__left'>
                <Section className='issuer-view__section issuer-view__compliance-log'>
                  <div className='overview__compliance-log-content'>
                    <ComplianceLog
                      callbackAction={getIssuerData}
                      relatedUserId={issuerId}
                      withTitle={false}
                      isCompliancePage={false}
                      isPagination={true}
                      limitStep={10}
                    />
                  </div>
                </Section>

                <Section className=' issuer-view__section issuer-view__summary'>
                  <Heading view='secondary' active>
                    {t('pages.issuer.view.summary.title')}
                  </Heading>

                  <List
                    type={width! > 620 ? 'horizontal' : 'vertical'}
                    items={summary}
                  />
                </Section>

                <Section className=' issuer-view__section issuer-view__products'>
                  <Heading view='secondary' active>
                    {t('pages.issuer.view.products.title')}
                  </Heading>

                  <div className="product-view__table">
                    <Table
                      theadData={productTHeader}
                      tbodyData={productsRows}
                      sortedFields={{ indexes: [0] }}
                      centeredColumns={[2, 4]}
                      emptyState={t('pages.issuer.view.products.table.empty')}
                    />
                  </div>
                </Section>

                <Section className=' issuer-view__section issuer-view__transactions'>
                  <div className="product-view__table">
                    <TransactionsView isPageTransactions={false} issuerId={issuerId} />
                  </div>
                </Section>
              </article>
            </section>
          </Fragment>
        )}
      </div>
    </div>
  </section>
));

export default IssuerView;
