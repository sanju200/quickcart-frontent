import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  Dimensions,
  Text,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';


const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.94;
const ITEM_HEIGHT = 180;

interface CarouselItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

const DATA: CarouselItem[] = [
  {
    id: '1',
    badge: 'HEALTHY CHOICE',
    title: 'Green Harvest',
    subtitle: 'Flat 30% OFF',
    description: 'Fresh organic vegetables from local farms',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '2',
    badge: 'FRESH ARRIVALS',
    title: 'Daily Greens',
    subtitle: 'Up to 20% OFF',
    description: 'Fresh leafy greens delivered daily',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '3',
    badge: 'ORGANIC DEALS',
    title: 'Fruit Basket',
    subtitle: 'Save ₹100 on ₹499',
    description: 'Succulent organic fruits at your door',
    image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '4',
    badge: 'PREMIUM STOCK',
    title: 'Exotic Herbs',
    subtitle: 'Buy 2 Get 1 Free',
    description: 'Enhance your cooking with fresh herbs',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80',
  },
];

const Carousel = () => {
  const { navigate } = useAppNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = React.useCallback(() => {
    if (flatListRef.current) {
      if (currentIndex < DATA.length - 1) {
        flatListRef.current.scrollToIndex({
          index: currentIndex + 1,
          animated: true,
        });
      } else {
        flatListRef.current.scrollToIndex({
          index: 0,
          animated: true,
        });
      }
    }
  }, [currentIndex]);

  const handlePrev = React.useCallback(() => {
    if (flatListRef.current) {
      if (currentIndex > 0) {
        flatListRef.current.scrollToIndex({
          index: currentIndex - 1,
          animated: true,
        });
      } else {
        flatListRef.current.scrollToIndex({
          index: DATA.length - 1,
          animated: true,
        });
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [handleNext]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: { item: CarouselItem }) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.overlay} />
          <View style={styles.contentContainer}>
            <View style={[styles.badge, styles.blackBadge]}>
              <Text style={styles.badgeText}>🌿 {item.badge}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={[styles.subtitle, styles.lightSubtitle]}>{item.subtitle}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigate('CATEGORY_PRODUCTS', { category: 'all' })}
            >
              <Text style={styles.buttonText}>Order Now →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Navigation Buttons */}
      <TouchableOpacity style={[styles.navBtn, styles.prevBtn]} onPress={handlePrev}>
         <Text style={styles.navBtnText}>‹</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={handleNext}>
         <Text style={styles.navBtnText}>›</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={width}
        decelerationRate="fast"
      />
      <View style={styles.pagination}>
        {DATA.map((_, index) => {
          const isActive = currentIndex === index;
          return (
            <View
              key={index.toString()}
              style={[
                styles.dot,
                isActive ? styles.dotActive : styles.dotInactive,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    backgroundColor: '#F1F8E9',
    position: 'relative',
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -18,
  },
  prevBtn: {
    left: 20,
  },
  nextBtn: {
    right: 20,
  },
  navBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  itemContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    height: '100%',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  blackBadge: {
    backgroundColor: '#000',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  lightSubtitle: {
    color: '#E8F5E9',
  },
  description: {
    color: '#E8F5E9',
    fontSize: 12,
    marginBottom: 15,
    opacity: 0.9,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
  },
  dot: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#fff',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default Carousel;
