// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {type ReactNode} from 'react';
import {type StyleProp, View, type ViewStyle} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';

import {useTheme} from '@context/theme';
import {createElevation} from '@utils/animations';
import {changeOpacity} from '@utils/theme';

type Props = {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    elevation?: number;
    variant?: 'default' | 'outlined' | 'filled';
    padding?: number | 'none' | 'small' | 'medium' | 'large';
    margin?: number | 'none' | 'small' | 'medium' | 'large';
    radius?: number | 'small' | 'medium' | 'large';
    animated?: boolean;
    testID?: string;
    onPress?: () => void;
};

const paddingMap = {
    none: 0,
    small: 8,
    medium: 16,
    large: 24,
};

const marginMap = {
    none: 0,
    small: 4,
    medium: 8,
    large: 16,
};

const radiusMap = {
    small: 8,
    medium: 12,
    large: 16,
};

const Card = ({
    children,
    style,
    elevation = 2,
    variant = 'default',
    padding = 'medium',
    margin = 'small',
    radius = 'medium',
    animated = true,
    testID,
    onPress,
}: Props) => {
    const theme = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: scale.value,
                },
            ],
        };
    }, []);

    const handlePressIn = () => {
        if (animated && onPress) {
            scale.value = withSpring(0.98, {damping: 15, stiffness: 300});
        }
    };

    const handlePressOut = () => {
        if (animated && onPress) {
            scale.value = withSpring(1, {damping: 15, stiffness: 300});
        }
    };

    const paddingValue = typeof padding === 'number' ? padding : paddingMap[padding];
    const marginValue = typeof margin === 'number' ? margin : marginMap[margin];
    const radiusValue = typeof radius === 'number' ? radius : radiusMap[radius];

    const baseStyle = {
        backgroundColor: theme.centerChannelBg,
        borderRadius: radiusValue,
        padding: paddingValue,
        margin: marginValue,
    };

    const variantStyle = (() => {
        switch (variant) {
            case 'outlined':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: changeOpacity(theme.centerChannelColor, 0.16),
                };
            case 'filled':
                return {
                    backgroundColor: changeOpacity(theme.centerChannelColor, 0.08),
                };
            default:
                return {};
        }
    })();

    const elevationStyle = elevation > 0 ? createElevation(elevation) : {};

    const cardStyle = [
        baseStyle,
        variantStyle,
        elevationStyle,
        animated && animatedStyle,
        style,
    ];

    const CardComponent = animated && onPress ? Animated.createAnimatedComponent(View) : View;

    return (
        <CardComponent
            style={cardStyle}
            testID={testID}
            onPressIn={onPress ? handlePressIn : undefined}
            onPressOut={onPress ? handlePressOut : undefined}
            onPress={onPress}
        >
            {children}
        </CardComponent>
    );
};

export default Card;
