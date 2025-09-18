// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Button as ElementButton, type ButtonProps} from '@rneui/base';
import React, {useMemo, type ReactNode, useCallback} from 'react';
import {type StyleProp, StyleSheet, Text, type TextStyle, View, type ViewStyle, type Insets} from 'react-native';
import * as Haptics from 'react-native-haptic-feedback';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';

import CompassIcon from '@components/compass_icon';
import Loading from '@components/loading';
import {createElevation} from '@utils/animations';
import {buttonBackgroundStyle, buttonTextStyle} from '@utils/buttonStyles';

type Props = Omit<ButtonProps, 'size'> & {
    theme: Theme;
    backgroundStyle?: StyleProp<ViewStyle>;
    buttonContainerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    size?: ButtonSize;
    emphasis?: ButtonEmphasis;
    testID?: string;
    onPress?: () => void;
    text: string;
    iconComponent?: ReactNode;
    disabled?: boolean;
    hitSlop?: Insets;
    isIconOnTheRight?: boolean;
    iconName?: string;
    showLoader?: boolean;
    isInverted?: boolean;
    isDestructive?: boolean;
    withHapticFeedback?: boolean;
    elevation?: number;
    animated?: boolean;
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 7,
        alignItems: 'center',
    },
});

const iconSizePerSize: Record<ButtonSize, number> = {
    xs: 14,
    s: 14,
    m: 18,
    lg: 22,
};

const AnimatedElementButton = Animated.createAnimatedComponent(ElementButton);

const Button = ({
    theme,
    backgroundStyle,
    buttonContainerStyle,
    textStyle,
    size = 'm',
    emphasis,
    onPress,
    text,
    testID,
    iconName,
    isIconOnTheRight = false,
    iconComponent,
    disabled,
    hitSlop,
    showLoader = false,
    isInverted = false,
    isDestructive = false,
    withHapticFeedback = true,
    elevation = 0,
    animated = true,
}: Props) => {
    let buttonType: ButtonType = 'default';
    if (isDestructive) {
        buttonType = 'destructive';
    } else if (isInverted) {
        buttonType = 'inverted';
    }

    // Animation values
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: scale.value,
                },
            ],
            opacity: opacity.value,
        };
    }, []);

    const elevationStyle = useMemo(() => {
        if (elevation > 0) {
            return createElevation(elevation);
        }
        return {};
    }, [elevation]);

    const bgStyle = useMemo(() => [
        buttonBackgroundStyle(theme, size, emphasis, buttonType),
        elevationStyle,
        backgroundStyle,
    ], [theme, backgroundStyle, size, emphasis, buttonType, elevationStyle]);

    const bgDisabledStyle = useMemo(() => [
        buttonBackgroundStyle(theme, size, emphasis, 'disabled'),
        elevationStyle,
        backgroundStyle,
    ], [theme, backgroundStyle, size, emphasis, elevationStyle]);

    const txtStyle = useMemo(() => StyleSheet.flatten([
        buttonTextStyle(theme, size, emphasis, buttonType),
        textStyle,
    ]), [theme, textStyle, size, emphasis, buttonType]);

    const txtDisabledStyle = useMemo(() => StyleSheet.flatten([
        buttonTextStyle(theme, size, emphasis, 'disabled'),
        textStyle,
    ]), [theme, textStyle, size, emphasis]);

    const txtStyleToUse = disabled ? txtDisabledStyle : txtStyle;

    const handlePress = useCallback(() => {
        if (disabled) {
            return;
        }

        if (animated) {
            scale.value = withSpring(0.95, {damping: 15, stiffness: 300}, () => {
                scale.value = withSpring(1, {damping: 15, stiffness: 300});
            });
        }

        if (withHapticFeedback) {
            Haptics.trigger('impactLight');
        }

        if (onPress) {
            // Small delay to show the animation
            if (animated) {
                setTimeout(() => {
                    runOnJS(onPress)();
                }, 50);
            } else {
                onPress();
            }
        }
    }, [disabled, animated, withHapticFeedback, onPress, scale]);

    const loadingComponent = (
        <Loading
            color={txtStyleToUse.color}
        />
    );

    let icon: ReactNode;

    if (iconComponent) {
        icon = iconComponent;
    } else if (iconName) {
        // We wrap the icon in a view to avoid it to follow text layout
        icon = (
            <View>
                <CompassIcon
                    name={iconName!}
                    size={iconSizePerSize[size]}
                    color={txtStyleToUse.color}
                    testID={`${testID}-icon`}
                />
            </View>
        );
    }

    const ButtonComponent = animated ? AnimatedElementButton : ElementButton;

    return (
        <ButtonComponent
            buttonStyle={bgStyle}
            containerStyle={[buttonContainerStyle, animated && animatedStyle]}
            disabledStyle={bgDisabledStyle}
            onPress={handlePress}
            testID={testID}
            disabled={disabled}
            hitSlop={hitSlop}
        >
            <View
                style={styles.container}
                testID={`${testID}-text-container`}
            >
                {showLoader && loadingComponent}
                {!isIconOnTheRight && icon}
                <Text
                    style={txtStyleToUse}
                    numberOfLines={1}
                >
                    {text}
                </Text>
                {isIconOnTheRight && icon}
            </View>
        </ButtonComponent>
    );
};

export default Button;
