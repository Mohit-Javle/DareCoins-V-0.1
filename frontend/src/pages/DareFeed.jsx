import Masonry from '../components/Masonry';
import { useState, useEffect } from 'react';
import { contentService } from '../services/api';
import FeedReels from '../components/FeedReels';
import { AnimatePresence } from 'framer-motion';

export default function DareFeed() {
    const [feedItems, setFeedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeReelIndex, setActiveReelIndex] = useState(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const data = await contentService.getProofs();
                const mapped = data.map(item => ({
                    id: item.id,
                    img: item.url, // Masonry uses 'img' for display (video thumbnail or placeholder)
                    videoUrl: item.url, // Store original URL
                    height: item.type === 'truth' ? 300 : Math.floor(Math.random() * (600 - 300 + 1) + 300), // Fixed height for truths?
                    title: item.title,
                    user: item.user,
                    userAvatar: item.userAvatar,
                    type: item.type === 'truth' ? 'truth' : 'video',
                    views: item.views,
                    description: item.description,
                    likes: item.likes,
                    // Truth specific fields
                    question: item.question,
                    answer: item.answer,
                    isText: item.type === 'truth'
                }));
                setFeedItems(mapped);
            } catch (error) {
                console.error("Failed to load feed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading Feed...</div>;

    const handleItemClick = (item) => {
        // Find index of clicked item
        const index = feedItems.findIndex(i => i.id === item.id);
        if (index !== -1) setActiveReelIndex(index);
    };

    return (
        <div style={{
            width: '100%',
            paddingTop: '20px',
            paddingBottom: '100px',
            overflowX: 'hidden'
        }}>
            {/* Reel Viewer */}
            <AnimatePresence>
                {activeReelIndex !== null && (
                    <FeedReels
                        items={feedItems}
                        initialIndex={activeReelIndex}
                        onClose={() => setActiveReelIndex(null)}
                    />
                )}
            </AnimatePresence>

            <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '20px',
                marginLeft: '10px',
                color: '#fff',
                textShadow: '0 0 10px rgba(0,255,128,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                Explore Feed <span style={{ fontSize: '12px', background: '#00ff80', color: '#000', padding: '2px 8px', borderRadius: '4px' }}>LIVE</span>
            </h2>

            <div style={{ width: '100%' }}>
                <Masonry
                    items={feedItems}
                    ease="power3.out"
                    duration={0.6}
                    stagger={0.05}
                    animateFrom="bottom"
                    scaleOnHover={true}
                    hoverScale={1.03}
                    blurToFocus={true}
                    colorShiftOnHover={true}
                    onItemClick={handleItemClick} // Pass click handler
                />
            </div>
        </div>
    );
}
