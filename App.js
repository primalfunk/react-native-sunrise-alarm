import React, { Component } from 'react'
import { AppState, Button, Linking, StyleSheet, Text, View, Picker } from 'react-native'
import axios from 'react-native-axios'
import Example from '../myLocation/components/Example.js'
import moment from 'moment'
import PushController from '../myLocation/components/PushController.js'
import PushNotification from 'react-native-push-notification'
import Permissions from 'react-native-permissions'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'space-between',
    backgroundColor: '#F5FCFF',
    padding: 20,
  },
  title: {
    fontSize: 40,
    textAlign: 'center',
    margin: 10,
    fontFamily: 'monospace'
  },
  link: {
    textAlign: 'center',
    color: 'blue',
  },
  picker: {
    width: 300,
  }
})

export default class App extends Component {
  state = { permission: '', lat: '', long: '', alt: '', sunrise: '', today: moment().format(), selection: "" }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange)
    this.getPosition()
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  handleAppStateChange =  (appState ) => {
    if(appState === 'background') {
      PushNotification.localNotificationSchedule({
        //... You can use all the options from localNotifications
        message: "My Notification Message", // (required)
        date: new Date(Date.now() + (5 * 1000)) // in 5 secs
      })
    }
  }

  getPosition = () => {
    Permissions.request('location').then(response => {
      this.setState({ permission: response })
    })
    Permissions.check('location').then(response => {
      this.setState({ permission: response })
    })
    navigator.geolocation.getCurrentPosition(
      ( position ) => {
        this.setState({
          lat: position.coords.latitude,
          long: position.coords.longitude,
          alt: position.coords.altitude
        })
      },
      ( error ) => console.log( error ), { enableHighAccuracy: true, timeout: 2000 }
    )
  }

  getSunriseTime = ( lat, long ) => {
    let setdate = moment( new Date() ).add(1, 'days')
    let tomorrow = moment( setdate ).format('YYYY-MM-DD')
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
    }
    return (
      <View style={ styles.container }>
        <View>
          <Text style={ styles.title }>Sunrise alarm</Text>
          <Text style={ styles.link }
            onPress={() => Linking.openURL('http://sunrise-sunset.org')}>
            API by http://sunrise-sunset.org
          </Text>
        </View>
        <View style= { styles.container }>
          <Picker style={ styles.picker }
                  selectedValue={ this.state.selection }
                  onValueChange={(selection) => this.setState({selection})} >
            <Picker.Item label="Check for sunrise alarm" value="check" />
            <Picker.Item label="Set a new sunrise alarm" value="set" />
            <Picker.Item label="Delete sunrise alarm" value="delete" />
          </Picker>
          
          <Button title="Get sunrise time" onPress={() => this.getSunriseTime(Number(lat).toFixed(7), Number(long).toFixed(7) ) } />
          { sunrise !== '' ?
            <Text>{`Sunrise time to set: ${ setdate }`}</Text>
          : null  
          }

        </View>
        <Example />
        <PushController />
      </View>
    )
  }
}
