import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Black, DarkGray, Gold, Gray, LightGold, White } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useAuthStore } from '../store/authStore'
import { useNavigation } from '@react-navigation/native'

export default function Account() {

  const USER = useAuthStore(state => state.user)
  const LOGOUT = useAuthStore(state => state.logout)
  const navigation: any = useNavigation()

  const handleLogout = () => {
    navigation.navigate('Signin')
    LOGOUT()
  }

  return (
    <SafeAreaView style={{backgroundColor: Black, flex: 1, padding: 20}}>
      <Text style={{color: LightGold, fontSize: 32, fontWeight: '800'}}>{USER?.firstName + " " + USER?.lastName}</Text>
      <View style={{backgroundColor: '#fce5fc', marginTop: 20, height: 110, borderRadius: 8, padding: 10}}>
        <Text style={{color: Black, fontSize: 18, fontWeight: '700'}}>Invite friends!</Text>
        <Text style={{color: DarkGray, fontWeight: '500', width: 250, marginTop: 10}}>Invite your friends to earn free points for later use</Text>
      </View>
      <View style={styles.lineContainer}>
              <View style={styles.line} />
              {/* <Text style={styles.text}>or</Text> */}
              <View style={styles.line} />
            </View>
      <View style={{display: 'flex', flexDirection: 'row', marginTop: 30, alignItems: 'center'}}>
        <Ionicons name='person-add' size={20} color={Gray}/>
        <Text style={{color: Gray, marginStart: 30, fontSize: 16, fontWeight: '700' }}>Manage account</Text>
      </View>
      <View style={{display: 'flex', flexDirection: 'row', marginTop: 30, alignItems: 'center'}}>
        <Ionicons name='settings' size={20} color={Gray}/>
        <Text style={{color: Gray, marginStart: 30, fontSize: 16, fontWeight: '700' }}>Settings</Text>
      </View>
      <View style={{display: 'flex', flexDirection: 'row', marginTop: 30, alignItems: 'center'}}>
        <Ionicons name='chatbubbles' size={20} color={Gray}/>
        <Text style={{color: Gray, marginStart: 30, fontSize: 16, fontWeight: '700' }}>Messages</Text>
      </View>
      <View style={{display: 'flex', flexDirection: 'row', marginTop: 30, alignItems: 'center'}}>
        <Ionicons name='flame' size={20} color={Gray}/>
        <Text style={{color: Gray, marginStart: 30, fontSize: 16, fontWeight: '700' }}>Points</Text>
      </View>
      <View style={{display: 'flex', flexDirection: 'row', marginTop: 30, alignItems: 'center'}}>
        <Ionicons name='server' size={20} color={Gray}/>
        <Text style={{color: Gray, marginStart: 30, fontSize: 16, fontWeight: '700' }}>Saved groups</Text>
      </View>
      <View style={{display: 'flex', flexDirection: 'row', marginTop: 30, alignItems: 'center'}}>
        <Ionicons name='extension-puzzle' size={20} color={Gray}/>
        <Text style={{color: Gray, marginStart: 30, fontSize: 16, fontWeight: '700' }}>Set up your business profile</Text>
      </View>
      <View style={{display: 'flex', flexDirection: 'row', marginTop: 30, alignItems: 'center'}}>
        <Ionicons name='leaf' size={20} color={Gray}/>
        <Text style={{color: Gray, marginStart: 30, fontSize: 16, fontWeight: '700' }}>Send a gift</Text>
      </View>
      <TouchableOpacity onPress={handleLogout} style={{display: 'flex', flexDirection: 'row', marginTop: 30, alignItems: 'center'}}>
        <Ionicons name='log-out' size={20} color={Gray}/>
        <Text style={{color: Gray, marginStart: 30, fontSize: 16, fontWeight: '700' }}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    lineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
      },
      line: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
      },
})