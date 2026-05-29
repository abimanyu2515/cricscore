import { useCallback, useRef, useEffect } from "react"

const useLongPress = (
    onLongPress: () => void,
    onShortPress: () => void,
    delay: number = 300
) => {
    const timeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPress = useRef(false);
    const touchStartPos = useRef({ x: 0, y: 0 });
    const isTouchMoving = useRef(false);
    const scrollStartPos = useRef(0);
    const isScrolling = useRef(false);
    const MOVEMENT_THRESHOLD = 15; // pixels

    useEffect(() => {
        let scrollTimeout: ReturnType<typeof setTimeout>;

        const handleScroll = () => {
            isScrolling.current = true;
            clearTimeout(scrollTimeout);
            
            // Clear any pending timer when scroll detected
            if (timeRef.current) {
                clearTimeout(timeRef.current);
                timeRef.current = null;
                isLongPress.current = false;
            }
            
            // Mark as moving so short press won't trigger
            isTouchMoving.current = true;
            
            // Reset scroll flag after scroll ends
            scrollTimeout = setTimeout(() => {
                isScrolling.current = false;
            }, 150);
        };

        window.addEventListener('scroll', handleScroll, true);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            clearTimeout(scrollTimeout);
        };
    }, [])

    const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        isLongPress.current = false;
        isTouchMoving.current = false;
        isScrolling.current = false;
        scrollStartPos.current = window.scrollY;
        
        // Store initial touch position
        if ('touches' in e) {
            touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else {
            touchStartPos.current = { x: e.clientX, y: e.clientY };
        }
        
        timeRef.current = setTimeout(() => {
            if (!isTouchMoving.current && !isScrolling.current) {
                isLongPress.current = true;
                onLongPress()
            }
        }, delay)
    }, [onLongPress, delay])

    const stop = useCallback(() => {
        if (timeRef.current) {
            clearTimeout(timeRef.current)
            timeRef.current = null
        }
        
        // Check multiple conditions before triggering action
        const pageScrolled = Math.abs(window.scrollY - scrollStartPos.current) > MOVEMENT_THRESHOLD;
        
        // Don't trigger if: long press already triggered, finger moved, page scrolled, or currently scrolling
        if (!isLongPress.current && !isTouchMoving.current && !pageScrolled && !isScrolling.current) {
            onShortPress()
        }
        
        // Reset flags
        isTouchMoving.current = false;
        isScrolling.current = false;
    }, [onShortPress])

    const cancel = useCallback(() => {
        if (timeRef.current) {
            clearTimeout(timeRef.current)
            timeRef.current = null
        }
        isLongPress.current = false
        isTouchMoving.current = false
        isScrolling.current = false
    }, [])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStartPos.current) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        
        const distanceX = Math.abs(currentX - touchStartPos.current.x);
        const distanceY = Math.abs(currentY - touchStartPos.current.y);
        const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // If user has moved finger more than threshold, mark as moving
        if (totalDistance > MOVEMENT_THRESHOLD) {
            isTouchMoving.current = true;
            if (timeRef.current) {
                clearTimeout(timeRef.current)
                timeRef.current = null
            }
        }
    }, [])

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onTouchStart: start,
        onTouchEnd: stop,
        onTouchMove: handleTouchMove,
        onTouchCancel: cancel,
        onMouseLeave: cancel
    }
}

export default useLongPress;
