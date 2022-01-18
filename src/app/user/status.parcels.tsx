import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  BackHandler,
} from 'react-native';
import {
  Icon,
  Header,
  Right,
  Left,
  Body,
  Container,
  Title,
  Text,
  Button,
  ListItem,
  H1,
} from 'native-base';
import Colors from '../../configs/styles/index';
import {Navigation} from 'react-native-navigation';
import {connect} from 'react-redux';
import {GetUsersParcel} from '../../configs/global.enum';
import User from '../types/user';
import {Avatar} from 'react-native-ui-lib';

type Props = {
  componentId: string;
  page: number;
  gettingParcelStatus: string;
  errorGettingParcel: string;
  parcels: any[];
  user: User;
  receipts: any[];
  getParcels: (userId: string, page: number) => void;
};

const mapStateToProps = (store: any) => ({
  page: store.User.page,
  gettingParcelStatus: store.User.gettingParcelStatus,
  errorGettingParcel: store.User.errorGettingParcel,
  parcels: store.User.parcels,
  user: store.Auth.user,
  receipts: store.User.receipts,
});

const mapDispatchStateToProps = (dispatch: any) => ({
  getParcels: (userId: string, page: number) =>
    dispatch({type: GetUsersParcel.GET_PARCEL_CALLER, userId, page}),
});

