import { useCallback, useRef } from "react"

const useLongPress = (
    onLongPress: () => void,
    onShortPress: () => void,
    delay: number = 100
) => {
    const timeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPress = useRef(false);

    const start = useCallback(() => {
        isLongPress.current = false;
        timeRef.current = setTimeout(() => {
            isLongPress.current = true;
            onLongPress()
        }, delay)
    }, [onLongPress, delay])

    const stop = useCallback(() => {
        if (timeRef.current) {
            clearTimeout(timeRef.current)
            timeRef.current = null
        }
        if (!isLongPress.current) onShortPress()
    }, [onShortPress])

    const cancel = useCallback(() => {
        if (timeRef.current) {
            clearTimeout(timeRef.current)
            timeRef.current = null
        }
        isLongPress.current = false
    }, [])

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onTouchStart: start,
        onTouchEnd: stop,
        onTouchCancel: cancel,
        onMouseLeave: cancel
    }
}

export default useLongPress;
