// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {requestReview} from 'expo-store-review';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import {TouchableWithoutFeedback, View, Text, Alert, TouchableOpacity} from 'react-native';
import * as Haptics from 'react-native-haptic-feedback';
import Animated, {
    runOnJS,
    SlideInDown,
    SlideOutDown,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withDelay,
} from 'react-native-reanimated';

import {storeDontAskForReview, storeLastAskForReview} from '@actions/app/global';
import {isNPSEnabled} from '@actions/remote/nps';
import Button from '@components/button';
import CompassIcon from '@components/compass_icon';
import ReviewAppIllustration from '@components/illustrations/review_app';
import {useServerUrl} from '@context/server';
import {useTheme} from '@context/theme';
import useAndroidHardwareBackHandler from '@hooks/android_back_handler';
import useBackNavigation from '@hooks/navigate_back';
import SecurityManager from '@managers/security_manager';
import {dismissOverlay, showShareFeedbackOverlay} from '@screens/navigation';
import {createElevation} from '@utils/animations';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {typography} from '@utils/typography';

import type {AvailableScreens} from '@typings/screens/navigation';

type Props = {
    hasAskedBefore: boolean;
    componentId: AvailableScreens;
}

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => ({
    root: {
        flex: 1,
        backgroundColor: changeOpacity('#000000', 0.50),
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        maxWidth: 680,
        alignSelf: 'center',
        alignContet: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexDirection: 'row',
    },
    wrapper: {
        backgroundColor: theme.centerChannelBg,
        borderRadius: 16,
        flex: 1,
        margin: 10,
        opacity: 1,
        ...createElevation(8),
        borderWidth: 1,
        borderColor: changeOpacity(theme.centerChannelColor, 0.12),
    },
    content: {
        marginHorizontal: 24,
        marginBottom: 24,
        alignItems: 'center',
    },
    buttonsWrapper: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    leftButton: {
        flex: 1,
    },
    rightButton: {
        flex: 1,
    },
    close: {
        justifyContent: 'center',
        height: 44,
        width: 40,
        paddingLeft: 16,
        paddingTop: 16,
        borderRadius: 22,
    },
    title: {
        ...typography('Heading', 600, 'SemiBold'),
        color: theme.centerChannelColor,
        marginTop: 24,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        ...typography('Body', 200, 'Regular'),
        color: changeOpacity(theme.centerChannelColor, 0.72),
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    dontAsk: {
        ...typography('Body', 75, 'SemiBold'),
        color: theme.buttonBg,
        marginTop: 24,
    },
}));