const styles = StyleSheet.create({
  selectedStyle: {
    color: Colors.Brand.brandColor,
  },
  header: {
    backgroundColor: '#fff',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.Brand.brandColor,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: Colors.Brand.brandColor,
  },
  notificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  headerLeft: {
    maxWidth: 50,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {alignSelf: 'center', color: '#888', fontWeight: 'bold'},
  listItemLeft: {maxWidth: 50},
  userName: {fontSize: 19, marginLeft: 10},
  listItemRight: {maxWidth: 40},
  address: {fontSize: 12},
  tripCompletedText: {fontSize: 14},
  cancelledTripText: {fontSize: 14},
  tripPrice: {fontSize: 15},
  emptyComponent: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginTop: '50%',
  },
  emptyComponentIcon: {fontSize: 100, color: Colors.Brand.brandColor},
  emptyComponentText: {fontSize: 25, fontFamily: 'sans-serif-light'},

  icoCharge: {
    fontSize: 16,
  },
  icoList: {
    color: '#999',
    fontSize: 23,
  },
  price: {
    fontWeight: '900',
    color: '#555',
  },
  minutes: {
    color: Colors.Brand.brandColor,
    fontSize: 10,
  },
  listBody: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
  },
  icoConfirm: {color: '#fff'},
  confirmPickUpBtn: {
    backgroundColor: Colors.Brand.brandColor,
    marginHorizontal: 15,
  },
  confirmPickUpText: {
    fontWeight: '900',
    letterSpacing: 2,
  },
  fab: {backgroundColor: Colors.Brand.brandColor},
  tripInfoContainer: {
    width: 100,
    height: 40,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  ListItem: {
    borderRadius: 50,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100000000,
  },

  modal1: {
    height: 230,
    backgroundColor: '#3B5998',
  },
  durationEmpty: {
    backgroundColor: 'transparent',
    flex: 2,
    width: 200,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 10,
  },
  locationName: {
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  locationNameContainer: {
    flex: 2,
    borderRadius: 5,
    backgroundColor: '#fff',
    height: 40,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
  },
  duration: {
    color: '#fff',
    fontWeight: 'bold',
  },
  destinationTitleContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: 150,
    marginLeft: 30,
    height: 40,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  currentLocationSelect: {
    backgroundColor: Colors.Brand.brandColor,
    marginVertical: 10,
    borderColor: 'transparent',
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
    paddingHorizontal: 10,
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
});

class ParcelManager extends React.Component<Props> {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.goBack);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.goBack);
  }

  goBack = () => {
    Navigation.popToRoot(this.props.componentId);
    return true;
  };

  render() {
    return (
      <Container>
        <Header
          androidStatusBarColor={Colors.Brand.brandColor}
          hasTabs
          style={styles.header}>
          <Left style={styles.headerLeft}>
            <Button
              onPress={() => Navigation.popToRoot(this.props.componentId)}
              dark
              transparent>
              <Icon
                style={{color: Colors.Brand.brandColor}}
                name="arrow-back"
              />
            </Button>
          </Left>
          <Body>
            <Title style={styles.headerTitle}>My Bookings</Title>
          </Body>
          <Right style={styles.listItemRight} />
        </Header>
        <FlatList
          onEndReachedThreshold={0.5}
          onEndReached={() =>
            this.props.getParcels(this.props.user.userId, this.props.page)
          }
          // refreshControl={
          //   <RefreshControl
          //     onRefresh={() => this.props.getParcels(this.props.user.userId, 1)}
          //     refreshing={
          //       this.props.gettingParcelStatus ===
          //       GetUsersParcel.GET_PARCEL_STARTED
          //     }
          //   />
          // }
          renderItem={({item, index}) => (
            <ListItem>
              <Body>
                <H1 style={{fontSize: 20, marginLeft: 10}}>
                  Reservation ID:{' '}
                  <H1 style={{fontSize: 20, fontWeight: 'bold'}}>
                    {1244949494 + index}
                  </H1>
                </H1>

                <ListItem noIndent style={styles.ListItem}>
                  <Icon style={styles.icoList} type="Entypo" name="address" />
                  <Body
                    style={[
                      styles.listBody,
                      {flexDirection: 'column', alignItems: 'flex-start'},
                    ]}>
                    <Text style={{fontWeight: 'bold'}} note>
                      Address
                    </Text>

                    <Text style={{fontSize: 10}}>{item.location.address}</Text>
                  </Body>
                </ListItem>
                <ListItem noIndent style={styles.ListItem}>
                  <Icon
                    style={styles.icoList}
                    type="MaterialCommunityIcons"
                    name="map-marker-distance"
                  />
                  <Body
                    style={[
                      styles.listBody,
                      {flexDirection: 'column', alignItems: 'flex-start'},
                    ]}>
                    <Text style={{fontWeight: 'bold'}} note>
                      Distance from your location
                    </Text>

                    <Text style={{fontSize: 10}}>
                      {item.directionInfo.distance
                        ? item.directionInfo.distance + 'km'
                        : ''}
                    </Text>
                  </Body>
                </ListItem>
                <ListItem noIndent style={styles.ListItem}>
                  <Icon
                    style={styles.icoList}
                    type="MaterialIcons"
                    name="access-time"
                  />
                  <Body
                    style={[
                      styles.listBody,
                      {flexDirection: 'column', alignItems: 'flex-start'},
                    ]}>
                    <Text style={{fontWeight: 'bold'}} note>
                      Estimated time to reach {item.location.name}
                    </Text>

                    <Text note style={styles.minutes}>
                      {item.directionInfo.duration
                        ? item.directionInfo.duration.toFixed()
                        : ''}{' '}
                      minutes
                    </Text>
                  </Body>
                </ListItem>
                <View style={{backgroundColor: 'whitesmoke', borderRadius: 10}}>
                  <Text style={{fontWeight: 'bold', marginTop: 5}}>
                    Customer Information
                  </Text>
                  <H1 style={styles.userName}>
                    {this.props.user.firstName + ' ' + this.props.user.lastName}
                  </H1>
                  <Text style={styles.address} note>
                    {item.email}
                  </Text>
                </View>
              </Body>
              <Right style={styles.listItemRight}>
                {/* <H1 style={styles.tripPrice}>₦{item.parcelPrice}</H1> */}
              </Right>
            </ListItem>
          )}
          data={this.props.receipts}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <View style={styles.emptyComponent}>
              <Icon
                style={styles.emptyComponentIcon}
                type="MaterialIcons"
                name="book"
              />
              <Text style={styles.emptyComponentText}>No Receipts Yet</Text>
            </View>
          }
        />
      </Container>
    );
  }
}

export default connect(mapStateToProps, mapDispatchStateToProps)(ParcelManager);
