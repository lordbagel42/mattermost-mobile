// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import LinearGradient from 'expo-linear-gradient';
import React, {useEffect} from 'react';
import {type StyleProp, StyleSheet, View, type ViewStyle} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

import {useTheme} from '@context/theme';
import {changeOpacity} from '@utils/theme';

type Props = {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
    variant?: 'text' | 'rectangle' | 'circle';
    lines?: number;
    testID?: string;
};

const SkeletonLoading = ({
    width = '100%',
    height = 20,
    borderRadius = 4,
    style,
    variant = 'rectangle',
    lines = 1,
    testID,
}: Props) => {
    const theme = useTheme();
    const animatedValue = useSharedValue(0);

    useEffect(() => {
        animatedValue.value = withRepeat(
            withTiming(1, {duration: 1500}),
            -1,
            true,
        );
    }, [animatedValue]);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            animatedValue.value,
            [0, 0.5, 1],
            [0.3, 0.7, 0.3],
        );

        return {
            opacity,
        };
    }, []);

    const baseStyle = {
        backgroundColor: changeOpacity(theme.centerChannelColor, 0.1),
        borderRadius: variant === 'circle' ? 50 : borderRadius,
        width: variant === 'circle' ? height : width,
        height,
    };

    const gradientColors = [
        changeOpacity(theme.centerChannelColor, 0.08),
        changeOpacity(theme.centerChannelColor, 0.16),
        changeOpacity(theme.centerChannelColor, 0.08),
    ];

    if (variant === 'text' && lines > 1) {
        return (
            <View
                style={style}
                testID={testID}
            >
                {Array.from({length: lines}).map((_, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            baseStyle,
                            {
                                marginBottom: index < lines - 1 ? 8 : 0,
                                width: index === lines - 1 ? '80%' : width,
                            },
                            animatedStyle,
                        ]}
                    >
                        <LinearGradient
                            colors={gradientColors}
                            style={StyleSheet.absoluteFill}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                        />
                    </Animated.View>
                ))}
            </View>
        );
    }

    return (
        <Animated.View
            style={[baseStyle, animatedStyle, style]}
            testID={testID}
        >
            <LinearGradient
                colors={gradientColors}
                style={StyleSheet.absoluteFill}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
            />
        </Animated.View>
    );
};

export default SkeletonLoading;
