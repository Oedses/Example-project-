import { hoc } from "../../../utils/hoc";
import { Spinner } from "../../components/UI/Spinner";
import { Heading } from "../../components/UI/Heading";
import { useMyAccount } from "./myAccount.hook";
import AccountInformation from "./AccountInformation";
import SecurityPreferences from "./SecurityPreferences";
import "./myAccount.scss";

const MyAccount = hoc(
  useMyAccount,
  ({
    t,
    isLoading,
    userData,
    getUser
  }) => (
    <div className="content my-account">
      <div className="content__header">
        <Heading view="main" active>
          {t('pages.myAccount.title')}
        </Heading>
      </div>
      {isLoading || !userData
      ? (<Spinner />)
      : (
        <>
          <AccountInformation userData={userData} />
          <SecurityPreferences userData={userData} callback={getUser} />
        </>
      )}
    </div>
  )
);

export default MyAccount;
