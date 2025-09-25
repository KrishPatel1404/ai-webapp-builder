import { useState, useEffect } from 'react';

export const useResponsive = () => {
    const [screenSize, setScreenSize] = useState({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
        pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
        isHighDPI: false,
        isRetina: false,
        deviceType: 'desktop',
        touchCapable: false,
    });

    useEffect(() => {
        const updateScreenSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const pixelRatio = window.devicePixelRatio || 1;
            const isHighDPI = pixelRatio > 1.5;
            const isRetina = pixelRatio >= 2;

            // Detect touch capability
            const touchCapable = 'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                navigator.msMaxTouchPoints > 0;

            // Enhanced device type detection
            let deviceType = 'desktop';
            const userAgent = navigator.userAgent.toLowerCase();
            const isIOS = /iphone|ipad|ipod/.test(userAgent);
            const isAndroid = /android/.test(userAgent);

            if (width < 768) {
                if (isIOS || isAndroid || touchCapable) {
                    deviceType = 'mobile';
                } else {
                    deviceType = 'mobile'; // Small desktop screen
                }
            } else if (width >= 768 && width < 1024) {
                if (touchCapable || isIOS || isAndroid) {
                    deviceType = 'tablet';
                } else {
                    deviceType = 'tablet'; // Medium desktop screen
                }
            } else {
                deviceType = 'desktop';
            }

            setScreenSize({
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024,
                width,
                height,
                pixelRatio,
                isHighDPI,
                isRetina,
                deviceType,
                touchCapable,
            });
        };

        // Set initial size
        updateScreenSize();

        // Add event listener
        window.addEventListener('resize', updateScreenSize);

        // Cleanup
        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    return screenSize;
};

// Additional utility functions for responsive design
export const getResponsiveClasses = (mobileClass, tabletClass, desktopClass) => {
    return `${mobileClass} md:${tabletClass} lg:${desktopClass}`;
};

export const getResponsiveValue = (screenSize, mobileValue, tabletValue, desktopValue) => {
    if (screenSize.isMobile) return mobileValue;
    if (screenSize.isTablet) return tabletValue;
    return desktopValue;
};

// High DPI specific utilities
export const getHighDPIValue = (screenSize, normalValue, highDPIValue, retinaValue) => {
    if (screenSize.pixelRatio >= 3) return retinaValue || highDPIValue;
    if (screenSize.isHighDPI) return highDPIValue;
    return normalValue;
};

export const getTouchFriendlySize = (screenSize, baseSize) => {
    // Ensure minimum 44px touch target on mobile devices
    const minTouchSize = 44;
    if (screenSize.touchCapable && screenSize.isMobile) {
        return Math.max(baseSize, minTouchSize);
    }
    return baseSize;
};

export const getOptimalFontSize = (screenSize, baseFontSize) => {
    // Adjust font sizes for high DPI screens
    if (screenSize.isMobile && screenSize.isRetina) {
        // Slightly increase font size on retina mobile screens for better readability
        return baseFontSize * 1.1;
    }
    if (screenSize.isMobile && screenSize.isHighDPI) {
        return baseFontSize * 1.05;
    }
    return baseFontSize;
};