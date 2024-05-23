import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

const Stack = createStackNavigator();

function Gps() {
  const [Gpslatitude, setGpsLatitude] = useState(null);
  const [Gpslongitude, setGpsLongitude] = useState(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    (async () => {
      // Request background location permission
      let { status } = await Location.requestBackgroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      // Update location every 10 seconds
      const locationInterval = setInterval(() => {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
          .then(userGpsCoords)
          .catch(error => console.log('Error getting location:', error));
      }, 10000);

      return () => clearInterval(locationInterval); // Cleanup on unmount
    })();
  }, []);

  const userGpsCoords = (location) => {
    const userGpsLatitude = location.coords.latitude;
    const userGpsLongitude = location.coords.longitude;
    setGpsLatitude(userGpsLatitude);
    setGpsLongitude(userGpsLongitude);
    getUserAddress(userGpsLatitude, userGpsLongitude);
    sendLocation(userGpsLatitude, userGpsLongitude);
  };

  const getUserAddress = async (latitude, longitude) => {
    let url = `https://api.opencagedata.com/geocode/v1/json?key=b5ddfdc0bf0c428e8530c8aeae8ec37e&q=${latitude}+${longitude}&pretty=1&no_annotations=1`;
    const loc = await fetch(url);
    const data = await loc.json();
    setAddress(data.results[0].formatted);
  };

  const sendLocation = async (latitude, longitude) => {
    try {
      const response = await axios.post('http://192.168.1.21:5000/location', {
        latitude,
        longitude,
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error sending location data: ', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Location</Text>
      {Gpslatitude && Gpslongitude ? (
        <Text>Latitude: {Gpslatitude}, Longitude: {Gpslongitude}</Text>
      ) : (
        <Text>Loading...</Text>
      )}
      <Text>User Address: {address}</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="GPS" component={Gps} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
})