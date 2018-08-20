import React from 'react'
import PushNotification from 'react-native-push-notification'

export default class PushController extends React.Component {
  
  componentDidMount() {
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification)

        // process the notification

        // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
        notification.finish(PushNotificationIOS.FetchResult.NoData)
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      popInitialNotification: true,
      requestPermissions: true,
    })
  }

  render() {
    return null
  }

}
