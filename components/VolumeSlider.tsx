import React, { useRef } from 'react';
import { View } from 'react-native';
import { PanResponder } from 'react-native';

const STEPS = [0, 20, 40, 60, 80, 100];
const THUMB_SIZE = 24;
const TRACK_HEIGHT = 4;
const SLIDER_HEIGHT = 52;

interface Props {
  value: number;
  onChange: (v: number) => void;
}

const VolumeSlider: React.FC<Props> = ({ value, onChange }) => {
  const trackRef = useRef<View>(null);
  const trackW = useRef(0);
  const trackPX = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        if (trackW.current === 0) return;
        const ratio = Math.max(0, Math.min(1, (e.nativeEvent.pageX - trackPX.current) / trackW.current));
        const snapped = STEPS.reduce((p, c) =>
          Math.abs(c / 100 - ratio) < Math.abs(p / 100 - ratio) ? c : p
        );
        onChangeRef.current(snapped);
      },
      onPanResponderMove: (e) => {
        if (trackW.current === 0) return;
        const ratio = Math.max(0, Math.min(1, (e.nativeEvent.pageX - trackPX.current) / trackW.current));
        const snapped = STEPS.reduce((p, c) =>
          Math.abs(c / 100 - ratio) < Math.abs(p / 100 - ratio) ? c : p
        );
        onChangeRef.current(snapped);
      },
    })
  ).current;

  const onLayout = () => {
    trackRef.current?.measure((_x, _y, w, _h, pageX) => {
      trackW.current = w;
      trackPX.current = pageX;
    });
  };

  const topTrack = (SLIDER_HEIGHT - TRACK_HEIGHT) / 2;
  const topThumb = (SLIDER_HEIGHT - THUMB_SIZE) / 2;
  const tickH = 16;
  const topTick = (SLIDER_HEIGHT - tickH) / 2;

  return (
    <View
      ref={trackRef}
      onLayout={onLayout}
      style={{ height: SLIDER_HEIGHT, overflow: 'visible' }}
      {...panResponder.panHandlers}
    >
      {/* Track background */}
      <View style={{
        position: 'absolute', left: 0, right: 0,
        top: topTrack, height: TRACK_HEIGHT,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
      }} />

      {/* Track fill */}
      <View style={{
        position: 'absolute', left: 0,
        width: `${value}%`,
        top: topTrack, height: TRACK_HEIGHT,
        backgroundColor: '#eab84e',
        borderRadius: 2,
      }} />

      {/* Tick marks */}
      {STEPS.map(step => (
        <View key={step} style={{
          position: 'absolute',
          left: `${step}%`,
          top: topTick,
          width: 3,
          height: tickH,
          borderRadius: 1.5,
          transform: [{ translateX: -1.5 }],
          backgroundColor: step <= value ? 'rgba(180,140,55,0.7)' : 'rgba(255,255,255,0.28)',
        }} />
      ))}

      {/* Thumb */}
      <View style={{
        position: 'absolute',
        left: `${value}%`,
        top: topThumb,
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: '#ffffff',
        transform: [{ translateX: -THUMB_SIZE / 2 }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#eab84e',
      }} />
    </View>
  );
};

export default VolumeSlider;
