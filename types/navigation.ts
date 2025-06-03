import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  Signup: undefined;
  InvestmentSurvey: undefined;
  InvestmentCalculator: undefined;
  Dashboard: {
    amount: number;
    investmentType: 'SIP' | 'One-time';
    duration: number;
    riskProfile: string;
  };
};
