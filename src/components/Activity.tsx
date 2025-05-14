import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Black, Gray, LightGold, White } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/Ionicons'

export default function Activity() {
  return (
    <SafeAreaView style={{backgroundColor: Black, flex: 1, padding:20}}>
      <Text style={{color: LightGold, fontSize: 32, fontWeight: '700'}}>Activity</Text>
      <View style={{marginTop: 20, display: 'flex', flexDirection: 'row', alignItems:'center', justifyContent: 'space-between'}}>
        <Text style={{color: LightGold, fontSize: 20, fontWeight: '700'}}>Past</Text>
        <Ionicons name='filter' size={20} color={LightGold} />
      </View>
      <Text style={{color: Gray, textAlign: 'center', fontSize: 16, marginTop: 20}}>You do not have any recent activity</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})