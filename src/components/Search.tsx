import {Image, StyleSheet, Text, TextInput, View} from 'react-native';
import React from 'react';
import {Black, Gold, Gray, White} from '../constants/Color';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Search = () => {
  return (
    <View style={{backgroundColor: Black, flex: 1, paddingHorizontal: 10}}>
      <View
        style={{
          backgroundColor: '#35383f',
          height: 45,
          borderRadius: 8,
          marginTop: 30,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
        }}>
        <TextInput style={{}} placeholder="Abcef" />
        <Ionicons name="close" size={20} color={White} />
      </View>
      <View
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          marginTop: 20,
        }}>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <Text style={{color: White, fontWeight: '500', fontSize: 16}}>
            Results for
          </Text>
          <Text style={{color: Gold, fontWeight: '500', fontSize: 16}}>
            {' '}
            "Abcef"
          </Text>
        </View>
        <Text style={{color: Gold, fontWeight: '500', fontSize: 16}}>
          0 found
        </Text>
      </View>

      <Image
        source={require('../assets/images/search.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text
        style={{
          color: White,
          fontWeight: '500',
          fontSize: 18,
          textAlign: 'center',
          marginTop: 10,
        }}>
        Not Found
      </Text>
      <View style={{width: 300, alignSelf: 'center'}}>
        <Text style={{color: Gray, textAlign: 'center'}}>
          Sorry, the keyword you entered cannot be found, please check again or
          search with another keyword.
        </Text>
      </View>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 250,
    marginTop: 100,
  },
});
