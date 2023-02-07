// [IMPORT NEW CONTAINERSTATE ABOVE] < Needed for generating containers seamlessly

/* 
  Because the redux-injectors injects your reducers asynchronously somewhere in your code
  You have to declare them here manually
*/
import { ApplicationState } from 'store/application/reducer';
import { OracleState } from 'store/oracle/reducer';

// #redux-step-3: define interface for RootState (the root tree view on Redux Devtool chrome extension)
export interface RootState {
  // [INSERT NEW REDUCER KEY ABOVE] < Needed for generating containers seamlessly
  application: ApplicationState;
  oracle: OracleState;
}
