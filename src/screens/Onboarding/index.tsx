import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import slides from './slides';
import {Black, Gold, White} from '../../constants/Color';

const {width} = Dimensions.get('window');

const Onboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation: any = useNavigation();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.scrollToIndex({index: currentIndex + 1});
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.reset({
        index: 0,
        routes: [{name: 'Signin'}],
      });
    }
  };

  let flatListRef: any = null;

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onScroll={handleScroll}
        ref={ref => {
          flatListRef = ref;
        }}
        renderItem={({item}) => (
          <View style={styles.slide}>
            {item.image ? 
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            /> : 
            // <Logo height={100} width={300} style={{marginBottom: 10}}/>
            <Image
          source={require('../../assets/logo/mainLogo.png')}
          height={100}
          style={{marginTop: 15}}
        />
            }
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: White,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: Gold,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 250,
    marginBottom: 10
  },
});
