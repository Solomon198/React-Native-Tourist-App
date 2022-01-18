import {put, takeEvery, call, takeLeading} from 'redux-saga/effects';
import RNGooglePlaces from 'react-native-google-places';
import {
  inputActionType,
  searchLocation,
  setLocation,
  currentLocation,
  createParcel,
  cancelDeliveryActionType,
  confirmDeliveryActionType,
  AddCreditCard,
  RemoveCreditCard,
  GetCreditCards,
  GetUsersParcel,
  Book,
} from '../../configs/global.enum';
import {appUrl} from '../../configs/globals.config';
import axios from 'axios';
import {Navigation} from 'react-native-navigation';
import NavigationScreens from '../../../nav.config/navigation.screens';
import {Alert} from 'react-native';
import RNPaystack from 'react-native-paystack';
import Utils from '../utilities/index';
import {NodeEnv} from 'react-native-dotenv';

function* watchSetParcelLocation() {
  yield takeEvery(
    inputActionType.SET_PARCEL_LOCATION_CALLER,
    function* (action: any) {
      yield put({
        type: inputActionType.SET_PARCEL_LOCATION,
        payload: action.payload,
      });
    },
  );
}

function* watchSetParcelDestination() {
  yield takeEvery(
    inputActionType.SET_PARCEL_DESITINATION_CALLER,
    function* (action: any) {
      yield put({
        type: inputActionType.SET_PARCEL_DESITINATION,
        payload: action.payload,
      });
    },
  );
}

function* watchSetActiveInput() {
  yield takeEvery(
    inputActionType.SET_LOCATION_ACTIVE_CALLER,
    function* (action: any) {
      yield put({
        type: inputActionType.SET_LOCATION_ACTIVE,
        payload: action.payload,
      });
    },
  );
}

const getPlace = async (searchString: string) => {
  try {
    let result = await RNGooglePlaces.getAutocompletePredictions(searchString, {
      type: 'address',
      country: 'NG',
    });

    return result;
  } catch (e) {
    return e;
  }
};

function* watchSearchLocation() {
  yield takeEvery(
    searchLocation.SEARCH_LOCATION_CALLER,
    function* (action: any) {
      try {
        yield put({type: searchLocation.SEARCH_LOCATION_STARTED});
        const getPlaces: any = yield call(getPlace.bind(null, action.payload));
        yield put({
          type: searchLocation.SEARCH_LOCATION_SUCCESS,
          payload: getPlaces,
        });
      } catch (e) {
        yield put({type: searchLocation.SEARCH_LOCATION_FAILED});
      }
    },
  );
}

const getPlaceDetails = async (placeID: string) => {
  try {
    let result = await RNGooglePlaces.lookUpPlaceByID(placeID, [
      'placeID',
      'location',
      'name',
      'address',
    ]);

    return result;
  } catch (e) {
    return e;
  }
};

function* watchGetPredictedLocationDetails() {
  yield takeEvery(setLocation.SET_LOCATION_CALLER, function* (action: any) {
    try {
      yield put({type: searchLocation.SEARCH_LOCATION_STARTED});

      if (!action.currentLocation) {
        const getPlaces: any = yield call(
          getPlaceDetails.bind(null, action.payload),
        );

        yield put({type: setLocation.SET_LOCATION_SUCCESS, payload: getPlaces});

        Navigation.push(NavigationScreens.DASHBOARD_SCREEN, {
          component: {
            name: NavigationScreens.PARCEL_DELIVERY_CALCULATION_SCREEN,
            id: NavigationScreens.PARCEL_DELIVERY_CALCULATION_SCREEN,
          },
        });
      } else {
        yield put({
          type: setLocation.SET_LOCATION_SUCCESS,
          payload: action.currentLocation,
        });
      }
    } catch (e) {
      yield put({type: searchLocation.SEARCH_LOCATION_FAILED});
    }
  });
}

function* watchSetVariables() {
  yield takeEvery(
    inputActionType.SET_VARIABLES_CALLER,
    function* (action: any) {
      yield put({type: inputActionType.SET_VARIABLES, payload: action.payload});
    },
  );
}

function* watchResetInputs() {
  yield takeEvery(inputActionType.SET_RESET_INPUTS_CALLER, function* () {
    yield put({type: inputActionType.SET_RESET_INPUTS});
  });
}

