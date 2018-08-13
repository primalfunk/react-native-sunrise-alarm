import React, { Component } from 'react'
import { Button, Linking, StyleSheet, Text, View } from 'react-native'
import axios from 'react-native-axios'
import moment from 'moment'

import Permissions from 'react-native-permissions'

export default class App extends Component {
  state = { permission: '', lat: '', long: '', alt: '', sunrise: '', today: moment().format() }

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
  
  getSunriseTime = ( lat, long ) => {
    let setdate = moment(new Date()).add(1, 'days')
    let tomorrow = moment(setdate).format('YYYY-MM-DD')
    axios.get(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${long}&date=${tomorrow}`)
      .then( res => {
          this.setState({ sunrise: res.data.results.sunrise })
    })
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
    const { lat, long, alt, sunrise } = this.state
    let offsetInHours = new Date().getTimezoneOffset() / 60
    let setdate = moment( new Date() ).add(1, 'days')
    let datestr = moment( setdate ).format("YYYY-MM-DD")
    if ( sunrise !== '' ) {
      let mystr = `${datestr} ${sunrise}`
      let mytime = moment( mystr, 'YYYY-MM-DD hh:mm:ss A')
      mytime = moment( mytime ).subtract(offsetInHours, 'hours')
      setdate = moment( mytime ).format('YYYY-MM-DD hh:mm:ss A')
      //then go ahead and set up the alarm clock
    }
    return (
      <View style={ styles.container }>
        <Text style={ styles.welcome }>Sunrise alarm</Text>
        <Text style={{ color: 'blue' }}
          onPress={() => Linking.openURL('http://sunrise-sunset.org')}>
          Using Sunrise-sunset.org's API
        </Text>
        <Button title="Get sunrise time" onPress={() => this.getSunriseTime(Number(lat).toFixed(7), Number(long).toFixed(7) ) } />
        { sunrise !== '' ?
        <Text>{`Sunrise time to set: ${ setdate }`}</Text>
        : null  
      }
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