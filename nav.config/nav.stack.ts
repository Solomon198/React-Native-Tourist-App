import {Navigation} from 'react-native-navigation';
import NavigationScreens from './navigation.screens';

export function DefaultNavSettingStack() {
  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: NavigationScreens.SWITCH_SCREEN,
              id: NavigationScreens.SWITCH_SCREEN,
            },
          },
        ],
      },
    },
  });
}

export function AuthNavigationSettingStack() {
  return Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: NavigationScreens.SIGNIN_SCREEN,
              id: NavigationScreens.SIGNIN_SCREEN,
            },
          },
        ],
      },
    },
  });
}

export function User() {
  Navigation.setRoot({
    root: {
      bottomTabs: {
        id: 'HOME_TAB',
        children: [
          {
            stack: {
              id: 'DASHBOAED',
              children: [
                {
                  component: {
                    name: NavigationScreens.DASHBOARD_SCREEN,
                    id: NavigationScreens.DASHBOARD_SCREEN,
                  },
                },
              ],
              options: {
                bottomTab: {
                  icon: require('../assets/media/icons/home.png'),
                  iconColor: 'dodgerblue',
                },
              },
            },
          },
          // {
          //   stack: {
          //     id: 'Add POST',
          //     children: [
          //       {
          //         component: {
          //           name: NavigationScreens.PAYMENT_OPTION_SCREEN,
          //           id: NavigationScreens.PAYMENT_OPTION_SCREEN,
          //         },
          //       },
          //     ],
          //     options: {
          //       bottomTab: {
          //         icon: require('../assets/media/icons/plus.png'),
          //         iconColor: 'dodgerblue',
          //       },
          //     },
          //   },
          // },
          {
            stack: {
              id: 'Reservation',
              children: [
                {
                  component: {
                    name: NavigationScreens.NOTIFICATION_SCREEN,
                    id: NavigationScreens.NOTIFICATION_SCREEN,
                  },
                },
              ],
              options: {
                bottomTab: {
                  icon: require('../assets/media/icons/store.png'),
                  iconColor: 'dodgerblue',
                },
              },
            },
          },
          // {
          //   stack: {
          //     id: NavigationScreens.PROFILE_TAB,
          //     children: [
          //       {
          //         component: {
          //           name: NavigationScreens.PROFILE_SCREEN,
          //           id: NavigationScreens.PROFILE_SCREEN,
          //         },
          //       },
          //     ],
          //     options: {
          //       bottomTab: {
          //         icon: require('../assets/media/icons/user.png'),
          //         iconColor: 'dodgerblue',
          //       },
          //     },
          //   },
          // },
        ],
      },
    },
  });
}