function* watchBook() {
  yield takeEvery(Book.BOOK_CALLER, function* (action: any) {
    yield put({type: Book.BOOK_PLACE, payload: action.payload});
    Navigation.popToRoot(NavigationScreens.CREDIT_CARD);
    Alert.alert('', 'Reservation Booked successfully');
  });
}

function* watchSetDistanceAndDuration() {
  yield takeEvery(
    inputActionType.SET_DURATION_AND_DISTANCE_CALLER,
    function* (action: any) {
      yield put({
        type: inputActionType.SET_DURATION_AND_DISTANCE,
        payload: action.payload,
      });
    },
  );
}

const getCurrentLocation = async (types: string, location: any) => {
  try {
    const getLocations = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=1250000&types=${types}&key=AIzaSyCtd3Y6goIZCbYwzPPZeIPLKn-Fwd7bW6Y`,
    );
    console.log(
      '==============================================================',
    );
    console.log(getLocations.data.results);
    return getLocations.data.results;
  } catch (e) {
    console.log(e);
    return e;
  }
};

function* watchGetCurrentLocation() {
  yield takeEvery(
    currentLocation.GET_CUURENT_LOCATION_CALLER,
    function* (action: any) {
      try {
        yield put({type: currentLocation.GET_CUURENT_LOCATION_STARTED});

        const getPlaces: any = yield call(
          getCurrentLocation.bind(null, action.payload, action.location),
        );

        yield put({
          type: currentLocation.GET_CUURENT_LOCATION_SUCCESS,
          payload: getPlaces,
        });
      } catch (e) {
        yield put({type: currentLocation.GET_CUURENT_LOCATION_FAILED});
      }
    },
  );
}

function* watchEnableAddCreditCardBtn() {
  yield takeEvery(
    inputActionType.SET_ENABLE_ADD_BUTTON_CALLER,
    function* (action: any) {
      yield put({
        type: inputActionType.SET_ENABLE_ADD_BUTTON,
        payload: action.payload,
      });
    },
  );
}

const addUserCreditCard = async (payload: any) => {
  return await axios.post(appUrl + '/card', payload);
};

const addCreditCard = async (payload: any) => {
  if (NodeEnv === 'dev') {
    return Promise.resolve({reference: 'trx_mvcmy1l2'});
  }
  const {cvc, email, number, expiry} = payload;
  const [month, year] = expiry.split('/');
  return RNPaystack.chargeCard({
    cardNumber: number.split(' ').join(''),
    expiryMonth: month,
    expiryYear: year,
    cvc: cvc,
    email: email,
    amountInKobo: 5000,
  });
};

function* watchAddCreditCard() {
  yield takeEvery(
    AddCreditCard.ADD_CREDIT_CARD_CALLER,
    function* (action: any) {
      try {
        const cardNumber = action.payload.number.split(' ').join('');
        yield put({type: AddCreditCard.ADD_CREDEIT_CARD_STARTED});
        const chargeCard = yield call(addCreditCard.bind(null, action.payload));
        let cardInfo = {
          reference: chargeCard.reference,
          cardNumber,
          email: action.payload.email,
          userId: action.payload.userId,
        };
        const createAuthorization = yield call(
          addUserCreditCard.bind(null, cardInfo),
        );
        let payload = {
          cardNumber,
          authorization: createAuthorization.data.payload.authorization,
          email: action.payload.email,
          selected: false,
          userId: action.payload.userId,
        };

        Navigation.pop(NavigationScreens.CREDIT_CARD);
        yield put({
          type: AddCreditCard.ADD_CREDIT_CARD_SUCCESS,
          payload: payload,
        });
      } catch (e) {
        let errorMessage: string;
        let requestStatus: number;

        if (e.response) {
          const {status, data} = e.response;

          errorMessage = data.message || e.message;

          requestStatus = status as number;
        } else {
          errorMessage = e.message;
          requestStatus = 0;
        }
        if (Utils.Helpers.matchStatus(requestStatus)) {
          yield put({
            type: AddCreditCard.ADD_CREDIT_CARD_FAILED,
            payload: errorMessage,
          });
        } else {
          yield put({
            type: AddCreditCard.ADD_CREDIT_CARD_FAILED,
            payload: errorMessage,
          });
        }
      }
    },
  );
}

const removeCreditCard = async (card: any) => {
  return await axios.delete(appUrl + '/card/' + card.authorization);
};

function* RemoveValidCard() {
  yield takeEvery(
    RemoveCreditCard.REMOVE_CREDIT_CARD_CALLER,
    function* (action: any) {
      try {
        yield put({type: RemoveCreditCard.REMOVE_CREDEIT_CARD_STARTED});
        yield call(removeCreditCard.bind(null, action.card));
        yield put({
          type: RemoveCreditCard.REMOVE_CREDIT_CARD_SUCCESS,
        });
      } catch (e) {
        let errorMessage: string;
        let requestStatus: number;

        if (e.response) {
          const {status, data} = e.response;

          errorMessage = data.message || e.message;

          requestStatus = status as number;
        } else {
          errorMessage = e.message;
          requestStatus = 0;
        }
        Alert.alert('Could not remove card', errorMessage);
        if (Utils.Helpers.matchStatus(requestStatus)) {
          yield put({
            type: RemoveCreditCard.REMOVE_CREDIT_CARD_FAILED,
            payload: errorMessage,
          });
        } else {
          yield put({
            type: RemoveCreditCard.REMOVE_CREDIT_CARD_FAILED,
            payload: errorMessage,
          });
        }
      }
    },
  );
}

const getCreditCard = async (userId: any) => {
  return await axios.get(appUrl + '/card/' + userId);
};

function* watchGetCreditCards() {
  yield takeEvery(
    GetCreditCards.GET_CREDIT_CARD_CALLER,
    function* (action: any) {
      try {
        yield put({type: GetCreditCards.GET_CREDEIT_CARD_STARTED});
        const cards = yield call(getCreditCard.bind(null, action.payload));
        const {payload} = cards.data;
        yield put({
          type: GetCreditCards.GET_CREDIT_CARD_SUCCESS,
          payload: payload,
        });
      } catch (e) {
        let errorMessage: string;
        let requestStatus: number;

        if (e.response) {
          const {status, data} = e.response;

          errorMessage = data.message || e.message;

          requestStatus = status as number;
        } else {
          errorMessage = e.message;
          requestStatus = 0;
        }
        if (Utils.Helpers.matchStatus(requestStatus)) {
          yield put({
            type: GetCreditCards.GET_CREDIT_CARD_FAILED,
            payload: errorMessage,
          });
        } else {
          yield put({
            type: GetCreditCards.GET_CREDIT_CARD_FAILED,
            payload: errorMessage,
          });
        }
      }
    },
  );
}

function* ChangePaymentMethod() {
  yield takeEvery(
    inputActionType.SET_CHANGE_PAYMENT_METHOD_CALLER,
    function* (action: any) {
      yield put({
        type: inputActionType.SET_CHANGE_PAYMENT_METHOD,
        payload: action.payload,
        card: action.card,
      });
    },
  );
}

const createParcelRequest = async (payload: any) => {
  return await axios.post(appUrl + '/parcel', payload);
};
//LOGIN
// ********************************** **************************************************
function* watchCreateparcel() {
  yield takeLeading(createParcel.CREATE_PARCEL_CALLER, function* (action: any) {
    yield put({type: createParcel.CREATE_PARCEL_STARTED});
    try {
      yield call(createParcelRequest.bind(null, action.payload));
      yield put({type: createParcel.CREATE_PARCEL_SUCCESS});
      Navigation.popToRoot(NavigationScreens.SEARCH_PICKUP_SCREEN);
    } catch (e) {
      let message = '';

      if (e.response) {
        message = e.response.data.message;
      } else {
        message = e.message;
      }

      yield put({type: createParcel.CREATE_PARCEL_FAILED});
      Alert.alert('', message);
    }
  });
}

export function* watchSetDeliveryInProgress() {
  yield takeEvery(
    inputActionType.SET_TRACK_ACTIVE_DELIVERY_CALLER,
    function* (action: any) {
      yield put({
        type: inputActionType.SET_TRACK_ACTIVE_DELIVERY,
        payload: action.payload,
        driver: action.driver,
        discard: action.discard,
      });
    },
  );
}

const cancelDelivery = async (payload: any) => {
  return await axios.put(appUrl + '/parcel/reject-parcel', payload);
};
//LOGIN
// ********************************** **************************************************
function* watchCancelDelivery() {
  yield takeEvery(
    cancelDeliveryActionType.CANCEL_DELIVERY_CALLER,
    function* (action: any) {
      yield put({type: cancelDeliveryActionType.CANCEL_DELIVERY_STARTED});
      try {
        yield call(
          cancelDelivery.bind(null, {
            parcelId: action.payload,
            isDriver: false,
          }),
        );
        yield put({type: cancelDeliveryActionType.CANCEL_DELIVERY_SUCCESS});
      } catch (e) {
        let message = '';

        if (e.response) {
          message = e.response.data.message;
        } else {
          message = e.message;
        }

        yield put({type: cancelDeliveryActionType.CANCEL_DELIVERY_FAILED});
        Alert.alert('', message);
      }
    },
  );
}

const confirmDelivery = async (payload: any) => {
  return await axios.put(appUrl + '/parcel/confirm-parcel', payload);
};
//LOGIN
// ********************************** **************************************************
function* watchConfirmDelivery() {
  yield takeEvery(
    confirmDeliveryActionType.CONFIRM_DELIVERY_CALLER,
    function* (action: any) {
      yield put({type: confirmDeliveryActionType.CONFIRM_DELIVERY_STARTED});
      try {
        yield call(
          confirmDelivery.bind(null, {
            parcelId: action.payload,
          }),
        );
        yield put({type: confirmDeliveryActionType.CONFIRM_DELIVERY_SUCCESS});
      } catch (e) {
        let message = '';

        if (e.response) {
          message = e.response.data.message;
        } else {
          message = e.message;
        }

        yield put({type: confirmDeliveryActionType.CONFIRM_DELIVERY_FAILED});
        Alert.alert('', message);
      }
    },
  );
}

export function* watchUserLocation() {
  yield takeEvery(
    inputActionType.SET_USER_CURRENT_LOCATION_CALLER,
    function* (action: any) {
      yield put({
        type: inputActionType.SET_USER_CURRENT_LOCATION,
        payload: action.payload,
      });
    },
  );
}

function* watchSetLocationDetails() {
  yield takeEvery(inputActionType.SET_LOCATION_CALLER, function* (action: any) {
    yield put({
      type: setLocation.SET_LOCATION_SUCCESS,
      payload: action.payload,
    });
  });
}

function* watchSetProfilePics() {
  yield takeEvery(
    inputActionType.SET_PROFILE_PICTURE_CALLER,
    function* (action: any) {
      yield put({
        type: inputActionType.SET_PROFILE_PICTURE,
        payload: action.payload,
      });
    },
  );
}

function* setCardEmail() {
  yield takeEvery(
    inputActionType.SET_CARD_EMAIL_CALLER,
    function* (action: any) {
      yield put({
        type: inputActionType.SET_CARD_EMAIL,
        payload: action.payload,
      });
    },
  );
}

const getUserParcel = async (payload: any) => {
  return await axios.get(appUrl + '/parcel', {
    params: payload,
  });
};
//LOGIN
// ********************************** **************************************************
function* watchGetUserParcels() {
  yield takeLeading(GetUsersParcel.GET_PARCEL_CALLER, function* (action: any) {
    yield put({type: GetUsersParcel.GET_PARCEL_STARTED});
    try {
      const parcels = yield call(
        getUserParcel.bind(null, {page: action.page, userId: action.userId}),
      );
      yield put({
        type: GetUsersParcel.GET_PARCEL_SUCCESS,
        payload: parcels.data.payload,
        page: action.page,
      });
    } catch (e) {
      let message = '';

      if (e.response) {
        message = e.response.data.message;
      } else {
        message = e.message;
      }

      yield put({type: GetUsersParcel.GET_PARCEL_FAILED, payload: message});
    }
  });
}

function* watchSetReciepts() {
  yield takeLeading(
    inputActionType.SET_RECIEPTS_CALLER,
    function* (action: any) {
      yield put({type: inputActionType.SET_RECIEPTS, payload: action.payload});
    },
  );
}

export default {
  watchBook,
  watchGetCreditCards,
  setCardEmail,
  watchSetLocationDetails,
  watchConfirmDelivery,
  watchCancelDelivery,
  watchCreateparcel,
  watchGetUserParcels,
  watchSetDeliveryInProgress,
  watchUserLocation,
  watchSetProfilePics,

  watchEnableAddCreditCardBtn,
  watchAddCreditCard,
  ChangePaymentMethod,
  RemoveValidCard,

  watchSetParcelLocation,
  watchSetParcelDestination,
  watchSetActiveInput,
  watchSearchLocation,
  watchGetPredictedLocationDetails,
  watchResetInputs,
  watchSetDistanceAndDuration,
  watchGetCurrentLocation,
  watchSetVariables,
  watchSetReciepts,
};
