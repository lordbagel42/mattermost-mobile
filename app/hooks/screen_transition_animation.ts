// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect} from 'react';
import {Platform, useWindowDimensions} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {
    useReducedMotion,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';

export const useScreenTransitionAnimation = (
    componentId: string,
    animated: boolean = true,
    animationType: 'slide' | 'fade' | 'scale' = 'slide',
) => {
    const {width, height} = useWindowDimensions();
    const reducedMotion = useReducedMotion();
    const shouldAnimate = animated && !reducedMotion;

    const translateX = useSharedValue(shouldAnimate ? width : 0);
    const translateY = useSharedValue(shouldAnimate ? height : 0);
    const scale = useSharedValue(shouldAnimate ? 0.9 : 1);
    const opacity = useSharedValue(shouldAnimate ? 0 : 1);

    const animatedStyle = useAnimatedStyle(() => {
        const duration = Platform.OS === 'android' ? 250 : 350;
        const springConfig = {damping: 20, stiffness: 300};

        switch (animationType) {
            case 'fade':
                return {
                    opacity: withTiming(opacity.value, {duration}),
                };
            case 'scale':
                return {
                    opacity: withTiming(opacity.value, {duration}),
                    transform: [
                        {scale: withSpring(scale.value, springConfig)},
                    ],
                };
            case 'slide':
            default:
                return {
                    transform: [
                        {translateX: withTiming(translateX.value, {duration})},
                    ],
                };
        }
    }, [animationType]);

    useEffect(() => {
        const listener = {
            componentDidAppear: () => {
                switch (animationType) {
                    case 'fade':
                        opacity.value = 1;
                        break;
                    case 'scale':
                        opacity.value = 1;
                        scale.value = 1;
                        break;
                    case 'slide':
                    default:
                        translateX.value = 0;
                        break;
                }
            },
            componentDidDisappear: () => {
                switch (animationType) {
                    case 'fade':
                        opacity.value = shouldAnimate ? 0 : 1;
                        break;
                    case 'scale':
                        opacity.value = shouldAnimate ? 0 : 1;
                        scale.value = shouldAnimate ? 0.9 : 1;
                        break;
                    case 'slide':
                    default:
                        translateX.value = shouldAnimate ? -width : 0;
                        break;
                }
            },
        };

        const unsubscribe = Navigation.events().registerComponentListener(listener, componentId);

        return () => unsubscribe.remove();
    }, [componentId, translateX, translateY, scale, opacity, width, height, reducedMotion, shouldAnimate, animationType]);

    useEffect(() => {
        if (!shouldAnimate) {
            translateX.value = 0;
            translateY.value = 0;
            scale.value = 1;
            opacity.value = 1;
        }
    }, [translateX, translateY, scale, opacity, shouldAnimate]);

    return animatedStyle;
};

// Enhanced parallax animation hook
export const useParallaxAnimation = () => {
    const {height} = useWindowDimensions();
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    const parallaxStyle = useAnimatedStyle(() => {
        const scrollOffset = translateY.value;

        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollOffset,
                        [0, height],
                        [0, -height * 0.3],
                        Extrapolate.CLAMP,
                    ),
                },
                {
                    scale: interpolate(
                        scrollOffset,
                        [0, height],
                        [1, 1.1],
                        Extrapolate.CLAMP,
                    ),
                },
            ],
        };
    }, []);

    return {parallaxStyle, translateY, scale};
};
