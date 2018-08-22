import React, { Component } from 'react'
import { Alert, Button, Linking, StyleSheet, Text, View, Picker, PushNotificationIOS } from 'react-native'
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
    alignContent: 'center',
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
    height: 50,
  }
})

export default class App extends Component {
  state = { permission: '', lat: '', long: '', alt: '', sunrise: '', selection: 'set' }

  componentDidMount() {
    this.getPosition()
  }

  handleSelection = ( selection, lat, long ) => {
    switch( selection ) {
      case 'set':
        this.getSunriseTime( lat, long )
        break
      case 'delete':
        PushNotification.cancelAllLocalNotifications()
        Alert.alert(
          'Really delete?',
          'This will disable any alarms set by this app. Continue?',
          [
            { text: 'Continue', onPress: () => console.log("Continue") },
            { text: 'Cancel', onPress: () => console.log("Cancel"), style: 'cancel' }
          ]
        )
        break
      default:
        console.log("default selection")
    }
  }

  handleSetter = ( setdate ) => {
    console.log(`Setdate received is ${setdate}`)
    PushNotification.localNotificationSchedule({
      message: "The sun is rising, it's time to wake up!",
      date: new Date(setdate)
    })
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
                        long: position.coords.longitude })
      },
      ( error ) => console.log( error ), { enableHighAccuracy: true, timeout: 2000 }
    )
  }

  render() {
    const { lat, long, selection, sunrise } = this.state
    let offsetInHours = new Date().getTimezoneOffset() / 60
    let setdate = moment( new Date() ).add( 1, 'days' )
    let datestr = moment( setdate ).format("YYYY-MM-DD")
    if ( sunrise !== '' ) {
      let mystr = `${datestr} ${sunrise}`
      let mytime = moment( mystr, 'YYYY-MM-DD hh:mm:ss A')
      mytime = moment( mytime ).subtract(offsetInHours, 'hours')
      setdate = moment( mytime ).toISOString()
      console.log(setdate)
    }
    return (
      <View style={ styles.container }>
        { sunrise === '' ?
        <View>
          <View>
            <Text style={styles.title}>Sunrise alarm</Text>
            <Text style={styles.link}
              onPress={() => Linking.openURL('http://sunrise-sunset.org')}>
              API by http://sunrise-sunset.org
          </Text>
          </View>
          <View style={styles.container}>
            <Picker style={styles.picker}
              selectedValue={this.state.selection}
              onValueChange={(selection) => this.setState({ selection })} >
              <Picker.Item label="Set a new sunrise alarm" value="set" />
              <Picker.Item label="Delete sunrise alarm" value="delete" />
            </Picker>
            <Button title="Go" onPress={() => this.handleSelection(selection, Number(lat).toFixed(7), Number(long).toFixed(7))} />
          </View>
        </View>
        :
        <View>
          <Text>The next sunrise is at: { setdate }</Text>
          <Button title="Set alarm" onPress={() => this.handleSetter( setdate )} />
        </View> 
        }
      <PushController />
      
      </View>
    )
  }
}
