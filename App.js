import React, { Component } from 'react'
import { Alert, Button, Linking, StyleSheet, Text, View, Picker } from 'react-native'
import axios from 'react-native-axios'
import BackgroundTimer from 'react-native-background-timer'
import moment from 'moment'

import Permissions from 'react-native-permissions'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    backgroundColor: '#F5FCFF',
    padding: 40,
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
  text: {
    fontFamily: 'sans-serif-thin',
    padding: 40,
  },
  picker: {
    width: 300,
    height: 50,
    padding: 40,
  }
})

export default class App extends Component {
  state = { permission: '', lat: '', long: '', alt: '', sunrise: '', selection: 'set', isSet: false, isAlarm: false }

  componentDidMount() {
    this.getPosition()
  }

  handleSelection = ( selection, lat, long ) => {
    switch( selection ) {
      case 'set':
        this.getSunriseTime( lat, long )
        break
      case 'delete':
        Alert.alert(
          '',
          'This will disable any alarms set by this app.',
          [
            { text: 'Ok', onPress: () => null },
          ]
        )
        //more code
      default:
        console.log("default selection")
    }
  }

  handleSetter = ( setdate ) => {
    const timer = BackgroundTimer.setTimeout(() => {
      // this will be executed once after 10 seconds
      // even when app is the the background
      this.setState({ isAlarm: true })
      this.makeNoise()
    }, 10000)

    this.setState({ isSet: true, sunrise: '' })
  }

  makeNoise = () => {
    let Sound = require('react-native-sound')
    Sound.setCategory('Playback')
    let s = new Sound('s.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error)
        return
      } else {
        s.play((success) => {
          if (success) {
            console.log('played it!')
          } else {
            console.log('playback failed.')
            s.reset()
          }
        })
      }
      console.log('duration in seconds: ' + Number(s.getDuration()).toFixed(3) + ' ')
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
    const { lat, long, selection, sunrise, isSet } = this.state
    let offsetInHours = new Date().getTimezoneOffset() / 60
    let setdate = moment( new Date() ).add( 1, 'days' )
    let datestr = moment( setdate ).format("YYYY-MM-DD")
    if ( sunrise !== '' ) {
      let mystr = `${datestr} ${sunrise}`
      let mytime = moment( mystr, 'YYYY-MM-DD hh:mm:ss A')
      mytime = moment( mytime ).subtract(offsetInHours, 'hours')
      //setdate = moment( mytime ).toISOString()
      setdate = moment(new Date()).add(10, 'seconds').toISOString()
      setdate = moment( setdate ).toISOString()
    }
    return (
      <View style={ styles.container }>
        <Text style={ styles.text }>{`Alarm set: ${isSet}` }</Text>
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
          <Text style={ styles.text }>The next sunrise is at: { setdate }</Text>
          <Button title="Set alarm" onPress={() => this.handleSetter( setdate )} />
        </View> 
        }
      </View>
    )
  }
}
