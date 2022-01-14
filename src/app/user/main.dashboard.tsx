import React from 'react';
import {View, StyleSheet, Keyboard, Image, Alert, Modal} from 'react-native';
import {
  Container,
  Input,
  Item,
  Body,
  H3,
  Fab,
  Text,
  Icon,
  Button,
  ListItem,
  Left,
  H1,
} from 'native-base';
import Colors from '../../configs/styles/index';
import {toggleSideMenu} from './navigations.actions';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from 'react-native-geolocation-service';
import {Navigation} from 'react-native-navigation';
import Utils from '../utilities/index';
import {connect} from 'react-redux';
import SpinKit from 'react-native-spinkit';
import {FlatList} from 'react-native-gesture-handler';
import {
  cancelDeliveryActionType,
  confirmDeliveryActionType,
  currentLocation,
  inputActionType,
  setLocation,
} from '../../configs/global.enum';
import MapViewDirections from 'react-native-maps-directions';
import NavigationScreens from '../../../nav.config/navigation.screens';
import {firebasePaths, ParcelStatus} from '../../configs/globals.config';
import firestore from '@react-native-firebase/firestore';
import {Avatar} from 'react-native-ui-lib';
import User from '../types/user';
import {Driver} from '../types/driver';
import {API_KEY} from 'react-native-dotenv';
import {
  Notifications,
  Registered,
  RegistrationError,
  NotificationCompletion,
  Notification,
} from 'react-native-notifications';
import SplashScreen from 'react-native-splash-screen';

const mapStateToProps = (store: any) => ({
  currentLocationPrediction: store.User.currentLocation,
  currentLocationStatus: store.User.currentLocationStatus,
  user: store.Auth.user,
  activeDelivery: store.User.activeDelivery,
  driver: store.User.driver,
  cancelDeliveryStatus: store.User.cancelDeliveryStatus,
  confirmDeliveryStatus: store.User.confirmDeliveryStatus,
  watchPosition: store.User.watchPosition,
  deliveryDeleted: store.User.deliveryDeleted,
});

const mapDispatchStateToProps = (dispatch: any) => ({
  getCurrentLocation: () =>
    dispatch({type: currentLocation.GET_CUURENT_LOCATION_CALLER}),
  selectedLocation: (location: any) =>
    dispatch({
      type: setLocation.SET_LOCATION_CALLER,
      currentLocation: location,
    }),
  setActiveDelivery: (payload: any, driver: any, discard?: boolean) =>
    dispatch({
      type: inputActionType.SET_TRACK_ACTIVE_DELIVERY_CALLER,
      payload,
      driver,
      discard,
    }),
  cancelDelivery: (parcelId: string) =>
    dispatch({
      type: cancelDeliveryActionType.CANCEL_DELIVERY_CALLER,
      payload: parcelId,
    }),
  confirmDelivery: (parcelId: string) =>
    dispatch({
      type: confirmDeliveryActionType.CONFIRM_DELIVERY_CALLER,
      payload: parcelId,
    }),
  setCurrentLocation: (location: coords) =>
    dispatch({
      type: inputActionType.SET_USER_CURRENT_LOCATION_CALLER,
      payload: location,
    }),
});

type currentLocationObj = {
  name: string;
  longitude: number;
  latitude: number;
  address: string;
};

type parcelInProgress = {
  distance: number;
  parcelLocation: number[];
  parcelOwner: string;
  parcelPicker: string;
  date: any;
  parcelPrice: number;
  parcelStatus: number;
  parcelDestinationPhysicalAddress: string;
  parcelLocationPhysicalAddress: string;
  parcelDestination: number[];
  passengerPhoneNumber: string;
  driver: any;
  id: string;
};

type coords = {longitude: number; latitude: number};

type Props = {
  componentId: string;
  currentLocationPrediction: currentLocationObj[];
  currentLocationStatus: string;
  activeDelivery: parcelInProgress;
  user: User;
  driver: Driver;
  cancelDeliveryStatus: string;
  confirmDeliveryStatus: string;
  watchPosition: coords;
  deliveryDeleted: boolean;
  getCurrentLocation: () => void;
  selectedLocation: (location: any) => void;
  setActiveDelivery: (payload: any, driver: any, discard?: boolean) => void;
  cancelDelivery: (parcelId: string) => void;
  confirmDelivery: (parcelId: string) => void;
  setCurrentLocation: (payload: coords) => void;
};

