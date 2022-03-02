import React, {useState} from 'react';
import {RefreshControl, Dimensions, StyleSheet} from 'react-native';
import WebView from 'react-native-webview';
import {ScrollView} from 'react-native-gesture-handler';

const RefreshWebView = React.forwardRef((props, ref) => {
  const {isRefresh, onRefresh, onScroll, ...webViewProps} = props;
  console.log('====================================');
  console.log('RefreshWebView.webViewProps', webViewProps);
  console.log('====================================');
  const [height, setHeight] = useState(Dimensions.get('screen').height);
  const [isEnabled, setEnabled] = useState(typeof onRefresh === 'function');

  return (
    <ScrollView
      onLayout={e => setHeight(e.nativeEvent.layout.height)}
      refreshControl={
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={isRefresh}
          enabled={isEnabled}
        />
      }
      style={styles.view}>
      <WebView
        ref={ref}
        {...webViewProps}
        onScroll={e => {
          onScroll(e);
          setEnabled(
            typeof onRefresh === 'function' &&
              e.nativeEvent.contentOffset.y === 0,
          );
        }}
        style={[styles.webView, {height}, webViewProps.style]}
      />
    </ScrollView>
  );
});

export default RefreshWebView;

const styles = StyleSheet.create({
  webView: {
    with: '100%',
    height: '100%',
  },
});
