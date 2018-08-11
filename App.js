import React, { Component } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import Permissions from 'react-native-permissions'

export default class App extends Component {
  state = { permission: '', lat: '', long: '', alt: '' }

  componentDidMount() {
    Permissions.request('location').then( response => {
      this.setState({ permission: response })
    })
    Permissions.check('location').then(response => {
      this.setState({ permission: response })
    })
    navigator.geolocation.getCurrentPosition(
      ( position ) => {
        this.setState({ lat: position.coords.latitude, 
                        long: position.coords.longitude, 
                        alt: position.coords.altitude })
      },
      ( error ) => console.log( error ), { enableHighAccuracy: true, timeout: 2000 }
    )
  }
  
  getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ( position ) => {
        this.setState({ lat: position.coords.latitude, 
                        long: position.coords.longitude, 
                        alt: position.coords.altitude })
      },
      ( error ) => console.log( error ), { enableHighAccuracy: true, timeout: 2000 }
    )
    console.log(`Lat: ${ this.state.lat } Long: ${ this.state.long } Alt: ${ this.state.alt }`)
  }

  render() {
    const { lat, long, alt } = this.state
    return (
      <View style={ styles.container }>
        <Text style={ styles.welcome }>Welcome to my Location Finder!</Text>
        <Button title="Press to update location" onPress={ () => this.getLocation() }/>
        <Text>{ lat !== '' ? 
          `Latitude: ${Number(lat).toFixed(2)}, longitude: ${Number(long).toFixed(2)}, altitude: ${ Number(alt).toFixed(2) }`
          : 
          `No position found.`}
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
})