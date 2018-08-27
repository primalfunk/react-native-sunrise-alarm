import React, { Component } from 'react'
import { Alert, Button, Linking, StyleSheet, Text, View } from 'react-native'
import axios from 'react-native-axios'
import BackgroundTimer from 'react-native-background-timer'
import moment from 'moment'

import Permissions from 'react-native-permissions'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
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
  state = { showAlarm: false, 
            permission: '', 
            lat: '', 
            long: '', 
            sunrise: '', 
            selection: 'set', 
            setDate: moment(), 
            timer: {}, 
            music: {}, 
            isPlaying: false }

  componentDidMount() {
    this.getPosition()
  }

  setSunriseAlarm = ( lat, long ) => {
    this.getSunriseTime( lat, long )
  }

  setAlarm = ( setDate ) => {
    let now = moment()
    let duration = moment.duration(setDate.diff(now))
    let ms = duration.asMilliseconds()
    const timer = BackgroundTimer.setTimeout(() => {
      this.makeNoise()
    }, ms)
    this.setState({ isSet: true, showAlarm: true, timer: timer })
    Alert.alert(
      'Sunrise alarm set',
      `${moment(setDate).format('MMMM Do YYYY, h:mm:ss a')}`,
      [
        { text: 'OK', onPress: () => null },
      ],
      { cancelable: false }
    )
  }

  makeNoise = () => {
    let Sound = require('react-native-sound')
    Sound.setCategory('Playback')
    let s = new Sound('s.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error)
        return
      } else {
        this.setState({ music: s, isPlaying: true })
        s.play(( success ) => {
          if ( success ) {
            s.release()
            this.setState({ isPlaying: false, showAlarm: false })
          } else {
            s.reset()
          }
        })
      }
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
        this.setState({ sunrise: res.data.results.sunrise, showAlarm: true })
        let offsetInHours = new Date().getTimezoneOffset() / 60
        let setDate = moment(new Date()).add(1, 'days')
        let dateStr = moment(setDate).format("YYYY-MM-DD")
        let myStr = `${dateStr} ${ res.data.results.sunrise }`
        let myMoment = moment( myStr, "YYYY-MM-DD hh:mm:ss A")
        console.log(moment(myMoment).format())
        let myTime = moment(myMoment).subtract(offsetInHours, 'hours')
        console.log(moment(myTime).format())
        this.setState({ setDate: myTime })
        this.setAlarm( myTime )
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

  cancelAlarm = ( timer, music, isPlaying ) => {
    BackgroundTimer.clearInterval( timer )
    Alert.alert(
      '',
      'Good morning!',
      [
        { text: '', onPress: () => null },
      ],
      { cancelable: false }
    )
    this.setState({ showAlarm: false })
    if( isPlaying ) {
      music.stop().release()
      this.setState({ isPlaying: false })
    }
  }

  render() {
    const { lat, long, showAlarm, setDate, timer, music, isPlaying } = this.state
    return (
      <View style={ styles.container }>
        <View>
          <Text style={styles.title}>Sunrise Alarm</Text>
          <Text style={styles.link}
            onPress={() => Linking.openURL('http://sunrise-sunset.org')}>
            API by http://sunrise-sunset.org
          </Text>
        </View>

        { showAlarm === false ?
            <Button title="Set a sunrise alarm" onPress={() => this.setSunriseAlarm(Number(lat).toFixed(7), Number(long).toFixed(7))} />
        :
        <View>
            <Text>{`Alarm set for ${moment(setDate).format('MMMM Do YYYY, h:mm:ss a') }`}</Text>
          <Button title="Disable the alarm" onPress={() => this.cancelAlarm( timer, music, isPlaying )} />
          { isPlaying ? <Text>The alarm is currently playing</Text> : null }
        </View>

        }
      </View>
    )
  }
}
