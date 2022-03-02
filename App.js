import React, {useState, useRef} from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
  Image,
  Platform,
} from 'react-native';
import RefreshWebView from './RefreshWebView';
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Animated, {SlideInUp, SlideOutDown} from 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const HEADER_HEIGHT = 56;
const TOOLBAR_HEIGHT = 48;
const INPUT_HEIGHT = 40;
const REGEX_URL =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=]*)/;

const BrowserInput = ({onSubmit}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.safeView}>
      <View style={[styles.header, {marginTop: insets.top}]}>
        <StatusBar barStyle={'light-content'} />
        <TextInput
          style={styles.input}
          networkActivityIndicatorVisible={true}
          placeholder={'Search or type URL'}
          placeholderTextColor={'#ffffff'}
          selectionColor={'#88B3F1'}
          blurOnSubmit={true}
          onSubmitEditing={onSubmit}
          returnKeyType={'go'}
          returnKeyLabel={'Go'}
          keyboardType={Platform.select({
            android: 'default',
            ios: 'web-search',
          })}
          autoCapitalize={'none'}
          autoCorrect={false}
        />
      </View>
    </View>
  );
};

const ToolbarButton = ({style, iconStyle, source, onPress}) => {
  return (
    <Pressable style={[styles.toolbarButton, style]} onPress={onPress}>
      <Image source={source} style={[styles.toolbarIcon, iconStyle]} />
    </Pressable>
  );
};

const BrowserToolbar = ({
  isVisible,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
}) => {
  const insets = useSafeAreaInsets();
  return (
    isVisible && (
      <Animated.View
        entering={SlideInUp}
        exiting={SlideOutDown}
        style={styles.safeBottom}>
        <View style={[styles.toolbar, {marginBottom: insets.bottom}]}>
          <View style={{flexDirection: 'row', height: '100%'}}>
            <ToolbarButton
              onPress={onGoBack}
              style={{marginRight: 12}}
              iconStyle={canGoBack && {tintColor: 'white'}}
              source={require('./src/assets/back.png')}
            />
            <ToolbarButton
              onPress={onGoForward}
              style={{marginLeft: 12}}
              iconStyle={canGoForward && {tintColor: 'white'}}
              source={require('./src/assets/next.png')}
            />
          </View>
          <ToolbarButton source={require('./src/assets/option.png')} />
        </View>
      </Animated.View>
    )
  );
};

const LoadingBar = ({percent}) => {
  return <View style={[styles.loadingBar, {width: `${percent * 100}%`}]} />;
};

const App = () => {
  const [isRefresh, setIsRefresh] = useState(false);
  const [isTollbarVisible, setIsToolbarVisible] = useState(true);
  const [isLoadingBarVisible, setIsLoadingBarVisible] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const [uri, setUri] = useState('https://reactnative.dev/');
  const webViewRef = useRef(null);
  const webViewOffset = useRef(0);

  const onRefresh = () => {
    if (webViewRef && webViewRef.current) {
      webViewRef.current.reload();
      setIsToolbarVisible(true);
    }
  };

  const onLoad = ({nativeEvent: {canGoBack, canGoForward}}) => {
    setIsRefresh(false);
    setCanGoBack(canGoBack);
    setCanGoForward(canGoForward);
  };

  const onLoadStart = () => {
    setIsLoadingBarVisible(true);
  };

  const onLoadProgress = syntheticEvent => {
    setLoadingPercent(syntheticEvent.nativeEvent.progress);
  };

  const onLoadEnd = () => {
    setIsLoadingBarVisible(false);
  };

  const handleOnScroll = event => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const dif = currentOffset - (webViewOffset.current || 0);
    if (Math.abs(dif) < 3) {
      console.log('unclear');
    } else if (dif < 0) {
      console.log('up');
      setIsToolbarVisible(true);
    } else {
      console.log('down');
      setIsToolbarVisible(false);
    }
    webViewOffset.current = currentOffset;
  };

  const onSubmit = ({nativeEvent: {text}}) => {
    const isUrlValid = REGEX_URL.test(text);
    if (isUrlValid) {
      setUri(text.includes('http') ? text : `http://${text}`);
    } else {
      setUri(`https://www.google.com/search?q=${text}`);
    }
  };

  const onGoBack = () => {
    if (webViewRef && webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const onGoForward = () => {
    if (webViewRef && webViewRef.current) {
      webViewRef.current.goForward();
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <BrowserInput onSubmit={onSubmit} />
        {isLoadingBarVisible && <LoadingBar percent={loadingPercent} />}
        <RefreshWebView
          onScroll={handleOnScroll}
          ref={webViewRef}
          isRefresh={isRefresh}
          onRefresh={onRefresh}
          source={{uri}}
          onLoad={onLoad}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          renderLoading={null}
          startInLoadingState={false}
          onLoadProgress={onLoadProgress}
        />
        <BrowserToolbar
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          isVisible={isTollbarVisible}
          onGoBack={onGoBack}
          onGoForward={onGoForward}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeView: {
    backgroundColor: '#36373B',
  },
  header: {
    width: '100%',
    height: HEADER_HEIGHT,
    justifyContent: 'center',
  },
  input: {
    marginHorizontal: 16,
    backgroundColor: '#5F6368',
    height: INPUT_HEIGHT,
    borderRadius: 22,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#FFFFFF',
  },
  safeBottom: {
    backgroundColor: '#36373B',
  },
  toolbar: {
    height: TOOLBAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  toolbarButton: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarIcon: {
    width: 24,
    height: 24,
    tintColor: '#757678',
  },
  loadingBar: {
    width: '100%',
    backgroundColor: '#3B78E7',
    height: 3,
  },
});

export default App;