const styles = StyleSheet.create({
  searchingTextStyle: {marginVertical: 5},
  spinKitContainer: {
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  flatList: {maxHeight: 150},
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  retryBtn: {
    backgroundColor: Colors.Brand.brandColor,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  fab: {
    backgroundColor: Colors.Brand.brandColor,
  },
  currentLocationSelect: {
    backgroundColor: Colors.Brand.brandColor,
    marginVertical: 10,
    borderColor: 'transparent',
  },
  ico: {
    fontSize: 20,
    color: '#888',
  },
  descLocation: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: 19,
    marginBottom: 10,
  },
  enlargeIndicator: {
    width: 50,
    height: 5,
    backgroundColor: '#e8e8e8',
    borderRadius: 50,
    marginVertical: 8,
    alignSelf: 'center',
  },
  suggestion: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 15,
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  subContainer: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: Colors.Brand.brandColor,
    zIndex: 2000,
  },
  btnMenu: {
    backgroundColor: Colors.Brand.brandColor,
    width: 50,
    height: 50,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 4,
    zIndex: -10,
  },
  locationString: {
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.Brand.brandColor,
  },
  left: {
    maxWidth: 30,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  avatar: {
    marginLeft: -10,
  },
  driverMarker: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  driverMarkerIcon: {color: '#5cb85c'},
  imgUserLocation: {width: 30, height: 30},
  driverNameStyle: {marginLeft: 10},
  parcelPicked: {
    color: '#d9534f',
    fontWeight: 'bold',
    fontSize: 10,
  },
  inProgressText: {
    color: '#f0ad4e',
    fontWeight: 'bold',
    fontSize: 10,
  },
  deliveredParcel: {
    color: '#5cb85c',
    fontWeight: 'bold',
    fontSize: 10,
  },
  icoDanger: {color: Colors.Brand.danger},
  icoWarning: {color: Colors.Brand.warning},
  icoSuccess: {color: Colors.Brand.success},
  fabCancelDelivery: {backgroundColor: '#d9534f', zIndex: 100000},
  icoWhite: {color: '#fff'},
  fabSuccessDelivery: {backgroundColor: '#5cb85c', zIndex: 100000},
  welcomeText: {fontSize: 10},
  inputSearchLocation: {
    borderBottomColor: 'transparent',
    backgroundColor: '#f4f4f4',
    paddingLeft: 10,
    borderRadius: 50,
    marginTop: 10,
    paddingVertical: 10,
  },
  searchIcon: {color: '#999'},
  pickUpLocationCaption: {color: '#555', fontWeight: 'bold'},
  modalSubContainer: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  modal: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  available: {
    fontFamily: 'sans-serif-thin',
    marginTop: 20,
  },
});

class Dashboard extends React.Component<Props> {
  watchId: any;
  timer: any;
  mapRef: any;
  driverInfo: any;
  trackerListener: any;
  activeDeliveries = firestore()
    .collection(firebasePaths.ACTIVE_DELIVERIES)
    .where('parcelOwner', '==', this.props.user.userId);

  rideHistories = firestore().collection(firebasePaths.PARCEL_HISTORIES);
  driver = firestore().collection(firebasePaths.DRIVERS);
  watchDriver: any;

  //gets the current location of the user
  async getCurrentPosition() {
    const permission = await Utils.Permissions.RequestLocationPermissions();
    if (!permission) {
      Alert.alert(
        '',
        'Location Access not granted. Allow application to access location.',
      );
      return false;
    }
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        this.props.setCurrentLocation({
          latitude: latitude,
          longitude: longitude,
        });
      },
      (e) => {
        this.getCurrentPosition();
      },
      {enableHighAccuracy: true},
    );
  }

  //accepst array of longitude and latitude and object and fit all coords on the mapview
  callFit(...locations: any[]) {
    if (!this.mapRef) {
      return false;
    }

    if (
      locations[0].longitude === this.props.watchPosition.longitude &&
      locations[0].latitude === this.props.watchPosition.latitude
    ) {
      return false;
    }

    this.mapRef.fitToCoordinates(locations, {
      edgePadding: {
        bottom: 200,
        right: 50,
        top: 150,
        left: 50,
      },
      animated: false,
    });
  }

  componentDidUpdate() {
    if (this.props.activeDelivery) {
      let timer = setTimeout(() => {
        this.callFit(
          this.getActiveDeliveryPickUpLocation(),
          this.getActiveDeliveryDestinationLocation(),
        );
        clearTimeout(timer);
      }, 500);
    }

    if (!this.watchId) {
      this.getCurrentPosition();
    }
  }

  searchPickUp() {
    Navigation.push(this.props.componentId, {
      component: {
        name: NavigationScreens.SEARCH_PICKUP_SCREEN,
        id: NavigationScreens.SEARCH_PICKUP_SCREEN,
        passProps: {
          parcel: this.props.activeDelivery,
          reAssigning: true,
        },
      },
    });
  }

  handleDialogCancelDelivery() {
    Alert.alert(
      '',
      'Are you sure you want to discard delivery request settings?',
      [
        {
          onPress: () => this.props.setActiveDelivery(null, null, true),

          text: 'Yes',
        },
        {
          onPress: () => '',

          text: 'No',
        },
      ],
    );
  }
  //gets the coords for activeDelivery pickup location
  getActiveDeliveryDestinationLocation() {
    if (this.props.activeDelivery) {
      return {
        longitude: this.props.activeDelivery.parcelDestination[0],
        latitude: this.props.activeDelivery.parcelDestination[1],
      };
    }
    return {
      longitude: this.props.watchPosition.longitude,
      latitude: this.props.watchPosition.latitude,
    };
  }

  //gets the coords for activeDelivery destination location
  getActiveDeliveryPickUpLocation() {
    if (this.props.activeDelivery) {
      return {
        latitude: this.props.activeDelivery.parcelLocation[1],
        longitude: this.props.activeDelivery.parcelLocation[0],
      };
    }

    return {
      longitude: this.props.watchPosition.longitude,
      latitude: this.props.watchPosition.latitude,
    };
  }

  //gets the driver information when delivery enters the active mode and handles both failure and success to avoid multiple redundant reads
  async getDriverInfo(parcel: parcelInProgress, discard?: boolean) {
    try {
      if (!parcel) {
        this.props.setActiveDelivery(null, null, discard);
        this.getCurrentPosition();
      } else {
        if (this.props.driver) {
          this.props.setActiveDelivery(parcel, this.props.driver, discard);
        } else {
          let driver = await this.driver.doc(parcel.parcelPicker).get();
          let data = driver.data();
          if (data) {
            data.id = driver.id;
          }
          this.props.setActiveDelivery(parcel, data, discard);
        }
      }
    } catch (e) {}
  }

  //watch drivers location when a trip is going on
  watchDriverLocation(driverId: any, parcel: any) {
    if (driverId && parcel) {
      if (!this.watchDriver) {
        this.watchDriver = this.driver.doc(driverId).onSnapshot((snapshot) => {
          let data = snapshot.data();
          if (data) {
            data.id = snapshot.id;
          }
          this.props.setActiveDelivery(parcel, data);
        });
      }
    } else {
      if (this.watchDriver) {
        this.watchDriver();
      }
    }
  }

  async getDeviceRegToken() {
    Notifications.registerRemoteNotifications();

    Notifications.events().registerRemoteNotificationsRegistered(
      (event: Registered) => {
        // TODO: Send the token to my server so it could send back push notifications...
        this.saveToken(event.deviceToken);
      },
    );
    Notifications.events().registerRemoteNotificationsRegistrationFailed(
      (event: RegistrationError) => {},
    );
  }

  registerNotificationListeners() {
    Notifications.events().registerNotificationReceivedForeground(
      (
        notification: Notification,
        completion: (response: NotificationCompletion) => void,
      ) => {
        // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
        completion({alert: true, sound: true, badge: false});
      },
    );

    Notifications.events().registerNotificationReceivedBackground(
      (notification: any, completion: (response: any) => void) => {
        // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
        completion({alert: true, sound: true, badge: false});
      },
    );
  }

  //mounts the current component
  async componentDidMount() {
    firestore()
      .collection('Applications')
      .doc('kad-tour')
      .onSnapshot((data) => {
        const appData = data.data();
        if (!appData.active) {
          SplashScreen.show();

          // this.setState({showInitScreen: true}, () => {
          //   Navigation.mergeOptions(this.props.componentId, {
          //     bottomTabs: {
          //       visible: false,
          //     },
          //   });
          // });
        } else {
          SplashScreen.hide();

          // this.setState({showInitScreen: false});
          // Navigation.mergeOptions(this.props.componentId, {
          //   bottomTabs: {
          //     visible: true,
          //   },
          // });
        }
      });
    try {
      this.getCurrentPosition();
    } catch (e) {}
  }

  //unsubscribe to all component
  componentWillUnmount() {
    try {
      Keyboard.dismiss();
      this.trackerListener();
    } catch (e) {}
    if (this.watchId) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  navigate(name: string) {
    Navigation.push(this.props.componentId, {
      component: {
        name: name,
        passProps: {
          longitude: this.props.watchPosition.longitude,
          latitude: this.props.watchPosition.latitude,
        },
      },
    });
  }

  setLocation(location: any) {
    this.props.selectedLocation(location);

    this.timer = setTimeout(() => {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.navigate(NavigationScreens.CREATE_PARCEL_SCREEN);
      clearTimeout(this.timer);
    }, 500);
  }

  cancelDelivery(parcelId: string) {
    Alert.alert('', 'Are you sure you want to cancel pickup ? ', [
      {onPress: () => this.props.cancelDelivery(parcelId), text: 'Yes'},
      {onPress: () => '', text: 'No'},
    ]);
  }

  confirmDelivery(parcelId: string) {
    Alert.alert(
      '',
      'Are you sure you want to confirm parcel have been delivered ? ',
      [
        {onPress: () => this.props.confirmDelivery(parcelId), text: 'Yes'},
        {onPress: () => '', text: 'No'},
      ],
    );
  }
  renderConfirmingDelivery() {
    const visible =
      this.props.confirmDeliveryStatus ===
      confirmDeliveryActionType.CONFIRM_DELIVERY_STARTED;
    return (
      <Modal visible={visible} style={styles.modal}>
        <View style={styles.modalSubContainer}>
          <SpinKit type="Circle" size={190} color={Colors.Brand.brandColor} />
          <H1 style={styles.available}>Confirming Delivery ... </H1>
        </View>
      </Modal>
    );
  }

  renderCancelingPickUp() {
    const visible =
      this.props.cancelDeliveryStatus ===
      cancelDeliveryActionType.CANCEL_DELIVERY_STARTED;
    return (
      <Modal visible={visible} style={styles.modal}>
        <View style={styles.modalSubContainer}>
          <SpinKit type="Circle" size={190} color={Colors.Brand.brandColor} />
          <H1 style={styles.available}>Canceling Pickup ... </H1>
        </View>
      </Modal>
    );
  }

  async saveToken(token: string) {
    let admin = firestore()
      .collection(firebasePaths.USERS)
      .doc(this.props.user.userId);
    admin
      .set({
        token: firestore.FieldValue.arrayUnion(token),
        photo: this.props.user.photo,
        firstName: this.props.user.firtName,
        lastName: this.props.user.lastName,
      })
      .catch((e) => {});
  }

  render() {
    return (
      <Container style={styles.mainContainer}>
        {this.renderCancelingPickUp()}
        {this.renderConfirmingDelivery()}
        <View style={styles.container}>
          <MapView
            ref={(ref) => (this.mapRef = ref)}
            provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={styles.map}
            region={{
              latitude: this.props.activeDelivery
                ? this.props.activeDelivery.parcelLocation[1]
                : this.props.watchPosition.latitude,

              longitude: this.props.activeDelivery
                ? this.props.activeDelivery.parcelLocation[0]
                : this.props.watchPosition.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            }}>
            {this.props.activeDelivery && (
              <>
                <MapViewDirections
                  origin={this.getActiveDeliveryPickUpLocation()}
                  destination={this.getActiveDeliveryDestinationLocation()}
                  apikey={API_KEY}
                  strokeWidth={3}
                  strokeColor={Colors.Brand.brandColor}
                />
                <Marker
                  title={
                    this.props.activeDelivery.parcelLocationPhysicalAddress
                  }
                  coordinate={this.getActiveDeliveryPickUpLocation()}
                  pinColor={Colors.Brand.brandColor}
                />

                <Marker
                  title={
                    this.props.activeDelivery.parcelDestinationPhysicalAddress
                  }
                  coordinate={this.getActiveDeliveryDestinationLocation()}
                />

                {this.props.activeDelivery && this.props.driver && (
                  <Marker
                    coordinate={{
                      latitude: this.props.driver.lat,
                      longitude: this.props.driver.lng,
                    }}>
                    <View style={styles.driverMarker}>
                      <Icon
                        name="drive-eta"
                        type="MaterialIcons"
                        style={styles.driverMarkerIcon}
                      />
                    </View>
                  </Marker>
                )}
              </>
            )}
            {!this.props.activeDelivery && (
              <Marker
                coordinate={{
                  latitude: this.props.watchPosition.latitude,
                  longitude: this.props.watchPosition.longitude,
                }}>
                <Image
                  resizeMode="contain"
                  style={styles.imgUserLocation}
                  source={require('../../../assets/media/images/marker.png')}
                />
              </Marker>
            )}
          </MapView>
          <View style={styles.suggestion}>
            <View style={styles.enlargeIndicator} />

            {!this.props.activeDelivery && (
              <>
                <H3 style={styles.descLocation}>
                  Welcome to Kaduna {this.props.user.firstName}
                </H3>
                <Text>
                  You can search for different location you want to visit{' '}
                </Text>

                <Item
                  onPress={() =>
                    this.navigate(NavigationScreens.CREATE_PARCEL_SCREEN)
                  }
                  bordered={false}
                  style={styles.inputSearchLocation}>
                  <Icon style={styles.searchIcon} active name="search" />
                  <Input
                    placeholderTextColor="#aaa"
                    disabled
                    placeholder="Search location"
                  />
                </Item>
              </>
            )}
          </View>

          <Fab
            active={true}
            style={styles.fab}
            position="topLeft"
            onPress={() => toggleSideMenu(true, this.props.componentId)}>
            <Icon style={{color: '#fff'}} name="menu" />
          </Fab>
        </View>
      </Container>
    );
  }
}

export default connect(mapStateToProps, mapDispatchStateToProps)(Dashboard);