const ReviewApp = ({
    hasAskedBefore,
    componentId,
}: Props) => {
    const intl = useIntl();
    const theme = useTheme();
    const styles = getStyleSheet(theme);
    const serverUrl = useServerUrl();

    const [show, setShow] = useState(true);

    // Animation values for enhanced effects
    const contentOpacity = useSharedValue(0);
    const contentScale = useSharedValue(0.9);

    const executeAfterDone = useRef<() => void>(() => dismissOverlay(componentId));

    const contentAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: contentOpacity.value,
            transform: [
                {scale: contentScale.value},
            ],
        };
    }, []);

    const close = useCallback((afterDone: () => void) => {
        executeAfterDone.current = afterDone;
        storeLastAskForReview();

        // Animate content out
        contentOpacity.value = withSequence(
            withTiming(0, {duration: 200}),
            withTiming(0, {duration: 100}, () => {
                runOnJS(setShow)(false);
            }),
        );
        contentScale.value = withTiming(0.8, {duration: 300});
    }, [contentOpacity, contentScale]);

    const onPressYes = useCallback(async () => {
        // Haptic feedback
        Haptics.trigger('impactMedium');

        close(async () => {
            await dismissOverlay(componentId);
            try {
                await requestReview();
            } catch (error) {
                Alert.alert(
                    intl.formatMessage({id: 'rate.error.title', defaultMessage: 'Error'}),
                    intl.formatMessage({id: 'rate.error.text', defaultMessage: 'There has been an error while opening the review modal.'}),
                );
            }
        });
    }, [close, intl, componentId]);

    const onPressNeedsWork = useCallback(async () => {
        // Haptic feedback
        Haptics.trigger('impactLight');

        close(async () => {
            await dismissOverlay(componentId);
            if (await isNPSEnabled(serverUrl)) {
                showShareFeedbackOverlay();
            }
        });
    }, [close, componentId, serverUrl]);

    const onPressDontAsk = useCallback(() => {
        storeDontAskForReview();
        close(async () => {
            await dismissOverlay(componentId);
        });
    }, [close, intl, componentId]);

    const onPressClose = useCallback(() => {
        close(async () => {
            await dismissOverlay(componentId);
        });
    }, [close, componentId]);

    useBackNavigation(onPressClose);
    useAndroidHardwareBackHandler(componentId, onPressClose);

    const doAfterAnimation = useCallback(() => {
        executeAfterDone.current();
    }, []);

    const slideOut = useMemo(() => SlideOutDown.withCallback((finished: boolean) => {
        'worklet';
        if (finished) {
            runOnJS(doAfterAnimation)();
        }
    }), [doAfterAnimation]);

    const slideIn = useMemo(() => SlideInDown.withCallback(() => {
        'worklet';

        // Animate content in with staggered animation
        contentOpacity.value = withDelay(200, withTiming(1, {duration: 400}));
        contentScale.value = withDelay(200, withSpring(1, {damping: 20, stiffness: 300}));
    }), [contentOpacity, contentScale]);

    return (
        <View
            nativeID={SecurityManager.getShieldScreenId(componentId)}
            style={styles.root}
        >
            <View
                style={styles.container}
                testID='rate_app.screen'
            >
                {show &&
                    <Animated.View
                        style={styles.wrapper}
                        entering={slideIn}
                        exiting={slideOut}
                    >
                        <TouchableOpacity
                            style={styles.close}
                            onPress={onPressClose}
                            activeOpacity={0.7}
                        >
                            <CompassIcon
                                name='close'
                                size={24}
                                color={changeOpacity(theme.centerChannelColor, 0.56)}
                            />
                        </TouchableOpacity>
                        <Animated.View
                            style={[styles.content, contentAnimatedStyle]}
                        >
                            <ReviewAppIllustration theme={theme}/>
                            <Text style={styles.title}>
                                {intl.formatMessage({id: 'rate.title', defaultMessage: 'Enjoying Mattermost?'})}
                            </Text>
                            <Text style={styles.subtitle}>
                                {intl.formatMessage({id: 'rate.subtitle', defaultMessage: 'Let us know what you think.'})}
                            </Text>
                            <View style={styles.buttonsWrapper}>
                                <Button
                                    theme={theme}
                                    size={'lg'}
                                    emphasis={'tertiary'}
                                    onPress={onPressNeedsWork}
                                    text={intl.formatMessage({id: 'rate.button.needs_work', defaultMessage: 'Needs work'})}
                                    buttonContainerStyle={styles.leftButton}
                                    animated={true}
                                    withHapticFeedback={true}
                                    elevation={2}
                                />
                                <Button
                                    theme={theme}
                                    size={'lg'}
                                    onPress={onPressYes}
                                    text={intl.formatMessage({id: 'rate.button.yes', defaultMessage: 'Love it!'})}
                                    buttonContainerStyle={styles.rightButton}
                                    animated={true}
                                    withHapticFeedback={true}
                                    elevation={2}
                                />
                            </View>
                            {hasAskedBefore && (
                                <TouchableWithoutFeedback
                                    onPress={onPressDontAsk}
                                >
                                    <Text style={styles.dontAsk}>
                                        {intl.formatMessage({id: 'rate.dont_ask_again', defaultMessage: 'Don\'t ask me again'})}
                                    </Text>
                                </TouchableWithoutFeedback>
                            )}
                        </Animated.View>
                    </Animated.View>
                }
            </View>
        </View>
    );
};

export default ReviewApp;
