import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import './Masonry.css';

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const useMedia = (queries, values, defaultValue) => {
    const get = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
    const [value, setValue] = useState(get);

    useEffect(() => {
        const handler = debounce(() => setValue(get), 100);
        queries.forEach(q => matchMedia(q).addEventListener('change', handler));
        return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
    }, [queries]);

    return value;
};

const useMeasure = () => {
    const ref = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        if (!ref.current) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ width, height });
        });
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, []);

    return [ref, size];
};

const preloadImages = async urls => {
    await Promise.all(
        urls.map(
            src =>
                new Promise(resolve => {
                    if (!src) return resolve(); // Skip plain text items
                    const img = new Image();
                    img.src = src;
                    // Resolve even on error to avoid blocking
                    img.onload = img.onerror = () => resolve();
                })
        )
    );
};

const Masonry = ({
    items,
    stagger = 0.05,
    animateFrom = 'bottom',
    scaleOnHover = true,
    hoverScale = 0.95,
    blurToFocus = true,
    colorShiftOnHover = false,
    onItemClick // Add prop
}) => {
    // Adjusted breakpoints for "at least 4 items" on decent desktop
    const columns = useMedia(
        ['(min-width:1400px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
        [5, 4, 3, 2],
        1
    );

    const [containerRef, { width }] = useMeasure();
    const [imagesReady, setImagesReady] = useState(false);

    useEffect(() => {
        // Only preload items that have images
        const imageUrls = items.filter(i => i.img).map(i => i.img);
        preloadImages(imageUrls).then(() => setImagesReady(true));
    }, [items]);

    const grid = useMemo(() => {
        if (!width) return [];

        const colHeights = new Array(columns).fill(0);
        const columnWidth = width / columns;

        return items.map(child => {
            const col = colHeights.indexOf(Math.min(...colHeights));
            const x = columnWidth * col;
            const height = child.height;
            const y = colHeights[col];
            colHeights[col] += height;

            return { ...child, x, y, w: columnWidth, h: height };
        });
    }, [columns, items, width]);

    // Adjust container height based on taller column
    const containerHeight = useMemo(() => {
        if (!grid.length) return 0;
        return Math.max(...grid.map(item => item.y + item.h));
    }, [grid]);

    // Helper for deterministic gradient
    const getGradient = (id) => {
        const gradients = [
            'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)',
            'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
        ];
        return gradients[parseInt(id) % gradients.length] || gradients[0];
    };

    return (
        <div ref={containerRef} className="list" style={{ height: containerHeight > 0 ? containerHeight : '100vh', position: 'relative' }}>
            <AnimatePresence>
                {imagesReady && grid.map((item, index) => {
                    const isTruth = item.type === 'truth';

                    return (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: animateFrom === 'bottom' ? 50 : -50, filter: blurToFocus ? 'blur(10px)' : 'none' }}
                            animate={{
                                opacity: 1,
                                x: item.x,
                                y: item.y,
                                width: item.w,
                                height: item.h,
                                filter: 'blur(0px)'
                            }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{
                                duration: 0.6,
                                ease: "easeOut",
                                delay: index * stagger
                            }}
                            className="item-wrapper"
                            style={{ position: 'absolute' }}
                            onClick={() => {
                                if (onItemClick) {
                                    onItemClick(item);
                                } else if (item.url) {
                                    window.open(item.url, '_blank', 'noopener');
                                }
                            }}
                            whileHover={scaleOnHover ? { scale: hoverScale, zIndex: 10 } : {}}
                        >
                            {isTruth ? (
                                <div
                                    className="item-content truth-card"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        background: item.bg || getGradient(item.id),
                                        borderRadius: '16px',
                                        padding: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        color: '#fff',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.2)'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        opacity: 0.8,
                                        marginBottom: '15px',
                                        fontWeight: 700,
                                        background: 'rgba(0,0,0,0.2)',
                                        padding: '4px 10px',
                                        borderRadius: '20px'
                                    }}>Truth</div>
                                    <h3 style={{
                                        fontSize: '18px',
                                        lineHeight: '1.3',
                                        fontWeight: 700,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        margin: '0 0 16px 0',
                                        fontFamily: '"Outfit", sans-serif',
                                        opacity: 0.9
                                    }}>{item.question || item.title}</h3>

                                    <div style={{
                                        fontSize: '16px',
                                        lineHeight: '1.5',
                                        fontStyle: 'italic',
                                        background: 'rgba(0,0,0,0.15)',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        width: '100%',
                                        marginBottom: '16px'
                                    }}>
                                        "{item.answer || item.text || '...'}"
                                    </div>

                                    <div style={{
                                        fontSize: '13px',
                                        opacity: 0.9,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <span style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }}></span>
                                        @{item.user || 'anon'}
                                    </div>
                                </div>
                            ) : (
                                <div className="item-img" style={{ backgroundImage: `url(${item.img})` }}>
                                    {colorShiftOnHover && (
                                        <motion.div
                                            className="color-overlay"
                                            initial={{ opacity: 0 }}
                                            whileHover={{ opacity: 0.3 }}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(45deg, rgba(255,0,150,0.5), rgba(0,150,255,0.5))',
                                                pointerEvents: 'none',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    )}
                                    {/* Overlay content */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        width: '100%',
                                        padding: '15px',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                        color: '#fff',
                                        opacity: 1
                                    }}>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{item.title || 'Dare'}</div>
                                        <div style={{ fontSize: '11px', opacity: 0.8, display: 'flex', justifyContent: 'space-between' }}>
                                            <span>@{item.user || 'user'}</span>
                                            <span>{item.views || '0'} views</span>
                                        </div>
                                    </div>
                                    {/* Play Icon for "video" styling */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'rgba(0,0,0,0.4)',
                                        backdropFilter: 'blur(4px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid rgba(255,255,255,0.3)'
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default Masonry;
