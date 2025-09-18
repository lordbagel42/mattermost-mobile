// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Dimensions} from 'react-native';
import {
    withSpring,
    withTiming,
    withDelay,
    withSequence,
    runOnJS,
    interpolate,
    Extrapolate,
    type SharedValue,
    type WithTimingConfig,
    type WithSpringConfig,
} from 'react-native-reanimated';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

// Animation configurations
export const ANIMATION_CONFIGS = {

    // Timing configurations
    fast: {duration: 200, damping: 20} as WithTimingConfig,
    medium: {duration: 300, damping: 25} as WithTimingConfig,
    slow: {duration: 500, damping: 30} as WithTimingConfig,

    // Spring configurations
    bouncy: {damping: 15, stiffness: 150} as WithSpringConfig,
    gentle: {damping: 20, stiffness: 120} as WithSpringConfig,
    snappy: {damping: 25, stiffness: 180} as WithSpringConfig,
};

// Common animation presets
export const ANIMATION_PRESETS = {

    // Fade animations
    fadeIn: (duration = 300) => withTiming(1, {duration}),
    fadeOut: (duration = 300) => withTiming(0, {duration}),

    // Scale animations
    scaleIn: () => withSpring(1, ANIMATION_CONFIGS.gentle),
    scaleOut: () => withSpring(0, ANIMATION_CONFIGS.gentle),
    bounceIn: () => withSpring(1, ANIMATION_CONFIGS.bouncy),

    // Slide animations
    slideInFromRight: (duration = 300) => withTiming(0, {duration}),
    slideInFromLeft: (duration = 300) => withTiming(0, {duration}),
    slideInFromBottom: (duration = 300) => withTiming(0, {duration}),
    slideInFromTop: (duration = 300) => withTiming(0, {duration}),
};

// Material Design elevation shadows
export const createElevation = (elevation: number) => {
    const shadowOffset = {
        width: 0,
        height: Math.round(elevation * 0.6),
    };

    const shadowOpacity = interpolate(
        elevation,
        [0, 1, 2, 3, 4, 5, 8, 16, 24],
        [0, 0.2, 0.23, 0.27, 0.3, 0.34, 0.44, 0.56, 0.64],
        Extrapolate.CLAMP,
    );

    const shadowRadius = interpolate(
        elevation,
        [0, 1, 2, 3, 4, 5, 8, 16, 24],
        [0, 1.41, 2.22, 2.62, 3.84, 4.65, 6.27, 7.49, 8.38],
        Extrapolate.CLAMP,
    );

    return {
        shadowOffset,
        shadowOpacity,
        shadowRadius,
        shadowColor: '#000000',
        elevation, // Android
    };
};

// Button press animation
export const createButtonPressAnimation = (
    scale: SharedValue<number>,
    onPress?: () => void,
) => {
    'worklet';

    scale.value = withSequence(
        withTiming(0.95, {duration: 100}),
        withTiming(1, {duration: 100}, (finished) => {
            if (finished && onPress) {
                runOnJS(onPress)();
            }
        }),
    );
};

// Smooth list item animations
export const createListItemAnimation = (index: number) => {
    const delay = index * 50;
    return {
        opacity: withDelay(delay, withTiming(1, {duration: 300})),
        transform: [
            {
                translateY: withDelay(
                    delay,
                    withTiming(0, {duration: 300}),
                ),
            },
        ],
    };
};

// Modal animations
export const MODAL_ANIMATIONS = {
    slideUp: {
        entering: {
            opacity: withTiming(1, {duration: 300}),
            transform: [
                {translateY: withTiming(0, {duration: 300})},
            ],
        },
        exiting: {
            opacity: withTiming(0, {duration: 250}),
            transform: [
                {translateY: withTiming(SCREEN_HEIGHT, {duration: 250})},
            ],
        },
    },

    scale: {
        entering: {
            opacity: withTiming(1, {duration: 300}),
            transform: [
                {scale: withSpring(1, ANIMATION_CONFIGS.gentle)},
            ],
        },
        exiting: {
            opacity: withTiming(0, {duration: 200}),
            transform: [
                {scale: withTiming(0.8, {duration: 200})},
            ],
        },
    },

    fade: {
        entering: {
            opacity: withTiming(1, {duration: 200}),
        },
        exiting: {
            opacity: withTiming(0, {duration: 150}),
        },
    },
};

// Loading animations
export const createLoadingAnimation = (progress: SharedValue<number>) => {
    'worklet';

    progress.value = withSequence(
        withTiming(1, {duration: 800}),
        withTiming(0.3, {duration: 800}),
    );
};

// Skeleton loading animation
export const createSkeletonAnimation = (opacity: SharedValue<number>) => {
    'worklet';

    opacity.value = withSequence(
        withTiming(0.3, {duration: 1000}),
        withTiming(1, {duration: 1000}),
    );
};

// Haptic feedback integration
export const createHapticFeedback = () => {
    // This will be integrated with react-native-haptic-feedback
    return () => {
        'worklet';

        // Placeholder for haptic feedback
    };
};

// Screen transition animations
export const SCREEN_TRANSITIONS = {
    slide: {
        headerStyleInterpolator: ({current, layouts}: any) => {
            return {
                cardStyle: {
                    transform: [
                        {
                            translateX: current.progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [layouts.screen.width, 0],
                            }),
                        },
                    ],
                },
            };
        },
    },

    modal: {
        headerStyleInterpolator: ({current}: any) => {
            return {
                cardStyle: {
                    opacity: current.progress,
                    transform: [
                        {
                            scale: current.progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.9, 1],
                            }),
                        },
                    ],
                },
            };
        },
    },
};

export default {
    ANIMATION_CONFIGS,
    ANIMATION_PRESETS,
    MODAL_ANIMATIONS,
    SCREEN_TRANSITIONS,
    createElevation,
    createButtonPressAnimation,
    createListItemAnimation,
    createLoadingAnimation,
    createSkeletonAnimation,
    createHapticFeedback,
};
