import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {
  Icon,
  Header,
  Left,
  Body,
  Container,
  Title,
  H1,
  Text,
  Button,
} from 'native-base';
import Colors from '../../configs/styles/index';
import {API_KEY} from 'react-native-dotenv';
import {FlatList} from 'react-native-gesture-handler';
import {connect} from 'react-redux';
const mapStateToProps = (store: any) => ({
  Bookings: store.User.Bookings,
});

const mapDispatchStateToProps = (dispatch: any) => ({});

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
  Bookings: any[];
};

class Notification extends React.Component<Props> {
  render() {
    console.log('bookings---------------------------------------------------');
    console.log(this.props.Bookings);
    const baseImage =
      'https://images.unsplash.com/photo-1552334405-4929565998d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80';
    return (
      <Container>
        <Header hasTabs style={styles.header}>
          <Body>
            <Title style={styles.pageTitle}>My Bookings</Title>
          </Body>
        </Header>

        <FlatList
          data={this.props.Bookings}
          renderItem={({item}) => (
            <View
              style={{
                marginHorizontal: 10,
                borderColor: 'lightgray',
                borderWidth: 1,
                borderRadius: 10,
                marginBottom: 20,
              }}>
              <Image
                style={{width: null, height: 300, borderRadius: 10}}
                source={{
                  uri:
                    item.photos?.length > 0
                      ? `https://maps.googleapis.com/maps/api/place/photo?photoreference=${item.photos[0].photo_reference}&sensor=false&maxheight=${item.photos[0].height}&maxwidth=${item.photos[0].width}&key=${API_KEY}`
                      : baseImage,
                }}
              />
              <View
                style={{
                  padding: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View style={{maxWidth: 250}}>
                  <Text style={{fontSize: 12, fontWeight: 'bold'}}>
                    Location name
                  </Text>
                  <Text>{item.name}</Text>
                </View>
              </View>
              <Text
                style={{
                  paddingHorizontal: 10,
                  marginVertical: 5,
                  fontSize: 15,
                }}>
                {item.vicinity}
              </Text>
            </View>
          )}
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  pageTitle: {color: '#000', marginLeft: 10},
  selectedStyle: {
    color: Colors.Brand.brandColor,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#f4f4f4',
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
});
export default connect(mapStateToProps, mapDispatchStateToProps)(Notification);
