// Stack Component - Hooks Fixed
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import './Stack.css';

// Extracted sub-component to safely use hooks
function Card({
    card,
    index,
    stackLength,
    isTop,
    randomRotation,
    sensitivity,
    shouldDisableDrag,
    shouldEnableClick,
    onSendToBack
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [60, -60]);
    const rotateY = useTransform(x, [-100, 100], [-60, 60]);

    const handleDragEnd = (_, info) => {
        if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
            onSendToBack(card.id);
        } else {
            x.set(0);
            y.set(0);
        }
    };

    const handleClick = () => {
        console.log('Stack: Card tapped/clicked', card.id);
        if (shouldEnableClick) {
            onSendToBack(card.id);
        }
    };

    return (
        <motion.div
            className="card-rotate"
            style={{
                zIndex: index,
                x, y, rotateX, rotateY,
                cursor: isTop ? 'pointer' : 'default'
            }}
            animate={{
                rotateZ: (stackLength - index - 1) * 4 + randomRotation,
                scale: 1 + index * 0.06 - stackLength * 0.06,
                transformOrigin: '90% 90%',
                x: 0,
                y: 0
            }}
            initial={false}
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20
            }}
            drag={isTop && !shouldDisableDrag}
            dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            onTap={isTop ? handleClick : undefined}
            whileTap={{ scale: 0.98, cursor: 'grabbing' }}
        >
            <div className="card" style={{ pointerEvents: 'none' }}>
                {card.content}
            </div>
        </motion.div>
    );
}

export default function Stack({
    randomRotation = false,
    sensitivity = 200,
    cards = [],
    animationConfig = { stiffness: 260, damping: 20 },
    sendToBackOnClick = false,
    autoplay = false,
    autoplayDelay = 3000,
    pauseOnHover = false,
    mobileClickOnly = false,
    mobileBreakpoint = 768,
    onActiveChange
}) {
    const [isMobile, setIsMobile] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < mobileBreakpoint);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [mobileBreakpoint]);

    const shouldDisableDrag = mobileClickOnly && isMobile;
    const shouldEnableClick = sendToBackOnClick || shouldDisableDrag;

    const [stack, setStack] = useState([]);

    useEffect(() => {
        if (cards.length > 0) {
            setStack(cards.map((content, index) => ({
                id: index + 1,
                content
            })));
        }
    }, [cards]);

    const sendToBack = (id) => {
        setStack(prev => {
            const newStack = [...prev];
            const index = newStack.findIndex(card => card.id === id);
            if (index === -1) return prev;

            const [card] = newStack.splice(index, 1);
            newStack.unshift(card);
            return newStack;
        });
    };

    useEffect(() => {
        if (onActiveChange && stack.length > 0) {
            const topCard = stack[stack.length - 1];
            onActiveChange(topCard.id - 1);
        }
    }, [stack, onActiveChange]);

    useEffect(() => {
        if (autoplay && stack.length > 1 && !isPaused) {
            const interval = setInterval(() => {
                const topCardId = stack[stack.length - 1].id;
                sendToBack(topCardId);
            }, autoplayDelay);
            return () => clearInterval(interval);
        }
    }, [autoplay, autoplayDelay, stack, isPaused]);

    return (
        <div
            className="stack-container"
            onMouseEnter={() => pauseOnHover && setIsPaused(true)}
            onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        >
            {stack.map((card, index) => {
                const isTop = index === stack.length - 1;
                const randomRotateVal = randomRotation ? Math.random() * 10 - 5 : 0;

                return (
                    <Card
                        key={card.id}
                        card={card}
                        index={index}
                        stackLength={stack.length}
                        isTop={isTop}
                        randomRotation={randomRotateVal}
                        sensitivity={sensitivity}
                        shouldDisableDrag={shouldDisableDrag}
                        shouldEnableClick={shouldEnableClick}
                        onSendToBack={sendToBack}
                    />
                );
            })}
        </div>
    );
}
