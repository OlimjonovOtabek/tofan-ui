import { Dictionary } from '../../dictionary';

export const USER_SESSIONS_EN: Dictionary['userSessions'] = {
  title: 'Sign-in log',
  total: '{count} sign-ins in total',
  empty: 'No sign-ins yet.',
  filterBefore: 'Only sign-ins of user',
  filterAfter: '',
  account: 'Account',
  removeFilter: 'Remove filter',
  userId: 'User ID',
  accountCard: 'Account card',
  onlyThisUser: "Only this user's sign-ins",
  onlyThisUserShort: 'Only this user',
  copyUserId: 'Copy user ID',
  sendPush: 'Send a push to this user',
  sendPushShort: 'Send push',
  revokedAt: 'Signed out: {date}',
  columns: {
    userId: 'User ID',
    loggedIn: 'Signed in',
    expires: 'Token expires',
    status: 'Status',
  },
  status: {
    unexpired: 'Not expired',
    expired: 'Expired',
    revokedEverywhere: 'Signed out everywhere',
  },
};
