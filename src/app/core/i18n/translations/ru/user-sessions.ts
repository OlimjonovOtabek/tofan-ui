import { Dictionary } from '../../dictionary';

export const USER_SESSIONS_RU: Dictionary['userSessions'] = {
  title: 'Журнал входов',
  total: 'Всего входов: {count}',
  empty: 'Входов пока нет.',
  filterBefore: 'Только входы пользователя',
  filterAfter: '',
  account: 'Аккаунт',
  removeFilter: 'Сбросить фильтр',
  userId: 'ID пользователя',
  accountCard: 'Карточка аккаунта',
  onlyThisUser: 'Только входы этого пользователя',
  onlyThisUserShort: 'Только этот пользователь',
  copyUserId: 'Скопировать ID пользователя',
  sendPush: 'Отправить push этому пользователю',
  sendPushShort: 'Отправить push',
  revokedAt: 'Выход: {date}',
  columns: {
    userId: 'ID пользователя',
    loggedIn: 'Время входа',
    expires: 'Срок токена',
    status: 'Статус',
  },
  status: {
    unexpired: 'Не истёк',
    expired: 'Истёк',
    revokedEverywhere: 'Выход на всех устройствах',
  },
};
